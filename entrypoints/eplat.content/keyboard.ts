// 快捷键管理模块

import { EVENTS, SELECTORS } from '@/lib/constants';
import { getAceEditorSelector, isInputLike, getActiveScriptContainer } from './selectors';
import { increaseZoom, decreaseZoom, resetZoom } from './zoom';
import { toggleMaximize } from './maximize';

/** 检测页面是否包含任何脚本编辑器（含 geDialog） */
function hasAnyEditor(): boolean {
  return Boolean(
    document.querySelector(SELECTORS.scriptEditor) ||
    document.querySelector(`${SELECTORS.geDialog} .ace_editor`),
  );
}

/** 键盘事件处理 — 使用 event.code 保证 Mac Option 键兼容 */
export function onKeyDown(event: KeyboardEvent) {
  if (!hasAnyEditor()) return;
  if (!event.altKey || event.metaKey || event.ctrlKey) return;

  // Alt/Option + Enter: 最大化/还原
  if (event.code === 'Enter') {
    event.preventDefault();
    toggleMaximize(getActiveScriptContainer(event.target as Element));
    return;
  }

  // Alt/Option + F: 唤出查找框
  if (event.code === 'KeyF') {
    event.preventDefault();
    window.dispatchEvent(new CustomEvent(EVENTS.aceFind));
    return;
  }

  // 如果焦点在输入框（非缩放相关键），跳过
  if (
    isInputLike(event.target as Element) &&
    event.code !== 'Digit0' &&
    event.code !== 'Minus' &&
    event.code !== 'Equal'
  ) {
    return;
  }

  // Alt/Option + =: 放大
  if (event.code === 'Equal') {
    event.preventDefault();
    increaseZoom();
    return;
  }

  // Alt/Option + -: 缩小
  if (event.code === 'Minus') {
    event.preventDefault();
    decreaseZoom();
    return;
  }

  // Alt/Option + 0: 重置
  if (event.code === 'Digit0') {
    event.preventDefault();
    resetZoom();
  }
}

/** 滚轮事件处理（Ctrl/Cmd+滚轮缩放） */
export function onWheel(event: WheelEvent) {
  if (!(event.ctrlKey || event.metaKey)) return;

  const target = event.target as Element;
  const editorNode =
    target && typeof target.closest === 'function'
      ? target.closest(getAceEditorSelector())
      : null;
  if (!editorNode) return;

  event.preventDefault();
  if (event.deltaY < 0) {
    increaseZoom();
  } else {
    decreaseZoom();
  }
}

/** 注册快捷键监听 */
export function registerKeyboard() {
  document.addEventListener('keydown', onKeyDown, true);
  window.addEventListener('wheel', onWheel, { capture: true, passive: false });
}
