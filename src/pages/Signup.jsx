import { useState } from 'react';
import { Link } from 'react-router-dom';
import { registerUser } from '../firebase/auth';

function Signup() {
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'ذكر',
    subject: '',
    grade: 'أولى ابتدائي',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { email, password, ...rest } = formData;
      const userData = { ...rest, role, email };
      
      // Remove irrelevant fields
      if (role === 'student') delete userData.subject;
      if (role === 'teacher') delete userData.grade;

      await registerUser(email, password, userData);
      // App.jsx will handle redirect automatically based on the role
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء إنشاء الحساب. تأكد من صحة البيانات وأن البريد غير مستخدم مسبقاً.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container fade-in">
      <div className="glass-card auth-card" style={{ maxWidth: '550px' }}>
        <div className="logo-container">
          <img src="/logo.jpeg" alt="روضة ومدرسة دير ريفا" className="logo-img" style={{ width: '90px', height: '90px' }} />
        </div>
        <h2 className="title">إنشاء حساب جديد</h2>
        <p className="subtitle">انضم إلى منصة مدرسة دير ريفا التعليمة</p>
        
        {/* Role Selector */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
          <button 
            type="button"
            className={`btn ${role === 'student' ? 'btn-primary' : ''}`} 
            style={{ flex: 1, background: role !== 'student' ? 'white' : '', color: role !== 'student' ? 'var(--text-main)' : '', border: '1px solid #e2e8f0' }}
            onClick={() => setRole('student')}
          >
            حساب طالب
          </button>
          <button 
            type="button"
            className={`btn ${role === 'teacher' ? 'btn-primary' : ''}`} 
            style={{ flex: 1, background: role !== 'teacher' ? 'white' : '', color: role !== 'teacher' ? 'var(--text-main)' : '', border: '1px solid #e2e8f0' }}
            onClick={() => setRole('teacher')}
          >
            حساب معلم
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSignup}>
          <div className="dashboard-grid" style={{ gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
              <label className="form-label">الاسم بالكامل</label>
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
            <label className="form-label">رقم الهاتف {role === 'student' ? '(نفس الرقم الذي سيسجله المدرس)' : ''}</label>
            <input type="tel" className="form-input" name="phone" value={formData.phone} onChange={handleChange} required placeholder="مثال: 01012345678" />
          </div>

          {role === 'teacher' ? (
            <div className="form-group fade-in">
              <label className="form-label">التخصص (المادة)</label>
              <input type="text" className="form-input" name="subject" value={formData.subject} onChange={handleChange} required placeholder="مثال: لغة عربية، رياضيات، إنجليزي..." />
            </div>
          ) : (
             <div className="form-group fade-in">
              <label className="form-label">الصف الدراسي</label>
              <select className="form-input select-input" name="grade" value={formData.grade} onChange={handleChange}>
                <option value="KG 1">KG 1</option>
                <option value="KG 2">KG 2</option>
                <option value="أولى ابتدائي">أولى ابتدائي</option>
                <option value="ثانية ابتدائي">ثانية ابتدائي</option>
                <option value="ثالثة ابتدائي">ثالثة ابتدائي</option>
                <option value="رابعة ابتدائي">رابعة ابتدائي</option>
                <option value="خامسة ابتدائي">خامسة ابتدائي</option>
                <option value="سادسة ابتدائي">سادسة ابتدائي</option>
              </select>
            </div>
          )}

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
