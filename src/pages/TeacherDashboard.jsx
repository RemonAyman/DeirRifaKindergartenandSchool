import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../firebase/auth';
import { addStudent, getTeacherStudents, getUserDetails, addMaterialToDB, getTeacherMaterials } from '../firebase/db';

function TeacherDashboard({ user }) {
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [activeTab, setActiveTab] = useState('students');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Student Form
  const [studentForm, setStudentForm] = useState({ studentName: '', grade: 'أولى ابتدائي', dob: '', phone: '' });
  const [addingStudent, setAddingStudent] = useState(false);

  // Material Form
  const [materialForm, setMaterialForm] = useState({ title: '', targetGrade: 'أولى ابتدائي', fileUrl: '', fileType: 'youtube' });
  const [addingMaterial, setAddingMaterial] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const info = await getUserDetails(user.uid);
        setTeacherInfo(info);
        const stList = await getTeacherStudents(user.uid);
        setStudents(stList);
        const matList = await getTeacherMaterials(user.uid);
        setMaterials(matList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setAddingStudent(true);
    try {
      await addStudent({
        ...studentForm,
        teacherId: user.uid,
        teacherName: teacherInfo?.name || "غير معروف"
      });
      const stList = await getTeacherStudents(user.uid);
      setStudents(stList);
      setStudentForm({ studentName: '', grade: 'أولى ابتدائي', dob: '', phone: '' });
      alert("تمت إضافة التلميذ بنجاح!");
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء الإضافة.");
    } finally {
      setAddingStudent(false);
    }
  };

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    if (!materialForm.fileUrl) return alert("الرجاء وضع الرابط!");
    
    setAddingMaterial(true);
    try {
      await addMaterialToDB({
        teacherId: user.uid,
        title: materialForm.title,
        targetGrade: materialForm.targetGrade,
        fileUrl: materialForm.fileUrl,
        fileType: materialForm.fileType
      });
      const matList = await getTeacherMaterials(user.uid);
      setMaterials(matList);
      setMaterialForm({ title: '', targetGrade: 'أولى ابتدائي', fileUrl: '', fileType: 'youtube' });
      alert("تم إضافة الدرس بنجاح!");
    } catch (err) {
      console.error(err);
      alert("حدث خطأ في الإضافة.");
    } finally {
      setAddingMaterial(false);
    }
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
            <div style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>التخصص: {teacherInfo?.subject || 'مدرس'}</div>
          </div>
        </div>
        <button onClick={handleLogout} className="btn" style={{ background: '#fee2e2', color: 'var(--danger)' }}>
          تسجيل الخروج
        </button>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          className={`btn ${activeTab === 'students' ? 'btn-primary' : ''}`} 
          style={{ background: activeTab !== 'students' ? 'white' : '', color: activeTab !== 'students' ? 'var(--text-main)' : '' }}
          onClick={() => setActiveTab('students')}
        >
          قائمة التلاميذ ({students.length})
        </button>
        <button 
          className={`btn ${activeTab === 'materials' ? 'btn-secondary' : ''}`} 
          style={{ background: activeTab !== 'materials' ? 'white' : '', color: activeTab !== 'materials' ? 'var(--text-main)' : '' }}
          onClick={() => setActiveTab('materials')}
        >
          الدروس والفيديوهات ({materials.length})
        </button>
      </div>

      <div className="dashboard-grid">
        {activeTab === 'students' ? (
          <>
            <div className="glass-card">
              <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)', borderBottom: '2px solid var(--bg-gradient-1)', paddingBottom: '0.5rem' }}>إضافة تلميذ جديد</h3>
              <form onSubmit={handleAddStudent}>
                <div className="form-group">
                  <label className="form-label">اسم التلميذ (الرباعي)</label>
                  <input type="text" className="form-input" value={studentForm.studentName} onChange={e => setStudentForm({...studentForm, studentName: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">الصف الدراسي</label>
                  <select className="form-input select-input" value={studentForm.grade} onChange={e => setStudentForm({...studentForm, grade: e.target.value})} required>
                    <option value="KG 1">KG 1</option><option value="KG 2">KG 2</option><option value="أولى ابتدائي">أولى ابتدائي</option><option value="ثانية ابتدائي">ثانية ابتدائي</option><option value="ثالثة ابتدائي">ثالثة ابتدائي</option><option value="رابعة ابتدائي">رابعة ابتدائي</option><option value="خامسة ابتدائي">خامسة ابتدائي</option><option value="سادسة ابتدائي">سادسة ابتدائي</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">تاريخ الميلاد</label>
                  <input type="date" className="form-input" value={studentForm.dob} onChange={e => setStudentForm({...studentForm, dob: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">رقم الهاتف (نفس اللي هيسجل بيه الطالب)</label>
                  <input type="tel" className="form-input" value={studentForm.phone} onChange={e => setStudentForm({...studentForm, phone: e.target.value})} required />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={addingStudent}>
                  {addingStudent ? 'جاري الإضافة...' : 'حفظ بيانات التلميذ'}
                </button>
              </form>
            </div>
            <div>
              <h2 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>سجل تلاميذك</h2>
              {students.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', color: 'var(--text-light)' }}>لم تقم بإضافة تلاميذ بعد.</div>
              ) : (
                <div className="table-container fade-in">
                  <table className="data-table">
                    <thead><tr><th>الاسم</th><th>الصف</th><th>الميلاد</th><th>رقم الهاتف</th></tr></thead>
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
          </>
        ) : (
           <>
            <div className="glass-card fade-in" style={{ borderColor: 'var(--secondary)' }}>
              <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)', borderBottom: '2px solid var(--bg-gradient-1)', paddingBottom: '0.5rem' }}>إضافة درس (يوتيوب أو جوجل درايف)</h3>
              <form onSubmit={handleAddMaterial}>
                <div className="form-group">
                  <label className="form-label">عنوان الدرس</label>
                  <input type="text" className="form-input" value={materialForm.title} onChange={e => setMaterialForm({...materialForm, title: e.target.value})} required placeholder="مثال: الدرس الأول - الرياضيات" />
                </div>
                
                <div className="form-group">
                  <label className="form-label">الصف الدراسي المستهدف</label>
                  <select className="form-input select-input" value={materialForm.targetGrade} onChange={e => setMaterialForm({...materialForm, targetGrade: e.target.value})} required>
                    <option value="KG 1">KG 1</option><option value="KG 2">KG 2</option><option value="أولى ابتدائي">أولى ابتدائي</option><option value="ثانية ابتدائي">ثانية ابتدائي</option><option value="ثالثة ابتدائي">ثالثة ابتدائي</option><option value="رابعة ابتدائي">رابعة ابتدائي</option><option value="خامسة ابتدائي">خامسة ابتدائي</option><option value="سادسة ابتدائي">سادسة ابتدائي</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">نوع الرابط</label>
                  <select className="form-input select-input" value={materialForm.fileType} onChange={e => setMaterialForm({...materialForm, fileType: e.target.value})} required>
                    <option value="youtube">فيديو من يوتيوب (YouTube)</option>
                    <option value="gdrive">ملف من جوجل درايف (Google Drive PDF)</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">رابط الدرس (اللينك)</label>
                  <input type="url" className="form-input" dir="ltr" value={materialForm.fileUrl} onChange={e => setMaterialForm({...materialForm, fileUrl: e.target.value})} required placeholder="https://..." />
                  <p style={{ color: 'var(--text-light)', fontSize: '0.8rem', marginTop: '0.5rem' }}>انسخ رابط الفيديو من يوتيوب أو ملف درايف وضعه هنا.</p>
                </div>

                <button type="submit" className="btn btn-secondary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={addingMaterial}>
                  {addingMaterial ? 'جاري الإضافة...' : 'إضافة الدرس الآن'}
                </button>
              </form>
            </div>
            
            <div>
              <h2 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>سجل الشروحات المضافة</h2>
              {materials.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', color: 'var(--text-light)' }}>لم تقم بإضافة أي دروس بعد.</div>
              ) : (
                <div className="table-container fade-in">
                  <table className="data-table">
                    <thead><tr><th>عنوان الدرس</th><th>النوع</th><th>الصف</th></tr></thead>
                    <tbody>
                      {materials.map(m => {
                         const isVideo = m.fileType === 'youtube';
                         return (
                          <tr key={m.id}>
                            <td style={{ fontWeight: '600' }}><a href={m.fileUrl} target="_blank" rel="noopener noreferrer" style={{textDecoration: 'none', color: 'var(--primary)'}}>{m.title}</a></td>
                            <td>
                               <span style={{ background: isVideo ? '#dbeafe' : '#fee2e2', color: isVideo ? '#3b82f6' : '#ef4444', padding: '4px 8px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                 {isVideo ? 'فيديو يوتيوب' : 'جوجل درايف'}
                               </span>
                            </td>
                            <td><span style={{ background: 'var(--bg-gradient-1)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.85rem' }}>{m.targetGrade}</span></td>
                          </tr>
                         );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default TeacherDashboard;
