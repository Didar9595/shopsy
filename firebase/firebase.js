// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "real-estate-web-a2ffd.firebaseapp.com",
  projectId: "real-estate-web-a2ffd",
  storageBucket: "real-estate-web-a2ffd.appspot.com",
  messagingSenderId: "559694910179",
  appId: "1:559694910179:web:56db76e331d275ca46ebd6"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);