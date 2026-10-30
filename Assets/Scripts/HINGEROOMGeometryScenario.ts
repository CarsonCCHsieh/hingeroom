/** Real Lens-runtime geometry regressions; this is supplemental to interaction QA. */
import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario";
import {expect} from "Leaf.lspkg/Utils/common/Expect";
import {checkDoorPath,prismDistanceCm,DEFAULT_OBSTACLE,DEFAULT_DOOR,doorFootprint,midpointDisplacementBoundCm} from "./HINGEROOMGeometry";
@component
export class HINGEROOMGeometryScenario extends Scenario {
  async run():Promise<void> {
    const vectors:[number,number,number,string][]=[[35,35,10,"clear"],[35,35,45,"blocked"],[35,35,90,"blocked"],[10,35,45,"clear"],[-15,55,90,"clear"],[-15,55,110,"blocked"],[80,80,110,"clear"],[52.41015008585,53.15688226442,50,"blocked"]];
    for(const [x,z,angle,status] of vectors) {
      const r=checkDoorPath(angle,{...DEFAULT_OBSTACLE,centerX:x,centerZ:z});
      expect(r.status).toBe(status); expect(r.conservativeUncertainty).toBe(false);
      expect(r.pathFullyCertified).toBe(status==="clear");
    }
    const ninety=checkDoorPath(90);expect(ninety.currentPanelOverlaps).toBe(false);expect(ninety.currentDistanceCm).toBeCloseTo(24,4);
    const thin={...DEFAULT_OBSTACLE,centerX:52.41015008585,centerZ:53.15688226442};
    for(let a=0;a<=50;a++)expect(prismDistanceCm(a*Math.PI/180,thin)>0.5001).toBe(true);
    expect(checkDoorPath(50,thin).witness.distanceCm<0.5001).toBe(true);
    expect(checkDoorPath(90,{...DEFAULT_OBSTACLE,yMin:78.6,yMax:138.6}).status).toBe("clear");
    expect(checkDoorPath(90,{...DEFAULT_OBSTACLE,yMin:78.5,yMax:138.5}).status).toBe("blocked");
    expect(checkDoorPath(1,{...DEFAULT_OBSTACLE,centerX:30,centerZ:11}).status).toBe("blocked");
    expect(checkDoorPath(1,{...DEFAULT_OBSTACLE,centerX:30,centerZ:11.5}).status).toBe("blocked");
    const limit=checkDoorPath(90,{...DEFAULT_OBSTACLE,yMin:78.6,yMax:138.6},DEFAULT_DOOR,{maxIntervals:1});
    expect(limit.status).toBe("blocked");expect(limit.conservativeUncertainty).toBe(true);
    expect(checkDoorPath(NaN).status).toBe("blocked");expect(checkDoorPath(0).label).toBe("Open to check");
    const width=110*Math.PI/180,middle=doorFootprint(width/2),bound=midpointDisplacementBoundCm(width);
    for(let i=0;i<=20;i++) {
      const poly=doorFootprint(width*i/20);
      for(let k=0;k<4;k++)expect(Math.hypot(poly[k].x-middle[k].x,poly[k].z-middle[k].z)<=bound+1e-9).toBe(true);
    }
  }
}
