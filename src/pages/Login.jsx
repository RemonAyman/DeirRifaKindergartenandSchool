import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../firebase/auth';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginUser(email, password);
      // App.jsx will handle redirect based on role
    } catch (err) {
      if (email === 'admin@gmail.com' && password === '1721kr55') {
         // Auto create admin account if it wasn't made yet to make it easier for user
         try {
             await registerUser(email, password, { name: "مدير النظام", gender: "ذكر", phone: "لا يوجد", role: "admin" });
             return; 
         } catch(createErr) {
             console.log("Admin creation error:", createErr);
         }
      }
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container fade-in">
      <div className="glass-card auth-card">
        <div className="logo-container">
          <img src="/logo.jpeg" alt="روضة ومدرسة دير ريفا" className="logo-img" />
        </div>
        <h2 className="title">تسجيل الدخول</h2>
        <p className="subtitle">مرحباً بك في روضة ومدرسة دير ريفا الابتدائية</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">البريد الإلكتروني</label>
            <input 
              type="email" 
              className="form-input" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="example@gmail.com"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">كلمة المرور</label>
            <input 
              type="password" 
              className="form-input" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="••••••••"
            />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'جاري الدخول...' : 'دخول'}
          </button>
        </form>
        
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.95rem' }}>
          <span>ليس لديك حساب معلم؟ </span>
          <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none' }}>إنشاء حساب جديد</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
