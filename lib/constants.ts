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
  scriptEditorContainer: '.scriptEditorContainer',
  scriptEditorHeader: '.scriptEditorHeader',

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
  aceFind: '__dz_script_editor_find__',
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
  // content → sidepanel
  clipboardUpdate: 'CLIPBOARD_UPDATE',
} as const;
