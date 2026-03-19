import { useEffect, useRef, useState, type ChangeEvent } from 'react';

interface TemplateEditorModalProps {
  initialText: string;
  status: {
    tone: 'success' | 'error';
    text: string;
  } | null;
  onClose: () => void;
  onDownload: (text: string) => void;
  onResetExample: () => string;
  onSave: (text: string) => Promise<void>;
}

export default function TemplateEditorModal({
  initialText,
  status,
  onClose,
  onDownload,
  onResetExample,
  onSave,
}: TemplateEditorModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [editorText, setEditorText] = useState(initialText);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  useEffect(() => {
    setEditorText(initialText);
    setImportStatus(null);
  }, [initialText]);

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
      setEditorText(text);
      setImportStatus(`已载入 ${file.name}，保存后生效`);
    } catch {
      setImportStatus('文件读取失败，请重试');
    } finally {
      event.target.value = '';
    }
  };

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-shell"
        role="dialog"
        aria-modal="true"
        aria-label="JSON 模板编辑器"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <div className="modal-title">JSON 模板编辑器</div>
            <div className="modal-subtitle">
              支持导入、修改、下载，再保存到自定义模板库。
            </div>
          </div>
          <button className="btn" onClick={onClose}>
            关闭
          </button>
        </div>

        <div className="modal-actions">
          <button className="btn" onClick={handleImportClick}>
            导入文件
          </button>
          <button className="btn" onClick={() => setEditorText(onResetExample())}>
            载入示例
          </button>
          <button className="btn" onClick={() => onDownload(editorText)}>
            下载 JSON
          </button>
          <button className="btn btn-primary" onClick={() => void onSave(editorText)}>
            保存模板
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="visually-hidden"
          onChange={handleImportFile}
        />

        {importStatus && <div className="notice notice-success">{importStatus}</div>}
        {status && <div className={`notice notice-${status.tone}`}>{status.text}</div>}

        <textarea
          className="json-editor"
          value={editorText}
          onChange={(event) => setEditorText(event.target.value)}
          spellCheck={false}
        />
      </div>
    </div>
  );
}
