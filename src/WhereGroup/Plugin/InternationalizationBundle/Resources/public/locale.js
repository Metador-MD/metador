$(document).ready(function() {
    $(document).on('change', '[data-cmd="get-translation"]', function() {
        if ($('select[data-name="bundle"]').val() === "") {
            $('div[data-name="result"]').html('');
            return true;
        }

        $.ajax({
            url: BASEDIR + "admin/locale/translation",
            data: {
                'bundle' : $('select[data-name="bundle"]').val(),
                'domain' : $('select[data-name="domain"]').val(),
                'locale' : $('select[data-name="locale"]').val(),
            },
            type: "get",
            dataType: "html",
            success:  function(html) {
                $('div[data-name="result"]').html(html);
            }
        });
    });

    $(document).on('change', '[data-cmd="translation-changed"]', function() {
        var self = this;

        $.ajax({
            url: BASEDIR + "admin/locale/update/translation",
            data: {
                'bundle'      : $('select[data-name="bundle"]').val(),
                'domain'      : $('select[data-name="domain"]').val(),
                'locale'      : $('select[data-name="locale"]').val(),
                'key'         : $(self).attr('data-key'),
                'translation' : $(self).val()
            },
            type: "post",
            dataType: "json",
            success:  function(json) {
                // message
            }
        });

    });

    $(document).on('click', '[data-cmd="translation-copy"]', function() {
        $(this).siblings('textarea.locale-translation').text(
            $(this).siblings('div.locale-existing').text()
        ).change();
    });

    $(document).on('click', '[data-cmd="set-translation"]', function() {
        var self = this;
        $('div[data-name="result"]').html('');

        $.ajax({
            url: BASEDIR + "admin/locale/update/translation",
            data: {
                'bundle'      : $('select[data-name="bundle"]').val(),
                'domain'      : $('select[data-name="domain"]').val(),
                'locale'      : $('select[data-name="locale"]').val(),
                'key'         : $('input[data-name="value"]').val(),
                'translation' : '__' + $('input[data-name="value"]').val()
            },
            type: "post",
            dataType: "json",
            success:  function(json) {
                $('[data-name="bundle"]').change();
                $('input[data-name="value"]').val('');
            }
        });
    });
});
