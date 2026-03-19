# eplat-devtools 任务跟踪

## 规划阶段
- [x] 分析现有项目架构
- [x] 调研 WXT 框架
- [x] 创建 PRD（[docs/001-产品需求文档.md](file:///Users/chenjie/Project/tools/dz-script-editor-zoom-extension/docs/001-%E4%BA%A7%E5%93%81%E9%9C%80%E6%B1%82%E6%96%87%E6%A1%A3.md)）
- [x] 创建技术设计（[docs/002-技术设计文档.md](file:///Users/chenjie/Project/tools/dz-script-editor-zoom-extension/docs/002-%E6%8A%80%E6%9C%AF%E8%AE%BE%E8%AE%A1%E6%96%87%E6%A1%A3.md)）
- [x] 创建任务清单（[docs/003-任务清单.md](file:///Users/chenjie/Project/tools/dz-script-editor-zoom-extension/docs/003-%E4%BB%BB%E5%8A%A1%E6%B8%85%E5%8D%95.md)）
- [x] 创建 UI 设计（[docs/004-UI交互设计文档.md](file:///Users/chenjie/Project/tools/dz-script-editor-zoom-extension/docs/004-UI%E4%BA%A4%E4%BA%92%E8%AE%BE%E8%AE%A1%E6%96%87%E6%A1%A3.md)）
- [x] 创建项目记忆（[memory/01-项目记忆.md](file:///Users/chenjie/Project/tools/dz-script-editor-zoom-extension/memory/01-%E9%A1%B9%E7%9B%AE%E8%AE%B0%E5%BF%86.md)）
- [x] 创建模板规范（[memory/02-函数模板规范.md](file:///Users/chenjie/Project/tools/dz-script-editor-zoom-extension/memory/02-%E5%87%BD%E6%95%B0%E6%A8%A1%E6%9D%BF%E8%A7%84%E8%8C%83.md)）
- [x] 补充 AI 助手占位 + 悬浮球设计
- [x] **用户审阅确认**

## 阶段 1 — WXT 基础迁移
- [x] 初始化 WXT 项目（手动创建，GitHub API 限速）
- [x] 迁移 content script（模块化拆分为 7 个文件）
- [x] 迁移 ace-bridge（defineUnlistedScript + 新增 find/insert/高亮）
- [x] 创建 background service worker（消息路由 + sidepanel 控制）
- [x] 创建 sidepanel React 骨架（3 Tab + 3 组件）
- [x] 新增悬浮球模块（fab.ts + CSS）
- [x] `pnpm build` 构建验证通过（173KB，1.2s）
- [x] 设置 GitHub Actions CI（.zip + .crx）
- [x] 复制 docs/ 和 memory/ 到新项目
- [x] 阶段 1 完成

## 阶段 2 — 功能增强
- [x] URL 相对路径提取
- [ ] 快捷键唤出查询框（当前不生效，暂不处理）
- [x] geDialog 自定义弹窗选择器与工具栏兼容扩展

## 阶段 3 — 代码片段库
- [x] Sidepanel React 骨架（3 Tab）
- [x] 代码片段列表 + 搜索
- [x] 一键插入 + Ace 高亮
- [x] 剪贴板管理（URL 相对路径历史）
- [ ] 设置页 + 模板导入 + JSON 编辑器
