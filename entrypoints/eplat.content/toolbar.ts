// 工具栏挂载模块

import { CSS_CLASSES, SELECTORS } from '@/lib/constants';
import { getCurrentZoom, increaseZoom, decreaseZoom, resetZoom, applyZoom } from './zoom';
import { toggleMaximize, updateMaximizeButtons } from './maximize';

/** 创建工具栏按钮 */
function createToolbarButton(
  text: string,
  title: string,
  onClick: (btn: HTMLButtonElement) => void,
  extraClass?: string,
): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = CSS_CLASSES.button;
  if (extraClass) button.classList.add(extraClass);
  button.textContent = text;
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

  const zoomOutBtn = createToolbarButton('-', '缩小 (Alt+-)', () =>
    decreaseZoom(),
  );
  const label = document.createElement('span');
  label.className = CSS_CLASSES.label;
  label.textContent = `${getCurrentZoom()}%`;
  const zoomInBtn = createToolbarButton('+', '放大 (Alt+=)', () =>
    increaseZoom(),
  );
  const resetBtn = createToolbarButton('100', '重置 (Alt+0)', () =>
    resetZoom(),
  );
  const maximizeBtn = createToolbarButton(
    '最大',
    '最大化 (Alt+Enter)',
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
