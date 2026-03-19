import { useState, useEffect } from 'react';
import { readClipboard, clearClipboard } from '@/lib/storage';
import type { ClipboardEntry } from '@/lib/storage';

export default function ClipboardTab() {
  const [items, setItems] = useState<ClipboardEntry[]>([]);

  useEffect(() => {
    loadClipboard();
    // 监听 storage 变化实时更新
    const listener = (changes: Record<string, chrome.storage.StorageChange>) => {
      if (changes.eplat_devtools_clipboard) {
        setItems(changes.eplat_devtools_clipboard.newValue ?? []);
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  async function loadClipboard() {
    const data = await readClipboard();
    setItems(data);
  }

  function handleCopy(content: string) {
    navigator.clipboard.writeText(content);
  }

  function handleClear() {
    clearClipboard();
    setItems([]);
  }

  function formatTime(ts: number) {
    return new Date(ts).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div>
      <div className="section-header">
        <span style={{ fontWeight: 600, color: 'var(--text-white)' }}>
          📋 剪贴板历史
        </span>
        {items.length > 0 && (
          <button className="btn" onClick={handleClear}>
            清空
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="empty-state">暂无剪贴板记录</div>
      ) : (
        items.map((item, idx) => (
          <div key={idx} className="clipboard-item">
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="clipboard-content">
                {item.type === 'url' ? '🔗 ' : '💻 '}
                {item.content}
              </div>
              <div className="clipboard-time">
                {item.label || formatTime(item.timestamp)}
              </div>
            </div>
            <div className="clipboard-actions">
              <button className="btn" onClick={() => handleCopy(item.content)}>
                复制
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
