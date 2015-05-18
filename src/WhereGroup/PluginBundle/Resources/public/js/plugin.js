$(document).ready(function() {
    $('.plugin-mark').click(function() {
        $(this).toggleClass('icon-checkmark icon-checkmark2');

        if ($(this).hasClass('icon-checkmark')) {
            $('#' + $(this).attr('data-id')).val(1);
        } else {
            $('#' + $(this).attr('data-id')).val(0);
        }
    });
});
