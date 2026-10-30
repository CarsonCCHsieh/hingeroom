# HINGEROOM

**Rehearse the space a cabinet door needs to open.**

A cabinet may fit while its door cannot open. HINGEROOM is a spatial prototype for exploring the **whole opening path**, then moving an obstacle to compare the result.

The local project compiled and ran in **Windows Lens Studio 5.23.2**. Its production geometry passed **8 primary vectors and 18 regression groups** under native Node, and **six LEAF scenarios passed in Lens Studio Preview**. Desktop screen-coordinate input was checked separately from SIK automation and simulated IK. The [public source](https://github.com/CarsonCCHsieh/hingeroom) is available. A fresh clone of commit `61111808` also passed the Node checks, Lens Studio import and compilation, and all six Preview LEAF scenarios. The 170-second (2:50) English demo is [public on YouTube](https://youtu.be/vYsI43u-ylw), with HD processing complete and sampled visual review. The [Devpost submission](https://devpost.com/software/hingeroom) is complete (Submitted, 5/5 steps). See [verification](devpost/verification.md) for each check's scope.

## Try the example

Open `HINGEROOM-5232.esproj` in Lens Studio 5.23.2 and use the SPECS/Spectacles Preview. The included package descriptors identify Spectacles Interaction Kit 2.0.0 and Spectacles UI Kit 2.0.0.

1. Move the angle slider from 0 degrees toward 110 degrees.
2. Drag the box with one hand across the virtual floor and watch the path result update.
3. Use **Reset example** to restore the box, zero angle and **Open to check** state.

The reference example is clear at 10 degrees and blocked at 45 degrees. At 90 degrees, the current door panel has passed the box, but an earlier point in its route still blocks opening. **Current panel: no overlap** and **Path blocked** can both be correct.

The cabinet, path guide and controls stay fixed in world space after initial placement. The example uses manually defined dimensions, a 0.5 cm clearance margin, words and symbols alongside cyan/amber feedback, and a continuous interval calculation rather than a few sampled angles.

## Build and review

- [Approved design brief](devpost/design-brief.md)
- [Build notes](devpost/build-notes.md)
- [Verification and rerun instructions](devpost/verification.md)
- [Third-party notices](THIRD_PARTY_NOTICES.md)

The prototype was built with TypeScript, CLAD and the Lens Studio MCP, using standard SIK manipulation and UIKit controls. The geometry runner uses production source:

```text
node Assets/Tests/verify-geometry.mjs
```

Run it from the project root with Node 24 or later. The six registered `hingeroom-*` scenarios can be run in the installed LEAF panel on **Preview**. Node checks, Lens compilation, LEAF input and screen-coordinate diagnostics are separate checks.

## Limits

This is one virtual cabinet and one obstacle on an authored virtual floor. It does not scan rooms, recognize furniture or measure real dimensions. It does not certify real furniture clearance. Physical Specs tracking, hand interaction, placement accuracy, legibility, performance and comfort have not been validated.

This is a public review project. Included packages and assets retain their own terms and notices; public availability does not replace those terms. No blanket MIT or CC0 label is applied to third-party content.
