// Seu arquivo updateUserProfile.ts (ex: src/app/actions/updateUserProfile.ts)
"use server";
import { adminDb, adminAuth } from '@/lib/firebase/admin'; // ✅ CAMINHO CORRIGIDO para o novo admin.ts
import { storage as clientStorage } from '@/lib/firebase/firebaseConfig'; // ✅ CAMINHO CORRIGIDOimport { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { revalidatePath } from 'next/cache';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function updateUserProfile(uid: string, formData: FormData) {
  if (!uid) {
    return { success: false, message: "ID do utilizador não fornecido." };
  }

  const nome = formData.get('nome') as string | null;
  const bio = formData.get('bio') as string | null;
  const dataNascimento = formData.get('dataNascimento') as string | null;
  const dataMembroDesde = formData.get('dataMembroDesde') as string | null;
  const ministriesStr = formData.get('ministries') as string | null;
  let ministries: string[] | undefined;
  if (ministriesStr !== null && ministriesStr.trim() !== '') {
    ministries = ministriesStr.split(',').map(s => s.trim()).filter(s => s !== '');
  } else if (ministriesStr !== null && ministriesStr.trim() === '') {
    // Se o campo de texto dos ministérios for limpo, o array deve ficar vazio no DB
    ministries = []; 
  }

  const photo = formData.get('photo') as File | null;

  // Verifica se há alguma informação real para atualizar
  if (!nome && !bio && !dataNascimento && !dataMembroDesde && !ministriesStr && (!photo || photo.size === 0)) {
    return { success: false, message: "Nenhuma informação para atualizar." };
  }

  try {
    const firestoreUpdateData: { [key: string]: any } = {};
    const authUpdateData: { [key: string]: any } = {};

    if (photo && photo.size > 0) {
      const filePath = `user-profiles/${uid}/${Date.now()}-${photo.name}`; 
      const storageRef = ref(clientStorage, filePath);
      
      const photoBuffer = await photo.arrayBuffer();
      await uploadBytes(storageRef, photoBuffer, { contentType: photo.type });

      const photoURL = await getDownloadURL(storageRef);
      firestoreUpdateData.foto = photoURL; // ✅ Seu campo no DB é 'foto'
      authUpdateData.photoURL = photoURL; // Para o Firebase Authentication
    }

    if (nome !== null) { 
      firestoreUpdateData.nome = nome;
      authUpdateData.displayName = nome; // Para o Firebase Authentication
    }
    
    if (bio !== null) {
      firestoreUpdateData.bio = bio;
    }

    if (dataNascimento !== null) {
      firestoreUpdateData.dataNascimento = dataNascimento;
    }

    if (dataMembroDesde !== null) {
      firestoreUpdateData.dataMembroDesde = dataMembroDesde;
    }

    if (ministries !== undefined) {
      firestoreUpdateData.ministries = ministries;
    }

    if (Object.keys(firestoreUpdateData).length > 0) {
      await adminDb.collection('users').doc(uid).update(firestoreUpdateData);
    }
    
    if (Object.keys(authUpdateData).length > 0) {
      await adminAuth.updateUser(uid, authUpdateData);
    }

    revalidatePath('/app/meu-perfil'); // ✅ Revalida a página de perfil no PWA

    return { success: true };

  } catch (error: any) {
    console.error("Erro ao atualizar perfil:", error);
    return { success: false, message: "Falha ao atualizar o perfil: " + (error.message || "Erro desconhecido") };
  }
}