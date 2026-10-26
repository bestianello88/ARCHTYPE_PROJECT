# Street map

- [Leaflet 1.9.4](https://leafletjs.com/reference.html) is stored locally as [leaflet.js](./leaflet.js) and [leaflet.css](./leaflet.css). See its [BSD 2-Clause license](./leaflet-LICENSE.txt).
- Street tiles and their labels come from [OpenStreetMap](https://www.openstreetmap.org/copyright), using `https://tile.openstreetmap.org/{z}/{x}/{y}.png`. Map attribution stays visible in the bottom-right corner.
- The Satellite option uses [Esri World Imagery](https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9), combining satellite and aerial photography. Credits: Esri, Vantor, Earthstar Geographics, and the GIS User Community. The imagery is subject to the publisher's terms linked from that item; it is not live imagery and detail varies by location. Tiles are requested online only for the visible area.
- Switching Cartography / Satellite preserves the current map center, zoom, and memory marker. The selected style is retained when returning from the globe or visiting another memory during the current page session.
- Tiles are requested only when the street view is opened, for the visible area. Browser caching is preserved; there is no tile prefetch or offline downloader. This follows the [tile usage policy](https://operations.osmfoundation.org/policies/tiles/).
- The street view starts at zoom 17 and supports zoom 19. It requires an internet connection. The globe remains available independently of tile availability.
- Select another memory in street mode to travel via the globe before opening the destination's street map. Close the map to return to the globe centered on the current map location.
