import { Suspense, lazy, useEffect, useState } from 'react';
import { IS_MAC, STORAGE_KEYS } from '@/lib/constants';
import { BUILTIN_SNIPPETS, TEMPLATE_SAMPLE_JSON } from '@/lib/snippet-data';
import {
  countSnippetItems,
  parseSnippetCategoriesJson,
  stringifySnippetCategories,
  type SnippetCategory,
} from '@/lib/snippet-engine';
import {
  clearCustomSnippets,
  readCustomSnippets,
  readFabEnabled,
  writeCustomSnippets,
  writeFabEnabled,
} from '@/lib/storage';
import UiIcon from './UiIcon';

const TemplateEditorModal = lazy(() => import('./TemplateEditorModal'));

const SHORTCUTS = [
  ['放大', IS_MAC ? '⌥ =' : 'Alt + ='],
  ['缩小', IS_MAC ? '⌥ -' : 'Alt + -'],
  ['重置缩放', IS_MAC ? '⌥ 0' : 'Alt + 0'],
  ['最大化 / 还原', IS_MAC ? '⌥ Enter' : 'Alt + Enter'],
  ['局部查找', IS_MAC ? '⌥ F' : 'Alt + F'],
  ['滚轮缩放', IS_MAC ? '⌘ 滚轮' : 'Ctrl + 滚轮'],
] as const;

function downloadJsonFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function SettingsTab() {
  const [fabEnabled, setFabEnabled] = useState(true);
  const [customSnippets, setCustomSnippets] = useState<SnippetCategory[]>([]);
  const [templateStatus, setTemplateStatus] = useState<{
    tone: 'success' | 'error';
    text: string;
  } | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorSeed, setEditorSeed] = useState(TEMPLATE_SAMPLE_JSON);

  const builtinCount = countSnippetItems(BUILTIN_SNIPPETS);
  const customCount = countSnippetItems(customSnippets);

  useEffect(() => {
    readFabEnabled().then(setFabEnabled);

    const syncCustomSnippets = async () => {
      setCustomSnippets(await readCustomSnippets());
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
    if (!templateStatus) return;

    const timer = window.setTimeout(() => {
      setTemplateStatus(null);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [templateStatus]);

  function handleFabToggle() {
    const next = !fabEnabled;
    setFabEnabled(next);
    writeFabEnabled(next);
  }

  function handleDownloadSample() {
    downloadJsonFile('eplat-snippet-template.sample.json', TEMPLATE_SAMPLE_JSON);
    setTemplateStatus({ tone: 'success', text: '已下载示例模板 JSON' });
  }

  function handleDownloadCurrent() {
    if (customSnippets.length === 0) {
      downloadJsonFile('eplat-snippet-template.sample.json', TEMPLATE_SAMPLE_JSON);
      setTemplateStatus({
        tone: 'success',
        text: '当前暂无自定义模板，已下载示例模板 JSON',
      });
      return;
    }

    downloadJsonFile(
      'eplat-custom-snippets.json',
      stringifySnippetCategories(customSnippets),
    );
    setTemplateStatus({ tone: 'success', text: '已下载当前自定义模板' });
  }

  function handleOpenEditor() {
    setTemplateStatus(null);
    setEditorSeed(
      customSnippets.length > 0
        ? stringifySnippetCategories(customSnippets)
        : TEMPLATE_SAMPLE_JSON,
    );
    setIsEditorOpen(true);
  }

  async function handleSaveTemplates(text: string) {
    try {
      const parsed = parseSnippetCategoriesJson(text);
      await writeCustomSnippets(parsed);
      setCustomSnippets(parsed);
      setTemplateStatus({
        tone: 'success',
        text: `已保存 ${parsed.length} 个分类，${countSnippetItems(parsed)} 条自定义模板`,
      });
    } catch (error) {
      setTemplateStatus({
        tone: 'error',
        text: error instanceof Error ? error.message : '保存失败，请稍后重试',
      });
    }
  }

  async function handleClearSavedTemplates() {
    await clearCustomSnippets();
    setCustomSnippets([]);
    setTemplateStatus({
      tone: 'success',
      text: '已清空已保存的自定义模板',
    });
  }

  return (
    <div>
      <div className="panel-hero">
        <div className="panel-hero-icon">
          <UiIcon name="settings" size={18} />
        </div>
        <div className="panel-hero-copy">
          <div className="panel-hero-title">偏好与模板管理</div>
          <div className="panel-hero-subtitle">维护悬浮球、快捷键提示，以及自定义模板的导入、下载与编辑。</div>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-title-row">
          <span className="settings-title-icon"><UiIcon name="switch" size={14} /></span>
          <div>
            <div className="settings-title">悬浮球</div>
            <div className="settings-title-subtitle">控制页面侧快捷入口是否展示</div>
          </div>
        </div>

        <div className="settings-card settings-stack">
          <div className="settings-chip-row">
            <span className={`stat-chip ${fabEnabled ? 'stat-chip-success' : 'stat-chip-muted'}`}>
              {fabEnabled ? '悬浮球已开启' : '悬浮球已关闭'}
            </span>
          </div>

          <div className="settings-tip">
            页面右下角会显示固定入口，用于快速打开 side panel。关闭后当前页面会立即隐藏该入口。
          </div>

          <div className="settings-row settings-row-card">
            <div>
              <div className="settings-label">启用页面悬浮球</div>
              <div className="settings-row-subtitle">建议在常用设计器页面保持开启</div>
            </div>
            <label className="settings-toggle settings-toggle-pill">
              <input
                type="checkbox"
                checked={fabEnabled}
                onChange={handleFabToggle}
              />
              <span className="settings-toggle-text">
                {fabEnabled ? '已开启' : '已关闭'}
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-title-row">
          <span className="settings-title-icon"><UiIcon name="keyboard" size={14} /></span>
          <div>
            <div className="settings-title">快捷键设置</div>
            <div className="settings-title-subtitle">当前为页面内生效的通用能力</div>
          </div>
        </div>
        <div className="settings-tip">请注意：目前为页面内生效的通用功能快捷键。</div>
        <div className="settings-card">
          <div className="settings-card-caption">常用功能快捷键</div>
          <div className="shortcut-list">
            {SHORTCUTS.map(([desc, key]) => (
              <div key={key} className="shortcut-row">
                <span className="settings-label">{desc}</span>
                <div className="shortcut-value">
                  <kbd className="shortcut-kbd">{key}</kbd>
                  <span className="shortcut-help" title="页面编辑器内触发">
                    <UiIcon name="info" size={12} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-title-row">
          <span className="settings-title-icon"><UiIcon name="template" size={14} /></span>
          <div>
            <div className="settings-title">模板管理</div>
            <div className="settings-title-subtitle">统一维护内置与自定义模板的交付方式</div>
          </div>
        </div>

        <div className="settings-card settings-stack">
          <div className="template-stats">
            <span className="stat-chip">内置 {builtinCount} 条</span>
            <span className="stat-chip">自定义 {customCount} 条</span>
          </div>

          <div className="settings-tip">
            自定义模板会与内置模板合并显示在“代码片段”页。根节点支持单个分类对象，或分类数组。
          </div>

          <div className="template-actions">
            <button className="btn" onClick={handleDownloadSample}>
              下载示例 JSON
            </button>
            <button className="btn" onClick={handleDownloadCurrent}>
              下载当前模板
            </button>
            <button className="btn btn-primary" onClick={handleOpenEditor}>
              打开 JSON 编辑器
            </button>
          </div>

          <div className="template-help">
            <div className="template-help-title">字段说明</div>
            <div className="template-help-grid">
              <div className="template-help-row">
                <code className="template-help-key">category</code>
                <div className="template-help-desc">分类名称</div>
              </div>
              <div className="template-help-row">
                <code className="template-help-key">items</code>
                <div className="template-help-desc">片段列表，至少 1 项</div>
              </div>
              <div className="template-help-row template-help-row-wide">
                <code className="template-help-key">id / name / description / tags / template</code>
                <div className="template-help-desc">单条片段必填字段</div>
              </div>
            </div>
          </div>

          {templateStatus && (
            <div className={`notice notice-${templateStatus.tone}`}>
              {templateStatus.text}
            </div>
          )}
        </div>
      </div>

      {isEditorOpen && (
        <Suspense fallback={<div className="notice notice-success">正在加载 JSON 编辑器...</div>}>
          <TemplateEditorModal
            initialText={editorSeed}
            status={templateStatus}
            onClose={() => setIsEditorOpen(false)}
            onDownload={(text) => downloadJsonFile('eplat-custom-snippets.json', text)}
            onSave={handleSaveTemplates}
            onClearSaved={handleClearSavedTemplates}
          />
        </Suspense>
      )}
    </div>
  );
}
