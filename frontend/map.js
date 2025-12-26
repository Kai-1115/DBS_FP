// ==========================
// 初始化地圖
// ==========================
var map = L.map('map').setView([24.787, 120.999], 16);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);


// ==========================
// 地圖上插入建築 marker
// ==========================
for (let name in coords) {
    L.marker(coords[name]).addTo(map).bindPopup(`<b>${name}</b>`);
}


// ==========================
// 路線繪製 (from backend)
// ==========================
var currentPolyline = null;

async function searchRoute() {
    let start = document.getElementById("start-input").value.trim();
    let end = document.getElementById("end-input").value.trim();

    if (!(start in coords) || !(end in coords)) {
        alert("起點或終點不存在！");
        return;
    }

    let res = await fetch(`http://127.0.0.1:8000/api/route?start=${start}&end=${end}`);
    let data = await res.json();

    if (data.error) {
        alert("找不到路線！");
        return;
    }

    let points = data.path.map(n => coords[n]);

    if (currentPolyline) map.removeLayer(currentPolyline);

    currentPolyline = L.polyline(points, {
        color: "red",
        weight: 6
    }).addTo(map);

    map.fitBounds(points);
}


// ==========================
// Routing Panel toggle
// ==========================
function toggleRoutePanel() {
    document.getElementById("route-panel").classList.toggle("active");
}
