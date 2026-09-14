/* =========================================================
   CONFIG — chỉ thay nội dung trong object này cho mỗi món quà
   ========================================================= */
const GIFT_CONFIG = {
  music: "assets/music.mp3",
  birthdayTitle: "Happy Birthday",
  birthdayName: "Yến Linh",
  photos: [
    "assets/photos/photo-01.jpg", "assets/photos/photo-02.jpg",
    "assets/photos/photo-03.jpg", "assets/photos/photo-04.jpg",
    "assets/photos/photo-05.jpg", "assets/photos/photo-06.jpg",
    "assets/photos/photo-07.jpg", "assets/photos/photo-08.jpg"
  ],
  // Tọa độ đã được tính sẵn để bóng bay không chồng lên nhau, chừa khoảng trung tâm cho phong bì/lá thư.
  balloonSlots: [
    { left: 4, top: 4, driftX: -1 }, { left: 24, top: 2, driftX: 0 },
    { left: 44, top: 5, driftX: 1 }, { left: 64, top: 2, driftX: 0 },
    { left: 84, top: 4, driftX: -1 }
  ],
  // Dàn bóng bay dày hơn ở màn mở đầu, được so le theo chiều dọc để không chồng lên nhau.
  introBalloonSlots: [
    { left: 4, top: 9, driftX: 1 }, { left: 25, top: 51, driftX: -1 },
    { left: 46, top: 7, driftX: 1 }, { left: 68, top: 64, driftX: -1 },
    { left: 82, top: 27, driftX: 1 }, { left: 7, top: 77, driftX: -1 },
    { left: 35, top: 82, driftX: 1 }, { left: 59, top: 38, driftX: -1 }
  ],
  flowers: Array.from({ length: 25 }, (_, i) => `assets/flowers/flower-${i + 1}.png`),
  message: `Chúc mừng sinh nhật Énn nhé. Thêm một tuổi mới, chúc Énn luôn tìm thấy bình yên trong những điều nhỏ nhất, ít muộn phiền và mỗi ngày đều có thật nhiều niềm vui. Mong tuổi mới sẽ thật dịu dàng với Énn nà....`,
  signature: ""
};

const $ = (selector) => document.querySelector(selector);
const scene = $(".scene");
const giftBox = $(".gift-box");
const giftOpenControl = $(".gift-open-control");
const flowerOverlay = $(".flower-overlay");
const photosLayer = $(".photos-layer");
const envelope = $(".envelope");
const noteCard = $(".note-card");
const noteContent = $(".note-content");
const noteSignature = $(".note-signature");
const music = $("#bg-music");
const soundToggle = $(".sound-toggle");
const statusMessage = $(".status-message");
const birthdayTitle = $(".birthday-title");

noteContent.textContent = GIFT_CONFIG.message;
noteSignature.textContent = GIFT_CONFIG.signature;
music.src = GIFT_CONFIG.music;
music.autoplay = true;
birthdayTitle.querySelector("span").textContent = GIFT_CONFIG.birthdayTitle;
birthdayTitle.querySelector("strong").textContent = GIFT_CONFIG.birthdayName;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const random = (min, max) => Math.random() * (max - min) + min;
const pick = (items) => items[Math.floor(Math.random() * items.length)];

function setStatus(message) {
  statusMessage.textContent = message;
  statusMessage.classList.toggle("visible", Boolean(message));
  if (message) setTimeout(() => statusMessage.classList.remove("visible"), 2600);
}

async function playMusic() {
  try {
    await music.play();
    soundToggle.setAttribute("aria-pressed", "true");
    soundToggle.classList.remove("muted");
    soundToggle.setAttribute("aria-label", "Tắt nhạc nền");
  } catch {
    soundToggle.classList.add("muted");
    setStatus("Chạm màn hình để bật nhạc nền.");
  }
}

soundToggle.addEventListener("click", async () => {
  if (music.paused) await playMusic();
  else {
    music.pause();
    soundToggle.setAttribute("aria-pressed", "false");
    soundToggle.classList.add("muted");
    soundToggle.setAttribute("aria-label", "Bật nhạc nền");
  }
});

// Trình duyệt nào cho phép autoplay sẽ phát ngay; các trình duyệt chặn tiếng
// sẽ được mở lại ở thao tác chạm đầu tiên bên dưới.
playMusic();
document.addEventListener("pointerdown", () => {
  if (music.paused) playMusic();
}, { once: true, passive: true });

function makeFlowerWipe() {
  flowerOverlay.replaceChildren();
  // Wipe thứ hai dùng thảm hoa thưa hơn để tránh hàng trăm PNG chồng lên GPU điện thoại.
  const cols = 12;
  const rows = 14;
  for (let row = -1; row < rows; row += 1) {
    for (let col = -1; col < cols + 1; col += 1) {
      const flower = document.createElement("img");
      flower.className = "wipe-flower";
      flower.src = pick(GIFT_CONFIG.flowers);
      flower.alt = "";
      flower.style.setProperty("--size", `${random(78, 128)}px`);
      flower.style.setProperty("--x", `${col * 9.1 + random(-3.5, 2.5)}vw`);
      flower.style.setProperty("--y", `${row * 8.5 + random(-3, 2)}vh`);
      flower.style.setProperty("--rot", `${random(-38, 38)}deg`);
      flower.style.setProperty("--drift", `${random(-8, 8)}vw`);
      flower.style.setProperty("--duration", `${random(390, 560)}ms`);
      flower.style.setProperty("--fall-duration", `${random(1600, 2300)}ms`);
      flower.style.setProperty("--fall-delay", `${random(0, 480)}ms`);
      flower.style.zIndex = String(Math.floor(random(1, 9)));
      flowerOverlay.append(flower);
    }
  }
}

async function flowerWipe() {
  makeFlowerWipe();
  flowerOverlay.className = "flower-overlay active";
  requestAnimationFrame(() => flowerOverlay.classList.add("cover"));
  await sleep(620);       // nở/phủ kín viewport
  await sleep(360);       // giữ một nhịp chuyển cảnh
  flowerOverlay.classList.add("exit");
  await sleep(3000);     // giữ nhịp rơi mượt mà không kéo dài chuyển cảnh
  flowerOverlay.className = "flower-overlay";
}

// Hoa nổ bung từ hộp, phủ khung hình, rồi cùng rơi xuống theo một quỹ đạo có trọng lực.
async function flowerFirework() {
  const flowers = [];
  const cols = 16;
  const rows = 19;
  const total = cols * rows;
  for (let index = 0; index < total; index += 1) {
    const flower = document.createElement("img");
    const col = index % cols;
    const row = Math.floor(index / cols);
    const bloomX = (col / (cols - 1)) * 100 - 50 + random(-5, 5);
    const bloomY = (row / (rows - 1)) * 100 - 66 + random(-4, 4);
    flower.className = "firework-flower";
    flower.src = pick(GIFT_CONFIG.flowers);
    flower.alt = "";
    flower.style.setProperty("--size", `${random(72, 145)}px`);
    flower.style.setProperty("--start-x", "50%");
    flower.style.setProperty("--start-y", "66%");
    flower.style.setProperty("--burst-x", `${bloomX}vw`);
    flower.style.setProperty("--burst-y", `${bloomY}vh`);
    flower.style.setProperty("--rain-x", `${bloomX + random(-8, 8)}vw`);
    flower.style.setProperty("--rain-y", `${random(70, 118)}vh`);
    flower.style.setProperty("--rot", `${random(-60, 60)}deg`);
    flower.style.setProperty("--rain-duration", `${random(900, 1300)}ms`);
    flower.style.setProperty("--rain-delay", `${random(0, 220)}ms`);
    flower.style.zIndex = String(Math.floor(random(9, 17)));
    flowers.push(flower);
  }
  flowerOverlay.className = "flower-overlay active";
  flowerOverlay.replaceChildren(...flowers);
  burst(window.innerWidth * .5, window.innerHeight * .68, 68, true);
  await sleep(1550); // thảm hoa đã phủ kín viewport
  flowers.forEach((flower) => flower.classList.add("rain"));
  await sleep(1800); // hoa nổ/rơi nhanh để vào cảnh phong bì sớm
  birthdayTitle.classList.add("show");
  flowerOverlay.className = "flower-overlay";
}

function clickFlowerBurst(x, y, count = 28) {
  const fragments = [];
  for (let index = 0; index < count; index += 1) {
    const flower = document.createElement("img");
    const angle = random(0, Math.PI * 2);
    const distance = random(6, 24);
    flower.className = "click-flower";
    flower.src = pick(GIFT_CONFIG.flowers);
    flower.alt = "";
    flower.style.setProperty("--size", `${random(24, 60)}px`);
    flower.style.setProperty("--start-x", `${x}px`);
    flower.style.setProperty("--start-y", `${y}px`);
    flower.style.setProperty("--burst-x", `${Math.cos(angle) * distance}vw`);
    flower.style.setProperty("--burst-y", `${Math.sin(angle) * distance * 1.05}vh`);
    flower.style.setProperty("--land-x", `${Math.cos(angle) * random(9, 28)}vw`);
    flower.style.setProperty("--land-y", `${random(26, 52)}vh`);
    flower.style.setProperty("--rot", `${random(-45, 45)}deg`);
    flower.style.setProperty("--flower-duration", `${random(1450, 2050)}ms`);
    fragments.push(flower);
  }
  flowerOverlay.className = "flower-overlay active";
  flowerOverlay.append(...fragments);
  setTimeout(() => { if (!flowerOverlay.querySelector(".firework-flower")) flowerOverlay.className = "flower-overlay"; }, 1500);
}

const palette = ["#ff7baa", "#b797f4", "#67d8ce", "#ffd363", "#ef717e", "#89b9ff", "#ec96d8", "#ff9b6b"];

function createPhotoBalloon(source, index, slots = GIFT_CONFIG.balloonSlots) {
  const photo = document.createElement("article");
  photo.className = "memory";
  const slot = slots[index % slots.length];
  const targetX = slot.left;
  const targetY = slot.top;
  photo.style.left = `${targetX}%`;
  photo.style.top = `${targetY}%`;
  photo.style.setProperty("--ring", palette[index % palette.length]);
  photo.style.setProperty("--origin-x", "0vw");
  photo.style.setProperty("--origin-y", `${104 - targetY}vh`);
  photo.style.setProperty("--flight-x", "0vw");
  photo.style.setProperty("--flight-y", "-8vh");
  photo.style.setProperty("--start-rot", `${random(-40, 40)}deg`);
  photo.style.setProperty("--flight-rot", `${random(-18, 18)}deg`);
  photo.style.setProperty("--end-rot", `${random(-8, 8)}deg`);
  photo.style.setProperty("--string-angle", `${random(-10, 10)}deg`);
  photo.style.setProperty("--launch-duration", `${random(2800, 3600)}ms`);
  photo.style.setProperty("--float-duration", `${random(2200, 3900)}ms`);
  photo.style.setProperty("--float-delay", `${random(0, 900)}ms`);
  const skyDuration = random(22000, 28000);
  photo.style.setProperty("--sky-start-y", `${104 - targetY}vh`);
  photo.style.setProperty("--sky-end-y", `${-targetY - 26}vh`);
  photo.style.setProperty("--sky-end-x", `${slot.driftX}vw`);
  photo.style.setProperty("--sky-duration", `${skyDuration}ms`);
  photo.style.setProperty("--sky-delay", `${-random(0, skyDuration)}ms`);
  photo.style.setProperty("--sway-duration", `${random(1800, 3200)}ms`);
  const image = new Image();
  image.alt = `Kỷ niệm ${index + 1}`;
  image.src = source;
  image.addEventListener("error", () => {
    image.replaceWith(Object.assign(document.createElement("div"), { className: "photo-fallback", textContent: "♡" }));
  }, { once: true });
  const balloon = document.createElement("div");
  balloon.className = "balloon-shape";
  balloon.append(image);
  photo.append(balloon);
  return photo;
}

async function launchPhotos() {
  // Loại bỏ dàn bóng bay của màn chờ trước khi ảnh kỷ niệm bay ra từ hộp.
  photosLayer.replaceChildren();
  GIFT_CONFIG.photos.slice(0, GIFT_CONFIG.balloonSlots.length).forEach((source, index) => {
    const photo = createPhotoBalloon(source, index);
    photosLayer.append(photo);
    setTimeout(() => photo.classList.add("launch"), index * 110);
  });
  burst(window.innerWidth * .5, window.innerHeight * .72, 86);
  await sleep(4300);
  // Từ cảnh phong bì trở đi, bóng bay tiếp tục trôi chậm lên trên thay vì đứng yên.
  scene.classList.add("balloons-rising");
}

// Canvas particle fireworks: chỉ vẽ một lần mỗi burst, không tạo DOM particle.
const canvas = $("#fireworks");
const ctx = canvas.getContext("2d");
let particles = [];
function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * dpr; canvas.height = window.innerHeight * dpr;
  canvas.style.width = `${window.innerWidth}px`; canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
function burst(x, y, amount = 50, fullCircle = false) {
  const colors = ["#fff2a8", "#ff87ba", "#a980ff", "#78e5e0", "#ffb16d"];
  for (let i = 0; i < amount; i += 1) {
    const angle = fullCircle ? random(0, Math.PI * 2) : random(-Math.PI * .94, -Math.PI * .06);
    const velocity = random(2.2, 7.1);
    particles.push({ x, y, vx: Math.cos(angle) * velocity, vy: Math.sin(angle) * velocity, life: random(38, 76), max: 76, color: pick(colors), size: random(1.5, 3.7) });
  }
}
function drawParticles() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  particles = particles.filter((p) => p.life > 0);
  particles.forEach((p) => {
    p.x += p.vx; p.y += p.vy; p.vy += .09; p.vx *= .986; p.life -= 1;
    ctx.globalAlpha = Math.max(0, p.life / p.max);
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
  });
  ctx.globalAlpha = 1;
  requestAnimationFrame(drawParticles);
}
resizeCanvas(); drawParticles(); window.addEventListener("resize", resizeCanvas, { passive: true });

// Màn chờ sống động: bóng bay mờ bay qua từng làn và pháo hoa nhỏ nổ rải đều.
// Cả hai được ngưng ngay khoảnh khắc hộp mở thật để không lẫn với hiệu ứng chính.
let introFireworksRunning = true;
let introFireworksTimer;
function createIntroBalloons() {
  GIFT_CONFIG.photos.slice(0, GIFT_CONFIG.introBalloonSlots.length).forEach((source, index) => {
    const balloon = createPhotoBalloon(source, index, GIFT_CONFIG.introBalloonSlots);
    balloon.classList.add("intro-balloon");
    photosLayer.append(balloon);
  });
}
function runIntroFireworks() {
  if (!introFireworksRunning) return;
  burst(
    random(window.innerWidth * .08, window.innerWidth * .92),
    random(window.innerHeight * .08, window.innerHeight * .84),
    random(7, 14),
    true
  );
  introFireworksTimer = window.setTimeout(runIntroFireworks, random(420, 760));
}
function stopIntroCelebration() {
  introFireworksRunning = false;
  window.clearTimeout(introFireworksTimer);
  particles = [];
  photosLayer.querySelectorAll(".intro-balloon").forEach((balloon) => {
    balloon.classList.add("intro-exit");
  });
}

createIntroBalloons();
runIntroFireworks();

// Timeline controller: mỗi phase đọc độc lập, dễ thay đổi delay/nhịp ở một chỗ.
const openingTimeline = [
  { delay: 0, run: async () => { scene.classList.add("started"); giftBox.classList.add("opening"); await playMusic(); } },
  { delay: 340, run: async () => { await flowerFirework(); } },
  { delay: 600, run: () => { giftBox.classList.add("recessed"); envelope.classList.add("show"); launchPhotos(); } }
];
async function runTimeline(steps) { for (const step of steps) { if (step.delay) await sleep(step.delay); await step.run(); } }

const dodgePositions = [
  { left: 17, bottom: 68 },
  { left: 82, bottom: 74 },
  { left: 18, bottom: 30 },
  { left: 83, bottom: 34 },
  { left: 50, bottom: 84 }
];
let openAttempts = 0;
let openingStarted = false;
function dodgeGift() {
  const position = dodgePositions[openAttempts];
  openAttempts += 1;
  giftOpenControl.style.left = `${position.left}%`;
  giftOpenControl.style.bottom = `${position.bottom}vh`;
  giftOpenControl.classList.remove("dodge-pop");
  // Khởi động lại animation khi người dùng bấm liên tiếp.
  void giftOpenControl.offsetWidth;
  giftOpenControl.classList.add("dodge-pop");
  // Giữ nút tối giản, chỉ hiển thị đúng một nhãn trong suốt trò chơi né nút.
  giftOpenControl.textContent = "Mở";
  burst(window.innerWidth * (position.left / 100), window.innerHeight * (1 - position.bottom / 100), 20, true);
}
giftOpenControl.addEventListener("animationend", (event) => {
  if (event.animationName === "giftDodge") giftOpenControl.classList.remove("dodge-pop");
});
giftOpenControl.addEventListener("click", () => {
  const bounds = giftOpenControl.getBoundingClientRect();
  clickFlowerBurst(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2, 18);
  burst(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2, 10, true);
  if (openingStarted) return;
  if (openAttempts < dodgePositions.length) {
    dodgeGift();
    return;
  }
  openingStarted = true;
  stopIntroCelebration();
  runTimeline(openingTimeline);
});
scene.addEventListener("pointerdown", (event) => {
  if (event.target.closest("button")) return;
  clickFlowerBurst(event.clientX, event.clientY, 18);
  burst(event.clientX, event.clientY, 10, true);
});
envelope.addEventListener("click", async () => {
  envelope.classList.add("hide");
  await flowerWipe();
  scene.classList.add("letter-open");
  noteCard.classList.add("show");
  noteCard.setAttribute("aria-hidden", "false");
  $(".note-close").focus();
});
$(".note-close").addEventListener("click", () => {
  noteCard.classList.remove("show"); noteCard.setAttribute("aria-hidden", "true"); scene.classList.remove("letter-open");
});
document.addEventListener("keydown", (event) => { if (event.key === "Escape" && noteCard.classList.contains("show")) $(".note-close").click(); });
