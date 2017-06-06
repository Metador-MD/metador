// map menu
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

$('.-js-draw-type').on('click', function () {
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

$('#map-menu-load-wms-button').on('click', function(){
    var $input = $('#map-menu-load-wms-input');
    $.ajax({
        url: $input.attr('data-url'),
        data: {
            url: encodeURIComponent($input.val())
        }
    }).done(function(data){
        Window.metador.metadorMap.addLayerForOptions(data);
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.error(errorThrown);
    });
});

// map side pane
$(document).on('change', '.-js-map-source-visible', function () {
    var $this = $(this);
    Window.metador.metadorMap.setVisible($this.parents('li:first').attr('id'), $this.prop('checked'));
});

$(document).on('change', '.-js-map-source-opacity', function () {
    var $this = $(this);
    Window.metador.metadorMap.setOpacity($this.parents('li:first').attr('id'), $this.val());
});

function addSource(id, title, visible, opacity) {
    var $li = $('<li id="'+id+'" class="row"></li>');
    var $chkwrap = $('<div class="form-wrapper medium"></div>');
    var $chck = $('<input id="chb-'+id+'" class="check -js-map-source-visible" type="checkbox">')
    $chck.prop('checked', visible);
    $chkwrap.append($chck);
    $chkwrap.append('<label class="form-label" for="chb-'+id+'">' +title+'</label>');
    // TODO label set overflow hidden for max-width
    $li.append($chkwrap);
    var $selwrap = $('<div class="form-wrapper"></div>');
    var $sel = $('<select class="select -js-map-source-opacity"></select>');
    for (var i = 0; i <= 10; i++) {
        $sel.append('<option value="'+(i/10)+'">'+(i * 10)+' %</option>');
    }
    $sel.val(opacity);
    $selwrap.append($sel);
    $li.append($selwrap);
    $('.-js-map-layertree').prepend($li); // last layer as first at list
}