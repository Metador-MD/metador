;( function( $, window, document, undefined ) {
    "use strict";

    // Create the defaults once
    var pluginName = "tooltip",
        defaults = {
            width: 400
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

            $(self.element).addClass('tooltip');

            var html = "";

            if (typeof $(self.element).attr('data-tooltip-text') !== 'undefined') {
                html = $(self.element).attr('data-tooltip-text');
            } else if (!html && typeof $(self.element).attr('data-tooltip-id') !== 'undefined') {
                html = $('#' + $(self.element).attr('data-tooltip-id')).html();
            }

            var position = 'left';
            var top = $(self.element).outerHeight() - 2;
            var tooltip = $('<div></div>')
                .addClass('tooltip-wrapper');

            if (typeof $(self.element).attr('data-tooltip-position') !== 'undefined') {
                position = $(self.element).attr('data-tooltip-position');
            }

            tooltip.addClass('bottom-right')
                .css('top',  top + 'px')
                .addClass(position)
                .append(
                    $('<div></div>')
                        .addClass('tooltip-dialog')
                        .html(html)
                );

            $(self.element).append(tooltip);
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
