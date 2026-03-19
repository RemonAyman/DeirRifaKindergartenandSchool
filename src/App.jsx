import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { subscribeToAuthChanges } from './firebase/auth';
import { getUserDetails } from './firebase/db';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = subscribeToAuthChanges(async (currentUser) => {
      if (!isMounted) return;
      
      setUser(currentUser);
      if (currentUser) {
        if (currentUser.email === 'admin@gmail.com') {
          setUserDetails({ role: 'admin' });
          setLoading(false);
        } else {
          try {
            const data = await getUserDetails(currentUser.uid);
            if (isMounted) setUserDetails(data || { role: 'student' }); // fallback
          } catch(e) {
            if (isMounted) setUserDetails({ role: 'student' });
          } finally {
            if (isMounted) setLoading(false);
          }
        }
      } else {
        if (isMounted) {
          setUserDetails(null);
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  if (loading) {
    return <div className="loader-container"><div className="loader"></div></div>;
  }

  const role = userDetails?.role;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        
        <Route 
          path="/login" 
          element={
            !user ? <Login /> : 
            role === 'admin' ? <Navigate to="/admin" /> : 
            role === 'teacher' ? <Navigate to="/teacher" /> :
            <Navigate to="/student" />
          } 
        />
        
        <Route 
          path="/signup" 
          element={
            !user ? <Signup /> : 
            role === 'admin' ? <Navigate to="/admin" /> : 
            role === 'teacher' ? <Navigate to="/teacher" /> :
            <Navigate to="/student" />
          } 
        />
        
        <Route 
          path="/teacher" 
          element={
            user && role === 'teacher' ? <TeacherDashboard user={user} /> : <Navigate to="/login" />
          } 
        />
        
        <Route 
          path="/admin" 
          element={
            user && role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />
          } 
        />

        <Route 
          path="/student" 
          element={
            user && role === 'student' ? <StudentDashboard user={user} /> : <Navigate to="/login" />
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
