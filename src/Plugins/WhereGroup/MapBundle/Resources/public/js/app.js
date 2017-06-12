(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var metador = require("./map");
var context = Window;
context.metador = metador;
var metadorMapConfig = {
    map: {
        target: 'map',
        srs: ["EPSG:4326", "EPSG:31466", "EPSG:25832"]
    },
    view: {
        projection: Configuration.parameters['map_crs'],
        maxExtent: Configuration.parameters['map_bbox_max'].split(/,\s?/),
        startExtent: Configuration.parameters['map_bbox_start'].split(/,\s?/),
        scales: [5000, 25000, 50000, 100000, 200000, 250000, 500000, 1000000, 2000000, 5000000, 10000000] //, 20000000, 50000000]
    },
    styles: {
        highlight: {
            fill: {
                color: 'rgba(60, 60, 255, 0.1)'
            },
            stroke: {
                color: 'rgba(60, 60, 255, 1.0)',
                width: 2
            }
        },
        search: {
            fill: {
                color: 'rgba(255, 60, 60, 0.1)'
            },
            stroke: {
                color: 'rgba(255, 60, 60, 1.0)',
                width: 2
            },
            image: {
                circle: {
                    radius: 5,
                    fill: {
                        color: 'rgba(255, 60, 60, 0.6)'
                    }
                }
            }
        }
    },
    source: [
        {
            type: 'WMS',
            url: 'http://osm-demo.wheregroup.com/service?',
            title: 'OSM',
            opacity: 1.0,
            visible: true,
            params: {
                LAYERS: 'osm',
                VERSION: '1.1.1',
                FORMAT: 'image/png'
            }
        },
        {
            type: 'WMS',
            url: 'http://wms.wheregroup.com/cgi-bin/mapbender_user.xml?',
            title: 'MB-User',
            opacity: 1.0,
            visible: true,
            params: {
                LAYERS: 'Mapbender',
                VERSION: '1.1.1',
                FORMAT: 'image/png'
            }
        }
    ],
    proj4Defs: {
        "EPSG:4326": "+proj=longlat +datum=WGS84 +no_defs",
        "EPSG:4258": "+proj=longlat +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +no_defs",
        // "EPSG:31466": "+proj=tmerc +lat_0=0 +lon_0=6 +k=1 +x_0=2500000 +y_0=0 +ellps=bessel +towgs84=598.1,73.7,418.2,0.202,0.045,-2.455,6.7 +units=m +no_defs",
        // "EPSG:31467": "+proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=bessel +towgs84=598.1,73.7,418.2,0.202,0.045,-2.455,6.7 +units=m +no_defs",
        // "EPSG:31468": "+proj=tmerc +lat_0=0 +lon_0=12 +k=1 +x_0=4500000 +y_0=0 +ellps=bessel +towgs84=598.1,73.7,418.2,0.202,0.045,-2.455,6.7 +units=m +no_defs",
        // "EPSG:31469": "+proj=tmerc +lat_0=0 +lon_0=15 +k=1 +x_0=5500000 +y_0=0 +ellps=bessel +towgs84=598.1,73.7,418.2,0.202,0.045,-2.455,6.7 +units=m +no_defs",
        "EPSG:25832": "+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
    }
};
var metadorMap = metador.Ol4Map.create(metadorMapConfig);
metador['metadorMap'] = metadorMap;

},{"./map":2}],2:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Ol4Utils = (function () {
    function Ol4Utils() {
    }
    /*
     * units: 'degrees'|'ft'|'m'|'us-ft'
     */
    Ol4Utils.resolutionScaleFactor = function (units) {
        var dpi = 25.4 / 0.28;
        var mpu = ol.proj.METERS_PER_UNIT[units];
        var inchesPerMeter = 39.37;
        return mpu * inchesPerMeter * dpi;
    };
    Ol4Utils.resolutionForScale = function (scale, factor) {
        return scale / factor;
    };
    Ol4Utils.resolutionsForScales = function (scales, units) {
        var resolutions = [];
        var factor = Ol4Utils.resolutionScaleFactor(units);
        for (var i = 0; i < scales.length; i++) {
            resolutions.push(Ol4Utils.resolutionForScale(scales[i], factor));
        }
        return resolutions;
    };
    Ol4Utils.scaleForResolution = function (resolution, factor) {
        return resolution * factor;
    };
    Ol4Utils.scalesForResolutions = function (resolutions, units) {
        var scales = [];
        var factor = Ol4Utils.resolutionScaleFactor(units);
        for (var i = 0; i < resolutions.length; i++) {
            scales.push(Ol4Utils.scaleForResolution(resolutions[i], factor));
        }
        return scales;
    };
    Ol4Utils.initProj4Defs = function (proj4Defs) {
        for (var name_1 in proj4Defs) {
            proj4.defs(name_1, proj4Defs[name_1]);
        }
    };
    Ol4Utils.getProj = function (projCode) {
        return ol.proj.get(projCode);
    };
    Ol4Utils.getStyle = function (options, style) {
        if (style === void 0) { style = null; }
        var style_ = style ? style : new ol.style.Style();
        style_.setFill(new ol.style.Fill(options['fill']));
        style_.setStroke(new ol.style.Stroke(options['stroke']));
        if (options['image'] && options['image']['circle']) {
            style_.setImage(new ol.style.Circle({
                radius: options['image']['circle']['radius'],
                fill: new ol.style.Fill({
                    color: options['image']['circle']['fill']['color']
                })
            }));
        }
        return style_;
        //
        // return new ol.style_.Style({
        //     fill: new ol.style_.Fill(options['fill']),
        //     stroke: new ol.style_.Stroke(options['stroke'])//,
        //     // image: new ol.style_.Circle({
        //     //     radius: 7,
        //     //     fill: new ol.style_.Fill(options['fill'])
        //     // })
        // });
    };
    return Ol4Utils;
}());
exports.Ol4Utils = Ol4Utils;
var Ol4Geom = (function () {
    function Ol4Geom(geom, proj) {
        this.geom = null;
        this.proj = null;
        this.geom = geom;
        this.proj = proj;
    }
    Ol4Geom.prototype.getGeom = function () {
        return this.geom;
    };
    Ol4Geom.prototype.getProj = function () {
        return this.proj;
    };
    Ol4Geom.prototype.getExtent = function (proj) {
        if (this.proj !== proj) {
            return this.geom.clone().transform(this.proj, proj).getExtent();
        }
        else {
            return this.geom.clone().getExtent();
        }
    };
    Ol4Geom.prototype.getPolygonForExtent = function (proj) {
        return ol.geom.Polygon.fromExtent(this.getExtent(proj));
    };
    return Ol4Geom;
}());
exports.Ol4Geom = Ol4Geom;
var Ol4Extent = (function (_super) {
    __extends(Ol4Extent, _super);
    function Ol4Extent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Ol4Extent.fromArray = function (ordinates, proj) {
        var geom = new ol.geom.MultiPoint([[ordinates[0], ordinates[1]], [ordinates[2], ordinates[3]]]);
        return new Ol4Extent(geom, proj);
    };
    return Ol4Extent;
}(Ol4Geom));
exports.Ol4Extent = Ol4Extent;
exports.UUID = 'uuid';
exports.TITLE = 'title';
exports.METADOR_EPSG = 'EPSG:4326';
var Ol4Map = (function () {
    function Ol4Map(options) {
        this.olMap = null;
        //    protected proj: ol.proj.Projection = null;
        this.startExtent = null; // xmin, ymin, xmax, ymax options['startExtent']
        this.maxExtent = null;
        // init given crses
        // ol['ENABLE_RASTER_REPROJECTION'] = false;
        Ol4Utils.initProj4Defs(options['proj4Defs']);
        var proj = ol.proj.get(options['view']['projection']);
        this.styles = options['styles'];
        this.scales = options['view']['scales'];
        this.startExtent = Ol4Extent.fromArray(options['view']['startExtent'], proj);
        this.maxExtent = Ol4Extent.fromArray(options['view']['maxExtent'], proj);
        this.olMap = new ol.Map({
            target: options['map']['target'],
            renderer: 'canvas'
        });
        this.olMap.setView(new ol.View({
            projection: proj,
            resolutions: Ol4Utils.resolutionsForScales(this.scales, proj.getUnits()).reverse(),
            extent: this.maxExtent.getExtent(proj)
        }));
        for (var _i = 0, _a = options['source']; _i < _a.length; _i++) {
            var source = _a[_i];
            this.addLayerForOptions(source);
        }
        this.olMap.addControl(new ol.control.ScaleLine());
        this.olMap.addControl(new ol.control.ZoomToExtent({
            extent: this.maxExtent.getExtent(proj)
        }));
        this.olMap.addInteraction(new ol.interaction.DragZoom());
        this.olMap.addControl(new ol.control.MousePosition());
        this.olMap.getView().fit(this.startExtent.getPolygonForExtent(proj), this.olMap.getSize());
        for (var _b = 0, _c = this.olMap.getLayers().getArray(); _b < _c.length; _b++) {
            var layer = _c[_b];
            var source = void 0;
            if (layer instanceof ol.layer.Group) {
                console.error('ol.layer.Group as Layer is not suported');
                throw new Error('ol.layer.Group as Layer is not suported');
            }
            else if ((source = layer.getSource()) instanceof ol.source.ImageWMS) {
            }
        }
        this.hgLayer = this.addVectorLayer(Ol4Utils.getStyle(this.styles['highlight']));
    }
    Ol4Map.getUuid = function (prefix) {
        if (prefix === void 0) { prefix = ''; }
        return prefix + (++Ol4Map._uuid);
    };
    Ol4Map.create = function (options) {
        if (!Ol4Map._instance) {
            Ol4Map._instance = new Ol4Map(options);
        }
        return Ol4Map._instance;
    };
    // renderTreeOption() {
    //     let ul = document.querySelector('.-js-map-layertree ul');
    //     var button = document.createElement("button");
    //     document.body.append(button);
    //     button.style.position = 'absolute';
    //     button.style.top = '10px';
    //     button.style.left = '10px';
    //     button.style.zIndex = 10000;
    //     button.onclick = copyClicked;
    // }
    Ol4Map.prototype.getDrawer = function () {
        return this.drawer;
    };
    Ol4Map.prototype.getHgLayer = function () {
        return this.hgLayer;
    };
    Ol4Map.prototype.addLayerForOptions = function (options) {
        if (options['type'] === 'WMS') {
            var wmsLayer = this.addLayer(Ol4WmsLayer.createLayer(options['url'], options['params'], this.olMap.getView().getProjection(), options['visible'], parseFloat(options['opacity'])), options['title']);
            addSource(wmsLayer.get('uuid'), wmsLayer.get('title'), wmsLayer.getVisible(), wmsLayer.getOpacity());
        }
        else {
            console.error(options['type'] + ' is not supported.');
        }
    };
    Ol4Map.prototype.showFeatures = function (vLayer, geoJson) {
        var geoJsonReader = new ol.format.GeoJSON();
        // let geoJsonProj = geoJsonReader.readProjection(geoJson);
        var features = geoJsonReader.readFeatures(geoJson, {
            'dataProjection': geoJsonReader.readProjection(geoJson),
            'featureProjection': this.olMap.getView().getProjection()
        });
        vLayer.getSource().addFeatures(features);
    };
    Ol4Map.prototype.clearFeatures = function (vLayer) {
        vLayer.getSource().clear(true);
    };
    Ol4Map.prototype.addVectorLayer = function (style) {
        var options = {
            wrapX: false
        };
        var vLayer = new ol.layer.Vector({
            source: new ol.source.Vector(options),
            style: style
        });
        return this.addLayer(vLayer);
    };
    Ol4Map.prototype.addLayer = function (layer, title) {
        if (title === void 0) { title = null; }
        layer.set(exports.UUID, Ol4Map.getUuid('olay-'));
        if (title) {
            layer.set(exports.TITLE, title);
        }
        this.olMap.addLayer(layer);
        return layer;
    };
    Ol4Map.prototype.removeLayer = function (layer) {
        this.olMap.removeLayer(layer);
    };
    Ol4Map.prototype.findLayer = function (uuid) {
        var layers = this.olMap.getLayers().getArray();
        var llength = layers.length;
        for (var _i = 0, layers_1 = layers; _i < layers_1.length; _i++) {
            var layer = layers_1[_i];
            var source = void 0;
            if (layer instanceof ol.layer.Group) {
                console.error('ol.layer.Group as Layer is not suported');
                throw new Error('ol.layer.Group as Layer is not suported');
            }
            else if (layer.get(exports.UUID) === uuid) {
                return layer;
            }
        }
        return null;
    };
    Ol4Map.prototype.updateMap = function () {
        this.olMap.updateSize();
    };
    Ol4Map.prototype.changeCrs = function (crs) {
        var proj = null;
        if ((proj = ol.proj.get(crs))) {
            var extent = Ol4Extent.fromArray(this.olMap.getView().calculateExtent(this.olMap.getSize()), this.olMap.getView().getProjection());
            var projection = this.olMap.getView().getProjection();
            var center = this.olMap.getView().getCenter();
            var newView = new ol.View({
                projection: proj,
                resolutions: Ol4Utils.resolutionsForScales(this.scales, proj.getUnits()).reverse(),
                extent: this.maxExtent.getExtent(proj)
            });
            var layers = this.olMap.getLayers().getArray();
            var llength = layers.length;
            for (var _i = 0, layers_2 = layers; _i < layers_2.length; _i++) {
                var layer = layers_2[_i];
                var source = void 0;
                if (layer instanceof ol.layer.Group) {
                    console.error('ol.layer.Group as Layer is not suported');
                    throw new Error('ol.layer.Group as Layer is not suported');
                }
                else if ((source = layer.getSource()) instanceof ol.source.ImageWMS) {
                    layer.setSource(Ol4WmsLayer.createFromSource(source, proj));
                }
                else if ((source = layer.getSource()) instanceof ol.source.Vector) {
                    var features = source.getFeatures();
                    for (var _a = 0, features_1 = features; _a < features_1.length; _a++) {
                        var feature = features_1[_a];
                        feature.setGeometry(feature.getGeometry().transform(projection, proj));
                    }
                }
            }
            this.olMap.setView(newView);
            this.olMap.getView().fit(extent.getPolygonForExtent(proj), this.olMap.getSize());
            // let cpoint = <ol.geom.Point> new ol.geom.Point(center).transform(projection, proj);
            // console.log(cpoint.getCoordinates());
            // this.olMap.getView().setCenter(cpoint.getCoordinates());
        }
    };
    Ol4Map.prototype.setVisible = function (layerUiid, visiblity) {
        var layer = this.findLayer(layerUiid);
        if (layer) {
            layer.setVisible(visiblity);
        }
    };
    Ol4Map.prototype.setOpacity = function (layerUiid, opacity) {
        var layer = this.findLayer(layerUiid);
        if (layer) {
            layer.setOpacity(opacity);
        }
    };
    Ol4Map.prototype.dragZoom = function (activate, onZoomEnd) {
        if (onZoomEnd === void 0) { onZoomEnd = null; }
        if (!this.dragzoom) {
            this.dragzoom = new ol.interaction.DragZoom({
                condition: function () {
                    return true;
                }
            });
            var dragzoom_1 = this.dragzoom;
            var map_1 = this.olMap;
            this.dragzoom.on('boxend', function (event) {
                map_1.removeInteraction(dragzoom_1);
                if (onZoomEnd) {
                    onZoomEnd();
                }
            });
        }
        if (activate) {
            this.olMap.addInteraction(this.dragzoom);
        }
        else {
            this.olMap.removeInteraction(this.dragzoom);
        }
    };
    Ol4Map.prototype.drawShape = function (shapeType, onDrawEnd) {
        if (shapeType === void 0) { shapeType = null; }
        if (onDrawEnd === void 0) { onDrawEnd = null; }
        var ol4map = this;
        var olMap = this.olMap;
        if (!this.drawer) {
            var vLayer = this.addVectorLayer(Ol4Utils.getStyle(this.styles['search']));
            vLayer.setMap(this.olMap);
            this.drawer = new Ol4Drawer(vLayer);
        }
        var shape = typeof shapeType === 'string' ? SHAPES[shapeType] : shapeType;
        if (this.drawer.getInteraction()) {
            this.olMap.removeInteraction(this.drawer.getInteraction());
        }
        this.drawer.setInteraction(shape, Ol4Utils.getStyle(this.styles['search']));
        if (this.drawer.getInteraction()) {
            var drawer_1 = this.drawer;
            this.getDrawer().getLayer().getSource().clear();
            this.olMap.addInteraction(this.drawer.getInteraction());
            this.drawer.getInteraction().on('drawstart', function (e) {
                ol4map.getDrawer().getLayer().getSource().clear();
            });
            this.drawer.getInteraction().on('drawend', function (e) {
                var geojson = new ol.format.GeoJSON().writeFeatureObject(e.feature, {
                    'dataProjection': exports.METADOR_EPSG,
                    'featureProjection': olMap.getView().getProjection()
                });
                onDrawEnd(geojson);
                olMap.removeInteraction(drawer_1.getInteraction());
            });
        }
        else {
            this.getDrawer().getLayer().getSource().clear();
            onDrawEnd(null);
        }
    };
    return Ol4Map;
}());
Ol4Map._uuid = 0;
Ol4Map._instance = null; // singleton
exports.Ol4Map = Ol4Map;
var Ol4WmsLayer = (function () {
    function Ol4WmsLayer() {
    }
    Ol4WmsLayer.createLayer = function (url, params, proj, visible, opacity) {
        var sourceWms = new ol.layer.Image({
            source: Ol4WmsLayer.createSource(url, params, proj),
            visible: visible,
            opacity: opacity
        });
        return sourceWms;
    };
    Ol4WmsLayer.createSource = function (url, params, proj) {
        return new ol.source.ImageWMS({
            url: url,
            params: params,
            projection: proj
        });
    };
    Ol4WmsLayer.createFromSource = function (source, proj) {
        return new ol.source.ImageWMS({
            url: source.getUrl(),
            params: source.getParams(),
            projection: proj
        });
    };
    return Ol4WmsLayer;
}());
exports.Ol4WmsLayer = Ol4WmsLayer;
var SHAPES;
(function (SHAPES) {
    SHAPES[SHAPES["NONE"] = 0] = "NONE";
    SHAPES[SHAPES["BOX"] = 1] = "BOX";
    SHAPES[SHAPES["POLYGON"] = 2] = "POLYGON";
})(SHAPES = exports.SHAPES || (exports.SHAPES = {}));
;
var Ol4Drawer = (function () {
    function Ol4Drawer(layer) {
        this.layer = layer;
    }
    Ol4Drawer.prototype.getLayer = function () {
        return this.layer;
    };
    Ol4Drawer.prototype.getInteraction = function () {
        return this.interaction;
    };
    Ol4Drawer.prototype.setInteraction = function (type, drawStyle) {
        switch (type) {
            case SHAPES.BOX:
                this.interaction = new ol.interaction.Draw({
                    source: this.layer.getSource(),
                    type: 'Circle',
                    style: drawStyle,
                    geometryFunction: createBox() // ol.d.ts has no function "ol.interaction.Draw.createBox()"
                });
                break;
            case SHAPES.POLYGON:
                this.interaction = new ol.interaction.Draw({
                    source: this.layer.getSource(),
                    type: 'Polygon',
                    style: drawStyle
                });
                break;
            default:
                this.interaction = null;
        }
    };
    return Ol4Drawer;
}());
exports.Ol4Drawer = Ol4Drawer;
/**
 * ol.d.ts has no function "ol.interaction.Draw.createBox()"
 * @returns {(coordinates:any, opt_geometry:any)=>any|ol.geom.Polygon}
 */
function createBox() {
    return (
    /**
     * @param {ol.Coordinate|Array.<ol.Coordinate>|Array.<Array.<ol.Coordinate>>} coordinates
     * @param {ol.geom.SimpleGeometry=} opt_geometry
     * @return {ol.geom.SimpleGeometry}
     */
    function (coordinates, opt_geometry) {
        var extent = ol.extent.boundingExtent(coordinates);
        var geometry = opt_geometry || new ol.geom.Polygon(null);
        geometry.setCoordinates([[
                ol.extent.getBottomLeft(extent),
                ol.extent.getBottomRight(extent),
                ol.extent.getTopRight(extent),
                ol.extent.getTopLeft(extent),
                ol.extent.getBottomLeft(extent)
            ]]);
        return geometry;
    });
}
exports.createBox = createBox;
;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvUGx1Z2lucy9XaGVyZUdyb3VwL01hcEJ1bmRsZS9SZXNvdXJjZXMvdHMvYXBwLnRzIiwic3JjL1BsdWdpbnMvV2hlcmVHcm91cC9NYXBCdW5kbGUvUmVzb3VyY2VzL3RzL21hcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsK0JBQWlDO0FBSWpDLElBQUksT0FBTyxHQUFRLE1BQU0sQ0FBQztBQUMxQixPQUFPLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztBQUcxQixJQUFJLGdCQUFnQixHQUFHO0lBQ25CLEdBQUcsRUFBRTtRQUNELE1BQU0sRUFBRSxLQUFLO1FBQ2IsR0FBRyxFQUFFLENBQUMsV0FBVyxFQUFFLFlBQVksRUFBRSxZQUFZLENBQUM7S0FDakQ7SUFDRCxJQUFJLEVBQUU7UUFDRixVQUFVLEVBQUUsYUFBYSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUM7UUFDL0MsU0FBUyxFQUFFLGFBQWEsQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztRQUNqRSxXQUFXLEVBQUUsYUFBYSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7UUFDckUsTUFBTSxFQUFFLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFBLHVCQUF1QjtLQUMzSDtJQUNELE1BQU0sRUFBRTtRQUNKLFNBQVMsRUFBRTtZQUNQLElBQUksRUFBRTtnQkFDRixLQUFLLEVBQUUsd0JBQXdCO2FBQ2xDO1lBQ0QsTUFBTSxFQUFFO2dCQUNKLEtBQUssRUFBRSx3QkFBd0I7Z0JBQy9CLEtBQUssRUFBRSxDQUFDO2FBQ1g7U0FDSjtRQUNE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bnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgKiBhcyBtZXRhZG9yIGZyb20gJy4vbWFwJztcblxuZGVjbGFyZSB2YXIgQ29uZmlndXJhdGlvbjogYW55O1xuXG5sZXQgY29udGV4dDogYW55ID0gV2luZG93O1xuY29udGV4dC5tZXRhZG9yID0gbWV0YWRvcjtcblxuXG52YXIgbWV0YWRvck1hcENvbmZpZyA9IHtcbiAgICBtYXA6IHtcbiAgICAgICAgdGFyZ2V0OiAnbWFwJyxcbiAgICAgICAgc3JzOiBbXCJFUFNHOjQzMjZcIiwgXCJFUFNHOjMxNDY2XCIsIFwiRVBTRzoyNTgzMlwiXVxuICAgIH0sXG4gICAgdmlldzoge1xuICAgICAgICBwcm9qZWN0aW9uOiBDb25maWd1cmF0aW9uLnBhcmFtZXRlcnNbJ21hcF9jcnMnXSwvLyc6ICc5LDQ5LDExLDUzJywgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1xuICAgICAgICBtYXhFeHRlbnQ6IENvbmZpZ3VyYXRpb24ucGFyYW1ldGVyc1snbWFwX2Jib3hfbWF4J10uc3BsaXQoLyxcXHM/LyksLy9bNS44LCA0Ny4wLCAxNS4wLCA1NS4wXSwgLy8gcHJpb3JpdHkgZm9yIHNjYWxlcyBvciBmb3IgbWF4RXh0ZW50P1xuICAgICAgICBzdGFydEV4dGVudDogQ29uZmlndXJhdGlvbi5wYXJhbWV0ZXJzWydtYXBfYmJveF9zdGFydCddLnNwbGl0KC8sXFxzPy8pLFxuICAgICAgICBzY2FsZXM6IFs1MDAwLCAyNTAwMCwgNTAwMDAsIDEwMDAwMCwgMjAwMDAwLCAyNTAwMDAsIDUwMDAwMCwgMTAwMDAwMCwgMjAwMDAwMCwgNTAwMDAwMCwgMTAwMDAwMDBdLy8sIDIwMDAwMDAwLCA1MDAwMDAwMF1cbiAgICB9LFxuICAgIHN0eWxlczoge1xuICAgICAgICBoaWdobGlnaHQ6IHtcbiAgICAgICAgICAgIGZpbGw6IHtcbiAgICAgICAgICAgICAgICBjb2xvcjogJ3JnYmEoNjAsIDYwLCAyNTUsIDAuMSknXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3Ryb2tlOiB7XG4gICAgICAgICAgICAgICAgY29sb3I6ICdyZ2JhKDYwLCA2MCwgMjU1LCAxLjApJyxcbiAgICAgICAgICAgICAgICB3aWR0aDogMlxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBzZWFyY2g6IHtcbiAgICAgICAgICAgIGZpbGw6IHtcbiAgICAgICAgICAgICAgICBjb2xvcjogJ3JnYmEoMjU1LCA2MCwgNjAsIDAuMSknXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3Ryb2tlOiB7XG4gICAgICAgICAgICAgICAgY29sb3I6ICdyZ2JhKDI1NSwgNjAsIDYwLCAxLjApJyxcbiAgICAgICAgICAgICAgICB3aWR0aDogMlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGltYWdlOiB7XG4gICAgICAgICAgICAgICAgY2lyY2xlOiB7XG4gICAgICAgICAgICAgICAgICAgIHJhZGl1czogNSxcbiAgICAgICAgICAgICAgICAgICAgZmlsbDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6ICdyZ2JhKDI1NSwgNjAsIDYwLCAwLjYpJ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBzb3VyY2U6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgdHlwZTogJ1dNUycsXG4gICAgICAgICAgICB1cmw6ICdodHRwOi8vb3NtLWRlbW8ud2hlcmVncm91cC5jb20vc2VydmljZT8nLFxuICAgICAgICAgICAgdGl0bGU6ICdPU00nLFxuICAgICAgICAgICAgb3BhY2l0eTogMS4wLFxuICAgICAgICAgICAgdmlzaWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgIExBWUVSUzogJ29zbScsXG4gICAgICAgICAgICAgICAgVkVSU0lPTjogJzEuMS4xJyxcbiAgICAgICAgICAgICAgICBGT1JNQVQ6ICdpbWFnZS9wbmcnXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIHR5cGU6ICdXTVMnLFxuICAgICAgICAgICAgdXJsOiAnaHR0cDovL3dtcy53aGVyZWdyb3VwLmNvbS9jZ2ktYmluL21hcGJlbmRlcl91c2VyLnhtbD8nLFxuICAgICAgICAgICAgdGl0bGU6ICdNQi1Vc2VyJyxcbiAgICAgICAgICAgIG9wYWNpdHk6IDEuMCxcbiAgICAgICAgICAgIHZpc2libGU6IHRydWUsXG4gICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgICBMQVlFUlM6ICdNYXBiZW5kZXInLFxuICAgICAgICAgICAgICAgIFZFUlNJT046ICcxLjEuMScsXG4gICAgICAgICAgICAgICAgRk9STUFUOiAnaW1hZ2UvcG5nJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgXSxcbiAgICBwcm9qNERlZnM6IHtcbiAgICAgICAgXCJFUFNHOjQzMjZcIjogXCIrcHJvaj1sb25nbGF0ICtkYXR1bT1XR1M4NCArbm9fZGVmc1wiLFxuICAgICAgICBcIkVQU0c6NDI1OFwiOiBcIitwcm9qPWxvbmdsYXQgK2VsbHBzPUdSUzgwICt0b3dnczg0PTAsMCwwLDAsMCwwLDAgK25vX2RlZnNcIixcbiAgICAgICAgLy8gXCJFUFNHOjMxNDY2XCI6IFwiK3Byb2o9dG1lcmMgK2xhdF8wPTAgK2xvbl8wPTYgK2s9MSAreF8wPTI1MDAwMDAgK3lfMD0wICtlbGxwcz1iZXNzZWwgK3Rvd2dzODQ9NTk4LjEsNzMuNyw0MTguMiwwLjIwMiwwLjA0NSwtMi40NTUsNi43ICt1bml0cz1tICtub19kZWZzXCIsXG4gICAgICAgIC8vIFwiRVBTRzozMTQ2N1wiOiBcIitwcm9qPXRtZXJjICtsYXRfMD0wICtsb25fMD05ICtrPTEgK3hfMD0zNTAwMDAwICt5XzA9MCArZWxscHM9YmVzc2VsICt0b3dnczg0PTU5OC4xLDczLjcsNDE4LjIsMC4yMDIsMC4wNDUsLTIuNDU1LDYuNyArdW5pdHM9bSArbm9fZGVmc1wiLFxuICAgICAgICAvLyBcIkVQU0c6MzE0NjhcIjogXCIrcHJvaj10bWVyYyArbGF0XzA9MCArbG9uXzA9MTIgK2s9MSAreF8wPTQ1MDAwMDAgK3lfMD0wICtlbGxwcz1iZXNzZWwgK3Rvd2dzODQ9NTk4LjEsNzMuNyw0MTguMiwwLjIwMiwwLjA0NSwtMi40NTUsNi43ICt1bml0cz1tICtub19kZWZzXCIsXG4gICAgICAgIC8vIFwiRVBTRzozMTQ2OVwiOiBcIitwcm9qPXRtZXJjICtsYXRfMD0wICtsb25fMD0xNSAraz0xICt4XzA9NTUwMDAwMCAreV8wPTAgK2VsbHBzPWJlc3NlbCArdG93Z3M4ND01OTguMSw3My43LDQxOC4yLDAuMjAyLDAuMDQ1LC0yLjQ1NSw2LjcgK3VuaXRzPW0gK25vX2RlZnNcIixcbiAgICAgICAgXCJFUFNHOjI1ODMyXCI6IFwiK3Byb2o9dXRtICt6b25lPTMyICtlbGxwcz1HUlM4MCArdG93Z3M4ND0wLDAsMCwwLDAsMCwwICt1bml0cz1tICtub19kZWZzXCIsXG4gICAgICAgIC8vIFwiRVBTRzoyNTgzM1wiOiBcIitwcm9qPXV0bSArem9uZT0zMyArZWxscHM9R1JTODAgK3Rvd2dzODQ9MCwwLDAsMCwwLDAsMCArdW5pdHM9bSArbm9fZGVmc1wiXG4gICAgfVxufTtcblxubGV0IG1ldGFkb3JNYXAgPSBtZXRhZG9yLk9sNE1hcC5jcmVhdGUobWV0YWRvck1hcENvbmZpZyk7XG5tZXRhZG9yWydtZXRhZG9yTWFwJ10gPSBtZXRhZG9yTWFwO1xuIiwiaW1wb3J0IE9iamVjdCA9IG9sLk9iamVjdDtcblxuZGVjbGFyZSBjbGFzcyBwcm9qNCB7XG4gICAgc3RhdGljIGRlZnMobmFtZTogc3RyaW5nLCBkZWY6IHN0cmluZyk6IHZvaWQ7XG59XG5cbmRlY2xhcmUgZnVuY3Rpb24gYWRkU291cmNlKGlkOiBzdHJpbmcsIHRpdGxlOiBzdHJpbmcsIHZpc2liaWxpdHk6IGJvb2xlYW4sIG9wYWNpdHk6IG51bWJlcik6IHZvaWQ7XG5cbmV4cG9ydCBjbGFzcyBPbDRVdGlscyB7XG4gICAgLyogXG4gICAgICogdW5pdHM6ICdkZWdyZWVzJ3wnZnQnfCdtJ3wndXMtZnQnXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyByZXNvbHV0aW9uU2NhbGVGYWN0b3IodW5pdHM6IHN0cmluZyk6IG51bWJlciB7XG4gICAgICAgIGxldCBkcGkgPSAyNS40IC8gMC4yODtcbiAgICAgICAgbGV0IG1wdSA9IG9sLnByb2ouTUVURVJTX1BFUl9VTklUW3VuaXRzXTtcbiAgICAgICAgbGV0IGluY2hlc1Blck1ldGVyID0gMzkuMzc7XG4gICAgICAgIHJldHVybiBtcHUgKiBpbmNoZXNQZXJNZXRlciAqIGRwaTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIHJlc29sdXRpb25Gb3JTY2FsZShzY2FsZTogbnVtYmVyLCBmYWN0b3I6IG51bWJlcik6IG51bWJlciB7XG4gICAgICAgIHJldHVybiBzY2FsZSAvIGZhY3RvcjtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIHJlc29sdXRpb25zRm9yU2NhbGVzKHNjYWxlczogbnVtYmVyW10sIHVuaXRzOiBzdHJpbmcpOiBudW1iZXJbXSB7XG4gICAgICAgIGxldCByZXNvbHV0aW9ucyA9IFtdO1xuICAgICAgICBsZXQgZmFjdG9yID0gT2w0VXRpbHMucmVzb2x1dGlvblNjYWxlRmFjdG9yKHVuaXRzKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzY2FsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHJlc29sdXRpb25zLnB1c2goT2w0VXRpbHMucmVzb2x1dGlvbkZvclNjYWxlKHNjYWxlc1tpXSwgZmFjdG9yKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc29sdXRpb25zO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgc2NhbGVGb3JSZXNvbHV0aW9uKHJlc29sdXRpb246IG51bWJlciwgZmFjdG9yOiBudW1iZXIpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gcmVzb2x1dGlvbiAqIGZhY3RvcjtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIHNjYWxlc0ZvclJlc29sdXRpb25zKHJlc29sdXRpb25zOiBudW1iZXJbXSwgdW5pdHM6IHN0cmluZyk6IG51bWJlcltdIHtcbiAgICAgICAgbGV0IHNjYWxlcyA9IFtdO1xuICAgICAgICBsZXQgZmFjdG9yID0gT2w0VXRpbHMucmVzb2x1dGlvblNjYWxlRmFjdG9yKHVuaXRzKTtcbiAgICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IHJlc29sdXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzY2FsZXMucHVzaChPbDRVdGlscy5zY2FsZUZvclJlc29sdXRpb24ocmVzb2x1dGlvbnNbaV0sIGZhY3RvcikpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzY2FsZXM7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBpbml0UHJvajREZWZzKHByb2o0RGVmczogYW55KTogdm9pZCB7XG4gICAgICAgIGZvciAoY29uc3QgbmFtZSBpbiBwcm9qNERlZnMpIHtcbiAgICAgICAgICAgIHByb2o0LmRlZnMobmFtZSwgcHJvajREZWZzW25hbWVdKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0UHJvaihwcm9qQ29kZTogc3RyaW5nKTogb2wucHJvai5Qcm9qZWN0aW9uIHtcbiAgICAgICAgcmV0dXJuIG9sLnByb2ouZ2V0KHByb2pDb2RlKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGdldFN0eWxlKG9wdGlvbnM6IGFueSwgc3R5bGU6IG9sLnN0eWxlLlN0eWxlID0gbnVsbCk6IG9sLnN0eWxlLlN0eWxlIHtcbiAgICAgICAgbGV0IHN0eWxlXyA9IHN0eWxlID8gc3R5bGUgOiBuZXcgb2wuc3R5bGUuU3R5bGUoKTtcbiAgICAgICAgc3R5bGVfLnNldEZpbGwobmV3IG9sLnN0eWxlLkZpbGwob3B0aW9uc1snZmlsbCddKSk7XG4gICAgICAgIHN0eWxlXy5zZXRTdHJva2UobmV3IG9sLnN0eWxlLlN0cm9rZShvcHRpb25zWydzdHJva2UnXSkpO1xuICAgICAgICBpZiAob3B0aW9uc1snaW1hZ2UnXSAmJiBvcHRpb25zWydpbWFnZSddWydjaXJjbGUnXSkge1xuICAgICAgICAgICAgc3R5bGVfLnNldEltYWdlKG5ldyBvbC5zdHlsZS5DaXJjbGUoe1xuICAgICAgICAgICAgICAgICAgICByYWRpdXM6IG9wdGlvbnNbJ2ltYWdlJ11bJ2NpcmNsZSddWydyYWRpdXMnXSxcbiAgICAgICAgICAgICAgICAgICAgZmlsbDogbmV3IG9sLnN0eWxlLkZpbGwoe1xuICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6IG9wdGlvbnNbJ2ltYWdlJ11bJ2NpcmNsZSddWydmaWxsJ11bJ2NvbG9yJ11cbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3R5bGVfO1xuICAgICAgICAvL1xuICAgICAgICAvLyByZXR1cm4gbmV3IG9sLnN0eWxlXy5TdHlsZSh7XG4gICAgICAgIC8vICAgICBmaWxsOiBuZXcgb2wuc3R5bGVfLkZpbGwob3B0aW9uc1snZmlsbCddKSxcbiAgICAgICAgLy8gICAgIHN0cm9rZTogbmV3IG9sLnN0eWxlXy5TdHJva2Uob3B0aW9uc1snc3Ryb2tlJ10pLy8sXG4gICAgICAgIC8vICAgICAvLyBpbWFnZTogbmV3IG9sLnN0eWxlXy5DaXJjbGUoe1xuICAgICAgICAvLyAgICAgLy8gICAgIHJhZGl1czogNyxcbiAgICAgICAgLy8gICAgIC8vICAgICBmaWxsOiBuZXcgb2wuc3R5bGVfLkZpbGwob3B0aW9uc1snZmlsbCddKVxuICAgICAgICAvLyAgICAgLy8gfSlcbiAgICAgICAgLy8gfSk7XG4gICAgfVxuXG4vLyBmaWxsXG4vLyB7XG4vLyAgICAgY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4yKVxuLy8gfVxuLy8gc3Ryb2tlXG4vLyB7XG4vLyAgICAgY29sb3I6ICcjZmZjYzMzJyxcbi8vICAgICB3aWR0aDogMlxuLy8gICAgIGRhc2g6XG4vLyB9XG4vLyBpbWFnZVxufVxuXG5leHBvcnQgY2xhc3MgT2w0R2VvbSB7XG4gICAgcHJvdGVjdGVkIGdlb206IG9sLmdlb20uR2VvbWV0cnkgPSBudWxsO1xuICAgIHByb3RlY3RlZCBwcm9qOiBvbC5wcm9qLlByb2plY3Rpb24gPSBudWxsO1xuXG4gICAgY29uc3RydWN0b3IoZ2VvbTogb2wuZ2VvbS5HZW9tZXRyeSwgcHJvajogb2wucHJvai5Qcm9qZWN0aW9uKSB7XG4gICAgICAgIHRoaXMuZ2VvbSA9IGdlb207XG4gICAgICAgIHRoaXMucHJvaiA9IHByb2o7XG4gICAgfVxuXG4gICAgZ2V0R2VvbSgpOiBvbC5nZW9tLkdlb21ldHJ5IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2VvbTtcbiAgICB9XG5cbiAgICBnZXRQcm9qKCk6IG9sLnByb2ouUHJvamVjdGlvbiB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb2o7XG4gICAgfVxuXG4gICAgZ2V0RXh0ZW50KHByb2o6IG9sLnByb2ouUHJvamVjdGlvbik6IG9sLkV4dGVudCB7XG4gICAgICAgIGlmICh0aGlzLnByb2ogIT09IHByb2opIHtcbiAgICAgICAgICAgIHJldHVybiAoPG9sLmdlb20uR2VvbWV0cnk+KDxhbnk+IHRoaXMuZ2VvbSkuY2xvbmUoKSkudHJhbnNmb3JtKHRoaXMucHJvaiwgcHJvaikuZ2V0RXh0ZW50KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gKDxvbC5nZW9tLkdlb21ldHJ5Pig8YW55PiB0aGlzLmdlb20pLmNsb25lKCkpLmdldEV4dGVudCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGdldFBvbHlnb25Gb3JFeHRlbnQocHJvajogb2wucHJvai5Qcm9qZWN0aW9uKSB7XG4gICAgICAgIHJldHVybiBvbC5nZW9tLlBvbHlnb24uZnJvbUV4dGVudCh0aGlzLmdldEV4dGVudChwcm9qKSk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgT2w0RXh0ZW50IGV4dGVuZHMgT2w0R2VvbSB7XG4gICAgcHVibGljIHN0YXRpYyBmcm9tQXJyYXkob3JkaW5hdGVzOiBudW1iZXJbXSwgcHJvajogb2wucHJvai5Qcm9qZWN0aW9uKTogT2w0RXh0ZW50IHtcbiAgICAgICAgbGV0IGdlb20gPSBuZXcgb2wuZ2VvbS5NdWx0aVBvaW50KFtbb3JkaW5hdGVzWzBdLCBvcmRpbmF0ZXNbMV1dLCBbb3JkaW5hdGVzWzJdLCBvcmRpbmF0ZXNbM11dXSk7XG4gICAgICAgIHJldHVybiBuZXcgT2w0RXh0ZW50KGdlb20sIHByb2opO1xuICAgIH1cbn1cbmV4cG9ydCBjb25zdCBVVUlEOiBzdHJpbmcgPSAndXVpZCc7XG5leHBvcnQgY29uc3QgVElUTEU6IHN0cmluZyA9ICd0aXRsZSc7XG5leHBvcnQgY29uc3QgTUVUQURPUl9FUFNHOiBvbC5Qcm9qZWN0aW9uTGlrZSA9ICdFUFNHOjQzMjYnO1xuXG5leHBvcnQgY2xhc3MgT2w0TWFwIHtcbiAgICBwcml2YXRlIHN0YXRpYyBfdXVpZCA9IDA7XG4gICAgcHJpdmF0ZSBzdGF0aWMgX2luc3RhbmNlOiBPbDRNYXAgPSBudWxsOyAvLyBzaW5nbGV0b25cbiAgICBwcm90ZWN0ZWQgb2xNYXA6IG9sLk1hcCA9IG51bGw7XG4gICAgcHJvdGVjdGVkIHNjYWxlczogbnVtYmVyW107XG4gICAgLy8gICAgcHJvdGVjdGVkIHByb2o6IG9sLnByb2ouUHJvamVjdGlvbiA9IG51bGw7XG4gICAgcHJvdGVjdGVkIHN0YXJ0RXh0ZW50OiBPbDRFeHRlbnQgPSBudWxsOyAgLy8geG1pbiwgeW1pbiwgeG1heCwgeW1heCBvcHRpb25zWydzdGFydEV4dGVudCddXG4gICAgcHJvdGVjdGVkIG1heEV4dGVudDogT2w0RXh0ZW50ID0gbnVsbDtcbiAgICBwcm90ZWN0ZWQgZHJhd2VyOiBPbDREcmF3ZXI7XG4gICAgcHJvdGVjdGVkIHN0eWxlczogT2JqZWN0O1xuICAgIHByb3RlY3RlZCBoZ0xheWVyOiBvbC5sYXllci5WZWN0b3I7XG4gICAgcHJvdGVjdGVkIGRyYWd6b29tOiBvbC5pbnRlcmFjdGlvbi5EcmFnWm9vbTtcblxuICAgIHByaXZhdGUgc3RhdGljIGdldFV1aWQocHJlZml4OiBzdHJpbmcgPSAnJyk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBwcmVmaXggKyAoKytPbDRNYXAuX3V1aWQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgY29uc3RydWN0b3Iob3B0aW9uczogYW55KSB7IC8vIHNpbmdsZXRvblxuICAgICAgICAvLyBpbml0IGdpdmVuIGNyc2VzXG4gICAgICAgIC8vIG9sWydFTkFCTEVfUkFTVEVSX1JFUFJPSkVDVElPTiddID0gZmFsc2U7XG4gICAgICAgIE9sNFV0aWxzLmluaXRQcm9qNERlZnMob3B0aW9uc1sncHJvajREZWZzJ10pO1xuICAgICAgICBsZXQgcHJvajogb2wucHJvai5Qcm9qZWN0aW9uID0gb2wucHJvai5nZXQob3B0aW9uc1sndmlldyddWydwcm9qZWN0aW9uJ10pO1xuICAgICAgICB0aGlzLnN0eWxlcyA9IG9wdGlvbnNbJ3N0eWxlcyddO1xuICAgICAgICB0aGlzLnNjYWxlcyA9IG9wdGlvbnNbJ3ZpZXcnXVsnc2NhbGVzJ107XG4gICAgICAgIHRoaXMuc3RhcnRFeHRlbnQgPSBPbDRFeHRlbnQuZnJvbUFycmF5KG9wdGlvbnNbJ3ZpZXcnXVsnc3RhcnRFeHRlbnQnXSwgcHJvaik7XG4gICAgICAgIHRoaXMubWF4RXh0ZW50ID0gT2w0RXh0ZW50LmZyb21BcnJheShvcHRpb25zWyd2aWV3J11bJ21heEV4dGVudCddLCBwcm9qKTtcbiAgICAgICAgdGhpcy5vbE1hcCA9IG5ldyBvbC5NYXAoe1xuICAgICAgICAgICAgdGFyZ2V0OiBvcHRpb25zWydtYXAnXVsndGFyZ2V0J10sXG4gICAgICAgICAgICByZW5kZXJlcjogJ2NhbnZhcydcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMub2xNYXAuc2V0VmlldyhcbiAgICAgICAgICAgIG5ldyBvbC5WaWV3KHtcbiAgICAgICAgICAgICAgICBwcm9qZWN0aW9uOiBwcm9qLFxuICAgICAgICAgICAgICAgIHJlc29sdXRpb25zOiBPbDRVdGlscy5yZXNvbHV0aW9uc0ZvclNjYWxlcyh0aGlzLnNjYWxlcywgcHJvai5nZXRVbml0cygpKS5yZXZlcnNlKCksXG4gICAgICAgICAgICAgICAgZXh0ZW50OiB0aGlzLm1heEV4dGVudC5nZXRFeHRlbnQocHJvailcbiAgICAgICAgICAgIH0pXG4gICAgICAgICk7XG4gICAgICAgIGZvciAobGV0IHNvdXJjZSBvZiBvcHRpb25zWydzb3VyY2UnXSkge1xuICAgICAgICAgICAgdGhpcy5hZGRMYXllckZvck9wdGlvbnMoc291cmNlKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm9sTWFwLmFkZENvbnRyb2wobmV3IG9sLmNvbnRyb2wuU2NhbGVMaW5lKCkpO1xuXG4gICAgICAgIHRoaXMub2xNYXAuYWRkQ29udHJvbChuZXcgb2wuY29udHJvbC5ab29tVG9FeHRlbnQoe1xuICAgICAgICAgICAgZXh0ZW50OiB0aGlzLm1heEV4dGVudC5nZXRFeHRlbnQocHJvailcbiAgICAgICAgfSkpO1xuICAgICAgICB0aGlzLm9sTWFwLmFkZEludGVyYWN0aW9uKG5ldyBvbC5pbnRlcmFjdGlvbi5EcmFnWm9vbSgpKTtcbiAgICAgICAgdGhpcy5vbE1hcC5hZGRDb250cm9sKG5ldyBvbC5jb250cm9sLk1vdXNlUG9zaXRpb24oXG4gICAgICAgICAgICAvLyB7XG4gICAgICAgICAgICAvLyAgICAgY29vcmRpbmF0ZUZvcm1hdDogZnVuY3Rpb24gKGNvb3JkaW5hdGVzKSB7XG4gICAgICAgICAgICAvLyAgICAgICAgIHZhciBjb29yZF94ID0gY29vcmRpbmF0ZXNbMF0udG9GaXhlZCgzKTtcbiAgICAgICAgICAgIC8vICAgICAgICAgdmFyIGNvb3JkX3kgPSBjb29yZGluYXRlc1sxXS50b0ZpeGVkKDMpO1xuICAgICAgICAgICAgLy8gICAgICAgICByZXR1cm4gY29vcmRfeCArICcsICcgKyBjb29yZF95O1xuICAgICAgICAgICAgLy8gICAgIH1cbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgKSk7XG4gICAgICAgIHRoaXMub2xNYXAuZ2V0VmlldygpLmZpdCh0aGlzLnN0YXJ0RXh0ZW50LmdldFBvbHlnb25Gb3JFeHRlbnQocHJvaiksIHRoaXMub2xNYXAuZ2V0U2l6ZSgpKTtcbiAgICAgICAgZm9yIChsZXQgbGF5ZXIgb2YgdGhpcy5vbE1hcC5nZXRMYXllcnMoKS5nZXRBcnJheSgpKSB7XG4gICAgICAgICAgICBsZXQgc291cmNlO1xuICAgICAgICAgICAgaWYgKGxheWVyIGluc3RhbmNlb2Ygb2wubGF5ZXIuR3JvdXApIHsgLy8gaW5zdGFuY2Ugb2Ygb2wubGF5ZXIuR3JvdXBcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdvbC5sYXllci5Hcm91cCBhcyBMYXllciBpcyBub3Qgc3Vwb3J0ZWQnKTtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ29sLmxheWVyLkdyb3VwIGFzIExheWVyIGlzIG5vdCBzdXBvcnRlZCcpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICgoc291cmNlID0gKDxvbC5sYXllci5MYXllcj5sYXllcikuZ2V0U291cmNlKCkpIGluc3RhbmNlb2Ygb2wuc291cmNlLkltYWdlV01TKSB7XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmhnTGF5ZXIgPSB0aGlzLmFkZFZlY3RvckxheWVyKE9sNFV0aWxzLmdldFN0eWxlKHRoaXMuc3R5bGVzWydoaWdobGlnaHQnXSkpO1xuICAgIH1cblxuICAgIHN0YXRpYyBjcmVhdGUob3B0aW9uczogYW55KTogT2w0TWFwIHtcbiAgICAgICAgaWYgKCFPbDRNYXAuX2luc3RhbmNlKSB7Ly8gc2luZ2xldG9uXG4gICAgICAgICAgICBPbDRNYXAuX2luc3RhbmNlID0gbmV3IE9sNE1hcChvcHRpb25zKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gT2w0TWFwLl9pbnN0YW5jZTtcbiAgICB9XG5cbiAgICAvLyByZW5kZXJUcmVlT3B0aW9uKCkge1xuICAgIC8vICAgICBsZXQgdWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuLWpzLW1hcC1sYXllcnRyZWUgdWwnKTtcbiAgICAvLyAgICAgdmFyIGJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7XG4gICAgLy8gICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kKGJ1dHRvbik7XG4gICAgLy8gICAgIGJ1dHRvbi5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgLy8gICAgIGJ1dHRvbi5zdHlsZS50b3AgPSAnMTBweCc7XG4gICAgLy8gICAgIGJ1dHRvbi5zdHlsZS5sZWZ0ID0gJzEwcHgnO1xuICAgIC8vICAgICBidXR0b24uc3R5bGUuekluZGV4ID0gMTAwMDA7XG4gICAgLy8gICAgIGJ1dHRvbi5vbmNsaWNrID0gY29weUNsaWNrZWQ7XG4gICAgLy8gfVxuXG4gICAgZ2V0RHJhd2VyKCk6IE9sNERyYXdlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmRyYXdlcjtcbiAgICB9XG5cbiAgICBnZXRIZ0xheWVyKCk6IG9sLmxheWVyLlZlY3RvciB7XG4gICAgICAgIHJldHVybiB0aGlzLmhnTGF5ZXI7XG4gICAgfVxuXG4gICAgYWRkTGF5ZXJGb3JPcHRpb25zKG9wdGlvbnM6IGFueSkge1xuICAgICAgICBpZiAob3B0aW9uc1sndHlwZSddID09PSAnV01TJykge1xuICAgICAgICAgICAgbGV0IHdtc0xheWVyID0gdGhpcy5hZGRMYXllcihcbiAgICAgICAgICAgICAgICBPbDRXbXNMYXllci5jcmVhdGVMYXllcihvcHRpb25zWyd1cmwnXSxcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uc1sncGFyYW1zJ10sXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub2xNYXAuZ2V0VmlldygpLmdldFByb2plY3Rpb24oKSxcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uc1sndmlzaWJsZSddLFxuICAgICAgICAgICAgICAgICAgICBwYXJzZUZsb2F0KG9wdGlvbnNbJ29wYWNpdHknXSkpLFxuICAgICAgICAgICAgICAgIG9wdGlvbnNbJ3RpdGxlJ11cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBhZGRTb3VyY2Uod21zTGF5ZXIuZ2V0KCd1dWlkJyksIHdtc0xheWVyLmdldCgndGl0bGUnKSwgd21zTGF5ZXIuZ2V0VmlzaWJsZSgpLCB3bXNMYXllci5nZXRPcGFjaXR5KCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihvcHRpb25zWyd0eXBlJ10gKyAnIGlzIG5vdCBzdXBwb3J0ZWQuJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzaG93RmVhdHVyZXModkxheWVyOiBvbC5sYXllci5WZWN0b3IsIGdlb0pzb246IE9iamVjdCkge1xuICAgICAgICBsZXQgZ2VvSnNvblJlYWRlcjogb2wuZm9ybWF0Lkdlb0pTT04gPSBuZXcgb2wuZm9ybWF0Lkdlb0pTT04oKTtcbiAgICAgICAgLy8gbGV0IGdlb0pzb25Qcm9qID0gZ2VvSnNvblJlYWRlci5yZWFkUHJvamVjdGlvbihnZW9Kc29uKTtcbiAgICAgICAgbGV0IGZlYXR1cmVzID0gZ2VvSnNvblJlYWRlci5yZWFkRmVhdHVyZXMoXG4gICAgICAgICAgICBnZW9Kc29uLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICdkYXRhUHJvamVjdGlvbic6IGdlb0pzb25SZWFkZXIucmVhZFByb2plY3Rpb24oZ2VvSnNvbiksXG4gICAgICAgICAgICAgICAgJ2ZlYXR1cmVQcm9qZWN0aW9uJzogdGhpcy5vbE1hcC5nZXRWaWV3KCkuZ2V0UHJvamVjdGlvbigpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgdkxheWVyLmdldFNvdXJjZSgpLmFkZEZlYXR1cmVzKGZlYXR1cmVzKTtcbiAgICB9XG5cbiAgICBjbGVhckZlYXR1cmVzKHZMYXllcjogb2wubGF5ZXIuVmVjdG9yKSB7XG4gICAgICAgIHZMYXllci5nZXRTb3VyY2UoKS5jbGVhcih0cnVlKTtcbiAgICB9XG5cbiAgICBhZGRWZWN0b3JMYXllcihzdHlsZTogb2wuc3R5bGUuU3R5bGUpOiBvbC5sYXllci5WZWN0b3Ige1xuICAgICAgICBsZXQgb3B0aW9ucyA9IHtcbiAgICAgICAgICAgIHdyYXBYOiBmYWxzZVxuICAgICAgICB9O1xuICAgICAgICBsZXQgdkxheWVyID0gbmV3IG9sLmxheWVyLlZlY3Rvcih7XG4gICAgICAgICAgICBzb3VyY2U6IG5ldyBvbC5zb3VyY2UuVmVjdG9yKG9wdGlvbnMpLFxuICAgICAgICAgICAgc3R5bGU6IHN0eWxlXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gPG9sLmxheWVyLlZlY3Rvcj50aGlzLmFkZExheWVyKHZMYXllcik7XG4gICAgfVxuXG4gICAgYWRkTGF5ZXIobGF5ZXI6IG9sLmxheWVyLkJhc2UsIHRpdGxlOiBzdHJpbmcgPSBudWxsKTogb2wubGF5ZXIuQmFzZSB7XG4gICAgICAgIGxheWVyLnNldChVVUlELCBPbDRNYXAuZ2V0VXVpZCgnb2xheS0nKSk7XG4gICAgICAgIGlmICh0aXRsZSkge1xuICAgICAgICAgICAgbGF5ZXIuc2V0KFRJVExFLCB0aXRsZSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5vbE1hcC5hZGRMYXllcihsYXllcik7XG4gICAgICAgIHJldHVybiBsYXllcjtcbiAgICB9XG5cbiAgICByZW1vdmVMYXllcihsYXllcjogb2wubGF5ZXIuQmFzZSk6IHZvaWQge1xuICAgICAgICB0aGlzLm9sTWFwLnJlbW92ZUxheWVyKGxheWVyKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGZpbmRMYXllcih1dWlkOiBzdHJpbmcpOiBvbC5sYXllci5CYXNlIHtcbiAgICAgICAgbGV0IGxheWVycyA9IHRoaXMub2xNYXAuZ2V0TGF5ZXJzKCkuZ2V0QXJyYXkoKTtcbiAgICAgICAgbGV0IGxsZW5ndGggPSBsYXllcnMubGVuZ3RoO1xuICAgICAgICBmb3IgKGxldCBsYXllciBvZiBsYXllcnMpIHtcbiAgICAgICAgICAgIGxldCBzb3VyY2U6IG9sLnNvdXJjZS5Tb3VyY2U7XG4gICAgICAgICAgICBpZiAobGF5ZXIgaW5zdGFuY2VvZiBvbC5sYXllci5Hcm91cCkgeyAvLyBpbnN0YW5jZSBvZiBvbC5sYXllci5Hcm91cFxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ29sLmxheWVyLkdyb3VwIGFzIExheWVyIGlzIG5vdCBzdXBvcnRlZCcpO1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignb2wubGF5ZXIuR3JvdXAgYXMgTGF5ZXIgaXMgbm90IHN1cG9ydGVkJyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGxheWVyLmdldChVVUlEKSA9PT0gdXVpZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBsYXllcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICB1cGRhdGVNYXAoKTogdm9pZCB7XG4gICAgICAgIHRoaXMub2xNYXAudXBkYXRlU2l6ZSgpO1xuICAgIH1cblxuICAgIGNoYW5nZUNycyhjcnM6IHN0cmluZykgeyAvLyBUT0RPXG4gICAgICAgIGxldCBwcm9qID0gbnVsbDtcbiAgICAgICAgaWYgKChwcm9qID0gb2wucHJvai5nZXQoY3JzKSkpIHtcbiAgICAgICAgICAgIGxldCBleHRlbnQgPSBPbDRFeHRlbnQuZnJvbUFycmF5KFxuICAgICAgICAgICAgICAgIHRoaXMub2xNYXAuZ2V0VmlldygpLmNhbGN1bGF0ZUV4dGVudCh0aGlzLm9sTWFwLmdldFNpemUoKSksXG4gICAgICAgICAgICAgICAgdGhpcy5vbE1hcC5nZXRWaWV3KCkuZ2V0UHJvamVjdGlvbigpXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgbGV0IHByb2plY3Rpb24gPSB0aGlzLm9sTWFwLmdldFZpZXcoKS5nZXRQcm9qZWN0aW9uKCk7XG4gICAgICAgICAgICBsZXQgY2VudGVyID0gdGhpcy5vbE1hcC5nZXRWaWV3KCkuZ2V0Q2VudGVyKCk7XG4gICAgICAgICAgICBsZXQgbmV3VmlldyA9IG5ldyBvbC5WaWV3KHtcbiAgICAgICAgICAgICAgICBwcm9qZWN0aW9uOiBwcm9qLFxuICAgICAgICAgICAgICAgIHJlc29sdXRpb25zOiBPbDRVdGlscy5yZXNvbHV0aW9uc0ZvclNjYWxlcyh0aGlzLnNjYWxlcywgcHJvai5nZXRVbml0cygpKS5yZXZlcnNlKCksXG4gICAgICAgICAgICAgICAgZXh0ZW50OiB0aGlzLm1heEV4dGVudC5nZXRFeHRlbnQocHJvailcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbGV0IGxheWVycyA9IHRoaXMub2xNYXAuZ2V0TGF5ZXJzKCkuZ2V0QXJyYXkoKTtcbiAgICAgICAgICAgIGxldCBsbGVuZ3RoID0gbGF5ZXJzLmxlbmd0aDtcbiAgICAgICAgICAgIGZvciAobGV0IGxheWVyIG9mIGxheWVycykge1xuICAgICAgICAgICAgICAgIGxldCBzb3VyY2U6IG9sLnNvdXJjZS5Tb3VyY2U7XG4gICAgICAgICAgICAgICAgaWYgKGxheWVyIGluc3RhbmNlb2Ygb2wubGF5ZXIuR3JvdXApIHsgLy8gaW5zdGFuY2Ugb2Ygb2wubGF5ZXIuR3JvdXBcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignb2wubGF5ZXIuR3JvdXAgYXMgTGF5ZXIgaXMgbm90IHN1cG9ydGVkJyk7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignb2wubGF5ZXIuR3JvdXAgYXMgTGF5ZXIgaXMgbm90IHN1cG9ydGVkJyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICgoc291cmNlID0gKDxvbC5sYXllci5MYXllcj5sYXllcikuZ2V0U291cmNlKCkpIGluc3RhbmNlb2Ygb2wuc291cmNlLkltYWdlV01TKSB7XG4gICAgICAgICAgICAgICAgICAgICg8b2wubGF5ZXIuSW1hZ2U+bGF5ZXIpLnNldFNvdXJjZShPbDRXbXNMYXllci5jcmVhdGVGcm9tU291cmNlKDxvbC5zb3VyY2UuSW1hZ2VXTVM+IHNvdXJjZSwgcHJvaikpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoKHNvdXJjZSA9ICg8b2wubGF5ZXIuTGF5ZXI+bGF5ZXIpLmdldFNvdXJjZSgpKSBpbnN0YW5jZW9mIG9sLnNvdXJjZS5WZWN0b3IpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGZlYXR1cmVzOiBvbC5GZWF0dXJlW10gPSAoPG9sLnNvdXJjZS5WZWN0b3I+c291cmNlKS5nZXRGZWF0dXJlcygpO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBmZWF0dXJlIG9mIGZlYXR1cmVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmZWF0dXJlLnNldEdlb21ldHJ5KGZlYXR1cmUuZ2V0R2VvbWV0cnkoKS50cmFuc2Zvcm0ocHJvamVjdGlvbiwgcHJvaikpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5vbE1hcC5zZXRWaWV3KG5ld1ZpZXcpO1xuICAgICAgICAgICAgdGhpcy5vbE1hcC5nZXRWaWV3KCkuZml0KGV4dGVudC5nZXRQb2x5Z29uRm9yRXh0ZW50KHByb2opLCB0aGlzLm9sTWFwLmdldFNpemUoKSk7XG4gICAgICAgICAgICAvLyBsZXQgY3BvaW50ID0gPG9sLmdlb20uUG9pbnQ+IG5ldyBvbC5nZW9tLlBvaW50KGNlbnRlcikudHJhbnNmb3JtKHByb2plY3Rpb24sIHByb2opO1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coY3BvaW50LmdldENvb3JkaW5hdGVzKCkpO1xuICAgICAgICAgICAgLy8gdGhpcy5vbE1hcC5nZXRWaWV3KCkuc2V0Q2VudGVyKGNwb2ludC5nZXRDb29yZGluYXRlcygpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldFZpc2libGUobGF5ZXJVaWlkOiBzdHJpbmcsIHZpc2libGl0eTogYm9vbGVhbik6IHZvaWQge1xuICAgICAgICBsZXQgbGF5ZXI6IG9sLmxheWVyLkJhc2UgPSB0aGlzLmZpbmRMYXllcihsYXllclVpaWQpO1xuICAgICAgICBpZiAobGF5ZXIpIHtcbiAgICAgICAgICAgIGxheWVyLnNldFZpc2libGUodmlzaWJsaXR5KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldE9wYWNpdHkobGF5ZXJVaWlkOiBzdHJpbmcsIG9wYWNpdHk6IG51bWJlcik6IHZvaWQge1xuICAgICAgICBsZXQgbGF5ZXI6IG9sLmxheWVyLkJhc2UgPSB0aGlzLmZpbmRMYXllcihsYXllclVpaWQpO1xuICAgICAgICBpZiAobGF5ZXIpIHtcbiAgICAgICAgICAgIGxheWVyLnNldE9wYWNpdHkob3BhY2l0eSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkcmFnWm9vbShhY3RpdmF0ZTogYm9vbGVhbiwgb25ab29tRW5kOiBGdW5jdGlvbiA9IG51bGwpIHtcbiAgICAgICAgaWYgKCF0aGlzLmRyYWd6b29tKSB7XG4gICAgICAgICAgICB0aGlzLmRyYWd6b29tID0gbmV3IG9sLmludGVyYWN0aW9uLkRyYWdab29tKHtcbiAgICAgICAgICAgICAgICBjb25kaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBsZXQgZHJhZ3pvb20gPSB0aGlzLmRyYWd6b29tO1xuICAgICAgICAgICAgbGV0IG1hcCA9IHRoaXMub2xNYXA7XG4gICAgICAgICAgICB0aGlzLmRyYWd6b29tLm9uKCdib3hlbmQnLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChldmVudDogb2wuaW50ZXJhY3Rpb24uRHJhdy5FdmVudCkge1xuICAgICAgICAgICAgICAgICAgICBtYXAucmVtb3ZlSW50ZXJhY3Rpb24oZHJhZ3pvb20pO1xuICAgICAgICAgICAgICAgICAgICBpZiAob25ab29tRW5kKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvblpvb21FbmQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhY3RpdmF0ZSkge1xuICAgICAgICAgICAgdGhpcy5vbE1hcC5hZGRJbnRlcmFjdGlvbih0aGlzLmRyYWd6b29tKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMub2xNYXAucmVtb3ZlSW50ZXJhY3Rpb24odGhpcy5kcmFnem9vbSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkcmF3U2hhcGUoc2hhcGVUeXBlOiBTSEFQRVMgPSBudWxsLCBvbkRyYXdFbmQ6IEZ1bmN0aW9uID0gbnVsbCkge1xuICAgICAgICBsZXQgb2w0bWFwID0gdGhpcztcbiAgICAgICAgbGV0IG9sTWFwID0gdGhpcy5vbE1hcDtcbiAgICAgICAgaWYgKCF0aGlzLmRyYXdlcikge1xuICAgICAgICAgICAgbGV0IHZMYXllciA9IHRoaXMuYWRkVmVjdG9yTGF5ZXIoT2w0VXRpbHMuZ2V0U3R5bGUodGhpcy5zdHlsZXNbJ3NlYXJjaCddKSk7XG4gICAgICAgICAgICB2TGF5ZXIuc2V0TWFwKHRoaXMub2xNYXApO1xuICAgICAgICAgICAgdGhpcy5kcmF3ZXIgPSBuZXcgT2w0RHJhd2VyKHZMYXllcik7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgc2hhcGU6IFNIQVBFUyA9IHR5cGVvZiBzaGFwZVR5cGUgPT09ICdzdHJpbmcnID8gU0hBUEVTWzxzdHJpbmc+IHNoYXBlVHlwZV0gOiBzaGFwZVR5cGU7XG4gICAgICAgIGlmICh0aGlzLmRyYXdlci5nZXRJbnRlcmFjdGlvbigpKSB7XG4gICAgICAgICAgICB0aGlzLm9sTWFwLnJlbW92ZUludGVyYWN0aW9uKHRoaXMuZHJhd2VyLmdldEludGVyYWN0aW9uKCkpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZHJhd2VyLnNldEludGVyYWN0aW9uKHNoYXBlLCBPbDRVdGlscy5nZXRTdHlsZSh0aGlzLnN0eWxlc1snc2VhcmNoJ10pKTtcbiAgICAgICAgaWYgKHRoaXMuZHJhd2VyLmdldEludGVyYWN0aW9uKCkpIHtcbiAgICAgICAgICAgIGxldCBkcmF3ZXIgPSB0aGlzLmRyYXdlcjtcbiAgICAgICAgICAgIHRoaXMuZ2V0RHJhd2VyKCkuZ2V0TGF5ZXIoKS5nZXRTb3VyY2UoKS5jbGVhcigpO1xuICAgICAgICAgICAgdGhpcy5vbE1hcC5hZGRJbnRlcmFjdGlvbih0aGlzLmRyYXdlci5nZXRJbnRlcmFjdGlvbigpKTtcbiAgICAgICAgICAgIHRoaXMuZHJhd2VyLmdldEludGVyYWN0aW9uKCkub24oXG4gICAgICAgICAgICAgICAgJ2RyYXdzdGFydCcsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgb2w0bWFwLmdldERyYXdlcigpLmdldExheWVyKCkuZ2V0U291cmNlKCkuY2xlYXIoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgdGhpcy5kcmF3ZXIuZ2V0SW50ZXJhY3Rpb24oKS5vbihcbiAgICAgICAgICAgICAgICAnZHJhd2VuZCcsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGdlb2pzb24gPSBuZXcgb2wuZm9ybWF0Lkdlb0pTT04oKS53cml0ZUZlYXR1cmVPYmplY3QoXG4gICAgICAgICAgICAgICAgICAgICAgICBlLmZlYXR1cmUsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RhdGFQcm9qZWN0aW9uJzogTUVUQURPUl9FUFNHLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdmZWF0dXJlUHJvamVjdGlvbic6IG9sTWFwLmdldFZpZXcoKS5nZXRQcm9qZWN0aW9uKClcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgb25EcmF3RW5kKGdlb2pzb24pO1xuICAgICAgICAgICAgICAgICAgICBvbE1hcC5yZW1vdmVJbnRlcmFjdGlvbihkcmF3ZXIuZ2V0SW50ZXJhY3Rpb24oKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZ2V0RHJhd2VyKCkuZ2V0TGF5ZXIoKS5nZXRTb3VyY2UoKS5jbGVhcigpO1xuICAgICAgICAgICAgb25EcmF3RW5kKG51bGwpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgT2w0V21zTGF5ZXIge1xuICAgIHN0YXRpYyBjcmVhdGVMYXllcih1cmw6IHN0cmluZywgcGFyYW1zOiBhbnksIHByb2o6IG9sLlByb2plY3Rpb25MaWtlLCB2aXNpYmxlOiBib29sZWFuLCBvcGFjaXR5OiBudW1iZXIpOiBvbC5sYXllci5JbWFnZSB7XG4gICAgICAgIGxldCBzb3VyY2VXbXMgPSBuZXcgb2wubGF5ZXIuSW1hZ2Uoe1xuICAgICAgICAgICAgc291cmNlOiBPbDRXbXNMYXllci5jcmVhdGVTb3VyY2UodXJsLCBwYXJhbXMsIHByb2opLFxuICAgICAgICAgICAgdmlzaWJsZTogdmlzaWJsZSxcbiAgICAgICAgICAgIG9wYWNpdHk6IG9wYWNpdHlcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBzb3VyY2VXbXM7XG4gICAgfVxuXG4gICAgc3RhdGljIGNyZWF0ZVNvdXJjZSh1cmw6IHN0cmluZywgcGFyYW1zOiBhbnksIHByb2o6IG9sLlByb2plY3Rpb25MaWtlKTogb2wuc291cmNlLkltYWdlV01TIHtcbiAgICAgICAgcmV0dXJuIG5ldyBvbC5zb3VyY2UuSW1hZ2VXTVMoe1xuICAgICAgICAgICAgdXJsOiB1cmwsXG4gICAgICAgICAgICBwYXJhbXM6IHBhcmFtcyxcbiAgICAgICAgICAgIHByb2plY3Rpb246IHByb2pcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc3RhdGljIGNyZWF0ZUZyb21Tb3VyY2Uoc291cmNlOiBvbC5zb3VyY2UuSW1hZ2VXTVMsIHByb2o6IG9sLlByb2plY3Rpb25MaWtlKSB7XG4gICAgICAgIHJldHVybiBuZXcgb2wuc291cmNlLkltYWdlV01TKHtcbiAgICAgICAgICAgIHVybDogc291cmNlLmdldFVybCgpLFxuICAgICAgICAgICAgcGFyYW1zOiBzb3VyY2UuZ2V0UGFyYW1zKCksXG4gICAgICAgICAgICBwcm9qZWN0aW9uOiBwcm9qXG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGVudW0gU0hBUEVTIHtOT05FLCBCT1gsIFBPTFlHT059XG47XG5cbmV4cG9ydCBjbGFzcyBPbDREcmF3ZXIge1xuICAgIC8vIHByaXZhdGUgc3RhdGljIF9pbnN0YW5jZTogT2w0RHJhd2VyO1xuICAgIHByb3RlY3RlZCBsYXllcjogb2wubGF5ZXIuVmVjdG9yO1xuICAgIHByb3RlY3RlZCBpbnRlcmFjdGlvbjogb2wuaW50ZXJhY3Rpb24uRHJhdztcblxuICAgIGNvbnN0cnVjdG9yKGxheWVyOiBvbC5sYXllci5WZWN0b3IpIHtcbiAgICAgICAgdGhpcy5sYXllciA9IGxheWVyO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRMYXllcigpOiBvbC5sYXllci5WZWN0b3Ige1xuICAgICAgICByZXR1cm4gdGhpcy5sYXllcjtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0SW50ZXJhY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmludGVyYWN0aW9uO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRJbnRlcmFjdGlvbih0eXBlOiBTSEFQRVMsIGRyYXdTdHlsZTogb2wuc3R5bGUuU3R5bGUpIHtcbiAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICBjYXNlIFNIQVBFUy5CT1g6XG4gICAgICAgICAgICAgICAgdGhpcy5pbnRlcmFjdGlvbiA9IG5ldyBvbC5pbnRlcmFjdGlvbi5EcmF3KHtcbiAgICAgICAgICAgICAgICAgICAgc291cmNlOiB0aGlzLmxheWVyLmdldFNvdXJjZSgpLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnQ2lyY2xlJyxcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IGRyYXdTdHlsZSxcbiAgICAgICAgICAgICAgICAgICAgZ2VvbWV0cnlGdW5jdGlvbjogY3JlYXRlQm94KCkgLy8gb2wuZC50cyBoYXMgbm8gZnVuY3Rpb24gXCJvbC5pbnRlcmFjdGlvbi5EcmF3LmNyZWF0ZUJveCgpXCJcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgU0hBUEVTLlBPTFlHT046XG4gICAgICAgICAgICAgICAgdGhpcy5pbnRlcmFjdGlvbiA9IG5ldyBvbC5pbnRlcmFjdGlvbi5EcmF3KHtcbiAgICAgICAgICAgICAgICAgICAgc291cmNlOiB0aGlzLmxheWVyLmdldFNvdXJjZSgpLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnUG9seWdvbicsXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiBkcmF3U3R5bGVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhpcy5pbnRlcmFjdGlvbiA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogb2wuZC50cyBoYXMgbm8gZnVuY3Rpb24gXCJvbC5pbnRlcmFjdGlvbi5EcmF3LmNyZWF0ZUJveCgpXCJcbiAqIEByZXR1cm5zIHsoY29vcmRpbmF0ZXM6YW55LCBvcHRfZ2VvbWV0cnk6YW55KT0+YW55fG9sLmdlb20uUG9seWdvbn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUJveCgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtIHtvbC5Db29yZGluYXRlfEFycmF5LjxvbC5Db29yZGluYXRlPnxBcnJheS48QXJyYXkuPG9sLkNvb3JkaW5hdGU+Pn0gY29vcmRpbmF0ZXNcbiAgICAgICAgICogQHBhcmFtIHtvbC5nZW9tLlNpbXBsZUdlb21ldHJ5PX0gb3B0X2dlb21ldHJ5XG4gICAgICAgICAqIEByZXR1cm4ge29sLmdlb20uU2ltcGxlR2VvbWV0cnl9XG4gICAgICAgICAqL1xuICAgICAgICAgICAgZnVuY3Rpb24gKGNvb3JkaW5hdGVzLCBvcHRfZ2VvbWV0cnkpIHtcbiAgICAgICAgICAgIHZhciBleHRlbnQgPSBvbC5leHRlbnQuYm91bmRpbmdFeHRlbnQoY29vcmRpbmF0ZXMpO1xuICAgICAgICAgICAgdmFyIGdlb21ldHJ5ID0gb3B0X2dlb21ldHJ5IHx8IG5ldyBvbC5nZW9tLlBvbHlnb24obnVsbCk7XG4gICAgICAgICAgICBnZW9tZXRyeS5zZXRDb29yZGluYXRlcyhbW1xuICAgICAgICAgICAgICAgIG9sLmV4dGVudC5nZXRCb3R0b21MZWZ0KGV4dGVudCksXG4gICAgICAgICAgICAgICAgb2wuZXh0ZW50LmdldEJvdHRvbVJpZ2h0KGV4dGVudCksXG4gICAgICAgICAgICAgICAgb2wuZXh0ZW50LmdldFRvcFJpZ2h0KGV4dGVudCksXG4gICAgICAgICAgICAgICAgb2wuZXh0ZW50LmdldFRvcExlZnQoZXh0ZW50KSxcbiAgICAgICAgICAgICAgICBvbC5leHRlbnQuZ2V0Qm90dG9tTGVmdChleHRlbnQpXG4gICAgICAgICAgICBdXSk7XG4gICAgICAgICAgICByZXR1cm4gZ2VvbWV0cnk7XG4gICAgICAgIH1cbiAgICApO1xufTtcbiJdfQ==
