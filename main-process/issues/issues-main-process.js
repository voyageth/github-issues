const ipc = require('electron').ipcMain;
var configuration = require('../../configuration');
// const GitHubApi = require('github-api');
// https://github.com/mikedeboer/node-github
const GitHub = require('github');

var gitToken = configuration.readSettings('githubToken');
var gitAddress = configuration.readSettings('githubAddress');

var github = new GitHub({
    // optional
    debug: true,
    protocol: "https",
    host: gitAddress,
    pathPrefix: "", // for some GHEs; none for GitHub
    //pathPrefix: "/api/v3", // for some GHEs; none for GitHub
    timeout: 5000,
    headers: {
        "user-agent": "voyageth-GitHub-App" // GitHub is happy with a unique user agent
    },
    followRedirects: true, // default: true; there's currently an issue with non-get redirects, so allow ability to disable follow-redirects
    includePreview: true // default: false; includes accept headers to allow use of stuff under preview period
});

if(gitToken) {
    github.authenticate({
        type: "oauth",
        token: gitToken
    });
}

ipc.on('get-user-id-list-request', function (event, arg) {
    var githubUserIdList = configuration.readSettings('githubUserIdList');
    var list = githubUserIdList.split(",");
    event.sender.send('get-user-id-list-response', list);
});


// TODO add database. https://github.com/louischatriot/nedb


ipc.on('get-issue-list-request', function (event, arg) {
    // TODO add organization config
    // TODO get organization repository list
    // TODO get repository contributor list
    // TODO get event from org + repo -> filter by user (parallel)
    github.activity.getEventsForRepo({
        headers: {
            "Authorization": "token " + gitToken
        },
        user: "band-ds",
        repo: "stats"
    }, function (err, res) {
        console.log(err);
        console.log(res);
        event.sender.send('get-issue-list-response', res)
    });
});


// https://mikedeboer.github.io/node-github/#api-repos-getForOrg
ipc.on('repos-getForOrg', function (event, arg) {
    github.repos.getForOrg({
        headers: {
            "Authorization": "token " + gitToken
        },
        org: "band-ds"
    }, function (err, res) {
        console.log(err);
        console.log(res);
        event.sender.send('issues-getForRepo-response', res)
    });
});

// https://mikedeboer.github.io/node-github/#api-orgs-getMembers
ipc.on('orgs-getMembers', function (event, arg) {
    github.orgs.getMembers({
        headers: {
            "Authorization": "token " + gitToken
        },
        org: "band-ds"
    }, function (err, res) {
        console.log(err);
        console.log(res);
        event.sender.send('issues-getForRepo-response', res)
    });
});


// https://mikedeboer.github.io/node-github/#api-issues-getForRepo
ipc.on('issues-getForRepo', function (event, arg) {
    github.issues.getForRepo({
        headers: {
            "Authorization": "token " + gitToken
        },
        user: "band-ds",
        repo: "stats"
    }, function (err, res) {
        console.log(err);
        console.log(res);
        event.sender.send('issues-getForRepo-response', res)
    });
});

// https://mikedeboer.github.io/node-github/#api-issues-getCommentsForRepo
ipc.on('issues-getCommentsForRepo', function (event, arg) {
    github.issues.getCommentsForRepo({
        headers: {
            "Authorization": "token " + gitToken
        },
        user: "band-ds",
        repo: "stats"
    }, function (err, res) {
        console.log(err);
        console.log(res);
        event.sender.send('issues-getForRepo-response', res)
    });
});

// https://mikedeboer.github.io/node-github/#api-issues-getForRepo
// github.issues.getForRepo({
//         headers: {
//             "Authorization": "token " + gitToken
//         },
//         user: "band-ds",
//         repo: "stats"
//     }, function (err, res) {
//         console.log(err);
//         event.sender.send('get-issue-list-response', res)
//     }
// );

