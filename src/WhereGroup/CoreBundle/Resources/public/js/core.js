'use strict';

var Metador = function() {};

Metador.prototype = {
    redirect: function(url) {
        window.location = url;
    },

    parseResponse: function (data) {
        console.log(data);

        if (typeof data.methods === 'undefined') {
            return false;
        }

        $(data.methods).each(function (index, params) {
            if(typeof window[params.class][params.method] === 'function'){
                window[params.class][params.method](params.argument);
            }
        });
    }
};

var metador = new Metador();

