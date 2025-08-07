import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { languageProficiencyAPI } from '../../services/supabase-api';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, Brain, Globe, Users, FileText, Check, UserCheck, Clock, Loader2, ArrowRight } from 'lucide-react';
import type { LanguageProficiencyQuestion } from '../../types';
import Logo from '../ui/Logo';

interface UserAnswer {
  question_id: number;
  selected_answer: number;
  is_correct?: boolean; // Optional since we don't calculate it during the test
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    preferred_language: '', // No default language selection
    languages: [] as string[], // Explicitly define as string array
    user_type: 'annotator', // New field for user type
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: User Type, 2: Personal Info, 3: Account Details, 4: Onboarding Test (for annotators)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  
  // Onboarding test state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [onboardingAnswers, setOnboardingAnswers] = useState<UserAnswer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0); // Will be calculated based on questions
  const [testStarted, setTestStarted] = useState(false);
  const [isSubmittingTest, setIsSubmittingTest] = useState(false);
  const [questions, setQuestions] = useState<LanguageProficiencyQuestion[]>([]);
  const [testSessionId, setTestSessionId] = useState('');
  
  // Use ref to track if questions have been loaded for current languages
  const questionsLoadedRef = useRef<string>('');

  const { register } = useAuth();
  const navigate = useNavigate();

  // Generate unique test session ID
  const generateSessionId = () => {
    return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Note: Questions are now fetched during step 3 validation before proceeding to step 4
  // This prevents users from reaching the test step without available questions

  // Reset questions when step changes or languages change
  useEffect(() => {
    if (currentStep !== 4) {
      // Only reset if we're not going back to step 4 (i.e., if moving to step 1, 2, or 3)
      if (currentStep < 4) {
        setQuestions([]);
        questionsLoadedRef.current = '';
        setTestSessionId('');
      }
    }
  }, [currentStep]);

  // Language proficiency questions - now fetched from API
  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = onboardingAnswers.find(a => a.question_id === currentQuestion?.id);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const updateOnboardingAnswer = (selectedAnswer: number) => {
    if (!currentQuestion) return;
    
    // Only store the selected answer, don't calculate correctness during the test
    const newAnswer: UserAnswer = {
      question_id: currentQuestion.id,
      selected_answer: selectedAnswer
      // is_correct will be calculated only when submitting the test
    };
    
    setOnboardingAnswers(prev => {
      const filtered = prev.filter(a => a.question_id !== currentQuestion.id);
      return [...filtered, newAnswer];
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmitOnboardingTest();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitOnboardingTest = useCallback(async () => {
    setIsSubmittingTest(true);
    
    try {
      // Submit answers to API first (using registration endpoint)
      const userAnswers = onboardingAnswers.map(answer => ({
        question_id: answer.question_id,
        selected_answer: answer.selected_answer,
        test_session_id: testSessionId
      }));

      const result = await languageProficiencyAPI.submitAnswersRegistration(userAnswers, testSessionId, formData.languages);
      
      if (result.passed) {
        // Test passed, now complete the registration
        const registerData = {
          email: formData.email,
          username: formData.username,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
          preferred_language: formData.preferred_language,
          languages: formData.languages,
          is_evaluator: false, // annotator
          user_type: formData.user_type,
          onboarding_passed: true, // Indicate that user passed onboarding test
          test_answers: onboardingAnswers, // Pass test answers to be stored after user creation
          test_session_id: testSessionId
        };
        
        try {
          await register(registerData);
          
          setRegistrationSuccess(true);
          setSuccessMessage('Registration successful! You can now log in and start annotating.');
          setError(''); // Clear any error messages
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } catch (registrationError) {
          console.error('Registration failed after test passed:', registrationError);
          setError('Registration failed after passing the test. Please try again or contact support.');
          setCurrentStep(3); // Go back to account creation step
          setTestStarted(false);
          setCurrentQuestionIndex(0);
          setOnboardingAnswers([]);
          setTimeRemaining(0);
          questionsLoadedRef.current = '';
          setQuestions([]);
          setTestSessionId('');
        }
      } else {
        setError(`You scored ${result.score.toFixed(1)}% on the proficiency test. You need at least 70% to pass. Don't worry - you can retake the test after reviewing the materials. Please go back and try again when you're ready.`);
        setCurrentStep(3); // Go back to account creation step
        setTestStarted(false); // Reset test state
        setCurrentQuestionIndex(0); // Reset question index
        setOnboardingAnswers([]); // Clear previous answers
        setTimeRemaining(0); // Will be recalculated when questions are loaded
        // Reset questions loading state so they can be fetched again
        questionsLoadedRef.current = '';
        setQuestions([]);
        setTestSessionId('');
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Error submitting proficiency test. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('Registration failed')) {
          errorMessage = 'Registration failed. Please try again.';
        } else if (error.message.includes('Test validation failed')) {
          errorMessage = error.message;
        } else if (error.message.includes('Failed to validate test answers')) {
          errorMessage = 'Test validation failed. Please try again.';
        } else {
          errorMessage = error.message || errorMessage;
        }
      }
      
      setError(errorMessage);
      setSuccessMessage(''); // Clear any success message
      // Reset state on error so user can retry
      questionsLoadedRef.current = '';
      setQuestions([]);
      setTestSessionId('');
      setCurrentStep(3); // Go back to account creation step
      setTestStarted(false);
      setCurrentQuestionIndex(0);
      setOnboardingAnswers([]);
      setTimeRemaining(0);
    } finally {
      setIsSubmittingTest(false);
    }
  }, [onboardingAnswers, testSessionId, navigate, register, formData]);

  // Timer effect for onboarding test
  useEffect(() => {
    let interval: number;
    if (testStarted && currentStep === 4 && timeRemaining > 0) {
      interval = window.setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitOnboardingTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        window.clearInterval(interval);
      }
    };
  }, [testStarted, currentStep, timeRemaining, handleSubmitOnboardingTest]);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle user type selection
  const handleUserTypeChange = (userType: string) => {
    setFormData({
      ...formData,
      user_type: userType,
    });
  };

  // Helper function to handle language selection
  const handleLanguageToggle = (languageId: string) => {
    const isSelected = formData.languages.includes(languageId);
    let newLanguages: string[];
    
    if (isSelected) {
      newLanguages = formData.languages.filter(l => l !== languageId);
    } else {
      newLanguages = [...formData.languages, languageId];
    }
    
    // Update preferred_language logic:
    // - If only one language is selected, that becomes the primary
    // - If removing a language and that was the primary, use the first remaining language (if any)
    // - If preferred_language is empty and languages are selected, set the first one as preferred
    let updatedPreferredLanguage = formData.preferred_language;
    
    if (newLanguages.length === 1) {
      // When only one language is selected, it automatically becomes the primary
      updatedPreferredLanguage = newLanguages[0];
    } else if (newLanguages.length > 0 && (isSelected && languageId === formData.preferred_language)) {
      // If removing the current primary language, set to the first available one
      updatedPreferredLanguage = newLanguages[0];
    } else if (newLanguages.length === 0) {
      // If no languages selected, clear the primary language
      updatedPreferredLanguage = '';
    }
    
    setFormData({
      ...formData,
      languages: newLanguages,
      preferred_language: updatedPreferredLanguage
    });
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      errors.first_name = 'First name is required';
    }

    if (!formData.last_name.trim()) {
      errors.last_name = 'Last name is required';
    }

    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters long';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (formData.languages.length === 0) {
      errors.languages = 'Please select at least one language';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (currentStep === 1) {
      // Just move to next step after user type selection
      setCurrentStep(2);
      return;
    }
    
    if (currentStep === 2) {
      const basicInfoValid = formData.first_name.trim() && formData.last_name.trim() && formData.languages.length > 0;
      if (basicInfoValid) {
        setCurrentStep(3);
      } else {
        setError('Please complete all required fields before continuing');
      }
      return;
    }

    if (currentStep === 3) {
      if (!validateForm()) {
        setError('Please correct the errors before submitting');
        return;
      }

      setIsLoading(true);

      try {
        // Check if user is annotator and needs onboarding BEFORE registering
        const needsOnboardingTest = formData.user_type === 'annotator';
        
        if (needsOnboardingTest) {
          // Check if questions are available for selected languages before proceeding
          try {
            setError(''); // Clear any previous errors
            const fetchedQuestions = await languageProficiencyAPI.getQuestionsByLanguages(formData.languages);
            
            if (!fetchedQuestions || fetchedQuestions.length === 0) {
              setError(
                `No proficiency test questions are currently available for your selected languages (${formData.languages.map(lang => 
                  lang.charAt(0).toUpperCase() + lang.slice(1)
                ).join(', ')}). Please try selecting different languages or contact support for assistance.`
              );
              setIsLoading(false);
              return;
            }
            
            // Questions are available, proceed to test
            setQuestions(fetchedQuestions);
            // Calculate timer based on number of questions (90 seconds per question)
            const calculatedTime = fetchedQuestions.length * 90;
            setTimeRemaining(calculatedTime);
            
            if (!testSessionId) {
              const sessionId = generateSessionId();
              setTestSessionId(sessionId);
            }
            questionsLoadedRef.current = formData.languages.sort().join(',');
            

            
            // For annotators, move to onboarding test step
            setCurrentStep(4);
            setTestStarted(true);
            // Reset any previous test state
            setCurrentQuestionIndex(0);
            setOnboardingAnswers([]);
          } catch (questionError) {
            console.error('Error checking questions availability:', questionError);
            setError('Unable to load proficiency test questions. Please try again or contact support.');
            setIsLoading(false);
            return;
          }
        } else {
          // For evaluators, complete registration normally
          const registerData = {
            email: formData.email,
            username: formData.username,
            password: formData.password,
            first_name: formData.first_name,
            last_name: formData.last_name,
            preferred_language: formData.preferred_language,
            languages: formData.languages,
            is_evaluator: formData.user_type === 'evaluator',
            user_type: formData.user_type
          };
          
          await register(registerData);
          
          setRegistrationSuccess(true);
          setTimeout(() => navigate('/'), 1500);
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError(error.message || 'Registration failed. Please try again.');
        } else if (typeof error === 'object' && error !== null && 'response' in error) {
          // Handle API error responses
          const apiError = error as { response?: { data?: { detail?: string } } };
          setError(apiError.response?.data?.detail || 'Registration failed. Please try again.');
        } else {
          setError('Registration failed. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Step 4 is handled by onboarding test navigation
  };

  // Function to get error message for a field
  const getFieldError = (field: string): string | undefined => {
    return validationErrors[field];
  };

  // Function to check if a field has an error
  const hasError = (field: string): boolean => {
    return !!validationErrors[field];
  };

  // Get input field class based on validation state
  const getInputClass = (field: string): string => {
    return `input-field mt-1 w-full px-3 py-2 border ${hasError(field) 
      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
      : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'} 
      rounded-md shadow-sm focus:outline-none focus:ring-1`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-6 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-4 sm:space-y-8">
        <div>
          <div className="flex justify-center">
            <Logo className="h-24 w-24 text-primary-500" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        {/* Registration Progress */}
        <div className="mb-8">
          <div className="relative">
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
              <div 
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500 transition-all"
                style={{ 
                  width: formData.user_type === 'annotator' ? 
                    (currentStep === 1 ? '25%' : 
                     currentStep === 2 ? '50%' : 
                     currentStep === 3 ? '75%' : 
                     '100%') :
                    (currentStep === 1 ? '33.33%' : 
                     currentStep === 2 ? '66.67%' : 
                     '100%')
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span className={currentStep >= 1 ? "font-semibold text-primary-600" : ""}>User Type</span>
              <span className={currentStep >= 2 ? "font-semibold text-primary-600" : ""}>Personal Info</span>
              <span className={currentStep >= 3 ? "font-semibold text-primary-600" : ""}>Account Details</span>
              {formData.user_type === 'annotator' && (
                <span className={currentStep >= 4 ? "font-semibold text-primary-600" : ""}>Proficiency Test</span>
              )}
            </div>
          </div>
        </div>

        {registrationSuccess ? (
          <div className="bg-green-50 border border-green-200 rounded-md p-6 text-center animate-fadeIn">
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-green-100 p-3 mb-4">
                <Check className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-xl font-medium text-green-800 mb-2">Registration successful!</h3>
              <p className="text-sm text-green-600 mb-4">
                {successMessage || `Your account has been created successfully as a ${formData.user_type}.`}
              </p>
              
                          <p className="text-sm text-green-700 mb-3">
              ✅ Registration successful! Kindly confirm your email address and start using the application.
            </p>
            <p className="text-gray-500 text-sm">Redirecting to login...</p>
            <div className="mt-4 w-24 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 animate-pulse"></div>
            </div>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Choose your role
                  </label>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div
                      onClick={() => handleUserTypeChange('annotator')}
                      className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all ${
                        formData.user_type === 'annotator'
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <Users className={`h-6 w-6 ${
                            formData.user_type === 'annotator' ? 'text-primary-600' : 'text-gray-400'
                          }`} />
                        </div>
                        <div className="ml-3 flex-1">
                          <h3 className={`text-sm font-medium ${
                            formData.user_type === 'annotator' ? 'text-primary-900' : 'text-gray-900'
                          }`}>
                            Annotator
                          </h3>
                          <p className={`text-sm ${
                            formData.user_type === 'annotator' ? 'text-primary-700' : 'text-gray-500'
                          }`}>
                            Review and annotate machine translations for quality and accuracy.
                          </p>
                        </div>
                        {formData.user_type === 'annotator' && (
                          <Check className="h-5 w-5 text-primary-600" />
                        )}
                      </div>
                    </div>

                    <div
                      className="relative rounded-lg border-2 p-4 cursor-not-allowed transition-all border-gray-200 bg-gray-50 opacity-60"
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <UserCheck className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-medium text-gray-500">
                              Evaluator
                            </h3>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Coming Soon
                            </span>
                          </div>
                          <p className="text-sm text-gray-400">
                            Evaluate and review annotations made by other users for quality assurance.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                      First name
                    </label>
                    <input
                      id="first_name"
                      name="first_name"
                      type="text"
                      required
                      value={formData.first_name}
                      onChange={handleChange}
                      className={getInputClass('first_name')}
                      placeholder="First name"
                    />
                    {hasError('first_name') && <p className="mt-1 text-sm text-red-600">{getFieldError('first_name')}</p>}
                  </div>

                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                      Last name
                    </label>
                    <input
                      id="last_name"
                      name="last_name"
                      type="text"
                      required
                      value={formData.last_name}
                      onChange={handleChange}
                      className={getInputClass('last_name')}
                      placeholder="Last name"
                    />
                    {hasError('last_name') && <p className="mt-1 text-sm text-red-600">{getFieldError('last_name')}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language Proficiency
                  </label>
                  
                  <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-medium">Select languages you are proficient in:</h3>
                      <span className="text-xs bg-gray-200 text-gray-700 rounded-full px-2 py-1">
                        {formData.languages.length} selected
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                      {[
                        { id: 'tagalog', name: 'Tagalog' },
                        { id: 'cebuano', name: 'Cebuano' },
                        { id: 'ilokano', name: 'Ilokano' }
                        //{ id: 'hiligaynon', name: 'Hiligaynon' },
                        //{ id: 'bicolano', name: 'Bicolano' },
                        //{ id: 'waray', name: 'Waray' },
                        //{ id: 'pampangan', name: 'Pampangan' },
                        //{ id: 'pangasinan', name: 'Pangasinan' }
                      ].map((language) => (
                        <div
                          key={language.id}
                          onClick={() => handleLanguageToggle(language.id)}
                          className={`flex items-center justify-center gap-2 px-3 py-2 border rounded-md cursor-pointer transition-all ${
                            formData.languages.includes(language.id)
                              ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <span className="text-center">{language.name}</span>
                          {formData.languages.includes(language.id) && 
                            <Check className="h-4 w-4 flex-shrink-0" />
                          }
                        </div>
                      ))}
                    </div>
                    
                    {formData.languages.length >= 2 && (
                      <div className="mt-4 p-3 bg-white rounded-md border border-gray-200">
                        <h3 className="text-sm font-medium mb-2">Choose a primary language:</h3>
                        <div className="flex flex-wrap gap-2">
                          {formData.languages.map(lang => (
                            <button
                              key={lang}
                              type="button"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  preferred_language: lang
                                });
                              }}
                              className={`py-1.5 px-4 text-sm rounded-full ${
                                formData.preferred_language === lang
                                  ? 'bg-primary-100 text-primary-800 font-semibold border-2 border-primary-400'
                                  : 'bg-white border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {lang.charAt(0).toUpperCase() + lang.slice(1)}
                            </button>
                          ))}
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                          This will be your primary language for {formData.user_type === 'evaluator' ? 'evaluation' : 'translation'} work
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <p className="mt-2 text-sm text-gray-500">
                    Click to select languages you're proficient in. You must select at least one.
                    {formData.languages.length === 1 && " Your selection will be set as your primary language."}
                  </p>
                  {hasError('languages') && <p className="mt-1 text-sm text-red-600">{getFieldError('languages')}</p>}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4 animate-slideIn">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className={getInputClass('username')}
                    placeholder="Choose a username"
                  />
                  {hasError('username') && <p className="mt-1 text-sm text-red-600">{getFieldError('username')}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={getInputClass('email')}
                    placeholder="Enter your email"
                  />
                  {hasError('email') && <p className="mt-1 text-sm text-red-600">{getFieldError('email')}</p>}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className={`${getInputClass('password')} pr-10`}
                      placeholder="Create a password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {hasError('password') && <p className="mt-1 text-sm text-red-600">{getFieldError('password')}</p>}
                  {!hasError('password') && formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              formData.password.length < 6 ? 'bg-red-500 w-1/4' : 
                              formData.password.length < 8 ? 'bg-orange-500 w-2/4' : 
                              formData.password.length < 12 ? 'bg-yellow-500 w-3/4' : 
                              'bg-green-500 w-full'
                            }`}
                          ></div>
                        </div>
                        <span className="ml-2 text-xs font-medium">
                          {formData.password.length < 6 ? 'Very weak' : 
                          formData.password.length < 8 ? 'Weak' : 
                          formData.password.length < 12 ? 'Medium' : 
                          'Strong'}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Use at least 8 characters with uppercase, lowercase, numbers and symbols for a stronger password
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`${getInputClass('confirmPassword')} pr-10`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {hasError('confirmPassword') && <p className="mt-1 text-sm text-red-600">{getFieldError('confirmPassword')}</p>}
                </div>
              </div>
            )}

            {currentStep === 4 && formData.user_type === 'annotator' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Info Message */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <FileText className="h-5 w-5 text-blue-400 mt-0.5" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-900 mb-1">Almost there! 🎯</p>
                      <p className="text-sm text-blue-800">
                        Complete this language proficiency test to finish your registration. 
                        Your account will be created automatically once you pass with 70% or higher.
                        This test helps ensure quality annotations and sets you up for success!
                      </p>
                    </div>
                  </div>
                </div>

                {questions.length === 0 ? (
                  // This state should not occur now since we check for questions before reaching step 4
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <div className="flex flex-col items-center">
                      <AlertCircle className="h-8 w-8 text-red-600 mb-4" />
                      <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Test</h3>
                      <p className="text-sm text-red-800 mb-4">
                        An unexpected error occurred while loading the proficiency test.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          // Go back to step 3 to try again
                          setCurrentStep(3);
                          setQuestions([]);
                          questionsLoadedRef.current = '';
                          setTestSessionId('');
                          setError('');
                        }}
                        className="mt-4 px-6 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
                      >
                        Go Back and Try Again
                      </button>
                    </div>
                  </div>
                ) : (
                  // Test interface
                  <>
                    {/* Test Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="rounded-full bg-blue-100 p-3 mr-4">
                        <Brain className="h-8 w-8 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-blue-900">Language Proficiency Test</h3>
                        <p className="text-sm text-blue-700">
                          Testing your knowledge in {formData.languages.map(lang => 
                            lang.charAt(0).toUpperCase() + lang.slice(1)
                          ).join(', ')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-lg font-bold text-blue-900 mb-1">
                        <Clock className="h-5 w-5 mr-2" />
                        {formatTime(timeRemaining)}
                      </div>
                      <p className="text-xs text-blue-600">Time remaining</p>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="bg-blue-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-blue-700">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </p>
                </div>

                {/* Question Card */}
                {currentQuestion && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="flex items-start mb-4">
                      <div className="flex-shrink-0 mr-4">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-lg">{getQuestionTypeIcon(currentQuestion.type)}</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                            {currentQuestion.language}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {getQuestionTypeLabel(currentQuestion.type)}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            currentQuestion.difficulty === 'basic' ? 'bg-green-100 text-green-800' :
                            currentQuestion.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {currentQuestion.difficulty}
                          </span>
                        </div>
                        <h4 className="text-lg font-medium text-gray-900 mb-4">
                          {currentQuestion.question}
                        </h4>
                      </div>
                    </div>

                    {/* Answer Options */}
                    <div className="space-y-3">
                      {currentQuestion.options.map((option, index) => (
                        <div
                          key={index}
                          onClick={() => updateOnboardingAnswer(index)}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            currentAnswer?.selected_answer === index
                              ? 'border-primary-500 bg-primary-50 shadow-sm'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center">
                            <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                              currentAnswer?.selected_answer === index
                                                                  ? 'border-primary-500 bg-primary-500'
                                  : 'border-gray-300'
                             }`}>
                               {currentAnswer?.selected_answer === index && (
                                 <div className="w-2 h-2 bg-white rounded-full"></div>
                               )}
                             </div>
                             <span className={`text-sm ${
                               currentAnswer?.selected_answer === index ? 'text-primary-900 font-medium' : 'text-gray-700'
                             }`}>
                               {option}
                             </span>
                           </div>
                         </div>
                       ))}
                     </div>

                     {/* Show explanation only after test is completed - removed during test to prevent cheating */}
                   </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <Globe className="h-4 w-4 mr-1" />
                    {onboardingAnswers.length} of {questions.length} answered
                  </div>

                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    disabled={!currentAnswer}
                    className="px-6 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {currentQuestionIndex === questions.length - 1 ? (
                      isSubmittingTest ? (
                        <>
                          <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit Test
                          <Check className="ml-2 h-4 w-4" />
                        </>
                      )
                    ) : (
                      <>
                        Next
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>

                {/* Test Instructions */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <Logo className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Test Instructions</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Answer all questions to the best of your ability</li>
                        <li>• You need 70% or higher to pass</li>
                        <li>• Take your time, but keep an eye on the timer</li>
                        <li>• You can go back to previous questions to review</li>
                      </ul>
                    </div>
                  </div>
                </div>
                  </>
                )}
              </div>
            )}

            <div className="flex gap-4">
              {currentStep > 1 && currentStep !== 4 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Back
                </button>
              )}
              {currentStep !== 4 && (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 flex justify-center items-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" /> 
                      <span className="animate-pulse">
                        {currentStep === 1 ? 'Processing...' : currentStep === 2 ? 'Saving personal info...' : 'Creating account...'}
                      </span>
                    </>
                  ) : (
                    <>
                      {currentStep === 1 ? 'Continue to Personal Info' : currentStep === 2 ? 'Continue to Account Setup' : 'Create Account'}
                      {currentStep === 3 && <Check className="ml-2 h-4 w-4" />}
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;