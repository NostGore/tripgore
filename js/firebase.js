
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-analytics.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD9xGNTqaPo2g41YkLowiYnE3Oj_w9e6P8",
  authDomain: "triplegore.firebaseapp.com",
  databaseURL: "https://triplegore-default-rtdb.firebaseio.com",
  projectId: "triplegore",
  storageBucket: "triplegore.firebasestorage.app",
  messagingSenderId: "324310616202",
  appId: "1:324310616202:web:b9db1a6eb90bd0d6de0573",
  measurementId: "G-P9J0XH1QLY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export para usar en otros archivos si es necesario
export { app, analytics };
