// 快捷键管理模块

import { EVENTS } from '@/lib/constants';
import { getAceEditorSelector, hasScriptEditor, isInputLike, getActiveScriptContainer } from './selectors';
import { increaseZoom, decreaseZoom, resetZoom } from './zoom';
import { toggleMaximize } from './maximize';

/** 键盘事件处理 */
export function onKeyDown(event: KeyboardEvent) {
  if (!hasScriptEditor()) return;
  if (!event.altKey || event.metaKey || event.ctrlKey) return;

  // Alt+Enter: 最大化/还原
  if (event.key === 'Enter') {
    event.preventDefault();
    toggleMaximize(getActiveScriptContainer(event.target as Element));
    return;
  }

  // Alt+F: 唤出查找框
  if (event.key === 'f' || event.key === 'F') {
    event.preventDefault();
    window.dispatchEvent(new CustomEvent(EVENTS.aceFind));
    return;
  }

  // 如果焦点在输入框（非快捷键相关键），跳过
  if (
    isInputLike(event.target as Element) &&
    event.key !== '0' &&
    event.key !== '-' &&
    event.key !== '=' &&
    event.key !== '+'
  ) {
    return;
  }

  // Alt+=/+: 放大
  if (event.key === '=' || event.key === '+') {
    event.preventDefault();
    increaseZoom();
    return;
  }

  // Alt+-: 缩小
  if (event.key === '-') {
    event.preventDefault();
    decreaseZoom();
    return;
  }

  // Alt+0: 重置
  if (event.key === '0') {
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
