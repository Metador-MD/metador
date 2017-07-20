(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
var winContext = window;
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
            var pr = ol.proj.get(name_1);
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
exports.LAYER_VECTOR = 'vector';
exports.LAYER_IMAGE = 'image';
var Ol4Map = (function () {
    function Ol4Map(options) {
        this.olMap = null;
        //    protected proj: ol.proj.Projection = null;
        this.startExtent = null; // xmin, ymin, xmax, ymax options['startExtent']
        this.maxExtent = null;
        // ol['ENABLE_RASTER_REPROJECTION'] = false;
        Ol4Utils.initProj4Defs(options['proj4Defs']);
        document.querySelector('.-js-crs-code').value = options['view']['projection'];
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
        /* make a group layer for all image layers (WMS etc.)*/
        var imageGroup = new ol.layer.Group({
            layers: new ol.Collection()
        });
        imageGroup.set(exports.UUID, exports.LAYER_IMAGE);
        this.olMap.addLayer(imageGroup);
        /* make a group layer for all vector layers (Hightlight, Search results etc.)*/
        var vectorGroup = new ol.layer.Group({
            layers: new ol.Collection()
        });
        vectorGroup.set(exports.UUID, exports.LAYER_VECTOR);
        this.olMap.addLayer(vectorGroup);
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
    Ol4Map.prototype.getDrawer = function () {
        return this.drawer;
    };
    Ol4Map.prototype.getHgLayer = function () {
        return this.hgLayer;
    };
    Ol4Map.prototype.addLayerForOptions = function (options) {
        if (options['type'] === 'WMS') {
            var wmsLayer = this.addLayer(Ol4WmsLayer.createLayer(options['url'], options['params'], this.olMap.getView().getProjection(), options['visible'], parseFloat(options['opacity'])), options['title']);
        }
        else {
            console.error(options['type'] + ' is not supported.');
        }
    };
    //
    // initLayertree() {
    //     let layers = this.olMap.getLayers().getArray();
    //     let llength = layers.length;
    //     for (let layer of layers) {
    //         let source: ol.source.Source;
    //         if (layer instanceof ol.layer.Group) { // instance of ol.layer.Group
    //             let sublayers = (<ol.layer.Group>layer).getLayers().getArray();
    //             for (let slayer of sublayers) {
    //                 if (slayer instanceof ol.layer.Image) { // add only image layer (WMS etc.)
    //                     addSource(slayer.get('uuid'), slayer.get('title'), slayer.getVisible(), slayer.getOpacity());
    //                 }
    //             }
    //         } else if (layer instanceof ol.layer.Image) { // add only image layer (WMS etc.)
    //             addSource(layer.get('uuid'), layer.get('title'), layer.getVisible(), layer.getOpacity());
    //         }
    //     }
    // }
    Ol4Map.prototype.addToLayertree = function (layer) {
        addSource(layer.get('uuid'), layer.get('title'), layer.getVisible(), layer.getOpacity());
    };
    Ol4Map.prototype.showFeatures = function (vLayer, geoJson) {
        var geoJsonReader = new ol.format.GeoJSON();
        var dataproj = geoJsonReader.readProjection(geoJson);
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
        if (layer instanceof ol.layer.Image) {
            var group = this.findLayer(exports.LAYER_IMAGE);
            group.getLayers().insertAt(group.getLayers().getLength(), layer);
            addSource(layer.get('uuid'), layer.get('title'), layer.getVisible(), layer.getOpacity());
        }
        else if (layer instanceof ol.layer.Vector) {
            var group = this.findLayer(exports.LAYER_VECTOR);
            group.getLayers().insertAt(group.getLayers().getLength(), layer);
        }
        return layer;
    };
    Ol4Map.prototype.removeLayer = function (layer) {
        this.olMap.removeLayer(layer);
    };
    Ol4Map.prototype.moveLayer = function (uuid, oldPos, newPos) {
        var layer = this.findLayer(uuid);
        if (layer instanceof ol.layer.Image) {
            var group = this.findLayer(exports.LAYER_IMAGE);
            var layerll = group.getLayers().remove(layer);
            group.getLayers().insertAt(newPos, layerll);
        }
    };
    Ol4Map.prototype.findLayer = function (uuid) {
        var layers = this.olMap.getLayers().getArray();
        for (var _i = 0, layers_1 = layers; _i < layers_1.length; _i++) {
            var layer = layers_1[_i];
            var source = void 0;
            if (layer.get(exports.UUID) === uuid) {
                return layer;
            }
            else if (layer instanceof ol.layer.Group) {
                var sublayers = layer.getLayers().getArray();
                for (var _a = 0, sublayers_1 = sublayers; _a < sublayers_1.length; _a++) {
                    var sublayer = sublayers_1[_a];
                    if (sublayer.get(exports.UUID) === uuid) {
                        return sublayer;
                    }
                }
            }
        }
        return null;
    };
    Ol4Map.prototype.updateMap = function () {
        this.olMap.updateSize();
    };
    Ol4Map.prototype.changeCrs = function (crs) {
        var toProj = null;
        if ((toProj = ol.proj.get(crs))) {
            var extent = Ol4Extent.fromArray(this.olMap.getView().calculateExtent(this.olMap.getSize()), this.olMap.getView().getProjection());
            var fromProj = this.olMap.getView().getProjection();
            var center = this.olMap.getView().getCenter();
            var newView = new ol.View({
                projection: toProj,
                resolutions: Ol4Utils.resolutionsForScales(this.scales, toProj.getUnits()).reverse(),
                extent: this.maxExtent.getExtent(toProj)
            });
            var layers = this.findLayer(exports.LAYER_IMAGE).getLayers().getArray();
            this.changeCrsList(this.findLayer(exports.LAYER_IMAGE).getLayers(), fromProj, toProj);
            this.changeCrsList(this.findLayer(exports.LAYER_VECTOR).getLayers(), fromProj, toProj);
            this.olMap.setView(newView);
            this.olMap.getView().fit(extent.getPolygonForExtent(toProj), this.olMap.getSize());
        }
    };
    Ol4Map.prototype.changeCrsList = function (layers, fromProj, toProj) {
        for (var _i = 0, _a = layers.getArray(); _i < _a.length; _i++) {
            var layer = _a[_i];
            var source = void 0;
            if ((source = layer.getSource()) instanceof ol.source.ImageWMS) {
                layer.setSource(Ol4WmsLayer.createFromSource(source, toProj));
            }
            else if ((source = layer.getSource()) instanceof ol.source.Vector) {
                var features = source.getFeatures();
                for (var _b = 0, features_1 = features; _b < features_1.length; _b++) {
                    var feature = features_1[_b];
                    feature.setGeometry(feature.getGeometry().transform(fromProj, toProj));
                }
            }
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
    Ol4Map.prototype.drawGeometryForSearch = function (geoJson, onDrawEnd) {
        if (onDrawEnd === void 0) { onDrawEnd = null; }
        var ol4map = this;
        var olMap = this.olMap;
        if (!this.drawer) {
            var vLayer = this.addVectorLayer(Ol4Utils.getStyle(this.styles['search']));
            vLayer.setMap(this.olMap);
            this.drawer = new Ol4Drawer(vLayer);
        }
        this.clearFeatures(this.drawer.getLayer());
        this.showFeatures(this.drawer.getLayer(), geoJson);
        if (onDrawEnd !== null) {
            onDrawEnd(geoJson);
        }
        this.olMap.getView().fit(this.drawer.getLayer().getSource().getExtent(), this.olMap.getSize());
    };
    Ol4Map.prototype.drawShapeForSearch = function (shapeType, onDrawEnd) {
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
var UiUtils = (function () {
    function UiUtils() {
    }
    return UiUtils;
}());
exports.UiUtils = UiUtils;
var GeomLoader = (function () {
    function GeomLoader(map, form) {
        this.map = map;
        this.form = form;
        this.on();
    }
    GeomLoader.prototype.on = function () {
        this.form.addEventListener('change', this.upload.bind(this), false);
    };
    GeomLoader.prototype.upload = function (e) {
        // console.log(e);
        // HttpUtils.Http.sendForm(this.form, this.form.action, HttpUtils.HTTP_METHOD.POST, HttpUtils.HTTP_DATATYPE.json)
        //     .then(function (value) {
        //         console.log('Contents: ' + value);
        //     })
        //     .catch(function (reason) {
        //         console.error(reason);
        //     });
    };
    return GeomLoader;
}());
exports.GeomLoader = GeomLoader;

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var metador = require("./Ol4");
var context = Window;
context.metador = metador;
function init() {
    var metadorMapConfig = {
        map: {
            target: 'map',
            srs: ["EPSG:4326", "EPSG:31466", "EPSG:25832"]
        },
        view: {
            projection: Configuration.settings['map_crs'],
            maxExtent: Configuration.settings['map_bbox_max'].split(/,\s?/),
            startExtent: Configuration.settings['map_bbox_start'].split(/,\s?/),
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
        source: [],
        // add additional parameters with + "ADDITIONAL"
        proj4Defs: {
            "EPSG:4326": "+proj=longlat +datum=WGS84 +units=degrees +no_defs" + " +axis=neu",
            "EPSG:4258": "+proj=longlat +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +no_defs" + " +units=degrees +axis=neu",
            "EPSG:31466": "+proj=tmerc +lat_0=0 +lon_0=6 +k=1 +x_0=2500000 +y_0=0 +ellps=bessel +towgs84=598.1,73.7,418.2,0.202,0.045,-2.455,6.7 +units=m +no_defs" + " +axis=neu",
            "EPSG:31467": "+proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=bessel +towgs84=598.1,73.7,418.2,0.202,0.045,-2.455,6.7 +units=m +no_defs" + " +axis=neu",
            // "EPSG:31468": "+proj=tmerc +lat_0=0 +lon_0=12 +k=1 +x_0=4500000 +y_0=0 +ellps=bessel +towgs84=598.1,73.7,418.2,0.202,0.045,-2.455,6.7 +units=m +no_defs" + " +axis=neu",
            // "EPSG:31469": "+proj=tmerc +lat_0=0 +lon_0=15 +k=1 +x_0=5500000 +y_0=0 +ellps=bessel +towgs84=598.1,73.7,418.2,0.202,0.045,-2.455,6.7 +units=m +no_defs" + " +axis=neu",
            "EPSG:25832": "+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
        },
        component: [
            {
                class: '',
                selector: ""
            }
        ]
    };
    // console.log(Configuration);
    for (var key in Configuration.config.map_background) {
        var wms = Configuration.config.map_background[key];
        var layers = [];
        for (var l in wms.layers) {
            layers.push(wms.layers[l]);
        }
        metadorMapConfig.source.push({
            'type': 'WMS',
            'url': wms.url,
            'title': wms.title,
            'opacity': wms.opacity,
            'visible': wms.visible,
            'params': {
                'LAYERS': layers.join(","),
                'VERSION': wms.version,
                'FORMAT': wms.format
            }
        });
    }
    // console.log(metadorMapConfig);
    var metadorMap = metador.Ol4Map.create(metadorMapConfig);
    // metadorMap.initLayertree();
    metador['metadorMap'] = metadorMap;
    // metador['geomLoader'] = new metador.GeomLoader(metadorMap, <HTMLFormElement>document.querySelector('#file-upload-form'));
}
exports.init = init;
metador['initMap'] = init;

},{"./Ol4":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvUGx1Z2lucy9XaGVyZUdyb3VwL01hcEJ1bmRsZS9SZXNvdXJjZXMvdHMvT2w0LnRzIiwic3JjL1BsdWdpbnMvV2hlcmVHcm91cC9NYXBCdW5kbGUvUmVzb3VyY2VzL3RzL21hcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztBQ09BLElBQUksVUFBVSxHQUFRLE1BQU0sQ0FBQztBQUc3QjtJQUFBO0lBb0ZBLENBQUM7SUFuRkc7O09BRUc7SUFDVyw4QkFBcUIsR0FBbkMsVUFBb0MsS0FBYTtRQUM3QyxJQUFJLEdBQUcsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ3RCLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3pDLElBQUksY0FBYyxHQUFHLEtBQUssQ0FBQztRQUMzQixNQUFNLENBQUMsR0FBRyxHQUFHLGNBQWMsR0FBRyxHQUFHLENBQUM7SUFDdEMsQ0FBQztJQUVhLDJCQUFrQixHQUFoQyxVQUFpQyxLQUFhLEVBQUUsTUFBYztRQUMxRCxNQUFNLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQztJQUMxQixDQUFDO0lBRWEsNkJBQW9CLEdBQWxDLFVBQW1DLE1BQWdCLEVBQUUsS0FBYTtRQUM5RCxJQUFJLFdBQVcsR0FBRyxFQUFFLENBQUM7UUFDckIsSUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ25ELEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ3JDLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FB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QyxDQUFDLElBQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ3pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQy9CLENBQUM7UUFDRCxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQ3pCLE1BQU0sRUFBRSxLQUFLO1lBQ2IsS0FBSyxFQUFFLEdBQUcsQ0FBQyxHQUFHO1lBQ2QsT0FBTyxFQUFFLEdBQUcsQ0FBQyxLQUFLO1lBQ2xCLFNBQVMsRUFBRSxHQUFHLENBQUMsT0FBTztZQUN0QixTQUFTLEVBQUUsR0FBRyxDQUFDLE9BQU87WUFDdEIsUUFBUSxFQUFFO2dCQUNOLFFBQVEsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQztnQkFDMUIsU0FBUyxFQUFFLEdBQUcsQ0FBQyxPQUFPO2dCQUN0QixRQUFRLEVBQUUsR0FBRyxDQUFDLE1BQU07YUFDdkI7U0FDSixDQUFDLENBQUM7SUFDUCxDQUFDO0lBQ0QsaUNBQWlDO0lBQ2pDLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFDekQsOEJBQThCO0lBQzlCLE9BQU8sQ0FBQyxZQUFZLENBQUMsR0FBRyxVQUFVLENBQUM7SUFDbkMsNEhBQTRIO0FBQ2hJLENBQUM7QUF0RkQsb0JBc0ZDO0FBRUQsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLElBQUksQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgT2JqZWN0ID0gb2wuT2JqZWN0O1xuLy8gaW1wb3J0ICogYXMgSHR0cFV0aWxzIGZyb20gJy4vSHR0cFV0aWxzJztcblxuZGVjbGFyZSBjbGFzcyBwcm9qNCB7XG4gICAgc3RhdGljIGRlZnMobmFtZTogc3RyaW5nLCBkZWY6IHN0cmluZyk6IHZvaWQ7XG59XG5cbmxldCB3aW5Db250ZXh0OiBhbnkgPSB3aW5kb3c7XG5kZWNsYXJlIGZ1bmN0aW9uIGFkZFNvdXJjZShpZDogc3RyaW5nLCB0aXRsZTogc3RyaW5nLCB2aXNpYmlsaXR5OiBib29sZWFuLCBvcGFjaXR5OiBudW1iZXIpOiB2b2lkO1xuXG5leHBvcnQgY2xhc3MgT2w0VXRpbHMge1xuICAgIC8qIFxuICAgICAqIHVuaXRzOiAnZGVncmVlcyd8J2Z0J3wnbSd8J3VzLWZ0J1xuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgcmVzb2x1dGlvblNjYWxlRmFjdG9yKHVuaXRzOiBzdHJpbmcpOiBudW1iZXIge1xuICAgICAgICBsZXQgZHBpID0gMjUuNCAvIDAuMjg7XG4gICAgICAgIGxldCBtcHUgPSBvbC5wcm9qLk1FVEVSU19QRVJfVU5JVFt1bml0c107XG4gICAgICAgIGxldCBpbmNoZXNQZXJNZXRlciA9IDM5LjM3O1xuICAgICAgICByZXR1cm4gbXB1ICogaW5jaGVzUGVyTWV0ZXIgKiBkcGk7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyByZXNvbHV0aW9uRm9yU2NhbGUoc2NhbGU6IG51bWJlciwgZmFjdG9yOiBudW1iZXIpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gc2NhbGUgLyBmYWN0b3I7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyByZXNvbHV0aW9uc0ZvclNjYWxlcyhzY2FsZXM6IG51bWJlcltdLCB1bml0czogc3RyaW5nKTogbnVtYmVyW10ge1xuICAgICAgICBsZXQgcmVzb2x1dGlvbnMgPSBbXTtcbiAgICAgICAgbGV0IGZhY3RvciA9IE9sNFV0aWxzLnJlc29sdXRpb25TY2FsZUZhY3Rvcih1bml0cyk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2NhbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICByZXNvbHV0aW9ucy5wdXNoKE9sNFV0aWxzLnJlc29sdXRpb25Gb3JTY2FsZShzY2FsZXNbaV0sIGZhY3RvcikpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXNvbHV0aW9ucztcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIHNjYWxlRm9yUmVzb2x1dGlvbihyZXNvbHV0aW9uOiBudW1iZXIsIGZhY3RvcjogbnVtYmVyKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHJlc29sdXRpb24gKiBmYWN0b3I7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBzY2FsZXNGb3JSZXNvbHV0aW9ucyhyZXNvbHV0aW9uczogbnVtYmVyW10sIHVuaXRzOiBzdHJpbmcpOiBudW1iZXJbXSB7XG4gICAgICAgIGxldCBzY2FsZXMgPSBbXTtcbiAgICAgICAgbGV0IGZhY3RvciA9IE9sNFV0aWxzLnJlc29sdXRpb25TY2FsZUZhY3Rvcih1bml0cyk7XG4gICAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCByZXNvbHV0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgc2NhbGVzLnB1c2goT2w0VXRpbHMuc2NhbGVGb3JSZXNvbHV0aW9uKHJlc29sdXRpb25zW2ldLCBmYWN0b3IpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2NhbGVzO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgaW5pdFByb2o0RGVmcyhwcm9qNERlZnM6IGFueSk6IHZvaWQge1xuICAgICAgICBmb3IgKGNvbnN0IG5hbWUgaW4gcHJvajREZWZzKSB7XG4gICAgICAgICAgICBwcm9qNC5kZWZzKG5hbWUsIHByb2o0RGVmc1tuYW1lXSk7XG4gICAgICAgICAgICBsZXQgcHIgPSBvbC5wcm9qLmdldChuYW1lKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0UHJvaihwcm9qQ29kZTogc3RyaW5nKTogb2wucHJvai5Qcm9qZWN0aW9uIHtcbiAgICAgICAgcmV0dXJuIG9sLnByb2ouZ2V0KHByb2pDb2RlKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGdldFN0eWxlKG9wdGlvbnM6IGFueSwgc3R5bGU6IG9sLnN0eWxlLlN0eWxlID0gbnVsbCk6IG9sLnN0eWxlLlN0eWxlIHtcbiAgICAgICAgbGV0IHN0eWxlXyA9IHN0eWxlID8gc3R5bGUgOiBuZXcgb2wuc3R5bGUuU3R5bGUoKTtcbiAgICAgICAgc3R5bGVfLnNldEZpbGwobmV3IG9sLnN0eWxlLkZpbGwob3B0aW9uc1snZmlsbCddKSk7XG4gICAgICAgIHN0eWxlXy5zZXRTdHJva2UobmV3IG9sLnN0eWxlLlN0cm9rZShvcHRpb25zWydzdHJva2UnXSkpO1xuICAgICAgICBpZiAob3B0aW9uc1snaW1hZ2UnXSAmJiBvcHRpb25zWydpbWFnZSddWydjaXJjbGUnXSkge1xuICAgICAgICAgICAgc3R5bGVfLnNldEltYWdlKG5ldyBvbC5zdHlsZS5DaXJjbGUoe1xuICAgICAgICAgICAgICAgICAgICByYWRpdXM6IG9wdGlvbnNbJ2ltYWdlJ11bJ2NpcmNsZSddWydyYWRpdXMnXSxcbiAgICAgICAgICAgICAgICAgICAgZmlsbDogbmV3IG9sLnN0eWxlLkZpbGwoe1xuICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6IG9wdGlvbnNbJ2ltYWdlJ11bJ2NpcmNsZSddWydmaWxsJ11bJ2NvbG9yJ11cbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3R5bGVfO1xuICAgICAgICAvL1xuICAgICAgICAvLyByZXR1cm4gbmV3IG9sLnN0eWxlXy5TdHlsZSh7XG4gICAgICAgIC8vICAgICBmaWxsOiBuZXcgb2wuc3R5bGVfLkZpbGwob3B0aW9uc1snZmlsbCddKSxcbiAgICAgICAgLy8gICAgIHN0cm9rZTogbmV3IG9sLnN0eWxlXy5TdHJva2Uob3B0aW9uc1snc3Ryb2tlJ10pLy8sXG4gICAgICAgIC8vICAgICAvLyBpbWFnZTogbmV3IG9sLnN0eWxlXy5DaXJjbGUoe1xuICAgICAgICAvLyAgICAgLy8gICAgIHJhZGl1czogNyxcbiAgICAgICAgLy8gICAgIC8vICAgICBmaWxsOiBuZXcgb2wuc3R5bGVfLkZpbGwob3B0aW9uc1snZmlsbCddKVxuICAgICAgICAvLyAgICAgLy8gfSlcbiAgICAgICAgLy8gfSk7XG4gICAgfVxuXG4vLyBmaWxsXG4vLyB7XG4vLyAgICAgY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4yKVxuLy8gfVxuLy8gc3Ryb2tlXG4vLyB7XG4vLyAgICAgY29sb3I6ICcjZmZjYzMzJyxcbi8vICAgICB3aWR0aDogMlxuLy8gICAgIGRhc2g6XG4vLyB9XG4vLyBpbWFnZVxufVxuXG5leHBvcnQgY2xhc3MgT2w0R2VvbSB7XG4gICAgcHJvdGVjdGVkIGdlb206IG9sLmdlb20uR2VvbWV0cnkgPSBudWxsO1xuICAgIHByb3RlY3RlZCBwcm9qOiBvbC5wcm9qLlByb2plY3Rpb24gPSBudWxsO1xuXG4gICAgY29uc3RydWN0b3IoZ2VvbTogb2wuZ2VvbS5HZW9tZXRyeSwgcHJvajogb2wucHJvai5Qcm9qZWN0aW9uKSB7XG4gICAgICAgIHRoaXMuZ2VvbSA9IGdlb207XG4gICAgICAgIHRoaXMucHJvaiA9IHByb2o7XG4gICAgfVxuXG4gICAgZ2V0R2VvbSgpOiBvbC5nZW9tLkdlb21ldHJ5IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2VvbTtcbiAgICB9XG5cbiAgICBnZXRQcm9qKCk6IG9sLnByb2ouUHJvamVjdGlvbiB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb2o7XG4gICAgfVxuXG4gICAgZ2V0RXh0ZW50KHByb2o6IG9sLnByb2ouUHJvamVjdGlvbik6IG9sLkV4dGVudCB7XG4gICAgICAgIGlmICh0aGlzLnByb2ogIT09IHByb2opIHtcbiAgICAgICAgICAgIHJldHVybiAoPG9sLmdlb20uR2VvbWV0cnk+KDxhbnk+IHRoaXMuZ2VvbSkuY2xvbmUoKSkudHJhbnNmb3JtKHRoaXMucHJvaiwgcHJvaikuZ2V0RXh0ZW50KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gKDxvbC5nZW9tLkdlb21ldHJ5Pig8YW55PiB0aGlzLmdlb20pLmNsb25lKCkpLmdldEV4dGVudCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGdldFBvbHlnb25Gb3JFeHRlbnQocHJvajogb2wucHJvai5Qcm9qZWN0aW9uKSB7XG4gICAgICAgIHJldHVybiBvbC5nZW9tLlBvbHlnb24uZnJvbUV4dGVudCh0aGlzLmdldEV4dGVudChwcm9qKSk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgT2w0RXh0ZW50IGV4dGVuZHMgT2w0R2VvbSB7XG4gICAgcHVibGljIHN0YXRpYyBmcm9tQXJyYXkob3JkaW5hdGVzOiBudW1iZXJbXSwgcHJvajogb2wucHJvai5Qcm9qZWN0aW9uKTogT2w0RXh0ZW50IHtcbiAgICAgICAgbGV0IGdlb20gPSBuZXcgb2wuZ2VvbS5NdWx0aVBvaW50KFtbb3JkaW5hdGVzWzBdLCBvcmRpbmF0ZXNbMV1dLCBbb3JkaW5hdGVzWzJdLCBvcmRpbmF0ZXNbM11dXSk7XG4gICAgICAgIHJldHVybiBuZXcgT2w0RXh0ZW50KGdlb20sIHByb2opO1xuICAgIH1cbn1cbmV4cG9ydCBjb25zdCBVVUlEOiBzdHJpbmcgPSAndXVpZCc7XG5leHBvcnQgY29uc3QgVElUTEU6IHN0cmluZyA9ICd0aXRsZSc7XG5leHBvcnQgY29uc3QgTUVUQURPUl9FUFNHOiBvbC5Qcm9qZWN0aW9uTGlrZSA9ICdFUFNHOjQzMjYnO1xuZXhwb3J0IGNvbnN0IExBWUVSX1ZFQ1RPUiA9ICd2ZWN0b3InO1xuZXhwb3J0IGNvbnN0IExBWUVSX0lNQUdFID0gJ2ltYWdlJztcblxuZXhwb3J0IGNsYXNzIE9sNE1hcCB7XG4gICAgcHJpdmF0ZSBzdGF0aWMgX3V1aWQgPSAwO1xuICAgIHByaXZhdGUgc3RhdGljIF9pbnN0YW5jZTogT2w0TWFwID0gbnVsbDsgLy8gc2luZ2xldG9uXG4gICAgcHJvdGVjdGVkIG9sTWFwOiBvbC5NYXAgPSBudWxsO1xuICAgIHByb3RlY3RlZCBzY2FsZXM6IG51bWJlcltdO1xuICAgIC8vICAgIHByb3RlY3RlZCBwcm9qOiBvbC5wcm9qLlByb2plY3Rpb24gPSBudWxsO1xuICAgIHByb3RlY3RlZCBzdGFydEV4dGVudDogT2w0RXh0ZW50ID0gbnVsbDsgIC8vIHhtaW4sIHltaW4sIHhtYXgsIHltYXggb3B0aW9uc1snc3RhcnRFeHRlbnQnXVxuICAgIHByb3RlY3RlZCBtYXhFeHRlbnQ6IE9sNEV4dGVudCA9IG51bGw7XG4gICAgcHJvdGVjdGVkIGRyYXdlcjogT2w0RHJhd2VyO1xuICAgIHByb3RlY3RlZCBzdHlsZXM6IE9iamVjdDtcbiAgICBwcm90ZWN0ZWQgaGdMYXllcjogb2wubGF5ZXIuVmVjdG9yO1xuICAgIHByb3RlY3RlZCBkcmFnem9vbTogb2wuaW50ZXJhY3Rpb24uRHJhZ1pvb207XG5cbiAgICBwcml2YXRlIHN0YXRpYyBnZXRVdWlkKHByZWZpeDogc3RyaW5nID0gJycpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gcHJlZml4ICsgKCsrT2w0TWFwLl91dWlkKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKG9wdGlvbnM6IGFueSkgeyAvLyBzaW5nbGV0b25cbiAgICAgICAgLy8gb2xbJ0VOQUJMRV9SQVNURVJfUkVQUk9KRUNUSU9OJ10gPSBmYWxzZTtcbiAgICAgICAgT2w0VXRpbHMuaW5pdFByb2o0RGVmcyhvcHRpb25zWydwcm9qNERlZnMnXSk7XG4gICAgICAgICg8SFRNTEZvcm1FbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy4tanMtY3JzLWNvZGUnKSkudmFsdWUgPSBvcHRpb25zWyd2aWV3J11bJ3Byb2plY3Rpb24nXTtcbiAgICAgICAgbGV0IHByb2o6IG9sLnByb2ouUHJvamVjdGlvbiA9IG9sLnByb2ouZ2V0KG9wdGlvbnNbJ3ZpZXcnXVsncHJvamVjdGlvbiddKTtcbiAgICAgICAgdGhpcy5zdHlsZXMgPSBvcHRpb25zWydzdHlsZXMnXTtcbiAgICAgICAgdGhpcy5zY2FsZXMgPSBvcHRpb25zWyd2aWV3J11bJ3NjYWxlcyddO1xuICAgICAgICB0aGlzLnN0YXJ0RXh0ZW50ID0gT2w0RXh0ZW50LmZyb21BcnJheShvcHRpb25zWyd2aWV3J11bJ3N0YXJ0RXh0ZW50J10sIHByb2opO1xuICAgICAgICB0aGlzLm1heEV4dGVudCA9IE9sNEV4dGVudC5mcm9tQXJyYXkob3B0aW9uc1sndmlldyddWydtYXhFeHRlbnQnXSwgcHJvaik7XG4gICAgICAgIHRoaXMub2xNYXAgPSBuZXcgb2wuTWFwKHtcbiAgICAgICAgICAgIHRhcmdldDogb3B0aW9uc1snbWFwJ11bJ3RhcmdldCddLFxuICAgICAgICAgICAgcmVuZGVyZXI6ICdjYW52YXMnXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLm9sTWFwLnNldFZpZXcoXG4gICAgICAgICAgICBuZXcgb2wuVmlldyh7XG4gICAgICAgICAgICAgICAgcHJvamVjdGlvbjogcHJvaixcbiAgICAgICAgICAgICAgICByZXNvbHV0aW9uczogT2w0VXRpbHMucmVzb2x1dGlvbnNGb3JTY2FsZXModGhpcy5zY2FsZXMsIHByb2ouZ2V0VW5pdHMoKSkucmV2ZXJzZSgpLFxuICAgICAgICAgICAgICAgIGV4dGVudDogdGhpcy5tYXhFeHRlbnQuZ2V0RXh0ZW50KHByb2opXG4gICAgICAgICAgICB9KVxuICAgICAgICApO1xuICAgICAgICAvKiBtYWtlIGEgZ3JvdXAgbGF5ZXIgZm9yIGFsbCBpbWFnZSBsYXllcnMgKFdNUyBldGMuKSovXG4gICAgICAgIGxldCBpbWFnZUdyb3VwID0gbmV3IG9sLmxheWVyLkdyb3VwKFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGxheWVyczogbmV3IG9sLkNvbGxlY3Rpb248b2wubGF5ZXIuQmFzZT4oKVxuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgICBpbWFnZUdyb3VwLnNldChVVUlELCBMQVlFUl9JTUFHRSlcbiAgICAgICAgdGhpcy5vbE1hcC5hZGRMYXllcihpbWFnZUdyb3VwKTtcbiAgICAgICAgLyogbWFrZSBhIGdyb3VwIGxheWVyIGZvciBhbGwgdmVjdG9yIGxheWVycyAoSGlnaHRsaWdodCwgU2VhcmNoIHJlc3VsdHMgZXRjLikqL1xuICAgICAgICBsZXQgdmVjdG9yR3JvdXAgPSBuZXcgb2wubGF5ZXIuR3JvdXAoXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbGF5ZXJzOiBuZXcgb2wuQ29sbGVjdGlvbjxvbC5sYXllci5CYXNlPigpXG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICAgIHZlY3Rvckdyb3VwLnNldChVVUlELCBMQVlFUl9WRUNUT1IpXG4gICAgICAgIHRoaXMub2xNYXAuYWRkTGF5ZXIodmVjdG9yR3JvdXApO1xuXG5cbiAgICAgICAgZm9yIChsZXQgc291cmNlIG9mIG9wdGlvbnNbJ3NvdXJjZSddKSB7XG4gICAgICAgICAgICB0aGlzLmFkZExheWVyRm9yT3B0aW9ucyhzb3VyY2UpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMub2xNYXAuYWRkQ29udHJvbChuZXcgb2wuY29udHJvbC5TY2FsZUxpbmUoKSk7XG5cbiAgICAgICAgdGhpcy5vbE1hcC5hZGRDb250cm9sKG5ldyBvbC5jb250cm9sLlpvb21Ub0V4dGVudCh7XG4gICAgICAgICAgICBleHRlbnQ6IHRoaXMubWF4RXh0ZW50LmdldEV4dGVudChwcm9qKVxuICAgICAgICB9KSk7XG4gICAgICAgIHRoaXMub2xNYXAuYWRkSW50ZXJhY3Rpb24obmV3IG9sLmludGVyYWN0aW9uLkRyYWdab29tKCkpO1xuICAgICAgICB0aGlzLm9sTWFwLmFkZENvbnRyb2wobmV3IG9sLmNvbnRyb2wuTW91c2VQb3NpdGlvbihcbiAgICAgICAgICAgIC8vIHtcbiAgICAgICAgICAgIC8vICAgICBjb29yZGluYXRlRm9ybWF0OiBmdW5jdGlvbiAoY29vcmRpbmF0ZXMpIHtcbiAgICAgICAgICAgIC8vICAgICAgICAgdmFyIGNvb3JkX3ggPSBjb29yZGluYXRlc1swXS50b0ZpeGVkKDMpO1xuICAgICAgICAgICAgLy8gICAgICAgICB2YXIgY29vcmRfeSA9IGNvb3JkaW5hdGVzWzFdLnRvRml4ZWQoMyk7XG4gICAgICAgICAgICAvLyAgICAgICAgIHJldHVybiBjb29yZF94ICsgJywgJyArIGNvb3JkX3k7XG4gICAgICAgICAgICAvLyAgICAgfVxuICAgICAgICAgICAgLy8gfVxuICAgICAgICApKTtcbiAgICAgICAgdGhpcy5vbE1hcC5nZXRWaWV3KCkuZml0KHRoaXMuc3RhcnRFeHRlbnQuZ2V0UG9seWdvbkZvckV4dGVudChwcm9qKSwgdGhpcy5vbE1hcC5nZXRTaXplKCkpO1xuICAgICAgICB0aGlzLmhnTGF5ZXIgPSB0aGlzLmFkZFZlY3RvckxheWVyKE9sNFV0aWxzLmdldFN0eWxlKHRoaXMuc3R5bGVzWydoaWdobGlnaHQnXSkpO1xuICAgIH1cblxuICAgIHN0YXRpYyBjcmVhdGUob3B0aW9uczogYW55KTogT2w0TWFwIHtcbiAgICAgICAgaWYgKCFPbDRNYXAuX2luc3RhbmNlKSB7Ly8gc2luZ2xldG9uXG4gICAgICAgICAgICBPbDRNYXAuX2luc3RhbmNlID0gbmV3IE9sNE1hcChvcHRpb25zKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gT2w0TWFwLl9pbnN0YW5jZTtcbiAgICB9XG5cbiAgICBnZXREcmF3ZXIoKTogT2w0RHJhd2VyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZHJhd2VyO1xuICAgIH1cblxuICAgIGdldEhnTGF5ZXIoKTogb2wubGF5ZXIuVmVjdG9yIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGdMYXllcjtcbiAgICB9XG5cblxuICAgIGFkZExheWVyRm9yT3B0aW9ucyhvcHRpb25zOiBhbnkpIHtcbiAgICAgICAgaWYgKG9wdGlvbnNbJ3R5cGUnXSA9PT0gJ1dNUycpIHtcbiAgICAgICAgICAgIGxldCB3bXNMYXllciA9IHRoaXMuYWRkTGF5ZXIoXG4gICAgICAgICAgICAgICAgT2w0V21zTGF5ZXIuY3JlYXRlTGF5ZXIob3B0aW9uc1sndXJsJ10sXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnNbJ3BhcmFtcyddLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9sTWFwLmdldFZpZXcoKS5nZXRQcm9qZWN0aW9uKCksXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnNbJ3Zpc2libGUnXSxcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VGbG9hdChvcHRpb25zWydvcGFjaXR5J10pKSxcbiAgICAgICAgICAgICAgICBvcHRpb25zWyd0aXRsZSddXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihvcHRpb25zWyd0eXBlJ10gKyAnIGlzIG5vdCBzdXBwb3J0ZWQuJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvL1xuICAgIC8vIGluaXRMYXllcnRyZWUoKSB7XG4gICAgLy8gICAgIGxldCBsYXllcnMgPSB0aGlzLm9sTWFwLmdldExheWVycygpLmdldEFycmF5KCk7XG4gICAgLy8gICAgIGxldCBsbGVuZ3RoID0gbGF5ZXJzLmxlbmd0aDtcbiAgICAvLyAgICAgZm9yIChsZXQgbGF5ZXIgb2YgbGF5ZXJzKSB7XG4gICAgLy8gICAgICAgICBsZXQgc291cmNlOiBvbC5zb3VyY2UuU291cmNlO1xuICAgIC8vICAgICAgICAgaWYgKGxheWVyIGluc3RhbmNlb2Ygb2wubGF5ZXIuR3JvdXApIHsgLy8gaW5zdGFuY2Ugb2Ygb2wubGF5ZXIuR3JvdXBcbiAgICAvLyAgICAgICAgICAgICBsZXQgc3VibGF5ZXJzID0gKDxvbC5sYXllci5Hcm91cD5sYXllcikuZ2V0TGF5ZXJzKCkuZ2V0QXJyYXkoKTtcbiAgICAvLyAgICAgICAgICAgICBmb3IgKGxldCBzbGF5ZXIgb2Ygc3VibGF5ZXJzKSB7XG4gICAgLy8gICAgICAgICAgICAgICAgIGlmIChzbGF5ZXIgaW5zdGFuY2VvZiBvbC5sYXllci5JbWFnZSkgeyAvLyBhZGQgb25seSBpbWFnZSBsYXllciAoV01TIGV0Yy4pXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICBhZGRTb3VyY2Uoc2xheWVyLmdldCgndXVpZCcpLCBzbGF5ZXIuZ2V0KCd0aXRsZScpLCBzbGF5ZXIuZ2V0VmlzaWJsZSgpLCBzbGF5ZXIuZ2V0T3BhY2l0eSgpKTtcbiAgICAvLyAgICAgICAgICAgICAgICAgfVxuICAgIC8vICAgICAgICAgICAgIH1cbiAgICAvLyAgICAgICAgIH0gZWxzZSBpZiAobGF5ZXIgaW5zdGFuY2VvZiBvbC5sYXllci5JbWFnZSkgeyAvLyBhZGQgb25seSBpbWFnZSBsYXllciAoV01TIGV0Yy4pXG4gICAgLy8gICAgICAgICAgICAgYWRkU291cmNlKGxheWVyLmdldCgndXVpZCcpLCBsYXllci5nZXQoJ3RpdGxlJyksIGxheWVyLmdldFZpc2libGUoKSwgbGF5ZXIuZ2V0T3BhY2l0eSgpKTtcbiAgICAvLyAgICAgICAgIH1cbiAgICAvLyAgICAgfVxuICAgIC8vIH1cblxuICAgIHByaXZhdGUgYWRkVG9MYXllcnRyZWUobGF5ZXI6IG9sLmxheWVyLkltYWdlKSB7XG4gICAgICAgIGFkZFNvdXJjZShsYXllci5nZXQoJ3V1aWQnKSwgbGF5ZXIuZ2V0KCd0aXRsZScpLCBsYXllci5nZXRWaXNpYmxlKCksIGxheWVyLmdldE9wYWNpdHkoKSk7XG4gICAgfVxuXG4gICAgc2hvd0ZlYXR1cmVzKHZMYXllcjogb2wubGF5ZXIuVmVjdG9yLCBnZW9Kc29uOiBPYmplY3QpIHtcbiAgICAgICAgbGV0IGdlb0pzb25SZWFkZXI6IG9sLmZvcm1hdC5HZW9KU09OID0gbmV3IG9sLmZvcm1hdC5HZW9KU09OKCk7XG4gICAgICAgIGxldCBkYXRhcHJvaiA9IGdlb0pzb25SZWFkZXIucmVhZFByb2plY3Rpb24oZ2VvSnNvbik7XG4gICAgICAgIGxldCBmZWF0dXJlcyA9IGdlb0pzb25SZWFkZXIucmVhZEZlYXR1cmVzKFxuICAgICAgICAgICAgZ2VvSnNvbixcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAnZGF0YVByb2plY3Rpb24nOiBnZW9Kc29uUmVhZGVyLnJlYWRQcm9qZWN0aW9uKGdlb0pzb24pLFxuICAgICAgICAgICAgICAgICdmZWF0dXJlUHJvamVjdGlvbic6IHRoaXMub2xNYXAuZ2V0VmlldygpLmdldFByb2plY3Rpb24oKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIHZMYXllci5nZXRTb3VyY2UoKS5hZGRGZWF0dXJlcyhmZWF0dXJlcyk7XG4gICAgfVxuXG4gICAgY2xlYXJGZWF0dXJlcyh2TGF5ZXI6IG9sLmxheWVyLlZlY3Rvcikge1xuICAgICAgICB2TGF5ZXIuZ2V0U291cmNlKCkuY2xlYXIodHJ1ZSk7XG4gICAgfVxuXG4gICAgYWRkVmVjdG9yTGF5ZXIoc3R5bGU6IG9sLnN0eWxlLlN0eWxlKTogb2wubGF5ZXIuVmVjdG9yIHtcbiAgICAgICAgbGV0IG9wdGlvbnMgPSB7XG4gICAgICAgICAgICB3cmFwWDogZmFsc2VcbiAgICAgICAgfTtcbiAgICAgICAgbGV0IHZMYXllciA9IG5ldyBvbC5sYXllci5WZWN0b3Ioe1xuICAgICAgICAgICAgc291cmNlOiBuZXcgb2wuc291cmNlLlZlY3RvcihvcHRpb25zKSxcbiAgICAgICAgICAgIHN0eWxlOiBzdHlsZVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIDxvbC5sYXllci5WZWN0b3I+dGhpcy5hZGRMYXllcih2TGF5ZXIpO1xuICAgIH1cblxuICAgIGFkZExheWVyKGxheWVyOiBvbC5sYXllci5CYXNlLCB0aXRsZTogc3RyaW5nID0gbnVsbCk6IG9sLmxheWVyLkJhc2Uge1xuICAgICAgICBsYXllci5zZXQoVVVJRCwgT2w0TWFwLmdldFV1aWQoJ29sYXktJykpO1xuICAgICAgICBpZiAodGl0bGUpIHtcbiAgICAgICAgICAgIGxheWVyLnNldChUSVRMRSwgdGl0bGUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsYXllciBpbnN0YW5jZW9mIG9sLmxheWVyLkltYWdlKSB7XG4gICAgICAgICAgICBsZXQgZ3JvdXA6IG9sLmxheWVyLkdyb3VwID0gPG9sLmxheWVyLkdyb3VwPiB0aGlzLmZpbmRMYXllcihMQVlFUl9JTUFHRSk7XG4gICAgICAgICAgICBncm91cC5nZXRMYXllcnMoKS5pbnNlcnRBdChncm91cC5nZXRMYXllcnMoKS5nZXRMZW5ndGgoKSwgbGF5ZXIpO1xuICAgICAgICAgICAgYWRkU291cmNlKGxheWVyLmdldCgndXVpZCcpLCBsYXllci5nZXQoJ3RpdGxlJyksIGxheWVyLmdldFZpc2libGUoKSwgbGF5ZXIuZ2V0T3BhY2l0eSgpKTtcbiAgICAgICAgfSBlbHNlIGlmIChsYXllciBpbnN0YW5jZW9mIG9sLmxheWVyLlZlY3Rvcikge1xuICAgICAgICAgICAgbGV0IGdyb3VwOiBvbC5sYXllci5Hcm91cCA9IDxvbC5sYXllci5Hcm91cD4gdGhpcy5maW5kTGF5ZXIoTEFZRVJfVkVDVE9SKTtcbiAgICAgICAgICAgIGdyb3VwLmdldExheWVycygpLmluc2VydEF0KGdyb3VwLmdldExheWVycygpLmdldExlbmd0aCgpLCBsYXllcik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxheWVyO1xuICAgIH1cblxuICAgIHJlbW92ZUxheWVyKGxheWVyOiBvbC5sYXllci5CYXNlKTogdm9pZCB7XG4gICAgICAgIHRoaXMub2xNYXAucmVtb3ZlTGF5ZXIobGF5ZXIpO1xuICAgIH1cblxuICAgIG1vdmVMYXllcih1dWlkOiBzdHJpbmcsIG9sZFBvczogbnVtYmVyLCBuZXdQb3M6IG51bWJlcik6IHZvaWQge1xuICAgICAgICBsZXQgbGF5ZXI6IG9sLmxheWVyLkJhc2UgPSB0aGlzLmZpbmRMYXllcih1dWlkKTtcbiAgICAgICAgaWYgKGxheWVyIGluc3RhbmNlb2Ygb2wubGF5ZXIuSW1hZ2UpIHtcbiAgICAgICAgICAgIGxldCBncm91cDogb2wubGF5ZXIuR3JvdXAgPSA8b2wubGF5ZXIuR3JvdXA+IHRoaXMuZmluZExheWVyKExBWUVSX0lNQUdFKTtcbiAgICAgICAgICAgIGxldCBsYXllcmxsID0gZ3JvdXAuZ2V0TGF5ZXJzKCkucmVtb3ZlKGxheWVyKTtcbiAgICAgICAgICAgIGdyb3VwLmdldExheWVycygpLmluc2VydEF0KG5ld1BvcywgbGF5ZXJsbCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGZpbmRMYXllcih1dWlkOiBzdHJpbmcpOiBvbC5sYXllci5CYXNlIHtcbiAgICAgICAgbGV0IGxheWVycyA9IHRoaXMub2xNYXAuZ2V0TGF5ZXJzKCkuZ2V0QXJyYXkoKTtcbiAgICAgICAgZm9yIChsZXQgbGF5ZXIgb2YgbGF5ZXJzKSB7XG4gICAgICAgICAgICBsZXQgc291cmNlOiBvbC5zb3VyY2UuU291cmNlO1xuICAgICAgICAgICAgaWYgKGxheWVyLmdldChVVUlEKSA9PT0gdXVpZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBsYXllcjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobGF5ZXIgaW5zdGFuY2VvZiBvbC5sYXllci5Hcm91cCkge1xuICAgICAgICAgICAgICAgIGxldCBzdWJsYXllcnMgPSAoPG9sLmxheWVyLkdyb3VwPmxheWVyKS5nZXRMYXllcnMoKS5nZXRBcnJheSgpO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IHN1YmxheWVyIG9mIHN1YmxheWVycykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3VibGF5ZXIuZ2V0KFVVSUQpID09PSB1dWlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3VibGF5ZXI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgdXBkYXRlTWFwKCk6IHZvaWQge1xuICAgICAgICB0aGlzLm9sTWFwLnVwZGF0ZVNpemUoKTtcbiAgICB9XG5cbiAgICBjaGFuZ2VDcnMoY3JzOiBzdHJpbmcpIHsgLy8gVE9ET1xuICAgICAgICBsZXQgdG9Qcm9qID0gbnVsbDtcbiAgICAgICAgaWYgKCh0b1Byb2ogPSBvbC5wcm9qLmdldChjcnMpKSkge1xuICAgICAgICAgICAgbGV0IGV4dGVudCA9IE9sNEV4dGVudC5mcm9tQXJyYXkoXG4gICAgICAgICAgICAgICAgdGhpcy5vbE1hcC5nZXRWaWV3KCkuY2FsY3VsYXRlRXh0ZW50KHRoaXMub2xNYXAuZ2V0U2l6ZSgpKSxcbiAgICAgICAgICAgICAgICB0aGlzLm9sTWFwLmdldFZpZXcoKS5nZXRQcm9qZWN0aW9uKClcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBsZXQgZnJvbVByb2ogPSB0aGlzLm9sTWFwLmdldFZpZXcoKS5nZXRQcm9qZWN0aW9uKCk7XG4gICAgICAgICAgICBsZXQgY2VudGVyID0gdGhpcy5vbE1hcC5nZXRWaWV3KCkuZ2V0Q2VudGVyKCk7XG4gICAgICAgICAgICBsZXQgbmV3VmlldyA9IG5ldyBvbC5WaWV3KHtcbiAgICAgICAgICAgICAgICBwcm9qZWN0aW9uOiB0b1Byb2osXG4gICAgICAgICAgICAgICAgcmVzb2x1dGlvbnM6IE9sNFV0aWxzLnJlc29sdXRpb25zRm9yU2NhbGVzKHRoaXMuc2NhbGVzLCB0b1Byb2ouZ2V0VW5pdHMoKSkucmV2ZXJzZSgpLFxuICAgICAgICAgICAgICAgIGV4dGVudDogdGhpcy5tYXhFeHRlbnQuZ2V0RXh0ZW50KHRvUHJvailcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbGV0IGxheWVycyA9ICg8b2wubGF5ZXIuR3JvdXA+dGhpcy5maW5kTGF5ZXIoTEFZRVJfSU1BR0UpKS5nZXRMYXllcnMoKS5nZXRBcnJheSgpO1xuICAgICAgICAgICAgdGhpcy5jaGFuZ2VDcnNMaXN0KCg8b2wubGF5ZXIuR3JvdXA+dGhpcy5maW5kTGF5ZXIoTEFZRVJfSU1BR0UpKS5nZXRMYXllcnMoKSwgZnJvbVByb2osIHRvUHJvaik7XG4gICAgICAgICAgICB0aGlzLmNoYW5nZUNyc0xpc3QoKDxvbC5sYXllci5Hcm91cD50aGlzLmZpbmRMYXllcihMQVlFUl9WRUNUT1IpKS5nZXRMYXllcnMoKSwgZnJvbVByb2osIHRvUHJvaik7XG5cbiAgICAgICAgICAgIHRoaXMub2xNYXAuc2V0VmlldyhuZXdWaWV3KTtcbiAgICAgICAgICAgIHRoaXMub2xNYXAuZ2V0VmlldygpLmZpdChleHRlbnQuZ2V0UG9seWdvbkZvckV4dGVudCh0b1Byb2opLCB0aGlzLm9sTWFwLmdldFNpemUoKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGNoYW5nZUNyc0xpc3QobGF5ZXJzOiBvbC5Db2xsZWN0aW9uPG9sLmxheWVyLkJhc2U+LCBmcm9tUHJvaiwgdG9Qcm9qKSB7XG4gICAgICAgIGZvciAobGV0IGxheWVyIG9mIGxheWVycy5nZXRBcnJheSgpKSB7XG4gICAgICAgICAgICBsZXQgc291cmNlOiBvbC5zb3VyY2UuU291cmNlO1xuICAgICAgICAgICAgaWYgKChzb3VyY2UgPSAoPG9sLmxheWVyLkxheWVyPmxheWVyKS5nZXRTb3VyY2UoKSkgaW5zdGFuY2VvZiBvbC5zb3VyY2UuSW1hZ2VXTVMpIHtcbiAgICAgICAgICAgICAgICAoPG9sLmxheWVyLkltYWdlPmxheWVyKS5zZXRTb3VyY2UoT2w0V21zTGF5ZXIuY3JlYXRlRnJvbVNvdXJjZSg8b2wuc291cmNlLkltYWdlV01TPiBzb3VyY2UsIHRvUHJvaikpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICgoc291cmNlID0gKDxvbC5sYXllci5MYXllcj5sYXllcikuZ2V0U291cmNlKCkpIGluc3RhbmNlb2Ygb2wuc291cmNlLlZlY3Rvcikge1xuICAgICAgICAgICAgICAgIGxldCBmZWF0dXJlczogb2wuRmVhdHVyZVtdID0gKDxvbC5zb3VyY2UuVmVjdG9yPnNvdXJjZSkuZ2V0RmVhdHVyZXMoKTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBmZWF0dXJlIG9mIGZlYXR1cmVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGZlYXR1cmUuc2V0R2VvbWV0cnkoZmVhdHVyZS5nZXRHZW9tZXRyeSgpLnRyYW5zZm9ybShmcm9tUHJvaiwgdG9Qcm9qKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2V0VmlzaWJsZShsYXllclVpaWQ6IHN0cmluZywgdmlzaWJsaXR5OiBib29sZWFuKTogdm9pZCB7XG4gICAgICAgIGxldCBsYXllcjogb2wubGF5ZXIuQmFzZSA9IHRoaXMuZmluZExheWVyKGxheWVyVWlpZCk7XG4gICAgICAgIGlmIChsYXllcikge1xuICAgICAgICAgICAgbGF5ZXIuc2V0VmlzaWJsZSh2aXNpYmxpdHkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2V0T3BhY2l0eShsYXllclVpaWQ6IHN0cmluZywgb3BhY2l0eTogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIGxldCBsYXllcjogb2wubGF5ZXIuQmFzZSA9IHRoaXMuZmluZExheWVyKGxheWVyVWlpZCk7XG4gICAgICAgIGlmIChsYXllcikge1xuICAgICAgICAgICAgbGF5ZXIuc2V0T3BhY2l0eShvcGFjaXR5KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRyYWdab29tKGFjdGl2YXRlOiBib29sZWFuLCBvblpvb21FbmQ6IEZ1bmN0aW9uID0gbnVsbCkge1xuICAgICAgICBpZiAoIXRoaXMuZHJhZ3pvb20pIHtcbiAgICAgICAgICAgIHRoaXMuZHJhZ3pvb20gPSBuZXcgb2wuaW50ZXJhY3Rpb24uRHJhZ1pvb20oe1xuICAgICAgICAgICAgICAgIGNvbmRpdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGxldCBkcmFnem9vbSA9IHRoaXMuZHJhZ3pvb207XG4gICAgICAgICAgICBsZXQgbWFwID0gdGhpcy5vbE1hcDtcbiAgICAgICAgICAgIHRoaXMuZHJhZ3pvb20ub24oJ2JveGVuZCcsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKGV2ZW50OiBvbC5pbnRlcmFjdGlvbi5EcmF3LkV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIG1hcC5yZW1vdmVJbnRlcmFjdGlvbihkcmFnem9vbSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvblpvb21FbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uWm9vbUVuZCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFjdGl2YXRlKSB7XG4gICAgICAgICAgICB0aGlzLm9sTWFwLmFkZEludGVyYWN0aW9uKHRoaXMuZHJhZ3pvb20pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5vbE1hcC5yZW1vdmVJbnRlcmFjdGlvbih0aGlzLmRyYWd6b29tKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRyYXdHZW9tZXRyeUZvclNlYXJjaChnZW9Kc29uOiBPYmplY3QsIG9uRHJhd0VuZDogRnVuY3Rpb24gPSBudWxsKSB7XG4gICAgICAgIGxldCBvbDRtYXAgPSB0aGlzO1xuICAgICAgICBsZXQgb2xNYXAgPSB0aGlzLm9sTWFwO1xuICAgICAgICBpZiAoIXRoaXMuZHJhd2VyKSB7XG4gICAgICAgICAgICBsZXQgdkxheWVyID0gdGhpcy5hZGRWZWN0b3JMYXllcihPbDRVdGlscy5nZXRTdHlsZSh0aGlzLnN0eWxlc1snc2VhcmNoJ10pKTtcbiAgICAgICAgICAgIHZMYXllci5zZXRNYXAodGhpcy5vbE1hcCk7XG4gICAgICAgICAgICB0aGlzLmRyYXdlciA9IG5ldyBPbDREcmF3ZXIodkxheWVyKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNsZWFyRmVhdHVyZXModGhpcy5kcmF3ZXIuZ2V0TGF5ZXIoKSk7XG4gICAgICAgIHRoaXMuc2hvd0ZlYXR1cmVzKHRoaXMuZHJhd2VyLmdldExheWVyKCksIGdlb0pzb24pO1xuICAgICAgICBpZiAob25EcmF3RW5kICE9PSBudWxsKSB7XG4gICAgICAgICAgICBvbkRyYXdFbmQoZ2VvSnNvbik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5vbE1hcC5nZXRWaWV3KCkuZml0KHRoaXMuZHJhd2VyLmdldExheWVyKCkuZ2V0U291cmNlKCkuZ2V0RXh0ZW50KCksIHRoaXMub2xNYXAuZ2V0U2l6ZSgpKTtcbiAgICB9XG5cbiAgICBkcmF3U2hhcGVGb3JTZWFyY2goc2hhcGVUeXBlOiBTSEFQRVMgPSBudWxsLCBvbkRyYXdFbmQ6IEZ1bmN0aW9uID0gbnVsbCkge1xuICAgICAgICBsZXQgb2w0bWFwID0gdGhpcztcbiAgICAgICAgbGV0IG9sTWFwID0gdGhpcy5vbE1hcDtcbiAgICAgICAgaWYgKCF0aGlzLmRyYXdlcikge1xuICAgICAgICAgICAgbGV0IHZMYXllciA9IHRoaXMuYWRkVmVjdG9yTGF5ZXIoT2w0VXRpbHMuZ2V0U3R5bGUodGhpcy5zdHlsZXNbJ3NlYXJjaCddKSk7XG4gICAgICAgICAgICB2TGF5ZXIuc2V0TWFwKHRoaXMub2xNYXApO1xuICAgICAgICAgICAgdGhpcy5kcmF3ZXIgPSBuZXcgT2w0RHJhd2VyKHZMYXllcik7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgc2hhcGU6IFNIQVBFUyA9IHR5cGVvZiBzaGFwZVR5cGUgPT09ICdzdHJpbmcnID8gU0hBUEVTWzxzdHJpbmc+IHNoYXBlVHlwZV0gOiBzaGFwZVR5cGU7XG4gICAgICAgIGlmICh0aGlzLmRyYXdlci5nZXRJbnRlcmFjdGlvbigpKSB7XG4gICAgICAgICAgICB0aGlzLm9sTWFwLnJlbW92ZUludGVyYWN0aW9uKHRoaXMuZHJhd2VyLmdldEludGVyYWN0aW9uKCkpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZHJhd2VyLnNldEludGVyYWN0aW9uKHNoYXBlLCBPbDRVdGlscy5nZXRTdHlsZSh0aGlzLnN0eWxlc1snc2VhcmNoJ10pKTtcbiAgICAgICAgaWYgKHRoaXMuZHJhd2VyLmdldEludGVyYWN0aW9uKCkpIHtcbiAgICAgICAgICAgIGxldCBkcmF3ZXIgPSB0aGlzLmRyYXdlcjtcbiAgICAgICAgICAgIHRoaXMuZ2V0RHJhd2VyKCkuZ2V0TGF5ZXIoKS5nZXRTb3VyY2UoKS5jbGVhcigpO1xuICAgICAgICAgICAgdGhpcy5vbE1hcC5hZGRJbnRlcmFjdGlvbih0aGlzLmRyYXdlci5nZXRJbnRlcmFjdGlvbigpKTtcbiAgICAgICAgICAgIHRoaXMuZHJhd2VyLmdldEludGVyYWN0aW9uKCkub24oXG4gICAgICAgICAgICAgICAgJ2RyYXdzdGFydCcsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgb2w0bWFwLmdldERyYXdlcigpLmdldExheWVyKCkuZ2V0U291cmNlKCkuY2xlYXIoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgdGhpcy5kcmF3ZXIuZ2V0SW50ZXJhY3Rpb24oKS5vbihcbiAgICAgICAgICAgICAgICAnZHJhd2VuZCcsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGdlb2pzb24gPSBuZXcgb2wuZm9ybWF0Lkdlb0pTT04oKS53cml0ZUZlYXR1cmVPYmplY3QoXG4gICAgICAgICAgICAgICAgICAgICAgICBlLmZlYXR1cmUsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RhdGFQcm9qZWN0aW9uJzogTUVUQURPUl9FUFNHLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdmZWF0dXJlUHJvamVjdGlvbic6IG9sTWFwLmdldFZpZXcoKS5nZXRQcm9qZWN0aW9uKClcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgb25EcmF3RW5kKGdlb2pzb24pO1xuICAgICAgICAgICAgICAgICAgICBvbE1hcC5yZW1vdmVJbnRlcmFjdGlvbihkcmF3ZXIuZ2V0SW50ZXJhY3Rpb24oKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZ2V0RHJhd2VyKCkuZ2V0TGF5ZXIoKS5nZXRTb3VyY2UoKS5jbGVhcigpO1xuICAgICAgICAgICAgb25EcmF3RW5kKG51bGwpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgT2w0V21zTGF5ZXIge1xuICAgIHN0YXRpYyBjcmVhdGVMYXllcih1cmw6IHN0cmluZywgcGFyYW1zOiBhbnksIHByb2o6IG9sLlByb2plY3Rpb25MaWtlLCB2aXNpYmxlOiBib29sZWFuLCBvcGFjaXR5OiBudW1iZXIpOiBvbC5sYXllci5JbWFnZSB7XG4gICAgICAgIGxldCBzb3VyY2VXbXMgPSBuZXcgb2wubGF5ZXIuSW1hZ2Uoe1xuICAgICAgICAgICAgc291cmNlOiBPbDRXbXNMYXllci5jcmVhdGVTb3VyY2UodXJsLCBwYXJhbXMsIHByb2opLFxuICAgICAgICAgICAgdmlzaWJsZTogdmlzaWJsZSxcbiAgICAgICAgICAgIG9wYWNpdHk6IG9wYWNpdHlcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBzb3VyY2VXbXM7XG4gICAgfVxuXG4gICAgc3RhdGljIGNyZWF0ZVNvdXJjZSh1cmw6IHN0cmluZywgcGFyYW1zOiBhbnksIHByb2o6IG9sLlByb2plY3Rpb25MaWtlKTogb2wuc291cmNlLkltYWdlV01TIHtcbiAgICAgICAgcmV0dXJuIG5ldyBvbC5zb3VyY2UuSW1hZ2VXTVMoe1xuICAgICAgICAgICAgdXJsOiB1cmwsXG4gICAgICAgICAgICBwYXJhbXM6IHBhcmFtcyxcbiAgICAgICAgICAgIHByb2plY3Rpb246IHByb2pcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc3RhdGljIGNyZWF0ZUZyb21Tb3VyY2Uoc291cmNlOiBvbC5zb3VyY2UuSW1hZ2VXTVMsIHByb2o6IG9sLlByb2plY3Rpb25MaWtlKSB7XG4gICAgICAgIHJldHVybiBuZXcgb2wuc291cmNlLkltYWdlV01TKHtcbiAgICAgICAgICAgIHVybDogc291cmNlLmdldFVybCgpLFxuICAgICAgICAgICAgcGFyYW1zOiBzb3VyY2UuZ2V0UGFyYW1zKCksXG4gICAgICAgICAgICBwcm9qZWN0aW9uOiBwcm9qXG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGVudW0gU0hBUEVTIHtOT05FLCBCT1gsIFBPTFlHT059XG47XG5cbmV4cG9ydCBjbGFzcyBPbDREcmF3ZXIge1xuICAgIC8vIHByaXZhdGUgc3RhdGljIF9pbnN0YW5jZTogT2w0RHJhd2VyO1xuICAgIHByb3RlY3RlZCBsYXllcjogb2wubGF5ZXIuVmVjdG9yO1xuICAgIHByb3RlY3RlZCBpbnRlcmFjdGlvbjogb2wuaW50ZXJhY3Rpb24uRHJhdztcblxuICAgIGNvbnN0cnVjdG9yKGxheWVyOiBvbC5sYXllci5WZWN0b3IpIHtcbiAgICAgICAgdGhpcy5sYXllciA9IGxheWVyO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRMYXllcigpOiBvbC5sYXllci5WZWN0b3Ige1xuICAgICAgICByZXR1cm4gdGhpcy5sYXllcjtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0SW50ZXJhY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmludGVyYWN0aW9uO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRJbnRlcmFjdGlvbih0eXBlOiBTSEFQRVMsIGRyYXdTdHlsZTogb2wuc3R5bGUuU3R5bGUpIHtcbiAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICBjYXNlIFNIQVBFUy5CT1g6XG4gICAgICAgICAgICAgICAgdGhpcy5pbnRlcmFjdGlvbiA9IG5ldyBvbC5pbnRlcmFjdGlvbi5EcmF3KHtcbiAgICAgICAgICAgICAgICAgICAgc291cmNlOiB0aGlzLmxheWVyLmdldFNvdXJjZSgpLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnQ2lyY2xlJyxcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IGRyYXdTdHlsZSxcbiAgICAgICAgICAgICAgICAgICAgZ2VvbWV0cnlGdW5jdGlvbjogY3JlYXRlQm94KCkgLy8gb2wuZC50cyBoYXMgbm8gZnVuY3Rpb24gXCJvbC5pbnRlcmFjdGlvbi5EcmF3LmNyZWF0ZUJveCgpXCJcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgU0hBUEVTLlBPTFlHT046XG4gICAgICAgICAgICAgICAgdGhpcy5pbnRlcmFjdGlvbiA9IG5ldyBvbC5pbnRlcmFjdGlvbi5EcmF3KHtcbiAgICAgICAgICAgICAgICAgICAgc291cmNlOiB0aGlzLmxheWVyLmdldFNvdXJjZSgpLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnUG9seWdvbicsXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiBkcmF3U3R5bGVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhpcy5pbnRlcmFjdGlvbiA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogb2wuZC50cyBoYXMgbm8gZnVuY3Rpb24gXCJvbC5pbnRlcmFjdGlvbi5EcmF3LmNyZWF0ZUJveCgpXCJcbiAqIEByZXR1cm5zIHsoY29vcmRpbmF0ZXM6YW55LCBvcHRfZ2VvbWV0cnk6YW55KT0+YW55fG9sLmdlb20uUG9seWdvbn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUJveCgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtIHtvbC5Db29yZGluYXRlfEFycmF5LjxvbC5Db29yZGluYXRlPnxBcnJheS48QXJyYXkuPG9sLkNvb3JkaW5hdGU+Pn0gY29vcmRpbmF0ZXNcbiAgICAgICAgICogQHBhcmFtIHtvbC5nZW9tLlNpbXBsZUdlb21ldHJ5PX0gb3B0X2dlb21ldHJ5XG4gICAgICAgICAqIEByZXR1cm4ge29sLmdlb20uU2ltcGxlR2VvbWV0cnl9XG4gICAgICAgICAqL1xuICAgICAgICAgICAgZnVuY3Rpb24gKGNvb3JkaW5hdGVzLCBvcHRfZ2VvbWV0cnkpIHtcbiAgICAgICAgICAgIHZhciBleHRlbnQgPSBvbC5leHRlbnQuYm91bmRpbmdFeHRlbnQoY29vcmRpbmF0ZXMpO1xuICAgICAgICAgICAgdmFyIGdlb21ldHJ5ID0gb3B0X2dlb21ldHJ5IHx8IG5ldyBvbC5nZW9tLlBvbHlnb24obnVsbCk7XG4gICAgICAgICAgICBnZW9tZXRyeS5zZXRDb29yZGluYXRlcyhbW1xuICAgICAgICAgICAgICAgIG9sLmV4dGVudC5nZXRCb3R0b21MZWZ0KGV4dGVudCksXG4gICAgICAgICAgICAgICAgb2wuZXh0ZW50LmdldEJvdHRvbVJpZ2h0KGV4dGVudCksXG4gICAgICAgICAgICAgICAgb2wuZXh0ZW50LmdldFRvcFJpZ2h0KGV4dGVudCksXG4gICAgICAgICAgICAgICAgb2wuZXh0ZW50LmdldFRvcExlZnQoZXh0ZW50KSxcbiAgICAgICAgICAgICAgICBvbC5leHRlbnQuZ2V0Qm90dG9tTGVmdChleHRlbnQpXG4gICAgICAgICAgICBdXSk7XG4gICAgICAgICAgICByZXR1cm4gZ2VvbWV0cnk7XG4gICAgICAgIH1cbiAgICApO1xufTtcblxuXG5cblxuXG5leHBvcnQgY2xhc3MgVWlVdGlscyB7XG5cbn1cblxuZXhwb3J0IGNsYXNzIEdlb21Mb2FkZXIge1xuICAgIHByaXZhdGUgbWFwOiBPbDRNYXA7XG4gICAgcHJpdmF0ZSBmb3JtOiBIVE1MRm9ybUVsZW1lbnQ7XG5cbiAgICBwdWJsaWMgY29uc3RydWN0b3IobWFwOiBPbDRNYXAsIGZvcm06IEhUTUxGb3JtRWxlbWVudCkge1xuICAgICAgICB0aGlzLm1hcCA9IG1hcDtcbiAgICAgICAgdGhpcy5mb3JtID0gZm9ybTtcbiAgICAgICAgdGhpcy5vbigpO1xuICAgIH1cblxuICAgIHB1YmxpYyBvbigpIHtcbiAgICAgICAgdGhpcy5mb3JtLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIHRoaXMudXBsb2FkLmJpbmQodGhpcyksIGZhbHNlKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHVwbG9hZChlOiBFdmVudCkge1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhlKTtcbiAgICAgICAgLy8gSHR0cFV0aWxzLkh0dHAuc2VuZEZvcm0odGhpcy5mb3JtLCB0aGlzLmZvcm0uYWN0aW9uLCBIdHRwVXRpbHMuSFRUUF9NRVRIT0QuUE9TVCwgSHR0cFV0aWxzLkhUVFBfREFUQVRZUEUuanNvbilcbiAgICAgICAgLy8gICAgIC50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAvLyAgICAgICAgIGNvbnNvbGUubG9nKCdDb250ZW50czogJyArIHZhbHVlKTtcbiAgICAgICAgLy8gICAgIH0pXG4gICAgICAgIC8vICAgICAuY2F0Y2goZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICAvLyAgICAgICAgIGNvbnNvbGUuZXJyb3IocmVhc29uKTtcbiAgICAgICAgLy8gICAgIH0pO1xuICAgIH1cbn0iLCJpbXBvcnQgKiBhcyBtZXRhZG9yIGZyb20gJy4vT2w0JztcblxuZGVjbGFyZSB2YXIgQ29uZmlndXJhdGlvbjogYW55O1xuXG5sZXQgY29udGV4dDogYW55ID0gV2luZG93O1xuY29udGV4dC5tZXRhZG9yID0gbWV0YWRvcjtcblxuZXhwb3J0IGZ1bmN0aW9uIGluaXQoKSB7XG5cbiAgICB2YXIgbWV0YWRvck1hcENvbmZpZyA9IHtcbiAgICAgICAgbWFwOiB7XG4gICAgICAgICAgICB0YXJnZXQ6ICdtYXAnLFxuICAgICAgICAgICAgc3JzOiBbXCJFUFNHOjQzMjZcIiwgXCJFUFNHOjMxNDY2XCIsIFwiRVBTRzoyNTgzMlwiXVxuICAgICAgICB9LFxuICAgICAgICB2aWV3OiB7XG4gICAgICAgICAgICBwcm9qZWN0aW9uOiBDb25maWd1cmF0aW9uLnNldHRpbmdzWydtYXBfY3JzJ10sLy8nOiAnOSw0OSwxMSw1MycsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdcbiAgICAgICAgICAgIG1heEV4dGVudDogQ29uZmlndXJhdGlvbi5zZXR0aW5nc1snbWFwX2Jib3hfbWF4J10uc3BsaXQoLyxcXHM/LyksLy9bNS44LCA0Ny4wLCAxNS4wLCA1NS4wXSwgLy8gcHJpb3JpdHkgZm9yIHNjYWxlcyBvciBmb3IgbWF4RXh0ZW50P1xuICAgICAgICAgICAgc3RhcnRFeHRlbnQ6IENvbmZpZ3VyYXRpb24uc2V0dGluZ3NbJ21hcF9iYm94X3N0YXJ0J10uc3BsaXQoLyxcXHM/LyksXG4gICAgICAgICAgICBzY2FsZXM6IFs1MDAwLCAyNTAwMCwgNTAwMDAsIDEwMDAwMCwgMjAwMDAwLCAyNTAwMDAsIDUwMDAwMCwgMTAwMDAwMCwgMjAwMDAwMCwgNTAwMDAwMCwgMTAwMDAwMDBdLy8sIDIwMDAwMDAwLCA1MDAwMDAwMF1cbiAgICAgICAgfSxcbiAgICAgICAgc3R5bGVzOiB7XG4gICAgICAgICAgICBoaWdobGlnaHQ6IHtcbiAgICAgICAgICAgICAgICBmaWxsOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiAncmdiYSg2MCwgNjAsIDI1NSwgMC4xKSdcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHN0cm9rZToge1xuICAgICAgICAgICAgICAgICAgICBjb2xvcjogJ3JnYmEoNjAsIDYwLCAyNTUsIDEuMCknLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogMlxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZWFyY2g6IHtcbiAgICAgICAgICAgICAgICBmaWxsOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiAncmdiYSgyNTUsIDYwLCA2MCwgMC4xKSdcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHN0cm9rZToge1xuICAgICAgICAgICAgICAgICAgICBjb2xvcjogJ3JnYmEoMjU1LCA2MCwgNjAsIDEuMCknLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogMlxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgaW1hZ2U6IHtcbiAgICAgICAgICAgICAgICAgICAgY2lyY2xlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByYWRpdXM6IDUsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxsOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6ICdyZ2JhKDI1NSwgNjAsIDYwLCAwLjYpJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBzb3VyY2U6IFtdLFxuICAgICAgICAvLyBhZGQgYWRkaXRpb25hbCBwYXJhbWV0ZXJzIHdpdGggKyBcIkFERElUSU9OQUxcIlxuICAgICAgICBwcm9qNERlZnM6IHtcbiAgICAgICAgICAgIFwiRVBTRzo0MzI2XCI6IFwiK3Byb2o9bG9uZ2xhdCArZGF0dW09V0dTODQgK3VuaXRzPWRlZ3JlZXMgK25vX2RlZnNcIiArIFwiICtheGlzPW5ldVwiLFxuICAgICAgICAgICAgXCJFUFNHOjQyNThcIjogXCIrcHJvaj1sb25nbGF0ICtlbGxwcz1HUlM4MCArdG93Z3M4ND0wLDAsMCwwLDAsMCwwICtub19kZWZzXCIgKyBcIiArdW5pdHM9ZGVncmVlcyArYXhpcz1uZXVcIixcbiAgICAgICAgICAgIFwiRVBTRzozMTQ2NlwiOiBcIitwcm9qPXRtZXJjICtsYXRfMD0wICtsb25fMD02ICtrPTEgK3hfMD0yNTAwMDAwICt5XzA9MCArZWxscHM9YmVzc2VsICt0b3dnczg0PTU5OC4xLDczLjcsNDE4LjIsMC4yMDIsMC4wNDUsLTIuNDU1LDYuNyArdW5pdHM9bSArbm9fZGVmc1wiICsgXCIgK2F4aXM9bmV1XCIsXG4gICAgICAgICAgICBcIkVQU0c6MzE0NjdcIjogXCIrcHJvaj10bWVyYyArbGF0XzA9MCArbG9uXzA9OSAraz0xICt4XzA9MzUwMDAwMCAreV8wPTAgK2VsbHBzPWJlc3NlbCArdG93Z3M4ND01OTguMSw3My43LDQxOC4yLDAuMjAyLDAuMDQ1LC0yLjQ1NSw2LjcgK3VuaXRzPW0gK25vX2RlZnNcIiArIFwiICtheGlzPW5ldVwiLFxuICAgICAgICAgICAgLy8gXCJFUFNHOjMxNDY4XCI6IFwiK3Byb2o9dG1lcmMgK2xhdF8wPTAgK2xvbl8wPTEyICtrPTEgK3hfMD00NTAwMDAwICt5XzA9MCArZWxscHM9YmVzc2VsICt0b3dnczg0PTU5OC4xLDczLjcsNDE4LjIsMC4yMDIsMC4wNDUsLTIuNDU1LDYuNyArdW5pdHM9bSArbm9fZGVmc1wiICsgXCIgK2F4aXM9bmV1XCIsXG4gICAgICAgICAgICAvLyBcIkVQU0c6MzE0NjlcIjogXCIrcHJvaj10bWVyYyArbGF0XzA9MCArbG9uXzA9MTUgK2s9MSAreF8wPTU1MDAwMDAgK3lfMD0wICtlbGxwcz1iZXNzZWwgK3Rvd2dzODQ9NTk4LjEsNzMuNyw0MTguMiwwLjIwMiwwLjA0NSwtMi40NTUsNi43ICt1bml0cz1tICtub19kZWZzXCIgKyBcIiArYXhpcz1uZXVcIixcbiAgICAgICAgICAgIFwiRVBTRzoyNTgzMlwiOiBcIitwcm9qPXV0bSArem9uZT0zMiArZWxscHM9R1JTODAgK3Rvd2dzODQ9MCwwLDAsMCwwLDAsMCArdW5pdHM9bSArbm9fZGVmc1wiLFxuICAgICAgICAgICAgLy8gXCJFUFNHOjI1ODMzXCI6IFwiK3Byb2o9dXRtICt6b25lPTMzICtlbGxwcz1HUlM4MCArdG93Z3M4ND0wLDAsMCwwLDAsMCwwICt1bml0cz1tICtub19kZWZzXCJcbiAgICAgICAgfSxcbiAgICAgICAgY29tcG9uZW50OiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY2xhc3M6ICcnLFxuICAgICAgICAgICAgICAgIHNlbGVjdG9yOiBcIlwiXG4gICAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICB9O1xuXG4gICAgLy8gY29uc29sZS5sb2coQ29uZmlndXJhdGlvbik7XG4gICAgZm9yIChjb25zdCBrZXkgaW4gQ29uZmlndXJhdGlvbi5jb25maWcubWFwX2JhY2tncm91bmQpIHtcbiAgICAgICAgbGV0IHdtcyA9IENvbmZpZ3VyYXRpb24uY29uZmlnLm1hcF9iYWNrZ3JvdW5kW2tleV07XG4gICAgICAgIGxldCBsYXllcnMgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBsIGluIHdtcy5sYXllcnMpIHtcbiAgICAgICAgICAgIGxheWVycy5wdXNoKHdtcy5sYXllcnNbbF0pO1xuICAgICAgICB9XG4gICAgICAgIG1ldGFkb3JNYXBDb25maWcuc291cmNlLnB1c2goe1xuICAgICAgICAgICAgJ3R5cGUnOiAnV01TJyxcbiAgICAgICAgICAgICd1cmwnOiB3bXMudXJsLFxuICAgICAgICAgICAgJ3RpdGxlJzogd21zLnRpdGxlLFxuICAgICAgICAgICAgJ29wYWNpdHknOiB3bXMub3BhY2l0eSxcbiAgICAgICAgICAgICd2aXNpYmxlJzogd21zLnZpc2libGUsXG4gICAgICAgICAgICAncGFyYW1zJzoge1xuICAgICAgICAgICAgICAgICdMQVlFUlMnOiBsYXllcnMuam9pbihcIixcIiksXG4gICAgICAgICAgICAgICAgJ1ZFUlNJT04nOiB3bXMudmVyc2lvbixcbiAgICAgICAgICAgICAgICAnRk9STUFUJzogd21zLmZvcm1hdFxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLy8gY29uc29sZS5sb2cobWV0YWRvck1hcENvbmZpZyk7XG4gICAgbGV0IG1ldGFkb3JNYXAgPSBtZXRhZG9yLk9sNE1hcC5jcmVhdGUobWV0YWRvck1hcENvbmZpZyk7XG4gICAgLy8gbWV0YWRvck1hcC5pbml0TGF5ZXJ0cmVlKCk7XG4gICAgbWV0YWRvclsnbWV0YWRvck1hcCddID0gbWV0YWRvck1hcDtcbiAgICAvLyBtZXRhZG9yWydnZW9tTG9hZGVyJ10gPSBuZXcgbWV0YWRvci5HZW9tTG9hZGVyKG1ldGFkb3JNYXAsIDxIVE1MRm9ybUVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2ZpbGUtdXBsb2FkLWZvcm0nKSk7XG59XG5cbm1ldGFkb3JbJ2luaXRNYXAnXSA9IGluaXQ7Il19
