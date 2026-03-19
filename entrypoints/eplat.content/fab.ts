// 悬浮球模块 — 页面内快捷打开 sidepanel

import { CSS_CLASSES, MSG } from '@/lib/constants';
import { readFabEnabled } from '@/lib/storage';
import { sendToBackground } from '@/lib/messaging';

let fabElement: HTMLElement | null = null;

/** 创建悬浮球 DOM */
function createFab(): HTMLElement {
  const fab = document.createElement('div');
  fab.className = CSS_CLASSES.fab;
  fab.innerHTML = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`;
  fab.title = 'eplat-devtools';
  // 使用 right/bottom 锚定，让浏览器原生 sidepanel 挤压页面时自然跟随右边界。
  fab.style.right = '16px';
  fab.style.bottom = '80px';
  fab.style.left = 'auto';
  fab.style.top = 'auto';

  fab.addEventListener('click', () => {
    sendToBackground({ type: MSG.openSidepanel });
  });

  return fab;
}

/** 挂载悬浮球 */
export async function mountFab() {
  // 只在顶级窗口挂载悬浮球，避免 iframe 中重复注入
  if (window.self !== window.top) return;

  const enabled = await readFabEnabled();
  if (!enabled) {
    removeFab();
    return;
  }

  if (fabElement && document.body.contains(fabElement)) return;

  fabElement = createFab();
  document.body.appendChild(fabElement);
}

/** 移除悬浮球 */
export function removeFab() {
  if (fabElement && fabElement.parentNode) {
    fabElement.parentNode.removeChild(fabElement);
    fabElement = null;
  }
}
