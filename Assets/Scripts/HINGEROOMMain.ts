/** Orchestrates authored roots, world placement, deterministic state and passive UI.
 * The example floor is an authored virtual plane reference, never a sensed room measurement.
 * Preview Plane's navigation eye is 150 cm above its floor; its Lens-relative floor anchor
 * is configured at -150 cm. Placement reads that anchor and the actual starting camera once.
 */
import {HINGEROOMControlsUI} from "./HINGEROOMControlsUI";
import {HINGEROOMObstacleController} from "./HINGEROOMObstacleController";
import {HINGEROOMClearanceMesh} from "./HINGEROOMClearanceMesh";
import {HINGEROOMState} from "./HINGEROOMState";
@component
export class HINGEROOMMain extends BaseScriptComponent {
  @ui.label("HINGEROOM — Virtual cabinet clearance rehearsal")
  @ui.group_start("References")
  @input @hint("Actual world-tracked starting camera.") camera:Camera;
  @input @hint("Authored cabinet root; placed once.") cabinet:SceneObject;
  @input @hint("Authored hinge child at the cabinet's front left.") hinge:SceneObject;
  @input @hint("Authored clearance guide root sharing the cabinet basis.") clearanceRoot:SceneObject;
  @input @hint("Authored world-fixed control panel.") panelRoot:SceneObject;
  @input @hint("Explicit virtual example floor reference, not sensed room geometry.") floorAnchor:SceneObject;
  @input @hint("Passive UIKit view.") controls:HINGEROOMControlsUI;
  @input @hint("SIK floor drag controller.") obstacle:HINGEROOMObstacleController;
  @input @hint("Passive procedural path visual.") clearance:HINGEROOMClearanceMesh;
  @ui.group_end
  @ui.group_start("Settings")
  @input @widget(new SliderWidget(120,180,1)) @hint("Initial cabinet front distance from starting camera in cm.") placementDistanceCm:number=140;
  @input @widget(new SliderWidget(0,100,1)) @hint("World-fixed panel X offset in the cabinet frame, in cm.") panelOffsetX:number=30;
  @input @widget(new SliderWidget(105,145,1)) @hint("Panel center height above the virtual example floor, in cm.") panelHeightCm:number=110;
  @input @hint("Wireframe all interaction colliders in this experience.") debugColliders:boolean=false;
  @ui.group_end
  public readonly state=new HINGEROOMState();
  public hingeWorld:vec3;
  public basis:quat;
  private initialized=false;
  private hintUntil=0;
  onAwake():void {
    this.createEvent("OnStartEvent").bind(()=>this.start());
    this.createEvent("UpdateEvent").bind(()=>{
      if(!this.initialized)return;
      const p=this.camera.worldSpaceToScreenSpace(this.toWorld(30,0,40));
      const direction=p.x<0.05?"← Door to the left":p.x>0.95?"Door to the right →":p.y<0.05?"↑ Door above":p.y>0.95?"↓ Door below":"";
      this.controls.setDirectionHint(getTime()<this.hintUntil?direction:"");
    });
  }
  private start():void {
    if(!this.camera||!this.controls||!this.obstacle||!this.cabinet||!this.hinge||!this.clearance||!this.clearanceRoot||!this.panelRoot||!this.floorAnchor)throw new Error("HINGEROOM: authored reference missing");
    const ct=this.camera.getTransform(),cp=ct.getWorldPosition(),view=ct.back;
    const forward=new vec3(view.x,0,view.z).normalize(),right=new vec3(-forward.z,0,forward.x);
    this.basis=quat.fromEulerAngles(0,Math.atan2(-forward.x,-forward.z),0);
    const floor=this.floorAnchor.getTransform().getWorldPosition().y;
    this.hingeWorld=cp.add(forward.uniformScale(this.placementDistanceCm)).sub(right.uniformScale(30)); this.hingeWorld.y=floor;
    this.cabinet.getTransform().setWorldPosition(this.hingeWorld); this.cabinet.getTransform().setWorldRotation(this.basis);
    this.clearanceRoot.getTransform().setWorldPosition(this.hingeWorld); this.clearanceRoot.getTransform().setWorldRotation(this.basis);
    this.panelRoot.getTransform().setWorldPosition(this.toWorld(this.panelOffsetX,8,this.panelHeightCm)); this.panelRoot.getTransform().setWorldRotation(this.basis);
    this.obstacle.initialize(this.toWorld(35,35,30),floor,this.basis);
    this.obstacle.debugColliders=this.debugColliders;
    this.controls.onAngle.add(degrees=>{this.state.setAngle(degrees);this.refresh();});
    this.controls.onReset.add(()=>this.resetExample());
    this.obstacle.onMoved.add(p=>{
      const local=this.basis.invert().multiplyVec3(p.sub(this.hingeWorld));
      this.state.setCenter(local.x,local.z);this.refresh();
    });
    this.initialized=true;this.refresh();this.debugCollidersAll(this.obstacle.sceneObject);
    console.log("[HINGEROOM] Initialized virtual example; world-fixed, cm; margin 0.5, epsilon 0.0001.");
  }
  public toWorld(x:number,z:number,y:number):vec3 {return this.hingeWorld.add(this.basis.multiplyVec3(new vec3(x,y,z)));}
  public resetExample():void {
    this.state.reset();this.obstacle.setCenter(this.toWorld(35,35,30));this.controls.resetSlider();this.refresh();
  }
  private refresh():void {
    this.hinge.getTransform().setLocalRotation(quat.fromEulerAngles(0,-this.state.degrees*Math.PI/180,0));
    const r=this.state.reading;
    this.controls.setReading(this.state.degrees,r.label,r.currentPanelOverlaps===true,r.currentWithinMargin===true,r.conservativeUncertainty);
    this.clearance.showPath(this.state.degrees,r.status==="blocked");this.hintUntil=getTime()+2;
  }
  private debugCollidersAll(root:SceneObject):void {
    const collider=root.getComponent("Physics.ColliderComponent") as ColliderComponent;
    if(collider)collider.debugDrawEnabled=this.debugColliders;
    for(let i=0;i<root.getChildrenCount();i++)this.debugCollidersAll(root.getChild(i));
  }
}
