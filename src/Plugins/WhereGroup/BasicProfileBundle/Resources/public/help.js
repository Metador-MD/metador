;( function( $, window, document, undefined ) {
    "use strict";

    // Create the defaults once
    var pluginName = "help",
        defaults = {
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
            self.search.url = Configuration.basedir + 'metadata/profile/help';

            $(this.element).click(function() {
                self.open();
            });
        },

        open: function() {
            var self = this;
            var applyFn = function() {
                self.addOperatesOn(this);
            };

            $.ajax({
                'url': self.search.url,
                'type': 'GET',
                'dataType': 'json',
                'data': {
                    'key': $(self.element).attr('data-obj-id')
                },
                'success': function(data) {
                    if (data && data.html) {
                        var content = $('<div></div>').html(data.html);

                        self.dialog = $('<div></div>').modalDialog({
                            width: 600,
                            content: content,
                            onOpen: function() {

                            },
                            onClose: function() {
                                var md = $(content).find('#helptext').val();
                                if (md) {
                                    $.ajax({
                                        'url': self.search.url,
                                        'type': 'POST',
                                        'dataType': 'json',
                                        'data': {
                                            'key': $(self.element).attr('data-obj-id'),
                                            'val': md
                                        }
                                    });
                                }
                            }
                        });
                    }

                    metador.parseResponse(data);
                },
                'error': function() {

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
