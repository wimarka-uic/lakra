import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { languageProficiencyAPI, onboardingAPI, authStorage } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Clock, Brain, AlertTriangle, ArrowRight, Globe, BookOpen } from 'lucide-react';
import type { UserQuestionAnswer, LanguageProficiencyQuestion, OnboardingTest } from '../types';
import QuizSuccessModal from './QuizSuccessModal';
import QuizFailureModal from './QuizFailureModal';

const OnboardingTest: React.FC = () => {
  const navigate = useNavigate();
  const { user, forceRefreshUser } = useAuth();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<UserQuestionAnswer[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(45 * 60); // 45 minutes
  const [showInstructions, setShowInstructions] = useState(true);
  const [testStarted, setTestStarted] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  
  // API-fetched questions state
  const [questions, setQuestions] = useState<LanguageProficiencyQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questionsError, setQuestionsError] = useState<string>('');
  const [questionsFetched, setQuestionsFetched] = useState(false);
  
  // Onboarding completion check
  const [checkingOnboardingStatus, setCheckingOnboardingStatus] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  
  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [justCompletedQuiz, setJustCompletedQuiz] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers.find(a => a.question_id === currentQuestion?.id);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Auto-refresh user data after successful quiz completion
  const autoRefreshUserData = useCallback(async (): Promise<boolean> => {
    try {
      await forceRefreshUser();
      const currentUserData = authStorage.getUser();
      return currentUserData?.onboarding_status === 'completed';
    } catch {
      return false;
    }
  }, [forceRefreshUser]);

  // Check if user has already completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        // First check user object directly for completed status
        // Don't show completed screen if we just completed the quiz (show modal first)
        if (user?.onboarding_status === 'completed' && !justCompletedQuiz) {
          setOnboardingComplete(true);
          setCheckingOnboardingStatus(false);
          return;
        }

        // Check for completed tests via API if user status is not completed
        try {
          const tests = await onboardingAPI.getMyTests();
          const completedTest = tests.find((test: OnboardingTest) => test.status === 'completed');
          
          if (completedTest) {
            setOnboardingComplete(true);
          }
        } catch {
          // If API fails, rely on user object status
        }
      } catch {
        // Silent error handling
      } finally {
        setCheckingOnboardingStatus(false);
      }
    };

    if (user) {
      checkOnboardingStatus();
    } else {
      setCheckingOnboardingStatus(false);
    }
  }, [user, justCompletedQuiz]);

  // Fetch questions when languages are selected and test is started
  useEffect(() => {
    const fetchQuestions = async () => {
      // Only fetch if test started, have languages, no questions yet, not loading, and haven't tried fetching yet
      if (testStarted && selectedLanguages.length > 0 && questions.length === 0 && !loadingQuestions && !questionsFetched) {
        setLoadingQuestions(true);
        setQuestionsError('');
        
        try {
          const fetchedQuestions = await languageProficiencyAPI.getQuestionsByLanguages(selectedLanguages);
          
          // Mark as fetched regardless of result to prevent infinite loops
          setQuestionsFetched(true);
          
          if (fetchedQuestions && fetchedQuestions.length > 0) {
            setQuestions(fetchedQuestions);
          } else {
            setQuestionsError('No questions available for your selected languages. Please contact support.');
          }
        } catch {
          setQuestionsError('Failed to load test questions. Please try again.');
        } finally {
          setLoadingQuestions(false);
        }
      }
    };

    fetchQuestions();
  }, [testStarted, selectedLanguages, questions.length, loadingQuestions, questionsFetched]);

  const handleStartTest = () => {
    if (user?.languages && user.languages.length > 0) {
      setSelectedLanguages(user.languages);
      setShowInstructions(false);
      setTestStarted(true);
    } else {
      alert('Please update your profile to select your languages before taking the proficiency quiz.');
      navigate('/profile');
    }
  };

  const updateAnswer = (selectedAnswer: number) => {
    if (!currentQuestion) return;
    
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;
    const newAnswer: UserQuestionAnswer = {
      question_id: currentQuestion.id,
      selected_answer: selectedAnswer,
      is_correct: isCorrect
    };
    
    setAnswers(prev => {
      const filtered = prev.filter(a => a.question_id !== newAnswer.question_id);
      return [...filtered, newAnswer];
    });
  };

  const handleNext = () => {
    if (!currentAnswer) {
      alert('Please select an answer before proceeding.');
      return;
    }
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // This is the last question, submit the test
      handleSubmitTest();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleQuizSuccess = async () => {
    try {
      // Auto-refresh user data
      const refreshSuccess = await autoRefreshUserData();
      
      if (!refreshSuccess) {
        // If auto-refresh failed, try one more time after a short delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        await autoRefreshUserData();
      }
      
      setShowSuccessModal(false);
      setJustCompletedQuiz(false);
      navigate('/dashboard');
    } catch {
      // Still navigate even if refresh fails - the dashboard will handle the updated state
      setShowSuccessModal(false);
      setJustCompletedQuiz(false);
      navigate('/dashboard');
    }
  };

  const handleRetryQuiz = () => {
    // Reset all quiz state for a fresh start
    setShowFailureModal(false);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setTimeRemaining(45 * 60);
    setShowInstructions(true);
    setTestStarted(false);
    setQuestions([]);
    setQuestionsFetched(false);
    setQuestionsError('');
    setLoadingQuestions(false);
    setFinalScore(0);
    setJustCompletedQuiz(false);
  };

  const handleSubmitTest = useCallback(async () => {
    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }

    // Check if test is actually ready for submission
    if (questions.length === 0) {
      alert('No questions available to submit. Please try again later.');
      return;
    }

    // Check if all questions are answered
    if (answers.length < questions.length) {
      const unansweredCount = questions.length - answers.length;
      const confirmSubmit = window.confirm(
        `You have ${unansweredCount} unanswered question(s). Are you sure you want to submit the test? Unanswered questions will be marked as incorrect.`
      );
      if (!confirmSubmit) {
        return;
      }
    }

    setIsSubmitting(true);
    
    try {
      // Calculate score
      const correctAnswers = answers.filter(a => a.is_correct).length;
      const totalQuestions = questions.length;
      const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
      
      // Submit to backend
      const result = await languageProficiencyAPI.submitAnswers(answers, sessionId, selectedLanguages);
      
      if (result.passed || score >= 70) {
        // Show success modal and mark as just completed
        setFinalScore(score);
        setJustCompletedQuiz(true);
        
        // Update user data if returned from backend
        if (result.updated_user) {
          authStorage.setUser(result.updated_user);
          await forceRefreshUser();
        } else {
          // Auto-refresh user data in background
          autoRefreshUserData();
        }
        
        setShowSuccessModal(true);
      } else {
        // Show failure modal
        setFinalScore(score);
        setShowFailureModal(true);
      }
    } catch {
      alert('Error submitting quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [answers, questions.length, sessionId, selectedLanguages, isSubmitting, forceRefreshUser, autoRefreshUserData]);

  // Timer effect - only start when questions are loaded and test has actually started
  useEffect(() => {
    // Only start timer if: test started, time remaining, questions loaded, and questions available
    if (!testStarted || timeRemaining <= 0 || !questionsFetched || questions.length === 0) {
      return;
    }

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
  }, [testStarted, timeRemaining, questionsFetched, questions.length, handleSubmitTest]);

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'grammar': return '📝';
      case 'vocabulary': return '📚';
      case 'translation': return '🔄';
      case 'cultural': return '🏛️';
      case 'comprehension': return '🧠';
      default: return '❓';
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'grammar': return 'Grammar';
      case 'vocabulary': return 'Vocabulary';
      case 'translation': return 'Translation';
      case 'cultural': return 'Cultural Knowledge';
      case 'comprehension': return 'Reading Comprehension';
      default: return 'General';
    }
  };

  if (checkingOnboardingStatus) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-16 w-16 text-blue-400 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Checking onboarding status...</p>
        </div>
      </div>
    );
  }

  if (onboardingComplete) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 p-3">
                <Globe className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🎉 Onboarding Complete!
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              You have already completed the language proficiency quiz and onboarding process.
            </p>
            <p className="text-gray-500 mb-8">
              You now have full access to all annotation features and can start contributing to the project.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center px-8 py-3 border border-transparent text-lg font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showInstructions) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-blue-100 p-3">
                  <Globe className="h-12 w-12 text-blue-600" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Language Proficiency Quiz 🌏
              </h1>
              <p className="text-lg text-gray-600">
                Demonstrate your language skills and cultural knowledge
              </p>
              
              <div className="mt-4 flex items-center justify-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-green-400 rounded-full mr-2"></span>
                  <span>Multiple Languages</span>
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-blue-400 rounded-full mr-2"></span>
                  <span>Cultural Context</span>
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></span>
                  <span>Practical Skills</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <div className="flex items-start">
                <BookOpen className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    About This Quiz
                  </h3>
                  <p className="text-blue-800 mb-3">
                    This proficiency quiz tests your knowledge of the languages you've selected in your profile. 
                    You'll answer questions about grammar, vocabulary, translation, and cultural understanding.
                  </p>
                                     <p className="text-blue-700 text-sm mb-2">
                     Your selected languages: <strong>{user?.languages && user.languages.length > 0 
                       ? [...new Set(user.languages)].map(lang => 
                           lang.charAt(0).toUpperCase() + lang.slice(1)).join(', ')
                       : 'None selected'}</strong>
                   </p>
                  <p className="text-blue-600 text-xs italic">
                    💡 This quiz helps us understand your language proficiency for annotation tasks!
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-green-50 rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <Clock className="h-5 w-5 text-green-600 mr-2" />
                  <h4 className="font-semibold text-green-900">Time & Format</h4>
                </div>
                <ul className="text-green-800 space-y-1 text-sm">
                  <li>• 45 minutes total time</li>
                  <li>• Multiple choice questions</li>
                  <li>• Questions based on your languages</li>
                  <li>• Take your time to think carefully</li>
                </ul>
              </div>

              <div className="bg-yellow-50 rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <Brain className="h-5 w-5 text-yellow-600 mr-2" />
                  <h4 className="font-semibold text-yellow-900">Question Types</h4>
                </div>
                <ul className="text-yellow-800 space-y-1 text-sm">
                  <li>• 📝 Grammar & Syntax</li>
                  <li>• 📚 Vocabulary Knowledge</li>
                  <li>• 🔄 Translation Skills</li>
                  <li>• 🏛️ Cultural Understanding</li>
                </ul>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-amber-800">
                  <p className="font-medium mb-1">Passing Score: 70%</p>
                  <p className="text-sm mb-2">
                    This quiz validates your language proficiency for annotation work. 
                    If you don't pass initially, you can retake it after studying more.
                  </p>
                  <p className="text-xs italic">
                    Remember: This helps us ensure quality annotations and provide appropriate language tasks! 🎯
                  </p>
                </div>
              </div>
            </div>

            {user?.languages && user.languages.length > 0 ? (
              <div className="text-center">
                <button
                  onClick={handleStartTest}
                  className="inline-flex items-center px-8 py-3 border border-transparent text-lg font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Start Language Quiz
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
                <p className="mt-3 text-sm text-gray-500">
                  By starting the quiz, the 45-minute timer will begin
                </p>
              </div>
            ) : (
              <div className="text-center">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-800 font-medium">No languages selected</p>
                  <p className="text-red-700 text-sm">Please update your profile to select your languages first.</p>
                </div>
                <button
                  onClick={() => navigate('/profile')}
                  className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
                >
                  Update Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show loading/error states for when test is started but questions aren't ready
  if (testStarted && (!currentQuestion && !loadingQuestions && !questionsError)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="flex flex-col items-center">
            <Brain className="h-16 w-16 text-blue-400 animate-pulse mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Preparing your test...</p>
            <p className="text-sm text-gray-500">
              Setting up questions for {selectedLanguages.map(lang => 
                lang.charAt(0).toUpperCase() + lang.slice(1)
              ).join(', ')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error states or no questions available
  if (testStarted && !currentQuestion && !loadingQuestions) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          {questionsError ? (
            <div className="flex flex-col items-center">
              <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{questionsError}</p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setQuestionsError('');
                    setQuestionsFetched(false);
                    setQuestions([]);
                    setLoadingQuestions(false);
                    // Reset test state for retry
                    setCurrentQuestionIndex(0);
                    setAnswers([]);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mr-3"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          ) : testStarted && questionsFetched && questions.length === 0 ? (
            <div className="flex flex-col items-center">
              <Globe className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No questions available for your selected languages.</p>
              <p className="text-gray-500 mb-6 text-sm">
                This might be because your language combination doesn't have test questions yet.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/profile')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mr-3"
                >
                  Update Language Selection
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Brain className="h-16 w-16 text-blue-400 animate-pulse mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Loading quiz questions...</p>
              <p className="text-sm text-gray-500">
                Preparing questions for {selectedLanguages.map(lang => 
                  lang.charAt(0).toUpperCase() + lang.slice(1)
                ).join(', ')}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show loading state when questions are being fetched
  if (loadingQuestions) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-16 w-16 text-blue-400 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Loading quiz questions...</p>
          <p className="text-sm text-gray-500">
            Fetching questions for {selectedLanguages.map(lang => 
              lang.charAt(0).toUpperCase() + lang.slice(1)
            ).join(', ')}
          </p>
        </div>
      </div>
    );
  }

  // Only show main test interface if we have a current question
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No question available</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with timer and progress */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">
              Language Proficiency Quiz
            </h1>
            <div className="text-sm text-gray-500">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              timeRemaining > 900 ? 'bg-green-100 text-green-800' : 
              timeRemaining > 300 ? 'bg-yellow-100 text-yellow-800' : 
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

      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow p-8">
          {/* Question Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getQuestionTypeIcon(currentQuestion.type)}</span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {currentQuestion.language} - {getQuestionTypeLabel(currentQuestion.type)}
                  </h3>
                  <p className="text-sm text-gray-500 capitalize">
                    Difficulty: {currentQuestion.difficulty}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-lg text-gray-900 font-medium">
                {currentQuestion.question}
              </p>
            </div>
          </div>

          {/* Answer Options */}
          <div className="space-y-3 mb-8">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => updateAnswer(index)}
                className={`w-full p-4 text-left border-2 rounded-lg transition-colors ${
                  currentAnswer?.selected_answer === index
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <span className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center text-sm font-medium ${
                    currentAnswer?.selected_answer === index
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-gray-300'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="text-gray-900">{option}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="text-sm text-gray-500">
              {answers.length} of {questions.length} answered
            </div>

            <button
              onClick={handleNext}
              disabled={!currentAnswer || isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 
               currentQuestionIndex === questions.length - 1 ? 'Submit Quiz' : 'Next'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Success Modal */}
      <QuizSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        score={finalScore}
        onContinue={handleQuizSuccess}
        languages={selectedLanguages}
      />
      
      {/* Failure Modal */}
      <QuizFailureModal
        isOpen={showFailureModal}
        onClose={() => setShowFailureModal(false)}
        score={finalScore}
        onRetry={handleRetryQuiz}
        onContinue={() => {
          setShowFailureModal(false);
          navigate('/dashboard');
        }}
        languages={selectedLanguages}
      />
    </div>
  );
};

export default OnboardingTest;
