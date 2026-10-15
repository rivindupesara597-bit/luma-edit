const $ = (id) => document.getElementById(id);
const canvas = $("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
const input = $("photoInput");
const emptyState = $("emptyState");
const fileLabel = $("fileLabel");
const exportBtn = $("exportBtn");
const beforeBtn = $("beforeBtn");
let originalImage = null;
let originalPixels = null;
let showingBefore = false;
const defaults = { exposure:0, contrast:0, highlights:0, shadows:0, saturation:0, warmth:0 };

function values() {
  return Object.fromEntries(Object.keys(defaults).map(k => [k, Number($(k).value)]));
}
function updateOutputs() {
  const v = values();
  for (const k of Object.keys(v)) $(k + "Out").value = (k === "exposure" ? (v[k] > 0 ? "+" : "") + v[k].toFixed(1) : (v[k] > 0 ? "+" : "") + v[k]);
}
function loadImage(file) {
  if (!file) return;
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    originalImage = img;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(img,0,0);
    try { originalPixels = ctx.getImageData(0,0,canvas.width,canvas.height); }
    catch(e) { originalPixels = null; }
    emptyState.hidden = true;
    canvas.hidden = false;
    fileLabel.textContent = `${file.name} · ${img.naturalWidth} × ${img.naturalHeight}`;
    exportBtn.disabled = false;
    beforeBtn.disabled = false;
    render();
    URL.revokeObjectURL(url);
  };
  img.onerror = () => {
    alert("This browser couldn't decode that file. Try exporting a JPEG preview from your RAW workflow, or try another image format.");
    URL.revokeObjectURL(url);
  };
  img.src = url;
}
function clamp(x) { return Math.max(0, Math.min(255, x)); }
function render() {
  if (!originalImage || showingBefore) return;
  const v = values();
  ctx.drawImage(originalImage,0,0,canvas.width,canvas.height);
  // This is a deliberately simple first-pass renderer. It will be replaced by
  // a higher-quality processing pipeline in later versions.
  if (!originalPixels) {
    const brightness = Math.pow(2, v.exposure);
    canvas.style.filter = `brightness(${brightness}) contrast(${1+v.contrast/200}) saturate(${1+v.saturation/100}) sepia(${Math.max(0,v.warmth)/150})`;
    updateOutputs();
    return;
  }
  const imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
  const d = imageData.data;
  const exposure = Math.pow(2, v.exposure);
  const contrast = (259 * (v.contrast + 255)) / (255 * (259 - v.contrast));
  const sat = 1 + v.saturation / 100;
  const warm = v.warmth * 0.45;
  const hi = v.highlights / 100;
  const sh = v.shadows / 100;
  for (let i=0;i<d.length;i+=4) {
    let r=originalPixels.data[i], g=originalPixels.data[i+1], b=originalPixels.data[i+2];
    r*=exposure; g*=exposure; b*=exposure;
    r=contrast*(r-128)+128; g=contrast*(g-128)+128; b=contrast*(b-128)+128;
    const lum=0.2126*r+0.7152*g+0.0722*b;
    const shadowWeight=Math.max(0,1-lum/180);
    const highlightWeight=Math.max(0,(lum-70)/185);
    const lift=sh*52*shadowWeight + hi*45*highlightWeight;
    r+=lift+warm; g+=lift; b+=lift-warm;
    const gray=0.2126*r+0.7152*g+0.0722*b;
    r=gray+(r-gray)*sat; g=gray+(g-gray)*sat; b=gray+(b-gray)*sat;
    d[i]=clamp(r);d[i+1]=clamp(g);d[i+2]=clamp(b);d[i+3]=originalPixels.data[i+3];
  }
  ctx.putImageData(imageData,0,0);
  canvas.style.filter = "none";
  updateOutputs();
}
input.addEventListener("change", e => loadImage(e.target.files[0]));
document.querySelectorAll('input[type="range"]').forEach(el => el.addEventListener("input", render));
$("resetBtn").addEventListener("click", () => {
  for (const [k,val] of Object.entries(defaults)) $(k).value = val;
  showingBefore = false;
  beforeBtn.textContent = "Hold for before";
  render();
});
function showBefore(on) {
  if (!originalImage) return;
  showingBefore = on;
  if (on) {
    ctx.drawImage(originalImage,0,0,canvas.width,canvas.height);
    canvas.style.filter = "none";
    beforeBtn.textContent = "Showing original";
  } else {
    beforeBtn.textContent = "Hold for before";
    render();
  }
}
beforeBtn.addEventListener("pointerdown", () => showBefore(true));
["pointerup","pointercancel","pointerleave"].forEach(ev => beforeBtn.addEventListener(ev, () => showBefore(false)));
beforeBtn.addEventListener("touchstart", () => showBefore(true), {passive:true});
beforeBtn.addEventListener("touchend", () => showBefore(false), {passive:true});
exportBtn.addEventListener("click", () => {
  if (!originalImage) return;
  const a = document.createElement("a");
  a.download = "luma-edit-export.jpg";
  a.href = canvas.toDataURL("image/jpeg",0.94);
  a.click();
});
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(console.warn));
}
updateOutputs();
