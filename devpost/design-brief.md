---
status: approved
---

# Design brief: HINGEROOM

<!-- Proposal prepared after the learner adopted HINGEROOM and explicitly asked the assistant to develop the use case. This is not a completed interview or a claim about the learner's personal experience. All assistant-proposed choices are marked (default). The learner explicitly approved this complete proposal with "採用這份草案" after reviewing its scope and acceptance criteria. No further brief sign-off is required. -->

## The one spatial moment
Before buying a cabinet or arranging a new room, a person places a life-size virtual cabinet and rehearses opening its door beside an obstruction. The cabinet fits while closed, but its door path is obstructed; moving the obstruction makes the path clear. (default)

## Why it belongs on glasses
- Uses: draws in the world; leaves your body free. (default)
- Why it's better than the phone or laptop version: a person can walk around a life-size door path, look down at the floor clearance, and move an object with one hand without holding a screen. The planned desktop Preview is intended to demonstrate this spatial interaction after implementation and verification; comfort on actual glasses remains unproven. (default)

## Product or overlay
- Type: product; the virtual cabinet and obstruction are the experience. (default)
- What the real version would sense: nothing in this version. Dimensions and positions are manually chosen; there is no recognition, room scan, or automatic measurement. (default)
- Stand-in for the preview: an explicitly labelled virtual cabinet and obstacle on the Preview floor, using a fixed example preset. No recognition is simulated or claimed. (default)

## Where things live
- Where the user is looking during the main task: at the cabinet front, hinge, and floor area swept by the opening door. (default)
- Cabinet: floor anchored, initially in front of the user; front center approximately 140 cm away. Size 60 cm wide, 40 cm deep, 80 cm high. One left-hinged, full-width door, 60 cm wide, 76 cm high and 2 cm thick, with its lower edge 2 cm above the floor. All positions are calculated from the actual starting camera and floor rather than assumed at the world origin. (default)
- Obstacle: one 20 x 20 x 60 cm box, resting on the same floor; its center starts 35 cm right of the hinge and 35 cm outward from the cabinet front. A translucent starting outline makes its movement easy to understand. (default)
- Door-path arc and clearance hint: next to the hinge and opening space, anchored to the cabinet; no face-locked dashboard. The cabinet stays at its placed world position when the user walks. (default)
- Controls: a compact panel beside the cabinet, within comfortable reach, slightly below eye level. Large UI Kit controls, high-contrast light text, cyan outlines, and amber blockage cues; status also uses words and shapes. Exact panel placement and target sizes follow the loaded UI Kit's supported scale. (default)

## Hands and input
- Open the door: one large SIK/UI Kit slider controls 0 to 110 degrees about the hinge. The hinge stays fixed and the door rotates as one rigid piece. (default)
- Move the obstacle: one-hand SIK grab/drag, constrained to the floor, updates the door-path check immediately. No two-hand or custom gestures. (default)
- Reset: one large button restores the example obstacle position and closes the door. (default)
- Targets are big and highlight when aimed at.
- Voice (if any) and the button that does the same job: no voice. (default)

## When things show
- Cabinet and obstacle: visible during placement and inspection. They remain fixed in the room while the user walks around them. (default)
- Door-path arc: appears while adjusting the angle or obstacle, with a lightweight outline remaining afterward. (default)
- Clearance hint: reads "Open to check" at zero degrees; otherwise "Path blocked" or "Path clear" for the entire opening motion from closed to the selected angle. A door that has already passed an obstruction must still report a blocked path. Current door overlap may be highlighted separately. (default)
- Controls: stay beside the task rather than following the user's face. (default)
- If something needs attention out of view: a small direction hint while actively adjusting; no persistent alert or background task. (default)

## Done criteria
Each one can be checked in Lens Studio's preview. These are proposed acceptance criteria, not test results. (default)
1. Moving the angle slider visibly opens the door around its fixed vertical hinge from 0 to 110 degrees without changing the cabinet's size or position.
2. With the example obstacle at the stated starting position, 10 degrees reports a clear path, 45 degrees reports a blocked path, and 90 degrees still reports a blocked path even though the current door panel has passed the obstacle. The obstacle at 90 degrees must not be described as intersecting the current panel if it does not.
3. Dragging the obstacle fully outside the 60 cm door radius plus its own footprint and the clearance margin changes the 90-degree status to "Path clear". Moving it back restores "Path blocked" without restarting the Lens. A second case at 45 degrees, with the box center 10 cm right and 35 cm outward from the hinge, reports clear even though a coarse axis-aligned door bounding box would overlap it.
4. Walking around the scene leaves the cabinet, hinge, obstacle, and path in the same world positions, with status next to the task and readable from the intended working position.
5. Reset restores the original preset and zero angle; repeating the clear/blocked demonstration produces the same results. All main controls work with the Preview mouse and standard SIK interaction.

## Out of scope
- Live room scanning, real-object recognition, automatic measurement, certification of real furniture clearance, and guarantees about real installation safety. (default)
- Additional furniture types, multiple obstacles, room optimization, cloud services, voice, multiplayer, and cross-session persistence. (default)

## Risks and open questions
- This is an assistant-proposed scenario, not a statement of the learner's actual furniture-buying or moving history. The learner adopted the HINGEROOM concept, delegated proposal development, and explicitly approved this complete proposal with "採用這份草案".
- Path checking must account for the moving door's orientation, thickness, and vertical overlap. A world-axis bounding box alone is not a valid collision test; discretely sampled angles must not miss thin intersections. Use a 0.5 cm conservative clearance margin, count contact or margin violation as blocked, and state the numerical tolerance in the implementation and tests. If the algorithm cannot conservatively cover the whole path, label the result approximate rather than claiming full-path clearance. (default)
- Preview proves supported geometry and interaction cases only. Real hand tracking, real-world placement accuracy, perceived legibility, and comfort on glasses are "feel unproven".
- Lens Studio account authorization was explicitly verified true after the learner signed in on 2026-10-30. Package compatibility and editor setup still require actual verification; authorization alone does not establish build readiness or bypass CLAD preflight.

## Build notes for CLAD
- Build for SPECS so it runs and can be demonstrated in Lens Studio's preview. No SPECS device is available.
- Use Spectacles Interaction Kit (SIK) and UI Kit for all interactions, so they work with the mouse in Interactive Preview and with LEAF.
- Build any stand-in exactly as described above, and keep it obvious in the scene.
- Use real-world scale in centimeters. Keep content inside the user's view during the main task.
- The display is additive: black renders as transparent. Don't rely on black or very dark content to be seen; keep text light and readable from where the user stands.
- Get the basic flow working first, then add detail.
- Write LEAF scenarios for each done criterion, run them in preview, and report which pass. Say which criteria have no test.
- Don't record, identify, or follow people.

## After the build: judge it
This part is for you, after CLAD finishes.

1. **Does it work?** Ask your agent which LEAF tests passed and which done criteria have no test.
2. **Walk around it.** Open the preview in Interactive Preview. Use WASD to move, Q and E to go down and up, and right-drag (or hold Shift) to look around. Clicking acts as a pinch. Stand where a user would and look at the task.
3. **Ask the three questions.**
   - Does it use what I'm looking at?
   - Does it put something in my space, where it belongs?
   - Does it free my hands or let me keep my eyes up?
   - Would it be just as good on a phone? If so, what would make it need the glasses?
4. **Check comfort.**
   - Everything I need is in view while I do the task. Nothing sits at the edges, behind me, or stuck to my face.
   - Every control is within reach of someone standing there.
   - Text reads easily from where I stand. No dark UI disappearing.
   - Things show when needed and get out of the way.
5. **Label what you know.** Write "logic proven" next to anything the tests and preview show working, and "feel unproven" next to anything only real glasses could tell you (comfort over time, real hand tracking, real recognition).
6. **Fix with design notes, not code.** Tell your agent what to change in design terms, for example: "Move the step card 15 cm lower and next to the pan. Make the Next button twice as big. Re-run the tests." If a fix takes under a minute, like nudging a panel, do it yourself in the scene.
7. **Submit.** Record a video under 3 minutes of your Lens in the preview, public on YouTube. Make your repo public with your Lens Studio project and this `devpost/` folder. Details are on the hackathon site: https://learn-specs.devpost.com/resources
