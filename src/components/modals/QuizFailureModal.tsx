import React, { useEffect, useState } from 'react';
import { Book, RefreshCw, ArrowRight, X, AlertCircle } from 'lucide-react';

interface QuizFailureModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  onRetry: () => void;
  onContinue: () => void;
  languages: string[];
}

const QuizFailureModal: React.FC<QuizFailureModalProps> = ({
  isOpen,
  onClose,
  score,
  onRetry,
  onContinue,
  languages
}) => {
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setAnimationPhase(1);
      const timer = setTimeout(() => setAnimationPhase(2), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getEncouragementMessage = (score: number) => {
    if (score >= 60) return 'You are almost there.';
    if (score >= 50) return 'Good effort. Please keep improving.';
    return 'Every expert was once a beginner.';
  };

  const getMotivationalTip = (score: number) => {
    if (score >= 60) {
      return 'You are very close to passing. Review the areas you missed and try again.';
    }
    if (score >= 50) {
      return 'Focus on grammar rules and vocabulary. Consistent practice delivers results.';
    }
    return 'Take time to study the language fundamentals. You can accomplish this.';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto transform transition-all duration-500 ${
            animationPhase >= 1 ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Content */}
          <div className="p-8 text-center">
            {/* Icon */}
            <div className={`mb-6 transform transition-all duration-700 ${
              animationPhase >= 2 ? 'scale-100 rotate-0' : 'scale-0 rotate-45'
            }`}>
              <div className="relative inline-block">
                <div className="bg-orange-100 rounded-full p-4 mb-2">
                  <AlertCircle className="h-16 w-16 text-orange-500 mx-auto" />
                </div>
              </div>
            </div>

            {/* Message */}
            <div className={`mb-6 transform transition-all duration-500 delay-300 ${
              animationPhase >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Continue Learning
              </h2>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                {getEncouragementMessage(score)}
              </h3>
              
              {/* Score Display */}
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 mb-4">
                <div className="flex items-center justify-center mb-2">
                  <Book className="h-6 w-6 text-orange-500 mr-2" />
                  <span className="text-sm font-medium text-gray-600">Your Score</span>
                </div>
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {score.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">
                  Passing score: 70%
                </div>
              </div>
            </div>

            {/* Languages Display */}
            <div className={`mb-6 transform transition-all duration-500 delay-500 ${
              animationPhase >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}>
              <p className="text-gray-600 mb-3">
                Languages tested:
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {languages.map((lang) => (
                  <span
                    key={lang}
                    className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
                  >
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </span>
                ))}
              </div>
            </div>

            {/* Motivational Message */}
            <div className={`mb-8 transform transition-all duration-500 delay-700 ${
              animationPhase >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-blue-800 font-medium text-sm mb-2">
                  Tip: {getMotivationalTip(score)}
                </p>
              </div>
              
              <div className="text-left">
                <h4 className="font-semibold text-gray-700 mb-2">Study Tips:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Review grammar rules and sentence structure</li>
                  <li>• Expand your vocabulary with flashcards</li>
                  <li>• Practice translation exercises</li>
                  <li>• Learn about cultural contexts</li>
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={`space-y-3 transform transition-all duration-500 delay-900 ${
              animationPhase >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}>
              <button
                onClick={onRetry}
                className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
              >
                <RefreshCw className="mr-2 h-5 w-5" />
                Try Again
              </button>
              
              <button
                onClick={onContinue}
                className="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
              >
                Continue to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              
              <p className="text-xs text-gray-500">
                You may retake the quiz at any time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizFailureModal;
