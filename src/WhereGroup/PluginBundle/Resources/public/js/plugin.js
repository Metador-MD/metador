function request(path, callback, plugins) {
    if (typeof plugins === 'undefined') {
        plugins = [];
    }

    $.ajax({
        url: Configuration.basedir + "admin/plugin/command/" + path,
        type: 'POST',
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

$('.-js-toggle-plugin').on('click', function() {
    var icon  = $(this).children('span').eq(0);
    var input = $('#' + $(this).attr('data-id'));

    icon.toggleClass('icon-toggle-on icon-toggle-off');

    input.val('0');

    if (icon.hasClass('icon-toggle-on')) {
        input.val('1');
    }
});

$(document).ready(function() {
    $(document).on('click', '[data-toggle="result"]', function() {
        $(this).next().toggle();
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

                        $('[data-plugin="reload-page"]').removeClass('hidden');
                    });
                });
            });
        }, pluginElement.attr('data-plugins'));
    }
});
