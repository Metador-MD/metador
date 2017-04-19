$(document).ready(function() {
    $(document).on('click', '.showHelp', function() {
        var dialog = $('<div>');
        var id = $(this).attr('data-obj-id');

        $.ajax({
            url: Configuration.basedir + "metador/help/get",
            data: {
                "id" : id
            },
            type: "get",
            dataType: "html",
            success:  function(data) {
                dialog.modalDialog({
                    title: 'Hilfetext',
                    height: 300,
                    width: 350,
                    html: data,
                    buttons: {
                        'ok': {
                            'label': 'Schließen', 'type': 'info',
                            'click': function() {
                                if($('.helptext').attr("contentEditable")) {
                                    $.ajax({
                                        url: Configuration.basedir + "metador/help/set",
                                        data: {
                                            "id" : id,
                                            "html": $('.helptext').html()
                                        },
                                        type: "post", dataType: "html"
                                    });
                                }
                                $(this).modalDialog('close', true);
                            }
                        }
                    },
                    onOpen: function() {}
                });

                dialog.modalDialog('open');
            }
        });
    });
});
