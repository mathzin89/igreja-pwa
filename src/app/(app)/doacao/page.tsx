// src/app/(app)/doacao/page.tsx
'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

// --- IMPORTANTE ---
// Substitua estes valores pelos dados reais da AD Plenitude
const DADOS_IGREJA = {
  PIX_KEY: "00.000.000/0001-00", // (Substitua pelo CNPJ ou chave PIX real)
  PIX_TYPE: "CNPJ",
  BENEFICIARIO: "Igreja Evangélica Assembleia de Deus Plenitude",
  BANCO: "Banco Exemplo S.A. (000)",
  AGENCIA: "0001",
  CONTA: "12345-6"
};
// ------------------

export default function DonationPage() {
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Função para copiar a chave PIX
  const handleCopyPix = () => {
    navigator.clipboard.writeText(DADOS_IGREJA.PIX_KEY).then(() => {
      // Sucesso! Mostra o aviso
      setOpenSnackbar(true);
    }).catch(err => {
      // Erro (raro, mas pode acontecer)
      console.error('Falha ao copiar a chave PIX: ', err);
      alert('Não foi possível copiar a chave. Tente manualmente.');
    });
  };

  // Função para fechar o aviso
  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    // Usando o mesmo padrão de Box das outras páginas
    <Box 
      sx={{ 
        maxWidth: '600px',  // Limita a largura
        margin: 'auto',     // Centraliza
        px: 2,              // Padding horizontal
        py: 3               // Padding vertical
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        <Typography component="h1" variant="h4" gutterBottom>
          Dízimos e Ofertas
        </Typography>

        <Typography variant="body1" align="center" sx={{ mb: 3 }}>
          Contribua e ajude a obra a avançar.
          "Cada um contribua segundo propôs no seu coração; não com tristeza, ou por necessidade; porque Deus ama ao que dá com alegria." (2 Coríntios 9:7)
        </Typography>

        {/* Card do PIX */}
        <Paper elevation={3} sx={{ p: 3, width: '100%', borderRadius: 2, mb: 3 }}>
          <Typography variant="h5" color="primary.main" gutterBottom>
            Contribua via PIX
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body1" sx={{ mb: 1 }}>
            Use a chave abaixo para doar de qualquer banco:
          </Typography>
          <Box 
            sx={{ 
              p: 2, 
              backgroundColor: 'grey.100', 
              borderRadius: 1, 
              mb: 2,
              textAlign: 'center'
            }}
          >
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              {DADOS_IGREJA.PIX_KEY}
            </Typography>
            <Typography variant="caption">
              ({DADOS_IGREJA.PIX_TYPE})
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            startIcon={<ContentCopyIcon />}
            onClick={handleCopyPix}
          >
            Copiar Chave PIX
          </Button>
        </Paper>

        {/* Card de Dados Bancários */}
        <Paper elevation={3} sx={{ p: 3, width: '100%', borderRadius: 2 }}>
          <Typography variant="h5" color="primary.main" gutterBottom>
            Transferência Bancária (TED/DOC)
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <List>
            <ListItem>
              <ListItemIcon><AccountBalanceIcon /></ListItemIcon>
              <ListItemText primary="Banco" secondary={DADOS_IGREJA.BANCO} />
            </ListItem>
            <ListItem>
              <ListItemIcon><AccountBalanceIcon /></ListItemIcon>
              <ListItemText primary="Agência" secondary={DADOS_IGREJA.AGENCIA} />
            </ListItem>
            <ListItem>
              <ListItemIcon><AccountBalanceIcon /></ListItemIcon>
              <ListItemText primary="Conta Corrente" secondary={DADOS_IGREJA.CONTA} />
            </ListItem>
            <ListItem>
              <ListItemIcon><AccountBalanceIcon /></ListItemIcon>
              <ListItemText primary="Favorecido" secondary={DADOS_IGREJA.BENEFICIARIO} />
            </ListItem>
             <ListItem>
              <ListItemIcon><AccountBalanceIcon /></ListItemIcon>
              <ListItemText primary="CNPJ" secondary={DADOS_IGREJA.PIX_KEY} />
            </ListItem>
          </List>
        </Paper>

      </Box>

      {/* Snackbar (aviso) de "Copiado!" */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000} // Fecha após 3 segundos
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Chave PIX copiada para a área de transferência!
        </Alert>
      </Snackbar>
    </Box>
  );
}