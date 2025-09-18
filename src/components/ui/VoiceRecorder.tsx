import React, { useState, useRef, useEffect } from 'react';
import { Mic, Play, Pause, Square, Trash2 } from 'lucide-react';
import { logger } from '../../utils/logger';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number) => void;
  onRecordingDelete: () => void;
  existingRecordingUrl?: string;
  existingDuration?: number;
  disabled?: boolean;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  onRecordingDelete,
  existingRecordingUrl,
  existingDuration,
  disabled = false
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(existingRecordingUrl || null);
  const [duration, setDuration] = useState(existingDuration || 0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingStartTimeRef = useRef<number>(0);

  useEffect(() => {
    if (existingRecordingUrl) {
      logger.debug('Setting existing recording', {
        component: 'VoiceRecorder',
        action: 'set_existing_recording',
        metadata: {
          existingRecordingUrl,
          existingDuration
        }
      });
      
      // Set the audio URL directly without checking accessibility
      // The audio element will handle loading and show errors if needed
      setAudioUrl(existingRecordingUrl);
      setDuration(existingDuration || 0);
    }
  }, [existingRecordingUrl, existingDuration]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
      }
      if (audioUrl && !existingRecordingUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl, existingRecordingUrl]);

  // Get the best supported audio format for recording
  const getBestAudioFormat = (): string => {
    const formats = [
      'audio/mp4',
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/wav',
      'audio/aac',
      'audio/mpeg'
    ];

    for (const format of formats) {
      if (MediaRecorder.isTypeSupported(format)) {
        return format;
      }
    }
    
    // Fallback to browser default
    return '';
  };

  // Get the best supported audio format for playback
  const getBestPlaybackFormat = (blob: Blob): string => {
    // If the blob is already in a good format, use it
    if (blob.type && (blob.type.includes('mp4') || blob.type.includes('mpeg') || blob.type.includes('aac'))) {
      return blob.type;
    }

    // Convert to a more compatible format if needed
    const formats = [
      'audio/mp4',
      'audio/mpeg',
      'audio/aac',
      'audio/wav'
    ];

    for (const format of formats) {
      if (MediaRecorder.isTypeSupported(format)) {
        return format;
      }
    }

    return blob.type || 'audio/webm';
  };



  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
          channelCount: 1
        } 
      });

      const mimeType = getBestAudioFormat();
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType || undefined
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { 
          type: mediaRecorder.mimeType || 'audio/webm' 
        });
        
        // Convert to a more compatible format if needed
        const finalBlob = new Blob([audioBlob], { 
          type: getBestPlaybackFormat(audioBlob) 
        });
        
        // Calculate actual recording duration
        const actualDuration = Math.floor((Date.now() - recordingStartTimeRef.current) / 1000);
        
        logger.debug('Recording stopped', {
          component: 'VoiceRecorder',
          action: 'recording_stopped',
          metadata: {
            recordingTime,
            actualDuration,
            startTime: recordingStartTimeRef.current,
            endTime: Date.now(),
            blobSize: finalBlob.size
          }
        });
        
        const url = URL.createObjectURL(finalBlob);
        setAudioUrl(url);
        setDuration(actualDuration);
        onRecordingComplete(finalBlob, actualDuration);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingStartTimeRef.current = Date.now();
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Unable to access microphone. Please check your permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const playAudio = async () => {
    logger.debug('playAudio called', {
      component: 'VoiceRecorder',
      action: 'play_audio',
      metadata: {
        hasAudioRef: !!audioRef.current,
        audioUrl,
        disabled,
        isPlaying
      }
    });
    
    if (audioRef.current && audioUrl) {
      try {
        // Reset playback time
        setPlaybackTime(0);
        
        // Set up playback timer
        playbackTimerRef.current = setInterval(() => {
          if (audioRef.current && !audioRef.current.paused) {
            setPlaybackTime(Math.floor(audioRef.current.currentTime));
          }
        }, 100);

        logger.debug('Attempting to play audio', {
          component: 'VoiceRecorder',
          action: 'play_audio_attempt',
          metadata: {
            src: audioRef.current.src,
            readyState: audioRef.current.readyState,
            networkState: audioRef.current.networkState
          }
        });

        // Try to play the audio
        await audioRef.current.play();
        setIsPlaying(true);
        logger.debug('Audio playback started successfully', {
          component: 'VoiceRecorder',
          action: 'play_audio_success'
        });
      } catch (error) {
        logger.error('Error playing audio', {
          component: 'VoiceRecorder',
          action: 'play_audio_error',
          metadata: { error: error instanceof Error ? error.message : String(error) }
        }, error instanceof Error ? error : new Error(String(error)));
        setError('Unable to play audio. The file may be corrupted or in an unsupported format.');
        setIsPlaying(false);
        
        if (playbackTimerRef.current) {
          clearInterval(playbackTimerRef.current);
          playbackTimerRef.current = null;
        }
      }
    } else {
      console.log('VoiceRecorder - Cannot play audio:', {
        hasAudioRef: !!audioRef.current,
        hasAudioUrl: !!audioUrl,
        disabled
      });
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }
    }
  };

  const deleteRecording = () => {
    if (audioUrl && !existingRecordingUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setDuration(0);
    setRecordingTime(0);
    setPlaybackTime(0);
    setIsPlaying(false);
    
    if (playbackTimerRef.current) {
      clearInterval(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
    
    onRecordingDelete();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle audio ended event
  const handleAudioEnded = () => {
    setIsPlaying(false);
    setPlaybackTime(0);
    
    if (playbackTimerRef.current) {
      clearInterval(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
  };

  // Handle audio pause event
  const handleAudioPause = () => {
    setIsPlaying(false);
    
    if (playbackTimerRef.current) {
      clearInterval(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
          {error}
        </div>
      )}
      
      <div className="flex items-center space-x-3">
        {!audioUrl ? (
          // Recording controls
          <div className="flex items-center space-x-3">
            {!isRecording ? (
              <button
                onClick={startRecording}
                disabled={disabled}
                className="flex items-center space-x-2 px-3 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white rounded-lg transition-colors"
                title="Start recording"
              >
                <Mic className="h-4 w-4" />
                <span className="text-sm">Record</span>
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex items-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors animate-pulse"
                title="Stop recording"
              >
                <Square className="h-4 w-4" />
                <span className="text-sm">Stop ({formatTime(recordingTime)})</span>
              </button>
            )}
          </div>
        ) : (
          // Playback controls
          <div className="flex items-center space-x-3">
            <button
              onClick={isPlaying ? pauseAudio : playAudio}
              disabled={disabled && !existingRecordingUrl}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg transition-colors"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span className="text-sm">{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
            
            <span className="text-sm text-gray-600">
              {isPlaying ? formatTime(playbackTime) : formatTime(duration)}
            </span>
            
            <button
              onClick={deleteRecording}
              disabled={disabled}
              className="flex items-center space-x-1 px-2 py-2 text-red-500 hover:text-red-700 disabled:text-gray-400 transition-colors"
              title="Delete recording"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      
      {/* Hidden audio element for playback */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={handleAudioEnded}
          onPause={handleAudioPause}
          onLoadStart={() => logger.debug('Audio load started', {
            component: 'VoiceRecorder',
            action: 'audio_load_start'
          })}
          onCanPlay={() => logger.debug('Audio can play', {
            component: 'VoiceRecorder',
            action: 'audio_can_play'
          })}
          onCanPlayThrough={() => logger.debug('Audio can play through', {
            component: 'VoiceRecorder',
            action: 'audio_can_play_through'
          })}
          onError={() => {
            logger.error('Audio error', {
              component: 'VoiceRecorder',
              action: 'audio_error',
              metadata: {
                error: audioRef.current?.error,
                networkState: audioRef.current?.networkState,
                readyState: audioRef.current?.readyState
              }
            }, new Error('Audio playback error'));
          }}
          preload="metadata"
          controls
          style={{ display: 'none' }}
        />
      )}
      
      <div className="text-xs text-gray-500">
        {!audioUrl && !isRecording && (
          <p>📱 Optional: Record yourself reading the corrected sentence aloud</p>
        )}
        {isRecording && (
          <p className="text-red-600">🔴 Recording... Speak clearly into your microphone</p>
        )}
        {audioUrl && (
          <p className="text-green-600">✅ Recording ready</p>
        )}
      </div>
    </div>
  );
};

export default VoiceRecorder;
