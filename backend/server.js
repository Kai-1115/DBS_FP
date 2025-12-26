const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, '../frontend')));

const db = new sqlite3.Database('./campus.db');

// 初始化資料庫與 CSV 匯入邏輯
db.serialize(() => {
    // 1. 建立資料表 (欄位：名稱、緯度、經度)
    db.run("CREATE TABLE IF NOT EXISTS locations (name TEXT PRIMARY KEY, lat REAL, lng REAL)");

    // 2. 檢查資料庫是否已有資料，若無則從 CSV 匯入
    db.get("SELECT COUNT(*) as count FROM locations", (err, row) => {
        if (row.count === 0) {
            console.log("資料庫為空，開始從 spot.csv 匯入資料...");
            
            const csvFilePath = path.join(__dirname, 'spot.csv');
            
            // 使用串流 (Stream) 讀取 CSV，適合處理大量數據
            fs.createReadStream(csvFilePath)
                .pipe(csv())
                .on('data', (data) => {
                    // 根據你的 CSV 結構：type, id, lat, lon
                    // 這裡我們將名稱定義為 "地點_ID"
                    const name = `地點_${data.id}`;
                    const lat = parseFloat(data.lat);
                    const lng = parseFloat(data.lon);

                    db.run("INSERT OR IGNORE INTO locations (name, lat, lng) VALUES (?, ?, ?)", [name, lat, lng]);
                })
                .on('end', () => {
                    console.log("CSV 資料匯入完成！");
                });
        } else {
            console.log(`資料庫已有 ${row.count} 筆資料，跳過匯入。`);
        }
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// API: 獲取所有座標
app.get('/api/coords', (req, res) => {
    db.all("SELECT * FROM locations", [], (err, rows) => {
        const coordsMap = {};
        rows.forEach(row => { coordsMap[row.name] = [row.lat, row.lng]; });
        res.json(coordsMap);
    });
});

// API: 簡單路徑規劃 (起點 -> 終點)
app.get('/api/route', (req, res) => {
    const { start, end } = req.query;
    if (!start || !end) return res.status(400).json({ error: "缺少參數" });

    db.all("SELECT * FROM locations WHERE name IN (?, ?)", [start, end], (err, rows) => {
        if (rows.length < 2) return res.status(404).json({ error: "找不到地點" });
        res.json({ path: [start, end] });
    });
});

const PORT = 8000;
app.listen(PORT, () => {
    console.log(`伺服器啟動於 http://localhost:${PORT}`);
});