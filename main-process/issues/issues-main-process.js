const {app} = require('electron')
const ipc = require('electron').ipcMain;
var configuration = require('../../configuration');
// const GitHubApi = require('github-api');
// https://github.com/mikedeboer/node-github
const GitHub = require('github');

var gitToken = configuration.readSettings('githubToken');
var gitAddress = configuration.readSettings('githubAddress');
var gitOrg = configuration.readSettings('githubOrganization');

const Datastore = require('nedb');
const path = require('path');
console.log("userDataPath : " + app.getPath('userData'));
const repoDB = new Datastore({ filename: path.join(app.getPath('userData'), 'repo.db'), autoload: true });
const postDB = new Datastore({ filename: path.join(app.getPath('userData'), 'post.db'), autoload: true });
const commentDB = new Datastore({ filename: path.join(app.getPath('userData'), 'comment.db'), autoload: true });

repoDB.insert({a:"test"}, function(err, doc){console.log(err);console.log(doc);});

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
    followRedirects: true // default: true; there's currently an issue with non-get redirects, so allow ability to disable follow-redirects
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
    userId = arg;

    // get organization repository list
    github.repos.getForOrg({
        headers: {
            "Authorization": "token " + gitToken
        },
        org: gitOrg
    }, function (err, res) {
        if (err) {
            console.log("getForOrg error : " + err);
        }

        res.forEach(function(repo){
            if (!repo || !(repo.id)) {
                return;
            }
            
            repoDB.findOne({id: repo.id}, function(err, getResult){
                if (err) {
                    console.log("repoDB.findOne error : " + err);
                }
                
                if (!getResult && (getResult.updated_at < repo.updated_at)) {
                    console.log("repo upsert! repo : " + JSON.stringify(repo));
                    repoDB.update({id: repo.id}, repo, {upsert: true}, function(err, numReplaces){
                        if (err) {
                            console.log("repoDB.update error : " + err);
                        }
                        console.log("repoDB.update numReplaces : " + numReplaces);
                    });
                }
            });
        });

        event.sender.send('repos-getForOrg-response', res)
    });

    // TODO get repository contributor list
    // TODO get event from org + repo -> filter by user (parallel)
});

// https://mikedeboer.github.io/node-github/#api-orgs-getMembers
ipc.on('orgs-getMembers', function (event, arg) {
    github.orgs.getMembers({
        headers: {
            "Authorization": "token " + gitToken
        },
        org: gitOrg
    }, function (err, res) {
        console.log(err);
        console.log(res);
        event.sender.send('orgs-getMembers-response', res)
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
        event.sender.send('issues-getCommentsForRepo-response', res)
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

