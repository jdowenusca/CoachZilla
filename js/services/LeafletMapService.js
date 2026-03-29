export default class LeafletMapService {
  constructor() {
    this.map = null;
    this.markers = [];
    this.routeLine = null;
  }

  initializeMap(containerId, center = [33.485, -81.97], zoom = 12) {
    if (typeof L === "undefined") {
      throw new Error("Leaflet is not loaded. Make sure the Leaflet script is included in search.html.");
    }

    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    this.map = L.map(containerId).setView(center, zoom);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors"
    }).addTo(this.map);

    return this.map;
  }

  clearMarkers() {
    this.markers.forEach((marker) => marker.remove());
    this.markers = [];
  }

  clearRouteLine() {
    if (this.routeLine) {
      this.routeLine.remove();
      this.routeLine = null;
    }
  }

  renderStations(stations = [], onSelect = null, selectedIds = []) {
    if (!this.map) return;

    this.clearMarkers();

    stations.forEach((station) => {
      const lat = Number(station.latitude);
      const lng = Number(station.longitude);

      if (Number.isNaN(lat) || Number.isNaN(lng)) {
        return;
      }

      const isSelected = selectedIds.includes(String(station.id));

      const marker = L.marker([lat, lng]).addTo(this.map);

      const typeLabel = station.stationType || station.fuelType || "Station";

      marker.bindPopup(`
        <div>
          <strong>${station.name}</strong><br>
          Type: ${typeLabel}<br>
          Lat: ${lat}<br>
          Lng: ${lng}<br>
          <button type="button" class="leaflet-select-station-btn" data-station-id="${station.id}">
            Add to Route
          </button>
        </div>
      `);

      if (isSelected) {
        marker.bindTooltip("Selected", {
          permanent: false,
          direction: "top"
        });
      }

      marker.on("click", () => {
        if (typeof onSelect === "function") {
          onSelect(String(station.id));
        }
      });

      marker.on("popupopen", () => {
        const button = document.querySelector(
          `.leaflet-select-station-btn[data-station-id="${station.id}"]`
        );

        if (button) {
          button.addEventListener("click", () => {
            if (typeof onSelect === "function") {
              onSelect(String(station.id));
            }
          });
        }
      });

      this.markers.push(marker);
    });

    if (stations.length > 0) {
      const bounds = L.latLngBounds(
        stations
          .filter((station) => !Number.isNaN(Number(station.latitude)) && !Number.isNaN(Number(station.longitude)))
          .map((station) => [Number(station.latitude), Number(station.longitude)])
      );

      if (bounds.isValid()) {
        this.map.fitBounds(bounds, { padding: [30, 30] });
      }
    }
  }

  drawPreviewRoute(stations = []) {
    if (!this.map) return;

    this.clearRouteLine();

    const points = stations
      .map((station) => [Number(station.latitude), Number(station.longitude)])
      .filter(([lat, lng]) => !Number.isNaN(lat) && !Number.isNaN(lng));

    if (points.length < 2) return;

    this.routeLine = L.polyline(points).addTo(this.map);
  }

  focusStation(station) {
    if (!this.map || !station) return;

    const lat = Number(station.latitude);
    const lng = Number(station.longitude);

    if (Number.isNaN(lat) || Number.isNaN(lng)) return;

    this.map.setView([lat, lng], 14);
  }
}