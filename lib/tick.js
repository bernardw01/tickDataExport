/*
Author: Bernard Williams
Date:   December 10, 2016
Purpose: To move aggregated platform data from the TE2 platform into QuickBase
*/

var client = require("./webclient");
var config = require("../config/config").getConfig();
var utl = require("./te2Util");

/**
 * Utilizes the webclient object to connect to the QB environment and returns a ticket.
 * @username {string} username thats valid on the system
 * @password {string} valid password for this user
 * @mainHandler {function} This is the callback functions
 */
exports.getTickTime = function queryTick(query, callback) {
    var localUrl = config.tickBaseURL;
    localUrl += "/" + config.tickSubscriptionID;
    localUrl += "/api/v2/entries.json";
    localUrl += "?start_date=" + query.startDate;
    localUrl += "&end_date=" + query.endDate;
    localUrl += "&page=" + query.page;

    var options = {
        url: localUrl,
        headers: {
            Authorization: "Token token=" + config.tickAPIToken,
            "User-Agent": config.tickUserAgent
        },
        method: "GET"
    };

        console.log("------------------------------------");
        console.log("Tick Request being sent: " + JSON.stringify(options));
        console.log("------------------------------------");

    client.get(options, function respHandler(htmlBody) {
        //Can put any processing code that we need to do to transform the data here.
        //console.log("----Tick from JSON--------------------------------");
        //console.log(htmlBody);
        //console.log("------------------------------------");
        callback(htmlBody);
    });
};

exports.getTickUsers = function queryTick(callback) {
    var localUrl = config.tickBaseURL;
    localUrl += "/" + config.tickSubscriptionID;
    localUrl += "/api/v2/users.json";

    var options = {
        url: localUrl,
        headers: {
            Authorization: "Token token=" + config.tickAPIToken,
            "User-Agent": config.tickUserAgent
        },
        method: "GET"
    };

    console.log("------------------------------------");
    console.log("Tick Request being sent: " + JSON.stringify(options));
    console.log("------------------------------------");

    client.get(options, function respHandler(htmlBody) {

        callback(htmlBody);
    });
};

exports.getTickClients = function queryTick(callback) {
    var localUrl = config.tickBaseURL;
    localUrl += "/" + config.tickSubscriptionID;
    localUrl += "/api/v2/clients.json";

    var options = {
        url: localUrl,
        headers: {
            Authorization: "Token token=" + config.tickAPIToken,
            "User-Agent": config.tickUserAgent
        },
        method: "GET"
    };

    console.log("------------------------------------");
    console.log("Tick Request being sent: " + JSON.stringify(options));
    console.log("------------------------------------");

    client.get(options, function respHandler(htmlBody) {
        callback(htmlBody);
    });
};

exports.getTickOpenProjects = function queryTick(callback) {
    var localUrl = config.tickBaseURL;
    localUrl += "/" + config.tickSubscriptionID;
    localUrl += "/api/v2/projects.json";

    var options = {
        url: localUrl,
        headers: {
            Authorization: "Token token=" + config.tickAPIToken,
            "User-Agent": config.tickUserAgent
        },
        method: "GET"
    };

    console.log("------------------------------------");
    console.log("Tick Request being sent: " + JSON.stringify(options));
    console.log("------------------------------------");

    client.get(options, function respHandler(htmlBody) {
        callback(htmlBody);
    });
};

exports.getTickClosedProjects = function queryTick(callback) {
    var localUrl = config.tickBaseURL;
    localUrl += "/" + config.tickSubscriptionID;
    localUrl += "/api/v2/projects/closed.json";

    var options = {
        url: localUrl,
        headers: {
            Authorization: "Token token=" + config.tickAPIToken,
            "User-Agent": config.tickUserAgent
        },
        method: "GET"
    };

    console.log("------------------------------------");
    console.log("Tick Request being sent: " + JSON.stringify(options));
    console.log("------------------------------------");

    client.get(options, function respHandler(htmlBody) {

        callback(htmlBody);
    });
};

exports.getTickOpenTasks = function queryTick(page,callback) {
    var localUrl = config.tickBaseURL;
    localUrl += "/" + config.tickSubscriptionID;
    localUrl += "/api/v2/tasks.json";
    localUrl += "?page=" + page;

    var options = {
        url: localUrl,
        headers: {
            Authorization: "Token token=" + config.tickAPIToken,
            "User-Agent": config.tickUserAgent
        },
        method: "GET"
    };

    client.get(options, function respHandler(htmlBody) {
        callback(htmlBody);
    });
};

exports.getTickClosedTasks = function queryTick(page, callback) {
    var localUrl = config.tickBaseURL;
    localUrl += "/" + config.tickSubscriptionID;
    localUrl += "/api/v2/tasks/closed.json";
    localUrl += "?page=" + page;

    var options = {
        url: localUrl,
        headers: {
            Authorization: "Token token=" + config.tickAPIToken,
            "User-Agent": config.tickUserAgent
        },
        method: "GET"
    };

    client.get(options, function respHandler(htmlBody) {
        callback(htmlBody);
    });
};