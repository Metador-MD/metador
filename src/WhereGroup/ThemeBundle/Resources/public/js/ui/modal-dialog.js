;( function( $, window, document, undefined ) {
    "use strict";

    // Create the defaults once
    var pluginName = "modalDialog",
        defaults = {
            width: 400,
            closeButton: true,
            closeButtonLabel: 'Close',
            onOpen: function() {},
            beforeClose: function() {}
        };

    // The actual plugin constructor
    function Plugin ( element, options ) {
        this.element = element;
        this.settings = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this._name = pluginName;
        this.id = 'modal-dialog';
        this.dialog = null;
        this.init();
    }

    // Avoid Plugin.prototype conflicts
    $.extend( Plugin.prototype, {
        init: function() {
            var self   = this;
            var title  = $(self.element).attr('data-title');
            var html   = $(self.element).html();
            var footer = $('<div></div>')
                .addClass('modal-dialog-footer');

            if (self.settings.buttons) {
                $.each(self.settings.buttons, function( index, value ) {
                    footer.append(
                        self._newButton(
                            value.label,
                            value.style ? value.style : '',
                            value.click
                        )
                    );
                });
            }

            if (self.settings.closeButton) {
                footer.append(
                    self._newButton(
                        $(self.element).attr('data-close-label') ? $(self.element).attr('data-close-label') : self.settings.closeButtonLabel,
                        '',
                        function() {
                            self.close();
                        }
                    )
                );
            }

            var content = $('<div></div>')
                .addClass('modal-dialog-content')
                .html(html);

            if (typeof self.settings.content === 'object') {
                content = $('<div></div>')
                    .addClass('modal-dialog-content')
                    .append(self.settings.content);
            }

            $(document).on('closeAllWindows', function() {
               self.close();
            });

            self.dialog = $('<div></div>')
                .attr('id', self.id)
                .addClass('modal-dialog-wrapper')
                .append($('<div></div>').addClass('modal-dialog-background'))
                .append(
                    $('<div></div>')
                        .addClass('modal-dialog')
                        .css('width', self.settings.width + 'px')
                        .append(
                            $('<div></div>')
                                .addClass('modal-dialog-header')
                                .text(title)
                        )
                        .append(content)
                        .append(footer)
                );

            self.open();
        },

        open: function () {
            $('.md').append(this.dialog);
            this.dialog.show();
            this.settings.onOpen();
        },

        hide: function () {
            this.dialog.hide();
        },

        close: function () {
            this.settings.beforeClose();
            this.dialog.remove();
        },

        _newButton: function (label, style, onClick) {
            return $('<span></span>')
                .addClass('btn medium')
                .addClass(style)
                .text(label)
                .on('click', onClick)
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
