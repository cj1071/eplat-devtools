import { defineConfig } from 'wxt';

// 参考文档: https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'eplat-devtools',
    description: 'eplat 平台脚本编辑器增强工具',
    permissions: ['storage', 'sidePanel'],
    icons: {
      16: 'icons/icon-16.png',
      32: 'icons/icon-32.png',
      48: 'icons/icon-48.png',
      128: 'icons/icon-128.png',
    },
    action: {
      default_icon: {
        16: 'icons/icon-16.png',
        32: 'icons/icon-32.png',
      },
    },
    web_accessible_resources: [
      {
        resources: ['ace-bridge.js'],
        matches: ['http://*/*', 'https://*/*'],
      },
    ],
  },
});
