$('.-js-toggle-map').on('click', function () {
    $(this).toggleClass('active');
    $('.-js-map-dialog').show();
    $('.-js-home').toggleClass('map-enabled');
    Window.metador.metadorMap.updateMap();
});

$('.-js-source').on('click', function () {
    $(this).siblings().removeClass('active');
    $(this).addClass('active');
    $('.-js-profile-menu').removeClass('active');
    $('#' + $(this).attr('data-id')).addClass('active');
});

$('.-js-crs-code').on('change', function () {
    Window.metador.metadorMap.changeCrs($(this).val());
});

$('.-js-draw-type').on('change', function () {
    var $this = $(this);
    Window.metador.metadorMap.setDraw(
        $this.val(),
        function (geometry) {
            console.log(geometry);
        }
    );
});

$('.-js-zoom-box').on('click', function () {
    var $this = $(this);
    if ($this.hasClass('success')) {
        $(this).removeClass('success');
        Window.metador.metadorMap.dragZoom(
            false,
            function () {
                $this.removeClass('success');
            }
        );
    } else {
        $(this).addClass('success');
        Window.metador.metadorMap.dragZoom(
            true,
            function () {
                $this.removeClass('success');
            }
        );
    }
});

$(document).on('change', '.-js-map-source-visibility', function () {
    var $this = $(this);
    // console.log($this.parent().attr('id'), $this.prop('checked'));
    Window.metador.metadorMap.setVisibility($this.parent().attr('id'), $this.prop('checked'));
});

$(document).on('change', '.-js-map-source-opacity', function () {
    var $this = $(this);
    // console.log($this.parent().attr('id'), $this.prop('checked'));
    Window.metador.metadorMap.setOpacity($this.parent().attr('id'), parseFloat($this.val()));
});

function addSource(id, title, visibility, opacity) {
    var $li = $('<li id="'+id+'"></li>');
    var chck = $('<input class="-js-map-source-visibility" type="checkbox">')
    chck.prop('checked', visibility);
    $li.append(chck);
    $li.append('<span>' +title+'</span>');
    $li.append('<input class="-js-map-source-opacity" type="text" value="'+opacity+'">');
    $('.-js-map-layertree').append($li);
}