import type { ToolModule } from '@pegbox/tool-kit';
import { manifest } from './manifest';

const tool: ToolModule = {
  manifest,
  load: () => import('./engine'),
  needsFfmpeg: true,
};

export default tool;
