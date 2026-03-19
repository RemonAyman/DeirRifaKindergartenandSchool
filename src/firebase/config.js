import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA1tNRvUMiBP12AbrcHZi9FbzeoQ-qjzSU",
  authDomain: "deirrifakindergartenandschool.firebaseapp.com",
  projectId: "deirrifakindergartenandschool",
  storageBucket: "deirrifakindergartenandschool.firebasestorage.app",
  messagingSenderId: "442306793638",
  appId: "1:442306793638:web:3349ecf49fcfaae0376467",
  measurementId: "G-0VXVKVZ3R6"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
