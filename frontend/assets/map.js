// 初始化 OpenStreetMap
var map = L.map('map').setView([24.787, 120.999], 16);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// 加入所有建築/Spot 的 Marker
function addCampusMarkers() {
    for (let name in coords) {
        let pos = coords[name];

        L.marker(pos)
            .addTo(map)
            .bindPopup(`<b>${name}</b>`);
    }
}

addCampusMarkers();


// =============================
// （預留）畫路線函式：之後串接後端 Dijkstra 使用
// =============================
function drawRoute(pathNames) {
    if (pathNames.length === 0) return;

    let points = pathNames.map(name => coords[name]);

    L.polyline(points, {
        color: 'red',
        weight: 5
    }).addTo(map);

    map.fitBounds(points);
}


// =============================
// （預留）點 marker 查資料：之後可呼叫後端 /api/building/events
// =============================
function onMarkerClick(name) {

    // TODO: 之後加入 fetch 後端
    // fetch(`/api/building/${name}/events`)

    alert("你點擊了：" + name);
}
