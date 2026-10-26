/* Keep imported photos in this browser, independently of page refreshes. */
(() => {
  "use strict";
  if (window.archetypePhotoStore) return;
  const databaseName = "archetype-personal-photos";
  const metadataFields = [
    "id", "title", "place", "country", "date", "year", "lat", "lon",
    "type", "typeLabel", "tile", "description", "coordinates", "icon",
    "isPhoto", "hasGps", "locationSource", "demoPlace", "capturedAt", "originalName"
  ];
  let databasePromise;
  let saveQueue = Promise.resolve();

  function openDatabase() {
    databasePromise ??= new Promise((resolve, reject) => {
      const request = indexedDB.open(databaseName, 1);
      request.onupgradeneeded = () => {
        const database = request.result;
        database.createObjectStore("photos", { keyPath: "id" });
        database.createObjectStore("settings");
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error("Archivio foto occupato da un'altra scheda."));
    });
    return databasePromise;
  }

  async function read(store, key) {
    const database = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(store, "readonly");
      const request = key === undefined ? transaction.objectStore(store).getAll() : transaction.objectStore(store).get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function write(store, value, key) {
    const database = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(store, "readwrite");
      const objectStore = transaction.objectStore(store);
      if (key === undefined) objectStore.put(value);
      else objectStore.put(value, key);
      transaction.oncomplete = resolve;
      transaction.onabort = () => reject(transaction.error || new Error("Salvataggio foto interrotto."));
      transaction.onerror = () => reject(transaction.error);
    });
  }

  function updatePhotoStatus(count) {
    if (!count) return;
    document.querySelector("#import-status").textContent = `${count} foto personali · salvate in questo browser`;
    const countLabel = document.querySelector('[data-filter="all"] span');
    if (countLabel) countLabel.textContent = String(importedPhotoCount || count).padStart(2, "0");
    const dialog = document.querySelector("#photo-import-dialog");
    if (dialog && !document.querySelector("#export-photo-album")) {
      const button = document.createElement("button");
      button.type = "button";
      button.id = "export-photo-album";
      button.className = "outline-button";
      button.textContent = "Scarica HTML con le sole foto";
      button.style.width = "100%";
      button.style.marginTop = "10px";
      button.addEventListener("click", exportPhotoOnlyAlbum);
      dialog.insertBefore(button, dialog.querySelector(".import-privacy"));
    }
  }

  async function makeShareImage(blob) {
    const bitmap = await createImageBitmap(blob);
    try {
      const maxDimension = 1280;
      const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext("2d", { alpha: false });
      if (!context) throw new Error("Canvas non disponibile per preparare le foto.");
      context.fillStyle = "#111";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const jpeg = await new Promise((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Conversione immagine non riuscita.")), "image/jpeg", 0.78));
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Lettura dell’immagine convertita non riuscita."));
        reader.readAsDataURL(jpeg);
      });
    } finally {
      bitmap.close();
    }
  }

  async function exportPhotoOnlyAlbum(event) {
    const button = event.currentTarget;
    const status = document.querySelector("#import-result");
    const originalLabel = button.textContent;
    button.disabled = true;
    try {
      const storedPhotos = (await read("photos")).sort((a, b) => a.order - b.order);
      if (!storedPhotos.length) throw new Error("Non trovo foto salvate in questo browser.");
      const sampleSize = Math.min(16, storedPhotos.length);
      const photos = sampleSize === storedPhotos.length
        ? storedPhotos
        : Array.from({ length: sampleSize }, (_, index) => storedPhotos[Math.round(index * (storedPhotos.length - 1) / (sampleSize - 1))]);
      const images = [];
      for (let index = 0; index < photos.length; index++) {
        images.push(await makeShareImage(photos[index].blob));
        button.textContent = `Preparo le foto ${index + 1}/${photos.length}…`;
      }
      const points = images.map((_, index) => {
        const y = 1 - 2 * ((index + 0.5) / images.length);
        const radius = Math.sqrt(1 - y * y);
        const angle = index * Math.PI * (3 - Math.sqrt(5));
        return {
          lat: Math.asin(y) * 180 / Math.PI,
          lon: ((angle * 180 / Math.PI + 540) % 360) - 180,
          imageIndex: index
        };
      });
      const photoData = JSON.stringify(images);
      const pointData = JSON.stringify(points);
      const landData = JSON.stringify(landPolygons);
      const html = `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="referrer" content="no-referrer">
<title>Atlante fotografico</title>
<style>
*{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#08110e;color:#e7ecdf;font-family:system-ui,sans-serif}.stage{height:100%;display:grid;place-items:center;position:relative}.globe{width:min(92vw,88vh);height:min(92vw,88vh);touch-action:none;cursor:grab}.globe:active{cursor:grabbing}.controls{position:absolute;right:22px;bottom:22px;display:flex;gap:8px}.controls button,.close{border:1px solid #64735d;background:#132019;color:#eff4e7;border-radius:50%;width:42px;height:42px;font-size:20px;cursor:pointer}.notice{position:absolute;bottom:27px;left:22px;color:#c0cbb6;background:#111a15d9;padding:8px 11px;border:1px solid #354236;border-radius:20px;font:11px system-ui,sans-serif}.viewer[hidden]{display:none}.viewer{position:fixed;inset:0;z-index:3;background:#020604eF;display:grid;place-items:center;padding:18px}.viewer img{max-width:min(92vw,1500px);max-height:90vh;object-fit:contain}.close{position:absolute;right:20px;top:20px;font-size:24px}.marker{filter:drop-shadow(0 0 6px #d7e9bbaa)}@media(max-width:600px){.notice{left:10px;bottom:75px;font-size:10px}.controls{right:12px;bottom:14px}.controls button{width:38px;height:38px}}
</style>
</head>
<body>
<main class="stage"><canvas id="globe" class="globe" aria-label="Globo interattivo con fotografie; trascina per ruotare e seleziona un punto per aprire una foto"></canvas>
<div class="notice">Posizioni distribuite per la demo · non GPS</div>
<div class="controls"><button id="zoom-out" aria-label="Riduci zoom">−</button><button id="center" aria-label="Centra globo">⌖</button><button id="zoom-in" aria-label="Ingrandisci">+</button></div></main>
<div id="viewer" class="viewer" role="dialog" aria-modal="true" hidden><button id="close" class="close" aria-label="Chiudi">×</button><img id="photo" alt=""></div>
<script>
const photos=${photoData};
const photoPoints=${pointData};
const continents=${landData};
const canvas=document.getElementById("globe"),ctx=canvas.getContext("2d");
let rotation=0,pitch=0,zoom=1,drag=null,targets=[];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function project(lat,lon,cx,cy,r){const p=lat*Math.PI/180,l=lon*Math.PI/180+rotation,cp=Math.cos(pitch),sp=Math.sin(pitch),x=Math.cos(p)*Math.sin(l),y=Math.sin(p)*cp-Math.cos(p)*Math.cos(l)*sp,z=Math.sin(p)*sp+Math.cos(p)*Math.cos(l)*cp;return{x:cx+r*x,y:cy-r*y,z:z}}
function strokePath(coords,cx,cy,r,color,width){ctx.beginPath();let drawing=false;for(let i=0;i<coords.length;i++){const p=project(coords[i][1],coords[i][0],cx,cy,r);if(p.z>0.02){if(!drawing)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);drawing=true}else drawing=false}ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke()}
function render(){const rect=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);if(!rect.width||!rect.height)return;canvas.width=Math.round(rect.width*dpr);canvas.height=Math.round(rect.height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);const w=rect.width,h=rect.height,cx=w/2,cy=h/2,r=Math.min(w,h)*.41*zoom;ctx.clearRect(0,0,w,h);const sphere=ctx.createRadialGradient(cx-r*.38,cy-r*.4,r*.04,cx,cy,r*1.1);sphere.addColorStop(0,"#425744");sphere.addColorStop(.55,"#23362a");sphere.addColorStop(1,"#0c1711");ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fillStyle=sphere;ctx.fill();ctx.save();ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.clip();ctx.lineWidth=1;for(let lat=-60;lat<=60;lat+=30){const line=[];for(let lon=-180;lon<=180;lon+=4)line.push([lon,lat]);strokePath(line,cx,cy,r,"#c5d4b32b",1)}for(let lon=-180;lon<180;lon+=30){const line=[];for(let lat=-88;lat<=88;lat+=3)line.push([lon,lat]);strokePath(line,cx,cy,r,"#c5d4b22b",1)}for(const polygon of continents){strokePath(polygon,cx,cy,r,"#bdcdaa9c",1.1)}ctx.restore();ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.strokeStyle="#d0ddb876";ctx.lineWidth=1.2;ctx.stroke();targets=[];for(const point of photoPoints){const p=project(point.lat,point.lon,cx,cy,r);if(p.z<=0.02)continue;const size=3.7+Math.max(0,p.z)*1.2;ctx.beginPath();ctx.arc(p.x,p.y,size+3,0,Math.PI*2);ctx.fillStyle="#d7e4bf35";ctx.fill();ctx.beginPath();ctx.arc(p.x,p.y,size,0,Math.PI*2);ctx.fillStyle="#e9d2a5";ctx.fill();ctx.strokeStyle="#253629";ctx.lineWidth=1;ctx.stroke();targets.push({x:p.x,y:p.y,index:point.imageIndex,z:p.z})}targets.sort((a,b)=>a.z-b.z)}
function showPhoto(index){document.getElementById("photo").src=photos[index];document.getElementById("viewer").hidden=false}
document.getElementById("close").addEventListener("click",()=>{document.getElementById("viewer").hidden=true;document.getElementById("photo").removeAttribute("src")});
document.getElementById("viewer").addEventListener("click",e=>{if(e.target.id==="viewer")document.getElementById("close").click()});
document.getElementById("zoom-in").addEventListener("click",()=>{zoom=Math.min(2.3,zoom+.15);render()});document.getElementById("zoom-out").addEventListener("click",()=>{zoom=Math.max(.7,zoom-.15);render()});document.getElementById("center").addEventListener("click",()=>{rotation=0;pitch=0;zoom=1;render()});
canvas.addEventListener("pointerdown",e=>{drag={x:e.clientX,y:e.clientY,rotation:rotation,pitch:pitch,moved:false};canvas.setPointerCapture(e.pointerId)});canvas.addEventListener("pointermove",e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>4)drag.moved=true;rotation=drag.rotation+dx*.008;pitch=clamp(drag.pitch-dy*.006,-1.1,1.1);render()});canvas.addEventListener("pointerup",e=>{if(!drag)return;const moved=drag.moved;drag=null;if(!moved){const rect=canvas.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top,target=[...targets].reverse().find(t=>Math.hypot(t.x-x,t.y-y)<12);if(target)showPhoto(target.index)}});canvas.addEventListener("pointercancel",()=>drag=null);window.addEventListener("resize",render);render();
</script>
</body>
</html>`;
      const savedFile = await fetch("/__save-demo", {
        method: "POST",
        headers: { "Content-Type": "text/html;charset=utf-8" },
        body: html
      });
      if (!savedFile.ok) throw new Error(`Salvataggio del file non riuscito (HTTP ${savedFile.status}).`);
      const url = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "atlante-fotografico-demo.html";
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      if (status) {
        status.className = "import-result success";
        status.textContent = `HTML creato nella cartella del progetto con ${photos.length} foto. Posizioni demo sul globo; metadati rimossi, originali invariati.`;
      }
    } catch (error) {
      if (status) {
        status.className = "import-result warning";
        status.textContent = `Esportazione non riuscita: ${error.message}`;
      }
    } finally {
      button.disabled = false;
      button.textContent = originalLabel;
    }
  }

  async function savePhotos() {
    const photos = memories.filter((memory) => memory.isPhoto);
    // Store Blob data, never temporary blob URLs or Google access tokens.
    for (let order = 0; order < photos.length; order++) {
      const memory = photos[order];
      const previous = await read("photos", memory.id);
      let blob = previous?.blob;
      if (!blob) {
        if (!memory.imageUrl?.startsWith("blob:")) throw new Error("La foto non è disponibile localmente.");
        const response = await fetch(memory.imageUrl);
        if (!response.ok) throw new Error("Impossibile leggere la foto importata.");
        blob = await response.blob();
      }
      const metadata = {};
      for (const field of metadataFields) if (memory[field] !== undefined) metadata[field] = memory[field];
      await write("photos", { id: memory.id, order, metadata, blob });
    }
    if (photos.length) {
      await write("settings", selectedId, "selectedId");
      updatePhotoStatus(photos.length);
    }
    return photos.length;
  }

  function save() {
    saveQueue = saveQueue.catch(() => {}).then(savePhotos);
    return saveQueue;
  }

  async function restore() {
    const records = await read("photos");
    records.sort((a, b) => a.order - b.order);
    const existing = new Set(memories.map((memory) => memory.id));
    const restored = [];
    for (const record of records) {
      if (existing.has(record.id) || !(record.blob instanceof Blob) || !record.blob.size) continue;
      const imageUrl = URL.createObjectURL(record.blob);
      importedPhotoUrls.add(imageUrl);
      restored.push({ ...record.metadata, capturedAt: new Date(record.metadata.capturedAt), imageUrl });
    }
    if (!restored.length) return 0;
    memories.unshift(...restored);
    importedPhotoCount = memories.filter((memory) => memory.isPhoto && inImportRange(memory.capturedAt)).length;
    activeFilter = "all";
    document.querySelector("#search").value = "";
    document.querySelectorAll("[data-filter]").forEach((button) => button.classList.toggle("filter-active", button.dataset.filter === "all"));
    renderList();
    renderMemoryCards();
    renderLedger();
    const savedId = await read("settings", "selectedId");
    const selected = restored.find((memory) => memory.id === savedId && matches(memory)) || restored.find(matches);
    if (selected) selectMemory(selected.id);
    updatePhotoStatus(restored.length);
    return restored.length;
  }

  async function deleteLocalData() {
    await saveQueue.catch(() => {});
    const database = await openDatabase();
    await new Promise((resolve, reject) => {
      const transaction = database.transaction(["photos", "settings"], "readwrite");
      transaction.objectStore("photos").clear();
      transaction.objectStore("settings").clear();
      transaction.oncomplete = resolve;
      transaction.onabort = () => reject(transaction.error || new Error("Cancellazione dei dati locali interrotta."));
      transaction.onerror = () => reject(transaction.error);
    });

    for (const url of importedPhotoUrls) URL.revokeObjectURL(url);
    importedPhotoUrls.clear();
    for (let index = memories.length - 1; index >= 0; index--) {
      if (memories[index].isPhoto) memories.splice(index, 1);
    }
    importedPhotoCount = 0;
    ledger = [];
    googleAccessToken = null;
    if (activePickerSession) activePickerSession.token = null;
    activePickerSession = null;
    localStorage.removeItem("archetype-demo-ledger");
    localStorage.removeItem("archetype-google-client-id");
    document.querySelector("#google-client-id").value = "";
    document.querySelector("#google-auth-status").textContent = "Client ID non configurato.";
    document.querySelector("#picker-state").textContent = "DA CONFIGURARE";
    document.querySelector("#import-status").textContent = "Foto non ancora importate · intervallo " + document.querySelector("#import-window-label").textContent;
    document.querySelector("#import-result").textContent = "Foto, impostazioni e registro locale eliminati. Gli originali su Google Foto non sono stati modificati.";
    document.querySelector("#import-result").className = "import-result success";
    document.querySelector('[data-filter="all"] span').textContent = String(memories.length).padStart(2, "0");
    renderList();
    renderMemoryCards();
    renderLedger();
    selectMemory(memories[0].id);
  }

  function showStorageError() {
    const count = memories.filter((memory) => memory.isPhoto).length;
    if (count) document.querySelector("#import-status").textContent = `${count} foto in questa sessione · salvataggio locale non riuscito`;
    notify("Non riesco a salvare le foto in questo browser. Mantieni aperta la scheda.");
  }

  // Preserve the existing import behavior and persist each completed import.
  const originalFileImport = importPhotoFiles;
  const originalPickerImport = importPickedMedia;
  importPhotoFiles = async (...args) => {
    await ready.catch(() => {});
    const result = await originalFileImport(...args);
    await save().catch(showStorageError);
    return result;
  };
  importPickedMedia = async (...args) => {
    await ready.catch(() => {});
    const result = await originalPickerImport(...args);
    await save().catch(showStorageError);
    return result;
  };

  const ready = memories.some((memory) => memory.isPhoto) ? save() : restore();
  document.querySelector("#delete-local-data").addEventListener("click", async () => {
    const accepted = window.confirm("Eliminare foto importate, firme locali e Client ID salvati in questo browser? Gli originali su Google Foto non verranno toccati.");
    if (!accepted) return;
    const button = document.querySelector("#delete-local-data");
    button.disabled = true;
    try {
      await deleteLocalData();
    } catch (error) {
      const status = document.querySelector("#import-result");
      status.className = "import-result warning";
      status.textContent = `Cancellazione non riuscita: ${error.message}`;
    } finally {
      button.disabled = false;
    }
  });
  window.archetypePhotoStore = { ready, save, restore, exportPhotoOnlyAlbum, deleteLocalData };
  ready.catch(showStorageError);
})();
