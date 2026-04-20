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

  // ============================================
  // TALON - ADDED: Color-coded marker icons
  // Uses Leaflet color marker images hosted on GitHub.
  //
  // Color guide:
  //   green  = start station
  //   red    = end station
  //   blue   = middle stop (default unselected)
  //   orange = refuel station
  //   grey   = unselected / background station
  // ============================================
  _getMarkerIcon(color) {
    return L.icon({
      iconUrl: `https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-2x-${color}.png`,
      shadowUrl: "https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
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

  // ============================================
  // TALON - UPDATED: renderStations
  // Now accepts an optional routeOrderIds array
  // to determine marker color based on role:
  //   - First selected  → green  (Start)
  //   - Last selected   → red    (End)
  //   - Middle selected → blue   (Stop)
  //   - Not selected    → grey
  //
  // Also marks refuel stations with orange when
  // a refuelStopIds array is provided.
  // ============================================
  renderStations(stations = [], onSelect = null, selectedIds = [], refuelStopIds = []) {
    if (!this.map) return;

    this.clearMarkers();

    stations.forEach((station) => {
      const lat = Number(station.latitude);
      const lng = Number(station.longitude);

      if (Number.isNaN(lat) || Number.isNaN(lng)) {
        return;
      }

      const stationIdStr = String(station.id);
      const selectedIndex = selectedIds.indexOf(stationIdStr);
      const isSelected = selectedIndex !== -1;
      const isRefuel = refuelStopIds.includes(stationIdStr);

      // Determine marker color
      let markerColor = "grey";
      let roleLabel = null;

      if (isSelected) {
        if (selectedIndex === 0) {
          markerColor = "green";
          roleLabel = "Start";
        } else if (selectedIndex === selectedIds.length - 1) {
          markerColor = "red";
          roleLabel = "End";
        } else {
          markerColor = "blue";
          roleLabel = `Stop ${selectedIndex}`;
        }
      } else if (isRefuel) {
        markerColor = "orange";
        roleLabel = "Refuel Stop";
      }

      const icon = this._getMarkerIcon(markerColor);
      const marker = L.marker([lat, lng], { icon }).addTo(this.map);

      const typeLabel = station.stationType || station.fuelType || "Station";

      marker.bindPopup(`
        <div>
          <strong>${station.name}</strong><br>
          ${roleLabel ? `<em>${roleLabel}</em><br>` : ""}
          Type: ${typeLabel}<br>
          Lat: ${lat}<br>
          Lng: ${lng}<br>
          <button type="button" class="leaflet-select-station-btn" data-station-id="${station.id}">
            Add to Route
          </button>
        </div>
      `);

      if (roleLabel) {
        marker.bindTooltip(roleLabel, {
          permanent: true,
          direction: "top",
          offset: [0, -38]
        });
      }

      marker.on("click", () => {
        if (typeof onSelect === "function") {
          onSelect(stationIdStr);
        }
      });

      marker.on("popupopen", () => {
        const button = document.querySelector(
          `.leaflet-select-station-btn[data-station-id="${station.id}"]`
        );

        if (button) {
          button.addEventListener("click", () => {
            if (typeof onSelect === "function") {
              onSelect(stationIdStr);
            }
          });
        }
      });

      this.markers.push(marker);
    });

    if (stations.length > 0) {
      const bounds = L.latLngBounds(
        stations
          .filter(
            (station) =>
              !Number.isNaN(Number(station.latitude)) &&
              !Number.isNaN(Number(station.longitude))
          )
          .map((station) => [Number(station.latitude), Number(station.longitude)])
      );

      if (bounds.isValid()) {
        this.map.fitBounds(bounds, { padding: [30, 30] });
      }
    }
  }

  // ============================================
  // TALON - UPDATED: drawPreviewRoute
  // Now renders a styled blue polyline with
  // visible weight and opacity.
  //
  // Pass the ordered array of selected stations
  // (not all stations) to draw only the route path.
  // ============================================
  drawPreviewRoute(stations = []) {
    if (!this.map) return;

    this.clearRouteLine();

    const points = stations
      .map((station) => [Number(station.latitude), Number(station.longitude)])
      .filter(([lat, lng]) => !Number.isNaN(lat) && !Number.isNaN(lng));

    if (points.length < 2) return;

    this.routeLine = L.polyline(points, {
      color: "#3b82f6",   // blue route line
      weight: 4,
      opacity: 0.85,
      lineJoin: "round"
    }).addTo(this.map);

    // Fit map to show full route
    this.map.fitBounds(this.routeLine.getBounds(), { padding: [40, 40] });
  }

  focusStation(station) {
    if (!this.map || !station) return;

    const lat = Number(station.latitude);
    const lng = Number(station.longitude);

    if (Number.isNaN(lat) || Number.isNaN(lng)) return;

    this.map.setView([lat, lng], 14);
  }
}