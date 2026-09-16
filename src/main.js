/**
 * Agent/local entry sidecar. Legacy bundle (assets/) still mounts #app.
 * This module wires clean src/ utilities into bundle + console.
 */
import { api } from './services/api.js';
import { storage } from './services/storage.js';

export { api, storage };
export * from './physics/constants.js';

// ponytail: console handle for agents, drop if noisy
if (typeof window !== 'undefined') {
  window.__poolclone = { api, storage };
  // Floating link to trainer page; legacy bundle owns #app so stay outside it.
  const a = document.createElement('a');
  a.href = `${import.meta.env.BASE_URL}trainer.html`;
  a.textContent = 'Aim trainer';
  a.style.cssText = 'position:fixed;right:12px;bottom:12px;z-index:50;background:#fc0;color:#000;font:600 14px Arial;padding:10px 14px;border-radius:20px;text-decoration:none;';
  document.addEventListener('DOMContentLoaded', () => document.body.appendChild(a));
}
