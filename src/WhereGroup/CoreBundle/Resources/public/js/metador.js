/*
 * Start/show the loading animation as the ajax-requests starts
 */
$(document).ajaxStart(function() {
    $('[data-element="metador-preloader"]').addClass('active');
});

/*
 * End/hide the loading animation as the ajax-request is done
 */
$(document).ajaxStop(function() {
    $('[data-element="metador-preloader"]').removeClass('active');
});

$('[data-cmd="metadata-toggle-public"]').click(function() {
    $(this)
        .closest('[data-element="metadata-info"]')
        .toggleClass('public');

    var value = $('[data-element="metadata-public"]').val();

    if (value !== '1') {
        $('[data-element="metadata-public"]').val('1');
        return;
    }

    $('[data-element="metadata-public"]').val('0');
    return;
});

$('[data-cmd="metadata-toggle-roles"]').click(function() {
    $(this)
        .closest('[data-element="metadata-info"]')
        .toggleClass('groups');
});

$(document).on('click', '.-js-close-notify', function () {
    $(this).parent().remove();
});
