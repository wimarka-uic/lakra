import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { annotationRevisionAPI } from '../../services/supabase-api';
import type { AnnotationWithRevision } from '../../types';
import { 
  Clock, 
  CheckCircle,
  CheckSquare,
  AlertCircle,
  Target,
  Brain,
  TrendingUp,
  RefreshCw,
  Eye,
  BarChart3
} from 'lucide-react';

const EvaluatorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [pendingRevisions, setPendingRevisions] = useState<AnnotationWithRevision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  // Cache data for 5 minutes to prevent unnecessary re-fetching
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

  const loadDashboardData = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    
    // Check if we should use cached data
    if (!forceRefresh && lastFetchTime > 0 && (now - lastFetchTime) < CACHE_DURATION) {
      return;
    }

    setIsLoading(true);
    try {
      // Use Promise.allSettled to handle partial failures gracefully
      const [revisionsResult] = await Promise.allSettled([
        annotationRevisionAPI.getPendingRevisions(0, 5)
      ]);

      // Handle pending revisions data
      if (revisionsResult.status === 'fulfilled') {
        setPendingRevisions(revisionsResult.value);
      } else {
        console.error('Error loading pending revisions:', revisionsResult.reason);
      }

      setLastFetchTime(now);
    } catch (error) {
      console.error('Error loading evaluator dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [lastFetchTime, CACHE_DURATION]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);



  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
          {/* Header Skeleton */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <div className="h-6 sm:h-8 w-6 sm:w-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded-lg w-20 animate-pulse"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-80 animate-pulse"></div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="p-3 bg-gray-200 rounded-lg animate-pulse">
                      <div className="h-6 w-6 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
        {/* Mobile Page Indicator */}
        <div className="md:hidden mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <CheckSquare className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Evaluator Dashboard</span>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <Brain className="h-6 sm:h-8 w-6 sm:w-8 text-blue-600" />
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Machine Translation Evaluator</h1>
            </div>
            <button
              onClick={() => loadDashboardData(true)}
              disabled={isLoading}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          <p className="text-sm sm:text-base text-gray-600">
            Annotation evaluation and review platform
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Evaluations</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Evaluation Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-6 sm:mb-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Evaluation Progress</h2>
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Completion Rate</span>
                  <span className="text-sm font-medium text-blue-600">0%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-500 h-3 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: '0%' }}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  0 of 0 evaluations completed
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <h3 className="text-sm font-medium text-gray-700">Avg Rating</h3>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">0.0</p>
                  <p className="text-sm text-gray-500">out of 5.0</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="h-5 w-5 text-purple-500" />
                    <h3 className="text-sm font-medium text-gray-700">Total Time</h3>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">0m</p>
                  <p className="text-sm text-gray-500">spent evaluating</p>
                </div>
              </div>
            </div>
          </div>

        </div>


        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/mt-quality-assessment')}
              className="flex items-center p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">MT Quality Assessment</h3>
                <p className="text-sm text-gray-500">Evaluate machine translation quality</p>
              </div>
            </button>
            
        <button
          onClick={() => navigate('/my-evaluations')}
          className="flex items-center p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <div className="flex-shrink-0">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-900">My Evaluations</h3>
            <p className="text-sm text-gray-500">View your evaluation history</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/model-prediction-review')}
          className="flex items-center p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <div className="flex-shrink-0">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Brain className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-900">Model Prediction Review</h3>
            <p className="text-sm text-gray-500">Review AI model predictions</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/my-model-reviews')}
          className="flex items-center p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <div className="flex-shrink-0">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-900">My Model Reviews</h3>
            <p className="text-sm text-gray-500">View your model review history</p>
          </div>
        </button>
          </div>
        </div>

        {/* Pending Annotation Revisions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Pending Annotation Reviews</h2>
            <a 
              href="/my-evaluations" 
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View all
            </a>
          </div>
          
          {pendingRevisions.length > 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden divide-y divide-gray-200">
              {pendingRevisions.map((annotation) => (
                <div key={annotation.id} className="p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Annotation Review
                        </span>
                        <span className="text-xs text-gray-500">
                          by {annotation.annotator?.username || 'Unknown'}
                        </span>
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-1 mb-2">
                        {annotation.sentence.source_text}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-1 mb-2">
                        <span className="font-medium">MT:</span> {annotation.sentence.machine_translation}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Fluency: {annotation.fluency_score || 'N/A'}/5</span>
                        <span>Adequacy: {annotation.adequacy_score || 'N/A'}/5</span>
                        <span>Overall: {annotation.overall_quality || 'N/A'}/5</span>
                      </div>
                    </div>
                    <div className="ml-4 flex space-x-2">
                      <button
                        onClick={() => navigate(`/review-annotation/${annotation.id}`)}
                        className="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-500 border border-blue-200 rounded-lg hover:bg-blue-50 flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No pending annotation reviews</p>
              <p className="text-sm text-gray-400 mt-1">All annotations have been reviewed</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default EvaluatorDashboard;
