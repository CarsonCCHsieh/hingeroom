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
export class HINGEROOMReachScenario extends Scenario {
  async run():Promise<void> {
    const m=main();await setAngle(m,45);
    // Local IK only: omits createIKInteractor's account-backed Bitmoji download.
    // No fallback interactor: reach failure cannot be hidden by simulated SIK success.
    const ik=new IKBodyInteractor();await ik.ready;await ik.trigger(target("HINGEROOM Reset"));
    expect(m.state.degrees).toBe(0);
  }
}
