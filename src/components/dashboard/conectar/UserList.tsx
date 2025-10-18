// src/components/dashboard/conectar/UserList.tsx
"use client";

import React from 'react';
import { 
  List, ListItem, ListItemAvatar, Avatar, ListItemText, Button,
  Divider, Box, Typography,
} from '@mui/material';
import Link from 'next/link';
import { UserProfile, Friendship } from '@/types'; // Importa UserProfile e Friendship
import { useAuth } from '@/context/AuthContext';
// Importe as Server Actions que vamos criar para gerenciar amizades
import { 
  sendFriendRequest, 
  acceptFriendRequest, 
  declineFriendRequest, 
  removeFriend,
  blockUser // Se você quiser implementar bloqueio
} from '@/app/actions/friendshipActions'; // ✅ Vamos criar este arquivo depois

interface UserListProps {
  users: UserProfile[]; // Recebe a lista de UserProfile
  friendships: Friendship[]; // Recebe as amizades do usuário logado
  emptyMessage: string;
  currentTab: number; // Para saber qual aba está ativa (0: Buscar, 1: Amigos, 2: Solicitações)
  onActionComplete: () => void; // Callback para recarregar dados após uma ação
}

export default function UserList({ 
  users, 
  friendships, 
  emptyMessage, 
  currentTab,
  onActionComplete 
}: UserListProps) {
  const { user: currentUser, refreshUserProfile } = useAuth(); // O user logado
  
  if (!currentUser) {
    return null; // Não renderiza se não houver usuário logado
  }

  // Função auxiliar para determinar o status da amizade entre o usuário logado e um 'targetUser'
  const getFriendshipStatus = (targetUserUid: string) => {
    const friendship = friendships.find(fs => 
      fs.users.includes(currentUser.uid) && fs.users.includes(targetUserUid)
    );

    if (!friendship) {
      return 'none'; // Não há amizade
    }

    if (friendship.status === 'pending') {
      if (friendship.initiatedBy === currentUser.uid) {
        return 'sent_by_me'; // Eu enviei o pedido
      } else {
        return 'received_by_other'; // Recebi um pedido
      }
    }

    if (friendship.status === 'accepted') {
      return 'friends'; // Somos amigos
    }
    
    // Podemos adicionar 'declined' ou 'blocked' se você quiser mais complexidade
    if (friendship.status === 'declined') {
      return 'declined';
    }
    if (friendship.status === 'blocked') {
      return 'blocked';
    }

    return 'none'; // Fallback
  };

  // Funções de ação
  const handleSendRequest = async (targetUserId: string) => {
    if (!currentUser) return;
    await sendFriendRequest(currentUser.uid, targetUserId);
    onActionComplete(); // Recarrega os dados na ConectarPage
  };

  const handleAcceptRequest = async (targetUserId: string) => {
    if (!currentUser) return;
    await acceptFriendRequest(currentUser.uid, targetUserId);
    onActionComplete();
  };

  const handleDeclineRequest = async (targetUserId: string) => {
    if (!currentUser) return;
    await declineFriendRequest(currentUser.uid, targetUserId);
    onActionComplete();
  };

  const handleRemoveFriend = async (targetUserId: string) => {
    if (!currentUser) return;
    await removeFriend(currentUser.uid, targetUserId);
    onActionComplete();
  };


  if (users.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
        <Typography variant="body1">{emptyMessage}</Typography>
      </Box>
    );
  }

  return (
    <List sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
      {users.map((member, index) => {
        const friendshipStatus = getFriendshipStatus(member.uid);
        
        return (
          <React.Fragment key={member.uid}>
            <ListItem 
              secondaryAction={
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {/* Botão de Ver Perfil sempre presente */}
                  <Button 
                    variant="outlined" 
                    size="small" 
                    component={Link}
                    href={`/app/perfil/${member.uid}`} 
                  >
                    Ver Perfil
                  </Button>

                  {/* Lógica dos botões de amizade */}
                  {currentTab === 0 && ( // Aba "Buscar"
                    <>
                      {friendshipStatus === 'none' && (
                        <Button 
                          variant="contained" 
                          size="small" 
                          onClick={() => handleSendRequest(member.uid)}
                        >
                          Adicionar
                        </Button>
                      )}
                      {friendshipStatus === 'sent_by_me' && (
                        <Button variant="text" size="small" disabled>
                          Pendente
                        </Button>
                      )}
                      {friendshipStatus === 'received_by_other' && (
                        <>
                          <Button 
                            variant="contained" 
                            size="small" 
                            color="success" 
                            onClick={() => handleAcceptRequest(member.uid)}
                          >
                            Aceitar
                          </Button>
                          <Button 
                            variant="outlined" 
                            size="small" 
                            color="error" 
                            onClick={() => handleDeclineRequest(member.uid)}
                          >
                            Recusar
                          </Button>
                        </>
                      )}
                      {friendshipStatus === 'friends' && (
                        <Button variant="text" size="small" disabled>
                          Amigos
                        </Button>
                      )}
                    </>
                  )}

                  {currentTab === 1 && friendshipStatus === 'friends' && ( // Aba "Amigos"
                    <Button 
                      variant="outlined" 
                      size="small" 
                      color="error" 
                      onClick={() => handleRemoveFriend(member.uid)}
                    >
                      Remover
                    </Button>
                  )}

                  {currentTab === 2 && friendshipStatus === 'received_by_other' && ( // Aba "Solicitações"
                    <>
                      <Button 
                        variant="contained" 
                        size="small" 
                        color="success" 
                        onClick={() => handleAcceptRequest(member.uid)}
                      >
                        Aceitar
                      </Button>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        color="error" 
                        onClick={() => handleDeclineRequest(member.uid)}
                      >
                        Recusar
                      </Button>
                    </>
                  )}
                  {currentTab === 2 && friendshipStatus === 'sent_by_me' && ( // Se por algum motivo aparecer aqui
                     <Button variant="text" size="small" disabled>
                       Pendente
                     </Button>
                  )}
                </Box>
              }
            >
              <ListItemAvatar>
                <Avatar alt={member.nome} src={member.foto || undefined}>
                  {member.nome ? member.nome.charAt(0) : ''}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={member.nome || 'Nome não definido'}
                secondary={member.email || ''}
              />
            </ListItem>
            {index < users.length - 1 && <Divider variant="inset" component="li" />}
          </React.Fragment>
        );
      })}
    </List>
  );
}