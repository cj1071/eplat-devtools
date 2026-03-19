import { defineConfig } from 'wxt';

// 参考文档: https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'eplat-devtools',
    description: 'eplat 平台脚本编辑器增强工具',
    permissions: ['storage', 'sidePanel'],
    action: {},
    web_accessible_resources: [
      {
        resources: ['ace-bridge.js'],
        matches: ['http://*/eplat/*', 'https://*/eplat/*'],
      },
    ],
  },
});
