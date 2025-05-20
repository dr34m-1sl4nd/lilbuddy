const petIdle = new Image();
petIdle.src = 'assets/idle.gif';

const petWalk = new Image();
petWalk.src = 'assets/walking.gif';

const petGrab = new Image();
petGrab.src = 'assets/grabbed.gif';

const petFall = new Image();
petFall.src = 'assets/grabbed.gif';

let petState = 'idle'; // idle, walk, grab, fall
let pet = { x: 400, y: 300, width: 100, height: 100, vy: 0 };
let isDragging = false;
let dragOffset = { x: 0, y: 0 };

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
    
    if (petState === 'fall') {
      pet.vy += 0.5; // gravity
      pet.y += pet.vy;
      if (pet.y >= 300) { // ground level (canvas height - pet height)
        pet.y = 300;
        pet.vy = 0;
        petState = 'idle';
      }
    }
  }

  
  function draw() {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#b87fe3';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    let petImg;
    if (petState === 'grab') petImg = petGrab;
    else if (petState === 'fall') petImg = petFall;
    else if (petState === 'walk') petImg = petWalk;
    else petImg = petIdle;
    if (petImg.complete) ctx.drawImage(petImg, pet.x, pet.y, pet.width, pet.height);
  }
  
  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }
  loop();