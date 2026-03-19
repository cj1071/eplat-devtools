import { useState, useEffect } from 'react';
import { readClipboard, clearClipboard } from '@/lib/storage';
import type { ClipboardEntry } from '@/lib/storage';
import { STORAGE_KEYS } from '@/lib/constants';

export default function ClipboardTab() {
  const [items, setItems] = useState<ClipboardEntry[]>([]);

  useEffect(() => {
    loadClipboard();
    // 监听 storage 变化实时更新
    const listener = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string,
    ) => {
      if (areaName === 'local' && changes[STORAGE_KEYS.clipboard]) {
        const next = changes[STORAGE_KEYS.clipboard].newValue;
        setItems(
          Array.isArray(next)
            ? next.filter(
                (item): item is ClipboardEntry =>
                  item?.type === 'url' &&
                  typeof item?.content === 'string' &&
                  typeof item?.timestamp === 'number',
              )
            : [],
        );
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  async function loadClipboard() {
    const data = await readClipboard();
    setItems(data);
  }

  async function handleCopy(content: string) {
    await navigator.clipboard.writeText(content);
  }

  async function handleClear() {
    await clearClipboard();
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
          📋 URL 历史
        </span>
        {items.length > 0 && (
          <button className="btn" onClick={handleClear}>
            清空
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="empty-state">暂无相对路径记录</div>
      ) : (
        items.map((item, idx) => (
          <div key={idx} className="clipboard-item">
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="clipboard-content">
                🔗{' '}
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
