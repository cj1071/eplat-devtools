// 类型安全的消息通信协议

import { MSG } from './constants';

// ===== 消息类型定义 =====

export interface InsertSnippetMessage {
  type: typeof MSG.insertSnippet;
  payload: {
    code: string;
  };
}

export interface OpenFindMessage {
  type: typeof MSG.openFind;
}

export interface CopyUrlMessage {
  type: typeof MSG.copyUrl;
  payload: {
    relativePath: string;
  };
}

export interface OpenSidepanelMessage {
  type: typeof MSG.openSidepanel;
}

export interface PingEditorMessage {
  type: typeof MSG.pingEditor;
}

export interface ClipboardUpdateMessage {
  type: typeof MSG.clipboardUpdate;
  payload: {
    url: string;
    timestamp: number;
  };
}

export type ExtensionMessage =
  | InsertSnippetMessage
  | OpenFindMessage
  | CopyUrlMessage
  | OpenSidepanelMessage
  | PingEditorMessage
  | ClipboardUpdateMessage;

// ===== 辅助函数 =====

/** 向 background 发送消息 */
export function sendToBackground(message: ExtensionMessage): Promise<unknown> {
  return chrome.runtime.sendMessage(message);
}

/** 向指定 tab 的 content script 发送消息 */
export async function sendToTab(
  tabId: number,
  message: ExtensionMessage,
): Promise<unknown> {
  return chrome.tabs.sendMessage(tabId, message);
}

/** 向当前活动 tab 发送消息 */
export async function sendToActiveTab(
  message: ExtensionMessage,
): Promise<unknown> {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  if (tab?.id) {
    return sendToTab(tab.id, message);
  }
  return undefined;
}
