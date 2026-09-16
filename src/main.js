/**
 * Agent/local entry sidecar. Legacy bundle (assets/) still mounts #app.
 * This module wires clean src/ utilities into bundle + console.
 */
import { api } from './services/api.js';
import { storage } from './services/storage.js';

export { api, storage };
export * from './physics/constants.js';

// ponytail: console handle for agents, drop if noisy
if (typeof window !== 'undefined') window.__poolclone = { api, storage };
