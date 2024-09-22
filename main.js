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

// Limit puck max speed
const limitMaxSpeed = (event) => {
  event.source.world.bodies.forEach((body) => {
    let maxSpeed = 50
    Matter.Body.setVelocity(body, {
      x: Math.min(maxSpeed, Math.max(-maxSpeed, body.velocity.x)),
      y: Math.min(maxSpeed, Math.max(-maxSpeed, body.velocity.y)),
    })
  })
}
Matter.Events.on(engine, 'beforeUpdate', limitMaxSpeed)

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

  const arenaIsFlickering = isFlickering();
  if(!arenaIsFlickering) {
    const glowDecay = 150;
    const arenaColor = 'rgba(242, 255, 2, 0.051)';

    ctx.strokeStyle = 'rgba(242, 255, 2, 0.4)';
    ctx.lineWidth = 4;
    ctx.shadowColor = 'transparent';

    // Bounds
    const rect = new Path2D();
    rect.rect(0, 0, w, h);
    ctx.stroke(rect);

    const topGradient = ctx.createLinearGradient(0, 0, 0, glowDecay);
    topGradient.addColorStop(0, arenaColor);
    topGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = topGradient;
    ctx.fillRect(0, 0, w, glowDecay);
    const leftGradient = ctx.createLinearGradient(0, 0, glowDecay, 0);
    leftGradient.addColorStop(0, arenaColor);
    leftGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = leftGradient;
    ctx.fillRect(0, 0, glowDecay, h);
    const bottomGradient = ctx.createLinearGradient(0, h, 0, h - glowDecay);
    bottomGradient.addColorStop(0, arenaColor);
    bottomGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = bottomGradient;
    ctx.fillRect(0, h - glowDecay, w, h);
    const rightGradient = ctx.createLinearGradient(w - glowDecay, 0, w, 0);
    rightGradient.addColorStop(0, 'transparent');
    rightGradient.addColorStop(1, arenaColor);
    ctx.fillStyle = rightGradient;
    ctx.fillRect(w - glowDecay, 0, w, h);

    // Goals mask
    ctx.fillStyle = '#0f0f0f';
    ctx.fillRect(0, h / 3, w, h / 3);

    // Middle line
    const middleLine = new Path2D();
    middleLine.moveTo(w / 2, 0);
    middleLine.lineTo(w / 2, h);
    ctx.stroke(middleLine);
    const midLinGradient = ctx.createLinearGradient(w / 2 - glowDecay, 0, w / 2 + glowDecay, 0);
    midLinGradient.addColorStop(0, 'transparent');
    midLinGradient.addColorStop(.5, arenaColor);
    midLinGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = midLinGradient;
    ctx.fillRect(0, 0, w, h);

    // Middle circle
    const middleCircle = new Path2D();
    middleCircle.arc(w / 2, h / 2, h / 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#0f0f0f';
    ctx.fill(middleCircle);
    ctx.stroke(middleCircle);
    const midCircleGradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, h / 8 * 2);
    midCircleGradient.addColorStop(.1, 'transparent');
    midCircleGradient.addColorStop(.5 , arenaColor);
    midCircleGradient.addColorStop(.8, 'transparent');
    ctx.fillStyle = midCircleGradient;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 2 * h / 8, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
  }

  // Scores
  {
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
  }

  // Puck
  {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(puck.position.x, puck.position.y, puckRadius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.stroke();

    const puckGradient = ctx.createRadialGradient(puck.position.x, puck.position.y, 0, puck.position.x, puck.position.y, puckRadius * 1.5);
    puckGradient.addColorStop(0, 'rgba(255, 255, 255, .0)');
    puckGradient.addColorStop(.6, 'rgba(255, 255, 255, .1)');
    puckGradient.addColorStop(.7, 'rgba(255, 255, 255, .3)');
    puckGradient.addColorStop(.8, 'rgba(255, 255, 255, .1)');
    puckGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = puckGradient;
    ctx.beginPath();
    ctx.arc(puck.position.x, puck.position.y, puckRadius * 2, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
  }

  // Pushers
  for (let i = 0; i < evCacheSvg.length; i++) {

    const drawPusher = (r, g, b) => {
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, .6)`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(evCacheSvg[i].obj.position.x, evCacheSvg[i].obj.position.y, 80, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.stroke();

      const puckGradient = ctx.createRadialGradient(evCacheSvg[i].obj.position.x, evCacheSvg[i].obj.position.y, 0, evCacheSvg[i].obj.position.x, evCacheSvg[i].obj.position.y, 80 * 1.5);
      puckGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`);
      puckGradient.addColorStop(.6, `rgba(${r}, ${g}, ${b}, .1)`);
      puckGradient.addColorStop(.7, `rgba(${r}, ${g}, ${b}, .3)`);
      puckGradient.addColorStop(.8, `rgba(${r}, ${g}, ${b}, .1)`);
      puckGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      ctx.fillStyle = puckGradient;
      ctx.beginPath();
      ctx.arc(evCacheSvg[i].obj.position.x, evCacheSvg[i].obj.position.y, 80 * 1.5, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.fill();
    }

    if(evCacheSvg[i].obj.position.x < w / 2) {
      drawPusher(1, 206, 194);
    } else {
      drawPusher(252, 63, 121);
    }
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