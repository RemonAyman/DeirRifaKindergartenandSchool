import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../firebase/auth';
import { addStudent, getTeacherStudents, getUserDetails, uploadMaterialFile, addMaterialToDB, getTeacherMaterials } from '../firebase/db';

function TeacherDashboard({ user }) {
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [activeTab, setActiveTab] = useState('students'); // students | materials
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Student Form
  const [studentForm, setStudentForm] = useState({ studentName: '', grade: 'أولى ابتدائي', dob: '', phone: '' });
  const [addingStudent, setAddingStudent] = useState(false);

  // Material Form
  const [materialForm, setMaterialForm] = useState({ title: '', targetGrade: 'أولى ابتدائي' });
  const [materialFile, setMaterialFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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

  const handleUploadMaterial = async (e) => {
    e.preventDefault();
    if (!materialFile) return alert("الرجاء اختيار ملف!");
    
    setUploading(true);
    setUploadProgress(0);
    
    const filePath = `materials/${user.uid}/${Date.now()}_${materialFile.name}`;
    
    uploadMaterialFile(
      materialFile, 
      filePath, 
      (progress) => setUploadProgress(progress),
      (err) => {
        alert("حدث خطأ في الرفع!");
        setUploading(false);
      },
      async (url) => {
        try {
          await addMaterialToDB({
            teacherId: user.uid,
            title: materialForm.title,
            targetGrade: materialForm.targetGrade,
            fileUrl: url,
            fileType: materialFile.type,
            fileName: materialFile.name
          });
          const matList = await getTeacherMaterials(user.uid);
          setMaterials(matList);
          setMaterialForm({ title: '', targetGrade: 'أولى ابتدائي' });
          setMaterialFile(null);
          alert("تم رفع الملف للطلاب بنجاح!");
        } catch (dbErr) {
          alert("حدث خطأ في تسجيل الملف.");
        } finally {
          setUploading(false);
          setUploadProgress(0);
        }
      }
    );
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
          الملفات والفيديوهات ({materials.length})
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
              <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)', borderBottom: '2px solid var(--bg-gradient-1)', paddingBottom: '0.5rem' }}>رفع فيديو أو كتاب (PDF)</h3>
              <form onSubmit={handleUploadMaterial}>
                <div className="form-group">
                  <label className="form-label">عنوان الدرس أو الملف</label>
                  <input type="text" className="form-input" value={materialForm.title} onChange={e => setMaterialForm({...materialForm, title: e.target.value})} required placeholder="مثال: الدرس الأول - الرياضيات" />
                </div>
                
                <div className="form-group">
                  <label className="form-label">الصف الدراسي المستهدف</label>
                  <select className="form-input select-input" value={materialForm.targetGrade} onChange={e => setMaterialForm({...materialForm, targetGrade: e.target.value})} required>
                    <option value="KG 1">KG 1</option><option value="KG 2">KG 2</option><option value="أولى ابتدائي">أولى ابتدائي</option><option value="ثانية ابتدائي">ثانية ابتدائي</option><option value="ثالثة ابتدائي">ثالثة ابتدائي</option><option value="رابعة ابتدائي">رابعة ابتدائي</option><option value="خامسة ابتدائي">خامسة ابتدائي</option><option value="سادسة ابتدائي">سادسة ابتدائي</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">اختيار الملف (فيديو MP4 أو مستند PDF)</label>
                  <input type="file" accept="video/mp4,application/pdf" className="form-input" style={{ background: 'white' }} onChange={e => setMaterialFile(e.target.files[0])} required />
                  <p style={{ color: 'var(--text-light)', fontSize: '0.8rem', marginTop: '0.5rem' }}>ملاحظة: يمكنك رفع ملفات تصل إلى 100 ميجابايت.</p>
                </div>

                <button type="submit" className="btn btn-secondary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={uploading}>
                  {uploading ? `جاري الرفع... ${Math.round(uploadProgress)}%` : 'رفع الملف الآن'}
                </button>
                
                {uploading && (
                  <div style={{ width: '100%', background: '#f1f5f9', height: '10px', borderRadius: '5px', marginTop: '1rem', overflow:'hidden' }}>
                    <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--secondary)', transition: 'width 0.2s' }}></div>
                  </div>
                )}
              </form>
            </div>
            
            <div>
              <h2 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>سجل الشروحات المرفوعة</h2>
              {materials.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', color: 'var(--text-light)' }}>لم تقم برفع أي شروحات أو ملفات بعد.</div>
              ) : (
                <div className="table-container fade-in">
                  <table className="data-table">
                    <thead><tr><th>عنوان الملف</th><th>النوع</th><th>الصف</th><th>حجم الملف (تخمين)</th></tr></thead>
                    <tbody>
                      {materials.map(m => {
                         const isPdf = m.fileType === 'application/pdf';
                         return (
                          <tr key={m.id}>
                            <td style={{ fontWeight: '600' }}><a href={m.fileUrl} target="_blank" rel="noopener noreferrer" style={{textDecoration: 'none', color: 'var(--primary)'}}>{m.title}</a></td>
                            <td>
                               <span style={{ background: isPdf ? '#fee2e2' : '#dbeafe', color: isPdf ? '#ef4444' : '#3b82f6', padding: '4px 8px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                 {isPdf ? 'ملف PDF' : 'فيديو'}
                               </span>
                            </td>
                            <td><span style={{ background: 'var(--bg-gradient-1)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.85rem' }}>{m.targetGrade}</span></td>
                            <td dir="ltr" style={{ textAlign: 'right' }}>متاح</td>
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
