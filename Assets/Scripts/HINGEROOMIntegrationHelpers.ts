/** LEAF integration flows over confirmed authored names and real UIKit/SIK APIs.
 * Fixture placement is explicit setup. dragTo drives SIK and closes its loop on SDK translation events.
 */
import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario";
import {expect} from "Leaf.lspkg/Utils/common/Expect";
import {findSceneObjectByName,sleep,nextFrame} from "Leaf.lspkg/Utils/common/Utils";
import {findInteractablesByName} from "Leaf.lspkg/Interactors/InteractableUtils";
import {DefaultLeafInteractor} from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor";
import {IKBodyInteractor} from "Leaf.lspkg/Interactors/interactor/ik/IKBodyInteractor";
import {InteractableManipulation} from "SpectaclesInteractionKit.lspkg/Components/Interaction/InteractableManipulation/InteractableManipulation";
import {HINGEROOMMain} from "./HINGEROOMMain";
export function main():HINGEROOMMain {return findSceneObjectByName("HINGEROOM").getComponent(HINGEROOMMain.getTypeName());}
export function target(name:string) {const t=findInteractablesByName(name,undefined,true)[0];if(!t)throw new Error("Missing confirmed target: "+name);return t;}
export async function setAngle(m:HINGEROOMMain,degrees:number):Promise<void> {m.controls.slider.currentValue=degrees/110;await nextFrame();}
export function placeFixture(m:HINGEROOMMain,x:number,z:number):void {
  const p=m.toWorld(x,z,30);m.obstacle.setCenter(p);m.obstacle.onMoved.invoke(p);
}
export async function reset(m:HINGEROOMMain):Promise<void> {await new DefaultLeafInteractor().trigger(target("HINGEROOM Reset"));await sleep(150);expect(m.state.degrees).toBe(0);}
export async function dragTo(m:HINGEROOMMain,x:number,z:number):Promise<void> {
  const t=target("HINGEROOM Obstacle"),desired=m.toWorld(x,z,30),move=new vec3(0,0,0);
  const transform=m.obstacle.sceneObject.getTransform();
  const update=()=>{const delta=desired.sub(transform.getWorldPosition());move.x=delta.x*0.18;move.y=0;move.z=delta.z*0.18;};
  const sdk=m.obstacle.sceneObject.getComponent(InteractableManipulation.getTypeName()) as InteractableManipulation;
  update();const unsub=sdk.onTranslationUpdate.add(update);
  try {await new DefaultLeafInteractor().drag(t,move,1600);}finally{unsub();}
  await sleep(150);
  expect(m.state.centerX).toBeCloseTo(x,0);expect(m.state.centerZ).toBeCloseTo(z,0);
  expect(transform.getWorldPosition().y).toBeCloseTo(m.hingeWorld.y+30,3);
}
