import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { onboardingAPI } from '../services/api';
import { Clock, Brain, Star, AlertTriangle, HelpCircle, ArrowRight } from 'lucide-react';

interface OnboardingQuestion {
  id: string;
  source_text: string;
  machine_translation: string;
  source_language: string;
  target_language: string;
  correct_fluency_score: number;
  correct_adequacy_score: number;
  error_types: string[];
  explanation: string;
}

interface UserAnswer {
  question_id: string;
  fluency_score: number;
  adequacy_score: number;
  identified_errors: string[];
  comment: string;
}

const OnboardingTest: React.FC = () => {
  const navigate = useNavigate();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes
  const [showInstructions, setShowInstructions] = useState(true);
  const [testStarted, setTestStarted] = useState(false);

  // Sample onboarding questions (in a real app, these would come from the backend)
  const questions: OnboardingQuestion[] = useMemo(() => [
    {
      id: '1',
      source_text: 'The weather is beautiful today.',
      machine_translation: 'Ang panahon ay maganda ngayon.',
      source_language: 'English',
      target_language: 'Tagalog',
      correct_fluency_score: 5,
      correct_adequacy_score: 5,
      error_types: [],
      explanation: 'This is an excellent translation with perfect fluency and adequacy. No errors present.'
    },
    {
      id: '2',
      source_text: 'I will go to the hospital tomorrow.',
      machine_translation: 'Ako ay pupunta sa ospital bukas.',
      source_language: 'English',
      target_language: 'Tagalog',
      correct_fluency_score: 4,
      correct_adequacy_score: 5,
      error_types: ['MI_ST'],
      explanation: 'Good translation with complete meaning preserved. Minor stylistic issue - could be more natural as "Pupunta ako sa ospital bukas."'
    },
    {
      id: '3',
      source_text: 'She plays the piano very well.',
      machine_translation: 'Siya ay naglalaro ng piano nang napakahusay.',
      source_language: 'English',
      target_language: 'Tagalog',
      correct_fluency_score: 2,
      correct_adequacy_score: 3,
      error_types: ['MI_SE', 'MA_SE'],
      explanation: 'Incorrect verb choice - "naglalaro" (playing games) instead of "tumutugtog" (playing instrument). This affects both fluency and adequacy.'
    }
  ], []);

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers.find(a => a.question_id === currentQuestion?.id) || {
    question_id: currentQuestion?.id || '',
    fluency_score: 0,
    adequacy_score: 0,
    identified_errors: [],
    comment: ''
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleStartTest = () => {
    setShowInstructions(false);
    setTestStarted(true);
  };

  const updateAnswer = (updates: Partial<UserAnswer>) => {
    const newAnswer = { ...currentAnswer, ...updates };
    setAnswers(prev => {
      const filtered = prev.filter(a => a.question_id !== currentQuestion.id);
      return [...filtered, newAnswer];
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmitTest();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitTest = useCallback(async () => {
    setIsSubmitting(true);
    
    try {
      // Submit to backend (score calculation now handled server-side)
      const result = await onboardingAPI.submitTest(1, answers); // Using test ID 1 for now
      
      if (result.passed) {
        setTimeout(() => {
          alert(`🎉 Congratulations! You passed with a score of ${result.score.toFixed(1)}%! 

Your annotation skills are excellent, and you're ready to start contributing to high-quality machine translation evaluation.

Welcome to the WiMarka team! You can now access all annotation features.`);
          navigate('/dashboard');
        }, 1000);
      } else {
        setTimeout(() => {
          alert(`📚 You scored ${result.score.toFixed(1)}%. 

Don't worry - this is a great learning opportunity! You need at least 70% to pass, but many annotators improve significantly after reviewing our guidelines.

🔄 You can retake the test anytime after reviewing the annotation guidelines. We believe in your potential and are here to support your growth!

💡 Tip: Pay close attention to the difference between fluency (how natural the translation sounds) and adequacy (how well the meaning is preserved).`);
          navigate('/dashboard');
        }, 1000);
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      alert('Error submitting test. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [answers, navigate]);

  // Timer effect
  useEffect(() => {
    if (!testStarted || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testStarted, timeRemaining, handleSubmitTest]);

  if (showInstructions) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-blue-100 p-3">
                  <Brain className="h-12 w-12 text-blue-600" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome to Your Annotation Qualification Test! 🎯
              </h1>
              <p className="text-lg text-gray-600">
                Let's make sure you're ready to create high-quality annotations
              </p>
              
              <div className="mt-4 flex items-center justify-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-green-400 rounded-full mr-2"></span>
                  <span>Friendly & Supportive</span>
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-blue-400 rounded-full mr-2"></span>
                  <span>Skills Assessment</span>
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></span>
                  <span>Learning Opportunity</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <div className="flex items-start">
                <HelpCircle className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    What This Test Is About
                  </h3>
                  <p className="text-blue-800 mb-3">
                    This friendly assessment helps us understand your translation evaluation skills. 
                    You'll review a few machine translations and provide quality scores - just like 
                    you'll do in your regular annotation work.
                  </p>
                  <p className="text-blue-700 text-sm mb-2">
                    Don't worry - this isn't about being perfect! It's about ensuring we can provide 
                    you with the best support and that our data quality remains high.
                  </p>
                  <p className="text-blue-600 text-xs italic">
                    💡 Think of this as a practice session where you can learn our annotation style!
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-green-50 rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <Clock className="h-5 w-5 text-green-600 mr-2" />
                  <h4 className="font-semibold text-green-900">Time & Questions</h4>
                </div>
                <ul className="text-green-800 space-y-1 text-sm">
                  <li>• 30 minutes total time</li>
                  <li>• 3 sample translations to evaluate</li>
                  <li>• Take your time - quality over speed</li>
                </ul>
              </div>

              <div className="bg-yellow-50 rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <Star className="h-5 w-5 text-yellow-600 mr-2" />
                  <h4 className="font-semibold text-yellow-900">What You'll Do</h4>
                </div>
                <ul className="text-yellow-800 space-y-1 text-sm">
                  <li>• Rate fluency (1-5 scale)</li>
                  <li>• Rate adequacy (1-5 scale)</li>
                  <li>• Identify error types if present</li>
                  <li>• Add brief comments</li>
                </ul>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-amber-800">
                  <p className="font-medium mb-1">Passing Score: 70%</p>
                  <p className="text-sm mb-2">
                    If you don't pass on your first try, no worries! You can retake the test after 
                    reviewing our annotation guidelines. We're here to help you succeed.
                  </p>
                  <p className="text-xs italic">
                    Remember: This test helps us understand your current skills so we can provide better support! 🤝
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={handleStartTest}
                className="inline-flex items-center px-8 py-3 border border-transparent text-lg font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                I'm Ready - Start Test
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <p className="mt-3 text-sm text-gray-500">
                By starting the test, the 30-minute timer will begin
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with timer and progress */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">
              Annotation Qualification Test
            </h1>
            <div className="text-sm text-gray-500">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              timeRemaining > 300 ? 'bg-green-100 text-green-800' : 
              timeRemaining > 60 ? 'bg-yellow-100 text-yellow-800' : 
              'bg-red-100 text-red-800'
            }`}>
              <Clock className="h-4 w-4 mr-1" />
              {formatTime(timeRemaining)}
            </div>
            
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Translation Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Translation to Evaluate
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Source Text ({currentQuestion.source_language})
                  </label>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-gray-900">{currentQuestion.source_text}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Machine Translation ({currentQuestion.target_language})
                  </label>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-gray-900">{currentQuestion.machine_translation}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Evaluation Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Your Evaluation
              </h3>

              <div className="space-y-6">
                {/* Fluency Score */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fluency Score (1-5) *
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    How natural and well-formed is the translation?
                  </p>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map(score => (
                      <button
                        key={score}
                        onClick={() => updateAnswer({ fluency_score: score })}
                        className={`w-12 h-12 rounded-lg border-2 font-semibold ${
                          currentAnswer.fluency_score === score
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Adequacy Score */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adequacy Score (1-5) *
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    How well does the translation convey the meaning of the source?
                  </p>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map(score => (
                      <button
                        key={score}
                        onClick={() => updateAnswer({ adequacy_score: score })}
                        className={`w-12 h-12 rounded-lg border-2 font-semibold ${
                          currentAnswer.adequacy_score === score
                            ? 'border-green-500 bg-green-500 text-white'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Error Types */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Error Types (if any)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'MI_ST', label: 'Minor Style', color: 'yellow' },
                      { id: 'MI_SE', label: 'Minor Semantic', color: 'orange' },
                      { id: 'MA_ST', label: 'Major Style', color: 'red' },
                      { id: 'MA_SE', label: 'Major Semantic', color: 'red' }
                    ].map(error => (
                      <button
                        key={error.id}
                        onClick={() => {
                          const errors = currentAnswer.identified_errors.includes(error.id)
                            ? currentAnswer.identified_errors.filter(e => e !== error.id)
                            : [...currentAnswer.identified_errors, error.id];
                          updateAnswer({ identified_errors: errors });
                        }}
                        className={`p-2 text-xs rounded border-2 ${
                          currentAnswer.identified_errors.includes(error.id)
                            ? `border-${error.color}-500 bg-${error.color}-100 text-${error.color}-800`
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {error.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comments (optional)
                  </label>
                  <textarea
                    value={currentAnswer.comment}
                    onChange={(e) => updateAnswer({ comment: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Any additional observations or reasoning..."
                  />
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <div className="flex space-x-3">
                {currentQuestionIndex < questions.length - 1 ? (
                  <button
                    onClick={handleNext}
                    disabled={!currentAnswer.fluency_score || !currentAnswer.adequacy_score}
                    className="px-6 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next Question
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitTest}
                    disabled={!currentAnswer.fluency_score || !currentAnswer.adequacy_score || isSubmitting}
                    className="px-6 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Test'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTest;
