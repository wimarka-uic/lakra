import React, { useState, useEffect } from 'react';
import { adminAPI, sentencesAPI, languageProficiencyAPI } from '../services/supabase-api';
import type { AdminStats, User, Sentence, Annotation, TextHighlight, LanguageProficiencyQuestion } from '../types';
import { logger } from '../utils/logger';
import { Users, FileText, BarChart3, Plus, Filter, Home, MessageCircle, ChevronRight, Search, ChevronLeft, ChevronDown, Eye, EyeOff, Award, BookOpen, Edit, Trash2, Save, X, Upload, Download, UserCheck, UserX, Key, Play, Pause, Volume2 } from 'lucide-react';
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
import { useLocation, useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [sentenceAnnotations, setSentenceAnnotations] = useState<Map<number, Annotation[]>>(new Map());
  const [sentenceCounts, setSentenceCounts] = useState<{[key: string]: number}>({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Get active tab from URL
  const getActiveTabFromUrl = (): 'home' | 'overview' | 'users' | 'sentences' | 'onboarding-tests' => {
    const path = location.pathname;
    if (path.includes('/overview')) return 'overview';
    if (path.includes('/users')) return 'users';
    if (path.includes('/sentences')) return 'sentences';
    if (path.includes('/onboarding-tests')) return 'onboarding-tests';
    return 'home';
  };
  
  const [activeTab, setActiveTab] = useState<'home' | 'overview' | 'users' | 'sentences' | 'onboarding-tests'>(getActiveTabFromUrl());

  // Update active tab when URL changes
  useEffect(() => {
    setActiveTab(getActiveTabFromUrl());
  }, [location.pathname]);

  // Handle tab navigation
  const handleTabChange = (tab: 'home' | 'overview' | 'users' | 'sentences' | 'onboarding-tests') => {
    setActiveTab(tab);
    const basePath = '/admin';
    const tabPath = tab === 'home' ? '' : `/${tab}`;
    navigate(basePath + tabPath);
  };

  const [showAddSentence, setShowAddSentence] = useState(false);
  const [showEditSentence, setShowEditSentence] = useState(false);
  const [editingSentence, setEditingSentence] = useState<Sentence | null>(null);
  const [showDeleteSentenceConfirm, setShowDeleteSentenceConfirm] = useState(false);
  const [deletingSentence, setDeletingSentence] = useState<Sentence | null>(null);
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
    back_translation: '',
    source_language: 'en',
    target_language: 'tgl',
    domain: '',
    domains: 'conversational',
    custom_domain: '',
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
  
  // Audio playback state
  const [audioState, setAudioState] = useState<{
    [key: string]: { isPlaying: boolean; audio: HTMLAudioElement | null }
  }>({});
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

  // User Management states
  const [showEditUser, setShowEditUser] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [userFilter, setUserFilter] = useState({
    role: 'all',
    active: 'all',
    search: ''
  });
  const [editUser, setEditUser] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    is_active: true,
    is_admin: false,
    is_evaluator: false,
    languages: ['en']
  });
  const [usersPagination, setUsersPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalUsers: 0
  });
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

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
        if (showEditSentence) {
          setShowEditSentence(false);
          setEditingSentence(null);
        }
        if (showDeleteSentenceConfirm) {
          setShowDeleteSentenceConfirm(false);
          setDeletingSentence(null);
        }
        if (showCSVImport) {
          setShowCSVImport(false);
        }

        if (showEditUser) {
          setShowEditUser(false);
        }
        if (showDeleteConfirm) {
          setShowDeleteConfirm(false);
        }
        if (showUserDetails) {
          setShowUserDetails(false);
        }
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showAddQuestion, showAddSentence, showEditSentence, showDeleteSentenceConfirm, showCSVImport, showEditUser, showDeleteConfirm, showUserDetails]);

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
      logger.apiError('loadDashboardData', error as Error, {
        component: 'AdminDashboard'
      });
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
      logger.apiError('loadAnalyticsData', error as Error, {
        component: 'AdminDashboard'
      });
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
          logger.apiError(`loadAnnotations`, error as Error, {
          component: 'AdminDashboard',
          metadata: { sentenceId: sentence.id }
        });
          annotationsMap.set(sentence.id, []);
        }
      }
      setSentenceAnnotations(annotationsMap);
    } catch (error) {
      logger.apiError('loadSentences', error as Error, {
        component: 'AdminDashboard'
      });
    }
  }, [languageFilter]);

  // Load Users with Pagination
  const loadUsers = React.useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const fetchedUsers = await adminAPI.getAllUsers(
        (usersPagination.currentPage - 1) * usersPagination.itemsPerPage,
        usersPagination.itemsPerPage,
        userFilter.role === 'all' ? undefined : userFilter.role,
        userFilter.active === 'all' ? undefined : userFilter.active === 'true',
        userFilter.search || undefined
      );
      setUsers(fetchedUsers);
      
      // For now, we'll set a reasonable total based on the returned data
      setUsersPagination(prev => ({
        ...prev,
        totalUsers: fetchedUsers.length >= usersPagination.itemsPerPage ? 
          (usersPagination.currentPage * usersPagination.itemsPerPage) + 1 : 
          (usersPagination.currentPage - 1) * usersPagination.itemsPerPage + fetchedUsers.length
      }));
    } catch (error) {
      logger.apiError('loadUsers', error as Error, {
        component: 'AdminDashboard'
      });
    } finally {
      setIsLoadingUsers(false);
    }
  }, [usersPagination.currentPage, usersPagination.itemsPerPage, userFilter]);

  // Load users when tab changes or filters change
  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab, loadUsers]);

  // CRUD Handlers for User Management

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    try {
      await adminAPI.updateUser(selectedUser.id, editUser);
      setShowEditUser(false);
      setSelectedUser(null);
      await loadUsers();
      await loadDashboardData(); // Refresh stats
    } catch (error) {
      logger.apiError('updateUser', error as Error, {
        component: 'AdminDashboard',
        metadata: { userId: selectedUser?.id }
      });
      alert('Failed to update user. Please try again.');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      await adminAPI.deleteUser(selectedUser.id);
      setShowDeleteConfirm(false);
      setSelectedUser(null);
      await loadUsers();
      await loadDashboardData(); // Refresh stats
    } catch (error) {
      logger.apiError('deleteUser', error as Error, {
        component: 'AdminDashboard',
        metadata: { userId: selectedUser?.id }
      });
      alert('Failed to delete user. Please try again.');
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditUser({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      username: user.username,
      is_active: user.is_active,
      is_admin: user.is_admin,
      is_evaluator: user.is_evaluator,
      languages: user.languages || ['en']
    });
    setShowEditUser(true);
  };

  const handleShowDeleteConfirm = (user: User) => {
    setSelectedUser(user);
    setShowDeleteConfirm(true);
  };

  const handleResetUserPassword = async (userId: number) => {
    const newPassword = prompt('Enter new password for user:');
    if (!newPassword) return;
    
    try {
      await adminAPI.resetUserPassword(userId, newPassword);
      alert('Password reset successfully');
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Failed to reset password. Please try again.');
    }
  };

  const handleDeactivateUser = async (userId: number) => {
    const reason = prompt('Enter reason for deactivation (optional):');
    try {
      await adminAPI.deactivateUser(userId, reason || undefined);
      await loadUsers();
    } catch (error) {
      console.error('Error deactivating user:', error);
      alert('Failed to deactivate user. Please try again.');
    }
  };

  // User filter handlers
  const handleUserFilterChange = (newFilter: Partial<typeof userFilter>) => {
    setUserFilter(prev => ({ ...prev, ...newFilter }));
    setUsersPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page
  };

  // Pagination handlers
  const handleUserPageChange = (newPage: number) => {
    setUsersPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  // Generate secure password


  useEffect(() => {
    if (activeTab === 'sentences') {
      loadSentences();
    }
  }, [activeTab, loadSentences]);

  const handleAddSentence = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Use custom domain if "other" is selected
      const sentenceData = {
        ...newSentence,
        domain: newSentence.domains === 'other' ? newSentence.custom_domain : newSentence.domains,
        domains: newSentence.domains === 'other' ? newSentence.custom_domain : newSentence.domains
      };
      await sentencesAPI.createSentence(sentenceData);
      setNewSentence({
        source_text: '',
        machine_translation: '',
        back_translation: '',
        source_language: 'en',
        target_language: 'tgl',
        domain: '',
        domains: 'conversational',
        custom_domain: '',
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

  const handleEditSentence = (sentence: Sentence) => {
    setEditingSentence(sentence);
    setShowEditSentence(true);
  };

  const handleUpdateSentence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSentence) return;
    
    try {
      await adminAPI.updateSentence(editingSentence.id, {
        source_text: editingSentence.source_text,
        machine_translation: editingSentence.machine_translation,
        back_translation: editingSentence.back_translation,
        source_language: editingSentence.source_language,
        target_language: editingSentence.target_language,
        domain: editingSentence.domain,
        is_active: editingSentence.is_active,
      });
      
      setShowEditSentence(false);
      setEditingSentence(null);
      await loadDashboardData();
      if (activeTab === 'sentences') {
        await loadSentences();
      }
    } catch (error) {
      console.error('Error updating sentence:', error);
    }
  };

  const handleShowDeleteSentenceConfirm = (sentence: Sentence) => {
    setDeletingSentence(sentence);
    setShowDeleteSentenceConfirm(true);
  };

  const handleDeleteSentence = async () => {
    if (!deletingSentence) return;
    
    try {
      await adminAPI.deleteSentence(deletingSentence.id);
      setShowDeleteSentenceConfirm(false);
      setDeletingSentence(null);
      await loadDashboardData();
      if (activeTab === 'sentences') {
        await loadSentences();
      }
    } catch (error) {
      console.error('Error deleting sentence:', error);
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
    const csvContent = `source_text,machine_translation,source_language,target_language,domain,back_translation
"I am your mother, Jerry!","Lolo niya ako, Jerry.","en","tgl","conversational",""
"Nanay mo ako, Jerry!","Siak ti inam, Jerry!","tgl","ilo","conversational","I am your mother, Jerry!"
"Where is the hospital?","Nasaan ang ospital?","en","tgl","medical",""
"Good morning","Maayong buntag","en","ceb","greetings",""
"Thank you very much","Agyamanak unay","en","ilo","polite",""
"The food is delicious","Naimas ti kanen","en","ilo","food",""
"She said ""Hello, world!""","Sinabi niya ""Kumusta, mundo!""","en","tgl","conversational",""
"Text with, comma inside quotes","Text na may, koma sa loob ng quotes","en","tgl","conversational",""`;
    
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

  // Audio playback functions
  const handlePlayAudio = async (annotationId: number, voiceRecordingUrl: string) => {
    const audioKey = `annotation-${annotationId}`;
    
    // Stop any currently playing audio
    Object.keys(audioState).forEach(key => {
      if (key !== audioKey && audioState[key].isPlaying) {
        audioState[key].audio?.pause();
        setAudioState(prev => ({
          ...prev,
          [key]: { isPlaying: false, audio: null }
        }));
      }
    });

    try {
      const audio = new Audio(voiceRecordingUrl);
      audio.addEventListener('ended', () => {
        setAudioState(prev => ({
          ...prev,
          [audioKey]: { isPlaying: false, audio: null }
        }));
      });

      await audio.play();
      setAudioState(prev => ({
        ...prev,
        [audioKey]: { isPlaying: true, audio }
      }));
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const handlePauseAudio = (annotationId: number) => {
    const audioKey = `annotation-${annotationId}`;
    const currentAudio = audioState[audioKey];
    
    if (currentAudio?.audio) {
      currentAudio.audio.pause();
      setAudioState(prev => ({
        ...prev,
        [audioKey]: { isPlaying: false, audio: null }
      }));
    }
  };

  const handleDownloadAudio = (annotationId: number, voiceRecordingUrl: string, annotatorName: string) => {
    const link = document.createElement('a');
    link.href = voiceRecordingUrl;
    link.download = `annotation-${annotationId}-${annotatorName.replace(/\s+/g, '-')}.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      // Stop all playing audio when component unmounts
      Object.values(audioState).forEach(({ audio }) => {
        if (audio) {
          audio.pause();
        }
      });
    };
  }, [audioState]);

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
        
        {/* Tab Navigation - Hidden on mobile */}
        <div className="border-b border-gray-200 mb-6 hidden md:block">
          <nav className="-mb-px flex overflow-x-auto scrollbar-hide">
            <div className="flex space-x-1 sm:space-x-4 lg:space-x-8 min-w-max px-1">
              {[
                { key: 'home', label: 'Home', icon: Home },
                { key: 'overview', label: 'Overview', icon: BarChart3 },
                { key: 'users', label: 'Users', icon: Users },
                { key: 'sentences', label: 'Sentences', icon: FileText },
                { key: 'onboarding-tests', label: 'Tests', fullLabel: 'Onboarding Tests', icon: BookOpen },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key as 'home' | 'overview' | 'users' | 'sentences' | 'onboarding-tests')}
                  className={`flex items-center space-x-1 sm:space-x-2 py-2 px-2 sm:px-3 lg:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors duration-200 ${
                    activeTab === tab.key
                      ? 'border-beauty-bush-500 text-beauty-bush-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  title={tab.fullLabel || tab.label}
                >
                  <tab.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.key === 'onboarding-tests' ? 'Tests' : tab.label}</span>
                </button>
              ))}
            </div>
          </nav>
        </div>

        {/* Mobile Tab Indicator */}
        <div className="md:hidden mb-6">
          <div className="bg-beauty-bush-50 border border-beauty-bush-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              {(() => {
                const currentTab = [
                  { key: 'home', label: 'Home', icon: Home },
                  { key: 'overview', label: 'Overview', icon: BarChart3 },
                  { key: 'users', label: 'Users', icon: Users },
                  { key: 'sentences', label: 'Sentences', icon: FileText },
                  { key: 'onboarding-tests', label: 'Onboarding Tests', icon: BookOpen },
                ].find(tab => tab.key === activeTab);
                
                if (!currentTab) return null;
                
                return (
                  <>
                    <currentTab.icon className="h-5 w-5 text-beauty-bush-600" />
                    <span className="text-sm font-medium text-beauty-bush-900">{currentTab.label}</span>
                  </>
                );
              })()}
            </div>
          </div>
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
          <div className="space-y-6">
            {/* Header with Actions */}
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">User Management</h3>
                <p className="text-sm text-gray-600 mt-1">Create and manage users with different roles (Annotator, Evaluator, or Admin)</p>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 border border-gray-200 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="user-role-filter" className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    id="user-role-filter"
                    value={userFilter.role}
                    onChange={(e) => handleUserFilterChange({ role: e.target.value })}
                    className="select-field"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="evaluator">Evaluator</option>
                    <option value="annotator">Annotator</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="user-active-filter" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="user-active-filter"
                    value={userFilter.active}
                    onChange={(e) => handleUserFilterChange({ active: e.target.value })}
                    className="select-field"
                  >
                    <option value="all">All Status</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="user-search" className="block text-sm font-medium text-gray-700 mb-1">
                    Search
                  </label>
                  <input
                    id="user-search"
                    type="text"
                    placeholder="Search by name, email, or username..."
                    value={userFilter.search}
                    onChange={(e) => handleUserFilterChange({ search: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-beauty-bush-500 focus:border-beauty-bush-500"
                  />
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {isLoadingUsers ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-beauty-bush-600"></div>
                  <span className="ml-2 text-gray-600">Loading users...</span>
                </div>
              ) : (
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
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                              title="Edit User"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleToggleEvaluatorRole(user.id)}
                              className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded transition-colors ${
                                user.is_evaluator
                                  ? 'text-red-600 hover:text-red-900 hover:bg-red-50'
                                  : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                              }`}
                              title={user.is_evaluator ? 'Remove Evaluator Role' : 'Make Evaluator'}
                            >
                              <UserCheck className="h-3 w-3 mr-1" />
                              {user.is_evaluator ? 'Remove' : 'Promote'}
                            </button>
                            <button
                              onClick={() => handleResetUserPassword(user.id)}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50 rounded transition-colors"
                              title="Reset Password"
                            >
                              <Key className="h-3 w-3 mr-1" />
                              Reset
                            </button>
                            {user.is_active ? (
                              <button
                                onClick={() => handleDeactivateUser(user.id)}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium text-orange-600 hover:text-orange-900 hover:bg-orange-50 rounded transition-colors"
                                title="Deactivate User"
                              >
                                <UserX className="h-3 w-3 mr-1" />
                                Deactivate
                              </button>
                            ) : null}
                            <button
                              onClick={() => handleShowDeleteConfirm(user)}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            <div className="bg-white px-4 py-3 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">Showing</span>
                  <select
                    value={usersPagination.itemsPerPage}
                    onChange={(e) => setUsersPagination(prev => ({ ...prev, itemsPerPage: Number(e.target.value), currentPage: 1 }))}
                    className="select-field text-sm"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-sm text-gray-700">per page</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleUserPageChange(usersPagination.currentPage - 1)}
                    disabled={usersPagination.currentPage === 1}
                    className="flex items-center px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {usersPagination.currentPage}
                  </span>
                  <button
                    onClick={() => handleUserPageChange(usersPagination.currentPage + 1)}
                    disabled={users.length < usersPagination.itemsPerPage}
                    className="flex items-center px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sentences Tab */}
        {activeTab === 'sentences' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Manage Sentences</h3>
                <p className="text-sm text-gray-600 mt-1">View and manage sentences with advanced error tagging annotations</p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => setShowCSVImport(true)}
                  className="btn-secondary flex items-center justify-center space-x-2 w-full sm:w-auto"
                >
                  <Upload className="h-4 w-4" />
                  <span>Import CSV</span>
                </button>
                <button
                  onClick={() => setShowAddSentence(true)}
                  className="btn-primary flex items-center justify-center space-x-2 w-full sm:w-auto"
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
                      <p><strong>Optional columns:</strong> domain, back_translation</p>
                      <p><strong>Supported source languages:</strong> en (English), tgl (Tagalog), ilo (Ilocano), ceb (Cebuano)</p>
                      <p><strong>Supported target languages:</strong> tgl (Tagalog), ilo (Ilocano), ceb (Cebuano), en (English)</p>
                      <p><strong>Available domains:</strong> conversational, news, legal, medical, educational</p>
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
            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="flex flex-col space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search sentences, domains, or content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beauty-bush-500 focus:border-beauty-bush-500 text-base sm:text-sm"
                  />
                </div>

                {/* Controls Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {/* Language Filter */}
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <select
                      value={languageFilter}
                      onChange={(e) => setLanguageFilter(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-3 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-beauty-bush-500 focus:border-beauty-bush-500"
                    >
                      <option value="all">All Languages</option>
                      <option value="tagalog">Tagalog (Filipino)</option>
                      <option value="cebuano">Cebuano</option>
                      <option value="ilokano">Ilokano</option>
                    </select>
                  </div>

                  {/* Sort By */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'most_annotated' | 'least_annotated')}
                    className="border border-gray-300 rounded-md px-3 py-3 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-beauty-bush-500 focus:border-beauty-bush-500"
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
                    className="border border-gray-300 rounded-md px-3 py-3 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-beauty-bush-500 focus:border-beauty-bush-500"
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
                      className={`flex-1 px-3 py-3 sm:py-2 text-base sm:text-sm flex items-center justify-center space-x-2 ${
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
                      className={`flex-1 px-3 py-3 sm:py-2 text-base sm:text-sm flex items-center justify-center space-x-2 ${
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
              <div className="flex items-center justify-between text-sm text-gray-600 border-t pt-4">
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
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2147483647] pointer-events-auto"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setShowAddSentence(false);
                  }
                }}
                style={{ zIndex: 2147483647, pointerEvents: 'auto' }}
              >
                <div
                  className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto z-[2147483647] pointer-events-auto"
                  onClick={e => e.stopPropagation()}
                  style={{ zIndex: 2147483647, pointerEvents: 'auto' }}
                  tabIndex={0}
                >
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
                          <option value="tgl">Tagalog</option>
                          <option value="ilo">Ilocano</option>
                          <option value="ceb">Cebuano</option>
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
                          <option value="tgl">Tagalog</option>
                          <option value="ilo">Ilocano</option>
                          <option value="ceb">Cebuano</option>
                          <option value="en">English</option>
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
                        Back Translation (Optional)
                      </label>
                      <textarea
                        value={newSentence.back_translation}
                        onChange={(e) => setNewSentence({...newSentence, back_translation: e.target.value})}
                        className="textarea-field autocomplete-off"
                        placeholder="Enter the back translation if available..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Domain (Optional)
                      </label>
                      <select
                        value={newSentence.domains}
                        onChange={(e) => setNewSentence({...newSentence, domains: e.target.value})}
                        className="input-field autocomplete-off"
                      >
                        <option value="">-- Select Domain --</option>
                        <option value="conversational">Conversational</option>
                        <option value="news">News</option>
                        <option value="legal">Legal</option>
                        <option value="medical">Medical</option>
                        <option value="educational">Educational</option>
                        <option value="other">Other (Custom)</option>
                      </select>
                    </div>

                    {newSentence.domains === 'other' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Custom Domain
                        </label>
                        <input
                          type="text"
                          value={newSentence.custom_domain || ''}
                          onChange={(e) => setNewSentence({...newSentence, custom_domain: e.target.value})}
                          className="input-field autocomplete-off"
                          placeholder="Enter custom domain (e.g., technology, sports, business)..."
                          required
                        />
                      </div>
                    )}

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

            {/* Edit Sentence Modal */}
            {showEditSentence && editingSentence && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2147483647] pointer-events-auto"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setShowEditSentence(false);
                    setEditingSentence(null);
                  }
                }}
                style={{ zIndex: 2147483647, pointerEvents: 'auto' }}
              >
                <div
                  className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto z-[2147483647] pointer-events-auto"
                  onClick={e => e.stopPropagation()}
                  style={{ zIndex: 2147483647, pointerEvents: 'auto' }}
                  tabIndex={0}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Edit Sentence #{editingSentence.id}</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditSentence(false);
                        setEditingSentence(null);
                      }}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  
                  <form onSubmit={handleUpdateSentence} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Source Language
                        </label>
                        <select
                          value={editingSentence.source_language}
                          onChange={(e) => setEditingSentence({...editingSentence, source_language: e.target.value})}
                          className="input-field autocomplete-off"
                          required
                        >
                          <option value="en">English</option>
                          <option value="tgl">Tagalog</option>
                          <option value="ilo">Ilocano</option>
                          <option value="ceb">Cebuano</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Target Language
                        </label>
                        <select
                          value={editingSentence.target_language}
                          onChange={(e) => setEditingSentence({...editingSentence, target_language: e.target.value})}
                          className="input-field autocomplete-off"
                          required
                        >
                          <option value="tgl">Tagalog</option>
                          <option value="ilo">Ilocano</option>
                          <option value="ceb">Cebuano</option>
                          <option value="en">English</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Source Text
                      </label>
                      <textarea
                        value={editingSentence.source_text}
                        onChange={(e) => setEditingSentence({...editingSentence, source_text: e.target.value})}
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
                        value={editingSentence.machine_translation}
                        onChange={(e) => setEditingSentence({...editingSentence, machine_translation: e.target.value})}
                        className="textarea-field autocomplete-off"
                        required
                        placeholder="Enter the machine translation..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Back Translation (Optional)
                      </label>
                      <textarea
                        value={editingSentence.back_translation || ''}
                        onChange={(e) => setEditingSentence({...editingSentence, back_translation: e.target.value})}
                        className="textarea-field autocomplete-off"
                        placeholder="Enter the back translation for quality assessment..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Domain (Optional)
                      </label>
                      <input
                        type="text"
                        value={editingSentence.domain || ''}
                        onChange={(e) => setEditingSentence({...editingSentence, domain: e.target.value})}
                        className="input-field autocomplete-off"
                        placeholder="e.g., Technology, Education, Healthcare..."
                      />
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={editingSentence.is_active}
                        onChange={(e) => setEditingSentence({...editingSentence, is_active: e.target.checked})}
                        className="h-4 w-4 text-beauty-bush-600 focus:ring-beauty-bush-500 border-gray-300 rounded"
                      />
                      <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                        Active (available for annotation)
                      </label>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowEditSentence(false);
                          setEditingSentence(null);
                        }}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn-primary"
                      >
                        Update Sentence
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Delete Sentence Confirmation Modal */}
            {showDeleteSentenceConfirm && deletingSentence && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2147483647] pointer-events-auto"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setShowDeleteSentenceConfirm(false);
                    setDeletingSentence(null);
                  }
                }}
                style={{ zIndex: 2147483647, pointerEvents: 'auto' }}
              >
                <div
                  className="bg-white rounded-lg p-6 w-full max-w-md z-[2147483647] pointer-events-auto"
                  onClick={e => e.stopPropagation()}
                  style={{ zIndex: 2147483647, pointerEvents: 'auto' }}
                  tabIndex={0}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <Trash2 className="h-5 w-5 text-red-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Delete Sentence</h3>
                      <p className="text-sm text-gray-500">This action cannot be undone.</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-sm text-gray-700 mb-3">
                      Are you sure you want to delete sentence #{deletingSentence.id}?
                    </p>
                    <div className="bg-gray-50 rounded-lg p-3 text-sm">
                      <p className="font-medium text-gray-900 mb-1">Source:</p>
                      <p className="text-gray-700 mb-2">{deletingSentence.source_text.substring(0, 100)}{deletingSentence.source_text.length > 100 && '...'}</p>
                      <p className="font-medium text-gray-900 mb-1">Translation:</p>
                      <p className="text-gray-700 mb-2">{deletingSentence.machine_translation.substring(0, 100)}{deletingSentence.machine_translation.length > 100 && '...'}</p>
                      {deletingSentence.back_translation && (
                        <>
                          <p className="font-medium text-emerald-700 mb-1">Back Translation:</p>
                          <p className="text-gray-700">{deletingSentence.back_translation.substring(0, 100)}{deletingSentence.back_translation.length > 100 && '...'}</p>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-red-600 mt-2">
                      This will also delete all associated annotations and evaluations.
                    </p>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowDeleteSentenceConfirm(false);
                        setDeletingSentence(null);
                      }}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteSentence}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Delete Sentence
                    </button>
                  </div>
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
                        <div className="p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 sm:w-8 sm:h-8 bg-beauty-bush-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-bold text-beauty-bush-700">#{sentence.id}</span>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs px-3 py-2 sm:px-2 sm:py-1 bg-beauty-bush-500 text-white rounded-full font-medium">
                                  {sentence.source_language.toUpperCase()} → {sentence.target_language.toUpperCase()}
                                </span>
                                {sentence.domain && (
                                  <span className="text-xs px-3 py-2 sm:px-2 sm:py-1 bg-gray-100 text-gray-700 rounded-full">
                                    {sentence.domain}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                              {annotations.length > 0 && (
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                  <span className="px-3 py-2 sm:px-2 sm:py-1 bg-green-100 text-green-800 rounded-full font-medium">
                                    {annotations.length} annotations
                                  </span>
                                  {allHighlights.length > 0 && (
                                    <span className="px-3 py-2 sm:px-2 sm:py-1 bg-purple-100 text-purple-800 rounded-full font-medium">
                                      {allHighlights.length} tags
                                    </span>
                                  )}
                                </div>
                              )}
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleEditSentence(sentence)}
                                  className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded-lg hover:bg-blue-50 transition-all"
                                  title="Edit sentence"
                                >
                                  <Edit className="h-3 w-3" />
                                  <span className="hidden sm:inline">Edit</span>
                                </button>
                                <button
                                  onClick={() => handleShowDeleteSentenceConfirm(sentence)}
                                  className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition-all"
                                  title="Delete sentence"
                                >
                                  <Trash2 className="h-3 w-3" />
                                  <span className="hidden sm:inline">Delete</span>
                                </button>
                                <button
                                  onClick={() => toggleSentenceExpansion(sentence.id)}
                                  className="flex items-center space-x-2 text-sm text-beauty-bush-600 hover:text-beauty-bush-800 font-medium px-3 py-2 rounded-lg hover:bg-beauty-bush-50 transition-all"
                                >
                                  <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
                                  <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Compact Content Preview */}
                          {viewMode === 'compact' && !isExpanded && (
                            <div className="space-y-3 mt-2">
                              <div className="text-sm sm:text-base text-gray-700 line-clamp-2 leading-relaxed">
                                <strong className="text-gray-900">Source:</strong> {sentence.source_text.substring(0, 100)}
                                {sentence.source_text.length > 100 && '...'}
                              </div>
                              <div className="text-sm sm:text-base text-gray-700 line-clamp-2 leading-relaxed">
                                <strong className="text-gray-900">Translation:</strong> {sentence.machine_translation.substring(0, 100)}
                                {sentence.machine_translation.length > 100 && '...'}
                              </div>
                              {sentence.back_translation && (
                                <div className="text-sm sm:text-base text-gray-700 line-clamp-2 leading-relaxed">
                                  <strong className="text-emerald-700">Back Translation:</strong> {sentence.back_translation.substring(0, 100)}
                                  {sentence.back_translation.length > 100 && '...'}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Detailed Content */}
                          {(viewMode === 'detailed' || isExpanded) && (
                            <div className="space-y-5 sm:space-y-4 border-t pt-5 sm:pt-4 mt-2">
                              {/* Source Text */}
                              <div className="bg-beauty-bush-50 border-l-4 border-beauty-bush-400 p-4 sm:p-3 rounded-r-lg">
                                <h5 className="text-xs font-medium text-beauty-bush-900 mb-3 sm:mb-2 uppercase tracking-wide">
                                  Source Text ({sentence.source_language.toUpperCase()})
                                </h5>
                                <p className="text-base sm:text-sm text-gray-900 leading-relaxed">{sentence.source_text}</p>
                              </div>



                              {/* Machine Translation with Tags */}
                              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-lg p-4 sm:p-3">
                                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-3 sm:mb-2">
                                  <h5 className="text-xs font-medium text-purple-900 uppercase tracking-wide">
                                    Machine Translation with Error Tags
                                  </h5>
                                  {allHighlights.length > 0 && (
                                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-3 py-1 sm:px-2 sm:py-1 rounded-full self-start sm:self-auto">
                                      {allHighlights.length} annotations
                                    </span>
                                  )}
                                </div>
                                <div className="text-base sm:text-sm text-gray-900 leading-relaxed bg-white border border-purple-100 rounded p-4 sm:p-3">
                                  {renderHighlightedText(sentence.machine_translation, allHighlights, 'machine')}
                                </div>
                                {allHighlights.length === 0 && (
                                  <div className="mt-3 sm:mt-2 text-xs text-gray-500 italic">
                                    No error annotations yet.
                                  </div>
                                )}
                              </div>

                              {/* Back Translation */}
                              {sentence.back_translation && (
                                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-lg p-4 sm:p-3">
                                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-3 sm:mb-2">
                                    <h5 className="text-xs font-medium text-emerald-900 uppercase tracking-wide">
                                      Back Translation
                                    </h5>
                                    <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-3 py-1 sm:px-2 sm:py-1 rounded-full self-start sm:self-auto">
                                      Quality Reference
                                    </span>
                                  </div>
                                  <div className="text-base sm:text-sm text-gray-900 leading-relaxed bg-white border border-emerald-100 rounded p-4 sm:p-3">
                                    {sentence.back_translation}
                                  </div>
                                  <div className="mt-3 sm:mt-2 text-xs text-emerald-600 italic">
                                    Back translation for quality assessment and comparison.
                                  </div>
                                </div>
                              )}

                              {/* Annotations Summary - Only if expanded */}
                              {isExpanded && annotations.length > 0 && (
                                <div className="bg-white border border-gray-300 rounded-lg p-5 sm:p-4">
                                  <div className="flex items-center justify-between mb-4 sm:mb-3">
                                    <h5 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center">
                                      <MessageCircle className="h-4 w-4 mr-2 text-gray-600" />
                                      Advanced Error Annotations ({annotations.length})
                                    </h5>
                                  </div>
                                  
                                  {/* Quick Stats */}
                                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3 mb-5 sm:mb-4">
                                    <div className="text-center p-3 sm:p-2 bg-beauty-bush-50 rounded-lg">
                                      <div className="text-xs text-gray-600 mb-1">Completed</div>
                                      <div className="text-base sm:text-sm font-bold text-beauty-bush-600">
                                        {annotations.filter(a => a.annotation_status === 'completed').length}
                                      </div>
                                    </div>
                                    <div className="text-center p-3 sm:p-2 bg-yellow-50 rounded-lg">
                                      <div className="text-xs text-gray-600 mb-1">In Progress</div>
                                      <div className="text-base sm:text-sm font-bold text-yellow-600">
                                        {annotations.filter(a => a.annotation_status === 'in_progress').length}
                                      </div>
                                    </div>
                                    <div className="text-center p-3 sm:p-2 bg-green-50 rounded-lg">
                                      <div className="text-xs text-gray-600 mb-1">Avg Quality</div>
                                      {annotations.filter(a => a.overall_quality).length > 0 ? (
                                        <div className={`text-base sm:text-sm font-bold ${getScoreColor((annotations.reduce((sum, a) => sum + (a.overall_quality || 0), 0) / annotations.filter(a => a.overall_quality).length))}`}>
                                          {(annotations.reduce((sum, a) => sum + (a.overall_quality || 0), 0) / annotations.filter(a => a.overall_quality).length).toFixed(1)}
                                        </div>
                                      ) : (
                                        <div className="text-base sm:text-sm font-bold text-gray-600">
                                          N/A
                                        </div>
                                      )}
                                    </div>
                                    <div className="text-center p-3 sm:p-2 bg-purple-50 rounded-lg">
                                      <div className="text-xs text-gray-600 mb-1">Error Tags</div>
                                      <div className="text-base sm:text-sm font-bold text-purple-600">
                                        {allHighlights.length}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Error Type Distribution */}
                                  {allHighlights.length > 0 && (
                                    <div className="mb-5 sm:mb-4">
                                      <h6 className="text-xs font-medium text-gray-700 mb-3 sm:mb-2 uppercase tracking-wide">Error Type Distribution</h6>
                                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-2">
                                        {(() => {
                                          const errorTypeCounts = allHighlights.reduce((acc, h) => {
                                            const type = h.error_type || 'MI_SE';
                                            acc[type] = (acc[type] || 0) + 1;
                                            return acc;
                                          }, {} as {[key: string]: number});

                                          return Object.entries(errorTypeCounts).map(([type, count]) => (
                                            <div key={type} className="text-center p-3 sm:p-2 rounded-lg border-2 transition-all hover:shadow-md" 
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
                                              <div className="text-xs text-gray-600 font-medium mb-1">[{type}]</div>
                                              <div className="text-xl sm:text-lg font-bold mb-1" style={{
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

                                  {/* Individual Annotations with Audio */}
                                  <div className="space-y-4">
                                    <h6 className="text-xs font-medium text-gray-700 mb-3 sm:mb-2 uppercase tracking-wide">Individual Annotations</h6>
                                    {annotations.map((annotation) => (
                                      <div key={annotation.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                          <div className="flex items-center space-x-2">
                                            <div className="w-8 h-8 bg-beauty-bush-100 rounded-full flex items-center justify-center">
                                              <span className="text-xs font-bold text-beauty-bush-700">
                                                {annotation.annotator?.first_name?.[0] || 'A'}
                                              </span>
                                            </div>
                                            <div>
                                              <div className="text-sm font-medium text-gray-900">
                                                {annotation.annotator?.first_name} {annotation.annotator?.last_name}
                                              </div>
                                              <div className="text-xs text-gray-500">
                                                {new Date(annotation.created_at).toLocaleDateString()}
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                              annotation.annotation_status === 'completed' 
                                                ? 'bg-green-100 text-green-800' 
                                                : annotation.annotation_status === 'in_progress'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-gray-100 text-gray-800'
                                            }`}>
                                              {annotation.annotation_status}
                                            </span>
                                            {annotation.overall_quality && (
                                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getScoreColor(annotation.overall_quality)}`}>
                                                Quality: {annotation.overall_quality}/5
                                              </span>
                                            )}
                                          </div>
                                        </div>

                                        {/* Voice Recording Section */}
                                        {annotation.voice_recording_url && (
                                          <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3">
                                            <div className="flex items-center justify-between mb-2">
                                              <div className="flex items-center space-x-2">
                                                <Volume2 className="h-4 w-4 text-gray-600" />
                                                <span className="text-sm font-medium text-gray-700">Voice Recording</span>
                                                {annotation.voice_recording_duration && (
                                                  <span className="text-xs text-gray-500">
                                                    {Math.round(annotation.voice_recording_duration)}s
                                                  </span>
                                                )}
                                              </div>
                                              <div className="flex items-center space-x-1">
                                                {audioState[`annotation-${annotation.id}`]?.isPlaying ? (
                                                  <button
                                                    onClick={() => handlePauseAudio(annotation.id)}
                                                    className="flex items-center space-x-1 px-2 py-1 text-xs text-red-600 hover:text-red-800 font-medium rounded hover:bg-red-50 transition-all"
                                                    title="Pause audio"
                                                  >
                                                    <Pause className="h-3 w-3" />
                                                    <span>Pause</span>
                                                  </button>
                                                ) : (
                                                  <button
                                                    onClick={() => handlePlayAudio(annotation.id, annotation.voice_recording_url!)}
                                                    className="flex items-center space-x-1 px-2 py-1 text-xs text-green-600 hover:text-green-800 font-medium rounded hover:bg-green-50 transition-all"
                                                    title="Play audio"
                                                  >
                                                    <Play className="h-3 w-3" />
                                                    <span>Play</span>
                                                  </button>
                                                )}
                                                <button
                                                  onClick={() => handleDownloadAudio(
                                                    annotation.id, 
                                                    annotation.voice_recording_url!, 
                                                    `${annotation.annotator?.first_name} ${annotation.annotator?.last_name}`
                                                  )}
                                                  className="flex items-center space-x-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-800 font-medium rounded hover:bg-blue-50 transition-all"
                                                  title="Download audio"
                                                >
                                                  <Download className="h-3 w-3" />
                                                  <span>Download</span>
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        )}

                                        {/* Annotation Details */}
                                        <div className="space-y-2">
                                          {annotation.comments && (
                                            <div className="text-sm">
                                              <span className="font-medium text-gray-700">Comments:</span>
                                              <span className="text-gray-600 ml-1">{annotation.comments}</span>
                                            </div>
                                          )}
                                          {annotation.suggested_correction && (
                                            <div className="text-sm">
                                              <span className="font-medium text-gray-700">Suggested Correction:</span>
                                              <span className="text-gray-600 ml-1">{annotation.suggested_correction}</span>
                                            </div>
                                          )}
                                          {annotation.final_form && (
                                            <div className="text-sm">
                                              <span className="font-medium text-gray-700">Final Form:</span>
                                              <span className="text-gray-600 ml-1">{annotation.final_form}</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
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
            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="flex flex-col space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search questions, explanations, or options..."
                    value={questionSearchQuery}
                    onChange={(e) => setQuestionSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beauty-bush-500 focus:border-beauty-bush-500 text-base sm:text-sm"
                  />
                </div>

                {/* Controls Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                  {/* Language Filter */}
                  <select
                    value={questionLanguageFilter}
                    onChange={(e) => setQuestionLanguageFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-3 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-beauty-bush-500 focus:border-beauty-bush-500"
                  >
                    <option value="all">All Languages</option>
                    <option value="tagalog">Tagalog (Filipino)</option>
                    <option value="cebuano">Cebuano</option>
                    <option value="ilokano">Ilokano</option>
                  </select>

                  {/* Type Filter */}
                  <select
                    value={questionTypeFilter}
                    onChange={(e) => setQuestionTypeFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-3 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-beauty-bush-500 focus:border-beauty-bush-500"
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
                    className="border border-gray-300 rounded-md px-3 py-3 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-beauty-bush-500 focus:border-beauty-bush-500"
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
                    className="border border-gray-300 rounded-md px-3 py-3 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-beauty-bush-500 focus:border-beauty-bush-500"
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
                    className="border border-gray-300 rounded-md px-3 py-3 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-beauty-bush-500 focus:border-beauty-bush-500"
                  >
                    <option value={5}>5 per page</option>
                    <option value={10}>10 per page</option>
                    <option value={20}>20 per page</option>
                    <option value={50}>50 per page</option>
                  </select>
                </div>
              </div>

              {/* Results Summary */}
              <div className="flex items-center justify-between text-sm text-gray-600 border-t pt-4">
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
                          <option value="Ilokano">Ilokano</option>
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
                    <div key={question.id} className="p-5 sm:p-6 hover:bg-gray-50">
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
                                <option value="Ilokano">Ilokano</option>
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
                        <div className="space-y-5 sm:space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                            <div className="flex items-start space-x-3">
                              <div className="w-10 h-10 sm:w-8 sm:h-8 bg-beauty-bush-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-bold text-beauty-bush-700">#{question.id}</span>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs px-3 py-2 sm:px-2 sm:py-1 bg-beauty-bush-500 text-white rounded-full font-medium">
                                  {question.language}
                                </span>
                                <span className={`text-xs px-3 py-2 sm:px-2 sm:py-1 rounded-full font-medium ${getQuestionTypeColor(question.type)}`}>
                                  {question.type}
                                </span>
                                <span className={`text-xs px-3 py-2 sm:px-2 sm:py-1 rounded-full font-medium ${getDifficultyColor(question.difficulty)}`}>
                                  {question.difficulty}
                                </span>
                                {question.is_active ? (
                                  <span className="text-xs px-3 py-2 sm:px-2 sm:py-1 bg-green-100 text-green-800 rounded-full font-medium">
                                    Active
                                  </span>
                                ) : (
                                  <span className="text-xs px-3 py-2 sm:px-2 sm:py-1 bg-gray-100 text-gray-800 rounded-full font-medium">
                                    Inactive
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3 self-start sm:self-auto">
                              <button
                                onClick={() => setEditingQuestion(question)}
                                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 px-3 py-2 rounded-lg hover:bg-blue-50 transition-all"
                              >
                                <Edit className="h-4 w-4" />
                                <span className="text-sm">Edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteQuestion(question.id)}
                                className="flex items-center space-x-2 text-red-600 hover:text-red-800 px-3 py-2 rounded-lg hover:bg-red-50 transition-all"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="text-sm">Delete</span>
                              </button>
                            </div>
                          </div>
                          
                          <div className="bg-beauty-bush-50 border-l-4 border-beauty-bush-400 p-4 sm:p-3 rounded-r-lg">
                            <h5 className="text-sm font-medium text-beauty-bush-900 mb-3 sm:mb-2">Question</h5>
                            <p className="text-base sm:text-sm text-gray-900 leading-relaxed">{question.question}</p>
                          </div>
                          
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <h5 className="text-sm font-medium text-gray-700 mb-4 sm:mb-3">Answer Options</h5>
                            <div className="space-y-3 sm:space-y-2">
                              {question.options.map((option, index) => (
                                <div key={index} className={`flex items-start space-x-3 p-3 sm:p-2 rounded-lg ${
                                  index === question.correct_answer ? 'bg-green-100 border border-green-300' : 'bg-white border border-gray-200'
                                }`}>
                                  <span className="text-sm font-medium text-gray-700 w-8 flex-shrink-0 mt-0.5 sm:mt-0">{String.fromCharCode(65 + index)}.</span>
                                  <span className="text-base sm:text-sm text-gray-900 leading-relaxed flex-1">{option}</span>
                                  {index === question.correct_answer && (
                                    <span className="text-xs bg-green-500 text-white px-3 py-1 sm:px-2 sm:py-1 rounded-full font-medium flex-shrink-0">
                                      Correct
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 sm:p-3 rounded-r-lg">
                            <h5 className="text-sm font-medium text-yellow-900 mb-3 sm:mb-2">Explanation</h5>
                            <p className="text-base sm:text-sm text-gray-900 leading-relaxed">{question.explanation}</p>
                          </div>
                          
                          {question.created_at && (
                            <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
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



      {/* Edit User Modal */}
      {showEditUser && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl border w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Edit User</h3>
                <button
                  onClick={() => setShowEditUser(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleUpdateUser} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit-first-name" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      id="edit-first-name"
                      type="text"
                      required
                      value={editUser.first_name}
                      onChange={(e) => setEditUser(prev => ({ ...prev, first_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-beauty-bush-500 focus:border-beauty-bush-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-last-name" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      id="edit-last-name"
                      type="text"
                      required
                      value={editUser.last_name}
                      onChange={(e) => setEditUser(prev => ({ ...prev, last_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-beauty-bush-500 focus:border-beauty-bush-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    id="edit-email"
                    type="email"
                    required
                    value={editUser.email}
                    onChange={(e) => setEditUser(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-beauty-bush-500 focus:border-beauty-bush-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-username" className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    id="edit-username"
                    type="text"
                    required
                    value={editUser.username}
                    onChange={(e) => setEditUser(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-beauty-bush-500 focus:border-beauty-bush-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Languages
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        id="edit-lang-en"
                        type="checkbox"
                        value="en"
                        checked={editUser.languages.includes('en')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditUser(prev => ({ 
                              ...prev, 
                              languages: [...prev.languages, 'en'].filter((v, i, a) => a.indexOf(v) === i)
                            }));
                          } else {
                            setEditUser(prev => ({ 
                              ...prev, 
                              languages: prev.languages.filter(lang => lang !== 'en')
                            }));
                          }
                        }}
                        className="h-4 w-4 text-beauty-bush-600 focus:ring-beauty-bush-500 border-gray-300 rounded"
                      />
                      <label htmlFor="edit-lang-en" className="ml-2 block text-sm text-gray-700">
                        English
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="edit-lang-tagalog"
                        type="checkbox"
                        value="tagalog"
                        checked={editUser.languages.includes('tagalog')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditUser(prev => ({ 
                              ...prev, 
                              languages: [...prev.languages, 'tagalog'].filter((v, i, a) => a.indexOf(v) === i)
                            }));
                          } else {
                            setEditUser(prev => ({ 
                              ...prev, 
                              languages: prev.languages.filter(lang => lang !== 'tagalog')
                            }));
                          }
                        }}
                        className="h-4 w-4 text-beauty-bush-600 focus:ring-beauty-bush-500 border-gray-300 rounded"
                      />
                      <label htmlFor="edit-lang-tagalog" className="ml-2 block text-sm text-gray-700">
                        Tagalog
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="edit-lang-cebuano"
                        type="checkbox"
                        value="cebuano"
                        checked={editUser.languages.includes('cebuano')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditUser(prev => ({ 
                              ...prev, 
                              languages: [...prev.languages, 'cebuano'].filter((v, i, a) => a.indexOf(v) === i)
                            }));
                          } else {
                            setEditUser(prev => ({ 
                              ...prev, 
                              languages: prev.languages.filter(lang => lang !== 'cebuano')
                            }));
                          }
                        }}
                        className="h-4 w-4 text-beauty-bush-600 focus:ring-beauty-bush-500 border-gray-300 rounded"
                      />
                      <label htmlFor="edit-lang-cebuano" className="ml-2 block text-sm text-gray-700">
                        Cebuano
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="edit-lang-ilokano"
                        type="checkbox"
                        value="ilokano"
                        checked={editUser.languages.includes('ilokano')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditUser(prev => ({ 
                              ...prev, 
                              languages: [...prev.languages, 'ilokano'].filter((v, i, a) => a.indexOf(v) === i)
                            }));
                          } else {
                            setEditUser(prev => ({ 
                              ...prev, 
                              languages: prev.languages.filter(lang => lang !== 'ilokano')
                            }));
                          }
                        }}
                        className="h-4 w-4 text-beauty-bush-600 focus:ring-beauty-bush-500 border-gray-300 rounded"
                      />
                      <label htmlFor="edit-lang-ilokano" className="ml-2 block text-sm text-gray-700">
                        Ilokano
                      </label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User Role & Settings
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        id="edit-is-active"
                        type="checkbox"
                        checked={editUser.is_active}
                        onChange={(e) => setEditUser(prev => ({ ...prev, is_active: e.target.checked }))}
                        className="h-4 w-4 text-beauty-bush-600 focus:ring-beauty-bush-500 border-gray-300 rounded"
                      />
                      <label htmlFor="edit-is-active" className="ml-2 block text-sm text-gray-700">
                        Active user
                      </label>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg border">
                      <div className="text-sm font-medium text-gray-700 mb-2">Role Permissions:</div>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input
                            id="edit-is-admin"
                            type="checkbox"
                            checked={editUser.is_admin}
                            onChange={(e) => setEditUser(prev => ({ ...prev, is_admin: e.target.checked }))}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                          />
                          <label htmlFor="edit-is-admin" className="ml-2 block text-sm text-gray-700">
                            <span className="font-medium text-purple-700">Administrator</span> - Full system access
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            id="edit-is-evaluator"
                            type="checkbox"
                            checked={editUser.is_evaluator}
                            onChange={(e) => setEditUser(prev => ({ ...prev, is_evaluator: e.target.checked }))}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="edit-is-evaluator" className="ml-2 block text-sm text-gray-700">
                            <span className="font-medium text-blue-700">Evaluator</span> - Can evaluate annotations
                          </label>
                        </div>
                        
                        <div className="text-xs text-gray-500 mt-2">
                          Note: Users without special roles are Annotators by default
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowEditUser(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-beauty-bush-600 border border-transparent rounded-md hover:bg-beauty-bush-700 transition-colors"
                  >
                    Update User
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl border w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Delete User</h3>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Are you sure you want to delete the user <span className="font-medium">{selectedUser.first_name} {selectedUser.last_name}</span>? 
                  This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">User Details</h3>
                <button
                  onClick={() => setShowUserDetails(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Personal Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Full Name</label>
                      <p className="mt-1 text-base text-gray-900 font-medium">{selectedUser.first_name} {selectedUser.last_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Username</label>
                      <p className="mt-1 text-base text-gray-900 font-mono">@{selectedUser.username}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-600">Email Address</label>
                      <p className="mt-1 text-base text-gray-900">{selectedUser.email}</p>
                    </div>
                  </div>
                </div>

                {/* Account Status */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Account Status</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Status</label>
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          selectedUser.is_active 
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {selectedUser.is_active ? '✓ Active' : '✗ Inactive'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Member Since</label>
                      <p className="mt-1 text-base text-gray-900">{new Date(selectedUser.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Last Updated</label>
                      <p className="mt-1 text-base text-gray-900">
                        {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        }) : 'Never'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Roles & Permissions */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Roles & Permissions</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.is_admin && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
                        👑 Administrator
                      </span>
                    )}
                    {selectedUser.is_evaluator && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                        🔍 Evaluator
                      </span>
                    )}
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                      ✏️ Annotator
                    </span>
                    {!selectedUser.is_admin && !selectedUser.is_evaluator && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs text-gray-500 bg-gray-100 border border-gray-200">
                        Basic User
                      </span>
                    )}
                  </div>
                </div>

                {/* Languages */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Languages</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.languages && selectedUser.languages.length > 0 ? (
                      selectedUser.languages.map((lang) => (
                        <span key={lang} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                          🌐 {lang.charAt(0).toUpperCase() + lang.slice(1)}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500 italic">No languages specified</span>
                    )}
                  </div>
                </div>

                {/* Account Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Account Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                      <div className="text-lg font-bold text-blue-600">
                        #{selectedUser.id}
                      </div>
                      <div className="text-sm text-gray-600">User ID</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                      <div className="text-lg font-bold text-green-600">
                        {selectedUser.languages?.length || 0}
                      </div>
                      <div className="text-sm text-gray-600">Languages</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  ID: {selectedUser.id} • Created: {new Date(selectedUser.created_at).toLocaleString()}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowUserDetails(false);
                      handleEditUser(selectedUser);
                    }}
                    className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                  >
                    Edit User
                  </button>
                  <button
                    onClick={() => setShowUserDetails(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;