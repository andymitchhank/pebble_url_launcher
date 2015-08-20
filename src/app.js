var UI = require('ui');
var ajax = require('ajax');
var Settings = require('settings');

var LAT_VAR = '[[latitude]]';
var LON_VAR = '[[longitude]]';

var locationOptions = {
    enableHighAccuracy: true, 
    maximumAge: 10000, 
    timeout: 10000
};

var urls = Settings.option("urls");
var urlMenu = null;
var responseCard = null;

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
            var tmpcard = new UI.Card({
                title: 'Success',
                body: data
            });    
            tmpcard.show();
        },
        function(error, status, request) {
            var tmpcard = new UI.Card({
                title: 'Error',
                body: error
            });    
            tmpcard.show();    
        }
    );  
}

function showMenu() {
    if (urlMenu === null) {
        urlMenu = new UI.Menu({
            sections: [{
                title: "URL Actions",
                items: Settings.option("urls")
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
    } else {
        urlMenu.items(0, Settings.option("urls"));
    }
    urlMenu.show();    
}

function showNoUrls() {
    responseCard = new UI.Card({
        title: 'No URLs',
        body: "You haven't setup any URLs yet. Go to the settings to add a new URL."
    });    
    responseCard.show();        
}

function updateMenu() {
    urls = Settings.option("urls");
    if ((typeof urls == 'undefined' || urls.length <= 0) && responseCard === null) {
        showNoUrls();
        urlMenu.hide();
    } else {
        showMenu();
        if (responseCard !== null) {
            responseCard.hide();
            responseCard = null;     
        }
    }
}

function buildSettings() {
    Settings.config(
        { 
            url: 'https://andrewhenry.me/pebble/urllauncher.php?json=' + encodeURIComponent(JSON.stringify(Settings.option("urls")))
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
            buildSettings();
            updateMenu();
        }
    );
}

function main() {
    buildSettings();
    if (typeof urls !== 'undefined' && urls.length > 0) {
        showMenu();
    } else {
        showNoUrls();  
    }
}

main();


