// map menu
$('.-js-toggle-map').on('click', function () {
    $(this).toggleClass('active');
    $('.-js-map-dialog').show();
    $('.-js-home').toggleClass('map-enabled');
    if (window && window.spatial && window.spatial.map) {
        window.spatial.map.updateMap();
    }
});

$(document).on('click', '.-js-toggle-layertree', function () {
    $(this).closest('.-js-map-dialog').toggleClass('active');
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
    window.spatial.map.changeCrs($(this).val());
});

$(document).on('click', '.-js-spatial-operator', function () {
    setSpatialFilter(null);
    search.find();
});

function createSpatialFilter(geoFeature) {
    var _geoFeature = geoFeature ? geoFeature : window.spatial.map.getFirstGeomForSearch();
    if (!_geoFeature) {
        return null;
    }
    var operation = $('.-js-spatial-operator').val();
    var filter = {};
    filter[operation] = {'geom': _geoFeature};

    return filter;
}

function setSpatialFilter(geoFeature) {
    var filter = createSpatialFilter(geoFeature);
    if (filter) {
        search.set('spatial', filter);
    } else {
        search.set('spatial', null);
    }
}

$('.-js-draw-type').on('click', function () {
    var $this = $(this);
    window.spatial.map.drawShapeForSearch(
        $this.val(),
        function (geoFeature) {
            setSpatialFilter(geoFeature);
            search.find();
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
            window.spatial.map.drawGeometryForSearch(
                data.content,
                function (geoFeature) {
                    setSpatialFilter(geoFeature);
                    search.find();
                }
            );
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
                window.spatial.map.addLayerForOptions(data);
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
// window.spatial.map.showFeatures(hgcollection);
// clear features
// window.spatial.map.clearFeatures();
