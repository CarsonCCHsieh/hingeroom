import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario";
import {expect} from "Leaf.lspkg/Utils/common/Expect";
import {findSceneObjectByName,sleep,nextFrame} from "Leaf.lspkg/Utils/common/Utils";
import {findInteractablesByName} from "Leaf.lspkg/Interactors/InteractableUtils";
import {DefaultLeafInteractor} from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor";
import {IKBodyInteractor} from "Leaf.lspkg/Interactors/interactor/ik/IKBodyInteractor";
import {InteractableManipulation} from "SpectaclesInteractionKit.lspkg/Components/Interaction/InteractableManipulation/InteractableManipulation";
import {HINGEROOMMain} from "./HINGEROOMMain";
import {main,target,setAngle,placeFixture,reset,dragTo} from "./HINGEROOMIntegrationHelpers";
@component
export class HINGEROOMWorldAnchorScenario extends Scenario {
  async run():Promise<void> {
    const m=main();await reset(m);
    const roots=[m.cabinet,m.hinge,m.obstacle.sceneObject,m.clearanceRoot,m.panelRoot];
    const positions=roots.map(o=>o.getTransform().getWorldPosition());
    const camera=m.camera.getTransform(),before=camera.getWorldPosition();
    camera.setWorldPosition(before.add(new vec3(35,10,15)));await sleep(300);
    roots.forEach((o,i)=>expect(o.getTransform().getWorldPosition().sub(positions[i]).length<0.001).toBe(true));
    camera.setWorldPosition(before);
    expect(m.obstacle.sceneObject.getTransform().getWorldScale().x).toBeCloseTo(1,4);
    const collider=m.obstacle.sceneObject.getComponent("Physics.ColliderComponent") as ColliderComponent;
    const visual=m.obstacle.visualRoot.getComponent("Component.RenderMeshVisual") as RenderMeshVisual;
    expect((collider.shape as MeshShape).mesh.isSame(visual.mesh)).toBe(true);
    const vertices=visual.mesh.extractVerticesForAttribute("position");
    const minima=[Infinity,Infinity,Infinity],maxima=[-Infinity,-Infinity,-Infinity];
    for(let i=0;i<vertices.length;i+=3){
      const p=m.basis.invert().multiplyVec3(new vec3(vertices[i],vertices[i+1],vertices[i+2]));
      [p.x,p.y,p.z].forEach((v,k)=>{minima[k]=Math.min(minima[k],v);maxima[k]=Math.max(maxima[k],v);});
    }
    [-10,-30,-10].forEach((v,k)=>expect(minima[k]).toBeCloseTo(v,3));
    [10,30,10].forEach((v,k)=>expect(maxima[k]).toBeCloseTo(v,3));
    const rotation=m.obstacle.sceneObject.getTransform().getWorldRotation();
    expect(rotation.x).toBeCloseTo(0,4);expect(rotation.y).toBeCloseTo(0,4);expect(rotation.z).toBeCloseTo(0,4);
    const angle=findSceneObjectByName("HINGEROOM Angle").getComponent("Component.Text") as Text;
    expect(angle.depthTest).toBe(true);expect(angle.text.includes("0.0°")).toBe(true);
  }
}
