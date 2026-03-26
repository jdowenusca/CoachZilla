import { escapeHtml } from "../utils/helpers.js";

export default class LeafletMapService {
  renderStationMap(container, stations = []) {
    if (!container) return;

    if (!stations.length) {
      container.innerHTML = `
        <div class="map-label">Route / Map Placeholder</div>
        <p>No stations are available yet.</p>
      `;
      return;
    }

    const stationMarkup = stations
      .slice(0, 4)
      .map(
        (station, index) => `
          <div class="mock-route-point route-point-${(index % 3) + 1}">
            ${escapeHtml(station.getName())}
          </div>
        `
      )
      .join("");

    container.innerHTML = `
      <div class="map-label">Leaflet Map Service Placeholder</div>
      ${stationMarkup}
    `;
  }
}
