// src/app/(app)/conectar/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase/firebaseConfig';
import { useAuth } from '@/context/AuthContext';
import {
  collection,
  query,
  orderBy,
  getDocs,
  where,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Badge,
} from '@mui/material';
import UserList from '@/components/dashboard/conectar/UserList'; 
import { UserProfile, Friendship } from '@/types'; // Importa UserProfile e Friendship

export default function ConectarPage() {
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]); // Usando UserProfile
  const [myFriendships, setMyFriendships] = useState<Friendship[]>([]); // Usando Friendship
  
  const [tabValue, setTabValue] = useState(0);

  // Efeito principal para buscar TODOS os dados (Usuários e Amizades)
  const fetchData = async () => { // Extraído para ser chamável
    if (!currentUser) return; 

    try {
      setLoading(true);
      setError(null);
      
      // --- 1. Buscar TODOS os usuários (exceto eu) ---
      const usersRef = collection(db, 'users');
      const qUsers = query(usersRef, orderBy('nome', 'asc')); 
      const usersSnapshot = await getDocs(qUsers);
      
      const usersList: UserProfile[] = []; // Usando UserProfile
      usersSnapshot.forEach(doc => {
        if (doc.id !== currentUser.uid) { 
          const data = doc.data() as DocumentData;
          usersList.push({ 
            uid: doc.id,
            nome: data.nome,
            foto: data.foto || null, // ✅ Usando 'foto' aqui
            email: data.email,
            // Adicione outros campos relevantes do UserProfile se precisar
            role: data.role || 'membro',
            createdAt: data.createdAt || new Date().toISOString(),
          });
        }
      });
      setAllUsers(usersList);

      // --- 2. Buscar TODAS as minhas amizades ---
      const friendshipsRef = collection(db, 'friendships');
      const qFriendships = query(friendshipsRef, where('users', 'array-contains', currentUser.uid));
      const friendshipsSnapshot = await getDocs(qFriendships);
      
      const friendshipsList = friendshipsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            users: data.users as [string, string], // Garantindo o tipo tuple
            status: data.status,
            initiatedBy: data.initiatedBy,
            createdAt: data.createdAt || new Date().toISOString(),
          } as Friendship;
      });
      setMyFriendships(friendshipsList);

    } catch (err: any) {
        if (err.code === 'failed-precondition') {
          setError("Erro de consulta. Verifique seus índices do Firestore, especialmente na coleção 'friendships'.");
        } else {
          console.error("Erro ao buscar dados:", err);
          setError("Não foi possível carregar os dados da comunidade.");
        }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]); // Re-executa se o usuário logado mudar

  const handleActionComplete = () => {
    fetchData(); // Chama fetchData para recarregar tudo após uma ação
  };

  // Lista para a Aba "Meus Amigos"
  const friendsList = useMemo(() => {
    if (!currentUser) return []; 
    
    const friendUids = myFriendships
      .filter(fs => fs.status === 'accepted')
      .map(fs => fs.users.find(uid => uid !== currentUser.uid));
      
    return allUsers.filter(user => friendUids.includes(user.uid));
  }, [allUsers, myFriendships, currentUser]); 

  // Lista para a Aba "Solicitações"
  const requestsList = useMemo(() => {
    if (!currentUser) return []; 

    const requestUids = myFriendships
      .filter(fs => fs.status === 'pending' && fs.initiatedBy !== currentUser.uid)
      .map(fs => fs.users.find(uid => uid !== currentUser.uid));
      
    return allUsers.filter(user => requestUids.includes(user.uid));
  }, [allUsers, myFriendships, currentUser]); 

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box 
      sx={{ 
        maxWidth: '600px',
        margin: 'auto',
        px: { xs: 0, sm: 2 }, 
        py: { xs: 0, sm: 3 }
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3, p: 2 }}>
        <Typography component="h1" variant="h4" gutterBottom>
          Conectar
        </Typography>
        <Typography variant="body1" align="center">
          Encontre e conecte-se com outros membros da AD Plenitude.
        </Typography>
      </Box>
      
      <Box sx={{ width: '100%', borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="fullWidth" 
          aria-label="abas de comunidade"
        >
          <Tab label="Buscar" />
          <Tab label="Amigos" />
          <Tab 
            label={
              <Badge badgeContent={requestsList.length} color="primary">
                Solicitações
              </Badge>
            } 
          />
        </Tabs>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ my: 2, mx: 2 }}>{error}</Alert>
      )}

      {!loading && !error && (
        <Box sx={{ p: { xs: 0, sm: 2 } }}> 
          {/* Aba 0: Buscar */}
          {tabValue === 0 && (
            <UserList 
              users={allUsers}
              friendships={myFriendships} // ✅ Passa as amizades
              emptyMessage="Nenhum outro membro encontrado."
              currentTab={tabValue} // ✅ Passa a aba atual
              onActionComplete={handleActionComplete} // ✅ Passa o callback
            />
          )}
          
          {/* Aba 1: Meus Amigos */}
          {tabValue === 1 && (
            <UserList 
              users={friendsList}
              friendships={myFriendships} // ✅ Passa as amizades
              emptyMessage="Você ainda não adicionou nenhum amigo."
              currentTab={tabValue} // ✅ Passa a aba atual
              onActionComplete={handleActionComplete} // ✅ Passa o callback
            />
          )}

          {/* Aba 2: Solicitações */}
          {tabValue === 2 && (
            <UserList 
              users={requestsList}
              friendships={myFriendships} // ✅ Passa as amizades
              emptyMessage="Você não tem nenhuma solicitação de amizade pendente."
              currentTab={tabValue} // ✅ Passa a aba atual
              onActionComplete={handleActionComplete} // ✅ Passa o callback
            />
          )}
        </Box>
      )}
    </Box>
  );
}