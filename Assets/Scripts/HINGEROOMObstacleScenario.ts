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
export class HINGEROOMObstacleScenario extends Scenario {
  async run():Promise<void> {
    const m=main();await reset(m);await setAngle(m,90);
    await dragTo(m,80,80);expect(m.state.reading.status).toBe("clear");
    await dragTo(m,35,35);expect(m.state.reading.status).toBe("blocked");
    await reset(m);expect(m.state.centerX).toBe(35);expect(m.state.centerZ).toBe(35);expect(m.state.reading.label).toBe("Open to check");
    await setAngle(m,10);expect(m.state.reading.status).toBe("clear");await setAngle(m,45);expect(m.state.reading.status).toBe("blocked");
  }
}
