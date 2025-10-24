import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { logger } from '../../utils/logger';
import { modelPredictionAPI } from '../../services/supabase-api';
import type { ModelPrediction, ModelPredictionReviewCreate } from '../../types';
import { 
  CheckCircle, 
  XCircle, 
  Edit3, 
  Brain, 
  AlertCircle, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  Target,
  BarChart3
} from 'lucide-react';

const ModelPredictionReview: React.FC = () => {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState<ModelPrediction[]>([]);
  const [currentPredictionIndex, setCurrentPredictionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [startTime] = useState(new Date());

  const [review, setReview] = useState<ModelPredictionReviewCreate>({
    prediction_id: 0,
    review_status: 'approved',
    corrected_prediction: {},
    review_notes: '',
    confidence_assessment: 0,
    time_spent_seconds: 0,
  });

  const currentPrediction = predictions[currentPredictionIndex];

  const loadPredictions = useCallback(async () => {
    setIsLoading(true);
    try {
      const predictionsData = await modelPredictionAPI.getPredictionsForReview(20, 0);
      setPredictions(predictionsData);
      if (predictionsData.length > 0) {
        setReview(prev => ({ ...prev, prediction_id: predictionsData[0].id }));
      }
    } catch (error) {
      logger.apiError('loadPredictions', error as Error, {
        component: 'ModelPredictionReview',
        metadata: { userId: user?.id }
      });
      setMessage('Error loading predictions');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadPredictions();
  }, [loadPredictions]);

  const handleReviewStatusChange = (status: 'approved' | 'revised' | 'rejected') => {
    setReview(prev => ({ ...prev, review_status: status }));
  };

  const handleNotesChange = (notes: string) => {
    setReview(prev => ({ ...prev, review_notes: notes }));
  };

  const handleConfidenceAssessmentChange = (confidence: number) => {
    setReview(prev => ({ ...prev, confidence_assessment: confidence }));
  };

  const handleCorrectedPredictionChange = (field: string, value: unknown) => {
    setReview(prev => ({
      ...prev,
      corrected_prediction: {
        ...prev.corrected_prediction,
        [field]: value
      }
    }));
  };

  const handleSubmit = async () => {
    if (!currentPrediction) return;

    setIsSubmitting(true);
    try {
      const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
      const reviewData = {
        ...review,
        prediction_id: currentPrediction.id,
        time_spent_seconds: timeSpent
      };

      await modelPredictionAPI.createReview(reviewData);

      setMessage('Review submitted successfully!');

      // Move to next prediction or show completion message
      if (currentPredictionIndex < predictions.length - 1) {
        setTimeout(() => {
          handleNext();
          setMessage('');
        }, 1500);
      } else {
        setMessage('All predictions reviewed!');
      }
    } catch (error) {
      logger.apiError('submitReview', error as Error, {
        component: 'ModelPredictionReview',
        metadata: { review }
      });
      setMessage('Error submitting review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentPredictionIndex < predictions.length - 1) {
      const nextIndex = currentPredictionIndex + 1;
      setCurrentPredictionIndex(nextIndex);
      setReview(prev => ({ 
        ...prev, 
        prediction_id: predictions[nextIndex].id,
        review_status: 'approved',
        corrected_prediction: {},
        review_notes: '',
        confidence_assessment: 0
      }));
    }
  };

  const handlePrevious = () => {
    if (currentPredictionIndex > 0) {
      const prevIndex = currentPredictionIndex - 1;
      setCurrentPredictionIndex(prevIndex);
      setReview(prev => ({ 
        ...prev, 
        prediction_id: predictions[prevIndex].id,
        review_status: 'approved',
        corrected_prediction: {},
        review_notes: '',
        confidence_assessment: 0
      }));
    }
  };

  const renderPredictionData = (data: Record<string, unknown>) => {
    return Object.entries(data).map(([key, value]) => (
      <div key={key} className="mb-2">
        <span className="font-medium text-gray-700">{key}:</span>
        <span className="ml-2 text-gray-900">
          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
        </span>
      </div>
    ));
  };

  const renderCorrectedPredictionEditor = () => {
    if (review.review_status !== 'revised' || !currentPrediction) return null;

    return (
      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-medium text-yellow-900 mb-3">Corrected Prediction</h4>
        <div className="space-y-3">
          {Object.entries(currentPrediction.prediction_data).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {key}
              </label>
              <input
                type="text"
                value={String(review.corrected_prediction?.[key] || value)}
                onChange={(e) => handleCorrectedPredictionChange(key, e.target.value)}
                className="input-field"
                placeholder={`Corrected ${key}`}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading predictions...</p>
        </div>
      </div>
    );
  }

  if (predictions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Predictions to Review</h2>
          <p className="text-gray-600">There are currently no model predictions pending review.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Model Prediction Review</h1>
              <p className="mt-2 text-gray-600">
                Review and evaluate model predictions for accuracy and quality
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {currentPredictionIndex + 1} of {predictions.length}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handlePrevious}
                  disabled={currentPredictionIndex === 0}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentPredictionIndex === predictions.length - 1}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentPredictionIndex + 1) / predictions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('Error') ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
          }`}>
            <div className="flex">
              {message.includes('Error') ? (
                <AlertCircle className="h-5 w-5 text-red-400" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-400" />
              )}
              <div className="ml-3">
                <p className={`text-sm ${
                  message.includes('Error') ? 'text-red-800' : 'text-green-800'
                }`}>
                  {message}
                </p>
              </div>
            </div>
          </div>
        )}

        {currentPrediction && (
          <div className="space-y-6">
            {/* Source Data */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="h-5 w-5 mr-2 text-blue-600" />
                Source Data
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-700">Type:</span>
                  <span className="ml-2 text-gray-900 capitalize">{currentPrediction.source_data.data_type}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Content:</span>
                  <div className="mt-1 p-3 bg-gray-50 rounded border">
                    <p className="text-gray-900">{currentPrediction.source_data.content}</p>
                  </div>
                </div>
                {currentPrediction.source_data.metadata && Object.keys(currentPrediction.source_data.metadata).length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700">Metadata:</span>
                    <div className="mt-1 p-3 bg-gray-50 rounded border">
                      {renderPredictionData(currentPrediction.source_data.metadata)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Model Prediction */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Brain className="h-5 w-5 mr-2 text-purple-600" />
                Model Prediction
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="font-medium text-gray-700">Model:</span>
                    <span className="ml-2 text-gray-900">{currentPrediction.model_name}</span>
                  </div>
                  {currentPrediction.model_version && (
                    <div>
                      <span className="font-medium text-gray-700">Version:</span>
                      <span className="ml-2 text-gray-900">{currentPrediction.model_version}</span>
                    </div>
                  )}
                  {currentPrediction.confidence_score && (
                    <div>
                      <span className="font-medium text-gray-700">Confidence:</span>
                      <span className="ml-2 text-gray-900">
                        {(currentPrediction.confidence_score * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Prediction Data:</span>
                  <div className="mt-1 p-3 bg-gray-50 rounded border">
                    {renderPredictionData(currentPrediction.prediction_data)}
                  </div>
                </div>
              </div>
            </div>

            {/* Review Interface */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
                Review Assessment
              </h3>

              {/* Review Status */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Review Status *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => handleReviewStatusChange('approved')}
                    className={`p-4 border-2 rounded-lg text-center transition-all ${
                      review.review_status === 'approved'
                        ? 'border-green-500 bg-green-50 text-green-900'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                    <div className="font-medium">Approve</div>
                    <div className="text-sm text-gray-500">Prediction is correct</div>
                  </button>

                  <button
                    onClick={() => handleReviewStatusChange('revised')}
                    className={`p-4 border-2 rounded-lg text-center transition-all ${
                      review.review_status === 'revised'
                        ? 'border-yellow-500 bg-yellow-50 text-yellow-900'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Edit3 className="h-8 w-8 mx-auto mb-2" />
                    <div className="font-medium">Revise</div>
                    <div className="text-sm text-gray-500">Needs correction</div>
                  </button>

                  <button
                    onClick={() => handleReviewStatusChange('rejected')}
                    className={`p-4 border-2 rounded-lg text-center transition-all ${
                      review.review_status === 'rejected'
                        ? 'border-red-500 bg-red-50 text-red-900'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <XCircle className="h-8 w-8 mx-auto mb-2" />
                    <div className="font-medium">Reject</div>
                    <div className="text-sm text-gray-500">Prediction is wrong</div>
                  </button>
                </div>
              </div>

              {/* Corrected Prediction Editor */}
              {renderCorrectedPredictionEditor()}

              {/* Review Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Notes
                </label>
                <textarea
                  value={review.review_notes}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  className="textarea-field"
                  rows={4}
                  placeholder="Add your review notes, observations, or feedback..."
                />
              </div>

              {/* Confidence Assessment */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Assessment of Model Confidence (0-100%)
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={review.confidence_assessment}
                    onChange={(e) => handleConfidenceAssessmentChange(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium text-gray-700 w-16">
                    {review.confidence_assessment}%
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  How confident do you think the model should be about this prediction?
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="btn-primary flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Review
                      <CheckCircle className="ml-2 h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelPredictionReview;
