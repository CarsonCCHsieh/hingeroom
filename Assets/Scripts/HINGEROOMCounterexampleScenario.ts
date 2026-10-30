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
export class HINGEROOMCounterexampleScenario extends Scenario {
  async run():Promise<void> {
    const m=main();await reset(m);placeFixture(m,10,35);await setAngle(m,45);
    expect(m.state.reading.status).toBe("clear");expect(m.state.reading.currentDistanceCm).toBeCloseTo(2.535533906,4);
    placeFixture(m,-15,55);await setAngle(m,90);expect(m.state.reading.status).toBe("clear");
    await setAngle(m,110);expect(m.state.reading.status).toBe("blocked");
    const end=m.hinge.getTransform().getWorldTransform().multiplyPoint(new vec3(60,40,0));
    const local=m.basis.invert().multiplyVec3(end.sub(m.hingeWorld));expect(local.x<0).toBe(true);expect(local.z>0).toBe(true);
    placeFixture(m,52.41015008585,53.15688226442);await setAngle(m,50);expect(m.state.reading.status).toBe("blocked");
    await reset(m);
  }
}
