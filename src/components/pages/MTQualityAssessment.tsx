import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft,
  ArrowRight,
  Mic,
  MicOff
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { logger } from '../../utils/logger';
import { mtQualityAssessmentAPI } from '../../services/supabase-api';

interface MTQualityAssessment {
  id: number;
  sentence_id: number;
  evaluator_id: number;
  fluency_score?: number;
  adequacy_score?: number;
  overall_quality?: number;
  confidence_level?: number;
  error_detection?: string;
  improvement_suggestions?: string;
  evaluation_notes?: string;
  time_spent_seconds?: number;
  created_at: string;
  updated_at: string;
  sentence: {
    id: number;
    source_text: string;
    machine_translation: string;
    reference_translation?: string;
    back_translation?: string;
    source_language: string;
    target_language: string;
    domain?: string;
  };
}

interface MTQualityAssessmentCreate {
  sentence_id: number;
  fluency_score?: number;
  adequacy_score?: number;
  overall_quality?: number;
  confidence_level?: number;
  error_detection?: string;
  improvement_suggestions?: string;
  evaluation_notes?: string;
  time_spent_seconds?: number;
}

interface RatingButtonsProps {
  value?: number;
  onChange: (value: number) => void;
  label: string;
  required?: boolean;
}

const RatingButtons: React.FC<RatingButtonsProps> = ({ value, onChange, label, required = false }) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex space-x-2">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-sm font-medium transition-colors ${
              value === rating
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 text-gray-500 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            {rating}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>Poor</span>
        <span>Excellent</span>
      </div>
    </div>
  );
};

const MTQualityAssessment: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sentences, setSentences] = useState<any[]>([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [assessment, setAssessment] = useState<MTQualityAssessmentCreate>({
    sentence_id: 0,
    fluency_score: undefined,
    adequacy_score: undefined,
    overall_quality: undefined,
    confidence_level: undefined,
    error_detection: '',
    improvement_suggestions: '',
    evaluation_notes: '',
    time_spent_seconds: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [startTime] = useState(new Date());
  const [isRecording, setIsRecording] = useState(false);

  const loadSentences = useCallback(async () => {
    setIsLoading(true);
    try {
      const sentencesData = await mtQualityAssessmentAPI.getSentencesForAssessment(20, 0);
      setSentences(sentencesData);
      if (sentencesData.length > 0) {
        setAssessment(prev => ({ ...prev, sentence_id: sentencesData[0].id }));
      }
    } catch (error) {
      logger.apiError('loadSentences', error as Error, {
        component: 'MTQualityAssessment',
        metadata: { userId: user?.id }
      });
      setMessage('Error loading sentences');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadSentences();
  }, [loadSentences]);

  const handleRatingChange = (field: keyof MTQualityAssessmentCreate, value: number) => {
    setAssessment(prev => ({ ...prev, [field]: value }));
  };

  const handleTextChange = (field: keyof MTQualityAssessmentCreate, value: string) => {
    setAssessment(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = useCallback(() => {
    if (currentSentenceIndex < sentences.length - 1) {
      setCurrentSentenceIndex(prev => prev + 1);
      const nextSentence = sentences[currentSentenceIndex + 1];
      setAssessment({
        sentence_id: nextSentence.id,
        fluency_score: undefined,
        adequacy_score: undefined,
        overall_quality: undefined,
        confidence_level: undefined,
        error_detection: '',
        improvement_suggestions: '',
        evaluation_notes: '',
        time_spent_seconds: 0
      });
    }
  }, [currentSentenceIndex, sentences]);

  const handlePrevious = useCallback(() => {
    if (currentSentenceIndex > 0) {
      setCurrentSentenceIndex(prev => prev - 1);
      const prevSentence = sentences[currentSentenceIndex - 1];
      setAssessment({
        sentence_id: prevSentence.id,
        fluency_score: undefined,
        adequacy_score: undefined,
        overall_quality: undefined,
        confidence_level: undefined,
        error_detection: '',
        improvement_suggestions: '',
        evaluation_notes: '',
        time_spent_seconds: 0
      });
    }
  }, [currentSentenceIndex, sentences]);

  const handleSubmit = async () => {
    if (!assessment.fluency_score || !assessment.adequacy_score || !assessment.overall_quality) {
      setMessage('Please provide all required quality scores');
      return;
    }

    setIsSubmitting(true);
    try {
      const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
      const assessmentData = {
        ...assessment,
        time_spent_seconds: timeSpent
      };

      await mtQualityAssessmentAPI.createAssessment(assessmentData);
      
      setMessage('Assessment submitted successfully!');
      
      // Move to next sentence or show completion message
      if (currentSentenceIndex < sentences.length - 1) {
        setTimeout(() => {
          handleNext();
          setMessage('');
        }, 1500);
      } else {
        setMessage('All assessments completed!');
      }
    } catch (error) {
      logger.apiError('submitAssessment', error as Error, {
        component: 'MTQualityAssessment',
        metadata: { assessment }
      });
      setMessage('Error submitting assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
    } else {
      // Start recording
      setIsRecording(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading MT Quality Assessment...</p>
        </div>
      </div>
    );
  }

  if (sentences.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No sentences available for assessment</p>
        </div>
      </div>
    );
  }

  const currentSentence = sentences[currentSentenceIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Brain className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">MT Quality Assessment</h1>
                <p className="text-gray-600">Evaluate machine translation quality</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/evaluator')}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </button>
          </div>

          {/* Progress */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Sentence {currentSentenceIndex + 1} of {sentences.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentSentenceIndex + 1) / sentences.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${((currentSentenceIndex + 1) / sentences.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('Error') || message.includes('Please')
              ? 'bg-red-50 border border-red-200 text-red-700'
              : 'bg-green-50 border border-green-200 text-green-700'
          }`}>
            {message}
          </div>
        )}

        {/* Sentence Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Translation to Evaluate</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source Text ({currentSentence.source_language})
                </label>
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <p className="text-gray-900">{currentSentence.source_text}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Machine Translation ({currentSentence.target_language})
                </label>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-gray-900">{currentSentence.machine_translation}</p>
                </div>
              </div>

              {currentSentence.reference_translation && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reference Translation (Optional)
                  </label>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-gray-900">{currentSentence.reference_translation}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quality Assessment Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quality Assessment</h2>

            {/* Rating Scores */}
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <RatingButtons
                value={assessment.fluency_score}
                onChange={(value) => handleRatingChange('fluency_score', value)}
                label="Fluency Score"
                required
              />
              <RatingButtons
                value={assessment.adequacy_score}
                onChange={(value) => handleRatingChange('adequacy_score', value)}
                label="Adequacy Score"
                required
              />
              <RatingButtons
                value={assessment.overall_quality}
                onChange={(value) => handleRatingChange('overall_quality', value)}
                label="Overall Quality"
                required
              />
            </div>

            {/* Confidence Level */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confidence Level (1-5)
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => handleRatingChange('confidence_level', level)}
                    className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-sm font-medium transition-colors ${
                      assessment.confidence_level === level
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-300 text-gray-500 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>

            {/* Error Detection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Error Detection & Analysis
              </label>
              <textarea
                value={assessment.error_detection || ''}
                onChange={(e) => handleTextChange('error_detection', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Describe any errors you found in the translation (syntax, semantics, cultural issues, etc.)..."
              />
            </div>

            {/* Improvement Suggestions */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Improvement Suggestions
              </label>
              <textarea
                value={assessment.improvement_suggestions || ''}
                onChange={(e) => handleTextChange('improvement_suggestions', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Suggest specific improvements for the translation..."
              />
            </div>

            {/* Evaluation Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <div className="flex space-x-2">
                <textarea
                  value={assessment.evaluation_notes || ''}
                  onChange={(e) => handleTextChange('evaluation_notes', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Any additional observations or comments..."
                />
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    isRecording
                      ? 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Navigation and Submit */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div className="flex space-x-3">
                <button
                  onClick={handlePrevious}
                  disabled={currentSentenceIndex === 0}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentSentenceIndex === sentences.length - 1}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </button>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !assessment.fluency_score || !assessment.adequacy_score || !assessment.overall_quality}
                className="flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Submit Assessment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MTQualityAssessment;
