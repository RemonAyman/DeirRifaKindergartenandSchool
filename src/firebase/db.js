import { collection, addDoc, getDocs, query, where, doc, getDoc, orderBy } from "firebase/firestore";
import { db } from "./config";

export const addStudent = async (studentData) => {
  const studentsRef = collection(db, "students");
  const docRef = await addDoc(studentsRef, {
    ...studentData,
    createdAt: new Date().toISOString()
  });
  return docRef.id;
};

export const getTeacherStudents = async (teacherId) => {
  const studentsRef = collection(db, "students");
  const q = query(studentsRef, where("teacherId", "==", teacherId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getAllUsers = async () => {
  const usersRef = collection(db, "users");
  const querySnapshot = await getDocs(usersRef);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getAllStudents = async () => {
  const studentsRef = collection(db, "students");
  // Ordering by creation date (needs index or fallback)
  const querySnapshot = await getDocs(studentsRef);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getUserDetails = async (uid) => {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return userSnap.data();
  }
  return null;
};
