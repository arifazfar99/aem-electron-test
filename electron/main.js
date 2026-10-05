const { app, BrowserWindow, session } = require('electron');
const path = require('path');

function createWindow() {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({
        responseHeaders: {
            ...details.responseHeaders,
            'Content-Security-Policy': [
            "default-src 'self'; style-src 'self' 'unsafe-inline'; connect-src http://test-demo.aemenersol.com"
            ]
        }
        });
    });
    
    const win = new BrowserWindow({
        width: 1280,
        height: 800,
    });

    win.loadFile(path.join(__dirname, '../dist/aem-angular-test/index.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});