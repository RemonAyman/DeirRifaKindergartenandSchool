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

  // Modal State
  const [activeMaterial, setActiveMaterial] = useState(null);

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

  // Parse URLs to iframe-friendly embed URLs
  const getEmbedUrl = (url, type) => {
    try {
      if (type === 'youtube') {
        let videoId = '';
        if (url.includes('youtu.be/')) {
          videoId = url.split('youtu.be/')[1].split('?')[0];
        } else if (url.includes('v=')) {
          videoId = url.split('v=')[1].split('&')[0];
        } else if (url.includes('embed/')) {
          return url; // Already an embed URL
        }
        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
      } else if (type === 'gdrive') {
        if (url.includes('drive.google.com') && url.includes('/view')) {
          return url.replace('/view', '/preview'); // Google Drive viewer format
        }
        return url;
      }
    } catch(e) {
      console.log(e);
      return url;
    }
    return url;
  };

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
              لا توجد ملفات أو فيديوهات مرفوعة لك حالياً.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {filteredMaterials.map(mat => {
                 const t = teachers.find(teacher => teacher.uid === mat.teacherId);
                 const isVideo = mat.fileType === 'youtube';
                 return (
                   <div key={mat.id} className="glass-card fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                       <div>
                         <h3 style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.2rem' }}>{mat.title}</h3>
                         <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>أ. {t?.name} - {t?.subject}</span>
                       </div>
                       <span style={{ 
                         background: isVideo ? '#dbeafe' : '#fee2e2', 
                         color: isVideo ? '#3b82f6' : '#ef4444', 
                         padding: '4px 10px', 
                         borderRadius: '8px', 
                         fontSize: '0.8rem', 
                         fontWeight: 'bold' 
                       }}>
                         {isVideo ? 'فيديو' : 'ملف PDF'}
                       </span>
                     </div>
                     
                     <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                       <button 
                         onClick={() => setActiveMaterial(mat)}
                         className="btn btn-secondary" 
                         style={{ width: '100%', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                       >
                         {isVideo ? '▶ مشاهدة الفيديو' : '👁️ فتح الملف والقراءة'}
                       </button>
                     </div>
                   </div>
                 );
              })}
            </div>
          )}
        </>
      )}

      {/* Embedded Material Modal */}
      {activeMaterial && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <div className="glass-card fade-in" style={{ width: '100%', maxWidth: '900px', height: '85vh', display: 'flex', flexDirection: 'column', position: 'relative', padding: '1rem' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
              <h2 style={{ color: 'var(--primary)', margin: 0, fontSize: '1.3rem' }}>{activeMaterial.title}</h2>
              <button 
                onClick={() => setActiveMaterial(null)}
                className="btn btn-primary"
                style={{ background: 'var(--danger)', color: 'white', padding: '8px 16px', borderRadius: '8px' }}
              >
                إغلاق ✕
              </button>
            </div>
            
            <div style={{ flex: 1, position: 'relative', background: '#f8fafc', borderRadius: '12px', overflow: 'hidden' }}>
              <iframe 
                src={getEmbedUrl(activeMaterial.fileUrl, activeMaterial.fileType)} 
                title={activeMaterial.title}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>

            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <a href={activeMaterial.fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-light)', fontSize: '0.9rem', textDecoration: 'underline' }}>
                في حال وجود مشكلة في العرض، اضغط هنا لفتح الرابط في صفحة جديدة
              </a>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default StudentDashboard;
