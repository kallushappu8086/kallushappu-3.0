import { useState, useEffect } from 'react';
import { api } from '../utils/api';

function BotInviteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  );
}

export default function GuildSelector({ user, onSelectGuild, onLogout }) {
  const [guilds, setGuilds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const avatarUrl = user?.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`
    : `https://cdn.discordapp.com/embed/avatars/0.png`;

  useEffect(() => {
    const loadGuilds = async () => {
      try {
        setLoading(true);
        const data = await api.getGuilds();
        setGuilds(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadGuilds();
  }, []);

  const botGuilds = guilds.filter(g => g.botInGuild);
  const nobotGuilds = guilds.filter(g => !g.botInGuild);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% -10%, #3a0a4a 0%, #1a0525 45%, #08000f 100%)',
      fontFamily: "'Inter', sans-serif",
      overflowX: 'hidden'
    }}>
      {/* Glow blobs */}
      <div style={{ position: 'fixed', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: '900px', height: '500px', background: 'radial-gradient(ellipse, rgba(170,30,220,0.2) 0%, transparent 68%)', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-10%', right: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(110,20,170,0.12) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Navbar */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 36px', background: 'rgba(8,0,16,0.75)', backdropFilter: 'blur(22px)', borderBottom: '1px solid rgba(180,50,255,0.14)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 0 12px rgba(147,51,234,0.5)', flexShrink: 0 }}>
            <img src="/logo.jpg" alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.05rem', background: 'linear-gradient(135deg, #ffffff 0%, #d8b4fe 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>KALLU SHAPPU</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 14px', background: 'rgba(147,51,234,0.1)', border: '1px solid rgba(147,51,234,0.25)', borderRadius: '30px' }}>
            <img src={avatarUrl} alt={user?.username} style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid rgba(147,51,234,0.5)' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2c5ff' }}>{user?.global_name || user?.username}</span>
          </div>
          <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: '7px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.13)', borderRadius: '8px', color: 'rgba(255,255,255,0.7)', padding: '7px 16px', fontSize: '0.82rem', fontFamily: "'Inter', sans-serif", fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; e.currentTarget.style.color = '#f87171'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.13)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}>
            Logout
          </button>
        </div>
      </nav>

      {/* Main content */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '18px', overflow: 'hidden', margin: '0 auto 20px', boxShadow: '0 0 0 4px rgba(147,51,234,0.2), 0 12px 40px rgba(147,51,234,0.5)' }}>
            <img src="/logo.jpg" alt="KALLU SHAPPU" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, margin: '0 0 10px', background: 'linear-gradient(135deg, #fde68a 0%, #f59e0b 50%, #fbbf24 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Select Your Server
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.95rem', margin: 0 }}>
            Manage servers where you have Administrator permissions
          </p>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ width: '48px', height: '48px', border: '4px solid rgba(147,51,234,0.2)', borderTopColor: '#9333ea', borderRadius: '50%', animation: 'spin 0.9s linear infinite', margin: '0 auto 20px' }} />
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem' }}>Loading your servers...</p>
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '16px 20px', color: '#f87171', textAlign: 'center', marginBottom: '24px' }}>
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Bot servers section */}
            {botGuilds.length > 0 && (
              <div style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
                  <h2 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Bot Active ({botGuilds.length})</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                  {botGuilds.map(guild => (
                    <GuildCard key={guild.id} guild={guild} onSelect={onSelectGuild} hasBot={true} />
                  ))}
                </div>
              </div>
            )}

            {/* No bot servers */}
            {nobotGuilds.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.25)' }} />
                  <h2 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Bot Not Added ({nobotGuilds.length})</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                  {nobotGuilds.map(guild => (
                    <GuildCard key={guild.id} guild={guild} onSelect={onSelectGuild} hasBot={false} />
                  ))}
                </div>
              </div>
            )}

            {guilds.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🏰</div>
                <h3 style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700, margin: '0 0 8px' }}>No Servers Found</h3>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.9rem' }}>You don't have Administrator permissions in any servers, or no servers have been loaded yet.</p>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes guildCardIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}

// Rename nobutGuilds fix inline
function GuildCard({ guild, onSelect, hasBot }) {
  const iconUrl = guild.icon
    ? guild.icon
    : null;

  const abbreviation = guild.name
    ? guild.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  const handleClick = () => {
    if (hasBot) {
      onSelect(guild.id, guild.name, guild.icon, guild.memberCount);
    } else if (guild.inviteUrl) {
      window.open(guild.inviteUrl, '_blank');
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{
        background: hasBot ? 'rgba(14,4,24,0.75)' : 'rgba(14,4,24,0.4)',
        border: hasBot ? '1px solid rgba(147,51,234,0.25)' : '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        padding: '18px',
        cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        animation: 'guildCardIn 0.4s ease forwards',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px) scale(1.01)';
        e.currentTarget.style.borderColor = hasBot ? 'rgba(147,51,234,0.5)' : 'rgba(255,255,255,0.18)';
        e.currentTarget.style.boxShadow = hasBot ? '0 12px 40px rgba(147,51,234,0.2)' : '0 8px 24px rgba(0,0,0,0.3)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.borderColor = hasBot ? 'rgba(147,51,234,0.25)' : 'rgba(255,255,255,0.08)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Server icon */}
      <div style={{
        width: '52px',
        height: '52px',
        borderRadius: '14px',
        flexShrink: 0,
        overflow: 'hidden',
        background: iconUrl ? 'transparent' : 'linear-gradient(135deg, #4f1e6e 0%, #2a0f3f 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: hasBot ? '0 0 0 2px rgba(147,51,234,0.4)' : '0 0 0 2px rgba(255,255,255,0.1)',
        fontSize: '1.1rem',
        fontWeight: 800,
        color: '#c084fc'
      }}>
        {iconUrl ? <img src={iconUrl} alt={guild.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : abbreviation}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: hasBot ? '#fff' : 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {guild.name}
        </div>
        {guild.memberCount > 0 && (
          <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', marginTop: '3px' }}>
            {guild.memberCount?.toLocaleString()} members
          </div>
        )}
        <div style={{ marginTop: '6px' }}>
          {hasBot ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '20px', padding: '2px 8px', fontSize: '0.7rem', color: '#22c55e', fontWeight: 700 }}>
              <CheckIcon /> Bot Active
            </span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: '20px', padding: '2px 8px', fontSize: '0.7rem', color: '#fbbf24', fontWeight: 700 }}>
              <BotInviteIcon /> Add Bot
            </span>
          )}
        </div>
      </div>

      {/* Arrow */}
      {hasBot && (
        <div style={{ color: 'rgba(147,51,234,0.7)', flexShrink: 0 }}>
          <ArrowIcon />
        </div>
      )}
    </div>
  );
}
