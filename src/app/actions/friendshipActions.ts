// src/app/actions/friendshipActions.ts
"use server";

import { adminDb } from '@/lib/firebase/admin'; // ✅ Seu Firebase Admin (lado do servidor)
import { Friendship } from '@/types'; // Sua interface Friendship
import { FieldValue } from 'firebase-admin/firestore'; // Para usar arrayUnion/arrayRemove se necessário

// Função auxiliar para encontrar uma amizade entre dois usuários
const findFriendship = async (user1Uid: string, user2Uid: string) => {
  const friendshipsRef = adminDb.collection('friendships');

  // Tenta encontrar amizade onde user1 iniciou e user2 é o outro
  let q = friendshipsRef
    .where('users', 'array-contains', user1Uid)
    .where('users', 'array-contains', user2Uid)
    .limit(1);

  let snapshot = await q.get();

  if (!snapshot.empty) {
    return snapshot.docs[0];
  }
  
  return null;
};

// 1. Enviar solicitação de amizade
export async function sendFriendRequest(senderUid: string, receiverUid: string) {
  if (!senderUid || !receiverUid || senderUid === receiverUid) {
    throw new Error("IDs de usuário inválidos para enviar solicitação.");
  }

  // Verificar se já existe uma amizade ou solicitação pendente
  const existingFriendshipDoc = await findFriendship(senderUid, receiverUid);

  if (existingFriendshipDoc && existingFriendshipDoc.exists) {
    const data = existingFriendshipDoc.data() as Friendship;
    if (data.status === 'pending') {
      if (data.initiatedBy === senderUid) {
        return { success: true, message: "Solicitação já enviada.", status: "pending_sent" };
      } else {
        // Se a outra pessoa já enviou uma solicitação para mim, podemos aceitar automaticamente
        // Ou deixar que o usuário decida na aba de solicitações.
        // Por enquanto, vamos retornar uma mensagem.
        return { success: false, message: "Você já recebeu uma solicitação deste usuário. Aceite ou Recuse na aba 'Solicitações'.", status: "pending_received" };
      }
    }
    if (data.status === 'accepted') {
      return { success: true, message: "Vocês já são amigos.", status: "accepted" };
    }
     if (data.status === 'blocked') {
        return { success: false, message: "Um dos usuários bloqueou o outro.", status: "blocked" };
    }
  }

  // Criar nova solicitação
  try {
    const newFriendship: Friendship = {
      id: '', // Firestore irá gerar o ID
      users: [senderUid, receiverUid],
      status: 'pending',
      initiatedBy: senderUid,
      createdAt: new Date().toISOString(),
    };
    const docRef = await adminDb.collection('friendships').add(newFriendship);
    await docRef.update({ id: docRef.id }); // Atualiza o ID no documento
    console.log(`Solicitação de amizade enviada de ${senderUid} para ${receiverUid}`);
    return { success: true, message: "Solicitação de amizade enviada!" };
  } catch (error: any) {
    console.error("Erro ao enviar solicitação de amizade:", error);
    return { success: false, message: `Erro ao enviar solicitação: ${error.message}` };
  }
}

// 2. Aceitar solicitação de amizade
export async function acceptFriendRequest(accepterUid: string, senderUid: string) {
  if (!accepterUid || !senderUid) {
    throw new Error("IDs de usuário inválidos para aceitar solicitação.");
  }

  const friendshipDoc = await findFriendship(accepterUid, senderUid);

  if (friendshipDoc && friendshipDoc.exists) {
    const data = friendshipDoc.data() as Friendship;
    if (data.status === 'pending' && data.initiatedBy === senderUid) { // Verifica se é uma solicitação VÁLIDA
      try {
        await friendshipDoc.ref.update({
          status: 'accepted',
          updatedAt: new Date().toISOString(),
        });
        console.log(`Solicitação de amizade aceita por ${accepterUid} de ${senderUid}`);
        return { success: true, message: "Amizade aceita!" };
      } catch (error: any) {
        console.error("Erro ao aceitar solicitação de amizade:", error);
        return { success: false, message: `Erro ao aceitar solicitação: ${error.message}` };
      }
    } else {
      return { success: false, message: "Nenhuma solicitação de amizade pendente deste usuário." };
    }
  } else {
    return { success: false, message: "Solicitação de amizade não encontrada." };
  }
}

// 3. Recusar solicitação de amizade
export async function declineFriendRequest(declinerUid: string, senderUid: string) {
  if (!declinerUid || !senderUid) {
    throw new Error("IDs de usuário inválidos para recusar solicitação.");
  }

  const friendshipDoc = await findFriendship(declinerUid, senderUid);

  if (friendshipDoc && friendshipDoc.exists) {
    const data = friendshipDoc.data() as Friendship;
    if (data.status === 'pending' && data.initiatedBy === senderUid) { // Verifica se é uma solicitação VÁLIDA
      try {
        // Ao recusar, podemos simplesmente deletar o documento ou mudar o status para 'declined'
        // Deletar é mais limpo para não acumular documentos.
        await friendshipDoc.ref.delete(); 
        console.log(`Solicitação de amizade recusada por ${declinerUid} de ${senderUid}`);
        return { success: true, message: "Solicitação de amizade recusada e removida." };
      } catch (error: any) {
        console.error("Erro ao recusar solicitação de amizade:", error);
        return { success: false, message: `Erro ao recusar solicitação: ${error.message}` };
      }
    } else {
      return { success: false, message: "Nenhuma solicitação de amizade pendente deste usuário." };
    }
  } else {
    return { success: false, message: "Solicitação de amizade não encontrada." };
  }
}

// 4. Remover amigo
export async function removeFriend(user1Uid: string, user2Uid: string) {
  if (!user1Uid || !user2Uid) {
    throw new Error("IDs de usuário inválidos para remover amigo.");
  }

  const friendshipDoc = await findFriendship(user1Uid, user2Uid);

  if (friendshipDoc && friendshipDoc.exists) {
    const data = friendshipDoc.data() as Friendship;
    if (data.status === 'accepted') { // Só remove se já são amigos
      try {
        await friendshipDoc.ref.delete();
        console.log(`Amizade removida entre ${user1Uid} e ${user2Uid}`);
        return { success: true, message: "Amigo removido com sucesso." };
      } catch (error: any) {
        console.error("Erro ao remover amigo:", error);
        return { success: false, message: `Erro ao remover amigo: ${error.message}` };
      }
    } else {
      return { success: false, message: "Vocês não são amigos ou a amizade tem status diferente." };
    }
  } else {
    return { success: false, message: "Amizade não encontrada." };
  }
}

// 5. Bloquear usuário (Opcional)
export async function blockUser(blockerUid: string, blockedUid: string) {
  if (!blockerUid || !blockedUid) {
    throw new Error("IDs de usuário inválidos para bloquear.");
  }

  // Remover qualquer amizade existente ou solicitação antes de bloquear
  const existingFriendshipDoc = await findFriendship(blockerUid, blockedUid);
  if (existingFriendshipDoc && existingFriendshipDoc.exists) {
      await existingFriendshipDoc.ref.delete();
  }

  try {
    const newBlocked: Friendship = { // Usamos a interface Friendship com status 'blocked'
      id: '', 
      users: [blockerUid, blockedUid],
      status: 'blocked',
      initiatedBy: blockerUid,
      createdAt: new Date().toISOString(),
    };
    const docRef = await adminDb.collection('friendships').add(newBlocked);
    await docRef.update({ id: docRef.id });
    console.log(`Usuário ${blockedUid} bloqueado por ${blockerUid}`);
    return { success: true, message: "Usuário bloqueado." };
  } catch (error: any) {
    console.error("Erro ao bloquear usuário:", error);
    return { success: false, message: `Erro ao bloquear: ${error.message}` };
  }
}