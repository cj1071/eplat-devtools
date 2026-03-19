// Ace Bridge — 注入到页面 Main World，操控 Ace 实例
// 此文件作为 unlisted script 由 content script 通过 injectScript 注入

export default defineUnlistedScript(() => {
  if ((window as any).__EPLAT_DEVTOOLS_ACE_BRIDGE__) return;
  (window as any).__EPLAT_DEVTOOLS_ACE_BRIDGE__ = true;

  const ACE_EDITOR_SELECTOR =
    '.scriptEditor .ace_editor, #globalScriptEditor.ace_editor, .scriptEditorContainer .ace_editor, .geDialog .ace_editor';
  const ACE_ZOOM_EVENT = '__dz_script_editor_zoom__';
  const ACE_RESIZE_EVENT = '__dz_script_editor_resize__';
  const ACE_INSERT_EVENT = '__dz_script_editor_insert__';

  /** 获取页面上所有 Ace Editor 实例 */
  function getEditors(): any[] {
    const ace = (window as any).ace;
    if (!ace || typeof ace.edit !== 'function') return [];

    const editors = document.querySelectorAll(ACE_EDITOR_SELECTOR);
    const instances: any[] = [];
    editors.forEach((el) => {
      try {
        instances.push(ace.edit(el));
      } catch {
        // 忽略无效节点
      }
    });
    return instances;
  }

  /** 获取当前获得焦点的编辑器（或最后一个） */
  function getActiveEditor(): any | null {
    const editors = getEditors();
    if (editors.length === 0) return null;

    const focused = editors.find((editor) => editor.isFocused && editor.isFocused());
    return focused || editors[editors.length - 1];
  }

  /** 设置字体大小 */
  function applyFontSize(fontSize: number) {
    if (!Number.isFinite(fontSize)) return;
    getEditors().forEach((editor) => {
      try {
        if (typeof editor.setOption === 'function') {
          editor.setOption('fontSize', fontSize + 'px');
        }
        if (typeof editor.setFontSize === 'function') {
          editor.setFontSize(fontSize);
        }
      } catch {
        // 静默失败
      }
    });
  }

  /** 强制重新布局 */
  function resizeEditors() {
    getEditors().forEach((editor) => {
      try {
        if (editor.renderer && typeof editor.renderer.updateFull === 'function') {
          editor.renderer.updateFull();
        }
        if (typeof editor.resize === 'function') {
          editor.resize(true);
        }
      } catch {
        // 静默失败
      }
    });
  }

  // ===== 事件监听 =====

  // 缩放事件
  window.addEventListener(ACE_ZOOM_EVENT, ((event: CustomEvent) => {
    const detail = event?.detail ?? {};
    applyFontSize(detail.fontSize);
    resizeEditors();
    setTimeout(resizeEditors, 0);
  }) as EventListener);

  // 重新布局事件
  window.addEventListener(ACE_RESIZE_EVENT, () => {
    resizeEditors();
    requestAnimationFrame(resizeEditors);
    setTimeout(resizeEditors, 0);
    setTimeout(resizeEditors, 80);
    setTimeout(resizeEditors, 180);
  });

  // 插入代码事件
  window.addEventListener(ACE_INSERT_EVENT, ((event: CustomEvent) => {
    const editor = getActiveEditor();
    if (!editor) return;
    const code = event?.detail?.code;
    if (typeof code !== 'string') return;

    try {
      // 在光标位置插入代码
      editor.insert(code);

      // 高亮插入区域 3 秒
      const session = editor.getSession();
      const pos = editor.getCursorPosition();
      const lines = code.split('\n');
      const startRow = pos.row - lines.length + 1;
      const endRow = pos.row;

      if (session && typeof session.addMarker === 'function') {
        const Range = (window as any).ace.require('ace/range').Range;
        const range = new Range(startRow, 0, endRow, Infinity);
        const markerId = session.addMarker(
          range,
          'ace_active-line',
          'fullLine',
          false,
        );
        setTimeout(() => {
          session.removeMarker(markerId);
        }, 3000);
      }
    } catch {
      // 静默失败
    }
  }) as EventListener);

  // 窗口 resize 联动
  window.addEventListener('resize', () => resizeEditors(), { passive: true });
});
