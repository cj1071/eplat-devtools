import { useState } from 'react';
import { sendToBackground } from '@/lib/messaging';
import { MSG } from '@/lib/constants';
import type { SnippetCategory, SnippetItem } from '@/lib/snippet-engine';
import { searchSnippets, getSnippetCode } from '@/lib/snippet-engine';

// 内置示例数据（后续从 snippets/*.json 加载）
const BUILTIN_SNIPPETS: SnippetCategory[] = [
  {
    category: '弹窗函数',
    icon: '💬',
    items: [
      {
        id: 'geDialog-open',
        name: 'geDialog.open()',
        description: '打开平台弹窗组件',
        tags: ['dialog', 'ui'],
        template: `geDialog.open({
  title: "\${标题}",
  width: "\${宽度}",
  url: "\${URL}",
  buttons: [
    { text: '确定', handler: function() { /* TODO */ } },
    { text: '取消', handler: function() { geDialog.close(); } }
  ]
});`,
      },
      {
        id: 'geDialog-close',
        name: 'geDialog.close()',
        description: '关闭当前弹窗',
        tags: ['dialog', 'ui'],
        template: 'geDialog.close();',
      },
    ],
  },
  {
    category: '表单校验',
    icon: '✅',
    items: [
      {
        id: 'validateField',
        name: 'validateField()',
        description: '校验单个字段',
        tags: ['form', 'validation'],
        template: `validateField("\${字段名}", "\${校验规则}");`,
      },
      {
        id: 'getFormData',
        name: 'getFormData()',
        description: '获取表单数据',
        tags: ['form', 'data'],
        template: `var formData = getFormData("\${表单ID}");`,
      },
    ],
  },
];

export default function SnippetTab() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<SnippetItem | null>(null);
  const [status, setStatus] = useState<{
    tone: 'success' | 'error';
    text: string;
  } | null>(null);

  const filtered = searchSnippets(BUILTIN_SNIPPETS, query);

  const handleInsert = async (item: SnippetItem) => {
    const code = getSnippetCode(item);
    const result = await sendToBackground({
      type: MSG.insertSnippet,
      payload: { code },
    });

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
      {status && (
        <div className={`notice notice-${status.tone}`}>
          {status.text}
        </div>
      )}

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
