$(document).on('click', '.-js-toggle-user-menu', function() {
    $(this).closest('.-js-user').toggleClass('active');
});

$(document).on('click', '.-js-toggle-info-box', function() {
    $(this).siblings('.-js-info-box-content').toggleClass('active');
});

$(document).on('click', '.-js-close-notify', function() {
    $(this).parent().remove();
});

$(document).on('mouseenter', '.-js-sys-msg', function() {
    $(this).addClass('large');
});

$(document).on('mouseleave', '.-js-sys-msg', function() {
    $(this).removeClass('large');
});

$(document).on('click', '.-js-fieldset-toggle', function() {
    var mainItem = $(this).closest('.-js-fieldset');

    $(this).find('.-js-fieldset-status').toggleClass('icon-minimize icon-maximize');

    if (mainItem.hasClass('minimize')) {
        mainItem.removeClass('minimize');
        return;
    }

    mainItem.addClass('minimize')
});

$(document).on('mousedown', '.-js-datepicker', function() {
    var self = this;
    $(self).Zebra_DatePicker({
        show_icon: false,
        offset:[-177,120],
        onSelect: function() {
            $(self).change();
        },
        onClear: function() {
            $(self).change();
        },
        //months: ['','']
        //days: ['','']
    });
});

$(document).ready(function() {
    $('.-js-show-tooltip').tooltip();
    $('.-js-checkbox').checkbox();
});

