import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerTeacher } from '../firebase/auth';

function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'ذكر',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { email, password, ...teacherData } = formData;
      await registerTeacher(email, password, { email, ...teacherData });
      // App.jsx will handle redirect
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء إنشاء الحساب. تأكد من صحة البيانات وأن البريد غير مستخدم مسبقاً.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-card auth-card" style={{ maxWidth: '550px' }}>
        <div className="logo-container">
          <img src="/logo.jpeg" alt="روضة ومدرسة دير ريفا" className="logo-img" style={{ width: '90px', height: '90px' }} />
        </div>
        <h2 className="title">إنشاء حساب معلم</h2>
        <p className="subtitle">انضم إلى فريق عمل مدرسة دير ريفا</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSignup}>
          <div className="dashboard-grid" style={{ gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
              <label className="form-label">الاسم الرباعي</label>
              <input type="text" className="form-input" name="name" value={formData.name} onChange={handleChange} required placeholder="أدخل اسمك" />
            </div>
            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
              <label className="form-label">الجنس</label>
              <select className="form-input select-input" name="gender" value={formData.gender} onChange={handleChange}>
                <option value="ذكر">ذكر</option>
                <option value="أنثى">أنثى</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">رقم الهاتف</label>
            <input type="tel" className="form-input" name="phone" value={formData.phone} onChange={handleChange} required placeholder="مثال: 01012345678" />
          </div>

          <div className="form-group">
            <label className="form-label">البريد الإلكتروني (Gmail)</label>
            <input type="email" className="form-input" name="email" value={formData.email} onChange={handleChange} required placeholder="example@gmail.com" />
          </div>
          
          <div className="form-group">
            <label className="form-label">كلمة المرور</label>
            <input type="password" className="form-input" name="password" value={formData.password} onChange={handleChange} required placeholder="لا تقل عن 6 أحرف" />
          </div>
          
          <button type="submit" className="btn btn-secondary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'جاري التسجيل...' : 'إنشاء الحساب'}
          </button>
        </form>
        
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.95rem' }}>
          <span>لديك حساب بالفعل؟ </span>
          <Link to="/login" style={{ color: 'var(--secondary)', fontWeight: 'bold', textDecoration: 'none' }}>تسجيل الدخول</Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;
