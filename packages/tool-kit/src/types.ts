/**
 * PEGBOX TOOL CONTRACT
 * Erasable TypeScript only (no enums / namespaces) so it also runs under Node type-stripping.
 *
 * Rule: a tool is ONE folder. The app discovers it; nothing else in the app is edited.
 */

export type CategoryId = 'audio' | 'video' | 'image' | 'text' | 'dev' | 'util';

export type OptionField =
  | { type: 'slider'; key: string; label: string; help?: string; min: number; max: number; step?: number; default: number; unit?: string }
  | { type: 'toggle'; key: string; label: string; help?: string; default: boolean }
  | { type: 'select'; key: string; label: string; help?: string; choices: { value: string; label: string }[]; default: string }
  | { type: 'text';   key: string; label: string; help?: string; maxLength?: number; default: string };

export type Preset = { id: string; name: string; description: string; default?: boolean; values?: Record<string, unknown> };

export type FileRule = {
  /** lower-case extensions without dot */
  extensions: string[];
  /** human limit shown before processing, enforced in code */
  maxMB: number;
  /** 'any' | 'audio' | 'video' | 'image' | 'pdf' | 'text' */
  kind: 'any' | 'audio' | 'video' | 'image' | 'pdf' | 'text';
  multiple?: boolean;
};

export type ToolManifest = {
  /** url slug AND folder name, kebab-case, never changes once published */
  id: string;
  name: string;            // "Voice Cleaner"
  shortName?: string;      // "Hush"
  tagline: string;         // one line, plain words
  description: string;     // 1–2 sentences for cards + meta description
  category: CategoryId;
  icon: string;            // Lucide icon name
  keywords: string[];      // SEO + search box
  status: 'live' | 'beta' | 'hidden';
  /** where the work happens. 'browser' is the default and the only runtime built in v1 */
  runtime: 'browser' | 'server';
  input: FileRule;
  options: OptionField[];
  presets: Preset[];
  /** shown on the tool page; real, honest, no promises the tool can't keep */
  limits: string[];
  faq: { q: string; a: string }[];
  /** ids of tools to suggest after a result ("Next: cut the silence") */
  next?: string[];
  addedOn: string;         // ISO date, used for "New" badge
};

export type Progress = (label: string, percent: number) => void;

export type RunContext = {
  files: File[];
  preset: string;
  options: Record<string, unknown>;     // already validated + clamped against manifest.options
  onProgress: Progress;
  signal: AbortSignal;                  // MUST be honoured: cancel = stop work + free memory
  /** shared ffmpeg.wasm handle, lazily loaded; only present if the tool declares needsFfmpeg */
  ffmpeg?: unknown;
  log: (msg: string) => void;           // dev/admin diagnostics only, never contains file names
};

export type RunResult = {
  outputs: { name: string; blob: Blob; mime: string }[];
  /** shown as stat chips on the result screen, e.g. [{label:'Saved', value:'3m 35s'}] */
  stats: { label: string; value: string }[];
  /** engine-internal notes (fallback mode used etc). Never shown to users. */
  diagnostics?: Record<string, unknown>;
};

export type ToolModule = {
  manifest: ToolManifest;
  /** dynamic import so each tool is its own JS chunk (nothing loads until the tool page opens) */
  load: () => Promise<{ run: (ctx: RunContext) => Promise<RunResult> }>;
  needsFfmpeg?: boolean;
};

/** Pure helper tools use; shows the one validation every tool shares. */
export function clampOptions(manifest: ToolManifest, raw: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of manifest.options) {
    const v = raw[f.key];
    if (f.type === 'slider') {
      const n = typeof v === 'number' && Number.isFinite(v) ? v : f.default;
      out[f.key] = Math.min(f.max, Math.max(f.min, n));
    } else if (f.type === 'toggle') out[f.key] = typeof v === 'boolean' ? v : f.default;
    else if (f.type === 'select') out[f.key] = f.choices.some((c) => c.value === v) ? v : f.default;
    else out[f.key] = typeof v === 'string' ? v.slice(0, f.maxLength ?? 200) : f.default;
  }
  return out;
}

