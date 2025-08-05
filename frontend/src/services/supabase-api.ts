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
    
    // Check if the input is a username (not an email)
    if (!credentials.email.includes('@')) {
      logger.debug('Attempting username-based login', {
        component: 'authAPI',
        action: 'login',
        metadata: { username: credentials.email }
      });
      
      // Look up the user by username to get their email
      const { data: userByUsername, error: usernameError } = await supabase
        .from('users')
        .select('email')
        .eq('username', credentials.email)
        .single();
      
      if (usernameError) {
        if (usernameError.code === 'PGRST116') {
          // No rows returned - username doesn't exist
          logger.debug('Username not found', {
            component: 'authAPI',
            action: 'login',
            metadata: { username: credentials.email }
          });
          throw new Error('Invalid username or password');
        }
        logger.error('Username lookup error', {
          component: 'authAPI',
          action: 'login',
          metadata: { username: credentials.email, error: usernameError.message }
        });
        throw new Error('Authentication error. Please try again.');
      }
      
      if (!userByUsername) {
        logger.debug('No user data returned for username', {
          component: 'authAPI',
          action: 'login',
          metadata: { username: credentials.email }
        });
        throw new Error('Invalid username or password');
      }
      
      email = userByUsername.email;
      logger.debug('Username lookup successful', {
        component: 'authAPI',
        action: 'login',
        metadata: { username: credentials.email, email: email }
      });
    }

    logger.debug('Attempting Supabase authentication', {
      component: 'authAPI',
      action: 'login',
      metadata: { email: email, isUsernameLogin: email !== credentials.email }
    });

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: credentials.password,
    });

    if (error) {
      logger.error('Supabase authentication failed', {
        component: 'authAPI',
        action: 'login',
        metadata: { email: email, error: error.message }
      });
      throw error;
    }

    // Get user profile from our users table
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) throw profileError;

    // Get user languages
    const { data: languages } = await supabase
      .from('user_languages')
      .select('language')
      .eq('user_id', data.user.id);

    const user: User = {
      ...userProfile,
      languages: languages?.map(l => l.language) || [],
    };

    const token = data.session?.access_token || '';
    authStorage.setToken(token);
    authStorage.setUser(user);

    return {
      access_token: token,
      token_type: 'bearer',
      user,
    };
  },

  register: async (userData: RegisterData): Promise<RegisterResult> => {
    let signupData: { user: any; session: any } | null = null;
    let signupError: Error | null = null;

    // Simplified registration flow
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
    if (!signupData.user) throw new Error('Registration failed');

    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: signupData.user.id,
        email: userData.email,
        username: userData.username,
        first_name: userData.first_name,
        last_name: userData.last_name,
        preferred_language: userData.preferred_language || userData.languages?.[0] || 'tagalog',
        is_evaluator: userData.is_evaluator || false,
        onboarding_status: userData.onboarding_passed ? 'completed' : 'pending',
        onboarding_score: userData.onboarding_passed ? 100.0 : null,
        onboarding_completed_at: userData.onboarding_passed ? new Date().toISOString() : null,
      });

    if (profileError) throw profileError;

    // Add user languages
    if (userData.languages && userData.languages.length > 0) {
      const languageData = userData.languages.map(lang => ({
        user_id: signupData.user.id,
        language: lang,
      }));

      const { error: langError } = await supabase
        .from('user_languages')
        .insert(languageData);

      if (langError) throw langError;
    }

    // Get the created user profile
    const { data: userProfile, error: getError } = await supabase
      .from('users')
      .select('*')
      .eq('id', signupData.user.id)
      .single();

    if (getError) throw getError;

    // Get user languages
    const { data: languages } = await supabase
      .from('user_languages')
      .select('language')
      .eq('user_id', signupData.user.id);

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

    // Find sentences that haven't been annotated by this user
    const { data, error } = await supabase
      .from('sentences')
      .select('*')
      .eq('is_active', true)
      .eq('target_language', userProfile.preferred_language)
      .not('id', 'in', `(
        SELECT sentence_id FROM annotations WHERE annotator_id = '${user.id}'
      )`)
      .limit(1)
      .single();

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

    // Find sentences that haven't been annotated by this user
    const { data, error } = await supabase
      .from('sentences')
      .select('*')
      .eq('is_active', true)
      .eq('target_language', userProfile.preferred_language)
      .not('id', 'in', `(
        SELECT sentence_id FROM annotations WHERE annotator_id = '${user.id}'
      )`)
      .range(skip, skip + limit - 1);

    if (error) throw error;
    return data || [];
  },

  createSentence: async (sentenceData: {
    source_text: string;
    machine_translation: string;
    tagalog_source_text?: string;
    source_language: string;
    target_language: string;
    domain?: string;
  }): Promise<Sentence> => {
    const { data, error } = await supabase
      .from('sentences')
      .insert({
        source_text: sentenceData.source_text,
        machine_translation: sentenceData.machine_translation,
        tagalog_source_text: sentenceData.tagalog_source_text,
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
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    const requiredColumns = ['Source', 'Source_Language', 'Translation', 'Translation_Language'];
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
        // Parse CSV line (simple implementation)
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const sentence = {
          source_text: values[headers.indexOf('Source')] || '',
          machine_translation: values[headers.indexOf('Translation')] || '',
          source_language: values[headers.indexOf('Source_Language')] || 'en',
          target_language: values[headers.indexOf('Translation_Language')] || 'tgl',
          domain: headers.includes('Domain') ? values[headers.indexOf('Domain')] || '' : '',
        };

        // Validate required fields
        if (!sentence.source_text || !sentence.machine_translation) {
          errors.push(`Row ${i + 1}: Missing required fields`);
          skippedCount++;
          continue;
        }

        // Validate languages
        const validSourceLanguages = ['en', 'tgl', 'ilo', 'ceb'];
        const validTargetLanguages = ['tgl', 'ilo', 'ceb', 'en'];
        
        if (!validSourceLanguages.includes(sentence.source_language)) {
          errors.push(`Row ${i + 1}: Invalid source language '${sentence.source_language}'`);
          skippedCount++;
          continue;
        }

        if (!validTargetLanguages.includes(sentence.target_language)) {
          errors.push(`Row ${i + 1}: Invalid target language '${sentence.target_language}'`);
          skippedCount++;
          continue;
        }

        sentences.push(sentence);
      } catch (error) {
        errors.push(`Row ${i + 1}: Parse error - ${error instanceof Error ? error.message : 'Unknown error'}`);
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
          errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
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
      .single();

    if (existing) {
      throw new Error('You have already annotated this sentence');
    }

    // Create annotation
    const { data: annotation, error } = await supabase
      .from('annotations')
      .insert({
        ...annotationData,
        annotator_id: user.id,
        annotation_status: 'completed',
      })
      .select()
      .single();

    if (error) throw error;

    // Create highlights if provided
    if (annotationData.highlights && annotationData.highlights.length > 0) {
      const highlightsData = annotationData.highlights.map(h => ({
        annotation_id: annotation.id,
        highlighted_text: h.highlighted_text,
        start_index: h.start_index,
        end_index: h.end_index,
        text_type: h.text_type,
        comment: h.comment,
        error_type: h.error_type,
      }));

      await supabase
        .from('text_highlights')
        .insert(highlightsData);
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

  deleteAnnotation: async (id: number): Promise<{ message: string }> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('No authenticated user');

    // Delete highlights first
    await supabase
      .from('text_highlights')
      .delete()
      .eq('annotation_id', id);

    // Delete evaluations
    await supabase
      .from('evaluations')
      .delete()
      .eq('annotation_id', id);

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

    // Update annotation
    const { data: annotation, error } = await supabase
      .from('annotations')
      .update({
        ...updateData,
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
    if (updateData.highlights && updateData.highlights.length > 0) {
      // Delete existing highlights
      await supabase
        .from('text_highlights')
        .delete()
        .eq('annotation_id', id);

      // Insert new highlights
      const highlightsData = updateData.highlights.map(h => ({
        annotation_id: id,
        highlighted_text: h.highlighted_text,
        start_index: h.start_index,
        end_index: h.end_index,
        text_type: h.text_type,
        comment: h.comment,
        error_type: h.error_type,
      }));

      await supabase
        .from('text_highlights')
        .insert(highlightsData);
    }

    return annotation;
  },

  uploadVoiceRecording: async (annotationId: number, audioBlob: Blob, duration: number): Promise<{ voice_recording_url: string }> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('No authenticated user');

    // Generate unique filename
    const fileName = `voice-recordings/${user.id}/${annotationId}-${Date.now()}.webm`;
    
    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('annotations')
      .upload(fileName, audioBlob, {
        contentType: 'audio/webm',
        cacheControl: '3600',
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('annotations')
      .getPublicUrl(fileName);

    // Update annotation with voice recording URL and duration
    const { error: updateError } = await supabase
      .from('annotations')
      .update({
        voice_recording_url: publicUrl,
        voice_recording_duration: duration,
        updated_at: new Date().toISOString(),
      })
      .eq('id', annotationId)
      .eq('annotator_id', user.id);

    if (updateError) throw updateError;

    return { voice_recording_url: publicUrl };
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
      languages: user.languages?.map((l: any) => l.language) || [],
    }));
  },

  // User Management Functions
  createUser: async (userData: any): Promise<User> => {
    // Note: This requires Supabase Auth Admin API which may not be available in client-side code
    // In a production environment, this should be handled by a server-side API
    try {
      // First create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
      });

      if (authError) throw authError;

      if (!authData.user) throw new Error('Failed to create user');

      // Create user profile in our users table
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: userData.email,
          username: userData.username,
          first_name: userData.first_name,
          last_name: userData.last_name,
          is_active: userData.is_active,
          is_admin: userData.is_admin,
          is_evaluator: userData.is_evaluator,
          onboarding_status: userData.skip_onboarding ? 'completed' : 'pending',
          onboarding_score: userData.skip_onboarding ? 100.0 : null,
          onboarding_completed_at: userData.skip_onboarding ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (profileError) throw profileError;

      // Add user languages
      if (userData.languages && userData.languages.length > 0) {
        const languageData = userData.languages.map((lang: string) => ({
          user_id: authData.user.id,
          language: lang,
        }));

        const { error: langError } = await supabase
          .from('user_languages')
          .insert(languageData);

        if (langError) throw langError;
      }

      // Get the created user with languages
      const { data: finalUser, error: getError } = await supabase
        .from('users')
        .select(`
          *,
          languages:user_languages(language)
        `)
        .eq('id', authData.user.id)
        .single();

      if (getError) throw getError;

      return {
        ...finalUser,
        languages: finalUser.languages?.map((l: any) => l.language) || [],
      };
    } catch (error) {
      // If admin functions are not available, throw a helpful error
      if (error instanceof Error && error.message.includes('admin')) {
        throw new Error('User creation requires server-side implementation. Please contact your administrator.');
      }
      throw error;
    }
  },

  updateUser: async (userId: number, userData: any): Promise<User> => {
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
      languages: updatedUser.languages?.map((l: any) => l.language) || [],
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

  resetUserPassword: async (userId: number, newPassword: string): Promise<void> => {
    // Note: This requires Supabase Auth Admin API which may not be available in client-side code
    // In a production environment, this should be handled by a server-side API
    try {
      // Get user email
      const { error: getError } = await supabase
        .from('users')
        .select('email')
        .eq('id', userId)
        .single();

      if (getError) throw getError;

      // Update password in Supabase Auth
      const { error } = await supabase.auth.admin.updateUserById(
        userId.toString(),
        { password: newPassword }
      );

      if (error) throw error;
    } catch (error) {
      // If admin functions are not available, throw a helpful error
      if (error instanceof Error && error.message.includes('admin')) {
        throw new Error('Password reset requires server-side implementation. Please contact your administrator.');
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
      languages: updatedUser.languages?.map((l: any) => l.language) || [],
    };
  },

  // Sentence Management Functions
  getAdminSentences: async (skip = 0, limit = 100, targetLanguage?: string): Promise<Sentence[]> => {
    let query = supabase
      .from('sentences')
      .select('*')
      .range(skip, skip + limit - 1)
      .order('created_at', { ascending: false });

    if (targetLanguage) {
      query = query.eq('target_language', targetLanguage);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
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

  updateSentence: async (sentenceId: number, sentenceData: any): Promise<Sentence> => {
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
    
    const { data, error } = await supabase
      .from('language_proficiency_questions')
      .select('*')
      .in('language', capitalizedLanguages)
      .eq('is_active', true)
      .order('language')
      .order('type')
      .order('difficulty');

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
  createTest: async (language: string, testData: any): Promise<OnboardingTest> => {
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