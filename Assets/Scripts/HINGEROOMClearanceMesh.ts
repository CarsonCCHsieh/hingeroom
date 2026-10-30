/** Owns a continuous visual guide, not the clearance calculation. No collider. */
import {box,boxesMesh,outlineBoxes,renderSolid} from "./HINGEROOMMeshPrimitives";
@component
export class HINGEROOMClearanceMesh extends BaseScriptComponent {
  @ui.label("HINGEROOM — Path guide")
  @input @hint("Unlit material for the path and original obstacle footprint.") material:Material;
  private arc:RenderMeshVisual;
  private radial:RenderMeshVisual;
  onAwake():void {
    this.arc=renderSolid(this.sceneObject,boxesMesh([box(30,0.25,0,60,0.5,0.45)]),this.material,new vec4(0.15,0.95,1,1));
    const radius=global.scene.createSceneObject("HINGEROOM Radius Guide"); radius.setParent(this.sceneObject);
    this.radial=renderSolid(radius,boxesMesh([box(30,0.28,0,60,0.5,0.45)]),this.material,new vec4(0.15,0.95,1,1));
    renderSolid(this.sceneObject,boxesMesh(outlineBoxes(25,45,0.05,0.4,25,45,0.3)),this.material,new vec4(0.4,0.8,0.8,1));
    // Fixed vertical hinge marker inside the cabinet's left edge.
    renderSolid(this.sceneObject,boxesMesh([box(0.4,40,0,0.8,76,0.8)]),this.material,new vec4(0.15,0.95,1,1));
  }
  public showPath(degrees:number,blocked:boolean):void {
    const theta=degrees*Math.PI/180, segments=Math.max(1,Math.ceil(degrees/2));
    const strips=[];
    for(let i=0;i<segments;i++) {
      const a=theta*i/segments,b=theta*(i+1)/segments,m=(a+b)/2;
      // A tiny axis-aligned solid marker; this is visualization only, never a collision sample.
      strips.push(box(60*Math.cos(m),0.35,60*Math.sin(m),0.7,0.7,0.7));
    }
    this.arc.mesh=boxesMesh(strips);
    this.arc.mainMaterial.mainPass.baseColor=blocked?new vec4(1,0.62,0.12,1):new vec4(0.15,0.95,1,1);
    this.radial.getTransform().setLocalRotation(quat.fromEulerAngles(0,-theta,0));
    this.radial.mainMaterial.mainPass.baseColor=this.arc.mainMaterial.mainPass.baseColor;
  }
}
