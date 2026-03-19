// 工具栏挂载模块

import { CSS_CLASSES, SELECTORS, ICONS, ALT_KEY } from '@/lib/constants';
import { getCurrentZoom, increaseZoom, decreaseZoom, resetZoom, applyZoom } from './zoom';
import { toggleMaximize, updateMaximizeButtons } from './maximize';

/** 创建工具栏按钮 */
function createToolbarButton(
  html: string,
  title: string,
  onClick: (btn: HTMLButtonElement) => void,
  extraClass?: string,
): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = CSS_CLASSES.button;
  if (extraClass) button.classList.add(extraClass);
  button.innerHTML = html;
  button.title = title;
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    onClick(button);
  });
  return button;
}

/** 更新所有缩放标签 */
export function updateToolbarLabel() {
  document.querySelectorAll(`.${CSS_CLASSES.label}`).forEach((el) => {
    el.textContent = `${getCurrentZoom()}%`;
  });
}

/** 在 header 上挂载工具栏 */
function mountToolbar(header: Element) {
  if (!header || header.querySelector(`.${CSS_CLASSES.toolbar}`)) return;

  const toolbar = document.createElement('div');
  toolbar.className = CSS_CLASSES.toolbar;

  const zoomOutBtn = createToolbarButton(ICONS.zoomOut, `缩小 (${ALT_KEY}+-)`, () =>
    decreaseZoom(),
  );
  const label = document.createElement('span');
  label.className = CSS_CLASSES.label;
  label.textContent = `${getCurrentZoom()}%`;
  const zoomInBtn = createToolbarButton(ICONS.zoomIn, `放大 (${ALT_KEY}+=)`, () =>
    increaseZoom(),
  );
  const resetBtn = createToolbarButton(ICONS.reset, `重置 (${ALT_KEY}+0)`, () =>
    resetZoom(),
  );
  const maximizeBtn = createToolbarButton(
    ICONS.maximize,
    `最大化 (${ALT_KEY}+Enter)`,
    (button) => {
      const container =
        button.closest(SELECTORS.scriptEditorContainer) ||
        header.closest(SELECTORS.scriptEditorContainer);
      toggleMaximize(container);
    },
    CSS_CLASSES.maximizeBtn,
  );

  toolbar.appendChild(zoomOutBtn);
  toolbar.appendChild(label);
  toolbar.appendChild(zoomInBtn);
  toolbar.appendChild(resetBtn);
  toolbar.appendChild(maximizeBtn);

  const closeButton = header.querySelector(SELECTORS.dialogCloseBtn);
  if (closeButton) {
    header.insertBefore(toolbar, closeButton);
    // 最大化状态下点击关闭按钮时，先移除最大化再让原生关闭逻辑执行
    closeButton.addEventListener('click', () => {
      const container = closeButton.closest(SELECTORS.scriptEditorContainer);
      if (container && container.classList.contains(CSS_CLASSES.maximized)) {
        container.classList.remove(CSS_CLASSES.maximized);
        updateMaximizeButtons();
      }
    }, true);
  } else {
    header.appendChild(toolbar);
  }
}

/** 刷新所有工具栏 */
export function refreshUi() {
  document.querySelectorAll(SELECTORS.scriptEditorHeader).forEach((header) => {
    mountToolbar(header);
  });
  updateMaximizeButtons();
  updateToolbarLabel();
  applyZoom(false);
}
