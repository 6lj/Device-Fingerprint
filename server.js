const http = require('http');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const hostname = '127.0.0.1';
const port = 3000;

const db = new sqlite3.Database('./fingerprint.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS fingerprints (
            canvasFingerprint TEXT PRIMARY KEY,
            userAgent TEXT,
            screenResolution TEXT,
            clickCount INTEGER DEFAULT 10
        )`);
    }
});

const server = http.createServer((req, res) => {
    console.log(`Received request: ${req.method} ${req.url}`);

    if (req.method === 'POST' && req.url === '/get-fingerprint') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const clientFingerprintData = JSON.parse(body);
                const { canvasFingerprint, userAgent, screenResolution } = clientFingerprintData;

                db.get(
                    `SELECT clickCount FROM fingerprints WHERE canvasFingerprint = ?`,
                    [canvasFingerprint],
                    (err, row) => {
                        if (err) {
                            console.error('Database error:', err);
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'Database error' }));
                            return;
                        }

                        if (row) {
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ clickCount: row.clickCount }));
                        } else {
                            db.run(
                                `INSERT INTO fingerprints (canvasFingerprint, userAgent, screenResolution, clickCount) VALUES (?, ?, ?, ?)`,
                                [canvasFingerprint, userAgent, screenResolution, 10],
                                (err) => {
                                    if (err) {
                                        console.error('Error inserting data:', err);
                                        res.writeHead(500, { 'Content-Type': 'application/json' });
                                        res.end(JSON.stringify({ error: 'Database error' }));
                                        return;
                                    }
                                    res.writeHead(200, { 'Content-Type': 'application/json' });
                                    res.end(JSON.stringify({ clickCount: 10 }));
                                }
                            );
                        }
                    }
                );
            } catch (error) {
                console.error('Error processing fingerprint data:', error);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid data' }));
            }
        });
    } else if (req.method === 'POST' && req.url === '/update-clicks') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const { canvasFingerprint, clickCount } = JSON.parse(body);
                db.run(
                    `UPDATE fingerprints SET clickCount = ? WHERE canvasFingerprint = ?`,
                    [clickCount, canvasFingerprint],
                    (err) => {
                        if (err) {
                            console.error('Error updating click count:', err);
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'Database error' }));
                            return;
                        }
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true }));
                    }
                );
            } catch (error) {
                console.error('Error processing click update:', error);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid data' }));
            }
        });
    } else {
        let filePath = '.' + req.url;
        if (filePath === './') {
            filePath = './index.html';
        }

        const extname = String(path.extname(filePath)).toLowerCase();
        const contentType = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'text/javascript',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon'
        }[extname] || 'application/octet-stream';

        fs.readFile(filePath, (error, content) => {
            if (error) {
                if (error.code == 'ENOENT') {
                    res.writeHead(404);
                    res.end('404: File not found!', 'utf-8');
                } else {
                    res.writeHead(500);
                    res.end(`500: Server error: ${error.code}`, 'utf-8');
                }
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });
    }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
    console.log('Open this link in your browser to view the simulation.');
});