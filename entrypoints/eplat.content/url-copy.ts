import { appendClipboard } from '@/lib/storage';

function getSelectedText(target: EventTarget | null): string {
  const node = target instanceof Element ? target : null;

  if (node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement) {
    const start = node.selectionStart ?? 0;
    const end = node.selectionEnd ?? 0;
    return node.value.slice(start, end).trim();
  }

  return window.getSelection()?.toString().trim() ?? '';
}

function toRelativeEplatPath(text: string): string | null {
  if (!text || /\s/.test(text)) return null;

  try {
    const url = new URL(text);
    if (!/^https?:$/i.test(url.protocol)) return null;
    if (url.origin !== window.location.origin) return null;
    if (!url.pathname.startsWith('/eplat/')) return null;

    const relativePath = `${url.pathname.slice('/eplat'.length)}${url.search}${url.hash}`;
    return relativePath || '/';
  } catch {
    return null;
  }
}

function onCopy(event: ClipboardEvent) {
  const originalText = getSelectedText(event.target);
  const relativePath = toRelativeEplatPath(originalText);
  if (!relativePath || !event.clipboardData) return;

  event.preventDefault();
  event.clipboardData.setData('text/plain', relativePath);

  void appendClipboard({
    type: 'url',
    content: relativePath,
    timestamp: Date.now(),
  });
}

export function registerUrlCopyListener() {
  document.addEventListener('copy', onCopy, true);
}
