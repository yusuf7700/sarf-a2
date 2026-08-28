// Bu 3 tasi boshidanoq (Natijalar ochilmasdan oldin ham) xavfsiz "null" bo'lib tursin —
// shunda testga javob berilganda script.js xato bermaydi (auth/db hali yuklanmagan bo'lsa ham).
window.auth = window.auth || null;
window.db = window.db || null;
window.googleProvider = window.googleProvider || null;

// Firebase'ni FAQAT foydalanuvchi "Natijalar" bo'limini ochganda yuklaydi.
// Shu bilan ilovaning boshlang'ich ochilishi Firebase yuklanishini kutmaydi —
// sekin internetda ham Boblar/Test/Lug'at darhol ishlayveradi.
window.loadFirebase = function () {
  if (window._fbLoadPromise) return window._fbLoadPromise;

  const firebaseConfig = {
    apiKey: "AIzaSyASl9AwFgfsb-8G97sATL5dBCM-FASgXiA",
    authDomain: "sarf-a2.firebaseapp.com",
    projectId: "sarf-a2",
    storageBucket: "sarf-a2.firebasestorage.app",
    messagingSenderId: "311077927516",
    appId: "1:311077927516:web:eb24f4425d51091ca24499",
    measurementId: "G-W20SYY6F2W"
  };

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Yuklab bo\'lmadi: ' + src));
      document.head.appendChild(s);
    });
  }

  window._fbLoadPromise = loadScript('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js')
    .then(() => Promise.all([
      loadScript('https://www.gstatic.com/firebasejs/10.13.0/firebase-auth-compat.js'),
      loadScript('https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore-compat.js')
    ]))
    .then(() => {
      firebase.initializeApp(firebaseConfig);
      window.auth = firebase.auth();
      window.db = firebase.firestore();
      window.googleProvider = new firebase.auth.GoogleAuthProvider();
      return true;
    })
    .catch(e => {
      console.warn('Firebase ishga tushmadi (internet yoki bloklovchi sabab bo\'lishi mumkin):', e);
      window.auth = null;
      window.db = null;
      window.googleProvider = null;
      return false;
    });

  return window._fbLoadPromise;
};
