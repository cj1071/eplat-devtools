// Content Script 选择器配置
// 集中管理所有 DOM 选择器，便于扩展 geDialog 等场景

import { SELECTORS } from '@/lib/constants';

/** 判断元素是否为输入类元素 */
export function isInputLike(element: Element | null): boolean {
  if (!element || !('tagName' in element)) return false;
  const tagName = (element as HTMLElement).tagName.toLowerCase();
  if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
    return true;
  }
  return !!(element as HTMLElement).isContentEditable;
}

/** 判断元素是否可见 */
export function isVisibleElement(element: Element | null): boolean {
  if (!element) return false;
  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden') return false;
  return element.getClientRects().length > 0;
}

/** 检测页面是否包含脚本编辑器 */
export function hasScriptEditor(): boolean {
  return Boolean(document.querySelector(SELECTORS.scriptEditor));
}

/**
 * 获取当前活动的脚本编辑器容器
 * 支持 scriptEditorContainer 和 geDialog 两种容器
 */
export function getActiveScriptContainer(
  fromElement?: Element | null,
): Element | null {
  // 优先从触发元素向上查找容器
  if (fromElement && typeof fromElement.closest === 'function') {
    const container = fromElement.closest(SELECTORS.scriptEditorContainer);
    if (isVisibleElement(container)) return container;

    // 尝试 geDialog 容器
    const geDialogContainer = fromElement.closest(SELECTORS.geDialog);
    if (
      geDialogContainer &&
      isVisibleElement(geDialogContainer) &&
      geDialogContainer.querySelector(SELECTORS.aceEditor)
    ) {
      return geDialogContainer;
    }
  }

  // 回退：查找所有可见的脚本编辑器容器
  const visibleContainers = Array.from(
    document.querySelectorAll(SELECTORS.scriptEditorContainer),
  ).filter((node) => isVisibleElement(node));

  return visibleContainers.length
    ? visibleContainers[visibleContainers.length - 1]
    : null;
}

/** 获取所有 Ace 编辑器选择器（含 geDialog） */
export function getAceEditorSelector(): string {
  return `${SELECTORS.aceEditor}, ${SELECTORS.geDialog} .ace_editor`;
}
