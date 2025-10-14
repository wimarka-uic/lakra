import supabase from '../utils/supabase';
import { logger } from '../utils/logger';
import type {
  User,
  Sentence,
  Annotation,
  AuthToken,
  LoginCredentials,
  RegisterData,
  RegisterResult,
  AnnotationCreate,
  AnnotationUpdate,
  AdminStats,
  Evaluation,
  EvaluationCreate,

  EvaluatorStats,
  MTQualityAssessment,
  MTQualityCreate,
  MTQualityUpdate,
  OnboardingTest,
  OnboardingTestQuestion,
  OnboardingTestResult,
  LanguageProficiencyQuestion,
  UserQuestionAnswer,
} from '../types';

// Auth storage (using localStorage for compatibility)
export const authStorage = {
  getToken: () => localStorage.getItem('access_token'),
  setToken: (token: string) => localStorage.setItem('access_token', token),
  removeToken: () => localStorage.removeItem('access_token'),
  getUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
  setUser: (user: User) => localStorage.setItem('user', JSON.stringify(user)),
  removeUser: () => localStorage.removeItem('user'),
};

// Auth API
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthToken> => {
    let email = credentials.email;
    let isUsernameLogin = false;
    
    // Check if the input is a username (not an email)
    if (!credentials.email.includes('@')) {
      isUsernameLogin = true;
      logger.debug('Attempting username-based login', {
        component: 'authAPI',
        action: 'login',
        metadata: { username: credentials.email }
      });
      
      // Look up the user by username to get their email using raw SQL
      const { data: userByUsernameArray, error: usernameError } = await supabase
        .rpc('get_user_by_username', { username_param: credentials.email });
      
      // Extract the first (and should be only) user from the array
      const userByUsername = userByUsernameArray?.[0];
      
      logger.debug('Username lookup result', {
        component: 'authAPI',
        action: 'login',
        metadata: { 
          username: credentials.email, 
          hasData: !!userByUsername, 
          hasError: !!usernameError,
          errorMessage: usernameError?.message,
          errorCode: usernameError?.code
        }
      });
      
      if (usernameError) {
        logger.error('Username lookup error', {
          component: 'authAPI',
          action: 'login',
          metadata: { username: credentials.email, error: usernameError.message, errorCode: usernameError.code }
        });
        
        if (usernameError.code === 'PGRST116') {
          // No rows returned - username doesn't exist
          logger.debug('Username not found', {
            component: 'authAPI',
            action: 'login',
            metadata: { username: credentials.email }
          });
          throw new Error('Invalid username or password');
        }
        
        throw new Error('Authentication error. Please try again.');
      }
      
      if (!userByUsername || !userByUsername.email) {
        logger.debug('No user data or email returned for username', {
          component: 'authAPI',
          action: 'login',
          metadata: { username: credentials.email, userData: userByUsername }
        });
        throw new Error('Invalid username or password');
      }
      
      email = userByUsername.email;
      logger.debug('Username lookup successful', {
        component: 'authAPI',
        action: 'login',
        metadata: { username: credentials.email, email: email, foundUsername: userByUsername.username }
      });
    }

    logger.debug('Attempting Supabase authentication', {
      component: 'authAPI',
      action: 'login',
      metadata: { email: email, isUsernameLogin }
    });

    // Ensure we have a clean authentication state
    await supabase.auth.signOut();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: credentials.password,
    });

    if (error) {
      logger.error('Supabase authentication failed', {
        component: 'authAPI',
        action: 'login',
        metadata: { email: email, error: error.message, isUsernameLogin }
      });
      
      // Provide more specific error messages for username login
      if (isUsernameLogin) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid username or password');
        }
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Please check your email and confirm your account before signing in.');
        }
      }
      
      throw error;
    }

    if (!data.user) {
      logger.error('No user data returned from Supabase auth', {
        component: 'authAPI',
        action: 'login',
        metadata: { email: email, isUsernameLogin }
      });
      throw new Error('Authentication failed. Please try again.');
    }

    // Check if email is confirmed
    if (!data.user.email_confirmed_at) {
      logger.warn('Login attempted with unconfirmed email', {
        component: 'authAPI',
        action: 'login',
        metadata: { email: email, userId: data.user.id, isUsernameLogin }
      });
      throw new Error('Please check your email and confirm your account before signing in.');
    }

    // Get user profile from our users table
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      logger.error('Failed to get user profile', {
        component: 'authAPI',
        action: 'login',
        metadata: { userId: data.user.id, error: profileError.message }
      });
      throw profileError;
    }

    // Get user languages
    const { data: languages } = await supabase
      .from('user_languages')
      .select('language')
      .eq('user_id', data.user.id);

    const user: User = {
      ...userProfile,
      languages: languages?.map(l => l.language) || [],
    };

    if (!data.session) {
      logger.error('No session returned from Supabase auth', {
        component: 'authAPI',
        action: 'login',
        metadata: { userId: data.user.id, isUsernameLogin }
      });
      throw new Error('Authentication failed. No session created.');
    }

    const token = data.session.access_token;
    authStorage.setToken(token);
    authStorage.setUser(user);

    logger.debug('Login successful', {
      component: 'authAPI',
      action: 'login',
      metadata: { userId: user.id, isUsernameLogin }
    });

    return {
      access_token: token,
      token_type: 'bearer',
      user,
    };
  },

  register: async (userData: RegisterData): Promise<RegisterResult> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let signupData: { user: any; session: any } | null = null;
    let signupError: Error | null = null;

    // For users who need onboarding test, validate the test first
    if (userData.onboarding_passed && userData.test_answers && userData.test_answers.length > 0) {
      // Get correct answers for all questions to calculate correctness
      const questionIds = userData.test_answers.map((answer: UserQuestionAnswer) => answer.question_id);
      const { data: questions } = await supabase
        .from('language_proficiency_questions') 
        .select('id, correct_answer')
        .in('id', questionIds);

      if (!questions || questions.length === 0) {
        throw new Error('Failed to validate test answers. Please try again.');
      }

      // Calculate score to double-check
      let correct_count = 0;
      for (const answer of userData.test_answers) {
        const question = questions.find(q => q.id === answer.question_id);
        if (question && answer.selected_answer === question.correct_answer) {
          correct_count++;
        }
      }

      const score = (correct_count / userData.test_answers.length) * 100;
      if (score < 70) {
        throw new Error(`Test validation failed. Score: ${score.toFixed(1)}%. You need at least 70% to register.`);
      }
    }

    try {
      // FIRST: Create the user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            onboarding_passed: userData.onboarding_passed || false
          }
        }
      });

      signupData = data;
      signupError = error;

      if (error) throw error;
      if (signupError) throw signupError;
      if (!signupData || !signupData.user) throw new Error('Registration failed');

      // NOW: Create user profile using the database function (which has SECURITY DEFINER privileges)
      const profileData = {
        user_id: signupData!.user.id,
        user_email: userData.email,
        user_username: userData.username,
        user_first_name: userData.first_name,
        user_last_name: userData.last_name,
        user_preferred_language: userData.preferred_language || userData.languages?.[0] || 'tagalog',
        user_is_evaluator: userData.is_evaluator || false,
        user_onboarding_status: userData.onboarding_passed ? 'completed' : 'pending',
        user_onboarding_score: userData.onboarding_passed ? 100.0 : null,
        user_onboarding_completed_at: userData.onboarding_passed ? new Date().toISOString() : null
      };


      const { error: profileError } = await supabase
        .rpc('create_user_profile', profileData);

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw profileError;
      }

      // Add user languages using the database function
      if (userData.languages && userData.languages.length > 0) {
        const languageData = {
          user_id_param: signupData!.user.id,
          languages_param: userData.languages
        };
        
        
        const { error: langError } = await supabase
          .rpc('create_user_languages', languageData);

        if (langError) {
          console.error('Language creation error:', langError);
          throw langError;
        }
      }

      // Store test answers if provided using the database function
      if (userData.test_answers && userData.test_answers.length > 0) {
        const testAnswersData = {
          user_id_param: signupData!.user.id,
          test_answers_param: userData.test_answers,
          test_session_id_param: userData.test_session_id
        };
        
        
        const { error: testAnswersError } = await supabase
          .rpc('create_user_test_answers', testAnswersData);

        if (testAnswersError) {
          console.error('Test answers creation error:', testAnswersError);
          throw testAnswersError;
        }
      }

    } catch (error) {
      // If any step fails, clean up any partial data
      console.error('Registration failed, cleaning up:', error);
      
      // If Supabase Auth user was created but profile creation failed, we can't easily clean up
      // The user will need to contact support or try again with a different email
      throw error;
    }

    // Get the created user profile
    const { data: userProfile, error: getError } = await supabase
      .from('users')
      .select('*')
      .eq('id', signupData!.user.id)
      .single();

    if (getError) throw getError;

    // Get user languages
    const { data: languages } = await supabase
      .from('user_languages')
      .select('language')
      .eq('user_id', signupData!.user.id);

    const user: User = {
      ...userProfile,
      languages: languages?.map(l => l.language) || [],
    };

    return {
      user,
      requiresEmailConfirmation: false,
    };
  },



  // Password reset functionality
  sendPasswordResetEmail: async (email: string): Promise<void> => {
    // Use Supabase's built-in password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
  },

  resetPassword: async (newPassword: string): Promise<void> => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
  },

  getCurrentUser: async (): Promise<User> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('No authenticated user');

    const { data: userProfile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;

    // Get user languages
    const { data: languages } = await supabase
      .from('user_languages')
      .select('language')
      .eq('user_id', user.id);

    return {
      ...userProfile,
      languages: languages?.map(l => l.language) || [],
    };
  },

  checkEmailExists: async (email: string): Promise<boolean> => {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', normalizedEmail)
        .single();


      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" which means email doesn't exist
        throw error;
      }

      // If we get data, email exists; if no data (PGRST116), email doesn't exist
      const exists = !!data;
      return exists;
    } catch (error) {
      logger.error('Error checking email existence', {
        component: 'authAPI',
        action: 'checkEmailExists',
        metadata: { email: email, error: (error as Error).message }
      });
      throw new Error('Unable to verify email availability. Please try again.');
    }
  },

  checkUsernameExists: async (username: string): Promise<boolean> => {
    try {
      const normalizedUsername = username.toLowerCase().trim();
      
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('username', normalizedUsername)
        .single();


      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" which means username doesn't exist
        throw error;
      }

      // If we get data, username exists; if no data (PGRST116), username doesn't exist
      const exists = !!data;
      return exists;
    } catch (error) {
      logger.error('Error checking username existence', {
        component: 'authAPI',
        action: 'checkUsernameExists',
        metadata: { username: username, error: (error as Error).message }
      });
      throw new Error('Unable to verify username availability. Please try again.');
    }
  },


  markGuidelinesSeen: async (): Promise<User> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('users')
      .update({ guidelines_seen: true })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;

    // Get user languages
    const { data: languages } = await supabase
      .from('user_languages')
      .select('language')
      .eq('user_id', user.id);

    return {
      ...data,
      languages: languages?.map(l => l.language) || [],
    };
  },

  updateProfile: async (profileData: {
    first_name?: string;
    last_name?: string;
    preferred_language?: string;
    languages?: string[];
  }): Promise<User> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('No authenticated user');

    // Update user profile
    const updateData: Partial<{
      first_name: string;
      last_name: string;
      preferred_language: string;
    }> = {};
    if (profileData.first_name !== undefined) updateData.first_name = profileData.first_name;
    if (profileData.last_name !== undefined) updateData.last_name = profileData.last_name;
    if (profileData.preferred_language !== undefined) updateData.preferred_language = profileData.preferred_language;

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;

    // Update languages if provided
    if (profileData.languages !== undefined) {
      // Delete existing languages
      await supabase
        .from('user_languages')
        .delete()
        .eq('user_id', user.id);

      // Add new languages
      if (profileData.languages.length > 0) {
        const languageData = profileData.languages.map(lang => ({
          user_id: user.id,
          language: lang,
        }));

        await supabase
          .from('user_languages')
          .insert(languageData);
      }
    }

    // Get updated user with languages
    const { data: languages } = await supabase
      .from('user_languages')
      .select('language')
      .eq('user_id', user.id);

    return {
      ...data,
      languages: languages?.map(l => l.language) || [],
    };
  },

  logout: async (): Promise<void> => {
    await supabase.auth.signOut();
    authStorage.removeToken();
    authStorage.removeUser();
  },
};

// Language mapping function
const getLanguageCode = (displayName: string): string => {
  const normalizedName = displayName.toLowerCase().trim();
  const languageMap: { [key: string]: string } = {
    'tagalog': 'tgl',
    'tagalog (filipino)': 'tgl',
    'filipino': 'tgl',
    'cebuano': 'ceb',
    'ilocano': 'ilo',
    'Ilocano': 'ilo',
    'english': 'en',
    // Direct language codes should match themselves
    'tgl': 'tgl',
    'ceb': 'ceb',
    'ilo': 'ilo',
    'en': 'en'
  };
  return languageMap[normalizedName] || displayName;
};

// Sentences API
export const sentencesAPI = {
  getSentences: async (skip = 0, limit = 100): Promise<Sentence[]> => {
    const { data, error } = await supabase
      .from('sentences')
      .select('*')
      .eq('is_active', true)
      .range(skip, skip + limit - 1);

    if (error) throw error;
    return data || [];
  },

  getSentence: async (id: number): Promise<Sentence> => {
    const { data, error } = await supabase
      .from('sentences')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  getNextSentence: async (): Promise<Sentence | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('No authenticated user');

    // Get user's preferred language
    const { data: userProfile } = await supabase
      .from('users')
      .select('preferred_language')
      .eq('id', user.id)
      .single();

    if (!userProfile?.preferred_language) return null;

    // First, get the IDs of sentences that have been annotated by this user
    const { data: annotatedSentenceIds, error: subqueryError } = await supabase
      .from('annotations')
      .select('sentence_id')
      .eq('annotator_id', user.id);

    if (subqueryError) throw subqueryError;

    const annotatedIds = annotatedSentenceIds?.map(a => a.sentence_id) || [];

    // Find sentences that haven't been annotated by this user
    let query = supabase
      .from('sentences')
      .select('*')
      .eq('is_active', true)
      .eq('target_language', getLanguageCode(userProfile.preferred_language));

    // Only apply the NOT IN filter if there are annotated IDs
    if (annotatedIds.length > 0) {
      query = query.not('id', 'in', `(${annotatedIds.join(',')})`);
    }

    const { data, error } = await query.limit(1).single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data;
  },

  getUnannotatedSentences: async (skip = 0, limit = 50): Promise<Sentence[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('No authenticated user');

    // Get user's preferred language
    const { data: userProfile } = await supabase
      .from('users')
      .select('preferred_language')
      .eq('id', user.id)
      .single();

    if (!userProfile?.preferred_language) return [];

    // First, get the IDs of sentences that have been annotated by this user
    const { data: annotatedSentenceIds, error: subqueryError } = await supabase
      .from('annotations')
      .select('sentence_id')
      .eq('annotator_id', user.id);

    if (subqueryError) throw subqueryError;

    const annotatedIds = annotatedSentenceIds?.map(a => a.sentence_id) || [];

    // Find sentences that haven't been annotated by this user
    let query = supabase
      .from('sentences')
      .select('*')
      .eq('is_active', true)
      .eq('target_language', getLanguageCode(userProfile.preferred_language));

    // Only apply the NOT IN filter if there are annotated IDs
    if (annotatedIds.length > 0) {
      query = query.not('id', 'in', `(${annotatedIds.join(',')})`);
    }

    const { data, error } = await query.range(skip, skip + limit - 1);

    if (error) throw error;
    return data || [];
  },

  // New method to get sentences prioritized by annotation status
  getPrioritizedSentences: async (skip = 0, limit = 50): Promise<Sentence[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('No authenticated user');

    // Get user's preferred language
    const { data: userProfile } = await supabase
      .from('users')
      .select('preferred_language')
      .eq('id', user.id)
      .single();

    if (!userProfile?.preferred_language) return [];

    try {
      // Try to use the custom RPC function first
      const { data, error } = await supabase
        .rpc('get_prioritized_sentences', {
          user_id: user.id,
          target_language: getLanguageCode(userProfile.preferred_language),
          skip_count: skip,
          limit_count: limit
        });

      if (error) throw error;
      return data || [];
    } catch (rpcError) {
      // Fallback to manual prioritization if RPC function doesn't exist
      logger.warn('RPC function not available, using fallback method', {
        component: 'sentencesAPI',
        action: 'getPrioritizedSentences',
        metadata: { error: (rpcError as Error).message }
      });

      // Get all sentences for the user's language
      const { data: allSentences, error: sentencesError } = await supabase
        .from('sentences')
        .select('*')
        .eq('is_active', true)
        .eq('target_language', getLanguageCode(userProfile.preferred_language))
        .order('created_at', { ascending: false });

      if (sentencesError) throw sentencesError;

      // Get user's annotated sentence IDs
      const { data: annotatedIds } = await supabase
        .from('annotations')
        .select('sentence_id')
        .eq('annotator_id', user.id);

      const annotatedSentenceIds = new Set(annotatedIds?.map(a => a.sentence_id) || []);

      // Separate unannotated and annotated sentences
      const unannotated = (allSentences || []).filter(s => !annotatedSentenceIds.has(s.id));
      const annotated = (allSentences || []).filter(s => annotatedSentenceIds.has(s.id));

      // Combine with unannotated first, then annotated
      const prioritized = [...unannotated, ...annotated];

      // Apply pagination
      return prioritized.slice(skip, skip + limit);
    }
  },

  createSentence: async (sentenceData: {
    source_text: string;
    machine_translation: string;
    back_translation?: string;
    source_language: string;
    target_language: string;
    domain?: string;
  }): Promise<Sentence> => {
    const { data, error } = await supabase
      .from('sentences')
      .insert({
        source_text: sentenceData.source_text,
        machine_translation: sentenceData.machine_translation,
        back_translation: sentenceData.back_translation,
        source_language: sentenceData.source_language,
        target_language: sentenceData.target_language,
        domain: sentenceData.domain,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  importSentencesFromCSV: async (file: File): Promise<{
    message: string;
    imported_count: number;
    skipped_count: number;
    total_rows: number;
    errors: string[];
  }> => {
    const text = await file.text();
    const lines = text.split('\n');
    
    // Improved CSV header parsing with proper quote handling
    const parseCSVHeaders = (headerLine: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < headerLine.length; i++) {
        const char = headerLine[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim().replace(/^"|"$/g, '')); // Remove outer quotes
          current = '';
        } else {
          current += char;
        }
      }
      
      result.push(current.trim().replace(/^"|"$/g, '')); // Remove outer quotes
      return result;
    };
    
    const headers = parseCSVHeaders(lines[0]);
    
    const requiredColumns = ['source_text', 'machine_translation', 'source_language', 'target_language'];
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));
    
    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    const sentences = [];
    const errors: string[] = [];
    let importedCount = 0;
    let skippedCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      try {
        // Enhanced CSV line parsing with better quote handling and error detection
        const parseCSVLine = (line: string): string[] => {
          const result: string[] = [];
          let current = '';
          let inQuotes = false;
          let quoteCount = 0;
          
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
              inQuotes = !inQuotes;
              quoteCount++;
            } else if (char === ',' && !inQuotes) {
              result.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          
          // Check for unclosed quotes
          if (inQuotes) {
            throw new Error('Unclosed quotes detected');
          }
          
          // Check for odd number of quotes (malformed CSV)
          if (quoteCount % 2 !== 0) {
            throw new Error('Malformed quotes detected');
          }
          
          result.push(current.trim());
          
          // Remove outer quotes and handle escaped quotes
          return result.map(v => {
            let cleaned = v.replace(/^"|"$/g, ''); // Remove outer quotes
            cleaned = cleaned.replace(/""/g, '"'); // Handle escaped quotes (double quotes)
            return cleaned;
          });
        };
        
        const values = parseCSVLine(line);
        
        // Validate that we have the correct number of columns
        if (values.length !== headers.length) {
          errors.push(`Row ${i + 1}: Column count mismatch. Expected ${headers.length} columns, got ${values.length}`);
          skippedCount++;
          continue;
        }
        
        const sentence = {
          source_text: values[headers.indexOf('source_text')] || '',
          machine_translation: values[headers.indexOf('machine_translation')] || '',
          source_language: values[headers.indexOf('source_language')] || 'en',
          target_language: values[headers.indexOf('target_language')] || 'tgl',
          domain: headers.includes('domain') ? values[headers.indexOf('domain')] || '' : '',
          // back_translation is excluded from CSV imports - let the DB handle it as optional data
        };

        // Validate required fields
        if (!sentence.source_text || !sentence.machine_translation) {
          errors.push(`Row ${i + 1}: Missing required fields (source_text and machine_translation are required)`);
          skippedCount++;
          continue;
        }

        // Validate languages
        const validSourceLanguages = ['en', 'tgl', 'ilo', 'ceb'];
        const validTargetLanguages = ['tgl', 'ilo', 'ceb', 'en'];
        
        if (!validSourceLanguages.includes(sentence.source_language)) {
          errors.push(`Row ${i + 1}: Invalid source language '${sentence.source_language}'. Valid options: ${validSourceLanguages.join(', ')}`);
          skippedCount++;
          continue;
        }

        if (!validTargetLanguages.includes(sentence.target_language)) {
          errors.push(`Row ${i + 1}: Invalid target language '${sentence.target_language}'. Valid options: ${validTargetLanguages.join(', ')}`);
          skippedCount++;
          continue;
        }

        // Validate domain if provided
        if (sentence.domain && sentence.domain.trim()) {
          const validDomains = ['conversational', 'news', 'legal', 'medical', 'educational'];
          if (!validDomains.includes(sentence.domain)) {
            errors.push(`Row ${i + 1}: Invalid domain '${sentence.domain}'. Valid options: ${validDomains.join(', ')}`);
            skippedCount++;
            continue;
          }
        }

        sentences.push(sentence);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown parsing error';
        errors.push(`Row ${i + 1}: CSV parsing error - ${errorMessage}. Please check your CSV format and ensure proper quote usage.`);
        skippedCount++;
      }
    }

    // Insert sentences in batches
    if (sentences.length > 0) {
      const batchSize = 100;
      for (let i = 0; i < sentences.length; i += batchSize) {
        const batch = sentences.slice(i, i + batchSize);
        const { error } = await supabase
          .from('sentences')
          .insert(batch);

        if (error) {
          errors.push(`Batch ${Math.floor(i / batchSize) + 1}: Database error - ${error.message}`);
        } else {
          importedCount += batch.length;
        }
      }
    }

    return {
      message: importedCount > 0 ? 'Import completed successfully' : 'Import failed',
      imported_count: importedCount,
      skipped_count: skippedCount,
      total_rows: lines.length - 1,
      errors,
    };
  },
};

// Annotations API
export const annotationsAPI = {
  createAnnotation: async (annotationData: AnnotationCreate): Promise<Annotation> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('No authenticated user');

    // Check if user already annotated this sentence
    const { data: existing } = await supabase
      .from('annotations')
      .select('id')
      .eq('sentence_id', annotationData.sentence_id)
      .eq('annotator_id', user.id)
      .maybeSingle();

    if (existing) {
      throw new Error('You have already annotated this sentence');
    }

    // Prepare annotation data without highlights (they go in separate table)
    const { highlights, ...annotationInsertData } = annotationData;

    // Create annotation
    const { data: annotation, error } = await supabase
      .from('annotations')
      .insert({
        ...annotationInsertData,
        annotator_id: user.id,
        annotation_status: 'completed',
      })
      .select()
      .single();

    if (error) throw error;

    // Create highlights if provided
    if (highlights && highlights.length > 0) {
      const highlightsData = highlights.map(h => ({
        annotation_id: annotation.id,
        highlighted_text: h.highlighted_text,
        start_index: h.start_index,
        end_index: h.end_index,
        text_type: h.text_type,
        comment: h.comment,
        error_type: h.error_type,
      }));

      const { error: highlightsError } = await supabase
        .from('text_highlights')
        .insert(highlightsData);

      if (highlightsError) throw highlightsError;
    }

    return annotation;
  },

  getMyAnnotations: async (skip = 0, limit = 100): Promise<Annotation[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('annotations')
      .select(`
        *,
        sentence:sentences(*),
        highlights:text_highlights(*)
      `)
      .eq('annotator_id', user.id)
      .range(skip, skip + limit - 1);

    if (error) throw error;
    return data || [];
  },

  // Get annotations by specific annotator with optional language filter
  getAnnotationsByAnnotator: async (annotatorId: number, targetLanguage?: string): Promise<Annotation[]> => {
    // First get annotations for the annotator
    const query = supabase
      .from('annotations')
      .select(`
        *,
        sentence:sentences(*),
        annotator:users(*),
        highlights:text_highlights(*)
      `)
      .eq('annotator_id', annotatorId)
      .order('created_at', { ascending: false });

    const { data: annotations, error } = await query;

    if (error) throw error;

    // If targetLanguage filter is specified, filter the results
    if (targetLanguage && annotations) {
      return annotations.filter(annotation => 
        annotation.sentence?.target_language === targetLanguage
      );
    }

    return annotations || [];
  },

  // Get all annotators with their annotation counts
  getAnnotatorsWithStats: async (): Promise<Array<User & { annotation_count: number; languages: string[] }>> => {
    // First get all active non-admin users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .eq('is_active', true)
      .not('is_admin', 'eq', true);

    if (usersError) throw usersError;

    // Then get annotation counts for each user
    const usersWithStats = await Promise.all(
      (users || []).map(async (user) => {
        // Get annotation count for this user
        const { count: annotationCount } = await supabase
          .from('annotations')
          .select('*', { count: 'exact', head: true })
          .eq('annotator_id', user.id);

        // Get languages from user_languages table
        const { data: userLanguages } = await supabase
          .from('user_languages')
          .select('language')
          .eq('user_id', user.id);

        return {
          ...user,
          annotation_count: annotationCount || 0,
          languages: userLanguages?.map(l => l.language) || []
        };
      })
    );

    return usersWithStats;
  },

  // Generate JSON extraction format for annotation data
  generateAnnotationJSON: (annotation: Annotation): string => {
    const { sentence, highlights = [] } = annotation;
    
    // Build errors string with highlighted text and error types
    const errorsString = highlights
      .map(highlight => {
        const errorType = highlight.error_type || 'MI_SE';
        return `[${errorType}]${highlight.highlighted_text}[/${errorType}]`;
      })
      .join(' ');

    // Build comments string with error explanations
    const commentsString = highlights
      .map(highlight => {
        const errorType = highlight.error_type || 'MI_SE';
        return `[${errorType}] ${highlight.comment} [/${errorType}]`;
      })
      .join(' ');

    const jsonData = {
      sourceText: `[${sentence.source_language}] ${sentence.source_text}`,
      machineTranslation: `[${sentence.target_language}] ${sentence.machine_translation}`,
      errors: errorsString ? `[${sentence.target_language}] ${errorsString}` : '',
      finalForm: `[${sentence.target_language}] ${annotation.final_form || sentence.machine_translation}`,
      comments: commentsString,
      fluencyScore: annotation.fluency_score,
      adequacyScore: annotation.adequacy_score,
      overallQuality: annotation.overall_quality
    };

    return JSON.stringify(jsonData, null, 2);
  },

  deleteAnnotation: async (id: number): Promise<{ message: string }> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('No authenticated user');

    // Delete highlights first
    const { error: highlightsError } = await supabase
      .from('text_highlights')
      .delete()
      .eq('annotation_id', id);

    if (highlightsError) throw highlightsError;

    // Delete evaluations
    const { error: evaluationsError } = await supabase
      .from('evaluations')
      .delete()
      .eq('annotation_id', id);

    if (evaluationsError) throw evaluationsError;

    // Delete annotation
    const { error } = await supabase
      .from('annotations')
      .delete()
      .eq('id', id)
      .eq('annotator_id', user.id);

    if (error) throw error;

    return { message: 'Annotation deleted successfully' };
  },

  updateAnnotation: async (id: number, updateData: AnnotationUpdate): Promise<Annotation> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('No authenticated user');

    // Prepare update data without highlights (they go in separate table)
    const { highlights, ...annotationUpdateData } = updateData;

    // Update annotation
    const { data: annotation, error } = await supabase
      .from('annotations')
      .update({
        ...annotationUpdateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('annotator_id', user.id)
      .select(`
        *,
        sentence:sentences(*),
        highlights:text_highlights(*)
      `)
      .single();

    if (error) throw error;

    // Update highlights if provided
    if (highlights && highlights.length > 0) {
      // Delete existing highlights
      const { error: deleteError } = await supabase
        .from('text_highlights')
        .delete()
        .eq('annotation_id', id);

      if (deleteError) throw deleteError;

      // Insert new highlights
      const highlightsData = highlights.map(h => ({
        annotation_id: id,
        highlighted_text: h.highlighted_text,
        start_index: h.start_index,
        end_index: h.end_index,
        text_type: h.text_type,
        comment: h.comment,
        error_type: h.error_type,
      }));

      const { error: insertError } = await supabase
        .from('text_highlights')
        .insert(highlightsData);

      if (insertError) throw insertError;
    }

    return annotation;
  },

  uploadVoiceRecording: async (annotationId: number, audioBlob: Blob, duration: number): Promise<{ voice_recording_url: string }> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('No authenticated user');



    // Determine the best file extension based on the blob type
    let fileExtension = 'webm';
    if (audioBlob.type) {
      if (audioBlob.type.includes('mp4')) fileExtension = 'mp4';
      else if (audioBlob.type.includes('mpeg')) fileExtension = 'mp3';
      else if (audioBlob.type.includes('aac')) fileExtension = 'aac';
      else if (audioBlob.type.includes('wav')) fileExtension = 'wav';
      else if (audioBlob.type.includes('ogg')) fileExtension = 'ogg';
    }

    // Generate unique filename with proper extension
    const fileName = `${user.id}/${annotationId}-${Date.now()}.${fileExtension}`;
    
    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('voice-recordings')
      .upload(fileName, audioBlob, {
        contentType: audioBlob.type || 'audio/webm',
        cacheControl: '3600',
      });

    if (uploadError) {
      logger.error('Storage upload error', {
        component: 'annotationsAPI',
        action: 'uploadVoiceRecording',
        metadata: { error: uploadError.message }
      });
      throw new Error(`Failed to upload voice recording: ${uploadError.message}`);
    }

    // Store the file path instead of public URL (since bucket is private)
    const filePath = fileName;

    // Update annotation with voice recording file path and duration
    const { error: updateError } = await supabase
      .from('annotations')
      .update({
        voice_recording_url: filePath, // Store file path instead of public URL
        voice_recording_duration: duration,
        updated_at: new Date().toISOString(),
      })
      .eq('id', annotationId)
      .eq('annotator_id', user.id);

    if (updateError) {
      logger.error('Database update error', {
        component: 'annotationsAPI',
        action: 'uploadVoiceRecording',
        metadata: { error: updateError.message }
      });
      throw new Error(`Failed to update annotation with voice recording: ${updateError.message}`);
    }



    return { voice_recording_url: filePath };
  },

  // New function to get signed URL for voice recordings
  getSignedVoiceRecordingUrl: async (filePath: string): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('No authenticated user');



    // Generate signed URL that expires in 1 hour
    const { data, error } = await supabase.storage
      .from('voice-recordings')
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (error) {
      logger.error('Error generating signed URL', {
        component: 'annotationsAPI',
        action: 'getSignedVoiceRecordingUrl',
        metadata: { error: error.message, errorName: error.name }
      });
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }



    return data.signedUrl;
  },
};

// Admin API
export const adminAPI = {
  getStats: async (): Promise<AdminStats> => {
    // Get counts using multiple queries
    const [
      { count: total_users },
      { count: total_sentences },
      { count: total_annotations },
      { count: completed_annotations },
      { count: active_users }
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('sentences').select('*', { count: 'exact', head: true }),
      supabase.from('annotations').select('*', { count: 'exact', head: true }),
      supabase.from('annotations').select('*', { count: 'exact', head: true }).eq('annotation_status', 'completed'),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_active', true),
    ]);

    return {
      total_users: total_users || 0,
      total_sentences: total_sentences || 0,
      total_annotations: total_annotations || 0,
      completed_annotations: completed_annotations || 0,
      active_users: active_users || 0,
    };
  },

  getAllUsers: async (skip = 0, limit = 100, role?: string, active?: boolean, search?: string): Promise<User[]> => {
    let query = supabase
      .from('users')
      .select(`
        *,
        languages:user_languages(language)
      `)
      .range(skip, skip + limit - 1);

    if (role === 'admin') query = query.eq('is_admin', true);
    else if (role === 'evaluator') query = query.eq('is_evaluator', true);
    else if (role === 'annotator') query = query.eq('is_admin', false).eq('is_evaluator', false);

    if (active !== undefined) query = query.eq('is_active', active);

    if (search) {
      query = query.or(`email.ilike.%${search}%,username.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Transform data to match expected format
    return (data || []).map(user => ({
      ...user,
              languages: user.languages?.map((l: { language: string }) => l.language) || [],
    }));
  },

  // User Management Functions
  createUser: async (): Promise<User> => {
    // Note: This requires Supabase Auth Admin API which is not available in client-side code
    // In a production environment, this should be handled by a server-side API
    throw new Error('User creation requires server-side implementation. Please contact your administrator.');
  },

  updateUser: async (userId: number, userData: Partial<User>): Promise<User> => {
    const { error } = await supabase
      .from('users')
      .update({
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        username: userData.username,
        is_active: userData.is_active,
        is_admin: userData.is_admin,
        is_evaluator: userData.is_evaluator,
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    // Update user languages
    if (userData.languages) {
      // Delete existing languages
      await supabase
        .from('user_languages')
        .delete()
        .eq('user_id', userId);

      // Add new languages
      if (userData.languages.length > 0) {
        const languageData = userData.languages.map((lang: string) => ({
          user_id: userId,
          language: lang,
        }));

        const { error: langError } = await supabase
          .from('user_languages')
          .insert(languageData);

        if (langError) throw langError;
      }
    }

    // Get updated user with languages
    const { data: updatedUser, error: getError } = await supabase
      .from('users')
      .select(`
        *,
        languages:user_languages(language)
      `)
      .eq('id', userId)
      .single();

    if (getError) throw getError;

    return {
      ...updatedUser,
      languages: updatedUser.languages?.map((l: { language: string }) => l.language) || [],
    };
  },

  deleteUser: async (userId: number): Promise<void> => {
    // Delete user languages first
    await supabase
      .from('user_languages')
      .delete()
      .eq('user_id', userId);

    // Delete user profile
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) throw error;

    // Note: We don't delete the Supabase Auth user here for safety
    // The admin would need to do this manually in the Supabase dashboard
  },

  resetUserPassword: async (): Promise<void> => {
    // Note: This requires Supabase Auth Admin API which is not available in client-side code
    // In a production environment, this should be handled by a server-side API
    throw new Error('Password reset requires server-side implementation. Please contact your administrator.');
  },

  sendPasswordResetEmail: async (userId: number): Promise<void> => {
    try {
      // Get user email
      const { data: user, error: getError } = await supabase
        .from('users')
        .select('email')
        .eq('id', userId)
        .single();

      if (getError) throw getError;

      if (!user?.email) {
        throw new Error('User email not found');
      }

      // Send password reset email using Supabase Auth
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        // Handle rate limiting specifically
        if (error.message.includes('security purposes')) {
          throw new Error(error.message);
        } else if (error.message.includes('429')) {
          throw new Error('Rate limit exceeded. Please wait 60 seconds before requesting another password reset email.');
        }
        throw error;
      }
    } catch (error) {
      // If admin functions are not available, throw a helpful error
      if (error instanceof Error && error.message.includes('admin')) {
        throw new Error('Password reset email requires server-side implementation. Please contact your administrator.');
      }
      throw error;
    }
  },

  deactivateUser: async (userId: number, reason?: string): Promise<void> => {
    const { error } = await supabase
      .from('users')
      .update({
        is_active: false,
        deactivation_reason: reason,
        deactivated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) throw error;
  },

  toggleEvaluatorRole: async (userId: number): Promise<User> => {
    // Get current user
    const { data: user, error: getError } = await supabase
      .from('users')
      .select('is_evaluator')
      .eq('id', userId)
      .single();

    if (getError) throw getError;

    // Toggle evaluator role
    const { error } = await supabase
      .from('users')
      .update({ is_evaluator: !user.is_evaluator })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    // Get updated user with languages
    const { data: updatedUser, error: getUpdatedError } = await supabase
      .from('users')
      .select(`
        *,
        languages:user_languages(language)
      `)
      .eq('id', userId)
      .single();

    if (getUpdatedError) throw getUpdatedError;

    return {
      ...updatedUser,
      languages: updatedUser.languages?.map((l: { language: string }) => l.language) || [],
    };
  },

  // User Test Results Functions
  getUserTestResults: async (userId: number): Promise<OnboardingTest[]> => {
    const { data, error } = await supabase
      .from('onboarding_tests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  getAllUserTestResults: async (): Promise<Array<OnboardingTest & { user: User }>> => {
    // Get aggregated test results from user_question_answers with question details
    const { data, error } = await supabase
      .from('user_question_answers')
      .select(`
        test_session_id,
        user_id,
        answered_at,
        is_correct,
        selected_answer,
        users!user_question_answers_user_id_fkey(
          id, 
          first_name, 
          last_name, 
          email, 
          username, 
          is_active
        ),
        language_proficiency_questions!user_question_answers_question_id_fkey(
          id,
          language,
          type,
          question,
          options,
          correct_answer,
          explanation
        )
      `)
      .not('test_session_id', 'is', null)
      .order('answered_at', { ascending: false });

    if (error) throw error;

    // Group by test_session_id to create test results
    const testResultsMap = new Map();
    
    data?.forEach(answer => {
      const sessionId = answer.test_session_id;
      if (!testResultsMap.has(sessionId)) {
        testResultsMap.set(sessionId, {
          id: sessionId, // Use session_id as the test id
          user_id: answer.user_id,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          language: (answer.language_proficiency_questions as any)?.language || 'Tagalog',
          test_data: [],
          score: null,
          status: 'completed' as const,
          started_at: answer.answered_at,
          completed_at: answer.answered_at,
          created_at: answer.answered_at,
          user: answer.users,
          total_questions: 0,
          correct_answers: 0,
          answers: [] // Array to store individual answers
        });
      }
      
      // Update the test result with question data
      const testResult = testResultsMap.get(sessionId);
      testResult.total_questions += 1;
      if (answer.is_correct) {
        testResult.correct_answers += 1;
      }
      
      // Add the answer details
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const question = answer.language_proficiency_questions as any;
      testResult.answers.push({
        question_id: question?.id,
        question: question?.question,
        options: question?.options || [],
        correct_answer: question?.correct_answer,
        selected_answer: answer.selected_answer,
        is_correct: answer.is_correct,
        explanation: question?.explanation,
        type: question?.type
      });
    });

    // Calculate scores for each test result
    const results = Array.from(testResultsMap.values()).map(testResult => ({
      ...testResult,
      score: testResult.total_questions > 0 
        ? Math.round((testResult.correct_answers / testResult.total_questions) * 100)
        : null
    }));

    return results;
  },

  // Sentence Management Functions
  getAdminSentences: async (skip = 0, limit = 10000, targetLanguage?: string): Promise<Sentence[]> => {
    let query = supabase
      .from('sentences')
      .select('*')
      .range(skip, skip + limit - 1)
      .order('id', { ascending: true });

    if (targetLanguage) {
      query = query.eq('target_language', targetLanguage);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  getAdminSentencesCount: async (targetLanguage?: string): Promise<number> => {
    let query = supabase
      .from('sentences')
      .select('*', { count: 'exact', head: true });

    if (targetLanguage) {
      query = query.eq('target_language', targetLanguage);
    }

    const { count, error } = await query;

    if (error) throw error;
    return count || 0;
  },

  getSentenceAnnotations: async (sentenceId: number): Promise<Annotation[]> => {
    const { data, error } = await supabase
      .from('annotations')
      .select(`
        *,
        highlights:text_highlights(*)
      `)
      .eq('sentence_id', sentenceId);

    if (error) throw error;
    return data || [];
  },

  updateSentence: async (sentenceId: number, sentenceData: Partial<Sentence>): Promise<Sentence> => {
    const { data, error } = await supabase
      .from('sentences')
      .update(sentenceData)
      .eq('id', sentenceId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deleteSentence: async (sentenceId: number): Promise<void> => {
    // Delete related annotations first
    await supabase
      .from('annotations')
      .delete()
      .eq('sentence_id', sentenceId);

    // Delete sentence
    const { error } = await supabase
      .from('sentences')
      .delete()
      .eq('id', sentenceId);

    if (error) throw error;
  },

  getSentenceCountsByLanguage: async (): Promise<{[key: string]: number}> => {
    const { data, error } = await supabase
      .from('sentences')
      .select('target_language')
      .eq('is_active', true);

    if (error) throw error;

    const counts: {[key: string]: number} = { all: 0 };
    data?.forEach(sentence => {
      const lang = sentence.target_language;
      counts[lang] = (counts[lang] || 0) + 1;
      counts.all += 1;
    });

    return counts;
  },

  // Analytics Functions
  getUserGrowthAnalytics: async (months: number = 6): Promise<Array<{month: string, users: number, annotations: number}>> => {
    // This is a simplified implementation
    // In a real scenario, you'd want to use proper date aggregation
    const { data, error } = await supabase
      .from('users')
      .select('created_at')
      .gte('created_at', new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000).toISOString());

    if (error) throw error;

    // Group by month (simplified)
    const monthlyData: {[key: string]: {users: number, annotations: number}} = {};
    
    data?.forEach(user => {
      const month = new Date(user.created_at).toISOString().slice(0, 7); // YYYY-MM
      monthlyData[month] = monthlyData[month] || { users: 0, annotations: 0 };
      monthlyData[month].users += 1;
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      users: data.users,
      annotations: data.annotations,
    }));
  },

  getErrorDistributionAnalytics: async (): Promise<Array<{type: string, count: number, color: string, description: string}>> => {
    const { data, error } = await supabase
      .from('text_highlights')
      .select('error_type');

    if (error) throw error;

    const counts: {[key: string]: number} = {};
    data?.forEach(highlight => {
      const type = highlight.error_type || 'unknown';
      counts[type] = (counts[type] || 0) + 1;
    });

    const colors = {
      'MI_ST': '#f97316', // orange
      'MI_SE': '#3b82f6', // blue
      'MA_ST': '#ef4444', // red
      'MA_SE': '#8b5cf6', // purple
      'unknown': '#6b7280', // gray
    };

    return Object.entries(counts).map(([type, count]) => ({
      type,
      count,
      color: colors[type as keyof typeof colors] || colors.unknown,
      description: `Error type: ${type}`,
    }));
  },

  getLanguageActivityAnalytics: async (): Promise<Array<{language: string, sentences: number, annotations: number}>> => {
    const { data: sentences, error: sentencesError } = await supabase
      .from('sentences')
      .select('target_language');

    if (sentencesError) throw sentencesError;

    const { data: annotations, error: annotationsError } = await supabase
      .from('annotations')
      .select(`
        sentence:sentences(target_language)
      `);

    if (annotationsError) throw annotationsError;

    const languageStats: {[key: string]: {sentences: number, annotations: number}} = {};

    // Count sentences by language
    sentences?.forEach((sentence: { target_language: string }) => {
      const lang = sentence.target_language;
      languageStats[lang] = languageStats[lang] || { sentences: 0, annotations: 0 };
      languageStats[lang].sentences += 1;
    });

    // Count annotations by language
    annotations?.forEach((annotation: { sentence: { target_language: string }[] }) => {
      const lang = annotation.sentence?.[0]?.target_language;
      if (lang) {
        languageStats[lang] = languageStats[lang] || { sentences: 0, annotations: 0 };
        languageStats[lang].annotations += 1;
      }
    });

    return Object.entries(languageStats).map(([language, stats]) => ({
      language,
      sentences: stats.sentences,
      annotations: stats.annotations,
    }));
  },

  getDailyActivityAnalytics: async (days: number = 7): Promise<Array<{date: string, annotations: number, evaluations: number}>> => {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const [annotationsData, evaluationsData] = await Promise.all([
      supabase
        .from('annotations')
        .select('created_at')
        .gte('created_at', startDate),
      supabase
        .from('evaluations')
        .select('created_at')
        .gte('created_at', startDate),
    ]);

    if (annotationsData.error) throw annotationsData.error;
    if (evaluationsData.error) throw evaluationsData.error;

    const dailyStats: {[key: string]: {annotations: number, evaluations: number}} = {};

    // Count annotations by date
    annotationsData.data?.forEach(annotation => {
      const date = new Date(annotation.created_at).toISOString().slice(0, 10); // YYYY-MM-DD
      dailyStats[date] = dailyStats[date] || { annotations: 0, evaluations: 0 };
      dailyStats[date].annotations += 1;
    });

    // Count evaluations by date
    evaluationsData.data?.forEach(evaluation => {
      const date = new Date(evaluation.created_at).toISOString().slice(0, 10); // YYYY-MM-DD
      dailyStats[date] = dailyStats[date] || { annotations: 0, evaluations: 0 };
      dailyStats[date].evaluations += 1;
    });

    return Object.entries(dailyStats).map(([date, stats]) => ({
      date,
      annotations: stats.annotations,
      evaluations: stats.evaluations,
    }));
  },

  getUserRoleDistributionAnalytics: async (): Promise<Array<{role: string, count: number, color: string}>> => {
    const { data, error } = await supabase
      .from('users')
      .select('is_admin, is_evaluator, is_active');

    if (error) throw error;

    const roleCounts = {
      'Admin': 0,
      'Evaluator': 0,
      'Annotator': 0,
    };

    data?.forEach(user => {
      if (user.is_admin) {
        roleCounts['Admin'] += 1;
      } else if (user.is_evaluator) {
        roleCounts['Evaluator'] += 1;
      } else {
        roleCounts['Annotator'] += 1;
      }
    });

    const colors = {
      'Admin': '#8b5cf6', // purple
      'Evaluator': '#10b981', // green
      'Annotator': '#3b82f6', // blue
    };

    return Object.entries(roleCounts).map(([role, count]) => ({
      role,
      count,
      color: colors[role as keyof typeof colors] || '#6b7280',
    }));
  },

  getQualityMetricsAnalytics: async (): Promise<{
    averageQuality: number;
    averageFluency: number;
    averageAdequacy: number;
    completionRate: number;
  }> => {
    const { data, error } = await supabase
      .from('annotations')
      .select('overall_quality, fluency_score, adequacy_score, annotation_status');

    if (error) throw error;

    const completedAnnotations = data?.filter(a => a.annotation_status === 'completed') || [];
    const totalAnnotations = data?.length || 0;

    const qualityScores = completedAnnotations.filter(a => a.overall_quality).map(a => a.overall_quality!);
    const fluencyScores = completedAnnotations.filter(a => a.fluency_score).map(a => a.fluency_score!);
    const adequacyScores = completedAnnotations.filter(a => a.adequacy_score).map(a => a.adequacy_score!);

    return {
      averageQuality: qualityScores.length > 0 ? qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length : 0,
      averageFluency: fluencyScores.length > 0 ? fluencyScores.reduce((sum, score) => sum + score, 0) / fluencyScores.length : 0,
      averageAdequacy: adequacyScores.length > 0 ? adequacyScores.reduce((sum, score) => sum + score, 0) / adequacyScores.length : 0,
      completionRate: totalAnnotations > 0 ? (completedAnnotations.length / totalAnnotations) * 100 : 0,
    };
  },

  getAllAnnotations: async (): Promise<Annotation[]> => {
    const { data, error } = await supabase
      .from('annotations')
      .select(`
        *,
        sentence:sentences(*),
        annotator:users(*),
        highlights:text_highlights(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  getAllEvaluations: async (): Promise<Evaluation[]> => {
    const { data, error } = await supabase
      .from('evaluations')
      .select(`
        *,
        annotation:annotations(*),
        evaluator:users(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};

// Evaluations API
export const evaluationsAPI = {
  createEvaluation: async (evaluationData: EvaluationCreate): Promise<Evaluation> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('No authenticated user');

    // Check if evaluator already evaluated this annotation
    const { data: existing } = await supabase
      .from('evaluations')
      .select('id')
      .eq('annotation_id', evaluationData.annotation_id)
      .eq('evaluator_id', user.id)
      .single();

    if (existing) {
      throw new Error('You have already evaluated this annotation');
    }

    // Create evaluation
    const { data, error } = await supabase
      .from('evaluations')
      .insert({
        ...evaluationData,
        evaluator_id: user.id,
        evaluation_status: 'completed',
      })
      .select(`
        *,
        annotation:annotations(*),
        evaluator:users(*)
      `)
      .single();

    if (error) throw error;

    // Update annotation status to reviewed
    await supabase
      .from('annotations')
      .update({ annotation_status: 'reviewed' })
      .eq('id', evaluationData.annotation_id);

    return data;
  },

  getMyEvaluations: async (skip = 0, limit = 100): Promise<Evaluation[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('evaluations')
      .select(`
        *,
        annotation:annotations(*),
        evaluator:users(*)
      `)
      .eq('evaluator_id', user.id)
      .range(skip, skip + limit - 1);

    if (error) throw error;
    return data || [];
  },

  getPendingEvaluations: async (skip = 0, limit = 50): Promise<Annotation[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('No authenticated user');

    // Get completed annotations that haven't been evaluated by current user
    const { data, error } = await supabase
      .from('annotations')
      .select(`
        *,
        sentence:sentences(*),
        annotator:users(*),
        highlights:text_highlights(*)
      `)
      .eq('annotation_status', 'completed')
      .not('id', 'in', `(
        SELECT annotation_id FROM evaluations WHERE evaluator_id = '${user.id}'
      )`)
      .range(skip, skip + limit - 1);

    if (error) throw error;
    return data || [];
  },
};

// Language Proficiency API
export const languageProficiencyAPI = {
  getQuestionsByLanguages: async (languages: string[]): Promise<LanguageProficiencyQuestion[]> => {
    // Capitalize language names to match database format
    const capitalizedLanguages = languages.map(lang => lang.charAt(0).toUpperCase() + lang.slice(1));

    // Remove ordering to allow for proper randomization - questions will be returned in insertion order
    const { data, error } = await supabase
      .from('language_proficiency_questions')
      .select('*')
      .in('language', capitalizedLanguages)
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  },

  getAllQuestions: async (): Promise<LanguageProficiencyQuestion[]> => {
    const { data, error } = await supabase
      .from('language_proficiency_questions')
      .select('*')
      .order('language')
      .order('type')
      .order('difficulty');

    if (error) throw error;
    return data || [];
  },

  submitAnswers: async (answers: UserQuestionAnswer[], sessionId: string, languages: string[]): Promise<OnboardingTestResult> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('No authenticated user');

    let correct_count = 0;
    const total_questions = answers.length;

    // Process each answer
    for (const answer of answers) {
      const { data: question } = await supabase
        .from('language_proficiency_questions')
        .select('correct_answer')
        .eq('id', answer.question_id)
        .single();

      if (question) {
        const is_correct = answer.selected_answer === question.correct_answer;
        if (is_correct) correct_count++;

        // Store the answer
        await supabase
          .from('user_question_answers')
          .insert({
            user_id: user.id,
            question_id: answer.question_id,
            selected_answer: answer.selected_answer,
            is_correct,
            test_session_id: sessionId,
          });
      }
    }

    // Calculate score
    const score = total_questions > 0 ? (correct_count / total_questions) * 100 : 0;
    const passed = score >= 70.0;

    // Update user onboarding status if passed
    if (passed) {
      await supabase
        .from('users')
        .update({
          onboarding_status: 'completed',
          onboarding_score: score,
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq('id', user.id);
    } else {
      await supabase
        .from('users')
        .update({
          onboarding_status: 'failed',
          onboarding_score: score,
        })
        .eq('id', user.id);
    }

    // Create results breakdown by language
    const questions_by_language: Record<string, {
      total: number;
      correct: number;
      score: number;
    }> = {};
    for (const language of languages) {
      // Capitalize language name to match database format
      const capitalizedLanguage = language.charAt(0).toUpperCase() + language.slice(1);
      const { data: langQuestions } = await supabase
        .from('language_proficiency_questions')
        .select('id, correct_answer')
        .eq('language', capitalizedLanguage);

      const langQuestionIds = langQuestions?.map(q => q.id) || [];
      const langAnswers = answers.filter(a => langQuestionIds.includes(a.question_id));
      const langCorrect = langAnswers.filter(a => {
        const question = langQuestions?.find(q => q.id === a.question_id);
        return question && a.selected_answer === question.correct_answer;
      }).length;

      questions_by_language[language] = {
        total: langAnswers.length,
        correct: langCorrect,
        score: langAnswers.length > 0 ? (langCorrect / langAnswers.length) * 100 : 0,
      };
    }

    // Get updated user data
    const { data: updatedUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    return {
      total_questions,
      correct_answers: correct_count,
      score,
      passed,
      questions_by_language,
      session_id: sessionId,
      updated_user: updatedUser ? {
        ...updatedUser,
        languages: [], // Will be populated by the calling code
      } : undefined,
    };
  },

  // Submit answers during registration (no auth required, just validation)
  submitAnswersRegistration: async (answers: UserQuestionAnswer[], sessionId: string, languages: string[]): Promise<OnboardingTestResult> => {
    let correct_count = 0;
    const total_questions = answers.length;

    // Process each answer for validation only (no storage since user doesn't exist yet)
    for (const answer of answers) {
      const { data: question } = await supabase
        .from('language_proficiency_questions')
        .select('correct_answer')
        .eq('id', answer.question_id)
        .single();

      if (question) {
        const is_correct = answer.selected_answer === question.correct_answer;
        if (is_correct) correct_count++;
      }
    }

    // Calculate score
    const score = total_questions > 0 ? (correct_count / total_questions) * 100 : 0;
    const passed = score >= 70.0;

    // Create results breakdown by language
    const questions_by_language: Record<string, {
      total: number;
      correct: number;
      score: number;
    }> = {};
    for (const language of languages) {
      // Capitalize language name to match database format
      const capitalizedLanguage = language.charAt(0).toUpperCase() + language.slice(1);
      const { data: langQuestions } = await supabase
        .from('language_proficiency_questions')
        .select('id, correct_answer')
        .eq('language', capitalizedLanguage);

      const langQuestionIds = langQuestions?.map(q => q.id) || [];
      const langAnswers = answers.filter(a => langQuestionIds.includes(a.question_id));
      const langCorrect = langAnswers.filter(a => {
        const question = langQuestions?.find(q => q.id === a.question_id);
        return question && a.selected_answer === question.correct_answer;
      }).length;

      questions_by_language[language] = {
        total: langAnswers.length,
        correct: langCorrect,
        score: langAnswers.length > 0 ? (langCorrect / langAnswers.length) * 100 : 0,
      };
    }

    return {
      total_questions,
      correct_answers: correct_count,
      score,
      passed,
      questions_by_language,
      session_id: sessionId,
      updated_user: undefined, // No user exists yet during registration
    };
  },

  createQuestion: async (questionData: Omit<LanguageProficiencyQuestion, 'id' | 'created_at' | 'updated_at' | 'created_by'>): Promise<LanguageProficiencyQuestion> => {
    const { data, error } = await supabase
      .from('language_proficiency_questions')
      .insert(questionData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateQuestion: async (questionId: number, questionData: Partial<LanguageProficiencyQuestion>): Promise<LanguageProficiencyQuestion> => {
    const { data, error } = await supabase
      .from('language_proficiency_questions')
      .update(questionData)
      .eq('id', questionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deleteQuestion: async (questionId: number): Promise<void> => {
    const { error } = await supabase
      .from('language_proficiency_questions')
      .delete()
      .eq('id', questionId);

    if (error) throw error;
  },
};

// MT Quality API
export const mtQualityAPI = {
  createAssessment: async (assessmentData: MTQualityCreate): Promise<MTQualityAssessment> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('No authenticated user');

    // Check if evaluator already assessed this sentence
    const { data: existing } = await supabase
      .from('mt_quality_assessments')
      .select('id')
      .eq('sentence_id', assessmentData.sentence_id)
      .eq('evaluator_id', user.id)
      .single();

    if (existing) {
      throw new Error('You have already assessed this sentence');
    }

    // Create assessment
    const { data, error } = await supabase
      .from('mt_quality_assessments')
      .insert({
        ...assessmentData,
        evaluator_id: user.id,
        evaluation_status: 'completed',
      })
      .select(`
        *,
        sentence:sentences(*),
        evaluator:users(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  getMyAssessments: async (skip = 0, limit = 100): Promise<MTQualityAssessment[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('mt_quality_assessments')
      .select(`
        *,
        sentence:sentences(*),
        evaluator:users(*)
      `)
      .eq('evaluator_id', user.id)
      .range(skip, skip + limit - 1);

    if (error) throw error;
    return data || [];
  },

  getPendingAssessments: async (skip = 0, limit = 50): Promise<Sentence[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('No authenticated user');

    // Get active sentences that haven't been assessed by current user
    const { data, error } = await supabase
      .from('sentences')
      .select('*')
      .eq('is_active', true)
      .not('id', 'in', `(
        SELECT sentence_id FROM mt_quality_assessments WHERE evaluator_id = '${user.id}'
      )`)
      .range(skip, skip + limit - 1);

    if (error) throw error;
    return data || [];
  },

  getAssessmentBySentence: async (sentenceId: number): Promise<MTQualityAssessment | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('mt_quality_assessments')
      .select(`
        *,
        sentence:sentences(*),
        evaluator:users(*)
      `)
      .eq('sentence_id', sentenceId)
      .eq('evaluator_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
    return data;
  },

  updateAssessment: async (id: number, updateData: MTQualityUpdate): Promise<MTQualityAssessment> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('mt_quality_assessments')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('evaluator_id', user.id)
      .select(`
        *,
        sentence:sentences(*),
        evaluator:users(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  getEvaluatorStats: async (): Promise<EvaluatorStats> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('No authenticated user');

    // Get basic evaluation stats
    const { data: evaluations, error: evalError } = await supabase
      .from('evaluations')
      .select('*')
      .eq('evaluator_id', user.id);

    if (evalError) throw evalError;

    // Get MT quality assessment stats
    const { data: assessments, error: assessError } = await supabase
      .from('mt_quality_assessments')
      .select('*')
      .eq('evaluator_id', user.id);

    if (assessError) throw assessError;

    // Calculate stats
    const totalEvaluations = evaluations?.length || 0;
    const completedEvaluations = evaluations?.filter(e => e.evaluation_status === 'completed').length || 0;
    const pendingEvaluations = evaluations?.filter(e => e.evaluation_status === 'pending').length || 0;
    
    const totalAssessments = assessments?.length || 0;
    const completedAssessments = assessments?.filter(a => a.evaluation_status === 'completed').length || 0;
    const pendingAssessments = assessments?.filter(a => a.evaluation_status === 'pending').length || 0;

    // Calculate averages
    const avgRating = evaluations?.length > 0 
      ? evaluations.reduce((sum, e) => sum + (e.overall_rating || 0), 0) / evaluations.length 
      : 0;

    const avgOverallScore = assessments?.length > 0
      ? assessments.reduce((sum, a) => sum + (a.overall_quality_score || 0), 0) / assessments.length
      : 0;

    const avgFluencyScore = assessments?.length > 0
      ? assessments.reduce((sum, a) => sum + (a.fluency_score || 0), 0) / assessments.length
      : 0;

    const avgAdequacyScore = assessments?.length > 0
      ? assessments.reduce((sum, a) => sum + (a.adequacy_score || 0), 0) / assessments.length
      : 0;

    // Calculate total time spent
    const totalTimeSpent = (evaluations?.reduce((sum, e) => sum + (e.time_spent_seconds || 0), 0) || 0) +
                          (assessments?.reduce((sum, a) => sum + (a.time_spent_seconds || 0), 0) || 0);

    // Get today's evaluations
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const evaluationsToday = evaluations?.filter(e => 
      new Date(e.created_at) >= today
    ).length || 0;

    // Weekly progress (last 7 days)
    const weeklyProgress = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayCount = evaluations?.filter(e => {
        const evalDate = new Date(e.created_at);
        return evalDate >= date && evalDate < nextDate;
      }).length || 0;
      
      weeklyProgress.push(dayCount);
    }

    return {
      total_evaluations: totalEvaluations,
      completed_evaluations: completedEvaluations,
      pending_evaluations: pendingEvaluations,
      average_rating: avgRating,
      total_time_spent: totalTimeSpent,
      evaluations_today: evaluationsToday,
      weekly_progress: weeklyProgress,
      total_assessments: totalAssessments,
      completed_assessments: completedAssessments,
      pending_assessments: pendingAssessments,
      average_overall_score: avgOverallScore,
      average_fluency_score: avgFluencyScore,
      average_adequacy_score: avgAdequacyScore,
      average_time_per_assessment: totalAssessments > 0 ? totalTimeSpent / totalAssessments : 0,
      human_agreement_rate: 0, // This would need to be calculated based on agreement with AI
      total_syntax_errors_found: 0, // This would need to be calculated from error details
      total_semantic_errors_found: 0, // This would need to be calculated from error details
      average_model_confidence: 0, // This would need to be calculated from AI confidence data
    };
  },
};

// Onboarding API
export const onboardingAPI = {
  createTest: async (language: string, testData: OnboardingTestQuestion[]): Promise<OnboardingTest> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('onboarding_tests')
      .insert({
        user_id: user.id,
        language,
        test_data: testData,
        status: 'in_progress',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateTest: async (testId: number, score: number, status: 'completed' | 'failed'): Promise<OnboardingTest> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('onboarding_tests')
      .update({
        score,
        status,
        completed_at: status === 'completed' ? new Date().toISOString() : null,
      })
      .eq('id', testId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  getMyTests: async (): Promise<OnboardingTest[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('onboarding_tests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Admin functions for getting user test results
  getUserTestResults: async (userId: number): Promise<OnboardingTest[]> => {
    const { data, error } = await supabase
      .from('onboarding_tests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  getAllUserTestResults: async (): Promise<Array<OnboardingTest & { user: User }>> => {
    const { data, error } = await supabase
      .from('onboarding_tests')
      .select(`
        *,
        user:users(id, first_name, last_name, email, username, is_active)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};

export default {
  authAPI,
  sentencesAPI,
  annotationsAPI,
  adminAPI,
  evaluationsAPI,
  languageProficiencyAPI,
  mtQualityAPI,
  onboardingAPI,
}; 