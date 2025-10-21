import React, { useState, useEffect } from 'react';
import { mtQualityAPI } from '../../services/supabase-api';
import type { MTQualityAssessment } from '../../types';
import { 
  Star, 
  Calendar, 
  FileText, 
  Search, 
  Clock,
  Target,
  Brain,
  CheckCircle,
  AlertCircle,
  Filter
} from 'lucide-react';

const MyMTAssessments: React.FC = () => {
  const [assessments, setAssessments] = useState<MTQualityAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [scoreFilter, setScoreFilter] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const data = await mtQualityAPI.getMyAssessments(0, 100);
      setAssessments(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching MT assessments:', error);
      setError('Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = assessment.sentence.source_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assessment.sentence.target_language?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assessment.sentence.source_language?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesScore = scoreFilter === null || 
      (assessment.overall_quality_score && Math.floor(assessment.overall_quality_score) === scoreFilter);
    
    const matchesStatus = statusFilter === 'all' || assessment.evaluation_status === statusFilter;
    
    return matchesSearch && matchesScore && matchesStatus;
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
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

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-600';
    if (score >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center">
        <div className="max-w-6xl w-full py-8 px-4">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
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
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Mobile Page Indicator */}
        <div className="md:hidden mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">My MT Assessments</span>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
            <Brain className="h-6 sm:h-8 w-6 sm:w-8 text-blue-600" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My MT Assessments</h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600">
            View and manage your completed machine translation quality assessments
          </p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Assessments</p>
                <p className="text-2xl font-bold text-gray-900">{assessments.length}</p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {assessments.filter(a => a.evaluation_status === 'completed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {assessments.length > 0 
                    ? (assessments.reduce((sum, a) => sum + (a.overall_quality_score || 0), 0) / assessments.length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search assessments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Score Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={scoreFilter || ''}
                onChange={(e) => setScoreFilter(e.target.value ? parseInt(e.target.value) : null)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Scores</option>
                <option value="5">5 Stars</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
                <option value="1">1+ Stars</option>
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
            </select>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Assessments List */}
        {filteredAssessments.length > 0 ? (
          <div className="space-y-4">
            {filteredAssessments.map((assessment) => (
              <div key={assessment.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                  {/* Main Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {assessment.sentence.source_language} → {assessment.sentence.target_language}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assessment.evaluation_status || 'pending')}`}>
                            {assessment.evaluation_status}
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2">
                          {assessment.sentence.source_text}
                        </h3>
                        
                        <p className="text-sm text-gray-600 mb-3 line-clamp-1">
                          <span className="font-medium">MT:</span> {assessment.sentence.machine_translation}
                        </p>
                      </div>
                    </div>

                    {/* Scores */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm text-gray-600">Overall:</span>
                        <span className={`font-medium ${getScoreColor(assessment.overall_quality_score || 0)}`}>
                          {assessment.overall_quality_score?.toFixed(1) || 'N/A'}/5
                        </span>
                        {assessment.overall_quality_score && (
                          <div className="flex">
                            {renderStars(assessment.overall_quality_score)}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4 text-blue-400" />
                        <span className="text-sm text-gray-600">Fluency:</span>
                        <span className={`font-medium ${getScoreColor(assessment.fluency_score || 0)}`}>
                          {assessment.fluency_score?.toFixed(1) || 'N/A'}/5
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Brain className="h-4 w-4 text-purple-400" />
                        <span className="text-sm text-gray-600">Adequacy:</span>
                        <span className={`font-medium ${getScoreColor(assessment.adequacy_score || 0)}`}>
                          {assessment.adequacy_score?.toFixed(1) || 'N/A'}/5
                        </span>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(assessment.created_at)}</span>
                      </div>
                      
                      {assessment.time_spent_seconds && (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatTime(assessment.time_spent_seconds)}</span>
                        </div>
                      )}
                      
                      {/* {assessment.ai_confidence_level && (
                        <div className="flex items-center space-x-1">
                          <Brain className="h-4 w-4" />
                          <span>AI: {Math.round(assessment.ai_confidence_level * 100)}%</span>
                        </div>
                      )} */}
                    </div>

                    {/* Human Feedback */}
                    {assessment.human_feedback && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Feedback:</span> {assessment.human_feedback}
                        </p>
                      </div>
                    )}

                    {/* Correction Notes */}
                    {assessment.correction_notes && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700">
                          <span className="font-medium">Corrections:</span> {assessment.correction_notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2 lg:ml-6">
                    <a
                      href={`/mt-assess/${assessment.sentence.id}`}
                      className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500 border border-blue-200 rounded-lg hover:bg-blue-50 text-center"
                    >
                      Re-assess
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || scoreFilter !== null || statusFilter !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'You haven\'t completed any MT quality assessments yet.'
              }
            </p>
            {!searchTerm && scoreFilter === null && statusFilter === 'all' && (
              <a
                href="/mt-assess"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500 border border-blue-200 rounded-lg hover:bg-blue-50"
              >
                Start Your First Assessment
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyMTAssessments;