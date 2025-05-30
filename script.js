const petIdle = new Image();
petIdle.src = 'assets/idle.gif';

const petWalk = new Image();
petWalk.src = 'assets/walking.gif';

const petGrab = new Image();
petGrab.src = 'assets/grabbed.gif';

const petFall = new Image();
petFall.src = 'assets/grabbed.gif';

const petEat = new Image();
petEat.src = 'assets/chewing.gif';

const petSleep = new Image();
petSleep.src = 'assets/idle.gif';

const fridgeImg = new Image();
fridgeImg.src = 'assets/fridge.png';

const bedImg = new Image();
bedImg.src = 'assets/bed.png';

const doorImg = new Image();
doorImg.src = 'assets/door.png';

const fridge = { x: 0, y: 130, width: 140, height: 280 };
const bed = { x: 800, y: 300, width: 220, height: 100 };
const door = { x: 445, y: 180, width: 144, height: 220 };

let petState = 'idle'; // idle, walk, grab, fall
let pet = { x: 425, y: 305, width: 100, height: 100, vy: 0 };
let isDragging = false;
let dragOffset = { x: 0, y: 0 };
let walkDirection = Math.random() < 0.5 ? -1 : 1; // -1 = left, 1 = right
let walkTimer = 0;
let walkDuration = Math.random() * 120 + 60; // frames

let hunger = 50; // out of 100
let energy = 50;
let fun = 50;
let cooldown = false;

let outside = false

let gameOver = false;

let floorColor = '#0D1821';
let wallColor = '#f2acd6';

function updateStatBar(stat, value) {
  document.getElementById(stat + '-bar').style.width = value + '%';
}

updateStatBar('hunger', hunger);
updateStatBar('energy', energy);
updateStatBar('fun', fun);

function showOverlay() {
  const canvas = document.getElementById('pet-canvas');
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(20,0,0,0.8)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// checks if all stats are 0
function checkGameOver() {
  if (hunger <= 0 && energy <= 0 && fun <= 0) {
    gameOver = true;
    clearInterval(statInterval); // Stop the periodic lowering
    showOverlay();
    document.getElementById("dialogue").textContent = "Your Feller decided to call a social worker and has now been relocated to a better home.";
  }
}

// display messages when stat falls below 25
function notifyNeed() {
  if (hunger < 25 && energy < 25 && fun < 25) {
    document.getElementById("dialogue").textContent = "Your Feller is feeling neglected.";
  }
  else if (hunger < 25) {
    document.getElementById("dialogue").textContent = "Your Feller is hungry.";
  }
  else if (energy < 25) {
    document.getElementById("dialogue").textContent = "Your Feller is tired.";
  }
  else if (fun < 25) {
    document.getElementById("dialogue").textContent = "Your Feller is bored.";
  }
  else {
    return;
  }
}


// lower stats every second
const statInterval = setInterval(() => {
  hunger = Math.max(0, hunger - 0.3);
  energy = Math.max(0, energy - 0.2);
  fun = Math.max(0, fun - 0.4);

  updateStatBar('hunger', hunger);
  updateStatBar('energy', energy);
  updateStatBar('fun', fun);

  notifyNeed();
  checkGameOver();
}, 1000);


// dragging pet
const canvas = document.getElementById('pet-canvas');
canvas.addEventListener('mousedown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  // Check if clicked on pet
  if (mx >= pet.x && mx <= pet.x + pet.width && my >= pet.y && my <= pet.y + pet.height) {
    isDragging = true;
    dragOffset.x = mx - pet.x;
    dragOffset.y = my - pet.y;
    petState = 'grab';
    fun = Math.min(100, fun + 2);
    updateStatBar('fun', fun);
  }
});
canvas.addEventListener('mousemove', (e) => {
  if (isDragging) {
    const rect = canvas.getBoundingClientRect();
    pet.x = e.clientX - rect.left - dragOffset.x;
    pet.y = e.clientY - rect.top - dragOffset.y;
  }
});
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;


  if (!gameOver) {
    // Check if clicked on bed
    if (mx >= bed.x && mx <= bed.x + bed.width && my >= bed.y && my <= bed.y + bed.height && outside === false) {
      if (!cooldown) {
        energy = Math.min(100, energy + 20);
        updateStatBar('energy', energy);
        petState = "sleeping";
        pet.x = bed.x + 40;
        pet.y = bed.y - 45;
        setTimeout(() => {
          petState = 'idle';
        }, 5000);
        document.getElementById("dialogue").textContent = "Your Feller has taken a nap.";
      }
    }

    // Check if clicked on fridge
    if (mx >= fridge.x && mx <= fridge.x + fridge.width && my >= fridge.y && my <= fridge.y + fridge.height && outside === false) {
      hunger = Math.min(100, hunger + 30);
      fun = Math.min(100, fun + 5);
      pet.x = fridge.x + 40;
      pet.y = 305;
      petState = 'eat';
      updateStatBar('hunger', hunger);
      updateStatBar('fun', fun);
      setTimeout(() => {
        petState = 'idle';
      }, 3000);
      document.getElementById("dialogue").textContent = "Your Feller has eaten.";
    }

    // Check if clicked on door
    if (mx >= door.x && mx <= door.x + door.width && my >= door.y && my <= door.y + door.height) {
      if (!outside) {
        outside = true;
        pet.x = 425; // reset pet position
        pet.y = 305;
        petState = 'idle';
        document.getElementById("dialogue").textContent = "Your Feller has gone outside.";
      } else {
        outside = false;
        pet.x = 425; // reset pet position
        pet.y = 305;
        petState = 'idle';
        document.getElementById("dialogue").textContent = "Your Feller has come back inside.";
      }
    }
  }
});
window.addEventListener('mouseup', () => {
  if (isDragging) {
    isDragging = false;
    petState = 'fall';
    pet.vy = 2;
  }
});

function update() {
  // Handle falling
  if (petState === 'fall') {
    pet.vy += 0.5; // gravity
    pet.y += pet.vy;
    if (pet.y >= 305) { // ground level (canvas height - pet height)
      pet.y = 305;
      pet.vy = 0;
      petState = 'idle';
    }
    return; // Don't walk while falling
  }

  // -- Automatic random walk logic --
  if (petState === 'idle' || petState === 'walk') {
    walkTimer++;
    if (walkTimer > walkDuration) {
      // Randomly decide to walk or idle
      if (petState === 'idle' && Math.random() < 0.5) {
        petState = 'walk';
        walkDirection = Math.random() < 0.5 ? -1 : 1;
      } else {
        petState = 'idle';
      }
      walkDuration = Math.random() * 120 + 60; // randomize next duration
      walkTimer = 0;
    }
  }

  if (petState === 'walk') {
    pet.x += 2 * walkDirection;
    pet.y = 305; // keep pet on the ground
    // Bounce off edges
    if (pet.x < 0) {
      pet.x = 0;
      walkDirection = 1;
    } else if (pet.x + pet.width > canvas.width) {
      pet.x = canvas.width - pet.width;
      walkDirection = -1;
    }
  }
}

function draw() {
  const ctx = canvas.getContext('2d');

  // wall color
  ctx.fillStyle = wallColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // floor color
  ctx.fillStyle = floorColor;
  ctx.fillRect(0, 390, canvas.width, 300);


  // furniture
  if (fridgeImg.complete) {
    ctx.drawImage(fridgeImg, fridge.x, fridge.y, fridge.width, fridge.height);
  }
  if (bedImg.complete) {
    ctx.drawImage(bedImg, bed.x, bed.y, bed.width, bed.height);
  }
  if (doorImg.complete) {
    ctx.drawImage(doorImg, door.x, door.y, door.width, door.height);
  }
  // draw pet
  let petImg;
  if (petState === 'grab') petImg = petGrab;
  else if (petState === 'fall') petImg = petFall;
  else if (petState === 'walk') petImg = petWalk;
  else if (petState === 'eat') petImg = petEat;
  else if (petState === 'sleeping') petImg = petSleep;
  else petImg = petIdle;
  if (petImg.complete) {
    ctx.save();
    if (petState === 'walk' && outside === true && walkDirection === 1) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#87CEEB'; // sky color
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#228B22'; // grass color
      ctx.fillRect(0, 390, canvas.width, 300);
      ctx.drawImage(doorImg, door.x, door.y, door.width, door.height);
      ctx.translate(pet.x + pet.width, pet.y);
      ctx.scale(-1, 1);
      ctx.drawImage(petImg, pet.x, pet.y, pet.width, pet.height);
    }
    else if (petState === 'walk' && outside === true) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#87CEEB'; // sky color
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#228B22'; // grass color
      ctx.fillRect(0, 390, canvas.width, 300);
      ctx.drawImage(doorImg, door.x, door.y, door.width, door.height);
      ctx.drawImage(petImg, pet.x, pet.y, pet.width, pet.height);
    }
    else if (petState === 'idle' && outside === true && walkDirection === 1) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#87CEEB'; // sky color
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#228B22'; // grass color
      ctx.fillRect(0, 390, canvas.width, 300);
      ctx.drawImage(doorImg, door.x, door.y, door.width, door.height);
      ctx.translate(pet.x + pet.width, pet.y);
      ctx.scale(-1, 1);
      ctx.drawImage(petImg, pet.x, pet.y, pet.width, pet.height);
    }
    else if (petState === 'walk' && walkDirection === 1 && gameOver === false) {
      ctx.translate(pet.x + pet.width, pet.y);
      ctx.scale(-1, 1);
      ctx.drawImage(petImg, 0, 0, pet.width, pet.height);
    }
    else if (petState === 'idle' && walkDirection === 1 && gameOver === false) {
      ctx.translate(pet.x + pet.width, pet.y);
      ctx.scale(-1, 1);
      ctx.drawImage(petImg, 0, 0, pet.width, pet.height);
    }
    else if (gameOver === false) {
      ctx.drawImage(petImg, pet.x, pet.y, pet.width, pet.height);
    }
    else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = wallColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = floorColor;
      ctx.fillRect(0, 390, canvas.width, 300);
      ctx.drawImage(fridgeImg, fridge.x, fridge.y, fridge.width, fridge.height);
      ctx.drawImage(bedImg, bed.x, bed.y, bed.width, bed.height);
      ctx.drawImage(doorImg, door.x, door.y, door.width, door.height);
      ctx.fillStyle = 'rgba(0,0,0,0.7)'; // dark overlay
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.restore();
  }
}

// Event listeners for color pickers
document.getElementById('floorColorPicker').addEventListener('input', function (e) {
  floorColor = e.target.value;
  draw();
});

document.getElementById('wallColorPicker').addEventListener('input', function (e) {
  wallColor = e.target.value;
  draw();
});


function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();