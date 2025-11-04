const os = require('os');
const path = require('path');
console.log('OS: ' + os.type());
console.log('Architecture: ' + os.arch());
console.log('CPU Cores: ' + os.cpus().length);
console.log('Total Memory: ' + (os.totalmem()) + ' GB');
console.log('System Uptime: ' + (os.uptime() / 3600).toFixed(2) + ' hours');
console.log('Current Logged User: ' + os.userInfo().username);
console.log('Node Path: ' + process.execPath);

