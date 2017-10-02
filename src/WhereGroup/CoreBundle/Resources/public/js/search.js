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
        var self = this;
        this.searchFieldElement = $('#searchfield');
        this.searchResultElement = $('#search-result');

        this.set('page', 1);
        this.set('hits', 10);

        this.searchFieldElement.val(this.get('terms', ''));

        $(document).on('keyup', '#searchfield', function() {
            search.keyup();
        });

        $(document).on('click', '[data-change-page]', function() {
            self.set('page', $(this).attr('data-change-page'));
            self.find();
        });

    },

    getAll: function() {
        return this.getObject('search-params', {});
    },

    get: function(key, defaultValue) {
        var params = this.getObject('search-params', {});

        if (params[key]) {
            return params[key];
        }

        return defaultValue;
    },

    set: function(key, value) {
        var params = this.getObject('search-params', {});
        params[key] = value;
        this.setObject('search-params', params);
    },

    keyup: function() {
        var self = this;

        if (typeof self.timeoutId !== 'undefined') {
            window.clearTimeout(self.timeoutId);
        }

        self.timeoutId = window.setTimeout(function() {
            self.timeoutId = undefined;
            self.set('page', 1);
            self.set('terms', self.searchFieldElement.val());
            self.find();
        }, self.timeoutDelay);

    },

    find: function() {
        var self = this;

        self.set('source', $('.-js-source.active').attr('data-slug'));

        $.ajax({
            'url': self.searchFieldElement.attr('data-url'),
            'type': 'POST',
            'dataType': 'json',
            'data': self.getAll(),
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
    },

    clearMetadataMarks: function() {
        $('[data-metadata-uuid]').removeClass('marked');
    },

    markMetadata: function(uuid) {
        $('[data-metadata-uuid="' + uuid + '"]').addClass('marked');
    },

    unmarkMetadata: function(uuid) {
        $('[data-metadata-uuid="' + uuid + '"]').removeClass('marked');
    }
};

var search = new Search();

search.init();


$( document ).ready(function() {
    search.find();
});
