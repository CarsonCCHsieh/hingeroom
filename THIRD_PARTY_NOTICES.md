# Third-party notices

HINGEROOM is provided as a public review project. Its application source does not replace or relicense included packages or assets. Retain original package files, copyright notices, terms, attribution and disclaimers. No repository-wide MIT or CC0 claim is made for third-party content.

## Included Snap packages and tooling

Versions below are the included `Package/Assets/package.native` descriptor versions. READMEs, dependencies and source notices remain part of their respective archives.

| Package archive | Included version | Role and source documentation |
| --- | --- | --- |
| `Packages/SpectaclesInteractionKit.lspkg` | 2.0.0 | Snap interaction framework. `Package/Assets/README.md` links the [SIK guide](https://docs.snap.com/spectacles/spectacles-frameworks/spectacles-interaction-kit/get-started), [API reference](https://developers.snap.com/lens-studio/api/lens-scripting/variables/Packages_SpectaclesInteractionKit_SIK.SIK) and release notes. Contains the Inria notice below. |
| `Packages/SpectaclesUIKit.lspkg` | 2.0.0 | Snap UI framework. `Package/Assets/README.md` links the [UIKit guide](https://developers.snap.com/spectacles/spectacles-frameworks/spectacles-ui-kit/get-started) and release notes. |
| `Packages/Leaf.lspkg` | 2.0.2 | Preview integration-test framework. Preserve `Package/Assets/README.md`, dependencies and source notices. |
| `Packages/AiPreviewAgentInspect.lspkg` | 2.0.1 | CLAD Preview inspection tooling. Preserve `Package/Assets/README.md` and source contents. |
| `Packages/AiPreviewAgentInteract.lspkg` | 2.0.1 | CLAD Preview interaction tooling. Preserve `Package/Assets/README.md`, dependencies and source contents. |
| `Packages/Leaf 3.lspkg` | 2.0.0 | Additional LEAF root retained by installation; application scenarios import `Leaf.lspkg`. Preserve its original contents and README. |
| `Packages/Bitmoji 3D.lsc` | 10.0.1 | Test-tool dependency retained by installation. Its README links [Bitmoji 3D documentation](https://developers.snap.com/lens-studio/features/bitmoji-avatar/bitmoji-3d). Presence does not mean an account avatar was downloaded or displayed. |
| `Packages/[Prefab Preview Environment].lspkg` | 0.0.0 | Lens Studio prefab-preview lighting environment, with directional/environment lights and bundled Echopark diffuse/specular JPEG maps. The scene's `PrefabPreviewEnvironment` metadata references this prefab; application scripts do not import it. Its descriptor records Lens Studio 5.23.0.26071020. Preserve the complete original archive under the applicable Lens Studio asset terms. |

SIK and UIKit were installed through the Lens Studio package workflow; Preview/test dependencies were installed for build and verification tools. Snap packages and bundled fonts, sounds, shaders, materials and other assets retain their applicable terms. This table records descriptor versions; it does not grant new rights or relabel package contents.

Application geometry is generated in TypeScript. The optional application environment HDR and its runtime scene references were removed. The separate prefab-preview package retains its bundled JPEG lighting maps for editor preview. That archive contains no separate README or license-notice file; it remains part of the original Lens Studio preview assets and is not relicensed by this repository.

## Inria One Euro Filter - BSD 3-Clause

The original notice is retained inside `Packages/SpectaclesInteractionKit.lspkg`, archive entry `Package/Assets/Utils/OneEuroFilter.ts` (runtime package path `SpectaclesInteractionKit.lspkg/Utils/OneEuroFilter.ts`). Preserve its complete source header. The file additionally states **Modified 2022 Snap Inc.**

```text
Author: Gery Casiez
Details: http://cristal.univ-lille.fr/~casiez/1euro/

Copyright 2019 Inria

BSD License https://opensource.org/licenses/BSD-3-Clause

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

 1. Redistributions of source code must retain the above copyright notice, this list of conditions
and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions
and the following disclaimer in the documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or
promote products derived from this software without specific prior written permission.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES,
INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
```

This BSD notice applies to the identified component. It is not a license declaration for all of SIK, UIKit, other Snap packages or HINGEROOM.
