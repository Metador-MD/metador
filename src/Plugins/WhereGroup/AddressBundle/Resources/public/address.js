$(document).ready(function() {
    $('[data-id="wizard_responsibleParty"]').click(function() {
        var that = this;
        var dialog = $('<div>');

        dialog.modalDialog({
            title: 'Adresse',
            height: 300,
            width: 350,
            html: '<div class="wizard-content"></div>',
            buttons: {
                'abort': {
                    'label': 'Abbrechen', 'type': 'info',
                    'click': function(result) {
                        $('.resparty-data').unbind('click');
                        $(this).modalDialog('close', false);
                    }
                }
            },
            onOpen: function() {}
        });

        dialog.modalDialog('open');

        $.ajax({
            url: BASEDIR + "metador/address/get",
            type: "get",
            dataType: "json",
            success:  function(data) {
                for(var i in data) {
                    if(data[i].individualName === "")
                        continue;

                    $('.wizard-content').append(
                        $('<div></div>').append(
                            $('<p></p>')
                                .addClass('wizard-content-value')
                                .html(data[i].individualName)
                        )
                        .bind('click', function() {
                            var info = $(this).data('info');
                            var content = $(that).closest('.duplicatable').find('.content').children('div.act');

                            for(i in info) {
                                $('[name*="' + i + '"]', content).val(info[i]);
                            }
                            dialog.modalDialog('close');
                        })
                        .addClass('resparty-data')
                        .data('info', data[i])
                    );
                }
            }
        });
    });

});
