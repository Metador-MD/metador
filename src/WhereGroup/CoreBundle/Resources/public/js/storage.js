'use strict';

var Storage = function() {};

Storage.prototype = {
    setObject: function(key, value) {
        this.setParam(key, JSON.stringify(value));
    },

    getObject: function(key, defaultValue) {
        var json = this.getParam(key, defaultValue);

        if (json === null) {
            return {};
        }

        return (typeof json === 'object')
            ? json
            : JSON.parse(json);
    },

    setParam: function(key, value) {
        window.sessionStorage.setItem(key, value);
    },

    getParam: function(key, defaultValue) {
        return (window.sessionStorage.getItem(key) === null && typeof defaultValue !== 'undefined')
            ? defaultValue
            : window.sessionStorage.getItem(key);
    },

    removeParam: function(key) {
        window.sessionStorage.removeItem(key);
    }
};
