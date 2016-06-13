const ipc = require('electron').ipcRenderer

const setGithubAddressButton = document.getElementById('set-github-address-button');
const setGithubAddressInput = document.getElementById('set-github-address-input');
setGithubAddressButton.addEventListener('click', function () {
    ipc.send('store-github-address-request', setGithubAddressInput.value)
})
ipc.on('store-github-address-response', function (event, arg) {
    const message = `Asynchronous message reply: ${arg}`;
    console.log(message);
})

const setGithubTokenButton = document.getElementById('set-github-token-button');
const setGithubTokenInput = document.getElementById('set-github-token-input');
setGithubTokenButton.addEventListener('click', function () {
    ipc.send('store-github-token-request', setGithubTokenInput.value)
})
ipc.on('store-github-token-response', function (event, arg) {
    const message = `Asynchronous message reply: ${arg}`;
    console.log(message);
})

const setGithubUserIdListButton = document.getElementById('set-github-user-id-list-button');
const setGithubUserIdListInput = document.getElementById('set-github-user-id-list-input');
setGithubUserIdListButton.addEventListener('click', function () {
    ipc.send('store-github-user-id-list-request', setGithubUserIdListInput.value)
})
ipc.on('store-github-user-id-list-response', function (event, arg) {
    const message = `Asynchronous message reply: ${arg}`;
    console.log(message);
})


ipc.send('get-settings-request', "request");

ipc.on('get-settings-response', function (event, arg) {
    const message = `Asynchronous message reply: ${arg}`;
    console.log(message);
    if (!message) {
        return;
    }
    
    setGithubAddressInput.value = arg.githubAddress;
    setGithubTokenInput.value = arg.githubToken;
    setGithubUserIdListInput.value = arg.githubUserIdList;
})