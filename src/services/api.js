/**
 * Client-side Data API Service
 * Serves drill configurations, tutorials, and local persistence without requiring a backend server.
 */

import drillsData from '../data/drills.json';
import { storage } from './storage.js';

// Bundled at build time; works under Pages subpath. Keys: ../data/tutorials/<name>.json
const tutorialModules = import.meta.glob('../data/tutorials/*.json', { eager: true });

export const api = {
  /**
   * Retrieves all available drills, optionally filtered by favorites.
   */
  async getDrills({ favorite = false } = {}) {
    const favs = storage.getFavorites();
    let results = drillsData.map(d => ({
      ...d,
      favorite: favs.includes(Number(d.id)),
    }));

    if (favorite) {
      results = results.filter(d => d.favorite);
    }

    return {
      count: results.length,
      limit: 50,
      offset: 0,
      next: null,
      previous: null,
      results,
    };
  },

  /**
   * Retrieves a single drill by its unique numeric ID.
   */
  async getDrill(id) {
    const numId = Number(id);
    const drill = drillsData.find(d => Number(d.id) === numId);
    if (!drill) {
      throw new Error(`Drill with ID ${id} not found`);
    }
    const favs = storage.getFavorites();
    return {
      ...drill,
      favorite: favs.includes(numId),
    };
  },

  /**
   * Toggles or sets favorite status for a drill.
   */
  async setFavorite(drillId, isFav) {
    storage.setFavorite(drillId, isFav);
    return { success: true };
  },

  /**
   * Retrieves a tutorial step-by-step lesson by name.
   */
  async getTutorial(name) {
    const key = `../data/tutorials/${name}.json`;
    if (tutorialModules[key]) {
      const mod = tutorialModules[key];
      return mod.default || mod;
    }

    // Fallback: public/ copy for dev-added files not yet bundled
    const response = await fetch(`${import.meta.env.BASE_URL}tutorials/${name}.json`);
    if (!response.ok) throw new Error(`Tutorial ${name} not found`);
    return await response.json();
  },

  /**
   * Records a completed drill attempt session.
   */
  async recordSession(sessionData) {
    return storage.saveSession(sessionData);
  },

  /**
   * Retrieves session history for a drill.
   */
  async getSessions(drillId = null) {
    return storage.getSessions(drillId);
  },
};
