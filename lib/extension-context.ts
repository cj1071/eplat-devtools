const EXTENSION_CONTEXT_INVALIDATED_MARKERS = [
  'Extension context invalidated',
  'context invalidated',
];

export function isExtensionContextInvalidatedError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return EXTENSION_CONTEXT_INVALIDATED_MARKERS.some((marker) =>
    message.includes(marker),
  );
}

export function getExtensionReloadMessage(): string {
  return '扩展已重载，请刷新当前 eplat 页面后重试';
}
