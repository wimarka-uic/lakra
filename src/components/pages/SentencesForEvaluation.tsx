import React, { useState, useEffect } from 'react';
import { sentencesAPI } from '../../services/supabase-api';
import type { Sentence, Annotation } from '../../types';
import { 
  FileText, 
  User, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Eye
} from 'lucide-react';

interface SentenceWithAnnotation extends Sentence {
  annotation: Annotation;
}

const SentencesForEvaluation: React.FC = () => {
  const [sentences, setSentences] = useState<SentenceWithAnnotation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSentencesForEvaluation();
  }, []);

  const loadSentencesForEvaluation = async () => {
    setIsLoading(true);
    try {
      // Get sentences with annotations that haven't been evaluated by current evaluator
      const sentencesWithAnnotations = await sentencesAPI.getSentencesForEvaluationByEvaluator(0, 20);
      setSentences(sentencesWithAnnotations);
      
      if (sentencesWithAnnotations.length === 0) {
        setMessage('No sentences with annotations available for evaluation');
      }
    } catch (error) {
      console.error('Error loading sentences for evaluation:', error);
      setMessage('Error loading sentences for evaluation');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getQualityColor = (score: number): string => {
    if (score >= 4) return 'text-green-600';
    if (score >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Eye className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Sentences for Evaluation</h1>
          </div>
          <p className="text-gray-600">
            Review sentences that have been annotated by annotators and are ready for evaluation
          </p>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{sentences.length}</div>
              <div className="text-sm text-gray-600">Available for Evaluation</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {sentences.filter(s => s.annotation.overall_quality && s.annotation.overall_quality >= 4).length}
              </div>
              <div className="text-sm text-gray-600">High Quality Annotations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {sentences.filter(s => s.annotation.overall_quality && s.annotation.overall_quality < 3).length}
              </div>
              <div className="text-sm text-gray-600">Need Review</div>
            </div>
          </div>
        </div>

        {/* Sentences List */}
        {sentences.length > 0 ? (
          <div className="space-y-6">
            {sentences.map((sentence) => (
              <div key={sentence.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  {/* Sentence Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-gray-600">
                        Sentence #{sentence.id}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {sentence.source_language} → {sentence.target_language}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>Annotated {formatDate(sentence.annotation.created_at)}</span>
                    </div>
                  </div>

                  {/* Source and Translation */}
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Source Text</h3>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                        {sentence.source_text}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Machine Translation</h3>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                        {sentence.machine_translation}
                      </p>
                    </div>
                  </div>

                  {/* Annotation Details */}
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <User className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium text-gray-700">
                          Annotated by {sentence.annotation.annotator?.first_name} {sentence.annotation.annotator?.last_name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        {sentence.annotation.overall_quality && (
                          <div className={`text-sm font-medium ${getQualityColor(sentence.annotation.overall_quality)}`}>
                            Quality: {sentence.annotation.overall_quality}/5
                          </div>
                        )}
                        <div className="text-sm text-gray-500">
                          Fluency: {sentence.annotation.fluency_score}/5
                        </div>
                        <div className="text-sm text-gray-500">
                          Adequacy: {sentence.annotation.adequacy_score}/5
                        </div>
                      </div>
                    </div>

                    {/* Final Form */}
                    {sentence.annotation.final_form && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Final Form</h4>
                        <p className="text-gray-900 bg-green-50 p-3 rounded-lg border border-green-200">
                          {sentence.annotation.final_form}
                        </p>
                      </div>
                    )}

                    {/* Highlights */}
                    {sentence.annotation.highlights && sentence.annotation.highlights.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Error Highlights</h4>
                        <div className="space-y-2">
                          {sentence.annotation.highlights.map((highlight, index) => (
                            <div key={index} className="flex items-center space-x-2 text-sm">
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                                {highlight.error_type || 'Error'}
                              </span>
                              <span className="text-gray-600">"{highlight.highlighted_text}"</span>
                              {highlight.comment && (
                                <span className="text-gray-500">- {highlight.comment}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Status Information */}
                    <div className="flex items-center space-x-4 text-sm text-gray-500 pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Status: {sentence.annotation.annotation_status}</span>
                      </div>
                      {sentence.annotation.time_spent_seconds && (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>Time: {Math.round(sentence.annotation.time_spent_seconds / 60)}m</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Sentences Available</h3>
            <p className="text-gray-500 mb-4">
              {message || 'There are no sentences with annotations ready for evaluation at this time.'}
            </p>
            <button 
              onClick={loadSentencesForEvaluation}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500 border border-blue-200 rounded-lg hover:bg-blue-50"
            >
              Refresh
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SentencesForEvaluation;
