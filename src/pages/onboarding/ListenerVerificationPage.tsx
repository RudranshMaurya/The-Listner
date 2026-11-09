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
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
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
  const [isSaving, setIsSaving] = useState<boolean>(false);

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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 text-left space-y-8">
      <div>
        <Badge variant="verified" size="md" className="mb-2">
          Step 5: Listener Qualification Questionnaire
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Active Listening & Platform Safety Assessment
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          To earn your verified badge and receive talkers, score at least <strong>80% (4/5)</strong> on empathy, boundaries, and safety protocols.
        </p>
      </div>

      {submitted ? (
        <Card className="p-8 text-center space-y-6 shadow-xl animate-in zoom-in-95">
          {passed ? (
            <>
              <div className="w-16 h-16 rounded-3xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Congratulations! You Passed ({scorePercent}%)
                </h2>
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 font-semibold text-xs border border-teal-200 dark:border-teal-800">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>Platform-Verified Listener Badge Awarded</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                You have demonstrated empathy, active listening, and safe boundary awareness.
                Your listener profile is now live and eligible for conversations and UPI payouts.
              </p>
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/listener/dashboard')}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Enter Listener Dashboard
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-10 h-10" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Score: {scorePercent}% (Threshold: 80%)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
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
      <div className="space-y-6">
        {questions.map((q, idx) => (
          <Card key={q.id} className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#FAF6F0] dark:bg-[#272420] text-[#875C34] dark:text-[#DEC6A5] flex items-center justify-center font-bold text-xs border border-[#EFEBE4] dark:border-[#332E28]">
                {idx + 1}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                Scenario {idx + 1}
              </span>
            </div>

            <p className="text-xs bg-[#FAF6F0]/70 dark:bg-[#272420]/50 p-3 rounded-xl text-stone-700 dark:text-stone-300 italic border border-[#EFEBE4] dark:border-[#332E28]">
              "{q.scenario}"
            </p>

            <h3 className="text-sm font-bold text-stone-900 dark:text-white">
              {q.question}
            </h3>

            <div className="space-y-2.5">
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
                    className={`w-full text-left p-3.5 rounded-2xl border text-xs transition-all duration-200 active:scale-[0.98] ease-[cubic-bezier(0.16,1,0.3,1)] flex items-start gap-3 ${
                      isSelected
                        ? showFeedback
                          ? isCorrectOption
                            ? 'border-[#166534] bg-[#DCFCE7]/70 dark:bg-[#166534]/30 text-[#166534] dark:text-[#4ADE80] ring-1 ring-[#166534]'
                            : 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200'
                          : 'border-[#D4A373] bg-[#FAF6F0] dark:bg-[#272420] text-[#875C34] dark:text-[#DEC6A5] font-semibold ring-1 ring-[#D4A373]'
                        : 'border-[#EFEBE4] dark:border-[#332E28] text-stone-700 dark:text-stone-300 hover:bg-[#FAF6F0] dark:hover:bg-[#272420]'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {opt.label}
                    </span>
                    <div className="flex-1">
                      <span>{opt.text}</span>
                      {showFeedback && isSelected && (
                        <p className={`mt-1.5 text-[11px] font-normal ${isCorrectOption ? 'text-[#166534] dark:text-[#4ADE80]' : 'text-rose-600 dark:text-rose-300'}`}>
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
        <div className="flex items-center justify-end pt-4">
          <Button
            size="lg"
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
