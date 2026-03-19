// 缩放逻辑模块

import { ZOOM, EVENTS } from '@/lib/constants';
import { readZoom, writeZoom } from '@/lib/storage';
import { getAceEditorSelector } from './selectors';

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

let currentZoom = ZOOM.default;

/** 获取当前缩放级别 */
export function getCurrentZoom(): number {
  return currentZoom;
}

/** 初始化缩放值（从 storage 读取） */
export async function initZoom(): Promise<void> {
  const stored = await readZoom();
  currentZoom = clamp(stored, ZOOM.min, ZOOM.max);
}

/** 根据缩放比计算字体大小 */
function getZoomStyle() {
  const ratio = currentZoom / 100;
  return {
    fontSize: Math.max(10, Math.round(ZOOM.baseFontSize * ratio)),
  };
}

/** 通过 CSS 变量和内联样式应用缩放 */
function applyInlineFallback(style: { fontSize: number }) {
  document.documentElement.style.setProperty(
    '--dz-script-editor-font-size',
    `${style.fontSize}px`,
  );
  const aceEditors = document.querySelectorAll(getAceEditorSelector());
  aceEditors.forEach((editor) => {
    (editor as HTMLElement).style.fontSize = `${style.fontSize}px`;
  });
}

/** 通过 CustomEvent 通知 Main World 的 Ace Bridge */
function notifyAceEditors(style: { fontSize: number }) {
  window.dispatchEvent(
    new CustomEvent(EVENTS.aceZoom, {
      detail: { fontSize: style.fontSize },
    }),
  );
}

/** 请求 Ace 重新布局 */
export function requestAceResize() {
  const dispatch = () => {
    window.dispatchEvent(new CustomEvent(EVENTS.aceResize));
    // 同步触发原生 window resize，适配自定义组件内部无独立 CustomEvent 监听的 Ace 实例
    window.dispatchEvent(new Event('resize'));
  };
  dispatch();
  requestAnimationFrame(() => {
    dispatch();
    setTimeout(dispatch, 40);
    setTimeout(dispatch, 120);
    setTimeout(dispatch, 240);
    setTimeout(dispatch, 420);
  });
}

/** 应用当前缩放 */
export function applyZoom(persist: boolean) {
  const style = getZoomStyle();
  applyInlineFallback(style);
  notifyAceEditors(style);
  if (persist) {
    writeZoom(currentZoom);
  }
}

/** 设置缩放级别 */
export function setZoom(nextZoom: number, persist: boolean) {
  const normalized = clamp(
    Math.round(nextZoom / ZOOM.step) * ZOOM.step,
    ZOOM.min,
    ZOOM.max,
  );
  if (normalized === currentZoom) return;
  currentZoom = normalized;
  applyZoom(persist);
}

export function increaseZoom() {
  setZoom(currentZoom + ZOOM.step, true);
}

export function decreaseZoom() {
  setZoom(currentZoom - ZOOM.step, true);
}

export function resetZoom() {
  setZoom(ZOOM.default, true);
}
