# Build notes

HINGEROOM is an implemented local Lens Studio prototype. Production geometry regressions, Lens compilation and six Preview LEAF scenarios passed. An independent fresh export/checkout and the final presentation recording remain to be reviewed.

## Scope and workflow

Devpost Learn's planning guide shaped the [approved brief](design-brief.md). The coding assistant proposed the scenario and the participant adopted it. It is not presented as a personal furniture-buying history or a completed learner interview.

The project was built with TypeScript, CLAD and the Lens Studio MCP in Windows Lens Studio 5.23.2. Spectacles Interaction Kit 2.0.0 supplies the obstacle's `Interactable` and `InteractableManipulation`; Spectacles UI Kit 2.0.0 supplies the slider, button and layout. The obstacle permits a single interactor, disables rotation and scaling, and constrains its center to the authored floor height. Its translation event updates shared domain state and the path result.

Generated meshes define the cabinet, rigid door, obstacle and path guide. Geometry, domain state, controls and presentation are separate modules. The colored guide illustrates the opening arc; its markers are not collision samples.

## Example geometry

All lengths are centimeters. The cabinet is 60 x 40 x 80. Its left-hinged door is 60 x 76 x 2, with its lower edge 2 above the floor. The obstacle is 20 x 20 x 60 and starts with its center 35 to the right of the hinge and 35 outward from the cabinet front.

Calculations use a hinge-local basis: +X along the closed door, +Z outward and +Y upward. The obstacle stays axis-aligned in that basis. Its rendered mesh and collider share the same actual mesh, with the cabinet's yaw baked into its vertices; its wrapper has unit scale and identity rotation. Preview checks cover that agreement, including a rotated cabinet basis. The rigid door mesh is also read back and checked against its intended vertex extents.

The current-pose calculation combines the horizontal distance between the rotated door rectangle and obstacle rectangle with their vertical interval gap. A coarse world-axis bounding box is not the clearance predicate.

## Continuous interval test

The production checker always evaluates **[0, selected angle]**, independently of slider history. At zero the status is **Open to check**.

Let `d(mid)` be the 3D minimum distance at an interval's midpoint, `w` its angular width in radians, and `R = sqrt(60^2 + 1^2)` the example door's maximum radius about the hinge. Maximum displacement relative to the midpoint pose is bounded by:

```text
delta = 2 * R * sin(w / 4)
```

The distance to the obstacle changes by no more than that displacement. With margin `m = 0.5 cm` and tolerance `epsilon = 0.0001 cm`:

- An interval is certified clear only when `d(mid) > m + epsilon + delta`.
- A pose with distance `<= m + epsilon` is a blocking witness.
- Otherwise the interval is subdivided. Resource, depth or unresolved-uncertainty limits remain blocked.

This covers the continuous opening interval for the modeled geometry. A witness is an example of a blocking angle; it is not necessarily first contact or the global minimum. The example margin is not a furniture safety tolerance.

## Whole path versus current panel

With the default obstacle, the route is clear at 10 degrees, blocked at 45 degrees, and still blocked at 90 degrees. At 90 degrees the current door panel has approximately 24 cm clearance; an earlier angle blocks the route. These exact-angle fixtures are distinct from approximate angles reached through desktop input.

Reset explicitly restores the obstacle and angle, resets the slider, and recomputes domain state. It does not depend on whether a slider reset emits a value-change event.

## Verification and limits

The production TypeScript geometry passed 8 primary vectors and 18 Node regression groups. All six registered LEAF scenarios returned success in Preview. Exact fixture setup, real SIK automation, strict local IK and screen-injected desktop input are documented separately in [verification](verification.md).

The cabinet and controls are world-fixed after placement from the camera basis and authored virtual floor. The floor is not a detected room surface. This prototype has one obstacle and manual example dimensions; no scanning, recognition, automatic measurement or real-furniture safety certification is implemented. Physical-glasses tracking, hand interaction, placement, legibility, comfort and performance remain untested.

The optional environment HDR and its scene references were removed. No replacement environment download is required by this example. Package fonts, audio, materials, shaders and tooling remain subject to their own terms. See [third-party notices](../THIRD_PARTY_NOTICES.md).
