import React, { useState } from 'react';
import {
  Box, TextField, Button, Typography, CircularProgress
} from '@mui/material';
import ScoreRadar from './ScoreRadar';

interface TextAnswerFormProps {
  poste: string;
  question: string;
}

const TextAnswerForm: React.FC<TextAnswerFormProps> = ({ poste, question }) => {
  const [reponse, setReponse] = useState('');
  const [feedback, setFeedback] = useState('');
  const [scoreTotal, setScoreTotal] = useState<number | null>(null);
  const [details, setDetails] = useState<{
    communication: number;
    clarte: number;
    pertinence: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reponse.trim()) return alert('Veuillez saisir une réponse.');

    setLoading(true);

    const formData = new FormData();
    formData.append('reponse', reponse);
    formData.append('poste', poste);
    formData.append('question', question);

    try {
      const res = await fetch('http://localhost:8000/analyze-text', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      setFeedback(data.feedback);
      setScoreTotal(data.score_total);
      setDetails(data.details);
    } catch (error) {
      alert('Erreur lors de l’analyse.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box mt={4} p={2} border="1px solid #ccc" borderRadius={2}>
      <Typography variant="h6">📝 Réponse écrite à la question</Typography>
      <Typography mt={1} color="text.secondary">
        Question : {question}
      </Typography>

      <TextField
        multiline
        rows={5}
        fullWidth
        value={reponse}
        onChange={(e) => setReponse(e.target.value)}
        margin="normal"
        label="Votre réponse"
        variant="outlined"
      />

      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Analyser la réponse'}
      </Button>

      {feedback && (
        <Box mt={4}>
          <Typography variant="h6">📣 Feedback IA :</Typography>
          <Typography>{feedback}</Typography>
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

export default TextAnswerForm;
