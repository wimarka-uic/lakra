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
  TrendingUp,
  Home,
  BarChart3,
  List,
  Settings
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
          correction_notes: 'Use "How\'s work going?"',
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
      <div className="min-h-screen bg-gray-100 flex justify-center">
        <div className="max-w-6xl w-full py-8 px-4">
          <div className="animate-pulse space-y-8">
            <div className="h-10 bg-gray-300 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-36 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li className="flex items-center">
              <Home className="h-4 w-4 mr-1" />
              <span>Home</span>
            </li>
            <li className="flex items-center">
              <span className="mx-2">/</span>
              <span className="text-gray-900 font-medium">Evaluator Dashboard</span>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-600 rounded-lg">
                <CheckSquare className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Evaluator Dashboard</h1>
                <p className="text-lg text-gray-600 mt-1">
                  Welcome back! Review and evaluate translation quality.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Target className="h-7 w-7 text-blue-700" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-base font-medium text-gray-600">Total Assessments</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.total_assessments || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="h-7 w-7 text-green-700" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-base font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.completed_assessments || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <AlertCircle className="h-7 w-7 text-orange-700" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-base font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.pending_assessments || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Clock className="h-7 w-7 text-purple-700" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-base font-medium text-gray-600">Avg Time</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.average_time_per_assessment ? formatTime(Math.round(stats.average_time_per_assessment)) : '0m'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Assessment Progress */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Assessment Progress</h2>
              </div>
              
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-base font-medium text-gray-700">Completion Rate</span>
                  <span className="text-lg font-bold text-blue-600">{getCompletionRate()}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-blue-600 h-4 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${getCompletionRate()}%` }}
                  />
                </div>
                <p className="mt-3 text-base text-gray-600">
                  {stats?.completed_assessments || 0} of {stats?.total_assessments || 0} assessments completed
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <h3 className="text-base font-medium text-gray-700">Average Overall Score</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats?.average_overall_score ? stats.average_overall_score.toFixed(1) : '0.0'}
                  </p>
                  <p className="text-base text-gray-500">out of 5.0</p>
                </div>

                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <Target className="h-5 w-5 text-blue-600" />
                    <h3 className="text-base font-medium text-gray-700">Average Fluency</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats?.average_fluency_score ? stats.average_fluency_score.toFixed(1) : '0.0'}
                  </p>
                  <p className="text-base text-gray-500">out of 5.0</p>
                </div>
              </div>

              {/* Quality Breakdown */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Quality Breakdown</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-base text-gray-700">Fluency</span>
                    <span className="text-lg font-bold text-blue-700">
                      {stats?.average_fluency_score ? stats.average_fluency_score.toFixed(1) : '0.0'}/5
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-base text-gray-700">Adequacy</span>
                    <span className="text-lg font-bold text-green-700">
                      {stats?.average_adequacy_score ? stats.average_adequacy_score.toFixed(1) : '0.0'}/5
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <List className="h-6 w-6 text-green-600" />
              <h3 className="text-2xl font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="space-y-4">
              <a
                href={pendingSentences[0] ? `/evaluate/${pendingSentences[0].id}` : '/evaluator'}
                className="flex items-center p-5 border-2 border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all min-h-[80px] group"
              >
                <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <Zap className="h-6 w-6 text-blue-700" />
                </div>
                <div className="ml-4">
                  <p className="text-lg font-semibold text-gray-900">Start Evaluation</p>
                  <p className="text-base text-gray-600">Open the next sentence pair to evaluate</p>
                </div>
              </a>

              <a
                href="/my-evaluations"
                className="flex items-center p-5 border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all min-h-[80px] group"
              >
                <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                  <FileText className="h-6 w-6 text-gray-700" />
                </div>
                <div className="ml-4">
                  <p className="text-lg font-semibold text-gray-900">My Evaluations</p>
                  <p className="text-base text-gray-600">View completed evaluations</p>
                </div>
              </a>

              <a
                href="/settings"
                className="flex items-center p-5 border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all min-h-[80px] group"
              >
                <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                  <Settings className="h-6 w-6 text-gray-700" />
                </div>
                <div className="ml-4">
                  <p className="text-lg font-semibold text-gray-900">Settings</p>
                  <p className="text-base text-gray-600">Manage your preferences</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Pending Sentences */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-6 w-6 text-orange-600" />
              <h2 className="text-2xl font-semibold text-gray-900">Pending Sentences</h2>
            </div>
            <a 
              href={pendingSentences[0] ? `/evaluate/${pendingSentences[0].id}` : '/evaluator'} 
              className="text-base font-medium text-blue-600 hover:text-blue-500 underline"
            >
              View all
            </a>
          </div>
          
          {pendingSentences.length > 0 ? (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div className="divide-y divide-gray-200">
                {pendingSentences.map((sentence) => (
                  <div key={sentence.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {sentence.source_language} → {sentence.target_language}
                          </span>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {sentence.source_text}
                        </h3>
                        <p className="text-base text-gray-600">
                          <span className="font-medium">Machine Translation:</span> {sentence.machine_translation}
                        </p>
                      </div>
                      <a
                        href={`/evaluate/${sentence.id}`}
                        className="ml-6 px-6 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 border border-blue-600 rounded-lg transition-colors"
                      >
                        Evaluate
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
              <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600 mb-2">No pending sentences for assessment</p>
              <p className="text-base text-gray-500">Check back later for new sentences to analyze</p>
            </div>
          )}
        </div>

        {/* Recent Assessments */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-6 w-6 text-green-600" />
              <h2 className="text-2xl font-semibold text-gray-900">Recent Assessments</h2>
            </div>
            <a 
              href="/my-assessments" 
              className="text-base font-medium text-blue-600 hover:text-blue-500 underline"
            >
              View all
            </a>
          </div>
          
          {recentAssessments.length > 0 ? (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div className="divide-y divide-gray-200">
                {recentAssessments.map((assessment) => (
                  <div key={assessment.id} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {assessment.sentence.source_text}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        assessment.evaluation_status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {assessment.evaluation_status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-base text-gray-600">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Overall:</span>
                        <span className="text-lg font-bold text-gray-900">{assessment.overall_quality_score}/5</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Fluency:</span>
                        <span className="text-lg font-bold text-gray-900">{assessment.fluency_score}/5</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Adequacy:</span>
                        <span className="text-lg font-bold text-gray-900">{assessment.adequacy_score}/5</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Date:</span>
                        <span>{new Date(assessment.created_at).toLocaleDateString()}</span>
                      </div>
                      {assessment.time_spent_seconds && (
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Time:</span>
                          <span>{formatTime(assessment.time_spent_seconds)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600 mb-2">No assessments completed yet</p>
              <p className="text-base text-gray-500">Start assessing sentences to see your history here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EvaluatorDashboard;
