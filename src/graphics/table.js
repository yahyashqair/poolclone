/**
 * 3D Table Visual Configuration & Specifications
 * Defines dimensions, materials, and colors for slate, rails, cloth, pockets, and room environment.
 */

import { ge, We } from '../physics/constants.js';

export const TABLE_VISUAL_CONFIG = {
  cloth_color: 0x2583b5,            // Simonis Tournament Blue
  cushion_bottom_inset: 1 * ge,
  tabletop_thickness: 10 * ge,
  slate_thickness: 1 * ge,          // 1-inch tournament slate
  table_bed_height: 30 * ge,        // 30 inches playing height
  rail_top_width: 4 * ge,           // 4-inch wide solid wood rails
  rail_top_color: 0x4d1610,         // Dark mahogany wood
  rail_top_corner_bevel: 4 * ge,
  diamond_offset: (3 + 11 / 16) * ge,
  diamond_color: 0xffffff,          // Mother-of-pearl diamond sights
  diamond_width: 11.5 * We,
  pocket_liner_facing_length: 2 * ge,
  pocket_liner_thickness: 0.5 * ge,
  pocket_liner_color: 0x3b444b,     // Black rubber pocket facings
  pocket_box_color: 0xcc8226,       // Cast iron / brass pocket brackets
};

export const ROOM_VISUAL_CONFIG = {
  room_width: 10,
  room_length: 10,
  ceiling_height: 5,
  floor_texture: { url: './checker.png', width: 2, height: 2 },
  floor_color: 0xfffff0,
  wall_color: 0xdde2ff,
  ceiling_color: 0xffffff,
};

/**
 * Cloth color presets for user customization
 */
export const CLOTH_PRESETS = {
  tournament_blue: { name: 'Tournament Blue', color: 0x2583b5 },
  british_green:   { name: 'British Green',   color: 0x235d3a },
  burgundy:        { name: 'Burgundy',        color: 0x6e1b24 },
  charcoal:        { name: 'Charcoal Grey',   color: 0x3a3d40 },
};
