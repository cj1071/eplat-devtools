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

参考：

- Chrome 加载已解压扩展：<https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked>
- Chrome 替代安装方式：<https://developer.chrome.com/docs/extensions/how-to/distribute/install-extensions>

## Release 产物

GitHub Actions 在打 tag 时会生成：

- `eplat-devtools-<version>-chrome.zip`

如果只是测试或内部使用，优先使用 ZIP 解压加载。当前 CI 不再构建 `.crx` 或 `.crx.zip`。
