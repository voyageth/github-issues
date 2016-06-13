const ipc = require('electron').ipcMain;
var configuration = require('../../configuration');
const GitHubApi = require('github-api');
const GitHub = require('github');


ipc.on('get-user-id-list-request', function (event, arg) {
    var githubUserIdList = configuration.readSettings('githubUserIdList');
    var list = githubUserIdList.split(",");
    event.sender.send('get-user-id-list-response', list);
})

ipc.on('get-issue-list-request', function (event, arg) {
    var gitToken = configuration.readSettings('githubToken');
    var gitAddress = configuration.readSettings('githubAddress');

    var github = new GitHub({
        // optional
        debug: true,
        protocol: "https",
        host: gitAddress,
        pathPrefix: "/api/v3", // for some GHEs; none for GitHub
        timeout: 5000,
        headers: {
            "user-agent": "voyageth-GitHub-App" // GitHub is happy with a unique user agent
        },
        followRedirects: true, // default: true; there's currently an issue with non-get redirects, so allow ability to disable follow-redirects
        includePreview: true // default: false; includes accept headers to allow use of stuff under preview period
    });

    github.authenticate({
        type: "oauth",
        token: gitToken
    });

    github.activity.getEventsForUser({
        headers: {
            "Authorization": "token " + gitToken
        },
        user: arg
    }, function(err, res) {
        console.log(err)
        event.sender.send('get-issue-list-response', res)
    });

    // var githubApi = new GitHubApi({
    //     token: gitToken
    // });
    // githubApi.__apiBase = gitAddress;
    //
    // var issues = githubApi.getIssues("band-ds", "feed");
    // console.log(issues);
    // issues.getIssue(10, function(err, issues) {
    //     console.log(err);
    //     event.sender.send('get-issue-list-response', issues)
    // });
})

