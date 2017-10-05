// map menu
$('.-js-toggle-map').on('click', function () {
    $(this).toggleClass('active');
    $('.-js-map-dialog').show();
    $('.-js-home').toggleClass('map-enabled');
    MetadorOl4Bridge.updateMap();
});

$('.-js-map-info').on('click', function () {
    var $this = $(this);
    $this.toggleClass("success");
    MetadorOl4Bridge.activateFeatureInfo($this.hasClass("success"));
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

    search.set('page', 1);
    search.find();
});

$('.-js-crs-code').on('change', function () {
    MetadorOl4Bridge.changeCrs($(this).val());
});

$('.-js-spatial-operator').on('change', function () {
    MetadorOl4Bridge.setSpatialFilter(null);
    if ($('.-js-geometry-type').val() !== 'NONE') {
        search.find();
    }
});

$('.-js-geometry-type').on('change', function () {
    var geometryType = $(this).val();
    if (geometryType === 'load') {
        $('.-js-file-upload').click();
    } else {
        MetadorOl4Bridge.drawShapeForSearch(geometryType);
    }
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
    getOl: function () {
        if (window && window.spatial && window.spatial.map) {
            return window.spatial.map;
        } else {
            throw new Error("OL4 Map is not found");
        }
    },

    getSearch: function() {
        return search;
    },

    updateMap: function () {
        var spatial = search.get('spatial');
        if (spatial) {
            var name;
            for (name in spatial) {
                console.log(spatial);
                $('.-js-spatial-operator').val(name);
                var collection = this.createGeoCollection('EPSG:4326', [spatial[name]['geom']]);
                $('.-js-geometry-type').val('load');
                MetadorOl4Bridge.drawGeometryForSearch(collection);
                break;
            }
        }
        this.getOl().updateMap();
    },

    activateFeatureInfo: function (activate) {
        var $tooltip = $('<div class="tooltip hidden" style="padding-right:20px;"></span></div>');
        $tooltip.append('<span style="position:absolute;top:2px;right:0px;" class="icon-plus-circle">');
        if (activate) {
            this.getOl().activateFeatureInfo(
                $tooltip.get(0),
                function(uuid){
                    search.markMetadata(uuid);
                },
                function(uuid){
                    search.unmarkMetadata(uuid);
                },
                function(){
                    search.clearMetadataMarks();
                }
            );
        } else {
            this.getOl().deactivateFeatureInfo();
        }
    },

    changeCrs: function (newCrs) {
        this.getOl().changeCrs(newCrs);
    },

    getGeomForSearch: function () {
        return this.getOl().getFirstGeomForSearch();
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
    },

    drawShapeForSearch: function (shapeType) {
        var self = this;
        this.getOl().drawShapeForSearch(
            shapeType,
            function (geoFeature) {
                self.setSpatialFilter(geoFeature);
                self.getSearch().find();
            }
        );
    },
    drawGeometryForSearch: function (geometry) {
        var self = this;
        if (geometry) {
            this.getOl().drawGeometryForSearch(
                geometry,
                function (geoFeature) {
                    self.setSpatialFilter(geoFeature);
                    self.getSearch().find();
                }
            );
        }
    },
    addLayerForOptions: function (data) {
        this.getOl().addLayerForOptions(data);
    },

    clearFeatures: function () {
        this.getOl().resetFeatureInfo();
        this.getOl().clearFeatures();
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
        this.clearFeatures();
        var featureCollection = [];
        var i = 0;
        for (i = 0; i < resultList.length; i++) {
            var item = resultList[i];
            var properties = {"uuid": item.uuid, "title": item.title};
            var geoFeature = this.createBboxGeoFeature(item.west, item.south, item.east, item.north, properties);
            featureCollection.push(geoFeature);
        }
        if (featureCollection.length > 0) {
            this.getOl().showFeatures(this.createGeoCollection('EPSG:4326', featureCollection));
        }
    },

    showFeatureCollection: function (geoFeatures) {
        this.getOl().showFeatures(this.createGeoCollection('EPSG:4326', geoFeatures));
    },

    showFeature: function (west, south, east, north, properties) {
        var geoFeature = this.createBboxGeoFeature(west, south, east, north, properties);
        this.getOl().showFeatures(this.createGeoCollection('EPSG:4326', [geoFeature]));
    }
};
