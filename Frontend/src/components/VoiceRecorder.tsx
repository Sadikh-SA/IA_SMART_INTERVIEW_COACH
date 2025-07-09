import React, { useState } from 'react';
import {
  Box, Button, Typography, CircularProgress, Alert
} from '@mui/material';
import ScoreRadar from './ScoreRadar';

interface VoiceRecorderProps {
  poste: string;
  question: string;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ poste, question }) => {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [feedback, setFeedback] = useState('');
  const [scoreTotal, setScoreTotal] = useState<number | null>(null);
  const [details, setDetails] = useState<{ communication: number, clarte: number, pertinence: number } | null>(null);
  const [audioFeedbackUrl, setAudioFeedbackUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => setAudioChunks(chunks);

    recorder.start();
    setMediaRecorder(recorder);
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorder?.stop();
    setIsRecording(false);
  };

  const sendRecording = async () => {
    if (audioChunks.length === 0) return;

    setLoading(true);
    setTranscription('');
    setFeedback('');
    setScoreTotal(null);
    setDetails(null);
    setAudioFeedbackUrl('');

    const blob = new Blob(audioChunks, { type: 'audio/webm' });
    const file = new File([blob], 'recording.webm', { type: 'audio/webm' });

    const formData = new FormData();
    formData.append('audio', file);
    formData.append('poste', poste);
    formData.append('question', question);

    try {
      const res = await fetch('http://localhost:8000/transcribe-audio', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      console.log("resr",data);
      
      setTranscription(data.transcription);
      setFeedback(data.feedback);
      setScoreTotal(data.score_total);
      setDetails(data.details);
      setAudioFeedbackUrl('http://localhost:8000' + data.audio_feedback_url);
    } catch (err) {
      console.error(err);
      alert('Erreur lors de l’analyse audio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box mt={4} p={2} border="1px solid #ccc" borderRadius={2}>
      <Typography variant="h6">🎙️ Réponse vocale à la question</Typography>
      <Typography color="text.secondary">Question : {question}</Typography>

      <Box mt={2}>
        <Button variant="contained" color="primary" onClick={isRecording ? stopRecording : startRecording}>
          {isRecording ? '⏹️ Stop' : '🎤 Démarrer l’enregistrement'}
        </Button>

        {!isRecording && audioChunks.length > 0 && (
          <Button variant="outlined" onClick={sendRecording} sx={{ ml: 2 }}>
            Envoyer l’audio
          </Button>
        )}
      </Box>

      {loading && (
        <Box mt={2}>
          <CircularProgress />
        </Box>
      )}

      {transcription && (
        <Box mt={3}>
          <Typography variant="h6">📝 Transcription :</Typography>
          <Typography>{transcription}</Typography>
        </Box>
      )}

      {feedback && (
        <Box mt={3}>
          <Alert severity="info">
            <strong>💬 Feedback IA :</strong> {feedback}
          </Alert>
        </Box>
      )}

      {audioFeedbackUrl && (
        <Box mt={3}>
          <Typography variant="subtitle1">🔊 Écouter le feedback IA :</Typography>
          <audio controls src={audioFeedbackUrl}></audio>
        </Box>
      )}

      {scoreTotal !== null && details && (
        <Box mt={4}>
          <Typography variant="h6">⭐ Score global : {scoreTotal} / 10</Typography>
          <ScoreRadar data={details} />
        </Box>
      )}
    </Box>
  );
};

export default VoiceRecorder;
