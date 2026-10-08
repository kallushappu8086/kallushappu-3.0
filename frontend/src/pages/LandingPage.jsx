import { useState } from 'react';
import { api } from '../utils/api';

export default function LandingPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { url } = await api.getDiscordAuthUrl();
      window.location.href = url;
    } catch (err) {
      console.error(err);
      setError('Failed to contact server. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% -10%, #3a0a4a 0%, #1a0525 45%, #08000f 100%)',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Inter', sans-serif"
    }}>

      {/* Background blobs */}
      <div style={{
        position: 'absolute', top: '-15%', left: '50%', transform: 'translateX(-50%)',
        width: '1000px', height: '550px',
        background: 'radial-gradient(ellipse, rgba(170, 30, 220, 0.28) 0%, transparent 68%)',
        filter: 'blur(55px)', pointerEvents: 'none',
        animation: 'blobFloat 8s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute', bottom: '-15%', left: '-8%',
        width: '550px', height: '550px',
        background: 'radial-gradient(circle, rgba(110, 20, 170, 0.18) 0%, transparent 70%)',
        filter: 'blur(80px)', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', top: '20%', right: '-5%',
        width: '420px', height: '420px',
        background: 'radial-gradient(circle, rgba(210, 0, 255, 0.1) 0%, transparent 70%)',
        filter: 'blur(65px)', pointerEvents: 'none'
      }} />

      {/* Floating particles */}
      {[...Array(14)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: `${2 + (i % 4)}px`,
          height: `${2 + (i % 4)}px`,
          borderRadius: '50%',
          background: `rgba(${170 + i * 6}, 70, 255, ${0.25 + (i % 5) * 0.07})`,
          top: `${8 + (i * 6.5) % 84}%`,
          left: `${4 + (i * 7.1) % 92}%`,
          animation: `particleFloat ${4 + (i % 5)}s ease-in-out ${i * 0.4}s infinite`,
          pointerEvents: 'none'
        }} />
      ))}

      {/* ── Top Navigation Bar ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '13px 36px',
        background: 'rgba(8, 0, 16, 0.65)',
        backdropFilter: 'blur(22px)',
        WebkitBackdropFilter: 'blur(22px)',
        borderBottom: '1px solid rgba(180, 50, 255, 0.14)',
        zIndex: 100
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #9333ea, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 12px rgba(147,51,234,0.5)',
            overflow: 'hidden', flexShrink: 0
          }}>
            <img src="/logo.jpg" alt="Kallu Shappu" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
          </div>
          <span style={{
            fontFamily: "'Outfit', sans-serif", fontWeight: '800', fontSize: '1.05rem',
            background: 'linear-gradient(135deg, #ffffff 0%, #d8b4fe 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>KALLU SHAPPU</span>
        </div>




        {/* Login button */}
        <button onClick={handleLogin} disabled={loading} style={{
          display: 'flex', alignItems: 'center', gap: '7px',
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.13)',
          borderRadius: '8px', color: 'rgba(255,255,255,0.85)',
          padding: '7px 16px', fontSize: '0.83rem',
          fontFamily: "'Inter', sans-serif", fontWeight: '500',
          cursor: 'pointer', transition: 'all 0.2s'
        }}
        onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.13)'; e.currentTarget.style.color='#fff'; }}
        onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.07)'; e.currentTarget.style.color='rgba(255,255,255,0.85)'; }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10 17 15 12 10 7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
          Login
        </button>
      </nav>

      {/* ── Login Card ── */}
      <div style={{
        position: 'relative', zIndex: 10,
        background: 'rgba(14, 4, 24, 0.78)',
        backdropFilter: 'blur(44px)',
        WebkitBackdropFilter: 'blur(44px)',
        border: '1px solid rgba(155, 60, 230, 0.22)',
        borderRadius: '22px',
        padding: '46px 46px 38px',
        width: '100%', maxWidth: '430px',
        boxShadow: [
          '0 30px 90px rgba(0,0,0,0.65)',
          '0 0 0 1px rgba(255,255,255,0.04)',
          'inset 0 1px 0 rgba(255,255,255,0.08)'
        ].join(', '),
        textAlign: 'center',
        animation: 'cardAppear 0.55s cubic-bezier(0.16,1,0.3,1) forwards'
      }}>

        {/* Bot Logo */}
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '18px' }}>
          <div style={{
            width: '82px', height: '82px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto',
            boxShadow: '0 0 0 5px rgba(147,51,234,0.18), 0 10px 35px rgba(147,51,234,0.45)',
            overflow: 'hidden'
          }}>
            <img src="/logo.jpg" alt="KALLU SHAPPU" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
          </div>
          {/* Online dot */}
          <div style={{
            position: 'absolute', bottom: '4px', right: '4px',
            width: '18px', height: '18px', borderRadius: '50%',
            background: '#22c55e', border: '3px solid rgba(14,4,24,0.9)',
            boxShadow: '0 0 10px rgba(34,197,94,0.7)'
          }} />
        </div>

        {/* Main Title - Malayalam */}
        <h1 style={{
          fontSize: '2.4rem',
          fontWeight: '900',
          margin: '4px 0 28px',
          lineHeight: '1.3',
          background: 'linear-gradient(135deg, #fde68a 0%, #f59e0b 40%, #fbbf24 70%, #fde68a 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: 'none',
          letterSpacing: '0.01em'
        }}>കള്ള്  ഷാപ്പ്</h1>



        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.28)',
            borderRadius: '10px', padding: '10px 14px',
            color: '#f87171', fontSize: '0.82rem', marginBottom: '16px', textAlign: 'left'
          }}>{error}</div>
        )}

        {/* Login with Discord Button */}
        <button
          id="discord-login-btn"
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%', padding: '14px 20px',
            background: loading
              ? 'linear-gradient(135deg, #a855f7, #7c3aed)'
              : 'linear-gradient(135deg, #c026d3 0%, #9333ea 55%, #7c3aed 100%)',
            border: 'none', borderRadius: '12px',
            color: 'white', fontSize: '0.95rem',
            fontFamily: "'Outfit', sans-serif", fontWeight: '700',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            boxShadow: '0 4px 22px rgba(147,51,234,0.52), inset 0 1px 0 rgba(255,255,255,0.22)',
            transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
            opacity: loading ? 0.82 : 1,
            letterSpacing: '0.01em'
          }}
          onMouseEnter={e => {
            if (!loading) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 10px 35px rgba(147,51,234,0.72), inset 0 1px 0 rgba(255,255,255,0.3)';
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 22px rgba(147,51,234,0.52), inset 0 1px 0 rgba(255,255,255,0.22)';
          }}
        >
          {loading ? (
            <>
              <div style={{
                width: '17px', height: '17px',
                border: '2.5px solid rgba(255,255,255,0.3)',
                borderTopColor: 'white', borderRadius: '50%',
                animation: 'spin 0.75s linear infinite', flexShrink: 0
              }} />
              Connecting...
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              Login with Discord
            </>
          )}
        </button>

        {/* Back link */}
        <div style={{ marginTop: '20px' }}>
          <a href="#" style={{
            color: 'rgba(255,255,255,0.28)', fontSize: '0.8rem',
            textDecoration: 'none', fontWeight: '500', transition: 'color 0.2s'
          }}
          onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.6)'}
          onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.28)'}
          >Back to Kallu Shappu</a>
        </div>
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes blobFloat {
          0%, 100% { transform: translateX(-50%) translateY(0px); }
          50% { transform: translateX(-50%) translateY(-28px); }
        }
        @keyframes particleFloat {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.3; }
          50% { transform: translateY(-18px) scale(1.25); opacity: 0.75; }
        }
        @keyframes cardAppear {
          from { opacity: 0; transform: translateY(28px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}