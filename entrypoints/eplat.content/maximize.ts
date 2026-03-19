// 最大化逻辑模块

import { CSS_CLASSES, SELECTORS } from '@/lib/constants';
import { applyZoom, requestAceResize } from './zoom';

/** 判断容器是否处于最大化状态 */
export function isContainerMaximized(container: Element | null): boolean {
  return !!container && container.classList.contains(CSS_CLASSES.maximized);
}

/** 更新所有最大化按钮文本 */
export function updateMaximizeButtons() {
  document
    .querySelectorAll<HTMLButtonElement>(`.${CSS_CLASSES.maximizeBtn}`)
    .forEach((button) => {
      const container = button.closest(SELECTORS.scriptEditorContainer);
      const maximized = isContainerMaximized(container);
      button.textContent = maximized ? '还原' : '最大';
      button.title = maximized ? '还原 (Alt+Enter)' : '最大化 (Alt+Enter)';
      button.setAttribute('aria-pressed', maximized ? 'true' : 'false');
    });
}

/** 切换最大化/还原 */
export function toggleMaximize(container: Element | null) {
  if (!container) return;
  const willMaximize = !isContainerMaximized(container);

  // 先移除所有已最大化的容器
  document
    .querySelectorAll(
      `${SELECTORS.scriptEditorContainer}.${CSS_CLASSES.maximized}`,
    )
    .forEach((node) => {
      node.classList.remove(CSS_CLASSES.maximized);
    });

  if (willMaximize) {
    container.classList.add(CSS_CLASSES.maximized);
  }

  updateMaximizeButtons();
  applyZoom(false);
  requestAceResize();
  setTimeout(requestAceResize, 120);
}
