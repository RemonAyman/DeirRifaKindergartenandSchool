import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../firebase/auth';
import { addStudent, getTeacherStudents, getUserDetails } from '../firebase/db';

function TeacherDashboard({ user }) {
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    studentName: '',
    grade: 'أولى ابتدائي',
    dob: '',
    phone: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const info = await getUserDetails(user.uid);
        setTeacherInfo(info);
        const stList = await getTeacherStudents(user.uid);
        setStudents(stList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addStudent({
        ...formData,
        teacherId: user.uid,
        teacherName: teacherInfo?.name || "غير معروف"
      });
      // Refresh list
      const stList = await getTeacherStudents(user.uid);
      setStudents(stList);
      setFormData({ studentName: '', grade: 'أولى ابتدائي', dob: '', phone: '' });
      alert("تمت إضافة التلميذ بنجاح!");
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء الإضافة.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  if (loading) {
    return <div className="loader-container"><div className="loader"></div></div>;
  }

  return (
    <div className="page-container fade-in">
      <header className="dashboard-header">
        <div className="header-user-info">
          <img src="/logo.jpeg" alt="Logo" style={{ width: 50, height: 50, borderRadius: '50%' }} />
          <div>
            <div className="name">أهلاً بك، أ. {teacherInfo?.name}</div>
            <div style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>لوحة تحكم المعلم</div>
          </div>
        </div>
        <button onClick={handleLogout} className="btn" style={{ background: '#fee2e2', color: 'var(--danger)' }}>
          تسجيل الخروج
        </button>
      </header>

      <div className="dashboard-grid">
        <div className="glass-card">
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)', borderBottom: '2px solid var(--bg-gradient-1)', paddingBottom: '0.5rem' }}>إضافة تلميذ جديد</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">اسم التلميذ (الرباعي)</label>
              <input type="text" className="form-input" name="studentName" value={formData.studentName} onChange={handleChange} required />
            </div>
            
            <div className="form-group">
              <label className="form-label">الصف الدراسي</label>
              <select className="form-input select-input" name="grade" value={formData.grade} onChange={handleChange} required>
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

            <div className="form-group">
              <label className="form-label">تاريخ الميلاد</label>
              <input type="date" className="form-input" name="dob" value={formData.dob} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">رقم الهاتف (ولي الأمر)</label>
              <input type="tel" className="form-input" name="phone" value={formData.phone} onChange={handleChange} required />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
              {submitting ? 'جاري الإضافة...' : 'حفظ بيانات التلميذ'}
            </button>
          </form>
        </div>

        <div>
          <h2 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>قائمة تلاميذك المسجلين ({students.length})</h2>
          {students.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', color: 'var(--text-light)' }}>
              لم تقم بإضافة أي تلاميذ بعد.
            </div>
          ) : (
             <div className="table-container fade-in">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>الاسم</th>
                    <th>الصف</th>
                    <th>تاريخ الميلاد</th>
                    <th>رقم الهاتف</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(st => (
                    <tr key={st.id}>
                      <td style={{ fontWeight: '600' }}>{st.studentName}</td>
                      <td><span style={{ background: 'var(--bg-gradient-1)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.85rem' }}>{st.grade}</span></td>
                      <td dir="ltr" style={{ textAlign: 'right' }}>{st.dob}</td>
                      <td dir="ltr" style={{ textAlign: 'right' }}>{st.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;
