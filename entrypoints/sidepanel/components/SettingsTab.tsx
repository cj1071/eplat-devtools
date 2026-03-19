import { useState, useEffect } from 'react';
import { readFabEnabled, writeFabEnabled } from '@/lib/storage';

export default function SettingsTab() {
  const [fabEnabled, setFabEnabled] = useState(true);
  const [importStatus, setImportStatus] = useState('');

  useEffect(() => {
    readFabEnabled().then(setFabEnabled);
  }, []);

  function handleFabToggle() {
    const next = !fabEnabled;
    setFabEnabled(next);
    writeFabEnabled(next);
  }

  async function handleImportJson() {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;
        const text = await file.text();
        try {
          const data = JSON.parse(text);
          // 验证格式
          if (!data.category || !Array.isArray(data.items)) {
            setImportStatus('❌ 格式错误：缺少 category 或 items');
            return;
          }
          // 存入 storage
          const stored = await chrome.storage.local.get([
            'eplat_devtools_custom_snippets',
          ]);
          const existing = stored.eplat_devtools_custom_snippets ?? [];
          existing.push(data);
          await chrome.storage.local.set({
            eplat_devtools_custom_snippets: existing,
          });
          setImportStatus(`✅ 已导入「${data.category}」（${data.items.length} 个片段）`);
        } catch {
          setImportStatus('❌ JSON 解析失败');
        }
      };
      input.click();
    } catch {
      setImportStatus('❌ 导入失败');
    }
  }

  return (
    <div>
      {/* 悬浮球设置 */}
      <div className="settings-section">
        <div className="settings-title">悬浮球</div>
        <div className="settings-row">
          <span className="settings-label">启用页面悬浮球</span>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="checkbox"
              checked={fabEnabled}
              onChange={handleFabToggle}
            />
            <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
              {fabEnabled ? '已开启' : '已关闭'}
            </span>
          </label>
        </div>
      </div>

      {/* 模板管理 */}
      <div className="settings-section">
        <div className="settings-title">模板管理</div>
        <div style={{ marginBottom: 8 }}>
          <button className="btn" onClick={handleImportJson}>
            导入 JSON 模板
          </button>
        </div>
        {importStatus && (
          <div
            style={{
              fontSize: 12,
              color: importStatus.startsWith('✅')
                ? 'var(--success)'
                : '#f44336',
              marginTop: 4,
            }}
          >
            {importStatus}
          </div>
        )}
      </div>

      {/* 关于 */}
      <div className="settings-section">
        <div className="settings-title">关于</div>
        <div className="settings-row">
          <span className="settings-label">版本</span>
          <span style={{ color: 'var(--text-secondary)' }}>1.0.0</span>
        </div>
        <div className="settings-row">
          <span className="settings-label">项目</span>
          <span style={{ color: 'var(--text-secondary)' }}>eplat-devtools</span>
        </div>
      </div>
    </div>
  );
}
