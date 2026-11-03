export interface FfmpegProgressMsg {
  type: 'progress';
  label: string;
  percent: number;
}

export interface FfmpegLogMsg {
  type: 'log';
  message: string;
}

export interface FfmpegSuccessMsg {
  type: 'success';
  outputs: {
    name: string;
    data: Uint8Array;
    mime: string;
  }[];
  diagnostics?: Record<string, unknown>;
}

export interface FfmpegErrorMsg {
  type: 'error';
  error: string;
}

export type WorkerToHostMsg =
  | FfmpegProgressMsg
  | FfmpegLogMsg
  | FfmpegSuccessMsg
  | FfmpegErrorMsg;

export interface RunJobPayload {
  type: 'run';
  files: { name: string; data: Uint8Array }[];
  steps: {
    args: string[];
    stageLabel: string;
    extractJson?: boolean;
    outputFileName?: string;
  }[];
  needModel?: boolean;
  totalDuration?: number;
}

export interface AbortJobPayload {
  type: 'abort';
}

export type HostToWorkerMsg = RunJobPayload | AbortJobPayload;

