import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircleIcon, 
  PencilIcon, 
  ArrowLeftIcon,
  ClockIcon,
  UserIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { annotationRevisionAPI } from '../../services/supabase-api';
import { AnnotationWithRevision, AnnotationRevisionCreate, TextHighlight, TextSegment } from '../../types';
import { logger } from '../../utils/logger';

const AnnotationRevisionInterface: React.FC = () => {
  const { annotationId } = useParams<{ annotationId: string }>();
  const navigate = useNavigate();
  
  const [annotation, setAnnotation] = useState<AnnotationWithRevision | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [revisionMode, setRevisionMode] = useState(false);
  const [revisionData, setRevisionData] = useState<Partial<AnnotationWithRevision>>({});
  const [revisionNotes, setRevisionNotes] = useState('');
  const [revisionReason, setRevisionReason] = useState('');

  const loadAnnotation = useCallback(async () => {
    if (!annotationId) return;
    
    setIsLoading(true);
    try {
      const data = await annotationRevisionAPI.getAnnotationForRevision(parseInt(annotationId));
      setAnnotation(data);
      setRevisionData(data);
    } catch (error) {
      logger.apiError('loadAnnotation', error as Error, {
        component: 'AnnotationRevisionInterface',
        metadata: { annotationId }
      });
      setMessage('Error loading annotation');
    } finally {
      setIsLoading(false);
    }
  }, [annotationId]);

  useEffect(() => {
    loadAnnotation();
  }, [loadAnnotation]);

  const handleApprove = async () => {
    if (!annotation) return;

    setIsSubmitting(true);
    try {
      const revisionData: AnnotationRevisionCreate = {
        annotation_id: annotation.id,
        revision_type: 'approve',
        revision_notes: revisionNotes,
        revision_reason: 'Approved by evaluator'
      };

      await annotationRevisionAPI.createRevision(revisionData);
      setMessage('Annotation approved successfully!');
      
      setTimeout(() => {
        navigate('/evaluator');
      }, 1500);
      
    } catch (error) {
      logger.apiError('approveAnnotation', error as Error, {
        component: 'AnnotationRevisionInterface',
        metadata: { annotationId: annotation?.id }
      });
      setMessage('Error approving annotation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevise = async () => {
    if (!annotation || !revisionData) return;

    setIsSubmitting(true);
    try {
      const revisionDataPayload: AnnotationRevisionCreate = {
        annotation_id: annotation.id,
        revision_type: 'revise',
        revised_annotation: {
          fluency_score: revisionData.fluency_score,
          adequacy_score: revisionData.adequacy_score,
          overall_quality: revisionData.overall_quality,
          errors_found: revisionData.errors_found,
          suggested_correction: revisionData.suggested_correction,
          comments: revisionData.comments,
          final_form: revisionData.final_form,
          highlights: revisionData.highlights
        },
        revision_notes: revisionNotes,
        revision_reason: revisionReason
      };

      await annotationRevisionAPI.createRevision(revisionDataPayload);
      setMessage('Annotation revised successfully!');
      
      setTimeout(() => {
        navigate('/evaluator');
      }, 1500);
      
    } catch (error) {
      logger.apiError('reviseAnnotation', error as Error, {
        component: 'AnnotationRevisionInterface',
        metadata: { annotationId: annotation?.id }
      });
      setMessage('Error revising annotation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartRevision = () => {
    setRevisionMode(true);
    setRevisionData(annotation ? { ...annotation } : {});
  };

  const handleCancelRevision = () => {
    setRevisionMode(false);
    setRevisionData(annotation ? { ...annotation } : {});
    setRevisionNotes('');
    setRevisionReason('');
  };

  const updateRevisionData = (field: string, value: any) => {
    setRevisionData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateHighlight = (index: number, field: string, value: any) => {
    if (!revisionData.highlights) return;
    
    const updatedHighlights = [...revisionData.highlights];
    updatedHighlights[index] = {
      ...updatedHighlights[index],
      [field]: value
    };
    
    updateRevisionData('highlights', updatedHighlights);
  };

  const addHighlight = () => {
    const newHighlight: TextHighlight = {
      id: Date.now().toString(),
      highlighted_text: '',
      start_index: 0,
      end_index: 0,
      text_type: 'error',
      comment: '',
      error_type: 'MI_ST'
    };
    
    updateRevisionData('highlights', [...(revisionData.highlights || []), newHighlight]);
  };

  const removeHighlight = (index: number) => {
    if (!revisionData.highlights) return;
    
    const updatedHighlights = revisionData.highlights.filter((_, i) => i !== index);
    updateRevisionData('highlights', updatedHighlights);
  };

  const renderHighlightedText = (text: string, highlights: TextHighlight[]) => {
    if (!highlights || highlights.length === 0) {
      return <span>{text}</span>;
    }

    // Sort highlights by start index
    const sortedHighlights = [...highlights].sort((a, b) => a.start_index - b.start_index);
    
    let result = [];
    let lastIndex = 0;

    sortedHighlights.forEach((highlight, index) => {
      // Add text before highlight
      if (highlight.start_index > lastIndex) {
        result.push(
          <span key={`text-${index}`}>
            {text.slice(lastIndex, highlight.start_index)}
          </span>
        );
      }

      // Add highlighted text
      const highlightClass = highlight.text_type === 'error' 
        ? 'bg-red-200 text-red-800' 
        : 'bg-yellow-200 text-yellow-800';
      
      result.push(
        <span 
          key={`highlight-${index}`}
          className={`px-1 rounded ${highlightClass}`}
          title={`${highlight.error_type}: ${highlight.comment}`}
        >
          {highlight.highlighted_text}
        </span>
      );

      lastIndex = highlight.end_index;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      result.push(
        <span key="text-end">
          {text.slice(lastIndex)}
        </span>
      );
    }

    return <span>{result}</span>;
  };

  const renderHighlightsEditor = () => {
    if (!revisionData.highlights) return null;

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-lg font-medium text-gray-900">Text Highlights</h4>
          <button
            onClick={addHighlight}
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
          >
            Add Highlight
          </button>
        </div>
        
        {revisionData.highlights.map((highlight, index) => (
          <div key={highlight.id || index} className="border rounded-lg p-4 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Highlighted Text
                </label>
                <input
                  type="text"
                  value={highlight.highlighted_text}
                  onChange={(e) => updateHighlight(index, 'highlighted_text', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Error Type
                </label>
                <select
                  value={highlight.error_type}
                  onChange={(e) => updateHighlight(index, 'error_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="MI_ST">MI_ST - Minor Syntax</option>
                  <option value="MI_SE">MI_SE - Minor Semantic</option>
                  <option value="MA_ST">MA_ST - Major Syntax</option>
                  <option value="MA_SE">MA_SE - Major Semantic</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Text Type
                </label>
                <select
                  value={highlight.text_type}
                  onChange={(e) => updateHighlight(index, 'text_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="error">Error</option>
                  <option value="correction">Correction</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => removeHighlight(index)}
                  className="px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
            
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comment
              </label>
              <textarea
                value={highlight.comment}
                onChange={(e) => updateHighlight(index, 'comment', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Explain the error or correction..."
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading annotation...</p>
        </div>
      </div>
    );
  }

  if (!annotation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Annotation Not Found</h1>
          <p className="text-gray-600 mb-8">The annotation you're looking for doesn't exist or you don't have permission to view it.</p>
          <button
            onClick={() => navigate('/evaluator')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Back to Evaluator Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/evaluator')}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {revisionMode ? 'Revise Annotation' : 'Review Annotation'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {revisionMode 
                    ? 'Make changes to the annotation and provide revision notes'
                    : 'Review the annotator\'s work and decide whether to approve or revise'
                  }
                </p>
              </div>
            </div>
            
            {!revisionMode && (
              <div className="flex space-x-3">
                <button
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Approve
                </button>
                <button
                  onClick={handleStartRevision}
                  className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <PencilIcon className="h-5 w-5 mr-2" />
                  Revise
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('Error') 
              ? 'bg-red-100 text-red-700 border border-red-200' 
              : 'bg-green-100 text-green-700 border border-green-200'
          }`}>
            {message}
          </div>
        )}

        {/* Annotation Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Original Data */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sentence Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Original Sentence</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Source Text</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-900">{annotation.sentence.source_text}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Machine Translation</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-900">{annotation.sentence.machine_translation}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Annotator's Work */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Annotator's Work</h3>
              
              {/* Quality Scores */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fluency Score</label>
                  <div className="flex items-center">
                    {revisionMode ? (
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={revisionData.fluency_score || ''}
                        onChange={(e) => updateRevisionData('fluency_score', parseInt(e.target.value) || undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-blue-600">
                        {annotation.fluency_score || 'N/A'}
                      </span>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Adequacy Score</label>
                  <div className="flex items-center">
                    {revisionMode ? (
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={revisionData.adequacy_score || ''}
                        onChange={(e) => updateRevisionData('adequacy_score', parseInt(e.target.value) || undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-blue-600">
                        {annotation.adequacy_score || 'N/A'}
                      </span>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Overall Quality</label>
                  <div className="flex items-center">
                    {revisionMode ? (
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={revisionData.overall_quality || ''}
                        onChange={(e) => updateRevisionData('overall_quality', parseInt(e.target.value) || undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-blue-600">
                        {annotation.overall_quality || 'N/A'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Highlighted Text */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Highlighted Translation</label>
                <div className="p-4 bg-gray-50 rounded-lg border">
                  {revisionMode ? (
                    <div className="space-y-4">
                      <div className="p-3 bg-white rounded border">
                        {renderHighlightedText(annotation.sentence.machine_translation, revisionData.highlights || [])}
                      </div>
                      {renderHighlightsEditor()}
                    </div>
                  ) : (
                    <div className="p-3 bg-white rounded border">
                      {renderHighlightedText(annotation.sentence.machine_translation, annotation.highlights || [])}
                    </div>
                  )}
                </div>
              </div>

              {/* Comments and Corrections */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Errors Found</label>
                  {revisionMode ? (
                    <textarea
                      value={revisionData.errors_found || ''}
                      onChange={(e) => updateRevisionData('errors_found', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe the errors found..."
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-900">{annotation.errors_found || 'No errors documented'}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Suggested Correction</label>
                  {revisionMode ? (
                    <textarea
                      value={revisionData.suggested_correction || ''}
                      onChange={(e) => updateRevisionData('suggested_correction', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Provide suggested corrections..."
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-900">{annotation.suggested_correction || 'No corrections suggested'}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Final Form</label>
                  {revisionMode ? (
                    <textarea
                      value={revisionData.final_form || ''}
                      onChange={(e) => updateRevisionData('final_form', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter the final corrected form..."
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-900">{annotation.final_form || 'No final form provided'}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Comments</label>
                  {revisionMode ? (
                    <textarea
                      value={revisionData.comments || ''}
                      onChange={(e) => updateRevisionData('comments', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add any additional comments..."
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-900">{annotation.comments || 'No comments provided'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Metadata and Actions */}
          <div className="space-y-6">
            {/* Annotation Metadata */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Annotation Details</h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Annotator:</span>
                  <span className="ml-2 font-medium">{annotation.annotator.username}</span>
                </div>
                <div className="flex items-center text-sm">
                  <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Time Spent:</span>
                  <span className="ml-2 font-medium">
                    {annotation.time_spent_seconds ? `${Math.round(annotation.time_spent_seconds / 60)} min` : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    annotation.annotation_status === 'completed' 
                      ? 'bg-green-100 text-green-800'
                      : annotation.annotation_status === 'reviewed'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {annotation.annotation_status}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-gray-600">Created:</span>
                  <span className="ml-2 font-medium">
                    {new Date(annotation.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Revision History */}
            {annotation.revisions && annotation.revisions.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revision History</h3>
                <div className="space-y-3">
                  {annotation.revisions.map((revision, index) => (
                    <div key={revision.id} className="border-l-4 border-blue-200 pl-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">
                          {revision.revision_type === 'approve' ? 'Approved' : 'Revised'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(revision.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        by {revision.evaluator.username}
                      </p>
                      {revision.revision_notes && (
                        <p className="text-sm text-gray-500 mt-1">
                          {revision.revision_notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Revision Mode Actions */}
            {revisionMode && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revision Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Revision Notes
                    </label>
                    <textarea
                      value={revisionNotes}
                      onChange={(e) => setRevisionNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Explain what changes you made and why..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Revision Reason
                    </label>
                    <select
                      value={revisionReason}
                      onChange={(e) => setRevisionReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a reason...</option>
                      <option value="Incorrect scoring">Incorrect scoring</option>
                      <option value="Missing errors">Missing errors</option>
                      <option value="Incomplete correction">Incomplete correction</option>
                      <option value="Poor quality assessment">Poor quality assessment</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={handleRevise}
                      disabled={isSubmitting || !revisionNotes.trim() || !revisionReason}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <PencilIcon className="h-5 w-5 mr-2" />
                      {isSubmitting ? 'Saving...' : 'Save Revision'}
                    </button>
                    <button
                      onClick={handleCancelRevision}
                      disabled={isSubmitting}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <XMarkIcon className="h-5 w-5 mr-2" />
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnotationRevisionInterface;