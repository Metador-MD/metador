$('.-js-toggle-map').on('click', function () {
    $(this).toggleClass('active');
    $('.-js-map-dialog').toggleClass('active');
    MetadorOl4Bridge.updateMap();
});

$(document).on('click', '.-js-toggle-layertree', function () {
    $(this).closest('.-js-map-dialog-menu').toggleClass('active');
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
    }
    // else {
    //     MetadorOl4Bridge.drawShapeForSearch(geometryType);
    // }
});

$('.-js-spatial-switcher').on('click', function () {
    var $but = $(this);
    if ($but.hasClass("success")) {
        $but.removeClass("success");
        MetadorOl4Bridge.drawShapeForSearch("NONE");
    } else {
        $but.addClass("success");
        var geometryType = $('.-js-geometry-type').val();
        if (geometryType !== 'load') {
            MetadorOl4Bridge.drawShapeForSearch(geometryType);
        }
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

    getSearch: function () {
        return search;
    },

    updateMap: function () {
        var spatial = search.get('spatial');
        if (spatial) {
            var name;
            for (name in spatial) {
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
        if (activate) {
            this.getOl().activateFeatureInfo();
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
        var oo;// = operation.split('|');
        if (operation !== null && (oo = operation.split('|')).length === 2) {
            // var n = oo[0];
            // var o = oo[1];
            var ff = {};
            ff[oo[1]] = {'geom': _geoFeature};
            filter[oo[0]] = ff;
        } else if (operation !== null) {
            filter[operation] = {'geom': _geoFeature};
        }

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
                self.resetSpatialOperation();
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
                    self.resetSpatialOperation();
                }
            );
        }
    },
    resetSpatialOperation: function () {
        // $('.-js-spatial-switcher').click();
        $('.-js-spatial-switcher').removeClass("success");
    },
    addLayerForOptions: function (data) {
        this.getOl().addLayerForOptions(data);
    },

    clearFeatures: function () {
        this.getOl().resetFeatureInfo();
        this.getOl().clearFeatures();
    },

    createPolygonGeoFeature: function (pointsStr, properties) {
        var ring = [];
        var coords = pointsStr.split(" ");
        var i;
        var length = coords.length;
        var t0, t1;
        for (i = 1; i < length; i+=2) {
            t0 = parseFloat(coords[i - 1]);
            t1 = parseFloat(coords[i]);
            if (t0 < t1) { // x/y
                ring.push([t0, t1]);
            } else { // y/x
                ring.push([t1, t0]);
            }
        }
        return this.getPolygonGeoFeature([ring], properties);
    },

    getPolygonGeoFeature: function (polyCoords, properties) {
        var feature = {
            'type': 'Feature',
            'geometry': {
                'type': 'Polygon',
                'coordinates': polyCoords
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
            var toGeom = item.polygon;
            if (!toGeom) {
                toGeom = [
                    item.west, item.south,
                    item.east, item.south,
                    item.east, item.north,
                    item.west, item.north,
                    item.west, item.south
                ].join(" ");
            }
            var geoFeature = this.createPolygonGeoFeature(toGeom, properties);
            featureCollection.push(geoFeature);
        }
        if (featureCollection.length > 0) {
            this.getOl().showFeatures(this.createGeoCollection('EPSG:4326', featureCollection));
        }
    },

    showFeatureCollection: function (geoFeatures) {
        this.getOl().showFeatures(this.createGeoCollection('EPSG:4326', geoFeatures));
    },

    showFeature: function (pointsStr, properties) {
        var geoFeature = this.createPolygonGeoFeature(pointsStr, properties);
        this.getOl().showFeatures(this.createGeoCollection('EPSG:4326', [geoFeature]));
    },
    selectFeatures: function (uuids) {
        this.getOl().selectFeatures(uuids);
    }
};
