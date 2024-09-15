import Matter, { Body, Vector, World } from "matter-js";

const w = window.innerWidth;
const h = window.innerHeight;
const inset = 0;
const puckRadius = 40;

// Module aliases
const Engine = Matter.Engine,
  Render = Matter.Render,
  Runner = Matter.Runner,
  Bodies = Matter.Bodies,
  Composite = Matter.Composite,
  Constraint = Matter.Constraint,
  Events = Matter.Events;

// Create an engine
const engine = Engine.create();
engine.gravity.y = 0;



// Create walls (bounds)
const leftTopHalfWall     = Bodies.rectangle(   -w / 2 + inset,             h / 6, w, h / 3, { isStatic: true, restitution: 1 });
const rightTopHalfWall    = Bodies.rectangle(3 * w / 2 - inset,             h / 6, w, h / 3, { isStatic: true, restitution: 1 });
const leftBottomHalfWall  = Bodies.rectangle(   -w / 2 + inset, 2 * h / 3 + h / 6, w, h / 3, { isStatic: true, restitution: 1 });
const rightBottomHalfWall = Bodies.rectangle(3 * w / 2 - inset, 2 * h / 3 + h / 6, w, h / 3, { isStatic: true, restitution: 1 });

const topWall     = Bodies.rectangle(w / 2,    -h / 2 + inset, 3 * w, h, { isStatic: true, restitution: 1 });
const bottomWall  = Bodies.rectangle(w / 2, 3 * h / 2 - inset, 3 * w, h, { isStatic: true, restitution: 1 });

// Goals
const leftGoal  = Bodies.rectangle(   -w / 2 - puckRadius * 3, h / 2, w, h / 3, { isStatic: true, restitution: 0 });
const rightGoal = Bodies.rectangle(3 * w / 2 + puckRadius * 3, h / 2, w, h / 3, { isStatic: true, restitution: 0 });

// Puck
let puck = Bodies.circle(Math.round(Math.random()) === 1 ? w / 4 : 3 * w / 4, h / 2, 40, {restitution: 1, frictionAir: 0.005});

const scoreBoard = {left: 0, right: 0};

const canvas = document.getElementById('canvas');
canvas.width = w;
canvas.height = h;
canvas.style.width = w;
canvas.style.height = h;

// Detect collisions
Events.on(engine, 'collisionStart', function(event) {
  const pairs = event.pairs;

  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i];
    if(pair.id === Matter.Pair.id(puck, leftGoal)) {
      // Reset puck
      Body.setSpeed(puck, 0);
      Body.setVelocity(puck, Vector.create(0, 0));
      Body.setPosition(puck, Vector.create(w / 4, h / 2));
      
      // Update scoreboard
      scoreBoard.right += 1;
    }
    else if(pair.id === Matter.Pair.id(puck, rightGoal)) {
      // Reset puck
      Body.setSpeed(puck, 0);
      Body.setVelocity(puck, Vector.create(0, 0));
      Body.setPosition(puck, Vector.create(3 * w / 4, h / 2));
      
      // Update scoreboard
      scoreBoard.left += 1;
    }

    // Match point
    if(scoreBoard.left >= 7 || scoreBoard.right >= 7) {
      scoreBoard.left = 0;
      scoreBoard.right = 0;
    }
  }
});

// Add all of the bodies to the world
Composite.add(engine.world, [
  puck, 
  leftTopHalfWall, 
  leftBottomHalfWall, 
  rightTopHalfWall, 
  rightBottomHalfWall, 
  topWall, 
  bottomWall, 
  leftGoal, 
  rightGoal
]);


// Create a renderer
/*const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width: w,
    height: h
  }
});
// Run the debug renderer
Render.run(render);*/

// Render loop
requestAnimationFrame(function update() {
  canvas.getContext('2d').clearRect(0, 0, w, h);
  draw();
  requestAnimationFrame(update);
});

// Create runner
const runner = Runner.create();

// Run the engine
Runner.run(runner, engine);

function isFlickering() {
  const startFlickering = Math.random() < 0.01;
  const isFlickering = Math.floor(Date.now() / 100) % 2 === 0;
  return startFlickering && isFlickering;
}
function draw() {
  const ctx = canvas.getContext("2d");

  ctx.font = `${h}px 'Rajdhani'`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'hanging';

  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.lineWidth = 4;
  ctx.shadowBlur = 100;

  // Left score
  ctx.strokeStyle = 'rgba(1, 206, 194, 0.6)';
  ctx.shadowColor = 'rgba(1, 206, 194, 1)';
  if(!isFlickering()) {
    ctx.strokeText(scoreBoard.left, w / 4, h / 2 - h * .9 / 2);
    ctx.fillText(scoreBoard.left, w / 4, h / 2 - h * .9 / 2);
  }
  // Right score
  ctx.strokeStyle = 'rgba(252, 63, 121, 0.6)';
  ctx.shadowColor = 'rgba(252, 63, 121, 1)';
  if(!isFlickering()) {
    ctx.strokeText(scoreBoard.right, 3 * w / 4, h / 2 - h * .9 / 2);
    ctx.fillText(scoreBoard.right, 3 * w / 4, h / 2 - h * .9 / 2);
  }

  const arenaIsFlickering = isFlickering();
  // Halfway line
  ctx.strokeStyle = 'rgba(242, 255, 2, 0.6)';
  ctx.shadowColor = 'rgba(242, 255, 2, 0.5)';
  ctx.beginPath();
  ctx.moveTo(w / 2, 0);
  ctx.lineTo(w / 2, h / 2 - h / 8);
  ctx.moveTo(w / 2 + h / 8, h / 2);
  ctx.arc(w / 2, h / 2, h / 8, 0, 2 * Math.PI);
  ctx.moveTo(w / 2, h / 2 + h / 8);
  ctx.lineTo(w / 2, h);
  ctx.closePath();
  if(!arenaIsFlickering) {
    ctx.stroke();
    ctx.fill();
  }

  // Bounds
  ctx.beginPath();
  ctx.moveTo(0, h / 3);
  ctx.lineTo(0, 0);
  ctx.lineTo(w, 0);
  ctx.lineTo(w, h / 3);
  ctx.moveTo(w, 2 * h / 3);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.lineTo(0, 2 * h / 3);
  if(!arenaIsFlickering) {
    ctx.stroke();
  }
  ctx.closePath();

  // Puck
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.shadowColor = 'rgba(255, 255, 255, 1)';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.beginPath();
  ctx.arc(puck.position.x, puck.position.y, puckRadius, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.fill();
  ctx.closePath();

  // Pushers
  for (let i = 0; i < evCacheSvg.length; i++) {
    ctx.beginPath();
    ctx.arc(evCacheSvg[i].obj.position.x, evCacheSvg[i].obj.position.y, 80, 0, 2 * Math.PI);
    ctx.closePath();
    if(evCacheSvg[i].obj.position.x < w / 2) {
      ctx.strokeStyle = 'rgba(1, 206, 194, 0.6)';
      ctx.shadowColor = 'rgba(1, 206, 194, 1)';
      ctx.fillStyle = 'rgba(1, 206, 194, 0.1)';
    } else {
      ctx.strokeStyle = 'rgba(252, 63, 121, 0.6)';
      ctx.shadowColor = 'rgba(252, 63, 121, 1)';
      ctx.fillStyle = 'rgba(252, 63, 121, 0.1)';
    }
    ctx.stroke();
    ctx.fill();
  }
}

// Multitouch event listeners/handlers
const evCacheSvg = new Array();

function pointerdown_handler(ev) {
  let pusher = Bodies.circle(ev.offsetX, ev.offsetY, 80, {restitution: 1});
  let touchPoint = Bodies.circle(ev.offsetX, ev.offsetY, 1, {isStatic: true});
  touchPoint.collisionFilter.group = -1;
  touchPoint.collisionFilter.category = 2;
  touchPoint.collisionFilter.mask = 0;
  Composite.add(engine.world, [pusher, touchPoint]);

  let constraint = Constraint.create({
    bodyA: pusher, 
    bodyB: touchPoint,
    stiffness: .1,
    length: 0
  });

  World.add(engine.world, constraint);

  // The pointerdown event signals the start of a touch interaction.
  // Save this event for later processing (this could be part of a
  // multi-touch interaction) and update the background color
  evCacheSvg.push({event: ev, obj: touchPoint, pusher: pusher, constraint: constraint});
}

function pointermove_handler(ev) {
  // Note: if the user makes more than one "simultaneous" touch, most browsers 
  // fire at least one pointermove event and some will fire several pointermoves.

  // This function sets the target element's border to "dashed" to visually
  // indicate the target received a move event.

  for (let i = 0; i < evCacheSvg.length; i++) {
    if (evCacheSvg[i].event.pointerId == ev.pointerId) {
      Matter.Body.setPosition(evCacheSvg[i].obj, Vector.create(ev.offsetX, ev.offsetY));
      break;
    }
  }
}

function pointerup_handler(ev) {
  // Remove this touch point from the cache and reset the target's
  // background and border
  remove_event(ev);
}

function remove_event(ev) {
  // Remove this event from the target's cache
  for (let i = 0; i < evCacheSvg.length; i++) {
    if (evCacheSvg[i].event.pointerId == ev.pointerId) {
      Composite.remove(engine.world, evCacheSvg[i].obj);
      Composite.remove(engine.world, evCacheSvg[i].pusher);
      Composite.remove(engine.world, evCacheSvg[i].constraint);
      evCacheSvg.splice(i, 1);
      break;
    }
  }
}

function set_handlers() {
  // Install event handlers for the given element
  const el = document.querySelector('canvas');

  el.onpointerdown = pointerdown_handler;
  el.onpointermove = pointermove_handler;

  // Use same handler for pointer{up,cancel,out,leave} events since
  // the semantics for these events - in this app - are the same.
  el.onpointerup = pointerup_handler;
  el.onpointercancel = pointerup_handler;
  el.onpointerout = pointerup_handler;
  el.onpointerleave = pointerup_handler;
}

// Set multitouch eventhandlers
set_handlers();