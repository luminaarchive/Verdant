// NaLI: Agent Core Types

export interface ToolInput {
  observationId: string;
  [key: string]: any;
}

export interface ToolOutput {
  status: 'completed' | 'warning' | 'error';
  latency_ms: number;
  score_breakdown: Record<string, number>;
  raw_output: string;
  error?: string;
  data?: any; // Structured extracted data
}

export interface AgentTool {
  name: string;
  version: string;
  
  execute(input: ToolInput): Promise<ToolOutput>;
  fallback?(input: ToolInput, error: any): Promise<ToolOutput>;
}

export type EventSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface WorkflowEvent {
  event_type: string;
  severity: EventSeverity;
  payload: Record<string, any>;
}
