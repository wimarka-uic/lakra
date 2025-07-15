import React, { useState, useEffect } from 'react';
import { adminAPI, sentencesAPI, languageProficiencyAPI } from '../services/api';
import type { AdminStats, User, Sentence, Annotation, TextHighlight, LanguageProficiencyQuestion } from '../types';
import { Users, FileText, BarChart3, Plus, Filter, Home, MessageCircle, ChevronRight, Search, ChevronLeft, ChevronDown, Eye, EyeOff, Award, BookOpen, Edit, Trash2, Save, X, Upload, Download } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [sentenceAnnotations, setSentenceAnnotations] = useState<Map<number, Annotation[]>>(new Map());
  const [sentenceCounts, setSentenceCounts] = useState<{[key: string]: number}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'overview' | 'users' | 'sentences' | 'onboarding-tests'>('home');
  const [showAddSentence, setShowAddSentence] = useState(false);
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [expandedSentences, setExpandedSentences] = useState<Set<number>>(new Set());
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  
  // Analytics data
  const [analyticsData, setAnalyticsData] = useState({
    userGrowth: [] as Array<{month: string, users: number, annotations: number}>,
    errorTypeDistribution: [] as Array<{type: string, count: number, color: string, description: string}>,
    languageActivity: [] as Array<{language: string, sentences: number, annotations: number}>,
    dailyActivity: [] as Array<{date: string, annotations: number, evaluations: number}>,
    userRoleDistribution: [] as Array<{role: string, count: number, color: string}>,
    qualityMetrics: {
      averageQuality: 0,
      averageFluency: 0,
      averageAdequacy: 0,
      completionRate: 0
    }
  });
  
  // Pagination and search states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'most_annotated' | 'least_annotated'>('newest');
  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('compact');
  
  const [newSentence, setNewSentence] = useState({
    source_text: '',
    machine_translation: '',
    tagalog_source_text: '',
    source_language: 'en',
    target_language: 'tagalog',
    domain: '',
  });

  // Onboarding Test Questions state
  const [questions, setQuestions] = useState<LanguageProficiencyQuestion[]>([]);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<LanguageProficiencyQuestion | null>(null);
  const [questionLanguageFilter, setQuestionLanguageFilter] = useState<string>('all');
  const [questionTypeFilter, setQuestionTypeFilter] = useState<string>('all');
  const [questionDifficultyFilter, setQuestionDifficultyFilter] = useState<string>('all');
  const [questionSearchQuery, setQuestionSearchQuery] = useState('');
  const [questionCurrentPage, setQuestionCurrentPage] = useState(1);
  const [questionItemsPerPage, setQuestionItemsPerPage] = useState(10);
  const [questionSortBy, setQuestionSortBy] = useState<'newest' | 'oldest' | 'difficulty' | 'language'>('newest');
  const [newQuestion, setNewQuestion] = useState<Omit<LanguageProficiencyQuestion, 'id' | 'created_at' | 'updated_at' | 'created_by'>>({
    language: 'Tagalog',
    type: 'grammar',
    question: '',
    options: ['', '', '', ''],
    correct_answer: 0,
    explanation: '',
    difficulty: 'basic',
    is_active: true,
  });

  // CSV Import states
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [csvImportFile, setCsvImportFile] = useState<File | null>(null);
  const [csvImportResult, setCsvImportResult] = useState<{
    message: string;
    imported_count: number;
    skipped_count: number;
    total_rows: number;
    errors: string[];
  } | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle escape key to close modals
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showAddQuestion) {
          setShowAddQuestion(false);
        }
        if (showAddSentence) {
          setShowAddSentence(false);
        }
        if (showCSVImport) {
          setShowCSVImport(false);
        }
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showAddQuestion, showAddSentence, showCSVImport]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsData, usersData, countsData] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getAllUsers(),
        adminAPI.getSentenceCountsByLanguage(),
      ]);
      setStats(statsData);
      setUsers(usersData);
      setSentenceCounts(countsData);
      
      // Load real analytics data
      await loadAnalyticsData();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnalyticsData = async () => {
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      const [
        userGrowth,
        errorDistribution,
        languageActivity,
        dailyActivity,
        userRoleDistribution,
        qualityMetrics
      ] = await Promise.all([
        adminAPI.getUserGrowthAnalytics(6).catch(() => []),
        adminAPI.getErrorDistributionAnalytics().catch(() => []),
        adminAPI.getLanguageActivityAnalytics().catch(() => []),
        adminAPI.getDailyActivityAnalytics(7).catch(() => []),
        adminAPI.getUserRoleDistributionAnalytics().catch(() => []),
        adminAPI.getQualityMetricsAnalytics().catch(() => ({
          averageQuality: 0,
          averageFluency: 0,
          averageAdequacy: 0,
          completionRate: 0
        })),
      ]);

      setAnalyticsData({
        userGrowth: Array.isArray(userGrowth) ? userGrowth : [],
        errorTypeDistribution: Array.isArray(errorDistribution) ? errorDistribution : [],
        languageActivity: Array.isArray(languageActivity) ? languageActivity : [],
        dailyActivity: Array.isArray(dailyActivity) ? dailyActivity : [],
        userRoleDistribution: Array.isArray(userRoleDistribution) ? userRoleDistribution : [],
        qualityMetrics: {
          averageQuality: qualityMetrics?.averageQuality || 0,
          averageFluency: qualityMetrics?.averageFluency || 0,
          averageAdequacy: qualityMetrics?.averageAdequacy || 0,
          completionRate: qualityMetrics?.completionRate || 0
        }
      });
    } catch (error) {
      console.error('Error loading analytics data:', error);
      setAnalyticsError('Failed to load analytics data. Please try again.');
      // Fallback to empty data if analytics fail
      setAnalyticsData({
        userGrowth: [],
        errorTypeDistribution: [],
        languageActivity: [],
        dailyActivity: [],
        userRoleDistribution: [],
        qualityMetrics: {
          averageQuality: 0,
          averageFluency: 0,
          averageAdequacy: 0,
          completionRate: 0
        }
      });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const loadSentences = React.useCallback(async () => {
    try {
      const targetLanguage = languageFilter === 'all' ? undefined : languageFilter;
      const sentencesData = await adminAPI.getAdminSentences(0, 100, targetLanguage);
      setSentences(sentencesData);
      
      // Load annotations for each sentence
      const annotationsMap = new Map<number, Annotation[]>();
      for (const sentence of sentencesData) {
        try {
          const annotations = await adminAPI.getSentenceAnnotations(sentence.id);
          annotationsMap.set(sentence.id, annotations);
        } catch (error) {
          console.error(`Error loading annotations for sentence ${sentence.id}:`, error);
          annotationsMap.set(sentence.id, []);
        }
      }
      setSentenceAnnotations(annotationsMap);
    } catch (error) {
      console.error('Error loading sentences:', error);
    }
  }, [languageFilter]);

  useEffect(() => {
    if (activeTab === 'sentences') {
      loadSentences();
    }
  }, [activeTab, loadSentences]);

  const handleAddSentence = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sentencesAPI.createSentence(newSentence);
      setNewSentence({
        source_text: '',
        machine_translation: '',
        tagalog_source_text: '',
        source_language: 'en',
        target_language: 'tagalog',
        domain: '',
      });
      setShowAddSentence(false);
      await loadDashboardData();
      if (activeTab === 'sentences') {
        await loadSentences();
      }
    } catch (error) {
      console.error('Error adding sentence:', error);
    }
  };

  const handleCSVImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvImportFile) return;
    
    setIsImporting(true);
    try {
      const result = await sentencesAPI.importSentencesFromCSV(csvImportFile);
      setCsvImportResult(result);
      
      // Refresh data if import was successful
      if (result.imported_count > 0) {
        await loadDashboardData();
        if (activeTab === 'sentences') {
          await loadSentences();
        }
      }
    } catch (error) {
      console.error('Error importing CSV:', error);
      setCsvImportResult({
        message: 'Import failed',
        imported_count: 0,
        skipped_count: 0,
        total_rows: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred']
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvImportFile(file);
      setCsvImportResult(null);
    } else if (file) {
      alert('Please select a valid CSV file');
      e.target.value = '';
    }
  };

  const downloadCSVTemplate = () => {
    const csvContent = `source_text,machine_translation,source_language,target_language,domain
"Hello world","Kumusta mundo","en","tagalog","general"
"How are you?","Kumusta ka?","en","tagalog","conversation"
"Where is the hospital?","Nasaan ang ospital?","en","tagalog","medical"
"Good morning","Maayong buntag","en","cebuano","greetings"
"Where is the market?","Asa ang merkado?","en","cebuano","directions"
"Thank you very much","Agyamanak unay","en","ilocano","polite"
"The food is delicious","Naimas ti kanen","en","ilocano","food"`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sentences_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleToggleEvaluatorRole = async (userId: number) => {
    try {
      const updatedUser = await adminAPI.toggleEvaluatorRole(userId);
      // Update the user in the local state
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId ? updatedUser : user
        )
      );
    } catch (error) {
      console.error('Error toggling evaluator role:', error);
    }
  };

  // Define colors for different error types - updated to match AnnotationInterface
  const getErrorTypeStyle = (type: string) => {
    switch (type) {
      case 'MI_ST': 
        return 'bg-orange-100 border-b-2 border-orange-400 text-orange-800';
      case 'MI_SE': 
        return 'bg-blue-100 border-b-2 border-blue-400 text-blue-800';
      case 'MA_ST': 
        return 'bg-red-100 border-b-2 border-red-500 text-red-800';
      case 'MA_SE': 
        return 'bg-purple-100 border-b-2 border-purple-500 text-purple-800';
      default: 
        return 'bg-gray-100 border-b-2 border-gray-400 text-gray-800';
    }
  };
  
  const getErrorTypeLabel = (type: string) => {
    switch (type) {
      case 'MI_ST': 
        return 'Minor Syntactic Error';
      case 'MI_SE': 
        return 'Minor Semantic Error';
      case 'MA_ST': 
        return 'Major Syntactic Error';
      case 'MA_SE': 
        return 'Major Semantic Error';
      default: 
        return 'Unknown Error Type';
    }
  };

  const renderHighlightedText = (text: string, highlights: TextHighlight[], textType: 'machine' | 'reference') => {
    const relevantHighlights = highlights.filter(h => h.text_type === textType);

    if (relevantHighlights.length === 0) {
      return <span>{text}</span>;
    }

    // Sort highlights by start position and filter out invalid ones
    const validHighlights = relevantHighlights
      .filter(h => h.start_index >= 0 && h.end_index <= text.length && h.start_index < h.end_index)
      .sort((a, b) => a.start_index - b.start_index);
    
    if (validHighlights.length === 0) {
      return <span>{text}</span>;
    }

    const parts = [];
    let lastIndex = 0;

    validHighlights.forEach((highlight, index) => {
      // Ensure we don't have overlapping highlights by adjusting start position
      const startIndex = Math.max(highlight.start_index, lastIndex);
      const endIndex = Math.min(highlight.end_index, text.length);
      
      // Skip if this highlight would be empty after adjustments
      if (startIndex >= endIndex) return;

      // Add text before highlight
      if (startIndex > lastIndex) {
        parts.push(
          <span key={`text-${index}`}>
            {text.slice(lastIndex, startIndex)}
          </span>
        );
      }

      // Add highlighted text with error type styling
      const highlightedText = text.slice(startIndex, endIndex);
      const errorType = highlight.error_type || 'MI_ST';
      
      parts.push(
        <span
          key={`highlight-${highlight.id}`}
          className={`${getErrorTypeStyle(errorType)} px-1 rounded cursor-pointer relative group`}
          title={`[${errorType}] ${getErrorTypeLabel(errorType)}: ${highlight.comment}`}
        >
          <span className="text-xs font-bold text-gray-600">[{errorType}]</span>
          <span className="mx-1">{highlightedText}</span>
          <span className="text-xs font-bold text-gray-600">[/{errorType}]</span>
          <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block z-10">
            <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap max-w-xs">
              <div className="font-medium text-yellow-300 mb-1">
                [{errorType}] {getErrorTypeLabel(errorType)}
              </div>
              <div>{highlight.comment}</div>
            </div>
          </div>
        </span>
      );

      lastIndex = endIndex;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(
        <span key="text-end">
          {text.slice(lastIndex)}
        </span>
      );
    }

    return <>{parts}</>;
  };

  const toggleSentenceExpansion = (sentenceId: number) => {
    setExpandedSentences(prev => {
      const updated = new Set(prev);
      if (updated.has(sentenceId)) {
        updated.delete(sentenceId);
      } else {
        updated.add(sentenceId);
      }
      return updated;
    });
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 4) return 'text-green-600';
    if (score >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Filter, sort, and paginate sentences
  const filteredAndSortedSentences = React.useMemo(() => {
    let filtered = sentences;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(sentence => 
        sentence.source_text.toLowerCase().includes(query) ||
        sentence.machine_translation.toLowerCase().includes(query) ||
        (sentence.domain && sentence.domain.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      const aAnnotations = sentenceAnnotations.get(a.id) || [];
      const bAnnotations = sentenceAnnotations.get(b.id) || [];
      
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'most_annotated':
          return bAnnotations.length - aAnnotations.length;
        case 'least_annotated':
          return aAnnotations.length - bAnnotations.length;
        default:
          return 0;
      }
    });

    return sorted;
  }, [sentences, searchQuery, sortBy, sentenceAnnotations]);

  // Paginate sentences
  const paginatedSentences = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedSentences.slice(startIndex, endIndex);
  }, [filteredAndSortedSentences, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedSentences.length / itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, languageFilter]);

  const loadQuestions = React.useCallback(async () => {
    try {
      const questionsData = await languageProficiencyAPI.getAllQuestions();
      setQuestions(questionsData);
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'onboarding-tests') {
      loadQuestions();
    }
  }, [activeTab, loadQuestions]);

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await languageProficiencyAPI.createQuestion(newQuestion);
      setNewQuestion({
        language: 'Tagalog',
        type: 'grammar',
        question: '',
        options: ['', '', '', ''],
        correct_answer: 0,
        explanation: '',
        difficulty: 'basic',
        is_active: true,
      });
      setShowAddQuestion(false);
      await loadQuestions();
    } catch (error) {
      console.error('Error adding question:', error);
    }
  };

  const handleUpdateQuestion = async (question: LanguageProficiencyQuestion) => {
    try {
      await languageProficiencyAPI.updateQuestion(question.id, question);
      setEditingQuestion(null);
      await loadQuestions();
    } catch (error) {
      console.error('Error updating question:', error);
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await languageProficiencyAPI.deleteQuestion(questionId);
        await loadQuestions();
      } catch (error) {
        console.error('Error deleting question:', error);
      }
    }
  };

  const updateNewQuestionOption = (index: number, value: string) => {
    setNewQuestion(prev => ({
      ...prev,
      options: prev.options.map((option, i) => i === index ? value : option)
    }));
  };

  const updateEditingQuestionOption = (index: number, value: string) => {
    if (editingQuestion) {
      setEditingQuestion(prev => prev ? ({
        ...prev,
        options: prev.options.map((option, i) => i === index ? value : option)
      }) : null);
    }
  };

  // Filter, sort, and paginate questions
  const filteredAndSortedQuestions = React.useMemo(() => {
    let filtered = questions;

    // Apply filters
    if (questionLanguageFilter !== 'all') {
      filtered = filtered.filter(q => q.language.toLowerCase() === questionLanguageFilter.toLowerCase());
    }

    if (questionTypeFilter !== 'all') {
      filtered = filtered.filter(q => q.type === questionTypeFilter);
    }

    if (questionDifficultyFilter !== 'all') {
      filtered = filtered.filter(q => q.difficulty === questionDifficultyFilter);
    }

    // Apply search filter
    if (questionSearchQuery.trim()) {
      const query = questionSearchQuery.toLowerCase();
      filtered = filtered.filter(q => 
        q.question.toLowerCase().includes(query) ||
        q.explanation.toLowerCase().includes(query) ||
        q.options.some(option => option.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (questionSortBy) {
        case 'newest':
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        case 'oldest':
          return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
        case 'difficulty': {
          const difficultyOrder = { 'basic': 1, 'intermediate': 2, 'advanced': 3 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        }
        case 'language':
          return a.language.localeCompare(b.language);
        default:
          return 0;
      }
    });

    return sorted;
  }, [questions, questionLanguageFilter, questionTypeFilter, questionDifficultyFilter, questionSearchQuery, questionSortBy]);

  // Paginate questions
  const paginatedQuestions = React.useMemo(() => {
    const startIndex = (questionCurrentPage - 1) * questionItemsPerPage;
    const endIndex = startIndex + questionItemsPerPage;
    return filteredAndSortedQuestions.slice(startIndex, endIndex);
  }, [filteredAndSortedQuestions, questionCurrentPage, questionItemsPerPage]);

  const questionsTotalPages = Math.ceil(filteredAndSortedQuestions.length / questionItemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setQuestionCurrentPage(1);
  }, [questionSearchQuery, questionSortBy, questionLanguageFilter, questionTypeFilter, questionDifficultyFilter]);

  // Get question type color
  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case 'grammar': 
        return 'bg-blue-100 text-blue-800';
      case 'vocabulary': 
        return 'bg-green-100 text-green-800';
      case 'translation': 
        return 'bg-purple-100 text-purple-800';
      case 'cultural': 
        return 'bg-orange-100 text-orange-800';
      case 'comprehension': 
        return 'bg-red-100 text-red-800';
      default: 
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'basic': 
        return 'bg-green-100 text-green-800';
      case 'intermediate': 
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced': 
        return 'bg-red-100 text-red-800';
      default: 
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle browser extension interference
  useEffect(() => {
    // Prevent extension overlays from interfering with our modals
    const handleExtensionInterference = () => {
      // Remove any extension-created overlays that might interfere
      const extensionOverlays = document.querySelectorAll('[class*="autofill"], [class*="password"], [class*="extension"]');
      extensionOverlays.forEach(overlay => {
        if (overlay instanceof HTMLElement) {
          overlay.style.zIndex = '1';
          overlay.style.pointerEvents = 'none';
        }
      });
    };

    // Run on mount and when modals are shown
    handleExtensionInterference();
    
    // Set up observer to watch for extension interference
    const observer = new MutationObserver(handleExtensionInterference);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [showAddSentence, showCSVImport]);

  // Error boundary for extension-related errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Check if error is related to browser extensions
      if (event.error && event.error.message && 
          (event.error.message.includes('insertBefore') || 
           event.error.message.includes('autofill') ||
           event.error.message.includes('bootstrap'))) {
        console.warn('Browser extension interference detected, attempting to recover...');
        event.preventDefault();
        
        // Force a re-render to recover from extension interference
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto animate-pulse" />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="text-sm text-gray-500">
            {stats && `${stats.total_users} users • ${stats.total_sentences} sentences`}
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'home', label: 'Home', icon: Home },
              { key: 'overview', label: 'Overview', icon: BarChart3 },
              { key: 'users', label: 'Users', icon: Users },
              { key: 'sentences', label: 'Sentences', icon: FileText },
              { key: 'onboarding-tests', label: 'Onboarding Tests', icon: BookOpen },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as 'home' | 'overview' | 'users' | 'sentences' | 'onboarding-tests')}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-beauty-bush-500 text-beauty-bush-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Home Tab */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-beauty-bush-500 to-beauty-bush-600 rounded-lg p-8 text-white">
              <h2 className="text-3xl font-bold mb-2">Welcome to Lakra - Admin Panel</h2>
              <p className="text-beauty-bush-100 text-lg">
                Manage your translation system, monitor user activity, and oversee content management.
              </p>
            </div>

            {/* Quick Stats Overview */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg border shadow-sm p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-beauty-bush-100 rounded-lg">
                      <Users className="h-5 w-5 text-beauty-bush-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-xl font-bold text-gray-900">{stats.total_users}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg border shadow-sm p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Total Sentences</p>
                      <p className="text-xl font-bold text-gray-900">{stats.total_sentences}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg border shadow-sm p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Active Users</p>
                      <p className="text-xl font-bold text-gray-900">{stats.active_users}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('users')}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Users className="h-8 w-8 text-beauty-bush-500 mr-3" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Manage Users</p>
                    <p className="text-sm text-gray-500">View and manage user accounts</p>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('sentences')}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FileText className="h-8 w-8 text-green-500 mr-3" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Manage Content</p>
                    <p className="text-sm text-gray-500">Add and manage sentences</p>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('overview')}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <BarChart3 className="h-8 w-8 text-purple-500 mr-3" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">View Statistics</p>
                    <p className="text-sm text-gray-500">Check system analytics</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Activity Summary */}
            {stats && (
              <div className="bg-white rounded-lg border shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">User Activity</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Active Users</span>
                        <span className="text-sm font-medium">{stats.active_users}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Users</span>
                        <span className="text-sm font-medium">{stats.total_users}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Content Statistics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Sentences</span>
                        <span className="text-sm font-medium">{stats.total_sentences}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Available Languages</span>
                        <span className="text-sm font-medium">
                          {Object.keys(sentenceCounts).filter(key => key !== 'all' && sentenceCounts[key] > 0).length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Overview Tab - Bento Box Style */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* Analytics Header with Refresh */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-bold text-gray-900">Analytics Dashboard</h2>
                {analyticsLoading && (
                  <div className="flex items-center space-x-2 text-sm text-beauty-bush-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-beauty-bush-600"></div>
                    <span>Loading analytics...</span>
                  </div>
                )}
                {analyticsError && (
                  <div className="flex items-center space-x-2 text-sm text-red-600">
                    <span>⚠️ {analyticsError}</span>
                  </div>
                )}
              </div>
              <button
                onClick={loadAnalyticsData}
                disabled={analyticsLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-beauty-bush-600 text-white rounded-lg hover:bg-beauty-bush-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {analyticsLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <BarChart3 className="h-4 w-4" />
                )}
                <span>{analyticsLoading ? 'Refreshing...' : 'Refresh Analytics'}</span>
              </button>
            </div>
            
            {/* Bento Grid Layout */}
            <div className="grid grid-cols-12 gap-4 h-auto">
              
              {/* Top Row - Quick Stats */}
              <div className="col-span-12 md:col-span-3">
                              <div className="bg-gradient-to-br from-beauty-bush-500 to-beauty-bush-600 rounded-2xl p-6 text-white h-32">
                <div className="flex items-center justify-between h-full">
                  <div>
                    <p className="text-beauty-bush-100 text-sm font-medium">Total Users</p>
                    <p className="text-3xl font-bold">{stats.total_users}</p>
                    <p className="text-beauty-bush-200 text-xs">{stats.active_users} active</p>
                  </div>
                  <Users className="h-8 w-8 text-beauty-bush-200" />
                </div>
              </div>
              </div>

              <div className="col-span-12 md:col-span-3">
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white h-32">
                  <div className="flex items-center justify-between h-full">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Sentences</p>
                      <p className="text-3xl font-bold">{stats.total_sentences}</p>
                      <p className="text-green-200 text-xs">{Object.keys(sentenceCounts).filter(k => k !== 'all').length} languages</p>
                    </div>
                    <FileText className="h-8 w-8 text-green-200" />
                  </div>
                </div>
              </div>

              <div className="col-span-12 md:col-span-3">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white h-32">
                  <div className="flex items-center justify-between h-full">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Annotations</p>
                      <p className="text-3xl font-bold">{stats.total_annotations}</p>
                      <p className="text-purple-200 text-xs">{stats.completed_annotations} completed</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-purple-200" />
                  </div>
                </div>
              </div>

              <div className="col-span-12 md:col-span-3">
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white h-32">
                  <div className="flex items-center justify-between h-full">
                    <div>
                      <p className="text-emerald-100 text-sm font-medium">Completion</p>
                      <p className="text-3xl font-bold">{stats.total_annotations > 0 ? Math.round((stats.completed_annotations / stats.total_annotations) * 100) : 0}%</p>
                      <p className="text-emerald-200 text-xs">Quality rate</p>
                    </div>
                    <Award className="h-8 w-8 text-emerald-200" />
                  </div>
                </div>
              </div>

              {/* Large User Growth Chart */}
              <div className="col-span-12 lg:col-span-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-96">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">User Growth & Activity</h3>
                    <div className="flex space-x-4 text-sm">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                        <span className="text-gray-600">Users</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-gray-600">Annotations</span>
                      </div>
                    </div>
                  </div>
                  {analyticsLoading ? (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-sm">Loading growth data...</p>
                      </div>
                    </div>
                  ) : analyticsData.userGrowth.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <AreaChart data={analyticsData.userGrowth}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="month" 
                          tick={{fontSize: 12}} 
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis 
                          tick={{fontSize: 12}} 
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="users" 
                          stroke="#8b5cf6" 
                          fill="#8b5cf6" 
                          fillOpacity={0.6}
                          name="Users"
                          strokeWidth={2}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="annotations" 
                          stroke="#10b981" 
                          fill="#10b981" 
                          fillOpacity={0.6}
                          name="Annotations"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No growth data available</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quality Metrics Vertical Card */}
              <div className="col-span-12 lg:col-span-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-96">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Quality Metrics</h3>
                  {analyticsLoading ? (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-sm">Loading quality data...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-600">Overall Quality</span>
                          <span className="text-lg font-bold text-gray-900">{analyticsData.qualityMetrics.averageQuality}/5</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-beauty-bush-500 to-beauty-bush-600 h-3 rounded-full transition-all duration-300"
                            style={{width: `${Math.min((analyticsData.qualityMetrics.averageQuality / 5) * 100, 100)}%`}}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-600">Fluency</span>
                          <span className="text-lg font-bold text-gray-900">{analyticsData.qualityMetrics.averageFluency}/5</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-300"
                            style={{width: `${Math.min((analyticsData.qualityMetrics.averageFluency / 5) * 100, 100)}%`}}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-600">Adequacy</span>
                          <span className="text-lg font-bold text-gray-900">{analyticsData.qualityMetrics.averageAdequacy}/5</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                            style={{width: `${Math.min((analyticsData.qualityMetrics.averageAdequacy / 5) * 100, 100)}%`}}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-600">Completion Rate</span>
                          <span className="text-lg font-bold text-gray-900">{Math.round(analyticsData.qualityMetrics.completionRate)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full transition-all duration-300"
                            style={{width: `${Math.min(analyticsData.qualityMetrics.completionRate, 100)}%`}}
                          ></div>
                        </div>
                      </div>


                    </div>
                  )}
                </div>
              </div>

              {/* Error Distribution */}
              <div className="col-span-12 lg:col-span-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-80">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Error Distribution</h3>
                  {analyticsLoading ? (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-sm">Loading error data...</p>
                      </div>
                    </div>
                  ) : analyticsData.errorTypeDistribution.length > 0 ? (
                    <div className="flex items-start h-64">
                      <div className="flex-1 h-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={analyticsData.errorTypeDistribution}
                              cx="50%"
                              cy="50%"
                              innerRadius={35}
                              outerRadius={75}
                              paddingAngle={3}
                              dataKey="count"
                              label={false}
                            >
                              {analyticsData.errorTypeDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                              }}
                              formatter={(value, _name, props) => [
                                `${value} errors`, 
                                props.payload.type
                              ]}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="w-44 ml-4">
                        <div className="space-y-3">
                          {analyticsData.errorTypeDistribution.map((item, index) => (
                            <div key={index} className="flex items-start">
                              <div 
                                className="w-3 h-3 rounded-full mr-2 flex-shrink-0 mt-0.5"
                                style={{ backgroundColor: item.color }}
                              ></div>
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900">{item.type}</div>
                                <div className="text-xs text-gray-500">{item.count} errors</div>
                                <div className="text-xs text-gray-400">
                                  {analyticsData.errorTypeDistribution.reduce((sum, i) => sum + i.count, 0) > 0 
                                    ? Math.round((item.count / analyticsData.errorTypeDistribution.reduce((sum, i) => sum + i.count, 0)) * 100)
                                    : 0}%
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No error data available</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Language Activity */}
              <div className="col-span-12 lg:col-span-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-80">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Language Activity</h3>
                  {analyticsLoading ? (
                    <div className="flex items-center justify-center h-240 text-gray-500">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-sm">Loading language data...</p>
                      </div>
                    </div>
                  ) : analyticsData.languageActivity.length > 0 ? (
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={analyticsData.languageActivity} margin={{ top: 20, right: 30, left: 20, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="language" 
                          tick={{fontSize: 11}} 
                          angle={-45}
                          textAnchor="end"
                          height={60}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis 
                          tick={{fontSize: 12}} 
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Bar dataKey="sentences" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Sentences" />
                        <Bar dataKey="annotations" fill="#10b981" radius={[4, 4, 0, 0]} name="Annotations" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                      <div className="text-center">
                        <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No language data available</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Weekly Activity Trend */}
              <div className="col-span-12 lg:col-span-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-64">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Activity Trend</h3>
                  {analyticsLoading ? (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-sm">Loading activity data...</p>
                      </div>
                    </div>
                  ) : analyticsData.dailyActivity.length > 0 ? (
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={analyticsData.dailyActivity}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="date" 
                          tick={{fontSize: 12}} 
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis 
                          tick={{fontSize: 12}} 
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="annotations" 
                          stroke="#8b5cf6" 
                          strokeWidth={3}
                          dot={{fill: '#8b5cf6', strokeWidth: 2, r: 4}}
                          activeDot={{r: 6, fill: '#8b5cf6'}}
                          name="Annotations"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="evaluations" 
                          stroke="#f59e0b" 
                          strokeWidth={3}
                          dot={{fill: '#f59e0b', strokeWidth: 2, r: 4}}
                          activeDot={{r: 6, fill: '#f59e0b'}}
                          name="Evaluations"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No activity data available</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* User Role Distribution */}
              <div className="col-span-12 lg:col-span-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-64 flex flex-col">
                  <h3 className="text-lg font-semibold text-gray-900">User Roles</h3>
                  {analyticsLoading ? (
                    <div className="flex items-center justify-center flex-1 text-gray-500">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-sm">Loading user data...</p>
                      </div>
                    </div>
                  ) : analyticsData.userRoleDistribution.length > 0 && analyticsData.userRoleDistribution.some(role => role.count > 0) ? (
                    <div className="flex-1 flex flex-col justify-center pt-4">
                      <div className="space-y-3">
                        {analyticsData.userRoleDistribution
                          .filter(role => role.count > 0)
                          .map((role) => (
                            <div key={role.role} className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div
                                  className="w-4 h-4 rounded-full"
                                  style={{ backgroundColor: role.color }}
                                ></div>
                                <span className="text-sm font-medium text-gray-700">{role.role}</span>
                              </div>
                              <span className="text-sm font-bold text-gray-900">{role.count}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center flex-1 text-gray-500">
                      <div className="text-center">
                        <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No user data available</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-sm text-gray-500">@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-1">
                          {user.is_admin && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              Admin
                            </span>
                          )}
                          {user.is_evaluator && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Evaluator
                            </span>
                          )}
                          {!user.is_admin && !user.is_evaluator && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              User
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.is_active 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleToggleEvaluatorRole(user.id)}
                          className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                            user.is_evaluator
                              ? 'bg-red-100 text-red-800 hover:bg-red-200'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          {user.is_evaluator ? 'Remove Evaluator' : 'Make Evaluator'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Sentences Tab */}
        {activeTab === 'sentences' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Manage Sentences</h3>
                <p className="text-sm text-gray-600 mt-1">View and manage sentences with advanced error tagging annotations</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowCSVImport(true)}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>Import CSV</span>
                </button>
                <button
                  onClick={() => setShowAddSentence(true)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Sentence</span>
                </button>
              </div>
            </div>

            {/* CSV Import Modal */}
            {showCSVImport && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setShowCSVImport(false);
                    setCsvImportFile(null);
                    setCsvImportResult(null);
                  }
                }}
                style={{ zIndex: 9999 }}
              >
                <div 
                  className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                  style={{ zIndex: 10000 }}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Import Sentences from CSV</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCSVImport(false);
                        setCsvImportFile(null);
                        setCsvImportResult(null);
                      }}
                      className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  {/* CSV Format Guide */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">CSV Format Requirements</h4>
                    <div className="text-sm text-blue-800 space-y-2">
                      <p><strong>Required columns:</strong> source_text, machine_translation, source_language, target_language</p>
                      <p><strong>Optional columns:</strong> domain</p>
                      <p><strong>Supported source languages:</strong> en (English only)</p>
                      <p><strong>Supported target languages:</strong> tagalog (Filipino), cebuano, ilocano</p>
                    </div>
                    <button
                      onClick={downloadCSVTemplate}
                      className="mt-3 inline-flex items-center px-3 py-1 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-white hover:bg-blue-50 cursor-pointer"
                      type="button"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download Template
                    </button>
                  </div>

                  {/* File Upload */}
                  <form onSubmit={handleCSVImport} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select CSV File
                      </label>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                        required
                        style={{ zIndex: 'auto' }}
                      />
                      {csvImportFile && (
                        <p className="mt-2 text-sm text-gray-600">
                          Selected: {csvImportFile.name} ({(csvImportFile.size / 1024).toFixed(1)} KB)
                        </p>
                      )}
                    </div>

                    {/* Import Results */}
                    {csvImportResult && (
                      <div className={`p-4 rounded-lg border ${
                        csvImportResult.imported_count > 0 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-red-50 border-red-200'
                      }`}>
                        <h4 className="text-sm font-semibold mb-2">
                          {csvImportResult.imported_count > 0 ? 'Import Completed' : 'Import Failed'}
                        </h4>
                        <div className="text-sm space-y-1">
                          <p><strong>Imported:</strong> {csvImportResult.imported_count} sentences</p>
                          <p><strong>Skipped:</strong> {csvImportResult.skipped_count} rows</p>
                          <p><strong>Total processed:</strong> {csvImportResult.total_rows} rows</p>
                          {csvImportResult.errors.length > 0 && (
                            <div>
                              <p className="font-medium text-red-700 mt-2">Errors:</p>
                              <ul className="list-disc list-inside text-red-600 text-xs space-y-1 mt-1">
                                {csvImportResult.errors.map((error, index) => (
                                  <li key={index}>{error}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowCSVImport(false);
                          setCsvImportFile(null);
                          setCsvImportResult(null);
                        }}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!csvImportFile || isImporting}
                        className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isImporting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Importing...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4" />
                            <span>Import Sentences</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Error Type Classification Legend */}
            <div className="bg-gradient-to-r from-gray-50 to-beauty-bush-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <MessageCircle className="h-5 w-5 text-beauty-bush-600" />
                <h4 className="text-sm font-semibold text-gray-900">Error Classification System</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex items-center space-x-2 p-2 bg-white rounded border">
                  <div className="w-4 h-4 bg-orange-400 rounded-sm"></div>
                  <div>
                    <div className="text-xs font-medium text-orange-900">[MI_ST] Minor Syntactic</div>
                    <div className="text-xs text-gray-600">Grammar, word order issues</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-2 bg-white rounded border">
                  <div className="w-4 h-4 bg-blue-400 rounded-sm"></div>
                  <div>
                    <div className="text-xs font-medium text-blue-900">[MI_SE] Minor Semantic</div>
                    <div className="text-xs text-gray-600">Meaning, context errors</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-2 bg-white rounded border">
                  <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
                  <div>
                    <div className="text-xs font-medium text-red-900">[MA_ST] Major Syntactic</div>
                    <div className="text-xs text-gray-600">Serious grammar problems</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-2 bg-white rounded border">
                  <div className="w-4 h-4 bg-purple-500 rounded-sm"></div>
                  <div>
                    <div className="text-xs font-medium text-purple-900">[MA_SE] Major Semantic</div>
                    <div className="text-xs text-gray-600">Critical meaning errors</div>
                  </div>
                </div>
              </div>
              <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-xs text-blue-800">
                  <strong>How it works:</strong> Annotators select problematic text segments in machine translations and classify them by error type and severity. 
                  This creates detailed, structured feedback for improving translation quality.
                </p>
              </div>
            </div>

            {/* Annotation Statistics Summary */}
            {sentences.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Annotation Overview for {languageFilter === 'all' ? 'All Languages' : languageFilter.toUpperCase()}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(() => {
                    const totalAnnotations = Array.from(sentenceAnnotations.values()).flat().length;
                    const totalHighlights = Array.from(sentenceAnnotations.values()).flat().reduce((sum, a) => sum + (a.highlights?.length || 0), 0);
                    const annotatedSentences = Array.from(sentenceAnnotations.keys()).filter(id => {
                      const annotations = sentenceAnnotations.get(id);
                      return annotations && annotations.length > 0;
                    }).length;
                    const avgQualityScore = (() => {
                      const allAnnotations = Array.from(sentenceAnnotations.values()).flat();
                      const qualityScores = allAnnotations.filter(a => a.overall_quality).map(a => a.overall_quality!);
                      return qualityScores.length > 0 ? (qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length).toFixed(1) : 'N/A';
                    })();

                    return (
                      <>
                        <div className="text-center p-3 bg-beauty-bush-50 rounded border">
                          <div className="text-lg font-bold text-beauty-bush-600">{totalAnnotations}</div>
                          <div className="text-xs text-gray-600">Total Annotations</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded border">
                          <div className="text-lg font-bold text-purple-600">{totalHighlights}</div>
                          <div className="text-xs text-gray-600">Error Tags Applied</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded border">
                          <div className="text-lg font-bold text-green-600">{annotatedSentences}</div>
                          <div className="text-xs text-gray-600">Sentences Annotated</div>
                        </div>
                        <div className="text-center p-3 bg-yellow-50 rounded border">
                          <div className="text-lg font-bold text-yellow-600">{avgQualityScore}</div>
                          <div className="text-xs text-gray-600">Avg Quality Score</div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Search and Filter Controls */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search sentences, domains, or content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beauty-bush-500 focus:border-beauty-bush-500"
                  />
                </div>

                {/* Controls Row */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Language Filter */}
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <select
                      value={languageFilter}
                      onChange={(e) => setLanguageFilter(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-beauty-bush-500 focus:border-beauty-bush-500"
                    >
                      <option value="all">All Languages</option>
                      <option value="tagalog">Tagalog (Filipino)</option>
                      <option value="cebuano">Cebuano</option>
                      <option value="ilocano">Ilocano</option>
                    </select>
                  </div>

                  {/* Sort By */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'most_annotated' | 'least_annotated')}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-beauty-bush-500 focus:border-beauty-bush-500"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="most_annotated">Most Annotated</option>
                    <option value="least_annotated">Least Annotated</option>
                  </select>

                  {/* Items Per Page */}
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-beauty-bush-500 focus:border-beauty-bush-500"
                  >
                    <option value={5}>5 per page</option>
                    <option value={10}>10 per page</option>
                    <option value={20}>20 per page</option>
                    <option value={50}>50 per page</option>
                  </select>

                  {/* View Mode Toggle */}
                  <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                    <button
                      onClick={() => setViewMode('compact')}
                      className={`px-3 py-2 text-sm flex items-center space-x-1 ${
                        viewMode === 'compact' 
                          ? 'bg-beauty-bush-500 text-white' 
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Eye className="h-4 w-4" />
                      <span>Compact</span>
                    </button>
                    <button
                      onClick={() => setViewMode('detailed')}
                      className={`px-3 py-2 text-sm flex items-center space-x-1 ${
                        viewMode === 'detailed' 
                          ? 'bg-beauty-bush-500 text-white' 
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <EyeOff className="h-4 w-4" />
                      <span>Detailed</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Results Summary */}
              <div className="flex items-center justify-between text-sm text-gray-600 border-t pt-3">
                <span>
                  Showing {paginatedSentences.length} of {filteredAndSortedSentences.length} sentences
                  {searchQuery && (
                    <span className="ml-2">
                      for "<span className="font-medium text-gray-900">{searchQuery}</span>"
                    </span>
                  )}
                </span>
              </div>
            </div>

            {showAddSentence && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 extension-safe-modal"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setShowAddSentence(false);
                  }
                }}
              >
                <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto extension-safe-form">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Add New Sentence</h3>
                    <button
                      type="button"
                      onClick={() => setShowAddSentence(false)}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  
                  <form onSubmit={handleAddSentence} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Source Language
                        </label>
                        <select
                          value={newSentence.source_language}
                          onChange={(e) => setNewSentence({...newSentence, source_language: e.target.value})}
                          className="input-field autocomplete-off"
                          required
                        >
                          <option value="en">English</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Target Language
                        </label>
                        <select
                          value={newSentence.target_language}
                          onChange={(e) => setNewSentence({...newSentence, target_language: e.target.value})}
                          className="input-field autocomplete-off"
                          required
                        >
                          <option value="tagalog">Tagalog (Filipino)</option>
                          <option value="cebuano">Cebuano</option>
                          <option value="ilocano">Ilocano</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Source Text
                      </label>
                      <textarea
                        value={newSentence.source_text}
                        onChange={(e) => setNewSentence({...newSentence, source_text: e.target.value})}
                        className="textarea-field autocomplete-off"
                        required
                        placeholder="Enter the source text..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Machine Translation
                      </label>
                      <textarea
                        value={newSentence.machine_translation}
                        onChange={(e) => setNewSentence({...newSentence, machine_translation: e.target.value})}
                        className="textarea-field autocomplete-off"
                        required
                        placeholder="Enter the machine translation..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tagalog Source Text (Optional)
                      </label>
                      <textarea
                        value={newSentence.tagalog_source_text}
                        onChange={(e) => setNewSentence({...newSentence, tagalog_source_text: e.target.value})}
                        className="textarea-field autocomplete-off"
                        placeholder="Enter the Tagalog source text if available..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Domain (Optional)
                      </label>
                      <input
                        type="text"
                        value={newSentence.domain}
                        onChange={(e) => setNewSentence({...newSentence, domain: e.target.value})}
                        className="input-field autocomplete-off"
                        placeholder="e.g., Technology, Education, Healthcare..."
                      />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowAddSentence(false)}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn-primary"
                      >
                        Add Sentence
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Sentences List */}
            <div className="bg-white border-2 border-gray-200 rounded-xl shadow-lg overflow-hidden">
              <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-6 w-6 text-gray-600" />
                    <h4 className="text-lg font-bold text-gray-900">
                      Sentences ({sentences.length})
                    </h4>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Showing:</span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-beauty-bush-100 text-beauty-bush-800 border border-beauty-bush-200">
                      {languageFilter === 'all' ? 'All Languages' : languageFilter.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Error Type Legend */}
                <div className="mt-4 p-4 bg-white rounded-lg border-2 border-gray-200">
                  <h5 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
                                                      <span className="w-2 h-2 bg-beauty-bush-500 rounded-full mr-2"></span>
                    Error Type Legend
                  </h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div className="flex items-center space-x-1">
                      <span className="px-2 py-1 rounded bg-orange-100 border-b-2 border-orange-400 text-orange-800 font-bold">MI_ST</span>
                      <span className="text-gray-600">Minor Syntactic</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="px-2 py-1 rounded bg-blue-100 border-b-2 border-blue-400 text-blue-800 font-bold">MI_SE</span>
                      <span className="text-gray-600">Minor Semantic</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="px-2 py-1 rounded bg-red-100 border-b-2 border-red-500 text-red-800 font-bold">MA_ST</span>
                      <span className="text-gray-600">Major Syntactic</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="px-2 py-1 rounded bg-purple-100 border-b-2 border-purple-500 text-purple-800 font-bold">MA_SE</span>
                      <span className="text-gray-600">Major Semantic</span>
                    </div>
                  </div>
                </div>
              </div>
              {paginatedSentences.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {paginatedSentences.map((sentence) => {
                    const annotations = sentenceAnnotations.get(sentence.id) || [];
                    const isExpanded = expandedSentences.has(sentence.id);
                    const allHighlights = annotations.flatMap(ann => ann.highlights || []);
                    
                    return (
                      <div key={sentence.id} className="hover:bg-gray-50 transition-colors duration-200">
                        {/* Compact Header */}
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-beauty-bush-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-bold text-beauty-bush-700">#{sentence.id}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                                    <span className="text-xs px-2 py-1 bg-beauty-bush-500 text-white rounded font-medium">
                      {sentence.source_language.toUpperCase()} → {sentence.target_language.toUpperCase()}
                    </span>
                                {sentence.domain && (
                                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                    {sentence.domain}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              {annotations.length > 0 && (
                                <div className="flex items-center space-x-2 text-xs">
                                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded font-medium">
                                    {annotations.length} annotations
                                  </span>
                                  {allHighlights.length > 0 && (
                                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded font-medium">
                                      {allHighlights.length} tags
                                    </span>
                                  )}
                                </div>
                              )}
                              <button
                                onClick={() => toggleSentenceExpansion(sentence.id)}
                                className="flex items-center space-x-1 text-sm text-beauty-bush-600 hover:text-beauty-bush-800 font-medium"
                              >
                                <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
                                <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                              </button>
                            </div>
                          </div>

                          {/* Compact Content Preview */}
                          {viewMode === 'compact' && !isExpanded && (
                            <div className="space-y-2">
                              <div className="text-sm text-gray-700 line-clamp-2">
                                <strong>Source:</strong> {sentence.source_text.substring(0, 100)}
                                {sentence.source_text.length > 100 && '...'}
                              </div>
                              <div className="text-sm text-gray-700 line-clamp-2">
                                <strong>Translation:</strong> {sentence.machine_translation.substring(0, 100)}
                                {sentence.machine_translation.length > 100 && '...'}
                              </div>
                            </div>
                          )}

                          {/* Detailed Content */}
                          {(viewMode === 'detailed' || isExpanded) && (
                            <div className="space-y-4 border-t pt-4">
                              {/* Source Text */}
                              <div className="bg-beauty-bush-50 border-l-4 border-beauty-bush-400 p-3 rounded-r-lg">
                                <h5 className="text-xs font-medium text-beauty-bush-900 mb-2 uppercase tracking-wide">
                                  Source Text ({sentence.source_language.toUpperCase()})
                                </h5>
                                <p className="text-sm text-gray-900 leading-relaxed">{sentence.source_text}</p>
                              </div>

                              {/* Tagalog Source (if available) */}
                              {sentence.tagalog_source_text && (
                                <div className="bg-emerald-50 border-l-4 border-emerald-400 p-3 rounded-r-lg">
                                  <h5 className="text-xs font-medium text-emerald-900 mb-2 uppercase tracking-wide">
                                    Tagalog Source Text
                                  </h5>
                                  <p className="text-sm text-gray-900 leading-relaxed">{sentence.tagalog_source_text}</p>
                                </div>
                              )}

                              {/* Machine Translation with Tags */}
                              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-lg p-3">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h5 className="text-xs font-medium text-purple-900 uppercase tracking-wide">
                                    Machine Translation with Error Tags
                                  </h5>
                                  {allHighlights.length > 0 && (
                                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                                      {allHighlights.length} annotations
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-900 leading-relaxed bg-white border border-purple-100 rounded p-3">
                                  {renderHighlightedText(sentence.machine_translation, allHighlights, 'machine')}
                                </div>
                                {allHighlights.length === 0 && (
                                  <div className="mt-2 text-xs text-gray-500 italic">
                                    No error annotations yet.
                                  </div>
                                )}
                              </div>

                              {/* Annotations Summary - Only if expanded */}
                              {isExpanded && annotations.length > 0 && (
                                <div className="bg-white border border-gray-300 rounded-lg p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <h5 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center">
                                      <MessageCircle className="h-4 w-4 mr-2 text-gray-600" />
                                      Advanced Error Annotations ({annotations.length})
                                    </h5>
                                  </div>
                                  
                                  {/* Quick Stats */}
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                                              <div className="text-center p-2 bg-beauty-bush-50 rounded">
                            <div className="text-xs text-gray-600">Completed</div>
                            <div className="text-sm font-bold text-beauty-bush-600">
                              {annotations.filter(a => a.annotation_status === 'completed').length}
                            </div>
                          </div>
                                    <div className="text-center p-2 bg-yellow-50 rounded">
                                      <div className="text-xs text-gray-600">In Progress</div>
                                      <div className="text-sm font-bold text-yellow-600">
                                        {annotations.filter(a => a.annotation_status === 'in_progress').length}
                                      </div>
                                    </div>
                                    <div className="text-center p-2 bg-green-50 rounded">
                                      <div className="text-xs text-gray-600">Avg Quality</div>
                                      {annotations.filter(a => a.overall_quality).length > 0 ? (
                                        <div className={`text-sm font-bold ${getScoreColor((annotations.reduce((sum, a) => sum + (a.overall_quality || 0), 0) / annotations.filter(a => a.overall_quality).length))}`}>
                                          {(annotations.reduce((sum, a) => sum + (a.overall_quality || 0), 0) / annotations.filter(a => a.overall_quality).length).toFixed(1)}
                                        </div>
                                      ) : (
                                        <div className="text-sm font-bold text-gray-600">
                                          N/A
                                        </div>
                                      )}
                                    </div>
                                    <div className="text-center p-2 bg-purple-50 rounded">
                                      <div className="text-xs text-gray-600">Error Tags</div>
                                      <div className="text-sm font-bold text-purple-600">
                                        {allHighlights.length}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Error Type Distribution */}
                                  {allHighlights.length > 0 && (
                                    <div className="mb-4">
                                      <h6 className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">Error Type Distribution</h6>
                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        {(() => {
                                          const errorTypeCounts = allHighlights.reduce((acc, h) => {
                                            const type = h.error_type || 'MI_SE';
                                            acc[type] = (acc[type] || 0) + 1;
                                            return acc;
                                          }, {} as {[key: string]: number});

                                          return Object.entries(errorTypeCounts).map(([type, count]) => (
                                            <div key={type} className="text-center p-2 rounded-lg border-2 transition-all hover:shadow-md" 
                                                 style={{
                                                   backgroundColor: getErrorTypeStyle(type).includes('orange') ? '#fff7ed' :
                                                                  getErrorTypeStyle(type).includes('blue') ? '#eff6ff' :
                                                                  getErrorTypeStyle(type).includes('red') ? '#fef2f2' :
                                                                  getErrorTypeStyle(type).includes('purple') ? '#faf5ff' : '#f9fafb',
                                                   borderColor: getErrorTypeStyle(type).includes('orange') ? '#fb923c' :
                                                               getErrorTypeStyle(type).includes('blue') ? '#60a5fa' :
                                                               getErrorTypeStyle(type).includes('red') ? '#f87171' :
                                                               getErrorTypeStyle(type).includes('purple') ? '#c084fc' : '#9ca3af'
                                                 }}>
                                              <div className="text-xs text-gray-600 font-medium">[{type}]</div>
                                              <div className="text-lg font-bold" style={{
                                                color: getErrorTypeStyle(type).includes('orange') ? '#ea580c' :
                                                       getErrorTypeStyle(type).includes('blue') ? '#2563eb' :
                                                       getErrorTypeStyle(type).includes('red') ? '#dc2626' :
                                                       getErrorTypeStyle(type).includes('purple') ? '#9333ea' : '#374151'
                                              }}>
                                                {count}
                                              </div>
                                              <div className="text-xs text-gray-500">{getErrorTypeLabel(type).split(' ')[0]} {getErrorTypeLabel(type).split(' ')[1]}</div>
                                            </div>
                                          ));
                                        })()}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <FileText className="h-8 w-8 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No sentences found</h3>
                      <p className="text-gray-500">
                        {searchQuery ? (
                          <>No sentences match your search criteria.</>
                        ) : (
                          <>No sentences available for the selected language filter: <span className="font-semibold">{languageFilter === 'all' ? 'All Languages' : languageFilter.toUpperCase()}</span></>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowAddSentence(true)}
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-beauty-bush-600 hover:bg-beauty-bush-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-beauty-bush-500 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Sentence
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing page {currentPage} of {totalPages} 
                    <span className="ml-2 text-gray-500">
                      ({((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredAndSortedSentences.length)} of {filteredAndSortedSentences.length} total)
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>Previous</span>
                    </button>
                    
                    {/* Page Numbers */}
                    <div className="flex items-center space-x-1">
                      {(() => {
                        const pages = [];
                        const showPages = 5;
                        let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
                        const endPage = Math.min(totalPages, startPage + showPages - 1);
                        
                        if (endPage - startPage + 1 < showPages) {
                          startPage = Math.max(1, endPage - showPages + 1);
                        }
                        
                        for (let i = startPage; i <= endPage; i++) {
                          pages.push(
                            <button
                              key={i}
                              onClick={() => setCurrentPage(i)}
                              className={`px-3 py-2 text-sm font-medium rounded-md ${
                                i === currentPage
                                  ? 'bg-beauty-bush-600 text-white'
                                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {i}
                            </button>
                          );
                        }
                        return pages;
                      })()}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                    >
                      <span>Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Onboarding Tests Tab */}
        {activeTab === 'onboarding-tests' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Manage Onboarding Test Questions</h3>
                <p className="text-sm text-gray-600 mt-1">Create and manage language proficiency questions for user onboarding</p>
              </div>
              <button
                onClick={() => setShowAddQuestion(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Question</span>
              </button>
            </div>

            {/* Question Statistics */}
            {questions.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-beauty-bush-100 rounded-lg">
                      <BookOpen className="h-5 w-5 text-beauty-bush-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Total Questions</p>
                      <p className="text-xl font-bold text-gray-900">{questions.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Eye className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Active Questions</p>
                      <p className="text-xl font-bold text-gray-900">{questions.filter(q => q.is_active).length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Filter className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Languages</p>
                      <p className="text-xl font-bold text-gray-900">{[...new Set(questions.map(q => q.language))].length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Award className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Question Types</p>
                      <p className="text-xl font-bold text-gray-900">{[...new Set(questions.map(q => q.type))].length}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Search and Filter Controls */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search questions, explanations, or options..."
                    value={questionSearchQuery}
                    onChange={(e) => setQuestionSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beauty-bush-500 focus:border-beauty-bush-500"
                  />
                </div>

                {/* Controls Row */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Language Filter */}
                  <select
                    value={questionLanguageFilter}
                    onChange={(e) => setQuestionLanguageFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Languages</option>
                    <option value="tagalog">Tagalog (Filipino)</option>
                    <option value="cebuano">Cebuano</option>
                    <option value="ilocano">Ilocano</option>
                  </select>

                  {/* Type Filter */}
                  <select
                    value={questionTypeFilter}
                    onChange={(e) => setQuestionTypeFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Types</option>
                    <option value="grammar">Grammar</option>
                    <option value="vocabulary">Vocabulary</option>
                    <option value="translation">Translation</option>
                    <option value="cultural">Cultural</option>
                    <option value="comprehension">Comprehension</option>
                  </select>

                  {/* Difficulty Filter */}
                  <select
                    value={questionDifficultyFilter}
                    onChange={(e) => setQuestionDifficultyFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Difficulties</option>
                    <option value="basic">Basic</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>

                  {/* Sort By */}
                  <select
                    value={questionSortBy}
                    onChange={(e) => setQuestionSortBy(e.target.value as 'newest' | 'oldest' | 'difficulty' | 'language')}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="difficulty">By Difficulty</option>
                    <option value="language">By Language</option>
                  </select>

                  {/* Items Per Page */}
                  <select
                    value={questionItemsPerPage}
                    onChange={(e) => setQuestionItemsPerPage(Number(e.target.value))}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={5}>5 per page</option>
                    <option value={10}>10 per page</option>
                    <option value={20}>20 per page</option>
                    <option value={50}>50 per page</option>
                  </select>
                </div>
              </div>

              {/* Results Summary */}
              <div className="flex items-center justify-between text-sm text-gray-600 border-t pt-3">
                <span>
                  Showing {paginatedQuestions.length} of {filteredAndSortedQuestions.length} questions
                  {questionSearchQuery && (
                    <span className="ml-2">
                      for "<span className="font-medium text-gray-900">{questionSearchQuery}</span>"
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Add Question Modal */}
            {showAddQuestion && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setShowAddQuestion(false);
                  }
                }}
              >
                <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Add New Question</h3>
                    <button
                      type="button"
                      onClick={() => setShowAddQuestion(false)}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  
                  <form onSubmit={handleAddQuestion} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Language
                        </label>
                        <select
                          value={newQuestion.language}
                          onChange={(e) => setNewQuestion({...newQuestion, language: e.target.value})}
                          className="input-field"
                          required
                        >
                          <option value="Tagalog">Tagalog (Filipino)</option>
                          <option value="Cebuano">Cebuano</option>
                          <option value="Ilocano">Ilocano</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Question Type
                        </label>
                        <select
                          value={newQuestion.type}
                          onChange={(e) => setNewQuestion({...newQuestion, type: e.target.value as 'grammar' | 'vocabulary' | 'translation' | 'cultural' | 'comprehension'})}
                          className="input-field"
                          required
                        >
                          <option value="grammar">Grammar</option>
                          <option value="vocabulary">Vocabulary</option>
                          <option value="translation">Translation</option>
                          <option value="cultural">Cultural</option>
                          <option value="comprehension">Comprehension</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Difficulty
                        </label>
                        <select
                          value={newQuestion.difficulty}
                          onChange={(e) => setNewQuestion({...newQuestion, difficulty: e.target.value as 'basic' | 'intermediate' | 'advanced'})}
                          className="input-field"
                          required
                        >
                          <option value="basic">Basic</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Question
                      </label>
                      <textarea
                        value={newQuestion.question}
                        onChange={(e) => setNewQuestion({...newQuestion, question: e.target.value})}
                        className="textarea-field"
                        rows={3}
                        required
                        placeholder="Enter the question text..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Answer Options
                      </label>
                      <div className="space-y-2">
                        {newQuestion.options.map((option, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="correct_answer"
                              checked={newQuestion.correct_answer === index}
                              onChange={() => setNewQuestion({...newQuestion, correct_answer: index})}
                              className="radio-field"
                            />
                            <span className="text-sm font-medium text-gray-700 w-8">{String.fromCharCode(65 + index)}.</span>
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => updateNewQuestionOption(index, e.target.value)}
                              className="input-field flex-1"
                              placeholder={`Option ${String.fromCharCode(65 + index)}`}
                              required
                            />
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Select the correct answer by clicking the radio button</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Explanation
                      </label>
                      <textarea
                        value={newQuestion.explanation}
                        onChange={(e) => setNewQuestion({...newQuestion, explanation: e.target.value})}
                        className="textarea-field"
                        rows={3}
                        required
                        placeholder="Explain why this is the correct answer..."
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={newQuestion.is_active}
                        onChange={(e) => setNewQuestion({...newQuestion, is_active: e.target.checked})}
                        className="checkbox-field"
                      />
                      <label htmlFor="is_active" className="text-sm text-gray-700 cursor-pointer">
                        Question is active
                      </label>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowAddQuestion(false)}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn-primary"
                      >
                        Add Question
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Questions List */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {paginatedQuestions.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {paginatedQuestions.map((question) => (
                    <div key={question.id} className="p-6 hover:bg-gray-50">
                      {editingQuestion?.id === question.id ? (
                        // Edit Mode
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                              <select
                                value={editingQuestion.language}
                                onChange={(e) => setEditingQuestion({...editingQuestion, language: e.target.value})}
                                className="input-field"
                              >
                                <option value="Tagalog">Tagalog (Filipino)</option>
                                <option value="Cebuano">Cebuano</option>
                                <option value="Ilocano">Ilocano</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                              <select
                                value={editingQuestion.type}
                                onChange={(e) => setEditingQuestion({...editingQuestion, type: e.target.value as 'grammar' | 'vocabulary' | 'translation' | 'cultural' | 'comprehension'})}
                                className="input-field"
                              >
                                <option value="grammar">Grammar</option>
                                <option value="vocabulary">Vocabulary</option>
                                <option value="translation">Translation</option>
                                <option value="cultural">Cultural</option>
                                <option value="comprehension">Comprehension</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                              <select
                                value={editingQuestion.difficulty}
                                onChange={(e) => setEditingQuestion({...editingQuestion, difficulty: e.target.value as 'basic' | 'intermediate' | 'advanced'})}
                                className="input-field"
                              >
                                <option value="basic">Basic</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                              </select>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                            <textarea
                              value={editingQuestion.question}
                              onChange={(e) => setEditingQuestion({...editingQuestion, question: e.target.value})}
                              className="textarea-field"
                              rows={3}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Answer Options</label>
                            <div className="space-y-2">
                              {editingQuestion.options.map((option, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    name="edit_correct_answer"
                                    checked={editingQuestion.correct_answer === index}
                                    onChange={() => setEditingQuestion({...editingQuestion, correct_answer: index})}
                                    className="radio-field"
                                  />
                                  <span className="text-sm font-medium text-gray-700 w-8">{String.fromCharCode(65 + index)}.</span>
                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => updateEditingQuestionOption(index, e.target.value)}
                                    className="input-field flex-1"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Explanation</label>
                            <textarea
                              value={editingQuestion.explanation}
                              onChange={(e) => setEditingQuestion({...editingQuestion, explanation: e.target.value})}
                              className="textarea-field"
                              rows={3}
                            />
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`edit_is_active_${question.id}`}
                              checked={editingQuestion.is_active}
                              onChange={(e) => setEditingQuestion({...editingQuestion, is_active: e.target.checked})}
                              className="checkbox-field"
                            />
                            <label htmlFor={`edit_is_active_${question.id}`} className="text-sm text-gray-700 cursor-pointer">
                              Question is active
                            </label>
                          </div>
                          
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => setEditingQuestion(null)}
                              className="btn-secondary flex items-center space-x-1"
                            >
                              <X className="h-4 w-4" />
                              <span>Cancel</span>
                            </button>
                            <button
                              onClick={() => handleUpdateQuestion(editingQuestion)}
                              className="btn-primary flex items-center space-x-1"
                            >
                              <Save className="h-4 w-4" />
                              <span>Save</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-beauty-bush-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-bold text-beauty-bush-700">#{question.id}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs px-2 py-1 bg-beauty-bush-500 text-white rounded font-medium">
                                  {question.language}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded font-medium ${getQuestionTypeColor(question.type)}`}>
                                  {question.type}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded font-medium ${getDifficultyColor(question.difficulty)}`}>
                                  {question.difficulty}
                                </span>
                                {question.is_active ? (
                                  <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded font-medium">
                                    Active
                                  </span>
                                ) : (
                                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded font-medium">
                                    Inactive
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setEditingQuestion(question)}
                                className="text-blue-600 hover:text-blue-800 p-1"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteQuestion(question.id)}
                                className="text-red-600 hover:text-red-800 p-1"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="bg-beauty-bush-50 border-l-4 border-beauty-bush-400 p-3 rounded-r-lg">
                            <h5 className="text-sm font-medium text-beauty-bush-900 mb-2">Question</h5>
                            <p className="text-gray-900">{question.question}</p>
                          </div>
                          
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <h5 className="text-sm font-medium text-gray-700 mb-3">Answer Options</h5>
                            <div className="space-y-2">
                              {question.options.map((option, index) => (
                                <div key={index} className={`flex items-center space-x-2 p-2 rounded ${
                                  index === question.correct_answer ? 'bg-green-100 border border-green-300' : 'bg-white border border-gray-200'
                                }`}>
                                  <span className="text-sm font-medium text-gray-700 w-8">{String.fromCharCode(65 + index)}.</span>
                                  <span className="text-sm text-gray-900">{option}</span>
                                  {index === question.correct_answer && (
                                    <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full font-medium">
                                      Correct
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r-lg">
                            <h5 className="text-sm font-medium text-yellow-900 mb-2">Explanation</h5>
                            <p className="text-gray-900">{question.explanation}</p>
                          </div>
                          
                          {question.created_at && (
                            <div className="text-xs text-gray-500">
                              Created: {new Date(question.created_at).toLocaleString()}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <BookOpen className="h-8 w-8 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
                      <p className="text-gray-500">
                        {questionSearchQuery ? (
                          <>No questions match your search criteria.</>
                        ) : (
                          <>No questions available for the selected filters.</>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowAddQuestion(true)}
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-beauty-bush-600 hover:bg-beauty-bush-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-beauty-bush-500 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Question
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {questionsTotalPages > 1 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing page {questionCurrentPage} of {questionsTotalPages} 
                    <span className="ml-2 text-gray-500">
                      ({((questionCurrentPage - 1) * questionItemsPerPage) + 1}-{Math.min(questionCurrentPage * questionItemsPerPage, filteredAndSortedQuestions.length)} of {filteredAndSortedQuestions.length} total)
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setQuestionCurrentPage(Math.max(1, questionCurrentPage - 1))}
                      disabled={questionCurrentPage === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>Previous</span>
                    </button>
                    
                    {/* Page Numbers */}
                    <div className="flex items-center space-x-1">
                      {(() => {
                        const pages = [];
                        const showPages = 5;
                        let startPage = Math.max(1, questionCurrentPage - Math.floor(showPages / 2));
                        const endPage = Math.min(questionsTotalPages, startPage + showPages - 1);
                        
                        if (endPage - startPage + 1 < showPages) {
                          startPage = Math.max(1, endPage - showPages + 1);
                        }
                        
                        for (let i = startPage; i <= endPage; i++) {
                          pages.push(
                            <button
                              key={i}
                              onClick={() => setQuestionCurrentPage(i)}
                              className={`px-3 py-2 text-sm font-medium rounded-md ${
                                i === questionCurrentPage
                                  ? 'bg-beauty-bush-600 text-white'
                                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {i}
                            </button>
                          );
                        }
                        return pages;
                      })()}
                    </div>
                    
                    <button
                      onClick={() => setQuestionCurrentPage(Math.min(questionsTotalPages, questionCurrentPage + 1))}
                      disabled={questionCurrentPage === questionsTotalPages}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                    >
                      <span>Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;