'use strict';

var Metador = function() {};

Metador.prototype = {
    redirect: function(url) {
        window.location = url;
    },

    parseResponse: function (data) {
        if (data && data.METADOR) {
            if (data.METADOR.runMethod) {
                $(data.METADOR.runMethod).each(function (index, params) {
                    if(typeof window[params.class][params.method] === 'function'){
                        window[params.class][params.method](params.argument);
                    }
                });
            } else if (data.METADOR.runFunction) {
                $(data.METADOR.runFunction).each(function (index, params) {
                    if(typeof window[params.function] === 'function'){
                        window[params.function](params.argument);
                    }
                });
            }

            return;
        }

        window.location = Configuration.basedir + 'logout/';

        return false;
    },

    displaySuccess: function (message) {
        this.displayMessage(message, 'success');
    },

    displayInfo: function (message) {
        this.displayMessage(message, 'info');
    },

    displayWarning: function (message) {
        this.displayMessage(message, 'warning');
    },

    displayError: function (message) {
        this.displayMessage(message, 'error');
    },

    displayMessage: function (message, type) {
        $('#error-messages').append(
            $('<div></div>')
                .addClass('notify ' + type)
                .append($('<div></div>').addClass('close icon-cross -js-close-notify'))
                .append($('<ul></ul>').append($('<li></li>').text(message)))
        )
    },

    changeLocation: function (url) {
        window.history.replaceState("", null, url);
    },
    preloaderStart: function () {
        $('.-js-progress').addClass('act');
    },
    preloaderStop: function() {
        $('.-js-progress').removeClass('act');
    }
};

var metador = new Metador();

$( document ).ajaxStart(function() {
    metador.preloaderStart();
}).ajaxStop(function() {
    metador.preloaderStop();
});
