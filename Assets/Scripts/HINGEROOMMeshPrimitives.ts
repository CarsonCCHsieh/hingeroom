/** Centimeter MeshBuilder solids. No UI or domain state. CCW per-face vertices. */
export interface BoxSpec { center: vec3; size: vec3 }
export function boxesMesh(boxes: BoxSpec[], rotation?: quat): RenderMesh {
  const b = new MeshBuilder([{name:"position",components:3},{name:"normal",components:3,normalized:true},{name:"color",components:4}]);
  b.topology = MeshTopology.Triangles; b.indexType = MeshIndexType.UInt16;
  const vertices: number[] = [], indices: number[] = [];
  const face = (points: number[][], normal: vec3) => {
    const start = vertices.length / 10;
    const n = rotation ? rotation.multiplyVec3(normal) : normal;
    for (const p of points) {
      const v = rotation ? rotation.multiplyVec3(new vec3(p[0],p[1],p[2])) : new vec3(p[0],p[1],p[2]);
      vertices.push(v.x,v.y,v.z,n.x,n.y,n.z,1,1,1,1);
    }
    indices.push(start,start+1,start+2,start,start+2,start+3);
  };
  for (const box of boxes) {
    const c=box.center, h=box.size.uniformScale(0.5);
    const x0=c.x-h.x,x1=c.x+h.x,y0=c.y-h.y,y1=c.y+h.y,z0=c.z-h.z,z1=c.z+h.z;
    face([[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],[x1,y0,z1]],new vec3(1,0,0));
    face([[x0,y0,z1],[x0,y1,z1],[x0,y1,z0],[x0,y0,z0]],new vec3(-1,0,0));
    face([[x0,y1,z0],[x0,y1,z1],[x1,y1,z1],[x1,y1,z0]],new vec3(0,1,0));
    face([[x0,y0,z1],[x0,y0,z0],[x1,y0,z0],[x1,y0,z1]],new vec3(0,-1,0));
    face([[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]],new vec3(0,0,1));
    face([[x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0]],new vec3(0,0,-1));
  }
  b.appendVerticesInterleaved(vertices); b.appendIndices(indices); b.updateMesh();
  return b.getMesh();
}
export function box(cx:number,cy:number,cz:number,w:number,h:number,d:number): BoxSpec {
  return {center:new vec3(cx,cy,cz),size:new vec3(w,h,d)};
}
export function renderSolid(owner:SceneObject,mesh:RenderMesh,base:Material,color:vec4): RenderMeshVisual {
  const visual=owner.createComponent("Component.RenderMeshVisual") as RenderMeshVisual;
  visual.mesh=mesh; visual.mainMaterial=base.clone(); visual.mainMaterial.mainPass.baseColor=color;
  return visual;
}
export function outlineBoxes(x0:number,x1:number,y0:number,y1:number,z0:number,z1:number,t=0.35): BoxSpec[] {
  const out:BoxSpec[]=[];
  for(const y of [y0+t/2,y1-t/2]) for(const z of [z0+t/2,z1-t/2]) out.push(box((x0+x1)/2,y,z,x1-x0,t,t));
  for(const x of [x0+t/2,x1-t/2]) for(const z of [z0+t/2,z1-t/2]) out.push(box(x,(y0+y1)/2,z,t,y1-y0,t));
  for(const x of [x0+t/2,x1-t/2]) for(const y of [y0+t/2,y1-t/2]) out.push(box(x,y,(z0+z1)/2,t,t,z1-z0));
  return out;
}
