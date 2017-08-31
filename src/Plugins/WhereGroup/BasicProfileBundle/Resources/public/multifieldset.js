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

            clone.removeClass('-js-multi-fieldset-default-row');

            clone.find('.-js-multi-fieldset-icons')
                .append(
                    $('<span></span>').addClass('icon icon-bin2 -js-multi-fieldset-remove')
                );


            var count = $(this.element).attr('data-count');
            this.changeElementNames(clone, count);

            $(this.element).attr('data-count', ++count);

            $(this.element).find('.-js-multi-fieldset-rows').append(clone);

            metadata.enableSubmitButton();
        },

        changeElementNames: function(element, count, subCount) {
            var self = this;
            subCount = (typeof subCount === 'undefined') ? 0 : parseInt(subCount);

            element.each(function() {
                var node    = $(this).prop('nodeName');
                var name    = $(this).attr('name');
                var id      = $(this).attr('id');
                var obj_id  = $(this).attr('data-obj-id');

                if ((node === 'SELECT' || node === 'INPUT' || node === 'TEXTAREA') && $(this).val() !== '') {
                    $(this).val('');
                }

                if(typeof name !== 'undefined' && name !== false) {
                    name = self.replaceCounter(
                        /\[([\d]{1,3})\]/g,
                        "[", "]", count, subCount, name
                    );
                    $(this).attr('name', name);
                }

                if(typeof id !== 'undefined' && id !== false) {
                    id = self.replaceCounter(
                        /_([\d]{1,3})[_]*/g,
                        "_", "_", count, subCount, id
                    );
                    $(this).attr('id', id);
                }

                if(typeof obj_id !== 'undefined' && obj_id !== false) {
                    obj_id = self.replaceCounter(
                        /_([\d]{1,3})[_]*/g,
                        "_", "_", count, subCount, obj_id
                    );
                    $(this).attr('data-obj-id', obj_id);
                }

                if($(this).children().length > 0) {
                    self.changeElementNames($(this).children(), count, subCount);
                }
            });
        },

        replaceCounter: function(split, delimiterStart, delimiterEnd, count, subCount, string) {
            var tokens    = string.split(split);
            var newString = "";
            var counter   = 0;

            for (var i = 0; i < tokens.length; i++) {
                if (tokens[i].match(/^[\d]{1,3}$/)) {

                    if (counter === subCount) {
                        tokens[i] = delimiterStart + count + delimiterEnd;
                    } else {
                        tokens[i] = delimiterStart + tokens[i] + delimiterEnd;
                    }

                    counter++;
                }
                newString += tokens[i];
            }

            return newString;
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
