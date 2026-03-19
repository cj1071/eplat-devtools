import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import JSONEditor, { type JSONEditorOptions } from 'jsoneditor';
import 'jsoneditor/dist/jsoneditor.css';

type NoticeState = {
  tone: 'success' | 'error';
  text: string;
} | null;

interface TemplateEditorModalProps {
  initialText: string;
  status: NoticeState;
  onClose: () => void;
  onDownload: (text: string) => void;
  onSave: (text: string) => Promise<void>;
  onClearSaved: () => Promise<void>;
}

const TOOL_ICONS = {
  import: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v11"></path><path d="m8 10 4 4 4-4"></path><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"></path></svg>',
  format: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16"></path><path d="M7 12h10"></path><path d="M10 17h4"></path></svg>',
  clear: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18"></path><path d="M8 6V4h8v2"></path><path d="m19 6-1 14H6L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path></svg>',
  download: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v11"></path><path d="m8 10 4 4 4-4"></path><path d="M4 21h16"></path></svg>',
  save: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 21V5a2 2 0 0 1 2-2h10l4 4v14H5z"></path><path d="M9 21v-6h6v6"></path><path d="M9 3v5h6"></path></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>',
} as const;

interface ToolbarButtonProps {
  icon: keyof typeof TOOL_ICONS;
  label: string;
  title: string;
  tone?: 'default' | 'danger' | 'primary';
  onClick: () => void;
}

function ToolbarButton({
  icon,
  label,
  title,
  tone = 'default',
  onClick,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      className={`tool-button tool-button-${tone}`}
      onClick={onClick}
      title={title}
      aria-label={title}
    >
      <span
        className="tool-button-icon"
        dangerouslySetInnerHTML={{ __html: TOOL_ICONS[icon] }}
      />
      <span className="tool-button-text">{label}</span>
    </button>
  );
}

export default function TemplateEditorModal({
  initialText,
  status,
  onClose,
  onDownload,
  onSave,
  onClearSaved,
}: TemplateEditorModalProps) {
  const editorHostRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const editorRef = useRef<JSONEditor | null>(null);
  const [editorText, setEditorText] = useState(initialText);
  const [localStatus, setLocalStatus] = useState<NoticeState>(null);

  useEffect(() => {
    if (!editorHostRef.current || editorRef.current) return;

    const options: JSONEditorOptions = {
      mode: 'code',
      mainMenuBar: false,
      navigationBar: false,
      statusBar: false,
      indentation: 2,
      onChangeText: (text) => {
        setEditorText(text);
        setLocalStatus(null);
      },
      onError: (error) => {
        setLocalStatus({
          tone: 'error',
          text: error.message || 'JSON 编辑器发生错误',
        });
      },
    };

    const editor = new JSONEditor(editorHostRef.current, options);
    editor.setText(initialText);
    editorRef.current = editor;

    return () => {
      editor.destroy();
      editorRef.current = null;
    };
  }, [initialText]);

  useEffect(() => {
    setEditorText(initialText);
    setLocalStatus(null);

    if (editorRef.current && editorRef.current.getText() !== initialText) {
      editorRef.current.updateText(initialText);
    }
  }, [initialText]);

  useEffect(() => {
    if (!localStatus) return;

    const timer = window.setTimeout(() => {
      setLocalStatus(null);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [localStatus]);

  function getCurrentText(): string {
    return editorRef.current?.getText() ?? editorText;
  }

  function updateEditorText(text: string) {
    setEditorText(text);
    if (editorRef.current) {
      editorRef.current.updateText(text);
      editorRef.current.focus();
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      updateEditorText(text);
      setLocalStatus({ tone: 'success', text: `已载入 ${file.name}` });
    } catch {
      setLocalStatus({ tone: 'error', text: '文件读取失败，请重试' });
    } finally {
      event.target.value = '';
    }
  };

  function handleFormat() {
    try {
      const formatted = `${JSON.stringify(JSON.parse(getCurrentText()), null, 2)}\n`;
      updateEditorText(formatted);
      setLocalStatus({ tone: 'success', text: '已格式化 JSON' });
    } catch {
      setLocalStatus({ tone: 'error', text: '当前内容不是合法 JSON，无法格式化' });
    }
  }

  async function handleClearSaved() {
    const confirmed = window.confirm('确认清空已保存的自定义模板吗？此操作不可撤销。');
    if (!confirmed) return;

    await onClearSaved();
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-shell modal-shell-editor"
        role="dialog"
        aria-modal="true"
        aria-label="JSON 模板编辑器"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <div className="modal-title">JSON 模板编辑器</div>
            <div className="modal-subtitle">
              已切换为编辑器库，不再是纯多行文本框。支持导入、格式化、下载、保存和清空已保存模板。
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="关闭编辑器">
            <span
              dangerouslySetInnerHTML={{ __html: TOOL_ICONS.close }}
            />
          </button>
        </div>

        <div className="modal-toolbar">
          <ToolbarButton
            icon="import"
            label="导入"
            title="导入 JSON 文件"
            onClick={handleImportClick}
          />
          <ToolbarButton
            icon="format"
            label="格式化"
            title="格式化当前 JSON"
            onClick={handleFormat}
          />
          <ToolbarButton
            icon="clear"
            label="清空已保存"
            title="清空已保存的自定义模板"
            tone="danger"
            onClick={() => void handleClearSaved()}
          />
          <ToolbarButton
            icon="download"
            label="下载"
            title="下载当前 JSON"
            onClick={() => onDownload(getCurrentText())}
          />
          <ToolbarButton
            icon="save"
            label="保存"
            title="保存到自定义模板库"
            tone="primary"
            onClick={() => void onSave(getCurrentText())}
          />
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="visually-hidden"
          onChange={handleImportFile}
        />

        {localStatus && <div className={`notice notice-${localStatus.tone}`}>{localStatus.text}</div>}
        {status && <div className={`notice notice-${status.tone}`}>{status.text}</div>}

        <div className="editor-hint-bar">
          <span>当前模式：代码编辑</span>
          <span>快捷键：`Ctrl/Cmd + F` 搜索，`Tab` 缩进</span>
        </div>

        <div ref={editorHostRef} className="json-editor-surface" />
      </div>
    </div>
  );
}
