/** One rigid slab x=[0,60], y=[2,78], z=[-1,1]; hinge is its authored parent. */
import {box,boxesMesh,outlineBoxes,renderSolid} from "./HINGEROOMMeshPrimitives";
@component
export class HINGEROOMDoorMesh extends BaseScriptComponent {
  @ui.label("HINGEROOM — Rigid door 60 × 76 × 2 cm")
  @input @hint("Unlit material shared at the asset boundary.") material:Material;
  @input('vec4','{0.57,0.69,0.77,1}') @widget(new ColorWidget()) @hint("Slab tint.") color:vec4;
  @input('vec4','{0.15,0.95,1,1}') @widget(new ColorWidget()) @hint("Edge tint inside the slab footprint.") edgeColor:vec4;
  onAwake():void {
    renderSolid(this.sceneObject,boxesMesh([box(30,40,0,60,76,2)]),this.material,this.color);
    const edges=renderSolid(this.sceneObject,boxesMesh(outlineBoxes(0,60,2,78,-1,1,0.4)),this.material,this.edgeColor);
    edges.mainMaterial.mainPass.polygonOffset=new vec2(-1,-1);
  }
}
