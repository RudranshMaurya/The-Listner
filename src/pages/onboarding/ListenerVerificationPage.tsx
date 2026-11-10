import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { saveListenerProfile } from '../../lib/database';
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface Question {
  id: number;
  scenario: string;
  question: string;
  options: { label: string; text: string; correct: boolean; explanation: string }[];
}

export const ListenerVerificationPage: React.FC = () => {
  const { currentUser, updateProfileData } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const questions: Question[] = [
    {
      id: 1,
      scenario: 'A talker shares that their partner broke up with them and they feel intense sadness and loneliness.',
      question: 'What is the most empathetic, active listening response?',
      options: [
        {
          label: 'A',
          text: '"You should move on quickly and start dating someone else right away."',
          correct: false,
          explanation: 'Giving unsolicited advice diminishes the person\'s feelings.'
        },
        {
          label: 'B',
          text: '"That sounds deeply painful. It must feel really overwhelming right now. I am here to listen if you want to share more."',
          correct: true,
          explanation: 'Validates their emotion without judgment or premature advice.'
        },
        {
          label: 'C',
          text: '"Everyone goes through breakups, it is not a big deal."',
          correct: false,
          explanation: 'Minimizes their experience.'
        }
      ]
    },
    {
      id: 2,
      scenario: 'A talker begins asking for your personal WhatsApp number and Instagram handle so you can chat outside the platform.',
      question: 'How should you respond in accordance with platform boundaries?',
      options: [
        {
          label: 'A',
          text: 'Share your phone number since they seem friendly.',
          correct: false,
          explanation: 'Violates platform safety and privacy guidelines.'
        },
        {
          label: 'B',
          text: '"For both of our privacy and safety, our platform guidelines require that we keep all conversations directly here. I am happy to keep talking with you here."',
          correct: true,
          explanation: 'Politely and firmly reinforces personal boundaries and safety rules.'
        },
        {
          label: 'C',
          text: 'Block the user immediately without explaining.',
          correct: false,
          explanation: 'Abruptly shutting down without communication is not necessary when a gentle boundary suffices.'
        }
      ]
    },
    {
      id: 3,
      scenario: 'A talker shares a personal moral decision they made that contradicts your personal beliefs.',
      question: 'What is the correct non-judgmental stance?',
      options: [
        {
          label: 'A',
          text: 'Tell them they were morally wrong and need to apologize.',
          correct: false,
          explanation: 'Listeners must never impose personal moral judgment.'
        },
        {
          label: 'B',
          text: 'Keep listening with respect, focus on understanding how the situation affected them, and refrain from imposing personal moral values.',
          correct: true,
          explanation: 'Reflects genuine active listening and unbiased human acceptance.'
        },
        {
          label: 'C',
          text: 'Change the topic abruptly.',
          correct: false,
          explanation: 'Avoids listening to the talker\'s lived reality.'
        }
      ]
    },
    {
      id: 4,
      scenario: 'A user states they are experiencing thoughts of self-harm and feel hopeless about surviving.',
      question: 'What is the mandatory protocol for crisis escalation on The Listener?',
      options: [
        {
          label: 'A',
          text: 'Try to provide psychiatric therapy and diagnose their mental illness yourself.',
          correct: false,
          explanation: 'Listeners are strictly forbidden from acting as licensed medical or psychiatric clinicians.'
        },
        {
          label: 'B',
          text: 'Respond with care and direct them immediately to free professional national crisis hotlines like KIRAN (1800-599-0019) or Vandrevala Foundation (9999-666-555).',
          correct: true,
          explanation: 'Essential duty of care: safely referring to emergency professional lifelines.'
        },
        {
          label: 'C',
          text: 'Ignore the statement and continue talking about hobbies.',
          correct: false,
          explanation: 'Dangerous and negligent.'
        }
      ]
    },
    {
      id: 5,
      scenario: 'A friend asks you in private if you ever talked to someone famous or recognizable on The Listener.',
      question: 'What does your confidentiality commitment require?',
      options: [
        {
          label: 'A',
          text: 'Share the talker\'s secrets as long as you do not mention their city.',
          correct: false,
          explanation: 'Violates confidentiality.'
        },
        {
          label: 'B',
          text: 'Never disclose any talker identity, conversation contents, or personal disclosures to anyone outside the platform.',
          correct: true,
          explanation: 'Confidentiality is an absolute cornerstone of the platform.'
        },
        {
          label: 'C',
          text: 'Post screenshots on social media with names blurred.',
          correct: false,
          explanation: 'Direct violation of community trust.'
        }
      ]
    }
  ];

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [scorePercent, setScorePercent] = useState<number>(0);
  const [passed, setPassed] = useState<boolean>(false);
  const [, setIsSaving] = useState<boolean>(false);

  const handleSelectOption = (questionId: number, label: string) => {
    if (submitted) return;
    setAnswers({ ...answers, [questionId]: label });
  };

  const handleEvaluate = async () => {
    if (Object.keys(answers).length < questions.length) {
      showToast('error', 'Please answer all questions before submitting.');
      return;
    }

    let correctCount = 0;
    questions.forEach((q) => {
      const selected = q.options.find((opt) => opt.label === answers[q.id]);
      if (selected && selected.correct) {
        correctCount++;
      }
    });

    const percent = Math.round((correctCount / questions.length) * 100);
    const isPass = percent >= 80;

    setScorePercent(percent);
    setPassed(isPass);
    setSubmitted(true);

    if (isPass) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}

      if (currentUser) {
        setIsSaving(true);
        // Award platform-verified listener badge in RTDB
        await saveListenerProfile({
          uid: currentUser.uid,
          isVerified: true,
          verificationScore: percent,
          verificationStatus: 'passed'
        });

        await updateProfileData({
          onboardingCompleted: true
        });
        setIsSaving(false);
      }
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setScorePercent(0);
    setPassed(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 text-left space-y-6">
      <div>
        <Badge variant="success" size="sm" className="mb-2">
          Step 5: Qualification Assessment
        </Badge>
        <h1 className="text-title font-semibold text-text tracking-tight">
          Active Listening Assessment
        </h1>
        <p className="mt-1 text-small text-text-muted">
          To earn your verified badge and receive talkers, score at least <strong>80% (4/5)</strong> on empathy, boundaries, and safety protocols.
        </p>
      </div>

      {submitted ? (
        <Card variant="raised" padding="lg" className="text-center space-y-5 animate-apple-fade-in">
          {passed ? (
            <>
              <div className="w-14 h-14 rounded-pill bg-success/10 text-success flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-title font-semibold text-text">
                  Congratulations! You Passed ({scorePercent}%)
                </h2>
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-success/10 text-success text-caption font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Platform-Verified Listener Badge Awarded</span>
                </div>
              </div>
              <p className="text-small text-text-muted max-w-md mx-auto leading-relaxed">
                You have demonstrated empathy, active listening, and safe boundary awareness.
                Your listener profile is now live and eligible for conversations and UPI payouts.
              </p>
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate('/listener/dashboard')}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Enter Listener Dashboard
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-pill bg-warning/10 text-warning flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-title font-semibold text-text">
                  Score: {scorePercent}% (Threshold: 80%)
                </h2>
                <p className="text-small text-text-muted mt-2">
                  A few answers did not align with our non-judgmental and boundary guidelines. Review the explanations below and try again.
                </p>
              </div>
              <Button
                variant="outline"
                size="md"
                onClick={handleRetry}
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                Retake Assessment
              </Button>
            </>
          )}
        </Card>
      ) : null}

      {/* Questions List */}
      <div className="space-y-4">
        {questions.map((q, idx) => (
          <Card key={q.id} padding="md" className="space-y-3.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-pill bg-surface border border-border text-text-muted flex items-center justify-center font-bold text-[11px]">
                {idx + 1}
              </span>
              <span className="text-caption font-semibold uppercase tracking-wider text-text-muted">
                Scenario {idx + 1}
              </span>
            </div>

            <p className="text-caption bg-surface p-3 rounded-input text-text-muted italic border border-border">
              "{q.scenario}"
            </p>

            <h3 className="text-small font-semibold text-text">
              {q.question}
            </h3>

            <div className="space-y-2">
              {q.options.map((opt) => {
                const isSelected = answers[q.id] === opt.label;
                const showFeedback = submitted;
                const isCorrectOption = opt.correct;

                return (
                  <button
                    key={opt.label}
                    type="button"
                    disabled={submitted}
                    onClick={() => handleSelectOption(q.id, opt.label)}
                    className={`w-full text-left p-3 rounded-input border text-caption transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? showFeedback
                          ? isCorrectOption
                            ? 'border-success bg-success/10 text-success'
                            : 'border-danger bg-danger/10 text-danger'
                          : 'border-accent bg-accent/10 text-accent font-semibold shadow-soft'
                        : 'border-border bg-surface text-text-muted hover:text-text'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-pill border border-current flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {opt.label}
                    </span>
                    <div className="flex-1">
                      <span>{opt.text}</span>
                      {showFeedback && isSelected && (
                        <p className={`mt-1.5 text-[11px] font-normal ${isCorrectOption ? 'text-success' : 'text-danger'}`}>
                          {opt.explanation}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      {!submitted && (
        <div className="flex items-center justify-end pt-2">
          <Button
            size="md"
            variant="primary"
            onClick={handleEvaluate}
            rightIcon={<Sparkles className="w-4 h-4" />}
          >
            Submit for Score Validation
          </Button>
        </div>
      )}
    </div>
  );
};
