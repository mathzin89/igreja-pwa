// src/app/(app)/page.tsx
'use client'; 
    
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Box, Typography } from '@mui/material'; // Container foi removido
import ImportantNotices from '@/components/dashboard/ImportantNotices';

// Componente de conteúdo interno
function DashboardContent() {
  const { user } = useAuth(); 

  return (
    // --- CORREÇÃO APLICADA AQUI ---
    // Trocamos <Container> por <Box> com estilos manuais
    <Box 
      sx={{ 
        maxWidth: '600px',  // 1. Equivalente ao maxWidth="sm"
        margin: 'auto',     // 2. Centraliza o Box
        px: 2,              // 3. Padding horizontal
        py: 3               // 4. Padding vertical
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: 'calc(100vh - 64px - 48px)' // 100vh - AppBar - Padding Vertical
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Olá, {user?.displayName || user?.email}!
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Bem-vindo ao app da AD Plenitude.
        </Typography>
        
        <ImportantNotices />
        
      </Box>
    </Box> // <-- Fechamento do Box
  );
}


// Página principal
export default function DashboardPage() {
  return <DashboardContent />;
}