/**
 * Client-side Storage Service for MillionBalls Pool Simulator
 * Handles local persistence of drill sessions, favorite drills, achievements, and user preferences.
 */

const STORAGE_KEYS = {
  FAVORITES: 'mb_favorites',
  SESSIONS: 'mb_drill_sessions',
  USER: 'mb_user',
  SETTINGS: 'mb_settings',
};

export const storage = {
  // --- Favorites ---
  getFavorites() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  isFavorite(drillId) {
    return this.getFavorites().includes(Number(drillId));
  },

  toggleFavorite(drillId) {
    const id = Number(drillId);
    let favs = this.getFavorites();
    if (favs.includes(id)) {
      favs = favs.filter(x => x !== id);
    } else {
      favs.push(id);
    }
    try {
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favs));
    } catch {}
    return favs.includes(id);
  },

  setFavorite(drillId, isFav) {
    const id = Number(drillId);
    let favs = this.getFavorites();
    if (isFav && !favs.includes(id)) {
      favs.push(id);
    } else if (!isFav && favs.includes(id)) {
      favs = favs.filter(x => x !== id);
    }
    try {
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favs));
    } catch {}
  },

  // --- Drill Sessions & Achievements ---
  getSessions(drillId = null) {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      const list = data ? JSON.parse(data) : [];
      if (drillId != null) {
        return list.filter(s => String(s.drill) === String(drillId));
      }
      return list;
    } catch {
      return [];
    }
  },

  saveSession(sessionData) {
    try {
      const list = this.getSessions();
      const session = {
        id: Date.now(),
        ...sessionData,
        completed_at: new Date().toISOString(),
        achievements: sessionData.achievements || [],
      };
      list.unshift(session);
      // Keep last 200 sessions to avoid unbounded growth
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(list.slice(0, 200)));
      return session;
    } catch {
      return sessionData;
    }
  },

  // --- User Profile / Session ---
  getUser() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setUser(user) {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch {}
  },

  logout() {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER);
    } catch {}
  },

  // --- Settings ---
  getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : { playerHeight: 70, units: 'in' };
    } catch {
      return { playerHeight: 70, units: 'in' };
    }
  },

  saveSettings(settings) {
    try {
      const current = this.getSettings();
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({ ...current, ...settings }));
    } catch {}
  },
};
