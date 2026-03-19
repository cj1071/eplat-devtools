import { useState, useEffect } from 'react';
import type { ActiveTabStatus, SidepanelPortMessage } from '@/lib/editor-status';
import SnippetTab from './components/SnippetTab';
import ClipboardTab from './components/ClipboardTab';
import SettingsTab from './components/SettingsTab';
import UiIcon from './components/UiIcon';

type TabKey = 'snippets' | 'clipboard' | 'settings';

const TABS: {
  key: TabKey;
  label: string;
  description: string;
  icon: 'snippets' | 'clipboard' | 'settings';
}[] = [
  { key: 'snippets', label: '代码片段', description: '选择骨架模板并插入编辑器', icon: 'snippets' },
  { key: 'clipboard', label: '剪贴板', description: '管理 URL 相对路径历史', icon: 'clipboard' },
  { key: 'settings', label: '设置', description: '维护模板与扩展开关', icon: 'settings' },
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
  const activeTabMeta = TABS.find((tab) => tab.key === activeTab) ?? TABS[0];

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
      <header className="app-header">
        <div className="app-brand">
          <div className="app-brand-mark">
            <UiIcon name="app" size={18} />
          </div>
          <div className="app-brand-copy">
            <div className="app-eyebrow">eplat-devtools</div>
            <div className="app-title-row">
              <h1 className="app-title">{activeTabMeta.label}</h1>
              <span className={`app-status-chip ${activeTab === 'snippets' && activeTabStatus.canInsert ? 'is-ready' : ''}`}>
                {activeTab === 'snippets'
                  ? activeTabStatus.canInsert
                    ? '编辑器已就绪'
                    : '等待页面连接'
                  : 'Side Panel'}
              </span>
            </div>
            <p className="app-subtitle">{activeTabMeta.description}</p>
          </div>
        </div>

        <nav className="tab-bar" aria-label="sidepanel 导航">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span className="tab-icon">
                <UiIcon name={tab.icon} size={16} />
              </span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </nav>
      </header>

      <main className="tab-content">
        {activeTab === 'snippets' && <SnippetTab activeTabStatus={activeTabStatus} />}
        {activeTab === 'clipboard' && <ClipboardTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </main>
    </div>
  );
}
