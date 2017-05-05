'use strict';

var Metador = function() {};

Metador.prototype = {
    redirect: function(url) {
        window.location = url;
    },

    parseResponse: function (data) {
        if (typeof data.METADOR.runMethod !== 'undefined') {
            $(data.METADOR.runMethod).each(function (index, params) {
                  if(typeof window[params.class][params.method] === 'function'){
                    window[params.class][params.method](params.argument);
                }
            });
        }

        return false;
    },

    displayError: function (message) {
        $('#error-messages').append(
            $('<div></div>')
                .addClass('notify error')
                .append($('<div></div>').addClass('close icon-cross -js-close-notify'))
                .append($('<ul></ul>').append($('<li></li>').text(message)))
        )
    },

    changeLocation: function (url) {
        window.history.replaceState("", null, url);
    }
};

var metador = new Metador();
