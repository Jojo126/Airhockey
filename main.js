import Matter, { Body, Vector, World } from "matter-js";

const w = window.innerWidth;
const h = window.innerHeight;
const inset = 30;

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

// Create a renderer
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width: w,
    height: h
  }
});

// Create walls (bounds)
const leftTopHalfWall     = Bodies.rectangle(   -w / 2 + inset,             h / 6, w, h / 3, { isStatic: true, restitution: 1 });
const rightTopHalfWall    = Bodies.rectangle(3 * w / 2 - inset,             h / 6, w, h / 3, { isStatic: true, restitution: 1 });
const leftBottomHalfWall  = Bodies.rectangle(   -w / 2 + inset, 2 * h / 3 + h / 6, w, h / 3, { isStatic: true, restitution: 1 });
const rightBottomHalfWall = Bodies.rectangle(3 * w / 2 - inset, 2 * h / 3 + h / 6, w, h / 3, { isStatic: true, restitution: 1 });

const topWall     = Bodies.rectangle(w / 2,    -h / 2 + inset, w, h, { isStatic: true, restitution: 1 });
const bottomWall  = Bodies.rectangle(w / 2, 3 * h / 2 - inset, w, h, { isStatic: true, restitution: 1 });

// Goals
const leftGoal  = Bodies.rectangle(   -w / 2, h / 2, w, h / 3, { isStatic: true, restitution: 0 });
const rightGoal = Bodies.rectangle(3 * w / 2, h / 2, w, h / 3, { isStatic: true, restitution: 0 });

let puck = Bodies.circle(w / 2, h / 2, 40, {restitution: 1});

const scoreBoard = {left: 0, right: 0};

// Detect collisions
Events.on(engine, 'collisionStart', function(event) {
  const pairs = event.pairs;

  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i];
    if(pair.id === Matter.Pair.id(puck, leftGoal)) {
      // Reset puck
      Body.setSpeed(puck, 0);
      Body.setVelocity(puck, Vector.create(0, 0));
      Body.setPosition(puck, Vector.create(400, h / 2));
      
      // Update scoreboard
      scoreBoard.right += 1;
    }
    else if(pair.id === Matter.Pair.id(puck, rightGoal)) {
      // Reset puck
      Body.setSpeed(puck, 0);
      Body.setVelocity(puck, Vector.create(0, 0));
      Body.setPosition(puck, Vector.create(w - 400, h / 2));
      
      // Update scoreboard
      scoreBoard.left += 1;
    }
  }
});

// Add all of the bodies to the world
Composite.add(engine.world, [puck, leftTopHalfWall, leftBottomHalfWall, rightTopHalfWall, rightBottomHalfWall, topWall, bottomWall, leftGoal, rightGoal]);

// Run the renderer
Render.run(render);

// Create runner
const runner = Runner.create();

// Run the engine
Runner.run(runner, engine);




// Multitouch event listeners/handlers
const evCacheSvg = new Array();

function pointerdown_handler(ev) {
  //console.log('point down', ev.offsetX, ev.offsetY)

  // lägg till en matter-body med contraint som rör sig med event positionen

  //let pusher = new Pusher(ev.offsetX, ev.offsetY);
  //svg.appendChild(pusher.svg);

  let pusher = Bodies.circle(ev.offsetX, ev.offsetY, 40, {restitution: 1});
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
  //console.log('move');
  // Note: if the user makes more than one "simultaneous" touch, most browsers 
  // fire at least one pointermove event and some will fire several pointermoves.
  //
  // This function sets the target element's border to "dashed" to visually
  // indicate the target received a move event.

  //console.log(ev.offsetX, ev.offsetY/*, ev.movementX, ev.movementY*/);
  for (let i = 0; i < evCacheSvg.length; i++) {
    if (evCacheSvg[i].event.pointerId == ev.pointerId) {
      //console.log(i, ev.offsetX, ev.offsetY, evCacheSvg[i].obj);
      Matter.Body.setPosition(evCacheSvg[i].obj, Vector.create(ev.offsetX, ev.offsetY));
      break;
    }
  }
}

function pointerup_handler(ev) {
  //console.log('point up')
  // Remove this touch point from the cache and reset the target's
  // background and border
  remove_event(ev);
}

function remove_event(ev) {
  //console.log('remove')
  // Remove this event from the target's cache
  for (let i = 0; i < evCacheSvg.length; i++) {
    if (evCacheSvg[i].event.pointerId == ev.pointerId) {
      //evCacheSvg[i].obj.svg.remove();
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
  //console.log(el)

  el.onpointerdown = pointerdown_handler;
  el.onpointermove = pointermove_handler;

  // Use same handler for pointer{up,cancel,out,leave} events since
  // the semantics for these events - in this app - are the same.
  el.onpointerup = pointerup_handler;
  el.onpointercancel = pointerup_handler;
  el.onpointerout = pointerup_handler;
  el.onpointerleave = pointerup_handler;
  
 //console.log('set handlers')
}

// Set multitouch eventhandlers
set_handlers();