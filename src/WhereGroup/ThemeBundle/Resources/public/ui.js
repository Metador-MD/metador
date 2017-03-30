$('.-js-toggle-user-menu').on('click', function() {
    $(this).closest('.-js-user').toggleClass('active');
});

$('.-js-toggle-info-box').on('click', function() {
    $(this).siblings('.-js-info-box-content').toggleClass('active');
});
