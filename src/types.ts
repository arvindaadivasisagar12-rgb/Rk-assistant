export type AssistantState =
  | 'disconnected'
  | 'connecting'
  | 'idle'
  | 'listening'
  | 'speaking'
  | 'error';

export interface ToolCallRequest {
  id: string;
  name: string;
  args: Record<string, unknown>;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute: (args: Record<string, unknown>) => Promise<string>;
}
