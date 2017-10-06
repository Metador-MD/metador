;( function( $, window, document, undefined ) {
    "use strict";

    // Create the defaults once
    var pluginName = "checkbox",
        defaults = {
        };

    // The actual plugin constructor
    function Plugin ( element, options ) {
        this.element = element;
        this.settings = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this._name = pluginName;
        this.input = null;
        this.icon  = null;

        this.init();
    }

    // Avoid Plugin.prototype conflicts
    $.extend( Plugin.prototype, {
        init: function() {
            var self   = this;
            self.input = $(this.element).find('.-js-checkbox-input');
            self.icon  = $(this.element).find('.-js-checkbox-icon');

            self.input.on('change', function() {
                self.toggleIcon();
            });

            $(self.element).on('click', function() {
                self.toggleValue();
            });
        },

        toggleValue: function() {
            if (this.input.val() !== '') {
                this.input.val('').change();

                if (typeof this.input.attr('data-group') !== 'undefined') {
                    var valuesEmpty  = true;
                    var groupMembers = $('[data-group="' + this.input.attr('data-group') + '"]');
                    var defaultValue = (typeof this.input.attr('data-value') === 'undefined')
                        ? 'true' : this.input.attr('data-value');

                    groupMembers.each(function() {
                        if ($(this).val() !== '') {
                            valuesEmpty = false;
                        }
                    });

                    if (valuesEmpty) {
                        groupMembers.val(defaultValue).change();
                    }
                }

                return;
            }

            this.input.val('true').change();
        },

        toggleIcon: function() {
            if (this.input.val() === '') {
                this.icon.removeClass('icon-checkbox-checked').addClass('icon-checkbox-unchecked');
                return;
            }

            this.icon.removeClass('icon-checkbox-unchecked').addClass('icon-checkbox-checked');
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
