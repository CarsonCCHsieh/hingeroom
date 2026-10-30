/** Standard SIK floor drag. Identity wrapper; yaw is baked into visual AND mesh collider. */
import Event from "SpectaclesInteractionKit.lspkg/Utils/Event";
import {Interactable} from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable";
import {InteractableManipulation} from "SpectaclesInteractionKit.lspkg/Components/Interaction/InteractableManipulation/InteractableManipulation";
import {box,boxesMesh,outlineBoxes,renderSolid} from "./HINGEROOMMeshPrimitives";
@component
export class HINGEROOMObstacleController extends BaseScriptComponent {
  @ui.label("HINGEROOM — Floor-constrained 20 × 20 × 60 cm box")
  @input @hint("Unlit base material; size is baked in centimeters.") material:Material;
  @input @hint("Author-visible visual child. Rotation is baked into geometry, not its parent.") visualRoot:SceneObject;
  @input @hint("Show the exact mesh collider in Preview.") debugColliders:boolean=false;
  public readonly onMoved=new Event<vec3>();
  private manipulation:InteractableManipulation;
  private interactable:Interactable;
  private collider:ColliderComponent;
  private floorY:number;
  private outline:RenderMeshVisual;
  private ready=false;
  onAwake():void {
    this.collider=this.sceneObject.createComponent("Physics.ColliderComponent") as ColliderComponent;
    this.collider.fitVisual=false;
    this.collider.debugDrawEnabled=this.debugColliders;
    this.createEvent("OnStartEvent").bind(()=>{
      if(!this.manipulation)throw new Error("HINGEROOM: obstacle geometry must initialize before SIK bindings");
      this.manipulation.onTranslationUpdate.add(e=>{
        if(!this.ready)return;
        const p=new vec3(e.currentPosition.x,this.floorY+30,e.currentPosition.z);
        this.sceneObject.getTransform().setWorldPosition(p);
        this.onMoved.invoke(p);
      });
      this.interactable.onHoverEnter.add(()=>this.setHighlight(true));
      this.interactable.onHoverExit.add(()=>this.setHighlight(false));
    });
  }
  public initialize(center:vec3,floorY:number,basis:quat):void {
    this.floorY=floorY;
    const mesh=boxesMesh([box(0,0,0,20,60,20)],basis);
    renderSolid(this.visualRoot,mesh,this.material,new vec4(0.45,0.61,0.7,1));
    this.outline=renderSolid(this.visualRoot,boxesMesh(outlineBoxes(-10,10,-30,30,-10,10,0.65),basis),this.material,new vec4(0.15,0.95,1,1));
    this.outline.mainMaterial.mainPass.polygonOffset=new vec2(-1,-1);
    const shape=Shape.createMeshShape(); shape.mesh=mesh; shape.convex=true; this.collider.shape=shape;
    this.setCenter(center);
    // Register SIK only after the final collider exists, so raycasting and its collider map agree.
    this.interactable=this.sceneObject.createComponent(Interactable.getTypeName()) as Interactable;
    this.interactable.allowMultipleInteractors=false;
    this.manipulation=this.sceneObject.createComponent(InteractableManipulation.getTypeName()) as InteractableManipulation;
    this.manipulation.setCanRotate(false); this.manipulation.setCanScale(false);
    this.manipulation.enableYTranslation=false; this.manipulation.enableXTranslation=true; this.manipulation.enableZTranslation=true;
    this.manipulation.useFilter=false; this.ready=true;
  }
  public setCenter(center:vec3):void {
    this.sceneObject.getTransform().setWorldPosition(new vec3(center.x,this.floorY+30,center.z));
  }
  private setHighlight(active:boolean):void {
    if(this.outline)this.outline.mainMaterial.mainPass.baseColor=active?new vec4(1,0.8,0.25,1):new vec4(0.15,0.95,1,1);
  }
}
