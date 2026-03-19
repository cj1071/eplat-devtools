import { useState, useEffect } from 'react';
import { readClipboard, clearClipboard } from '@/lib/storage';
import type { ClipboardEntry } from '@/lib/storage';
import { STORAGE_KEYS } from '@/lib/constants';
import UiIcon from './UiIcon';

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
      <div className="panel-hero">
        <div className="panel-hero-icon">
          <UiIcon name="history" size={18} />
        </div>
        <div className="panel-hero-copy">
          <div className="panel-hero-title">URL 历史</div>
          <div className="panel-hero-subtitle">查看最近复制出的相对路径，并快速再次复制。</div>
        </div>
        <div className="panel-hero-metric">{items.length} 条</div>
      </div>

      <div className="section-header">
        <div className="section-header-copy">
          <span className="section-header-icon">
            <UiIcon name="clipboard" size={14} />
          </span>
          <div>
            <div className="section-header-title">相对路径记录</div>
            <div className="section-header-subtitle">保留最近 50 条可复用路径</div>
          </div>
        </div>
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
                <span className="clipboard-prefix">
                  <UiIcon name="link" size={13} />
                </span>
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
