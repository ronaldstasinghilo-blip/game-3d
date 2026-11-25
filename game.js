import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 45, 180);

const camera = new THREE.PerspectiveCamera(65, innerWidth/innerHeight, 0.1, 400);
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xdff4ff, 0x64704b, 2.0));
const sun = new THREE.DirectionalLight(0xfff1d1, 2.2);
sun.position.set(-35,55,25); sun.castShadow = true;
sun.shadow.mapSize.set(1024,1024); scene.add(sun);

const mat = (color, roughness=1) => new THREE.MeshStandardMaterial({color, roughness});
const grassMat=mat(0x65a85b), roadMat=mat(0x45494d), sidewalkMat=mat(0xc9c5b5);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(240,240), grassMat);
ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);

function box(w,h,d,material,x,y,z){
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
  m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true; scene.add(m); return m;
}
// Cross-shaped provincial town roads
box(18,.12,220,roadMat,0,.07,0);
box(220,.12,18,roadMat,0,.08,0);
for(let i=-100;i<=100;i+=12){
  box(.22,.03,5,mat(0xf4e8a0),0,.15,i);
  box(5,.03,.22,mat(0xf4e8a0),i,.15,0);
}
// Sidewalk strips
for(const s of [-1,1]){
  box(3,.18,220,sidewalkMat,s*10.8,.12,0);
  box(220,.18,3,sidewalkMat,0,.12,s*10.8);
}
// Buildings in neighborhood blocks
const palettes=[0xffc98f,0xf2e2bd,0xb9d8cb,0xf3a9a0,0xd8c7f0,0xe8d889];
function makeHouse(x,z){
  const w=7+Math.random()*3, d=7+Math.random()*3, h=4+Math.random()*5;
  const wall=mat(palettes[Math.floor(Math.random()*palettes.length)]);
  box(w,h,d,wall,x,h/2,z);
  // colorful roof
  const roof= new THREE.Mesh(new THREE.ConeGeometry(Math.max(w,d)*.72,2.5,4),mat(0x9b5540));
  roof.position.set(x,h+1.1,z); roof.rotation.y=Math.PI/4; roof.castShadow=true; scene.add(roof);
  // front door and windows face the nearest road
  box(1.1,2,.12,mat(0x65402c),x,.95,z+d/2+.07);
  for(const wx of [-1.7,1.7]){
    box(1.15,1.1,.14,mat(0x8ed9ed),x+wx,2.7,z+d/2+.08);
  }
}
for(let x=-42;x<=42;x+=18){
  for(let z=-42;z<=42;z+=18){
    if(Math.abs(x)<17 || Math.abs(z)<17) continue;
    makeHouse(x+(Math.random()-.5)*3,z+(Math.random()-.5)*3);
  }
}
// Storefronts
function shop(x,z,color,label){
  const body=box(10,6,8,mat(color),x,3,z);
  box(10.2,.8,8.2,mat(0x315e72),x,6.1,z);
  box(7,1.2,.18,mat(0xffe9a6),x,4.9,z+4.1);
}
shop(-25,0,0xffc46b); shop(25,0,0x9ed5d0); shop(0,-25,0xf1a6a6); shop(0,25,0xd1b4e8);
// Palm trees
function palm(x,z){
  const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.22,.38,5,7),mat(0x8c603b));
  trunk.position.set(x,2.5,z); trunk.castShadow=true; scene.add(trunk);
  for(let i=0;i<7;i++){
    const leaf=new THREE.Mesh(new THREE.ConeGeometry(.42,4,5),mat(0x25834a));
    leaf.position.set(x+Math.cos(i*Math.PI*2/7)*1.25,5.1,z+Math.sin(i*Math.PI*2/7)*1.25);
    leaf.rotation.z=Math.PI/2; leaf.rotation.y=i*Math.PI*2/7; leaf.castShadow=true; scene.add(leaf);
  }
}
for(let i=-5;i<=5;i++){palm(i*18,14);palm(i*18,-14);}
// Player: simple colorful cartoon person
const player=new THREE.Group(); scene.add(player);
const skin=mat(0xd99a6b), shirt=mat(0x2478d0), pants=mat(0x26334d), dark=mat(0x30251f);
const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.48,.9,4,8),shirt); torso.position.y=1.55; torso.castShadow=true; player.add(torso);
const head=new THREE.Mesh(new THREE.SphereGeometry(.38,16,12),skin); head.position.y=2.35; head.castShadow=true; player.add(head);
const hair=new THREE.Mesh(new THREE.SphereGeometry(.39,12,8,0,Math.PI*2,0,Math.PI*.55),dark); hair.position.y=2.48; player.add(hair);
const leg1=new THREE.Mesh(new THREE.BoxGeometry(.28,.85,.32),pants); leg1.position.set(-.23,.48,0); player.add(leg1);
const leg2=leg1.clone(); leg2.position.x=.23; player.add(leg2);
const arm1=new THREE.Mesh(new THREE.BoxGeometry(.22,.8,.25),skin); arm1.position.set(-.58,1.55,0); player.add(arm1);
const arm2=arm1.clone(); arm2.position.x=.58; player.add(arm2);
player.position.set(0,0,5);

// Parked decorative cars
function car(x,z,color){
  const g=new THREE.Group(); scene.add(g); g.position.set(x,.25,z);
  const body=new THREE.Mesh(new THREE.BoxGeometry(3.2,.85,5.2),mat(color)); body.position.y=.65; body.castShadow=true; g.add(body);
  const cabin=new THREE.Mesh(new THREE.BoxGeometry(2.35,.9,2.5),mat(0x9bd7e8)); cabin.position.set(0,1.35,-.15); g.add(cabin);
  for(const xx of [-1.55,1.55]) for(const zz of [-1.6,1.6]){
    const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,.28,12),mat(0x222222));
    wheel.rotation.z=Math.PI/2; wheel.position.set(xx,.4,zz); g.add(wheel);
  }
}
car(-7,7,0xe34e45); car(7,-7,0xf0c342); car(34,7,0x4b9cdb);

let yaw=0, pitch=.22, move={forward:false,back:false,left:false,right:false}, jumping=false, vy=0;
const keys={};
addEventListener('keydown',e=>{keys[e.code]=true;});
addEventListener('keyup',e=>{keys[e.code]=false;});
function bindButton(el, key){
  const down=e=>{e.preventDefault();move[key]=true;};
  const up=e=>{e.preventDefault();move[key]=false;};
  el.addEventListener('pointerdown',down); el.addEventListener('pointerup',up);
  el.addEventListener('pointercancel',up); el.addEventListener('pointerleave',up);
}
document.querySelectorAll('[data-move]').forEach(b=>bindButton(b,b.dataset.move));
document.getElementById('jump').addEventListener('pointerdown',()=>{if(player.position.y<=.02){vy=6;jumping=true;}});
// Drag to rotate camera
let dragging=false,lastX=0,lastY=0;
renderer.domElement.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;});
addEventListener('pointerup',()=>dragging=false);
addEventListener('pointermove',e=>{if(!dragging)return; yaw-=(e.clientX-lastX)*.006; pitch=Math.max(-.05,Math.min(.65,pitch+(e.clientY-lastY)*.003));lastX=e.clientX;lastY=e.clientY;});

const clock=new THREE.Clock();
function animate(){
 requestAnimationFrame(animate);
 const dt=Math.min(clock.getDelta(),.04);
 const f=keys.KeyW||keys.ArrowUp||move.forward, b=keys.KeyS||keys.ArrowDown||move.back;
 const l=keys.KeyA||keys.ArrowLeft||move.left, r=keys.KeyD||keys.ArrowRight||move.right;
 let dx=(r?1:0)-(l?1:0), dz=(b?1:0)-(f?1:0);
 const moving=dx!==0||dz!==0;
 if(moving){
   const len=Math.hypot(dx,dz); dx/=len; dz/=len;
   const speed=8*dt;
   const sin=Math.sin(yaw), cos=Math.cos(yaw);
   player.position.x+=(dx*cos+dz*sin)*speed;
   player.position.z+=(-dx*sin+dz*cos)*speed;
   player.rotation.y=Math.atan2(dx*cos+dz*sin,-dx*sin+dz*cos);
 }
 vy-=16*dt; player.position.y=Math.max(0,player.position.y+vy*dt); if(player.position.y===0)vy=0;
 const target=new THREE.Vector3(player.position.x,1.5+player.position.y,player.position.z);
 const distance=8.5;
 const camX=target.x+Math.sin(yaw)*distance;
 const camZ=target.z+Math.cos(yaw)*distance;
 camera.position.set(camX,target.y+3+pitch*5,camZ);
 camera.lookAt(target);
 document.getElementById('status').textContent=moving?'Exploring • Keep going!':'Welcome to your town';
 renderer.render(scene,camera);
}
animate();
document.getElementById('loading').style.display='none';
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
