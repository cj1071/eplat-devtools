import { useState, useEffect } from 'react';
import type { ActiveTabStatus, SidepanelPortMessage } from '@/lib/editor-status';
import SnippetTab from './components/SnippetTab';
import ClipboardTab from './components/ClipboardTab';
import SettingsTab from './components/SettingsTab';

type TabKey = 'snippets' | 'clipboard' | 'settings';

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'snippets', label: '代码片段', icon: '</>' },
  { key: 'clipboard', label: '剪贴板', icon: '📋' },
  { key: 'settings', label: '设置', icon: '⚙️' },
];

const DEFAULT_TAB_STATUS: ActiveTabStatus = {
  canInsert: false,
  reason: '正在检测当前标签页状态...',
  tabTitle: '未连接',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('snippets');
  const [activeTabStatus, setActiveTabStatus] =
    useState<ActiveTabStatus>(DEFAULT_TAB_STATUS);

  useEffect(() => {
    // 建立长连接，用于接收 Background 的控制指令（如关闭 sidepanel）
    const port = chrome.runtime.connect({ name: 'sidepanel_port' });
    const handlePortMessage = (msg: SidepanelPortMessage) => {
      if (msg.type === 'CLOSE_SIDEPANEL') {
        window.close();
      }

      if (msg.type === 'ACTIVE_TAB_STATUS') {
        setActiveTabStatus(msg.payload);
      }
    };

    port.onMessage.addListener(handlePortMessage);
    return () => {
      port.onMessage.removeListener(handlePortMessage);
      port.disconnect();
    };
  }, []);

  return (
    <div className="app">
      {/* 导航栏 */}
      <nav className="tab-bar">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* 内容区 */}
      <main className="tab-content">
        {activeTab === 'snippets' && <SnippetTab activeTabStatus={activeTabStatus} />}
        {activeTab === 'clipboard' && <ClipboardTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </main>
    </div>
  );
}
