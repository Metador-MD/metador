(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dom_1 = require("./dom");
var Ol4_1 = require("./Ol4");
var LayerTree = (function () {
    function LayerTree(ol4Map) {
        this.currentLayer = null;
        this.oldPosition = 0;
        this.ol4Map = ol4Map;
        this.tree = dom_1.dom.findFirst(LayerTree.treeselector);
        if (LayerTree.useSortable) {
            var dummy = dom_1.dom.findFirst(LayerTree.dummyselector, this.tree);
            this.addDraggableEventListener(dummy, true);
        }
    }
    LayerTree.create = function (ol4Map) {
        if (!LayerTree._instance) {
            LayerTree._instance = new LayerTree(ol4Map);
        }
        return LayerTree._instance;
    };
    LayerTree.prototype.substringTitle = function (text) {
        if (text.length > LayerTree.maxlength) {
            text = text.substring(0, LayerTree.maxlength);
            if (text.lastIndexOf(' ') > 0) {
                text = text.substring(0, text.lastIndexOf(' '));
            }
        }
        return text;
    };
    LayerTree.prototype.add = function (layer) {
        var layerNode = dom_1.dom.create('li', { 'id': layer.get(Ol4_1.UUID), 'draggable': "true" }, ['draggable', '-js-draggable']);
        if (LayerTree.useVisible) {
            this.addVisible(layerNode, layer);
        }
        layerNode.appendChild(dom_1.dom.create('label', { 'id': layer.get(Ol4_1.UUID), 'for': 'chb-' + layer.get(Ol4_1.UUID), 'title': layer.get(Ol4_1.TITLE) }, ['form-label'], this.substringTitle(layer.get(Ol4_1.TITLE))));
        if (LayerTree.useOpacity) {
            this.addOpacity(layerNode, layer);
        }
        this.tree.insertBefore(layerNode, dom_1.dom.findFirst('li', this.tree));
        if (LayerTree.useSortable) {
            this.addDraggableEventListener(layerNode);
        }
    };
    LayerTree.prototype.addVisible = function (layerNode, layer) {
        var input = dom_1.dom.create('input', { 'type': 'checkbox' }, ['check', '-js-map-source-visible']);
        input.checked = layer.getVisible();
        input.addEventListener('change', this.changeVisible.bind(this), false);
        layerNode.appendChild(input);
    };
    LayerTree.prototype.changeVisible = function (e) {
        this.ol4Map.setVisible(e.target.parentElement.id, e.target.checked);
    };
    LayerTree.prototype.addOpacity = function (layerNode, layer) {
        var select = dom_1.dom.create('select', {}, ['input-element', 'medium', 'simple', 'js-map-source-opacity', '-js-map-source-opacity']);
        for (var i = 0; i <= 10; i++) {
            select.appendChild(dom_1.dom.create('option', { 'value': i / 10 }, [], (i * 10) + ' %'));
        }
        select.value = layer.getOpacity().toString();
        select.addEventListener('change', this.changeOpacity.bind(this), false);
        layerNode.appendChild(select);
    };
    LayerTree.prototype.changeOpacity = function (e) {
        this.ol4Map.setOpacity(e.target.parentElement.id, parseFloat(e.target.value));
    };
    LayerTree.prototype.addDraggableEventListener = function (layer, isDummy) {
        if (isDummy === void 0) { isDummy = false; }
        if (!isDummy) {
            layer.addEventListener('dragstart', this.dragStart.bind(this), false);
            layer.addEventListener('dragend', this.dragEnd.bind(this), false);
        }
        layer.addEventListener('dragenter', this.dragEnter.bind(this), false);
        layer.addEventListener('dragover', this.dragOver.bind(this), false);
        layer.addEventListener('drop', this.dragDrop.bind(this), false);
    };
    LayerTree.prototype.dragStart = function (e) {
        this.currentLayer = e.target;
        this.oldPosition = this.getLayerPosition(this.currentLayer);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.currentLayer.innerHTML);
        dom_1.dom.addClass(this.currentLayer, "move");
    };
    LayerTree.prototype.dragOver = function (e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        e.dataTransfer.dropEffect = 'move';
        return false;
    };
    LayerTree.prototype.dragEnter = function (e) {
        if (this.currentLayer !== e.toElement) {
            this.tree.insertBefore(this.currentLayer, e.toElement.draggable ? e.toElement : e.toElement.parentElement);
        }
    };
    LayerTree.prototype.dragDrop = function (e) {
        e.stopPropagation();
        e.preventDefault();
        dom_1.dom.removeClass(e.target, "over");
    };
    LayerTree.prototype.dragEnd = function (e) {
        dom_1.dom.removeClass(e.target, "move");
        this.ol4Map.moveLayer(this.currentLayer.id, this.oldPosition, this.getLayerPosition(this.currentLayer));
    };
    LayerTree.prototype.getLayerPosition = function (layer) {
        var list = document.querySelectorAll('.-js-map-layertree ul .-js-draggable');
        for (var i = 0; i < list.length; i++) {
            if (list[i].id === layer.id) {
                return list.length - 1 - i;
            }
        }
        return null;
    };
    LayerTree.maxlength = 16;
    LayerTree.treeselector = '.-js-map-layertree ul.layer-tree-list';
    LayerTree.dummyselector = '.-js-dummy-layer';
    LayerTree.useOpacity = true;
    LayerTree.useVisible = true;
    LayerTree.useSortable = true;
    LayerTree.showStatus = true;
    return LayerTree;
}());
exports.LayerTree = LayerTree;

},{"./Ol4":2,"./dom":4}],2:[function(require,module,exports){
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
var LayerTree_1 = require("./LayerTree");
var Ol4Source_1 = require("./Ol4Source");
var Ol4Utils = (function () {
    function Ol4Utils() {
    }
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
exports.LAYER_UUID = 'layeruuid';
exports.TITLE = 'title';
exports.METADOR_EPSG = 'EPSG:4326';
exports.LAYER_VECTOR = 'vector';
exports.LAYER_IMAGE = 'image';
var Ol4Map = (function () {
    function Ol4Map(options) {
        this.olMap = null;
        this.startExtent = null;
        this.maxExtent = null;
        Ol4Utils.initProj4Defs(options['proj4Defs']);
        this.layertree = LayerTree_1.LayerTree.create(this);
        this.wmsSource = Ol4Source_1.Ol4WmsSource.create(this, true, this.layertree);
        this.vecSource = Ol4Source_1.Ol4VectorSource.create(this);
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
        var imageGroup = new ol.layer.Group({
            layers: new ol.Collection()
        });
        imageGroup.set(exports.UUID, exports.LAYER_IMAGE);
        this.olMap.addLayer(imageGroup);
        var vectorGroup = new ol.layer.Group({
            layers: new ol.Collection()
        });
        vectorGroup.set(exports.UUID, exports.LAYER_VECTOR);
        this.olMap.addLayer(vectorGroup);
        for (var _i = 0, _a = options['source']; _i < _a.length; _i++) {
            var sourceOptions = _a[_i];
            if (sourceOptions['type'] === 'WMS') {
                var wmsLayer = this.addLayer(this.wmsSource.createLayer(Ol4Map.getUuid('olay-'), sourceOptions, this.olMap.getView().getProjection(), sourceOptions['visible'], parseFloat(sourceOptions['opacity'])));
            }
            else {
                console.error(sourceOptions['type'] + ' is not supported.');
            }
        }
        this.olMap.addControl(new ol.control.ScaleLine());
        this.olMap.addControl(new ol.control.ZoomToExtent({
            extent: this.maxExtent.getExtent(proj)
        }));
        this.olMap.addInteraction(new ol.interaction.DragZoom());
        this.olMap.addControl(new ol.control.MousePosition());
        this.zoomToExtent(this.startExtent.getPolygonForExtent(proj));
        var hgl = this.vecSource.createLayer(Ol4Map.getUuid('olay-'), { 'style': Ol4Utils.getStyle(this.styles['highlight']) }, this.olMap.getView().getProjection());
        this.hgLayer = this.addLayer(hgl);
        var vLayer = this.addLayer(this.vecSource.createLayer(Ol4Map.getUuid('olay-'), { 'style': Ol4Utils.getStyle(this.styles['search']) }, this.olMap.getView().getProjection()));
        vLayer.setMap(this.olMap);
        this.drawer = new Ol4Drawer(vLayer);
    }
    Ol4Map.getUuid = function (prefix) {
        if (prefix === void 0) { prefix = ''; }
        return prefix + (++Ol4Map._uuid);
    };
    Ol4Map.prototype.zoomToExtent = function (geometry) {
        this.olMap.getView().fit(geometry, this.olMap.getSize());
    };
    Ol4Map.create = function (options) {
        if (!Ol4Map._instance) {
            Ol4Map._instance = new Ol4Map(options);
        }
        return Ol4Map._instance;
    };
    Ol4Map.prototype.getProjection = function () {
        return this.olMap.getView().getProjection();
    };
    Ol4Map.prototype.getDrawer = function () {
        return this.drawer;
    };
    Ol4Map.prototype.getHgLayer = function () {
        return this.hgLayer;
    };
    Ol4Map.prototype.addLayer = function (layer) {
        if (layer instanceof ol.layer.Image) {
            var group = this.findLayer(exports.LAYER_IMAGE);
            group.getLayers().insertAt(group.getLayers().getLength(), layer);
            return layer;
        }
        else if (layer instanceof ol.layer.Vector) {
            var group = this.findLayer(exports.LAYER_VECTOR);
            group.getLayers().insertAt(group.getLayers().getLength(), layer);
            return layer;
        }
        return null;
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
            var extent = Ol4Extent.fromArray(this.olMap.getView().calculateExtent(this.olMap.getSize()), this.getProjection());
            var fromProj = this.getProjection();
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
            this.zoomToExtent(extent.getPolygonForExtent(toProj));
        }
    };
    Ol4Map.prototype.changeCrsList = function (layers, fromProj, toProj) {
        for (var _i = 0, _a = layers.getArray(); _i < _a.length; _i++) {
            var layer = _a[_i];
            var source = void 0;
            if ((source = layer.getSource()) instanceof ol.source.ImageWMS) {
                this.wmsSource.refreshSource(layer, fromProj, toProj);
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
        this.vecSource.clearFeatures(this.drawer.getLayer());
        this.vecSource.showFeatures(this.drawer.getLayer(), geoJson);
        if (onDrawEnd !== null) {
            onDrawEnd(geoJson);
        }
        this.zoomToExtent(this.drawer.getLayer().getSource().getExtent());
    };
    Ol4Map.prototype.drawShapeForSearch = function (shapeType, onDrawEnd) {
        if (shapeType === void 0) { shapeType = null; }
        if (onDrawEnd === void 0) { onDrawEnd = null; }
        var ol4map = this;
        var olMap = this.olMap;
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
                    'featureProjection': ol4map.getProjection()
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
    Ol4Map._uuid = 0;
    Ol4Map._instance = null;
    return Ol4Map;
}());
exports.Ol4Map = Ol4Map;
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
                    geometryFunction: createBox()
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
function createBox() {
    return (function (coordinates, opt_geometry) {
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
    };
    return GeomLoader;
}());
exports.GeomLoader = GeomLoader;

},{"./LayerTree":1,"./Ol4Source":3}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Ol4_1 = require("./Ol4");
var Ol4Source = (function () {
    function Ol4Source() {
    }
    return Ol4Source;
}());
exports.Ol4Source = Ol4Source;
var Ol4VectorSource = (function () {
    function Ol4VectorSource(ol4Map) {
        this.showable = false;
        this.ol4Map = ol4Map;
    }
    Ol4VectorSource.create = function (ol4map) {
        if (!Ol4VectorSource._instance) {
            Ol4VectorSource._instance = new Ol4VectorSource(ol4map);
        }
        return Ol4VectorSource._instance;
    };
    Ol4VectorSource.prototype.createLayer = function (layerUuid, options, proj, visible, opacity) {
        if (visible === void 0) { visible = true; }
        if (opacity === void 0) { opacity = 1.0; }
        var vLayer = new ol.layer.Vector({
            source: new ol.source.Vector({ wrapX: false }),
            style: options['style']
        });
        vLayer.set(Ol4_1.UUID, layerUuid);
        return vLayer;
    };
    Ol4VectorSource.prototype.refreshSource = function (layer, fromProj, toProj) {
        var source = layer.getSource();
        var features = source.getFeatures();
        for (var _i = 0, features_1 = features; _i < features_1.length; _i++) {
            var feature = features_1[_i];
            feature.setGeometry(feature.getGeometry().transform(fromProj, toProj));
        }
    };
    Ol4VectorSource.prototype.showFeatures = function (vLayer, geoJson) {
        var geoJsonReader = new ol.format.GeoJSON();
        var dataproj = geoJsonReader.readProjection(geoJson);
        var features = geoJsonReader.readFeatures(geoJson, {
            'dataProjection': geoJsonReader.readProjection(geoJson),
            'featureProjection': this.ol4Map.getProjection()
        });
        vLayer.getSource().addFeatures(features);
    };
    Ol4VectorSource.prototype.clearFeatures = function (vLayer) {
        vLayer.getSource().clear(true);
    };
    return Ol4VectorSource;
}());
exports.Ol4VectorSource = Ol4VectorSource;
var Ol4WmsSource = (function () {
    function Ol4WmsSource(ol4Map, useLoadEvents, layertree) {
        if (useLoadEvents === void 0) { useLoadEvents = true; }
        if (layertree === void 0) { layertree = null; }
        this.ol4Map = ol4Map;
        this.useLoadEvents = useLoadEvents;
        this.layertree = layertree;
    }
    Ol4WmsSource.create = function (ol4Map, useLoadEvents, layertree) {
        if (useLoadEvents === void 0) { useLoadEvents = true; }
        if (layertree === void 0) { layertree = null; }
        if (!Ol4WmsSource._instance) {
            Ol4WmsSource._instance = new Ol4WmsSource(ol4Map, useLoadEvents, layertree);
        }
        return Ol4WmsSource._instance;
    };
    Ol4WmsSource.prototype.createLayer = function (layerUuid, options, proj, visible, opacity) {
        if (options === void 0) { options = null; }
        var source = this.createSource(layerUuid, options['url'], options['params'], proj);
        var sourceWms = new ol.layer.Image({
            source: source,
            visible: visible,
            opacity: opacity
        });
        sourceWms.set(Ol4_1.UUID, layerUuid);
        if (options['title']) {
            sourceWms.set(Ol4_1.TITLE, options['title']);
        }
        if (this.layertree !== null) {
            this.layertree.add(sourceWms);
        }
        return sourceWms;
    };
    Ol4WmsSource.prototype.createSource = function (layerUuid, url, params, proj) {
        var source = new ol.source.ImageWMS({
            url: url,
            params: params,
            projection: proj
        });
        source.set(Ol4_1.LAYER_UUID, layerUuid);
        this.setLoadEvents(source);
        return source;
    };
    Ol4WmsSource.prototype.refreshSource = function (layer, fromProj, toProj) {
        var oldsource = layer.getSource();
        layer.setSource(this.createSource(layer.get(Ol4_1.UUID), oldsource.getUrl(), oldsource.getParams(), toProj));
    };
    Ol4WmsSource.prototype.setLoadEvents = function (source) {
        if (this.useLoadEvents) {
            source.on('imageloadstart', Ol4WmsSource.imageLoadStart);
            source.on('imageloadend', Ol4WmsSource.imageLoadEnd);
            source.on('imageloaderror', Ol4WmsSource.imageLoadError);
        }
    };
    Ol4WmsSource.imageLoadStart = function (e) {
        console.log('start', e.target.get(Ol4_1.LAYER_UUID));
    };
    Ol4WmsSource.imageLoadEnd = function (e) {
        console.log('end', e.target.get(Ol4_1.LAYER_UUID));
    };
    Ol4WmsSource.imageLoadError = function (e) {
        console.log('error', e.target.get(Ol4_1.LAYER_UUID));
    };
    return Ol4WmsSource;
}());
exports.Ol4WmsSource = Ol4WmsSource;

},{"./Ol4":2}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EElement = (function () {
    function EElement(element) {
        this._element = element;
    }
    Object.defineProperty(EElement.prototype, "element", {
        get: function () {
            return this._element;
        },
        enumerable: true,
        configurable: true
    });
    EElement.prototype.setAttrs = function (attrs) {
        if (attrs === void 0) { attrs = {}; }
        for (var key in attrs) {
            this._element.setAttribute(key, attrs[key]);
        }
    };
    EElement.prototype.setAttr = function (key, value) {
        this._element.setAttribute(key, value);
        return this;
    };
    EElement.prototype.getAttr = function (key) {
        return this._element.getAttribute(key);
    };
    return EElement;
}());
exports.EElement = EElement;
var dom = (function () {
    function dom() {
    }
    dom.create = function (tagname, attrs, classes, text, data) {
        if (attrs === void 0) { attrs = {}; }
        if (classes === void 0) { classes = []; }
        if (text === void 0) { text = ''; }
        if (data === void 0) { data = {}; }
        var element = document.createElement(tagname);
        return dom.add(element, attrs, classes, text, data);
    };
    dom.add = function (element, attrs, classes, text, data) {
        if (attrs === void 0) { attrs = {}; }
        if (classes === void 0) { classes = []; }
        if (text === void 0) { text = ''; }
        if (data === void 0) { data = {}; }
        for (var key in attrs) {
            element.setAttribute(key, attrs[key]);
        }
        for (var _i = 0, classes_1 = classes; _i < classes_1.length; _i++) {
            var name_1 = classes_1[_i];
            element.classList.add(name_1);
        }
        if (text !== '') {
            element.textContent = text;
        }
        return element;
    };
    dom.find = function (selector, context) {
        if (context === void 0) { context = document; }
        if (context instanceof Document) {
            return context.querySelectorAll(selector);
        }
        else if (context instanceof HTMLElement) {
            return context.querySelectorAll(selector);
        }
        else {
            return null;
        }
    };
    dom.findFirst = function (selector, context) {
        if (context === void 0) { context = document; }
        if (context instanceof Document) {
            return context.querySelector(selector);
        }
        else if (context instanceof HTMLElement) {
            return context.querySelector(selector);
        }
        else {
            return null;
        }
    };
    dom.hasClass = function (element, name) {
        return element !== null && element.classList.contains(name);
    };
    ;
    dom.addClass = function (element, name) {
        element.classList.add(name);
        return element;
    };
    ;
    dom.removeClass = function (element, name) {
        element.classList.remove(name);
        return element;
    };
    ;
    dom.toggleClass = function (element, name) {
        element.classList.remove(name);
        return element;
    };
    return dom;
}());
exports.dom = dom;

},{}],5:[function(require,module,exports){
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
            scales: [5000, 25000, 50000, 100000, 200000, 250000, 500000, 1000000, 2000000, 5000000, 10000000]
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
            "EPSG:4326": "+proj=longlat +datum=WGS84 +units=degrees +no_defs" + " +axis=neu",
            "EPSG:4258": "+proj=longlat +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +no_defs" + " +units=degrees +axis=neu",
            "EPSG:31466": "+proj=tmerc +lat_0=0 +lon_0=6 +k=1 +x_0=2500000 +y_0=0 +ellps=bessel +towgs84=598.1,73.7,418.2,0.202,0.045,-2.455,6.7 +units=m +no_defs" + " +axis=neu",
            "EPSG:31467": "+proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=bessel +towgs84=598.1,73.7,418.2,0.202,0.045,-2.455,6.7 +units=m +no_defs" + " +axis=neu",
            "EPSG:25832": "+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
        },
        component: [
            {
                class: '',
                selector: ""
            }
        ]
    };
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
    var metadorMap = metador.Ol4Map.create(metadorMapConfig);
    metador['metadorMap'] = metadorMap;
}
exports.init = init;
metador['initMap'] = init;

},{"./Ol4":2}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvUGx1Z2lucy9XaGVyZUdyb3VwL01hcEJ1bmRsZS9SZXNvdXJjZXMvdHMvTGF5ZXJUcmVlLnRzIiwic3JjL1BsdWdpbnMvV2hlcmVHcm91cC9NYXBCdW5kbGUvUmVzb3VyY2VzL3RzL09sNC50cyIsInNyYy9QbHVnaW5zL1doZXJlR3JvdXAvTWFwQnVuZGxlL1Jlc291cmNlcy90cy9PbDRTb3VyY2UudHMiLCJzcmMvUGx1Z2lucy9XaGVyZUdyb3VwL01hcEJ1bmRsZS9SZXNvdXJjZXMvdHMvZG9tLnRzIiwic3JjL1BsdWdpbnMvV2hlcmVHcm91cC9NYXBCdW5kbGUvUmVzb3VyY2VzL3RzL21hcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsNkJBQTBCO0FBQzFCLDZCQUEwQztBQUcxQztJQWNJLG1CQUFvQixNQUFjO1FBSDFCLGlCQUFZLEdBQUcsSUFBSSxDQUFDO1FBQ3BCLGdCQUFXLEdBQUcsQ0FBQyxDQUFDO1FBR3BCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxJQUFJLEdBQWdCLFNBQUcsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQy9ELEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ3hCLElBQUksS0FBSyxHQUFHLFNBQUcsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDOUQsSUFBSSxDQUFDLHlCQUF5QixDQUFjLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM3RCxDQUFDO0lBQ0wsQ0FBQztJQUVNLGdCQUFNLEdBQWIsVUFBYyxNQUFjO1FBQ3hCLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDdkIsU0FBUyxDQUFD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QUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFFekQsT0FBTyxDQUFDLFlBQVksQ0FBQyxHQUFHLFVBQVUsQ0FBQztBQUV2QyxDQUFDO0FBdEZELG9CQXNGQztBQUVELE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxJQUFJLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IHtkb219IGZyb20gJy4vZG9tJztcbmltcG9ydCB7VElUTEUsIFVVSUQsIE9sNE1hcH0gZnJvbSBcIi4vT2w0XCI7XG4vLyBpbXBvcnQgKiBhcyAkIGZyb20gJ2pxdWVyeSc7XG5cbmV4cG9ydCBjbGFzcyBMYXllclRyZWUge1xuICAgIHByaXZhdGUgc3RhdGljIF9pbnN0YW5jZTogTGF5ZXJUcmVlO1xuICAgIHByaXZhdGUgc3RhdGljIG1heGxlbmd0aDogbnVtYmVyID0gMTY7XG4gICAgcHJpdmF0ZSBzdGF0aWMgdHJlZXNlbGVjdG9yOiBzdHJpbmcgPSAnLi1qcy1tYXAtbGF5ZXJ0cmVlIHVsLmxheWVyLXRyZWUtbGlzdCc7XG4gICAgcHJpdmF0ZSBzdGF0aWMgZHVtbXlzZWxlY3Rvcjogc3RyaW5nID0gJy4tanMtZHVtbXktbGF5ZXInO1xuICAgIHByaXZhdGUgc3RhdGljIHVzZU9wYWNpdHk6IGJvb2xlYW4gPSB0cnVlO1xuICAgIHByaXZhdGUgc3RhdGljIHVzZVZpc2libGU6IGJvb2xlYW4gPSB0cnVlO1xuICAgIHByaXZhdGUgc3RhdGljIHVzZVNvcnRhYmxlOiBib29sZWFuID0gdHJ1ZTtcbiAgICBwcml2YXRlIHN0YXRpYyBzaG93U3RhdHVzOiBib29sZWFuID0gdHJ1ZTtcbiAgICBwcml2YXRlIG9sNE1hcDogT2w0TWFwO1xuICAgIHByaXZhdGUgdHJlZTogSFRNTEVsZW1lbnQ7XG4gICAgcHJpdmF0ZSBjdXJyZW50TGF5ZXIgPSBudWxsO1xuICAgIHByaXZhdGUgb2xkUG9zaXRpb24gPSAwO1xuXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihvbDRNYXA6IE9sNE1hcCkge1xuICAgICAgICB0aGlzLm9sNE1hcCA9IG9sNE1hcDtcbiAgICAgICAgdGhpcy50cmVlID0gPEhUTUxFbGVtZW50PmRvbS5maW5kRmlyc3QoTGF5ZXJUcmVlLnRyZWVzZWxlY3Rvcik7XG4gICAgICAgIGlmIChMYXllclRyZWUudXNlU29ydGFibGUpIHtcbiAgICAgICAgICAgIGxldCBkdW1teSA9IGRvbS5maW5kRmlyc3QoTGF5ZXJUcmVlLmR1bW15c2VsZWN0b3IsIHRoaXMudHJlZSk7XG4gICAgICAgICAgICB0aGlzLmFkZERyYWdnYWJsZUV2ZW50TGlzdGVuZXIoPEhUTUxFbGVtZW50PmR1bW15LCB0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBjcmVhdGUob2w0TWFwOiBPbDRNYXApOiBMYXllclRyZWUge1xuICAgICAgICBpZiAoIUxheWVyVHJlZS5faW5zdGFuY2UpIHsvLyBzaW5nbGV0b25cbiAgICAgICAgICAgIExheWVyVHJlZS5faW5zdGFuY2UgPSBuZXcgTGF5ZXJUcmVlKG9sNE1hcCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIExheWVyVHJlZS5faW5zdGFuY2U7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdWJzdHJpbmdUaXRsZSh0ZXh0OiBzdHJpbmcpIHtcbiAgICAgICAgaWYgKHRleHQubGVuZ3RoID4gTGF5ZXJUcmVlLm1heGxlbmd0aCkge1xuICAgICAgICAgICAgdGV4dCA9IHRleHQuc3Vic3RyaW5nKDAsIExheWVyVHJlZS5tYXhsZW5ndGgpO1xuICAgICAgICAgICAgaWYgKHRleHQubGFzdEluZGV4T2YoJyAnKSA+IDApIHtcbiAgICAgICAgICAgICAgICB0ZXh0ID0gdGV4dC5zdWJzdHJpbmcoMCwgdGV4dC5sYXN0SW5kZXhPZignICcpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGV4dDtcbiAgICB9XG5cbiAgICBhZGQobGF5ZXI6IG9sLmxheWVyLkJhc2UpIHtcbiAgICAgICAgbGV0IGxheWVyTm9kZSA9IGRvbS5jcmVhdGUoJ2xpJywgeydpZCc6IGxheWVyLmdldChVVUlEKSwgJ2RyYWdnYWJsZSc6IFwidHJ1ZVwifSwgWydkcmFnZ2FibGUnLCAnLWpzLWRyYWdnYWJsZSddKTtcbiAgICAgICAgaWYgKExheWVyVHJlZS51c2VWaXNpYmxlKSB7XG4gICAgICAgICAgICB0aGlzLmFkZFZpc2libGUobGF5ZXJOb2RlLCBsYXllcik7XG4gICAgICAgIH1cbiAgICAgICAgbGF5ZXJOb2RlLmFwcGVuZENoaWxkKFxuICAgICAgICAgICAgZG9tLmNyZWF0ZSgnbGFiZWwnLFxuICAgICAgICAgICAgICAgIHsnaWQnOiBsYXllci5nZXQoVVVJRCksICdmb3InOiAnY2hiLScgKyBsYXllci5nZXQoVVVJRCksICd0aXRsZSc6IGxheWVyLmdldChUSVRMRSl9LFxuICAgICAgICAgICAgICAgIFsnZm9ybS1sYWJlbCddLCB0aGlzLnN1YnN0cmluZ1RpdGxlKGxheWVyLmdldChUSVRMRSkpKVxuICAgICAgICApO1xuICAgICAgICBpZiAoTGF5ZXJUcmVlLnVzZU9wYWNpdHkpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkT3BhY2l0eShsYXllck5vZGUsIGxheWVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudHJlZS5pbnNlcnRCZWZvcmUobGF5ZXJOb2RlLCBkb20uZmluZEZpcnN0KCdsaScsIHRoaXMudHJlZSkpO1xuICAgICAgICBpZiAoTGF5ZXJUcmVlLnVzZVNvcnRhYmxlKSB7XG4gICAgICAgICAgICB0aGlzLmFkZERyYWdnYWJsZUV2ZW50TGlzdGVuZXIobGF5ZXJOb2RlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYWRkVmlzaWJsZShsYXllck5vZGU6IEhUTUxFbGVtZW50LCBsYXllcjogb2wubGF5ZXIuQmFzZSkge1xuICAgICAgICBsZXQgaW5wdXQgPSBkb20uY3JlYXRlKCdpbnB1dCcsIHsndHlwZSc6ICdjaGVja2JveCd9LFxuICAgICAgICAgICAgWydjaGVjaycsICctanMtbWFwLXNvdXJjZS12aXNpYmxlJ10pO1xuICAgICAgICAoPEhUTUxGb3JtRWxlbWVudD5pbnB1dCkuY2hlY2tlZCA9IGxheWVyLmdldFZpc2libGUoKTtcbiAgICAgICAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgdGhpcy5jaGFuZ2VWaXNpYmxlLmJpbmQodGhpcyksIGZhbHNlKTtcbiAgICAgICAgbGF5ZXJOb2RlLmFwcGVuZENoaWxkKGlucHV0KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNoYW5nZVZpc2libGUoZSl7XG4gICAgICAgIHRoaXMub2w0TWFwLnNldFZpc2libGUoZS50YXJnZXQucGFyZW50RWxlbWVudC5pZCwgZS50YXJnZXQuY2hlY2tlZCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhZGRPcGFjaXR5KGxheWVyTm9kZTogSFRNTEVsZW1lbnQsIGxheWVyOiBvbC5sYXllci5CYXNlKTogdm9pZCB7XG4gICAgICAgIGxldCBzZWxlY3QgPSBkb20uY3JlYXRlKCdzZWxlY3QnLCB7fSxcbiAgICAgICAgICAgIFsnaW5wdXQtZWxlbWVudCcsICdtZWRpdW0nLCAnc2ltcGxlJywgJ2pzLW1hcC1zb3VyY2Utb3BhY2l0eScsICctanMtbWFwLXNvdXJjZS1vcGFjaXR5J10pO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDw9IDEwOyBpKyspIHtcbiAgICAgICAgICAgIHNlbGVjdC5hcHBlbmRDaGlsZChkb20uY3JlYXRlKCdvcHRpb24nLCB7J3ZhbHVlJzogaSAvIDEwfSwgW10sIChpICogMTApICsgJyAlJykpO1xuICAgICAgICB9XG4gICAgICAgICg8SFRNTEZvcm1FbGVtZW50PnNlbGVjdCkudmFsdWUgPSBsYXllci5nZXRPcGFjaXR5KCkudG9TdHJpbmcoKTtcbiAgICAgICAgc2VsZWN0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIHRoaXMuY2hhbmdlT3BhY2l0eS5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgICAgIGxheWVyTm9kZS5hcHBlbmRDaGlsZChzZWxlY3QpO1xuICAgIH1cblxuICAgIHByaXZhdGUgY2hhbmdlT3BhY2l0eShlKXtcbiAgICAgICAgdGhpcy5vbDRNYXAuc2V0T3BhY2l0eShlLnRhcmdldC5wYXJlbnRFbGVtZW50LmlkLCBwYXJzZUZsb2F0KGUudGFyZ2V0LnZhbHVlKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhZGREcmFnZ2FibGVFdmVudExpc3RlbmVyKGxheWVyOiBIVE1MRWxlbWVudCwgaXNEdW1teTpib29sZWFuID0gZmFsc2UpIHtcblxuICAgICAgICBpZiAoIWlzRHVtbXkpIHtcbiAgICAgICAgICAgIGxheWVyLmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdzdGFydCcsIHRoaXMuZHJhZ1N0YXJ0LmJpbmQodGhpcyksIGZhbHNlKTtcbiAgICAgICAgICAgIGxheWVyLmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdlbmQnLCB0aGlzLmRyYWdFbmQuYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgICAgICB9XG4gICAgICAgIGxheWVyLmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdlbnRlcicsIHRoaXMuZHJhZ0VudGVyLmJpbmQodGhpcyksIGZhbHNlKTtcbiAgICAgICAgbGF5ZXIuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ292ZXInLCB0aGlzLmRyYWdPdmVyLmJpbmQodGhpcyksIGZhbHNlKTtcbiAgICAgICAgbGF5ZXIuYWRkRXZlbnRMaXN0ZW5lcignZHJvcCcsIHRoaXMuZHJhZ0Ryb3AuYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgIH1cblxuXG4gICAgcHJpdmF0ZSBkcmFnU3RhcnQoZSkge1xuICAgICAgICB0aGlzLmN1cnJlbnRMYXllciA9IGUudGFyZ2V0O1xuICAgICAgICB0aGlzLm9sZFBvc2l0aW9uID0gdGhpcy5nZXRMYXllclBvc2l0aW9uKHRoaXMuY3VycmVudExheWVyKTtcbiAgICAgICAgZS5kYXRhVHJhbnNmZXIuZWZmZWN0QWxsb3dlZCA9ICdtb3ZlJztcbiAgICAgICAgZS5kYXRhVHJhbnNmZXIuc2V0RGF0YSgndGV4dC9odG1sJywgdGhpcy5jdXJyZW50TGF5ZXIuaW5uZXJIVE1MKTtcbiAgICAgICAgZG9tLmFkZENsYXNzKHRoaXMuY3VycmVudExheWVyLCBcIm1vdmVcIik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBkcmFnT3ZlcihlKSB7XG4gICAgICAgIGlmIChlLnByZXZlbnREZWZhdWx0KSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICAgICAgZS5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9ICdtb3ZlJztcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHByaXZhdGUgZHJhZ0VudGVyKGUpIHtcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudExheWVyICE9PSBlLnRvRWxlbWVudCkge1xuICAgICAgICAgICAgICAgIHRoaXMudHJlZS5pbnNlcnRCZWZvcmUodGhpcy5jdXJyZW50TGF5ZXIsIGUudG9FbGVtZW50LmRyYWdnYWJsZSA/IGUudG9FbGVtZW50IDogZS50b0VsZW1lbnQucGFyZW50RWxlbWVudCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGRyYWdEcm9wKGUpIHtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBkb20ucmVtb3ZlQ2xhc3MoZS50YXJnZXQsIFwib3ZlclwiKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGRyYWdFbmQoZSkge1xuICAgICAgICBkb20ucmVtb3ZlQ2xhc3MoZS50YXJnZXQsIFwibW92ZVwiKTtcbiAgICAgICAgdGhpcy5vbDRNYXAubW92ZUxheWVyKHRoaXMuY3VycmVudExheWVyLmlkLCB0aGlzLm9sZFBvc2l0aW9uLCB0aGlzLmdldExheWVyUG9zaXRpb24odGhpcy5jdXJyZW50TGF5ZXIpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldExheWVyUG9zaXRpb24obGF5ZXIpIHtcbiAgICAgICAgbGV0IGxpc3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuLWpzLW1hcC1sYXllcnRyZWUgdWwgLi1qcy1kcmFnZ2FibGUnKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAobGlzdFtpXS5pZCA9PT0gbGF5ZXIuaWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbGlzdC5sZW5ndGggLSAxIC0gaTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG4iLCJpbXBvcnQgKiBhcyBvcGVubGF5ZXJzNCBmcm9tICdvcGVubGF5ZXJzJztcbi8vIGltcG9ydCAqIGFzIGpxdWVyeSBmcm9tICdqcXVlcnknO1xuaW1wb3J0IHtMYXllclRyZWV9IGZyb20gJy4vTGF5ZXJUcmVlJztcbmltcG9ydCB7T2w0U291cmNlLCBPbDRWZWN0b3JTb3VyY2UsIE9sNFdtc1NvdXJjZX0gZnJvbSBcIi4vT2w0U291cmNlXCJcblxuZGVjbGFyZSBjbGFzcyBwcm9qNCB7XG4gICAgc3RhdGljIGRlZnMobmFtZTogc3RyaW5nLCBkZWY6IHN0cmluZyk6IHZvaWQ7XG59XG5cblxuLy8gZGVjbGFyZSBmdW5jdGlvbiBhZGRTb3VyY2UoaWQ6IHN0cmluZywgdGl0bGU6IHN0cmluZywgdmlzaWJpbGl0eTogYm9vbGVhbiwgb3BhY2l0eTogbnVtYmVyKTogdm9pZDtcblxuZXhwb3J0IGNsYXNzIE9sNFV0aWxzIHtcbiAgICAvKiBcbiAgICAgKiB1bml0czogJ2RlZ3JlZXMnfCdmdCd8J20nfCd1cy1mdCdcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHJlc29sdXRpb25TY2FsZUZhY3Rvcih1bml0czogc3RyaW5nKTogbnVtYmVyIHtcbiAgICAgICAgbGV0IGRwaSA9IDI1LjQgLyAwLjI4O1xuICAgICAgICBsZXQgbXB1ID0gb2wucHJvai5NRVRFUlNfUEVSX1VOSVRbdW5pdHNdO1xuICAgICAgICBsZXQgaW5jaGVzUGVyTWV0ZXIgPSAzOS4zNztcbiAgICAgICAgcmV0dXJuIG1wdSAqIGluY2hlc1Blck1ldGVyICogZHBpO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgcmVzb2x1dGlvbkZvclNjYWxlKHNjYWxlOiBudW1iZXIsIGZhY3RvcjogbnVtYmVyKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHNjYWxlIC8gZmFjdG9yO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgcmVzb2x1dGlvbnNGb3JTY2FsZXMoc2NhbGVzOiBudW1iZXJbXSwgdW5pdHM6IHN0cmluZyk6IG51bWJlcltdIHtcbiAgICAgICAgbGV0IHJlc29sdXRpb25zID0gW107XG4gICAgICAgIGxldCBmYWN0b3IgPSBPbDRVdGlscy5yZXNvbHV0aW9uU2NhbGVGYWN0b3IodW5pdHMpO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNjYWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcmVzb2x1dGlvbnMucHVzaChPbDRVdGlscy5yZXNvbHV0aW9uRm9yU2NhbGUoc2NhbGVzW2ldLCBmYWN0b3IpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzb2x1dGlvbnM7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBzY2FsZUZvclJlc29sdXRpb24ocmVzb2x1dGlvbjogbnVtYmVyLCBmYWN0b3I6IG51bWJlcik6IG51bWJlciB7XG4gICAgICAgIHJldHVybiByZXNvbHV0aW9uICogZmFjdG9yO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgc2NhbGVzRm9yUmVzb2x1dGlvbnMocmVzb2x1dGlvbnM6IG51bWJlcltdLCB1bml0czogc3RyaW5nKTogbnVtYmVyW10ge1xuICAgICAgICBsZXQgc2NhbGVzID0gW107XG4gICAgICAgIGxldCBmYWN0b3IgPSBPbDRVdGlscy5yZXNvbHV0aW9uU2NhbGVGYWN0b3IodW5pdHMpO1xuICAgICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgcmVzb2x1dGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHNjYWxlcy5wdXNoKE9sNFV0aWxzLnNjYWxlRm9yUmVzb2x1dGlvbihyZXNvbHV0aW9uc1tpXSwgZmFjdG9yKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNjYWxlcztcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGluaXRQcm9qNERlZnMocHJvajREZWZzOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgZm9yIChjb25zdCBuYW1lIGluIHByb2o0RGVmcykge1xuICAgICAgICAgICAgcHJvajQuZGVmcyhuYW1lLCBwcm9qNERlZnNbbmFtZV0pO1xuICAgICAgICAgICAgbGV0IHByID0gb2wucHJvai5nZXQobmFtZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGdldFByb2oocHJvakNvZGU6IHN0cmluZyk6IG9sLnByb2ouUHJvamVjdGlvbiB7XG4gICAgICAgIHJldHVybiBvbC5wcm9qLmdldChwcm9qQ29kZSk7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBnZXRTdHlsZShvcHRpb25zOiBhbnksIHN0eWxlOiBvbC5zdHlsZS5TdHlsZSA9IG51bGwpOiBvbC5zdHlsZS5TdHlsZSB7XG4gICAgICAgIGxldCBzdHlsZV8gPSBzdHlsZSA/IHN0eWxlIDogbmV3IG9sLnN0eWxlLlN0eWxlKCk7XG4gICAgICAgIHN0eWxlXy5zZXRGaWxsKG5ldyBvbC5zdHlsZS5GaWxsKG9wdGlvbnNbJ2ZpbGwnXSkpO1xuICAgICAgICBzdHlsZV8uc2V0U3Ryb2tlKG5ldyBvbC5zdHlsZS5TdHJva2Uob3B0aW9uc1snc3Ryb2tlJ10pKTtcbiAgICAgICAgaWYgKG9wdGlvbnNbJ2ltYWdlJ10gJiYgb3B0aW9uc1snaW1hZ2UnXVsnY2lyY2xlJ10pIHtcbiAgICAgICAgICAgIHN0eWxlXy5zZXRJbWFnZShuZXcgb2wuc3R5bGUuQ2lyY2xlKHtcbiAgICAgICAgICAgICAgICAgICAgcmFkaXVzOiBvcHRpb25zWydpbWFnZSddWydjaXJjbGUnXVsncmFkaXVzJ10sXG4gICAgICAgICAgICAgICAgICAgIGZpbGw6IG5ldyBvbC5zdHlsZS5GaWxsKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiBvcHRpb25zWydpbWFnZSddWydjaXJjbGUnXVsnZmlsbCddWydjb2xvciddXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0eWxlXztcbiAgICAgICAgLy9cbiAgICAgICAgLy8gcmV0dXJuIG5ldyBvbC5zdHlsZV8uU3R5bGUoe1xuICAgICAgICAvLyAgICAgZmlsbDogbmV3IG9sLnN0eWxlXy5GaWxsKG9wdGlvbnNbJ2ZpbGwnXSksXG4gICAgICAgIC8vICAgICBzdHJva2U6IG5ldyBvbC5zdHlsZV8uU3Ryb2tlKG9wdGlvbnNbJ3N0cm9rZSddKS8vLFxuICAgICAgICAvLyAgICAgLy8gaW1hZ2U6IG5ldyBvbC5zdHlsZV8uQ2lyY2xlKHtcbiAgICAgICAgLy8gICAgIC8vICAgICByYWRpdXM6IDcsXG4gICAgICAgIC8vICAgICAvLyAgICAgZmlsbDogbmV3IG9sLnN0eWxlXy5GaWxsKG9wdGlvbnNbJ2ZpbGwnXSlcbiAgICAgICAgLy8gICAgIC8vIH0pXG4gICAgICAgIC8vIH0pO1xuICAgIH1cblxuLy8gZmlsbFxuLy8ge1xuLy8gICAgIGNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMilcbi8vIH1cbi8vIHN0cm9rZVxuLy8ge1xuLy8gICAgIGNvbG9yOiAnI2ZmY2MzMycsXG4vLyAgICAgd2lkdGg6IDJcbi8vICAgICBkYXNoOlxuLy8gfVxuLy8gaW1hZ2Vcbn1cblxuZXhwb3J0IGNsYXNzIE9sNEdlb20ge1xuICAgIHByb3RlY3RlZCBnZW9tOiBvbC5nZW9tLkdlb21ldHJ5ID0gbnVsbDtcbiAgICBwcm90ZWN0ZWQgcHJvajogb2wucHJvai5Qcm9qZWN0aW9uID0gbnVsbDtcblxuICAgIGNvbnN0cnVjdG9yKGdlb206IG9sLmdlb20uR2VvbWV0cnksIHByb2o6IG9sLnByb2ouUHJvamVjdGlvbikge1xuICAgICAgICB0aGlzLmdlb20gPSBnZW9tO1xuICAgICAgICB0aGlzLnByb2ogPSBwcm9qO1xuICAgIH1cblxuICAgIGdldEdlb20oKTogb2wuZ2VvbS5HZW9tZXRyeSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdlb207XG4gICAgfVxuXG4gICAgZ2V0UHJvaigpOiBvbC5wcm9qLlByb2plY3Rpb24ge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9qO1xuICAgIH1cblxuICAgIGdldEV4dGVudChwcm9qOiBvbC5wcm9qLlByb2plY3Rpb24pOiBvbC5FeHRlbnQge1xuICAgICAgICBpZiAodGhpcy5wcm9qICE9PSBwcm9qKSB7XG4gICAgICAgICAgICByZXR1cm4gKDxvbC5nZW9tLkdlb21ldHJ5Pig8YW55PiB0aGlzLmdlb20pLmNsb25lKCkpLnRyYW5zZm9ybSh0aGlzLnByb2osIHByb2opLmdldEV4dGVudCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuICg8b2wuZ2VvbS5HZW9tZXRyeT4oPGFueT4gdGhpcy5nZW9tKS5jbG9uZSgpKS5nZXRFeHRlbnQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBnZXRQb2x5Z29uRm9yRXh0ZW50KHByb2o6IG9sLnByb2ouUHJvamVjdGlvbikge1xuICAgICAgICByZXR1cm4gb2wuZ2VvbS5Qb2x5Z29uLmZyb21FeHRlbnQodGhpcy5nZXRFeHRlbnQocHJvaikpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIE9sNEV4dGVudCBleHRlbmRzIE9sNEdlb20ge1xuICAgIHB1YmxpYyBzdGF0aWMgZnJvbUFycmF5KG9yZGluYXRlczogbnVtYmVyW10sIHByb2o6IG9sLnByb2ouUHJvamVjdGlvbik6IE9sNEV4dGVudCB7XG4gICAgICAgIGxldCBnZW9tID0gbmV3IG9sLmdlb20uTXVsdGlQb2ludChbW29yZGluYXRlc1swXSwgb3JkaW5hdGVzWzFdXSwgW29yZGluYXRlc1syXSwgb3JkaW5hdGVzWzNdXV0pO1xuICAgICAgICByZXR1cm4gbmV3IE9sNEV4dGVudChnZW9tLCBwcm9qKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjb25zdCBVVUlEOiBzdHJpbmcgPSAndXVpZCc7XG5leHBvcnQgY29uc3QgTEFZRVJfVVVJRDogc3RyaW5nID0gJ2xheWVydXVpZCc7XG5leHBvcnQgY29uc3QgVElUTEU6IHN0cmluZyA9ICd0aXRsZSc7XG5leHBvcnQgY29uc3QgTUVUQURPUl9FUFNHOiBvbC5Qcm9qZWN0aW9uTGlrZSA9ICdFUFNHOjQzMjYnO1xuZXhwb3J0IGNvbnN0IExBWUVSX1ZFQ1RPUiA9ICd2ZWN0b3InO1xuZXhwb3J0IGNvbnN0IExBWUVSX0lNQUdFID0gJ2ltYWdlJztcblxuZXhwb3J0IGNsYXNzIE9sNE1hcCB7XG4gICAgcHJpdmF0ZSBzdGF0aWMgX3V1aWQgPSAwO1xuICAgIHByaXZhdGUgc3RhdGljIF9pbnN0YW5jZTogT2w0TWFwID0gbnVsbDsgLy8gc2luZ2xldG9uXG4gICAgcHJvdGVjdGVkIG9sTWFwOiBvbC5NYXAgPSBudWxsO1xuICAgIHByb3RlY3RlZCBzY2FsZXM6IG51bWJlcltdO1xuICAgIC8vICAgIHByb3RlY3RlZCBwcm9qOiBvbC5wcm9qLlByb2plY3Rpb24gPSBudWxsO1xuICAgIHByb3RlY3RlZCBzdGFydEV4dGVudDogT2w0RXh0ZW50ID0gbnVsbDsgIC8vIHhtaW4sIHltaW4sIHhtYXgsIHltYXggb3B0aW9uc1snc3RhcnRFeHRlbnQnXVxuICAgIHByb3RlY3RlZCBtYXhFeHRlbnQ6IE9sNEV4dGVudCA9IG51bGw7XG4gICAgcHJvdGVjdGVkIGRyYXdlcjogT2w0RHJhd2VyO1xuICAgIHByb3RlY3RlZCB3bXNTb3VyY2U6IE9sNFdtc1NvdXJjZTtcbiAgICBwcm90ZWN0ZWQgdmVjU291cmNlOiBPbDRWZWN0b3JTb3VyY2U7XG4gICAgcHJpdmF0ZSBsYXllcnRyZWU6IExheWVyVHJlZTtcbiAgICBwcm90ZWN0ZWQgc3R5bGVzOiBPYmplY3Q7XG4gICAgcHJvdGVjdGVkIGhnTGF5ZXI6IG9sLmxheWVyLlZlY3RvcjtcbiAgICBwcm90ZWN0ZWQgZHJhZ3pvb206IG9sLmludGVyYWN0aW9uLkRyYWdab29tO1xuXG4gICAgcHJpdmF0ZSBzdGF0aWMgZ2V0VXVpZChwcmVmaXg6IHN0cmluZyA9ICcnKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHByZWZpeCArICgrK09sNE1hcC5fdXVpZCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihvcHRpb25zOiBhbnkpIHsgLy8gc2luZ2xldG9uXG4gICAgICAgIC8vIG9sWydFTkFCTEVfUkFTVEVSX1JFUFJPSkVDVElPTiddID0gZmFsc2U7XG4gICAgICAgIE9sNFV0aWxzLmluaXRQcm9qNERlZnMob3B0aW9uc1sncHJvajREZWZzJ10pO1xuICAgICAgICB0aGlzLmxheWVydHJlZSA9IExheWVyVHJlZS5jcmVhdGUodGhpcyk7XG4gICAgICAgIHRoaXMud21zU291cmNlID0gT2w0V21zU291cmNlLmNyZWF0ZSh0aGlzLCB0cnVlLCB0aGlzLmxheWVydHJlZSk7XG4gICAgICAgIHRoaXMudmVjU291cmNlID0gT2w0VmVjdG9yU291cmNlLmNyZWF0ZSh0aGlzKTtcbiAgICAgICAgKDxIVE1MRm9ybUVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLi1qcy1jcnMtY29kZScpKS52YWx1ZSA9IG9wdGlvbnNbJ3ZpZXcnXVsncHJvamVjdGlvbiddO1xuICAgICAgICBsZXQgcHJvajogb2wucHJvai5Qcm9qZWN0aW9uID0gb2wucHJvai5nZXQob3B0aW9uc1sndmlldyddWydwcm9qZWN0aW9uJ10pO1xuICAgICAgICB0aGlzLnN0eWxlcyA9IG9wdGlvbnNbJ3N0eWxlcyddO1xuICAgICAgICB0aGlzLnNjYWxlcyA9IG9wdGlvbnNbJ3ZpZXcnXVsnc2NhbGVzJ107XG4gICAgICAgIHRoaXMuc3RhcnRFeHRlbnQgPSBPbDRFeHRlbnQuZnJvbUFycmF5KG9wdGlvbnNbJ3ZpZXcnXVsnc3RhcnRFeHRlbnQnXSwgcHJvaik7XG4gICAgICAgIHRoaXMubWF4RXh0ZW50ID0gT2w0RXh0ZW50LmZyb21BcnJheShvcHRpb25zWyd2aWV3J11bJ21heEV4dGVudCddLCBwcm9qKTtcbiAgICAgICAgdGhpcy5vbE1hcCA9IG5ldyBvbC5NYXAoe1xuICAgICAgICAgICAgdGFyZ2V0OiBvcHRpb25zWydtYXAnXVsndGFyZ2V0J10sXG4gICAgICAgICAgICByZW5kZXJlcjogJ2NhbnZhcydcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMub2xNYXAuc2V0VmlldyhcbiAgICAgICAgICAgIG5ldyBvbC5WaWV3KHtcbiAgICAgICAgICAgICAgICBwcm9qZWN0aW9uOiBwcm9qLFxuICAgICAgICAgICAgICAgIHJlc29sdXRpb25zOiBPbDRVdGlscy5yZXNvbHV0aW9uc0ZvclNjYWxlcyh0aGlzLnNjYWxlcywgcHJvai5nZXRVbml0cygpKS5yZXZlcnNlKCksXG4gICAgICAgICAgICAgICAgZXh0ZW50OiB0aGlzLm1heEV4dGVudC5nZXRFeHRlbnQocHJvailcbiAgICAgICAgICAgIH0pXG4gICAgICAgICk7XG4gICAgICAgIC8qIG1ha2UgYSBncm91cCBsYXllciBmb3IgYWxsIGltYWdlIGxheWVycyAoV01TIGV0Yy4pKi9cbiAgICAgICAgbGV0IGltYWdlR3JvdXAgPSBuZXcgb2wubGF5ZXIuR3JvdXAoXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbGF5ZXJzOiBuZXcgb2wuQ29sbGVjdGlvbjxvbC5sYXllci5CYXNlPigpXG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICAgIGltYWdlR3JvdXAuc2V0KFVVSUQsIExBWUVSX0lNQUdFKVxuICAgICAgICB0aGlzLm9sTWFwLmFkZExheWVyKGltYWdlR3JvdXApO1xuICAgICAgICAvKiBtYWtlIGEgZ3JvdXAgbGF5ZXIgZm9yIGFsbCB2ZWN0b3IgbGF5ZXJzIChIaWdodGxpZ2h0LCBTZWFyY2ggcmVzdWx0cyBldGMuKSovXG4gICAgICAgIGxldCB2ZWN0b3JHcm91cCA9IG5ldyBvbC5sYXllci5Hcm91cChcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBsYXllcnM6IG5ldyBvbC5Db2xsZWN0aW9uPG9sLmxheWVyLkJhc2U+KClcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgICAgdmVjdG9yR3JvdXAuc2V0KFVVSUQsIExBWUVSX1ZFQ1RPUilcbiAgICAgICAgdGhpcy5vbE1hcC5hZGRMYXllcih2ZWN0b3JHcm91cCk7XG5cblxuICAgICAgICBmb3IgKGxldCBzb3VyY2VPcHRpb25zIG9mIG9wdGlvbnNbJ3NvdXJjZSddKSB7XG4gICAgICAgICAgICBpZiAoc291cmNlT3B0aW9uc1sndHlwZSddID09PSAnV01TJykge1xuICAgICAgICAgICAgICAgIGxldCB3bXNMYXllciA9IHRoaXMuYWRkTGF5ZXIoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMud21zU291cmNlLmNyZWF0ZUxheWVyKFxuICAgICAgICAgICAgICAgICAgICAgICAgT2w0TWFwLmdldFV1aWQoJ29sYXktJyksXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VPcHRpb25zLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbE1hcC5nZXRWaWV3KCkuZ2V0UHJvamVjdGlvbigpLFxuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlT3B0aW9uc1sndmlzaWJsZSddLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VGbG9hdChzb3VyY2VPcHRpb25zWydvcGFjaXR5J10pXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKHNvdXJjZU9wdGlvbnNbJ3R5cGUnXSArICcgaXMgbm90IHN1cHBvcnRlZC4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLm9sTWFwLmFkZENvbnRyb2wobmV3IG9sLmNvbnRyb2wuU2NhbGVMaW5lKCkpO1xuXG4gICAgICAgIHRoaXMub2xNYXAuYWRkQ29udHJvbChuZXcgb2wuY29udHJvbC5ab29tVG9FeHRlbnQoe1xuICAgICAgICAgICAgZXh0ZW50OiB0aGlzLm1heEV4dGVudC5nZXRFeHRlbnQocHJvailcbiAgICAgICAgfSkpO1xuICAgICAgICB0aGlzLm9sTWFwLmFkZEludGVyYWN0aW9uKG5ldyBvbC5pbnRlcmFjdGlvbi5EcmFnWm9vbSgpKTtcbiAgICAgICAgdGhpcy5vbE1hcC5hZGRDb250cm9sKG5ldyBvbC5jb250cm9sLk1vdXNlUG9zaXRpb24oXG4gICAgICAgICAgICAvLyB7XG4gICAgICAgICAgICAvLyAgICAgY29vcmRpbmF0ZUZvcm1hdDogZnVuY3Rpb24gKGNvb3JkaW5hdGVzKSB7XG4gICAgICAgICAgICAvLyAgICAgICAgIHZhciBjb29yZF94ID0gY29vcmRpbmF0ZXNbMF0udG9GaXhlZCgzKTtcbiAgICAgICAgICAgIC8vICAgICAgICAgdmFyIGNvb3JkX3kgPSBjb29yZGluYXRlc1sxXS50b0ZpeGVkKDMpO1xuICAgICAgICAgICAgLy8gICAgICAgICByZXR1cm4gY29vcmRfeCArICcsICcgKyBjb29yZF95O1xuICAgICAgICAgICAgLy8gICAgIH1cbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgKSk7XG4gICAgICAgIHRoaXMuem9vbVRvRXh0ZW50KHRoaXMuc3RhcnRFeHRlbnQuZ2V0UG9seWdvbkZvckV4dGVudChwcm9qKSk7XG4gICAgICAgIGxldCBoZ2wgPSB0aGlzLnZlY1NvdXJjZS5jcmVhdGVMYXllcihcbiAgICAgICAgICAgIE9sNE1hcC5nZXRVdWlkKCdvbGF5LScpLFxuICAgICAgICAgICAgeydzdHlsZSc6IE9sNFV0aWxzLmdldFN0eWxlKHRoaXMuc3R5bGVzWydoaWdobGlnaHQnXSl9LFxuICAgICAgICAgICAgdGhpcy5vbE1hcC5nZXRWaWV3KCkuZ2V0UHJvamVjdGlvbigpXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMuaGdMYXllciA9IDxvbC5sYXllci5WZWN0b3I+dGhpcy5hZGRMYXllcihoZ2wpO1xuXG4gICAgICAgIGxldCB2TGF5ZXIgPSA8b2wubGF5ZXIuVmVjdG9yPnRoaXMuYWRkTGF5ZXIoXG4gICAgICAgICAgICB0aGlzLnZlY1NvdXJjZS5jcmVhdGVMYXllcihcbiAgICAgICAgICAgICAgICBPbDRNYXAuZ2V0VXVpZCgnb2xheS0nKSxcbiAgICAgICAgICAgICAgICB7J3N0eWxlJzogT2w0VXRpbHMuZ2V0U3R5bGUodGhpcy5zdHlsZXNbJ3NlYXJjaCddKX0sXG4gICAgICAgICAgICAgICAgdGhpcy5vbE1hcC5nZXRWaWV3KCkuZ2V0UHJvamVjdGlvbigpXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgICAgIHZMYXllci5zZXRNYXAodGhpcy5vbE1hcCk7XG4gICAgICAgIHRoaXMuZHJhd2VyID0gbmV3IE9sNERyYXdlcih2TGF5ZXIpO1xuICAgIH1cblxuICAgIHpvb21Ub0V4dGVudChnZW9tZXRyeTogb2wuZ2VvbS5TaW1wbGVHZW9tZXRyeSB8IG9sLkV4dGVudCkge1xuICAgICAgICB0aGlzLm9sTWFwLmdldFZpZXcoKS5maXQoZ2VvbWV0cnksIDxvbHgudmlldy5GaXRPcHRpb25zPnRoaXMub2xNYXAuZ2V0U2l6ZSgpKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgY3JlYXRlKG9wdGlvbnM6IGFueSk6IE9sNE1hcCB7XG4gICAgICAgIGlmICghT2w0TWFwLl9pbnN0YW5jZSkgey8vIHNpbmdsZXRvblxuICAgICAgICAgICAgT2w0TWFwLl9pbnN0YW5jZSA9IG5ldyBPbDRNYXAob3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE9sNE1hcC5faW5zdGFuY2U7XG4gICAgfVxuXG4gICAgZ2V0UHJvamVjdGlvbigpOiBvbC5wcm9qLlByb2plY3Rpb24ge1xuICAgICAgICByZXR1cm4gdGhpcy5vbE1hcC5nZXRWaWV3KCkuZ2V0UHJvamVjdGlvbigpO1xuICAgIH1cblxuICAgIGdldERyYXdlcigpOiBPbDREcmF3ZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5kcmF3ZXI7XG4gICAgfVxuXG4gICAgZ2V0SGdMYXllcigpOiBvbC5sYXllci5WZWN0b3Ige1xuICAgICAgICByZXR1cm4gdGhpcy5oZ0xheWVyO1xuICAgIH1cblxuICAgIC8vXG4gICAgLy8gYWRkVmVjdG9yTGF5ZXIoc3R5bGU6IG9sLnN0eWxlLlN0eWxlKTogb2wubGF5ZXIuVmVjdG9yIHtcbiAgICAvLyAgICAgbGV0IG9wdGlvbnMgPSB7XG4gICAgLy8gICAgICAgICB3cmFwWDogZmFsc2VcbiAgICAvLyAgICAgfTtcbiAgICAvLyAgICAgbGV0IHZMYXllciA9IG5ldyBvbC5sYXllci5WZWN0b3Ioe1xuICAgIC8vICAgICAgICAgc291cmNlOiBuZXcgb2wuc291cmNlLlZlY3RvcihvcHRpb25zKSxcbiAgICAvLyAgICAgICAgIHN0eWxlOiBzdHlsZVxuICAgIC8vICAgICB9KTtcbiAgICAvLyAgICAgcmV0dXJuIDxvbC5sYXllci5WZWN0b3I+dGhpcy5hZGRMYXllcih2TGF5ZXIpO1xuICAgIC8vIH1cblxuICAgIGFkZExheWVyKGxheWVyOiBvbC5sYXllci5CYXNlKTogb2wubGF5ZXIuQmFzZSB7XG4gICAgICAgIC8vIGxheWVyLnNldChVVUlELCBPbDRNYXAuZ2V0VXVpZCgnb2xheS0nKSk7XG4gICAgICAgIC8vIGlmICh0aXRsZSkge1xuICAgICAgICAvLyAgICAgbGF5ZXIuc2V0KFRJVExFLCB0aXRsZSk7XG4gICAgICAgIC8vIH1cbiAgICAgICAgaWYgKGxheWVyIGluc3RhbmNlb2Ygb2wubGF5ZXIuSW1hZ2UpIHtcbiAgICAgICAgICAgIGxldCBncm91cDogb2wubGF5ZXIuR3JvdXAgPSA8b2wubGF5ZXIuR3JvdXA+IHRoaXMuZmluZExheWVyKExBWUVSX0lNQUdFKTtcbiAgICAgICAgICAgIGdyb3VwLmdldExheWVycygpLmluc2VydEF0KGdyb3VwLmdldExheWVycygpLmdldExlbmd0aCgpLCBsYXllcik7XG4gICAgICAgICAgICByZXR1cm4gbGF5ZXI7XG4gICAgICAgIH0gZWxzZSBpZiAobGF5ZXIgaW5zdGFuY2VvZiBvbC5sYXllci5WZWN0b3IpIHtcbiAgICAgICAgICAgIGxldCBncm91cDogb2wubGF5ZXIuR3JvdXAgPSA8b2wubGF5ZXIuR3JvdXA+IHRoaXMuZmluZExheWVyKExBWUVSX1ZFQ1RPUik7XG4gICAgICAgICAgICBncm91cC5nZXRMYXllcnMoKS5pbnNlcnRBdChncm91cC5nZXRMYXllcnMoKS5nZXRMZW5ndGgoKSwgbGF5ZXIpO1xuICAgICAgICAgICAgcmV0dXJuIGxheWVyO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJlbW92ZUxheWVyKGxheWVyOiBvbC5sYXllci5CYXNlKTogdm9pZCB7XG4gICAgICAgIHRoaXMub2xNYXAucmVtb3ZlTGF5ZXIobGF5ZXIpO1xuICAgIH1cblxuICAgIG1vdmVMYXllcih1dWlkOiBzdHJpbmcsIG9sZFBvczogbnVtYmVyLCBuZXdQb3M6IG51bWJlcik6IHZvaWQge1xuICAgICAgICBsZXQgbGF5ZXI6IG9sLmxheWVyLkJhc2UgPSB0aGlzLmZpbmRMYXllcih1dWlkKTtcbiAgICAgICAgaWYgKGxheWVyIGluc3RhbmNlb2Ygb2wubGF5ZXIuSW1hZ2UpIHtcbiAgICAgICAgICAgIGxldCBncm91cDogb2wubGF5ZXIuR3JvdXAgPSA8b2wubGF5ZXIuR3JvdXA+IHRoaXMuZmluZExheWVyKExBWUVSX0lNQUdFKTtcbiAgICAgICAgICAgIGxldCBsYXllcmxsID0gZ3JvdXAuZ2V0TGF5ZXJzKCkucmVtb3ZlKGxheWVyKTtcbiAgICAgICAgICAgIGdyb3VwLmdldExheWVycygpLmluc2VydEF0KG5ld1BvcywgbGF5ZXJsbCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGZpbmRMYXllcih1dWlkOiBzdHJpbmcpOiBvbC5sYXllci5CYXNlIHtcbiAgICAgICAgbGV0IGxheWVycyA9IHRoaXMub2xNYXAuZ2V0TGF5ZXJzKCkuZ2V0QXJyYXkoKTtcbiAgICAgICAgZm9yIChsZXQgbGF5ZXIgb2YgbGF5ZXJzKSB7XG4gICAgICAgICAgICBsZXQgc291cmNlOiBvbC5zb3VyY2UuU291cmNlO1xuICAgICAgICAgICAgaWYgKGxheWVyLmdldChVVUlEKSA9PT0gdXVpZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBsYXllcjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobGF5ZXIgaW5zdGFuY2VvZiBvbC5sYXllci5Hcm91cCkge1xuICAgICAgICAgICAgICAgIGxldCBzdWJsYXllcnMgPSAoPG9sLmxheWVyLkdyb3VwPmxheWVyKS5nZXRMYXllcnMoKS5nZXRBcnJheSgpO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IHN1YmxheWVyIG9mIHN1YmxheWVycykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3VibGF5ZXIuZ2V0KFVVSUQpID09PSB1dWlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3VibGF5ZXI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgdXBkYXRlTWFwKCk6IHZvaWQge1xuICAgICAgICB0aGlzLm9sTWFwLnVwZGF0ZVNpemUoKTtcbiAgICB9XG5cbiAgICBjaGFuZ2VDcnMoY3JzOiBzdHJpbmcpIHsgLy8gVE9ET1xuICAgICAgICBsZXQgdG9Qcm9qID0gbnVsbDtcbiAgICAgICAgaWYgKCh0b1Byb2ogPSBvbC5wcm9qLmdldChjcnMpKSkge1xuICAgICAgICAgICAgbGV0IGV4dGVudCA9IE9sNEV4dGVudC5mcm9tQXJyYXkoXG4gICAgICAgICAgICAgICAgdGhpcy5vbE1hcC5nZXRWaWV3KCkuY2FsY3VsYXRlRXh0ZW50KHRoaXMub2xNYXAuZ2V0U2l6ZSgpKSxcbiAgICAgICAgICAgICAgICB0aGlzLmdldFByb2plY3Rpb24oKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGxldCBmcm9tUHJvaiA9IHRoaXMuZ2V0UHJvamVjdGlvbigpO1xuICAgICAgICAgICAgbGV0IGNlbnRlciA9IHRoaXMub2xNYXAuZ2V0VmlldygpLmdldENlbnRlcigpO1xuICAgICAgICAgICAgbGV0IG5ld1ZpZXcgPSBuZXcgb2wuVmlldyh7XG4gICAgICAgICAgICAgICAgcHJvamVjdGlvbjogdG9Qcm9qLFxuICAgICAgICAgICAgICAgIHJlc29sdXRpb25zOiBPbDRVdGlscy5yZXNvbHV0aW9uc0ZvclNjYWxlcyh0aGlzLnNjYWxlcywgdG9Qcm9qLmdldFVuaXRzKCkpLnJldmVyc2UoKSxcbiAgICAgICAgICAgICAgICBleHRlbnQ6IHRoaXMubWF4RXh0ZW50LmdldEV4dGVudCh0b1Byb2opXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGxldCBsYXllcnMgPSAoPG9sLmxheWVyLkdyb3VwPnRoaXMuZmluZExheWVyKExBWUVSX0lNQUdFKSkuZ2V0TGF5ZXJzKCkuZ2V0QXJyYXkoKTtcbiAgICAgICAgICAgIHRoaXMuY2hhbmdlQ3JzTGlzdCgoPG9sLmxheWVyLkdyb3VwPnRoaXMuZmluZExheWVyKExBWUVSX0lNQUdFKSkuZ2V0TGF5ZXJzKCksIGZyb21Qcm9qLCB0b1Byb2opO1xuICAgICAgICAgICAgdGhpcy5jaGFuZ2VDcnNMaXN0KCg8b2wubGF5ZXIuR3JvdXA+dGhpcy5maW5kTGF5ZXIoTEFZRVJfVkVDVE9SKSkuZ2V0TGF5ZXJzKCksIGZyb21Qcm9qLCB0b1Byb2opO1xuXG4gICAgICAgICAgICB0aGlzLm9sTWFwLnNldFZpZXcobmV3Vmlldyk7XG4gICAgICAgICAgICB0aGlzLnpvb21Ub0V4dGVudChleHRlbnQuZ2V0UG9seWdvbkZvckV4dGVudCh0b1Byb2opKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgY2hhbmdlQ3JzTGlzdChsYXllcnM6IG9sLkNvbGxlY3Rpb248b2wubGF5ZXIuQmFzZT4sIGZyb21Qcm9qLCB0b1Byb2opIHtcbiAgICAgICAgZm9yIChsZXQgbGF5ZXIgb2YgbGF5ZXJzLmdldEFycmF5KCkpIHtcbiAgICAgICAgICAgIGxldCBzb3VyY2U6IG9sLnNvdXJjZS5Tb3VyY2U7XG4gICAgICAgICAgICBpZiAoKHNvdXJjZSA9ICg8b2wubGF5ZXIuTGF5ZXI+bGF5ZXIpLmdldFNvdXJjZSgpKSBpbnN0YW5jZW9mIG9sLnNvdXJjZS5JbWFnZVdNUykge1xuICAgICAgICAgICAgICAgIHRoaXMud21zU291cmNlLnJlZnJlc2hTb3VyY2UoPG9sLmxheWVyLkltYWdlPmxheWVyLCBmcm9tUHJvaiwgdG9Qcm9qKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoKHNvdXJjZSA9ICg8b2wubGF5ZXIuTGF5ZXI+bGF5ZXIpLmdldFNvdXJjZSgpKSBpbnN0YW5jZW9mIG9sLnNvdXJjZS5WZWN0b3IpIHtcbiAgICAgICAgICAgICAgICBsZXQgZmVhdHVyZXM6IG9sLkZlYXR1cmVbXSA9ICg8b2wuc291cmNlLlZlY3Rvcj5zb3VyY2UpLmdldEZlYXR1cmVzKCk7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgZmVhdHVyZSBvZiBmZWF0dXJlcykge1xuICAgICAgICAgICAgICAgICAgICBmZWF0dXJlLnNldEdlb21ldHJ5KGZlYXR1cmUuZ2V0R2VvbWV0cnkoKS50cmFuc2Zvcm0oZnJvbVByb2osIHRvUHJvaikpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldFZpc2libGUobGF5ZXJVaWlkOiBzdHJpbmcsIHZpc2libGl0eTogYm9vbGVhbik6IHZvaWQge1xuICAgICAgICBsZXQgbGF5ZXI6IG9sLmxheWVyLkJhc2UgPSB0aGlzLmZpbmRMYXllcihsYXllclVpaWQpO1xuICAgICAgICBpZiAobGF5ZXIpIHtcbiAgICAgICAgICAgIGxheWVyLnNldFZpc2libGUodmlzaWJsaXR5KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldE9wYWNpdHkobGF5ZXJVaWlkOiBzdHJpbmcsIG9wYWNpdHk6IG51bWJlcik6IHZvaWQge1xuICAgICAgICBsZXQgbGF5ZXI6IG9sLmxheWVyLkJhc2UgPSB0aGlzLmZpbmRMYXllcihsYXllclVpaWQpO1xuICAgICAgICBpZiAobGF5ZXIpIHtcbiAgICAgICAgICAgIGxheWVyLnNldE9wYWNpdHkob3BhY2l0eSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkcmFnWm9vbShhY3RpdmF0ZTogYm9vbGVhbiwgb25ab29tRW5kOiBGdW5jdGlvbiA9IG51bGwpIHtcbiAgICAgICAgaWYgKCF0aGlzLmRyYWd6b29tKSB7XG4gICAgICAgICAgICB0aGlzLmRyYWd6b29tID0gbmV3IG9sLmludGVyYWN0aW9uLkRyYWdab29tKHtcbiAgICAgICAgICAgICAgICBjb25kaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBsZXQgZHJhZ3pvb20gPSB0aGlzLmRyYWd6b29tO1xuICAgICAgICAgICAgbGV0IG1hcCA9IHRoaXMub2xNYXA7XG4gICAgICAgICAgICB0aGlzLmRyYWd6b29tLm9uKCdib3hlbmQnLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChldmVudDogb2wuaW50ZXJhY3Rpb24uRHJhdy5FdmVudCkge1xuICAgICAgICAgICAgICAgICAgICBtYXAucmVtb3ZlSW50ZXJhY3Rpb24oZHJhZ3pvb20pO1xuICAgICAgICAgICAgICAgICAgICBpZiAob25ab29tRW5kKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvblpvb21FbmQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhY3RpdmF0ZSkge1xuICAgICAgICAgICAgdGhpcy5vbE1hcC5hZGRJbnRlcmFjdGlvbih0aGlzLmRyYWd6b29tKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMub2xNYXAucmVtb3ZlSW50ZXJhY3Rpb24odGhpcy5kcmFnem9vbSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkcmF3R2VvbWV0cnlGb3JTZWFyY2goZ2VvSnNvbjogT2JqZWN0LCBvbkRyYXdFbmQ6IEZ1bmN0aW9uID0gbnVsbCkge1xuICAgICAgICBsZXQgb2w0bWFwID0gdGhpcztcbiAgICAgICAgbGV0IG9sTWFwID0gdGhpcy5vbE1hcDtcbiAgICAgICAgdGhpcy52ZWNTb3VyY2UuY2xlYXJGZWF0dXJlcyh0aGlzLmRyYXdlci5nZXRMYXllcigpKTtcbiAgICAgICAgdGhpcy52ZWNTb3VyY2Uuc2hvd0ZlYXR1cmVzKHRoaXMuZHJhd2VyLmdldExheWVyKCksIGdlb0pzb24pO1xuICAgICAgICBpZiAob25EcmF3RW5kICE9PSBudWxsKSB7XG4gICAgICAgICAgICBvbkRyYXdFbmQoZ2VvSnNvbik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy56b29tVG9FeHRlbnQodGhpcy5kcmF3ZXIuZ2V0TGF5ZXIoKS5nZXRTb3VyY2UoKS5nZXRFeHRlbnQoKSk7XG4gICAgfVxuXG4gICAgZHJhd1NoYXBlRm9yU2VhcmNoKHNoYXBlVHlwZTogU0hBUEVTID0gbnVsbCwgb25EcmF3RW5kOiBGdW5jdGlvbiA9IG51bGwpIHtcbiAgICAgICAgbGV0IG9sNG1hcCA9IHRoaXM7XG4gICAgICAgIGxldCBvbE1hcCA9IHRoaXMub2xNYXA7XG4gICAgICAgIGNvbnN0IHNoYXBlOiBTSEFQRVMgPSB0eXBlb2Ygc2hhcGVUeXBlID09PSAnc3RyaW5nJyA/IFNIQVBFU1s8c3RyaW5nPiBzaGFwZVR5cGVdIDogc2hhcGVUeXBlO1xuICAgICAgICBpZiAodGhpcy5kcmF3ZXIuZ2V0SW50ZXJhY3Rpb24oKSkge1xuICAgICAgICAgICAgdGhpcy5vbE1hcC5yZW1vdmVJbnRlcmFjdGlvbih0aGlzLmRyYXdlci5nZXRJbnRlcmFjdGlvbigpKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRyYXdlci5zZXRJbnRlcmFjdGlvbihzaGFwZSwgT2w0VXRpbHMuZ2V0U3R5bGUodGhpcy5zdHlsZXNbJ3NlYXJjaCddKSk7XG4gICAgICAgIGlmICh0aGlzLmRyYXdlci5nZXRJbnRlcmFjdGlvbigpKSB7XG4gICAgICAgICAgICBsZXQgZHJhd2VyID0gdGhpcy5kcmF3ZXI7XG4gICAgICAgICAgICB0aGlzLmdldERyYXdlcigpLmdldExheWVyKCkuZ2V0U291cmNlKCkuY2xlYXIoKTtcbiAgICAgICAgICAgIHRoaXMub2xNYXAuYWRkSW50ZXJhY3Rpb24odGhpcy5kcmF3ZXIuZ2V0SW50ZXJhY3Rpb24oKSk7XG4gICAgICAgICAgICB0aGlzLmRyYXdlci5nZXRJbnRlcmFjdGlvbigpLm9uKFxuICAgICAgICAgICAgICAgICdkcmF3c3RhcnQnLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIG9sNG1hcC5nZXREcmF3ZXIoKS5nZXRMYXllcigpLmdldFNvdXJjZSgpLmNsZWFyKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHRoaXMuZHJhd2VyLmdldEludGVyYWN0aW9uKCkub24oXG4gICAgICAgICAgICAgICAgJ2RyYXdlbmQnLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBnZW9qc29uID0gbmV3IG9sLmZvcm1hdC5HZW9KU09OKCkud3JpdGVGZWF0dXJlT2JqZWN0KFxuICAgICAgICAgICAgICAgICAgICAgICAgZS5mZWF0dXJlLFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkYXRhUHJvamVjdGlvbic6IE1FVEFET1JfRVBTRyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZmVhdHVyZVByb2plY3Rpb24nOiBvbDRtYXAuZ2V0UHJvamVjdGlvbigpXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIG9uRHJhd0VuZChnZW9qc29uKTtcbiAgICAgICAgICAgICAgICAgICAgb2xNYXAucmVtb3ZlSW50ZXJhY3Rpb24oZHJhd2VyLmdldEludGVyYWN0aW9uKCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmdldERyYXdlcigpLmdldExheWVyKCkuZ2V0U291cmNlKCkuY2xlYXIoKTtcbiAgICAgICAgICAgIG9uRHJhd0VuZChudWxsKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGVudW0gU0hBUEVTIHtOT05FLCBCT1gsIFBPTFlHT059XG47XG5cbmV4cG9ydCBjbGFzcyBPbDREcmF3ZXIge1xuICAgIC8vIHByaXZhdGUgc3RhdGljIF9pbnN0YW5jZTogT2w0RHJhd2VyO1xuICAgIHByb3RlY3RlZCBsYXllcjogb2wubGF5ZXIuVmVjdG9yO1xuICAgIHByb3RlY3RlZCBpbnRlcmFjdGlvbjogb2wuaW50ZXJhY3Rpb24uRHJhdztcblxuICAgIGNvbnN0cnVjdG9yKGxheWVyOiBvbC5sYXllci5WZWN0b3IpIHtcbiAgICAgICAgdGhpcy5sYXllciA9IGxheWVyO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRMYXllcigpOiBvbC5sYXllci5WZWN0b3Ige1xuICAgICAgICByZXR1cm4gdGhpcy5sYXllcjtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0SW50ZXJhY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmludGVyYWN0aW9uO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRJbnRlcmFjdGlvbih0eXBlOiBTSEFQRVMsIGRyYXdTdHlsZTogb2wuc3R5bGUuU3R5bGUpIHtcbiAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICBjYXNlIFNIQVBFUy5CT1g6XG4gICAgICAgICAgICAgICAgdGhpcy5pbnRlcmFjdGlvbiA9IG5ldyBvbC5pbnRlcmFjdGlvbi5EcmF3KHtcbiAgICAgICAgICAgICAgICAgICAgc291cmNlOiB0aGlzLmxheWVyLmdldFNvdXJjZSgpLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnQ2lyY2xlJyxcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IGRyYXdTdHlsZSxcbiAgICAgICAgICAgICAgICAgICAgZ2VvbWV0cnlGdW5jdGlvbjogY3JlYXRlQm94KCkgLy8gb2wuZC50cyBoYXMgbm8gZnVuY3Rpb24gXCJvbC5pbnRlcmFjdGlvbi5EcmF3LmNyZWF0ZUJveCgpXCJcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgU0hBUEVTLlBPTFlHT046XG4gICAgICAgICAgICAgICAgdGhpcy5pbnRlcmFjdGlvbiA9IG5ldyBvbC5pbnRlcmFjdGlvbi5EcmF3KHtcbiAgICAgICAgICAgICAgICAgICAgc291cmNlOiB0aGlzLmxheWVyLmdldFNvdXJjZSgpLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnUG9seWdvbicsXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiBkcmF3U3R5bGVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhpcy5pbnRlcmFjdGlvbiA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogb2wuZC50cyBoYXMgbm8gZnVuY3Rpb24gXCJvbC5pbnRlcmFjdGlvbi5EcmF3LmNyZWF0ZUJveCgpXCJcbiAqIEByZXR1cm5zIHsoY29vcmRpbmF0ZXM6YW55LCBvcHRfZ2VvbWV0cnk6YW55KT0+YW55fG9sLmdlb20uUG9seWdvbn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUJveCgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtIHtvbC5Db29yZGluYXRlfEFycmF5LjxvbC5Db29yZGluYXRlPnxBcnJheS48QXJyYXkuPG9sLkNvb3JkaW5hdGU+Pn0gY29vcmRpbmF0ZXNcbiAgICAgICAgICogQHBhcmFtIHtvbC5nZW9tLlNpbXBsZUdlb21ldHJ5PX0gb3B0X2dlb21ldHJ5XG4gICAgICAgICAqIEByZXR1cm4ge29sLmdlb20uU2ltcGxlR2VvbWV0cnl9XG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiAoY29vcmRpbmF0ZXMsIG9wdF9nZW9tZXRyeSkge1xuICAgICAgICAgICAgdmFyIGV4dGVudCA9IG9sLmV4dGVudC5ib3VuZGluZ0V4dGVudChjb29yZGluYXRlcyk7XG4gICAgICAgICAgICB2YXIgZ2VvbWV0cnkgPSBvcHRfZ2VvbWV0cnkgfHwgbmV3IG9sLmdlb20uUG9seWdvbihudWxsKTtcbiAgICAgICAgICAgIGdlb21ldHJ5LnNldENvb3JkaW5hdGVzKFtbXG4gICAgICAgICAgICAgICAgb2wuZXh0ZW50LmdldEJvdHRvbUxlZnQoZXh0ZW50KSxcbiAgICAgICAgICAgICAgICBvbC5leHRlbnQuZ2V0Qm90dG9tUmlnaHQoZXh0ZW50KSxcbiAgICAgICAgICAgICAgICBvbC5leHRlbnQuZ2V0VG9wUmlnaHQoZXh0ZW50KSxcbiAgICAgICAgICAgICAgICBvbC5leHRlbnQuZ2V0VG9wTGVmdChleHRlbnQpLFxuICAgICAgICAgICAgICAgIG9sLmV4dGVudC5nZXRCb3R0b21MZWZ0KGV4dGVudClcbiAgICAgICAgICAgIF1dKTtcbiAgICAgICAgICAgIHJldHVybiBnZW9tZXRyeTtcbiAgICAgICAgfVxuICAgICk7XG59O1xuXG5cbmV4cG9ydCBjbGFzcyBVaVV0aWxzIHtcblxufVxuXG5leHBvcnQgY2xhc3MgR2VvbUxvYWRlciB7XG4gICAgcHJpdmF0ZSBtYXA6IE9sNE1hcDtcbiAgICBwcml2YXRlIGZvcm06IEhUTUxGb3JtRWxlbWVudDtcblxuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcihtYXA6IE9sNE1hcCwgZm9ybTogSFRNTEZvcm1FbGVtZW50KSB7XG4gICAgICAgIHRoaXMubWFwID0gbWFwO1xuICAgICAgICB0aGlzLmZvcm0gPSBmb3JtO1xuICAgICAgICB0aGlzLm9uKCk7XG4gICAgfVxuXG4gICAgcHVibGljIG9uKCkge1xuICAgICAgICB0aGlzLmZvcm0uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgdGhpcy51cGxvYWQuYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgIH1cblxuICAgIHByaXZhdGUgdXBsb2FkKGU6IEV2ZW50KSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGUpO1xuICAgICAgICAvLyBIdHRwVXRpbHMuSHR0cC5zZW5kRm9ybSh0aGlzLmZvcm0sIHRoaXMuZm9ybS5hY3Rpb24sIEh0dHBVdGlscy5IVFRQX01FVEhPRC5QT1NULCBIdHRwVXRpbHMuSFRUUF9EQVRBVFlQRS5qc29uKVxuICAgICAgICAvLyAgICAgLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIC8vICAgICAgICAgY29uc29sZS5sb2coJ0NvbnRlbnRzOiAnICsgdmFsdWUpO1xuICAgICAgICAvLyAgICAgfSlcbiAgICAgICAgLy8gICAgIC5jYXRjaChmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgIC8vICAgICAgICAgY29uc29sZS5lcnJvcihyZWFzb24pO1xuICAgICAgICAvLyAgICAgfSk7XG4gICAgfVxufSIsImltcG9ydCB7VElUTEUsIFVVSUQsIExBWUVSX1VVSUQsIE9sNE1hcH0gZnJvbSBcIi4vT2w0XCI7XG5pbXBvcnQge0xheWVyVHJlZX0gZnJvbSAnLi9MYXllclRyZWUnO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgT2w0U291cmNlIHtcblxuICAgIGFic3RyYWN0IGNyZWF0ZUxheWVyKGxheWVyVXVpZDogc3RyaW5nLCBvcHRpb25zOiBhbnksIHByb2o6IG9sLlByb2plY3Rpb25MaWtlLCB2aXNpYmxlOiBib29sZWFuLCBvcGFjaXR5OiBudW1iZXIpO1xuXG4gICAgYWJzdHJhY3QgcmVmcmVzaFNvdXJjZShsYXllcjogb2wubGF5ZXIuQmFzZSwgZnJvbVByb2o6IG9sLlByb2plY3Rpb25MaWtlLCB0b1Byb2o6IG9sLlByb2plY3Rpb25MaWtlKTtcblxuICAgIC8vXG4gICAgLy8gYWJzdHJhY3Qgc2hvd0xheWVyKCk7XG4gICAgLy9cbiAgICAvLyBhYnN0cmFjdCBoaWRlTGF5ZXIoKTtcbn1cblxuZXhwb3J0IGNsYXNzIE9sNFZlY3RvclNvdXJjZSBpbXBsZW1lbnRzIE9sNFNvdXJjZSB7XG4gICAgcHJpdmF0ZSBzdGF0aWMgX2luc3RhbmNlOiBPbDRWZWN0b3JTb3VyY2U7XG4gICAgcHJvdGVjdGVkIHNob3dhYmxlOiBib29sZWFuID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBvbDRNYXA6IE9sNE1hcDtcblxuICAgIHByaXZhdGUgY29uc3RydWN0b3Iob2w0TWFwOiBPbDRNYXApIHtcbiAgICAgICAgLy8gc3VwZXIoZmFsc2UpO1xuICAgICAgICB0aGlzLm9sNE1hcCA9IG9sNE1hcDtcbiAgICAgICAgLy8gdGhpcy5zZXRTaG93YWJsZShmYWxzZSk7XG4gICAgfVxuXG4gICAgc3RhdGljIGNyZWF0ZShvbDRtYXA6IE9sNE1hcCk6IE9sNFZlY3RvclNvdXJjZSB7XG4gICAgICAgIGlmICghT2w0VmVjdG9yU291cmNlLl9pbnN0YW5jZSkgey8vIHNpbmdsZXRvblxuICAgICAgICAgICAgT2w0VmVjdG9yU291cmNlLl9pbnN0YW5jZSA9IG5ldyBPbDRWZWN0b3JTb3VyY2Uob2w0bWFwKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gT2w0VmVjdG9yU291cmNlLl9pbnN0YW5jZTtcbiAgICB9XG5cbiAgICBjcmVhdGVMYXllcihsYXllclV1aWQ6IHN0cmluZywgb3B0aW9uczogYW55LCBwcm9qOiBvbC5Qcm9qZWN0aW9uTGlrZSwgdmlzaWJsZTogYm9vbGVhbiA9IHRydWUsIG9wYWNpdHk6IG51bWJlciA9IDEuMCk6IG9sLmxheWVyLlZlY3RvciB7XG4gICAgICAgIGxldCB2TGF5ZXIgPSBuZXcgb2wubGF5ZXIuVmVjdG9yKHtcbiAgICAgICAgICAgIHNvdXJjZTogbmV3IG9sLnNvdXJjZS5WZWN0b3Ioe3dyYXBYOiBmYWxzZX0pLFxuICAgICAgICAgICAgc3R5bGU6IG9wdGlvbnNbJ3N0eWxlJ11cbiAgICAgICAgfSk7XG4gICAgICAgIHZMYXllci5zZXQoVVVJRCwgbGF5ZXJVdWlkKTtcbiAgICAgICAgcmV0dXJuIHZMYXllcjtcbiAgICB9XG5cbiAgICByZWZyZXNoU291cmNlKGxheWVyOiBvbC5sYXllci5CYXNlLCBmcm9tUHJvajogb2wuUHJvamVjdGlvbkxpa2UsIHRvUHJvajogb2wuUHJvamVjdGlvbkxpa2UpIHtcbiAgICAgICAgbGV0IHNvdXJjZSA9ICg8b2wubGF5ZXIuTGF5ZXI+bGF5ZXIpLmdldFNvdXJjZSgpO1xuICAgICAgICBsZXQgZmVhdHVyZXM6IG9sLkZlYXR1cmVbXSA9ICg8b2wuc291cmNlLlZlY3Rvcj5zb3VyY2UpLmdldEZlYXR1cmVzKCk7XG4gICAgICAgIGZvciAobGV0IGZlYXR1cmUgb2YgZmVhdHVyZXMpIHtcbiAgICAgICAgICAgIGZlYXR1cmUuc2V0R2VvbWV0cnkoZmVhdHVyZS5nZXRHZW9tZXRyeSgpLnRyYW5zZm9ybShmcm9tUHJvaiwgdG9Qcm9qKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvL1xuICAgIC8vIHNob3dMYXllcigpe1xuICAgIC8vXG4gICAgLy8gfVxuICAgIC8vXG4gICAgLy8gaGlkZUxheWVyKCl7XG4gICAgLy9cbiAgICAvLyB9XG5cbiAgICBzaG93RmVhdHVyZXModkxheWVyOiBvbC5sYXllci5WZWN0b3IsIGdlb0pzb246IE9iamVjdCkge1xuICAgICAgICBsZXQgZ2VvSnNvblJlYWRlcjogb2wuZm9ybWF0Lkdlb0pTT04gPSBuZXcgb2wuZm9ybWF0Lkdlb0pTT04oKTtcbiAgICAgICAgbGV0IGRhdGFwcm9qID0gZ2VvSnNvblJlYWRlci5yZWFkUHJvamVjdGlvbihnZW9Kc29uKTtcbiAgICAgICAgbGV0IGZlYXR1cmVzID0gZ2VvSnNvblJlYWRlci5yZWFkRmVhdHVyZXMoXG4gICAgICAgICAgICBnZW9Kc29uLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICdkYXRhUHJvamVjdGlvbic6IGdlb0pzb25SZWFkZXIucmVhZFByb2plY3Rpb24oZ2VvSnNvbiksXG4gICAgICAgICAgICAgICAgJ2ZlYXR1cmVQcm9qZWN0aW9uJzogdGhpcy5vbDRNYXAuZ2V0UHJvamVjdGlvbigpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgdkxheWVyLmdldFNvdXJjZSgpLmFkZEZlYXR1cmVzKGZlYXR1cmVzKTtcbiAgICB9XG5cbiAgICBjbGVhckZlYXR1cmVzKHZMYXllcjogb2wubGF5ZXIuVmVjdG9yKSB7XG4gICAgICAgIHZMYXllci5nZXRTb3VyY2UoKS5jbGVhcih0cnVlKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBPbDRXbXNTb3VyY2UgaW1wbGVtZW50cyBPbDRTb3VyY2Uge1xuICAgIHByaXZhdGUgc3RhdGljIF9pbnN0YW5jZTogT2w0V21zU291cmNlO1xuICAgIHByaXZhdGUgb2w0TWFwOiBPbDRNYXA7XG4gICAgcHJpdmF0ZSB1c2VMb2FkRXZlbnRzOiBib29sZWFuO1xuICAgIHByaXZhdGUgbGF5ZXJ0cmVlOiBMYXllclRyZWU7XG5cbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKG9sNE1hcDogT2w0TWFwLCB1c2VMb2FkRXZlbnRzOiBib29sZWFuID0gdHJ1ZSwgbGF5ZXJ0cmVlOiBMYXllclRyZWUgPSBudWxsKSB7XG4gICAgICAgIHRoaXMub2w0TWFwID0gb2w0TWFwO1xuICAgICAgICB0aGlzLnVzZUxvYWRFdmVudHMgPSB1c2VMb2FkRXZlbnRzO1xuICAgICAgICB0aGlzLmxheWVydHJlZSA9IGxheWVydHJlZTtcbiAgICB9XG5cbiAgICBzdGF0aWMgY3JlYXRlKG9sNE1hcDogT2w0TWFwLCB1c2VMb2FkRXZlbnRzOiBib29sZWFuID0gdHJ1ZSwgbGF5ZXJ0cmVlOiBMYXllclRyZWUgPSBudWxsKTogT2w0V21zU291cmNlIHtcbiAgICAgICAgaWYgKCFPbDRXbXNTb3VyY2UuX2luc3RhbmNlKSB7Ly8gc2luZ2xldG9uXG4gICAgICAgICAgICBPbDRXbXNTb3VyY2UuX2luc3RhbmNlID0gbmV3IE9sNFdtc1NvdXJjZShvbDRNYXAsIHVzZUxvYWRFdmVudHMsIGxheWVydHJlZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE9sNFdtc1NvdXJjZS5faW5zdGFuY2U7XG4gICAgfVxuXG4gICAgY3JlYXRlTGF5ZXIobGF5ZXJVdWlkOiBzdHJpbmcsIG9wdGlvbnM6IGFueSA9IG51bGwsIHByb2o6IG9sLlByb2plY3Rpb25MaWtlLCB2aXNpYmxlOiBib29sZWFuLCBvcGFjaXR5OiBudW1iZXIpOiBvbC5sYXllci5JbWFnZSB7XG4gICAgICAgIGxldCBzb3VyY2UgPSB0aGlzLmNyZWF0ZVNvdXJjZShsYXllclV1aWQsIG9wdGlvbnNbJ3VybCddLCBvcHRpb25zWydwYXJhbXMnXSwgcHJvaik7XG4gICAgICAgIGxldCBzb3VyY2VXbXMgPSBuZXcgb2wubGF5ZXIuSW1hZ2Uoe1xuICAgICAgICAgICAgc291cmNlOiBzb3VyY2UsXG4gICAgICAgICAgICB2aXNpYmxlOiB2aXNpYmxlLFxuICAgICAgICAgICAgb3BhY2l0eTogb3BhY2l0eVxuICAgICAgICB9KTtcbiAgICAgICAgc291cmNlV21zLnNldChVVUlELCBsYXllclV1aWQpO1xuICAgICAgICBpZiAob3B0aW9uc1sndGl0bGUnXSkge1xuICAgICAgICAgICAgc291cmNlV21zLnNldChUSVRMRSwgb3B0aW9uc1sndGl0bGUnXSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMubGF5ZXJ0cmVlICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLmxheWVydHJlZS5hZGQoc291cmNlV21zKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc291cmNlV21zO1xuICAgIH1cblxuICAgIHByaXZhdGUgY3JlYXRlU291cmNlKGxheWVyVXVpZDogc3RyaW5nLCB1cmw6IHN0cmluZywgcGFyYW1zOiBhbnksIHByb2o6IG9sLlByb2plY3Rpb25MaWtlKTogb2wuc291cmNlLkltYWdlV01TIHtcbiAgICAgICAgbGV0IHNvdXJjZSA9IG5ldyBvbC5zb3VyY2UuSW1hZ2VXTVMoe1xuICAgICAgICAgICAgdXJsOiB1cmwsXG4gICAgICAgICAgICBwYXJhbXM6IHBhcmFtcyxcbiAgICAgICAgICAgIHByb2plY3Rpb246IHByb2pcbiAgICAgICAgfSk7XG4gICAgICAgIHNvdXJjZS5zZXQoTEFZRVJfVVVJRCwgbGF5ZXJVdWlkKTtcbiAgICAgICAgdGhpcy5zZXRMb2FkRXZlbnRzKHNvdXJjZSk7XG4gICAgICAgIHJldHVybiBzb3VyY2U7XG4gICAgfVxuXG4gICAgcmVmcmVzaFNvdXJjZShsYXllcjogb2wubGF5ZXIuQmFzZSwgZnJvbVByb2o6IG9sLlByb2plY3Rpb25MaWtlLCB0b1Byb2o6IG9sLlByb2plY3Rpb25MaWtlKSB7XG4gICAgICAgIGxldCBvbGRzb3VyY2UgPSA8b2wuc291cmNlLkltYWdlV01TPig8b2wubGF5ZXIuTGF5ZXI+bGF5ZXIpLmdldFNvdXJjZSgpO1xuICAgICAgICAoPG9sLmxheWVyLkxheWVyPmxheWVyKS5zZXRTb3VyY2UodGhpcy5jcmVhdGVTb3VyY2UobGF5ZXIuZ2V0KFVVSUQpLCBvbGRzb3VyY2UuZ2V0VXJsKCksIG9sZHNvdXJjZS5nZXRQYXJhbXMoKSwgdG9Qcm9qKSk7XG4gICAgfVxuXG4gICAgLy9cbiAgICAvLyBzaG93TGF5ZXIoKXtcbiAgICAvL1xuICAgIC8vIH1cbiAgICAvL1xuICAgIC8vIGhpZGVMYXllcigpe1xuICAgIC8vXG4gICAgLy8gfVxuXG4gICAgcHJpdmF0ZSBzZXRMb2FkRXZlbnRzKHNvdXJjZTogb2wuc291cmNlLkltYWdlV01TKSB7XG4gICAgICAgIGlmICh0aGlzLnVzZUxvYWRFdmVudHMpIHtcbiAgICAgICAgICAgIHNvdXJjZS5vbignaW1hZ2Vsb2Fkc3RhcnQnLCBPbDRXbXNTb3VyY2UuaW1hZ2VMb2FkU3RhcnQpO1xuICAgICAgICAgICAgc291cmNlLm9uKCdpbWFnZWxvYWRlbmQnLCBPbDRXbXNTb3VyY2UuaW1hZ2VMb2FkRW5kKTtcbiAgICAgICAgICAgIHNvdXJjZS5vbignaW1hZ2Vsb2FkZXJyb3InLCBPbDRXbXNTb3VyY2UuaW1hZ2VMb2FkRXJyb3IpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIGltYWdlTG9hZFN0YXJ0KGU6IG9sLnNvdXJjZS5JbWFnZUV2ZW50KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdzdGFydCcsICg8b2wuc291cmNlLkltYWdlV01TPmUudGFyZ2V0KS5nZXQoTEFZRVJfVVVJRCkpO1xuICAgIH1cblxuICAgIHN0YXRpYyBpbWFnZUxvYWRFbmQoZTogb2wuc291cmNlLkltYWdlRXZlbnQpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ2VuZCcsICg8b2wuc291cmNlLkltYWdlV01TPmUudGFyZ2V0KS5nZXQoTEFZRVJfVVVJRCkpO1xuICAgIH1cblxuICAgIHN0YXRpYyBpbWFnZUxvYWRFcnJvcihlOiBvbC5zb3VyY2UuSW1hZ2VFdmVudCkge1xuICAgICAgICBjb25zb2xlLmxvZygnZXJyb3InLCAoPG9sLnNvdXJjZS5JbWFnZVdNUz5lLnRhcmdldCkuZ2V0KExBWUVSX1VVSUQpKTtcbiAgICAgICAgLy8gKDxvbC5zb3VyY2UuSW1hZ2VXTVM+ZS50YXJnZXQpLnJlZnJlc2goKTtcbiAgICB9XG59XG4iLCJleHBvcnQgY2xhc3MgRUVsZW1lbnQge1xuICAgIHByaXZhdGUgX2VsZW1lbnQ6IEhUTUxFbGVtZW50O1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQ6IEhUTUxFbGVtZW50KXtcbiAgICAgICAgdGhpcy5fZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgfVxuXG4gICAgZ2V0IGVsZW1lbnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9lbGVtZW50O1xuICAgIH1cblxuICAgIHNldEF0dHJzKGF0dHJzOiBPYmplY3QgPSB7fSkge1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBhdHRycykge1xuICAgICAgICAgICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoa2V5LCBhdHRyc1trZXldKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzZXRBdHRyKGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKGtleSwgdmFsdWUpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgZ2V0QXR0cihrZXk6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gdGhpcy5fZWxlbWVudC5nZXRBdHRyaWJ1dGUoa2V5KTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBkb20ge1xuICAgIC8vIHByaXZhdGUgc3RhdGljIGRhdGEgPSBkYXRhO1xuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gdGFnbmFtZVxuICAgICAqIEBwYXJhbSBvcHRpb25zXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fVxuICAgICAqL1xuICAgIHN0YXRpYyBjcmVhdGUodGFnbmFtZTogc3RyaW5nLCBhdHRyczogYW55ID0ge30sIGNsYXNzZXM6IHN0cmluZ1tdID0gW10sIHRleHQ6IHN0cmluZyA9ICcnLCBkYXRhOiBhbnkgPSB7fSk6IEhUTUxFbGVtZW50IHtcbiAgICAgICAgbGV0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZ25hbWUpO1xuICAgICAgICByZXR1cm4gZG9tLmFkZChlbGVtZW50LCBhdHRycywgY2xhc3NlcywgdGV4dCwgZGF0YSk7XG4gICAgfVxuXG4gICAgc3RhdGljIGFkZChlbGVtZW50OiBIVE1MRWxlbWVudCwgYXR0cnM6IGFueSA9IHt9LCBjbGFzc2VzOiBzdHJpbmdbXSA9IFtdLCB0ZXh0OiBzdHJpbmcgPSAnJywgZGF0YTogYW55ID0ge30pOiBIVE1MRWxlbWVudCB7XG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIGF0dHJzKSB7XG4gICAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShrZXksIGF0dHJzW2tleV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChjb25zdCBuYW1lIG9mIGNsYXNzZXMpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChuYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGV4dCAhPT0gJycpIHtcbiAgICAgICAgICAgIGVsZW1lbnQudGV4dENvbnRlbnQgPSB0ZXh0O1xuICAgICAgICB9XG4gICAgICAgIC8vIGZvciAoY29uc3Qga2V5IGluIGRhdGEpIHtcbiAgICAgICAgLy8gICAgIGVsZW1lbnQuZGF0YXNldFtrZXldID0gZGF0YVtrZXldO1xuICAgICAgICAvLyB9XG5cbiAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gc2VsZWN0b3JcbiAgICAgKiBAcmV0dXJucyB7Tm9kZUxpc3RPZjxFbGVtZW50Pn1cbiAgICAgKi9cbiAgICBzdGF0aWMgZmluZChzZWxlY3Rvcjogc3RyaW5nLCBjb250ZXh0OiBhbnkgPSBkb2N1bWVudCk6IE5vZGVMaXN0T2Y8RWxlbWVudD4ge1xuICAgICAgICBpZiAoY29udGV4dCBpbnN0YW5jZW9mIERvY3VtZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gY29udGV4dC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgICAgICAgfSBlbHNlIGlmIChjb250ZXh0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBjb250ZXh0LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7IC8vIFRPRE8gcmV0dXJuIGEgYmxhbmsgTm9kZUxpc3RPZjxFbGVtZW50PlxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gc2VsZWN0b3JcbiAgICAgKiBAcmV0dXJucyB7RWxlbWVudHxudWxsfVxuICAgICAqL1xuICAgIHN0YXRpYyBmaW5kRmlyc3Qoc2VsZWN0b3I6IHN0cmluZywgY29udGV4dDogYW55ID0gZG9jdW1lbnQpOiBFbGVtZW50IHtcbiAgICAgICAgaWYgKGNvbnRleHQgaW5zdGFuY2VvZiBEb2N1bWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGNvbnRleHQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgICAgIH0gZWxzZSBpZiAoY29udGV4dCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gY29udGV4dC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZWxlbWVudFxuICAgICAqIEBwYXJhbSBuYW1lXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgYW4gZWxlbWVudCBjb250YWlucyBhIGNsYXNzIG5hbWVcbiAgICAgKi9cbiAgICBzdGF0aWMgaGFzQ2xhc3MoZWxlbWVudDogSFRNTEVsZW1lbnQsIG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gZWxlbWVudCAhPT0gbnVsbCAmJiBlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhuYW1lKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZWxlbWVudFxuICAgICAqIEBwYXJhbSBuYW1lXG4gICAgICogQHJldHVybnMge0VsZW1lbnR9XG4gICAgICovXG4gICAgc3RhdGljIGFkZENsYXNzKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBuYW1lOiBzdHJpbmcpOiBIVE1MRWxlbWVudCB8IG51bGwge1xuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQobmFtZSk7XG4gICAgICAgIHJldHVybiBlbGVtZW50O1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBwYXJhbSBlbGVtZW50XG4gICAgICogQHBhcmFtIG5hbWVcbiAgICAgKiBAcmV0dXJucyB7RWxlbWVudH1cbiAgICAgKi9cbiAgICBzdGF0aWMgcmVtb3ZlQ2xhc3MoZWxlbWVudDogSFRNTEVsZW1lbnQsIG5hbWU6IHN0cmluZyk6IEhUTUxFbGVtZW50IHwgbnVsbCB7XG4gICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShuYW1lKTtcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0gbmFtZVxuICAgICAqIEByZXR1cm5zIHtFbGVtZW50fVxuICAgICAqL1xuICAgIHN0YXRpYyB0b2dnbGVDbGFzcyhlbGVtZW50OiBFbGVtZW50LCBuYW1lOiBzdHJpbmcpOiBFbGVtZW50IHwgbnVsbCB7XG4gICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShuYW1lKTtcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgfVxuXG4gICAgLy9cbiAgICAvLyAvKipcbiAgICAvLyAgKiBSZXR1cm5zIHdpdGggZWxlbWVudCBiaW5kZWQgZGF0YS5cbiAgICAvLyAgKiBAcGFyYW0gZWxlbWVudFxuICAgIC8vICAqIEBwYXJhbSBrZXlcbiAgICAvLyAgKiBAcmV0dXJucyB7YW55fVxuICAgIC8vICAqL1xuICAgIC8vIHN0YXRpYyBnZXREYXRhKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBrZXk6IHN0cmluZyA9IG51bGwpOiBhbnkge1xuICAgIC8vICAgICBpZiAoIWRvbS5oYXNEYXRhKGVsZW1lbnQsIGtleSkpIHtcbiAgICAvLyAgICAgICAgIHJldHVybiBudWxsO1xuICAgIC8vICAgICB9IGVsc2UgaWYgKGtleSA9PT0gbnVsbCkge1xuICAgIC8vICAgICAgICAgcmV0dXJuIGRvbS5kYXRhLmdldChlbGVtZW50KTtcbiAgICAvLyAgICAgfSBlbHNlIHtcbiAgICAvLyAgICAgICAgIHJldHVybiBkb20uZGF0YS5nZXQoZWxlbWVudClba2V5XTtcbiAgICAvLyAgICAgfVxuICAgIC8vIH1cbiAgICAvL1xuICAgIC8vIC8qKlxuICAgIC8vICAqIEJpbmRzIHdpdGggYW4gZWxlbWVudCBhIGRhdGEuXG4gICAgLy8gICogQHBhcmFtIGVsZW1lbnRcbiAgICAvLyAgKiBAcGFyYW0ga2V5XG4gICAgLy8gICogQHBhcmFtIHZhbHVlXG4gICAgLy8gICovXG4gICAgLy8gc3RhdGljIHNldERhdGEoZWxlbWVudDogSFRNTEVsZW1lbnQsIGtleTogc3RyaW5nLCB2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgLy8gICAgIGlmICghZG9tLmhhc0RhdGEoZWxlbWVudCkpIHtcbiAgICAvLyAgICAgICAgIGRvbS5kYXRhLnNldChlbGVtZW50LCB7a2V5OiB2YWx1ZX0pO1xuICAgIC8vICAgICB9IGVsc2Uge1xuICAgIC8vICAgICAgICAgbGV0IHRtcCA9IGRvbS5nZXREYXRhKGVsZW1lbnQpO1xuICAgIC8vICAgICAgICAgdG1wW2tleV0gPSB2YWx1ZTtcbiAgICAvLyAgICAgICAgIGRvbS5kYXRhLnNldChlbGVtZW50LCB0bXApO1xuICAgIC8vICAgICB9XG4gICAgLy8gfVxuICAgIC8vXG4gICAgLy8gLyoqXG4gICAgLy8gICogQ2hlY2tzIGlmIHRoZSBlbGVtZW50IGlzIGJpbmRpbmcgd2l0aCBhIGRhdGFcbiAgICAvLyAgKiBAcGFyYW0gZWxlbWVudFxuICAgIC8vICAqIEBwYXJhbSBrZXlcbiAgICAvLyAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAvLyAgKi9cbiAgICAvLyBzdGF0aWMgaGFzRGF0YShlbGVtZW50OiBIVE1MRWxlbWVudCwga2V5OiBzdHJpbmcgPSBudWxsKTogYm9vbGVhbiB7XG4gICAgLy8gICAgIGlmICghZG9tLmRhdGEuaGFzKGVsZW1lbnQpKSB7XG4gICAgLy8gICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgLy8gICAgIH0gZWxzZSBpZiAoa2V5ID09PSBudWxsKSB7XG4gICAgLy8gICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAvLyAgICAgfSBlbHNlIHtcbiAgICAvLyAgICAgICAgIHJldHVybiBkb20uZ2V0RGF0YShlbGVtZW50KVtrZXldICE9PSBudWxsID8gdHJ1ZSA6IGZhbHNlO1xuICAgIC8vICAgICB9XG4gICAgLy8gfVxuICAgIC8vXG4gICAgLy8gLyoqXG4gICAgLy8gICogRGVsZXRlcyB3aXRoIGFuIGVsZW1lbnQgYmluZGluZyBkYXRhXG4gICAgLy8gICogQHBhcmFtIGVsZW1lbnRcbiAgICAvLyAgKiBAcGFyYW0ga2V5XG4gICAgLy8gICovXG4gICAgLy8gc3RhdGljIGRlbGV0ZURhdGEoZWxlbWVudDogSFRNTEVsZW1lbnQsIGtleTogc3RyaW5nID0gbnVsbCk6IHZvaWQge1xuICAgIC8vICAgICBpZiAoZG9tLmhhc0RhdGEoZWxlbWVudCwga2V5KSkge1xuICAgIC8vICAgICAgICAgaWYgKGtleSA9PT0gbnVsbCkge1xuICAgIC8vICAgICAgICAgICAgIGRvbS5kYXRhLmRlbGV0ZShlbGVtZW50KTtcbiAgICAvLyAgICAgICAgIH0gZWxzZSB7XG4gICAgLy8gICAgICAgICAgICAgbGV0IHRtcCA9IGRvbS5nZXREYXRhKGVsZW1lbnQpO1xuICAgIC8vICAgICAgICAgICAgIGRlbGV0ZSB0bXBba2V5XTtcbiAgICAvLyAgICAgICAgICAgICBkb20uZGF0YS5zZXQoZWxlbWVudCwgdG1wKTtcbiAgICAvLyAgICAgICAgIH1cbiAgICAvLyAgICAgfVxuICAgIC8vIH1cbn0iLCJpbXBvcnQgKiBhcyBtZXRhZG9yIGZyb20gJy4vT2w0JztcblxuZGVjbGFyZSB2YXIgQ29uZmlndXJhdGlvbjogYW55O1xuXG5sZXQgY29udGV4dDogYW55ID0gV2luZG93O1xuY29udGV4dC5tZXRhZG9yID0gbWV0YWRvcjtcblxuZXhwb3J0IGZ1bmN0aW9uIGluaXQoKSB7XG5cbiAgICB2YXIgbWV0YWRvck1hcENvbmZpZyA9IHtcbiAgICAgICAgbWFwOiB7XG4gICAgICAgICAgICB0YXJnZXQ6ICdtYXAnLFxuICAgICAgICAgICAgc3JzOiBbXCJFUFNHOjQzMjZcIiwgXCJFUFNHOjMxNDY2XCIsIFwiRVBTRzoyNTgzMlwiXVxuICAgICAgICB9LFxuICAgICAgICB2aWV3OiB7XG4gICAgICAgICAgICBwcm9qZWN0aW9uOiBDb25maWd1cmF0aW9uLnNldHRpbmdzWydtYXBfY3JzJ10sLy8nOiAnOSw0OSwxMSw1MycsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdcbiAgICAgICAgICAgIG1heEV4dGVudDogQ29uZmlndXJhdGlvbi5zZXR0aW5nc1snbWFwX2Jib3hfbWF4J10uc3BsaXQoLyxcXHM/LyksLy9bNS44LCA0Ny4wLCAxNS4wLCA1NS4wXSwgLy8gcHJpb3JpdHkgZm9yIHNjYWxlcyBvciBmb3IgbWF4RXh0ZW50P1xuICAgICAgICAgICAgc3RhcnRFeHRlbnQ6IENvbmZpZ3VyYXRpb24uc2V0dGluZ3NbJ21hcF9iYm94X3N0YXJ0J10uc3BsaXQoLyxcXHM/LyksXG4gICAgICAgICAgICBzY2FsZXM6IFs1MDAwLCAyNTAwMCwgNTAwMDAsIDEwMDAwMCwgMjAwMDAwLCAyNTAwMDAsIDUwMDAwMCwgMTAwMDAwMCwgMjAwMDAwMCwgNTAwMDAwMCwgMTAwMDAwMDBdLy8sIDIwMDAwMDAwLCA1MDAwMDAwMF1cbiAgICAgICAgfSxcbiAgICAgICAgc3R5bGVzOiB7XG4gICAgICAgICAgICBoaWdobGlnaHQ6IHtcbiAgICAgICAgICAgICAgICBmaWxsOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiAncmdiYSg2MCwgNjAsIDI1NSwgMC4xKSdcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHN0cm9rZToge1xuICAgICAgICAgICAgICAgICAgICBjb2xvcjogJ3JnYmEoNjAsIDYwLCAyNTUsIDEuMCknLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogMlxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZWFyY2g6IHtcbiAgICAgICAgICAgICAgICBmaWxsOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiAncmdiYSgyNTUsIDYwLCA2MCwgMC4xKSdcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHN0cm9rZToge1xuICAgICAgICAgICAgICAgICAgICBjb2xvcjogJ3JnYmEoMjU1LCA2MCwgNjAsIDEuMCknLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogMlxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgaW1hZ2U6IHtcbiAgICAgICAgICAgICAgICAgICAgY2lyY2xlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByYWRpdXM6IDUsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxsOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6ICdyZ2JhKDI1NSwgNjAsIDYwLCAwLjYpJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBzb3VyY2U6IFtdLFxuICAgICAgICAvLyBhZGQgYWRkaXRpb25hbCBwYXJhbWV0ZXJzIHdpdGggKyBcIkFERElUSU9OQUxcIlxuICAgICAgICBwcm9qNERlZnM6IHtcbiAgICAgICAgICAgIFwiRVBTRzo0MzI2XCI6IFwiK3Byb2o9bG9uZ2xhdCArZGF0dW09V0dTODQgK3VuaXRzPWRlZ3JlZXMgK25vX2RlZnNcIiArIFwiICtheGlzPW5ldVwiLFxuICAgICAgICAgICAgXCJFUFNHOjQyNThcIjogXCIrcHJvaj1sb25nbGF0ICtlbGxwcz1HUlM4MCArdG93Z3M4ND0wLDAsMCwwLDAsMCwwICtub19kZWZzXCIgKyBcIiArdW5pdHM9ZGVncmVlcyArYXhpcz1uZXVcIixcbiAgICAgICAgICAgIFwiRVBTRzozMTQ2NlwiOiBcIitwcm9qPXRtZXJjICtsYXRfMD0wICtsb25fMD02ICtrPTEgK3hfMD0yNTAwMDAwICt5XzA9MCArZWxscHM9YmVzc2VsICt0b3dnczg0PTU5OC4xLDczLjcsNDE4LjIsMC4yMDIsMC4wNDUsLTIuNDU1LDYuNyArdW5pdHM9bSArbm9fZGVmc1wiICsgXCIgK2F4aXM9bmV1XCIsXG4gICAgICAgICAgICBcIkVQU0c6MzE0NjdcIjogXCIrcHJvaj10bWVyYyArbGF0XzA9MCArbG9uXzA9OSAraz0xICt4XzA9MzUwMDAwMCAreV8wPTAgK2VsbHBzPWJlc3NlbCArdG93Z3M4ND01OTguMSw3My43LDQxOC4yLDAuMjAyLDAuMDQ1LC0yLjQ1NSw2LjcgK3VuaXRzPW0gK25vX2RlZnNcIiArIFwiICtheGlzPW5ldVwiLFxuICAgICAgICAgICAgLy8gXCJFUFNHOjMxNDY4XCI6IFwiK3Byb2o9dG1lcmMgK2xhdF8wPTAgK2xvbl8wPTEyICtrPTEgK3hfMD00NTAwMDAwICt5XzA9MCArZWxscHM9YmVzc2VsICt0b3dnczg0PTU5OC4xLDczLjcsNDE4LjIsMC4yMDIsMC4wNDUsLTIuNDU1LDYuNyArdW5pdHM9bSArbm9fZGVmc1wiICsgXCIgK2F4aXM9bmV1XCIsXG4gICAgICAgICAgICAvLyBcIkVQU0c6MzE0NjlcIjogXCIrcHJvaj10bWVyYyArbGF0XzA9MCArbG9uXzA9MTUgK2s9MSAreF8wPTU1MDAwMDAgK3lfMD0wICtlbGxwcz1iZXNzZWwgK3Rvd2dzODQ9NTk4LjEsNzMuNyw0MTguMiwwLjIwMiwwLjA0NSwtMi40NTUsNi43ICt1bml0cz1tICtub19kZWZzXCIgKyBcIiArYXhpcz1uZXVcIixcbiAgICAgICAgICAgIFwiRVBTRzoyNTgzMlwiOiBcIitwcm9qPXV0bSArem9uZT0zMiArZWxscHM9R1JTODAgK3Rvd2dzODQ9MCwwLDAsMCwwLDAsMCArdW5pdHM9bSArbm9fZGVmc1wiLFxuICAgICAgICAgICAgLy8gXCJFUFNHOjI1ODMzXCI6IFwiK3Byb2o9dXRtICt6b25lPTMzICtlbGxwcz1HUlM4MCArdG93Z3M4ND0wLDAsMCwwLDAsMCwwICt1bml0cz1tICtub19kZWZzXCJcbiAgICAgICAgfSxcbiAgICAgICAgY29tcG9uZW50OiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY2xhc3M6ICcnLFxuICAgICAgICAgICAgICAgIHNlbGVjdG9yOiBcIlwiXG4gICAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICB9O1xuXG4gICAgLy8gY29uc29sZS5sb2coQ29uZmlndXJhdGlvbik7XG4gICAgZm9yIChjb25zdCBrZXkgaW4gQ29uZmlndXJhdGlvbi5jb25maWcubWFwX2JhY2tncm91bmQpIHtcbiAgICAgICAgbGV0IHdtcyA9IENvbmZpZ3VyYXRpb24uY29uZmlnLm1hcF9iYWNrZ3JvdW5kW2tleV07XG4gICAgICAgIGxldCBsYXllcnMgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBsIGluIHdtcy5sYXllcnMpIHtcbiAgICAgICAgICAgIGxheWVycy5wdXNoKHdtcy5sYXllcnNbbF0pO1xuICAgICAgICB9XG4gICAgICAgIG1ldGFkb3JNYXBDb25maWcuc291cmNlLnB1c2goe1xuICAgICAgICAgICAgJ3R5cGUnOiAnV01TJyxcbiAgICAgICAgICAgICd1cmwnOiB3bXMudXJsLFxuICAgICAgICAgICAgJ3RpdGxlJzogd21zLnRpdGxlLFxuICAgICAgICAgICAgJ29wYWNpdHknOiB3bXMub3BhY2l0eSxcbiAgICAgICAgICAgICd2aXNpYmxlJzogd21zLnZpc2libGUsXG4gICAgICAgICAgICAncGFyYW1zJzoge1xuICAgICAgICAgICAgICAgICdMQVlFUlMnOiBsYXllcnMuam9pbihcIixcIiksXG4gICAgICAgICAgICAgICAgJ1ZFUlNJT04nOiB3bXMudmVyc2lvbixcbiAgICAgICAgICAgICAgICAnRk9STUFUJzogd21zLmZvcm1hdFxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLy8gY29uc29sZS5sb2cobWV0YWRvck1hcENvbmZpZyk7XG4gICAgbGV0IG1ldGFkb3JNYXAgPSBtZXRhZG9yLk9sNE1hcC5jcmVhdGUobWV0YWRvck1hcENvbmZpZyk7XG4gICAgLy8gbWV0YWRvck1hcC5pbml0TGF5ZXJ0cmVlKCk7XG4gICAgbWV0YWRvclsnbWV0YWRvck1hcCddID0gbWV0YWRvck1hcDtcbiAgICAvLyBtZXRhZG9yWydnZW9tTG9hZGVyJ10gPSBuZXcgbWV0YWRvci5HZW9tTG9hZGVyKG1ldGFkb3JNYXAsIDxIVE1MRm9ybUVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2ZpbGUtdXBsb2FkLWZvcm0nKSk7XG59XG5cbm1ldGFkb3JbJ2luaXRNYXAnXSA9IGluaXQ7Il19
