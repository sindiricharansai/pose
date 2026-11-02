// State Management
let currentMode = 'photo'; // 'photo' | 'video'
let activeImage = new Image();
let rotationDeg = 0;
let flipH = false;

// Elements
const tabPhoto = document.getElementById('tab-photo');
const tabVideo = document.getElementById('tab-video');
const photoControls = document.getElementById('photo-controls');
const videoControls = document.getElementById('video-controls');
const photoViewport = document.getElementById('photo-viewport');
const videoViewport = document.getElementById('video-viewport');

const canvas = document.getElementById('main-canvas');
const ctx = canvas.getContext('2d');
const video = document.getElementById('main-video');
const fileInput = document.getElementById('file-upload');
const btnExport = document.getElementById('btn-export-main');

// Photo Sliders
const pBrightness = document.getElementById('p-brightness');
const pContrast = document.getElementById('p-contrast');
const pSaturate = document.getElementById('p-saturate');
const pHue = document.getElementById('p-hue');
const pSepia = document.getElementById('p-sepia');
const pBlur = document.getElementById('p-blur');

// Video Elements
const vBrightness = document.getElementById('v-brightness');
const vContrast = document.getElementById('v-contrast');
const vSaturate = document.getElementById('v-saturate');
const vBtnPlay = document.getElementById('v-btn-play');
const vTimeline = document.getElementById('v-timeline');
const vVolume = document.getElementById('v-volume');
const vTimeCurrent = document.getElementById('v-time-current');
const vTimeDuration = document.getElementById('v-time-duration');
const btnCaptureFrame = document.getElementById('btn-capture-frame');

// Init Icons
lucide.createIcons();

// Load initial sample photo
activeImage.crossOrigin = 'anonymous';
activeImage.src = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop';
activeImage.onload = () => {
  renderCanvas();
};

// Mode Switching
tabPhoto.addEventListener('click', () => {
  currentMode = 'photo';
  tabPhoto.className = 'px-5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 bg-amber-500 text-zinc-950 shadow transition-all';
  tabVideo.className = 'px-5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-all';
  photoControls.classList.remove('hidden');
  videoControls.classList.add('hidden');
  photoViewport.classList.remove('hidden');
  videoViewport.classList.add('hidden');
  video.pause();
});

tabVideo.addEventListener('click', () => {
  currentMode = 'video';
  tabVideo.className = 'px-5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 bg-amber-500 text-zinc-950 shadow transition-all';
  tabPhoto.className = 'px-5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-all';
  photoControls.classList.add('hidden');
  videoControls.classList.remove('hidden');
  photoViewport.classList.add('hidden');
  videoViewport.classList.remove('hidden');
});

// Render Image to Canvas with Filters & Transforms
function renderCanvas() {
  if (!activeImage.complete) return;

  const isRotatedQuarter = (rotationDeg / 90) % 2 !== 0;
  canvas.width = isRotatedQuarter ? activeImage.naturalHeight : activeImage.naturalWidth;
  canvas.height = isRotatedQuarter ? activeImage.naturalWidth : activeImage.naturalHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();

  // Positioning
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotationDeg * Math.PI) / 180);
  ctx.scale(flipH ? -1 : 1, 1);

  // Apply CSS Filters
  ctx.filter = `brightness(${pBrightness.value}%) contrast(${pContrast.value}%) saturate(${pSaturate.value}%) hue-rotate(${pHue.value}deg) sepia(${pSepia.value}%) blur(${pBlur.value}px)`;

  ctx.drawImage(
    activeImage,
    -activeImage.naturalWidth / 2,
    -activeImage.naturalHeight / 2
  );

  ctx.restore();
}

// Attach input listeners
[pBrightness, pContrast, pSaturate, pHue, pSepia, pBlur].forEach(slider => {
  slider.addEventListener('input', () => {
    document.getElementById(`val-${slider.id.replace('p-', '')}`).innerText = 
      slider.id === 'p-hue' ? `${slider.value}°` : slider.id === 'p-blur' ? `${slider.value}px` : `${slider.value}%`;
    renderCanvas();
  });
});

// Transforms
document.getElementById('btn-rot-right').addEventListener('click', () => {
  rotationDeg = (rotationDeg + 90) % 360;
  renderCanvas();
});

document.getElementById('btn-rot-left').addEventListener('click', () => {
  rotationDeg = (rotationDeg - 90 + 360) % 360;
  renderCanvas();
});

document.getElementById('btn-flip-h').addEventListener('click', () => {
  flipH = !flipH;
  renderCanvas();
});

// Presets
document.querySelectorAll('.preset-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const preset = btn.dataset.preset;
    if (preset === 'natural') {
      pBrightness.value = 100; pContrast.value = 100; pSaturate.value = 100; pHue.value = 0; pSepia.value = 0; pBlur.value = 0;
    } else if (preset === 'vintage') {
      pBrightness.value = 110; pContrast.value = 90; pSaturate.value = 75; pHue.value = 15; pSepia.value = 40; pBlur.value = 0;
    } else if (preset === 'noir') {
      pBrightness.value = 95; pContrast.value = 150; pSaturate.value = 0; pHue.value = 0; pSepia.value = 0; pBlur.value = 0;
    } else if (preset === 'cyber') {
      pBrightness.value = 105; pContrast.value = 140; pSaturate.value = 170; pHue.value = 190; pSepia.value = 0; pBlur.value = 0;
    }
    renderCanvas();
  });
});

// Reset
document.getElementById('btn-reset-photo').addEventListener('click', () => {
  pBrightness.value = 100; pContrast.value = 100; pSaturate.value = 100;
  pHue.value = 0; pSepia.value = 0; pBlur.value = 0;
  rotationDeg = 0; flipH = false;
  renderCanvas();
});

// File Upload Handler (Photo or Video)
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);

  if (file.type.startsWith('image/')) {
    activeImage = new Image();
    activeImage.src = url;
    activeImage.onload = () => {
      tabPhoto.click();
      renderCanvas();
    };
  } else if (file.type.startsWith('video/')) {
    video.src = url;
    tabVideo.click();
  }
});

// Video Controls & Live Color Grading
function updateVideoFilter() {
  video.style.filter = `brightness(${vBrightness.value}%) contrast(${vContrast.value}%) saturate(${vSaturate.value}%)`;
}

[vBrightness, vContrast, vSaturate].forEach(slider => {
  slider.addEventListener('input', () => {
    document.getElementById(`val-${slider.id}`).innerText = `${slider.value}%`;
    updateVideoFilter();
  });
});

vBtnPlay.addEventListener('click', () => {
  if (video.paused) {
    video.play();
    vBtnPlay.innerHTML = '<i data-lucide="pause" class="w-4 h-4 fill-current"></i>';
  } else {
    video.pause();
    vBtnPlay.innerHTML = '<i data-lucide="play" class="w-4 h-4 fill-current"></i>';
  }
  lucide.createIcons();
});

video.addEventListener('timeupdate', () => {
  const percent = (video.currentTime / video.duration) * 100;
  vTimeline.value = percent || 0;
  vTimeCurrent.innerText = formatTime(video.currentTime);
});

video.addEventListener('loadedmetadata', () => {
  vTimeDuration.innerText = formatTime(video.duration);
});

vTimeline.addEventListener('input', (e) => {
  video.currentTime = (e.target.value / 100) * video.duration;
});

vVolume.addEventListener('input', (e) => {
  video.volume = e.target.value;
});

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60) || 0;
  const secs = Math.floor(seconds % 60) || 0;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Playback Speed
document.querySelectorAll('.speed-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.speed-btn').forEach(b => {
      b.className = 'speed-btn py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded text-zinc-300';
    });
    btn.className = 'speed-btn py-1.5 bg-amber-500 text-zinc-950 font-bold rounded';
    video.playbackRate = parseFloat(btn.dataset.speed);
  });
});

// Capture Frame to Photo Studio
btnCaptureFrame.addEventListener('click', () => {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = video.videoWidth;
  tempCanvas.height = video.videoHeight;
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);

  activeImage = new Image();
  activeImage.src = tempCanvas.toDataURL('image/png');
  activeImage.onload = () => {
    tabPhoto.click();
    renderCanvas();
  };
});

// Export Download
btnExport.addEventListener('click', () => {
  if (currentMode === 'photo') {
    const link = document.createElement('a');
    link.download = 'lumina-edit.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  } else {
    alert("To save trimmed or re-encoded video locally, use the 'Snapshot Frame to Editor' feature or an integrated WebAssembly FFmpeg pipeline.");
  }
});