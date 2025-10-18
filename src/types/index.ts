// src/types/index.ts

import { Timestamp } from 'firebase/firestore'; // Importe Timestamp diretamente

// Mantenha suas interfaces existentes, e adicione/ajuste estas:

// Interface para o perfil do usuário
export interface UserProfile {
  uid: string;
  email: string;
  nome: string;
  foto?: string | null; // Usando 'foto' aqui
  bio?: string;
  createdAt: string; // ISO string
  updatedAt?: string; // ISO string
  role?: string; // ✅ Adicionado/Confirmado
  igrejaId?: string; // ✅ Adicionado/Confirmado
  igrejaNome?: string; // ✅ Adicionado/Confirmado (para guardar o nome da igreja)
  // Adicione outros campos conforme necessário
  ministries?: string[];
  phone?: string;
  dataNascimento?: string;
  dataMembroDesde?: string; // ISO string ou 'YYYY-MM-DD'
  // Outros campos...
}

// Interface para o doc de amizade
export interface Friendship {
  id: string; // ID do documento da amizade
  users: [string, string]; // Array com os UIDs dos dois usuários envolvidos
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  initiatedBy: string; // UID do usuário que iniciou a amizade
  createdAt: string; // ISO string
  updatedAt?: string; // ISO string
}
// Nova interface para a Igreja
export interface Igreja {
  id: string; // O ID do documento da igreja no Firestore
  nome: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  // Adicione outros campos da igreja que você possa ter no Firestore
  pastorPrincipalUid?: string; // UID do pastor principal
  fundacao?: string; // Data de fundação (ISO string)
}
export interface FinancasLancamento {
  id: string; // ID do documento Firestore
  categoria: string;
  data: string; // Formato DD/MM/YYYY (ATENÇÃO: para ordenação, considere um Timestamp)
  descricao?: string; // Opcional
  membroId?: string; // Opcional, ID do membro
  membroNome?: string; // Adicionado no frontend após busca
  tipo: 'entrada' | 'saida';
  valor: number;
  registradoPor?: string; // UID de quem registrou
  registradoEm?: Timestamp; // ✅ Usar Timestamp do Firestore diretamente
    dataParsed?: Date | null;

}

export interface Membro {
    id: string;
    nome: string;
    // Adicione outros campos que você tenha na coleção 'membros'
}