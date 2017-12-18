var convert = require('xml-js');

/**
 * Creates a base64 encoded username password combination.
 * @user {string} username thats valid on the system
 * @password {string} valid password for this user
 * @return {base64 encoded string} the result of the exponential calculation
 */
exports.makeAuth = function(user, password) {
    var hash = new Buffer(user + ':' + password).toString('base64');
    return "Basic " + hash;
};


exports.makeString = function(object) {
    if (object === null) {
        return '\n';
    }
    return String(object);
};

exports.truncate = function(str, length, truncateStr) {
    str = makeString(str);
    truncateStr = truncateStr || '...\n';
    length = ~~length;
    return str.length > length ? str.slice(0, length) + truncateStr : str;

};

exports.xml2js = function(htmlBody) {
    val = JSON.parse(convert.xml2json(htmlBody, { compact: false, spaces: 4 }));
    return val;
};