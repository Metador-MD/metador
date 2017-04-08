$('.-js-toggle-map').on('click', function() {
    $(this).toggleClass('active');
    $('.-js-map-dialog').show();
    $('.-js-home').toggleClass('map-enabled');
});

$('.-js-source').on('click', function() {
    $(this).siblings().removeClass('active');
    $(this).addClass('active');
    $('.-js-profile-menu').removeClass('active');
    $('#' + $(this).attr('data-id')).addClass('active');
});
