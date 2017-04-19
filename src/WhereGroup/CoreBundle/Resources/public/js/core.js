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
    }
};

var metador = new Metador();

