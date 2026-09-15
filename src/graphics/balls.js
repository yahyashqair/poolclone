/**
 * 3D Billiard Ball Texture Generator
 * Generates official WPA tournament ball textures dynamically on HTML5 canvas.
 * - Balls 1-7: Solid colors
 * - Ball 8: Black solid
 * - Balls 9-15: Striped colors matching 1-7
 * - Cue Ball: White with red dots (Aramith Pro Cup measles pattern)
 */

import { CanvasTexture } from 'three';

export const BALL_COLORS = {
  cue_ball: { color: "#ffffff", striped: false, text: "" },
  1: { color: "#fcb500", striped: false, text: "1" },  // Yellow
  2: { color: "#173654", striped: false, text: "2" },  // Blue
  3: { color: "#dc0004", striped: false, text: "3" },  // Red
  4: { color: "#2d1132", striped: false, text: "4" },  // Purple
  5: { color: "#ff4a00", striped: false, text: "5" },  // Orange
  6: { color: "#163433", striped: false, text: "6" },  // Green
  7: { color: "#6e051b", striped: false, text: "7" },  // Maroon
  8: { color: "#000000", striped: false, text: "8" },  // 8-Ball
  9: { color: "#fcb500", striped: true, text: "9" },   // Striped Yellow
  10: { color: "#173654", striped: true, text: "10" }, // Striped Blue
  11: { color: "#dc0004", striped: true, text: "11" }, // Striped Red
  12: { color: "#2d1132", striped: true, text: "12" }, // Striped Purple
  13: { color: "#ff4a00", striped: true, text: "13" }, // Striped Orange
  14: { color: "#163433", striped: true, text: "14" }, // Striped Green
  15: { color: "#6e051b", striped: true, text: "15" }, // Striped Maroon
};

const textureCache = new Map();

/**
 * Creates or retrieves a cached CanvasTexture for the specified ball identifier.
 * @param {string|number} ballType - "cue_ball" or 1..15
 * @returns {CanvasTexture} Three.js texture
 */
export function getBallTexture(ballType) {
  if (textureCache.has(ballType)) {
    return textureCache.get(ballType);
  }

  const spec = BALL_COLORS[ballType] || BALL_COLORS.cue_ball;
  const canvas = document.createElement('canvas');
  const height = 256;
  const width = height * 2;
  const stripeHeight = height * 0.4;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = spec.color;

  if (spec.striped) {
    ctx.fillRect(0, (height - stripeHeight) / 2, width, stripeHeight);
  } else {
    ctx.fillRect(0, 0, width, height);
  }
  ctx.restore();

  // Aramith Pro Cup red dots on cue ball
  if (ballType === 'cue_ball') {
    const dotRadius = 0.0625 * height;
    ctx.save();
    ctx.fillStyle = BALL_COLORS[3].color; // red
    ctx.fillRect(0, 0, width, dotRadius);
    ctx.fillRect(0, height - dotRadius, width, dotRadius);
    ctx.translate(width / 8, height / 2);
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.ellipse(0, 0, dotRadius, dotRadius, 0, 0, 2 * Math.PI);
      ctx.fill();
      ctx.translate(width / 4, 0);
    }
    ctx.restore();
  } else {
    // Number circle on both sides of the ball
    const drawNumberBadge = () => {
      const circleRadius = 0.15 * height;
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(0, 0, circleRadius, circleRadius, 0, 0, 2 * Math.PI);
      ctx.fill();
      ctx.font = `bold ${height * 0.2}px/1 sans-serif`;
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.translate(0, 0.015 * height);
      ctx.fillText(spec.text, 0, 0);
      ctx.restore();
    };

    ctx.save();
    ctx.translate(width / 3, height / 2);
    drawNumberBadge();
    ctx.translate(width / 2, 0);
    drawNumberBadge();
    ctx.restore();
  }

  const texture = new CanvasTexture(canvas);
  textureCache.set(ballType, texture);
  return texture;
}
