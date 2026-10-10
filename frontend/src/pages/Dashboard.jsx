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
  if (rank === 1) return <span style={{ fontSize: '0.98rem', color: '#f59e0b', display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 800 }}><span>👑</span> 1</span>;
  if (rank === 2) return <span style={{ fontSize: '0.98rem', color: '#e2e8f0', display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 800 }}><span>👑</span> 2</span>;
  if (rank === 3) return <span style={{ fontSize: '0.98rem', color: '#ea580c', display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 800 }}><span>👑</span> 3</span>;
  return <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'rgba(255,255,255,0.4)', minWidth: '28px', display: 'inline-block', textAlign: 'center' }}>{rank}</span>;
}

function Avatar({ src, name, size = 38 }) {
  const [err, setErr] = useState(false);
  const abbr = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  if (!src || err) {
    return (
      <div style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg,#2b2d31,#1e1f22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.35, fontWeight: 800, color: '#e2e8f0', flexShrink: 0, border: '1px solid rgba(255,255,255,0.08)' }}>
        {abbr}
      </div>
    );
  }
  return <img src={src} alt={name} onError={() => setErr(true)} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(255,255,255,0.08)' }} />;
}

/* ─────────── Sub-components ─────────── */
function LeaderboardRow({ entry, type, isTop3, onClick }) {
  const [hov, setHov] = useState(false);
  const is1 = entry.rank === 1;
  const is2 = entry.rank === 2;
  const is3 = entry.rank === 3;

  let borderColor = 'rgba(255,255,255,0.06)';
  let bg = hov ? 'rgba(255,255,255,0.06)' : 'rgba(18, 22, 30, 0.7)';
  let valColor = '#e2e8f0';

  if (is1) {
    borderColor = 'rgba(245, 158, 11, 0.75)';
    bg = hov
      ? 'linear-gradient(90deg, rgba(245,158,11,0.18) 0%, rgba(18,22,30,0.85) 100%)'
      : 'linear-gradient(90deg, rgba(245,158,11,0.1) 0%, rgba(18,22,30,0.7) 100%)';
    valColor = '#f59e0b';
  } else if (is2) {
    borderColor = 'rgba(226, 232, 240, 0.65)';
    bg = hov
      ? 'linear-gradient(90deg, rgba(226,232,240,0.15) 0%, rgba(18,22,30,0.85) 100%)'
      : 'linear-gradient(90deg, rgba(226,232,240,0.08) 0%, rgba(18,22,30,0.7) 100%)';
    valColor = '#f8fafc';
  } else if (is3) {
    borderColor = 'rgba(234, 88, 12, 0.65)';
    bg = hov
      ? 'linear-gradient(90deg, rgba(234,88,12,0.15) 0%, rgba(18,22,30,0.85) 100%)'
      : 'linear-gradient(90deg, rgba(234,88,12,0.08) 0%, rgba(18,22,30,0.7) 100%)';
    valColor = '#ea580c';
  }

  return (
    <div
      onClick={() => onClick(entry)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '11px 18px',
        borderRadius: '10px',
        background: bg,
        border: `1px solid ${borderColor}`,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        transform: hov ? 'translateX(3px)' : 'none',
        marginBottom: '6px',
        boxShadow: is1 ? '0 2px 14px rgba(245,158,11,0.12)' : 'none',
        animation: `rowIn 0.3s ease ${(entry.rank - 1) * 0.03}s both`
      }}
    >
      <div style={{ width: '42px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexShrink: 0 }}>
        <Medal rank={entry.rank} />
      </div>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <Avatar src={entry.avatar} name={entry.displayName || entry.username} size={38} />
        {entry.isLive && type === 'voice' && (
          <div style={{ position: 'absolute', bottom: -1, right: -1, width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e', border: '2px solid #0d0f14', boxShadow: '0 0 6px #22c55e' }} />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {entry.displayName || entry.username}
        </span>
        <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500, whiteSpace: 'nowrap' }}>
          @{entry.username}
        </span>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontWeight: 800, fontSize: '0.96rem', color: valColor, letterSpacing: '0.2px' }}>
          {type === 'voice' ? entry.voiceDuration : entry.messages.toLocaleString()}
        </div>
      </div>
    </div>
  );
}

function RolePointRow({ entry, onGiveBonus }) {
  const [hov, setHov] = useState(false);
  const is1 = entry.rank === 1;
  const is2 = entry.rank === 2;
  const is3 = entry.rank === 3;

  let borderColor = 'rgba(255,255,255,0.06)';
  let bg = hov ? 'rgba(255,255,255,0.06)' : 'rgba(18, 22, 30, 0.7)';
  let ptsColor = '#e2e8f0';

  if (is1) {
    borderColor = 'rgba(245, 158, 11, 0.75)';
    bg = hov
      ? 'linear-gradient(90deg, rgba(245,158,11,0.18) 0%, rgba(18,22,30,0.85) 100%)'
      : 'linear-gradient(90deg, rgba(245,158,11,0.1) 0%, rgba(18,22,30,0.7) 100%)';
    ptsColor = '#f59e0b';
  } else if (is2) {
    borderColor = 'rgba(226, 232, 240, 0.65)';
    bg = hov
      ? 'linear-gradient(90deg, rgba(226,232,240,0.15) 0%, rgba(18,22,30,0.85) 100%)'
      : 'linear-gradient(90deg, rgba(226,232,240,0.08) 0%, rgba(18,22,30,0.7) 100%)';
    ptsColor = '#f8fafc';
  } else if (is3) {
    borderColor = 'rgba(234, 88, 12, 0.65)';
    bg = hov
      ? 'linear-gradient(90deg, rgba(234,88,12,0.15) 0%, rgba(18,22,30,0.85) 100%)'
      : 'linear-gradient(90deg, rgba(234,88,12,0.08) 0%, rgba(18,22,30,0.7) 100%)';
    ptsColor = '#ea580c';
  }

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        borderRadius: '10px',
        background: bg,
        border: `1px solid ${borderColor}`,
        transition: 'all 0.15s ease',
        transform: hov ? 'translateX(3px)' : 'none',
        marginBottom: '6px',
        boxShadow: is1 ? '0 2px 14px rgba(245,158,11,0.12)' : 'none',
        animation: `rowIn 0.3s ease ${(entry.rank - 1) * 0.03}s both`
      }}
    >
      <div style={{ width: '38px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexShrink: 0 }}>
        <Medal rank={entry.rank} />
      </div>

      <div style={{ position: 'relative', flexShrink: 0 }}>
        <Avatar src={entry.avatar} name={entry.displayName || entry.username} size={38} />
        {entry.isLive && (
          <div style={{ position: 'absolute', bottom: -1, right: -1, width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e', border: '2px solid #0d0f14', boxShadow: '0 0 6px #22c55e' }} />
        )}
      </div>

      <div style={{ flex: 1.2, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {entry.displayName || entry.username}
          </span>
          <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500, whiteSpace: 'nowrap' }}>
            @{entry.username}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '3px' }}>
          {entry.roles && entry.roles.map(r => (
            <span key={r.id} style={{
              fontSize: '0.68rem', fontWeight: 700, padding: '1px 6px', borderRadius: '4px',
              background: r.color && r.color !== '#000000' ? `${r.color}22` : 'rgba(255,255,255,0.08)',
              color: r.color && r.color !== '#000000' ? r.color : '#e2e8f0',
              border: `1px solid ${r.color && r.color !== '#000000' ? `${r.color}44` : 'rgba(255,255,255,0.1)'}`
            }}>
              {r.name}
            </span>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'right', minWidth: '95px', flexShrink: 0 }}>
        <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#e2e8f0' }}>{entry.messages} msgs</div>
        <div style={{ fontSize: '0.72rem', color: '#60a5fa', fontWeight: 600 }}>+{entry.chatPoints} pts</div>
      </div>

      <div style={{ textAlign: 'right', minWidth: '105px', flexShrink: 0 }}>
        <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#e2e8f0' }}>{entry.voiceDuration}</div>
        <div style={{ fontSize: '0.72rem', color: '#c084fc', fontWeight: 600 }}>+{entry.voicePoints} pts</div>
      </div>

      <div style={{ textAlign: 'right', minWidth: '75px', flexShrink: 0 }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: entry.bonusPoints > 0 ? '#34d399' : entry.bonusPoints < 0 ? '#f87171' : 'rgba(255,255,255,0.35)' }}>
          {entry.bonusPoints > 0 ? `+${entry.bonusPoints}` : entry.bonusPoints}
        </div>
        <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)' }}>bonus</div>
      </div>

      <div style={{ minWidth: '120px', textAlign: 'right', flexShrink: 0 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          background: is1 ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.06)',
          border: `1px solid ${is1 ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.1)'}`,
          padding: '4px 10px', borderRadius: '16px', fontWeight: 900, fontSize: '0.9rem', color: ptsColor
        }}>
          <span>⭐</span> {entry.totalPoints.toLocaleString()} PTS
        </div>
      </div>

      <div style={{ flexShrink: 0 }}>
        <button
          onClick={() => onGiveBonus(entry)}
          style={{
            background: 'rgba(245,158,11,0.12)',
            border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: '6px',
            color: '#f59e0b',
            padding: '5px 10px',
            fontSize: '0.72rem',
            cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
            fontWeight: 800,
            transition: 'all 0.15s'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.25)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.12)'; }}
        >
          + Points
        </button>
      </div>
    </div>
  );
}

function BonusPointsModal({ member, onClose, onAward, loading, msg }) {
  const [amount, setAmount] = useState(25);

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#0d1017', border: '1px solid rgba(245,158,11,0.4)', borderRadius: '20px', padding: '28px', maxWidth: '440px', width: '100%', boxShadow: '0 12px 40px rgba(0,0,0,0.85)', animation: 'modalIn 0.3s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
          <Avatar src={member.avatar} name={member.displayName} size={48} />
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff' }}>{member.displayName}</div>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>@{member.username}</div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Current Total</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#f59e0b' }}>{member.totalPoints.toLocaleString()} PTS</div>
          </div>
        </div>

        {/* Breakdown */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>💬 Chat Pts</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#60a5fa' }}>+{member.chatPoints}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>🎙️ Voice Pts</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#c084fc' }}>+{member.voicePoints}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>🎁 Bonus Pts</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: member.bonusPoints >= 0 ? '#34d399' : '#f87171' }}>{member.bonusPoints >= 0 ? `+${member.bonusPoints}` : member.bonusPoints}</div>
          </div>
        </div>

        <div style={{ marginBottom: '10px', fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>Quick Award / Deduct:</div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {[10, 25, 50, 100, 250, -10].map(amt => (
            <button key={amt} onClick={() => setAmount(amt)} style={{
              padding: '7px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
              background: amount === amt ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'rgba(255,255,255,0.06)',
              color: amount === amt ? '#000' : '#fff', fontWeight: 800, fontSize: '0.8rem'
            }}>
              {amt > 0 ? `+${amt}` : amt} pts
            </button>
          ))}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Custom Points to Add (or negative to deduct):</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(parseInt(e.target.value) || 0)}
            style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px 14px', color: '#fff', fontSize: '1rem', fontWeight: 800, outline: 'none' }}
          />
        </div>

        {msg && <div style={{ fontSize: '0.85rem', marginBottom: '14px', textAlign: 'center', color: msg.startsWith('✅') ? '#34d399' : '#f87171' }}>{msg}</div>}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: 600 }}>
            Cancel
          </button>
          <button onClick={() => onAward(amount)} disabled={loading} style={{
            padding: '8px 20px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#f59e0b,#d97706)',
            color: '#000', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 14px rgba(245,158,11,0.3)'
          }}>
            {loading ? 'Awarding...' : `Award ${amount > 0 ? '+' : ''}${amount} Points`}
          </button>
        </div>
      </div>
    </div>
  );
}

function FormulaModal({ formula, onClose, onSave, saving, msg, roles, selectedRoleId, onSelectRole }) {
  const [ppm, setPpm] = useState(formula?.pointsPerMessage ?? 1);
  const [ppv, setPpv] = useState(formula?.pointsPerVoiceMinute ?? 2);

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#0d1017', border: '1px solid rgba(245,158,11,0.4)', borderRadius: '20px', padding: '28px', maxWidth: '480px', width: '100%', boxShadow: '0 12px 40px rgba(0,0,0,0.85)', animation: 'modalIn 0.3s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚙️</span> Staff Points Formula & Roles
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '1.3rem', cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>

        <p style={{ margin: '0 0 20px', fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
          Customize how points increase for members holding the staff role. Points accumulate automatically as members chat and spend time in voice channels.
        </p>

        {/* Selected Role */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '6px' }}>
            👑 Active Staff Role to Track:
          </label>
          <select
            value={selectedRoleId}
            onChange={e => onSelectRole(e.target.value)}
            style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px 12px', color: '#f59e0b', fontSize: '0.88rem', fontWeight: 700, outline: 'none' }}
          >
            <option value="">-- All Staff Roles / All Members --</option>
            {roles.map(r => (
              <option key={r.id} value={r.id}>
                @{r.name} ({r.memberCount || 0} members)
              </option>
            ))}
          </select>
        </div>

        {/* Chat points */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <span>💬</span> Points Per Chat Message:
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="number"
              min="0"
              max="1000"
              value={ppm}
              onChange={e => setPpm(Math.max(0, parseInt(e.target.value) || 0))}
              style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(96,165,250,0.3)', borderRadius: '8px', padding: '10px 14px', color: '#fff', fontSize: '1rem', fontWeight: 800, outline: 'none' }}
            />
            <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>pts / msg</span>
          </div>
          <div style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>
            e.g. 1 point added for every message sent in server
          </div>
        </div>

        {/* Voice points */}
        <div style={{ marginBottom: '22px' }}>
          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#c084fc', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <span>🎙️</span> Points Per Voice Minute:
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="number"
              min="0"
              max="1000"
              value={ppv}
              onChange={e => setPpv(Math.max(0, parseInt(e.target.value) || 0))}
              style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(192,132,252,0.3)', borderRadius: '8px', padding: '10px 14px', color: '#fff', fontSize: '1rem', fontWeight: 800, outline: 'none' }}
            />
            <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>pts / minute</span>
          </div>
          <div style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>
            e.g. 2 points added for every 1 minute spent in voice channels
          </div>
        </div>

        {msg && <div style={{ fontSize: '0.85rem', marginBottom: '14px', textAlign: 'center', color: msg.startsWith('✅') ? '#34d399' : '#f87171' }}>{msg}</div>}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: 600 }}>
            Cancel
          </button>
          <button
            onClick={() => onSave({ pointsPerMessage: ppm, pointsPerVoiceMinute: ppv })}
            disabled={saving}
            style={{
              padding: '9px 22px', borderRadius: '8px', border: 'none',
              background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#000',
              fontWeight: 800, cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(245,158,11,0.3)'
            }}
          >
            {saving ? 'Saving...' : 'Save Formula & Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}

function FeatureTogglesModal({
  activityTracking,
  staffPointsEnabled,
  autoReportEnabled,
  onToggle,
  onClose,
  loadingFeature,
  msg
}) {
  const masterOn = activityTracking?.enabled !== false;
  const voiceOn = masterOn && activityTracking?.voiceEnabled !== false;
  const chatOn = masterOn && activityTracking?.chatEnabled !== false;
  const staffOn = masterOn && staffPointsEnabled !== false;
  const autoReportOn = autoReportEnabled;

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#0d1017', border: '1px solid rgba(147,51,234,0.4)', borderRadius: '24px', padding: '30px', maxWidth: '540px', width: '100%', boxShadow: '0 16px 50px rgba(0,0,0,0.9)', animation: 'modalIn 0.3s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚡</span> Bot Activity Feature Controls
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)' }}>
              Fully turn ON or OFF any bot activity feature across this server
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>

        {/* Master Switch Card */}
        <div style={{
          background: masterOn ? 'linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(13,16,23,0.9) 100%)' : 'linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(13,16,23,0.9) 100%)',
          border: `1px solid ${masterOn ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`,
          borderRadius: '16px', padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.1rem' }}>{masterOn ? '🟢' : '🔴'}</span>
              <span style={{ fontWeight: 800, fontSize: '0.98rem', color: '#fff' }}>Master Activity Tracking</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginTop: '3px' }}>
              {masterOn ? 'Tracking is actively recording voice, chat & points.' : 'All activity tracking is completely disabled server-wide.'}
            </div>
          </div>
          <button
            onClick={() => onToggle('master', !masterOn)}
            disabled={loadingFeature === 'master'}
            style={{
              padding: '8px 18px', borderRadius: '20px', border: 'none', cursor: 'pointer',
              fontWeight: 800, fontSize: '0.82rem', fontFamily: "'Inter', sans-serif",
              background: masterOn ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: '#fff', boxShadow: '0 4px 14px rgba(0,0,0,0.4)', transition: 'all 0.2s', flexShrink: 0
            }}
          >
            {loadingFeature === 'master' ? 'Updating...' : masterOn ? 'Turn OFF All' : 'Turn ON All'}
          </button>
        </div>

        {/* Feature Switches List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '22px' }}>
          {/* Voice Tracking */}
          <FeatureToggleItem
            icon="🎙️"
            title="Voice Channel Time Tracking"
            description="Tracks minutes spent in voice channels and updates durations."
            enabled={voiceOn}
            masterEnabled={masterOn}
            loading={loadingFeature === 'voice'}
            onToggle={() => onToggle('voice', !voiceOn)}
          />

          {/* Chat Tracking */}
          <FeatureToggleItem
            icon="💬"
            title="Chat Message Tracking"
            description="Counts messages sent in all text channels."
            enabled={chatOn}
            masterEnabled={masterOn}
            loading={loadingFeature === 'chat'}
            onToggle={() => onToggle('chat', !chatOn)}
          />

          {/* Staff Points System */}
          <FeatureToggleItem
            icon="⭐"
            title="Staff Points & Role Activity System"
            description="Accumulates points for staff roles and enables point table."
            enabled={staffOn}
            masterEnabled={masterOn}
            loading={loadingFeature === 'staffPoints'}
            onToggle={() => onToggle('staffPoints', !staffOn)}
          />

          {/* Discord Live Leaderboards */}
          <FeatureToggleItem
            icon="🏆"
            title="Discord Live Auto-Updating Leaderboard"
            description="Periodically edits and syncs real-time embed in Discord channels."
            enabled={autoReportOn}
            masterEnabled={masterOn}
            loading={loadingFeature === 'autoReport'}
            onToggle={() => onToggle('autoReport', !autoReportOn)}
          />
        </div>

        {msg && (
          <div style={{ fontSize: '0.85rem', marginBottom: '16px', textAlign: 'center', color: msg.startsWith('✅') ? '#34d399' : '#f87171' }}>
            {msg}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '10px 24px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(255,255,255,0.06)', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem'
          }}>
            Done / Close
          </button>
        </div>
      </div>
    </div>
  );
}

function FeatureToggleItem({ icon, title, description, enabled, masterEnabled, loading, onToggle }) {
  const isEffectiveOn = masterEnabled && enabled;

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '14px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px'
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1rem' }}>{icon}</span>
          <span style={{ fontWeight: 700, fontSize: '0.88rem', color: isEffectiveOn ? '#fff' : 'rgba(255,255,255,0.45)' }}>{title}</span>
          <span style={{
            fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: '10px',
            background: isEffectiveOn ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
            color: isEffectiveOn ? '#4ade80' : '#f87171',
            border: `1px solid ${isEffectiveOn ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`
          }}>
            {isEffectiveOn ? 'ON' : 'OFF'}
          </span>
        </div>
        <div style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.35)', marginTop: '2px', lineHeight: 1.3 }}>
          {description}
        </div>
      </div>

      <div
        onClick={masterEnabled && !loading ? onToggle : undefined}
        style={{
          width: '46px', height: '24px', borderRadius: '12px', cursor: masterEnabled && !loading ? 'pointer' : 'not-allowed',
          position: 'relative', transition: 'background 0.2s', flexShrink: 0, opacity: masterEnabled ? 1 : 0.4,
          background: isEffectiveOn ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'rgba(255,255,255,0.12)',
          boxShadow: isEffectiveOn ? '0 0 10px rgba(34,197,94,0.3)' : 'none'
        }}
      >
        <div style={{
          position: 'absolute', top: '3px', left: isEffectiveOn ? '25px' : '3px',
          width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
          transition: 'left 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }} />
      </div>
    </div>
  );
}

function StatsSection({ guildId, guildName, channels, roles = [] }) {
  const [period, setPeriod] = useState('weekly');
  const [activeTab, setActiveTab] = useState('points');
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

  const [publishingLive, setPublishingLive] = useState(false);
  const [pubMsg, setPubMsg] = useState('');

  // Role Activity / Staff Points state
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [roleStats, setRoleStats] = useState(null);
  const [loadingRoleStats, setLoadingRoleStats] = useState(false);
  const [roleStatsError, setRoleStatsError] = useState(null);
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const [formulaForm, setFormulaForm] = useState({
    pointsPerMessage: 1,
    pointsPerVoiceMinute: 2,
    selectedRoleIds: [],
    enabled: true
  });
  const [savingFormula, setSavingFormula] = useState(false);
  const [formulaMsg, setFormulaMsg] = useState('');
  const [bonusMember, setBonusMember] = useState(null);
  const [bonusLoading, setBonusLoading] = useState(false);
  const [bonusMsg, setBonusMsg] = useState('');
  const [staffSendChannel, setStaffSendChannel] = useState('');
  const [staffSending, setStaffSending] = useState(false);
  const [staffSendMsg, setStaffSendMsg] = useState('');

  // Activity Features & Master Toggle state
  const [activityTracking, setActivityTracking] = useState({ enabled: true, voiceEnabled: true, chatEnabled: true });
  const [showFeatureToggles, setShowFeatureToggles] = useState(false);
  const [togglingFeature, setTogglingFeature] = useState(null);
  const [toggleMsg, setToggleMsg] = useState('');

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

  const loadRoleStats = useCallback(async () => {
    setLoadingRoleStats(true);
    setRoleStatsError(null);
    try {
      const data = await api.getRoleActivity(guildId, {
        roleId: selectedRoleId || undefined,
        period
      });
      setRoleStats(data);
      if (data.formula || data.settings) {
        const f = data.formula || data.settings;
        setFormulaForm({
          pointsPerMessage: f.pointsPerMessage ?? 1,
          pointsPerVoiceMinute: f.pointsPerVoiceMinute ?? 2,
          selectedRoleIds: f.selectedRoleIds || [],
          enabled: f.enabled !== false
        });
        if (!selectedRoleId && f.selectedRoleIds?.length > 0) {
          setSelectedRoleId(f.selectedRoleIds[0]);
        }
      }
    } catch (err) {
      setRoleStatsError(err.message);
    } finally {
      setLoadingRoleStats(false);
    }
  }, [guildId, selectedRoleId, period]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    if (activeTab === 'points') {
      loadRoleStats();
    }
  }, [activeTab, loadRoleStats]);

  useEffect(() => {
    api.getStatsSettings(guildId).then(d => {
      if (d.activityTracking) {
        setActivityTracking(d.activityTracking);
      }
      setAutoReport(d.autoReport || {
        enabled: false, channelId: '', voiceChannelId: '', chatChannelId: '',
        daily: false, weekly: true, monthly: true,
        dailyTime: '20:00', weeklyDay: 0, weeklyTime: '20:00', monthlyDay: 1, monthlyTime: '20:00'
      });
      if (d.staffPoints) {
        setFormulaForm(f => ({ ...f, enabled: d.staffPoints.enabled !== false }));
      }
      if (d.autoReport?.channelId) {
        setSendChannel(d.autoReport.channelId);
        setStaffSendChannel(d.autoReport.channelId);
      }
    }).catch(() => { });
  }, [guildId]);

  const handleToggleFeature = async (feature, nextVal) => {
    setTogglingFeature(feature);
    setToggleMsg('');
    try {
      const res = await api.toggleActivityFeature(guildId, feature, nextVal);
      if (res.activityTracking) setActivityTracking(res.activityTracking);
      if (res.autoReport) setAutoReport(res.autoReport);
      if (res.staffPoints) {
        setFormulaForm(f => ({ ...f, enabled: res.staffPoints.enabled !== false }));
      }
      setToggleMsg(`✅ Successfully updated ${feature} feature!`);
      loadStats();
      if (activeTab === 'points') loadRoleStats();
      setTimeout(() => setToggleMsg(''), 2500);
    } catch (err) {
      setToggleMsg(`❌ ${err.message}`);
    } finally {
      setTogglingFeature(null);
    }
  };

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
      setSendMsg('✅ Leaderboard report sent to Discord channel!');
    } catch (err) {
      setSendMsg(`❌ ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  const handlePublishLive = async () => {
    setPublishingLive(true);
    setPubMsg('');
    try {
      const res = await api.publishLiveLeaderboard(guildId);
      setPubMsg('✅ ' + (res.message || 'Live Leaderboard posted/updated in Discord!'));
    } catch (err) {
      setPubMsg(`❌ ${err.message}`);
    } finally {
      setPublishingLive(false);
    }
  };

  const handleSaveAutoReport = async () => {
    setSavingAR(true);
    setArMsg('');
    try {
      await api.saveStatsSettings(guildId, autoReport);
      setArMsg('✅ Discord Leaderboard settings saved!');
    } catch (err) {
      setArMsg(`❌ ${err.message}`);
    } finally {
      setSavingAR(false);
    }
  };

  const handleSaveFormula = async ({ pointsPerMessage, pointsPerVoiceMinute }) => {
    setSavingFormula(true);
    setFormulaMsg('');
    try {
      await api.saveStaffPointsSettings(guildId, {
        pointsPerMessage: Number(pointsPerMessage),
        pointsPerVoiceMinute: Number(pointsPerVoiceMinute),
        selectedRoleIds: selectedRoleId ? [selectedRoleId] : formulaForm.selectedRoleIds,
        enabled: formulaForm.enabled
      });
      setFormulaMsg('✅ Points formula saved!');
      loadRoleStats();
      setTimeout(() => {
        setFormulaMsg('');
        setShowFormulaModal(false);
      }, 1000);
    } catch (err) {
      setFormulaMsg(`❌ ${err.message}`);
    } finally {
      setSavingFormula(false);
    }
  };

  const handleAwardBonus = async (amount) => {
    if (!bonusMember) return;
    setBonusLoading(true);
    setBonusMsg('');
    try {
      const res = await api.giveBonusPoints(guildId, bonusMember.userId, amount);
      const newPts = res.newBonusPoints ?? res.newBonus ?? 0;
      setBonusMsg(`✅ Awarded ${amount > 0 ? '+' : ''}${amount} pts! (Bonus: ${newPts})`);
      loadRoleStats();
      setTimeout(() => {
        setBonusMember(null);
        setBonusMsg('');
      }, 1000);
    } catch (err) {
      setBonusMsg(`❌ ${err.message}`);
    } finally {
      setBonusLoading(false);
    }
  };

  const handleSendStaffReport = async () => {
    if (!staffSendChannel) return;
    setStaffSending(true);
    setStaffSendMsg('');
    try {
      await api.sendStaffPointsReport(guildId, staffSendChannel, selectedRoleId || 'all', period);
      setStaffSendMsg('✅ Staff Points report sent to Discord!');
      setTimeout(() => setStaffSendMsg(''), 4000);
    } catch (err) {
      setStaffSendMsg(`❌ ${err.message}`);
    } finally {
      setStaffSending(false);
    }
  };

  const leaderboard = stats ? (activeTab === 'voice' ? stats.voiceLeaderboard : stats.chatLeaderboard) : [];
  const topMember = leaderboard && leaderboard.length > 0 ? leaderboard[0] : null;
  const selectedRoleObj = roles.find(r => r.id === selectedRoleId);

  return (
    <div>
      {/* Period selector */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px', alignItems: 'center' }}>
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

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Master Feature Controls Button */}
          <button
            onClick={() => setShowFeatureToggles(true)}
            style={{
              padding: '8px 18px', borderRadius: '20px',
              border: `1px solid ${activityTracking?.enabled === false ? 'rgba(239,68,68,0.5)' : 'rgba(34,197,94,0.4)'}`,
              cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: '0.82rem',
              background: activityTracking?.enabled === false ? 'rgba(239,68,68,0.18)' : 'rgba(34,197,94,0.15)',
              color: activityTracking?.enabled === false ? '#f87171' : '#4ade80', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: '6px',
              boxShadow: activityTracking?.enabled === false ? '0 2px 10px rgba(239,68,68,0.2)' : '0 2px 10px rgba(34,197,94,0.2)'
            }}
          >
            <span>{activityTracking?.enabled === false ? '🔴' : '⚡'}</span>
            <span>Feature Controls</span>
            <span style={{
              fontSize: '0.68rem', padding: '1px 6px', borderRadius: '8px',
              background: activityTracking?.enabled === false ? '#ef4444' : '#22c55e', color: '#fff', fontWeight: 900
            }}>
              {activityTracking?.enabled === false ? 'OFF' : 'ACTIVE'}
            </span>
          </button>

          {activeTab === 'points' && (
            <button
              onClick={() => setShowFormulaModal(true)}
              style={{
                padding: '8px 18px', borderRadius: '20px', border: '1px solid rgba(245,158,11,0.4)',
                cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: '0.82rem',
                background: 'rgba(245,158,11,0.15)', color: '#f59e0b', transition: 'all 0.2s',
                boxShadow: '0 2px 10px rgba(245,158,11,0.15)'
              }}
            >
              ⚙️ Points Formula & Rules
            </button>
          )}

          <button onClick={() => setShowSettings(s => !s)} style={{
            padding: '8px 18px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
            fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '0.82rem', background: showSettings ? 'rgba(147,51,234,0.18)' : 'rgba(255,255,255,0.05)',
            color: showSettings ? '#c084fc' : 'rgba(255,255,255,0.6)', transition: 'all 0.2s'
          }}>
            ⚙️ Discord Bot Settings
          </button>
        </div>
      </div>

      {/* Global Master OFF warning banner */}
      {activityTracking?.enabled === false && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(239,68,68,0.22) 0%, rgba(13,16,23,0.95) 100%)',
          border: '1px solid rgba(239,68,68,0.5)', borderRadius: '14px', padding: '14px 20px',
          marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.4rem' }}>🛑</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#fca5a5' }}>
                All Server Activity Tracking is Currently Turned OFF
              </div>
              <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>
                No voice minutes, chat messages, or staff points are being recorded in this server.
              </div>
            </div>
          </div>
          <button
            onClick={() => handleToggleFeature('master', true)}
            disabled={togglingFeature === 'master'}
            style={{
              background: 'linear-gradient(135deg, #22c55e, #16a34a)', border: 'none', borderRadius: '8px',
              color: '#fff', fontWeight: 800, padding: '8px 16px', fontSize: '0.8rem', cursor: 'pointer'
            }}
          >
            {togglingFeature === 'master' ? 'Enabling...' : '⚡ Turn All Features Back ON'}
          </button>
        </div>
      )}

      {/* Auto report settings panel */}
      {showSettings && autoReport && (
        <div style={{ background: '#0e1219', border: '1px solid rgba(147,51,234,0.25)', borderRadius: '16px', padding: '24px', marginBottom: '24px', animation: 'fadeIn 0.3s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🏆</span> Live Discord Auto-Updating Leaderboard
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)' }}>
                The bot continuously calculates member voice & chat time, and auto-edits the live post in your Discord channel every 3 minutes.
              </p>
            </div>
            <button onClick={handlePublishLive} disabled={publishingLive} style={{
              padding: '8px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: '#fff', fontWeight: 700, fontSize: '0.82rem',
              boxShadow: '0 4px 14px rgba(37,99,235,0.3)', opacity: publishingLive ? 0.6 : 1
            }}>
              {publishingLive ? 'Syncing...' : '🚀 Post / Sync Live Discord Embed'}
            </button>
          </div>
          {pubMsg && <div style={{ fontSize: '0.85rem', marginBottom: '16px', color: pubMsg.startsWith('✅') ? '#22c55e' : '#f87171' }}>{pubMsg}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <label style={labelStyle}>
              <span style={labelTextStyle}>🎙️ Voice Leaderboard Channel</span>
              <select value={autoReport.voiceChannelId || autoReport.channelId} onChange={e => setAutoReport(a => ({ ...a, voiceChannelId: e.target.value }))} style={selectStyle}>
                <option value="">-- Select Channel --</option>
                {channels.map(c => <option key={c.id} value={c.id}>#{c.name}</option>)}
              </select>
            </label>

            <label style={labelStyle}>
              <span style={labelTextStyle}>💬 Chat Leaderboard Channel</span>
              <select value={autoReport.chatChannelId} onChange={e => setAutoReport(a => ({ ...a, chatChannelId: e.target.value }))} style={selectStyle}>
                <option value="">-- Same as Voice / Select Channel --</option>
                {channels.map(c => <option key={c.id} value={c.id}>#{c.name}</option>)}
              </select>
            </label>
          </div>

          <ToggleRow label="Enable Live Discord Auto-Updating (Edits post every 3 mins)" value={autoReport.enabled} onChange={v => setAutoReport(a => ({ ...a, enabled: v }))} />

          <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button onClick={handleSaveAutoReport} disabled={savingAR} style={primaryBtnStyle(savingAR)}>
              {savingAR ? 'Saving...' : '💾 Save Settings'}
            </button>
            {arMsg && <span style={{ fontSize: '0.85rem', color: arMsg.startsWith('✅') ? '#22c55e' : '#f87171' }}>{arMsg}</span>}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.04)', borderRadius: '14px', padding: '6px', marginBottom: '20px', width: 'fit-content', flexWrap: 'wrap' }}>
        {[
          {
            key: 'points',
            label: `⭐ Role Activity & Staff Points${formulaForm.enabled === false || activityTracking?.enabled === false ? ' (OFF)' : ''}`,
            activeBg: 'linear-gradient(135deg, #f59e0b, #d97706)', activeColor: '#000'
          },
          {
            key: 'voice',
            label: `🎙️ Voice Leaderboard${activityTracking?.voiceEnabled === false || activityTracking?.enabled === false ? ' (OFF)' : ''}`,
            activeBg: 'rgba(124,58,237,0.85)', activeColor: '#fff'
          },
          {
            key: 'chat',
            label: `💬 Chat Leaderboard${activityTracking?.chatEnabled === false || activityTracking?.enabled === false ? ' (OFF)' : ''}`,
            activeBg: 'rgba(37,99,235,0.85)', activeColor: '#fff'
          }
        ].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontFamily: "'Inter', sans-serif",
            fontWeight: 800, fontSize: '0.85rem', transition: 'all 0.2s',
            background: activeTab === t.key ? t.activeBg : 'transparent',
            color: activeTab === t.key ? t.activeColor : 'rgba(255,255,255,0.5)',
            boxShadow: activeTab === t.key && t.key === 'points' ? '0 4px 16px rgba(245,158,11,0.35)' : 'none'
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* VIEW 1: Role Activity & Staff Points */}
      {activeTab === 'points' && (
        <div style={{ animation: 'fadeIn 0.25s ease' }}>
          {/* Feature disabled banner for Staff Points */}
          {(formulaForm.enabled === false || activityTracking?.enabled === false) && (
            <div style={{
              background: 'linear-gradient(90deg, rgba(239,68,68,0.18) 0%, rgba(13,16,23,0.95) 100%)',
              border: '1px solid rgba(239,68,68,0.4)', borderRadius: '14px', padding: '12px 18px',
              marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#fca5a5' }}>
                    Staff Points Tracking is Currently Turned OFF
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.5)' }}>
                    Staff members will not earn points for chat messages or voice minutes while disabled.
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleToggleFeature('staffPoints', true)}
                disabled={togglingFeature === 'staffPoints'}
                style={{
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)', border: 'none', borderRadius: '8px',
                  color: '#fff', fontWeight: 800, padding: '7px 14px', fontSize: '0.78rem', cursor: 'pointer'
                }}
              >
                {togglingFeature === 'staffPoints' ? 'Enabling...' : '⚡ Turn Staff Points ON'}
              </button>
            </div>
          )}

          {/* Top Role Selector & Discord Send Bar */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(13,16,23,0.95) 100%)',
            border: '1px solid rgba(245,158,11,0.3)', borderRadius: '16px', padding: '18px 22px', marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '14px' }}>
              {/* Role Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>👑</span> Select Staff Role:
                </span>
                <select
                  value={selectedRoleId}
                  onChange={e => setSelectedRoleId(e.target.value)}
                  style={{
                    background: '#0a0d14',
                    border: '1px solid rgba(245,158,11,0.45)',
                    borderRadius: '10px',
                    padding: '8px 14px',
                    color: '#f59e0b',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    outline: 'none',
                    cursor: 'pointer',
                    minWidth: '220px'
                  }}
                >
                  <option value="">-- All Staff Roles --</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>
                      @{r.name} ({r.memberCount || 0} members)
                    </option>
                  ))}
                </select>

                {/* Member count pill */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)',
                  borderRadius: '20px', padding: '6px 14px', fontSize: '0.82rem', fontWeight: 800, color: '#f59e0b'
                }}>
                  <span>👥</span> {roleStats ? `${roleStats.totalMembers} Members in Role` : 'Loading role...'}
                </div>
              </div>

              {/* Formula Badge & Quick Edit Button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px', padding: '6px 12px', fontSize: '0.78rem', color: '#e2e8f0', fontWeight: 700
                }}>
                  <span>💬 1 Msg = +{formulaForm.pointsPerMessage} pt</span>
                  <span style={{ color: 'rgba(255,255,255,0.3)' }}>•</span>
                  <span>🎙️ 1 Min Voice = +{formulaForm.pointsPerVoiceMinute} pts</span>
                </div>
                <button
                  onClick={() => setShowFormulaModal(true)}
                  style={{
                    background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.35)',
                    borderRadius: '8px', color: '#f59e0b', padding: '6px 12px', fontSize: '0.78rem',
                    fontWeight: 800, cursor: 'pointer', fontFamily: "'Inter', sans-serif"
                  }}
                >
                  ⚙️ Change Formula
                </button>
              </div>
            </div>

            {/* Post Report to Discord channel row */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
              borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '14px', marginTop: '6px'
            }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>
                📢 Post Staff Points Table to Discord:
              </span>
              <select
                value={staffSendChannel}
                onChange={e => setStaffSendChannel(e.target.value)}
                style={{
                  background: '#0a0d14', border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px', padding: '7px 12px', color: '#fff', fontSize: '0.82rem', outline: 'none', cursor: 'pointer', minWidth: '180px'
                }}
              >
                <option value="">-- Select Discord Channel --</option>
                {channels.map(c => <option key={c.id} value={c.id}>#{c.name}</option>)}
              </select>
              <button
                onClick={handleSendStaffReport}
                disabled={staffSending || !staffSendChannel}
                style={{
                  background: !staffSendChannel ? 'rgba(245,158,11,0.3)' : 'linear-gradient(135deg,#f59e0b,#d97706)',
                  border: 'none', borderRadius: '8px', color: '#000', fontWeight: 800, padding: '7px 16px',
                  fontSize: '0.82rem', cursor: !staffSendChannel || staffSending ? 'not-allowed' : 'pointer',
                  boxShadow: staffSendChannel ? '0 2px 10px rgba(245,158,11,0.3)' : 'none'
                }}
              >
                {staffSending ? 'Posting to Discord...' : '📢 Send Staff Report'}
              </button>
              {staffSendMsg && (
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: staffSendMsg.startsWith('✅') ? '#34d399' : '#f87171' }}>
                  {staffSendMsg}
                </span>
              )}
            </div>
          </div>

          {/* KPI Summary Cards */}
          {roleStats && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: '#0d1017', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '12px', padding: '14px 18px' }}>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 700 }}>Tracked Staff in Role</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f59e0b', marginTop: '4px' }}>
                  {roleStats.totalMembers || 0}
                </div>
              </div>
              <div style={{ background: '#0d1017', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '12px', padding: '14px 18px' }}>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 700 }}>Total Points Earned</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fcd34d', marginTop: '4px' }}>
                  ⭐ {(roleStats.totalPoints || 0).toLocaleString()} PTS
                </div>
              </div>
              <div style={{ background: '#0d1017', border: '1px solid rgba(96,165,250,0.2)', borderRadius: '12px', padding: '14px 18px' }}>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 700 }}>Chat Activity</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#60a5fa', marginTop: '4px' }}>
                  {(roleStats.totalMessages || 0).toLocaleString()} <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>msgs</span>
                </div>
              </div>
              <div style={{ background: '#0d1017', border: '1px solid rgba(192,132,252,0.2)', borderRadius: '12px', padding: '14px 18px' }}>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 700 }}>Voice Activity</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#c084fc', marginTop: '4px' }}>
                  {formatMinutes(roleStats.totalVoiceMinutes || 0)}
                </div>
              </div>
            </div>
          )}

          {/* Loading state */}
          {loadingRoleStats && (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <div style={{ width: '42px', height: '42px', border: '4px solid rgba(245,158,11,0.2)', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 0.9s linear infinite', margin: '0 auto 16px' }} />
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', fontWeight: 600 }}>Calculating role activity & staff points...</p>
            </div>
          )}

          {/* Error state */}
          {roleStatsError && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '16px 20px', color: '#f87171', textAlign: 'center', marginBottom: '20px' }}>
              {roleStatsError}
            </div>
          )}

          {/* Staff Points Table */}
          {!loadingRoleStats && !roleStatsError && (
            <div style={{ background: '#0d1017', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '16px', overflow: 'hidden', padding: '16px' }}>
              {/* Header banner */}
              <div style={{
                background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px',
                padding: '12px 18px', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px'
              }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>⭐</span> Staff Points Table {selectedRoleObj ? `(@${selectedRoleObj.name})` : '(All Roles)'} — {PERIODS.find(p => p.key === period)?.label}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', marginTop: '3px' }}>
                    Points calculated strictly for members holding selected role(s) based on chat and voice duration.
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', padding: '5px 12px', borderRadius: '8px', fontWeight: 800 }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
                  Live Activity Tracking Active
                </div>
              </div>

              {/* Table Column Titles */}
              <div style={{ display: 'flex', padding: '8px 16px', marginBottom: '8px', gap: '12px', alignItems: 'center', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', fontWeight: 800, letterSpacing: '0.5px' }}>
                <div style={{ width: '38px' }}># RANK</div>
                <div style={{ flex: 1.2, marginLeft: '46px' }}>STAFF MEMBER</div>
                <div style={{ minWidth: '95px', textAlign: 'right' }}>💬 CHAT PTS</div>
                <div style={{ minWidth: '105px', textAlign: 'right' }}>🎙️ VOICE PTS</div>
                <div style={{ minWidth: '75px', textAlign: 'right' }}>🎁 BONUS</div>
                <div style={{ minWidth: '120px', textAlign: 'right' }}>⭐ TOTAL</div>
                <div style={{ minWidth: '70px', textAlign: 'center' }}>ACTION</div>
              </div>

              {/* Table Rows */}
              <div>
                {(!roleStats?.members || roleStats.members.length === 0) ? (
                  <div style={{ textAlign: 'center', padding: '50px 20px', color: 'rgba(255,255,255,0.4)' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>👑</div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>No members found with this role yet or no server activity tracked.</p>
                    <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>
                      Assign the role to your staff members in Discord or select another role above. As staff members chat or join voice, points will accumulate automatically!
                    </p>
                  </div>
                ) : (
                  roleStats.members.map(entry => (
                    <RolePointRow
                      key={entry.userId}
                      entry={entry}
                      onGiveBonus={setBonusMember}
                    />
                  ))
                )}
              </div>

              {/* Table Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px', marginTop: '12px', fontSize: '0.76rem', color: 'rgba(255,255,255,0.35)', flexWrap: 'wrap', gap: '8px' }}>
                <div>Formula: 1 Message = +{formulaForm.pointsPerMessage} PTS | 1 Min Voice = +{formulaForm.pointsPerVoiceMinute} PTS</div>
                <div>Calculated: Real-Time Live</div>
              </div>
            </div>
          )}

          {/* Bonus Points Modal */}
          {bonusMember && (
            <BonusPointsModal
              member={bonusMember}
              onClose={() => { setBonusMember(null); setBonusMsg(''); }}
              onAward={handleAwardBonus}
              loading={bonusLoading}
              msg={bonusMsg}
            />
          )}

          {/* Formula Configuration Modal */}
          {showFormulaModal && (
            <FormulaModal
              formula={formulaForm}
              onClose={() => { setShowFormulaModal(false); setFormulaMsg(''); }}
              onSave={handleSaveFormula}
              saving={savingFormula}
              msg={formulaMsg}
              roles={roles}
              selectedRoleId={selectedRoleId}
              onSelectRole={setSelectedRoleId}
            />
          )}
        </div>
      )}

      {/* VIEW 2 & 3: Standard Voice & Chat Leaderboards */}
      {activeTab !== 'points' && (
        <div>
          {/* Specific feature off banner for voice */}
          {activeTab === 'voice' && (activityTracking?.voiceEnabled === false || activityTracking?.enabled === false) && (
            <div style={{
              background: 'linear-gradient(90deg, rgba(239,68,68,0.18) 0%, rgba(13,16,23,0.95) 100%)',
              border: '1px solid rgba(239,68,68,0.4)', borderRadius: '14px', padding: '12px 18px',
              marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.2rem' }}>🎙️</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#fca5a5' }}>
                    Voice Activity Tracking is Currently Turned OFF
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.5)' }}>
                    The bot is not tracking member time spent in voice channels.
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleToggleFeature('voice', true)}
                disabled={togglingFeature === 'voice'}
                style={{
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)', border: 'none', borderRadius: '8px',
                  color: '#fff', fontWeight: 800, padding: '7px 14px', fontSize: '0.78rem', cursor: 'pointer'
                }}
              >
                {togglingFeature === 'voice' ? 'Enabling...' : '⚡ Turn Voice Tracking ON'}
              </button>
            </div>
          )}

          {/* Specific feature off banner for chat */}
          {activeTab === 'chat' && (activityTracking?.chatEnabled === false || activityTracking?.enabled === false) && (
            <div style={{
              background: 'linear-gradient(90deg, rgba(239,68,68,0.18) 0%, rgba(13,16,23,0.95) 100%)',
              border: '1px solid rgba(239,68,68,0.4)', borderRadius: '14px', padding: '12px 18px',
              marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.2rem' }}>💬</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#fca5a5' }}>
                    Chat Message Tracking is Currently Turned OFF
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.5)' }}>
                    The bot is not tracking member messages sent in text channels.
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleToggleFeature('chat', true)}
                disabled={togglingFeature === 'chat'}
                style={{
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)', border: 'none', borderRadius: '8px',
                  color: '#fff', fontWeight: 800, padding: '7px 14px', fontSize: '0.78rem', cursor: 'pointer'
                }}
              >
                {togglingFeature === 'chat' ? 'Enabling...' : '⚡ Turn Chat Tracking ON'}
              </button>
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

          {/* Stats info bar */}
          {stats && (
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
              <InfoChip label="Tracked Members" value={stats.totalTrackedMembers || 0} color="#9333ea" />
              <InfoChip label="Period" value={`${stats.startDate} → ${stats.endDate}`} color="#60a5fa" />
              <InfoChip label="Server" value={guildName} color="#f59e0b" />
              {stats.dbOffline && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.3)', borderRadius: '8px', padding: '6px 12px', fontSize: '0.78rem', color: '#facc15', fontWeight: 600 }}>
                  ⚡ Live Memory Mode (MongoDB Atlas Connecting)
                </div>
              )}
            </div>
          )}

          {/* Leaderboard Loading */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <div style={{ width: '42px', height: '42px', border: '4px solid rgba(147,51,234,0.2)', borderTopColor: '#9333ea', borderRadius: '50%', animation: 'spin 0.9s linear infinite', margin: '0 auto 16px' }} />
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>Loading stats...</p>
            </div>
          )}

          {/* Leaderboard Error */}
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '16px 20px', color: '#f87171', textAlign: 'center' }}>
              {error}
            </div>
          )}

          {/* Leaderboard Table */}
          {!loading && !error && (
            <div style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden', padding: '16px' }}>
              {/* Top User Highlight Banner */}
              <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px 18px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🏆</span> {PERIODS.find(p => p.key === period)?.label} {activeTab === 'voice' ? 'Voice Leaderboard' : 'Chat Leaderboard'}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#93c5fd', marginTop: '3px', fontWeight: 600 }}>
                    Last Week Top User: {topMember ? `@${topMember.username} (@${topMember.displayName})` : 'Calculating...'}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#22c55e', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', padding: '5px 10px', borderRadius: '8px', fontWeight: 700 }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                  Auto-Calculated Every Minute
                </div>
              </div>

              {/* Table header */}
              <div style={{ display: 'flex', padding: '8px 18px', marginBottom: '8px', gap: '14px', alignItems: 'center' }}>
                <div style={{ width: '42px', fontSize: '0.74rem', color: 'rgba(255,255,255,0.4)', fontWeight: 800, letterSpacing: '0.5px' }}>#</div>
                <div style={{ flex: 1, fontSize: '0.74rem', color: 'rgba(255,255,255,0.4)', fontWeight: 800, letterSpacing: '0.5px' }}>USER</div>
                <div style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.4)', fontWeight: 800, letterSpacing: '0.5px' }}>
                  {activeTab === 'voice' ? '⏱ TIME' : '💬 MESSAGES'}
                </div>
              </div>

              <div>
                {leaderboard.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px 20px', color: 'rgba(255,255,255,0.3)' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>{activeTab === 'voice' ? '🎙️' : '💬'}</div>
                    <p style={{ margin: 0, fontWeight: 600 }}>No {activeTab === 'voice' ? 'voice' : 'chat'} activity tracked for this period yet.</p>
                    <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.25)' }}>Join voice channels or send messages in the Discord server — calculation is 100% automatic!</p>
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

              {/* Discord style Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px', marginTop: '12px', fontSize: '0.76rem', color: 'rgba(255,255,255,0.35)', flexWrap: 'wrap', gap: '8px' }}>
                <div>Last Updated: Just now</div>
                <div>Next Reset: in 2 days</div>
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
        </div>
      )}

      {/* Bot Activity Feature Controls Modal */}
      {showFeatureToggles && (
        <FeatureTogglesModal
          activityTracking={activityTracking}
          staffPointsEnabled={formulaForm.enabled}
          autoReportEnabled={autoReport?.enabled}
          onToggle={handleToggleFeature}
          onClose={() => setShowFeatureToggles(false)}
          loadingFeature={togglingFeature}
          msg={toggleMsg}
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

/* ─────────── Boost Perks Helpers ─────────── */
function formatKeyDuration(days) {
  const d = parseInt(days) || 0;
  if (d <= 0) return { label: 'Permanent', badge: '♾️ Permanent', sub: 'Never expires', color: '#34d399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.3)' };
  if (d === 30) return { label: '1 Month', badge: '📅 30 Days (1 mo)', sub: 'Expires in 30 days', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.3)' };
  if (d === 60) return { label: '2 Months', badge: '📅 60 Days (2 mo)', sub: 'Expires in 60 days', color: '#c084fc', bg: 'rgba(192,132,252,0.12)', border: 'rgba(192,132,252,0.3)' };
  if (d === 90) return { label: '3 Months', badge: '📅 90 Days (3 mo)', sub: 'Expires in 90 days', color: '#f472b6', bg: 'rgba(244,114,182,0.12)', border: 'rgba(244,114,182,0.3)' };
  if (d === 365) return { label: '1 Year', badge: '📅 1 Year (365d)', sub: 'Expires in 365 days', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' };
  return { label: `${d} Days`, badge: `⏳ ${d} Days`, sub: `Expires in ${d} days`, color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.3)' };
}

function formatExpiryStatus(item) {
  if (item.status !== 'redeemed') return null;
  if (item.isExpired) {
    return {
      text: '❌ Expired & Removed',
      sub: item.expiredAt ? `on ${new Date(item.expiredAt).toLocaleDateString()}` : 'Role removed automatically',
      color: '#f87171',
      bg: 'rgba(239,68,68,0.14)',
      border: 'rgba(239,68,68,0.3)'
    };
  }
  if (!item.roleExpiresAt) {
    return {
      text: '♾️ Permanent Role',
      sub: 'Never expires',
      color: '#34d399',
      bg: 'rgba(52,211,153,0.14)',
      border: 'rgba(52,211,153,0.3)'
    };
  }

  const diffMs = new Date(item.roleExpiresAt).getTime() - Date.now();
  if (diffMs <= 0) {
    return {
      text: '⏳ Expiring Soon...',
      sub: 'Processing removal',
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.14)',
      border: 'rgba(245,158,11,0.3)'
    };
  }

  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return {
    text: `🟣 Active (${diffDays}d left)`,
    sub: `Expires on ${new Date(item.roleExpiresAt).toLocaleDateString()}`,
    color: '#c084fc',
    bg: 'rgba(192,132,252,0.14)',
    border: 'rgba(192,132,252,0.3)'
  };
}

/* ─────────── Boost Perks Section ─────────── */
function BoostPerksSection({ guildId, guildName, channels, roles, user }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState({
    enabled: true,
    redeemChannelId: '',
    logChannelId: '',
    dmMessage: '🎉 **Thank you for boosting {server}!**\n\nHere is your exclusive custom role perk code:\n🔑 **`{code}`**\n⏱️ **Validity:** {duration}\n\nHead over to {channel} and use `!redeem {code}` or `!radeem {code}` to customize and create your personal custom role with emojis & color!',
    baseRoleId: '',
    autoSendKeyDuration: 'any'
  });
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    sent: 0,
    redeemed: 0,
    permanent: 0,
    oneMonth: 0,
    twoMonths: 0,
    customDuration: 0,
    expired: 0
  });
  const [codes, setCodes] = useState([]);
  const [activeTab, setActiveTab] = useState('codes'); // 'codes' | 'settings'

  const [savingSettings, setSavingSettings] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [testingAutoDm, setTestingAutoDm] = useState(false);
  const [testDmMsg, setTestDmMsg] = useState('');

  // Modals
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [manualSendCode, setManualSendCode] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDuration, setFilterDuration] = useState('all'); // 'all' | '0' | '30' | '60' | 'custom' | 'expired'
  const [copiedCode, setCopiedCode] = useState(null);
  const [deletingCodeId, setDeletingCodeId] = useState(null);

  // Custom days input state for Settings tab
  const [customDaysValue, setCustomDaysValue] = useState(30);

  const handleTestAutoDm = async () => {
    if (!user?.id) {
      alert('Your logged in user ID is not available.');
      return;
    }
    setTestingAutoDm(true);
    setTestDmMsg('');
    try {
      const res = await api.testBoostAutoDm(guildId, user.id);
      setTestDmMsg(res.message);
      if (res.stats) setStats(res.stats);
      loadData();
    } catch (err) {
      setTestDmMsg(`❌ ${err.message}`);
    } finally {
      setTestingAutoDm(false);
    }
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [settingsRes, codesRes] = await Promise.all([
        api.getBoostPerksSettings(guildId),
        api.getBoostPerksCodes(guildId)
      ]);
      if (settingsRes.settings) {
        setSettings(settingsRes.settings);
        const autoDur = settingsRes.settings.autoSendKeyDuration;
        if (autoDur !== undefined && autoDur !== 'any' && autoDur !== 0 && autoDur !== 30 && autoDur !== 60 && autoDur !== 90) {
          setCustomDaysValue(parseInt(autoDur) || 30);
        }
      }
      if (settingsRes.stats) setStats(settingsRes.stats);
      if (codesRes.codes) setCodes(codesRes.codes);
      if (codesRes.stats) setStats(codesRes.stats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [guildId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleMaster = async (nextVal) => {
    try {
      const updated = { ...settings, enabled: nextVal };
      setSettings(updated);
      await api.saveBoostPerksSettings(guildId, updated);
      setSaveMsg(`✅ Boost Perks ${nextVal ? 'Enabled' : 'Disabled'}!`);
      setTimeout(() => setSaveMsg(''), 2500);
    } catch (err) {
      setSaveMsg(`❌ ${err.message}`);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    setSaveMsg('');
    try {
      const res = await api.saveBoostPerksSettings(guildId, settings);
      setSaveMsg('✅ Boost Perks settings saved successfully!');
      if (res.settings) setSettings(res.settings);
      if (res.stats) setStats(res.stats);
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) {
      setSaveMsg(`❌ ${err.message}`);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleCopy = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDeleteCode = async (codeId) => {
    if (!window.confirm('Are you sure you want to delete this booster code from the pool?')) return;
    setDeletingCodeId(codeId);
    try {
      const res = await api.deleteBoostCode(guildId, codeId);
      if (res.stats) setStats(res.stats);
      setCodes(prev => prev.filter(c => (c._id && c._id !== codeId) && c.code !== codeId));
    } catch (err) {
      alert('Delete failed: ' + err.message);
    } finally {
      setDeletingCodeId(null);
    }
  };

  // Filtered codes list
  const filteredCodes = codes.filter(c => {
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;

    const days = c.durationDays || 0;
    if (filterDuration === '0' && days !== 0) return false;
    if (filterDuration === '30' && days !== 30) return false;
    if (filterDuration === '60' && days !== 60) return false;
    if (filterDuration === 'custom' && [0, 30, 60].includes(days)) return false;
    if (filterDuration === 'expired' && !c.isExpired) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const codeMatch = c.code.toLowerCase().includes(q);
      const sentUserMatch = (c.sentTo?.username || '').toLowerCase().includes(q) || (c.sentTo?.displayName || '').toLowerCase().includes(q) || (c.sentTo?.userId || '').includes(q);
      const redeemedUserMatch = (c.redeemedBy?.username || '').toLowerCase().includes(q) || (c.redeemedBy?.displayName || '').toLowerCase().includes(q) || (c.redeemedBy?.userId || '').includes(q);
      const roleMatch = (c.customRole?.roleName || '').toLowerCase().includes(q);
      return codeMatch || sentUserMatch || redeemedUserMatch || roleMatch;
    }
    return true;
  });

  // Calculate stock count for current autoSendKeyDuration setting
  const getAutoSendStock = () => {
    const cur = settings.autoSendKeyDuration ?? 'any';
    if (cur === 'any') return { count: stats.available, label: 'All available keys in pool' };
    if (cur === 0 || cur === '0') return { count: stats.permanent || 0, label: 'Permanent keys available' };
    if (cur === 30 || cur === '30') return { count: stats.oneMonth || 0, label: '1-Month (30 Days) keys available' };
    if (cur === 60 || cur === '60') return { count: stats.twoMonths || 0, label: '2-Months (60 Days) keys available' };
    const parsed = parseInt(cur);
    const count = codes.filter(c => c.status === 'available' && (c.durationDays || 0) === parsed).length;
    return { count, label: `${parsed}-Day keys available` };
  };

  const autoSendStockInfo = getAutoSendStock();

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Top Banner / Master Switch Card */}
      <div style={{
        background: settings.enabled
          ? 'linear-gradient(135deg, rgba(244,63,94,0.14) 0%, rgba(13,16,23,0.92) 100%)'
          : 'linear-gradient(135deg, rgba(239,68,68,0.14) 0%, rgba(13,16,23,0.92) 100%)',
        border: `1px solid ${settings.enabled ? 'rgba(244,63,94,0.45)' : 'rgba(239,68,68,0.4)'}`,
        borderRadius: '20px', padding: '22px 28px', marginBottom: '24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px',
        boxShadow: settings.enabled ? '0 10px 30px rgba(244,63,94,0.15)' : 'none'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '54px', height: '54px', borderRadius: '16px',
            background: settings.enabled ? 'linear-gradient(135deg, #f43f5e, #be123c)' : 'rgba(239,68,68,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.7rem',
            boxShadow: settings.enabled ? '0 4px 18px rgba(244,63,94,0.4)' : 'none', flexShrink: 0
          }}>
            🚀
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#fff' }}>
                Server Boost Perks & Custom Roles
              </h2>
              <span style={{
                fontSize: '0.72rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 900,
                background: settings.enabled ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
                color: settings.enabled ? '#4ade80' : '#f87171',
                border: `1px solid ${settings.enabled ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`
              }}>
                {settings.enabled ? '🟢 ACTIVE & DISPATCHING' : '🔴 DISABLED'}
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: 'rgba(255,255,255,0.5)', maxWidth: '720px', lineHeight: 1.45 }}>
              Automatically send keys to members when they boost your server with customizable durations (Permanent, 1 Month, 2 Months, or Custom Days). When keys expire, their custom role is automatically removed from Discord!
            </p>
          </div>
        </div>

        <button
          onClick={() => handleToggleMaster(!settings.enabled)}
          style={{
            padding: '10px 22px', borderRadius: '12px', border: 'none', cursor: 'pointer',
            fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: '0.86rem',
            background: settings.enabled ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #22c55e, #16a34a)',
            color: '#fff', boxShadow: '0 4px 14px rgba(0,0,0,0.4)', transition: 'all 0.2s', flexShrink: 0
          }}
        >
          {settings.enabled ? '🛑 Turn OFF Boost Perks' : '⚡ Turn ON Boost Perks'}
        </button>
      </div>

      {/* Warning banner when Pool is empty */}
      {settings.enabled && stats.available === 0 && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(245,158,11,0.2) 0%, rgba(13,16,23,0.95) 100%)',
          border: '1px solid rgba(245,158,11,0.5)', borderRadius: '14px', padding: '14px 20px',
          marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.5rem' }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#fcd34d' }}>
                Code Pool is Empty! No Available Codes for New Boosters
              </div>
              <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', marginTop: '2px' }}>
                When someone boosts your server, the bot will not have a code to send. Generate or upload codes now so new boosters receive their rewards automatically.
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setShowGenerateModal(true)}
              style={{
                background: 'linear-gradient(135deg,#f59e0b,#d97706)', border: 'none', borderRadius: '8px',
                color: '#000', fontWeight: 800, padding: '8px 16px', fontSize: '0.8rem', cursor: 'pointer'
              }}
            >
              ⚡ Quick Generate Codes
            </button>
          </div>
        </div>
      )}

      {/* Quick Overview Stats Cards with Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <div style={{ background: '#0e121a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
            📦
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#fff' }}>{stats.total}</div>
            <div style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Codes in Pool</div>
          </div>
        </div>

        <div style={{ background: '#0e121a', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '16px', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#22c55e' }}>
              🟢
            </div>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#22c55e' }}>{stats.available}</div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase' }}>Available Codes</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', fontSize: '0.68rem', paddingTop: '4px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ color: '#34d399' }}>♾️ Perm: {stats.permanent || 0}</span>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
            <span style={{ color: '#60a5fa' }}>📅 1mo: {stats.oneMonth || 0}</span>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
            <span style={{ color: '#c084fc' }}>📅 2mo: {stats.twoMonths || 0}</span>
          </div>
        </div>

        <div style={{ background: '#0e121a', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '16px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', color: '#f59e0b' }}>
            🟡
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#f59e0b' }}>{stats.sent}</div>
            <div style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sent to Boosters</div>
          </div>
        </div>

        <div style={{ background: '#0e121a', border: '1px solid rgba(168,85,247,0.25)', borderRadius: '16px', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(168,85,247,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#c084fc' }}>
              🟣
            </div>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#c084fc' }}>{stats.redeemed}</div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase' }}>Roles Redeemed</div>
            </div>
          </div>
          <div style={{ fontSize: '0.68rem', color: '#f87171', paddingTop: '4px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            ❌ Expired & Automatically Removed: {stats.expired || 0}
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.04)', borderRadius: '14px', padding: '6px', marginBottom: '22px', width: 'fit-content' }}>
        <button
          onClick={() => setActiveTab('codes')}
          style={{
            padding: '10px 22px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontFamily: "'Inter', sans-serif",
            fontWeight: 800, fontSize: '0.85rem', transition: 'all 0.2s',
            background: activeTab === 'codes' ? 'linear-gradient(135deg,#f43f5e,#be123c)' : 'transparent',
            color: activeTab === 'codes' ? '#fff' : 'rgba(255,255,255,0.5)',
            boxShadow: activeTab === 'codes' ? '0 4px 16px rgba(244,63,94,0.35)' : 'none'
          }}
        >
          🔑 Codes Pool ({codes.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          style={{
            padding: '10px 22px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontFamily: "'Inter', sans-serif",
            fontWeight: 800, fontSize: '0.85rem', transition: 'all 0.2s',
            background: activeTab === 'settings' ? 'linear-gradient(135deg,#7c3aed,#9333ea)' : 'transparent',
            color: activeTab === 'settings' ? '#fff' : 'rgba(255,255,255,0.5)',
            boxShadow: activeTab === 'settings' ? '0 4px 16px rgba(124,58,237,0.35)' : 'none'
          }}
        >
          ⚙️ Booster Perks Settings
        </button>
      </div>

      {/* TAB 1: CODES POOL */}
      {activeTab === 'codes' && (
        <div style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '24px' }}>
          {/* Action Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                onClick={() => setShowGenerateModal(true)}
                style={{
                  padding: '9px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg,#f43f5e,#e11d48)', color: '#fff',
                  fontWeight: 800, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px',
                  boxShadow: '0 4px 14px rgba(244,63,94,0.35)'
                }}
              >
                <span>⚡</span> Generate Random Codes
              </button>

              <button
                onClick={() => setShowUploadModal(true)}
                style={{
                  padding: '9px 18px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)',
                  cursor: 'pointer', background: 'rgba(255,255,255,0.06)', color: '#fff',
                  fontWeight: 700, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                <span>📤</span> Upload / Paste Custom Codes
              </button>
            </div>

            {/* Search and Filters */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="🔍 Search codes or users..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px', padding: '8px 14px', color: '#fff', fontSize: '0.82rem',
                  outline: 'none', width: '200px'
                }}
              />

              {/* Status Filters */}
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '3px' }}>
                {[
                  { key: 'all', label: 'All Status' },
                  { key: 'available', label: '🟢 Available' },
                  { key: 'sent', label: '🟡 Sent' },
                  { key: 'redeemed', label: '🟣 Redeemed' }
                ].map(f => (
                  <button
                    key={f.key}
                    onClick={() => setFilterStatus(f.key)}
                    style={{
                      background: filterStatus === f.key ? 'rgba(255,255,255,0.15)' : 'transparent',
                      border: 'none', borderRadius: '7px', padding: '5px 9px', cursor: 'pointer',
                      color: filterStatus === f.key ? '#fff' : 'rgba(255,255,255,0.4)',
                      fontSize: '0.74rem', fontWeight: 700
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Duration Filter Pills */}
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '3px' }}>
                {[
                  { key: 'all', label: 'All Durations' },
                  { key: '0', label: '♾️ Perm' },
                  { key: '30', label: '📅 1mo' },
                  { key: '60', label: '📅 2mo' },
                  { key: 'expired', label: '❌ Expired' }
                ].map(d => (
                  <button
                    key={d.key}
                    onClick={() => setFilterDuration(d.key)}
                    style={{
                      background: filterDuration === d.key ? 'rgba(244,63,94,0.25)' : 'transparent',
                      border: filterDuration === d.key ? '1px solid rgba(244,63,94,0.4)' : 'none',
                      borderRadius: '7px', padding: '5px 9px', cursor: 'pointer',
                      color: filterDuration === d.key ? '#f43f5e' : 'rgba(255,255,255,0.4)',
                      fontSize: '0.74rem', fontWeight: 700
                    }}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px', color: 'rgba(255,255,255,0.4)' }}>
              <div style={{ width: '36px', height: '36px', border: '3px solid rgba(244,63,94,0.3)', borderTopColor: '#f43f5e', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
              Loading booster codes...
            </div>
          ) : filteredCodes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.3)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🔑</div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>No booster codes found matching criteria.</p>
              <p style={{ margin: '6px 0 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.2)' }}>
                Click "Generate Random Codes" or "Upload / Paste Custom Codes" to add codes to the pool.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    <th style={{ padding: '12px 14px' }}>Code</th>
                    <th style={{ padding: '12px 14px' }}>Status</th>
                    <th style={{ padding: '12px 14px' }}>Validity / Duration</th>
                    <th style={{ padding: '12px 14px' }}>Sent To (Booster)</th>
                    <th style={{ padding: '12px 14px' }}>Custom Role & Expiry Status</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCodes.map(item => {
                    const isAvailable = item.status === 'available';
                    const isSent = item.status === 'sent';
                    const isRedeemed = item.status === 'redeemed';
                    const dur = formatKeyDuration(item.durationDays);
                    const expiry = formatExpiryStatus(item);

                    return (
                      <tr key={item._id || item.code} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}>
                        {/* Code */}
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                              fontFamily: 'monospace', fontWeight: 800, fontSize: '0.92rem',
                              color: isRedeemed ? 'rgba(255,255,255,0.4)' : '#f43f5e',
                              background: 'rgba(255,255,255,0.04)', padding: '3px 8px', borderRadius: '6px'
                            }}>
                              {item.code}
                            </span>
                            <button
                              onClick={() => handleCopy(item.code)}
                              title="Copy code"
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}
                            >
                              {copiedCode === item.code ? '✅' : '📋'}
                            </button>
                          </div>
                        </td>

                        {/* Status */}
                        <td style={{ padding: '12px 14px' }}>
                          {isAvailable && (
                            <span style={{ background: 'rgba(34,197,94,0.14)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)', padding: '3px 10px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 800 }}>
                              🟢 Available
                            </span>
                          )}
                          {isSent && (
                            <span style={{ background: 'rgba(245,158,11,0.14)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)', padding: '3px 10px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 800 }}>
                              🟡 Sent to DM
                            </span>
                          )}
                          {isRedeemed && (
                            <span style={{ background: item.isExpired ? 'rgba(239,68,68,0.14)' : 'rgba(168,85,247,0.14)', color: item.isExpired ? '#f87171' : '#c084fc', border: `1px solid ${item.isExpired ? 'rgba(239,68,68,0.3)' : 'rgba(168,85,247,0.3)'}`, padding: '3px 10px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 800 }}>
                              {item.isExpired ? '❌ Expired' : '🟣 Redeemed'}
                            </span>
                          )}
                        </td>

                        {/* Validity / Duration */}
                        <td style={{ padding: '12px 14px' }}>
                          <div>
                            <span style={{
                              background: dur.bg, color: dur.color, border: `1px solid ${dur.border}`,
                              padding: '3px 10px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 800,
                              display: 'inline-block'
                            }}>
                              {dur.badge}
                            </span>
                            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>
                              {dur.sub}
                            </div>
                          </div>
                        </td>

                        {/* Sent To */}
                        <td style={{ padding: '12px 14px' }}>
                          {item.sentTo?.userId ? (
                            <div>
                              <div style={{ fontWeight: 700, color: '#fff' }}>
                                {item.sentTo.displayName || item.sentTo.username || item.sentTo.userId}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>
                                ID: {item.sentTo.userId} {item.sentTo.sentAt ? `• ${new Date(item.sentTo.sentAt).toLocaleDateString()}` : ''}
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.8rem' }}>Unassigned</span>
                          )}
                        </td>

                        {/* Custom Role & Expiry */}
                        <td style={{ padding: '12px 14px' }}>
                          {isRedeemed && item.customRole?.roleName ? (
                            <div>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '3px 9px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '4px' }}>
                                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.customRole.roleColor || '#f43f5e' }} />
                                <span style={{ fontWeight: 800, color: '#fff' }}>{item.customRole.roleName}</span>
                                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>
                                  by @{item.redeemedBy?.username || 'booster'}
                                </span>
                              </div>
                              {expiry && (
                                <div style={{ fontSize: '0.72rem', color: expiry.color, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  <span>{expiry.text}</span>
                                  <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}>• {expiry.sub}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.8rem' }}>—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            {!isRedeemed && (
                              <button
                                onClick={() => setManualSendCode(item)}
                                title="Send directly to a booster's DM"
                                style={{
                                  background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.3)',
                                  borderRadius: '6px', color: '#f43f5e', padding: '4px 8px', fontSize: '0.72rem',
                                  cursor: 'pointer', fontWeight: 700
                                }}
                              >
                                📤 Send
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteCode(item._id || item.code)}
                              disabled={deletingCodeId === (item._id || item.code)}
                              title="Delete code"
                              style={{
                                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                                borderRadius: '6px', color: '#f87171', padding: '4px 8px', fontSize: '0.72rem',
                                cursor: 'pointer', fontWeight: 700
                              }}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SETTINGS & DISCORD CONFIGURATION */}
      {activeTab === 'settings' && (
        <div style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '28px' }}>
          <h3 style={{ margin: '0 0 18px', fontSize: '1.1rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚙️</span> Boost Perks Discord Setup & Auto-Dispatch
          </h3>

          {/* 🌟 KEY DISPATCH DURATION SELECTOR CARD 🌟 */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(244,63,94,0.08) 0%, rgba(124,58,237,0.08) 100%)',
            border: '1px solid rgba(244,63,94,0.35)',
            borderRadius: '16px', padding: '20px 22px', marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '10px' }}>
              <div>
                <div style={{ fontSize: '0.98rem', fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🎁</span> Key Type Sent to Booster DM on Server Boost
                </div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>
                  When a member boosts your Discord server, which key type should be automatically claimed and sent to their DM?
                </div>
              </div>

              {/* Stock badge */}
              <div style={{
                background: autoSendStockInfo.count > 0 ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                border: `1px solid ${autoSendStockInfo.count > 0 ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`,
                borderRadius: '10px', padding: '6px 14px', fontSize: '0.78rem', fontWeight: 800,
                color: autoSendStockInfo.count > 0 ? '#4ade80' : '#f87171'
              }}>
                📦 {autoSendStockInfo.count} {autoSendStockInfo.label}
              </div>
            </div>

            {/* Selector Options */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginTop: '14px', marginBottom: '14px' }}>
              {[
                { val: 'any', title: '🔀 Any Available Key', desc: 'First available code in pool' },
                { val: 0, title: '♾️ Permanent Key', desc: 'Role never expires' },
                { val: 30, title: '📅 1 Month (30 Days)', desc: 'Auto-removed after 30 days' },
                { val: 60, title: '📅 2 Months (60 Days)', desc: 'Auto-removed after 60 days' },
                { val: 'custom', title: '⚙️ Custom Days', desc: 'Custom configured days' }
              ].map(opt => {
                const isSelected = (opt.val === 'custom')
                  ? (settings.autoSendKeyDuration !== 'any' && ![0, 30, 60].includes(parseInt(settings.autoSendKeyDuration)))
                  : (settings.autoSendKeyDuration === opt.val || (typeof opt.val === 'number' && parseInt(settings.autoSendKeyDuration) === opt.val));

                return (
                  <div
                    key={String(opt.val)}
                    onClick={() => {
                      if (opt.val === 'custom') {
                        setSettings(s => ({ ...s, autoSendKeyDuration: customDaysValue }));
                      } else {
                        setSettings(s => ({ ...s, autoSendKeyDuration: opt.val }));
                      }
                    }}
                    style={{
                      background: isSelected ? 'rgba(244,63,94,0.18)' : 'rgba(255,255,255,0.04)',
                      border: isSelected ? '1px solid #f43f5e' : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px', padding: '12px 14px', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: '0.85rem', color: isSelected ? '#f43f5e' : '#fff' }}>
                      {opt.title}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                      {opt.desc}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom Days Input if Custom selected */}
            {(settings.autoSendKeyDuration !== 'any' && ![0, 30, 60].includes(parseInt(settings.autoSendKeyDuration))) && (
              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px', maxWidth: '380px' }}>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>Custom Days:</span>
                <input
                  type="number"
                  min="1"
                  max="3650"
                  value={customDaysValue}
                  onChange={e => {
                    const v = Math.max(1, parseInt(e.target.value) || 1);
                    setCustomDaysValue(v);
                    setSettings(s => ({ ...s, autoSendKeyDuration: v }));
                  }}
                  style={{ ...inputStyle, width: '100px', fontWeight: 800 }}
                />
                <span style={{ fontSize: '0.78rem', color: '#f43f5e', fontWeight: 700 }}>
                  ({customDaysValue} days until role is removed)
                </span>
              </div>
            )}

            {/* Stock warning if empty */}
            {autoSendStockInfo.count === 0 && (
              <div style={{ marginTop: '12px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ fontSize: '0.78rem', color: '#f87171' }}>
                  ⚠️ You currently have <strong>0 available keys</strong> matching this duration in the pool. When someone boosts, the bot will fallback to any available key or alert admins.
                </div>
                <button
                  onClick={() => setShowGenerateModal(true)}
                  style={{
                    background: '#ef4444', border: 'none', borderRadius: '7px', color: '#fff',
                    padding: '6px 12px', fontSize: '0.74rem', fontWeight: 800, cursor: 'pointer'
                  }}
                >
                  ⚡ Generate Matching Keys Now
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            {/* Redeem Channel Selector */}
            <div>
              <label style={labelStyle}>
                <span style={labelTextStyle}>📍 Dedicated Booster Redeem Channel:</span>
                <select
                  value={settings.redeemChannelId || ''}
                  onChange={e => setSettings(s => ({ ...s, redeemChannelId: e.target.value }))}
                  style={selectStyle}
                >
                  <option value="">-- All Channels / Select Channel --</option>
                  {channels.map(c => <option key={c.id} value={c.id}>#{c.name}</option>)}
                </select>
              </label>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>
                Channel where boosters type <code style={{ color: '#f43f5e' }}>!redeem &lt;code&gt;</code> to claim their custom role.
              </div>
            </div>

            {/* Dedicated Log Channel Selector */}
            <div>
              <label style={labelStyle}>
                <span style={labelTextStyle}>📋 Dedicated Booster Perks Log Channel:</span>
                <select
                  value={settings.logChannelId || ''}
                  onChange={e => setSettings(s => ({ ...s, logChannelId: e.target.value }))}
                  style={selectStyle}
                >
                  <option value="">-- No Separate Log Channel (Disabled) --</option>
                  {channels.map(c => <option key={c.id} value={c.id}>#{c.name}</option>)}
                </select>
              </label>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>
                Audit logs (redemption, key validity, role creation, and automated expiry removal) are sent here.
              </div>
            </div>

            {/* Custom Role Position */}
            <div>
              <label style={labelStyle}>
                <span style={labelTextStyle}>👑 Place Custom Roles Below This Role (Optional):</span>
                <select
                  value={settings.baseRoleId || ''}
                  onChange={e => setSettings(s => ({ ...s, baseRoleId: e.target.value }))}
                  style={selectStyle}
                >
                  <option value="">-- Directly Below Bot Role (Recommended) --</option>
                  {roles.map(r => <option key={r.id} value={r.id}>@{r.name}</option>)}
                </select>
              </label>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>
                Determines role hierarchy in Discord so custom roles appear at the desired position.
              </div>
            </div>
          </div>

          {/* DM Message Template */}
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>
              <span style={labelTextStyle}>💌 Custom DM Message Sent to Server Boosters:</span>
              <textarea
                rows={5}
                value={settings.dmMessage}
                onChange={e => setSettings(s => ({ ...s, dmMessage: e.target.value }))}
                style={{
                  ...inputStyle,
                  fontFamily: 'monospace', fontSize: '0.82rem', lineHeight: 1.5,
                  resize: 'vertical'
                }}
              />
            </label>

            {/* Variables Guide */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', fontWeight: 700 }}>Variables:</span>
              {[
                { tag: '{user}', desc: 'Booster mention' },
                { tag: '{server}', desc: 'Server name' },
                { tag: '{code}', desc: 'Unique booster code' },
                { tag: '{duration}', desc: 'Validity e.g. 1 Month (30 Days) or Permanent' },
                { tag: '{channel}', desc: 'Redeem channel mention' }
              ].map(v => (
                <span key={v.tag} style={{
                  fontSize: '0.72rem', background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.3)',
                  color: '#f43f5e', padding: '2px 8px', borderRadius: '6px', fontFamily: 'monospace'
                }}>
                  {v.tag} <span style={{ color: 'rgba(255,255,255,0.4)' }}>({v.desc})</span>
                </span>
              ))}
            </div>
          </div>

          {/* Live Preview Card */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '18px', marginBottom: '24px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
              📱 Live Discord DM Embed Preview:
            </div>
            <div style={{ borderLeft: '4px solid #f43f5e', background: '#1e1f22', borderRadius: '4px', padding: '14px 16px', maxWidth: '480px' }}>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#fff', marginBottom: '6px' }}>🚀 Server Booster Perk Unlocked!</div>
              <div style={{ fontSize: '0.8rem', color: '#dbdee1', whiteSpace: 'pre-line', lineHeight: 1.45 }}>
                {settings.dmMessage
                  .replace(/{user}/g, '@BoosterMember')
                  .replace(/{server}/g, guildName || 'Our Server')
                  .replace(/{code}/g, 'BOOST-DEMO-9988')
                  .replace(/{duration}/g, settings.autoSendKeyDuration === 0 ? 'Permanent' : (settings.autoSendKeyDuration === 30 ? '1 Month (30 Days)' : (settings.autoSendKeyDuration === 60 ? '2 Months (60 Days)' : `${settings.autoSendKeyDuration || 30} Days`)))
                  .replace(/{channel}/g, settings.redeemChannelId ? `#${channels.find(c => c.id === settings.redeemChannelId)?.name || 'boosters'}` : '#server-boosters')
                }
              </div>
              <div style={{ marginTop: '12px', background: 'rgba(0,0,0,0.3)', padding: '6px 10px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.82rem', color: '#f43f5e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>🔑 BOOST-DEMO-9988</span>
                <span style={{ fontSize: '0.72rem', color: '#38bdf8' }}>
                  ⏱️ {settings.autoSendKeyDuration === 0 ? 'Permanent' : '30 Days'}
                </span>
              </div>
            </div>
          </div>

          {/* Save Button & Test Auto-DM */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              onClick={handleSaveSettings}
              disabled={savingSettings}
              style={{
                padding: '10px 24px', borderRadius: '10px', border: 'none', cursor: savingSettings ? 'not-allowed' : 'pointer',
                background: 'linear-gradient(135deg,#f43f5e,#be123c)', color: '#fff', fontWeight: 800, fontSize: '0.85rem',
                boxShadow: '0 4px 16px rgba(244,63,94,0.35)', transition: 'all 0.2s'
              }}
            >
              {savingSettings ? 'Saving...' : '💾 Save Booster Settings'}
            </button>

            <button
              onClick={handleTestAutoDm}
              disabled={testingAutoDm}
              style={{
                padding: '10px 20px', borderRadius: '10px', border: '1px solid rgba(244,63,94,0.4)',
                background: 'rgba(244,63,94,0.12)', color: '#f43f5e', cursor: testingAutoDm ? 'not-allowed' : 'pointer',
                fontWeight: 800, fontSize: '0.85rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px'
              }}
            >
              <span>🧪</span>
              <span>{testingAutoDm ? 'Sending Code to DM...' : 'Test Boost Auto-DM (Send to My Account)'}</span>
            </button>

            {saveMsg && (
              <span style={{ fontSize: '0.85rem', color: saveMsg.startsWith('✅') ? '#34d399' : '#f87171' }}>
                {saveMsg}
              </span>
            )}
            {testDmMsg && (
              <span style={{ fontSize: '0.85rem', color: testDmMsg.startsWith('🎉') ? '#34d399' : '#f87171' }}>
                {testDmMsg}
              </span>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: Generate Random Codes */}
      {showGenerateModal && (
        <GenerateCodesModal
          guildId={guildId}
          onClose={() => setShowGenerateModal(false)}
          onSuccess={(res) => {
            if (res.stats) setStats(res.stats);
            if (res.generated) setCodes(prev => [...res.generated, ...prev]);
            setShowGenerateModal(false);
          }}
        />
      )}

      {/* MODAL 2: Upload Custom Codes */}
      {showUploadModal && (
        <UploadCodesModal
          guildId={guildId}
          onClose={() => setShowUploadModal(false)}
          onSuccess={(res) => {
            if (res.stats) setStats(res.stats);
            loadData();
            setShowUploadModal(false);
          }}
        />
      )}

      {/* MODAL 3: Manual Send Code to Member */}
      {manualSendCode && (
        <ManualSendModal
          guildId={guildId}
          codeItem={manualSendCode}
          onClose={() => setManualSendCode(null)}
          onSuccess={(res) => {
            if (res.stats) setStats(res.stats);
            loadData();
            setManualSendCode(null);
          }}
        />
      )}
    </div>
  );
}

/* ─────────── Sub-modals for Boost Perks ─────────── */
function GenerateCodesModal({ guildId, onClose, onSuccess }) {
  const [count, setCount] = useState(10);
  const [prefix, setPrefix] = useState('BOOST');
  const [durationMode, setDurationMode] = useState(0); // 0 = permanent, 30 = 1 month, 60 = 2 months, 90 = 3 months, 'custom'
  const [customDays, setCustomDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const effectiveDurationDays = durationMode === 'custom' ? customDays : durationMode;

  const handleGenerate = async () => {
    setLoading(true);
    setMsg('');
    try {
      const res = await api.generateBoostCodes(guildId, {
        count,
        prefix,
        durationDays: effectiveDurationDays
      });
      setMsg(res.message);
      setTimeout(() => onSuccess(res), 800);
    } catch (err) {
      setMsg(`❌ ${err.message}`);
      setLoading(false);
    }
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#0d1017', border: '1px solid rgba(244,63,94,0.4)', borderRadius: '20px', padding: '28px', maxWidth: '480px', width: '100%', boxShadow: '0 12px 40px rgba(0,0,0,0.9)', animation: 'modalIn 0.3s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚡</span> Generate Booster Keys
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '1.3rem', cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>

        <p style={{ margin: '0 0 18px', fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.45 }}>
          Generates unique booster keys. You can set them as permanent or set an expiration duration (e.g. 1 month or 2 months) after which the role is automatically removed from Discord.
        </p>

        {/* Duration / Validity Selection */}
        <div style={{ marginBottom: '18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px' }}>
          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fff', display: 'block', marginBottom: '8px' }}>
            ⏱️ Role Validity / Duration (Automatic Expiry):
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '8px' }}>
            {[
              { mode: 0, label: '♾️ Permanent', sub: 'Never expires' },
              { mode: 30, label: '📅 1 Month (30d)', sub: 'Auto-removed in 1 mo' },
              { mode: 60, label: '📅 2 Months (60d)', sub: 'Auto-removed in 2 mo' },
              { mode: 'custom', label: '⚙️ Custom Days', sub: 'Specify days' }
            ].map(item => (
              <button
                key={String(item.mode)}
                type="button"
                onClick={() => setDurationMode(item.mode)}
                style={{
                  padding: '9px 10px', borderRadius: '8px', textAlign: 'left',
                  border: durationMode === item.mode ? '1px solid #f43f5e' : '1px solid rgba(255,255,255,0.1)',
                  background: durationMode === item.mode ? 'rgba(244,63,94,0.2)' : 'rgba(255,255,255,0.04)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: durationMode === item.mode ? '#f43f5e' : '#fff' }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                  {item.sub}
                </div>
              </button>
            ))}
          </div>

          {durationMode === 'custom' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', background: 'rgba(0,0,0,0.25)', padding: '8px 12px', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.6)' }}>Custom Days:</span>
              <input
                type="number"
                min="1"
                max="3650"
                value={customDays}
                onChange={e => setCustomDays(Math.max(1, parseInt(e.target.value) || 1))}
                style={{ ...inputStyle, width: '90px', padding: '5px 10px' }}
              />
              <span style={{ fontSize: '0.74rem', color: '#f43f5e', fontWeight: 700 }}>
                Role expires after {customDays} days
              </span>
            </div>
          )}

          <div style={{ fontSize: '0.72rem', color: '#38bdf8', marginTop: '6px' }}>
            ℹ️ {effectiveDurationDays === 0 ? 'Custom role will stay forever (never expires).' : `Custom role will automatically be deleted and removed after ${effectiveDurationDays} days.`}
          </div>
        </div>

        {/* Quantity selector */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '6px' }}>
            Number of Codes to Generate:
          </label>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            {[5, 10, 20, 50].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setCount(n)}
                style={{
                  flex: 1, padding: '7px 0', borderRadius: '8px', border: count === n ? '1px solid #f43f5e' : '1px solid rgba(255,255,255,0.1)',
                  background: count === n ? 'rgba(244,63,94,0.2)' : 'rgba(255,255,255,0.05)',
                  color: count === n ? '#f43f5e' : 'rgba(255,255,255,0.6)', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer'
                }}
              >
                {n}
              </button>
            ))}
          </div>
          <input
            type="number"
            min="1"
            max="50"
            value={count}
            onChange={e => setCount(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
            style={{ ...inputStyle, width: '100%' }}
          />
        </div>

        {/* Prefix */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '6px' }}>
            Code Prefix:
          </label>
          <input
            type="text"
            maxLength={10}
            value={prefix}
            onChange={e => setPrefix(e.target.value.toUpperCase())}
            placeholder="e.g. BOOST, VIP, KALLU"
            style={{ ...inputStyle, fontFamily: 'monospace', fontWeight: 800, letterSpacing: '0.05em' }}
          />
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>
            Preview: <code style={{ color: '#f43f5e' }}>{prefix || 'BOOST'}-7X8K-9A2M</code> ({effectiveDurationDays === 0 ? 'Permanent' : `${effectiveDurationDays} Days`})
          </div>
        </div>

        {msg && <div style={{ fontSize: '0.85rem', marginBottom: '14px', textAlign: 'center', color: msg.startsWith('❌') ? '#f87171' : '#34d399' }}>{msg}</div>}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: 600 }}>
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{
              padding: '8px 22px', borderRadius: '8px', border: 'none',
              background: 'linear-gradient(135deg,#f43f5e,#be123c)', color: '#fff',
              fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Generating...' : `Generate ${count} Codes (${effectiveDurationDays === 0 ? 'Permanent' : `${effectiveDurationDays}d`})`}
          </button>
        </div>
      </div>
    </div>
  );
}

function UploadCodesModal({ guildId, onClose, onSuccess }) {
  const [text, setText] = useState('');
  const [durationMode, setDurationMode] = useState(0); // 0 = permanent, 30 = 1 month, 60 = 2 months, 'custom'
  const [customDays, setCustomDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const effectiveDurationDays = durationMode === 'custom' ? customDays : durationMode;
  const parsedCodes = text.split(/[\r\n,]+/).map(c => c.trim().toUpperCase()).filter(c => c.length >= 3);

  const handleUpload = async () => {
    if (parsedCodes.length === 0) {
      setMsg('❌ Please enter at least 1 valid code.');
      return;
    }
    setLoading(true);
    setMsg('');
    try {
      const res = await api.uploadBoostCodes(guildId, {
        codes: parsedCodes,
        durationDays: effectiveDurationDays
      });
      setMsg(res.message);
      setTimeout(() => onSuccess(res), 800);
    } catch (err) {
      setMsg(`❌ ${err.message}`);
      setLoading(false);
    }
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px', padding: '28px', maxWidth: '480px', width: '100%', boxShadow: '0 12px 40px rgba(0,0,0,0.9)', animation: 'modalIn 0.3s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📤</span> Upload Custom Codes
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '1.3rem', cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>

        <p style={{ margin: '0 0 16px', fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.45 }}>
          Paste or type your custom codes below (one per line). Set the duration for these codes before uploading.
        </p>

        {/* Duration / Validity Selection */}
        <div style={{ marginBottom: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px' }}>
          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fff', display: 'block', marginBottom: '8px' }}>
            ⏱️ Assign Duration / Validity to Uploaded Codes:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {[
              { mode: 0, label: '♾️ Permanent', sub: 'Never expires' },
              { mode: 30, label: '📅 1 Month (30d)', sub: 'Auto-removed in 1 mo' },
              { mode: 60, label: '📅 2 Months (60d)', sub: 'Auto-removed in 2 mo' },
              { mode: 'custom', label: '⚙️ Custom Days', sub: 'Specify days' }
            ].map(item => (
              <button
                key={String(item.mode)}
                type="button"
                onClick={() => setDurationMode(item.mode)}
                style={{
                  padding: '8px 10px', borderRadius: '8px', textAlign: 'left',
                  border: durationMode === item.mode ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
                  background: durationMode === item.mode ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.04)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: durationMode === item.mode ? '#60a5fa' : '#fff' }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                  {item.sub}
                </div>
              </button>
            ))}
          </div>

          {durationMode === 'custom' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', background: 'rgba(0,0,0,0.25)', padding: '8px 12px', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.6)' }}>Custom Days:</span>
              <input
                type="number"
                min="1"
                max="3650"
                value={customDays}
                onChange={e => setCustomDays(Math.max(1, parseInt(e.target.value) || 1))}
                style={{ ...inputStyle, width: '90px', padding: '5px 10px' }}
              />
              <span style={{ fontSize: '0.74rem', color: '#60a5fa', fontWeight: 700 }}>
                {customDays} days validity
              </span>
            </div>
          )}
        </div>

        <textarea
          rows={6}
          placeholder={"VIP-GOLD-001\nBOOST-PERK-7722\nKALLU-SPECIAL-99\nPRO-BOOSTER-8844"}
          value={text}
          onChange={e => setText(e.target.value)}
          style={{
            ...inputStyle,
            fontFamily: 'monospace', fontSize: '0.82rem', lineHeight: 1.5,
            marginBottom: '8px'
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', fontSize: '0.74rem', color: 'rgba(255,255,255,0.4)' }}>
          <span>Detected: <strong style={{ color: '#f43f5e' }}>{parsedCodes.length}</strong> codes</span>
          <span>Validity: <strong style={{ color: '#60a5fa' }}>{effectiveDurationDays === 0 ? 'Permanent' : `${effectiveDurationDays} Days`}</strong></span>
        </div>

        {msg && <div style={{ fontSize: '0.85rem', marginBottom: '14px', textAlign: 'center', color: msg.startsWith('❌') ? '#f87171' : '#34d399' }}>{msg}</div>}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: 600 }}>
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={loading || parsedCodes.length === 0}
            style={{
              padding: '8px 22px', borderRadius: '8px', border: 'none',
              background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: '#fff',
              fontWeight: 800, cursor: (loading || parsedCodes.length === 0) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Uploading...' : `Upload ${parsedCodes.length} Code(s)`}
          </button>
        </div>
      </div>
    </div>
  );
}

function ManualSendModal({ guildId, codeItem, onClose, onSuccess }) {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const dur = formatKeyDuration(codeItem.durationDays);

  const handleSend = async () => {
    if (!userId.trim()) {
      setMsg('❌ Please enter a Discord User ID.');
      return;
    }
    setLoading(true);
    setMsg('');
    try {
      const res = await api.manualSendBoostCode(guildId, codeItem._id || codeItem.code, userId.trim());
      setMsg('✅ ' + res.message);
      setTimeout(() => onSuccess(res), 1000);
    } catch (err) {
      setMsg(`❌ ${err.message}`);
      setLoading(false);
    }
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#0d1017', border: '1px solid rgba(244,63,94,0.4)', borderRadius: '20px', padding: '28px', maxWidth: '440px', width: '100%', boxShadow: '0 12px 40px rgba(0,0,0,0.9)', animation: 'modalIn 0.3s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📤</span> Send Code to Booster DM
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '1.3rem', cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>

        <div style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Selected Booster Code:</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#f43f5e', fontFamily: 'monospace', marginTop: '2px' }}>{codeItem.code}</div>
          </div>
          <span style={{ background: dur.bg, color: dur.color, border: `1px solid ${dur.border}`, padding: '3px 10px', borderRadius: '10px', fontSize: '0.74rem', fontWeight: 800 }}>
            {dur.badge}
          </span>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '6px' }}>
            Recipient Discord User ID:
          </label>
          <input
            type="text"
            placeholder="e.g. 748192019482710123"
            value={userId}
            onChange={e => setUserId(e.target.value)}
            style={{ ...inputStyle, fontFamily: 'monospace' }}
          />
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>
            Right click the booster in Discord & select "Copy User ID" (Developer Mode).
          </div>
        </div>

        {msg && <div style={{ fontSize: '0.85rem', marginBottom: '14px', textAlign: 'center', color: msg.startsWith('❌') ? '#f87171' : '#34d399' }}>{msg}</div>}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: 600 }}>
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={loading || !userId.trim()}
            style={{
              padding: '8px 22px', borderRadius: '8px', border: 'none',
              background: 'linear-gradient(135deg,#f43f5e,#be123c)', color: '#fff',
              fontWeight: 800, cursor: (loading || !userId.trim()) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Sending...' : 'Send to DM'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────── Server Tag Section ─────────── */
function ServerTagSection({ guildId }) {
  const [settings, setSettings] = useState({
    enabled: false,
    channelId: '',
    messageTemplate: '🎉 **{user}** just equipped the **{tag}** tag!',
    footerText: 'You\'ve unlocked exclusive community perks 🎁',
    embedEnabled: true,
    embedColor: '#5865F2',
    showBanner: true,
    pingUser: true
  });
  const [channels, setChannels] = useState([]);
  const [channelsLoading, setChannelsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [msg, setMsg] = useState('');

  // Fetch channels directly (parent channels have no `type` field so filter breaks)
  useEffect(() => {
    setChannelsLoading(true);
    api.getChannels(guildId)
      .then(data => setChannels(Array.isArray(data) ? data : []))
      .catch(() => setChannels([]))
      .finally(() => setChannelsLoading(false));
  }, [guildId]);

  // Fetch saved settings
  useEffect(() => {
    setLoading(true);
    api.getServerTagSettings(guildId)
      .then(data => {
        if (data && Object.keys(data).length > 0) {
          setSettings(s => ({
            ...s,
            ...data,
            // Ensure footerText has a default if not saved yet
            footerText: data.footerText ?? s.footerText
          }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [guildId]);

  const save = async () => {
    setSaving(true);
    setMsg('');
    try {
      await api.saveServerTagSettings(guildId, settings);
      setMsg('✅ Settings saved successfully!');
    } catch (e) {
      setMsg('❌ ' + e.message);
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(''), 3500);
    }
  };

  const sendTest = async () => {
    setTesting(true);
    setMsg('');
    try {
      const r = await api.testServerTagAnnouncement(guildId);
      setMsg('✅ ' + (r.message || 'Test sent to channel!'));
    } catch (e) {
      setMsg('❌ ' + e.message);
    } finally {
      setTesting(false);
      setTimeout(() => setMsg(''), 4000);
    }
  };

  const card = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '16px',
    padding: '22px 24px',
    marginBottom: '16px'
  };

  const rowStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' };
  const toggle = (field) => setSettings(s => ({ ...s, [field]: !s[field] }));

  const ToggleSwitch = ({ on, onClick }) => (
    <div
      onClick={onClick}
      style={{
        width: '46px', height: '26px', borderRadius: '13px', cursor: 'pointer', position: 'relative', flexShrink: 0,
        background: on ? 'linear-gradient(135deg,#5865F2,#7289DA)' : 'rgba(255,255,255,0.12)',
        transition: 'background 0.25s', border: on ? '1px solid rgba(88,101,242,0.6)' : '1px solid rgba(255,255,255,0.15)',
        boxShadow: on ? '0 0 10px rgba(88,101,242,0.4)' : 'none'
      }}
    >
      <div style={{
        position: 'absolute', top: '3px',
        left: on ? '23px' : '3px',
        width: '18px', height: '18px', borderRadius: '50%',
        background: '#fff', transition: 'left 0.25s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.4)'
      }} />
    </div>
  );

  if (loading) return (
    <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', padding: '60px', fontSize: '0.9rem' }}>
      ⏳ Loading settings...
    </div>
  );

  const selectedChannelName = channels.find(c => c.id === settings.channelId)?.name;

  return (
    <div>

      {/* ── Live Preview Card ── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(88,101,242,0.14) 0%, rgba(13,16,23,0.97) 100%)',
        border: '1px solid rgba(88,101,242,0.3)',
        borderRadius: '16px', padding: '20px 24px', marginBottom: '24px',
        boxShadow: '0 4px 24px rgba(88,101,242,0.15)'
      }}>
        <div style={{ fontWeight: 800, fontSize: '0.82rem', color: 'rgba(88,101,242,0.9)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
          👁️ Live Preview — How it looks in Discord
        </div>
        {/* Discord-style embed mockup */}
        <div style={{
          background: '#2b2d31', borderRadius: '8px', padding: '0',
          overflow: 'hidden', maxWidth: '480px',
          borderLeft: `4px solid ${settings.embedColor || '#5865F2'}`
        }}>
          <div style={{ padding: '12px 16px 14px' }}>
            <div style={{ fontSize: '0.9rem', color: '#dbdee1', lineHeight: 1.6, marginBottom: '10px' }}>
              <span style={{ color: '#5865F2', fontWeight: 700 }}>@Miles Morales</span>
              {' (milesmorales.ftp) equipped the 🌿 🏷️ tag!'}
            </div>
            {settings.embedEnabled && settings.footerText && (
              <div style={{
                fontSize: '0.76rem', color: 'rgba(255,255,255,0.38)',
                borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'rgba(88,101,242,0.5)', flexShrink: 0 }} />
                {settings.footerText}
              </div>
            )}
          </div>
        </div>
        {selectedChannelName && (
          <div style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.3)', marginTop: '10px' }}>
            → Will be sent to <span style={{ color: '#818cf8', fontWeight: 700 }}>#{selectedChannelName}</span>
          </div>
        )}
      </div>

      {/* ── Configuration Card ── */}
      <div style={card}>
        <div style={{ fontWeight: 800, fontSize: '1rem', color: '#fff', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>⚙️</span> Server Tag Configuration
        </div>

        {/* Enable toggle */}
        <div style={rowStyle}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#fff' }}>Enable Server Tag Announcements</div>
            <div style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>Auto-send a message when a member equips a server tag</div>
          </div>
          <ToggleSwitch on={settings.enabled} onClick={() => toggle('enabled')} />
        </div>

        {/* Channel picker */}
        <div style={{ marginTop: '6px' }}>
          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.65)', display: 'block', marginBottom: '7px' }}>
            📢 Announcement Channel
          </label>
          {channelsLoading ? (
            <div style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(88,101,242,0.2)', background: 'rgba(0,0,0,0.3)', color: 'rgba(255,255,255,0.35)', fontSize: '0.87rem' }}>
              ⏳ Loading channels...
            </div>
          ) : (
            <select
              value={settings.channelId}
              onChange={e => setSettings(s => ({ ...s, channelId: e.target.value }))}
              style={{
                width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(88,101,242,0.35)',
                borderRadius: '10px', padding: '10px 14px',
                color: settings.channelId ? '#fff' : 'rgba(255,255,255,0.4)',
                fontSize: '0.88rem', fontFamily: "'Inter',sans-serif", outline: 'none', cursor: 'pointer',
                appearance: 'none', WebkitAppearance: 'none'
              }}
            >
              <option value=''>— Select a channel ({channels.length} available) —</option>
              {channels.map(c => (
                <option key={c.id} value={c.id}>#{c.name}</option>
              ))}
            </select>
          )}
          {!channelsLoading && channels.length === 0 && (
            <div style={{ fontSize: '0.73rem', color: '#f87171', marginTop: '5px' }}>
              ⚠️ No text channels found. Make sure the bot is in the server.
            </div>
          )}
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.28)', marginTop: '5px' }}>
            The announcement embed will be sent to this channel automatically.
          </div>
        </div>
      </div>

      {/* ── Message Template Card ── */}
      <div style={card}>
        <div style={{ fontWeight: 800, fontSize: '1rem', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>✏️</span> Message Template
        </div>

        {/* Main message body */}
        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.65)', display: 'block', marginBottom: '7px' }}>
          Main Announcement Text
        </label>
        <textarea
          rows={2}
          value={settings.messageTemplate}
          onChange={e => setSettings(s => ({ ...s, messageTemplate: e.target.value }))}
          placeholder='🎉 **{user}** just equipped the **{tag}** tag!'
          style={{
            width: '100%', boxSizing: 'border-box',
            background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '10px', padding: '10px 14px', color: '#fff',
            fontSize: '0.87rem', fontFamily: "'Inter',sans-serif", outline: 'none', resize: 'vertical', lineHeight: 1.5,
            marginBottom: '14px'
          }}
        />

        {/* Footer text */}
        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.65)', display: 'block', marginBottom: '7px' }}>
          Footer / Subtext (shown below the main message)
        </label>
        <input
          type='text'
          value={settings.footerText}
          onChange={e => setSettings(s => ({ ...s, footerText: e.target.value }))}
          placeholder="You've unlocked exclusive community perks 🎁"
          style={{
            width: '100%', boxSizing: 'border-box',
            background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '10px', padding: '10px 14px', color: '#fff',
            fontSize: '0.87rem', fontFamily: "'Inter',sans-serif", outline: 'none'
          }}
        />
        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.28)', marginTop: '5px', marginBottom: '12px' }}>
          This appears as the embed footer. Leave empty to hide it.
        </div>

        {/* Variable chips */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>Variables:</span>
          {['{user}', '{tag}', '{server}'].map(v => (
            <span
              key={v}
              style={{ fontSize: '0.72rem', background: 'rgba(88,101,242,0.15)', border: '1px solid rgba(88,101,242,0.3)', borderRadius: '6px', padding: '2px 9px', color: '#818cf8', fontFamily: 'monospace', cursor: 'default' }}
            >{v}</span>
          ))}
        </div>
      </div>

      {/* ── Embed Options Card ── */}
      <div style={card}>
        <div style={{ fontWeight: 800, fontSize: '1rem', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🎨</span> Embed Options
        </div>

        <div style={rowStyle}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#fff' }}>Use Rich Embed</div>
            <div style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>Send a styled Discord embed instead of plain text</div>
          </div>
          <ToggleSwitch on={settings.embedEnabled} onClick={() => toggle('embedEnabled')} />
        </div>

        <div style={rowStyle}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#fff' }}>Show Member Avatar</div>
            <div style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>Display member's avatar as thumbnail in the embed</div>
          </div>
          <ToggleSwitch on={settings.showBanner} onClick={() => toggle('showBanner')} />
        </div>

        <div style={{ ...rowStyle, marginBottom: '6px' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#fff' }}>Ping the Member</div>
            <div style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>Mention (@) the member in the announcement</div>
          </div>
          <ToggleSwitch on={settings.pingUser} onClick={() => toggle('pingUser')} />
        </div>

        {/* Color picker — only when embed is on */}
        {settings.embedEnabled && (
          <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.65)', display: 'block', marginBottom: '8px' }}>
              🎨 Embed Accent Color
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type='color'
                value={settings.embedColor}
                onChange={e => setSettings(s => ({ ...s, embedColor: e.target.value }))}
                style={{ width: '46px', height: '38px', padding: '2px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', cursor: 'pointer' }}
              />
              <input
                type='text'
                value={settings.embedColor}
                onChange={e => setSettings(s => ({ ...s, embedColor: e.target.value }))}
                placeholder='#5865F2'
                maxLength={7}
                style={{
                  flex: 1, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '8px', padding: '9px 12px', color: '#fff', fontSize: '0.87rem',
                  fontFamily: 'monospace', outline: 'none'
                }}
              />
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: settings.embedColor, border: '1px solid rgba(255,255,255,0.2)', flexShrink: 0, boxShadow: `0 0 12px ${settings.embedColor}55` }} />
            </div>
          </div>
        )}
      </div>

      {/* ── Status Message ── */}
      {msg && (
        <div style={{
          fontSize: '0.87rem', marginBottom: '14px', textAlign: 'center', padding: '12px 16px', borderRadius: '12px',
          background: msg.startsWith('✅') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          border: msg.startsWith('✅') ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(239,68,68,0.3)',
          color: msg.startsWith('✅') ? '#34d399' : '#f87171', fontWeight: 600
        }}>
          {msg}
        </div>
      )}

      {/* ── Action Buttons ── */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <button
          onClick={sendTest}
          disabled={testing || !settings.enabled || !settings.channelId}
          title={!settings.enabled ? 'Enable the feature first' : !settings.channelId ? 'Select a channel first' : 'Send a test announcement'}
          style={{
            padding: '10px 20px', borderRadius: '10px',
            border: '1px solid rgba(88,101,242,0.4)',
            background: (testing || !settings.enabled || !settings.channelId) ? 'rgba(255,255,255,0.03)' : 'rgba(88,101,242,0.15)',
            color: (testing || !settings.enabled || !settings.channelId) ? 'rgba(255,255,255,0.25)' : '#818cf8',
            fontWeight: 700, fontSize: '0.87rem',
            cursor: (testing || !settings.enabled || !settings.channelId) ? 'not-allowed' : 'pointer',
            fontFamily: "'Inter',sans-serif", transition: 'all 0.2s'
          }}
        >
          {testing ? '⏳ Sending...' : '🧪 Send Test'}
        </button>
        <button
          onClick={save}
          disabled={saving}
          style={{
            padding: '10px 28px', borderRadius: '10px', border: 'none',
            background: saving ? 'rgba(88,101,242,0.35)' : 'linear-gradient(135deg,#5865F2,#7289DA)',
            color: '#fff', fontWeight: 800, fontSize: '0.9rem',
            cursor: saving ? 'not-allowed' : 'pointer', fontFamily: "'Inter',sans-serif",
            boxShadow: saving ? 'none' : '0 4px 18px rgba(88,101,242,0.45)', transition: 'all 0.2s'
          }}
        >
          {saving ? '⏳ Saving...' : '💾 Save Settings'}
        </button>
      </div>
    </div>
  );
}

/* ─────────── Main Dashboard ─────────── */
export default function Dashboard({ guildId, guildName, guildIcon, memberCount, onBack, user, onLogout }) {
  const [channels, setChannels] = useState([]);
  const [roles, setRoles] = useState([]);
  const [activeSection, setActiveSection] = useState('stats'); // 'stats' | 'boostPerks'

  const iconUrl = guildIcon || null;
  const abbreviation = guildName ? guildName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '??';

  const avatarUrl = user?.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
    : `https://cdn.discordapp.com/embed/avatars/0.png`;

  useEffect(() => {
    api.getChannels(guildId).then(setChannels).catch(() => { });
    api.getRoles(guildId).then(setRoles).catch(() => { });
  }, [guildId]);

  const NAV_ITEMS = [
    { key: 'stats', label: '📊 Server Activity', icon: '📊' },
    { key: 'boostPerks', label: '🚀 Boost Perks', icon: '🚀', isNew: true },
    { key: 'serverTag', label: '🏷️ Server Tag', icon: '🏷️', isNew: true }
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
      <div style={{ flex: 1, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '32px 20px' }}>
        {/* Top Section Navigation Switcher */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px', flexWrap: 'wrap' }}>
          {NAV_ITEMS.map(item => {
            const isActive = activeSection === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveSection(item.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 24px', borderRadius: '14px',
                  border: isActive
                    ? (item.key === 'boostPerks' ? '1px solid rgba(244,63,94,0.6)' : item.key === 'serverTag' ? '1px solid rgba(88,101,242,0.6)' : '1px solid rgba(147,51,234,0.6)')
                    : '1px solid rgba(255,255,255,0.08)',
                  background: isActive
                    ? (item.key === 'boostPerks'
                      ? 'linear-gradient(135deg, rgba(244,63,94,0.25) 0%, rgba(13,16,23,0.95) 100%)'
                      : item.key === 'serverTag'
                        ? 'linear-gradient(135deg, rgba(88,101,242,0.25) 0%, rgba(13,16,23,0.95) 100%)'
                        : 'linear-gradient(135deg, rgba(147,51,234,0.25) 0%, rgba(13,16,23,0.95) 100%)')
                    : 'rgba(255,255,255,0.04)',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
                  fontWeight: 800, fontSize: '0.92rem', cursor: 'pointer', transition: 'all 0.2s',
                  boxShadow: isActive
                    ? (item.key === 'boostPerks' ? '0 4px 20px rgba(244,63,94,0.25)' : item.key === 'serverTag' ? '0 4px 20px rgba(88,101,242,0.25)' : '0 4px 20px rgba(147,51,234,0.25)')
                    : 'none'
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                <span>{item.label}</span>
                {item.isNew && (
                  <span style={{
                    fontSize: '0.66rem', background: 'linear-gradient(135deg,#f43f5e,#be123c)', color: '#fff',
                    padding: '2px 7px', borderRadius: '10px', fontWeight: 900, letterSpacing: '0.04em'
                  }}>
                    NEW
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Section 1: Server Activity Stats */}
        {activeSection === 'stats' && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ margin: '0 0 6px', fontSize: '1.8rem', fontWeight: 900, background: 'linear-gradient(135deg,#e2c5ff 0%,#c084fc 50%,#9333ea 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                📊 Member Activity Stats
              </h1>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
                Track voice time and message activity for every member in your server
              </p>
            </div>
            <StatsSection guildId={guildId} guildName={guildName} channels={channels} roles={roles} />
          </div>
        )}

        {/* Section 2: Boost Perks */}
        {activeSection === 'boostPerks' && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ margin: '0 0 6px', fontSize: '1.8rem', fontWeight: 900, background: 'linear-gradient(135deg,#fecdd3 0%,#fb7185 50%,#f43f5e 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                🚀 Server Boost Perks
              </h1>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
                Manage automated reward codes for server boosters and custom role redemption
              </p>
            </div>
            <BoostPerksSection guildId={guildId} guildName={guildName} channels={channels} roles={roles} user={user} />
          </div>
        )}

        {/* Section 3: Server Tag */}
        {activeSection === 'serverTag' && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ margin: '0 0 6px', fontSize: '1.8rem', fontWeight: 900, background: 'linear-gradient(135deg,#c7d2fe 0%,#818cf8 50%,#5865F2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                🏷️ Server Tag Announcements
              </h1>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
                Auto-announce when members equip your server tag — just like in the image below
              </p>
            </div>
            <ServerTagSection guildId={guildId} channels={channels} />
          </div>
        )}
      </div>
    </div>
  );
}
