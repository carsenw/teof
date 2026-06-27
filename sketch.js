// The Essence of Frequency
// Carsen Waters
// 2026

//Wait right before level start (after info goes away)? also so wait at level end before completion info

//////// Constants ////////

// Key codes
const KEYS = {
  left: 37,
  up: 38,
  right: 39,
  down: 40,
  a: 65,
  d: 68,
  s: 83,
  w: 87,
};

// Game states
const STATES = {
  none: "",
  title: "title",
  world: "world",
  level: "level",
};

// Shapes
const SHAPES = {
  "square": [
    {x: -1/2, y: -1/2},
    {x: 1/2, y: -1/2},
    {x: 1/2, y: 1/2},
    {x: -1/2, y: 1/2},
  ],
  "squareArch": [
    {x: -1/2, y: -1/2},
    {x: -1/6, y: -1/2},
    {x: -1/6, y: 1/6},
    {x: 1/6, y: 1/6},
    {x: 1/6, y: -1/2},
    {x: 1/2, y: -1/2},
    {x: 1/2, y: 1/2},
    {x: -1/2, y: 1/2},
  ],
  "squareBump": [
    {x: -1/2, y: -1/6},
    {x: -1/6, y: -1/6},
    {x: -1/6, y: -1/2},
    {x: 1/6, y: -1/2},
    {x: 1/6, y: -1/6},
    {x: 1/2, y: -1/6},
    {x: 1/2, y: 1/2},
    {x: -1/2, y: 1/2},
  ],
  "squareDivots": [
    {x: -1/2, y: -1/2},
    {x: -1/6, y: -1/2},
    {x: -1/6, y: -3/8},
    {x: 1/6, y: -3/8},
    {x: 1/6, y: -1/2},

    {x: 1/2, y: -1/2},
    {x: 1/2, y: -1/6},
    {x: 3/8, y: -1/6},
    {x: 3/8, y: 1/6},
    {x: 1/2, y: 1/6},

    {x: 1/2, y: 1/2},
    {x: 1/6, y: 1/2},
    {x: 1/6, y: 3/8},
    {x: -1/6, y: 3/8},
    {x: -1/6, y: 1/2},

    {x: -1/2, y: 1/2},
    {x: -1/2, y: 1/6},
    {x: -3/8, y: 1/6},
    {x: -3/8, y: -1/6},
    {x: -1/2, y: -1/6},
  ],
  "maneuversBoss": [
    {x: -1/2, y: -1/2},

    {x: -3/10, y: -3/10},
    {x: -3/10, y: -1/10},
    {x: -1/10, y: -1/10},
    {x: -1/10, y: -3/10},
    {x: -3/20, y: -3/10},
    {x: -3/20, y: -2/10},
    {x: -5/20, y: -2/10},
    {x: -5/20, y: -3/10},
    {x: -3/10, y: -3/10},

    {x: -1/2, y: -1/2},
    {x: 1/2, y: -1/2},

    {x: 3/10, y: -3/10},
    {x: 5/20, y: -3/10},
    {x: 5/20, y: -2/10},
    {x: 3/20, y: -2/10},
    {x: 3/20, y: -3/10},
    {x: 1/10, y: -3/10},
    {x: 1/10, y: -1/10},
    {x: 3/10, y: -1/10},
    {x: 3/10, y: -3/10},

    {x: 1/2, y: -1/2},
    {x: 1/2, y: 1/2},
    {x: -1/2, y: 1/2},
  ],
};

//////// Data variables for the game's levels and world ////////

let gameData;

let gameMusic = {};

let gameInfo = [];

let worldWalls = [];
let worldPortals = [];

let allLevels = [];

//////// Variables for playing the game ////////

// Game time, states, and objects
let gameTime;

let gameState;
let pendingState = STATES.none;
let pendingStateLevel = [];

let player;
let backdrop;

let view;
let transition;

// Holds the player's information for when the world state is switched (so they return to the same place when finished a level)
let worldPlayer;

// This object holds all the information for when a level is being played
let levelState = {};

// Size of the canvas
let screenSize;

// Regulates mouse clicking on things
let mouseCanClick;

//////// Setup and running functions ////////

function preload() {
  // Load game data
  gameData = loadJSON("gamedata.json", preloadMusic);
}

function preloadMusic() {
  // Load music after game data is loaded
  for (let level of gameData.levels.levelProperties) {
    let musicName = level.details.name;
    gameMusic[musicName] = loadSound("music/" + musicName + ".wav");
  }
}

function setup() {
  // Make the canvas square, and set modes for drawing
  screenSize = min(windowWidth, windowHeight);
  createCanvas(screenSize, screenSize);
  rectMode(CENTER);
  angleMode(DEGREES);
  colorMode(HSB);
  textAlign(CENTER, CENTER);

  // Ensure audio is ready to play for when its needed
  userStartAudio();

  // Pause the game if the page is hidden
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      gameTime.pausedPending = true;
      updateGameTime();
      updateMusic();
    }
  });

  // Set up game data

  // Level data
  for (let levelData of structuredClone(gameData.levels.levelProperties)) {
    // Set up the path of the capsule through the level
    let newCapsuleNodes = [];
    let previousNode = levelData.capsulePath[0];
    for (let node of levelData.capsulePath) {
      // For each node, set its properties based on the data object, or the previous node's properties if not specified
      let newNode = structuredClone(previousNode);
      for (let property of Object.keys(node)) {
        newNode[property] = node[property];
      }
      newCapsuleNodes.push(newNode);
      previousNode = newNode;
    }

    // Set up the attacks to avoid in the level
    let newLevelAttacks = [];
    for (let sequenceCall of levelData.attackProgram) {
      // Make the attacks based on the sequences and programs in the data file
      let sequenceAttacks = levelData.attackSequences[sequenceCall.sequence];
      let previousAttack = sequenceAttacks[0];
      for (let attack of sequenceAttacks) {
      // For each attack, set its properties based on the data object, or the previous attack's properties if not specified
        let newAttack = structuredClone(previousAttack);
        for (let property of Object.keys(attack)) {
          newAttack[property] = attack[property];
          if (sequenceCall[property] !== undefined) {
            if (typeof sequenceCall[property] === "number") {
              newAttack[property] += sequenceCall[property];
            } else {
              newAttack[property] = sequenceCall[property];
            }
          }
        }
        newLevelAttacks.push(newAttack);
        previousAttack = newAttack;
      }
    }
    
    // Add the level to the global array
    let newLevelDetails = levelData.details;
    newLevelDetails.music = gameMusic[newLevelDetails.name];
    newLevelDetails.nodes = newCapsuleNodes;
    newLevelDetails.attacks = newLevelAttacks;
    newLevelDetails.progress = false;
    allLevels.push(newLevelDetails);
  }

  // World data
  let worldData = structuredClone(gameData.world);

  for (let wallData of worldData.walls) {
    worldWalls.push(new Wall(wallData.isWorldBorder, wallData.color, wallData.corners));
  }

  for (let portalData of worldData.portals) {
    worldPortals.push(new Portal(allLevels[portalData.levelIndex], portalData.x, portalData.y));
  }

  gameTime = worldData.startGameTime;

  worldPlayer = worldData.startPlayer;

  transition = worldData.startTransition;
  view = worldData.startView;

  // Info data
  let defaultInfo = gameData.info[0];
  for (let infoData of structuredClone(gameData.info)) {
    // For each info item, set its properties based on the data object, or the first item (default properties) if not specified
    let newInfo = structuredClone(defaultInfo);
    for (let property of Object.keys(infoData)) {
      newInfo[property] = infoData[property];
    }
    gameInfo.push(new Info(newInfo));
  }
  
  setGameState(STATES.title);
}

function windowResized() {
  screenSize = min(windowWidth, windowHeight);
  resizeCanvas(screenSize, screenSize);
}

function draw() {
  updateGameTime();
  updateMusic();

  if (gameState === STATES.title) {
    if (!transition.active) {
      updateView();
      updateInfo();
    }
    
    drawView();
    drawBackground();
    drawInfo();
    
  } else if (gameState === STATES.world) {
    if (!transition.active) {
      if (!gameTime.paused) {
        movePlayer();
        checkPortals();
      }
      updateView();
      updateInfo();
    }
    
    drawView();
    drawBackground();
    drawWalls();
    drawPortals();
    drawPlayer();
    drawInfo();
    
  } else if (gameState === STATES.level) {
    if (!transition.active) {
      if (!gameTime.paused) {
        levelProgress();
        moveCapsule();
        moveObstacles();
        movePlayer();
      }
      updateView();
      updateInfo();
    }
    
    drawView();
    drawBackground();
    drawPaths();
    drawCapsule();
    drawObstacles();
    drawPlayer();
    drawInfo();
  }
  checkTransition();
  drawTransition();
}

function pendGameState(state, level = []) {
  if (!transition.active) {
    // Store the next game state so it can be set by the transition
    pendingState = state;
    pendingStateLevel = level;
    
    transition.active = true;
    transition.switchTime = millis() + transition.duration;
  }
}

function setGameState(state, level = []) {
  // Clean up the old game state
  gameTime.pausedPending = false;
  gameTime.rewindPending = false;
  updateGameTime();
  updateMusic();

  if (gameState === STATES.world) {
    if (player !== undefined) {
      player.nearestPortal = undefined;
      worldPlayer = structuredClone(player);
    }
  }

  // Change the game state and set up the new state
  gameState = state;
  
  if (state === STATES.title) {
    let worldData = structuredClone(gameData.world);

    backdrop = worldData.backdrop;
    view = worldData.startView;

    // Register first frame of title state
    updateView();
    updateInfo();
    
  } else if (state === STATES.world) {
    let worldData = structuredClone(gameData.world);

    player = worldPlayer;
    backdrop = worldData.backdrop;
    view = worldData.startView;

    // Set up and register first frame of world state
    checkPortals();
    updateView();
    updateInfo();
    
  } else if (state === STATES.level) {
    let levelsData = structuredClone(gameData.levels);
    
    player = levelsData.playerProperties;
    
    backdrop = {};
    
    levelState.capsule = levelsData.capsuleProperties;
    levelState.path = levelsData.pathProperties;

    levelState.levelObject = level;

    levelState.obstacles = [];
    for (let attackData of level.attacks) {
      let newObstacle = new Obstacle(attackData);
      newObstacle.findStartPosition();
      levelState.obstacles.push(newObstacle);
    }

    levelState.intro = levelsData.introProperties;
    
    // Set up and register the first frame of the level (start the level after the transition and level intro)
    levelState.startTime = gameTime.time + transition.duration + levelState.intro.duration;
    levelProgress();
    moveCapsule();
    moveObstacles();
    player.x = levelState.capsule.x;
    player.y = levelState.capsule.y;
    updateView();
    updateInfo();
  }
}

function beatsToMillis(beats) {
  // Calculates the number of milliseconds that the given number of beats in the current level take
  return beats * (60000 / levelState.levelObject.tempo);
}

//////// Draw loop functions used in all game states ////////

function updateGameTime() {
  // Handle pause toggling
  if (gameTime.paused !== gameTime.pausedPending) {
    gameTime.paused = gameTime.pausedPending;

    if (gameTime.paused) {
      gameTime.pauseStartTime = millis();
    } else {
      gameTime.timeOffset += millis() - gameTime.pauseStartTime;
    }
  }

  // Handle rewind toggling
  if (gameTime.rewindStartGameTime - gameTime.time >= gameTime.rewindTimeAmount || gameState === STATES.level && gameTime.time <= levelState.startTime) {
    gameTime.rewindPending = false;
  }
  if (gameTime.rewinding !== gameTime.rewindPending) {
    gameTime.rewinding = gameTime.rewindPending;

    if (gameTime.rewinding) {
      gameTime.rewindStartTime = millis();
      gameTime.rewindStartGameTime = gameTime.time;
    }
  }

  // Update the game time for the current frame
  if (!gameTime.paused) {
    if (gameTime.rewinding) {
      if (millis() - gameTime.rewindStartTime >= gameTime.rewindWaitDuration) {
        // Rewind time
        gameTime.timeOffset += (millis() - gameTime.timeOffset - gameTime.time) * (1 + gameTime.rewindSpeed);

      } else {
        // Hold time still
        gameTime.timeOffset += millis() - gameTime.timeOffset - gameTime.time;
      }
    }
    // Update game time
    gameTime.time = millis() - gameTime.timeOffset;
  }
}

function updateMusic() {
  if (gameState === STATES.level) {
    // Update the level music to play or stop
    let levelMusic = levelState.levelObject.music;

    if (gameTime.time >= levelState.startTime && gameTime.time < levelState.startTime + levelMusic.duration() * 1000 && !gameTime.paused && !(!gameTime.rewinding && levelMusic.rate() < 1) && getAudioContext().state === "running") {
      if (!levelMusic.isPlaying()) {
        // Play the sound file, account for the loading delay so everything stays synchronized
        let startMusicTime = millis();
        levelMusic.play(undefined, undefined, undefined, (gameTime.time - levelState.startTime) / 1000);
        gameTime.timeOffset += millis() - startMusicTime;
      }

    } else {
      if (levelMusic.isPlaying()) {
        levelMusic.stop();
      }
    }

    // Change the music speed and volume during rewinds
    if (gameTime.rewinding) {
      if (millis() - gameTime.rewindStartTime < gameTime.rewindWaitDuration) {
        levelMusic.setVolume((1 - constrain((millis() - gameTime.rewindStartTime) / gameTime.rewindWaitDuration, 0, 1)) / 2 + 0.5);
        levelMusic.rate(1 - constrain((millis() - gameTime.rewindStartTime) / gameTime.rewindWaitDuration, 0, 1));

      } else {
        levelMusic.setVolume(0.5);
        levelMusic.rate(-gameTime.rewindSpeed);
      }

    } else if (gameTime.rewindStartGameTime - gameTime.time >= gameTime.rewindTimeAmount - gameTime.rewindCooldownDuration) {
      levelMusic.setVolume(constrain((gameTime.time - (gameTime.rewindStartGameTime - gameTime.rewindTimeAmount)) / gameTime.rewindCooldownDuration, 0, 1) / 2 + 0.5);
      levelMusic.rate(1);

    } else {
      levelMusic.setVolume(1);
      levelMusic.rate(1);
    }

  } else {
    // Stop level music
    if (levelState.levelObject !== undefined && levelState.levelObject.music.isPlaying()) {
      levelState.levelObject.music.stop();
    }
  }
}

function movePlayer() {
  if (!gameTime.rewinding) {
    let inputRight = keyIsDown(KEYS.right) || keyIsDown(KEYS.d);
    let inputLeft = keyIsDown(KEYS.left) || keyIsDown(KEYS.a);
    let inputDown = keyIsDown(KEYS.down) || keyIsDown(KEYS.s);
    let inputUp = keyIsDown(KEYS.up) || keyIsDown(KEYS.w);
  
    // Only move if two or less directions are inputted
    if (inputRight + inputLeft + inputDown + inputUp <= 2) {
      // Convert input into movement direction
      let angle = inputRight * 360 * inputUp + inputLeft * 180 + inputDown * 90 + inputUp * 270;
      if (inputRight !== inputLeft && inputDown !== inputUp) {
        angle = angle / 2;
      }
      
      if (gameState === STATES.world) {
        // Move player and collide with world walls
        if (inputRight !== inputLeft || inputDown !== inputUp) {
          let collide = false;
          player.x += cos(angle) * player.speed;
          for (let wall of worldWalls) {
            if (wall.isCollidingPlayer()) {
              collide = true;
            }
          }
          if (collide) {
            player.x -= cos(angle) * player.speed;
          }
    
          collide = false;
          player.y += sin(angle) * player.speed;
          for (let wall of worldWalls) {
            if (wall.isCollidingPlayer()) {
              collide = true;
            }
          }
          if (collide) {
            player.y -= sin(angle) * player.speed;
          }
        }
      } else if (gameState === STATES.level) {
        // Move player
        if (inputRight !== inputLeft || inputDown !== inputUp) {
          player.x += cos(angle) * player.speed;
          player.y += sin(angle) * player.speed;
        }
        
        // Keep the player in the capsule
        let currentCapsule = levelState.capsule;
        
        player.x = constrain(player.x, currentCapsule.x - (currentCapsule.width/2 - player.size/2), currentCapsule.x + (currentCapsule.width/2 - player.size/2));
        player.y = constrain(player.y, currentCapsule.y - (currentCapsule.height/2 - player.size/2), currentCapsule.y + (currentCapsule.height/2 - player.size/2));
      }
    }

  } else {
    if (gameState === STATES.level && millis() - gameTime.rewindStartTime >= gameTime.rewindWaitDuration) {
      player.x = levelState.capsule.x;
      player.y = levelState.capsule.y;
    }
  }
}

function updateView() {
  // Update the view so that it is centered, on the player in world state or the capsule in game state
  if (gameState === STATES.title) {
    view.x = 0;
    view.y = 0;
    
  } else if (gameState === STATES.world) {
    view.x = player.x;
    view.y = player.y;

  } else if (gameState === STATES.level) {
    view.x = levelState.capsule.x;
    view.y = levelState.capsule.y;
  }
}

function updateInfo() {
  // Update the current on-screen info
  for (let info of gameInfo) {
    info.update();
  }
  
  mouseCanClick = !(mouseIsPressed && mouseButton === LEFT);
}

function drawView() {
  // Scale the scene so things take up the same space in the window regardless of how big it is
  scale(screenSize / view.size);
  
  // Translate the scene so that the current view is shown on the canvas
  translate(view.size/2 - view.x, view.size/2 - view.y);
}

function drawBackground() {
  // Center the drawing on the player (in world state) or the capsule (in game state)
  let focusX;
  let focusY;
  let colorFrontH;
  let colorBackH;
  
  if (gameState === STATES.title) {
    focusX = 0;
    focusY = 0;
    colorFrontH = backdrop.colorFront.h;
    colorBackH = backdrop.colorBack.h;
    
  } else if (gameState === STATES.world) {
    focusX = player.x;
    focusY = player.y;
    colorFrontH = backdrop.colorFront.h;
    colorBackH = backdrop.colorBack.h;
    
  } else if (gameState === STATES.level) {
    focusX = levelState.capsule.x;
    focusY = levelState.capsule.y;
    colorFrontH = levelState.levelObject.colorH;
    colorBackH = levelState.levelObject.colorH;
  }
  
  background(colorBackH, backdrop.colorBack.s, backdrop.colorBack.b);
  noStroke();
  fill(colorFrontH, backdrop.colorFront.s, backdrop.colorFront.b);
  
  let shapeSpacing = backdrop.spacing;
  
  // Draw a grid of shapes, filling just the background of the canvas
  for (let shapeX = -view.size/2 - shapeSpacing + view.size/2 % shapeSpacing + floor(focusX / shapeSpacing) * shapeSpacing; shapeX <= view.size/2 + shapeSpacing + ceil(focusX / shapeSpacing) * shapeSpacing; shapeX += shapeSpacing) {
    for (let shapeY = -view.size/2 - shapeSpacing + view.size/2 % shapeSpacing + floor(focusY / shapeSpacing) * shapeSpacing; shapeY <= view.size/2 + shapeSpacing + ceil(focusY / shapeSpacing) * shapeSpacing; shapeY += shapeSpacing) {
      push();
      translate(shapeX, shapeY);
      rotate(backdrop.angle);
      if (backdrop.shape === "circle") {
        circle(0, 0, backdrop.size);
      } else {
        scale(backdrop.size);
        beginShape();
        for (let corner of SHAPES[backdrop.shape]) {
          vertex(corner.x, corner.y);
        }
        endShape(CLOSE);
      }
      pop();
    }
  }
}

function drawPlayer() {
  // Prepare drawing properties for hit and respawn animations
  let colorA;
  let shapeSize;
  if (gameTime.rewinding) {
    let animationAmount = constrain((millis() - gameTime.rewindStartTime) / (gameTime.rewindWaitDuration / 10), 0, 1);

    colorA = 1 - animationAmount;
    shapeSize = player.size * (1 + animationAmount * 5);

  } else if (gameTime.rewindStartGameTime - gameTime.time >= gameTime.rewindTimeAmount - gameTime.rewindCooldownDuration) {
    let animationAmount = 1 - constrain((gameTime.time - (gameTime.rewindStartGameTime - gameTime.rewindTimeAmount)) / gameTime.rewindCooldownDuration, 0, 1);
    animationAmount = sqrt(animationAmount);
    
    colorA = (1 - animationAmount) / 4;
    shapeSize = player.size * (1 + animationAmount * 5);
    
    // Draw player shadow if respawning
    noStroke();
    fill(player.color.h, player.color.s, player.color.b / 2);
    square(player.x, player.y, player.size);

  } else {
    colorA = 1;
    shapeSize = player.size;
  }

  // Draw the player
  noStroke();
  fill(player.color.h, player.color.s, player.color.b, colorA);
  square(player.x, player.y, shapeSize);
}

function drawInfo() {
  // Draw the current on-screen info
  for (let info of gameInfo) {
    info.draw();
  }
}

function checkTransition() {
  // Check if it's time to change the game state or finish the transition
  if (pendingState !== STATES.none && millis() >= transition.switchTime) {
    setGameState(pendingState, pendingStateLevel);
    
    pendingState = STATES.none;
    pendingStateLevel = [];
  } else if (transition.active && millis() >= transition.switchTime + transition.duration) {
    transition.active = false;
  }
}

function drawTransition() {
  // Draw the transition as a fade to black based on how close the current time is to the switch time
  if (transition.active) {
    background(transition.color.h, transition.color.s, transition.color.b, 1 - abs(millis() - transition.switchTime) / transition.duration);
  }
}

//////// Draw loop funcitons used in the world game state ////////

function checkPortals() {
  // Update player's nearest portal
  let newNearestPortal;
  for (let portal of worldPortals) {
    if (newNearestPortal === undefined || dist(player.x, player.y, portal.x, portal.y) < dist(player.x, player.y, newNearestPortal.x, newNearestPortal.y)) {
      newNearestPortal = portal;
    }
  }
  player.nearestPortal = newNearestPortal;

  // Check all the portals for player collision
  for (let portal of worldPortals) {
    portal.checkPlayer();
  }
}

function drawWalls() {
  // Draw the world's walls
  for (let wall of worldWalls) {
    wall.draw();
  }
}

function drawPortals() {
  // Draw the world's portals
  for (let portal of worldPortals) {
    portal.draw();
  }
}

//////// Draw loop functions used in the level game state ////////

function levelProgress() {
  // Gets the current progress through the level and through the paths
  
  levelState.currentNodeIndex = 0;
  levelState.lastNodeTime = levelState.startTime;
  
  // Check the level's nodes in order
  for (let nodeIndex = 0; nodeIndex < levelState.levelObject.nodes.length; nodeIndex += 1) {
    
    if (gameTime.time - levelState.startTime >= beatsToMillis(levelState.levelObject.nodes[nodeIndex].timeBeat)) {
      // If the time before the capsule reaches the node has passed, set the capsule's current node as that one (but not if it's the last one)
      if (nodeIndex < levelState.levelObject.nodes.length - 1) {
        levelState.currentNodeIndex = nodeIndex;
        levelState.lastNodeTime = levelState.startTime + beatsToMillis(levelState.levelObject.nodes[nodeIndex].timeBeat);
        
      } else {
        // If the last node in the level has been passed, exit to the world state
        levelState.levelObject.progress = true;
        pendGameState(STATES.world, 0);
      }
      
    } else {
      // Exit the loop (with the current node still set as the previous node checked)
      break;
    }
  }
}

function moveCapsule() {
  // Move the capsule along the path by setting the position based on the current node and time
  let levelCapsule = levelState.capsule;
  
  let currentPath = levelState.levelObject.nodes[levelState.currentNodeIndex];
  let nextPath = levelState.levelObject.nodes[levelState.currentNodeIndex + 1];
  
  // Amount from the last node to the next one (0 to 1)
  let amountBetweenNodes = constrain((gameTime.time - levelState.lastNodeTime) / (beatsToMillis(nextPath.timeBeat) - beatsToMillis(currentPath.timeBeat)), 0, 1);
  
  // Set capsule, backdrop, and view properties to values between those of the last and next node
  levelCapsule.x = lerp(currentPath.x, nextPath.x, amountBetweenNodes);
  levelCapsule.y = lerp(currentPath.y, nextPath.y, amountBetweenNodes);
  levelCapsule.width = lerp(currentPath.capsuleW, nextPath.capsuleW, amountBetweenNodes);
  levelCapsule.height = lerp(currentPath.capsuleH, nextPath.capsuleH, amountBetweenNodes);
  
  backdrop.shape = currentPath.bdShape;
  backdrop.spacing = lerp(currentPath.bdSpacing, nextPath.bdSpacing, amountBetweenNodes);
  backdrop.size = lerp(currentPath.bdSize, nextPath.bdSize, amountBetweenNodes);
  backdrop.angle = lerp(currentPath.bdAngle, nextPath.bdAngle, amountBetweenNodes);
  
  let newcolorBack = {};
  let newcolorFront = {};
  
  newcolorBack.s = lerp(currentPath.bdColorBack.s, nextPath.bdColorBack.s, amountBetweenNodes);
  newcolorBack.b = lerp(currentPath.bdColorBack.b, nextPath.bdColorBack.b, amountBetweenNodes);
  
  newcolorFront.s = lerp(currentPath.bdColorFront.s, nextPath.bdColorFront.s, amountBetweenNodes);
  newcolorFront.b = lerp(currentPath.bdColorFront.b, nextPath.bdColorFront.b, amountBetweenNodes);
  
  backdrop.colorBack = newcolorBack;
  backdrop.colorFront = newcolorFront;

  view.size = lerp(currentPath.viewSize, nextPath.viewSize, amountBetweenNodes);
}

function moveObstacles() {
  // Move the obstacles
  for (let obstacle of levelState.obstacles) {
    obstacle.move();
  }
}

function drawPaths() {
  // Draw the path of the capsule for the current level
  stroke(levelState.path.color.h, levelState.path.color.s, levelState.path.color.b);
  strokeWeight(levelState.path.border);
  
  let levelLines = levelState.levelObject.nodes;
  
  for (let lineIndex = 0; lineIndex < levelLines.length - 1; lineIndex += 1) {
    let startNode = levelLines[lineIndex];
    let endNode = levelLines[lineIndex + 1];  
    
    line(startNode.x, startNode.y, endNode.x, endNode.y);
  }
}

function drawCapsule() {
  // Draws the capsule so that the border is entirely on the outside
  let currentCapsule = levelState.capsule;
  
  noFill();
  stroke(currentCapsule.color.h, currentCapsule.color.s, currentCapsule.color.b);
  strokeWeight(currentCapsule.border);
  rect(currentCapsule.x, currentCapsule.y, currentCapsule.width + currentCapsule.border, currentCapsule.height + currentCapsule.border);
}

function drawObstacles() {
  // Draw the obstacles
  for (let obstacle of levelState.obstacles) {
    obstacle.draw();
  }
}

//////// Classes ////////

class Info {
  constructor(data) {
    this.data = data;
  }

  update() {
    // Check if the info should be shown
    this.visible = gameState === STATES[this.data.showState];

    if (this.visible) {
      // Set drawing properties based on the data object and current game variables

      // Location focus
      if (this.data.focus === "view") {
        this.focusX = view.x;
        this.focusY = view.y;

      } else if (this.data.focus === "portal") {
        this.focusX = player.nearestPortal.x;
        this.focusY = player.nearestPortal.y;
      }

      // Position and size
      let changeAmount;
      if (this.data.changeVariable === "") {
        changeAmount = 0;

      } else if (this.data.changeVariable === "paused") {
        if (gameTime.paused) {
          changeAmount = 1;
        } else {
          changeAmount = 0;
        }

      } else if (this.data.changeVariable === "levelIntro") {
        changeAmount = constrain((gameTime.time - (levelState.startTime - levelState.intro.infoAnimateDuration)) / levelState.intro.infoAnimateDuration, 0, 1);

      } else if (this.data.changeVariable === "levelProgress") {
        changeAmount = constrain((gameTime.time - levelState.startTime) / beatsToMillis(levelState.levelObject.nodes[levelState.levelObject.nodes.length-1].timeBeat), 0, 1);

      } else if (this.data.changeVariable === "portalPlayerHover") {
        changeAmount = player.nearestPortal.playerHover;
      }

      this.x = lerp(this.data.x, this.data.x + this.data.xChange, changeAmount);
      this.y = lerp(this.data.y, this.data.y + this.data.yChange, changeAmount);
      this.width = lerp(this.data.width, this.data.width + this.data.widthChange, changeAmount);
      this.height = lerp(this.data.height, this.data.height + this.data.heightChange, changeAmount);

      // Check for interaction with the info
      let mouseHover = false;
      if (!transition.active && this.data.buttonAction !== "" && !(this.data.changeVariable === "portalPlayerHover" && player.nearestPortal.playerHover < 1) && !(this.data.changeVariable !== "paused" && gameTime.paused)) {
        let viewOffsetX = 0;
        let viewOffsetY = 0;
        if (this.data.focus !== "view") {
          viewOffsetX = view.x - this.focusX;
          viewOffsetY = view.y - this.focusY;
        }

        mouseHover = collidePointRect(mouseX / screenSize * view.size - view.size/2, mouseY / screenSize * view.size - view.size/2, (this.x - this.width/2) * view.size - viewOffsetX, (this.y - this.height/2) * view.size - viewOffsetY, this.width * view.size, this.height * view.size);
      }

      // Color
      if (mouseHover) {
        this.rectColor = this.data.hoverColor;
      } else {
        this.rectColor = this.data.rectColor;
      }

      if (this.rectColor.h === "portalColorH") {
        this.rectColor = color(player.nearestPortal.levelObject.colorH, this.rectColor.s, this.rectColor.b, this.rectColor.a);
      } else {
        this.rectColor = color(this.rectColor.h, this.rectColor.s, this.rectColor.b, this.rectColor.a);
      }

      // Text string
      if (this.data.textVariable === "") {
        this.textString = this.data.textString;

      } else {
        let textVariable;
        if (this.data.textVariable === "totalLevelsCompleted") {
          let completedCount = 0;
          for (let level of allLevels) {
            if (level.progress) {
              completedCount++;
            }
          }
          textVariable = completedCount;

        } else if (this.data.textVariable === "portalLevelName") {
          textVariable = player.nearestPortal.levelObject.name;

        } else if (this.data.textVariable === "portalLevelTempo") {
          textVariable = player.nearestPortal.levelObject.tempo;

        } else if (this.data.textVariable === "portalLevelKey") {
          textVariable = player.nearestPortal.levelObject.minorKey;

        } else if (this.data.textVariable === "portalLevelCompleted") {
          textVariable = player.nearestPortal.levelObject.progress;

        } else if (this.data.textVariable === "levelName") {
          textVariable = levelState.levelObject.name;

        } else if (this.data.textVariable === "levelTempo") {
          textVariable = levelState.levelObject.tempo;

        } else if (this.data.textVariable === "levelKey") {
          textVariable = levelState.levelObject.minorKey;
        }

        if (this.data.textString === "") {
          this.textString = textVariable;

        } else {
          let newString = "";
          for (let char of this.data.textString) {
            if (char === "#") {
              newString += textVariable;
            } else {
              newString += char;
            }
          }

          this.textString = newString;
        }
      }

      // Text size
      let textPadding = this.height * this.data.textPaddingScale;

      this.textSize = view.size * (this.height - textPadding);
      textSize(this.textSize);
      if (textWidth(this.textString) > view.size * (this.width - textPadding)) {
        this.textSize = this.textSize / textWidth(this.textString) * view.size * (this.width - textPadding);
      }

      // Text color
      this.textColor = this.data.textColor;
      if (this.textColor.h === "portalColorH") {
        this.textColor = color(player.nearestPortal.levelObject.colorH, this.textColor.s, this.textColor.b, this.textColor.a);
      } else {
        this.textColor = color(this.textColor.h, this.textColor.s, this.textColor.b, this.textColor.a);
      }

      // Carry out button actions
      if (mouseHover && mouseIsPressed && mouseButton === LEFT && mouseCanClick) {
        mouseCanClick = false;

        let action = this.data.buttonAction;

        if (action === "togglePause") {
          gameTime.pausedPending = !gameTime.paused;
        }

        if (action === "exitWorld") {
          pendGameState(STATES.title);
          
        } else if (action === "enterWorld" || action === "exitLevel") {
          pendGameState(STATES.world);

        } else if (action === "enterLevel") {
          pendGameState(STATES.level, player.nearestPortal.levelObject);
          
        } else if (action === "restartLevel") {
          pendGameState(STATES.level, levelState.levelObject);
        }
      }
    }
  }

  draw() {
    // Draw the info item
    if (this.visible) {
      let drawX = this.focusX + this.x * view.size;
      let drawY = this.focusY + this.y * view.size;

      noStroke();
      fill(this.rectColor);
      rect(drawX, drawY, this.width * view.size, this.height * view.size);

      if (this.textSize > 0) {
        textSize(this.textSize);
        fill(this.textColor);
        text(this.textString, drawX, drawY);
      }
    }
  }
}

class Wall {
  constructor(isWorldBorder, color, corners) {
    this.isWorldBorder = isWorldBorder,
    this.color = color;
    this.corners = corners;
  }
  
  draw() {
  // Draw the wall polygon, if it's the world border draw it as a hole
    fill(this.color.h, this.color.s, this.color.b);
    
    beginShape();
    if (this.isWorldBorder) {
      vertex(view.x - view.size/2, view.y - view.size/2);
      vertex(view.x - view.size/2, view.y + view.size/2);
      vertex(view.x + view.size/2, view.y + view.size/2);
      vertex(view.x + view.size/2, view.y - view.size/2);

      beginContour();
      for (let corner of this.corners) {
        vertex(corner.x, corner.y);
      }
      endContour();

    } else {
      for (let corner of this.corners) {
        vertex(corner.x, corner.y);
      }
    }
    endShape(CLOSE);
  }

  isCollidingPlayer() {
    // Check if the player is touching the wall
    return collideRectPoly(player.x - player.size/2, player.y - player.size/2, player.size, player.size, this.corners); 
  }
}

class Portal {
  constructor(levelObject, x, y) {
    this.x = x;
    this.y = y;
    this.size = 100;
    this.colorPrimary = {s: 50, b: 40};
    this.colorSecondary = {s: 50, b: 80};
    this.levelObject = levelObject;
    this.playerHover = 0;
    this.hoverSpeed = 0.1;
  }

  checkPlayer() {
    // Check if the player is touching the portal
    if (collideRectCircle(player.x - player.size/2, player.y - player.size/2, player.size, player.size, this.x, this.y, this.size)) {
      this.playerHover += this.hoverSpeed;
    } else {
      this.playerHover -= this.hoverSpeed;
    }
    this.playerHover = constrain(this.playerHover, 0, 1);
  }

  draw() {
    noStroke();

    // Draw the portal circles
    fill(this.levelObject.colorH, this.colorPrimary.s, this.colorPrimary.b);
    circle(this.x, this.y, this.size * (1 + this.playerHover / 2));

    fill(this.levelObject.colorH, this.colorSecondary.s, this.colorSecondary.b);
    circle(this.x, this.y, this.size * this.playerHover);
  }
}

class Obstacle {
  constructor(data) {
    this.data = data;
    this.visible = false;
    this.active = false;
  }

  findStartPosition() {
    if (this.data.withCapsule === "start") {
      // Find the capsule's position at the obstacle start time
      levelState.startTime = gameTime.time - beatsToMillis(this.data.startBeat);
      levelProgress();

      let currentPath = levelState.levelObject.nodes[levelState.currentNodeIndex];
      let nextPath = levelState.levelObject.nodes[levelState.currentNodeIndex + 1];
      let amountBetweenNodes = (beatsToMillis(this.data.startBeat) - (levelState.lastNodeTime - levelState.startTime)) / (beatsToMillis(nextPath.timeBeat) - beatsToMillis(currentPath.timeBeat));
    
      // Set the obstacle start position relative to the calculated capsule position
      this.startPosX = lerp(currentPath.x, nextPath.x, amountBetweenNodes) + this.data.xStart;
      this.startPosY = lerp(currentPath.y, nextPath.y, amountBetweenNodes) + this.data.yStart;
      
    } else {
      this.startPosX = this.data.xStart;
      this.startPosY = this.data.yStart;
    }
  }
  
  move() {
    // Check if it's time for the obstacle to exist in the level
    this.visible = gameTime.time - levelState.startTime >= beatsToMillis(this.data.startBeat - this.data.warnBeats) && gameTime.time - levelState.startTime <= beatsToMillis(this.data.startBeat + this.data.moveBeats + this.data.fadeBeats);
    this.active = gameTime.time - levelState.startTime >= beatsToMillis(this.data.startBeat) && gameTime.time - levelState.startTime <= beatsToMillis(this.data.startBeat + this.data.moveBeats);

    // Move the obstacle by setting the position based on its attack data
    if (this.visible) {
      // Amount from the attack start to end (0 to 1)
      let amountThroughMovement = (gameTime.time - levelState.startTime - beatsToMillis(this.data.startBeat)) / beatsToMillis(this.data.moveBeats);

      // Set obstacle properties to values based on the start and end properties
      let xFocus = 0;
      let yFocus = 0;
      if (this.data.withCapsule === "move") {
        xFocus = levelState.capsule.x;
        yFocus = levelState.capsule.y;
      }

      this.x = lerp(xFocus + this.startPosX, xFocus + this.startPosX + this.data.xMove, amountThroughMovement);
      this.y = lerp(yFocus + this.startPosY, yFocus + this.startPosY + this.data.yMove, amountThroughMovement);
      this.width = lerp(this.data.wStart, this.data.wStart + this.data.wMove, amountThroughMovement);
      this.height = lerp(this.data.hStart, this.data.hStart + this.data.hMove, amountThroughMovement);
      this.angle = lerp(this.data.angleStart, this.data.angleStart + this.data.angleMove, amountThroughMovement);
      this.offsetX = lerp(this.data.offsetXStart, this.data.offsetXStart + this.data.offsetXMove, amountThroughMovement);
      this.offsetAngle = lerp(this.data.offsetAngleStart, this.data.offsetAngleStart + this.data.offsetAngleMove, amountThroughMovement);
      
      if (this.active && !gameTime.rewinding && !(gameTime.rewindStartGameTime - gameTime.time >= gameTime.rewindTimeAmount - gameTime.rewindCooldownDuration)) {
        // Check for player collision with the obstacle
        let collision;
        if (this.data.shape === "circle") {
          collision = collideRectCircle(player.x - player.size/2, player.y - player.size/2, player.size, player.size, this.x + this.offsetX * cos(this.offsetAngle), this.y + this.offsetX * sin(this.offsetAngle), this.width);
        } else {
          let polygon = structuredClone(SHAPES[this.data.shape]);
          for (let corner of polygon) {
            let scaledX = corner.x * this.width;
            let scaledY = corner.y * this.height;
            
            let rotatedX = this.offsetX + (scaledX * cos(-this.angle) + scaledY * sin(-this.angle));
            let rotatedY = -scaledX * sin(-this.angle) + scaledY * cos(-this.angle);
  
            corner.x = this.x + (rotatedX * cos(-this.offsetAngle) + rotatedY * sin(-this.offsetAngle));
            corner.y = this.y + (-rotatedX * sin(-this.offsetAngle) + rotatedY * cos(-this.offsetAngle));
          }
          collision = collideRectPoly(player.x - player.size/2, player.y - player.size/2, player.size, player.size, polygon, true);
        }
        
        if (collision) {
          gameTime.rewindPending = true;
        }
      }
    }
  }

  draw() {
    if (this.visible) {
      noStroke();

      // Determine transparency based on obstacle start time
      let colorA;
      if (this.active) {
        colorA = 1;
      } else {
        if (gameTime.time - levelState.startTime < beatsToMillis(this.data.startBeat)) {
          colorA = lerp(0, 0.25, (gameTime.time - levelState.startTime - beatsToMillis(this.data.startBeat - this.data.warnBeats)) / beatsToMillis(this.data.warnBeats));
        } else {
          colorA = lerp(1, 0, (gameTime.time - levelState.startTime - beatsToMillis(this.data.startBeat + this.data.moveBeats)) / beatsToMillis(this.data.fadeBeats));
        }
      }
      fill(levelState.levelObject.colorH, this.data.color.s, this.data.color.b, colorA);
      
      // Draw the obstacle in its proper position and orientaton
      push();
      translate(this.x, this.y);
      rotate(this.offsetAngle);
      translate(this.offsetX, 0);
      rotate(this.angle);
      if (this.data.shape === "circle") {
        circle(0, 0, this.width);
      } else {
        scale(this.width, this.height);
        beginShape();
        for (let corner of SHAPES[this.data.shape]) {
          vertex(corner.x, corner.y);
        }
        endShape(CLOSE);
      }
      pop();
    }
  }
}