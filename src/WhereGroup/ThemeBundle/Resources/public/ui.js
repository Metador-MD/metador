$(document).on('click', '.-js-toggle-user-menu', function() {
    $(this).closest('.-js-user').toggleClass('active');
});

$(document).on('click', '.-js-toggle-info-box', function() {
    $(this).siblings('.-js-info-box-content').toggleClass('active');
});

$(document).on('click', '.-js-close-notify', function() {
    $(this).parent().remove();
});
