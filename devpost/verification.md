# Verification

The saved local project compiled and ran in **Windows Lens Studio 5.23.2.26081320**. These results concern the implemented project. A fresh clone of public commit `61111808` also passed native import, Lens compilation and all six Preview LEAF scenarios. The 170-second (2:50) English demo is [public on YouTube](https://youtu.be/vYsI43u-ylw), with HD processing complete and sampled visual review. The [Devpost submission](https://devpost.com/software/hingeroom) is complete (Submitted, 5/5 steps).

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

## Fresh public-clone verification

A fresh clone of commit `61111808` passed Git content checks and the same 8-vector / 18-group native Node run. Lens Studio 5.23.2 then imported all eight packages from source, compiled TypeScript, started Preview without reported runtime errors, and completed all six LEAF scenarios with `fail-fast` and a 30-second timeout. No source repairs or package installs were needed. The historical screen-injected input checks below were not repeated in this run.

Native import recorded nine warnings: one QObject disconnect, seven GLSL include-version skips and a repeated-reset warning. Two scenario logs also reported deprecated `extractVerticesForAttribute` use. The import-warning cause was not established; later startup and all six scenarios succeeded.

The clone's 199-pixel-wide native Preview dock limited composition and readability assessment. Separate runtime close-up and wide renders are distinct evidence. No explicit project save was issued in the clone; persisted-save evidence comes from the original build. Physical Specs remain untested.

## Separate screen-input checks

Desktop input was also exercised through `InjectPreviewGesture` screen-coordinate touch events, with projected targets, calibrated letterbox coordinates, cursor acquisition and separate rendered frames between press, move and release. Runtime queries corroborated effects after injection:

- With the original box position, the slider reached approximately 9.8 degrees with **Path clear**, then 44.2 degrees with **Path blocked**. At 88.3 degrees, the whole route remained **Path blocked** while **Current panel: no overlap** was shown.
- In a separate step, the box was moved away. A later 88.3-degree query then reported **Path clear**. This is a different obstacle position from the blocked-path/current-clear observation above.
- Moving the box back changed the route to **Path blocked** without restarting. Reset restored the original obstacle position, zero angle and **Open to check**.

These are screen-injected Preview interactions, separate from LEAF's SIK calls. Gesture acknowledgements alone are not evidence of movement. They do not establish ordinary physical mouse usability, actual hand tracking or on-device behavior. Temporary projection/debug probes were removed from the saved application. The earlier `hingeroom-mouse-projection` diagnostic is not one of the six registered functional scenarios and is not counted as a UI pass.

## Verification status

| Check | Status |
| --- | --- |
| Production geometry: 8 vectors / 18 groups | Passed in native Node locally and from a fresh public clone |
| Lens TypeScript compilation | Passed locally and from the fresh public clone |
| Six functional LEAF scenarios | Passed in Preview locally and from the fresh public clone |
| Strict simulated IK Reset | Passed in Preview with `fail-fast` |
| Screen-injected slider, box drag and Reset | Effects corroborated by runtime state |
| Saved scene, authored assets and temporary-probe cleanup | Checked in the local build |
| Local English demo and sampled visual review | 170 seconds complete; wide-view text and native-dock limitations retained |
| Fresh public clone imports, compiles and runs | Passed; all six Preview LEAF scenarios succeeded |
| Public source-content review and retained notices | Completed; public repository published |
| Public YouTube demo under three minutes | [Published publicly](https://youtu.be/vYsI43u-ylw); 2:50, HD processing complete |
| Final submission and saved links | [Submitted on Devpost](https://devpost.com/software/hingeroom); 5/5 steps complete and saved repository/video links read back |

The local English movie shows the current panel clear while the whole opening route remains blocked, including a readable close-up of the actual Preview status. It uses real-time cuts from recorded Preview simulated input, with an obstacle setup cut disclosed. Review covered sampled encoded frames, timing and audio-signal correspondence; full-motion human playback and human listening were not performed. World-space labels remain small in wide shots. The YouTube demo is public and the Devpost submission is complete. Public visibility was saved and logged-in playback verified; separate signed-out access was not tested.

## Hardware boundary

No physical Specs device validation has been performed. Hand tracking, real-room placement accuracy, hardware legibility, performance, comfort and device feel remain unverified. This is a manually defined virtual example, not a room scan, measurement system or furniture-installation safety guarantee.
