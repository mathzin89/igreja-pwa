// src/components/dashboard/ImportantNotices.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/firebaseConfig'; // Verifique o caminho
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  Timestamp 
} from 'firebase/firestore';

// Componentes do Material-UI
import { 
  Typography, 
  Card, 
  CardContent, 
  Box, 
  CircularProgress, 
  Alert 
} from '@mui/material';
import { Campaign } from '@mui/icons-material'; // Ícone de "aviso"

// Definindo a interface para o nosso documento de Aviso
interface Notice {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: Timestamp;
}

export default function ImportantNotices() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setError(null);
        setLoading(true);

        // 1. Criar a referência da coleção
const noticesRef = collection(db, 'avisos');
        // 2. Criar a consulta (query)
        // Ordenar por 'createdAt' em ordem descendente (mais novo primeiro)
        // Limitar aos 3 documentos mais recentes
        const q = query(
          noticesRef, 
          orderBy('createdAt', 'desc'), 
          limit(3)
        );

        // 3. Executar a consulta
        const querySnapshot = await getDocs(q);

        // 4. Mapear os resultados para o nosso state
        const noticesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Notice));

        setNotices(noticesList);

      } catch (err) {
        console.error("Erro ao buscar avisos: ", err);
        setError("Não foi possível carregar os avisos. Verifique as regras do Firestore.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []); // O array vazio [] faz com que isso rode apenas uma vez

  return (
    <Box sx={{ my: 3, width: '100%' }}>
      <Typography 
        variant="h6" 
        gutterBottom 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1, 
          color: 'primary.main' // Usando a cor primária (azul)
        }}
      >
        <Campaign />
        Recados Importantes
      </Typography>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <CircularProgress color="primary" />
        </Box>
      )}

      {error && (
        <Alert severity="error">{error}</Alert>
      )}

      {!loading && !error && notices.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          Nenhum recado importante no momento.
        </Typography>
      )}

      {!loading && !error && notices.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {notices.map((notice) => (
            <Card key={notice.id} variant="outlined">
              <CardContent>
                <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                  {notice.title}
                </Typography>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Por: {notice.author} - {notice.createdAt.toDate().toLocaleDateString('pt-BR')}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1.5, whiteSpace: 'pre-wrap' }}>
                  {notice.content}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}