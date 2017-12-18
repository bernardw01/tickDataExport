  var request = require('request');


  /**
   * Creates an HTTP client that is passed a URL.
   * @urlString {string} valid web URL for the resource being accessed
   * @return {string} The body of the html response
   */
  exports.get = function(options, respHandler) {

      var responseData = '';

      request(options, function reqSubmitted(error, response, body) {
          if (error){
              console.log('error req Submitted:', error); // Print the error if one occurred
          }
          respHandler(body);
      });

  };