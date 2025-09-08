import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// TODO: Replace dummy data with Supabase-backed API when backend is wired.
// import { evaluationsAPI } from '../../services/supabase-api';
import type { Annotation, EvaluationCreate, TextHighlight } from '../../types';
import { logger } from '../../utils/logger';
import { 
  ChevronLeft, 
  Clock, 
  Save,
  User,
  FileText,
  Home,
  Star,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface RatingButtonsProps {
  value?: number;
  onChange: (value: number) => void;
  label: string;
}

const RatingButtons: React.FC<RatingButtonsProps> = ({ value, onChange, label }) => {
  return (
    <div className="space-y-3">
      <label className="block text-base font-semibold text-gray-700">{label}</label>
      <div className="flex space-x-3">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className={`w-12 h-12 rounded-full border-2 font-semibold text-base transition-all ${
              value === rating
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50'
            }`}
          >
            {rating}
          </button>
        ))}
      </div>
    </div>
  );
};

const EvaluationInterface: React.FC = () => {
  const { annotationId } = useParams<{ annotationId: string }>();
  const navigate = useNavigate();
  
  const [annotation, setAnnotation] = useState<Annotation | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationCreate>({
    annotation_id: 0,
    annotation_quality_score: undefined,
    accuracy_score: undefined,
    completeness_score: undefined,
    overall_evaluation_score: undefined,
    feedback: '',
    evaluation_notes: '',
    time_spent_seconds: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [startTime] = useState(new Date());

  const loadAnnotation = useCallback(async () => {
    if (!annotationId) return;
    
    setIsLoading(true);
    try {
      // DEBUG: Use dummy annotation while Supabase is disabled
      const targetAnnotation: Annotation = {
        id: parseInt(annotationId),
        sentence_id: 1,
        annotator_id: 1,
        fluency_score: 4,
        adequacy_score: 4,
        overall_quality: 4,
        comments: 'Minor wording improvements suggested.',
        final_form: 'Kumusta ka? Kumusta ang trabaho mo?',
        time_spent_seconds: 95,
        annotation_status: 'completed',
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
        annotator: {
          id: 2,
          email: 'annotator@example.com',
          username: 'annotator',
          first_name: 'Ana',
          last_name: 'Tador',
          is_admin: false,
          is_evaluator: false,
          is_active: true,
          guidelines_seen: true,
          preferred_language: 'PHL',
          languages: ['PHL', 'EN'],
          created_at: new Date().toISOString(),
        },
        highlights: [
          {
            start_index: 0,
            end_index: 8,
            highlighted_text: 'Kumusta',
            comment: 'Spelling variants accepted; choose one form.',
            text_type: 'machine',
            error_type: 'MI_SE',
          },
        ],
      };
      
      setAnnotation(targetAnnotation);
      setEvaluation((prev: EvaluationCreate) => ({ ...prev, annotation_id: targetAnnotation.id }));
    } catch (error) {
      logger.apiError('loadAnnotation', error as Error, {
        component: 'EvaluationInterface',
        metadata: { annotationId }
      });
      setMessage('Error loading annotation');
    } finally {
      setIsLoading(false);
    }
  }, [annotationId, navigate]);

  const loadNextAnnotation = useCallback(async () => {
    setIsLoading(true);
    try {
      // DEBUG: Create a dummy next annotation
      const nextAnnotation: Annotation = {
        id: 999,
        sentence_id: 2,
        annotator_id: 3,
        fluency_score: 3,
        adequacy_score: 3,
        overall_quality: 3,
        comments: 'Check tense consistency.',
        final_form: 'Tuluy-tuloy ang operasyon ng klinika tuwing Lunes.',
        time_spent_seconds: 110,
        annotation_status: 'completed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sentence: {
          id: 2,
          source_text: 'Nagpapatuloy ang operasyon ng klinika tuwing Lunes.',
          machine_translation: 'The clinic continues its operation every Monday.',
          source_language: 'PHL',
          target_language: 'EN',
          created_at: new Date().toISOString(),
          is_active: true,
        },
        annotator: {
          id: 3,
          email: 'annotator2@example.com',
          username: 'ann2',
          first_name: 'Juan',
          last_name: 'Dela Cruz',
          is_admin: false,
          is_evaluator: false,
          is_active: true,
          guidelines_seen: true,
          preferred_language: 'PHL',
          languages: ['PHL', 'EN'],
          created_at: new Date().toISOString(),
        },
        highlights: [],
      };

      setAnnotation(nextAnnotation);
      setEvaluation((prev: EvaluationCreate) => ({ ...prev, annotation_id: nextAnnotation.id }));
    } catch (error) {
      logger.apiError('loadNextAnnotation', error as Error, {
        component: 'EvaluationInterface'
      });
      setMessage('Error loading annotation');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (annotationId) {
      loadAnnotation();
    } else {
      // Load next pending annotation
      loadNextAnnotation();
    }
  }, [annotationId, loadAnnotation, loadNextAnnotation]);

  const handleRatingChange = (field: keyof EvaluationCreate, value: number) => {
    setEvaluation((prev: EvaluationCreate) => ({ ...prev, [field]: value }));
  };

  const handleTextChange = (field: keyof EvaluationCreate, value: string) => {
    setEvaluation((prev: EvaluationCreate) => ({ ...prev, [field]: value }));
  };

  const calculateTimeSpent = (): number => {
    return Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
  };

  const handleSubmit = async () => {
    if (!annotation) return;

    // Validation
    if (!evaluation.annotation_quality_score || !evaluation.accuracy_score || 
        !evaluation.completeness_score || !evaluation.overall_evaluation_score) {
      setMessage('Please provide all required scores before submitting');
      setTimeout(() => setMessage(''), 5000);
      return;
    }

    setIsSubmitting(true);
    try {
      const timeSpent = calculateTimeSpent();
      const submissionData = {
        ...evaluation,
        time_spent_seconds: timeSpent
      };

      // TODO: Send to Supabase when ready. For now just simulate success.
      console.log('DEBUG submit evaluation', submissionData); // eslint-disable-line no-console
      setMessage('Evaluation submitted successfully! (debug)');
      
      // Navigate to next annotation or back to dashboard after delay
      setTimeout(() => {
        navigate('/evaluator');
      }, 1500);
      
    } catch (error) {
      logger.apiError('submitEvaluation', error as Error, {
        component: 'EvaluationInterface',
        metadata: { annotationId: annotation?.id }
      });
      setMessage('Error submitting evaluation. Please try again.');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderHighlightedText = (text: string, highlights: TextHighlight[], textType: string) => {
    if (!highlights || highlights.length === 0) {
      return <span>{text}</span>;
    }

    const relevantHighlights = highlights.filter(h => h.text_type === textType);
    if (relevantHighlights.length === 0) {
      return <span>{text}</span>;
    }

    // Sort highlights by start index
    const sortedHighlights = [...relevantHighlights].sort((a, b) => a.start_index - b.start_index);
    
    let lastIndex = 0;
    const elements: React.ReactNode[] = [];

    sortedHighlights.forEach((highlight, index) => {
      // Add text before highlight
      if (highlight.start_index > lastIndex) {
        elements.push(
          <span key={`text-${index}`}>
            {text.substring(lastIndex, highlight.start_index)}
          </span>
        );
      }

      // Add highlighted text
      const errorType = highlight.error_type || 'MI_ST';
      
      // Define colors for different error types
      const getErrorTypeStyle = (type: string) => {
        switch (type) {
          case 'MI_ST': return 'bg-yellow-200 border-b-2 border-yellow-400';
          case 'MI_SE': return 'bg-blue-200 border-b-2 border-blue-400';
          case 'MA_ST': return 'bg-red-200 border-b-2 border-red-400';
          case 'MA_SE': return 'bg-purple-200 border-b-2 border-purple-400';
          default: return 'bg-gray-200 border-b-2 border-gray-400';
        }
      };

      const getErrorTypeLabel = (type: string) => {
        switch (type) {
          case 'MI_ST': return 'Minor Syntactic';
          case 'MI_SE': return 'Minor Semantic';
          case 'MA_ST': return 'Major Syntactic';
          case 'MA_SE': return 'Major Semantic';
          default: return 'Unknown Type';
        }
      };
      
      elements.push(
        <span
          key={`highlight-${index}`}
          className={`${getErrorTypeStyle(errorType)} px-1 rounded relative group cursor-help`}
          title={`${getErrorTypeLabel(errorType)}: ${highlight.comment}`}
        >
          <span className="mx-1">{highlight.highlighted_text}</span>
        </span>
      );

      lastIndex = highlight.end_index;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      elements.push(
        <span key="text-end">
          {text.substring(lastIndex)}
        </span>
      );
    }

    return <>{elements}</>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-16 w-16 text-gray-400 mx-auto animate-pulse mb-6" />
          <p className="text-xl text-gray-600">Loading annotation...</p>
        </div>
      </div>
    );
  }

  if (!annotation) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-6" />
          <p className="text-xl text-gray-600">No annotation to evaluate</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-base text-gray-600">
            <li className="flex items-center">
              <Home className="h-4 w-4 mr-1" />
              <span>Home</span>
            </li>
            <li className="flex items-center">
              <span className="mx-2">/</span>
              <span>Evaluator Dashboard</span>
            </li>
            <li className="flex items-center">
              <span className="mx-2">/</span>
              <span className="text-gray-900 font-medium">Evaluate Annotation</span>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/evaluator')}
            className="flex items-center text-base text-gray-600 hover:text-gray-900 mb-6"
          >
            <ChevronLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
          
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Star className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Evaluate Annotation</h1>
              <p className="text-lg text-gray-600 mt-1">
                Review and evaluate the quality of this annotation
              </p>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-8 p-5 rounded-lg border-2 ${
            message.includes('Error') || message.includes('Please') 
              ? 'bg-red-50 text-red-800 border-red-200' 
              : 'bg-green-50 text-green-800 border-green-200'
          }`}>
            <div className="text-lg font-medium">{message}</div>
          </div>
        )}

        {/* Annotation Details */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <FileText className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Annotation Details</h2>
              </div>
              <div className="flex items-center space-x-6 text-base text-gray-500">
                <span className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  {annotation.annotator.first_name} {annotation.annotator.last_name}
                </span>
                <span>
                  {new Date(annotation.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Source Text */}
            <div className="mb-6">
              <h3 className="text-base font-semibold text-gray-700 mb-3">Source Text</h3>
              <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-5">
                <p className="text-lg text-gray-900">{annotation.sentence.source_text}</p>
              </div>
            </div>

            {/* Machine Translation with Highlights */}
            <div className="mb-6">
              <h3 className="text-base font-semibold text-gray-700 mb-3">Machine Translation</h3>
              <div className="bg-white border-2 border-gray-200 rounded-lg p-5">
                <p className="text-lg text-gray-900 leading-relaxed">
                  {renderHighlightedText(
                    annotation.sentence.machine_translation, 
                    annotation.highlights || [], 
                    'machine'
                  )}
                </p>
              </div>
            </div>

            {/* Annotation Scores */}
            {(annotation.fluency_score || annotation.adequacy_score || annotation.overall_quality) && (
              <div className="mb-6">
                <h3 className="text-base font-semibold text-gray-700 mb-4">Annotator's Scores</h3>
                <div className="grid grid-cols-3 gap-6">
                  {annotation.fluency_score && (
                    <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-base text-gray-600">Fluency</div>
                      <div className="text-2xl font-bold text-blue-600">{annotation.fluency_score}/5</div>
                    </div>
                  )}
                  {annotation.adequacy_score && (
                    <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-base text-gray-600">Adequacy</div>
                      <div className="text-2xl font-bold text-green-600">{annotation.adequacy_score}/5</div>
                    </div>
                  )}
                  {annotation.overall_quality && (
                    <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="text-base text-gray-600">Overall</div>
                      <div className="text-2xl font-bold text-purple-600">{annotation.overall_quality}/5</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Comments and Final Form */}
            {(annotation.comments || annotation.final_form) && (
              <div className="space-y-6">
                {annotation.comments && (
                  <div>
                    <h3 className="text-base font-semibold text-gray-700 mb-3">Annotator's Comments</h3>
                    <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-5">
                      <p className="text-lg text-gray-900">{annotation.comments}</p>
                    </div>
                  </div>
                )}
                
                {annotation.final_form && (
                  <div>
                    <h3 className="text-base font-semibold text-gray-700 mb-3">Final Corrected Form</h3>
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-5">
                      <p className="text-lg text-gray-900">{annotation.final_form}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Highlights Details */}
            {annotation.highlights && annotation.highlights.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center space-x-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <h3 className="text-base font-semibold text-gray-700">Annotations ({annotation.highlights.length})</h3>
                </div>
                <div className="space-y-4">
                  {annotation.highlights.map((highlight, index) => (
                    <div key={index} className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-base font-semibold text-yellow-800">
                          "{highlight.highlighted_text}"
                        </span>
                        <span className="text-sm text-yellow-600">
                          Position: {highlight.start_index}-{highlight.end_index}
                        </span>
                      </div>
                      {highlight.comment && (
                        <p className="text-base text-yellow-700">{highlight.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Evaluation Form */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-8">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <h2 className="text-2xl font-semibold text-gray-900">Your Evaluation</h2>
            </div>

            {/* Rating Scores */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <RatingButtons
                value={evaluation.annotation_quality_score}
                onChange={(value) => handleRatingChange('annotation_quality_score', value)}
                label="Annotation Quality Score"
              />
              <RatingButtons
                value={evaluation.accuracy_score}
                onChange={(value) => handleRatingChange('accuracy_score', value)}
                label="Accuracy Score"
              />
              <RatingButtons
                value={evaluation.completeness_score}
                onChange={(value) => handleRatingChange('completeness_score', value)}
                label="Completeness Score"
              />
              <RatingButtons
                value={evaluation.overall_evaluation_score}
                onChange={(value) => handleRatingChange('overall_evaluation_score', value)}
                label="Overall Evaluation Score"
              />
            </div>

            {/* Feedback */}
            <div className="mb-8">
              <label className="block text-base font-semibold text-gray-700 mb-3">
                Feedback for Annotator
              </label>
              <textarea
                value={evaluation.feedback || ''}
                onChange={(e) => handleTextChange('feedback', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                rows={5}
                placeholder="Provide constructive feedback about the annotation quality..."
              />
            </div>

            {/* Evaluation Notes */}
            <div className="mb-8">
              <label className="block text-base font-semibold text-gray-700 mb-3">
                Evaluation Notes (Internal)
              </label>
              <textarea
                value={evaluation.evaluation_notes || ''}
                onChange={(e) => handleTextChange('evaluation_notes', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                rows={4}
                placeholder="Internal notes about your evaluation process..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
              >
                {isSubmitting ? (
                  <>
                    <Clock className="h-5 w-5 mr-3 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-3" />
                    Submit Evaluation
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

export default EvaluationInterface;
