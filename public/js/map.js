const mapDiv = document.getElementById("map");

// Run ONLY if map exists
if (mapDiv) {
  const lat = parseFloat(mapDiv.dataset.lat);
  const lng = parseFloat(mapDiv.dataset.lng);

  const map = L.map('map').setView([lat, lng], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  L.marker([lat, lng]).addTo(map)
    .bindPopup("📍 Listing location")
    .openPopup();
}