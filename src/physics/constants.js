/**
 * Billiard Physics Constants & Physical Unit Conversions
 * 
 * All internal physics calculations use standard SI units (meters, kilograms, seconds, radians).
 * These constants accurately model standard WPA (World Pool-Billiard Association) 9-foot tournament table specifications.
 */

// --- Unit Conversion Multipliers ---
export const METERS_PER_INCH = 0.0254;
export const METERS_PER_FOOT = 12 * METERS_PER_INCH;
export const METERS_PER_CM = 0.01;
export const METERS_PER_MM = 0.001;
export const RADIANS_PER_DEGREE = Math.PI / 180;
export const KG_PER_OUNCE = 0.02834952;
export const KG_PER_GRAM = 0.001;
export const SECONDS_PER_MS = 0.001;

// Internal short aliases matching original physics engine
export const ge = METERS_PER_INCH;
export const i2 = METERS_PER_FOOT;
export const xn = METERS_PER_CM;
export const We = METERS_PER_MM;
export const Je = RADIANS_PER_DEGREE;
export const zg = KG_PER_OUNCE;
export const s2 = KG_PER_GRAM;
export const Nc = 1;
export const ui = 1;
export const Qn = SECONDS_PER_MS;

// Precision tolerance for numerical root-finding and intersection detection
export const EPSILON = 1e-9;

/**
 * Complete default physics configuration:
 * Table dimensions, cushion profiles, pocket cuts, ball mechanics, cue stick properties,
 * and friction/restitution coefficients.
 */
export const DEFAULT_PHYSICS_CONFIG = {
  // Table Bed
  table_length: 100 * ge, // 100.0 inches playing surface length (standard 9ft table)
  
  // Pocket Geometries
  corner_pocket_size: 4.5 * ge, // 4.5 inches corner pocket mouth opening
  side_pocket_size: 5 * ge, // 5.0 inches side pocket mouth opening
  corner_facing_angle: 140 * Je, // Corner cushion facing angle
  side_facing_angle: 104 * Je, // Side cushion facing angle
  pocket_hole_radius: 3.25 * ge,
  corner_pocket_shelf: 2 * ge, // Slate shelf depth
  side_pocket_shelf: 0.375 * ge,
  
  // Cushion Dimensions
  cushion_corner_radius: 0.25 * ge,
  cushion_width: 2 * ge,
  cushion_nose_height: 0.635 * 2.25 * ge, // Cushion nose at 63.5% of ball diameter
  cushion_back_height: 1.6 * ge,
  
  // Ball Specifications (Aramith Tournament standard)
  ball_radius: 0.5 * 2.25 * ge, // 2.25 inches (57.15 mm) standard ball diameter
  ball_mass: 6 * zg, // 6.0 ounces (170 grams)
  
  // Cue Specifications
  cue: {
    tip_radius: 0.5 * 21.21 * We,
    shaft_radius: 0.5 * 12 * We,
    mass: 19 * zg, // 19.0 ounces standard cue mass
    endmass: 5 * s2,
    taper_length: 10 * ge,
    shaft_length: 29 * ge,
    joint_radius: 0.5 * 21.5 * We,
    butt_radius: 0.5 * 31.5 * We,
    butt_length: 29 * ge,
  },
  
  // Stroke Dynamics
  stroke: {
    max_speed: 4.5 * Nc, // 4.5 m/s maximum stroke speed
    max_backswing: 12 * ge,
    practice_strokes: [0.75, 0.5, 0.25],
    pre_backswing_pause: 750 * Qn,
    backswing_accel_time: 200 * Qn,
    backswing_speed: 0.5 * Nc,
    backswing_pause: 100 * Qn,
    followthrough_time: 150 * Qn,
  },
  
  // Physical Dynamics & Environmental Parameters
  gravitational_acceleration: 9.80665, // Standard earth gravity g = 9.80665 m/s^2
  ball_ball_friction: 0.05, // Dynamic friction between colliding phenolic balls
  ball_cloth_friction: 0.2, // Coulomb sliding friction coefficient on Simonis cloth
  ball_rail_friction: 0.2, // Cushion face friction coefficient (cut-induced spin)
  rolling_resistance: 0.01, // Rolling resistance deceleration coefficient
  ball_ball_cor: 0.95, // Coefficient of restitution: ball-ball elastic impact
  ball_rail_cor: 0.75, // Coefficient of restitution: cushion rebound
  ball_table_cor: 0.5, // Coefficient of restitution: vertical table bed bounce
  min_bounce_height: 1 * We, // Minimum bounce height threshold
};
