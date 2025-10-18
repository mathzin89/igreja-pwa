// src/app/login/page.tsx
'use client'; // Necessário para usar hooks como useState e eventos onClick

import React, { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase/firebaseConfig'; // Verifique se o caminho está correto
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation'; // Importe o novo router do App Router
import { useAuth } from '@/context/AuthContext'; // Importe o hook do contexto de autenticação

// Componentes do Material-UI
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  CircularProgress, 
  Alert 
} from '@mui/material';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Loading do formulário
  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); // Hook para redirecionamento
  
  // Pega o usuário e o loading global do contexto de autenticação
  const { user, loading: authLoading } = useAuth(); 

  useEffect(() => {
    // Se o contexto de autenticação não estiver carregando e o usuário JÁ EXISTIR
    if (!authLoading && user) {
      router.push('/'); // Redireciona para o Dashboard (página principal)
    }
  }, [user, authLoading, router]); // Dependências do efeito

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault(); // Impede o recarregamento da página
    setLoading(true); // Ativa o loading do formulário
    setError(null);

    try {
      // Tenta fazer o login com o Firebase Auth
      await signInWithEmailAndPassword(auth, email, password);
      
      // Sucesso! Redireciona para a página principal (Dashboard)
      router.push('/'); 

    } catch (err: any) {
      console.error("Erro no login:", err.code, err.message);
      // Define uma mensagem de erro amigável
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('Email ou senha inválidos.');
      } else {
        setError('Ocorreu um erro ao tentar fazer login.');
      }
      setLoading(false); // Desativa o loading do formulário em caso de erro
    }
  };

  // Se o auth global estiver carregando ou se o usuário já existir (enquanto redireciona),
  // mostramos um loader em tela cheia ao invés do formulário de login.
  if (authLoading || user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Se o auth não estiver carregando E o usuário for nulo, mostramos o formulário.
  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Login
        </Typography>
        <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Senha"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          
          {/* Exibe o erro, se houver */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading} // Desabilita o botão se o formulário estiver carregando
          >
            {loading ? <CircularProgress size={24} /> : 'Entrar'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}