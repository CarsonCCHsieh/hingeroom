/** Preview-only scenario registration. Scenarios are explicitly run by the LEAF panel. */
import {scenariosIndex} from "Leaf.lspkg/Scenarios/decorator/ScenarioIndexDecorator";
import {ScenarioMetadata} from "Leaf.lspkg/Scenarios/scenario/ScenarioMetadata";
import {HINGEROOMGeometryScenario} from "./HINGEROOMGeometryScenario";
import {HINGEROOMOpeningScenario} from "./HINGEROOMOpeningScenario";
import {HINGEROOMObstacleScenario} from "./HINGEROOMObstacleScenario";
import {HINGEROOMCounterexampleScenario} from "./HINGEROOMCounterexampleScenario";
import {HINGEROOMWorldAnchorScenario} from "./HINGEROOMWorldAnchorScenario";
import {HINGEROOMReachScenario} from "./HINGEROOMReachScenario";
@component
export class HINGEROOMLeafIndex extends BaseScriptComponent {
  @scenariosIndex
  static scenariosIndex:ScenarioMetadata[]=[
    {id:"hingeroom-geometry",typename:HINGEROOMGeometryScenario.getTypeName()},
    {id:"hingeroom-opening",typename:HINGEROOMOpeningScenario.getTypeName()},
    {id:"hingeroom-obstacle-reset",typename:HINGEROOMObstacleScenario.getTypeName()},
    {id:"hingeroom-counterexamples",typename:HINGEROOMCounterexampleScenario.getTypeName()},
    {id:"hingeroom-world-anchor",typename:HINGEROOMWorldAnchorScenario.getTypeName()},
    {id:"hingeroom-reach",typename:HINGEROOMReachScenario.getTypeName()}
  ];
}
