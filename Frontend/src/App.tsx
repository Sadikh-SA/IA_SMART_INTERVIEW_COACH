import { useState } from 'react';
import VoiceRecorder from './components/VoiceRecorder';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  FormControlLabel,
  Switch,
} from '@mui/material';
import TextAnswerForm from './components/TextAnsWerForm';
import VideoRecorder from './components/VideoRecorder';

function App() {
  const [poste, setPoste] = useState('');
  const [questions, setQuestions] = useState('');
  const [question, setQuestion] = useState('');
  const [mode, setMode] = useState<'audio' | 'text' | 'video'>('audio');
  const [result, setResult] = useState<{
    transcription: string;
    feedback: string;
    score_total: number | null;
    details: {
      communication: number;
      clarte: number;
      pertinence: number;
    } | null;
    audio_feedback_url: string | null;
  } | null>(null);



  const handleSubmit = async () => {
    const res = await fetch('http://127.0.0.1:8000/generate-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ poste }),
    });
    const data = await res.json();
    setQuestions(data.questions);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        🎓 Coach d'entretien intelligent
      </Typography>

      <Box mb={4}>
        <TextField
          fullWidth
          label="Poste visé"
          value={poste}
          onChange={(e) => setPoste(e.target.value)}
          variant="outlined"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          sx={{ mt: 2}}
        >
          🎯 Générer les questions
        </Button>
      </Box>

      {questions && (
        <Paper variant="outlined" sx={{ p: 2, mb: 4, whiteSpace: 'pre-wrap', backgroundColor: '#f9f9f9' }}>
          <Typography variant="body1">{questions}</Typography>
        </Paper>
      )}

      <Typography variant="h5" gutterBottom>
        🗣️ Analyse d'une réponse
      </Typography>
      <TextField
        fullWidth
        label="Copie une question ici"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        variant="outlined"
        sx={{ mb: 2 }}
      />

      <FormControlLabel
        control={<Switch checked={mode === 'audio'} onChange={() => setMode(mode === 'audio' ? 'text' : 'audio')} />}
        label={mode === 'audio' ? "🎙️ Mode Audio" : "⌨️ Mode Texte"}
      />

      {/* Optionnel : bouton pour activer mode vidéo */}
      <Button variant="outlined" onClick={() => setMode('video')}>
        🎥 Mode Vidéo
      </Button>

      {mode === 'text' && <TextAnswerForm poste={poste} question={question} />}
      {mode === 'audio' && <VoiceRecorder poste={poste} question={question} />}
      {mode === 'video' && <VideoRecorder poste={poste} question={question} />}
    </Container>
  );
}

export default App;
