// Background Service Worker — 消息路由 + Sidepanel 控制

import { MSG } from '@/lib/constants';
import type { ExtensionMessage } from '@/lib/messaging';

export default defineBackground(() => {
  // 点击扩展图标时打开 sidepanel
  browser.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch(console.error);

  // 消息路由
  chrome.runtime.onMessage.addListener(
    (message: ExtensionMessage, sender, sendResponse) => {
      handleMessage(message, sender).then(sendResponse).catch(console.error);
      return true; // 异步响应
    },
  );
});

async function handleMessage(
  message: ExtensionMessage,
  sender: chrome.runtime.MessageSender,
): Promise<unknown> {
  switch (message.type) {
    // 悬浮球请求打开 sidepanel
    case MSG.openSidepanel: {
      const tab = sender.tab;
      if (tab?.id && tab.windowId) {
        await chrome.sidePanel.open({ windowId: tab.windowId });
      }
      return { ok: true };
    }

    // sidepanel → content: 插入代码
    case MSG.insertSnippet: {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tab?.id) {
        return chrome.tabs.sendMessage(tab.id, message);
      }
      return { ok: false, error: '无活动标签页' };
    }

    // sidepanel → content: 打开查找框
    case MSG.openFind: {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tab?.id) {
        return chrome.tabs.sendMessage(tab.id, message);
      }
      return { ok: false, error: '无活动标签页' };
    }

    default:
      return { ok: false, error: '未知消息类型' };
  }
}
