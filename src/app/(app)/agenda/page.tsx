// src/app/(app)/agenda/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/firebaseConfig';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';

// Interface para definir a estrutura do Evento (com base no que combinamos)
interface Evento {
  id: string;
  titulo: string;
  dataEvento: Timestamp;
  local: string;
  descricao: string;
}

// Função para formatar a data do Timestamp
function formatarData(timestamp: Timestamp): string {
  if (!timestamp) return "Data não definida";
  
  const data = timestamp.toDate(); // Converte Timestamp para Data JS
  
  // Formata a data (ex: Sábado, 19/10/2025 às 18:30)
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(data);
}

export default function AgendaPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        setLoading(true);
        setError(null);

        // Pega a data/hora de agora
        const agora = Timestamp.now();

        // 1. Referência da coleção
        const agendaRef = collection(db, 'agenda');

        // 2. Cria a consulta (query)
        const q = query(
          agendaRef,
          // Filtra: onde 'dataEvento' for maior ou igual a hoje
          where('dataEvento', '>=', agora),
          // Ordena: por 'dataEvento' (mais próximo primeiro)
          orderBy('dataEvento', 'asc')
        );

        // 3. Executa a consulta
        const querySnapshot = await getDocs(q);

        // 4. Mapeia os resultados
        const listaEventos = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Evento));

        setEventos(listaEventos);

      } catch (err: any) {
        console.error("Erro ao buscar agenda:", err);
        // Erro comum: índice não criado
        if (err.code === 'failed-precondition') {
           setError("Erro: O índice necessário do Firestore para esta consulta não existe. Por favor, crie o índice no Console do Firebase.");
        } else {
           setError("Não foi possível carregar a agenda.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEventos();
  }, []); // Roda apenas uma vez

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
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
        <Typography component="h1" variant="h4" gutterBottom>
          Agenda da Igreja
        </Typography>
        <Typography variant="body1" align="center">
          Confira nossos próximos eventos e cultos.
        </Typography>
      </Box>

      {/* Estado de Carregamento */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Estado de Erro */}
      {error && (
        <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
      )}

      {/* Estado Vazio (Sem eventos futuros) */}
      {!loading && !error && eventos.length === 0 && (
        <Paper elevation={1} sx={{ p: 3, textAlign: 'center', backgroundColor: 'grey.100' }}>
          <Typography variant="h6">Nenhum evento futuro agendado.</Typography>
          <Typography variant="body2">Por favor, verifique novamente mais tarde.</Typography>
        </Paper>
      )}

      {/* Lista de Eventos */}
      {!loading && !error && eventos.length > 0 && (
        <Paper elevation={1} sx={{ width: '100%' }}>
          <List sx={{ p: 0 }}>
            {eventos.map((evento, index) => (
              <React.Fragment key={evento.id}>
                {index > 0 && <Divider component="li" />}
                <ListItem sx={{ p: 2 }}>
                  <Box sx={{ width: '100%' }}>
                    {/* Título */}
                    <Typography variant="h6" component="div" color="primary.main">
                      {evento.titulo}
                    </Typography>
                    
                    {/* Data e Hora */}
                    <Box sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
                      <EventIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <ListItemText
                        primary={formatarData(evento.dataEvento)}
                        primaryTypographyProps={{ fontWeight: 'bold' }}
                      />
                    </Box>
                    
                    {/* Local */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOnIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <ListItemText
                        primary={evento.local}
                      />
                    </Box>
                    
                    {/* Descrição */}
                    <Typography variant="body2" color="text.secondary">
                      {evento.descricao}
                    </Typography>
                  </Box>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}