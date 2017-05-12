$('.-js-toggle-map').on('click', function() {
    $(this).toggleClass('active');
    $('.-js-map-dialog').show();
    $('.-js-home').toggleClass('map-enabled');
    Window.metador.metadorMap.updateMap();
});

$('.-js-source').on('click', function() {
    $(this).siblings().removeClass('active');
    $(this).addClass('active');
    $('.-js-profile-menu').removeClass('active');
    $('#' + $(this).attr('data-id')).addClass('active');
});

$('.-js-draw-type').on('change', function() {
   Window.metador.metadorMap.setDraw($(this).val(), $(this).val('NONE'));
});

$('.-js-crs-code').on('change', function() {
   Window.metador.metadorMap.changeCrs($(this).val());
});