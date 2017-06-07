;( function( $, window, document, undefined ) {
    "use strict";

    // Create the defaults once
    var pluginName = "multiInput",
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

            $(this.element).on('click', '.-js-multi-input-add', function() {
                self.add(this);
                return false;
            });

            $(this.element).on('click', '.-js-multi-input-remove', function() {
                self.remove(this);
                return false;
            });

            $(this.element).on('click', '.-js-multi-input-clear', function() {
                self.clear(this);
                return false;
            });
        },

        add: function(element) {
            var clone = $(element).closest('.-js-multi-input-col').clone();

            $(clone).find('.-js-multi-input-add').remove();
            $(clone).find('[data-validation-icon]').remove();
            $(clone).removeClass('i4').addClass('i2');
            $(clone).find('input').val('');
            $(clone).find('.-js-multi-input-clear')
                .removeClass('-js-multi-input-clear')
                .addClass('-js-multi-input-remove');


            $(this.element)
                .find('.-js-multi-inputs')
                .append(clone);
            metadata.enableSubmitButton();
        },

        remove: function(element) {
            $(element).closest('.-js-multi-input-col').remove();
            metadata.enableSubmitButton();
        },

        clear: function(element) {
            $(element).closest('.-js-multi-input-col').find('input').val('');
            metadata.enableSubmitButton();
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
