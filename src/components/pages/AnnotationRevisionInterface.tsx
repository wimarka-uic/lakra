import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  Pencil, 
  ArrowLeft,
  Clock,
  User,
  X,
  Plus,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { annotationRevisionAPI } from '../../services/supabase-api';
import type { AnnotationWithRevision, AnnotationRevisionCreate, TextHighlight } from '../../types';
import { logger } from '../../utils/logger';
import VoiceRecorder from '../ui/VoiceRecorder';
import ConfirmationModal from '../modals/ConfirmationModal';

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
  
  // Enhanced editing state
  const [selectedText, setSelectedText] = useState('');
  const [selectedRange, setSelectedRange] = useState<{ start: number; end: number } | null>(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [tempComment, setTempComment] = useState('');
  const [tempErrorType, setTempErrorType] = useState<'MI_ST' | 'MI_SE' | 'MA_ST' | 'MA_SE'>('MI_SE');
  const [isCommentModalClosing, setIsCommentModalClosing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [highlightToDelete, setHighlightToDelete] = useState<number | null>(null);
  const [expandedHighlights, setExpandedHighlights] = useState<Set<number>>(new Set());
  
  // Voice recording state
  const [voiceRecordingBlob, setVoiceRecordingBlob] = useState<Blob | null>(null);
  const [existingVoiceUrl, setExistingVoiceUrl] = useState<string | null>(null);
  
  const textRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const loadAnnotation = useCallback(async () => {
    if (!annotationId) return;
    
    setIsLoading(true);
    try {
      const data = await annotationRevisionAPI.getAnnotationForRevision(parseInt(annotationId));
      setAnnotation(data);
      setRevisionData(data);
      setExistingVoiceUrl(data.voice_recording_url || null);
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
      // Handle voice recording upload if there's a new recording
      let voiceRecordingUrl = existingVoiceUrl;
      let voiceRecordingDuration = revisionData.voice_recording_duration;

      if (voiceRecordingBlob) {
        try {
          // Upload the new voice recording
          const formData = new FormData();
          formData.append('audio_file', voiceRecordingBlob, 'voice_recording.webm');
          formData.append('annotation_id', annotation.id.toString());
          
          const response = await fetch('/api/annotations/upload-voice', {
            method: 'POST',
            body: formData,
          });
          
          if (response.ok) {
            const result = await response.json();
            voiceRecordingUrl = result.voice_recording_url;
            voiceRecordingDuration = voiceRecordingDuration || result.voice_recording_duration;
          }
        } catch (uploadError) {
          console.warn('Failed to upload voice recording:', uploadError);
          // Continue without voice recording
        }
      }

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
          highlights: revisionData.highlights,
          voice_recording_url: voiceRecordingUrl || undefined,
          voice_recording_duration: voiceRecordingDuration
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
      setVoiceRecordingBlob(null);
  };

  // Enhanced text selection functionality
  const handleTextSelection = () => {
    if (!revisionMode) return;
    
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    const selectedTextValue = selection.toString().trim();
    
    if (selectedTextValue.length === 0) return;

    const refKey = 'machine-translation';
    const container = textRefs.current.get(refKey);
    if (!container || !container.contains(range.commonAncestorContainer)) return;

    const originalText = annotation?.sentence.machine_translation;
    if (!originalText) return;

    const startIndex = originalText.indexOf(selectedTextValue);
    if (startIndex === -1) return;

    const endIndex = startIndex + selectedTextValue.length;
    setSelectedText(selectedTextValue);
    setSelectedRange({ start: startIndex, end: endIndex });
    setShowCommentModal(true);
    
    selection.removeAllRanges();
  };

  const closeCommentModal = () => {
    setIsCommentModalClosing(true);
    setTimeout(() => {
      setShowCommentModal(false);
      setIsCommentModalClosing(false);
      setSelectedText('');
      setSelectedRange(null);
      setTempComment('');
      setTempErrorType('MI_SE');
    }, 200);
  };

  const addHighlightFromSelection = () => {
    if (!selectedRange || !revisionData) return;

    const newHighlight: TextHighlight = {
      id: Date.now(),
      highlighted_text: selectedText,
      start_index: selectedRange.start,
      end_index: selectedRange.end,
      text_type: 'machine',
      comment: tempComment,
      error_type: tempErrorType
    };

    const updatedHighlights = [...(revisionData.highlights || []), newHighlight];
    updateRevisionData('highlights', updatedHighlights);
    closeCommentModal();
  };

  const updateRevisionData = (field: string, value: unknown) => {
    setRevisionData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateHighlight = (index: number, field: string, value: unknown) => {
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
      id: Date.now(),
      highlighted_text: '',
      start_index: 0,
      end_index: 0,
      text_type: 'machine',
      comment: '',
      error_type: 'MI_SE'
    };
    
    updateRevisionData('highlights', [...(revisionData.highlights || []), newHighlight]);
  };

  const removeHighlight = (index: number) => {
    if (!revisionData.highlights) return;
    
    const updatedHighlights = revisionData.highlights.filter((_, i) => i !== index);
    updateRevisionData('highlights', updatedHighlights);
  };

  const handleDeleteHighlight = (index: number) => {
    setHighlightToDelete(index);
    setShowDeleteModal(true);
  };

  const confirmDeleteHighlight = () => {
    if (highlightToDelete !== null) {
      removeHighlight(highlightToDelete);
    }
    setShowDeleteModal(false);
    setHighlightToDelete(null);
  };

  const cancelDeleteHighlight = () => {
    setShowDeleteModal(false);
    setHighlightToDelete(null);
  };

  const toggleHighlightExpansion = (index: number) => {
    const newExpanded = new Set(expandedHighlights);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedHighlights(newExpanded);
  };

  // Voice recording handlers
  const handleVoiceRecordingComplete = (audioBlob: Blob) => {
    setVoiceRecordingBlob(audioBlob);
    setExistingVoiceUrl(null); // Clear existing URL when new recording is made
  };

  const handleVoiceRecordingDelete = () => {
    setVoiceRecordingBlob(null);
    setExistingVoiceUrl(null);
  };

  const renderHighlightedText = (text: string, highlights: TextHighlight[]) => {
    if (!highlights || highlights.length === 0) {
      return <span>{text}</span>;
    }

    // Sort highlights by start index and remove overlapping ones
    const sortedHighlights = [...highlights]
      .sort((a, b) => a.start_index - b.start_index)
      .filter((highlight, index, arr) => {
        // Remove highlights that are completely contained within another highlight
        return !arr.some((other, otherIndex) => 
          otherIndex !== index && 
          other.start_index <= highlight.start_index && 
          other.end_index >= highlight.end_index
        );
      });
    
    const result = [];
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

      // Add highlighted text with error type styling
      const getErrorTypeClass = (errorType: string) => {
        switch (errorType) {
          case 'MI_ST': return 'bg-yellow-200 border-b-2 border-yellow-400 text-yellow-800';
          case 'MI_SE': return 'bg-orange-200 border-b-2 border-orange-400 text-orange-800';
          case 'MA_ST': return 'bg-red-200 border-b-2 border-red-400 text-red-800';
          case 'MA_SE': return 'bg-red-300 border-b-2 border-red-500 text-red-900';
          default: return 'bg-gray-200 border-b-2 border-gray-400 text-gray-800';
        }
      };

      const getErrorTypeLabel = (errorType: string) => {
        switch (errorType) {
          case 'MI_ST': return 'Minor Syntax Error';
          case 'MI_SE': return 'Minor Semantic Error';
          case 'MA_ST': return 'Major Syntax Error';
          case 'MA_SE': return 'Major Semantic Error';
          default: return 'Error';
        }
      };
      
      result.push(
        <span 
          key={`highlight-${index}`}
          className={`px-1 rounded cursor-pointer relative group ${getErrorTypeClass(highlight.error_type || 'MI_SE')}`}
          title={`${getErrorTypeLabel(highlight.error_type || 'MI_SE')}: ${highlight.comment}`}
        >
          <span className="mx-1">{highlight.highlighted_text}</span>
          <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block z-10">
            <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap max-w-xs">
              <div className="font-medium text-yellow-300 mb-1">
                {getErrorTypeLabel(highlight.error_type || 'MI_SE')}
              </div>
              {highlight.comment}
            </div>
          </div>
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
          <div className="flex space-x-2">
            <button
              onClick={addHighlight}
              className="flex items-center px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Highlight
            </button>
          </div>
        </div>
        
        {revisionData.highlights.map((highlight, index) => {
          const isExpanded = expandedHighlights.has(index);
          const getErrorTypeColor = (errorType: string) => {
            switch (errorType) {
              case 'MI_ST': return 'border-yellow-400 bg-yellow-50';
              case 'MI_SE': return 'border-orange-400 bg-orange-50';
              case 'MA_ST': return 'border-red-400 bg-red-50';
              case 'MA_SE': return 'border-red-500 bg-red-50';
              default: return 'border-gray-400 bg-gray-50';
            }
          };

          return (
            <div key={highlight.id || index} className={`border-2 rounded-lg p-4 ${getErrorTypeColor(highlight.error_type || 'MI_SE')}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-gray-800">
                    {highlight.error_type || 'MI_SE'}
                  </span>
                  <span className="text-sm text-gray-600">
                    {highlight.highlighted_text || 'No text selected'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleHighlightExpansion(index)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    {isExpanded ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteHighlight(index)}
                    className="p-1 text-red-400 hover:text-red-600 transition-colors"
                    title="Delete highlight"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {isExpanded && (
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
                      placeholder="Enter highlighted text..."
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
                      <option value="MI_ST">MI_ST - Minor Syntax Error</option>
                      <option value="MI_SE">MI_SE - Minor Semantic Error</option>
                      <option value="MA_ST">MA_ST - Major Syntax Error</option>
                      <option value="MA_SE">MA_SE - Major Semantic Error</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Index
                    </label>
                    <input
                      type="number"
                      value={highlight.start_index}
                      onChange={(e) => updateHighlight(index, 'start_index', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Index
                    </label>
                    <input
                      type="number"
                      value={highlight.end_index}
                      onChange={(e) => updateHighlight(index, 'end_index', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
              
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
          );
        })}
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
          <p className="text-gray-600 mb-8">The annotation you are looking for does not exist or you do not have permission to view it.</p>
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
                  <ArrowLeft className="h-6 w-6" />
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
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Approve
                </button>
                <button
                  onClick={handleStartRevision}
                  className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <Pencil className="h-5 w-5 mr-2" />
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {revisionMode ? 'Interactive Translation Editor' : 'Highlighted Translation'}
                </label>
                <div className="p-4 bg-gray-50 rounded-lg border">
                  {revisionMode ? (
                    <div className="space-y-4">
                      <div className="p-3 bg-white rounded border">
                        <div 
                          ref={(el) => {
                            if (el) textRefs.current.set('machine-translation', el);
                          }}
                          onMouseUp={handleTextSelection}
                          className="min-h-[60px] p-3 border border-gray-200 rounded cursor-text select-text"
                          style={{ userSelect: 'text' }}
                        >
                          {renderHighlightedText(annotation.sentence.machine_translation, revisionData.highlights || [])}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Select text in the translation above to add highlights, or use the editor below to manage existing highlights.
                        </p>
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

                {/* Voice Recording Section */}
                {revisionMode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Voice Recording</label>
                    <div className="p-4 bg-gray-50 rounded-lg border">
                      <VoiceRecorder
                        onRecordingComplete={handleVoiceRecordingComplete}
                        onRecordingDelete={handleVoiceRecordingDelete}
                        existingRecordingUrl={existingVoiceUrl || undefined}
                        existingDuration={revisionData.voice_recording_duration || 0}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                )}
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
                  <User className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Annotator:</span>
                  <span className="ml-2 font-medium">
                    {annotation.annotator?.username || 
                     annotation.annotator?.first_name || 
                     (annotation.annotator_id ? `User #${annotation.annotator_id}` : 'Unknown')}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
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
                <div className="space-y-4">
                  {annotation.revisions.map((revision) => (
                    <div key={revision.id} className={`border-l-4 pl-4 ${
                      revision.revision_type === 'approve' 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-orange-200 bg-orange-50'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            revision.revision_type === 'approve'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {revision.revision_type === 'approve' ? '✓ Approved' : '✏️ Revised'}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            by {revision.evaluator.username}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(revision.created_at).toLocaleDateString()} at {new Date(revision.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      {revision.revision_notes && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-700 font-medium">Notes:</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {revision.revision_notes}
                          </p>
                        </div>
                      )}
                      
                      {revision.revision_reason && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-700 font-medium">Reason:</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {revision.revision_reason}
                          </p>
                        </div>
                      )}
                      
                      {revision.revised_annotation && (
                        <div className="mt-3 p-3 bg-white rounded border">
                          <p className="text-sm text-gray-700 font-medium mb-2">Changes Made:</p>
                          <div className="text-xs text-gray-600 space-y-1">
                            {revision.revised_annotation.fluency_score && (
                              <p>• Fluency Score: {revision.revised_annotation.fluency_score}</p>
                            )}
                            {revision.revised_annotation.adequacy_score && (
                              <p>• Adequacy Score: {revision.revised_annotation.adequacy_score}</p>
                            )}
                            {revision.revised_annotation.overall_quality && (
                              <p>• Overall Quality: {revision.revised_annotation.overall_quality}</p>
                            )}
                            {revision.revised_annotation.highlights && (
                              <p>• Highlights: {revision.revised_annotation.highlights.length} items</p>
                            )}
                            {revision.revised_annotation.voice_recording_url && (
                              <p>• Voice Recording: Added</p>
                            )}
                          </div>
                        </div>
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
                      <Pencil className="h-5 w-5 mr-2" />
                      {isSubmitting ? 'Saving...' : 'Save Revision'}
                    </button>
                    <button
                      onClick={handleCancelRevision}
                      disabled={isSubmitting}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <X className="h-5 w-5 mr-2" />
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comment Modal for Text Selection */}
      {showCommentModal && (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isCommentModalClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`}>
          <div className={`bg-white rounded-lg p-6 max-w-md w-full mx-4 ${isCommentModalClosing ? 'animate-scaleOut' : 'animate-scaleIn'}`}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Highlight</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Selected Text</label>
                <div className="p-2 bg-gray-100 rounded border text-sm">
                  "{selectedText}"
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Error Type</label>
                <select
                  value={tempErrorType}
                  onChange={(e) => setTempErrorType(e.target.value as 'MI_ST' | 'MI_SE' | 'MA_ST' | 'MA_SE')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="MI_ST">MI_ST - Minor Syntax Error</option>
                  <option value="MI_SE">MI_SE - Minor Semantic Error</option>
                  <option value="MA_ST">MA_ST - Major Syntax Error</option>
                  <option value="MA_SE">MA_SE - Major Semantic Error</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                <textarea
                  value={tempComment}
                  onChange={(e) => setTempComment(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Explain the error or correction..."
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={addHighlightFromSelection}
                disabled={!tempComment.trim()}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add Highlight
              </button>
              <button
                onClick={closeCommentModal}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={cancelDeleteHighlight}
        onConfirm={confirmDeleteHighlight}
        title="Delete Highlight"
        message="Are you sure you want to delete this highlight? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default AnnotationRevisionInterface;