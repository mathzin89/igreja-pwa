// src/contexts/AuthContext.tsx (NO NOVO PROJETO PWA)
"use client";

import React, { useState, useEffect, useContext, createContext, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore'; // Importe setDoc para criar o perfil
import { auth, db } from '@/lib/firebase/firebaseConfig'; // ✅ Caminho para config do NOVO PROJETO
import { UserProfile, Igreja } from '@/types'; // ✅ Importando as interfaces

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  refreshUserProfile: () => void;
  // Outros estados como 'pendingRequestCount' podem ser adicionados aqui
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  refreshUserProfile: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrCreateUserProfile = useCallback(async (currentUser: User) => {
    const userDocRef = doc(db, 'users', currentUser.uid);
    try {
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const profileData = userDoc.data() as UserProfile;
        
        // Se precisar buscar o nome da igreja
        if (profileData.igrejaId) {
          const igrejaDocRef = doc(db, 'igrejas', profileData.igrejaId);
          const igrejaDoc = await getDoc(igrejaDocRef);
          if (igrejaDoc.exists()) {
            profileData.igrejaNome = (igrejaDoc.data() as Igreja).nome;
          }
        }
        setUserProfile(profileData);
      } else {
        // Se o perfil não existe, cria um perfil básico no Firestore
        // Isso é crucial para novos usuários que se cadastram SÓ pelo App PWA
        const newProfile: UserProfile = {
          uid: currentUser.uid,
          email: currentUser.email || '',
          nome: currentUser.displayName || currentUser.email?.split('@')[0] || '',
          foto: currentUser.photoURL || '', // Usa 'foto' aqui
          createdAt: new Date().toISOString(),
          role: 'membro', // Padrão
          // Outros campos vazios
        };
        await setDoc(userDocRef, newProfile);
        setUserProfile(newProfile);
        console.log("Perfil básico criado para novo usuário:", currentUser.uid);
      }
    } catch (error) {
      console.error("Erro ao buscar/criar perfil do usuário:", error);
      setUserProfile(null);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchOrCreateUserProfile(currentUser);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [fetchOrCreateUserProfile]);

  const refreshUserProfile = useCallback(async () => {
    if (user) {
      setLoading(true);
      await fetchOrCreateUserProfile(user);
      setLoading(false);
    }
  }, [user, fetchOrCreateUserProfile]);

  const value = { user, userProfile, loading, refreshUserProfile };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};