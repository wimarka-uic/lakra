import React, { useState, useEffect } from 'react';
import { annotationsAPI } from '../../services/supabase-api';
import type { Annotation, User } from '../../types';
import { logger } from '../../utils/logger';
import { 
  Users, 
  Filter, 
  Download, 
  Eye, 
  Calendar, 
  MessageCircle, 
  Star,
  ChevronDown,
  ChevronUp,
  Copy,
  Check
} from 'lucide-react';

interface AnnotatorWithStats extends User {
  annotation_count: number;
  languages: string[];
}

const AnnotatorTab: React.FC = () => {
  const [annotators, setAnnotators] = useState<AnnotatorWithStats[]>([]);
  const [selectedAnnotator, setSelectedAnnotator] = useState<number | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAnnotations, setIsLoadingAnnotations] = useState(false);
  const [expandedAnnotations, setExpandedAnnotations] = useState<Set<number>>(new Set());
  const [copiedAnnotationId, setCopiedAnnotationId] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadAnnotators();
  }, []);

  // Store all annotations for filtering
  const [allAnnotations, setAllAnnotations] = useState<Annotation[]>([]);

  useEffect(() => {
    if (selectedAnnotator && allAnnotations.length > 0) {
      // Filter annotations by language
      if (selectedLanguage === 'all') {
        setAnnotations(allAnnotations);
      } else {
        const filtered = allAnnotations.filter(annotation => 
          annotation.sentence.target_language === selectedLanguage
        );
        setAnnotations(filtered);
      }
    }
  }, [selectedAnnotator, selectedLanguage, allAnnotations]);

  const loadAnnotators = async () => {
    setIsLoading(true);
    try {
      const annotatorsData = await annotationsAPI.getAnnotatorsWithStats();
      setAnnotators(annotatorsData);
    } catch (error) {
      logger.apiError('loadAnnotators', error as Error, {
        component: 'AnnotatorTab'
      });
      setMessage('Error loading annotators. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  const handleAnnotatorSelect = async (annotatorId: number) => {
    setSelectedAnnotator(annotatorId);
    setExpandedAnnotations(new Set());
    setSelectedLanguage('all'); // Reset language filter when selecting new annotator
    
    // Load all annotations first to populate language dropdown
    setIsLoadingAnnotations(true);
    try {
      const allAnnotationsData = await annotationsAPI.getAnnotationsByAnnotator(annotatorId);
      setAllAnnotations(allAnnotationsData);
      setAnnotations(allAnnotationsData); // Show all initially
    } catch (error) {
      logger.apiError('loadAllAnnotations', error as Error, {
        component: 'AnnotatorTab',
        metadata: { annotatorId }
      });
      setMessage('Error loading annotations. Please try again.');
    } finally {
      setIsLoadingAnnotations(false);
    }
  };

  const handleLanguageFilter = (language: string) => {
    setSelectedLanguage(language);
  };

  const toggleAnnotationExpansion = (annotationId: number) => {
    const newExpanded = new Set(expandedAnnotations);
    if (newExpanded.has(annotationId)) {
      newExpanded.delete(annotationId);
    } else {
      newExpanded.add(annotationId);
    }
    setExpandedAnnotations(newExpanded);
  };

  const copyAnnotationJSON = async (annotation: Annotation) => {
    try {
      const jsonString = annotationsAPI.generateAnnotationJSON(annotation);
      await navigator.clipboard.writeText(jsonString);
      setCopiedAnnotationId(annotation.id);
      setTimeout(() => setCopiedAnnotationId(null), 2000);
    } catch (error) {
      console.error('Failed to copy annotation JSON:', error);
    }
  };

  const downloadAnnotationJSON = (annotation: Annotation) => {
    const jsonString = annotationsAPI.generateAnnotationJSON(annotation);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `annotation_${annotation.id}_${annotation.sentence.source_language}_${annotation.sentence.target_language}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 4) return 'text-green-600';
    if (score >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score?: number) => {
    if (!score) return 'bg-gray-100';
    if (score >= 4) return 'bg-green-100';
    if (score >= 3) return 'bg-yellow-100';
    return 'bg-red-100';
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

  const renderHighlightedText = (text: string, highlights: any[]) => {
    if (!highlights || highlights.length === 0) {
      return <span>{text}</span>;
    }

    let result = text;
    const sortedHighlights = highlights.sort((a, b) => a.start_index - b.start_index);
    
    // Apply highlights in reverse order to maintain indices
    for (let i = sortedHighlights.length - 1; i >= 0; i--) {
      const highlight = sortedHighlights[i];
      const before = result.substring(0, highlight.start_index);
      const highlighted = result.substring(highlight.start_index, highlight.end_index);
      const after = result.substring(highlight.end_index);
      
      const errorTypeClass = {
        'MI_ST': 'bg-yellow-200 border-b-2 border-yellow-400',
        'MI_SE': 'bg-red-200 border-b-2 border-red-400',
        'MA_ST': 'bg-blue-200 border-b-2 border-blue-400',
        'MA_SE': 'bg-purple-200 border-b-2 border-purple-400'
      }[highlight.error_type] || 'bg-gray-200 border-b-2 border-gray-400';

      result = before + 
        `<span class="${errorTypeClass} px-1 rounded cursor-pointer" title="${highlight.comment}">${highlighted}</span>` + 
        after;
    }

    return <span dangerouslySetInnerHTML={{ __html: result }} />;
  };

  const getAvailableLanguages = () => {
    if (!annotations || annotations.length === 0) return [];
    
    // Get unique target languages from the current annotations
    const languages = [...new Set(annotations.map(annotation => annotation.sentence.target_language))];
    return languages.sort();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        <span className="ml-2 text-gray-600">Loading annotators...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-6 w-6 text-primary-500" />
          <h2 className="text-2xl font-bold text-gray-900">Annotator View</h2>
        </div>
        <div className="text-sm text-gray-500">
          {annotators.length} annotators found
        </div>
      </div>

      {message && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{message}</p>
        </div>
      )}

      {/* Annotator Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Annotator</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {annotators.map((annotator) => (
            <div
              key={annotator.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                selectedAnnotator === annotator.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleAnnotatorSelect(annotator.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">
                  {annotator.first_name} {annotator.last_name}
                </h4>
                <span className="text-sm text-gray-500">
                  {annotator.annotation_count} annotations
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <div>Username: {annotator.username}</div>
                <div>Languages: {annotator.languages.join(', ')}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Language Filter and Annotations */}
      {selectedAnnotator && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Annotations</h3>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={selectedLanguage}
                onChange={(e) => handleLanguageFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Languages</option>
                {getAvailableLanguages().map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          </div>

          {isLoadingAnnotations ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
              <span className="ml-2 text-gray-600">Loading annotations...</span>
            </div>
          ) : annotations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No annotations found for the selected annotator and language filter.
            </div>
          ) : (
            <div className="space-y-4">
              {annotations.map((annotation) => (
                <div key={annotation.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-600">
                        <Calendar className="h-4 w-4 inline mr-1" />
                        {formatDate(annotation.created_at)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {annotation.sentence.source_language} → {annotation.sentence.target_language}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => copyAnnotationJSON(annotation)}
                        className="p-2 text-gray-500 hover:text-primary-500 transition-colors"
                        title="Copy JSON"
                      >
                        {copiedAnnotationId === annotation.id ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => downloadAnnotationJSON(annotation)}
                        className="p-2 text-gray-500 hover:text-primary-500 transition-colors"
                        title="Download JSON"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => toggleAnnotationExpansion(annotation.id)}
                        className="p-2 text-gray-500 hover:text-primary-500 transition-colors"
                        title="Toggle details"
                      >
                        {expandedAnnotations.has(annotation.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Scores */}
                  <div className="flex items-center space-x-4 mb-3">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBackground(annotation.fluency_score)} ${getScoreColor(annotation.fluency_score)}`}>
                      Fluency: {annotation.fluency_score || 'N/A'}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBackground(annotation.adequacy_score)} ${getScoreColor(annotation.adequacy_score)}`}>
                      Adequacy: {annotation.adequacy_score || 'N/A'}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBackground(annotation.overall_quality)} ${getScoreColor(annotation.overall_quality)}`}>
                      Overall: {annotation.overall_quality || 'N/A'}
                    </div>
                  </div>

                  {/* Source and Machine Translation */}
                  <div className="mb-3">
                    <div className="text-sm text-gray-600 mb-1">Source:</div>
                    <div className="bg-gray-50 p-3 rounded-lg text-sm">
                      {annotation.sentence.source_text}
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="text-sm text-gray-600 mb-1">Machine Translation:</div>
                    <div className="bg-gray-50 p-3 rounded-lg text-sm">
                      {renderHighlightedText(annotation.sentence.machine_translation, annotation.highlights)}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedAnnotations.has(annotation.id) && (
                    <div className="mt-4 space-y-4 border-t pt-4">
                      {annotation.final_form && (
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Final Form:</div>
                          <div className="bg-green-50 p-3 rounded-lg text-sm">
                            {annotation.final_form}
                          </div>
                        </div>
                      )}

                      {annotation.comments && (
                        <div>
                          <div className="text-sm text-gray-600 mb-1 flex items-center">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Comments:
                          </div>
                          <div className="bg-blue-50 p-3 rounded-lg text-sm">
                            {annotation.comments}
                          </div>
                        </div>
                      )}

                      {annotation.highlights && annotation.highlights.length > 0 && (
                        <div>
                          <div className="text-sm text-gray-600 mb-2">Error Highlights:</div>
                          <div className="space-y-2">
                            {annotation.highlights.map((highlight, index) => (
                              <div key={index} className="bg-yellow-50 p-3 rounded-lg text-sm">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-gray-700">
                                    {highlight.error_type}: "{highlight.highlighted_text}"
                                  </span>
                                </div>
                                {highlight.comment && (
                                  <div className="text-gray-600 text-xs">
                                    {highlight.comment}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* JSON Export */}
                      <div>
                        <div className="text-sm text-gray-600 mb-2">JSON Export:</div>
                        <pre className="bg-gray-100 p-3 rounded-lg text-xs overflow-x-auto">
                          {annotationsAPI.generateAnnotationJSON(annotation)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnnotatorTab;
