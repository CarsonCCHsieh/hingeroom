HINGEROOM local verification

This is a virtual cabinet example with manual dimensions and an authored virtual floor reference. It does not scan or measure a room and does not certify real furniture clearance.

Geometry regressions (native Windows Node 24 or later with TypeScript stripping):
  node Assets/Tests/verify-geometry.mjs

Run from the project root. The runner uses relative paths and a public-safe expected-value fixture. It writes standalone-node-receipt.json beside itself. Its 8 primary vectors and 18 groups passed. Node type stripping is not Lens static compilation or Preview testing.

Actual Lens verification is recorded in HINGEROOMVerification.json. Six registered LEAF scenarios were executed in Preview and passed. Use the installed LEAF panel, execute on Preview, and select the hingeroom-* scenarios. A scenario that has only been written is not a pass. The reach scenario uses local IK with no fallback or account-backed avatar download. Prefer diagnostic policy fail-fast and a 30-second timeout when rerunning.

The path checker always covers the entire interval from 0 to the selected angle. It combines static convex-prism distance with the midpoint Hausdorff displacement bound. A clear interval requires d > 0.5 + delta + 0.0001 cm. Touching, margin violations and unresolved resource/tolerance boundaries are blocked. Witnesses are examples, not first-contact angles or exact global minima. Current panel overlap is a separate fact.

Cabinet basis and obstacle orientation must agree. The obstacle's visual and collider use the same actual RenderMesh with the cabinet yaw baked into its vertices, while its wrapper remains at unit scale and identity rotation. LEAF verifies this against extracted vertices, including a rotated cabinet basis. The door mesh is read back as x=[0,60], y=[2,78], z=[-1,1] cm; conservative engine bounds may also include the mesh origin.

Preview mouse tests used actual projected coordinates and a calibrated letterbox transform. Native touch injection needs a settled cursor target and separate rendered frames between press, drag and release. Those temporary projection probes were removed. Exact 10/45/90-degree fixtures passed in LEAF; mouse observations were approximately 9.8/44.2/88.3 degrees. Moving the obstacle out and back changed the status without restarting, and mouse Reset restored the original preset exactly.

Official dependencies retain their own terms and notices. SIK/UIKit are 2.0.0. Preview helpers and LEAF are official test dependencies. The installer also retained an additional Leaf 2.0.0 root and Bitmoji 3D dependency; their presence does not mean an avatar download or account operation was performed. Do not relicense these archives under a general code license. Preserve the original Inria BSD-3-Clause notice in SIK's OneEuroFilter.ts.

The optional Echopark HDR and its scene references were removed with supported editor tools. No replacement download was used. No public repository, upload, publishing or submission was performed. This remains a private local review handoff; final isolated export review belongs to the next stage.

Logic proven: the demonstrated geometry, Lens compilation, Preview interactions and passed LEAF cases. Feel unproven: physical glasses comfort, real hand tracking, real placement accuracy, hardware legibility and hardware performance.
