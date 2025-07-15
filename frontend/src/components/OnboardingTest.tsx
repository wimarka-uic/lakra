import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { languageProficiencyAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Clock, Brain, AlertTriangle, ArrowRight, Globe, BookOpen } from 'lucide-react';
import type { UserQuestionAnswer, LanguageProficiencyQuestion } from '../types';

const OnboardingTest: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
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

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers.find(a => a.question_id === currentQuestion?.id);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Fetch questions when languages are selected and test is started
  useEffect(() => {
    const fetchQuestions = async () => {
      if (testStarted && selectedLanguages.length > 0 && questions.length === 0 && !loadingQuestions) {
        setLoadingQuestions(true);
        setQuestionsError('');
        
        try {
          console.log('Fetching questions for languages:', selectedLanguages);
          const fetchedQuestions = await languageProficiencyAPI.getQuestionsByLanguages(selectedLanguages);
          console.log('Fetched questions:', fetchedQuestions);
          setQuestions(fetchedQuestions);
          
          if (fetchedQuestions.length === 0) {
            setQuestionsError('No questions available for your selected languages. Please contact support.');
          }
        } catch (error) {
          console.error('Error fetching questions:', error);
          setQuestionsError('Failed to load test questions. Please try again.');
        } finally {
          setLoadingQuestions(false);
        }
      }
    };

    fetchQuestions();
  }, [testStarted, selectedLanguages, questions.length, loadingQuestions]);

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
      // Calculate score
      const correctAnswers = answers.filter(a => a.is_correct).length;
      const totalQuestions = questions.length;
      const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
      
      // Submit to backend
      const result = await languageProficiencyAPI.submitAnswers(answers, sessionId, selectedLanguages);
      
      if (result.passed || score >= 70) {
        setTimeout(() => {
          alert(`🎉 Congratulations! You passed the Language Proficiency Quiz with a score of ${score.toFixed(1)}%!

Your language skills are excellent, and you demonstrate strong proficiency in your selected languages.

Welcome to the Lakra team! You can now access all annotation features.`);
          navigate('/dashboard');
        }, 1000);
      } else {
        setTimeout(() => {
          alert(`📚 You scored ${score.toFixed(1)}% on the Language Proficiency Quiz.

Don't worry - language learning is a journey! You need at least 70% to pass, but this is a great opportunity to improve your skills.

🔄 You can retake the quiz anytime after reviewing language materials and practicing more.

💡 Tip: Focus on grammar rules, expand your vocabulary, and practice cultural understanding of your selected languages.`);
          navigate('/dashboard');
        }, 1000);
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      alert('Error submitting quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [answers, questions.length, navigate, sessionId, selectedLanguages]);

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

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          {loadingQuestions ? (
            <div className="flex flex-col items-center">
              <Brain className="h-16 w-16 text-blue-400 animate-pulse mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Loading quiz questions...</p>
              <p className="text-sm text-gray-500">
                Preparing questions for {selectedLanguages.map(lang => 
                  lang.charAt(0).toUpperCase() + lang.slice(1)
                ).join(', ')}
              </p>
            </div>
          ) : questionsError ? (
            <div className="flex flex-col items-center">
              <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{questionsError}</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Return to Dashboard
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Globe className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No questions available for your selected languages.</p>
              <button
                onClick={() => navigate('/profile')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Update Language Selection
              </button>
            </div>
          )}
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
    </div>
  );
};

export default OnboardingTest;
