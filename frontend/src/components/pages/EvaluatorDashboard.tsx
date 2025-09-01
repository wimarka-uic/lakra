import React, { useState, useEffect } from 'react';
import type { EvaluatorStats, Sentence, MTQualityAssessment } from '../../types';
import { 
  FileText, 
  Clock, 
  CheckCircle,
  CheckSquare,
  AlertCircle,
  Target,
  Zap,
  TrendingUp
} from 'lucide-react';

const EvaluatorDashboard: React.FC = () => {
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
      // TODO: Replace dummy data with real API once backend wiring is ready.
      const dummyStats: EvaluatorStats = {
        total_evaluations: 24,
        completed_evaluations: 20,
        pending_evaluations: 4,
        average_rating: 4.1,
        total_time_spent: 36000,
        evaluations_today: 2,
        weekly_progress: [2, 1, 3, 0, 4, 6, 4],
        average_overall_score: 4.2,
        average_fluency_score: 4.3,
        average_adequacy_score: 4.1,
      };

      const dummyPending: Sentence[] = [
        {
          id: 1,
          source_text: 'Kumusta ka na? Kamusta ang trabaho mo?',
          machine_translation: 'How are you? How is your work?',
          source_language: 'PHL',
          target_language: 'EN',
          created_at: new Date().toISOString(),
          is_active: true,
        },
        {
          id: 2,
          source_text: 'Nagpapatuloy ang operasyon ng klinika tuwing Lunes.',
          machine_translation: 'The clinic continues its operation every Monday.',
          source_language: 'PHL',
          target_language: 'EN',
          created_at: new Date().toISOString(),
          is_active: true,
        },
      ];

      const dummyRecent: MTQualityAssessment[] = [
        {
          id: 101,
          sentence_id: 1,
          evaluator_id: 1,
          overall_quality_score: 4,
          fluency_score: 4,
          adequacy_score: 4,
          human_feedback: 'Minor wording tweak needed.',
          correction_notes: 'Use "How’s work going?"',
          time_spent_seconds: 120,
          assessment_status: 'completed',
          evaluation_status: 'completed',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          sentence: {
            id: 1,
            source_text: 'Kumusta ka na? Kamusta ang trabaho mo?',
            machine_translation: 'How are you? How is your work?',
            source_language: 'PHL',
            target_language: 'EN',
            created_at: new Date().toISOString(),
            is_active: true,
          },
          evaluator: {
            id: 1,
            email: 'demo@example.com',
            username: 'demo',
            first_name: 'Demo',
            last_name: 'User',
            is_active: true,
            is_admin: false,
            is_evaluator: true,
            guidelines_seen: true,
            preferred_language: 'PHL',
            languages: ['PHL', 'EN'],
            created_at: new Date().toISOString(),
          },
        },
      ];

      setStats(dummyStats);
      setPendingSentences(dummyPending);
      setRecentAssessments(dummyRecent);
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
            <CheckSquare className="h-6 sm:h-8 w-6 sm:w-8 text-blue-600" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Evaluator Dashboard</h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600">
            Review sentence pairs, provide scores (fluency, adequacy, overall), and submit feedback.
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
                    <h3 className="text-sm font-medium text-gray-700">Avg Overall Score</h3>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.average_overall_score ? stats.average_overall_score.toFixed(1) : '0.0'}
                  </p>
                  <p className="text-sm text-gray-500">out of 5.0</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="h-5 w-5 text-blue-500" />
                    <h3 className="text-sm font-medium text-gray-700">Average Fluency</h3>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.average_fluency_score ? stats.average_fluency_score.toFixed(1) : '0.0'}
                  </p>
                  <p className="text-sm text-gray-500">out of 5.0</p>
                </div>
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
                href={pendingSentences[0] ? `/evaluate/${pendingSentences[0].id}` : '/evaluator'}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all min-h-[60px] hover:scale-105 active:scale-95"
              >
                <Zap className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Start Evaluation</p>
                  <p className="text-sm text-gray-500">Open the next sentence pair to evaluate</p>
                </div>
              </a>

              <a
                href="/my-evaluations"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all min-h-[60px] hover:scale-105 active:scale-95"
              >
                <FileText className="h-5 w-5 text-green-500 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">My Evaluations</p>
                  <p className="text-sm text-gray-500">View completed evaluations</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Pending Sentences */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Pending Sentences</h2>
            <a 
              href={pendingSentences[0] ? `/evaluate/${pendingSentences[0].id}` : '/evaluator'} 
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
                      href={`/evaluate/${sentence.id}`}
                      className="ml-4 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-500 border border-blue-200 rounded-lg hover:bg-blue-50"
                    >
                      Evaluate
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
