const { Gpio } = require('onoff');
const { ipcMain } = require('electron');

const button = new Gpio(17, 'in', 'both'); // 使用GPIO 17作为按钮输入

button.watch((err, value) => {
    if (err) {
        console.error('There was an error', err);
        return;
    }
    if (value === 1) { // 按钮被按下
        ipcMain.emit('gpio-button-pressed');
    }
});

process.on('SIGINT', () => {
    button.unexport();
    process.exit();
});
