// Background Service Worker — 消息路由 + Sidepanel 控制

import { MSG, TARGET_PATHS } from '@/lib/constants';
import type { ExtensionMessage } from '@/lib/messaging';

export default defineBackground(() => {
  let sidepanelPort: chrome.runtime.Port | null = null;

  // 记录 sidepanel 的连接状态
  chrome.runtime.onConnect.addListener((port) => {
    if (port.name === 'sidepanel_port') {
      sidepanelPort = port;
      port.onDisconnect.addListener(() => {
        sidepanelPort = null;
      });
    }
  });

  // 点击扩展图标时打开 sidepanel
  browser.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch(console.error);

  // 消息路由
  chrome.runtime.onMessage.addListener(
    (message: ExtensionMessage, sender, sendResponse) => {
      handleMessage(message, sender, sidepanelPort).then(sendResponse).catch(console.error);
      return true; // 异步响应
    },
  );
});

async function handleMessage(
  message: ExtensionMessage,
  sender: chrome.runtime.MessageSender,
  sidepanelPort?: chrome.runtime.Port | null,
): Promise<unknown> {
  switch (message.type) {
    // 悬浮球请求打开/关闭 sidepanel
    case MSG.openSidepanel: {
      if (sidepanelPort) {
        sidepanelPort.postMessage({ type: 'CLOSE_SIDEPANEL' });
      } else {
        const tab = sender.tab;
        if (tab?.id && tab.windowId) {
          await chrome.sidePanel.open({ windowId: tab.windowId });
        }
      }
      return { ok: true };
    }

    // sidepanel → content: 插入代码
    case MSG.insertSnippet: {
      return sendMessageToActiveDesignerTab(message);
    }

    // sidepanel → content: 打开查找框
    case MSG.openFind: {
      return sendMessageToActiveDesignerTab(message);
    }

    default:
      return { ok: false, error: '未知消息类型' };
  }
}

function isDesignerTab(tab: chrome.tabs.Tab): boolean {
  if (!tab.url) return false;

  try {
    const url = new URL(tab.url);
    return TARGET_PATHS.some((rule) => rule.test(url.pathname));
  } catch {
    return false;
  }
}

async function sendMessageToActiveDesignerTab(
  message: ExtensionMessage,
): Promise<unknown> {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  if (!tab?.id) {
    return { ok: false, error: '无活动标签页' };
  }

  if (!isDesignerTab(tab)) {
    return { ok: false, error: '当前标签页不是 eplat 编辑器页面' };
  }

  try {
    return await chrome.tabs.sendMessage(tab.id, message);
  } catch (error) {
    const messageText =
      error instanceof Error ? error.message : String(error);

    if (messageText.includes('Receiving end does not exist')) {
      return {
        ok: false,
        error: '当前标签页未注入内容脚本，请刷新 eplat 编辑器页面后重试',
      };
    }

    return {
      ok: false,
      error: `消息发送失败：${messageText}`,
    };
  }
}
