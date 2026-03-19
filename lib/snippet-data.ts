import builtinSnippetsSource from '@/snippets/builtin.json';
import templateSampleSource from '@/snippets/template.sample.json';
import {
  parseSnippetCategories,
  stringifySnippetCategories,
} from './snippet-engine';

export const BUILTIN_SNIPPETS = parseSnippetCategories(builtinSnippetsSource);

export const TEMPLATE_SAMPLE_SNIPPETS = parseSnippetCategories(
  templateSampleSource,
);

export const TEMPLATE_SAMPLE_JSON = stringifySnippetCategories(
  TEMPLATE_SAMPLE_SNIPPETS,
);
