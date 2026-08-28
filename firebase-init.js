// Firebase konfiguratsiyasi va ishga tushirish
// (compat SDK — oddiy <script> teglar bilan ishlaydi, build tool kerak emas)
//
// MUHIM: hammasi try/catch ichida va window.* ga yoziladi — shunday qilib,
// Firebase biror sababdan (internet, bloklovchi, va h.k.) yuklanmasa ham,
// script.js xato bermaydi, ilova oddiy (offline) rejimda ishlayveradi.
try {
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
  window.auth = firebase.auth();
  window.db = firebase.firestore();
  window.googleProvider = new firebase.auth.GoogleAuthProvider();
} catch (e) {
  console.warn('Firebase ishga tushmadi (internet yoki bloklovchi sabab bo\'lishi mumkin):', e);
  window.auth = null;
  window.db = null;
  window.googleProvider = null;
}
