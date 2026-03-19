import { collection, addDoc, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "./config";

// --- Students Management for Teacher ---
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

// --- Users Management ---
export const getAllUsers = async () => {
  const usersRef = collection(db, "users");
  const querySnapshot = await getDocs(usersRef);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getAllStudents = async () => {
  const studentsRef = collection(db, "students");
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

// --- Materials and Storage ---
export const uploadMaterialFile = (file, path, onProgress, onError, onSuccess) => {
  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, file);

  uploadTask.on(
    "state_changed",
    (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      if(onProgress) onProgress(progress);
    },
    (error) => {
      if(onError) onError(error);
      console.error(error);
    },
    async () => {
      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
      if(onSuccess) onSuccess(downloadURL);
    }
  );
};

export const addMaterialToDB = async (materialData) => {
  const materialsRef = collection(db, "materials");
  const docRef = await addDoc(materialsRef, {
    ...materialData,
    createdAt: new Date().toISOString()
  });
  return docRef.id;
};

export const getTeacherMaterials = async (teacherId) => {
  const materialsRef = collection(db, "materials");
  const q = query(materialsRef, where("teacherId", "==", teacherId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getMaterialsByGrade = async (teacherIds, grade) => {
  if (teacherIds.length === 0) return [];
  // Note: in Firestore, 'in' query supports up to 10 array values.
  // For simplicity, we query all for grade, and filter in JS if more than 10.
  // But doing a direct query where teacherId in teacherIds works if <=10.
  // Let's just fetch by grade and filter manually to be completely safe and avoid limits.
  const materialsRef = collection(db, "materials");
  const q = query(materialsRef, where("targetGrade", "==", grade));
  const querySnapshot = await getDocs(q);
  
  const allMaterials = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return allMaterials.filter(m => teacherIds.includes(m.teacherId));
};

export const getStudentTeachersByPhone = async (studentPhone) => {
  const studentsRef = collection(db, "students");
  const q = query(studentsRef, where("phone", "==", studentPhone));
  const querySnapshot = await getDocs(q);
  
  const records = querySnapshot.docs.map(doc => doc.data());
  // Get unique teacher IDs
  const teacherIds = [...new Set(records.map(r => r.teacherId))];
  
  if (teacherIds.length === 0) return [];

  // Now fetch teacher details from users collection
  const usersRef = collection(db, "users");
  // Again, fetch all and filter in JS to avoid 'in' limitations if there are many.
  // We can query specific ones but in a small school it's fine.
  const teachersQuery = query(usersRef, where("role", "==", "teacher"));
  const teachersSnap = await getDocs(teachersQuery);
  const allTeachers = teachersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  return allTeachers.filter(t => teacherIds.includes(t.uid));
};
