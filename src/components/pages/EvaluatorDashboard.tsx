import React, { useState, useEffect } from 'react';
import { mtQualityAPI } from '../../services/supabase-api';
import type { EvaluatorStats, Sentence, MTQualityAssessment } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FileText, 
  Clock, 
  CheckCircle,
  CheckSquare,
  AlertCircle,
  Target,
  Brain,
  Zap,
  TrendingUp
} from 'lucide-react';

const EvaluatorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<EvaluatorStats | null>(null);
  const [pendingSentences, setPendingSentences] = useState<Sentence[]>([]);
  const [recentAssessments, setRecentAssessments] = useState<MTQualityAssessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsData, pendingData, assessmentsData] = await Promise.all([
        mtQualityAPI.getEvaluatorStats(),
        mtQualityAPI.getPendingAssessments(0, 5),
        mtQualityAPI.getMyAssessments(0, 5)
      ]);

      setStats(statsData);
      setPendingSentences(pendingData);
      setRecentAssessments(assessmentsData);
    } catch (error) {
      console.error('Error loading evaluator dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
    return Math.round(((stats.completed_assessments || 0) / stats.total_assessments) * 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center">
        <div className="max-w-6xl w-full py-8 px-4">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
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
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
            <Brain className="h-6 sm:h-8 w-6 sm:w-8 text-blue-600" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Machine Translation Evaluator</h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600">
            Machine translation quality assessment platform
          </p>
          {user?.is_evaluator && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-blue-900"><span className="font-medium">Assigned language:</span> {user.preferred_language || '—'}</p>
                  <p className="mt-2 text-sm text-blue-900">
                    As an evaluator, review annotators' work and WiMarka outputs. Tasks:
                  </p>
                  <ul className="mt-1 list-disc list-inside text-sm text-blue-900 space-y-1">
                    <li><span className="font-medium">Annotation Checking</span>: verify correctness, correct if needed.</li>
                    <li><span className="font-medium">Annotation Correction</span>: click a highlighted annotation to revise.
                    </li>
                    <li><span className="font-medium">Evaluation Review</span>: assess source→target, model errors, scores, explanations, and corrected sentence per MQM.</li>
                  </ul>
                  <p className="mt-2 text-xs text-blue-800">
                    Note: Your queue is filtered to your chosen language from registration.
                  </p>
                </div>
              </div>
            </div>
          )}
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
                  {stats?.average_time_per_assessment ? formatTime(Math.round(stats.average_time_per_assessment)) : '0m'}
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
                    {stats?.average_overall_score ? stats.average_overall_score.toFixed(1) : '0.0'}
                  </p>
                  <p className="text-sm text-gray-500">out of 5.0</p>
                </div>
                {/* Secondary metric intentionally simplified for clarity */}
              </div>

              {/* Quality Breakdown */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quality Breakdown</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Fluency</span>
                    <span className="font-medium">
                      {stats?.average_fluency_score ? stats.average_fluency_score.toFixed(1) : '0.0'}/5
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Adequacy</span>
                    <span className="font-medium">
                      {stats?.average_adequacy_score ? stats.average_adequacy_score.toFixed(1) : '0.0'}/5
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <a
                href="/mt-assess"
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors min-h-[60px]"
              >
                <span className="flex-shrink-0 inline-flex items-center justify-center h-8 w-8 md:h-9 md:w-9 rounded-md bg-blue-50 text-blue-600">
                  <Zap className="h-5 w-5" />
                </span>
                <div className="leading-tight">
                  <p className="font-medium text-gray-900">Start MT Assessment</p>
                  <p className="text-sm text-gray-500">Assess translation quality</p>
                </div>
              </a>
              
              <a
                href="/my-assessments"
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors min-h-[60px]"
              >
                <span className="flex-shrink-0 inline-flex items-center justify-center h-8 w-8 md:h-9 md:w-9 rounded-md bg-green-50 text-green-600">
                  <FileText className="h-5 w-5" />
                </span>
                <div className="leading-tight">
                  <p className="font-medium text-gray-900">My Assessments</p>
                  <p className="text-sm text-gray-500">View completed MT assessments</p>
                </div>
              </a>
              {/* Removed AI-specific error detection for simplified UX */}
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
                      Overall: {assessment.overall_quality_score}/5
                    </span>
                    <span>
                      Fluency: {assessment.fluency_score}/5
                    </span>
                    <span>
                      Adequacy: {assessment.adequacy_score}/5
                    </span>
                    <span>
                      Assessed: {new Date(assessment.created_at).toLocaleDateString()}
                    </span>
                    {assessment.time_spent_seconds && (
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
