'use strict';

var AddressSearch = function() {
    Storage.apply(this, arguments);
};

AddressSearch.prototype = {
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
        return this.getObject('address-search-params', {});
    },

    get: function(key, defaultValue) {
        var params = this.getObject('address-search-params', {});

        if (params[key]) {
            return params[key];
        }

        return defaultValue;
    },

    set: function(key, value) {
        var params = this.getObject('address-search-params', {});
        params[key] = value;
        this.setObject('address-search-params', params);
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
            self.find();
        }, self.timeoutDelay);
    },

    find: function() {
        var self = this;

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
    }
};

;( function( $, window, document, undefined ) {
    "use strict";

    // Create the defaults once
    var pluginName = "addressDialog",
        defaults = {
            propertyName: "value"
        };

    // The actual plugin constructor
    function Plugin ( element, options ) {
        this.element = element;
        this.settings = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this._name = pluginName;
        this.search = new AddressSearch();
        this.dialog = null;

        this.init();
    }

    // Avoid Plugin.prototype conflicts
    $.extend( Plugin.prototype, {
        init: function() {
            var self = this;
            self.search.url = $(this.element).attr('data-url');

            $(this.element).click(function() {
                self.open();
            });
        },

        open: function() {
            var self = this;
            var applyFn = function() {
                self.addAddress(this);
            };

            var changePage = function() {
                self.search.set('page', $(this).attr('data-change-page'));
                self.search.find();
            };

            self.dialog = $('<div></div>').modalDialog({
                width: 600,
                content: $('<div></div>').addClass('grid space responsive -js-address-dialog').append(
                    $('<div></div>').addClass('row r-1 margin-b').append(
                        $('<div></div>').addClass('col c-1').append(
                            $('<div></div>').addClass('form-field-wrapper medium').append(
                                $('<input />').addClass('input -js-address-dialog-input').on('keyup', function() {
                                    self.search.keyup(  $(this).val());
                                })
                            )
                        )
                    ),
                    $('<div></div>').addClass('row r-1 margin-b').append(
                        $('<div></div>').addClass('col c-1 -js-address-dialog-results')
                    )
                ),
                onOpen: function() {
                    self.search.searchResultElement = this.content.find('.-js-address-dialog-results');
                    self.search.keyup('');
                    $(document).on('click', '.-js-address-insert', applyFn);
                    $(document).on('click', '[data-change-page]', changePage);
                },
                onClose: function() {
                    $(document).off('click', '.-js-address-insert', applyFn);
                    $(document).off('click', '[data-change-page]', changePage);
                }
            });
        },

        addAddress: function(element) {
            var self = this;

            $(self.search.getResponseData()).each(function(index, row) {
                if (row && row.uuid === $(element).attr('data-uuid')) {
                    var parent = self.element.closest('.-js-duplicatable-area');
                    parent = $(parent).find('.duplicatable-content-item.act');

                    var mailFieldset = $(parent).find('.-js-multi-fieldset');

                    if (mailFieldset.length === 1) {
                        var fieldset = new Fieldset();
                        fieldset.setElement(mailFieldset);
                        fieldset.clear();

                        if (row && row.email && row.email !== '') {
                            $.each(row.email.split(','), function(i, mail) {
                                fieldset.setValueByClass('-js-address-email', mail.trim());
                            });
                        }
                    }

                    $.each(row, function(key, value) {
                        if (mailFieldset.length === 0 || key !== 'email') {
                            $(parent).find('.-js-address-' + key).val(value).change();
                        }
                    });

                    $(document).trigger('closeAllWindows');
                }
            });
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
