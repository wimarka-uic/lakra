export interface User {
  id: number; // Numeric ID from database
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
  back_translation?: string;  // Back translation for quality assessment
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
  annotator_id: number; // Numeric ID from database
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
  email: string; // Accepts both email and username
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
  user_type?: string;
  onboarding_passed?: boolean;
  test_answers?: UserQuestionAnswer[];
  test_session_id?: string;
}

export interface RegisterResult {
  user: User;
  requiresEmailConfirmation: boolean;
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


// Onboarding Test interfaces
export interface OnboardingTest {
  id: number;
  user_id: number; // Numeric ID from database
  language: string;
  test_data: OnboardingTestQuestion[];
  score?: number;
  status: 'in_progress' | 'completed' | 'failed';
  started_at: string;
  completed_at?: string;
  created_at: string;
  answers?: OnboardingTestAnswer[];
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
  is_correct?: boolean;
  type?: string;
  question?: string;
  options?: string[];
  selected_answer?: number;
  correct_answer?: number;
  explanation?: string;
}

export interface OnboardingTestSubmission {
  test_id: number;
  answers: OnboardingTestAnswer[];
}

export interface OnboardingTestCreate {
  language: string;
}

export interface OnboardingTestResult {
  total_questions: number;
  correct_answers: number;
  score: number; // Percentage (0-100)
  passed: boolean; // True if score >= 70
  questions_by_language: Record<string, unknown>; // Results breakdown by language
  session_id: string;
  updated_user?: User; // Updated user data after quiz completion
}

// Evaluation interfaces
export interface Evaluation {
  id: number;
  annotation_id: number;
  evaluator_id: number; // Numeric ID from database
  annotation_quality_score?: number;
  accuracy_score?: number;
  completeness_score?: number;
  overall_evaluation_score?: number;
  feedback?: string;
  evaluation_status: 'pending' | 'completed' | 'reviewed';
  time_spent_seconds?: number;
  created_at: string;
  updated_at: string;
  annotation: Annotation;
  evaluator: User;
}

export interface EvaluationCreate {
  annotation_id: number;
  annotation_quality_score?: number;
  accuracy_score?: number;
  completeness_score?: number;
  overall_evaluation_score?: number;
  feedback?: string;
  time_spent_seconds?: number;
  evaluation_notes?: string;
}

export interface EvaluationUpdate {
  annotation_quality_score?: number;
  accuracy_score?: number;
  completeness_score?: number;
  overall_evaluation_score?: number;
  feedback?: string;
  time_spent_seconds?: number;
  evaluation_status?: 'pending' | 'completed' | 'reviewed';
}

// Annotation Revision interfaces
export interface AnnotationRevision {
  id: number;
  annotation_id: number;
  evaluator_id: number;
  revision_type: 'approve' | 'revise';
  original_annotation: Annotation;
  revised_annotation?: Annotation;
  revision_notes?: string;
  revision_reason?: string;
  created_at: string;
  updated_at: string;
  evaluator: User;
}

export interface AnnotationRevisionCreate {
  annotation_id: number;
  revision_type: 'approve' | 'revise';
  revised_annotation?: Partial<Annotation>;
  revision_notes?: string;
  revision_reason?: string;
}

export interface AnnotationWithRevision extends Annotation {
  revisions: AnnotationRevision[];
  latest_revision?: AnnotationRevision;
  revision_status: 'pending_review' | 'approved' | 'revised' | 'needs_revision';
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

// Language Proficiency Question types
export interface LanguageProficiencyQuestion {
  id: number;
  language: string;
  type: 'grammar' | 'vocabulary' | 'translation' | 'cultural' | 'comprehension';
  question: string;
  options: string[];
  correct_answer: number; // index of correct option
  explanation: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: number; // Numeric ID from database
}

export interface UserQuestionAnswer {
  id?: number;
  user_id?: number; // Numeric ID from database
  question_id: number;
  selected_answer: number;
  is_correct?: boolean;
  answered_at?: string;
  test_session_id?: string;
}

// MT Quality Assessment interfaces
export interface MTQualityAssessment {
  id: number;
  sentence_id: number;
  evaluator_id: number;
  fluency_score?: number;
  adequacy_score?: number;
  overall_quality?: number;
  confidence_level?: number;
  error_detection?: string;
  improvement_suggestions?: string;
  evaluation_notes?: string;
  time_spent_seconds?: number;
  created_at: string;
  updated_at: string;
  sentence: Sentence;
  evaluator: User;
}

export interface MTQualityAssessmentCreate {
  sentence_id: number;
  fluency_score?: number;
  adequacy_score?: number;
  overall_quality?: number;
  confidence_level?: number;
  error_detection?: string;
  improvement_suggestions?: string;
  evaluation_notes?: string;
  time_spent_seconds?: number;
}

export interface MTQualityAssessmentUpdate {
  fluency_score?: number;
  adequacy_score?: number;
  overall_quality?: number;
  confidence_level?: number;
  error_detection?: string;
  improvement_suggestions?: string;
  evaluation_notes?: string;
  time_spent_seconds?: number;
}

// Model Prediction Review interfaces
export interface ModelPrediction {
  id: number;
  source_data_id: number;
  model_name: string;
  model_version?: string;
  prediction_data: Record<string, unknown>; // Flexible JSON structure for different model outputs
  confidence_score?: number;
  prediction_metadata?: Record<string, unknown>; // Additional model metadata
  status: 'pending_review' | 'approved' | 'revised' | 'rejected';
  created_at: string;
  updated_at: string;
  source_data: SourceData;
  reviews: ModelPredictionReview[];
}

export interface SourceData {
  id: number;
  data_type: 'text' | 'image' | 'audio' | 'video' | 'structured';
  content: string; // Main content (text, image URL, etc.)
  metadata?: Record<string, unknown>; // Additional source data metadata
  domain?: string;
  language?: string;
  created_at: string;
  is_active: boolean;
}

export interface ModelPredictionReview {
  id: number;
  prediction_id: number;
  evaluator_id: number;
  review_status: 'approved' | 'revised' | 'rejected';
  corrected_prediction?: Record<string, unknown>; // The evaluator's corrected version
  review_notes?: string;
  confidence_assessment?: number; // Evaluator's assessment of model confidence
  time_spent_seconds?: number;
  created_at: string;
  updated_at: string;
  evaluator: User;
}

export interface ModelPredictionCreate {
  source_data_id: number;
  model_name: string;
  model_version?: string;
  prediction_data: Record<string, unknown>;
  confidence_score?: number;
  prediction_metadata?: Record<string, unknown>;
}

export interface ModelPredictionReviewCreate {
  prediction_id: number;
  review_status: 'approved' | 'revised' | 'rejected';
  corrected_prediction?: Record<string, unknown>;
  review_notes?: string;
  confidence_assessment?: number;
  time_spent_seconds?: number;
}

export interface ModelPredictionImport {
  model_name: string;
  model_version?: string;
  predictions: Array<{
    source_data: {
      content: string;
      data_type: 'text' | 'image' | 'audio' | 'video' | 'structured';
      metadata?: Record<string, unknown>;
      domain?: string;
      language?: string;
    };
    prediction_data: Record<string, unknown>;
    confidence_score?: number;
    prediction_metadata?: Record<string, unknown>;
  }>;
}

export interface ModelPerformanceMetrics {
  model_name: string;
  total_predictions: number;
  approved_count: number;
  revised_count: number;
  rejected_count: number;
  accuracy_rate: number;
  average_confidence: number;
  average_review_time: number;
  evaluator_agreement_rate?: number;
}