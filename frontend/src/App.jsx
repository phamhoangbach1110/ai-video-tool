import React, { useState } from 'react';
import TrendsPage from './pages/TrendsPage';
import GeneratePage from './pages/GeneratePage';
import JobsPage from './pages/JobsPage';
import SettingsPage from './pages/SettingsPage';
import Toast from './components/Toast';
import { useToast } from './hooks/useToast';
import VideoAIPage from './pages/VideoAIPage';

const TABS = [
  { id: 'trends',   icon: '🔥', label: 'Xu hướng' },
  { id: 'generate', icon: '⚡', label: 'Tạo video' },
  { id: 'videoai',  icon: '🎥', label: 'Video AI' },
  { id: 'jobs',     icon: '📋', label: 'Lịch sử' },
  { id: 'settings', icon: '⚙️', label: 'Cài đặt' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('trends');
  const [selectedTopic, setSelectedTopic] = useState('');
  const { toast, showToast } = useToast();

  const handleSelectTrend = (topic) => {
    setSelectedTopic(topic);
    setActiveTab('generate');
    showToast(`✓ Đã chọn: ${topic.slice(0, 40)}`, 'success');
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Ambient bg */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(124,58,237,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.025) 1px,transparent 1px)',
        backgroundSize: '44px 44px'
      }} />
      <div style={{
        position: 'fixed', top: -250, right: -250, width: 700, height: 700,
        background: 'radial-gradient(circle,#7c3aed14 0%,transparent 70%)',
        pointerEvents: 'none', zIndex: 0
      }} />
      <div style={{
        position: 'fixed', bottom: -200, left: -200, width: 500, height: 500,
        background: 'radial-gradient(circle,#06b6d410 0%,transparent 70%)',
        pointerEvents: 'none', zIndex: 0
      }} />

      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '24px 0 20px', borderBottom: '1px solid #ffffff0d'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 42, height: 42,
              background: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
              borderRadius: 12, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 20,
              boxShadow: '0 0 32px #7c3aed40'
            }}>🎬</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.5 }}>
                AI <span style={{ color: '#a78bfa' }}>Video</span> Tool
              </div>
              <div style={{ fontSize: 11, color: '#5e5a80', fontFamily: 'JetBrains Mono,monospace' }}>
                Vietnamese Content Engine
              </div>
            </div>
          </div>
          <div style={{
            fontFamily: 'JetBrains Mono,monospace', fontSize: 10,
            padding: '4px 12px', borderRadius: 20,
            border: '1px solid #7c3aed80', color: '#a78bfa',
            background: '#7c3aed12', letterSpacing: 1
          }}>FREE FOREVER</div>
        </header>

        {/* Tabs */}
        <nav style={{
          display: 'flex', gap: 4, margin: '24px 0 32px',
          background: '#0e0e1c', padding: 4, borderRadius: 14,
          border: '1px solid #ffffff0d', width: 'fit-content'
        }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: '9px 20px', borderRadius: 10, fontSize: 14,
              fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
              border: 'none', fontFamily: 'Outfit,sans-serif',
              background: activeTab === tab.id
                ? 'linear-gradient(135deg,#7c3aed,#9333ea)' : 'transparent',
              color: activeTab === tab.id ? '#fff' : '#6b6890',
              boxShadow: activeTab === tab.id ? '0 0 20px #7c3aed50' : 'none',
            }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>

        {/* Pages */}
        {activeTab === 'trends' && (
          <TrendsPage onSelectTrend={handleSelectTrend} showToast={showToast} />
        )}
        {activeTab === 'generate' && (
          <GeneratePage selectedTopic={selectedTopic} showToast={showToast} />
        )}
        {activeTab === 'videoai' && (
          <VideoAIPage showToast={showToast} />
        )}
        {activeTab === 'jobs' && (
          <JobsPage showToast={showToast} />
        )}
        {activeTab === 'settings' && (
          <SettingsPage showToast={showToast} />
        )}
      </div>

      <Toast toast={toast} />
    </div>
  );
}
