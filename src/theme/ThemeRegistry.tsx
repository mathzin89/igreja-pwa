// src/theme/ThemeRegistry.tsx
'use client';

import * as React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import CssBaseline from '@mui/material/CssBaseline';
import { blue } from '@mui/material/colors'; // 1. Importamos a cor azul

// 2. Definimos o tema com a paleta da AD Plenitude
const theme = createTheme({
  palette: {
    mode: 'light', // Modo claro (fundo branco)
    primary: {
      main: blue[700], // Um tom de azul principal (ex: #1976d2)
      light: blue[300], // Tom mais claro
      dark: blue[900],  // Tom mais escuro
    },
    secondary: {
      // Podemos usar um tom de azul mais claro ou um cinza
      main: blue[50], 
    },
    background: {
      default: '#ffffff', // Fundo principal branco
      paper: '#f5f5f5',   // Fundo de "papéis" (como Cards) um cinza bem claro
    },
  },
  // Você também pode customizar a tipografia aqui se quiser
  // typography: {
  //   fontFamily: 'Roboto, Arial, sans-serif',
  // },
});

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ThemeProvider theme={theme}>
        {/* CssBaseline reinicia o CSS e aplica a cor de fundo */}
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}