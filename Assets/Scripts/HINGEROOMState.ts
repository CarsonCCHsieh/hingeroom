/** Single owner of manual preset domain values. No Lens, UI, or gesture API. */
import {checkDoorPath,DEFAULT_OBSTACLE,PathResult} from "./HINGEROOMGeometry";
export class HINGEROOMState {
  public degrees=0;
  public centerX=35;
  public centerZ=35;
  public reading:PathResult=checkDoorPath(0);
  public setAngle(degrees:number):void {this.degrees=Math.max(0,Math.min(110,degrees));this.recalculate();}
  public setCenter(x:number,z:number):void {this.centerX=x;this.centerZ=z;this.recalculate();}
  public reset():void {this.degrees=0;this.centerX=35;this.centerZ=35;this.recalculate();}
  private recalculate():void {this.reading=checkDoorPath(this.degrees,{...DEFAULT_OBSTACLE,centerX:this.centerX,centerZ:this.centerZ});}
}
