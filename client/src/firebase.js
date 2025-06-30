// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAhGWjNvpOjISruTASPawuiG5QvKIosD1Y",
  authDomain: "arabic-blog-98816.firebaseapp.com",
  projectId: "arabic-blog-98816",
  storageBucket: "arabic-blog-98816.firebasestorage.app",
  messagingSenderId: "296497450422",
  appId: "1:296497450422:web:4c0f7675f213bb575e8517",
  measurementId: "G-JKJ6X9S6P0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
export { auth };
