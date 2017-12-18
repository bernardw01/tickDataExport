var express = require("express");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var exphbs = require("express-handlebars");
var logger = require("morgan");


var app = express();
var port = normalizePort(process.env.PORT || '3050');
app.set('port', port);
app.use(logger("dev"));

// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: false}));
app.use(methodOverride("_method"));

app.engine("handlebars", exphbs({defaultLayout: "main"}));
app.set("view engine", "handlebars");

// Import routes and give the server access to them.
// Import routes and give the server access to them.
var index_route = require("./routes/cnt_index.js");
app.use("/", index_route);

var api_route = require("./routes/apiRoutes.js");
app.use("/api", api_route);

try {
    app.listen(port,
        function () {
            console.log("App listening on PORT " + port);
        });
} catch (e) {
    console.log("Error Event ===> " + e);
}


/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}
