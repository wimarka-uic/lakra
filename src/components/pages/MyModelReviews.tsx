import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { logger } from '../../utils/logger';
import { modelPredictionAPI } from '../../services/supabase-api';
import type { ModelPredictionReview } from '../../types';
import { 
  CheckCircle, 
  XCircle, 
  Edit3, 
  Clock, 
  Brain, 
  AlertCircle, 
  Loader2,
  BarChart3,
  Target,
  Eye
} from 'lucide-react';

const MyModelReviews: React.FC = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ModelPredictionReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedReview, setExpandedReview] = useState<number | null>(null);

  const loadReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const reviewsData = await modelPredictionAPI.getMyReviews(20, (currentPage - 1) * 20);
      setReviews(reviewsData);
      // Note: In a real implementation, you'd get total count from the API
      setTotalPages(Math.ceil(reviewsData.length / 20));
    } catch (error) {
      logger.apiError('loadReviews', error as Error, {
        component: 'MyModelReviews',
        metadata: { userId: user?.id }
      });
      setMessage('Error loading reviews');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, currentPage]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'revised':
        return <Edit3 className="h-5 w-5 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'revised':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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

  const toggleExpanded = (reviewId: number) => {
    setExpandedReview(expandedReview === reviewId ? null : reviewId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Model Reviews</h1>
          <p className="mt-2 text-gray-600">
            View and manage your model prediction reviews
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
            <p className="text-gray-600">You have not reviewed any model predictions yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusIcon(review.review_status)}
                        <h3 className="text-lg font-semibold text-gray-900">
                          Model: {(review as any).model_prediction?.model_name || 'Unknown'}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(review.review_status)}`}>
                          {review.review_status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>Reviewed {formatDate(review.created_at)}</span>
                        </div>
                        {review.time_spent_seconds && (
                          <div className="flex items-center">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            <span>Time: {formatTime(review.time_spent_seconds)}</span>
                          </div>
                        )}
                        {review.confidence_assessment && (
                          <div className="flex items-center">
                            <Target className="h-4 w-4 mr-2" />
                            <span>Confidence: {review.confidence_assessment}%</span>
                          </div>
                        )}
                      </div>

                      <div className="text-sm text-gray-700">
                        <span className="font-medium">Source Data:</span>
                        <span className="ml-2">
                          {(review as any).model_prediction?.source_data?.content?.substring(0, 100)}
                          {(review as any).model_prediction?.source_data?.content?.length > 100 ? '...' : ''}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleExpanded(review.id)}
                      className="ml-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedReview === review.id && (
                  <div className="border-t border-gray-200 p-6 bg-gray-50">
                    <div className="space-y-6">
                      {/* Source Data */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Source Data</h4>
                        <div className="bg-white p-4 rounded border">
                          <div className="space-y-2">
                            <div>
                              <span className="font-medium text-gray-700">Type:</span>
                              <span className="ml-2 text-gray-900 capitalize">
                                {(review as any).model_prediction?.source_data?.data_type}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Content:</span>
                              <div className="mt-1 p-3 bg-gray-50 rounded">
                                <p className="text-gray-900">
                                  {(review as any).model_prediction?.source_data?.content}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Model Prediction */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Model Prediction</h4>
                        <div className="bg-white p-4 rounded border">
                          <div className="space-y-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <span className="font-medium text-gray-700">Model:</span>
                                <span className="ml-2 text-gray-900">
                                  {(review as any).model_prediction?.model_name}
                                </span>
                              </div>
                              {(review as any).model_prediction?.confidence_score && (
                                <div>
                                  <span className="font-medium text-gray-700">Confidence:</span>
                                  <span className="ml-2 text-gray-900">
                                    {((review as any).model_prediction?.confidence_score * 100).toFixed(1)}%
                                  </span>
                                </div>
                              )}
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Prediction Data:</span>
                              <div className="mt-1 p-3 bg-gray-50 rounded">
                                {renderPredictionData((review as any).model_prediction?.prediction_data || {})}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Review Details */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Your Review</h4>
                        <div className="bg-white p-4 rounded border">
                          <div className="space-y-3">
                            <div>
                              <span className="font-medium text-gray-700">Status:</span>
                              <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(review.review_status)}`}>
                                {review.review_status}
                              </span>
                            </div>
                            
                            {review.corrected_prediction && Object.keys(review.corrected_prediction).length > 0 && (
                              <div>
                                <span className="font-medium text-gray-700">Corrected Prediction:</span>
                                <div className="mt-1 p-3 bg-yellow-50 rounded border">
                                  {renderPredictionData(review.corrected_prediction)}
                                </div>
                              </div>
                            )}

                            {review.review_notes && (
                              <div>
                                <span className="font-medium text-gray-700">Review Notes:</span>
                                <div className="mt-1 p-3 bg-gray-50 rounded">
                                  <p className="text-gray-900">{review.review_notes}</p>
                                </div>
                              </div>
                            )}

                            {review.confidence_assessment && (
                              <div>
                                <span className="font-medium text-gray-700">Your Confidence Assessment:</span>
                                <span className="ml-2 text-gray-900">{review.confidence_assessment}%</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <span className="px-3 py-2 text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyModelReviews;






