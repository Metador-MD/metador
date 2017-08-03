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
    $('#source-' + $(this).attr('data-slug')).addClass('active');
    $('#search-result').html('');
    search.find();
});

$('.-js-crs-code').on('change', function () {
    Window.metador.metadorMap.changeCrs($(this).val());
});

$('.-js-draw-type').on('click', function () {
    var $this = $(this);
    Window.metador.metadorMap.drawShapeForSearch(
        $this.val(),
        function (geometry) {
            console.log(geometry);
        }
    );
});

$('.-js-file-upload').on('change', function (e) {
    $('#file-upload-form').submit();

});

$('#file-upload-form').ajaxForm({
    dataType: 'json',
    success: function (data) {
        metador.parseResponse(data);
        if (data.content) {
            Window.metador.metadorMap.drawGeometryForSearch(data.content);
        }
    },
    error: function (jqXHR, textStatus, errorThrown) {
        metador.displayError(errorThrown);
    }
});

$('#map-menu-load-wms-button').on('click', function () {
    var $input = $('#map-menu-load-wms-input');
    if ($input.val()) {
        $.ajax({
            url: $input.attr('data-url'),
            data: {
                url: encodeURIComponent($input.val())
            },
            success: function (data) {
                metador.parseResponse(data);
                Window.metador.metadorMap.addLayerForOptions(data);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                metador.displayError(errorThrown);
            }
        });
    } else {
        metador.displayError('Keine GetCapabilities URL eingetragen!');
    }
});

/* properties muss über uuid, title und alternateTitle verfügen */
function createBboxGeoFeature(west, south, east, north, properties) {
    var feature = {
        'type': 'Feature',
        'geometry': {
            'type': 'Polygon',
            'coordinates': [[[west, south], [east, south], [east, north], [west, north], [west, south]]]
        }
    };
    if (properties) {
        feature['properties'] = {};
        for (var key in properties) {
            feature['properties'][key] = properties[key];
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
                'name': crs ? crs : 'EPSG:4326'
            }
        },
        'features': geoFeatures ? geoFeatures : []
    };
}

function addFeature(geoCollection, geoFeature) {
    geoCollection.features.push(geoFeature);
}

Window.metador.initMap();

// show clear features
// show features
var hgcollection = createGeoCollection();
addFeature(hgcollection, createBboxGeoFeature(9, 49, 12, 50, {
    'uuid': 'tiurutuuuoooi',
    'title': 'Feature 1',
    'alternateTitle': 'Feature 1111111'
}));
addFeature(hgcollection, createBboxGeoFeature(9, 49, 12, 50, {
    'uuid': 'ewqwqrqwreqwer',
    'title': 'Feature 2',
    'alternateTitle': 'Feature 222222'
}));
// Window.metador.metadorMap.showFeatures(hgcollection);
// clear features
// Window.metador.metadorMap.clearFeatures();