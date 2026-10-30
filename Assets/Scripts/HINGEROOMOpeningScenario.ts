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
export class HINGEROOMOpeningScenario extends Scenario {
  async run():Promise<void> {
    const m=main();await reset(m);
    // Read actual MeshBuilder output, rather than trusting origin-inclusive engine bounds.
    const door=findSceneObjectByName("HINGEROOM Door").getComponent("Component.RenderMeshVisual") as RenderMeshVisual;
    const vertices=door.mesh.extractVerticesForAttribute("position");
    const minima=[Infinity,Infinity,Infinity],maxima=[-Infinity,-Infinity,-Infinity];
    vertices.forEach((v,i)=>{minima[i%3]=Math.min(minima[i%3],v);maxima[i%3]=Math.max(maxima[i%3],v);});
    expect(minima).toEqual([0,2,-1]);expect(maxima).toEqual([60,78,1]);
    const p=m.hinge.getTransform().getWorldPosition(),cab=m.cabinet.getTransform().getWorldTransform();
    for(const [a,status] of [[10,"clear"],[45,"blocked"],[90,"blocked"],[110,"blocked"]] as [number,string][]) {
      await setAngle(m,a);expect(m.state.reading.status).toBe(status);
      expect(m.hinge.getTransform().getWorldPosition().sub(p).length<0.001).toBe(true);
      const matrix=m.hinge.getTransform().getWorldTransform();
      const left=matrix.multiplyPoint(new vec3(0,40,0)),right=matrix.multiplyPoint(new vec3(60,40,0));
      expect(right.sub(left).length).toBeCloseTo(60,3);
      expect(m.cabinet.getTransform().getWorldTransform().multiplyPoint(vec3.zero()).sub(cab.multiplyPoint(vec3.zero())).length<0.001).toBe(true);
    }
    await setAngle(m,90);expect(m.state.reading.currentPanelOverlaps).toBe(false);expect(m.state.reading.currentDistanceCm).toBeCloseTo(24,3);
    // Real SIK slider drag, distinct from exact programmatic fixture selection above.
    const previous=m.state.degrees;
    await new DefaultLeafInteractor().drag(target("HINGEROOM Angle Slider"),new vec3(-0.15,0,0),600);
    expect(m.state.degrees<previous).toBe(true);
    await reset(m);
  }
}
