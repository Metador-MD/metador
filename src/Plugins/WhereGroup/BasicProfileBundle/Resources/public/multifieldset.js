;( function( $, window, document, undefined ) {
    "use strict";

    // Create the defaults once
    var pluginName = "multiFieldset",
        defaults = {
            propertyName: "value"
        };

    // The actual plugin constructor
    function Plugin ( element, options ) {
        this.element = element;
        this.settings = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this._name = pluginName;

        this.init();
    }

    // Avoid Plugin.prototype conflicts
    $.extend( Plugin.prototype, {
        init: function() {
            var self = this;

            $(this.element).on('click', '.-js-multi-fieldset-add', function() {
                self.add();
                return false;
            });

            $(this.element).on('click', '.-js-multi-fieldset-remove', function() {
                self.remove(this);
                return false;
            });
        },

        remove: function(element) {
            $(element).closest('.-js-multi-field-row').remove();
            metadata.enableSubmitButton();
        },

        add: function() {
            var clone = $(this.element).find('.-js-multi-fieldset-default-row').clone();

            clone
                .removeClass('-js-multi-fieldset-default-row')
                .addClass('-js-duplicatable-ignore');

            clone.find('.-js-multi-fieldset-icons')
                .append(
                    $('<span></span>').addClass('icon icon-bin2 -js-multi-fieldset-remove')
                );

            this.changeElementNames(clone, this.valueCount());
            this.increaseValueCount();

            $(this.element).find('.-js-multi-fieldset-rows').append(clone);

            metadata.enableSubmitButton();
        },

        valueCount: function() {
            return $(this.element).attr('data-count');
        },

        increaseValueCount: function() {
            var count = this.valueCount();
            $(this.element).attr('data-count', ++count);
        },

        changeElementNames: function(element, count) {
            var self = this;

            element.each(function() {
                var node    = $(this).prop('nodeName');
                var name    = $(this).attr('name');
                var id      = $(this).attr('id');
                var obj_id  = $(this).attr('data-obj-id');

                // clear value
                if ((node === 'SELECT' || node === 'INPUT' || node === 'TEXTAREA') && $(this).val() !== '') {
                    $(this).val('');
                }

                $(this).attr('name', self.replaceCounter(name, /\[([\d]{1,3})\]/g, count, "[", "]"));
                $(this).attr('id', self.replaceCounter(id, /_([\d]{1,3})[_]*/g, count, "_", "_"));
                $(this).attr('data-obj-id', self.replaceCounter(obj_id, /_([\d]{1,3})[_]*/g, count, "_", "_"));

                if($(this).children().length > 0) {
                    self.changeElementNames($(this).children(), count);
                }
            });
        },

        replaceCounter: function(string, regex, count, delimiterStart, delimiterEnd) {
            if(!string || string === false) {
                return;
            }

            var tokens    = string.split(regex);
            var increased = false;

            for (var i = tokens.length -1; i >= 0; i--) {
                if (tokens[i].match(/^[\d]{1,3}$/)) {
                    tokens[i] = increased === false
                        ? delimiterStart + count + delimiterEnd
                        : delimiterStart + tokens[i] + delimiterEnd;

                    increased = true;
                }
            }

            return tokens.join('');
        }
    } );

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
