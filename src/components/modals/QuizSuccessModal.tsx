import React, { useEffect, useState } from 'react';
import { Trophy, Star, CheckCircle, ArrowRight, X } from 'lucide-react';

interface QuizSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  onContinue: () => void;
  languages: string[];
}

const QuizSuccessModal: React.FC<QuizSuccessModalProps> = ({
  isOpen,
  onClose,
  score,
  onContinue,
  languages
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      setAnimationPhase(1);
      
      // Add floating animation CSS
      const style = document.createElement('style');
      style.textContent = `
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-5px) rotate(5deg); }
          50% { transform: translateY(0px) rotate(0deg); }
          75% { transform: translateY(-3px) rotate(-5deg); }
        }
      `;
      document.head.appendChild(style);
      
      // Trigger different animation phases
      const timer1 = setTimeout(() => setAnimationPhase(2), 500);
      const timer2 = setTimeout(() => setAnimationPhase(3), 1000);
      const timer3 = setTimeout(() => setShowConfetti(false), 4000);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        document.head.removeChild(style);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    return 'text-yellow-600';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 95) return 'Outstanding performance';
    if (score >= 90) return 'Excellent work';
    if (score >= 80) return 'Great job';
    return 'Well done';
  };

  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 3 + Math.random() * 2,
    rotation: Math.random() * 360,
    size: 0.5 + Math.random() * 1.5,
    color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'][Math.floor(Math.random() * 6)]
  }));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {confettiPieces.map((piece) => (
            <div
              key={piece.id}
              className="absolute rounded-full"
              style={{
                left: `${piece.left}%`,
                backgroundColor: piece.color,
                width: `${piece.size * 8}px`,
                height: `${piece.size * 8}px`,
                animationDelay: `${piece.delay}s`,
                animationDuration: `${piece.duration}s`,
                transform: showConfetti 
                  ? `translateY(120vh) rotate(${piece.rotation + 360}deg)` 
                  : `translateY(-10vh) rotate(${piece.rotation}deg)`,
                transition: `transform ${piece.duration}s ease-out ${piece.delay}s, opacity ${piece.duration}s ease-out ${piece.delay}s`,
                opacity: showConfetti ? 0 : 1
              }}
            />
          ))}
        </div>
      )}

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
            {/* Trophy Animation */}
            <div className={`mb-6 transform transition-all duration-700 ${
              animationPhase >= 2 ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
            }`}>
              <div className="relative inline-block">
                <Trophy className="h-20 w-20 text-yellow-500 mx-auto animate-pulse" />
                
                {/* Floating sparkles around trophy */}
                <div className="absolute inset-0">
                  <Star className={`absolute h-3 w-3 text-yellow-400 transition-all duration-1000 ${
                    animationPhase >= 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                  }`} style={{ 
                    top: '10%', 
                    right: '15%',
                    animation: animationPhase >= 3 ? 'float 2s ease-in-out infinite' : 'none'
                  }} />
                  <Star className={`absolute h-4 w-4 text-blue-400 transition-all duration-1000 delay-300 ${
                    animationPhase >= 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                  }`} style={{ 
                    bottom: '20%', 
                    left: '10%',
                    animation: animationPhase >= 3 ? 'float 2s ease-in-out infinite 0.5s' : 'none'
                  }} />
                  <Star className={`absolute h-2 w-2 text-green-400 transition-all duration-1000 delay-500 ${
                    animationPhase >= 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                  }`} style={{ 
                    top: '20%', 
                    left: '20%',
                    animation: animationPhase >= 3 ? 'float 2s ease-in-out infinite 1s' : 'none'
                  }} />
                  <Star className={`absolute h-3 w-3 text-purple-400 transition-all duration-1000 delay-700 ${
                    animationPhase >= 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                  }`} style={{ 
                    bottom: '10%', 
                    right: '20%',
                    animation: animationPhase >= 3 ? 'float 2s ease-in-out infinite 1.5s' : 'none'
                  }} />
                </div>
              </div>
            </div>

            {/* Success Message */}
            <div className={`mb-6 transform transition-all duration-500 delay-300 ${
              animationPhase >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Congratulations
              </h2>
              <h3 className="text-xl font-semibold text-gray-700 mb-3">
                {getScoreMessage(score)}
              </h3>
              
              {/* Score Display */}
              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 mb-4">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle className="h-8 w-8 text-green-500 mr-2" />
                  <span className="text-sm font-medium text-gray-600">Your Score</span>
                </div>
                <div className={`text-4xl font-bold ${getScoreColor(score)} mb-2`}>
                  {score.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">
                  You passed with excellent proficiency.
                </div>
              </div>
            </div>

            {/* Languages Display */}
            <div className={`mb-6 transform transition-all duration-500 delay-500 ${
              animationPhase >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}>
              <p className="text-gray-600 mb-3">
                You have demonstrated excellent proficiency in:
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {languages.map((lang, index) => (
                  <span
                    key={lang}
                    className={`px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium transform transition-all duration-300 ${
                      animationPhase >= 3 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                    }`}
                    style={{ transitionDelay: `${600 + index * 100}ms` }}
                  >
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </span>
                ))}
              </div>
            </div>

            {/* Achievement Message */}
            <div className={`mb-8 transform transition-all duration-500 delay-700 ${
              animationPhase >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium text-sm">
                  Your language skills are excellent. You now have full access to all annotation features and can start contributing to the Lakra project.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={`space-y-3 transform transition-all duration-500 delay-900 ${
              animationPhase >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}>
              <button
                onClick={onContinue}
                className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
              >
                Continue to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              
              <p className="text-xs text-gray-500">
                Welcome to the Lakra annotation team.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizSuccessModal;
