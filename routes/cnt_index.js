var express = require('express');
// Requiring our models
var router = express.Router();


// Create all our routes and set up logic within those routes where required.
router.get("/", function (req, res) {
    var hbsObject = {
    };
    //console.log(hbsObject);
    res.render("index", hbsObject);
});

router.get("/signin", function (req, res) {
    var hbsObject = {
    };
    //console.log(hbsObject);
    res.render("signin", hbsObject);
});

// Export routes for server.js to use.
module.exports = router;