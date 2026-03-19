// 代码片段引擎 — 加载 + 搜索 + 获取代码

export interface SnippetItem {
  id: string;
  name: string;
  description: string;
  tags: string[];
  /** 代码模板，使用 ${占位符} 标记待填充部分 */
  template: string;
}

export interface SnippetCategory {
  category: string;
  icon: string;
  items: SnippetItem[];
}

/**
 * 获取代码片段代码（直接返回模板，保留占位符）
 */
export function getSnippetCode(item: SnippetItem): string {
  return item.template;
}

/**
 * 搜索代码片段（模糊匹配 name / description / tags）
 */
export function searchSnippets(
  categories: SnippetCategory[],
  query: string,
): SnippetCategory[] {
  if (!query.trim()) return categories;

  const q = query.toLowerCase();
  return categories
    .map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.tags.some((tag) => tag.toLowerCase().includes(q)),
      ),
    }))
    .filter((cat) => cat.items.length > 0);
}
