// Firebase konfiguratsiyasi va ishga tushirish
// (compat SDK — oddiy <script> teglar bilan ishlaydi, build tool kerak emas)
const firebaseConfig = {
  apiKey: "AIzaSyASl9AwFgfsb-8G97sATL5dBCM-FASgXiA",
  authDomain: "sarf-a2.firebaseapp.com",
  projectId: "sarf-a2",
  storageBucket: "sarf-a2.firebasestorage.app",
  messagingSenderId: "311077927516",
  appId: "1:311077927516:web:eb24f4425d51091ca24499",
  measurementId: "G-W20SYY6F2W"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const googleProvider = new firebase.auth.GoogleAuthProvider();
