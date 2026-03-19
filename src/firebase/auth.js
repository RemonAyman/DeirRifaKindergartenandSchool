import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./config";

export const registerTeacher = async (email, password, teacherData) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  const role = email === 'admin@gmail.com' ? 'admin' : 'teacher';

  // Save details in Firestore "users" collection
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    role: role,
    ...teacherData,
    createdAt: new Date().toISOString()
  });
  
  return user;
};

export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const logoutUser = async () => {
  await signOut(auth);
};

export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, callback);
};
