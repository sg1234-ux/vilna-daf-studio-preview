const assert=require('node:assert/strict');
const {spacePlan}=require('../draft-engine/editable-gaps.js');
for(const [width,natural]of [[24,3],[12.421875,4.5],[2,4],[1.3,1.2],[350,2]]){
 const p=spacePlan(width,natural);assert.ok(p.count>=1);assert.ok(Math.abs(p.count*(natural+p.spacing)-width)<1e-9);
 if(width>=natural*1.5){assert.ok(p.count>=2);assert.ok((p.count-1)*(natural+p.spacing)>0,'Deleting one space leaves a gap');}
}
assert.equal(spacePlan(0,3),null);assert.equal(spacePlan(3,0),null);
console.log('PASS gap widths preserved; wide gaps contain multiple spaces; one deletion leaves spacing.');
