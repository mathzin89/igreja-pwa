// src/app/(app)/oracao/page.tsx
'use client';

import React, { useState } from 'react';
import { db } from '@/lib/firebase/firebaseConfig';
import { useAuth } from '@/context/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Componentes do Material-UI
import {
  // Container foi removido
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';

export default function PrayerRequestPage() {
  const { user } = useAuth(); 
  const [requestText, setRequestText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    // ... (lógica do handleSubmit não muda) ...
    event.preventDefault();
    if (!requestText.trim()) {
      setError('Por favor, escreva seu pedido de oração.');
      return;
    }
    if (!user) {
      setError('Você precisa estar logado para enviar um pedido.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const prayerRequestsCol = collection(db, 'prayerRequests');
      await addDoc(prayerRequestsCol, {
        text: requestText,
        authorUid: user.uid, 
        authorName: user.displayName || user.email,
        createdAt: serverTimestamp(),
        status: 'pending', 
      });
      setSuccess('Seu pedido de oração foi enviado com sucesso!');
      setRequestText(''); 
    } catch (err) {
      console.error("Erro ao enviar pedido de oração:", err);
      setError('Ocorreu um erro ao enviar seu pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // --- CORREÇÃO APLICADA AQUI ---
    // Trocamos <Container> por <Box> com estilos manuais
    <Box 
      sx={{ 
        maxWidth: '600px',  // 1. Equivalente ao maxWidth="sm"
        margin: 'auto',     // 2. Centraliza o Box
        px: 2,              // 3. Padding horizontal (para não colar nas bordas do celular)
        py: 3               // 4. Padding vertical
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h4" gutterBottom>
          Pedidos de Oração
        </Typography>
        <Typography variant="body1" align="center" sx={{ mb: 3 }}>
          Deixe seu pedido de oração aqui. A equipe pastoral e os intercessores
          estarão orando por você.
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
          <TextField
            id="prayer-request"
            label="Escreva seu pedido aqui..."
            multiline
            rows={6}
            variant="outlined"
            fullWidth
            required
            value={requestText}
            onChange={(e) => setRequestText(e.target.value)}
            disabled={loading}
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {success}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary" 
            sx={{ mt: 3, mb: 2, height: 48 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Enviar Pedido'}
          </Button>
        </Box>
      </Box>
    </Box> // <-- Fechamento do Box
  );
}