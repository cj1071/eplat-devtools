# eplat-devtools

eplat 平台脚本编辑器增强扩展，基于 WXT + TypeScript + React 构建。

## 功能概览

- 脚本编辑器缩放
- 编辑器最大化
- URL 复制时自动转相对路径
- Side Panel 代码片段插入
- 剪贴板 URL 历史

## 本地开发

```bash
pnpm install
pnpm dev
```

构建与打包：

```bash
pnpm build
pnpm zip
```

## 安装方式

### 推荐：ZIP 解压加载

1. 从 Releases 下载 `eplat-devtools-<version>-chrome.zip`
2. 解压到本地目录
3. 打开 `chrome://extensions`
4. 开启“开发者模式”
5. 点击“加载已解压的扩展程序”
6. 选择解压后的目录

这是当前最稳定的安装方式。

### CRX 的实际边界

Release 会同时提供：

- `eplat-devtools.crx`
- `eplat-devtools.crx.zip`

其中 `eplat-devtools.crx.zip` 只是给浏览器下载使用的包装文件。下载后先解压，再得到 `eplat-devtools.crx`。

需要注意：

- Chrome 经常会拦截 `.crx` 直接下载，所以优先下载 `eplat-devtools.crx.zip`
- 在 Windows 和 macOS 上，Chrome 官方不支持从本地 CRX 路径做普通外部安装；这类安装通常需要 Chrome Web Store 或企业策略
- Linux 才支持通过本地 CRX 或外部托管方式做系统级安装

参考：

- Chrome 加载已解压扩展：<https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked>
- Chrome 替代安装方式：<https://developer.chrome.com/docs/extensions/how-to/distribute/install-extensions>

## Release 产物

GitHub Actions 在打 tag 时会生成：

- `eplat-devtools-<version>-chrome.zip`
- `eplat-devtools.crx`
- `eplat-devtools.crx.zip`

如果只是测试或内部使用，优先使用 ZIP 解压加载。
