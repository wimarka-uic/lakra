import React, { useState, useRef, useEffect } from 'react';
import { Mic, Play, Pause, Square, Trash2 } from 'lucide-react';

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
  const [audioUrl, setAudioUrl] = useState<string | null>(existingRecordingUrl || null);
  const [duration, setDuration] = useState(existingDuration || 0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (existingRecordingUrl) {
      setAudioUrl(existingRecordingUrl);
      setDuration(existingDuration || 0);
    }
  }, [existingRecordingUrl, existingDuration]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl && !existingRecordingUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl, existingRecordingUrl]);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setDuration(recordingTime);
        onRecordingComplete(audioBlob, recordingTime);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
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

  const playAudio = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const deleteRecording = () => {
    if (audioUrl && !existingRecordingUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setDuration(0);
    setRecordingTime(0);
    setIsPlaying(false);
    onRecordingDelete();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
              disabled={disabled}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg transition-colors"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span className="text-sm">{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
            
            <span className="text-sm text-gray-600">
              Duration: {formatTime(duration)}
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
          onEnded={() => setIsPlaying(false)}
          onPause={() => setIsPlaying(false)}
          preload="metadata"
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
