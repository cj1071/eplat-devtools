import { useEffect, useState } from 'react';
import { MSG, STORAGE_KEYS } from '@/lib/constants';
import type { ActiveTabStatus } from '@/lib/editor-status';
import type { SnippetCategory, SnippetItem } from '@/lib/snippet-engine';
import {
  countSnippetItems,
  getSnippetCode,
  searchSnippets,
} from '@/lib/snippet-engine';
import { sendToBackground } from '@/lib/messaging';
import { BUILTIN_SNIPPETS } from '@/lib/snippet-data';
import { readCustomSnippets } from '@/lib/storage';

interface SnippetTabProps {
  activeTabStatus: ActiveTabStatus;
}

function findItemById(
  categories: SnippetCategory[],
  itemId: string,
): SnippetItem | null {
  for (const category of categories) {
    const item = category.items.find((entry) => entry.id === itemId);
    if (item) return item;
  }

  return null;
}

export default function SnippetTab({ activeTabStatus }: SnippetTabProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<SnippetItem | null>(null);
  const [customSnippets, setCustomSnippets] = useState<SnippetCategory[]>([]);
  const [status, setStatus] = useState<{
    tone: 'success' | 'error';
    text: string;
  } | null>(null);

  const allSnippets = [...BUILTIN_SNIPPETS, ...customSnippets];
  const filtered = searchSnippets(allSnippets, query);
  const builtinCount = countSnippetItems(BUILTIN_SNIPPETS);
  const customCount = countSnippetItems(customSnippets);

  useEffect(() => {
    const syncCustomSnippets = async () => {
      const next = await readCustomSnippets();
      setCustomSnippets(next);
      setSelected((current) => {
        if (!current) return current;
        return findItemById([...BUILTIN_SNIPPETS, ...next], current.id);
      });
    };

    void syncCustomSnippets();

    const listener = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string,
    ) => {
      if (areaName === 'local' && changes[STORAGE_KEYS.customSnippets]) {
        void syncCustomSnippets();
      }
    };

    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  useEffect(() => {
    if (!status) return;

    const timer = window.setTimeout(() => {
      setStatus(null);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [status]);

  const handleInsert = async (item: SnippetItem) => {
    if (!activeTabStatus.canInsert) {
      setStatus({ tone: 'error', text: activeTabStatus.reason });
      return;
    }

    const code = getSnippetCode(item);
    let result: unknown;

    try {
      result = await sendToBackground({
        type: MSG.insertSnippet,
        payload: { code },
      });
    } catch (error) {
      setStatus({
        tone: 'error',
        text: error instanceof Error ? error.message : '插入失败，请稍后重试',
      });
      return;
    }

    if (
      result &&
      typeof result === 'object' &&
      'ok' in result &&
      result.ok === false
    ) {
      setStatus({
        tone: 'error',
        text:
          typeof result.error === 'string' ? result.error : '插入失败，请稍后重试',
      });
      return;
    }

    setStatus({
      tone: 'success',
      text: `已插入 ${item.name}`,
    });
  };

  return (
    <div>
      <div className={`notice ${activeTabStatus.canInsert ? 'notice-success' : 'notice-warning'}`}>
        <div className="notice-title">当前页面：{activeTabStatus.tabTitle}</div>
        <div>{activeTabStatus.reason}</div>
      </div>

      {status && (
        <div className={`notice notice-${status.tone}`}>
          {status.text}
        </div>
      )}

      <div className="snippet-meta">
        <span>内置 {builtinCount} 条</span>
        <span>自定义 {customCount} 条</span>
      </div>

      <input
        className="search-bar"
        type="text"
        placeholder="搜索代码片段..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {filtered.length === 0 ? (
        <div className="empty-state">未找到匹配的代码片段</div>
      ) : (
        filtered.map((cat) => (
          <div key={cat.category}>
            <div className="category-title">
              <span>{cat.icon}</span>
              <span>{cat.category}</span>
            </div>
            {cat.items.map((item) => (
              <div
                key={item.id}
                className={`snippet-card ${selected?.id === item.id ? 'selected' : ''}`}
                onClick={() => setSelected(item)}
              >
                <div className="snippet-info">
                  <div className="snippet-name">{item.name}</div>
                  <div className="snippet-desc">{item.description}</div>
                </div>
                <button
                  className="btn btn-primary"
                  disabled={!activeTabStatus.canInsert}
                  title={activeTabStatus.canInsert ? '插入到当前编辑器' : activeTabStatus.reason}
                  onClick={(e) => {
                    e.stopPropagation();
                    void handleInsert(item);
                  }}
                >
                  插入
                </button>
              </div>
            ))}
          </div>
        ))
      )}

      {/* 代码预览 */}
      {selected && (
        <div className="code-preview">
          <pre>{getSnippetCode(selected)}</pre>
        </div>
      )}
    </div>
  );
}
