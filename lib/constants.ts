// eplat-devtools 常量定义

// ===== 目标页面 =====
export const TARGET_PATHS = [
  /^\/eplat\/show-designer\/dz\/edit\/.+/i,
  /^\/eplat\/BE\/DZ\/graphIndex\.jsp/i,
];

// ===== DOM 选择器 =====
export const SELECTORS = {
  // 脚本编辑器容器
  scriptEditor: '.scriptEditor',
  scriptEditorContainer: '.scriptEditorContainer, .geDialog',
  scriptEditorHeader: '.scriptEditorHeader, .editHtmlTemplate_header',

  // Ace 编辑器
  aceEditor:
    '.scriptEditor .ace_editor, #globalScriptEditor.ace_editor, .scriptEditorContainer .ace_editor',

  // geDialog 扩展（平台自定义弹窗组件）
  geDialog: '.geDialog',
  uiDraggable: '.ui-draggable',

  // 弹窗关闭按钮
  dialogCloseBtn: '.el-dialog__headerbtn',
} as const;

// ===== CSS 类名 =====
export const CSS_CLASSES = {
  toolbar: 'dz-script-zoom-toolbar',
  label: 'dz-script-zoom-label',
  button: 'dz-script-zoom-btn',
  maximized: 'dz-script-editor-maximized',
  maximizeBtn: 'dz-script-maximize-btn',
  fab: 'eplat-devtools-fab', // 悬浮球
} as const;

// ===== 缩放 =====
export const ZOOM = {
  min: 70,
  max: 240,
  step: 10,
  default: 100,
  baseFontSize: 13,
} as const;

// ===== 自定义事件 =====
export const EVENTS = {
  aceZoom: '__dz_script_editor_zoom__',
  aceResize: '__dz_script_editor_resize__',
  aceInsert: '__dz_script_editor_insert__',
} as const;

// ===== Storage Keys =====
export const STORAGE_KEYS = {
  zoom: `dz_script_editor_zoom_${typeof location !== 'undefined' ? location.host : ''}`,
  fabEnabled: 'eplat_devtools_fab_enabled',
  clipboard: 'eplat_devtools_clipboard',
  customSnippets: 'eplat_devtools_custom_snippets',
} as const;

// ===== 消息类型 =====
export const MSG = {
  // sidepanel → background → content
  insertSnippet: 'INSERT_SNIPPET',
  openFind: 'OPEN_FIND',
  copyUrl: 'COPY_URL',
  openSidepanel: 'OPEN_SIDEPANEL',
  pingEditor: 'PING_EDITOR',
  // content → sidepanel
  clipboardUpdate: 'CLIPBOARD_UPDATE',
} as const;

// ===== 系统标识 =====
export const IS_MAC = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
export const ALT_KEY = IS_MAC ? 'Option' : 'Alt';
export const CTRL_KEY = IS_MAC ? 'Cmd' : 'Ctrl';

// ===== 无边框 SVG 图标集 =====
export const ICONS = {
  zoomOut: '<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><line x1="5" y1="12" x2="19" y2="12"></line></svg>',
  zoomIn: '<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>',
  reset: '<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline></svg>',
  maximize: '<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>',
  restore: '<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><polyline points="4 14 10 14 10 20"></polyline><polyline points="20 10 14 10 14 4"></polyline><line x1="14" y1="10" x2="21" y2="3"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>'
};
