// Background Service Worker — 消息路由 + Sidepanel 控制

import { MSG, TARGET_PATHS } from '@/lib/constants';
import type { ActiveTabStatus, SidepanelPortMessage } from '@/lib/editor-status';
import type { ExtensionMessage } from '@/lib/messaging';

export default defineBackground(() => {
  let sidepanelPort: chrome.runtime.Port | null = null;

  const pushActiveTabStatus = async () => {
    if (!sidepanelPort) return;

    const message: SidepanelPortMessage = {
      type: 'ACTIVE_TAB_STATUS',
      payload: await getActiveTabStatus(),
    };

    sidepanelPort.postMessage(message);
  };

  // 记录 sidepanel 的连接状态
  chrome.runtime.onConnect.addListener((port) => {
    if (port.name === 'sidepanel_port') {
      sidepanelPort = port;
      void pushActiveTabStatus();
      port.onDisconnect.addListener(() => {
        sidepanelPort = null;
      });
    }
  });

  chrome.tabs.onActivated.addListener(() => {
    void pushActiveTabStatus();
  });

  chrome.tabs.onUpdated.addListener((_tabId, changeInfo) => {
    if (changeInfo.status || changeInfo.url) {
      void pushActiveTabStatus();
    }
  });

  chrome.windows.onFocusChanged.addListener(() => {
    void pushActiveTabStatus();
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

    case MSG.pingEditor: {
      return { ok: true };
    }

    default:
      return { ok: false, error: '未知消息类型' };
  }
}

function getTabTitle(tab: chrome.tabs.Tab | undefined): string {
  return tab?.title?.trim() || tab?.url || '当前标签页';
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

async function queryActiveTab(): Promise<chrome.tabs.Tab | undefined> {
  const strategies: chrome.tabs.QueryInfo[] = [
    { active: true, lastFocusedWindow: true },
    { active: true, currentWindow: true },
    { active: true },
  ];

  const seen = new Set<number>();

  for (const queryInfo of strategies) {
    const tabs = await chrome.tabs.query(queryInfo);
    for (const tab of tabs) {
      if (!tab?.id || seen.has(tab.id)) continue;
      seen.add(tab.id);
      return tab;
    }
  }

  return undefined;
}

async function pingActiveTab(tabId: number): Promise<
  | { ok: true }
  | { ok: false; error: string; missingReceiver: boolean }
> {
  try {
    const response = await chrome.tabs.sendMessage(tabId, { type: MSG.pingEditor });
    if (response && typeof response === 'object' && 'ok' in response && response.ok === true) {
      return { ok: true };
    }

    return {
      ok: false,
      error: '当前标签页未返回可用编辑器状态',
      missingReceiver: false,
    };
  } catch (error) {
    const messageText = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      error: messageText,
      missingReceiver: messageText.includes('Receiving end does not exist'),
    };
  }
}

async function getActiveTabStatus(): Promise<ActiveTabStatus> {
  const tab = await queryActiveTab();

  if (!tab?.id) {
    return {
      canInsert: false,
      reason: '未找到活动标签页',
      tabTitle: '未连接',
    };
  }

  const pingResult = await pingActiveTab(tab.id);
  if (pingResult.ok) {
    return {
      canInsert: true,
      reason: '已检测到当前 eplat 编辑器，可直接插入代码片段',
      tabTitle: getTabTitle(tab),
    };
  }

  if (isDesignerTab(tab)) {
    return {
      canInsert: false,
      reason: pingResult.missingReceiver
        ? '当前 eplat 页面未完成注入，请刷新页面后重试'
        : `当前 eplat 页面暂不可插入：${pingResult.error}`,
      tabTitle: getTabTitle(tab),
    };
  }

  return {
    canInsert: false,
    reason: '请切换到 eplat 编辑器页面后再插入代码',
    tabTitle: getTabTitle(tab),
  };
}

async function sendMessageToActiveDesignerTab(
  message: ExtensionMessage,
): Promise<unknown> {
  const tab = await queryActiveTab();

  if (!tab?.id) {
    return { ok: false, error: '无活动标签页' };
  }

  const pingResult = await pingActiveTab(tab.id);
  if (!pingResult.ok) {
    if (isDesignerTab(tab)) {
      return {
        ok: false,
        error: pingResult.missingReceiver
          ? '当前 eplat 页面未完成注入，请刷新页面后重试'
          : `当前 eplat 页面暂不可插入：${pingResult.error}`,
      };
    }

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
