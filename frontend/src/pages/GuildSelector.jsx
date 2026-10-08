export default function GuildSelector({ user, onLogout }) {
  const avatarUrl = user?.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`
    : `https://cdn.discordapp.com/embed/avatars/0.png`;

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% -10%, #3a0a4a 0%, #1a0525 45%, #08000f 100%)',
      position: 'relative', overflow: 'hidden', fontFamily: "'Inter', sans-serif", padding: '20px'
    }}>
      <div style={{ position:'absolute', top:'-15%', left:'50%', transform:'translateX(-50%)', width:'1000px', height:'550px', background:'radial-gradient(ellipse, rgba(170,30,220,0.25) 0%, transparent 68%)', filter:'blur(55px)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'-15%', left:'-8%', width:'500px', height:'500px', background:'radial-gradient(circle, rgba(110,20,170,0.15) 0%, transparent 70%)', filter:'blur(80px)', pointerEvents:'none' }} />

      <nav style={{ position:'fixed', top:0, left:0, right:0, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 36px', background:'rgba(8,0,16,0.65)', backdropFilter:'blur(22px)', WebkitBackdropFilter:'blur(22px)', borderBottom:'1px solid rgba(180,50,255,0.14)', zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:'34px', height:'34px', borderRadius:'8px', overflow:'hidden', flexShrink:0, boxShadow:'0 0 12px rgba(147,51,234,0.5)' }}>
            <img src="/logo.jpg" alt="logo" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          </div>
          <span style={{ fontFamily:"'Outfit', sans-serif", fontWeight:'800', fontSize:'1.05rem', background:'linear-gradient(135deg, #ffffff 0%, #d8b4fe 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>KALLU SHAPPU</span>
        </div>
        <button onClick={onLogout} style={{ display:'flex', alignItems:'center', gap:'7px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.13)', borderRadius:'8px', color:'rgba(255,255,255,0.85)', padding:'7px 16px', fontSize:'0.83rem', fontFamily:"'Inter', sans-serif", fontWeight:'500', cursor:'pointer', transition:'all 0.2s' }}
          onMouseEnter={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.13)'; e.currentTarget.style.color='#fff'; }}
          onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.07)'; e.currentTarget.style.color='rgba(255,255,255,0.85)'; }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Logout
        </button>
      </nav>

      <div style={{ position:'relative', zIndex:10, background:'rgba(14,4,24,0.78)', backdropFilter:'blur(44px)', WebkitBackdropFilter:'blur(44px)', border:'1px solid rgba(155,60,230,0.22)', borderRadius:'22px', padding:'46px 46px 38px', width:'100%', maxWidth:'430px', boxShadow:'0 30px 90px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.08)', textAlign:'center', animation:'cardAppear 0.55s cubic-bezier(0.16,1,0.3,1) forwards' }}>

        <div style={{ marginBottom:'22px' }}>
          <div style={{ width:'82px', height:'82px', borderRadius:'50%', overflow:'hidden', margin:'0 auto', boxShadow:'0 0 0 5px rgba(147,51,234,0.18), 0 10px 35px rgba(147,51,234,0.45)' }}>
            <img src="/logo.jpg" alt="KALLU SHAPPU" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center' }} />
          </div>
        </div>

        <h1 style={{ fontSize:'2.2rem', fontWeight:'900', margin:'0 0 24px', background:'linear-gradient(135deg, #fde68a 0%, #f59e0b 40%, #fbbf24 70%, #fde68a 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', lineHeight:'1.3' }}>കള്ള്  ഷാപ്പ്</h1>

        <div style={{ height:'1px', background:'linear-gradient(90deg, transparent, rgba(147,51,234,0.4), transparent)', marginBottom:'24px' }} />

        <div style={{ display:'flex', alignItems:'center', gap:'14px', background:'rgba(147,51,234,0.1)', border:'1px solid rgba(147,51,234,0.25)', borderRadius:'14px', padding:'14px 18px', marginBottom:'24px', textAlign:'left' }}>
          <img src={avatarUrl} alt={user?.username} style={{ width:'48px', height:'48px', borderRadius:'50%', border:'2px solid rgba(147,51,234,0.5)', flexShrink:0 }} />
          <div>
            <div style={{ fontWeight:'700', fontSize:'1rem', color:'#fff', fontFamily:"'Outfit', sans-serif" }}>{user?.global_name || user?.username || 'Discord User'}</div>
            <div style={{ fontSize:'0.8rem', color:'rgba(255,255,255,0.45)', marginTop:'2px' }}>@{user?.username}</div>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'5px', marginTop:'5px', background:'rgba(34,197,94,0.15)', border:'1px solid rgba(34,197,94,0.3)', borderRadius:'20px', padding:'2px 8px' }}>
              <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#22c55e', display:'inline-block' }} />
              <span style={{ fontSize:'0.7rem', color:'#22c55e', fontWeight:'600' }}>Connected</span>
            </div>
          </div>
        </div>

        <button onClick={onLogout}
          style={{ width:'100%', padding:'13px 20px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'12px', color:'rgba(255,255,255,0.7)', fontSize:'0.9rem', fontFamily:"'Outfit', sans-serif", fontWeight:'600', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', transition:'all 0.25s' }}
          onMouseEnter={e=>{ e.currentTarget.style.background='rgba(239,68,68,0.12)'; e.currentTarget.style.borderColor='rgba(239,68,68,0.3)'; e.currentTarget.style.color='#f87171'; }}
          onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.12)'; e.currentTarget.style.color='rgba(255,255,255,0.7)'; }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Logout
        </button>
      </div>

      <style>{`@keyframes cardAppear { from { opacity:0; transform:translateY(28px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }`}</style>
    </div>
  );
}
