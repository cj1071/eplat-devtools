// 代码片段引擎 — 校验 + 搜索 + 获取代码

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readString(
  value: unknown,
  path: string,
  { allowEmpty = false }: { allowEmpty?: boolean } = {},
): string {
  if (typeof value !== 'string') {
    throw new Error(`${path} 必须是字符串`);
  }

  if (!allowEmpty && value.trim().length === 0) {
    throw new Error(`${path} 不能为空`);
  }

  return value;
}

function parseSnippetItem(value: unknown, path: string): SnippetItem {
  if (!isRecord(value)) {
    throw new Error(`${path} 必须是对象`);
  }

  const tags = value.tags;
  if (!Array.isArray(tags) || tags.some((tag) => typeof tag !== 'string')) {
    throw new Error(`${path}.tags 必须是字符串数组`);
  }

  return {
    id: readString(value.id, `${path}.id`),
    name: readString(value.name, `${path}.name`),
    description: readString(value.description, `${path}.description`, {
      allowEmpty: true,
    }),
    tags: tags.map((tag) => tag.trim()).filter(Boolean),
    template: readString(value.template, `${path}.template`),
  };
}

function parseSnippetCategory(value: unknown, index: number): SnippetCategory {
  const path = `模板第 ${index + 1} 项`;

  if (!isRecord(value)) {
    throw new Error(`${path} 必须是对象`);
  }

  const items = value.items;
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error(`${path}.items 必须是非空数组`);
  }

  return {
    category: readString(value.category, `${path}.category`),
    icon: readString(value.icon, `${path}.icon`, { allowEmpty: true }),
    items: items.map((item, itemIndex) =>
      parseSnippetItem(item, `${path}.items[${itemIndex}]`),
    ),
  };
}

export function parseSnippetCategories(value: unknown): SnippetCategory[] {
  const source = Array.isArray(value) ? value : [value];

  if (source.length === 0) {
    throw new Error('模板列表不能为空');
  }

  return source.map((item, index) => parseSnippetCategory(item, index));
}

export function parseSnippetCategoriesJson(text: string): SnippetCategory[] {
  let value: unknown;

  try {
    value = JSON.parse(text);
  } catch {
    throw new Error('JSON 解析失败，请检查逗号、引号和括号是否完整');
  }

  return parseSnippetCategories(value);
}

export function stringifySnippetCategories(categories: SnippetCategory[]): string {
  return `${JSON.stringify(categories, null, 2)}\n`;
}

export function countSnippetItems(categories: SnippetCategory[]): number {
  return categories.reduce((total, category) => total + category.items.length, 0);
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
