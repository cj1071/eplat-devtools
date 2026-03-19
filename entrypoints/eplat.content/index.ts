// Content Script 主入口

import { TARGET_PATHS, SELECTORS, CSS_CLASSES, MSG, STORAGE_KEYS } from '@/lib/constants';
import {
  getExtensionReloadMessage,
  isExtensionContextInvalidatedError,
} from '@/lib/extension-context';
import { initZoom, applyZoom, requestAceResize } from './zoom';
import { refreshUi, updateToolbarLabel } from './toolbar';
import { openFindPanel, registerKeyboard } from './keyboard';
import { mountFab } from './fab';
import { registerUrlCopyListener } from './url-copy';
import type { ExtensionMessage } from '@/lib/messaging';
import './style.css';

/** 检测是否为目标设计器页面 */
function isDesignerPage(): boolean {
  const path = location.pathname || '';
  return TARGET_PATHS.some((rule) => rule.test(path));
}

export default defineContentScript({
  matches: ['http://*/eplat/*', 'https://*/eplat/*'],
  runAt: 'document_idle',
  allFrames: true,

  async main() {
    if (!isDesignerPage()) return;

    try {
      // 注入 Ace Bridge 到页面上下文
      await injectScript('/ace-bridge.js', { keepInDom: true });

      // 初始化缩放
      await initZoom();

      // 首次渲染 UI
      refreshUi();

      // 挂载悬浮球
      await mountFab();

      chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'local' && changes[STORAGE_KEYS.fabEnabled]) {
          void mountFab();
        }
      });

      // DOM 变化监听
      let refreshQueued = false;
      const queueRefresh = () => {
        if (refreshQueued) return;
        refreshQueued = true;
        requestAnimationFrame(() => {
          refreshQueued = false;
          refreshUi();
        });
      };

      const observer = new MutationObserver(queueRefresh);
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
      });

      // 注册快捷键
      registerKeyboard();

      // 监听复制完整 eplat URL，并自动改写为相对路径
      registerUrlCopyListener();

      // 窗口 resize 补偿
      window.addEventListener(
        'resize',
        (e) => {
          // 防止代码分发原生 `resize` 事件时发生死循环调用栈溢出问题
          if (!e.isTrusted) return;

          if (document.querySelector(`.${CSS_CLASSES.maximized}`)) {
            requestAceResize();
          }
        },
        { passive: true },
      );

      // 接收来自 background 的消息
      chrome.runtime.onMessage.addListener(
        (message: ExtensionMessage, _sender, sendResponse) => {
          if (message.type === MSG.pingEditor) {
            sendResponse({ ok: true });
          }
          if (message.type === MSG.insertSnippet) {
            // 通知 bridge 插入代码
            window.dispatchEvent(
              new CustomEvent('__dz_script_editor_insert__', {
                detail: { code: message.payload.code },
              }),
            );
            sendResponse({ ok: true });
          }
          if (message.type === MSG.openFind) {
            openFindPanel(document.activeElement as Element | null);
            sendResponse({ ok: true });
          }
          return false;
        },
      );
    } catch (error) {
      if (isExtensionContextInvalidatedError(error)) {
        console.warn(getExtensionReloadMessage());
        return;
      }

      throw error;
    }
  },
});
