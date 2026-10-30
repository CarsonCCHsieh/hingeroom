/** Standalone native Node verification only. Does not run Lens/Preview/LEAF. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync, writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {
  checkDoorPath, prismDistanceCm, doorFootprint, obstacleFootprint,
  doorRadiusCm, midpointDisplacementBoundCm, DEFAULT_DOOR, DEFAULT_OBSTACLE,
  CLEARANCE_MARGIN_CM, NUMERICAL_EPSILON_CM,
} from '../Scripts/HINGEROOMGeometry.ts';

const rad = degrees => degrees * Math.PI / 180;
const box = (x, z, extra = {}) => ({...DEFAULT_OBSTACLE, centerX: x, centerZ: z, ...extra});
const close = (actual, expected, tolerance = 1e-8) => {
  assert.ok(Math.abs(actual - expected) <= tolerance,
    `expected ${expected} +/- ${tolerance}, received ${actual}`);
};
const outputs = [];
const test = (name, body) => {
  const details = body();
  outputs.push({name, passed: true, ...details});
};

const vectors = [
  ['default_10', box(35, 35), 10, 'clear'],
  ['default_45', box(35, 35), 45, 'blocked'],
  ['default_90_current_clear_but_path_blocked', box(35, 35), 90, 'blocked'],
  ['aabb_false_positive_45', box(10, 35), 45, 'clear'],
  ['negative_x_90', box(-15, 55), 90, 'clear'],
  ['negative_x_110', box(-15, 55), 110, 'blocked'],
  ['far_110', box(80, 80), 110, 'clear'],
  ['subdegree_narrow_margin_50', box(52.41015008585, 53.15688226442), 50, 'blocked'],
];
for (const [name, obstacle, angle, expected] of vectors) {
  test(name, () => {
    const result = checkDoorPath(angle, obstacle);
    assert.equal(result.status, expected);
    assert.equal(result.conservativeUncertainty, false);
    assert.equal(result.pathFullyCertified, expected === 'clear');
    if (expected === 'blocked') {
      assert.equal(result.reason, 'distance_witness');
      assert.ok(result.witness.distanceCm <= CLEARANCE_MARGIN_CM + NUMERICAL_EPSILON_CM);
      assert.ok(result.witness.angleDegrees >= 0 && result.witness.angleDegrees <= angle);
    } else {
      assert.ok(result.certifiedMinimumLowerBoundCm > CLEARANCE_MARGIN_CM + NUMERICAL_EPSILON_CM);
    }
    return {kind: 'primary_vector', obstacle, angleDegrees: angle, expectedStatus: expected, result};
  });
}

test('static_distances_independent_reference_constants', () => {
  const actual = {
    default10: prismDistanceCm(rad(10), box(35, 35)),
    default90: prismDistanceCm(rad(90), box(35, 35)),
    aabb45: prismDistanceCm(rad(45), box(10, 35)),
    negativeX90: prismDistanceCm(rad(90), box(-15, 55)),
  };
  close(actual.default10, 15.806025830293338);
  close(actual.default90, 24);
  close(actual.aabb45, 2.5355339059327378);
  close(actual.negativeX90, 4);
  const path = checkDoorPath(90, box(35, 35));
  assert.equal(path.currentPanelOverlaps, false);
  assert.equal(path.currentWithinMargin, false);
  return {actualDistancesCm: actual};
});

test('aabb_overlap_is_not_collision', () => {
  const a = doorFootprint(rad(45)), b = obstacleFootprint(box(10, 35));
  const overlap = ['x', 'z'].every(axis =>
    Math.max(...a.map(p => p[axis])) >= Math.min(...b.map(p => p[axis])) &&
    Math.max(...b.map(p => p[axis])) >= Math.min(...a.map(p => p[axis])));
  assert.equal(overlap, true);
  const analyticMinimum = 5 / Math.sqrt(2) - 1;
  close(prismDistanceCm(rad(45), box(10, 35)), analyticMinimum);
  assert.equal(checkDoorPath(45, box(10, 35)).status, 'clear');
  return {coarseAabbOverlap: overlap, analyticWholePathMinimumCm: analyticMinimum};
});

test('endpoints_and_integer_samples_miss_thin_margin_violation', () => {
  const obstacle = box(52.41015008585, 53.15688226442);
  const threshold = CLEARANCE_MARGIN_CM + NUMERICAL_EPSILON_CM;
  const integerDistances = Array.from({length: 51}, (_, angle) =>
    ({angle, distance: prismDistanceCm(rad(angle), obstacle)}));
  assert.ok(integerDistances.every(v => v.distance > threshold));
  const bestInteger = integerDistances.reduce((a, b) => a.distance <= b.distance ? a : b);
  assert.equal(bestInteger.angle, 45); close(bestInteger.distance, 0.505028820884598);
  // Analytic lower bound is nearest obstacle corner radius minus far door radius.
  const cx = obstacle.centerX - 10, cz = obstacle.centerZ - 10;
  const cornerAngle = Math.atan2(cz, cx);
  const alpha = Math.atan2(1, 60);
  const analyticMinimum = Math.hypot(cx, cz) - Math.hypot(60, 1);
  close(analyticMinimum, 0.499);
  const minima = [cornerAngle - alpha, cornerAngle + alpha].map(angle =>
    ({angleDegrees: angle * 180 / Math.PI, distanceCm: prismDistanceCm(angle, obstacle)}));
  for (const minimum of minima) close(minimum.distanceCm, analyticMinimum);
  const result = checkDoorPath(50, obstacle);
  assert.equal(result.status, 'blocked'); assert.equal(result.conservativeUncertainty, false);
  return {endpointDistancesCm: [integerDistances[0].distance, integerDistances[50].distance],
    bestInteger, analyticMinimumCm: analyticMinimum, minima, adaptiveWitness: result.witness};
});

test('contact_margin_and_epsilon_boundaries', () => {
  const samples = [
    ['contact', 11, 0], ['exact_margin', 11.5, 0.5], ['within_epsilon', 11.50005, 0.50005],
  ].map(([name, z, expectedDistance]) => {
    const obstacle = box(30, z), d = prismDistanceCm(0, obstacle);
    close(d, expectedDistance);
    const result = checkDoorPath(1, obstacle);
    assert.equal(result.status, 'blocked');
    assert.equal(result.conservativeUncertainty, false);
    return {name, closedDistanceCm: d, result};
  });
  return {samples};
});

test('interior_angle_radial_margin_tangency_is_blocked', () => {
  const phi = rad(45.5), radius = Math.hypot(60, 1) + 0.5;
  const obstacle = box(10 + radius * Math.cos(phi), 10 + radius * Math.sin(phi));
  const tangentAngles = [phi - Math.atan2(1, 60), phi + Math.atan2(1, 60)];
  const tangentDistances = tangentAngles.map(angle => prismDistanceCm(angle, obstacle));
  for (const distance of tangentDistances) close(distance, 0.5);
  const result = checkDoorPath(50, obstacle);
  assert.equal(result.status, 'blocked'); assert.equal(result.reason, 'distance_witness');
  assert.ok(result.witness.distanceCm <= CLEARANCE_MARGIN_CM + NUMERICAL_EPSILON_CM);
  return {obstacle, analyticMinimumCm: 0.5,
    tangentAnglesDegrees: tangentAngles.map(a => a * 180 / Math.PI), tangentDistancesCm: tangentDistances,
    result};
});

test('vertical_gap_combines_with_horizontal_distance', () => {
  const above = box(35, 35, {yMin: 78.6, yMax: 138.6});
  close(prismDistanceCm(rad(45), above), 0.6);
  const clear = checkDoorPath(90, above);
  assert.equal(clear.status, 'clear'); assert.equal(clear.pathFullyCertified, true);
  const exactBoundary = checkDoorPath(90, box(35, 35, {yMin: 78.5, yMax: 138.5}));
  const withinEpsilon = checkDoorPath(90, box(35, 35, {yMin: 78.50005, yMax: 138.50005}));
  assert.equal(exactBoundary.status, 'blocked');
  assert.equal(withinEpsilon.status, 'blocked');
  close(prismDistanceCm(rad(90), above), Math.hypot(24, 0.6));
  return {clearGapCm: 0.6, clear, exactBoundary, withinEpsilon};
});

test('zero_angle_is_open_to_check_even_with_contact', () => {
  const result = checkDoorPath(0, box(30, 11));
  assert.equal(result.status, 'open_to_check'); assert.equal(result.label, 'Open to check');
  assert.equal(result.pathFullyCertified, false); assert.equal(result.currentPanelOverlaps, true);
  assert.equal(result.currentDistanceCm, 0);
  return {result};
});

test('resource_limits_and_invalid_input_fail_closed', () => {
  const obstacle = box(35, 35, {yMin: 78.6, yMax: 138.6});
  const limitedDepth = checkDoorPath(90, obstacle, DEFAULT_DOOR, {maxDepth: 0});
  const limitedIntervals = checkDoorPath(90, obstacle, DEFAULT_DOOR, {maxIntervals: 1});
  assert.equal(limitedDepth.reason, 'depth_or_tolerance_limit');
  assert.equal(limitedIntervals.reason, 'interval_limit');
  for (const result of [limitedDepth, limitedIntervals]) {
    assert.equal(result.status, 'blocked'); assert.equal(result.conservativeUncertainty, true);
    assert.equal(result.pathFullyCertified, false); assert.equal(result.witness, null);
  }
  const invalid = [checkDoorPath(NaN), checkDoorPath(111), checkDoorPath(-1),
    checkDoorPath(45, box(NaN, 35)), checkDoorPath(45, DEFAULT_OBSTACLE, {...DEFAULT_DOOR, width: 0}),
    checkDoorPath(45, DEFAULT_OBSTACLE, DEFAULT_DOOR, {maxIntervals: Infinity})];
  for (const result of invalid) {
    assert.equal(result.status, 'blocked'); assert.equal(result.reason, 'invalid_input');
    assert.equal(result.pathFullyCertified, false);
  }
  return {limitedDepth, limitedIntervals, invalidCases: invalid.length};
});

test('hinge_rotation_sign_rigidity_and_actual_geometry_radius', () => {
  const original = doorFootprint(0);
  const radius = doorRadiusCm(); close(radius, Math.sqrt(3601));
  let displacementChecks = 0;
  for (const degrees of [0, 10, 45, 90, 110]) {
    const rotated = doorFootprint(rad(degrees));
    for (let i = 0; i < original.length; i++) {
      close(Math.hypot(rotated[i].x, rotated[i].z), Math.hypot(original[i].x, original[i].z));
      for (let j = 0; j < original.length; j++) {
        close(Math.hypot(rotated[i].x - rotated[j].x, rotated[i].z - rotated[j].z),
          Math.hypot(original[i].x - original[j].x, original[i].z - original[j].z));
      }
    }
  }
  const ninety = doorFootprint(rad(90));
  close((ninety[1].x + ninety[2].x) / 2, 0);
  close((ninety[1].z + ninety[2].z) / 2, 60);
  assert.ok(doorFootprint(rad(110))[1].x < 0);
  for (const widthDegrees of [0.01, 1, 50, 110]) {
    const w = rad(widthDegrees), midpoint = w / 2, middle = doorFootprint(midpoint);
    const bound = midpointDisplacementBoundCm(w);
    for (let k = 0; k <= 20; k++) {
      const poly = doorFootprint(w * k / 20);
      for (let i = 0; i < poly.length; i++) {
        assert.ok(Math.hypot(poly[i].x - middle[i].x, poly[i].z - middle[i].z) <= bound + 1e-10);
        displacementChecks++;
      }
    }
  }
  close(doorRadiusCm({...DEFAULT_DOOR, width: 30, thickness: 4}), Math.hypot(30, 2));
  return {radiusCm: radius, displacementChecks, positiveOpeningTowardOutwardZ: true};
});

// Cross-check the eight primary expected statuses and static values with the
// independently authored Python receipt; this does not execute Python or Lens.
const referenceUrl = new URL('./geometry-reference.json', import.meta.url);
const reference = JSON.parse(readFileSync(referenceUrl, 'utf8'));
test('independent_python_receipt_primary_status_agreement', () => {
  const names = ['default_10', 'default_45', 'default_90', 'aabb_counterexample_45',
    'negative_x_90', 'negative_x_110', 'far_110', 'narrow_margin_50'];
  vectors.forEach(([, obstacle, angle], i) =>
    assert.equal(checkDoorPath(angle, obstacle).status, reference.path_reference_results[names[i]].status));
  return {referenceKind: reference.kind, primaryComparisons: names.length};
});

const sha256 = url => createHash('sha256').update(readFileSync(url)).digest('hex');
const receipt = {
  kind: 'standalone_native_node_geometry_candidate_verification',
  createdAtUtc: new Date().toISOString(),
  nativeRuntime: {version: process.version, platform: process.platform, arch: process.arch},
  notActualLensPass: true,
  lensTypeScriptCompilation: 'not_run', preview: 'not_run', leaf: 'not_run', hardware: 'not_run',
  execution: 'Node built-in TypeScript type stripping; not static type checking',
  geometrySourceSha256: sha256(new URL('../Scripts/HINGEROOMGeometry.ts', import.meta.url)),
  verificationRunnerSha256: sha256(new URL(import.meta.url)),
  independentPythonReceiptSha256: sha256(referenceUrl),
  units: 'centimeters; radians internally; path input degrees',
  marginCm: CLEARANCE_MARGIN_CM, epsilonCm: NUMERICAL_EPSILON_CM,
  primaryVectorCount: vectors.length, testGroupCount: outputs.length,
  allAssertionsPassed: true, outputs,
};
const receiptUrl = new URL('./standalone-node-receipt.json', import.meta.url);
writeFileSync(receiptUrl, JSON.stringify(receipt, null, 2) + '\n', 'utf8');
console.log(JSON.stringify({kind: receipt.kind, runtime: receipt.nativeRuntime,
  allAssertionsPassed: true, primaryVectors: vectors.length, testGroups: outputs.length,
  primaryResults: outputs.filter(o => o.kind === 'primary_vector').map(o => ({name: o.name,
    status: o.result.status, currentDistanceCm: o.result.currentDistanceCm,
    intervalEvaluations: o.result.intervalEvaluations, witness: o.result.witness})),
  receiptFile: './standalone-node-receipt.json', notActualLensPass: true}, null, 2));
