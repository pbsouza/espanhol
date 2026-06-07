// config.js

// 1. Configuração do app
const firebaseConfig = {
  apiKey: "AIzaSyCANuYo9tlVN_ok15VvQ3eLEj4xpa4eQ2g",
  authDomain: "gestao-congregacao.firebaseapp.com",
  projectId: "gestao-congregacao",
  storageBucket: "gestao-congregacao.firebasestorage.app",
  messagingSenderId: "610662268093",
  appId: "1:610662268093:web:ff4c262425763a2bfc8bd4"
};

// 2. Inicializa o Firebase
firebase.initializeApp(firebaseConfig);

// 3. Inicializa o Firestore (Banco de Dados) para ficar disponível globalmente
const db = firebase.firestore();