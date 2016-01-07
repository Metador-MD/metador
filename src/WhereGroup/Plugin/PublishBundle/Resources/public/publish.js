$(document).ready(function() {
    $(document).on('change', '[data-plugin="publish-click"]', function() {
        $.ajax({
            url: BASEDIR + 'publish/metadata/',
            data: {
                'id': $(this).attr('data-id'),
                'status': $(this).is(':checked')
            },
            type: 'post',
            dataType: 'json'
        });
    });
});
