'use strict';

var OperatesOnSearch = function() {
    Storage.apply(this, arguments);
};

OperatesOnSearch.prototype = {
    '__proto__': Storage.prototype,

    searchFieldElement: null,
    searchResultElement: null,
    timeoutDelay: 300,
    timeoutId: null,
    url: null,
    data: null,

    getResponseData: function() {
        return this.data;
    },

    getAll: function() {
        return this.getObject('operateson-search-params', {});
    },

    get: function(key, defaultValue) {
        var params = this.getObject('operateson-search-params', {});

        if (params[key]) {
            return params[key];
        }

        return defaultValue;
    },

    set: function(key, value) {
        var params = this.getObject('operateson-search-params', {});
        params[key] = value;
        this.setObject('operateson-search-params', params);
    },

    keyup: function(value) {
        var self = this;

        self.searchResultElement.html('...');

        if (typeof self.timeoutId !== 'undefined') {
            window.clearTimeout(self.timeoutId);
        }

        self.timeoutId = window.setTimeout(function() {
            self.timeoutId = undefined;
            self.set('page', 1);
            self.set('terms', value);
            self.set('source', $('[name="p[_source]"]').val());
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
                'url': self.url,
                'type': 'get',
                'dataType': 'json',
                'data': self.getAll(),
                'success': function(data) {
                    self.searchResultElement.html('');

                    if (data && data.html) {
                        self.searchResultElement.html(data.html);
                    }

                    if (data && data.data) {
                        self.data = data.data;
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

;( function( $, window, document, undefined ) {
    "use strict";

    // Create the defaults once
    var pluginName = "operatesonDialog",
        defaults = {
            propertyName: "value"
        };

    // The actual plugin constructor
    function Plugin ( element, options ) {
        this.element = element;
        this.settings = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this._name = pluginName;
        this.search = new OperatesOnSearch();
        this.dialog = null;
        this.init();
    }

    // Avoid Plugin.prototype conflicts
    $.extend( Plugin.prototype, {
        init: function() {
            var self = this;
            self.search.url = Configuration.basedir + 'profile/operateson';

            $(this.element).click(function() {
                self.open();
            });
        },

        open: function() {
            var self = this;
            var applyFn = function() {
                self.addOperatesOn(this);
            };

            self.dialog = $('<div></div>').modalDialog({
                width: 600,
                content: $('<div></div>').addClass('grid space responsive -js-operateson-dialog').append(
                    $('<div></div>').addClass('row r-1 margin-b').append(
                        $('<div></div>').addClass('col c-1').append(
                            $('<div></div>').addClass('form-field-wrapper medium').append(
                                $('<input />').addClass('input -js-operateson-dialog-input').on('keyup', function() {
                                    self.search.keyup($(this).val());
                                })
                            )
                        )
                    ),
                    $('<div></div>').addClass('row r-1 margin-b').append(
                        $('<div></div>').addClass('col c-1 -js-operateson-dialog-results')
                    )
                ),
                onOpen: function() {
                    self.search.searchResultElement = this.content.find('.-js-operateson-dialog-results');
                    self.search.keyup('');
                    $(document).one('click', '.-js-operateson-insert', applyFn);
                },
                onClose: function() {
                    $(document).off('click', '.-js-operateson-insert', applyFn);
                }
            });
        },

        addOperatesOn: function(element) {
            var parent = this.element.closest('.-js-multi-field-row');
            $(parent).find('.-js-value-href').val($(element).attr('data-href')).change();
            $(parent).find('.-js-value-uuidref').val($(element).attr('data-uuidref')).change();
            $(document).trigger('closeAllWindows');
        }
    });

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[ pluginName ] = function( options ) {
        return this.each( function() {
            if ( !$.data( this, "plugin_" + pluginName ) ) {
                $.data( this, "plugin_" +
                    pluginName, new Plugin( this, options ) );
            }
        } );
    };

})( jQuery, window, document );
