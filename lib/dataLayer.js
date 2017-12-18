var mysql = require('mysql');
var moment = require('moment');

function checkNull(obj) {
    try {
        if (obj) {
            return obj
        } else {
            return null;
        }
    }
    catch (err) {
        return null;
    }
}

function checkNullDate(dateObj) {
    try {
        if (dateObj) {
            var newDate = moment(dateObj, 'YYYY-MM-DD');
            return newDate.format('YYYY-MM-DD');
        } else {
            return null;
        }
    }
    catch (err) {
        return null;
    }
}

var DataLayer = function (callback) {

    this.connection = mysql.createConnection(({
        host: 'te2sow.cciiqdjd26sf.us-east-1.rds.amazonaws.com',
        port: '3306',
        user: 'TE2Admin',
        password: 'Lexicon1',
        database: 'tickDataTransfer'
    }));

    /*this.connection = mysql.createConnection(({
        host: 'localhost',
        port: '3306',
        user: 'root',
        password: null,
        database: 'tickDataTransfer'
    }));*/
    this.connection.connect(function (err) {
        if (err) throw err;
        //callback();
    });

    var connection = this.connection;

    /**
     * This function submits an order
     *
     */
    this.pushTickTime = function (doc) {

        for (var i = 0; i < doc.length; i++) {
            this.connection
                .query('INSERT INTO tick_data SET ?', doc[i],
                    function (error, results, fields) {
                        if (error) {
                            throw error
                        } else {
                            //console.log(results);
                        }
                    });
        }
        this.logEvent(doc.length + " - time records inserted", "DataLayer.pushTickUsers");

    };

    this.insertRecord = function (table, rec) {
        this.connection
            .query('INSERT INTO ?? SET ?',
                [table, rec],
                function (error, results, fields) {
                    if (error) {
                        throw error
                    } else {
                       // console.log(results);
                    }
                    ;
                });
    };

    this.logEvent = function (message, source) {
        var event = {
            message: message,
            source: source,
            event_time_stamp: moment().format()
        }

        this.connection
            .query('INSERT INTO ?? SET ?',
                ["event_log", event],
                function (error, results, fields) {
                    if (error) {
                        throw error
                    } else {
                        //console.log(results);
                    }

                });
    }

    this.pushTickUsers = function (doc) {
        //console.log("User Data:", doc);

        for (var i = 0; i < doc.length; i++) {
            this.connection
                .query('INSERT INTO tick_users SET ?', doc[i],
                    function (error, results, fields) {
                        if (error) {
                            console.log(error)
                        }
                    });
        }
        this.logEvent(doc.length + " - users inserted", "DataLayer.pushTickUsers");
    };
    this.pushTickProjects = function (doc) {
        //console.log("User Data:", doc);

        for (var i = 0; i < doc.length; i++) {
            this.connection
                .query('INSERT INTO tick_projects SET ?', doc[i],
                    function (error, results, fields) {
                        if (error) throw error;
                    });
        }
        this.logEvent(doc.length + " - projects inserted", "DataLayer.pushTickProjects");
    };
    this.pushTickTasks = function (doc) {
        //console.log("User Data:", doc);

        for (var i = 0; i < doc.length; i++) {
            this.connection
                .query('INSERT INTO tick_tasks SET ?', doc[i],
                    function (error, results, fields) {
                        if (error) throw error;
                    });
        }
        this.logEvent(doc.length + " - tasks inserted", "DataLayer.pushTickTasks");
    };
    this.pushTickClients = function (doc) {
        //console.log("User Data:", doc);

        for (var i = 0; i < doc.length; i++) {
            this.connection
                .query('INSERT INTO tick_clients SET ?', doc[i],
                    function (error, results, fields) {
                        if (error) throw error;
                    });
        }
        this.logEvent(doc.length + " - clients inserted", "DataLayer.pushTickClients");
    };

    this.cleanTickData = function () {
        this.connection
            .query('Truncate tick_users',
                function (error, results, fields) {
                    if (error) throw error;
                });
        this.connection
            .query('Truncate tick_projects',
                function (error, results, fields) {
                    if (error) throw error;
                });
        this.connection
            .query('Truncate tick_clients',
                function (error, results, fields) {
                    if (error) throw error;
                });
        this.connection
            .query('Truncate tick_tasks',
                function (error, results, fields) {
                    if (error) throw error;
                });
        this.cleanTickTime();

    };
    this.cleanTickTime = function (){

        this.logEvent("tick_data table truncated", "DataLayer.cleanTickTime");
        this.connection
            .query('Truncate tick_data',
                function (error, results, fields) {
                    if (error) throw error;
                });
    }

    this.close = function () {
        this.connection.end(function () {
            console.log('---------- Connection closed --------');
        });
    }
    this.pushJiraIssues = function (doc, callback) {
        var insertedCount = 0;
        for (var i = 0; i < doc.length; i++) {
            var resolutionName = "";
            var resolution = checkNull(doc[i].fields.resolution);
            if (resolution) {
                resolutionName = resolution.name;
            }

            var teamLeadName = "";
            var teamLead = checkNull(doc[i].fields.customfield_14200);
            if (teamLead) {
                teamLeadName = teamLead.name;
            }

            var teamName = "";
            var team = checkNull(doc[i].fields.customfield_1008);
            if (team) {
                teamName = team.name;
            }

            var resolutionDate = checkNullDate(doc[i].fields.resolutiondate);
            var createdDate = checkNullDate(doc[i].fields.created);
            console.log("moment created date:", createdDate);
            console.log("moment resolution date:", resolutionDate);


            var issue = {
                issue_key: doc[i].key,
                issue_id: doc[i].id,
                resolution: resolutionName,
                priority: doc[i].fields.priority.name,
                summary: doc[i].fields.summary,
                assignee: doc[i].fields.assignee.emailAddress,
                status: doc[i].fields.status.name,
                created_by: doc[i].fields.creator.emailAddress,
                reported_by: doc[i].fields.reporter.emailAddress,
                issue_type: doc[i].fields.issuetype.name,
                project_lead: teamLeadName,
                project_name: doc[i].fields.project.name,
                project_key: doc[i].fields.project.key,
                team_name: teamName,
                created: createdDate,
                resolved: resolutionDate
            }

            this.connection
                .query('INSERT INTO trident_jira_issues SET ?', issue,
                    function (error, results, fields) {
                        if (error) {
                            console.log(error);
                            throw error;
                        }


                    });
            insertedCount++;
        }
        callback({message: "Success", recordsInserted: insertedCount, docLength: doc.length});
    }
    this.cleanJiraIssues = function () {
        this.connection
            .query('Truncate trident_jira_issues',
                function (error, results, fields) {
                    if (error) throw error;
                });
    }
}

module.exports = DataLayer;