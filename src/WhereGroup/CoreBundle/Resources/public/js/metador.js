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
