import React, { useState, useEffect, useCallback } from 'react';
import { mtQualityAPI } from '../../services/supabase-api';
import type { EvaluatorStats, Sentence, MTQualityAssessment } from '../../types';
import { 
  FileText, 
  Clock, 
  CheckCircle,
  CheckSquare,
  AlertCircle,
  Target,
  Brain,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

const EvaluatorDashboard: React.FC = () => {
  const [stats, setStats] = useState<EvaluatorStats | null>(null);
  const [pendingSentences, setPendingSentences] = useState<Sentence[]>([]);
  const [recentAssessments, setRecentAssessments] = useState<MTQualityAssessment[]>([]);
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
      const [statsResult, pendingResult, assessmentsResult] = await Promise.allSettled([
        mtQualityAPI.getEvaluatorStats(),
        mtQualityAPI.getPendingAssessments(0, 5),
        mtQualityAPI.getMyAssessments(0, 5)
      ]);

      // Handle stats data
      if (statsResult.status === 'fulfilled') {
        setStats(statsResult.value);
      } else {
        console.error('Error loading stats:', statsResult.reason);
      }

      // Handle pending sentences data
      if (pendingResult.status === 'fulfilled') {
        setPendingSentences(pendingResult.value);
      } else {
        console.error('Error loading pending sentences:', pendingResult.reason);
      }

      // Handle recent assessments data
      if (assessmentsResult.status === 'fulfilled') {
        setRecentAssessments(assessmentsResult.value);
      } else {
        console.error('Error loading recent assessments:', assessmentsResult.reason);
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

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getCompletionRate = (): number => {
    if (!stats || !stats.total_assessments || stats.total_assessments === 0) return 0;
    const rate = ((stats.completed_assessments || 0) / stats.total_assessments) * 100;
    return Math.round(rate);
  };

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
            {/* DistilBERT-powered machine translation quality assessment platform */}
            Machine translation quality assessment platform
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
                <p className="text-sm font-medium text-gray-600">Total Assessments</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.total_assessments || 0}</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats?.completed_assessments || 0}</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats?.pending_assessments || 0}</p>
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
                <p className="text-sm font-medium text-gray-600">Avg Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.average_time_per_assessment && stats.average_time_per_assessment > 0 
                    ? formatTime(Math.round(stats.average_time_per_assessment)) 
                    : '0m'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quality Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-6 sm:mb-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Assessment Progress</h2>
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Completion Rate</span>
                  <span className="text-sm font-medium text-blue-600">{getCompletionRate()}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-500 h-3 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${getCompletionRate()}%` }}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  {stats?.completed_assessments || 0} of {stats?.total_assessments || 0} assessments completed
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <h3 className="text-sm font-medium text-gray-700">Avg Quality Score</h3>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.average_overall_score && stats.average_overall_score > 0 
                      ? stats.average_overall_score.toFixed(1) 
                      : '0.0'}
                  </p>
                  <p className="text-sm text-gray-500">out of 5.0</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Brain className="h-5 w-5 text-purple-500" />
                    <h3 className="text-sm font-medium text-gray-700">AI Agreement</h3>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.human_agreement_rate && stats.human_agreement_rate > 0 
                      ? Math.round(stats.human_agreement_rate * 100) 
                      : 0}%
                  </p>
                  <p className="text-sm text-gray-500">human-AI agreement</p>
                </div>
              </div>

              {/* Quality Breakdown */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quality Breakdown</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Fluency</span>
                    <span className="font-medium">
                      {stats?.average_fluency_score && stats.average_fluency_score > 0 
                        ? stats.average_fluency_score.toFixed(1) 
                        : '0.0'}/5
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Adequacy</span>
                    <span className="font-medium">
                      {stats?.average_adequacy_score && stats.average_adequacy_score > 0 
                        ? stats.average_adequacy_score.toFixed(1) 
                        : '0.0'}/5
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Pending Sentences */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Pending Sentences</h2>
            <a 
              href="/mt-assess" 
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View all
            </a>
          </div>
          
          {pendingSentences.length > 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden divide-y divide-gray-200">
              {pendingSentences.map((sentence) => (
                <div key={sentence.id} className="p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {sentence.source_language} → {sentence.target_language}
                        </span>
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-1 mb-2">
                        {sentence.source_text}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-1">
                        <span className="font-medium">MT:</span> {sentence.machine_translation}
                      </p>
                    </div>
                    <a
                      href={`/mt-assess/${sentence.id}`}
                      className="ml-4 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-500 border border-blue-200 rounded-lg hover:bg-blue-50"
                    >
                      Assess
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No pending sentences for assessment</p>
              <p className="text-sm text-gray-400 mt-1">Check back later for new sentences to analyze</p>
            </div>
          )}
        </div>

        {/* Recent Assessments */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Assessments</h2>
            <a 
              href="/my-assessments" 
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View all
            </a>
          </div>
          
          {recentAssessments.length > 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden divide-y divide-gray-200">
              {recentAssessments.map((assessment) => (
                <div key={assessment.id} className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
                      {assessment.sentence.source_text}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      assessment.evaluation_status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {assessment.evaluation_status}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-xs text-gray-500">
                    <span>
                      Overall: {assessment.overall_quality_score ? assessment.overall_quality_score.toFixed(1) : 'N/A'}/5
                    </span>
                    <span>
                      Fluency: {assessment.fluency_score ? assessment.fluency_score.toFixed(1) : 'N/A'}/5
                    </span>
                    <span>
                      Adequacy: {assessment.adequacy_score ? assessment.adequacy_score.toFixed(1) : 'N/A'}/5
                    </span>
                    <span>
                      Assessed: {new Date(assessment.created_at).toLocaleDateString()}
                    </span>
                    {assessment.time_spent_seconds && assessment.time_spent_seconds > 0 && (
                      <span>
                        Time: {formatTime(assessment.time_spent_seconds)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No assessments completed yet</p>
              <p className="text-sm text-gray-400 mt-1">Start assessing sentences to see your history here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EvaluatorDashboard;
