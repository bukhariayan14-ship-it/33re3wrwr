// canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const W = canvas.width, H = canvas.height;

// camera
const camera = { x:0, y:0 };

// Load Sprite Images (base64)
const coinImg = new Image();
coinImg.src =
"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAFo9M/3AAAAvUlEQVR42p2TQQrCQBBF/1YMZsFs0YS2sMwW2wUwG2yQHsVhjTrMcCBAxW2rKCaJDeWc1nvxfVYkXr7nLM1xHkShcA/0Bq8AkaBNqjYHruBCzHgBZB8sPJEzCk0XFdMYFKgTFNM1JrVtE2A/VtS2PE9ZwdC0rGJKs8S1n5ex6N0qY+tjEw5iIlAo+yJ0ClrlRCa4T8A+TyyfHc05hWEKVsTLAuUTTM6U9ha4RZp+U2P5i/VZ4iEwYOJHPHFN4gAAAABJRU5ErkJggg==";

const enemyImg = new Image();
enemyImg.src =
"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAeCAYAAAD5nd/tAAABM0lEQVR4nO2Wy2oCMRCGv10kSQt7iFvSCqtgRZoCC2mSC2kgraCCtYAJtSDoAbtoC4BvwCwVxYqkzsnR4wbpw5CEzOfmbnz5syd/8zzn5hiGsQ3gDHZbURWcAfYx82GmJHCGTKgkSkCgwN5CIiJ6BOa+UMt8Ajwj7JoM0kJ2G4nO3GpEaswNpL0V4kJwCprG5fDNrB2RtGYmFGEFNpAb3GP00gFuKHfN8gH1Wh6cclWIun8GIMiv1xS8BTRI8z0lcO6b0Qv4cTllz2meq5BFYGapWMvEFCW2PUZzcZ2jxgW7IYk9o6g0bzErkA2TtuS60tPK8o0z3LNlY+2qDUn1BKzNV2l0jqMaUzrUzgVAoFNd4pRrB/PpN3oRLU1pVdfJoLfZ0bFTVCkUBZ0Pf3B4dTBkCui3AAA9YPmSiXDL0kA0R+wfKsJQAAAABJRU5ErkJggg==";

// Platforms
const platforms = [
  {x:0,y:520,w:2000,h:80},
  {x:300,y:420,w:200,h:24},
  {x:700,y:360,w:160,h:24},
  {x:1000,y:300,w:240,h:24}
];

// Player
const player = {
  x:80, y:360, w:40, h:56,
  dx:0, dy:0, speed:4.2,
  gravity:0.7, jump:-14,
  grounded:false
};

// Enemy sprites
const enemies = [
  {x:420,y:380,w:32,h:32,dir:1,speed:1.4,range:[420,520]},
  {x:760,y:320,w:32,h:32,dir:-1,speed:1.6,range:[700,900]}
];

// Coins
const coins = [
  {x:360,y:360},
  {x:820,y:300},
  {x:1040,y:240}
];

let score = 0;
let lives = 3;
const respawn = {x:80,y:360};

// Input
const keys = {};
window.addEventListener("keydown", e => keys[e.code]=true);
window.addEventListener("keyup",   e => keys[e.code]=false);

// Helpers
function collide(a,b){
  return !(a.x+a.w<b.x || a.x>b.x+b.w || a.y+a.h<b.y || a.y>b.y+b.h);
}

// Draw Functions
function drawBackground(){
  ctx.fillStyle = "#87ceeb";
  ctx.fillRect(0,0,W,H);
}

function drawPlatform(p){
  ctx.fillStyle="#7c4f2a";
  ctx.fillRect(p.x-camera.x,p.y-camera.y,p.w,p.h);
}

function drawPlayer(){
  const x = player.x - camera.x;
  const y = player.y - camera.y;

  ctx.fillStyle="#3b6ea5";
  ctx.fillRect(x,y,player.w,player.h);
}

function drawEnemy(e){
  ctx.drawImage(enemyImg,
    e.x-camera.x,
    e.y-camera.y,
    e.w,e.h
  );
}

function drawCoin(c){
  ctx.drawImage(coinImg,
    c.x-camera.x,
    c.y-camera.y,
    20,20
  );
}

function drawUI(){
  ctx.fillStyle="white";
  ctx.fillRect(10,10,200,50);

  ctx.fillStyle="black";
  ctx.font="16px Arial";
  ctx.fillText("Score: "+score,20,35);
  ctx.fillText("Lives: "+lives,20,52);
}

// Physics & Update
function update(){
  // move
  player.dx = 0;
  if(keys["ArrowLeft"])  player.dx = -player.speed;
  if(keys["ArrowRight"]) player.dx =  player.speed;

  if(keys["Space"] && player.grounded){
    player.dy = player.jump;
    player.grounded = false;
  }

  // apply
  player.dy += player.gravity;
  player.x += player.dx;
  player.y += player.dy;

  // collisions
  player.grounded=false;
  for(const p of platforms){
    const A = player;
    const B = {x:p.x,y:p.y,w:p.w,h:p.h};
    if(collide(A,B)){
      if(player.y + player.h <= p.y + 10){
        player.y = p.y - player.h;
        player.dy = 0;
        player.grounded = true;
      }
    }
  }

  // enemies patrol
  for(const e of enemies){
    e.x += e.speed * e.dir;
    if(e.x < e.range[0] || e.x > e.range[1]) e.dir *= -1;
  }

  // enemy collision
  for(const e of enemies){
    if(collide(player,e)){
      if(player.dy > 0){
        enemies.splice(enemies.indexOf(e),1);
        score += 20;
      } else {
        lives--;
        player.x = respawn.x;
        player.y = respawn.y;
      }
    }
  }

  // coin collection
  for(let i=coins.length-1;i>=0;i--){
    const c = coins[i];
    if(collide(player,{x:c.x,y:c.y,w:20,h:20})){
      coins.splice(i,1);
      score+=10;
    }
  }

  // camera follow
  camera.x = player.x - W/3;
}

// Draw
function draw(){
  drawBackground();

  platforms.forEach(drawPlatform);
  coins.forEach(drawCoin);
  enemies.forEach(drawEnemy);
  drawPlayer();
  drawUI();
}

// Loop
function loop(){
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();
