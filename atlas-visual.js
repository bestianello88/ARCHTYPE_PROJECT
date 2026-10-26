/* Presentation only. Reuses the atlas coordinates, filters and selection API. */
(() => {
  "use strict";
  if (!ctx || !canvas) return;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const minZoom = .78;
  const maxZoom = 4;
  const memoryZoom = 2.2;
  const wrap = document.querySelector(".globe-wrap");
  const legacyRender = renderGlobe;
  window.removeEventListener("resize", legacyRender);
  let frame = 0;
  let flyFrame = 0;
  let flightMemoryId = null;
  let autoFrame = 0;
  let autoRotate = false;
  let inViewport = true;
  let ready = false;
  let renderer = null;
  let dayPixels = null;
  let rasterKey = "";
  let streetMap = null;
  let streetTiles = null;
  let streetMarker = null;
  let streetActive = false;
  let returnToStreets = false;
  let streetTileErrors = 0;
  let streetBaseMap = "cartography";
  const streetBaseLayers = new Map();
  const raster = document.createElement("canvas");
  const rasterCtx = raster.getContext("2d");
  const images = {};

  const progress = document.createElement("div");
  progress.className = "atlas-progress";
  progress.setAttribute("aria-hidden", "true");
  document.body.append(progress);
  const loader = document.createElement("div");
  loader.className = "earth-loader";
  loader.setAttribute("role", "status");
  loader.innerHTML = '<span class="earth-loader-orbit" aria-hidden="true"></span><span class="earth-loader-text">IL TUO MONDO PRENDE FORMA</span><small>Caricamento della superficie terrestre…</small>';
  wrap.append(loader);
  canvas.setAttribute("aria-busy", "true");
  canvas.tabIndex = 0;
  canvas.setAttribute("aria-label", "Pianeta Terra interattivo. Trascina o usa le frecce per ruotare. Usa + e − per lo zoom.");
  const caption = document.createElement("div");
  caption.className = "earth-caption";
  caption.innerHTML = '<strong>TERRA</strong> / ATLANTE PERSONALE<br>UN PIANETA. INFINITE STORIE.';
  wrap.append(caption);

  const spin = document.createElement("button");
  spin.type = "button";
  spin.id = "earth-auto-rotate";
  spin.textContent = "▷";
  spin.setAttribute("aria-label", "Avvia rotazione automatica");
  spin.setAttribute("aria-pressed", "false");
  document.querySelector(".globe-controls").append(spin);

  const streetOpen = document.createElement("button");
  streetOpen.type = "button";
  streetOpen.className = "street-open-button";
  streetOpen.textContent = "Esplora le strade ↗";
  streetOpen.setAttribute("aria-controls", "street-layer");
  streetOpen.setAttribute("aria-expanded", "false");
  wrap.append(streetOpen);

  const streetLayer = document.createElement("section");
  streetLayer.id = "street-layer";
  streetLayer.className = "street-layer";
  streetLayer.hidden = true;
  streetLayer.setAttribute("aria-label", "Mappa stradale del ricordo selezionato");
  streetLayer.innerHTML = '<div id="street-map" class="street-map"></div><div class="street-place-label"><span>VIE E QUARTIERI</span><strong></strong></div><button type="button" class="street-return-button">← Torna al globo</button><div class="street-basemap-switch" role="group" aria-label="Tipo di mappa"><button type="button" data-basemap="cartography" aria-pressed="true">Cartografia</button><button type="button" data-basemap="satellite" aria-pressed="false">Satellite</button></div><div class="street-map-status" role="status"><span>Caricamento della mappa…</span><button type="button" hidden>Riprova</button></div>';
  wrap.append(streetLayer);
  const streetStatus = streetLayer.querySelector(".street-map-status");
  const streetStatusText = streetStatus.querySelector("span");
  const streetRetry = streetStatus.querySelector("button");

  function createStreetTiles(mode) {
    const satellite = mode === "satellite";
    const layer = L.tileLayer(satellite
      ? "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      : "https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxNativeZoom: 19, maxZoom: 19, keepBuffer: 0,
      updateWhenIdle: true, updateWhenZooming: false,
      attribution: satellite
        ? 'Tiles &copy; <a href="https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9" target="_blank" rel="noopener noreferrer">Esri</a> &mdash; Sources: Esri, Vantor, Earthstar Geographics, and the GIS User Community'
        : '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
    });
    layer.on("loading", () => {
      if (layer !== streetTiles) return;
      streetTileErrors = 0;
      streetStatus.hidden = false;
      streetStatusText.textContent = satellite ? "Caricamento delle immagini satellitari…" : "Caricamento della cartografia…";
      streetRetry.hidden = true;
    });
    layer.on("tileerror", () => { if (layer === streetTiles) streetTileErrors++; });
    layer.on("load", () => {
      if (layer !== streetTiles) return;
      streetStatus.hidden = streetTileErrors === 0;
      if (streetTileErrors) {
        streetStatusText.textContent = "Alcuni dettagli non sono disponibili. Verifica la connessione o cambia vista.";
        streetRetry.hidden = false;
      }
    });
    return layer;
  }

  function setStreetBaseMap(mode) {
    if (mode !== "cartography" && mode !== "satellite") return;
    streetBaseMap = mode;
    streetLayer.dataset.basemap = mode;
    streetLayer.querySelectorAll("[data-basemap]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.basemap === mode));
    });
    streetLayer.querySelector(".street-place-label span").textContent = mode === "satellite" ? "VISTA SATELLITARE" : "VIE E QUARTIERI";
    if (!streetMap) return;
    if (!streetBaseLayers.has(mode)) streetBaseLayers.set(mode, createStreetTiles(mode));
    const nextLayer = streetBaseLayers.get(mode);
    if (nextLayer === streetTiles) return;
    if (streetTiles) streetMap.removeLayer(streetTiles);
    streetTiles = nextLayer;
    streetTileErrors = 0;
    streetRetry.hidden = true;
    streetStatus.hidden = true;
    streetTiles.addTo(streetMap);
  }

  function createStreetMap() {
    if (!window.L) {
      notify("La mappa stradale non è disponibile. Ricarica la pagina e riprova.");
      return false;
    }
    if (streetMap) return true;
    streetMap = L.map("street-map", {
      zoomControl: false, minZoom: 3, maxZoom: 19,
      scrollWheelZoom: true, worldCopyJump: true
    });
    L.control.scale({ imperial: false, position: "bottomleft" }).addTo(streetMap);
    setStreetBaseMap(streetBaseMap);
    streetMarker = L.circleMarker([0, 0], {
      radius: 9, color: "#7b4926", weight: 2,
      fillColor: "#dfb48a", fillOpacity: 1
    }).addTo(streetMap);
    streetMarker.on("click", () => streetMarker.openTooltip());
    streetMap.on("zoomend", () => {
      if (streetActive && streetMap.getZoom() <= 4) closeStreetView();
    });
    return true;
  }

  function openStreetView() {
    const memory = getMemory();
    if (!memory || !Number.isFinite(memory.lat) || !Number.isFinite(memory.lon)) {
      notify("Seleziona un ricordo con una posizione per esplorare le strade.");
      return false;
    }
    if (!window.L) { createStreetMap(); return false; }
    stopFlight();
    stopAuto();
    returnToStreets = false;
    streetLayer.hidden = false;
    streetActive = true;
    wrap.classList.add("street-mode");
    wrap.closest(".globe-stage").classList.add("street-view-active");
    canvas.tabIndex = -1;
    streetOpen.setAttribute("aria-expanded", "true");
    streetLayer.querySelector(".street-place-label strong").textContent = memory.place;
    createStreetMap();
    streetMap.stop();
    streetMap.invalidateSize({ pan: false });
    const latLng = [Math.max(-85.0511, Math.min(85.0511, memory.lat)), memory.lon];
    streetMarker.setLatLng(latLng);
    streetMarker.unbindTooltip();
    const preview = document.createElement("figure");
    preview.className = "map-photo-preview";
    if (memory.imageUrl) {
      const image = document.createElement("img");
      image.src = memory.imageUrl;
      image.alt = memory.title;
      image.decoding = "async";
      preview.append(image);
    } else {
      const image = document.createElement("div");
      image.className = `map-preview-tile ${imageTiles[memory.tile] || imageTiles.bologna}`;
      image.setAttribute("role", "img");
      image.setAttribute("aria-label", memory.title);
      preview.append(image);
    }
    const label = document.createElement("figcaption");
    label.textContent = memory.title;
    preview.append(label);
    streetMarker.bindTooltip(preview, {
      direction: "top", offset: [0, -12], className: "memory-photo-tooltip"
    });
    streetMap.setView(latLng, 17, { animate: false });
    return true;
  }

  function closeStreetView() {
    if (!streetActive) return;
    const center = streetMap.getCenter();
    rotation = -center.lng;
    pitch = center.lat;
    zoom = memoryZoom;
    streetMap.stop();
    streetActive = false;
    streetLayer.hidden = true;
    wrap.classList.remove("street-mode");
    wrap.closest(".globe-stage").classList.remove("street-view-active");
    canvas.tabIndex = 0;
    streetOpen.setAttribute("aria-expanded", "false");
    renderGlobe();
  }

  streetOpen.addEventListener("click", openStreetView);
  streetLayer.querySelectorAll("[data-basemap]").forEach((button) => {
    button.addEventListener("click", () => setStreetBaseMap(button.dataset.basemap));
  });
  streetLayer.querySelector(".street-return-button").addEventListener("click", () => {
    returnToStreets = false;
    closeStreetView();
    streetOpen.focus({ preventScroll: true });
  });
  streetRetry.addEventListener("click", () => streetTiles?.redraw());
  streetLayer.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeStreetView();
      streetOpen.focus({ preventScroll: true });
    }
  });

  function finishLoading(success) {
    ready = success;
    canvas.dataset.earthRenderer = success ? (renderer ? "webgl" : "canvas2d") : "legacy";
    canvas.setAttribute("aria-busy", "false");
    loader.querySelector(".earth-loader-text").textContent = success ? "IL TUO ATLANTE È PRONTO" : "ATLANTE DISPONIBILE";
    loader.classList.add("is-finished");
    progress.classList.add("is-finished");
    setTimeout(() => { loader.hidden = true; progress.remove(); }, 550);
    renderGlobe();
  }

  function loadImage(name, url) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => { images[name] = image; resolve(image); };
      image.onerror = () => reject(new Error(`Texture unavailable: ${url}`));
      image.src = url;
    });
  }

  function createRenderer() {
    const surface = document.createElement("canvas");
    const gl = surface.getContext("webgl", { alpha: true, premultipliedAlpha: false, antialias: false, preserveDrawingBuffer: false });
    if (!gl) return null;
    const vertexSource = `attribute vec2 aPosition; varying vec2 vUv;
      void main(){vUv=aPosition*.5+.5;gl_Position=vec4(aPosition,0.,1.);}`;
    const fragmentSource = `precision highp float;
      varying vec2 vUv;
      uniform sampler2D uDay; uniform sampler2D uNight; uniform sampler2D uClouds;
      uniform float uRotation; uniform float uPitch;
      const float PI=3.14159265359;
      void main(){
        vec2 p=(vUv*2.-1.)*1.08;
        float rr=dot(p,p); float distanceFromCenter=sqrt(rr);
        if(rr>1.){
          float halo=exp(-(distanceFromCenter-1.)*55.)*.36;
          halo*=1.-smoothstep(1.025,1.08,distanceFromCenter);
          gl_FragColor=vec4(.22,.52,.91,halo);return;
        }
        vec3 n=vec3(p,sqrt(max(0.,1.-rr)));
        float cp=cos(uPitch);float sp=sin(uPitch);
        vec3 world=vec3(n.x,n.y*cp+n.z*sp,-n.y*sp+n.z*cp);
        float longitude=atan(world.x,world.z)-uRotation;
        vec2 uv=vec2(fract(longitude/(2.*PI)+.5),.5-asin(clamp(world.y,-1.,1.))/PI);
        vec3 land=texture2D(uDay,uv).rgb;
        vec3 light=normalize(vec3(-.65,.6,.85));
        float diffuse=dot(n,light);
        float daylight=smoothstep(-.16,.28,diffuse);
        float shading=.15+.95*max(0.,diffuse);
        vec3 color=land*shading;
        float ocean=smoothstep(.015,.09,land.b-land.r)*smoothstep(.0,.055,land.b-land.g);
        color=mix(color,color*vec3(.65,1.04,1.45),ocean*.48);
        float specular=pow(max(0.,dot(reflect(-light,n),vec3(0.,0.,1.))),32.);
        color+=vec3(.27,.43,.55)*specular*ocean*.24;
        vec4 cloudSample=texture2D(uClouds,uv);
        float clouds=cloudSample.r*cloudSample.a*.55;
        color=mix(color,vec3(.9,.94,1.)*(.14+max(0.,diffuse)*.95),clouds);
        vec3 city=texture2D(uNight,uv).rgb;
        color+=city*vec3(1.7,1.05,.48)*(1.-daylight)*1.15;
        float atmosphere=pow(1.-n.z,3.5);
        color+=vec3(.1,.35,.7)*atmosphere*(.18+.65*daylight);
        color=pow(max(color,vec3(0.)),vec3(.88));
        gl_FragColor=vec4(color,1.-smoothstep(.997,1.,distanceFromCenter));
      }`;
    function shader(type, source) {
      const compiled = gl.createShader(type);
      gl.shaderSource(compiled, source); gl.compileShader(compiled);
      if (!gl.getShaderParameter(compiled, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(compiled));
      return compiled;
    }
    const program = gl.createProgram();
    gl.attachShader(program, shader(gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program, shader(gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("Earth shader link failed");
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
    const attribute = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(attribute); gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);
    ["day", "night", "clouds"].forEach((name, index) => {
      const texture = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + index); gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      if (images[name]) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[name]);
      else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0,0,0,255]));
      gl.uniform1i(gl.getUniformLocation(program, `u${name[0].toUpperCase()}${name.slice(1)}`), index);
    });
    const rotationLocation = gl.getUniformLocation(program, "uRotation");
    const pitchLocation = gl.getUniformLocation(program, "uPitch");
    let contextLost = false;
    surface.addEventListener("webglcontextlost", (event) => { event.preventDefault(); contextLost = true; renderer = null; renderGlobe(); });
    surface.addEventListener("webglcontextrestored", () => { try { renderer = createRenderer(); } catch { renderer = null; } renderGlobe(); });
    return (size) => {
      if (contextLost) return null;
      if (surface.width !== size) { surface.width = surface.height = size; gl.viewport(0, 0, size, size); }
      gl.uniform1f(rotationLocation, rotation * Math.PI / 180);
      gl.uniform1f(pitchLocation, pitch * Math.PI / 180);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      return surface;
    };
  }

  // Same orthographic projection in Canvas 2D when WebGL is unavailable.
  function renderRaster(size) {
    size = Math.min(size, 580);
    const key = `${size}:${rotation.toFixed(2)}:${pitch.toFixed(2)}`;
    if (key === rasterKey) return raster;
    if (!dayPixels) {
      const source = document.createElement("canvas");
      source.width = images.day.width; source.height = images.day.height;
      const sourceCtx = source.getContext("2d", { willReadFrequently: true });
      sourceCtx.drawImage(images.day, 0, 0);
      dayPixels = sourceCtx.getImageData(0, 0, source.width, source.height);
    }
    raster.width = raster.height = size;
    const pixels = rasterCtx.createImageData(size, size);
    const tilt = pitch * Math.PI / 180, spinAngle = rotation * Math.PI / 180;
    const cp = Math.cos(tilt), sp = Math.sin(tilt);
    for (let y = 0; y < size; y++) {
      const ny = (1 - (y + .5) / size * 2) * 1.08;
      for (let x = 0; x < size; x++) {
        const nx = ((x + .5) / size * 2 - 1) * 1.08;
        const d = nx * nx + ny * ny;
        if (d > 1) continue;
        const nz = Math.sqrt(1 - d);
        const latitude = Math.asin(Math.max(-1, Math.min(1, ny * cp + nz * sp)));
        const longitude = Math.atan2(nx, -ny * sp + nz * cp) - spinAngle;
        const u = ((longitude / (Math.PI * 2) + .5) % 1 + 1) % 1;
        const v = .5 - latitude / Math.PI;
        const sourceIndex = (Math.min(dayPixels.height - 1, Math.floor(v * dayPixels.height)) * dayPixels.width + Math.floor(u * dayPixels.width)) * 4;
        const targetIndex = (y * size + x) * 4;
        const light = .22 + Math.max(0, -.53 * nx + .49 * ny + .69 * nz) * .97;
        for (let channel = 0; channel < 3; channel++) pixels.data[targetIndex + channel] = dayPixels.data[sourceIndex + channel] * light;
        pixels.data[targetIndex + 3] = Math.min(255, (1 - Math.sqrt(d)) * size * 255);
      }
    }
    rasterCtx.putImageData(pixels, 0, 0);
    rasterKey = key;
    return raster;
  }

  function globeGeometry() {
    const rect = canvas.getBoundingClientRect();
    return { width: rect.width, height: rect.height, cx: rect.width * .5, cy: rect.height * .53, radius: Math.min(rect.width * .395, rect.height * .375) * zoom };
  }

  function drawArc(a, b, geometry) {
    const vector = (memory) => {
      const lat = memory.lat * Math.PI / 180, lon = memory.lon * Math.PI / 180;
      return [Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon)];
    };
    const start = vector(a), end = vector(b);
    const angle = Math.acos(Math.max(-1, Math.min(1, start.reduce((sum, value, i) => sum + value * end[i], 0))));
    if (angle < .0001 || Math.abs(Math.sin(angle)) < .00001) return;
    ctx.beginPath(); let connected = false;
    for (let step = 0; step <= 48; step++) {
      const t = step / 48;
      const v = start.map((value, i) => (value * Math.sin((1-t)*angle) + end[i] * Math.sin(t*angle)) / Math.sin(angle));
      const lat = Math.atan2(v[1], Math.hypot(v[0],v[2])) * 180 / Math.PI;
      const lon = Math.atan2(v[2],v[0]) * 180 / Math.PI;
      const point = project(lat, lon, geometry.radius, geometry.cx, geometry.cy);
      if (point.z > .015) { if (connected) ctx.lineTo(point.x, point.y); else ctx.moveTo(point.x, point.y); connected = true; }
      else connected = false;
    }
    ctx.stroke();
  }

  function paint() {
    frame = 0;
    if (!ready) { legacyRender(); return; }
    const g = globeGeometry();
    if (!g.width || !g.height) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const pixelWidth = Math.round(g.width * dpr), pixelHeight = Math.round(g.height * dpr);
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) { canvas.width = pixelWidth; canvas.height = pixelHeight; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, g.width, g.height);
    for (let i = 0; i < 72; i++) {
      const x = ((i * 137.53 + 17) % 997) / 997 * g.width;
      const y = ((i * 73.17 + 31) % 641) / 641 * g.height;
      ctx.fillStyle = `rgba(181,211,238,${.1 + i % 5 * .035})`;
      ctx.beginPath(); ctx.arc(x, y, i % 9 === 0 ? 1 : .55, 0, Math.PI * 2); ctx.fill();
    }
    const halo = ctx.createRadialGradient(g.cx, g.cy, g.radius*.94, g.cx, g.cy, g.radius*1.2);
    halo.addColorStop(0, "#4c99dd00"); halo.addColorStop(.2, "#4c99dd18"); halo.addColorStop(1, "#4c99dd00");
    ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(g.cx,g.cy,g.radius*1.2,0,Math.PI*2); ctx.fill();
    // Reserve the maximum zoom resolution once: resizing the GPU buffer on
    // every zoom frame causes allocation stalls during an otherwise smooth turn.
    const size = Math.min(1536, Math.ceil((g.radius / zoom) * maxZoom * 2.16 * dpr / 32) * 32);
    try {
      const surface = renderer ? renderer(size) : renderRaster(size);
      if (surface) ctx.drawImage(surface, g.cx-g.radius*1.08,g.cy-g.radius*1.08,g.radius*2.16,g.radius*2.16);
    } catch {
      ready = false; legacyRender(); return;
    }
    const timeline = document.querySelector(".globe-stage").classList.contains("timeline-mode");
    ctx.save();
    if (timeline) {
      ctx.strokeStyle = "rgba(174,209,235,.09)"; ctx.lineWidth = .6;
      for (let lat = -60; lat <= 60; lat += 30) drawSpherePath(g.radius, g.cx, g.cy, lat);
    }
    const route = photoRoute();
    ctx.strokeStyle = "rgba(236,196,148,.85)"; ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 4]); ctx.shadowColor = "#eac295"; ctx.shadowBlur = 5;
    for (let i = 1; i < route.length; i++) drawArc(route[i-1], route[i], g);
    ctx.restore();
    hitTargets = memories.filter((memory) => matches(memory) && Number.isFinite(memory.lat) && Number.isFinite(memory.lon)).map((memory) => ({ memory, ...project(memory.lat,memory.lon,g.radius,g.cx,g.cy), r: memory.id === selectedId ? 15 : 9 })).filter((point) => point.z > .035).sort((a,b) => a.z-b.z);
    hitTargets.forEach((target) => {
      const selected = target.memory.id === selectedId;
      const rgb = target.memory.type === "art" ? "199,189,223" : target.memory.type === "places" ? "138,201,213" : "238,194,145";
      const glow = ctx.createRadialGradient(target.x,target.y,1,target.x,target.y,selected?23:12);
      glow.addColorStop(0,`rgba(${rgb},${selected ? .6 : .35})`); glow.addColorStop(1,`rgba(${rgb},0)`);
      ctx.fillStyle=glow;ctx.beginPath();ctx.arc(target.x,target.y,selected?23:12,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=`rgb(${rgb})`;ctx.beginPath();ctx.arc(target.x,target.y,selected?4.5:3,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#fff5e6";ctx.beginPath();ctx.arc(target.x,target.y,selected?1.8:1.2,0,Math.PI*2);ctx.fill();
      if(selected){
        ctx.strokeStyle=`rgba(${rgb},.7)`;ctx.lineWidth=1;ctx.beginPath();ctx.arc(target.x,target.y,10,0,Math.PI*2);ctx.stroke();
        const text=target.memory.place.toLocaleUpperCase("it");
        ctx.font="9px DM Mono, monospace";ctx.textAlign="left";
        const tw=ctx.measureText(text).width;
        const tx=Math.min(target.x+17,g.width-tw-24),ty=Math.max(116,target.y-15);
        ctx.strokeStyle="#e3bd9480";ctx.beginPath();ctx.moveTo(target.x+8,target.y-6);ctx.lineTo(tx-3,ty+5);ctx.stroke();
        ctx.fillStyle="#0a1425dd";ctx.fillRect(tx-5,ty-10,tw+10,18);
        ctx.fillStyle="#f3ddc2";ctx.fillText(text,tx,ty+2);
      }
    });
  }

  renderGlobe = () => { if (!frame) frame = requestAnimationFrame(paint); };
  window.addEventListener("resize", renderGlobe);
  const resizeObserver = new ResizeObserver(() => {
    renderGlobe();
    if (streetActive) streetMap.invalidateSize({ pan: false });
  });
  resizeObserver.observe(wrap);

  function stopFlight() {
    cancelAnimationFrame(flyFrame);
    flyFrame = 0;
    flightMemoryId = null;
    returnToStreets = false;
    wrap.classList.remove("is-flying");
  }
  function stopAuto() {
    autoRotate=false;cancelAnimationFrame(autoFrame);autoFrame=0;
    spin.textContent="▷";spin.setAttribute("aria-pressed","false");spin.setAttribute("aria-label","Avvia rotazione automatica");
  }
  function animateSpin(time) {
    if(!autoRotate || document.hidden || !inViewport || reducedMotion.matches) { autoFrame=0;return; }
    const delta=Math.min(50,time-(animateSpin.previous||time));animateSpin.previous=time;
    if(!dragging && !flyFrame){rotation+=delta*.0025;renderGlobe();}
    autoFrame=requestAnimationFrame(animateSpin);
  }
  spin.addEventListener("click",()=>{
    if(autoRotate){stopAuto();return;}
    stopFlight();autoRotate=true;spin.textContent="Ⅱ";spin.setAttribute("aria-pressed","true");spin.setAttribute("aria-label","Ferma rotazione automatica");
    if(reducedMotion.matches){rotation+=12;renderGlobe();stopAuto();return;}
    animateSpin.previous=0;autoFrame=requestAnimationFrame(animateSpin);
  });
  document.addEventListener("visibilitychange",()=>{
    if(document.hidden){cancelAnimationFrame(autoFrame);autoFrame=0;}
    else if(autoRotate && !autoFrame){animateSpin.previous=0;autoFrame=requestAnimationFrame(animateSpin);}
  });
  new IntersectionObserver(([entry])=>{
    inViewport=entry.isIntersecting;
    if(!inViewport){cancelAnimationFrame(autoFrame);autoFrame=0;}
    else if(autoRotate&&!autoFrame){animateSpin.previous=0;autoFrame=requestAnimationFrame(animateSpin);}
  }).observe(wrap);
  reducedMotion.addEventListener("change",()=>{stopAuto();renderGlobe();});
  canvas.addEventListener("pointerdown",()=>{stopFlight();stopAuto();});
  ["rotate-left","rotate-right","reset-globe"].forEach((id)=>document.getElementById(id).addEventListener("click",()=>{stopFlight();stopAuto();renderGlobe();}));
  function changeZoom(amount) {
    stopFlight();
    stopAuto();
    if (streetActive) {
      if (amount > 0) streetMap.zoomIn();
      else streetMap.zoomOut();
      return;
    }
    zoom = Math.max(minZoom, Math.min(maxZoom, zoom + amount));
    if (amount > 0 && zoom >= maxZoom && openStreetView()) return;
    renderGlobe();
  }
  // Replace the base demo's zoom actions before its 1.45× limit can clamp them.
  [["zoom-in", .2], ["zoom-out", -.2]].forEach(([id, amount]) => {
    document.getElementById(id).addEventListener("click", (event) => {
      event.stopImmediatePropagation();
      changeZoom(amount);
    }, { capture: true });
  });
  canvas.addEventListener("keydown",(event)=>{
    const actions={ArrowLeft:()=>rotation-=10,ArrowRight:()=>rotation+=10,ArrowUp:()=>pitch=Math.min(70,pitch+8),ArrowDown:()=>pitch=Math.max(-70,pitch-8),"+":()=>changeZoom(.2),"=":()=>changeZoom(.2),"-":()=>changeZoom(-.2)};
    if(actions[event.key]){event.preventDefault();stopFlight();stopAuto();actions[event.key]();renderGlobe();}
  });
  const originalSelectMemory = selectMemory;
  selectMemory = (id) => {
    originalSelectMemory(id);
    const memory = getMemory(id);
    document.querySelector(".explorer-layout").classList.remove("detail-hidden");
    // A list row also bubbles to the existing delegated selection handler.
    if (flightMemoryId === id && flyFrame) return;
    const reopenStreets = streetActive || returnToStreets;
    if (streetActive) closeStreetView();
    stopFlight();
    stopAuto();
    if (!memory || !Number.isFinite(memory.lat) || !Number.isFinite(memory.lon)) return;
    returnToStreets = reopenStreets;

    const startRotation = rotation;
    const startPitch = pitch;
    const startZoom = zoom;
    const difference = (((-memory.lon - startRotation) % 360 + 540) % 360) - 180;
    // Match the destination latitude exactly, placing its pin at the globe's center.
    const targetPitch = Math.max(-90, Math.min(90, memory.lat));
    const targetZoom = memoryZoom;
    const angularDistance = Math.hypot(difference, targetPitch - startPitch);
    const duration = 3200 + Math.min(2800, angularDistance * 18);
    const easeInOut = (value) => (1 - Math.cos(Math.PI * value)) / 2;

    // The user explicitly requested animated travel on memory selection.
    // Keep that interaction even with reduced motion; decorative effects and
    // unattended auto-rotation still honor the system preference.
    flightMemoryId = id;
    wrap.classList.add("is-flying");
    let previousTime;
    let elapsed = 0;
    function fly(time) {
      // A delayed frame or a background tab slows the trip instead of skipping
      // a large part of the rotation when rendering resumes.
      if (previousTime !== undefined) elapsed += Math.max(0, Math.min(40, time - previousTime));
      previousTime = time;
      const t = Math.min(1, elapsed / duration);
      const turn = easeInOut(t);
      rotation = startRotation + difference * turn;
      pitch = startPitch + (targetPitch - startPitch) * turn;
      zoom = startZoom + (targetZoom - startZoom) * turn;
      renderGlobe();
      if (t < 1) flyFrame = requestAnimationFrame(fly);
      else {
        const reopenStreets = returnToStreets;
        stopFlight();
        if (reopenStreets) openStreetView();
      }
    }
    flyFrame = requestAnimationFrame(fly);
  };
  document.querySelector("#view-switch").addEventListener("click",()=>{
    const timeline=document.querySelector(".globe-stage").classList.contains("timeline-mode");
    document.querySelectorAll("#view-switch span").forEach((span,index)=>span.classList.toggle("view-active",index===(timeline?1:0)));
    renderGlobe();
  });

  document.querySelectorAll(".intro-row,.explorer-layout").forEach((element)=>element.classList.add("atlas-enter"));
  if("IntersectionObserver" in window){
    const observer=new IntersectionObserver((entries)=>entries.forEach((entry)=>{if(entry.isIntersecting){entry.target.classList.add("is-visible");observer.unobserve(entry.target);}}),{threshold:.08});
    document.querySelectorAll(".memory-strip,.story-band,.proof-section").forEach((element)=>{element.classList.add("atlas-reveal");observer.observe(element);});
  }

  pitch = 24;
  const timeout = setTimeout(()=>finishLoading(false),12000);
  Promise.allSettled([
    loadImage("day","assets/earth-day.jpg"),
    loadImage("night","assets/earth-night.png"),
    loadImage("clouds","assets/earth-clouds.png")
  ]).then(()=>{
    clearTimeout(timeout);
    if(!images.day){finishLoading(false);return;}
    try{renderer=createRenderer();}catch{renderer=null;}
    finishLoading(true);
  });
})();
