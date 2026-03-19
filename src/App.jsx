import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { subscribeToAuthChanges } from './firebase/auth';
import Login from './pages/Login';
import Signup from './pages/Signup';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="loader-container"><div className="loader"></div></div>;
  }

  const isAdmin = user && user.email === 'admin@gmail.com';

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            !user ? <Login /> : 
            isAdmin ? <Navigate to="/admin" /> : 
            <Navigate to="/teacher" />
          } 
        />
        <Route 
          path="/login" 
          element={!user ? <Login /> : <Navigate to="/" />} 
        />
        <Route 
          path="/signup" 
          element={!user ? <Signup /> : <Navigate to="/" />} 
        />
        <Route 
          path="/teacher" 
          element={
            user && !isAdmin ? <TeacherDashboard user={user} /> : <Navigate to={isAdmin ? "/admin" : "/login"} />
          } 
        />
        <Route 
          path="/admin" 
          element={
            isAdmin ? <AdminDashboard /> : <Navigate to={user ? "/teacher" : "/login"} />
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
