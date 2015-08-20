/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');
var ajax = require('ajax');
var Settings = require('settings');

var LAT_VAR = '{{latitude}}';
var LON_VAR = '{{longitude}}';

var locationOptions = {
    enableHighAccuracy: true, 
    maximumAge: 10000, 
    timeout: 10000
};

var urls = Settings.option("urls");

Settings.config(
    { 
        url: 'https://andrewhenry.me/test/pebble/urllauncher.php?json=' + encodeURIComponent(JSON.stringify(urls))
    },
    function(e) {
        var config_data = JSON.parse(decodeURIComponent(e.response));
        var settings_urls = Settings.option("urls");
        if (config_data.action == "add") {
            delete config_data.action;
            if (!settings_urls) {
                settings_urls = [];
            }
            settings_urls.push(config_data);
        } else if (config_data.action == "delete") {
            for (var i = 0; i < settings_urls.length; i++) { 
                if (settings_urls[i].key == config_data.key) {
                    settings_urls.splice(i, 1);
                }
            }            
        }
        Settings.option("urls", settings_urls);
    }
);

function contains(str1, str2) {
    if (str1.indexOf(str2) > -1) {
        return true;
    }
    return false;
}

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

if (typeof urls !== 'undefined' && urls.length > 0) {
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
                function (pos) { // success
                    url = url.replace(LAT_VAR, pos.coords.latitude);
                    url = url.replace(LON_VAR, pos.coords.longitude);
                    ajaxRequest(url);
                },
                function (err) { // error
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
} else {
    var responseCard = new UI.Card({
        title: 'No URLs',
        body: "You haven't setup any URLs yet. Go to the settings to add a new URL and then reload the watchapp."
    });    
    responseCard.show();    
}

