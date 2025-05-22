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

const fridgeImg = new Image();
fridgeImg.src = 'assets/fridge.png';

const bedImg = new Image();
bedImg.src = 'assets/bed.png';

const doorImg = new Image();
doorImg.src = 'assets/door.png';

const fridge = { x: 80, y: 140, width: 144, height: 270 };
const bed = { x: 750, y: 300, width: 220, height: 100 };
const door = { x: 500, y: 180, width: 144, height: 220 };

let petState = 'idle'; // idle, walk, grab, fall
let pet = { x: 425, y: 300, width: 100, height: 100, vy: 0 };
let isDragging = false;
let dragOffset = { x: 0, y: 0 };
let walkDirection = Math.random() < 0.5 ? -1 : 1; // -1 = left, 1 = right
let walkTimer = 0;
let walkDuration = Math.random() * 120 + 60; // frames

let hunger = 1; // out of 100
let energy = 1;
let fun = 1;

let gameOver = false;

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
    document.getElementById("dialogue").textContent = "Your feller decided to call a social worker and has now been relocated to a better home.";
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
    document.getElementById("dialogue").textContent = "";
  }
}


// lower stats every 5 seconds
const statInterval = setInterval(() => {
  hunger = Math.max(0, hunger - 0.4);
  energy = Math.max(0, energy - 0.2);
  fun = Math.max(0, fun - 0.6);

  updateStatBar('hunger', hunger);
  updateStatBar('energy', energy);
  updateStatBar('fun', fun);

  notifyNeed();
  checkGameOver();
}, 1000);

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
  }
});
canvas.addEventListener('mousemove', (e) => {
  if (isDragging) {
    const rect = canvas.getBoundingClientRect();
    pet.x = e.clientX - rect.left - dragOffset.x;
    pet.y = e.clientY - rect.top - dragOffset.y;
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
    if (pet.y >= 300) { // ground level (canvas height - pet height)
      pet.y = 300;
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
  ctx.fillStyle = '#f2acd6';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // floor color
  ctx.fillStyle = '#0D1821';
  ctx.fillRect(0, 390, canvas.width, 300);

  if (fridgeImg.complete) {
    ctx.drawImage(fridgeImg, fridge.x, fridge.y, fridge.width, fridge.height);
  }
  if (bedImg.complete) {
    ctx.drawImage(bedImg, bed.x, bed.y, bed.width, bed.height);
  }
  if (doorImg.complete) {
    ctx.drawImage(doorImg, door.x, door.y, door.width, door.height);
  }

  let petImg;
  if (petState === 'grab') petImg = petGrab;
  else if (petState === 'fall') petImg = petFall;
  else if (petState === 'walk') petImg = petWalk;
  else if (petState === 'eat') petImg = petEat;
  else petImg = petIdle;
  if (petImg.complete) {
    ctx.save();
    if (petState === 'walk' && walkDirection === 1) {
      ctx.translate(pet.x + pet.width, pet.y);
      ctx.scale(-1, 1);
      ctx.drawImage(petImg, 0, 0, pet.width, pet.height);
    } 
    else if (gameOver === true) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#f2acd6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0D1821';
      ctx.fillRect(0, 390, canvas.width, 300);
      ctx.drawImage(fridgeImg, fridge.x, fridge.y, fridge.width, fridge.height);
      ctx.drawImage(bedImg, bed.x, bed.y, bed.width, bed.height);
      ctx.drawImage(doorImg, door.x, door.y, door.width, door.height);
    }
    else {
      ctx.drawImage(petImg, pet.x, pet.y, pet.width, pet.height);
    }
    ctx.restore();
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();