$(document).on('click', '.-js-close-notify', function () {
    $(this).parent().remove();
});



(function($) {

    var dialog = {
        opts: null,

        init: function(options) {
            dialog.opts = $.extend({
                modal: true,
                width: 600,
                height: 300,
                title: 'Title',
                html: '',
                buttons: {
                    'abort': {
                        'label': 'Abbrechen',
                        'type': 'info',
                        'click': function(result) {
                            $(this).modalDialog('close', false);
                        }
                    },
                    'ok': {
                        'label': 'Ok',
                        'type': 'info',
                        'click': function() {
                            $(this).modalDialog('close', true);
                        }
                    }
                },
                onClose: function(status) {
                }
            }, options);
        },

        open: function() {
            if(dialog.opts.modal) {
                $('<div>', {'class': 'modal'}).appendTo("body");
            }

            var head = $('<div>', {'class': 'head'})
                .text(dialog.opts.title);

            var body = $('<div>', {'class': 'body'}).html(dialog.opts.html);
            var foot = $('<div>', {'class': 'foot'});

            $.each(dialog.opts.buttons, function(button, value) {
                foot.append(
                    $('<span>', {'class': 'btn'})
                        .text(value.label)
                        .addClass(value.type)
                        .bind('click', value.click)
                );
            });

            $('<div>', {
                'class': 'dialog',
                css: {
                    'width': dialog.opts.width,
                    'height': dialog.opts.height,
                    'margin-left': -(dialog.opts.width / 2),
                    'margin-top': -(dialog.opts.height / 2)
                }
            }).append(head, body, foot).appendTo("body").fadeIn(100);

            dialog.opts.onOpen();
        },

        close: function(result) {
            $('.dialog').remove();
            $('.modal').remove();
            dialog.opts.onClose(result);
        }
    };

    $.fn.modalDialog = function(options) {
        if(dialog[options] ) {
            return dialog[options].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if (typeof options === 'object' || ! options ) {
            return dialog.init.apply(this, arguments);
        } else {
            $.error( 'Method ' +  options + ' does not exist.' );
        }

        return this.each(function() {
        });
    };

})(jQuery);
