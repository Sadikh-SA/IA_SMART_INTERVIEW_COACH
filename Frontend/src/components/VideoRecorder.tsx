import React, { useRef, useState } from 'react';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import ScoreRadar from './ScoreRadar';

interface VideoRecorderProps {
  poste: string;
  question: string;
}

const VideoRecorder: React.FC<VideoRecorderProps> = ({ poste, question }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Utilitaire pour parser le JSON proprement
  const parseJSONFeedback = (raw: string) => {
    try {
      const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (error) {
      return null;
    }
  };

  const startRecording = async () => {
    setRecordedChunks([]);
    setResult(null);
    setVideoURL(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) videoRef.current.srcObject = stream;

      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setVideoURL(url);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      console.error('Erreur d’accès à la webcam :', err);
    }
  };

  const stopRecording = () => {
    mediaRecorder?.stop();
    setIsRecording(false);
  };

  const handleSend = async () => {
    if (recordedChunks.length === 0) return;

    setLoading(true);
    setResult(null);

    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const formData = new FormData();
    formData.append('video', blob, 'video.webm');
    formData.append('poste', poste);
    formData.append('question', question);

    try {
      const res = await fetch('http://localhost:8000/transcribe-video', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      // Parsing si le feedback est en JSON brut
      let parsedFeedback = data;
      if (typeof data.feedback === 'string' && data.feedback.includes('{')) {
        const parsed = parseJSONFeedback(data.feedback);
        if (parsed) {
          parsedFeedback = { ...data, ...parsed };
        }
      }

      setResult(parsedFeedback);
    } catch (err) {
      console.error('Erreur lors de l\'envoi de la vidéo :', err);
    }

    setLoading(false);
  };

  return (
    <Box>
      <Typography variant="h6">🎥 Enregistrement vidéo</Typography>
      <video ref={videoRef} autoPlay muted style={{ width: '100%', marginBottom: 16 }} />
      {/* {videoURL && (
        <video src={videoURL} controls style={{ width: '100%', marginBottom: 16 }} />
      )} */}
      <Box display="flex" gap={2} mb={2}>
        {!isRecording ? (
          <Button variant="contained" onClick={startRecording} color="primary">
            🎬 Démarrer
          </Button>
        ) : (
          <Button variant="contained" onClick={stopRecording} color="warning">
            ⏹️ Arrêter
          </Button>
        )}
        {videoURL && (
          <Button variant="contained" onClick={handleSend} color="success">
            🚀 Envoyer pour analyse
          </Button>
        )}
      </Box>

      {loading && <CircularProgress />}

      {result && (
        <Box mt={4}>
          <Typography variant="h6">📋 Résultats IA</Typography>
          {/* <Typography><strong>Transcription :</strong> {result.transcription}</Typography> */}
          <Typography><strong>Feedback :</strong> {result.feedback}</Typography>
          <Typography><strong>Score global :</strong> {result.score_total} / 10</Typography>
          <Typography><strong>Détails :</strong></Typography>
          <ul>
            <li>Communication : {result.details?.communication} / 10</li>
            <li>Clarté : {result.details?.clarte} / 10</li>
            <li>Pertinence : {result.details?.pertinence} / 10</li>
          </ul>
          {result.details && <ScoreRadar data={result.details} />}
          {result.audio_feedback_url && (
            <audio controls src={`http://localhost:8000${result.audio_feedback_url}`} />
          )}
        </Box>
      )}
    </Box>
  );
};

export default VideoRecorder;
