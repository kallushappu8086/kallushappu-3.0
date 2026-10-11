import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';

const COLOR_PRESETS = [
  { name: 'Purple', hex: '#a855f7' },
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'Cyan', hex: '#06b6d4' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Rose', hex: '#f43f5e' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Neon Blue', hex: '#2563eb' }
];

const VARIABLE_TAGS = [
  { tag: '{user}', desc: 'Member mention (@user)' },
  { tag: '{username}', desc: 'Discord username' },
  { tag: '{displayName}', desc: 'Server nickname / display name' },
  { tag: '{server}', desc: 'Server name' },
  { tag: '{tag}', desc: 'Adopted server tag' },
  { tag: '{count}', desc: 'Total tag supporters count' },
  { tag: '{user_avatar}', desc: "Member's profile picture URL" },
  { tag: '{server_icon}', desc: "Server's icon URL" }
];

export default function ServerTagSection({ guildId, guildName, channels = [], roles = [], user }) {
  const [activeTab, setActiveTab] = useState('settings'); // 'settings' | 'members'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [testing, setTesting] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null); // { type: 'success' | 'error', text: '' }

  const [settings, setSettings] = useState({
    enabled: false,
    tag: '',
    caseSensitive: false,
    channelId: '',
    message: '🎉 Congratulations {user}! Thank you for adopting the **{server}** tag! 🏷️',
    embedEnabled: true,
    embedTitle: '🏷️ New Server Tag Supporter!',
    embedColor: '#a855f7',
    embedDescription: 'A huge shoutout to {user} for repping **{server}** in their name! We appreciate your continuous support and love! 👑',
    embedThumbnail: '{user_avatar}',
    embedImage: '',
    embedFooter: '{server} • Tag Supporter #{count}',
    pingUser: true,
    roleId: '',
    removeRoleOnTagRemove: true,
    dmEnabled: false,
    dmMessage: 'Thank you for putting the **{server}** tag in your name! You are now an official supporter! 💖',
    logChannelId: ''
  });

  const [stats, setStats] = useState({
    currentTagged: 0,
    totalAllTime: 0,
    rolesGiven: 0
  });

  // Members list state
  const [members, setMembers] = useState([]);
  const [membersTotal, setMembersTotal] = useState(0);
  const [membersPage, setMembersPage] = useState(1);
  const [membersFilter, setMembersFilter] = useState('active'); // 'active' | 'removed' | 'all'
  const [membersSearch, setMembersSearch] = useState('');
  const [membersLoading, setMembersLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Load initial settings and stats
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getServerTagSettings(guildId);
      if (res.settings) {
        setSettings(s => ({ ...s, ...res.settings }));
      }
      if (res.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error('Failed to load server tag settings:', err);
      setStatusMsg({ type: 'error', text: err.message || 'Failed to load Server Tag settings' });
    } finally {
      setLoading(false);
    }
  }, [guildId]);

  // Load tagged members
  const loadMembers = useCallback(async () => {
    setMembersLoading(true);
    try {
      const res = await api.getServerTagMembers(guildId, {
        search: membersSearch,
        filter: membersFilter,
        page: membersPage,
        limit: 30
      });
      setMembers(res.members || []);
      setMembersTotal(res.total || 0);
      if (res.stats) setStats(res.stats);
    } catch (err) {
      console.error('Failed to load tagged members:', err);
    } finally {
      setMembersLoading(false);
    }
  }, [guildId, membersSearch, membersFilter, membersPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (activeTab === 'members') {
      loadMembers();
    }
  }, [activeTab, loadMembers]);

  const showToast = (type, text) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const res = await api.saveServerTagSettings(guildId, settings);
      if (res.settings) setSettings(res.settings);
      if (res.stats) setStats(res.stats);
      showToast('success', '✅ Server Tag configuration saved successfully!');
    } catch (err) {
      showToast('error', `❌ ${err.message || 'Failed to save settings'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleMaster = async (nextVal) => {
    const updated = { ...settings, enabled: nextVal };
    setSettings(updated);
    try {
      await api.saveServerTagSettings(guildId, updated);
      showToast('success', `✅ Server Tag system ${nextVal ? 'ENABLED' : 'DISABLED'}!`);
    } catch (err) {
      showToast('error', `❌ ${err.message}`);
    }
  };

  const handleSyncMembers = async () => {
    if (!settings.tag?.trim()) {
      showToast('error', '⚠️ Please configure and save a Server Tag first before running sync!');
      return;
    }
    setSyncing(true);
    try {
      const res = await api.syncServerTagMembers(guildId, { assignRoles: true });
      showToast('success', `🎉 ${res.message || 'Sync complete!'}`);
      if (res.stats) setStats(res.stats);
      if (activeTab === 'members') {
        loadMembers();
      }
    } catch (err) {
      showToast('error', `❌ ${err.message || 'Sync failed'}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleTestAnnouncement = async () => {
    if (!settings.channelId) {
      showToast('error', '⚠️ Please select an Announcement Channel first!');
      return;
    }
    setTesting(true);
    try {
      const res = await api.sendTestServerTagAnnouncement(guildId, {
        channelId: settings.channelId,
        customMessage: settings.message,
        testDm: true
      });
      showToast('success', `📢 ${res.message || 'Test announcement dispatched to channel and DM!'}`);
    } catch (err) {
      showToast('error', `❌ ${err.message || 'Test failed'}`);
    } finally {
      setTesting(false);
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Preview formatting
  const previewUser = user?.global_name || user?.username || 'SupporterName';
  const previewUserMention = `@${user?.username || 'Supporter'}`;
  const previewAvatar = user?.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`
    : 'https://cdn.discordapp.com/embed/avatars/0.png';

  const replacePreview = (text) => {
    if (!text) return '';
    return text
      .replace(/{user}/gi, previewUserMention)
      .replace(/{username}/gi, user?.username || 'Supporter')
      .replace(/{displayName}/gi, previewUser)
      .replace(/{server}/gi, guildName || 'Server')
      .replace(/{tag}/gi, settings.tag || 'KS')
      .replace(/{count}/gi, String(stats.currentTagged || 1))
      .replace(/{user_avatar}/gi, previewAvatar)
      .replace(/{server_icon}/gi, '');
  };

  const selectedChannel = channels.find(c => c.id === settings.channelId);
  const selectedRole = roles.find(r => r.id === settings.roleId);

  // Common styles
  const inputStyle = {
    width: '100%',
    padding: '11px 14px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(0,0,0,0.35)',
    color: '#fff',
    fontSize: '0.88rem',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: "'Inter', sans-serif"
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.82rem',
    fontWeight: 700,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: '8px'
  };

  const cardStyle = {
    background: 'rgba(15, 18, 27, 0.75)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
        <div style={{
          width: '40px', height: '40px', border: '4px solid rgba(168,85,247,0.2)',
          borderTopColor: '#a855f7', borderRadius: '50%', animation: 'spin 1s linear infinite',
          margin: '0 auto 16px'
        }} />
        <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>Loading Server Tag system data...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Toast Notification */}
      {statusMsg && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          padding: '14px 22px',
          borderRadius: '12px',
          background: statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.95)' : 'rgba(239, 68, 68, 0.95)',
          color: '#fff',
          fontWeight: 700,
          fontSize: '0.9rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(10px)',
          animation: 'slideIn 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>{statusMsg.text}</span>
          <button
            onClick={() => setStatusMsg(null)}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1rem', fontWeight: 900, padding: 0 }}
          >
            ×
          </button>
        </div>
      )}

      {/* Top Banner / Master Switch Bar */}
      <div style={{
        ...cardStyle,
        background: settings.enabled
          ? 'linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(15,18,27,0.85) 100%)'
          : 'rgba(15,18,27,0.75)',
        border: settings.enabled ? '1px solid rgba(168,85,247,0.4)' : '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '54px', height: '54px', borderRadius: '14px',
            background: settings.enabled ? 'linear-gradient(135deg,#a855f7,#7c3aed)' : 'rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem',
            boxShadow: settings.enabled ? '0 0 20px rgba(168,85,247,0.4)' : 'none',
            flexShrink: 0
          }}>
            🏷️
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, color: '#fff' }}>
                Server Tag System
              </h2>
              <span style={{
                fontSize: '0.72rem',
                padding: '3px 9px',
                borderRadius: '20px',
                fontWeight: 800,
                letterSpacing: '0.04em',
                background: settings.enabled ? 'rgba(34,197,94,0.18)' : 'rgba(255,255,255,0.1)',
                color: settings.enabled ? '#4ade80' : 'rgba(255,255,255,0.5)',
                border: settings.enabled ? '1px solid rgba(34,197,94,0.35)' : '1px solid rgba(255,255,255,0.1)'
              }}>
                {settings.enabled ? '● ACTIVE' : '○ DISABLED'}
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: 'rgba(255,255,255,0.5)' }}>
              Detect when members add the server tag to their name and post a celebration announcement to #{selectedChannel?.name || 'channel'}
            </p>
          </div>
        </div>

        {/* Master Toggle and Quick Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleToggleMaster(!settings.enabled)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 18px', borderRadius: '12px',
              background: settings.enabled ? 'rgba(239,68,68,0.15)' : 'linear-gradient(135deg,#a855f7,#7c3aed)',
              border: settings.enabled ? '1px solid rgba(239,68,68,0.4)' : 'none',
              color: settings.enabled ? '#f87171' : '#fff',
              fontWeight: 800, fontSize: '0.86rem', cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: settings.enabled ? 'none' : '0 4px 15px rgba(168,85,247,0.35)'
            }}
          >
            {settings.enabled ? 'Turn Off System' : '⚡ Enable Server Tag'}
          </button>

          <button
            onClick={handleSyncMembers}
            disabled={syncing}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 18px', borderRadius: '12px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#e2e8f0', fontWeight: 700, fontSize: '0.86rem',
              cursor: syncing ? 'not-allowed' : 'pointer', transition: 'all 0.2s'
            }}
            title="Scan entire server members list live and update database"
          >
            <span>{syncing ? '⏳ Scanning...' : '🔍 Scan & Sync'}</span>
          </button>

          <button
            onClick={handleTestAnnouncement}
            disabled={testing || !settings.channelId}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 18px', borderRadius: '12px',
              background: 'rgba(6,182,212,0.15)',
              border: '1px solid rgba(6,182,212,0.35)',
              color: '#22d3ee', fontWeight: 700, fontSize: '0.86rem',
              cursor: (testing || !settings.channelId) ? 'not-allowed' : 'pointer',
              opacity: !settings.channelId ? 0.6 : 1
            }}
            title="Send test announcement to the designated Discord channel"
          >
            <span>{testing ? '🚀 Sending...' : '🧪 Test Announcement'}</span>
          </button>

          <button
            onClick={handleSaveSettings}
            disabled={saving}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 22px', borderRadius: '12px',
              background: 'linear-gradient(135deg,#10b981,#059669)',
              border: 'none', color: '#fff',
              fontWeight: 800, fontSize: '0.86rem', cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 15px rgba(16,185,129,0.3)'
            }}
          >
            <span>{saving ? 'Saving...' : '💾 Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ ...cardStyle, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(168,85,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', color: '#c084fc' }}>
            👥
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Active Tag Supporters
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff' }}>
              {stats.currentTagged} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'rgba(255,255,255,0.4)' }}>members</span>
            </div>
          </div>
        </div>

        <div style={{ ...cardStyle, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(6,182,212,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', color: '#22d3ee' }}>
            🎯
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Target Server Tag
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#22d3ee', fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {settings.tag ? settings.tag : '(Not Set)'}
            </div>
          </div>
        </div>

        <div style={{ ...cardStyle, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', color: '#4ade80' }}>
            📢
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Announcement Channel
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {selectedChannel ? `#${selectedChannel.name}` : '(Not Configured)'}
            </div>
          </div>
        </div>

        <div style={{ ...cardStyle, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(244,63,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', color: '#fb7185' }}>
            👑
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Reward Role Perk
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: selectedRole ? (selectedRole.color !== '#000000' ? selectedRole.color : '#fff') : 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {selectedRole ? `@${selectedRole.name}` : '(None Set)'}
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Tabs: Configuration vs Tagged Members Directory */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('settings')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 20px', borderRadius: '10px',
            border: activeTab === 'settings' ? '1px solid rgba(168,85,247,0.5)' : '1px solid rgba(255,255,255,0.06)',
            background: activeTab === 'settings' ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.03)',
            color: activeTab === 'settings' ? '#fff' : 'rgba(255,255,255,0.55)',
            fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          <span>⚙️ Announcement & Settings</span>
        </button>

        <button
          onClick={() => setActiveTab('members')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 20px', borderRadius: '10px',
            border: activeTab === 'members' ? '1px solid rgba(168,85,247,0.5)' : '1px solid rgba(255,255,255,0.06)',
            background: activeTab === 'members' ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.03)',
            color: activeTab === 'members' ? '#fff' : 'rgba(255,255,255,0.55)',
            fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          <span>👥 Tagged Members Directory</span>
          <span style={{
            fontSize: '0.72rem', background: 'rgba(168,85,247,0.3)', color: '#c084fc',
            padding: '2px 8px', borderRadius: '10px', fontWeight: 800
          }}>
            {stats.currentTagged}
          </span>
        </button>
      </div>

      {/* TAB 1: SETTINGS & ANNOUNCEMENT CUSTOMIZATION */}
      {activeTab === 'settings' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', alignItems: 'start' }}>
          {/* Left Column: Form Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Card 1: Tag Identification */}
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.05rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🎯 Server Tag Setup</span>
              </h3>

              <div style={{ marginBottom: '18px' }}>
                <label style={labelStyle}>
                  Server Tag to Detect (Required):
                </label>
                <input
                  type="text"
                  placeholder="e.g. KS or [KS] or | KS (multiple tags: KS, kallushappu)"
                  value={settings.tag}
                  onChange={e => setSettings({ ...settings, tag: e.target.value })}
                  style={{ ...inputStyle, fontFamily: 'monospace', fontWeight: 700 }}
                />
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '6px' }}>
                  Enter the server vanity tag or string members must put in their name (e.g. <code>KS</code> or <code>[KS]</code>). You can specify multiple tags separated by commas.
                </div>
              </div>

              {/* Case Sensitive Switch */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.86rem', color: '#fff' }}>Case-Sensitive Matching</div>
                  <div style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                    If OFF, both "ks" and "KS" will match automatically.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.caseSensitive}
                  onChange={e => setSettings({ ...settings, caseSensitive: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#a855f7' }}
                />
              </div>

              <div style={{ marginTop: '14px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', fontSize: '0.76rem', color: '#c084fc', lineHeight: 1.4 }}>
                ℹ️ <strong>Auto-Detection Engine:</strong> Checks Server Nicknames, Global Display Names, Discord Usernames, Discord Clan Tags, and Custom Statuses.
              </div>
            </div>

            {/* Card 2: Announcement Channel & Message */}
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.05rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📢 Announcement Channel & Message</span>
              </h3>

              <div style={{ marginBottom: '18px' }}>
                <label style={labelStyle}>Announcement Channel (Where shoutouts are sent):</label>
                <select
                  value={settings.channelId}
                  onChange={e => setSettings({ ...settings, channelId: e.target.value })}
                  style={inputStyle}
                >
                  <option value="">-- Select Channel --</option>
                  {channels.map(c => (
                    <option key={c.id} value={c.id}>
                      #{c.name}
                    </option>
                  ))}
                </select>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                  When someone adopts the server tag, the bot will post the announcement here.
                </div>
              </div>

              <div style={{ marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.86rem', color: '#fff' }}>Ping/Mention Member</div>
                  <div style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                    Tags &lt;@user&gt; in the message so they get notified of the shoutout.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.pingUser}
                  onChange={e => setSettings({ ...settings, pingUser: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#a855f7' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Channel Text Message:</label>
                <textarea
                  rows={2}
                  value={settings.message}
                  onChange={e => setSettings({ ...settings, message: e.target.value })}
                  style={{ ...inputStyle, resize: 'vertical' }}
                  placeholder="e.g. 🎉 Congratulations {user}! Thank you for adopting the {server} tag! 🏷️"
                />
              </div>
            </div>

            {/* Card 3: Rich Embed Customizer */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>✨ Discord Rich Embed Card</span>
                </h3>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.8rem', color: '#fff', fontWeight: 700 }}>
                  <input
                    type="checkbox"
                    checked={settings.embedEnabled}
                    onChange={e => setSettings({ ...settings, embedEnabled: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: '#a855f7' }}
                  />
                  <span>Enable Embed</span>
                </label>
              </div>

              {settings.embedEnabled && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Embed Title */}
                  <div>
                    <label style={labelStyle}>Embed Title:</label>
                    <input
                      type="text"
                      value={settings.embedTitle}
                      onChange={e => setSettings({ ...settings, embedTitle: e.target.value })}
                      style={inputStyle}
                      placeholder="e.g. 🏷️ New Server Tag Supporter!"
                    />
                  </div>

                  {/* Embed Color Presets */}
                  <div>
                    <label style={labelStyle}>Embed Accent Color:</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      {COLOR_PRESETS.map(p => (
                        <button
                          key={p.hex}
                          type="button"
                          onClick={() => setSettings({ ...settings, embedColor: p.hex })}
                          style={{
                            width: '28px', height: '28px', borderRadius: '50%',
                            background: p.hex, border: settings.embedColor === p.hex ? '3px solid #fff' : '2px solid rgba(255,255,255,0.2)',
                            cursor: 'pointer', boxShadow: settings.embedColor === p.hex ? `0 0 10px ${p.hex}` : 'none'
                          }}
                          title={p.name}
                        />
                      ))}
                      <input
                        type="color"
                        value={settings.embedColor || '#a855f7'}
                        onChange={e => setSettings({ ...settings, embedColor: e.target.value })}
                        style={{ width: '32px', height: '32px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: 'transparent' }}
                      />
                      <input
                        type="text"
                        value={settings.embedColor}
                        onChange={e => setSettings({ ...settings, embedColor: e.target.value })}
                        style={{ ...inputStyle, width: '100px', padding: '6px 10px', fontSize: '0.82rem', fontFamily: 'monospace' }}
                      />
                    </div>
                  </div>

                  {/* Embed Description */}
                  <div>
                    <label style={labelStyle}>Embed Description (Markdown supported):</label>
                    <textarea
                      rows={3}
                      value={settings.embedDescription}
                      onChange={e => setSettings({ ...settings, embedDescription: e.target.value })}
                      style={{ ...inputStyle, resize: 'vertical' }}
                      placeholder="A huge shoutout to {user} for repping **{server}** in their name! 👑"
                    />
                  </div>

                  {/* Thumbnail & Image */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={labelStyle}>Thumbnail URL:</label>
                      <input
                        type="text"
                        value={settings.embedThumbnail}
                        onChange={e => setSettings({ ...settings, embedThumbnail: e.target.value })}
                        style={inputStyle}
                        placeholder="{user_avatar} or image link"
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Banner Image URL (Optional):</label>
                      <input
                        type="text"
                        value={settings.embedImage}
                        onChange={e => setSettings({ ...settings, embedImage: e.target.value })}
                        style={inputStyle}
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  {/* Embed Footer */}
                  <div>
                    <label style={labelStyle}>Embed Footer Text:</label>
                    <input
                      type="text"
                      value={settings.embedFooter}
                      onChange={e => setSettings({ ...settings, embedFooter: e.target.value })}
                      style={inputStyle}
                      placeholder="{server} • Tag Supporter #{count}"
                    />
                  </div>

                  {/* Dynamic Variables Cheatsheet */}
                  <div>
                    <div style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.5)', fontWeight: 700, marginBottom: '6px' }}>
                      Click any tag to copy to clipboard:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {VARIABLE_TAGS.map(v => (
                        <span
                          key={v.tag}
                          onClick={() => handleCopy(v.tag, v.tag)}
                          style={{
                            background: copiedId === v.tag ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.06)',
                            border: copiedId === v.tag ? '1px solid #22c55e' : '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '6px',
                            padding: '3px 8px',
                            fontSize: '0.74rem',
                            fontFamily: 'monospace',
                            color: copiedId === v.tag ? '#4ade80' : '#c084fc',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title={v.desc}
                        >
                          {v.tag}
                          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.68rem', fontFamily: "'Inter', sans-serif" }}>
                            {copiedId === v.tag ? '✓ Copied' : `(${v.tag.replace(/[{}]/g, '')})`}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Card 4: Supporter Role Perks */}
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.05rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>👑 Tag Supporter Role Reward</span>
              </h3>

              <div style={{ marginBottom: '18px' }}>
                <label style={labelStyle}>Assign Role Automatically (Optional):</label>
                <select
                  value={settings.roleId}
                  onChange={e => setSettings({ ...settings, roleId: e.target.value })}
                  style={inputStyle}
                >
                  <option value="">-- No Role Reward (Disabled) --</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>
                      @{r.name}
                    </option>
                  ))}
                </select>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                  If selected, members who put the tag in their name will immediately receive this role in the server.
                </div>
              </div>

              {settings.roleId && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.86rem', color: '#fff' }}>Auto-Remove Role When Tag Removed</div>
                    <div style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                      Automatically strip this role if the member removes the tag from their name.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.removeRoleOnTagRemove}
                    onChange={e => setSettings({ ...settings, removeRoleOnTagRemove: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#a855f7' }}
                  />
                </div>
              )}
            </div>

            {/* Card 5: Thank-you DM & Staff Log */}
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.05rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>💌 Direct Message & Staff Logging</span>
              </h3>

              {/* Thank you DM */}
              <div style={{ marginBottom: '18px', padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.86rem', color: '#fff' }}>Send Private Thank-You DM</div>
                    <div style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.4)' }}>Send a direct message from the bot thanking them for repping the tag.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.dmEnabled}
                    onChange={e => setSettings({ ...settings, dmEnabled: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#a855f7' }}
                  />
                </div>

                {settings.dmEnabled && (
                  <textarea
                    rows={2}
                    value={settings.dmMessage}
                    onChange={e => setSettings({ ...settings, dmMessage: e.target.value })}
                    style={{ ...inputStyle, resize: 'vertical' }}
                    placeholder="Thank you for putting the {server} tag in your name! 💖"
                  />
                )}
              </div>

              {/* Staff Log Channel */}
              <div>
                <label style={labelStyle}>Staff Audit Log Channel (Optional):</label>
                <select
                  value={settings.logChannelId}
                  onChange={e => setSettings({ ...settings, logChannelId: e.target.value })}
                  style={inputStyle}
                >
                  <option value="">-- No Separate Staff Log Channel --</option>
                  {channels.map(c => (
                    <option key={c.id} value={c.id}>
                      #{c.name}
                    </option>
                  ))}
                </select>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                  Moderation logs when someone adds or removes the server tag are logged here.
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Discord Announcement Mockup Preview */}
          <div style={{ position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              background: '#313338',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.1)',
              overflow: 'hidden',
              boxShadow: '0 12px 40px rgba(0,0,0,0.6)'
            }}>
              {/* Discord Channel Header */}
              <div style={{
                background: '#2b2d31',
                padding: '12px 18px',
                borderBottom: '1px solid rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ color: '#949ba4', fontSize: '1.2rem', fontWeight: 700 }}>#</span>
                <span style={{ color: '#f2f3f5', fontWeight: 800, fontSize: '0.92rem' }}>
                  {selectedChannel?.name || 'announcements'}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#949ba4', marginLeft: 'auto', background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: '4px' }}>
                  Discord Live Preview
                </span>
              </div>

              {/* Discord Message Area */}
              <div style={{ padding: '20px 18px', display: 'flex', gap: '14px' }}>
                {/* Bot Avatar */}
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: 'linear-gradient(135deg,#a855f7,#6366f1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.1rem', flexShrink: 0, overflow: 'hidden'
                }}>
                  🤖
                </div>

                {/* Message Body */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Author Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ color: '#f2f3f5', fontWeight: 700, fontSize: '0.94rem' }}>
                      SMOOTH Bot
                    </span>
                    <span style={{
                      background: '#5865f2', color: '#fff', fontSize: '0.62rem',
                      fontWeight: 800, padding: '1px 5px', borderRadius: '4px', textTransform: 'uppercase'
                    }}>
                      BOT
                    </span>
                    <span style={{ color: '#949ba4', fontSize: '0.74rem' }}>
                      Today at 12:00 PM
                    </span>
                  </div>

                  {/* Channel Text Message Content */}
                  <div style={{ color: '#dbdee1', fontSize: '0.94rem', lineHeight: 1.45, marginBottom: '10px' }}>
                    {settings.pingUser && (
                      <span style={{ background: 'rgba(88,101,242,0.3)', color: '#c9cdfb', padding: '1px 4px', borderRadius: '4px', marginRight: '6px', fontWeight: 600 }}>
                        {previewUserMention}
                      </span>
                    )}
                    <span>{replacePreview(settings.message) || '🎉 Adopted the server tag!'}</span>
                  </div>

                  {/* Discord Embed Card */}
                  {settings.embedEnabled && (
                    <div style={{
                      maxWidth: '520px',
                      background: '#2b2d31',
                      borderLeft: `4px solid ${settings.embedColor || '#a855f7'}`,
                      borderRadius: '4px',
                      padding: '14px 16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {/* Embed Title */}
                          {settings.embedTitle && (
                            <div style={{ color: '#fff', fontWeight: 800, fontSize: '0.98rem', marginBottom: '6px' }}>
                              {replacePreview(settings.embedTitle)}
                            </div>
                          )}

                          {/* Embed Description */}
                          {settings.embedDescription && (
                            <div style={{ color: '#dbdee1', fontSize: '0.86rem', lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>
                              {replacePreview(settings.embedDescription)}
                            </div>
                          )}
                        </div>

                        {/* Thumbnail */}
                        {settings.embedThumbnail && (
                          <div style={{ width: '64px', height: '64px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: '#1e1f22' }}>
                            <img
                              src={previewAvatar}
                              alt="Thumbnail"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Embed Banner Image */}
                      {settings.embedImage && (
                        <div style={{ borderRadius: '6px', overflow: 'hidden', maxHeight: '180px', marginTop: '4px' }}>
                          <img
                            src={settings.embedImage}
                            alt="Banner"
                            style={{ width: '100%', height: 'auto', display: 'block' }}
                            onError={e => { e.currentTarget.style.display = 'none'; }}
                          />
                        </div>
                      )}

                      {/* Embed Footer */}
                      {settings.embedFooter && (
                        <div style={{ color: '#949ba4', fontSize: '0.74rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{replacePreview(settings.embedFooter)}</span>
                          <span>•</span>
                          <span>Today at 12:00 PM</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Test Button Card */}
            <div style={{ ...cardStyle, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#fff' }}>Test Live in Discord</div>
                <div style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.4)' }}>
                  Sends this exact preview to #{selectedChannel?.name || 'channel'}.
                </div>
              </div>
              <button
                onClick={handleTestAnnouncement}
                disabled={testing || !settings.channelId}
                style={{
                  padding: '9px 18px', borderRadius: '10px',
                  background: 'linear-gradient(135deg,#06b6d4,#0891b2)',
                  border: 'none', color: '#fff', fontWeight: 800, fontSize: '0.84rem',
                  cursor: (testing || !settings.channelId) ? 'not-allowed' : 'pointer',
                  opacity: !settings.channelId ? 0.6 : 1,
                  boxShadow: '0 4px 15px rgba(6,182,212,0.3)'
                }}
              >
                {testing ? 'Sending...' : '🚀 Send Test'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TAGGED MEMBERS DIRECTORY */}
      {activeTab === 'members' && (
        <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Filter and Search Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '260px' }}>
              <input
                type="text"
                placeholder="Search tagged members by username, display name, user ID..."
                value={membersSearch}
                onChange={e => {
                  setMembersSearch(e.target.value);
                  setMembersPage(1);
                }}
                style={{ ...inputStyle, maxWidth: '400px' }}
              />
              <div style={{ display: 'flex', gap: '6px' }}>
                {['active', 'removed', 'all'].map(f => (
                  <button
                    key={f}
                    onClick={() => {
                      setMembersFilter(f);
                      setMembersPage(1);
                    }}
                    style={{
                      padding: '8px 14px', borderRadius: '8px',
                      background: membersFilter === f ? 'rgba(168,85,247,0.25)' : 'rgba(255,255,255,0.04)',
                      border: membersFilter === f ? '1px solid rgba(168,85,247,0.5)' : '1px solid rgba(255,255,255,0.08)',
                      color: membersFilter === f ? '#fff' : 'rgba(255,255,255,0.5)',
                      fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', textTransform: 'capitalize'
                    }}
                  >
                    {f === 'active' ? '🟢 Active Supporters' : (f === 'removed' ? '❌ Tag Removed' : 'All Records')}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={handleSyncMembers}
                disabled={syncing}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '9px 18px', borderRadius: '10px',
                  background: 'rgba(168,85,247,0.15)',
                  border: '1px solid rgba(168,85,247,0.35)',
                  color: '#c084fc', fontWeight: 800, fontSize: '0.84rem', cursor: syncing ? 'not-allowed' : 'pointer'
                }}
              >
                <span>{syncing ? 'Scanning...' : '🔄 Rescan Server Members'}</span>
              </button>
            </div>
          </div>

          {/* Members Table */}
          {membersLoading ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
              Loading members...
            </div>
          ) : members.length === 0 ? (
            <div style={{ padding: '50px 20px', textAlign: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
              <div style={{ fontSize: '2.4rem', marginBottom: '10px' }}>🏷️</div>
              <h4 style={{ margin: '0 0 6px', color: '#fff', fontSize: '1.1rem' }}>No Tagged Members Found</h4>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '0.86rem' }}>
                {membersSearch
                  ? 'No members matching your search query.'
                  : 'Click "Rescan Server Members" above to immediately scan all members in your server for the tag!'}
              </p>
              {!membersSearch && (
                <button
                  onClick={handleSyncMembers}
                  style={{
                    marginTop: '16px', padding: '10px 20px', borderRadius: '10px',
                    background: 'linear-gradient(135deg,#a855f7,#7c3aed)',
                    border: 'none', color: '#fff', fontWeight: 800, cursor: 'pointer'
                  }}
                >
                  🔍 Run Member Scan Now
                </button>
              )}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '12px 14px' }}>Member</th>
                    <th style={{ padding: '12px 14px' }}>Status</th>
                    <th style={{ padding: '12px 14px' }}>Detected Tag</th>
                    <th style={{ padding: '12px 14px' }}>Where Found</th>
                    <th style={{ padding: '12px 14px' }}>Adopted Date</th>
                    <th style={{ padding: '12px 14px' }}>Reward Role</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map(m => {
                    const isRemoved = !m.hasTag;
                    return (
                      <tr
                        key={m.userId}
                        style={{
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                          background: 'transparent',
                          transition: 'background 0.15s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        {/* Member Profile */}
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '36px', height: '36px', borderRadius: '50%',
                              overflow: 'hidden', background: '#222', flexShrink: 0
                            }}>
                              <img
                                src={m.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'}
                                alt={m.username}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={e => { e.currentTarget.src = 'https://cdn.discordapp.com/embed/avatars/0.png'; }}
                              />
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: '#fff' }}>
                                {m.displayName || m.username}
                              </div>
                              <div style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.4)' }}>
                                @{m.username}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td style={{ padding: '12px 14px' }}>
                          {m.hasTag ? (
                            <span style={{
                              background: 'rgba(34,197,94,0.14)', color: '#4ade80',
                              border: '1px solid rgba(34,197,94,0.3)',
                              padding: '3px 9px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 800
                            }}>
                              🟢 Active Supporter
                            </span>
                          ) : (
                            <span style={{
                              background: 'rgba(239,68,68,0.14)', color: '#f87171',
                              border: '1px solid rgba(239,68,68,0.3)',
                              padding: '3px 9px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 800
                            }}>
                              ❌ Tag Removed
                            </span>
                          )}
                        </td>

                        {/* Detected Tag */}
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{
                            background: 'rgba(168,85,247,0.15)', color: '#c084fc',
                            border: '1px solid rgba(168,85,247,0.3)',
                            padding: '3px 8px', borderRadius: '6px', fontSize: '0.8rem',
                            fontWeight: 800, fontFamily: 'monospace'
                          }}>
                            {m.detectedTag || settings.tag || 'Tag'}
                          </span>
                        </td>

                        {/* Where Found */}
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', textTransform: 'capitalize' }}>
                            {m.whereFound === 'nickname' && '📛 Server Nickname'}
                            {m.whereFound === 'displayName' && '👤 Display Name'}
                            {m.whereFound === 'username' && '🏷️ Discord Username'}
                            {m.whereFound === 'clan' && '🛡️ Discord Clan Tag'}
                            {m.whereFound === 'customStatus' && '💬 Custom Status'}
                            {!m.whereFound && 'Display Name'}
                          </span>
                        </td>

                        {/* Adopted Date */}
                        <td style={{ padding: '12px 14px', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>
                          {m.lastAdoptedAt ? new Date(m.lastAdoptedAt).toLocaleDateString() : '—'}
                        </td>

                        {/* Reward Role */}
                        <td style={{ padding: '12px 14px' }}>
                          {m.roleGiven ? (
                            <span style={{ color: '#4ade80', fontSize: '0.8rem', fontWeight: 700 }}>
                              ✅ Role Assigned
                            </span>
                          ) : (
                            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>
                              —
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                          <button
                            onClick={() => handleCopy(m.userId, m.userId)}
                            style={{
                              background: 'rgba(255,255,255,0.06)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              color: 'rgba(255,255,255,0.6)',
                              padding: '5px 10px',
                              borderRadius: '6px',
                              fontSize: '0.74rem',
                              cursor: 'pointer',
                              fontWeight: 600
                            }}
                            title="Copy Discord User ID"
                          >
                            {copiedId === m.userId ? '✓ Copied ID' : 'Copy ID'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination */}
              {membersTotal > 30 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem' }}>
                  <div>
                    Showing {members.length} of {membersTotal} members
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      disabled={membersPage <= 1}
                      onClick={() => setMembersPage(p => p - 1)}
                      style={{
                        padding: '6px 12px', borderRadius: '6px',
                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff', cursor: membersPage <= 1 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Previous
                    </button>
                    <span style={{ padding: '6px 10px', color: '#fff', fontWeight: 700 }}>
                      Page {membersPage}
                    </span>
                    <button
                      disabled={membersPage * 30 >= membersTotal}
                      onClick={() => setMembersPage(p => p + 1)}
                      style={{
                        padding: '6px 12px', borderRadius: '6px',
                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff', cursor: (membersPage * 30 >= membersTotal) ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
