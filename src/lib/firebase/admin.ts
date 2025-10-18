import * as admin from 'firebase-admin';

// Log para verificar se a variável de ambiente está sendo carregada
console.log("admin.ts: Verificando FIREBASE_SERVICE_ACCOUNT_KEY...");
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (serviceAccountKey) {
  console.log("admin.ts: FIREBASE_SERVICE_ACCOUNT_KEY carregada.");
  try {
    const parsedKey = JSON.parse(serviceAccountKey);
    console.log("admin.ts: Project ID da Service Account Key:", parsedKey.project_id);
  } catch (parseError) {
    console.error("admin.ts: Erro ao fazer parse da FIREBASE_SERVICE_ACCOUNT_KEY:", parseError);
  }
} else {
  console.error("admin.ts: ERRO - FIREBASE_SERVICE_ACCOUNT_KEY NÃO CARREGADA!");
}

// Log para verificar outras variáveis de ambiente
console.log("admin.ts: NEXT_PUBLIC_FIREBASE_PROJECT_ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
console.log("admin.ts: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:", process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);

// Verifique se o app admin já foi inicializado para evitar erros em hot-reload
if (!admin.apps.length) {
  console.log("admin.ts: Tentando inicializar Firebase Admin...");
  try {
    if (!serviceAccountKey) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY está vazia. Não é possível inicializar o Firebase Admin.");
    }

    const parsedKey = JSON.parse(serviceAccountKey);

    // ✅ Corrige a chave privada com as quebras de linha reais
    if (parsedKey.private_key) {
      parsedKey.private_key = parsedKey.private_key.replace(/\\n/g, '\n');
    }

    admin.initializeApp({
      credential: admin.credential.cert(parsedKey),
      databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });

    console.log("admin.ts: Firebase Admin inicializado com sucesso!");
  } catch (error: any) {
    if (!/already exists/u.test(error.message)) {
      console.error('admin.ts: ERRO FATAL na inicialização do Firebase Admin:', error.message, error.stack);
      throw new Error(`Falha na inicialização do Firebase Admin: ${error.message}`);
    } else {
      console.log("admin.ts: Firebase Admin já estava inicializado (ignorado).");
    }
  }
} else {
  console.log("admin.ts: Firebase Admin já estava inicializado na inicialização do módulo.");
}

const adminDb = admin.firestore();
const adminAuth = admin.auth();
const adminStorage = admin.storage(); // Descomente se precisar do Admin Storage também

console.log("admin.ts: Exportando adminDb, adminAuth, adminStorage...");

export { adminDb, adminAuth, adminStorage };
