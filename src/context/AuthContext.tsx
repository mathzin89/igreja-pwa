// src/contexts/AuthContext.tsx
"use client";

import React, { useState, useEffect, useContext, createContext, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/firebaseConfig';
import { UserProfile, Igreja } from '@/types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  refreshUserProfile: () => void;
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
      let profileData: UserProfile; // Declare profileData como mutável

      if (userDoc.exists()) {
        profileData = userDoc.data() as UserProfile; // Atribua os dados existentes

        // ✅ CORREÇÃO AQUI: BUSQUE O NOME DA IGREJA E ATRIBUA A 'igrejaNome', NÃO SOBRESCREVA 'igrejaId'
        if (profileData.igrejaId) {
          const igrejaDocRef = doc(db, 'igrejas', profileData.igrejaId);
          const igrejaDoc = await getDoc(igrejaDocRef);
          if (igrejaDoc.exists()) {
            profileData.igrejaNome = (igrejaDoc.data() as Igreja).nome; // Atribua a igrejaNome
            // Não faça mais nada com profileData.igrejaId aqui
          }
        }
        
        setUserProfile(profileData); // Defina o perfil COM o nome da igreja
      } else {
        // Se o perfil não existe, cria um perfil básico no Firestore
        const newProfile: UserProfile = {
          uid: currentUser.uid,
          email: currentUser.email || '',
          nome: currentUser.displayName || currentUser.email?.split('@')[0] || '',
          foto: currentUser.photoURL || null, // Use null para foto se não houver
          createdAt: new Date().toISOString(),
          role: 'membro', // Padrão
        };
        await setDoc(userDocRef, newProfile);
        setUserProfile(newProfile);
        console.log("Perfil básico criado para novo usuário:", currentUser.uid);
      }
    } catch (error) {
      console.error("Erro ao buscar/criar perfil do usuário:", error);
      setUserProfile(null);
    }
  }, []); // Dependências do useCallback, que é apenas o db e auth (que são estáveis)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(true); // Começa a carregar o perfil
        await fetchOrCreateUserProfile(currentUser);
        setLoading(false); // Termina de carregar o perfil
      } else {
        setUser(null);
        setUserProfile(null);
        setLoading(false); // Não há usuário, então não está carregando
      }
    });
    return () => unsubscribe();
  }, [fetchOrCreateUserProfile]); // Dependências do useEffect

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