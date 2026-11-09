import { ref, set, push, onValue, off, remove } from "firebase/database";
import { db } from "./firebase";

export interface WebRTCConfig {
  iceServers: RTCIceServer[];
}

export const DEFAULT_RTC_CONFIG: WebRTCConfig = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" }
  ]
};

export class WebRTCConnectionManager {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private sessionId: string;
  private currentUserId: string;
  private onRemoteStreamCallback?: (stream: MediaStream) => void;
  private onConnectionStateChangeCallback?: (state: RTCPeerConnectionState) => void;

  constructor(sessionId: string, currentUserId: string) {
    this.sessionId = sessionId;
    this.currentUserId = currentUserId;
  }

  public setCallbacks(
    onRemoteStream: (stream: MediaStream) => void,
    onConnectionStateChange: (state: RTCPeerConnectionState) => void
  ) {
    this.onRemoteStreamCallback = onRemoteStream;
    this.onConnectionStateChangeCallback = onConnectionStateChange;
  }

  public async getLocalAudioStream(): Promise<MediaStream> {
    if (!this.localStream) {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false
      });
    }
    return this.localStream;
  }

  public initPeerConnection(): RTCPeerConnection {
    if (this.peerConnection) {
      return this.peerConnection;
    }

    const pc = new RTCPeerConnection(DEFAULT_RTC_CONFIG);
    this.peerConnection = pc;

    pc.onconnectionstatechange = () => {
      this.onConnectionStateChangeCallback?.(pc.connectionState);
    };

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
        this.onRemoteStreamCallback?.(this.remoteStream);
      }
    };

    // Send local ICE candidates to Firebase RTDB
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const iceRef = push(ref(db, `sessions/${this.sessionId}/signaling/candidates/${this.currentUserId}`));
        set(iceRef, event.candidate.toJSON());
      }
    };

    return pc;
  }

  public async startCall(): Promise<void> {
    const stream = await this.getLocalAudioStream();
    const pc = this.initPeerConnection();

    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    // Write offer to RTDB
    await set(ref(db, `sessions/${this.sessionId}/signaling/offer`), {
      type: offer.type,
      sdp: offer.sdp,
      senderId: this.currentUserId
    });

    // Listen for answer
    this.listenForAnswer();
    // Listen for candidate from other peer
    this.listenForCandidates();
  }

  public async answerCall(): Promise<void> {
    const stream = await this.getLocalAudioStream();
    const pc = this.initPeerConnection();

    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    // Read offer from RTDB
    const offerRef = ref(db, `sessions/${this.sessionId}/signaling/offer`);
    onValue(offerRef, async (snap) => {
      if (snap.exists()) {
        const offer = snap.val();
        if (offer.senderId !== this.currentUserId && !pc.currentRemoteDescription) {
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          await set(ref(db, `sessions/${this.sessionId}/signaling/answer`), {
            type: answer.type,
            sdp: answer.sdp,
            senderId: this.currentUserId
          });
        }
      }
    }, { onlyOnce: true });

    this.listenForCandidates();
  }

  private listenForAnswer() {
    const answerRef = ref(db, `sessions/${this.sessionId}/signaling/answer`);
    onValue(answerRef, async (snap) => {
      if (snap.exists() && this.peerConnection) {
        const answer = snap.val();
        if (answer.senderId !== this.currentUserId && !this.peerConnection.currentRemoteDescription) {
          try {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
          } catch (err) {
            console.error("Error setting remote description from answer:", err);
          }
        }
      }
    });
  }

  private listenForCandidates() {
    const candidatesRef = ref(db, `sessions/${this.sessionId}/signaling/candidates`);
    onValue(candidatesRef, (snap) => {
      if (snap.exists() && this.peerConnection) {
        const candidatesBySender = snap.val();
        for (const [senderId, candList] of Object.entries(candidatesBySender as Record<string, any>)) {
          if (senderId !== this.currentUserId && typeof candList === "object") {
            for (const cand of Object.values(candList)) {
              if (cand && this.peerConnection.remoteDescription) {
                try {
                  this.peerConnection.addIceCandidate(new RTCIceCandidate(cand as RTCIceCandidateInit));
                } catch (e) {
                  console.warn("Failed to add ICE candidate:", e);
                }
              }
            }
          }
        }
      }
    });
  }

  public toggleMute(muted: boolean) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = !muted;
      });
    }
  }

  public endCall() {
    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop());
      this.localStream = null;
    }
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    // Clean up signaling
    remove(ref(db, `sessions/${this.sessionId}/signaling`)).catch(() => {});
  }
}
