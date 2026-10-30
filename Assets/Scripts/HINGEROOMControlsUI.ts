/** Passive UIKit 2.0 view. Emits intent; Main owns angle and obstacle state. */
import Event from "SpectaclesInteractionKit.lspkg/Utils/Event";
import {BackPlate} from "SpectaclesUIKit.lspkg/Scripts/BackPlate";
import {FlexLayout} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexLayout";
import {FlexItem} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexItem";
import {FlexAlign,FlexDirection,FlexJustify,FlexAlignSelf} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexTypes";
import {Slider} from "SpectaclesUIKit.lspkg/Scripts/Components/Slider/Slider";
import {Button} from "SpectaclesUIKit.lspkg/Scripts/Components/Button/Button";
type Role="title"|"body"|"status";
const TYPE_SCALE:Record<Role,{size:number;weight:number}>={title:{size:62,weight:700},body:{size:39,weight:500},status:{size:48,weight:700}};
function applyTextRole(t:Text,role:Role,scale:number):void { t.size=TYPE_SCALE[role].size*scale; (t as Text & {weight?:number}).weight=TYPE_SCALE[role].weight; }
@component
export class HINGEROOMControlsUI extends BaseScriptComponent {
  @ui.label("HINGEROOM — Task-adjacent controls")
  @ui.group_start("Settings")
  @input @widget(new SliderWidget(30,45,1)) @hint("Panel width in centimeters.") widthCm:number=36;
  @input @widget(new SliderWidget(1,3,0.1)) @hint("Content padding in centimeters.") paddingCm:number=2;
  @input @widget(new SliderWidget(1,1.6,0.05)) @hint("Central text scale at the working distance.") textScale:number=1.25;
  @input @hint("Panel title.") title:string="HINGEROOM";
  @input @hint("Reset action label.") resetLabel:string="Reset example";
  @input('vec4','{0.94,0.99,1,1}') @widget(new ColorWidget()) @hint("Readable light text color.") textColor:vec4;
  @ui.group_end
  public readonly onAngle=new Event<number>();
  public readonly onReset=new Event<void>();
  public slider:Slider;
  private status:Text;
  private angle:Text;
  private current:Text;
  private hint:Text;
  private flex:FlexLayout;
  private content:SceneObject;
  onAwake():void {
    this.sceneObject.createComponent("Component.Canvas");
    const plate=this.sceneObject.createComponent(BackPlate.getTypeName()) as BackPlate;
    plate.style="simple";
    this.content=global.scene.createSceneObject("HINGEROOM Panel Content"); this.content.setParent(this.sceneObject);
    this.content.getTransform().setLocalPosition(new vec3(0,0,0.6));
    this.flex=this.content.createComponent(FlexLayout.getTypeName()) as FlexLayout;
    this.flex.autoDiscoverItemsOnStart=false;
    this.flex.width=this.widthCm; this.flex.height=-1; this.flex.direction=FlexDirection.Column;
    this.flex.alignItems=FlexAlign.Stretch; this.flex.justifyContent=FlexJustify.Start; this.flex.rowGap=1.2;
    this.flex.paddingTop=this.paddingCm; this.flex.paddingBottom=this.paddingCm; this.flex.paddingLeft=this.paddingCm; this.flex.paddingRight=this.paddingCm;
    this.flex.onLayoutComplete.add(r=>{plate.size=new vec2(r.containerWidth,r.containerHeight);});
    this.label("HINGEROOM Title",this.title,"title",3.5);
    this.label("HINGEROOM Preset","VIRTUAL EXAMPLE · cm","body",2.1);
    this.label("HINGEROOM Dimensions","Cabinet 60 × 40 × 80\nDoor 60 × 76 × 2 · Box 20 × 20 × 60","body",4.2);
    this.angle=this.label("HINGEROOM Angle","Door 0° / 110°","status",2.8);
    const sliderObject=this.item("HINGEROOM Angle Slider",6);
    this.slider=sliderObject.createComponent(Slider.getTypeName()) as Slider;
    this.slider.size=new vec3(this.widthCm-2*this.paddingCm,6,1);
    this.status=this.label("HINGEROOM Path Status","○ Open to check","status",3.4);
    this.current=this.label("HINGEROOM Current Panel","Current panel: separate check","body",2.4);
    this.label("HINGEROOM Instructions","Grab the box with one hand.\nChecks the whole path from closed.\n0.5 cm margin · virtual preset only","body",6.1);
    const reset=this.item("HINGEROOM Reset",6);
    const button=reset.createComponent(Button.getTypeName()) as Button;
    button.size=new vec3(this.widthCm-2*this.paddingCm,6,1);
    const label=global.scene.createSceneObject("HINGEROOM Reset Label"); label.setParent(reset);
    label.getTransform().setLocalPosition(new vec3(0,0,0.58));
    const text=label.createComponent("Component.Text") as Text; this.styleText(text,this.resetLabel,"body",6);
    this.hint=this.label("HINGEROOM Direction Hint","","body",2.2);
    this.createEvent("OnStartEvent").bind(()=>{
      this.slider.onValueChange.add(v=>this.onAngle.invoke(v*110));
      this.slider.onKnobMoved.add(v=>this.onAngle.invoke(v*110));
      button.onTriggerUp.add(()=>this.onReset.invoke());
    });
  }
  private item(name:string,height:number):SceneObject {
    const child=global.scene.createSceneObject(name); child.setParent(this.content);
    const item=child.createComponent(FlexItem.getTypeName()) as FlexItem;
    item.overrideHeight=height; item.overrideWidth=this.widthCm-2*this.paddingCm; item.flexShrink=0; item.alignSelf=FlexAlignSelf.Stretch;
    this.flex.addItems([item]); return child;
  }
  private styleText(t:Text,value:string,role:Role,height:number):void {
    t.text=value; t.depthTest=true; t.horizontalOverflow=HorizontalOverflow.Overflow;
    t.horizontalAlignment=HorizontalAlignment.Center; t.verticalAlignment=VerticalAlignment.Center;
    t.layoutRect=Rect.create(-(this.widthCm-2*this.paddingCm)/2,(this.widthCm-2*this.paddingCm)/2,-height/2,height/2);
    t.textFill.color=this.textColor; applyTextRole(t,role,this.textScale);
  }
  private label(name:string,value:string,role:Role,height:number):Text {
    const obj=this.item(name,height); const t=obj.createComponent("Component.Text") as Text; this.styleText(t,value,role,height); return t;
  }
  public setReading(degrees:number,label:string,overlaps:boolean,withinMargin:boolean,uncertain:boolean):void {
    this.angle.text=`Door ${degrees.toFixed(1)}° / 110°`;
    this.status.text=(label==="Path blocked"?"▲ ":label==="Path clear"?"✓ ":"○ ")+label;
    this.status.textFill.color=label==="Path blocked"?new vec4(1,0.7,0.2,1):this.textColor;
    this.current.text=uncertain?"Boundary uncertain · treated blocked":overlaps?"Current panel: touching / overlapping":withinMargin?"Current panel: within margin":"Current panel: no overlap";
  }
  public resetSlider():void { this.slider.resetToValue(0); }
  public setDirectionHint(direction:string):void { this.hint.text=direction; }
}
