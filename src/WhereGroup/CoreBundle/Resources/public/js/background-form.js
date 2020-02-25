$('form.-js-run-in-background').ajaxForm({
    target: this,
    dataType: 'json',
    success: function(data, statusText, xhr, form) {
        if (data && data.handle ) {
            $(form).attr('data-handle', data.handle);
        }

        metador.parseResponse(data);
    }
});


setInterval(function(){
    $('.-js-run-in-background[data-handle]').each(function () {
        var self = this;

        // $.ajax({
        //     'url': Configuration.basedir + 'process/' + $(self).data('handle'),
        //     'type': 'GET',
        //     'dataType': 'json',
        //     'success': function(data) {
        //         if (data && data.process ) {
        //             console.log('a', data.process);
        //         }
        //         // metador.parseResponse(data);
        //     }
        // });
    })
}, 5000);
