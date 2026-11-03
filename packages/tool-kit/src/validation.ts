import { z } from 'zod';

export const CategoryIdSchema = z.enum(['audio', 'video', 'image', 'text', 'dev', 'util']);

export const OptionFieldSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('slider'),
    key: z.string().min(1),
    label: z.string().min(1),
    help: z.string().optional(),
    min: z.number(),
    max: z.number(),
    step: z.number().optional(),
    default: z.number(),
    unit: z.string().optional(),
  }),
  z.object({
    type: z.literal('toggle'),
    key: z.string().min(1),
    label: z.string().min(1),
    help: z.string().optional(),
    default: z.boolean(),
  }),
  z.object({
    type: z.literal('select'),
    key: z.string().min(1),
    label: z.string().min(1),
    help: z.string().optional(),
    choices: z.array(z.object({
      value: z.string(),
      label: z.string(),
    })).min(1),
    default: z.string(),
  }),
  z.object({
    type: z.literal('text'),
    key: z.string().min(1),
    label: z.string().min(1),
    help: z.string().optional(),
    maxLength: z.number().optional(),
    default: z.string(),
  }),
]);

export const PresetSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  default: z.boolean().optional(),
  values: z.record(z.unknown()).optional(),
});

export const FileRuleSchema = z.object({
  extensions: z.array(z.string().min(1)).min(1),
  maxMB: z.number().positive(),
  kind: z.enum(['any', 'audio', 'video', 'image', 'pdf', 'text']),
  multiple: z.boolean().optional(),
});

export const ToolManifestSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'id must be kebab-case (e.g. voice-cleaner)'),
  name: z.string().min(2),
  shortName: z.string().optional(),
  tagline: z.string().min(5),
  description: z.string().min(10),
  category: CategoryIdSchema,
  icon: z.string().min(2),
  keywords: z.array(z.string().min(1)).min(1),
  status: z.enum(['live', 'beta', 'hidden']),
  runtime: z.enum(['browser', 'server']),
  input: FileRuleSchema,
  options: z.array(OptionFieldSchema),
  presets: z.array(PresetSchema).min(1),
  limits: z.array(z.string().min(3)).min(1, 'limits cannot be empty — be honest about tool boundaries'),
  faq: z.array(z.object({
    q: z.string().min(3),
    a: z.string().min(5),
  })).min(1, 'at least one FAQ question and answer is required'),
  next: z.array(z.string()).optional(),
  addedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'addedOn must be YYYY-MM-DD'),
});

