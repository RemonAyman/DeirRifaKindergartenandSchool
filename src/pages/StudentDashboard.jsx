import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../firebase/auth';
import { getUserDetails, getStudentTeachersByPhone, getMaterialsByGrade } from '../firebase/db';

function StudentDashboard({ user }) {
  const [studentInfo, setStudentInfo] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const info = await getUserDetails(user.uid);
        setStudentInfo(info);
        
        if (info && info.phone) {
          const matchedTeachers = await getStudentTeachersByPhone(info.phone);
          setTeachers(matchedTeachers);
          
          const teacherIds = matchedTeachers.map(t => t.uid);
          const mats = await getMaterialsByGrade(teacherIds, info.grade);
          setMaterials(mats);
        }
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

  const filteredMaterials = selectedTeacherId === 'all' 
    ? materials 
    : materials.filter(m => m.teacherId === selectedTeacherId);

  if (loading) {
    return <div className="loader-container"><div className="loader"></div></div>;
  }

  return (
    <div className="page-container fade-in">
      <header className="dashboard-header" style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: 'white' }}>
        <div className="header-user-info">
          <img src="/logo.jpeg" alt="Logo" style={{ width: 50, height: 50, borderRadius: '50%', border: '2px solid white' }} />
          <div>
            <div className="name" style={{ color: 'white' }}>أهلاً بك، {studentInfo?.name}</div>
            <div style={{ color: '#e0f2fe', fontSize: '0.9rem' }}>{studentInfo?.grade} | منصة الطالب</div>
          </div>
        </div>
        <button onClick={handleLogout} className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
          تسجيل الخروج
        </button>
      </header>

      {teachers.length === 0 ? (
         <div className="glass-card fade-in" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
           <h2 style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>لم يتم إضافتك في صفوف أي معلم بعد!</h2>
           <p style={{ color: 'var(--text-light)', fontSize: '1.1rem' }}>يجب على معلمك إضافة اسمك ورقم هاتفك ({studentInfo?.phone}) في لوحته لتتمكن من رؤية الفيديوهات والشروحات.</p>
         </div>
      ) : (
        <>
          {/* Teacher Filters */}
          <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '1rem' }}>
            <button 
              className={`btn ${selectedTeacherId === 'all' ? 'btn-primary' : ''}`}
              style={{ background: selectedTeacherId !== 'all' ? 'white' : '', color: selectedTeacherId !== 'all' ? 'var(--text-main)' : '', whiteSpace: 'nowrap' }}
              onClick={() => setSelectedTeacherId('all')}
            >
              جميع المواد ({materials.length})
            </button>
            {teachers.map(t => (
               <button 
                 key={t.uid}
                 className={`btn ${selectedTeacherId === t.uid ? 'btn-secondary' : ''}`}
                 style={{ background: selectedTeacherId !== t.uid ? 'white' : '', color: selectedTeacherId !== t.uid ? 'var(--text-main)' : '', whiteSpace: 'nowrap' }}
                 onClick={() => setSelectedTeacherId(t.uid)}
               >
                 أ. {t.name} ({t.subject})
               </button>
            ))}
          </div>

          {/* Materials Grid */}
          {filteredMaterials.length === 0 ? (
            <div className="glass-card fade-in" style={{ textAlign: 'center', color: 'var(--text-light)', padding: '3rem' }}>
              لا توجد ملفات أو فيديوهات مرفوعة لك حالياً من هذا المعلم.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {filteredMaterials.map(mat => {
                 const t = teachers.find(teacher => teacher.uid === mat.teacherId);
                 const isPdf = mat.fileType === 'application/pdf';
                 return (
                   <div key={mat.id} className="glass-card fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                       <div>
                         <h3 style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.2rem' }}>{mat.title}</h3>
                         <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>أ. {t?.name} - {t?.subject}</span>
                       </div>
                       <span style={{ 
                         background: isPdf ? '#fee2e2' : '#dbeafe', 
                         color: isPdf ? '#ef4444' : '#3b82f6', 
                         padding: '4px 10px', 
                         borderRadius: '8px', 
                         fontSize: '0.8rem', 
                         fontWeight: 'bold' 
                       }}>
                         {isPdf ? 'ملف PDF' : 'فيديو'}
                       </span>
                     </div>
                     
                     <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                       <a 
                         href={mat.fileUrl} 
                         target="_blank" 
                         rel="noopener noreferrer" 
                         className="btn btn-secondary" 
                         style={{ width: '100%', textAlign: 'center' }}
                       >
                         {isPdf ? 'فتح الملف وقراءته' : 'مشاهدة الفيديو'}
                       </a>
                     </div>
                   </div>
                 );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default StudentDashboard;
