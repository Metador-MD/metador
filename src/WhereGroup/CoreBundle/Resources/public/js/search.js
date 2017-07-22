'use strict';

var Search = function() {
    Storage.apply(this, arguments);
};

Search.prototype = {
    '__proto__': Storage.prototype,

    searchFieldElement: null,
    searchResultElement: null,
    timeoutDelay: 300,
    timeoutId: null,

    init: function() {
        this.searchFieldElement = $('#searchfield');
        this.searchResultElement = $('#search-result');
        this.setParam('page', 1);
    },

    keyup: function() {
        var self = this;

        if (typeof self.timeoutId !== 'undefined') {
            window.clearTimeout(self.timeoutId);
        }

        self.timeoutId = window.setTimeout(function() {
            self.timeoutId = undefined;
            self.setParam('page', 1);
            self.setParam('terms', self.searchFieldElement.val());
            self.find();

        }, self.timeoutDelay);

    },

    find: function() {
        var self = this;

        $.ajax({
            'url': self.searchFieldElement.attr('data-url'),
            'type': 'POST',
            'dataType': 'json',
            'data': {
                'source': $('.-js-source.active').attr('data-slug'),
                'terms': self.getParam('terms')
            }
        }).success(function(data) {
            self.searchResultElement.html('');

            if (data && data.html) {
                self.searchResultElement.html(data.html);
            }

            metador.parseResponse(data);
        }).error(function() {
            self.searchResultElement.html('');
        });
    }
};

var search = new Search();

search.init();
search.find();

$(document).on('keyup', '#searchfield', function() {
    search.keyup();
});

