function request(path, callback, plugins) {
    if (typeof plugins === 'undefined') {
        plugins = [];
    }

    $.ajax({
        url: BASEDIR + "admin/plugin/command/" + path,
        type: "post",
        data: {
            'plugins': plugins
        },
        dataType: "json",
        success: callback
    });
}

function check(id, data) {
    $('#plugin-' + id + '-status')
        .removeClass('icon-hour-glass')
        .addClass('icon-checkmark');

    $('#plugin-' + id + '-results')
        .html(
            $('<pre></pre>')
                .addClass('plugin-code small')
                .html(data.output)
        );
}

$(document).ready(function() {
    $('.plugin-mark').click(function() {
        $(this).toggleClass('icon-checkmark icon-checkmark2');

        if ($(this).hasClass('icon-checkmark')) {
            $('#' + $(this).attr('data-id')).val(1);
        } else {
            $('#' + $(this).attr('data-id')).val(0);
        }
    });

    var pluginElement = $('[data-cmd="update-plugins"]');

    if ($(pluginElement).length === 1) {
        request('config', function(data) {
            check('config', data);

            request('cache', function(data) {
                check('cache', data);

                request('assets', function(data) {
                    check('assets', data);

                    request('database', function(data) {
                        check('database', data);

                        $('.plugin-wait').hide();
                        $('#plugin-reload').show();
                    });
                });
            });
        }, pluginElement.attr('data-plugins'));
    }
});
