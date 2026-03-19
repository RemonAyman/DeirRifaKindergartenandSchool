import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../firebase/auth';
import { getAllUsers, getAllStudents } from '../firebase/db';

function AdminDashboard() {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('teachers'); // teachers | students
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const usersList = await getAllUsers();
        // filter out admin if needed or just show all
        const teacherList = usersList.filter(u => u.role === 'teacher');
        setTeachers(teacherList);

        const studentsList = await getAllStudents();
        setStudents(studentsList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  if (loading) {
    return <div className="loader-container"><div className="loader"></div></div>;
  }

  return (
    <div className="page-container fade-in">
      <header className="dashboard-header" style={{ background: 'linear-gradient(135deg, var(--text-main) 0%, #334155 100%)', color: 'white' }}>
        <div className="header-user-info">
          <img src="/logo.jpeg" alt="Logo" style={{ width: 50, height: 50, borderRadius: '50%', border: '2px solid white' }} />
          <div>
            <div className="name" style={{ color: 'white' }}>لوحة تحكم الإدارة</div>
            <div style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>مدير النظام (Admin)</div>
          </div>
        </div>
        <button onClick={handleLogout} className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
          تسجيل الخروج
        </button>
      </header>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          className={`btn ${activeTab === 'teachers' ? 'btn-primary' : ''}`} 
          style={{ background: activeTab !== 'teachers' ? 'white' : '', color: activeTab !== 'teachers' ? 'var(--text-main)' : '' }}
          onClick={() => setActiveTab('teachers')}
        >
          المعلمين ({teachers.length})
        </button>
        <button 
          className={`btn ${activeTab === 'students' ? 'btn-secondary' : ''}`} 
          style={{ background: activeTab !== 'students' ? 'white' : '', color: activeTab !== 'students' ? 'var(--text-main)' : '' }}
          onClick={() => setActiveTab('students')}
        >
          جميع التلاميذ ({students.length})
        </button>
      </div>

      <div className="glass-card fade-in" style={{ padding: '0', overflow: 'hidden' }}>
        {activeTab === 'teachers' ? (
          <div className="table-container" style={{ margin: 0, boxShadow: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>اسم المعلم</th>
                  <th>الجنس</th>
                  <th>رقم الهاتف</th>
                  <th>البريد الإلكتروني</th>
                  <th>تاريخ التسجيل</th>
                  <th>عدد التلاميذ</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map(teacher => {
                  const teacherStudentsCount = students.filter(s => s.teacherId === teacher.uid).length;
                  return (
                    <tr key={teacher.uid}>
                      <td style={{ fontWeight: '600' }}>{teacher.name}</td>
                      <td>{teacher.gender}</td>
                      <td dir="ltr" style={{ textAlign: 'right' }}>{teacher.phone}</td>
                      <td>{teacher.email}</td>
                      <td dir="ltr" style={{ textAlign: 'right' }}>{new Date(teacher.createdAt).toLocaleDateString('ar-EG')}</td>
                      <td>
                        <span style={{ background: 'var(--bg-gradient-2)', color: 'var(--secondary)', padding: '4px 12px', borderRadius: '12px', fontWeight: 'bold' }}>
                          {teacherStudentsCount}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-container" style={{ margin: 0, boxShadow: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>اسم التلميذ</th>
                  <th>الصف</th>
                  <th>المعلم المسؤول</th>
                  <th>تاريخ الميلاد</th>
                  <th>رقم الهاتف</th>
                </tr>
              </thead>
              <tbody>
                {students.map(st => (
                  <tr key={st.id}>
                    <td style={{ fontWeight: '600' }}>{st.studentName}</td>
                    <td><span style={{ background: 'var(--bg-gradient-1)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.85rem' }}>{st.grade}</span></td>
                    <td>{st.teacherName || "غير محدد"}</td>
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
  );
}

export default AdminDashboard;
