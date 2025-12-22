import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDj70hZctkjeRFZvxbGPrA_DCuehPmmjuw",
  authDomain: "movie-clone-intern.firebaseapp.com",
  projectId: "movie-clone-intern",
  storageBucket: "movie-clone-intern.firebasestorage.app",
  messagingSenderId: "362695764166",
  appId: "1:362695764166:web:04d96c8e6316b6c8e6cfc7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
