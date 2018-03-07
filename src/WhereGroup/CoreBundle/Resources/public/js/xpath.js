'use strict';

var Xpath = function() {
    Storage.apply(this, arguments);
};

Xpath.prototype = {
    '__proto__': Storage.prototype,

    searchFieldElement: null,
    searchResultElement: null,
    timeoutDelay: 200,
    timeoutId: null,

    init: function() {
        var self = this;
        self.searchFieldElement  = $('.-js-find-xpath');
        self.searchResultElement = $('.-js-find-xpath-result');

        $(document).on('keyup', '.-js-find-xpath', function() {
            self.keyup();
        });
    },

    keyup: function() {
        var self = this;

        if (typeof self.timeoutId !== 'undefined') {
            window.clearTimeout(self.timeoutId);
        }

        self.timeoutId = window.setTimeout(function() {
            self.timeoutId = undefined;
            self.find();
        }, self.timeoutDelay);
    },

    find: function() {
        var self = this;

        if (typeof self.timeoutId !== 'undefined') {
            window.clearTimeout(self.timeoutId);
        }

        self.timeoutId = window.setTimeout(function() {
            $.ajax({
                'url': self.searchFieldElement.attr('data-url'),
                'type': 'POST',
                'dataType': 'json',
                'data': {
                    'xpath': self.searchFieldElement.val()
                },
                'success': function(data) {
                    self.searchResultElement.html('');

                    if (data && data.html) {
                        self.searchResultElement.html(data.html);
                    }

                    metador.parseResponse(data);
                },
                'error': function() {
                    self.searchResultElement.html('');
                }
            });
        }, self.timeoutDelay);
    }
};

var xpath = new Xpath();

$( document ).ready(function() {
    xpath.init();
    xpath.find();
});
