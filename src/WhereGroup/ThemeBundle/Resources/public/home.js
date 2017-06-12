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
    Window.metador.metadorMap.drawShape(
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

$('#map-menu-load-wms-button').on('click', function () {
    var $input = $('#map-menu-load-wms-input');
    if ($input.val()) {
        $.ajax({
            url: $input.attr('data-url'),
            data: {
                url: encodeURIComponent($input.val())
            }
        }).done(function (data) {
            Window.metador.metadorMap.addLayerForOptions(data);
        }).fail(function (jqXHR, textStatus, errorThrown) {
            console.error(errorThrown);
        });
    } else {
        console.log('Keine GetCapabilities URL eingetragen!');
    }
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

    var select = $('<select></select>')
        .addClass('input-element medium simple js-map-source-opacity -js-map-source-opacity');

    for (var i = 0; i <= 10; i++) {
        select.append('<option value="' + (i / 10) + '">' + (i * 10) + ' %</option>');
    }

    var li = $('<li id="' + id + '" ></li>');

    li.append(
        $('<input />')
            .attr('type', 'checkbox')
            .attr('id', 'chb-' + id)
            .addClass('check -js-map-source-visible')
            .prop('checked', visible)
    ).append(
        $('<label></label>')
            .attr('for', 'chb-' + id)
            .addClass('form-label')
            .text(title)
    ).append(
        select
    );

    $('.-js-map-layertree ul').prepend(li);
}

function createGeoFeature(west, south, east, north, properties) {
    var feature = {
        'type': 'Feature',
        'geometry': {
            'type': 'Polygon',
            'coordinates': [[[west, south], [east, south], [east, north], [west, north], [west, south]]]
        }
    };
    if (properties) {
        for (var key in properties) {
            feature[key] = properties[key];
        }
    }
    return feature;
}

function createGeoCollection(crs, geoFeatures) {
    return {
        'type': 'FeatureCollection',
        'crs': {
            'type': 'name',
            'properties': {
                'name': 'EPSG:4326'
            }
        },
        'features': geoFeatures ? geoFeatures : []
    };
}

function addFeature(geoCollection, geoFeature) {
    geoCollection.features.push(geoFeature);
}

/* // show clear features
 // show features
 var hgcollection = {
 'type': 'FeatureCollection',
 'crs': {
 'type': 'name',
 'properties': {
 'name': 'EPSG:3857'
 }
 },
 'features': [{
 'type': 'Feature',
 'geometry': {
 'type': 'Polygon',
 'coordinates': [[[9, 49], [12, 50], [9, 51], [9, 49]]]
 }
 }]
 };
 Window.metador.metadorMap.showFeatures(Window.metador.metadorMap.getHgLayer(), hgcollection);
 // clear features
 Window.metador.metadorMap.clearFeatures(Window.metador.metadorMap.getHgLayer());

 */
