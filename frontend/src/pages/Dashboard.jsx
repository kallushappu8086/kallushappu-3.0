import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';

/* ─────────── helpers ─────────── */
const PERIODS = [
  { key: 'daily', label: 'Today' },
  { key: 'weekly', label: 'This Week' },
  { key: 'monthly', label: 'This Month' },
  { key: 'all', label: 'All Time' }
];

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function Medal({ rank }) {
  if (rank === 1) return <span style={{ fontSize: '1.2rem' }}>🥇</span>;
  if (rank === 2) return <span style={{ fontSize: '1.2rem' }}>🥈</span>;
  if (rank === 3) return <span style={{ fontSize: '1.2rem' }}>🥉</span>;
  return <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', minWidth: '28px', display: 'inline-block', textAlign: 'center' }}>{rank}</span>;
}

function Avatar({ src, name, size = 42 }) {
  const [err, setErr] = useState(false);
  const abbr = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  if (!src || err) {
    return (
      <div style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg,#4f1e6e,#2a0f3f)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.35, fontWeight: 800, color: '#c084fc', flexShrink: 0 }}>
        {abbr}
      </div>
    );
  }
  return <img src={src} alt={name} onError={() => setErr(true)} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />;
}

/* ─────────── Sub-components ─────────── */
function LeaderboardRow({ entry, type, isTop3, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={() => onClick(entry)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '12px 18px',
        borderRadius: '12px',
        background: isTop3
          ? `rgba(${entry.rank === 1 ? '255,191,0' : entry.rank === 2 ? '192,192,192' : '205,127,50'},0.07)`
          : hov ? 'rgba(147,51,234,0.07)' : 'rgba(255,255,255,0.03)',
        border: isTop3
          ? `1px solid rgba(${entry.rank === 1 ? '255,191,0' : entry.rank === 2 ? '192,192,192' : '205,127,50'},0.2)`
          : `1px solid ${hov ? 'rgba(147,51,234,0.2)' : 'rgba(255,255,255,0.06)'}`,
        cursor: 'pointer',
        transition: 'all 0.2s',
        transform: hov ? 'translateX(4px)' : 'none',
        animation: `rowIn 0.35s ease ${(entry.rank - 1) * 0.04}s both`
      }}
    >
      <div style={{ width: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Medal rank={entry.rank} />
      </div>
      <div style={{ position: 'relative' }}>
        <Avatar src={entry.avatar} name={entry.displayName || entry.username} size={42} />
        {entry.isLive && type === 'voice' && (
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e', border: '2px solid #08000f', boxShadow: '0 0 6px #22c55e' }} />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {entry.displayName || entry.username}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>@{entry.username}</div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        {type === 'voice' ? (
          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: isTop3 ? (entry.rank === 1 ? '#ffd700' : entry.rank === 2 ? '#c0c0c0' : '#cd7f32') : '#c084fc' }}>
            {entry.voiceDuration}
          </div>
        ) : (
          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: isTop3 ? (entry.rank === 1 ? '#ffd700' : entry.rank === 2 ? '#c0c0c0' : '#cd7f32') : '#60a5fa' }}>
            {entry.messages.toLocaleString()}
          </div>
        )}
        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>{type === 'voice' ? '⏱ voice' : '💬 msgs'}</div>
      </div>
    </div>
  );
}

function StatsSection({ guildId, guildName, channels }) {
  const [period, setPeriod] = useState('weekly');
  const [activeTab, setActiveTab] = useState('voice');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [sendChannel, setSendChannel] = useState('');
  const [sendMsg, setSendMsg] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberStats, setMemberStats] = useState(null);
  const [autoReport, setAutoReport] = useState(null);
  const [savingAR, setSavingAR] = useState(false);
  const [arMsg, setArMsg] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getStats(guildId, { period, limit: 20 });
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [guildId, period]);

  useEffect(() => { loadStats(); }, [loadStats]);

  useEffect(() => {
    api.getStatsSettings(guildId).then(d => {
      setAutoReport(d.autoReport || {
        enabled: false, channelId: '', daily: false, weekly: true, monthly: true,
        dailyTime: '20:00', weeklyDay: 0, weeklyTime: '20:00', monthlyDay: 1, monthlyTime: '20:00'
      });
      if (d.autoReport?.channelId) setSendChannel(d.autoReport.channelId);
    }).catch(() => {});
  }, [guildId]);

  const handleMemberClick = async (entry) => {
    setSelectedMember(entry);
    setMemberStats(null);
    try {
      const data = await api.getMemberStats(guildId, entry.userId, { period });
      setMemberStats(data);
    } catch (err) {
      console.error('Member stats error:', err);
    }
  };

  const handleSendReport = async () => {
    if (!sendChannel) return;
    setSending(true);
    setSendMsg('');
    try {
      await api.sendStatsReport(guildId, sendChannel, period);
      setSendMsg('✅ Report sent to Discord successfully!');
    } catch (err) {
      setSendMsg(`❌ ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  const handleSaveAutoReport = async () => {
    setSavingAR(true);
    setArMsg('');
    try {
      await api.saveStatsSettings(guildId, autoReport);
      setArMsg('✅ Auto-report settings saved!');
    } catch (err) {
      setArMsg(`❌ ${err.message}`);
    } finally {
      setSavingAR(false);
    }
  };

  const leaderboard = stats ? (activeTab === 'voice' ? stats.voiceLeaderboard : stats.chatLeaderboard) : [];

  return (
    <div>
      {/* Period selector */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {PERIODS.map(p => (
          <button key={p.key} onClick={() => setPeriod(p.key)} style={{
            padding: '8px 18px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontFamily: "'Inter', sans-serif",
            fontWeight: 700, fontSize: '0.82rem', transition: 'all 0.2s',
            background: period === p.key ? 'linear-gradient(135deg,#7c3aed,#9333ea)' : 'rgba(255,255,255,0.07)',
            color: period === p.key ? '#fff' : 'rgba(255,255,255,0.5)',
            boxShadow: period === p.key ? '0 4px 16px rgba(147,51,234,0.35)' : 'none'
          }}>
            {p.label}
          </button>
        ))}
        <button onClick={() => setShowSettings(s => !s)} style={{
          marginLeft: 'auto', padding: '8px 18px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
          fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '0.82rem', background: showSettings ? 'rgba(147,51,234,0.15)' : 'rgba(255,255,255,0.05)',
          color: 'rgba(255,255,255,0.6)', transition: 'all 0.2s'
        }}>
          ⚙️ Settings
        </button>
      </div>

      {/* Auto report settings panel */}
      {showSettings && autoReport && (
        <div style={{ background: 'rgba(14,4,24,0.8)', border: '1px solid rgba(147,51,234,0.2)', borderRadius: '16px', padding: '24px', marginBottom: '24px', animation: 'fadeIn 0.3s ease' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '1rem', fontWeight: 700, color: '#c084fc' }}>📅 Auto-Report Settings</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <label style={labelStyle}>
              <span style={labelTextStyle}>Report Channel</span>
              <select value={autoReport.channelId} onChange={e => setAutoReport(a => ({ ...a, channelId: e.target.value }))} style={selectStyle}>
                <option value="">-- Select Channel --</option>
                {channels.map(c => <option key={c.id} value={c.id}>#{c.name}</option>)}
              </select>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {['daily', 'weekly', 'monthly'].map(t => (
              <div key={t}>
                <ToggleRow label={`Enable ${t.charAt(0).toUpperCase() + t.slice(1)} Report`} value={autoReport[t]} onChange={v => setAutoReport(a => ({ ...a, [t]: v }))} />
                {autoReport[t] && (
                  <div style={{ marginTop: '8px', paddingLeft: '8px' }}>
                    {t === 'weekly' && (
                      <label style={labelStyle}>
                        <span style={labelTextStyle}>Day of Week</span>
                        <select value={autoReport.weeklyDay} onChange={e => setAutoReport(a => ({ ...a, weeklyDay: parseInt(e.target.value) }))} style={selectStyle}>
                          {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                        </select>
                      </label>
                    )}
                    {t === 'monthly' && (
                      <label style={labelStyle}>
                        <span style={labelTextStyle}>Day of Month (1–28)</span>
                        <input type="number" min={1} max={28} value={autoReport.monthlyDay} onChange={e => setAutoReport(a => ({ ...a, monthlyDay: parseInt(e.target.value) || 1 }))} style={inputStyle} />
                      </label>
                    )}
                    <label style={labelStyle}>
                      <span style={labelTextStyle}>Time (UTC)</span>
                      <input type="time" value={autoReport[`${t}Time`]} onChange={e => setAutoReport(a => ({ ...a, [`${t}Time`]: e.target.value }))} style={inputStyle} />
                    </label>
                  </div>
                )}
              </div>
            ))}
          </div>

          <ToggleRow label="Enable Auto-Reports" value={autoReport.enabled} onChange={v => setAutoReport(a => ({ ...a, enabled: v }))} />

          <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button onClick={handleSaveAutoReport} disabled={savingAR} style={primaryBtnStyle(savingAR)}>
              {savingAR ? 'Saving...' : '💾 Save Auto-Report Settings'}
            </button>
            {arMsg && <span style={{ fontSize: '0.85rem', color: arMsg.startsWith('✅') ? '#22c55e' : '#f87171' }}>{arMsg}</span>}
          </div>
        </div>
      )}

      {/* Manual send report */}
      <div style={{ background: 'rgba(14,4,24,0.6)', border: '1px solid rgba(147,51,234,0.15)', borderRadius: '14px', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.55)', flexShrink: 0 }}>📤 Send Report to Channel:</span>
        <select value={sendChannel} onChange={e => setSendChannel(e.target.value)} style={{ ...selectStyle, flex: 1, minWidth: '180px' }}>
          <option value="">-- Select Channel --</option>
          {channels.map(c => <option key={c.id} value={c.id}>#{c.name}</option>)}
        </select>
        <button onClick={handleSendReport} disabled={sending || !sendChannel} style={primaryBtnStyle(sending || !sendChannel)}>
          {sending ? 'Sending...' : `Send ${PERIODS.find(p => p.key === period)?.label} Report`}
        </button>
        {sendMsg && <span style={{ fontSize: '0.85rem', color: sendMsg.startsWith('✅') ? '#22c55e' : '#f87171', width: '100%' }}>{sendMsg}</span>}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '4px', marginBottom: '20px', width: 'fit-content' }}>
        {[{ key: 'voice', label: '🎙️ Voice Leaderboard' }, { key: 'chat', label: '💬 Chat Leaderboard' }].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: "'Inter', sans-serif",
            fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.2s',
            background: activeTab === t.key ? (t.key === 'voice' ? 'rgba(124,58,237,0.7)' : 'rgba(37,99,235,0.7)') : 'transparent',
            color: activeTab === t.key ? '#fff' : 'rgba(255,255,255,0.4)'
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Stats info bar */}
      {stats && (
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <InfoChip label="Tracked Members" value={stats.totalTrackedMembers || 0} color="#9333ea" />
          <InfoChip label="Period" value={`${stats.startDate} → ${stats.endDate}`} color="#60a5fa" />
          <InfoChip label="Server" value={guildName} color="#f59e0b" />
        </div>
      )}

      {/* Leaderboard */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ width: '42px', height: '42px', border: '4px solid rgba(147,51,234,0.2)', borderTopColor: '#9333ea', borderRadius: '50%', animation: 'spin 0.9s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>Loading stats...</p>
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '16px 20px', color: '#f87171', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <div style={{ background: 'rgba(14,4,24,0.6)', border: '1px solid rgba(147,51,234,0.12)', borderRadius: '16px', overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{ display: 'flex', padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', gap: '14px' }}>
            <div style={{ width: '32px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>#</div>
            <div style={{ flex: 1, fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>USER</div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>
              {activeTab === 'voice' ? (
                <span>⏱ TIME</span>
              ) : (
                <span>💬 MESSAGES</span>
              )}
            </div>
          </div>

          <div style={{ padding: '8px' }}>
            {leaderboard.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 20px', color: 'rgba(255,255,255,0.3)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>{activeTab === 'voice' ? '🎙️' : '💬'}</div>
                <p style={{ margin: 0 }}>No {activeTab === 'voice' ? 'voice' : 'chat'} activity tracked for this period yet.</p>
                <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.2)' }}>Members need to be active in your server for data to appear.</p>
              </div>
            ) : (
              leaderboard.map(entry => (
                <LeaderboardRow
                  key={entry.userId}
                  entry={entry}
                  type={activeTab}
                  isTop3={entry.rank <= 3}
                  onClick={handleMemberClick}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* Member detail modal */}
      {selectedMember && (
        <MemberModal
          entry={selectedMember}
          stats={memberStats}
          onClose={() => { setSelectedMember(null); setMemberStats(null); }}
          period={period}
        />
      )}

      <style>{`
        @keyframes rowIn { from { opacity:0; transform:translateX(-12px); } to { opacity:1; transform:translateX(0); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes modalIn { from { opacity:0; transform:scale(0.93); } to { opacity:1; transform:scale(1); } }
      `}</style>
    </div>
  );
}

function InfoChip({ label, value, color }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '6px 12px' }}>
      <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', fontWeight: 600, textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontSize: '0.82rem', fontWeight: 700, color }}>{value}</span>
    </div>
  );
}

function MemberModal({ entry, stats, onClose, period }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'rgba(14,4,28,0.98)', border: '1px solid rgba(147,51,234,0.3)', borderRadius: '20px', padding: '32px', maxWidth: '500px', width: '100%', animation: 'modalIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards', maxHeight: '80vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <Avatar src={entry.avatar} name={entry.displayName || entry.username} size={60} />
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>{entry.displayName || entry.username}</h3>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>@{entry.username}</div>
            {entry.isLive && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '5px', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '20px', padding: '2px 8px', fontSize: '0.72rem', color: '#22c55e', fontWeight: 700 }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
                Live in Voice
              </div>
            )}
          </div>
          <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '1.4rem', lineHeight: 1 }}>✕</button>
        </div>

        {/* Stats cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          <StatCard label="Voice Time" value={entry.voiceDuration} icon="🎙️" color="#9333ea" />
          <StatCard label="Messages" value={entry.messages.toLocaleString()} icon="💬" color="#3b82f6" />
          {stats && (
            <>
              <StatCard label="All-Time Voice" value={formatMinutes(stats.allTimeVoiceMinutes)} icon="⏳" color="#f59e0b" />
              <StatCard label="All-Time Msgs" value={(stats.allTimeMessages || 0).toLocaleString()} icon="📊" color="#22c55e" />
            </>
          )}
        </div>

        {/* Daily breakdown */}
        {stats?.dailyBreakdown?.length > 0 && (
          <div>
            <h4 style={{ margin: '0 0 12px', fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Daily Breakdown ({PERIODS.find(p => p.key === period)?.label})</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {stats.dailyBreakdown.map(day => (
                <div key={day.date} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', minWidth: '88px', fontFamily: 'monospace' }}>{day.date}</span>
                  <span style={{ fontSize: '0.8rem', color: '#c084fc', fontWeight: 700 }}>🎙️ {day.voiceDuration}</span>
                  <span style={{ fontSize: '0.8rem', color: '#60a5fa', fontWeight: 700, marginLeft: 'auto' }}>💬 {day.messages}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!stats && (
          <div style={{ textAlign: 'center', padding: '20px', color: 'rgba(255,255,255,0.3)' }}>
            <div style={{ width: '30px', height: '30px', border: '3px solid rgba(147,51,234,0.3)', borderTopColor: '#9333ea', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 10px' }} />
            Loading member details...
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div style={{ background: `rgba(${hexToRgb(color)},0.07)`, border: `1px solid rgba(${hexToRgb(color)},0.2)`, borderRadius: '12px', padding: '14px 16px' }}>
      <div style={{ fontSize: '1.3rem', marginBottom: '6px' }}>{icon}</div>
      <div style={{ fontWeight: 800, fontSize: '1.1rem', color }}>{value}</div>
      <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    </div>
  );
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}` : '147,51,234';
}

function formatMinutes(total = 0) {
  const d = Math.floor(total / 1440), h = Math.floor((total % 1440) / 60), m = total % 60;
  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  parts.push(`${m}m`);
  return parts.join(' ') || '0m';
}

function ToggleRow({ label, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
      <div onClick={() => onChange(!value)} style={{
        width: '42px', height: '22px', borderRadius: '11px', cursor: 'pointer', transition: 'background 0.2s', position: 'relative',
        background: value ? 'linear-gradient(135deg,#7c3aed,#9333ea)' : 'rgba(255,255,255,0.12)',
        boxShadow: value ? '0 0 12px rgba(147,51,234,0.4)' : 'none'
      }}>
        <div style={{ position: 'absolute', top: '3px', left: value ? '23px' : '3px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }} />
      </div>
      <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>{label}</span>
    </div>
  );
}

const labelStyle = { display: 'flex', flexDirection: 'column', gap: '5px' };
const labelTextStyle = { fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' };
const inputStyle = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '0.85rem', fontFamily: "'Inter', sans-serif", outline: 'none', width: '100%' };
const selectStyle = { background: 'rgba(14,4,24,0.9)', border: '1px solid rgba(147,51,234,0.2)', borderRadius: '8px', padding: '8px 12px', color: '#e2c5ff', fontSize: '0.85rem', fontFamily: "'Inter', sans-serif", outline: 'none', cursor: 'pointer', width: '100%' };
const primaryBtnStyle = (disabled) => ({
  padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
  fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '0.85rem',
  background: disabled ? 'rgba(147,51,234,0.3)' : 'linear-gradient(135deg,#7c3aed,#9333ea)',
  color: disabled ? 'rgba(255,255,255,0.4)' : '#fff',
  boxShadow: disabled ? 'none' : '0 4px 16px rgba(147,51,234,0.35)',
  transition: 'all 0.2s', flexShrink: 0
});

/* ─────────── Main Dashboard ─────────── */
export default function Dashboard({ guildId, guildName, guildIcon, memberCount, onBack, user, onLogout }) {
  const [channels, setChannels] = useState([]);
  const [activeSection, setActiveSection] = useState('stats');

  const iconUrl = guildIcon || null;
  const abbreviation = guildName ? guildName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '??';

  const avatarUrl = user?.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
    : `https://cdn.discordapp.com/embed/avatars/0.png`;

  useEffect(() => {
    api.getChannels(guildId).then(setChannels).catch(() => {});
  }, [guildId]);

  const NAV_ITEMS = [
    { key: 'stats', label: '📊 Activity Stats', icon: '📊' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 30% 0%, #2a0a3a 0%, #0f0118 50%, #04000a 100%)', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column' }}>
      {/* Decorative blobs */}
      <div style={{ position: 'fixed', top: '-5%', right: '10%', width: '600px', height: '400px', background: 'radial-gradient(ellipse, rgba(124,58,237,0.15) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Navbar */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 28px', background: 'rgba(4,0,10,0.8)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(147,51,234,0.12)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'rgba(255,255,255,0.6)', padding: '6px 12px', fontSize: '0.8rem', cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}>
            ← Back
          </button>

          {/* Server badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', overflow: 'hidden', background: 'linear-gradient(135deg,#4f1e6e,#2a0f3f)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: '#c084fc', boxShadow: '0 0 0 2px rgba(147,51,234,0.3)', flexShrink: 0 }}>
              {iconUrl ? <img src={iconUrl} alt={guildName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : abbreviation}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff', lineHeight: 1.2 }}>{guildName}</div>
              {memberCount > 0 && <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>{memberCount?.toLocaleString()} members</div>}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 12px', background: 'rgba(147,51,234,0.1)', border: '1px solid rgba(147,51,234,0.2)', borderRadius: '20px' }}>
            <img src={avatarUrl} alt={user?.username} style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
            <span style={{ fontSize: '0.8rem', color: '#c084fc', fontWeight: 600 }}>{user?.global_name || user?.username}</span>
          </div>
          <button onClick={onLogout} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', color: '#f87171', padding: '6px 14px', fontSize: '0.8rem', cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontWeight: 600, transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}>
            Logout
          </button>
        </div>
      </nav>

      {/* Body */}
      <div style={{ flex: 1, position: 'relative', zIndex: 1, display: 'flex', maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '32px 20px' }}>
        <div style={{ flex: 1 }}>
          {/* Page header */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ margin: '0 0 6px', fontSize: '1.8rem', fontWeight: 900, background: 'linear-gradient(135deg,#e2c5ff 0%,#c084fc 50%,#9333ea 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              📊 Member Activity Stats
            </h1>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
              Track voice time and message activity for every member in your server
            </p>
          </div>

          <StatsSection guildId={guildId} guildName={guildName} channels={channels} />
        </div>
      </div>
    </div>
  );
}
