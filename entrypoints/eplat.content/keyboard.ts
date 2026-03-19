// 快捷键管理模块

import { SELECTORS } from '@/lib/constants';
import {
  getAceEditorSelector,
  isInputLike,
  getActiveScriptContainer,
  isVisibleElement,
} from './selectors';
import { increaseZoom, decreaseZoom, resetZoom } from './zoom';
import { toggleMaximize } from './maximize';

type SearchMode = 'find' | 'replace';

/** 检测页面是否包含任何脚本编辑器（含 geDialog） */
function hasAnyEditor(): boolean {
  return Boolean(
    document.querySelector(SELECTORS.scriptEditor) ||
    document.querySelector(`${SELECTORS.geDialog} .ace_editor`),
  );
}

const FIND_BUTTON_SELECTOR = '#btnCodeEditorFind';
const REPLACE_BUTTON_SELECTOR = '#btnCodeEditorReplace';
const SEARCH_PANEL_SELECTOR = '.aceSearch';
const SEARCH_INPUT_SELECTOR = '.aceSearch .ace_search_form .ace_search_field';
const REPLACE_INPUT_SELECTOR = '.aceSearch .ace_replace_form .ace_search_field';

function getSearchRoots(fromElement?: Element | null): ParentNode[] {
  const roots: ParentNode[] = [];

  const primaryContainer = getActiveScriptContainer(fromElement);
  if (primaryContainer) {
    roots.push(primaryContainer);
  }

  const activeContainer = getActiveScriptContainer(document.activeElement as Element | null);
  if (activeContainer && !roots.includes(activeContainer)) {
    roots.push(activeContainer);
  }

  roots.push(document);
  return roots;
}

function queryVisibleElement<T extends Element>(
  roots: ParentNode[],
  selector: string,
): T | null {
  for (const root of roots) {
    const element = root.querySelector(selector) as T | null;
    if (element && isVisibleElement(element)) {
      return element;
    }
  }

  return null;
}

function focusSearchInput(roots: ParentNode[], mode: SearchMode) {
  const selector = mode === 'replace' ? REPLACE_INPUT_SELECTOR : SEARCH_INPUT_SELECTOR;
  const fallbackSelector = mode === 'replace' ? SEARCH_INPUT_SELECTOR : selector;
  const input = queryVisibleElement<HTMLInputElement>(roots, selector)
    ?? queryVisibleElement<HTMLInputElement>(roots, fallbackSelector);
  if (!input) return;

  input.focus();
  if (typeof input.select === 'function') {
    input.select();
  }
}

function openSearchPanel(fromElement: Element | null | undefined, mode: SearchMode): boolean {
  const roots = getSearchRoots(fromElement);
  const searchPanel = queryVisibleElement(roots, SEARCH_PANEL_SELECTOR);
  const replaceInput = queryVisibleElement(roots, REPLACE_INPUT_SELECTOR);

  if (mode === 'find' && searchPanel) {
    focusSearchInput(roots, 'find');
    return true;
  }

  if (mode === 'replace' && replaceInput) {
    focusSearchInput(roots, 'replace');
    return true;
  }

  const buttonSelector = mode === 'replace' ? REPLACE_BUTTON_SELECTOR : FIND_BUTTON_SELECTOR;
  const searchButton = queryVisibleElement<HTMLElement>(roots, buttonSelector);
  if (!searchButton) {
    return false;
  }

  searchButton.dispatchEvent(
    new MouseEvent('click', { bubbles: true, cancelable: true, view: window }),
  );
  requestAnimationFrame(() => focusSearchInput(getSearchRoots(fromElement), mode));
  setTimeout(() => focusSearchInput(getSearchRoots(fromElement), mode), 80);
  return true;
}

export function openFindPanel(fromElement?: Element | null): boolean {
  return openSearchPanel(fromElement, 'find');
}

export function openReplacePanel(fromElement?: Element | null): boolean {
  return openSearchPanel(fromElement, 'replace');
}

/** 键盘事件处理 — 使用 event.code 保证 Mac Option 键兼容 */
export function onKeyDown(event: KeyboardEvent) {
  if (!hasAnyEditor()) return;

  const target = event.target as Element | null;

  if (!event.altKey || event.metaKey || event.ctrlKey) return;

  // Alt/Option + Enter: 最大化/还原
  if (event.code === 'Enter') {
    event.preventDefault();
    toggleMaximize(getActiveScriptContainer(target));
    return;
  }

  // Alt/Option + R: 唤出替换面板
  if (event.code === 'KeyR') {
    event.preventDefault();
    event.stopPropagation();
    openReplacePanel(target);
    return;
  }

  // Alt/Option + F: 唤出平台查询面板
  if (event.code === 'KeyF') {
    event.preventDefault();
    event.stopPropagation();
    openFindPanel(target);
    return;
  }

  // 如果焦点在输入框（非缩放相关键），跳过
  if (
    isInputLike(target) &&
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
