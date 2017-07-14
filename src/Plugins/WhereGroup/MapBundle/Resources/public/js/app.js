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
        onDrawEnd(geoJson);
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
        console.log(e);
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
        proj4Defs: {
            "EPSG:4326": "+proj=longlat +datum=WGS84 +no_defs",
            "EPSG:4258": "+proj=longlat +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +no_defs",
            // "EPSG:31466": "+proj=tmerc +lat_0=0 +lon_0=6 +k=1 +x_0=2500000 +y_0=0 +ellps=bessel +towgs84=598.1,73.7,418.2,0.202,0.045,-2.455,6.7 +units=m +no_defs",
            // "EPSG:31467": "+proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=bessel +towgs84=598.1,73.7,418.2,0.202,0.045,-2.455,6.7 +units=m +no_defs",
            // "EPSG:31468": "+proj=tmerc +lat_0=0 +lon_0=12 +k=1 +x_0=4500000 +y_0=0 +ellps=bessel +towgs84=598.1,73.7,418.2,0.202,0.045,-2.455,6.7 +units=m +no_defs",
            // "EPSG:31469": "+proj=tmerc +lat_0=0 +lon_0=15 +k=1 +x_0=5500000 +y_0=0 +ellps=bessel +towgs84=598.1,73.7,418.2,0.202,0.045,-2.455,6.7 +units=m +no_defs",
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvUGx1Z2lucy9XaGVyZUdyb3VwL01hcEJ1bmRsZS9SZXNvdXJjZXMvdHMvT2w0LnRzIiwic3JjL1BsdWdpbnMvV2hlcmVHcm91cC9NYXBCdW5kbGUvUmVzb3VyY2VzL3RzL2FwcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztBQ09BLElBQUksVUFBVSxHQUFRLE1BQU0sQ0FBQztBQUc3QjtJQUFBO0lBbUZBLENBQUM7SUFsRkc7O09BRUc7SUFDVyw4QkFBcUIsR0FBbkMsVUFBb0MsS0FBYTtRQUM3QyxJQUFJLEdBQUcsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ3RCLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3pDLElBQUksY0FBYyxHQUFHLEtBQUssQ0FBQztRQUMzQixNQUFNLENBQUMsR0FBRyxHQUFHLGNBQWMsR0FBRyxHQUFHLENBQUM7SUFDdEMsQ0FBQztJQUVhLDJCQUFrQixHQUFoQyxVQUFpQyxLQUFhLEVBQUUsTUFBYztRQUMxRCxNQUFNLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQztJQUMxQixDQUFDO0lBRWEsNkJBQW9CLEdBQWxDLFVBQW1DLE1BQWdCLEVBQUUsS0FBYTtRQUM5RCxJQUFJLFdBQVcsR0FBRyxFQUFFLENBQUM7UUFDckIsSUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ25ELEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ3JDLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FB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O0lBQ0QsaUNBQWlDO0lBQ2pDLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFDekQsOEJBQThCO0lBQzlCLE9BQU8sQ0FBQyxZQUFZLENBQUMsR0FBRyxVQUFVLENBQUM7SUFDbkMsNEhBQTRIO0FBRWhJLENBQUM7QUF0RkQsb0JBc0ZDO0FBRUQsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLElBQUksQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgT2JqZWN0ID0gb2wuT2JqZWN0O1xuaW1wb3J0ICogYXMgSHR0cFV0aWxzIGZyb20gJy4vSHR0cFV0aWxzJztcblxuZGVjbGFyZSBjbGFzcyBwcm9qNCB7XG4gICAgc3RhdGljIGRlZnMobmFtZTogc3RyaW5nLCBkZWY6IHN0cmluZyk6IHZvaWQ7XG59XG5cbmxldCB3aW5Db250ZXh0OiBhbnkgPSB3aW5kb3c7XG5kZWNsYXJlIGZ1bmN0aW9uIGFkZFNvdXJjZShpZDogc3RyaW5nLCB0aXRsZTogc3RyaW5nLCB2aXNpYmlsaXR5OiBib29sZWFuLCBvcGFjaXR5OiBudW1iZXIpOiB2b2lkO1xuXG5leHBvcnQgY2xhc3MgT2w0VXRpbHMge1xuICAgIC8qIFxuICAgICAqIHVuaXRzOiAnZGVncmVlcyd8J2Z0J3wnbSd8J3VzLWZ0J1xuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgcmVzb2x1dGlvblNjYWxlRmFjdG9yKHVuaXRzOiBzdHJpbmcpOiBudW1iZXIge1xuICAgICAgICBsZXQgZHBpID0gMjUuNCAvIDAuMjg7XG4gICAgICAgIGxldCBtcHUgPSBvbC5wcm9qLk1FVEVSU19QRVJfVU5JVFt1bml0c107XG4gICAgICAgIGxldCBpbmNoZXNQZXJNZXRlciA9IDM5LjM3O1xuICAgICAgICByZXR1cm4gbXB1ICogaW5jaGVzUGVyTWV0ZXIgKiBkcGk7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyByZXNvbHV0aW9uRm9yU2NhbGUoc2NhbGU6IG51bWJlciwgZmFjdG9yOiBudW1iZXIpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gc2NhbGUgLyBmYWN0b3I7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyByZXNvbHV0aW9uc0ZvclNjYWxlcyhzY2FsZXM6IG51bWJlcltdLCB1bml0czogc3RyaW5nKTogbnVtYmVyW10ge1xuICAgICAgICBsZXQgcmVzb2x1dGlvbnMgPSBbXTtcbiAgICAgICAgbGV0IGZhY3RvciA9IE9sNFV0aWxzLnJlc29sdXRpb25TY2FsZUZhY3Rvcih1bml0cyk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2NhbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICByZXNvbHV0aW9ucy5wdXNoKE9sNFV0aWxzLnJlc29sdXRpb25Gb3JTY2FsZShzY2FsZXNbaV0sIGZhY3RvcikpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXNvbHV0aW9ucztcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIHNjYWxlRm9yUmVzb2x1dGlvbihyZXNvbHV0aW9uOiBudW1iZXIsIGZhY3RvcjogbnVtYmVyKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHJlc29sdXRpb24gKiBmYWN0b3I7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBzY2FsZXNGb3JSZXNvbHV0aW9ucyhyZXNvbHV0aW9uczogbnVtYmVyW10sIHVuaXRzOiBzdHJpbmcpOiBudW1iZXJbXSB7XG4gICAgICAgIGxldCBzY2FsZXMgPSBbXTtcbiAgICAgICAgbGV0IGZhY3RvciA9IE9sNFV0aWxzLnJlc29sdXRpb25TY2FsZUZhY3Rvcih1bml0cyk7XG4gICAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCByZXNvbHV0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgc2NhbGVzLnB1c2goT2w0VXRpbHMuc2NhbGVGb3JSZXNvbHV0aW9uKHJlc29sdXRpb25zW2ldLCBmYWN0b3IpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2NhbGVzO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgaW5pdFByb2o0RGVmcyhwcm9qNERlZnM6IGFueSk6IHZvaWQge1xuICAgICAgICBmb3IgKGNvbnN0IG5hbWUgaW4gcHJvajREZWZzKSB7XG4gICAgICAgICAgICBwcm9qNC5kZWZzKG5hbWUsIHByb2o0RGVmc1tuYW1lXSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGdldFByb2oocHJvakNvZGU6IHN0cmluZyk6IG9sLnByb2ouUHJvamVjdGlvbiB7XG4gICAgICAgIHJldHVybiBvbC5wcm9qLmdldChwcm9qQ29kZSk7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBnZXRTdHlsZShvcHRpb25zOiBhbnksIHN0eWxlOiBvbC5zdHlsZS5TdHlsZSA9IG51bGwpOiBvbC5zdHlsZS5TdHlsZSB7XG4gICAgICAgIGxldCBzdHlsZV8gPSBzdHlsZSA/IHN0eWxlIDogbmV3IG9sLnN0eWxlLlN0eWxlKCk7XG4gICAgICAgIHN0eWxlXy5zZXRGaWxsKG5ldyBvbC5zdHlsZS5GaWxsKG9wdGlvbnNbJ2ZpbGwnXSkpO1xuICAgICAgICBzdHlsZV8uc2V0U3Ryb2tlKG5ldyBvbC5zdHlsZS5TdHJva2Uob3B0aW9uc1snc3Ryb2tlJ10pKTtcbiAgICAgICAgaWYgKG9wdGlvbnNbJ2ltYWdlJ10gJiYgb3B0aW9uc1snaW1hZ2UnXVsnY2lyY2xlJ10pIHtcbiAgICAgICAgICAgIHN0eWxlXy5zZXRJbWFnZShuZXcgb2wuc3R5bGUuQ2lyY2xlKHtcbiAgICAgICAgICAgICAgICAgICAgcmFkaXVzOiBvcHRpb25zWydpbWFnZSddWydjaXJjbGUnXVsncmFkaXVzJ10sXG4gICAgICAgICAgICAgICAgICAgIGZpbGw6IG5ldyBvbC5zdHlsZS5GaWxsKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiBvcHRpb25zWydpbWFnZSddWydjaXJjbGUnXVsnZmlsbCddWydjb2xvciddXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0eWxlXztcbiAgICAgICAgLy9cbiAgICAgICAgLy8gcmV0dXJuIG5ldyBvbC5zdHlsZV8uU3R5bGUoe1xuICAgICAgICAvLyAgICAgZmlsbDogbmV3IG9sLnN0eWxlXy5GaWxsKG9wdGlvbnNbJ2ZpbGwnXSksXG4gICAgICAgIC8vICAgICBzdHJva2U6IG5ldyBvbC5zdHlsZV8uU3Ryb2tlKG9wdGlvbnNbJ3N0cm9rZSddKS8vLFxuICAgICAgICAvLyAgICAgLy8gaW1hZ2U6IG5ldyBvbC5zdHlsZV8uQ2lyY2xlKHtcbiAgICAgICAgLy8gICAgIC8vICAgICByYWRpdXM6IDcsXG4gICAgICAgIC8vICAgICAvLyAgICAgZmlsbDogbmV3IG9sLnN0eWxlXy5GaWxsKG9wdGlvbnNbJ2ZpbGwnXSlcbiAgICAgICAgLy8gICAgIC8vIH0pXG4gICAgICAgIC8vIH0pO1xuICAgIH1cblxuLy8gZmlsbFxuLy8ge1xuLy8gICAgIGNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMilcbi8vIH1cbi8vIHN0cm9rZVxuLy8ge1xuLy8gICAgIGNvbG9yOiAnI2ZmY2MzMycsXG4vLyAgICAgd2lkdGg6IDJcbi8vICAgICBkYXNoOlxuLy8gfVxuLy8gaW1hZ2Vcbn1cblxuZXhwb3J0IGNsYXNzIE9sNEdlb20ge1xuICAgIHByb3RlY3RlZCBnZW9tOiBvbC5nZW9tLkdlb21ldHJ5ID0gbnVsbDtcbiAgICBwcm90ZWN0ZWQgcHJvajogb2wucHJvai5Qcm9qZWN0aW9uID0gbnVsbDtcblxuICAgIGNvbnN0cnVjdG9yKGdlb206IG9sLmdlb20uR2VvbWV0cnksIHByb2o6IG9sLnByb2ouUHJvamVjdGlvbikge1xuICAgICAgICB0aGlzLmdlb20gPSBnZW9tO1xuICAgICAgICB0aGlzLnByb2ogPSBwcm9qO1xuICAgIH1cblxuICAgIGdldEdlb20oKTogb2wuZ2VvbS5HZW9tZXRyeSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdlb207XG4gICAgfVxuXG4gICAgZ2V0UHJvaigpOiBvbC5wcm9qLlByb2plY3Rpb24ge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9qO1xuICAgIH1cblxuICAgIGdldEV4dGVudChwcm9qOiBvbC5wcm9qLlByb2plY3Rpb24pOiBvbC5FeHRlbnQge1xuICAgICAgICBpZiAodGhpcy5wcm9qICE9PSBwcm9qKSB7XG4gICAgICAgICAgICByZXR1cm4gKDxvbC5nZW9tLkdlb21ldHJ5Pig8YW55PiB0aGlzLmdlb20pLmNsb25lKCkpLnRyYW5zZm9ybSh0aGlzLnByb2osIHByb2opLmdldEV4dGVudCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuICg8b2wuZ2VvbS5HZW9tZXRyeT4oPGFueT4gdGhpcy5nZW9tKS5jbG9uZSgpKS5nZXRFeHRlbnQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBnZXRQb2x5Z29uRm9yRXh0ZW50KHByb2o6IG9sLnByb2ouUHJvamVjdGlvbikge1xuICAgICAgICByZXR1cm4gb2wuZ2VvbS5Qb2x5Z29uLmZyb21FeHRlbnQodGhpcy5nZXRFeHRlbnQocHJvaikpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIE9sNEV4dGVudCBleHRlbmRzIE9sNEdlb20ge1xuICAgIHB1YmxpYyBzdGF0aWMgZnJvbUFycmF5KG9yZGluYXRlczogbnVtYmVyW10sIHByb2o6IG9sLnByb2ouUHJvamVjdGlvbik6IE9sNEV4dGVudCB7XG4gICAgICAgIGxldCBnZW9tID0gbmV3IG9sLmdlb20uTXVsdGlQb2ludChbW29yZGluYXRlc1swXSwgb3JkaW5hdGVzWzFdXSwgW29yZGluYXRlc1syXSwgb3JkaW5hdGVzWzNdXV0pO1xuICAgICAgICByZXR1cm4gbmV3IE9sNEV4dGVudChnZW9tLCBwcm9qKTtcbiAgICB9XG59XG5leHBvcnQgY29uc3QgVVVJRDogc3RyaW5nID0gJ3V1aWQnO1xuZXhwb3J0IGNvbnN0IFRJVExFOiBzdHJpbmcgPSAndGl0bGUnO1xuZXhwb3J0IGNvbnN0IE1FVEFET1JfRVBTRzogb2wuUHJvamVjdGlvbkxpa2UgPSAnRVBTRzo0MzI2JztcbmV4cG9ydCBjb25zdCBMQVlFUl9WRUNUT1IgPSAndmVjdG9yJztcbmV4cG9ydCBjb25zdCBMQVlFUl9JTUFHRSA9ICdpbWFnZSc7XG5cbmV4cG9ydCBjbGFzcyBPbDRNYXAge1xuICAgIHByaXZhdGUgc3RhdGljIF91dWlkID0gMDtcbiAgICBwcml2YXRlIHN0YXRpYyBfaW5zdGFuY2U6IE9sNE1hcCA9IG51bGw7IC8vIHNpbmdsZXRvblxuICAgIHByb3RlY3RlZCBvbE1hcDogb2wuTWFwID0gbnVsbDtcbiAgICBwcm90ZWN0ZWQgc2NhbGVzOiBudW1iZXJbXTtcbiAgICAvLyAgICBwcm90ZWN0ZWQgcHJvajogb2wucHJvai5Qcm9qZWN0aW9uID0gbnVsbDtcbiAgICBwcm90ZWN0ZWQgc3RhcnRFeHRlbnQ6IE9sNEV4dGVudCA9IG51bGw7ICAvLyB4bWluLCB5bWluLCB4bWF4LCB5bWF4IG9wdGlvbnNbJ3N0YXJ0RXh0ZW50J11cbiAgICBwcm90ZWN0ZWQgbWF4RXh0ZW50OiBPbDRFeHRlbnQgPSBudWxsO1xuICAgIHByb3RlY3RlZCBkcmF3ZXI6IE9sNERyYXdlcjtcbiAgICBwcm90ZWN0ZWQgc3R5bGVzOiBPYmplY3Q7XG4gICAgcHJvdGVjdGVkIGhnTGF5ZXI6IG9sLmxheWVyLlZlY3RvcjtcbiAgICBwcm90ZWN0ZWQgZHJhZ3pvb206IG9sLmludGVyYWN0aW9uLkRyYWdab29tO1xuXG4gICAgcHJpdmF0ZSBzdGF0aWMgZ2V0VXVpZChwcmVmaXg6IHN0cmluZyA9ICcnKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHByZWZpeCArICgrK09sNE1hcC5fdXVpZCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihvcHRpb25zOiBhbnkpIHsgLy8gc2luZ2xldG9uXG4gICAgICAgIC8vIGluaXQgZ2l2ZW4gY3JzZXNcbiAgICAgICAgLy8gb2xbJ0VOQUJMRV9SQVNURVJfUkVQUk9KRUNUSU9OJ10gPSBmYWxzZTtcbiAgICAgICAgT2w0VXRpbHMuaW5pdFByb2o0RGVmcyhvcHRpb25zWydwcm9qNERlZnMnXSk7XG4gICAgICAgIGxldCBwcm9qOiBvbC5wcm9qLlByb2plY3Rpb24gPSBvbC5wcm9qLmdldChvcHRpb25zWyd2aWV3J11bJ3Byb2plY3Rpb24nXSk7XG4gICAgICAgIHRoaXMuc3R5bGVzID0gb3B0aW9uc1snc3R5bGVzJ107XG4gICAgICAgIHRoaXMuc2NhbGVzID0gb3B0aW9uc1sndmlldyddWydzY2FsZXMnXTtcbiAgICAgICAgdGhpcy5zdGFydEV4dGVudCA9IE9sNEV4dGVudC5mcm9tQXJyYXkob3B0aW9uc1sndmlldyddWydzdGFydEV4dGVudCddLCBwcm9qKTtcbiAgICAgICAgdGhpcy5tYXhFeHRlbnQgPSBPbDRFeHRlbnQuZnJvbUFycmF5KG9wdGlvbnNbJ3ZpZXcnXVsnbWF4RXh0ZW50J10sIHByb2opO1xuICAgICAgICB0aGlzLm9sTWFwID0gbmV3IG9sLk1hcCh7XG4gICAgICAgICAgICB0YXJnZXQ6IG9wdGlvbnNbJ21hcCddWyd0YXJnZXQnXSxcbiAgICAgICAgICAgIHJlbmRlcmVyOiAnY2FudmFzJ1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5vbE1hcC5zZXRWaWV3KFxuICAgICAgICAgICAgbmV3IG9sLlZpZXcoe1xuICAgICAgICAgICAgICAgIHByb2plY3Rpb246IHByb2osXG4gICAgICAgICAgICAgICAgcmVzb2x1dGlvbnM6IE9sNFV0aWxzLnJlc29sdXRpb25zRm9yU2NhbGVzKHRoaXMuc2NhbGVzLCBwcm9qLmdldFVuaXRzKCkpLnJldmVyc2UoKSxcbiAgICAgICAgICAgICAgICBleHRlbnQ6IHRoaXMubWF4RXh0ZW50LmdldEV4dGVudChwcm9qKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICAgICAgLyogbWFrZSBhIGdyb3VwIGxheWVyIGZvciBhbGwgaW1hZ2UgbGF5ZXJzIChXTVMgZXRjLikqL1xuICAgICAgICBsZXQgaW1hZ2VHcm91cCA9IG5ldyBvbC5sYXllci5Hcm91cChcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBsYXllcnM6IG5ldyBvbC5Db2xsZWN0aW9uPG9sLmxheWVyLkJhc2U+KClcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgICAgaW1hZ2VHcm91cC5zZXQoVVVJRCwgTEFZRVJfSU1BR0UpXG4gICAgICAgIHRoaXMub2xNYXAuYWRkTGF5ZXIoaW1hZ2VHcm91cCk7XG4gICAgICAgIC8qIG1ha2UgYSBncm91cCBsYXllciBmb3IgYWxsIHZlY3RvciBsYXllcnMgKEhpZ2h0bGlnaHQsIFNlYXJjaCByZXN1bHRzIGV0Yy4pKi9cbiAgICAgICAgbGV0IHZlY3Rvckdyb3VwID0gbmV3IG9sLmxheWVyLkdyb3VwKFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGxheWVyczogbmV3IG9sLkNvbGxlY3Rpb248b2wubGF5ZXIuQmFzZT4oKVxuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgICB2ZWN0b3JHcm91cC5zZXQoVVVJRCwgTEFZRVJfVkVDVE9SKVxuICAgICAgICB0aGlzLm9sTWFwLmFkZExheWVyKHZlY3Rvckdyb3VwKTtcblxuXG4gICAgICAgIGZvciAobGV0IHNvdXJjZSBvZiBvcHRpb25zWydzb3VyY2UnXSkge1xuICAgICAgICAgICAgdGhpcy5hZGRMYXllckZvck9wdGlvbnMoc291cmNlKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm9sTWFwLmFkZENvbnRyb2wobmV3IG9sLmNvbnRyb2wuU2NhbGVMaW5lKCkpO1xuXG4gICAgICAgIHRoaXMub2xNYXAuYWRkQ29udHJvbChuZXcgb2wuY29udHJvbC5ab29tVG9FeHRlbnQoe1xuICAgICAgICAgICAgZXh0ZW50OiB0aGlzLm1heEV4dGVudC5nZXRFeHRlbnQocHJvailcbiAgICAgICAgfSkpO1xuICAgICAgICB0aGlzLm9sTWFwLmFkZEludGVyYWN0aW9uKG5ldyBvbC5pbnRlcmFjdGlvbi5EcmFnWm9vbSgpKTtcbiAgICAgICAgdGhpcy5vbE1hcC5hZGRDb250cm9sKG5ldyBvbC5jb250cm9sLk1vdXNlUG9zaXRpb24oXG4gICAgICAgICAgICAvLyB7XG4gICAgICAgICAgICAvLyAgICAgY29vcmRpbmF0ZUZvcm1hdDogZnVuY3Rpb24gKGNvb3JkaW5hdGVzKSB7XG4gICAgICAgICAgICAvLyAgICAgICAgIHZhciBjb29yZF94ID0gY29vcmRpbmF0ZXNbMF0udG9GaXhlZCgzKTtcbiAgICAgICAgICAgIC8vICAgICAgICAgdmFyIGNvb3JkX3kgPSBjb29yZGluYXRlc1sxXS50b0ZpeGVkKDMpO1xuICAgICAgICAgICAgLy8gICAgICAgICByZXR1cm4gY29vcmRfeCArICcsICcgKyBjb29yZF95O1xuICAgICAgICAgICAgLy8gICAgIH1cbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgKSk7XG4gICAgICAgIHRoaXMub2xNYXAuZ2V0VmlldygpLmZpdCh0aGlzLnN0YXJ0RXh0ZW50LmdldFBvbHlnb25Gb3JFeHRlbnQocHJvaiksIHRoaXMub2xNYXAuZ2V0U2l6ZSgpKTtcbiAgICAgICAgdGhpcy5oZ0xheWVyID0gdGhpcy5hZGRWZWN0b3JMYXllcihPbDRVdGlscy5nZXRTdHlsZSh0aGlzLnN0eWxlc1snaGlnaGxpZ2h0J10pKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgY3JlYXRlKG9wdGlvbnM6IGFueSk6IE9sNE1hcCB7XG4gICAgICAgIGlmICghT2w0TWFwLl9pbnN0YW5jZSkgey8vIHNpbmdsZXRvblxuICAgICAgICAgICAgT2w0TWFwLl9pbnN0YW5jZSA9IG5ldyBPbDRNYXAob3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE9sNE1hcC5faW5zdGFuY2U7XG4gICAgfVxuXG4gICAgZ2V0RHJhd2VyKCk6IE9sNERyYXdlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmRyYXdlcjtcbiAgICB9XG5cbiAgICBnZXRIZ0xheWVyKCk6IG9sLmxheWVyLlZlY3RvciB7XG4gICAgICAgIHJldHVybiB0aGlzLmhnTGF5ZXI7XG4gICAgfVxuXG5cbiAgICBhZGRMYXllckZvck9wdGlvbnMob3B0aW9uczogYW55KSB7XG4gICAgICAgIGlmIChvcHRpb25zWyd0eXBlJ10gPT09ICdXTVMnKSB7XG4gICAgICAgICAgICBsZXQgd21zTGF5ZXIgPSB0aGlzLmFkZExheWVyKFxuICAgICAgICAgICAgICAgIE9sNFdtc0xheWVyLmNyZWF0ZUxheWVyKG9wdGlvbnNbJ3VybCddLFxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zWydwYXJhbXMnXSxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vbE1hcC5nZXRWaWV3KCkuZ2V0UHJvamVjdGlvbigpLFxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zWyd2aXNpYmxlJ10sXG4gICAgICAgICAgICAgICAgICAgIHBhcnNlRmxvYXQob3B0aW9uc1snb3BhY2l0eSddKSksXG4gICAgICAgICAgICAgICAgb3B0aW9uc1sndGl0bGUnXVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3Iob3B0aW9uc1sndHlwZSddICsgJyBpcyBub3Qgc3VwcG9ydGVkLicpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy9cbiAgICAvLyBpbml0TGF5ZXJ0cmVlKCkge1xuICAgIC8vICAgICBsZXQgbGF5ZXJzID0gdGhpcy5vbE1hcC5nZXRMYXllcnMoKS5nZXRBcnJheSgpO1xuICAgIC8vICAgICBsZXQgbGxlbmd0aCA9IGxheWVycy5sZW5ndGg7XG4gICAgLy8gICAgIGZvciAobGV0IGxheWVyIG9mIGxheWVycykge1xuICAgIC8vICAgICAgICAgbGV0IHNvdXJjZTogb2wuc291cmNlLlNvdXJjZTtcbiAgICAvLyAgICAgICAgIGlmIChsYXllciBpbnN0YW5jZW9mIG9sLmxheWVyLkdyb3VwKSB7IC8vIGluc3RhbmNlIG9mIG9sLmxheWVyLkdyb3VwXG4gICAgLy8gICAgICAgICAgICAgbGV0IHN1YmxheWVycyA9ICg8b2wubGF5ZXIuR3JvdXA+bGF5ZXIpLmdldExheWVycygpLmdldEFycmF5KCk7XG4gICAgLy8gICAgICAgICAgICAgZm9yIChsZXQgc2xheWVyIG9mIHN1YmxheWVycykge1xuICAgIC8vICAgICAgICAgICAgICAgICBpZiAoc2xheWVyIGluc3RhbmNlb2Ygb2wubGF5ZXIuSW1hZ2UpIHsgLy8gYWRkIG9ubHkgaW1hZ2UgbGF5ZXIgKFdNUyBldGMuKVxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgYWRkU291cmNlKHNsYXllci5nZXQoJ3V1aWQnKSwgc2xheWVyLmdldCgndGl0bGUnKSwgc2xheWVyLmdldFZpc2libGUoKSwgc2xheWVyLmdldE9wYWNpdHkoKSk7XG4gICAgLy8gICAgICAgICAgICAgICAgIH1cbiAgICAvLyAgICAgICAgICAgICB9XG4gICAgLy8gICAgICAgICB9IGVsc2UgaWYgKGxheWVyIGluc3RhbmNlb2Ygb2wubGF5ZXIuSW1hZ2UpIHsgLy8gYWRkIG9ubHkgaW1hZ2UgbGF5ZXIgKFdNUyBldGMuKVxuICAgIC8vICAgICAgICAgICAgIGFkZFNvdXJjZShsYXllci5nZXQoJ3V1aWQnKSwgbGF5ZXIuZ2V0KCd0aXRsZScpLCBsYXllci5nZXRWaXNpYmxlKCksIGxheWVyLmdldE9wYWNpdHkoKSk7XG4gICAgLy8gICAgICAgICB9XG4gICAgLy8gICAgIH1cbiAgICAvLyB9XG5cbiAgICBwcml2YXRlIGFkZFRvTGF5ZXJ0cmVlKGxheWVyOiBvbC5sYXllci5JbWFnZSkge1xuICAgICAgICBhZGRTb3VyY2UobGF5ZXIuZ2V0KCd1dWlkJyksIGxheWVyLmdldCgndGl0bGUnKSwgbGF5ZXIuZ2V0VmlzaWJsZSgpLCBsYXllci5nZXRPcGFjaXR5KCkpO1xuICAgIH1cblxuICAgIHNob3dGZWF0dXJlcyh2TGF5ZXI6IG9sLmxheWVyLlZlY3RvciwgZ2VvSnNvbjogT2JqZWN0KSB7XG4gICAgICAgIGxldCBnZW9Kc29uUmVhZGVyOiBvbC5mb3JtYXQuR2VvSlNPTiA9IG5ldyBvbC5mb3JtYXQuR2VvSlNPTigpO1xuICAgICAgICBsZXQgZmVhdHVyZXMgPSBnZW9Kc29uUmVhZGVyLnJlYWRGZWF0dXJlcyhcbiAgICAgICAgICAgIGdlb0pzb24sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgJ2RhdGFQcm9qZWN0aW9uJzogZ2VvSnNvblJlYWRlci5yZWFkUHJvamVjdGlvbihnZW9Kc29uKSxcbiAgICAgICAgICAgICAgICAnZmVhdHVyZVByb2plY3Rpb24nOiB0aGlzLm9sTWFwLmdldFZpZXcoKS5nZXRQcm9qZWN0aW9uKClcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB2TGF5ZXIuZ2V0U291cmNlKCkuYWRkRmVhdHVyZXMoZmVhdHVyZXMpO1xuICAgIH1cblxuICAgIGNsZWFyRmVhdHVyZXModkxheWVyOiBvbC5sYXllci5WZWN0b3IpIHtcbiAgICAgICAgdkxheWVyLmdldFNvdXJjZSgpLmNsZWFyKHRydWUpO1xuICAgIH1cblxuICAgIGFkZFZlY3RvckxheWVyKHN0eWxlOiBvbC5zdHlsZS5TdHlsZSk6IG9sLmxheWVyLlZlY3RvciB7XG4gICAgICAgIGxldCBvcHRpb25zID0ge1xuICAgICAgICAgICAgd3JhcFg6IGZhbHNlXG4gICAgICAgIH07XG4gICAgICAgIGxldCB2TGF5ZXIgPSBuZXcgb2wubGF5ZXIuVmVjdG9yKHtcbiAgICAgICAgICAgIHNvdXJjZTogbmV3IG9sLnNvdXJjZS5WZWN0b3Iob3B0aW9ucyksXG4gICAgICAgICAgICBzdHlsZTogc3R5bGVcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiA8b2wubGF5ZXIuVmVjdG9yPnRoaXMuYWRkTGF5ZXIodkxheWVyKTtcbiAgICB9XG5cbiAgICBhZGRMYXllcihsYXllcjogb2wubGF5ZXIuQmFzZSwgdGl0bGU6IHN0cmluZyA9IG51bGwpOiBvbC5sYXllci5CYXNlIHtcbiAgICAgICAgbGF5ZXIuc2V0KFVVSUQsIE9sNE1hcC5nZXRVdWlkKCdvbGF5LScpKTtcbiAgICAgICAgaWYgKHRpdGxlKSB7XG4gICAgICAgICAgICBsYXllci5zZXQoVElUTEUsIHRpdGxlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobGF5ZXIgaW5zdGFuY2VvZiBvbC5sYXllci5JbWFnZSkge1xuICAgICAgICAgICAgbGV0IGdyb3VwOiBvbC5sYXllci5Hcm91cCA9IDxvbC5sYXllci5Hcm91cD4gdGhpcy5maW5kTGF5ZXIoTEFZRVJfSU1BR0UpO1xuICAgICAgICAgICAgZ3JvdXAuZ2V0TGF5ZXJzKCkuaW5zZXJ0QXQoZ3JvdXAuZ2V0TGF5ZXJzKCkuZ2V0TGVuZ3RoKCksIGxheWVyKTtcbiAgICAgICAgICAgIGFkZFNvdXJjZShsYXllci5nZXQoJ3V1aWQnKSwgbGF5ZXIuZ2V0KCd0aXRsZScpLCBsYXllci5nZXRWaXNpYmxlKCksIGxheWVyLmdldE9wYWNpdHkoKSk7XG4gICAgICAgIH0gZWxzZSBpZiAobGF5ZXIgaW5zdGFuY2VvZiBvbC5sYXllci5WZWN0b3IpIHtcbiAgICAgICAgICAgIGxldCBncm91cDogb2wubGF5ZXIuR3JvdXAgPSA8b2wubGF5ZXIuR3JvdXA+IHRoaXMuZmluZExheWVyKExBWUVSX1ZFQ1RPUik7XG4gICAgICAgICAgICBncm91cC5nZXRMYXllcnMoKS5pbnNlcnRBdChncm91cC5nZXRMYXllcnMoKS5nZXRMZW5ndGgoKSwgbGF5ZXIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsYXllcjtcbiAgICB9XG5cbiAgICByZW1vdmVMYXllcihsYXllcjogb2wubGF5ZXIuQmFzZSk6IHZvaWQge1xuICAgICAgICB0aGlzLm9sTWFwLnJlbW92ZUxheWVyKGxheWVyKTtcbiAgICB9XG5cbiAgICBtb3ZlTGF5ZXIodXVpZDogc3RyaW5nLCBvbGRQb3M6IG51bWJlciwgbmV3UG9zOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgbGV0IGxheWVyOiBvbC5sYXllci5CYXNlID0gdGhpcy5maW5kTGF5ZXIodXVpZCk7XG4gICAgICAgIGlmIChsYXllciBpbnN0YW5jZW9mIG9sLmxheWVyLkltYWdlKSB7XG4gICAgICAgICAgICBsZXQgZ3JvdXA6IG9sLmxheWVyLkdyb3VwID0gPG9sLmxheWVyLkdyb3VwPiB0aGlzLmZpbmRMYXllcihMQVlFUl9JTUFHRSk7XG4gICAgICAgICAgICBsZXQgbGF5ZXJsbCA9IGdyb3VwLmdldExheWVycygpLnJlbW92ZShsYXllcik7XG4gICAgICAgICAgICBncm91cC5nZXRMYXllcnMoKS5pbnNlcnRBdChuZXdQb3MsIGxheWVybGwpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBmaW5kTGF5ZXIodXVpZDogc3RyaW5nKTogb2wubGF5ZXIuQmFzZSB7XG4gICAgICAgIGxldCBsYXllcnMgPSB0aGlzLm9sTWFwLmdldExheWVycygpLmdldEFycmF5KCk7XG4gICAgICAgIGZvciAobGV0IGxheWVyIG9mIGxheWVycykge1xuICAgICAgICAgICAgbGV0IHNvdXJjZTogb2wuc291cmNlLlNvdXJjZTtcbiAgICAgICAgICAgIGlmIChsYXllci5nZXQoVVVJRCkgPT09IHV1aWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbGF5ZXI7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGxheWVyIGluc3RhbmNlb2Ygb2wubGF5ZXIuR3JvdXApIHtcbiAgICAgICAgICAgICAgICBsZXQgc3VibGF5ZXJzID0gKDxvbC5sYXllci5Hcm91cD5sYXllcikuZ2V0TGF5ZXJzKCkuZ2V0QXJyYXkoKTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBzdWJsYXllciBvZiBzdWJsYXllcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN1YmxheWVyLmdldChVVUlEKSA9PT0gdXVpZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN1YmxheWVyO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHVwZGF0ZU1hcCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5vbE1hcC51cGRhdGVTaXplKCk7XG4gICAgfVxuXG4gICAgY2hhbmdlQ3JzKGNyczogc3RyaW5nKSB7IC8vIFRPRE9cbiAgICAgICAgbGV0IHRvUHJvaiA9IG51bGw7XG4gICAgICAgIGlmICgodG9Qcm9qID0gb2wucHJvai5nZXQoY3JzKSkpIHtcbiAgICAgICAgICAgIGxldCBleHRlbnQgPSBPbDRFeHRlbnQuZnJvbUFycmF5KFxuICAgICAgICAgICAgICAgIHRoaXMub2xNYXAuZ2V0VmlldygpLmNhbGN1bGF0ZUV4dGVudCh0aGlzLm9sTWFwLmdldFNpemUoKSksXG4gICAgICAgICAgICAgICAgdGhpcy5vbE1hcC5nZXRWaWV3KCkuZ2V0UHJvamVjdGlvbigpXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgbGV0IGZyb21Qcm9qID0gdGhpcy5vbE1hcC5nZXRWaWV3KCkuZ2V0UHJvamVjdGlvbigpO1xuICAgICAgICAgICAgbGV0IGNlbnRlciA9IHRoaXMub2xNYXAuZ2V0VmlldygpLmdldENlbnRlcigpO1xuICAgICAgICAgICAgbGV0IG5ld1ZpZXcgPSBuZXcgb2wuVmlldyh7XG4gICAgICAgICAgICAgICAgcHJvamVjdGlvbjogdG9Qcm9qLFxuICAgICAgICAgICAgICAgIHJlc29sdXRpb25zOiBPbDRVdGlscy5yZXNvbHV0aW9uc0ZvclNjYWxlcyh0aGlzLnNjYWxlcywgdG9Qcm9qLmdldFVuaXRzKCkpLnJldmVyc2UoKSxcbiAgICAgICAgICAgICAgICBleHRlbnQ6IHRoaXMubWF4RXh0ZW50LmdldEV4dGVudCh0b1Byb2opXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGxldCBsYXllcnMgPSAoPG9sLmxheWVyLkdyb3VwPnRoaXMuZmluZExheWVyKExBWUVSX0lNQUdFKSkuZ2V0TGF5ZXJzKCkuZ2V0QXJyYXkoKTtcbiAgICAgICAgICAgIHRoaXMuY2hhbmdlQ3JzTGlzdCgoPG9sLmxheWVyLkdyb3VwPnRoaXMuZmluZExheWVyKExBWUVSX0lNQUdFKSkuZ2V0TGF5ZXJzKCksIGZyb21Qcm9qLCB0b1Byb2opO1xuICAgICAgICAgICAgdGhpcy5jaGFuZ2VDcnNMaXN0KCg8b2wubGF5ZXIuR3JvdXA+dGhpcy5maW5kTGF5ZXIoTEFZRVJfVkVDVE9SKSkuZ2V0TGF5ZXJzKCksIGZyb21Qcm9qLCB0b1Byb2opO1xuXG4gICAgICAgICAgICB0aGlzLm9sTWFwLnNldFZpZXcobmV3Vmlldyk7XG4gICAgICAgICAgICB0aGlzLm9sTWFwLmdldFZpZXcoKS5maXQoZXh0ZW50LmdldFBvbHlnb25Gb3JFeHRlbnQodG9Qcm9qKSwgdGhpcy5vbE1hcC5nZXRTaXplKCkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjaGFuZ2VDcnNMaXN0KGxheWVyczogb2wuQ29sbGVjdGlvbjxvbC5sYXllci5CYXNlPiwgZnJvbVByb2osIHRvUHJvaikge1xuICAgICAgICBmb3IgKGxldCBsYXllciBvZiBsYXllcnMuZ2V0QXJyYXkoKSkge1xuICAgICAgICAgICAgbGV0IHNvdXJjZTogb2wuc291cmNlLlNvdXJjZTtcbiAgICAgICAgICAgIGlmICgoc291cmNlID0gKDxvbC5sYXllci5MYXllcj5sYXllcikuZ2V0U291cmNlKCkpIGluc3RhbmNlb2Ygb2wuc291cmNlLkltYWdlV01TKSB7XG4gICAgICAgICAgICAgICAgKDxvbC5sYXllci5JbWFnZT5sYXllcikuc2V0U291cmNlKE9sNFdtc0xheWVyLmNyZWF0ZUZyb21Tb3VyY2UoPG9sLnNvdXJjZS5JbWFnZVdNUz4gc291cmNlLCB0b1Byb2opKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoKHNvdXJjZSA9ICg8b2wubGF5ZXIuTGF5ZXI+bGF5ZXIpLmdldFNvdXJjZSgpKSBpbnN0YW5jZW9mIG9sLnNvdXJjZS5WZWN0b3IpIHtcbiAgICAgICAgICAgICAgICBsZXQgZmVhdHVyZXM6IG9sLkZlYXR1cmVbXSA9ICg8b2wuc291cmNlLlZlY3Rvcj5zb3VyY2UpLmdldEZlYXR1cmVzKCk7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgZmVhdHVyZSBvZiBmZWF0dXJlcykge1xuICAgICAgICAgICAgICAgICAgICBmZWF0dXJlLnNldEdlb21ldHJ5KGZlYXR1cmUuZ2V0R2VvbWV0cnkoKS50cmFuc2Zvcm0oZnJvbVByb2osIHRvUHJvaikpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldFZpc2libGUobGF5ZXJVaWlkOiBzdHJpbmcsIHZpc2libGl0eTogYm9vbGVhbik6IHZvaWQge1xuICAgICAgICBsZXQgbGF5ZXI6IG9sLmxheWVyLkJhc2UgPSB0aGlzLmZpbmRMYXllcihsYXllclVpaWQpO1xuICAgICAgICBpZiAobGF5ZXIpIHtcbiAgICAgICAgICAgIGxheWVyLnNldFZpc2libGUodmlzaWJsaXR5KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldE9wYWNpdHkobGF5ZXJVaWlkOiBzdHJpbmcsIG9wYWNpdHk6IG51bWJlcik6IHZvaWQge1xuICAgICAgICBsZXQgbGF5ZXI6IG9sLmxheWVyLkJhc2UgPSB0aGlzLmZpbmRMYXllcihsYXllclVpaWQpO1xuICAgICAgICBpZiAobGF5ZXIpIHtcbiAgICAgICAgICAgIGxheWVyLnNldE9wYWNpdHkob3BhY2l0eSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkcmFnWm9vbShhY3RpdmF0ZTogYm9vbGVhbiwgb25ab29tRW5kOiBGdW5jdGlvbiA9IG51bGwpIHtcbiAgICAgICAgaWYgKCF0aGlzLmRyYWd6b29tKSB7XG4gICAgICAgICAgICB0aGlzLmRyYWd6b29tID0gbmV3IG9sLmludGVyYWN0aW9uLkRyYWdab29tKHtcbiAgICAgICAgICAgICAgICBjb25kaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBsZXQgZHJhZ3pvb20gPSB0aGlzLmRyYWd6b29tO1xuICAgICAgICAgICAgbGV0IG1hcCA9IHRoaXMub2xNYXA7XG4gICAgICAgICAgICB0aGlzLmRyYWd6b29tLm9uKCdib3hlbmQnLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChldmVudDogb2wuaW50ZXJhY3Rpb24uRHJhdy5FdmVudCkge1xuICAgICAgICAgICAgICAgICAgICBtYXAucmVtb3ZlSW50ZXJhY3Rpb24oZHJhZ3pvb20pO1xuICAgICAgICAgICAgICAgICAgICBpZiAob25ab29tRW5kKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvblpvb21FbmQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhY3RpdmF0ZSkge1xuICAgICAgICAgICAgdGhpcy5vbE1hcC5hZGRJbnRlcmFjdGlvbih0aGlzLmRyYWd6b29tKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMub2xNYXAucmVtb3ZlSW50ZXJhY3Rpb24odGhpcy5kcmFnem9vbSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkcmF3R2VvbWV0cnlGb3JTZWFyY2goZ2VvSnNvbjogT2JqZWN0LCBvbkRyYXdFbmQ6IEZ1bmN0aW9uID0gbnVsbCkge1xuICAgICAgICBsZXQgb2w0bWFwID0gdGhpcztcbiAgICAgICAgbGV0IG9sTWFwID0gdGhpcy5vbE1hcDtcbiAgICAgICAgaWYgKCF0aGlzLmRyYXdlcikge1xuICAgICAgICAgICAgbGV0IHZMYXllciA9IHRoaXMuYWRkVmVjdG9yTGF5ZXIoT2w0VXRpbHMuZ2V0U3R5bGUodGhpcy5zdHlsZXNbJ3NlYXJjaCddKSk7XG4gICAgICAgICAgICB2TGF5ZXIuc2V0TWFwKHRoaXMub2xNYXApO1xuICAgICAgICAgICAgdGhpcy5kcmF3ZXIgPSBuZXcgT2w0RHJhd2VyKHZMYXllcik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jbGVhckZlYXR1cmVzKHRoaXMuZHJhd2VyLmdldExheWVyKCkpO1xuICAgICAgICB0aGlzLnNob3dGZWF0dXJlcyh0aGlzLmRyYXdlci5nZXRMYXllcigpLCBnZW9Kc29uKTtcbiAgICAgICAgb25EcmF3RW5kKGdlb0pzb24pO1xuICAgIH1cblxuICAgIGRyYXdTaGFwZUZvclNlYXJjaChzaGFwZVR5cGU6IFNIQVBFUyA9IG51bGwsIG9uRHJhd0VuZDogRnVuY3Rpb24gPSBudWxsKSB7XG4gICAgICAgIGxldCBvbDRtYXAgPSB0aGlzO1xuICAgICAgICBsZXQgb2xNYXAgPSB0aGlzLm9sTWFwO1xuICAgICAgICBpZiAoIXRoaXMuZHJhd2VyKSB7XG4gICAgICAgICAgICBsZXQgdkxheWVyID0gdGhpcy5hZGRWZWN0b3JMYXllcihPbDRVdGlscy5nZXRTdHlsZSh0aGlzLnN0eWxlc1snc2VhcmNoJ10pKTtcbiAgICAgICAgICAgIHZMYXllci5zZXRNYXAodGhpcy5vbE1hcCk7XG4gICAgICAgICAgICB0aGlzLmRyYXdlciA9IG5ldyBPbDREcmF3ZXIodkxheWVyKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzaGFwZTogU0hBUEVTID0gdHlwZW9mIHNoYXBlVHlwZSA9PT0gJ3N0cmluZycgPyBTSEFQRVNbPHN0cmluZz4gc2hhcGVUeXBlXSA6IHNoYXBlVHlwZTtcbiAgICAgICAgaWYgKHRoaXMuZHJhd2VyLmdldEludGVyYWN0aW9uKCkpIHtcbiAgICAgICAgICAgIHRoaXMub2xNYXAucmVtb3ZlSW50ZXJhY3Rpb24odGhpcy5kcmF3ZXIuZ2V0SW50ZXJhY3Rpb24oKSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5kcmF3ZXIuc2V0SW50ZXJhY3Rpb24oc2hhcGUsIE9sNFV0aWxzLmdldFN0eWxlKHRoaXMuc3R5bGVzWydzZWFyY2gnXSkpO1xuICAgICAgICBpZiAodGhpcy5kcmF3ZXIuZ2V0SW50ZXJhY3Rpb24oKSkge1xuICAgICAgICAgICAgbGV0IGRyYXdlciA9IHRoaXMuZHJhd2VyO1xuICAgICAgICAgICAgdGhpcy5nZXREcmF3ZXIoKS5nZXRMYXllcigpLmdldFNvdXJjZSgpLmNsZWFyKCk7XG4gICAgICAgICAgICB0aGlzLm9sTWFwLmFkZEludGVyYWN0aW9uKHRoaXMuZHJhd2VyLmdldEludGVyYWN0aW9uKCkpO1xuICAgICAgICAgICAgdGhpcy5kcmF3ZXIuZ2V0SW50ZXJhY3Rpb24oKS5vbihcbiAgICAgICAgICAgICAgICAnZHJhd3N0YXJ0JyxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICBvbDRtYXAuZ2V0RHJhd2VyKCkuZ2V0TGF5ZXIoKS5nZXRTb3VyY2UoKS5jbGVhcigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICB0aGlzLmRyYXdlci5nZXRJbnRlcmFjdGlvbigpLm9uKFxuICAgICAgICAgICAgICAgICdkcmF3ZW5kJyxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgZ2VvanNvbiA9IG5ldyBvbC5mb3JtYXQuR2VvSlNPTigpLndyaXRlRmVhdHVyZU9iamVjdChcbiAgICAgICAgICAgICAgICAgICAgICAgIGUuZmVhdHVyZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGF0YVByb2plY3Rpb24nOiBNRVRBRE9SX0VQU0csXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2ZlYXR1cmVQcm9qZWN0aW9uJzogb2xNYXAuZ2V0VmlldygpLmdldFByb2plY3Rpb24oKVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICBvbkRyYXdFbmQoZ2VvanNvbik7XG4gICAgICAgICAgICAgICAgICAgIG9sTWFwLnJlbW92ZUludGVyYWN0aW9uKGRyYXdlci5nZXRJbnRlcmFjdGlvbigpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5nZXREcmF3ZXIoKS5nZXRMYXllcigpLmdldFNvdXJjZSgpLmNsZWFyKCk7XG4gICAgICAgICAgICBvbkRyYXdFbmQobnVsbCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBPbDRXbXNMYXllciB7XG4gICAgc3RhdGljIGNyZWF0ZUxheWVyKHVybDogc3RyaW5nLCBwYXJhbXM6IGFueSwgcHJvajogb2wuUHJvamVjdGlvbkxpa2UsIHZpc2libGU6IGJvb2xlYW4sIG9wYWNpdHk6IG51bWJlcik6IG9sLmxheWVyLkltYWdlIHtcbiAgICAgICAgbGV0IHNvdXJjZVdtcyA9IG5ldyBvbC5sYXllci5JbWFnZSh7XG4gICAgICAgICAgICBzb3VyY2U6IE9sNFdtc0xheWVyLmNyZWF0ZVNvdXJjZSh1cmwsIHBhcmFtcywgcHJvaiksXG4gICAgICAgICAgICB2aXNpYmxlOiB2aXNpYmxlLFxuICAgICAgICAgICAgb3BhY2l0eTogb3BhY2l0eVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHNvdXJjZVdtcztcbiAgICB9XG5cbiAgICBzdGF0aWMgY3JlYXRlU291cmNlKHVybDogc3RyaW5nLCBwYXJhbXM6IGFueSwgcHJvajogb2wuUHJvamVjdGlvbkxpa2UpOiBvbC5zb3VyY2UuSW1hZ2VXTVMge1xuICAgICAgICByZXR1cm4gbmV3IG9sLnNvdXJjZS5JbWFnZVdNUyh7XG4gICAgICAgICAgICB1cmw6IHVybCxcbiAgICAgICAgICAgIHBhcmFtczogcGFyYW1zLFxuICAgICAgICAgICAgcHJvamVjdGlvbjogcHJvalxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzdGF0aWMgY3JlYXRlRnJvbVNvdXJjZShzb3VyY2U6IG9sLnNvdXJjZS5JbWFnZVdNUywgcHJvajogb2wuUHJvamVjdGlvbkxpa2UpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBvbC5zb3VyY2UuSW1hZ2VXTVMoe1xuICAgICAgICAgICAgdXJsOiBzb3VyY2UuZ2V0VXJsKCksXG4gICAgICAgICAgICBwYXJhbXM6IHNvdXJjZS5nZXRQYXJhbXMoKSxcbiAgICAgICAgICAgIHByb2plY3Rpb246IHByb2pcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5leHBvcnQgZW51bSBTSEFQRVMge05PTkUsIEJPWCwgUE9MWUdPTn1cbjtcblxuZXhwb3J0IGNsYXNzIE9sNERyYXdlciB7XG4gICAgLy8gcHJpdmF0ZSBzdGF0aWMgX2luc3RhbmNlOiBPbDREcmF3ZXI7XG4gICAgcHJvdGVjdGVkIGxheWVyOiBvbC5sYXllci5WZWN0b3I7XG4gICAgcHJvdGVjdGVkIGludGVyYWN0aW9uOiBvbC5pbnRlcmFjdGlvbi5EcmF3O1xuXG4gICAgY29uc3RydWN0b3IobGF5ZXI6IG9sLmxheWVyLlZlY3Rvcikge1xuICAgICAgICB0aGlzLmxheWVyID0gbGF5ZXI7XG4gICAgfVxuXG4gICAgcHVibGljIGdldExheWVyKCk6IG9sLmxheWVyLlZlY3RvciB7XG4gICAgICAgIHJldHVybiB0aGlzLmxheWVyO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRJbnRlcmFjdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJhY3Rpb247XG4gICAgfVxuXG4gICAgcHVibGljIHNldEludGVyYWN0aW9uKHR5cGU6IFNIQVBFUywgZHJhd1N0eWxlOiBvbC5zdHlsZS5TdHlsZSkge1xuICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgU0hBUEVTLkJPWDpcbiAgICAgICAgICAgICAgICB0aGlzLmludGVyYWN0aW9uID0gbmV3IG9sLmludGVyYWN0aW9uLkRyYXcoe1xuICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IHRoaXMubGF5ZXIuZ2V0U291cmNlKCksXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdDaXJjbGUnLFxuICAgICAgICAgICAgICAgICAgICBzdHlsZTogZHJhd1N0eWxlLFxuICAgICAgICAgICAgICAgICAgICBnZW9tZXRyeUZ1bmN0aW9uOiBjcmVhdGVCb3goKSAvLyBvbC5kLnRzIGhhcyBubyBmdW5jdGlvbiBcIm9sLmludGVyYWN0aW9uLkRyYXcuY3JlYXRlQm94KClcIlxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBTSEFQRVMuUE9MWUdPTjpcbiAgICAgICAgICAgICAgICB0aGlzLmludGVyYWN0aW9uID0gbmV3IG9sLmludGVyYWN0aW9uLkRyYXcoe1xuICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IHRoaXMubGF5ZXIuZ2V0U291cmNlKCksXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdQb2x5Z29uJyxcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IGRyYXdTdHlsZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aGlzLmludGVyYWN0aW9uID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBvbC5kLnRzIGhhcyBubyBmdW5jdGlvbiBcIm9sLmludGVyYWN0aW9uLkRyYXcuY3JlYXRlQm94KClcIlxuICogQHJldHVybnMgeyhjb29yZGluYXRlczphbnksIG9wdF9nZW9tZXRyeTphbnkpPT5hbnl8b2wuZ2VvbS5Qb2x5Z29ufVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQm94KCkge1xuICAgIHJldHVybiAoXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0ge29sLkNvb3JkaW5hdGV8QXJyYXkuPG9sLkNvb3JkaW5hdGU+fEFycmF5LjxBcnJheS48b2wuQ29vcmRpbmF0ZT4+fSBjb29yZGluYXRlc1xuICAgICAgICAgKiBAcGFyYW0ge29sLmdlb20uU2ltcGxlR2VvbWV0cnk9fSBvcHRfZ2VvbWV0cnlcbiAgICAgICAgICogQHJldHVybiB7b2wuZ2VvbS5TaW1wbGVHZW9tZXRyeX1cbiAgICAgICAgICovXG4gICAgICAgICAgICBmdW5jdGlvbiAoY29vcmRpbmF0ZXMsIG9wdF9nZW9tZXRyeSkge1xuICAgICAgICAgICAgdmFyIGV4dGVudCA9IG9sLmV4dGVudC5ib3VuZGluZ0V4dGVudChjb29yZGluYXRlcyk7XG4gICAgICAgICAgICB2YXIgZ2VvbWV0cnkgPSBvcHRfZ2VvbWV0cnkgfHwgbmV3IG9sLmdlb20uUG9seWdvbihudWxsKTtcbiAgICAgICAgICAgIGdlb21ldHJ5LnNldENvb3JkaW5hdGVzKFtbXG4gICAgICAgICAgICAgICAgb2wuZXh0ZW50LmdldEJvdHRvbUxlZnQoZXh0ZW50KSxcbiAgICAgICAgICAgICAgICBvbC5leHRlbnQuZ2V0Qm90dG9tUmlnaHQoZXh0ZW50KSxcbiAgICAgICAgICAgICAgICBvbC5leHRlbnQuZ2V0VG9wUmlnaHQoZXh0ZW50KSxcbiAgICAgICAgICAgICAgICBvbC5leHRlbnQuZ2V0VG9wTGVmdChleHRlbnQpLFxuICAgICAgICAgICAgICAgIG9sLmV4dGVudC5nZXRCb3R0b21MZWZ0KGV4dGVudClcbiAgICAgICAgICAgIF1dKTtcbiAgICAgICAgICAgIHJldHVybiBnZW9tZXRyeTtcbiAgICAgICAgfVxuICAgICk7XG59O1xuXG5cblxuXG5cbmV4cG9ydCBjbGFzcyBVaVV0aWxzIHtcblxufVxuXG5leHBvcnQgY2xhc3MgR2VvbUxvYWRlciB7XG4gICAgcHJpdmF0ZSBtYXA6IE9sNE1hcDtcbiAgICBwcml2YXRlIGZvcm06IEhUTUxGb3JtRWxlbWVudDtcblxuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcihtYXA6IE9sNE1hcCwgZm9ybTogSFRNTEZvcm1FbGVtZW50KSB7XG4gICAgICAgIHRoaXMubWFwID0gbWFwO1xuICAgICAgICB0aGlzLmZvcm0gPSBmb3JtO1xuICAgICAgICB0aGlzLm9uKCk7XG4gICAgfVxuXG4gICAgcHVibGljIG9uKCkge1xuICAgICAgICB0aGlzLmZvcm0uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgdGhpcy51cGxvYWQuYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgIH1cblxuICAgIHByaXZhdGUgdXBsb2FkKGU6IEV2ZW50KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgICAvLyBIdHRwVXRpbHMuSHR0cC5zZW5kRm9ybSh0aGlzLmZvcm0sIHRoaXMuZm9ybS5hY3Rpb24sIEh0dHBVdGlscy5IVFRQX01FVEhPRC5QT1NULCBIdHRwVXRpbHMuSFRUUF9EQVRBVFlQRS5qc29uKVxuICAgICAgICAvLyAgICAgLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIC8vICAgICAgICAgY29uc29sZS5sb2coJ0NvbnRlbnRzOiAnICsgdmFsdWUpO1xuICAgICAgICAvLyAgICAgfSlcbiAgICAgICAgLy8gICAgIC5jYXRjaChmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgIC8vICAgICAgICAgY29uc29sZS5lcnJvcihyZWFzb24pO1xuICAgICAgICAvLyAgICAgfSk7XG4gICAgfVxufSIsImltcG9ydCAqIGFzIG1ldGFkb3IgZnJvbSAnLi9PbDQnO1xuXG5kZWNsYXJlIHZhciBDb25maWd1cmF0aW9uOiBhbnk7XG5cbmxldCBjb250ZXh0OiBhbnkgPSBXaW5kb3c7XG5jb250ZXh0Lm1ldGFkb3IgPSBtZXRhZG9yO1xuXG5leHBvcnQgZnVuY3Rpb24gaW5pdCgpIHtcblxuICAgIHZhciBtZXRhZG9yTWFwQ29uZmlnID0ge1xuICAgICAgICBtYXA6IHtcbiAgICAgICAgICAgIHRhcmdldDogJ21hcCcsXG4gICAgICAgICAgICBzcnM6IFtcIkVQU0c6NDMyNlwiLCBcIkVQU0c6MzE0NjZcIiwgXCJFUFNHOjI1ODMyXCJdXG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IHtcbiAgICAgICAgICAgIHByb2plY3Rpb246IENvbmZpZ3VyYXRpb24uc2V0dGluZ3NbJ21hcF9jcnMnXSwvLyc6ICc5LDQ5LDExLDUzJywgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1xuICAgICAgICAgICAgbWF4RXh0ZW50OiBDb25maWd1cmF0aW9uLnNldHRpbmdzWydtYXBfYmJveF9tYXgnXS5zcGxpdCgvLFxccz8vKSwvL1s1LjgsIDQ3LjAsIDE1LjAsIDU1LjBdLCAvLyBwcmlvcml0eSBmb3Igc2NhbGVzIG9yIGZvciBtYXhFeHRlbnQ/XG4gICAgICAgICAgICBzdGFydEV4dGVudDogQ29uZmlndXJhdGlvbi5zZXR0aW5nc1snbWFwX2Jib3hfc3RhcnQnXS5zcGxpdCgvLFxccz8vKSxcbiAgICAgICAgICAgIHNjYWxlczogWzUwMDAsIDI1MDAwLCA1MDAwMCwgMTAwMDAwLCAyMDAwMDAsIDI1MDAwMCwgNTAwMDAwLCAxMDAwMDAwLCAyMDAwMDAwLCA1MDAwMDAwLCAxMDAwMDAwMF0vLywgMjAwMDAwMDAsIDUwMDAwMDAwXVxuICAgICAgICB9LFxuICAgICAgICBzdHlsZXM6IHtcbiAgICAgICAgICAgIGhpZ2hsaWdodDoge1xuICAgICAgICAgICAgICAgIGZpbGw6IHtcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICdyZ2JhKDYwLCA2MCwgMjU1LCAwLjEpJ1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc3Ryb2tlOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiAncmdiYSg2MCwgNjAsIDI1NSwgMS4wKScsXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAyXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNlYXJjaDoge1xuICAgICAgICAgICAgICAgIGZpbGw6IHtcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICdyZ2JhKDI1NSwgNjAsIDYwLCAwLjEpJ1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc3Ryb2tlOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiAncmdiYSgyNTUsIDYwLCA2MCwgMS4wKScsXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAyXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBpbWFnZToge1xuICAgICAgICAgICAgICAgICAgICBjaXJjbGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJhZGl1czogNSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGw6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogJ3JnYmEoMjU1LCA2MCwgNjAsIDAuNiknXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHNvdXJjZTogW10sXG4gICAgICAgIHByb2o0RGVmczoge1xuICAgICAgICAgICAgXCJFUFNHOjQzMjZcIjogXCIrcHJvaj1sb25nbGF0ICtkYXR1bT1XR1M4NCArbm9fZGVmc1wiLFxuICAgICAgICAgICAgXCJFUFNHOjQyNThcIjogXCIrcHJvaj1sb25nbGF0ICtlbGxwcz1HUlM4MCArdG93Z3M4ND0wLDAsMCwwLDAsMCwwICtub19kZWZzXCIsXG4gICAgICAgICAgICAvLyBcIkVQU0c6MzE0NjZcIjogXCIrcHJvaj10bWVyYyArbGF0XzA9MCArbG9uXzA9NiAraz0xICt4XzA9MjUwMDAwMCAreV8wPTAgK2VsbHBzPWJlc3NlbCArdG93Z3M4ND01OTguMSw3My43LDQxOC4yLDAuMjAyLDAuMDQ1LC0yLjQ1NSw2LjcgK3VuaXRzPW0gK25vX2RlZnNcIixcbiAgICAgICAgICAgIC8vIFwiRVBTRzozMTQ2N1wiOiBcIitwcm9qPXRtZXJjICtsYXRfMD0wICtsb25fMD05ICtrPTEgK3hfMD0zNTAwMDAwICt5XzA9MCArZWxscHM9YmVzc2VsICt0b3dnczg0PTU5OC4xLDczLjcsNDE4LjIsMC4yMDIsMC4wNDUsLTIuNDU1LDYuNyArdW5pdHM9bSArbm9fZGVmc1wiLFxuICAgICAgICAgICAgLy8gXCJFUFNHOjMxNDY4XCI6IFwiK3Byb2o9dG1lcmMgK2xhdF8wPTAgK2xvbl8wPTEyICtrPTEgK3hfMD00NTAwMDAwICt5XzA9MCArZWxscHM9YmVzc2VsICt0b3dnczg0PTU5OC4xLDczLjcsNDE4LjIsMC4yMDIsMC4wNDUsLTIuNDU1LDYuNyArdW5pdHM9bSArbm9fZGVmc1wiLFxuICAgICAgICAgICAgLy8gXCJFUFNHOjMxNDY5XCI6IFwiK3Byb2o9dG1lcmMgK2xhdF8wPTAgK2xvbl8wPTE1ICtrPTEgK3hfMD01NTAwMDAwICt5XzA9MCArZWxscHM9YmVzc2VsICt0b3dnczg0PTU5OC4xLDczLjcsNDE4LjIsMC4yMDIsMC4wNDUsLTIuNDU1LDYuNyArdW5pdHM9bSArbm9fZGVmc1wiLFxuICAgICAgICAgICAgXCJFUFNHOjI1ODMyXCI6IFwiK3Byb2o9dXRtICt6b25lPTMyICtlbGxwcz1HUlM4MCArdG93Z3M4ND0wLDAsMCwwLDAsMCwwICt1bml0cz1tICtub19kZWZzXCIsXG4gICAgICAgICAgICAvLyBcIkVQU0c6MjU4MzNcIjogXCIrcHJvaj11dG0gK3pvbmU9MzMgK2VsbHBzPUdSUzgwICt0b3dnczg0PTAsMCwwLDAsMCwwLDAgK3VuaXRzPW0gK25vX2RlZnNcIlxuICAgICAgICB9LFxuICAgICAgICBjb21wb25lbnQ6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjbGFzczogJycsXG4gICAgICAgICAgICAgICAgc2VsZWN0b3I6IFwiXCJcbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH07XG5cbiAgICAvLyBjb25zb2xlLmxvZyhDb25maWd1cmF0aW9uKTtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBDb25maWd1cmF0aW9uLmNvbmZpZy5tYXBfYmFja2dyb3VuZCkge1xuICAgICAgICBsZXQgd21zID0gQ29uZmlndXJhdGlvbi5jb25maWcubWFwX2JhY2tncm91bmRba2V5XTtcbiAgICAgICAgbGV0IGxheWVycyA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IGwgaW4gd21zLmxheWVycykge1xuICAgICAgICAgICAgbGF5ZXJzLnB1c2god21zLmxheWVyc1tsXSk7XG4gICAgICAgIH1cbiAgICAgICAgbWV0YWRvck1hcENvbmZpZy5zb3VyY2UucHVzaCh7XG4gICAgICAgICAgICAndHlwZSc6ICdXTVMnLFxuICAgICAgICAgICAgJ3VybCc6IHdtcy51cmwsXG4gICAgICAgICAgICAndGl0bGUnOiB3bXMudGl0bGUsXG4gICAgICAgICAgICAnb3BhY2l0eSc6IHdtcy5vcGFjaXR5LFxuICAgICAgICAgICAgJ3Zpc2libGUnOiB3bXMudmlzaWJsZSxcbiAgICAgICAgICAgICdwYXJhbXMnOiB7XG4gICAgICAgICAgICAgICAgJ0xBWUVSUyc6IGxheWVycy5qb2luKFwiLFwiKSxcbiAgICAgICAgICAgICAgICAnVkVSU0lPTic6IHdtcy52ZXJzaW9uLFxuICAgICAgICAgICAgICAgICdGT1JNQVQnOiB3bXMuZm9ybWF0XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvLyBjb25zb2xlLmxvZyhtZXRhZG9yTWFwQ29uZmlnKTtcbiAgICBsZXQgbWV0YWRvck1hcCA9IG1ldGFkb3IuT2w0TWFwLmNyZWF0ZShtZXRhZG9yTWFwQ29uZmlnKTtcbiAgICAvLyBtZXRhZG9yTWFwLmluaXRMYXllcnRyZWUoKTtcbiAgICBtZXRhZG9yWydtZXRhZG9yTWFwJ10gPSBtZXRhZG9yTWFwO1xuICAgIC8vIG1ldGFkb3JbJ2dlb21Mb2FkZXInXSA9IG5ldyBtZXRhZG9yLkdlb21Mb2FkZXIobWV0YWRvck1hcCwgPEhUTUxGb3JtRWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZmlsZS11cGxvYWQtZm9ybScpKTtcblxufVxuXG5tZXRhZG9yWydpbml0TWFwJ10gPSBpbml0O1xuIl19
