var express = require('express');
// Requiring our models
var router = express.Router();
var tick = require('../lib/tick');
var DataLayer = require('../lib/dataLayer');
var JiraLayer = require('../lib/jira');

var moment = require('moment');

var tickRecordCount = 0;
var pageNum = 0;
var dl = new DataLayer();
var jira = new JiraLayer;
var jConnection = jira.getConnection();

var totalIssues = 0
var currentCount = 0

// Create all our routes and set up logic within those routes where required.
router.post("/ticktime", function (req, res) {
    dl.logEvent("Starting to load tick time", "router.get /ticktime")
    pageNum = 0;
    tickRecordCount = 0;

    gatherTickTime(req.body.startDate, req.body.endDate, function (data) {
        res.json(data);
    })

});

router.get("/tickusers", function (req, res) {
    dl.logEvent("Starting to load tick users", "router.get /tickusers");
    gatherTickUsers(function (data) {
        res.json(data);
    })

});

router.get("/ticktasks", function (req, res) {
    dl.logEvent("Starting to load tick tasks", "router.get /ticktasks");
    var response = [];
    taskPageNum = 1;
    closedTasksPageNum = 1;
    taskRecCount = 0;
    gatherOpenTickTasks(function (data) {
        response.push(data);
        gatherClosedTickTasks(function (data) {
            response.push(data);
            res.json(response);
        })
    })

});

router.get("/tickprojects", function (req, res) {
    dl.logEvent("Starting to load tick projects", "router.get /tickprojects")
    gatherTickProjects(function (data) {
        res.json(data);
    })
});

router.get("/cleandb", function (req, res) {
    dl.logEvent("Cleaning tick data", "router.get /cleandb")
    dl.cleanTickData();
    res.json({message: "Database tables have been truncated"})

});

router.get("/tickclients", function (req, res) {
    dl.logEvent("Starting to load tick clients", "router.get /tickclients")
    pageNum = 0;
    tickRecordCount = 0;
    gatherTickClients(function (data) {
        res.json(data);
    })

});

router.post("/getjiraissue", function (req, res) {
    dl.logEvent("Starting to find Jira issues", "router.post /getjiraissue")
    jConnection.findIssue(req.body.issueNum)
        .then(function (doc) {
            console.log('Status: ' + doc.fields.status.name);
            res.json(doc);
        })
        .catch(function (err) {
            console.error(err);
            res.json(err);
        });
});

router.post("/pushjiradata", function (req, res) {
    dl.logEvent("Starting to load Jira issues", "router.post /pushjiradata")
    totalIssues = 0
    currentCount = 0

    var options = {
        maxResults: 5000,
        startAt: 0
    };
    dl.cleanJiraIssues();
    gatherJiraIssues(req.body.JQL, options, function (results) {
        res.json(results);
    });

});

function gatherJiraIssues(JQL, options, callback) {
    jConnection.searchJira(JQL, options)
        .then(function (doc) {
            //console.log('Status: ' + issue.fields.status.name);
            totalIssues = doc.total;

            if (currentCount < totalIssues) {
                currentCount += doc.issues.length;
                pushJiraIssues(doc.issues, function (sqlResults) {
                    console.log(sqlResults);
                });
                options.startAt = currentCount;
                gatherJiraIssues(JQL, options, callback)
            } else {

                callback({
                    method: 'gatherJiraIssues',
                    results: 'success',
                    issueCount: currentCount,
                    timestamp: moment().format()
                });
            }
        })
        .catch(function (err) {
            console.error(err);
        });
}

router.post("/runjiraquery", function (req, res) {
    var jConnection = jira.getConnection();
    var options = {
        maxResults: 5000
    };
    jConnection.searchJira(req.body.JQL, options)
        .then(function (doc) {
            //console.log('Status: ' + issue.fields.status.name);
            res.json(doc);
        })
        .catch(function (err) {
            console.error(err);
        });
});

router.post("/generate", function (req, res) {
    generateTimeData(req.body.startDate,
        req.body.endDate,
        req.body.utilization,
        req.body.project_id,
        req.body.notes,
        req.body.user_id,
        req.body.client_id,
        function (data) {
            res.json(data);
        });
});


function generateTimeData(startDate, endDate, utilization, project_id, notes, user_id, client_id, callback) {
    //generate entries for each date inclusive of the start and end dates based on the utilization
    //Output the date, hrs, project_id, user_id

    let start = moment(startDate, 'YYYY-MM-DD'); //Pick any format
    let end = moment(endDate, 'YYYY-MM-DD'); //right now (or define an end date yourself)
    let weekdayCounter = 0;
    let entries = [];

    while (start <= end) {
        if (start.format('ddd') !== 'Sat' && start.format('ddd') !== 'Sun') {
            weekdayCounter++; //add 1 to your counter if its not a weekend day
            var newHours = utilization * 8;
            var timeEntry = {
                project_id: project_id,
                client_id: client_id,
                user_id: user_id,
                notes: notes,
                "date": start.format('YYYY-MM-DD'),
                hours: newHours
            }
            //console.log(timeEntry);
            entries.push(timeEntry);
            dl.insertRecord('committed_time', timeEntry);
        }
        start = moment(start, 'YYYY-MM-DD').add(1, 'days'); //increment by one day
    }

    response = {
        timestamp: moment(Date.now(), "YYYY-MM-DD HH:MM"),
        recordsInserted: entries.length
    }
    callback(response);
}

function gatherTickUsers(callback) {

    tick.getTickUsers(function (data) {

        var jDoc = JSON.parse(data);
        //console.log(jDoc);
        pushTickUsers(jDoc);
        tickRecordCount += jDoc.length;

        console.log("gatherTickUser Record Count:", tickRecordCount);
        var response = {
            tickRecordCount: tickRecordCount,
            respDoc: jDoc
        }
        callback(response);
    });
}

function gatherTickClients(callback) {

    tick.getTickClients(function (data) {

        var jDoc = JSON.parse(data);
        //console.log(jDoc);
        pushTickClients(jDoc);
        tickRecordCount += jDoc.length;

        console.log("gatherTickUser Record Count:", tickRecordCount);
        var response = {
            tickRecordCount: tickRecordCount,
            respDoc: jDoc
        }
        callback(response);
    });
}

var taskPageNum = 1;
var closedTasksPageNum = 1;
var response = {}
var taskRecCount = 0;

function gatherOpenTickTasks(callback) {

    tick.getTickOpenTasks(taskPageNum, function (data) {

        var jDoc = JSON.parse(data);
        //console.log(jDoc);
        pushTickTasks(jDoc);
        taskRecCount += jDoc.length;
        //console.log("Current Length:", jDoc.length);
        //console.log("Current Page:", taskPageNum);

        if (jDoc.length > 99) {
            taskPageNum++;

            gatherOpenTickTasks(callback);
        } else {
            console.log("gatherTickTask Record Count:", taskRecCount);
            response = {
                tickRecordCount: taskRecCount,
                respDocOpenTasks: jDoc
            }
            callback(response);
        }
    });
}

var closedTaskCount = 0;

function gatherClosedTickTasks(callback) {
    tick.getTickClosedTasks(closedTasksPageNum, function (data) {

        var jDoc = JSON.parse(data);
        //console.log(jDoc);
        pushTickTasks(jDoc);
        closedTaskCount += jDoc.length;
        console.log("Current Length:", jDoc.length);
        console.log("Current Page:", closedTasksPageNum);

        if (jDoc.length > 99) {
            closedTasksPageNum++;
            gatherClosedTickTasks(callback);
        } else {
            //console.log("gatherTickTime Record Count:", tickRecordCount);
            console.log("gatherTickClosedTask Record Count:", closedTaskCount);
            response.respDocClosedTasks = jDoc;
            callback(response);
        }
    });
}

function gatherTickProjects(callback) {

    tick.getTickOpenProjects(function (data) {

        var jDoc = JSON.parse(data);
        //console.log(jDoc);
        pushTickProjects(jDoc);
        tickRecordCount += jDoc.length;

        tick.getTickClosedProjects(function (data) {

            var jDoc = JSON.parse(data);
            //console.log(jDoc);
            pushTickProjects(jDoc);
            tickRecordCount += jDoc.length;

            console.log("gatherTickUser Record Count:", tickRecordCount);
            var response = {
                tickRecordCount: tickRecordCount,
                respDoc: jDoc
            }
            callback(response);
        });

    });
}

var entryRecordCount = 0;
var entryPageNum = 1;

function gatherTickTime(startDate, endDate, callback) {
    entryPageNum++;

    var query = {
        startDate: startDate,
        endDate: endDate,
        page: entryPageNum
    }
    tick.getTickTime(query, function (data) {

        var jDoc = JSON.parse(data);
        //console.log(jDoc);
        pushTickTime(jDoc);
        entryRecordCount += jDoc.length;
        console.log("Current Entries Length:", jDoc.length);
        console.log("Current Page:", query.page);
        if (jDoc.length > 99) {
            query.page++;

            gatherTickTime(startDate, endDate, callback);
        } else {
            console.log("gatherTickTimeEntry Record Count:", entryRecordCount);
            var response = {
                tickRecordCount: entryRecordCount,
                respDoc: jDoc
            }
            callback(response);
        }
    });
}


function pushTickTime(doc) {
    dl.pushTickTime(doc);
}

function pushTickUsers(doc) {
    dl.pushTickUsers(doc);
}

function pushTickClients(doc) {
    dl.pushTickClients(doc);
}

function pushTickTasks(doc) {
    dl.pushTickTasks(doc);
}

function pushTickProjects(doc) {
    dl.pushTickProjects(doc);
}

function pushJiraIssues(doc, callback) {
    dl.pushJiraIssues(doc, function (res) {
        callback(res);
    });
}


// Export routes for server.js to use.
module.exports = router;