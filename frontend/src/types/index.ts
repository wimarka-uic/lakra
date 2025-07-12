export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  preferred_language: string;
  languages: string[];
  is_active: boolean;
  is_admin: boolean;
  is_evaluator: boolean;
  guidelines_seen: boolean;
  onboarding_status?: string; // 'pending', 'in_progress', 'completed', 'failed'
  onboarding_score?: number;
  onboarding_completed_at?: string;
  created_at: string;
}

export interface Sentence {
  id: number;
  source_text: string;
  machine_translation: string;
  reference_translation?: string;  // Reference/human translation for comparison
  tagalog_source_text?: string;
  source_language: string;
  target_language: string;
  domain?: string;
  created_at: string;
  is_active: boolean;
}

export interface TextHighlight {
  id?: number;
  annotation_id?: number;
  highlighted_text: string;
  start_index: number;
  end_index: number;
  text_type: 'machine';
  comment: string;
  error_type?: 'MI_ST' | 'MI_SE' | 'MA_ST' | 'MA_SE';
  created_at?: string;
}

export interface Annotation {
  id: number;
  sentence_id: number;
  annotator_id: number;
  fluency_score?: number;
  adequacy_score?: number;
  overall_quality?: number;
  errors_found?: string;
  suggested_correction?: string;
  comments?: string;
  final_form?: string;
  voice_recording_url?: string;
  voice_recording_duration?: number;
  time_spent_seconds?: number;
  annotation_status: 'in_progress' | 'completed' | 'reviewed';
  created_at: string;
  updated_at: string;
  sentence: Sentence;
  annotator: User;
  highlights: TextHighlight[];
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  preferred_language: string;
  languages: string[];
  is_evaluator?: boolean;
}

export interface AnnotationCreate {
  sentence_id: number;
  fluency_score?: number;
  adequacy_score?: number;
  overall_quality?: number;
  errors_found?: string;
  suggested_correction?: string;
  comments?: string;
  final_form?: string;
  voice_recording_url?: string;
  voice_recording_duration?: number;
  time_spent_seconds?: number;
  highlights?: TextHighlight[];
}

export interface AnnotationUpdate {
  fluency_score?: number;
  adequacy_score?: number;
  overall_quality?: number;
  errors_found?: string;
  suggested_correction?: string;
  comments?: string;
  final_form?: string;
  voice_recording_url?: string;
  voice_recording_duration?: number;
  time_spent_seconds?: number;
  annotation_status?: 'in_progress' | 'completed' | 'reviewed';
  highlights?: TextHighlight[];
}

// Local annotation state interface for the annotation interface
export interface SentenceAnnotation {
  sentence_id: number;
  fluency_score?: number;
  adequacy_score?: number;
  overall_quality?: number;
  comments: string;
  final_form: string;
  voice_recording_url?: string;
  voice_recording_duration?: number;
  voice_recording_blob?: Blob;
  time_spent_seconds: number;
  highlights: TextSegment[];
  isExpanded: boolean;
  startTime: Date;
  annotation_id?: number;
  annotation_status?: string;
  created_at?: string;
  updated_at?: string;
}

// Text segment interface for local state
export interface TextSegment {
  id: string;
  highlighted_text: string;
  start_index: number;
  end_index: number;
  text_type: 'machine';
  error_type: 'MI_ST' | 'MI_SE' | 'MA_ST' | 'MA_SE';
  comment: string;
}

// Legacy interfaces for backward compatibility
export interface LegacyAnnotationCreate {
  sentence_id: number;
  fluency_score?: number;
  adequacy_score?: number;
  overall_quality?: number;
  errors_found?: string;
  suggested_correction?: string;
  comments?: string;
  time_spent_seconds?: number;
}

export interface AdminStats {
  total_users: number;
  total_sentences: number;
  total_annotations: number;
  completed_annotations: number;
  active_users: number;
}

// Machine Translation Quality Assessment interfaces
export interface MTQualityAssessment {
  id: number;
  sentence_id: number;
  evaluator_id: number;
  
  // AI-generated scores
  ai_fluency_score?: number;
  ai_adequacy_score?: number;
  ai_overall_score?: number;
  ai_confidence_level?: number;
  ai_errors?: any[];
  ai_explanation?: string;
  ai_suggestions?: string;
  
  // Human evaluation
  fluency_score?: number;
  adequacy_score?: number;
  overall_quality_score?: number;
  human_feedback?: string;
  correction_notes?: string;
  
  // Additional properties used in components
  processing_time_ms?: number;
  model_confidence?: number;
  syntax_errors?: ErrorDetails[];
  semantic_errors?: ErrorDetails[];
  quality_explanation?: string;
  correction_suggestions?: CorrectionSuggestion[];
  evaluation_status?: 'pending' | 'completed' | 'reviewed';
  
  // Metadata
  time_spent_seconds?: number;
  assessment_status: 'pending' | 'completed' | 'reviewed';
  created_at: string;
  updated_at: string;
  
  // Relationships
  sentence: Sentence;
  evaluator: User;
}

export interface MTQualityCreate {
  sentence_id: number;
  fluency_score?: number;
  adequacy_score?: number;
  overall_quality_score?: number;
  human_feedback?: string;
  correction_notes?: string;
  time_spent_seconds?: number;
}

export interface MTQualityUpdate {
  fluency_score?: number;
  adequacy_score?: number;
  overall_quality_score?: number;
  human_feedback?: string;
  correction_notes?: string;
  time_spent_seconds?: number;
}

// Onboarding Test interfaces
export interface OnboardingTest {
  id: number;
  user_id: number;
  language: string;
  test_data: OnboardingTestQuestion[];
  score?: number;
  status: 'in_progress' | 'completed' | 'failed';
  started_at: string;
  completed_at?: string;
}

export interface OnboardingTestQuestion {
  id: string;
  source_text: string;
  machine_translation: string;
  source_language: string;
  target_language: string;
  correct_fluency_score: number;
  correct_adequacy_score: number;
  error_types: string[];
  explanation: string;
}

export interface OnboardingTestAnswer {
  question_id: string;
  fluency_score: number;
  adequacy_score: number;
  identified_errors: string[];
  comment: string;
}

export interface OnboardingTestSubmission {
  test_id: number;
  answers: OnboardingTestAnswer[];
}

export interface OnboardingTestCreate {
  language: string;
}

export interface OnboardingTestResult {
  score: number;
  passed: boolean;
  status: string;
  message: string;
}

// Evaluation interfaces
export interface Evaluation {
  id: number;
  annotation_id: number;
  evaluator_id: number;
  fluency_rating?: number;
  adequacy_rating?: number;
  overall_rating?: number;
  feedback?: string;
  evaluation_status: 'pending' | 'completed' | 'reviewed';
  time_spent_seconds?: number;
  created_at: string;
  updated_at: string;
  annotation: Annotation;
  evaluator: User;
  
  // Additional evaluation properties
  overall_evaluation_score?: number;
}

export interface EvaluationCreate {
  annotation_id: number;
  fluency_rating?: number;
  adequacy_rating?: number;
  overall_rating?: number;
  feedback?: string;
  time_spent_seconds?: number;
  
  // Additional evaluation properties
  annotation_quality_score?: number;
  accuracy_score?: number;
  completeness_score?: number;
  overall_evaluation_score?: number;
  evaluation_notes?: string;
}

export interface EvaluationUpdate {
  fluency_rating?: number;
  adequacy_rating?: number;
  overall_rating?: number;
  feedback?: string;
  time_spent_seconds?: number;
  evaluation_status?: 'pending' | 'completed' | 'reviewed';
}

// Evaluator dashboard statistics
export interface EvaluatorStats {
  total_evaluations: number;
  completed_evaluations: number;
  pending_evaluations: number;
  average_rating?: number;
  total_time_spent: number;
  evaluations_today: number;
  weekly_progress: number[];
  
  // MT Quality specific stats
  total_assessments?: number;
  completed_assessments?: number;
  pending_assessments?: number;
  average_time_per_assessment?: number;
  average_overall_score?: number;
  human_agreement_rate?: number;
  average_fluency_score?: number;
  average_adequacy_score?: number;
  total_syntax_errors_found?: number;
  total_semantic_errors_found?: number;
  average_model_confidence?: number;
}

// Error and suggestion types
export interface ErrorDetails {
  type: string;
  description: string;
  severity?: 'low' | 'medium' | 'high';
  position?: {
    start: number;
    end: number;
  };
}

export interface CorrectionSuggestion {
  original_text: string;
  suggested_text: string;
  explanation: string;
  confidence?: number;
}