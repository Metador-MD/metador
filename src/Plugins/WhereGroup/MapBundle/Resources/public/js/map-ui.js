// map menu
$('.-js-toggle-map').on('click', function () {
    $(this).toggleClass('active');
    $('.-js-map-dialog').show();
    $('.-js-home').toggleClass('map-enabled');
    MetadorOl4Bridge.updateMap();
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
    MetadorOl4Bridge.changeCrs($(this).val());
});

$(document).on('click', '.-js-spatial-operator', function () {
    MetadorOl4Bridge.setSpatialFilter(null);
    search.find();
});

$('.-js-draw-type').on('click', function () {
    var $this = $(this);
    MetadorOl4Bridge.drawShapeForSearch($this.val());
});

$('.-js-file-upload').on('change', function (e) {
    $('#file-upload-form').submit();

});

$('#file-upload-form').ajaxForm({
    dataType: 'json',
    success: function (data) {
        metador.parseResponse(data);
        MetadorOl4Bridge.drawGeometryForSearch(data.content);
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
                MetadorOl4Bridge.addLayerForOptions(data);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                metador.displayError(errorThrown);
            }
        });
    } else {
        metador.displayError('Keine GetCapabilities URL eingetragen!');
    }
});


var MetadorOl4Bridge = {
    ol: window.spatial.map,
    // search: search,
    isExists: function () {
        if (!window || !window.spatial || !window.spatial.map) {
            throw new Error("OL4 Map not exists");
        }
    },

    updateMap: function () {
        // this.isExists();
        this.ol.updateMap();
    },

    changeCrs: function (newCrs) {
        this.ol.changeCrs(newCrs);
    },

    getGeomForSearch: function () {
        return this.ol.getFirstGeomForSearch();
    },

    drawShapeForSearch: function (shapeType) {
        var self = this;
        this.ol.drawShapeForSearch(
            shapeType,
            function (geoFeature) {
                self.setSpatialFilter(geoFeature);
                search.find();
            }
        );
    },
    drawGeometryForSearch: function (geometry) {
        var self = this;
        if (geometry) {
            this.ol.drawGeometryForSearch(
                geometry,
                function (geoFeature) {
                    self.setSpatialFilter(geoFeature);
                    search.find();
                }
            );
        }
    },
    addLayerForOptions: function (data) {
        this.ol.addLayerForOptions(data);
    },

    clearFeatures: function () {
        this.ol.clearFeatures()
    },

    createBboxGeoFeature: function (west, south, east, north, properties) {
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
    },

    createGeoCollection: function (crs, geoFeatures) {
        return {
            'type': 'FeatureCollection',
            'crs': {
                'type': 'name',
                'properties': {
                    'name': crs
                }
            },
            'features': geoFeatures ? geoFeatures : []
        };
    },

    showResults: function (resultList) {
        var featureCollection = [];
        for (var i = 0; i < resultList.length; i++){
            break; // TODO
            var geoFeature = null;//this.createBboxGeoFeature(west, south, east, north, properties);
            featureCollection.push(geoFeature);
        }
        this.ol.showFeatures(this.createGeoCollection('EPSG:4326', featureCollection));
    },

    showFeatureCollection: function (geoFeatures) {
        this.ol.showFeatures(this.createGeoCollection('EPSG:4326', geoFeatures));
    },

    showFeature: function (west, south, east, north, properties) {
        var geoFeature = this.createBboxGeoFeature(west, south, east, north, properties);
        this.ol.showFeatures(this.createGeoCollection('EPSG:4326', [geoFeature]));
    },

    createSpatialFilter: function (geoFeature) {
        var _geoFeature = geoFeature ? geoFeature : this.getGeomForSearch();
        if (!_geoFeature) {
            return null;
        }
        var operation = $('.-js-spatial-operator').val();
        var filter = {};
        filter[operation] = {'geom': _geoFeature};

        return filter;
    },

    setSpatialFilter: function (geoFeature) {
        var filter = this.createSpatialFilter(geoFeature);
        if (filter) {
            search.set('spatial', filter);
        } else {
            search.set('spatial', null);
        }
    }
};

//
// MetadorOl4Bridge.clearFeatures();
//
// MetadorOl4Bridge.showFeature(8, 50, 11, 52, {
//     'uuid': 'tiurutuuuoooi',
//     'title': 'Feature 1',
//     'alternateTitle': 'Feature 1111111'
// });
//
// MetadorOl4Bridge.showFeature(10, 48, 12, 54, {
//     'uuid': 'ewqwqrqwreqwer',
//     'title': 'Feature 2',
//     'alternateTitle': 'Feature 222222'
// });
// 10, 48, 12, 54, {
//     'uuid': 'ewqwqrqwreqwer',
//     'title': 'Feature 2',
//     'alternateTitle': 'Feature 222222'
// }