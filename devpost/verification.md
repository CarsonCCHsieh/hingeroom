# Verification

The saved local project compiled and ran in **Windows Lens Studio 5.23.2.26081320**. These results concern the implemented project. Independent verification of a fresh exported checkout and the final demo recording remain pending.

## Production geometry regressions

Native Windows Node 24.14.0 executed production `Assets/Scripts/HINGEROOMGeometry.ts` through `Assets/Tests/verify-geometry.mjs`: **8 primary vectors and 18 test groups passed**. The recorded source hash matches that production module. Node's TypeScript stripping is not a static type check, Lens compilation or a Preview input test.

Rerun from the project root with Node 24 or later:

```text
node Assets/Tests/verify-geometry.mjs
```

The runner uses relative paths and public-safe expected values. It writes a new local result beside the runner. An expected-value fixture alone is not a pass.

| Primary case | Observed whole-path result | Distinction |
| --- | --- | --- |
| Default obstacle, 10 degrees | Clear | Entire closed-to-10 degrees route. |
| Default obstacle, 45 degrees | Blocked | Current panel overlaps the obstacle. |
| Default obstacle, 90 degrees | Blocked | Current panel is clear; an earlier angle blocks the route. |
| Obstacle center (10, 35), 45 degrees | Clear | Coarse AABB overlap would be a false positive; minimum distance is about 2.53553 cm. |
| Obstacle center (-15, 55), 90 degrees | Clear | An edge-position case. |
| Obstacle center (-15, 55), 110 degrees | Blocked | Extending the opening route changes the result. |
| Obstacle center (80, 80), 110 degrees | Clear | Obstacle is outside the opening route. |
| Obstacle center (52.41015008585, 53.15688226442), 50 degrees | Blocked | Endpoints and integer-degree samples miss a narrow margin violation. |

Other groups cover contact, the margin boundary, vertical separation, zero angle, invalid inputs, conservative resource limits and the angular displacement bound. Lengths are centimeters in the hinge-local basis; margin is 0.5 cm and numerical tolerance is 0.0001 cm.

## Lens compilation and six LEAF scenarios

Lens Studio's TypeScript compilation succeeded separately. All **six registered LEAF scenarios** returned `succeeded` with `target: preview` and `onDevice: false`.

| Scenario | What ran and what it establishes |
| --- | --- |
| `hingeroom-geometry` | Production geometry assertions in the Lens runtime, distinct from the Node run. |
| `hingeroom-opening` | Exact angles use the slider's `currentValue` setter as fixture setup. A separate `DefaultLeafInteractor` SIK slider drag checks a decrease in selected degrees. Also checks rigid hinge motion and actual door vertices. |
| `hingeroom-obstacle-reset` | `DefaultLeafInteractor.drag` uses SIK translation events to move the box to (80, 80), then (35, 35), checks clear/blocked updates and triggers Reset. |
| `hingeroom-counterexamples` | Explicit fixture placement checks exact counterexample positions and rotation sign; it does not claim a person dragged to those exact coordinates. |
| `hingeroom-world-anchor` | Moves the simulated camera and checks unchanged world transforms. Also checks obstacle render/collider mesh agreement and basis. This is not physical tracking or readability validation. |
| `hingeroom-reach` | A local `IKBodyInteractor` triggers Reset. The successful strict run uses **`fail-fast`**, without a fallback interactor or account-backed avatar download. This is simulated IK, not physical reach or comfort. |

Use the installed LEAF panel, select **Preview**, and run the registered `hingeroom-*` scenarios. For strict reruns, use the supported diagnostic policy `fail-fast` and a 30-second timeout. An earlier probe used the unsupported value `fail` and fell back; the later strict successful run is the IK evidence used here.

## Separate screen-input checks

Desktop input was also exercised through `InjectPreviewGesture` screen-coordinate touch events, with projected targets, calibrated letterbox coordinates, cursor acquisition and separate rendered frames between press, move and release. Runtime queries corroborated effects after injection:

- With the original box position, the slider reached approximately 9.8 degrees with **Path clear**, then 44.2 degrees with **Path blocked**. At 88.3 degrees, the whole route remained **Path blocked** while **Current panel: no overlap** was shown.
- In a separate step, the box was moved away. A later 88.3-degree query then reported **Path clear**. This is a different obstacle position from the blocked-path/current-clear observation above.
- Moving the box back changed the route to **Path blocked** without restarting. Reset restored the original obstacle position, zero angle and **Open to check**.

These are screen-injected Preview interactions, separate from LEAF's SIK calls. Gesture acknowledgements alone are not evidence of movement. They do not establish ordinary physical mouse usability, actual hand tracking or on-device behavior. Temporary projection/debug probes were removed from the saved application. The earlier `hingeroom-mouse-projection` diagnostic is not one of the six registered functional scenarios and is not counted as a UI pass.

## Remaining checks

| Check | Status |
| --- | --- |
| Production geometry: 8 vectors / 18 groups | Passed in native Node |
| Lens TypeScript compilation | Passed locally |
| Six functional LEAF scenarios | Passed in Preview |
| Strict simulated IK Reset | Passed in Preview with `fail-fast` |
| Screen-injected slider, box drag and Reset | Effects corroborated by runtime state |
| Saved scene, authored assets and temporary-probe cleanup | Checked in the local build |
| Full presentation framing, readability across views and final Preview-dock recording composition | Final review pending; a frontal control view has been inspected |
| Fresh exported project / independent clean checkout imports and runs | Pending |
| Final public source-content review and retained notices | Pending export review |
| Public demo under three minutes showing the actual working Preview | Pending |
| Final submission links and judge access | Pending |

For the demo, show the actual 90 degrees endpoint: the current panel is clear while the opening route remains blocked. A final recording must show actual Preview behavior; calculations and successful diagnostic calls do not substitute for it.

## Hardware boundary

No physical Specs device validation has been performed. Hand tracking, real-room placement accuracy, hardware legibility, performance, comfort and device feel remain unverified. This is a manually defined virtual example, not a room scan, measurement system or furniture-installation safety guarantee.
