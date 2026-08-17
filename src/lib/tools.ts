import type { ToolDefinition } from '../types';

/**
 * Add new tools here. Each tool needs:
 * - a name + description (the model reads these to decide when to call it)
 * - a JSON-schema-style parameters object
 * - an execute function that actually performs the browser/app action
 *
 * IMPORTANT: real-world actions like "handle WhatsApp calls" are NOT
 * possible here — WhatsApp does not expose a public API for automating
 * or answering calls. That has to stay a manual action for the user.
 */
export const tools: ToolDefinition[] = [
  {
    name: 'openWebsite',
    description:
      'Opens a website in a new browser tab. Use when Boss asks to open, ' +
      'visit, or go to a specific site or search something on the web.',
    parameters: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description:
            'Full URL to open, e.g. https://youtube.com. If Boss gives a ' +
            'search term instead of a URL, build a Google search URL.',
        },
      },
      required: ['url'],
    },
    execute: async (args) => {
      const url = String(args.url ?? '');
      if (!url) return 'No URL provided.';
      try {
        window.open(url, '_blank', 'noopener,noreferrer');
        return `Opened ${url}`;
      } catch (e) {
        return `Failed to open ${url}: ${(e as Error).message}`;
      }
    },
  },
];

export function toGeminiFunctionDeclarations() {
  return tools.map((t) => ({
    name: t.name,
    description: t.description,
    parameters: t.parameters,
  }));
}

export async function runTool(name: string, args: Record<string, unknown>) {
  const tool = tools.find((t) => t.name === name);
  if (!tool) return `Unknown tool: ${name}`;
  return tool.execute(args);
}
