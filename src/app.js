/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');
var ajax = require('ajax');

var LAT_VAR = '{{latitude}}';
var LON_VAR = '{{longitude}}';

function contains(str1, str2) {
  if (str1.indexOf(str2) > -1) {
    return true;
  }
  return false;
}

var locationOptions = {
  enableHighAccuracy: true, 
  maximumAge: 10000, 
  timeout: 10000
};

function ajaxRequest(url) {
  ajax(
    { 
      url: url
    },
    function(data, status, request) {
      var responseCard = new UI.Card({
        title: 'Success',
        body: data
      });    
      responseCard.show();
    },
    function(error, status, request) {
      var responseCard = new UI.Card({
        title: 'Error',
        body: error
      });    
      responseCard.show();    
    }
  );  
}

var urls = [
  {
    title: "Test1",
    url: "https://maker.ifttt.com/trigger/pebble1/with/key/cbjgh1YcS1UNFlw9o1DXvL?value1={{longitude}}&value2={{latitude}}"
  }
];

var urlMenu = new UI.Menu({
  sections: [{
    title: "Urls",
    items: urls
  }]
});
urlMenu.on('select', function(e) {
  var url = urls[e.itemIndex].url;
  if (contains(url, LAT_VAR) || contains(url, LON_VAR)) {
    navigator.geolocation.getCurrentPosition(
      // success
      function (pos) { 
        url = url.replace(LAT_VAR, pos.coords.latitude);
        url = url.replace(LON_VAR, pos.coords.longitude);
        ajaxRequest(url);
      },
      // error
      function (err) { 
        var errorMessage = 'location error (' + err.code + '): ' + err.message;
        var responseCard = new UI.Card({
          title: 'Error',
          body: errorMessage
        });    
        responseCard.show();
      }, locationOptions);
  } else {
    ajaxRequest(url);
  }  
});

urlMenu.show();
