const ipc = require('electron').ipcMain;
var configuration = require('../../configuration');

ipc.on('store-github-address-request', function (event, arg) {
    configuration.saveSettings("githubAddress", arg);
    event.sender.send('store-github-address-response', 'finish');
})

ipc.on('store-github-token-request', function (event, arg) {
    configuration.saveSettings("githubToken", arg);
    event.sender.send('store-github-token-response', 'finish');
})

ipc.on('store-github-user-id-list-request', function (event, arg) {
    configuration.saveSettings("githubUserIdList", arg);
    event.sender.send('store-github-user-id-list-response', 'finish');
})

ipc.on('get-settings-request', function (event, arg) {
    var settings = {
        "githubAddress":configuration.readSettings("githubAddress")
        , "githubToken":configuration.readSettings("githubToken")
        , "githubUserIdList":configuration.readSettings("githubUserIdList")
    }
    event.sender.send('get-settings-response', settings);
})
