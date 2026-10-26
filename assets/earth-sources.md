# Earth textures

Equirectangular Earth maps distributed with the official three.js examples:

- [Day surface](https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg) → `earth-day.jpg`
- [Night lights](https://threejs.org/examples/textures/planets/earth_lights_2048.png) → `earth-night.png`
- [Cloud layer](https://threejs.org/examples/textures/planets/earth_clouds_1024.png) → `earth-clouds.png`

Downloaded 2026-10-26. The maps are stored locally so the globe does not depend on a third-party texture service at runtime. These are static visual maps; lighting is artistic, not a live day/night model.

The presentation layer is in `../atlas-visual.css` and `../atlas-visual.js`. The original memory, import and ledger behavior remains in `../experience.js`. Load the visual script after the original script: it reuses its projection, coordinates and selection state.
