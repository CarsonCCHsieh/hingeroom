/**
 * HINGEROOM standalone geometry candidate. No Lens/runtime dependencies.
 * All lengths are centimeters; low-level rotation arguments are radians.
 * Hinge frame: +x along the closed door, +z outward, +y up.
 * Positive angle rotates (x,z) to (x*cos-z*sin, x*sin+z*cos).
 * This is not a guarantee about real furniture, tracking or measurements.
 */

export interface PointXZ { x: number; z: number }
export interface DoorGeometry {
  width: number;
  thickness: number;
  yMin: number;
  yMax: number;
}
export interface ObstacleBox {
  centerX: number;
  centerZ: number;
  halfWidth: number;
  halfDepth: number;
  yMin: number;
  yMax: number;
}
export interface PathOptions {
  /** Maximum midpoint interval evaluations; endpoints are two extra queries. */
  maxIntervals?: number;
  maxDepth?: number;
}
export type PathStatus = "open_to_check" | "clear" | "blocked";
export type PathReason =
  | "zero_angle"
  | "distance_witness"
  | "all_intervals_certified"
  | "interval_limit"
  | "depth_or_tolerance_limit"
  | "invalid_input";
export interface PathResult {
  status: PathStatus;
  label: "Open to check" | "Path clear" | "Path blocked";
  reason: PathReason;
  /** True only after every interval in [0, selectedAngle] was certified. */
  pathFullyCertified: boolean;
  /** True means blocked as a precaution, without a distance witness. */
  conservativeUncertainty: boolean;
  currentDistanceCm: number | null;
  /** Contact is overlap; a positive margin violation is a separate fact. */
  currentPanelOverlaps: boolean | null;
  currentWithinMargin: boolean | null;
  witness: { angleDegrees: number; distanceCm: number } | null;
  intervalEvaluations: number;
  distanceEvaluations: number;
  certifiedIntervals: number;
  deepestLevel: number;
  /** A conservative global lower bound, only populated for certified clear. */
  certifiedMinimumLowerBoundCm: number | null;
  inputError: string | null;
}

export const CLEARANCE_MARGIN_CM = 0.5;
export const NUMERICAL_EPSILON_CM = 0.0001;
export const MAX_OPENING_DEGREES = 110;
export const DEFAULT_DOOR: Readonly<DoorGeometry> = Object.freeze({
  width: 60, thickness: 2, yMin: 2, yMax: 78,
});
export const DEFAULT_OBSTACLE: Readonly<ObstacleBox> = Object.freeze({
  centerX: 35, centerZ: 35, halfWidth: 10, halfDepth: 10, yMin: 0, yMax: 60,
});

function requireFinite(value: number, name: string): void {
  if (!Number.isFinite(value)) throw new RangeError(name + " must be finite");
}
function validateDoor(door: Readonly<DoorGeometry>): void {
  requireFinite(door.width, "door.width");
  requireFinite(door.thickness, "door.thickness");
  requireFinite(door.yMin, "door.yMin");
  requireFinite(door.yMax, "door.yMax");
  if (door.width <= 0 || door.thickness <= 0 || door.yMax < door.yMin) {
    throw new RangeError("Invalid door dimensions");
  }
}
function validateObstacle(obstacle: Readonly<ObstacleBox>): void {
  requireFinite(obstacle.centerX, "obstacle.centerX");
  requireFinite(obstacle.centerZ, "obstacle.centerZ");
  requireFinite(obstacle.halfWidth, "obstacle.halfWidth");
  requireFinite(obstacle.halfDepth, "obstacle.halfDepth");
  requireFinite(obstacle.yMin, "obstacle.yMin");
  requireFinite(obstacle.yMax, "obstacle.yMax");
  if (obstacle.halfWidth <= 0 || obstacle.halfDepth <= 0 || obstacle.yMax < obstacle.yMin) {
    throw new RangeError("Invalid obstacle dimensions");
  }
}

function rotatedDoor(angleRadians: number, door: Readonly<DoorGeometry>): PointXZ[] {
  const c = Math.cos(angleRadians), s = Math.sin(angleRadians), h = door.thickness / 2;
  return [
    {x: 0, z: -h}, {x: door.width, z: -h},
    {x: door.width, z: h}, {x: 0, z: h},
  ].map(p => ({x: p.x * c - p.z * s, z: p.x * s + p.z * c}));
}
function boxFootprint(box: Readonly<ObstacleBox>): PointXZ[] {
  return [
    {x: box.centerX - box.halfWidth, z: box.centerZ - box.halfDepth},
    {x: box.centerX + box.halfWidth, z: box.centerZ - box.halfDepth},
    {x: box.centerX + box.halfWidth, z: box.centerZ + box.halfDepth},
    {x: box.centerX - box.halfWidth, z: box.centerZ + box.halfDepth},
  ];
}
export function doorFootprint(
  angleRadians: number, door: Readonly<DoorGeometry> = DEFAULT_DOOR,
): PointXZ[] {
  requireFinite(angleRadians, "angleRadians");
  validateDoor(door);
  return rotatedDoor(angleRadians, door);
}
export function obstacleFootprint(obstacle: Readonly<ObstacleBox>): PointXZ[] {
  validateObstacle(obstacle);
  return boxFootprint(obstacle);
}

/** Convex SAT, including edge/vertex contact. Axes need not be normalized. */
function convexPolygonsOverlap(a: readonly PointXZ[], b: readonly PointXZ[]): boolean {
  for (const polygon of [a, b]) {
    for (let i = 0; i < polygon.length; i++) {
      const p = polygon[i], q = polygon[(i + 1) % polygon.length];
      const axisX = -(q.z - p.z), axisZ = q.x - p.x;
      let aMin = Infinity, aMax = -Infinity, bMin = Infinity, bMax = -Infinity;
      for (const v of a) {
        const d = v.x * axisX + v.z * axisZ;
        aMin = Math.min(aMin, d); aMax = Math.max(aMax, d);
      }
      for (const v of b) {
        const d = v.x * axisX + v.z * axisZ;
        bMin = Math.min(bMin, d); bMax = Math.max(bMax, d);
      }
      if (aMax < bMin || bMax < aMin) return false;
    }
  }
  return true;
}
function pointSegmentDistance(p: PointXZ, a: PointXZ, b: PointXZ): number {
  const dx = b.x - a.x, dz = b.z - a.z, denominator = dx * dx + dz * dz;
  if (denominator === 0) return Math.hypot(p.x - a.x, p.z - a.z);
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.z - a.z) * dz) / denominator));
  return Math.hypot(p.x - a.x - t * dx, p.z - a.z - t * dz);
}
function polygonDistance(a: readonly PointXZ[], b: readonly PointXZ[]): number {
  if (convexPolygonsOverlap(a, b)) return 0;
  let nearest = Infinity;
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      nearest = Math.min(nearest,
        pointSegmentDistance(a[i], b[j], b[(j + 1) % b.length]),
        pointSegmentDistance(b[j], a[i], a[(i + 1) % a.length]));
    }
  }
  return nearest;
}
function distanceUnchecked(
  angleRadians: number, obstacle: Readonly<ObstacleBox>, door: Readonly<DoorGeometry>,
): number {
  const horizontal = polygonDistance(rotatedDoor(angleRadians, door), boxFootprint(obstacle));
  // Upright prisms are Cartesian products, so their distance factors this way.
  const vertical = Math.max(0, door.yMin - obstacle.yMax, obstacle.yMin - door.yMax);
  return Math.hypot(horizontal, vertical);
}
/** Exact static minimum distance in real arithmetic; JS uses binary64 floats. */
export function prismDistanceCm(
  angleRadians: number, obstacle: Readonly<ObstacleBox>,
  door: Readonly<DoorGeometry> = DEFAULT_DOOR,
): number {
  requireFinite(angleRadians, "angleRadians"); validateDoor(door); validateObstacle(obstacle);
  return distanceUnchecked(angleRadians, obstacle, door);
}
export function doorRadiusCm(door: Readonly<DoorGeometry> = DEFAULT_DOOR): number {
  validateDoor(door);
  return Math.hypot(door.width, door.thickness / 2);
}
/**
 * Every door point is within radius R of the vertical hinge. Relative to an
 * interval midpoint, displacement <= 2 R sin(intervalWidth/4). Our interval
 * widths are at most 110 degrees, where the sine bound is monotonic.
 */
export function midpointDisplacementBoundCm(
  intervalWidthRadians: number, door: Readonly<DoorGeometry> = DEFAULT_DOOR,
): number {
  requireFinite(intervalWidthRadians, "intervalWidthRadians");
  if (intervalWidthRadians < 0 || intervalWidthRadians > MAX_OPENING_DEGREES * Math.PI / 180) {
    throw new RangeError("Interval width outside the supported 0..110 degree range");
  }
  return 2 * doorRadiusCm(door) * Math.sin(intervalWidthRadians / 4);
}

/**
 * Checks the entire opening path from CLOSED, never just the last slider step.
 * A distance witness <= margin+epsilon blocks. Otherwise a midpoint certifies
 * its whole interval only when d > margin+epsilon+displacementBound. This is
 * justified by the distance function's 1-Lipschitz Hausdorff bound. Unresolved
 * intervals always block conservatively; they never produce a false "clear".
 *
 * Zero degrees deliberately returns "Open to check", with separate current
 * panel facts. Witness angle is an example blockage, not first contact or the
 * global minimum. Low-level geometry throws on invalid dimensions; this public
 * path entry instead fails closed with reason="invalid_input".
 */
export function checkDoorPath(
  selectedAngleDegrees: number, obstacle: Readonly<ObstacleBox> = DEFAULT_OBSTACLE,
  door: Readonly<DoorGeometry> = DEFAULT_DOOR, options: Readonly<PathOptions> = {},
): PathResult {
  const result: PathResult = {
    status: "blocked", label: "Path blocked", reason: "invalid_input",
    pathFullyCertified: false, conservativeUncertainty: true,
    currentDistanceCm: null, currentPanelOverlaps: null, currentWithinMargin: null,
    witness: null, intervalEvaluations: 0, distanceEvaluations: 0,
    certifiedIntervals: 0, deepestLevel: 0, certifiedMinimumLowerBoundCm: null,
    inputError: null,
  };
  const maxIntervals = options.maxIntervals === undefined ? 4096 : options.maxIntervals;
  const maxDepth = options.maxDepth === undefined ? 30 : options.maxDepth;
  try {
    requireFinite(selectedAngleDegrees, "selectedAngleDegrees");
    validateDoor(door); validateObstacle(obstacle);
    if (selectedAngleDegrees < 0 || selectedAngleDegrees > MAX_OPENING_DEGREES) {
      throw new RangeError("Opening angle outside 0..110 degrees");
    }
    if (!Number.isInteger(maxIntervals) || maxIntervals < 1 ||
        !Number.isInteger(maxDepth) || maxDepth < 0 || maxDepth > 50) {
      throw new RangeError("Invalid adaptive resource limits");
    }
  } catch (error) {
    result.inputError = String(error);
    return result;
  }
  const threshold = CLEARANCE_MARGIN_CM + NUMERICAL_EPSILON_CM;
  const end = selectedAngleDegrees * Math.PI / 180;
  const evaluate = (angle: number): number => {
    result.distanceEvaluations++;
    return distanceUnchecked(angle, obstacle, door);
  };
  const currentDistance = evaluate(end);
  if (!Number.isFinite(currentDistance)) {
    result.inputError = "Non-finite computed distance";
    return result;
  }
  result.currentDistanceCm = currentDistance;
  result.currentPanelOverlaps = currentDistance === 0;
  result.currentWithinMargin = currentDistance <= threshold;
  if (selectedAngleDegrees === 0) {
    result.status = "open_to_check"; result.label = "Open to check";
    result.reason = "zero_angle"; result.conservativeUncertainty = false;
    return result;
  }
  const blockAt = (angle: number, distance: number): PathResult => {
    result.reason = "distance_witness"; result.conservativeUncertainty = false;
    result.witness = {angleDegrees: angle * 180 / Math.PI, distanceCm: distance};
    return result;
  };
  if (currentDistance <= threshold) return blockAt(end, currentDistance);
  const closedDistance = evaluate(0);
  if (!Number.isFinite(closedDistance)) {
    result.inputError = "Non-finite computed distance";
    return result;
  }
  if (closedDistance <= threshold) return blockAt(0, closedDistance);
  const radius = doorRadiusCm(door);
  const stack: {a: number; b: number; depth: number}[] = [{a: 0, b: end, depth: 0}];
  let certifiedMinimum = Infinity;
  while (stack.length > 0) {
    if (result.intervalEvaluations >= maxIntervals) {
      result.reason = "interval_limit";
      return result;
    }
    const interval = stack.pop()!;
    const midpoint = (interval.a + interval.b) / 2;
    const d = evaluate(midpoint);
    result.intervalEvaluations++;
    result.deepestLevel = Math.max(result.deepestLevel, interval.depth);
    if (!Number.isFinite(d)) {
      result.reason = "invalid_input"; result.inputError = "Non-finite computed distance";
      return result;
    }
    if (d <= threshold) return blockAt(midpoint, d);
    const delta = 2 * radius * Math.sin((interval.b - interval.a) / 4);
    if (d > threshold + delta) {
      result.certifiedIntervals++;
      certifiedMinimum = Math.min(certifiedMinimum, d - delta);
      continue;
    }
    if (interval.depth >= maxDepth || delta <= NUMERICAL_EPSILON_CM) {
      result.reason = "depth_or_tolerance_limit";
      return result;
    }
    // Deterministic left-first traversal; no asynchronous work or frame state.
    stack.push({a: midpoint, b: interval.b, depth: interval.depth + 1});
    stack.push({a: interval.a, b: midpoint, depth: interval.depth + 1});
  }
  result.status = "clear"; result.label = "Path clear";
  result.reason = "all_intervals_certified";
  result.pathFullyCertified = true; result.conservativeUncertainty = false;
  result.certifiedMinimumLowerBoundCm = certifiedMinimum;
  return result;
}
