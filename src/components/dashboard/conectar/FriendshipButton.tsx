// src/components/dashboard/conectar/FriendshipButton.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/firebaseConfig';
import { useAuth } from '@/context/AuthContext';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { Button, Chip, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import PendingIcon from '@mui/icons-material/Pending';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

// Data structure in Firestore
interface FriendshipData {
  users: string[];
  status: 'pending' | 'accepted';
  initiatedBy: string;
}

// Our internal type for the state, including the document ID
interface Friendship extends FriendshipData {
  id: string;
}

type FriendshipStatus = 'loading' | 'friends' | 'pending_to_them' | 'pending_to_me' | 'not_friends';

interface Props {
  targetUserId: string;
}

export default function FriendshipButton({ targetUserId }: Props) {
  const { user: currentUser } = useAuth();
  const [status, setStatus] = useState<FriendshipStatus>('loading');
  const [friendshipDoc, setFriendshipDoc] = useState<Friendship | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.uid === targetUserId) {
      setStatus('not_friends');
      return;
    }

    const checkStatus = async () => {
      // --- CORREÇÃO APLICADA AQUI (try...catch) ---
      try {
        setStatus('loading');
        
        const q = query(
          collection(db, 'friendships'),
          where('users', 'array-contains', currentUser.uid)
        );

        const querySnapshot = await getDocs(q);
        
        const friendshipDocs = querySnapshot.docs as QueryDocumentSnapshot<FriendshipData>[];
        const foundDoc = friendshipDocs.find(
          (doc) => doc.data().users.includes(targetUserId)
        );

        if (foundDoc) {
          const friendshipData: Friendship = {
            id: foundDoc.id,
            users: foundDoc.data().users,
            status: foundDoc.data().status,
            initiatedBy: foundDoc.data().initiatedBy
          };

          setFriendshipDoc(friendshipData);
          
          if (friendshipData.status === 'accepted') {
            setStatus('friends');
          } else if (friendshipData.status === 'pending') {
            if (friendshipData.initiatedBy === currentUser.uid) {
              setStatus('pending_to_them');
            } else {
              setStatus('pending_to_me');
            }
          }
        } else {
          setStatus('not_friends');
        }
      } catch (err) {
        console.error(`Erro ao verificar amizade com ${targetUserId}:`, err);
        // Se a consulta falhar (ex: Permissão negada), 
        // paramos de carregar e assumimos que não são amigos.
        setStatus('not_friends'); 
      }
      // --- FIM DA CORREÇÃO ---
    };

    checkStatus();
  }, [currentUser, targetUserId]);

  // Função para ADICIONAR amigo
  const handleAddFriend = async () => {
    if (!currentUser) return;
    setStatus('loading');
    try {
      const docRef = await addDoc(collection(db, 'friendships'), {
        users: [currentUser.uid, targetUserId],
        status: 'pending',
        initiatedBy: currentUser.uid,
        createdAt: serverTimestamp(),
      });
      setFriendshipDoc({
        id: docRef.id,
        users: [currentUser.uid, targetUserId],
        status: 'pending',
        initiatedBy: currentUser.uid,
      });
      setStatus('pending_to_them'); 
    } catch (error) {
      console.error("Erro ao adicionar amigo:", error);
      setStatus('not_friends');
    }
  };

  // Função para ACEITAR pedido
  const handleAcceptFriend = async () => {
    if (!friendshipDoc) return;
    setStatus('loading');
    try {
      const docRef = doc(db, 'friendships', friendshipDoc.id);
      await updateDoc(docRef, {
        status: 'accepted',
        acceptedAt: serverTimestamp(),
      });
      setFriendshipDoc({ ...friendshipDoc, status: 'accepted' });
      setStatus('friends');
    } catch (error)      {
      console.error("Erro ao aceitar pedido:", error);
      setStatus('pending_to_me');
    }
  };

  // Função para CANCELAR/REMOVER (simplificado)
  const handleRemoveFriend = async () => {
    if (!friendshipDoc) return;
    const oldStatus = status; 
    setStatus('loading');
    try {
      const docRef = doc(db, 'friendships', friendshipDoc.id);
      await deleteDoc(docRef);
      setFriendshipDoc(null);
      setStatus('not_friends');
    } catch (error) {
      console.error("Erro ao remover amizade:", error);
      setStatus(oldStatus); 
    }
  };

  // Renderiza o botão correto com base no status
  switch (status) {
    case 'loading':
      return <CircularProgress size={24} />;
    
    case 'friends':
      return (
        <Chip 
          icon={<CheckIcon />} 
          label="Amigos" 
          variant="outlined" 
          color="success"
          onClick={handleRemoveFriend}
          onDelete={handleRemoveFriend} 
        />
      );
      
    case 'pending_to_them': // Eu enviei o pedido
      return (
        <Button 
          variant="outlined" 
          size="small" 
          startIcon={<PendingIcon />}
          onClick={handleRemoveFriend} // Permite cancelar
        >
          Solicitado
        </Button>
      );
      
    case 'pending_to_me': // Eles enviaram o pedido
      return (
        <Button 
          variant="contained" 
          size="small" 
          startIcon={<PersonAddIcon />}
          onClick={handleAcceptFriend}
        >
          Aceitar
        </Button>
      );

    case 'not_friends':
      return (
        <Button 
          variant="contained" 
          size="small" 
          startIcon={<AddIcon />}
          onClick={handleAddFriend}
        >
          Adicionar
        </Button>
      );
      
    default:
      return null;
  }
}