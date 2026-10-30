/** Owns only procedural cabinet visuals; root placement belongs to Main. */
import {box,boxesMesh,outlineBoxes,renderSolid} from "./HINGEROOMMeshPrimitives";
@component
export class HINGEROOMCabinetMesh extends BaseScriptComponent {
  @ui.label("HINGEROOM — Cabinet 60 × 40 × 80 cm")
  @input @hint("Supported unlit material. No environment HDR dependency.") material:Material;
  @input('vec4','{0.38,0.49,0.59,1}') @widget(new ColorWidget()) @hint("Cabinet shell color.") shellColor:vec4;
  @input('vec4','{0.15,0.95,1,1}') @widget(new ColorWidget()) @hint("Cyan example outline.") outlineColor:vec4;
  onAwake():void {
    renderSolid(this.sceneObject,boxesMesh([box(1,40,-20,2,80,38),box(59,40,-20,2,80,38),box(30,1,-20,56,2,38),box(30,79,-20,56,2,38),box(30,40,-38,56,76,2)]),this.material,this.shellColor);
    const edges=renderSolid(this.sceneObject,boxesMesh(outlineBoxes(0,60,0,80,-39,-1)),this.material,this.outlineColor);
    edges.mainMaterial.mainPass.polygonOffset=new vec2(-1,-1);
  }
}
