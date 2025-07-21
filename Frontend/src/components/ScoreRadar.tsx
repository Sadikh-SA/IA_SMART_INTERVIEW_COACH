import { Box, Typography } from '@mui/material';
import React from 'react';
import {
  RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, ResponsiveContainer
} from 'recharts';

interface ScoreRadarProps {
  data: {
    communication: number;
    clarte: number;
    pertinence: number;
  };
}

const ScoreRadar: React.FC<ScoreRadarProps> = ({ data }) => {
  
  const chartData = [
    { subject: 'Communication', value: data.communication },
    { subject: 'Clarté', value: data.clarte },
    { subject: 'Pertinence', value: data.pertinence }
  ];

  return (
    <Box mt={4}>
      <Typography variant="h6" align="center">📊 Visualisation des scores</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis angle={30} domain={[0, 10]} />
          <Radar name="Score" dataKey="value" stroke="#1976d2" fill="#1976d2" fillOpacity={0.6} />
        </RadarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default ScoreRadar;
