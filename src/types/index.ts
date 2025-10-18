// src/types/index.ts

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
  role: 'membro' | 'admin' | 'pastor';
  igrejaId?: string;
  igrejaNome?: string;
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

// Interface para um usuário na lista de "Conectar" (vamos usar UserProfile)
// export interface AppUser {
//   uid: string;
//   nome: string; 
//   foto: string | null; // Usando 'foto' aqui
//   email: string;
//   // Adicione qualquer outra informação que você queira exibir
// }

// Você pode remover a interface AppUser se UserProfile já tem tudo que você precisa,
// e apenas usar UserProfile em ConectarPage e UserList.
// No AuthContext, usei UserProfile diretamente, então vamos manter a consistência.