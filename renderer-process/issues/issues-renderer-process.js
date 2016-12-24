const ipc = require('electron').ipcRenderer
const markdown = require( "markdown" ).markdown
const shell = require('electron').shell

var waitUntil = function (fn, condition, interval) {
    interval = interval || 100;

    var shell = function () {
        var timer = setInterval(
            function () {
                var check;

                try { check = !!(condition()); } catch (e) { check = false; }

                if (check) {
                    clearInterval(timer);
                    delete timer;
                    fn();
                }
            },
            interval
        );
    };

    return shell;
};

ipc.on('get-user-id-list-response', function (event, arg) {
    console.log('get-user-id-list-response' + arg);

    if (!arg) {
        return;
    }

    var html = "";
    var lastUser = "";
    for (var i in arg) {
        var user = arg[i];
        if (!user) {
            continue;
        }

        var trimmedUser = user.trim();
        html += "<button id='get-issue-list-button-"+trimmedUser+"'>";
        html += trimmedUser;
        html += "</button>";

        lastUser = trimmedUser;
    }

    var getIssueButtonContainer = document.getElementById('get-issue-button-container')
    getIssueButtonContainer.innerHTML = html;

    waitUntil(
        function () {
            for (var j in arg) {
                var user1 = arg[j];
                if (!user1) {
                    continue;
                }

                console.log("loaded!. userId : " + user1);
                const trimmedUser1 = user1.trim();
                var asyncMsgBtn = document.getElementById("get-issue-list-button-" + trimmedUser1)
                console.log(asyncMsgBtn);
                asyncMsgBtn.addEventListener('click', function () {
                    console.log("get issue list. userId : " + trimmedUser1);
                    ipc.send('get-issue-list-request', trimmedUser1)
                })
            }
        },
        function() {
            console.log("check!. userId : " + lastUser);
            // the code that tests here... (return true if test passes; false otherwise)
            return !!(document.getElementById("get-issue-list-button-" + lastUser).innerHTML !== '');
        },
        50 // amout to wait between checks
    )();

        // // TODO impl
    // var asyncMsgBtn = getIssueButtonContainer.getElementById('get-issue-list')
    // asyncMsgBtn.addEventListener('click', function () {
    //     ipc.send('get-issue-list-request', 'ping')
    // })
});

document.getElementById('get-user-id-list-button').addEventListener('click', function () {
    console.log("send get-user-id-list-request event");
    ipc.send('get-user-id-list-request');
});

ipc.on('get-issue-list-response', function (event, arg) {
    var result = "<div>";
    for (var i in arg) {
        var row = arg[i];
        if (!row) {
            continue;
        }

        var eventType = row.type;
        if (!eventType) {
            continue;
        }

        if (!row.payload) {
            continue;
        }

        var payloadAction = row.payload.action;

        if (eventType === "IssuesEvent" && payloadAction === "opened") {
            result += "<table>";
            result += "<tr>";
            result += "<td style='width:200px'>";
            result += row.created_at;
            result += "</td>";
            result += "<td>";
            result += "<a href='" + row.payload.issue.html_url + "' target='_blank'>";
            result += row.payload.issue.title;
            result += "</a>";
            result += "</td>";
            result += "</tr>";


            result += "<tr>";
            result += "<td colspan='2' style='text-align:left;word-break: break-all;word-wrap:break-word'>";
            result += "<div class='hljs-bullet'>Create Issue</div>";
            result += "<p style='text-align:left;word-break: break-all;word-wrap:break-word'>";
            if (row.payload.issue.body) {
                result += markdown.toHTML(row.payload.issue.body);
            } else {
                result += "내용 없는 이슈 생성";
            }
            result += "</p>";
            result += "</td>";
            result += "</tr>";

            result += "</table>";
        } else if (eventType === "IssueCommentEvent" && payloadAction === "created") {
            result += "<table>";
            result += "<tr>";
            result += "<td style='width:200px'>";
            result += row.created_at;
            result += "</td>";
            result += "<td>";
            result += "<a href='" + row.payload.comment.html_url + "' target='_blank'>";
            result += row.payload.issue.title;
            result += "</a>";
            result += "</td>";
            result += "</tr>";

            result += "<tr>";
            result += "<td colspan='2' style='text-align:left;word-break: break-all;word-wrap:break-word'>";
            result += "<div class='hljs-bullet'>Create Comment</div>";
            result += "<p style='text-align:left;word-break: break-all;word-wrap:break-word'>";
            result += markdown.toHTML(row.payload.comment.body);
            result += "</p>";
            result += "</td>";
            result += "</tr>";
            result += "</table>";
        } else {
            console.log(row);
        }
    }
    result += "</div>";
    document.getElementById('issue-list').innerHTML = result;

    const links = document.getElementById('issue-list').querySelectorAll('a[href]');
    Array.prototype.forEach.call(links, function (link) {
        const url = link.getAttribute('href');
        // if (url.indexOf('http') === 0 || url.indexOf('https') === 0) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            shell.openExternal(url)
        });
        // }
    })
});

