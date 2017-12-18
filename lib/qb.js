/*
Author: Bernard Williams
Date:   December 10, 2016
Purpose: To move aggregated platform data from the TE2 platform into QuickBase
*/

var client = require("./webclient");
var config = require("../config").getConfig();
var utl = require("./te2Util");

/**
 * Utilizes the webclient object to connect to the QB environment and returns a ticket.
 * @username {string} username thats valid on the system
 * @password {string} valid password for this user
 * @mainHandler {function} This is the callback functions
 */
exports.getQBTicket = function initQB(username, password, mainHandler) {
  // Build URL

  var localUrl = config.QB_BASE_URL;
  localUrl += "/main?a=API_Authenticate&username=";
  localUrl += username;
  localUrl += "&password=" + password + "&hours=24";

  var options = {
    url: localUrl,
    method: "GET"
  };

  console.log("------------------------------------");
  console.log("Request being sent: " + JSON.stringify(options));
  console.log("------------------------------------");

  client.get(options, function respHandler(htmlBody) {
    var jsonDoc = utl.xml2js(htmlBody);
    var ticket = jsonDoc.elements[0].elements[3].elements[0].text;
    console.log("----Ticket from JSON--------------------------------");
    console.log(ticket);
    console.log("------------------------------------");
    mainHandler(ticket);
  });
};
