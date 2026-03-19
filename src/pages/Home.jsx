import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="fade-in" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Navbar */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        background: 'var(--surface)',
        backdropFilter: 'blur(12px)',
        boxShadow: 'var(--shadow)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src="/logo.jpeg" alt="Logo" style={{ width: 50, height: 50, borderRadius: '50%', border: '2px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
          <h1 style={{ color: 'var(--primary)', fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>مدرسة دير ريفا</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/login" className="btn" style={{ border: '2px solid var(--primary)', color: 'var(--primary)', background: 'transparent' }}>تسجيل الدخول</Link>
          <Link to="/signup" className="btn btn-primary">إنشاء حساب</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div className="glass-card" style={{ maxWidth: '800px', width: '100%', padding: '3rem 2rem' }}>
          <img src="/hero.jpeg" alt="مدرسة دير ريفا" className="hero-img" style={{
            maxWidth: '100%',
            height: 'auto',
            borderRadius: '20px',
            marginBottom: '2rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }} />
          <h2 style={{ fontSize: '2.5rem', color: 'var(--text-main)', marginBottom: '1rem', fontWeight: 800 }}>
            مرحباً بكم في <span style={{ color: 'var(--primary)' }}>روضة ومدرسة دير ريفا الابتدائية</span>
          </h2>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-light)', marginBottom: '2rem', lineHeight: 1.8 }}>
            منصتنا التعليمية المتكاملة لربط إدارة المدرسة، بالمعلمين، وأبنائنا الطلاب.
            نوفر بيئة تعليمية ذكية، توفر لطلابنا الوصول لدروسهم، وللمعلمين أدوات سهلة لإدارة الفصول ورفع المواد التعليمية.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" className="btn btn-secondary" style={{ fontSize: '1.1rem', padding: '1rem 2.5rem' }}>ابدأ الآن كطالب أو معلم</Link>
          </div>
        </div>
      </main>
      
      <footer style={{
        textAlign: 'center',
        padding: '1.5rem',
        color: 'var(--text-light)',
        fontWeight: 600
      }}>
        &copy; {new Date().getFullYear()} روضة ومدرسة دير ريفا الابتدائية. جميع الحقوق محفوظة.
      </footer>
    </div>
  );
}

export default Home;
