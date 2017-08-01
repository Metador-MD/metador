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
        var interactions = ol.interaction.defaults({
            altShiftDragRotate: false,
            pinchRotate: false
        });
        this.olMap = new ol.Map({
            interactions: interactions,
            target: options['map']['target'],
            renderer: 'canvas'
        });
        this.olMap.setView(this.createView(proj, this.maxExtent.getExtent(proj), Ol4Utils.resolutionsForScales(this.scales, proj.getUnits()).reverse()));
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
    Ol4Map.prototype.createView = function (proj, extent, resolutions) {
        return new ol.View({
            projection: proj,
            resolutions: resolutions,
            extent: extent
        });
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
    Ol4Map.prototype.addLayerForOptions = function (options) {
        if (options['type'] === 'WMS') {
            var wmsLayer = this.addLayer(this.wmsSource.createLayer(Ol4Map.getUuid('olay-'), options, this.olMap.getView().getProjection(), options['visible'], parseFloat(options['opacity'])));
        }
        else {
            console.error(options['type'] + ' is not supported.');
        }
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
            var layers = this.findLayer(exports.LAYER_IMAGE).getLayers().getArray();
            this.changeCrsList(this.findLayer(exports.LAYER_IMAGE).getLayers(), fromProj, toProj);
            this.changeCrsList(this.findLayer(exports.LAYER_VECTOR).getLayers(), fromProj, toProj);
            this.olMap.setView(this.createView(toProj, this.maxExtent.getExtent(toProj), Ol4Utils.resolutionsForScales(this.scales, toProj.getUnits()).reverse()));
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
        if (this.useLoadEvents) {
            Ol4WmsSource.mapActivity = MapActivity.create();
        }
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
        if (Ol4WmsSource.mapActivity) {
            Ol4WmsSource.mapActivity.loadStart(e.target.get(Ol4_1.LAYER_UUID));
        }
    };
    Ol4WmsSource.imageLoadEnd = function (e) {
        if (Ol4WmsSource.mapActivity) {
            Ol4WmsSource.mapActivity.loadEnd(e.target.get(Ol4_1.LAYER_UUID));
        }
    };
    Ol4WmsSource.imageLoadError = function (e) {
        if (Ol4WmsSource.mapActivity) {
            Ol4WmsSource.mapActivity.loadError(e.target.get(Ol4_1.LAYER_UUID));
        }
    };
    return Ol4WmsSource;
}());
exports.Ol4WmsSource = Ol4WmsSource;
var MapActivity = (function () {
    function MapActivity() {
        this.layers = {};
        this.isLoading = false;
    }
    MapActivity.create = function () {
        if (!MapActivity._instance) {
            MapActivity._instance = new MapActivity();
        }
        return MapActivity._instance;
    };
    MapActivity.prototype.activityStart = function (layerName) {
        this.layers[layerName] = true;
        if (this.isLoading === false) {
            this.isLoading = true;
            window['metador'].preloaderStart();
        }
    };
    MapActivity.prototype.activityEnd = function (layerName) {
        if (this.layers[layerName]) {
            delete this.layers[layerName];
        }
        for (var layerN in this.layers) {
            return;
        }
        this.isLoading = false;
        window['metador'].preloaderStop();
    };
    MapActivity.prototype.loadStart = function (layerName) {
        this.activityStart(layerName);
    };
    MapActivity.prototype.loadEnd = function (layerName) {
        this.activityEnd(layerName);
    };
    MapActivity.prototype.loadError = function (layerName) {
        this.activityEnd(layerName);
    };
    return MapActivity;
}());
exports.MapActivity = MapActivity;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvUGx1Z2lucy9XaGVyZUdyb3VwL01hcEJ1bmRsZS9SZXNvdXJjZXMvdHMvTGF5ZXJUcmVlLnRzIiwic3JjL1BsdWdpbnMvV2hlcmVHcm91cC9NYXBCdW5kbGUvUmVzb3VyY2VzL3RzL09sNC50cyIsInNyYy9QbHVnaW5zL1doZXJlR3JvdXAvTWFwQnVuZGxlL1Jlc291cmNlcy90cy9PbDRTb3VyY2UudHMiLCJzcmMvUGx1Z2lucy9XaGVyZUdyb3VwL01hcEJ1bmRsZS9SZXNvdXJjZXMvdHMvZG9tLnRzIiwic3JjL1BsdWdpbnMvV2hlcmVHcm91cC9NYXBCdW5kbGUvUmVzb3VyY2VzL3RzL21hcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsNkJBQTBCO0FBQzFCLDZCQUEwQztBQUcxQztJQWNJLG1CQUFvQixNQUFjO1FBSDFCLGlCQUFZLEdBQUcsSUFBSSxDQUFDO1FBQ3BCLGdCQUFXLEdBQUcsQ0FBQyxDQUFDO1FBR3BCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxJQUFJLEdBQWdCLFNBQUcsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQy9ELEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ3hCLElBQUksS0FBSyxHQUFHLFNBQUcsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDOUQsSUFBSSxDQUFDLHlCQUF5QixDQUFjLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM3RCxDQUFDO0lBQ0wsQ0FBQztJQUVNLGdCQUFNLEdBQWIsVUFBYyxNQUFjO1FBQ3hCLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDdkIsU0FBUyxDQUFD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QVMsRUFBRSxHQUFHLENBQUMsT0FBTztZQUN0QixTQUFTLEVBQUUsR0FBRyxDQUFDLE9BQU87WUFDdEIsUUFBUSxFQUFFO2dCQUNOLFFBQVEsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQztnQkFDMUIsU0FBUyxFQUFFLEdBQUcsQ0FBQyxPQUFPO2dCQUN0QixRQUFRLEVBQUUsR0FBRyxDQUFDLE1BQU07YUFDdkI7U0FDSixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUV6RCxPQUFPLENBQUMsWUFBWSxDQUFDLEdBQUcsVUFBVSxDQUFDO0FBRXZDLENBQUM7QUF0RkQsb0JBc0ZDO0FBRUQsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLElBQUksQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQge2RvbX0gZnJvbSAnLi9kb20nO1xuaW1wb3J0IHtUSVRMRSwgVVVJRCwgT2w0TWFwfSBmcm9tIFwiLi9PbDRcIjtcbi8vIGltcG9ydCAqIGFzICQgZnJvbSAnanF1ZXJ5JztcblxuZXhwb3J0IGNsYXNzIExheWVyVHJlZSB7XG4gICAgcHJpdmF0ZSBzdGF0aWMgX2luc3RhbmNlOiBMYXllclRyZWU7XG4gICAgcHJpdmF0ZSBzdGF0aWMgbWF4bGVuZ3RoOiBudW1iZXIgPSAxNjtcbiAgICBwcml2YXRlIHN0YXRpYyB0cmVlc2VsZWN0b3I6IHN0cmluZyA9ICcuLWpzLW1hcC1sYXllcnRyZWUgdWwubGF5ZXItdHJlZS1saXN0JztcbiAgICBwcml2YXRlIHN0YXRpYyBkdW1teXNlbGVjdG9yOiBzdHJpbmcgPSAnLi1qcy1kdW1teS1sYXllcic7XG4gICAgcHJpdmF0ZSBzdGF0aWMgdXNlT3BhY2l0eTogYm9vbGVhbiA9IHRydWU7XG4gICAgcHJpdmF0ZSBzdGF0aWMgdXNlVmlzaWJsZTogYm9vbGVhbiA9IHRydWU7XG4gICAgcHJpdmF0ZSBzdGF0aWMgdXNlU29ydGFibGU6IGJvb2xlYW4gPSB0cnVlO1xuICAgIHByaXZhdGUgc3RhdGljIHNob3dTdGF0dXM6IGJvb2xlYW4gPSB0cnVlO1xuICAgIHByaXZhdGUgb2w0TWFwOiBPbDRNYXA7XG4gICAgcHJpdmF0ZSB0cmVlOiBIVE1MRWxlbWVudDtcbiAgICBwcml2YXRlIGN1cnJlbnRMYXllciA9IG51bGw7XG4gICAgcHJpdmF0ZSBvbGRQb3NpdGlvbiA9IDA7XG5cbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKG9sNE1hcDogT2w0TWFwKSB7XG4gICAgICAgIHRoaXMub2w0TWFwID0gb2w0TWFwO1xuICAgICAgICB0aGlzLnRyZWUgPSA8SFRNTEVsZW1lbnQ+ZG9tLmZpbmRGaXJzdChMYXllclRyZWUudHJlZXNlbGVjdG9yKTtcbiAgICAgICAgaWYgKExheWVyVHJlZS51c2VTb3J0YWJsZSkge1xuICAgICAgICAgICAgbGV0IGR1bW15ID0gZG9tLmZpbmRGaXJzdChMYXllclRyZWUuZHVtbXlzZWxlY3RvciwgdGhpcy50cmVlKTtcbiAgICAgICAgICAgIHRoaXMuYWRkRHJhZ2dhYmxlRXZlbnRMaXN0ZW5lcig8SFRNTEVsZW1lbnQ+ZHVtbXksIHRydWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIGNyZWF0ZShvbDRNYXA6IE9sNE1hcCk6IExheWVyVHJlZSB7XG4gICAgICAgIGlmICghTGF5ZXJUcmVlLl9pbnN0YW5jZSkgey8vIHNpbmdsZXRvblxuICAgICAgICAgICAgTGF5ZXJUcmVlLl9pbnN0YW5jZSA9IG5ldyBMYXllclRyZWUob2w0TWFwKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gTGF5ZXJUcmVlLl9pbnN0YW5jZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN1YnN0cmluZ1RpdGxlKHRleHQ6IHN0cmluZykge1xuICAgICAgICBpZiAodGV4dC5sZW5ndGggPiBMYXllclRyZWUubWF4bGVuZ3RoKSB7XG4gICAgICAgICAgICB0ZXh0ID0gdGV4dC5zdWJzdHJpbmcoMCwgTGF5ZXJUcmVlLm1heGxlbmd0aCk7XG4gICAgICAgICAgICBpZiAodGV4dC5sYXN0SW5kZXhPZignICcpID4gMCkge1xuICAgICAgICAgICAgICAgIHRleHQgPSB0ZXh0LnN1YnN0cmluZygwLCB0ZXh0Lmxhc3RJbmRleE9mKCcgJykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0ZXh0O1xuICAgIH1cblxuICAgIGFkZChsYXllcjogb2wubGF5ZXIuQmFzZSkge1xuICAgICAgICBsZXQgbGF5ZXJOb2RlID0gZG9tLmNyZWF0ZSgnbGknLCB7J2lkJzogbGF5ZXIuZ2V0KFVVSUQpLCAnZHJhZ2dhYmxlJzogXCJ0cnVlXCJ9LCBbJ2RyYWdnYWJsZScsICctanMtZHJhZ2dhYmxlJ10pO1xuICAgICAgICBpZiAoTGF5ZXJUcmVlLnVzZVZpc2libGUpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkVmlzaWJsZShsYXllck5vZGUsIGxheWVyKTtcbiAgICAgICAgfVxuICAgICAgICBsYXllck5vZGUuYXBwZW5kQ2hpbGQoXG4gICAgICAgICAgICBkb20uY3JlYXRlKCdsYWJlbCcsXG4gICAgICAgICAgICAgICAgeydpZCc6IGxheWVyLmdldChVVUlEKSwgJ2Zvcic6ICdjaGItJyArIGxheWVyLmdldChVVUlEKSwgJ3RpdGxlJzogbGF5ZXIuZ2V0KFRJVExFKX0sXG4gICAgICAgICAgICAgICAgWydmb3JtLWxhYmVsJ10sIHRoaXMuc3Vic3RyaW5nVGl0bGUobGF5ZXIuZ2V0KFRJVExFKSkpXG4gICAgICAgICk7XG4gICAgICAgIGlmIChMYXllclRyZWUudXNlT3BhY2l0eSkge1xuICAgICAgICAgICAgdGhpcy5hZGRPcGFjaXR5KGxheWVyTm9kZSwgbGF5ZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy50cmVlLmluc2VydEJlZm9yZShsYXllck5vZGUsIGRvbS5maW5kRmlyc3QoJ2xpJywgdGhpcy50cmVlKSk7XG4gICAgICAgIGlmIChMYXllclRyZWUudXNlU29ydGFibGUpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkRHJhZ2dhYmxlRXZlbnRMaXN0ZW5lcihsYXllck5vZGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhZGRWaXNpYmxlKGxheWVyTm9kZTogSFRNTEVsZW1lbnQsIGxheWVyOiBvbC5sYXllci5CYXNlKSB7XG4gICAgICAgIGxldCBpbnB1dCA9IGRvbS5jcmVhdGUoJ2lucHV0Jywgeyd0eXBlJzogJ2NoZWNrYm94J30sXG4gICAgICAgICAgICBbJ2NoZWNrJywgJy1qcy1tYXAtc291cmNlLXZpc2libGUnXSk7XG4gICAgICAgICg8SFRNTEZvcm1FbGVtZW50PmlucHV0KS5jaGVja2VkID0gbGF5ZXIuZ2V0VmlzaWJsZSgpO1xuICAgICAgICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCB0aGlzLmNoYW5nZVZpc2libGUuYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgICAgICBsYXllck5vZGUuYXBwZW5kQ2hpbGQoaW5wdXQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgY2hhbmdlVmlzaWJsZShlKXtcbiAgICAgICAgdGhpcy5vbDRNYXAuc2V0VmlzaWJsZShlLnRhcmdldC5wYXJlbnRFbGVtZW50LmlkLCBlLnRhcmdldC5jaGVja2VkKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFkZE9wYWNpdHkobGF5ZXJOb2RlOiBIVE1MRWxlbWVudCwgbGF5ZXI6IG9sLmxheWVyLkJhc2UpOiB2b2lkIHtcbiAgICAgICAgbGV0IHNlbGVjdCA9IGRvbS5jcmVhdGUoJ3NlbGVjdCcsIHt9LFxuICAgICAgICAgICAgWydpbnB1dC1lbGVtZW50JywgJ21lZGl1bScsICdzaW1wbGUnLCAnanMtbWFwLXNvdXJjZS1vcGFjaXR5JywgJy1qcy1tYXAtc291cmNlLW9wYWNpdHknXSk7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPD0gMTA7IGkrKykge1xuICAgICAgICAgICAgc2VsZWN0LmFwcGVuZENoaWxkKGRvbS5jcmVhdGUoJ29wdGlvbicsIHsndmFsdWUnOiBpIC8gMTB9LCBbXSwgKGkgKiAxMCkgKyAnICUnKSk7XG4gICAgICAgIH1cbiAgICAgICAgKDxIVE1MRm9ybUVsZW1lbnQ+c2VsZWN0KS52YWx1ZSA9IGxheWVyLmdldE9wYWNpdHkoKS50b1N0cmluZygpO1xuICAgICAgICBzZWxlY3QuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgdGhpcy5jaGFuZ2VPcGFjaXR5LmJpbmQodGhpcyksIGZhbHNlKTtcbiAgICAgICAgbGF5ZXJOb2RlLmFwcGVuZENoaWxkKHNlbGVjdCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjaGFuZ2VPcGFjaXR5KGUpe1xuICAgICAgICB0aGlzLm9sNE1hcC5zZXRPcGFjaXR5KGUudGFyZ2V0LnBhcmVudEVsZW1lbnQuaWQsIHBhcnNlRmxvYXQoZS50YXJnZXQudmFsdWUpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFkZERyYWdnYWJsZUV2ZW50TGlzdGVuZXIobGF5ZXI6IEhUTUxFbGVtZW50LCBpc0R1bW15OmJvb2xlYW4gPSBmYWxzZSkge1xuXG4gICAgICAgIGlmICghaXNEdW1teSkge1xuICAgICAgICAgICAgbGF5ZXIuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ3N0YXJ0JywgdGhpcy5kcmFnU3RhcnQuYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgICAgICAgICAgbGF5ZXIuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ2VuZCcsIHRoaXMuZHJhZ0VuZC5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgICAgbGF5ZXIuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ2VudGVyJywgdGhpcy5kcmFnRW50ZXIuYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgICAgICBsYXllci5hZGRFdmVudExpc3RlbmVyKCdkcmFnb3ZlcicsIHRoaXMuZHJhZ092ZXIuYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgICAgICBsYXllci5hZGRFdmVudExpc3RlbmVyKCdkcm9wJywgdGhpcy5kcmFnRHJvcC5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgfVxuXG5cbiAgICBwcml2YXRlIGRyYWdTdGFydChlKSB7XG4gICAgICAgIHRoaXMuY3VycmVudExheWVyID0gZS50YXJnZXQ7XG4gICAgICAgIHRoaXMub2xkUG9zaXRpb24gPSB0aGlzLmdldExheWVyUG9zaXRpb24odGhpcy5jdXJyZW50TGF5ZXIpO1xuICAgICAgICBlLmRhdGFUcmFuc2Zlci5lZmZlY3RBbGxvd2VkID0gJ21vdmUnO1xuICAgICAgICBlLmRhdGFUcmFuc2Zlci5zZXREYXRhKCd0ZXh0L2h0bWwnLCB0aGlzLmN1cnJlbnRMYXllci5pbm5lckhUTUwpO1xuICAgICAgICBkb20uYWRkQ2xhc3ModGhpcy5jdXJyZW50TGF5ZXIsIFwibW92ZVwiKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGRyYWdPdmVyKGUpIHtcbiAgICAgICAgaWYgKGUucHJldmVudERlZmF1bHQpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgICAgICBlLmRhdGFUcmFuc2Zlci5kcm9wRWZmZWN0ID0gJ21vdmUnO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBkcmFnRW50ZXIoZSkge1xuICAgICAgICBpZiAodGhpcy5jdXJyZW50TGF5ZXIgIT09IGUudG9FbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy50cmVlLmluc2VydEJlZm9yZSh0aGlzLmN1cnJlbnRMYXllciwgZS50b0VsZW1lbnQuZHJhZ2dhYmxlID8gZS50b0VsZW1lbnQgOiBlLnRvRWxlbWVudC5wYXJlbnRFbGVtZW50KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgZHJhZ0Ryb3AoZSkge1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGRvbS5yZW1vdmVDbGFzcyhlLnRhcmdldCwgXCJvdmVyXCIpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZHJhZ0VuZChlKSB7XG4gICAgICAgIGRvbS5yZW1vdmVDbGFzcyhlLnRhcmdldCwgXCJtb3ZlXCIpO1xuICAgICAgICB0aGlzLm9sNE1hcC5tb3ZlTGF5ZXIodGhpcy5jdXJyZW50TGF5ZXIuaWQsIHRoaXMub2xkUG9zaXRpb24sIHRoaXMuZ2V0TGF5ZXJQb3NpdGlvbih0aGlzLmN1cnJlbnRMYXllcikpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0TGF5ZXJQb3NpdGlvbihsYXllcikge1xuICAgICAgICBsZXQgbGlzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy4tanMtbWFwLWxheWVydHJlZSB1bCAuLWpzLWRyYWdnYWJsZScpO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChsaXN0W2ldLmlkID09PSBsYXllci5pZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBsaXN0Lmxlbmd0aCAtIDEgLSBpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cbiIsImltcG9ydCAqIGFzIG9wZW5sYXllcnM0IGZyb20gJ29wZW5sYXllcnMnO1xuLy8gaW1wb3J0ICogYXMganF1ZXJ5IGZyb20gJ2pxdWVyeSc7XG5pbXBvcnQge0xheWVyVHJlZX0gZnJvbSAnLi9MYXllclRyZWUnO1xuaW1wb3J0IHtPbDRTb3VyY2UsIE9sNFZlY3RvclNvdXJjZSwgT2w0V21zU291cmNlfSBmcm9tIFwiLi9PbDRTb3VyY2VcIlxuXG5kZWNsYXJlIGNsYXNzIHByb2o0IHtcbiAgICBzdGF0aWMgZGVmcyhuYW1lOiBzdHJpbmcsIGRlZjogc3RyaW5nKTogdm9pZDtcbn1cblxuXG4vLyBkZWNsYXJlIGZ1bmN0aW9uIGFkZFNvdXJjZShpZDogc3RyaW5nLCB0aXRsZTogc3RyaW5nLCB2aXNpYmlsaXR5OiBib29sZWFuLCBvcGFjaXR5OiBudW1iZXIpOiB2b2lkO1xuXG5leHBvcnQgY2xhc3MgT2w0VXRpbHMge1xuICAgIC8qIFxuICAgICAqIHVuaXRzOiAnZGVncmVlcyd8J2Z0J3wnbSd8J3VzLWZ0J1xuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgcmVzb2x1dGlvblNjYWxlRmFjdG9yKHVuaXRzOiBzdHJpbmcpOiBudW1iZXIge1xuICAgICAgICBsZXQgZHBpID0gMjUuNCAvIDAuMjg7XG4gICAgICAgIGxldCBtcHUgPSBvbC5wcm9qLk1FVEVSU19QRVJfVU5JVFt1bml0c107XG4gICAgICAgIGxldCBpbmNoZXNQZXJNZXRlciA9IDM5LjM3O1xuICAgICAgICByZXR1cm4gbXB1ICogaW5jaGVzUGVyTWV0ZXIgKiBkcGk7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyByZXNvbHV0aW9uRm9yU2NhbGUoc2NhbGU6IG51bWJlciwgZmFjdG9yOiBudW1iZXIpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gc2NhbGUgLyBmYWN0b3I7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyByZXNvbHV0aW9uc0ZvclNjYWxlcyhzY2FsZXM6IG51bWJlcltdLCB1bml0czogc3RyaW5nKTogbnVtYmVyW10ge1xuICAgICAgICBsZXQgcmVzb2x1dGlvbnMgPSBbXTtcbiAgICAgICAgbGV0IGZhY3RvciA9IE9sNFV0aWxzLnJlc29sdXRpb25TY2FsZUZhY3Rvcih1bml0cyk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2NhbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICByZXNvbHV0aW9ucy5wdXNoKE9sNFV0aWxzLnJlc29sdXRpb25Gb3JTY2FsZShzY2FsZXNbaV0sIGZhY3RvcikpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXNvbHV0aW9ucztcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIHNjYWxlRm9yUmVzb2x1dGlvbihyZXNvbHV0aW9uOiBudW1iZXIsIGZhY3RvcjogbnVtYmVyKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHJlc29sdXRpb24gKiBmYWN0b3I7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBzY2FsZXNGb3JSZXNvbHV0aW9ucyhyZXNvbHV0aW9uczogbnVtYmVyW10sIHVuaXRzOiBzdHJpbmcpOiBudW1iZXJbXSB7XG4gICAgICAgIGxldCBzY2FsZXMgPSBbXTtcbiAgICAgICAgbGV0IGZhY3RvciA9IE9sNFV0aWxzLnJlc29sdXRpb25TY2FsZUZhY3Rvcih1bml0cyk7XG4gICAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCByZXNvbHV0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgc2NhbGVzLnB1c2goT2w0VXRpbHMuc2NhbGVGb3JSZXNvbHV0aW9uKHJlc29sdXRpb25zW2ldLCBmYWN0b3IpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2NhbGVzO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgaW5pdFByb2o0RGVmcyhwcm9qNERlZnM6IGFueSk6IHZvaWQge1xuICAgICAgICBmb3IgKGNvbnN0IG5hbWUgaW4gcHJvajREZWZzKSB7XG4gICAgICAgICAgICBwcm9qNC5kZWZzKG5hbWUsIHByb2o0RGVmc1tuYW1lXSk7XG4gICAgICAgICAgICBsZXQgcHIgPSBvbC5wcm9qLmdldChuYW1lKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0UHJvaihwcm9qQ29kZTogc3RyaW5nKTogb2wucHJvai5Qcm9qZWN0aW9uIHtcbiAgICAgICAgcmV0dXJuIG9sLnByb2ouZ2V0KHByb2pDb2RlKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGdldFN0eWxlKG9wdGlvbnM6IGFueSwgc3R5bGU6IG9sLnN0eWxlLlN0eWxlID0gbnVsbCk6IG9sLnN0eWxlLlN0eWxlIHtcbiAgICAgICAgbGV0IHN0eWxlXyA9IHN0eWxlID8gc3R5bGUgOiBuZXcgb2wuc3R5bGUuU3R5bGUoKTtcbiAgICAgICAgc3R5bGVfLnNldEZpbGwobmV3IG9sLnN0eWxlLkZpbGwob3B0aW9uc1snZmlsbCddKSk7XG4gICAgICAgIHN0eWxlXy5zZXRTdHJva2UobmV3IG9sLnN0eWxlLlN0cm9rZShvcHRpb25zWydzdHJva2UnXSkpO1xuICAgICAgICBpZiAob3B0aW9uc1snaW1hZ2UnXSAmJiBvcHRpb25zWydpbWFnZSddWydjaXJjbGUnXSkge1xuICAgICAgICAgICAgc3R5bGVfLnNldEltYWdlKG5ldyBvbC5zdHlsZS5DaXJjbGUoe1xuICAgICAgICAgICAgICAgICAgICByYWRpdXM6IG9wdGlvbnNbJ2ltYWdlJ11bJ2NpcmNsZSddWydyYWRpdXMnXSxcbiAgICAgICAgICAgICAgICAgICAgZmlsbDogbmV3IG9sLnN0eWxlLkZpbGwoe1xuICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6IG9wdGlvbnNbJ2ltYWdlJ11bJ2NpcmNsZSddWydmaWxsJ11bJ2NvbG9yJ11cbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3R5bGVfO1xuICAgICAgICAvL1xuICAgICAgICAvLyByZXR1cm4gbmV3IG9sLnN0eWxlXy5TdHlsZSh7XG4gICAgICAgIC8vICAgICBmaWxsOiBuZXcgb2wuc3R5bGVfLkZpbGwob3B0aW9uc1snZmlsbCddKSxcbiAgICAgICAgLy8gICAgIHN0cm9rZTogbmV3IG9sLnN0eWxlXy5TdHJva2Uob3B0aW9uc1snc3Ryb2tlJ10pLy8sXG4gICAgICAgIC8vICAgICAvLyBpbWFnZTogbmV3IG9sLnN0eWxlXy5DaXJjbGUoe1xuICAgICAgICAvLyAgICAgLy8gICAgIHJhZGl1czogNyxcbiAgICAgICAgLy8gICAgIC8vICAgICBmaWxsOiBuZXcgb2wuc3R5bGVfLkZpbGwob3B0aW9uc1snZmlsbCddKVxuICAgICAgICAvLyAgICAgLy8gfSlcbiAgICAgICAgLy8gfSk7XG4gICAgfVxuXG4vLyBmaWxsXG4vLyB7XG4vLyAgICAgY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4yKVxuLy8gfVxuLy8gc3Ryb2tlXG4vLyB7XG4vLyAgICAgY29sb3I6ICcjZmZjYzMzJyxcbi8vICAgICB3aWR0aDogMlxuLy8gICAgIGRhc2g6XG4vLyB9XG4vLyBpbWFnZVxufVxuXG5leHBvcnQgY2xhc3MgT2w0R2VvbSB7XG4gICAgcHJvdGVjdGVkIGdlb206IG9sLmdlb20uR2VvbWV0cnkgPSBudWxsO1xuICAgIHByb3RlY3RlZCBwcm9qOiBvbC5wcm9qLlByb2plY3Rpb24gPSBudWxsO1xuXG4gICAgY29uc3RydWN0b3IoZ2VvbTogb2wuZ2VvbS5HZW9tZXRyeSwgcHJvajogb2wucHJvai5Qcm9qZWN0aW9uKSB7XG4gICAgICAgIHRoaXMuZ2VvbSA9IGdlb207XG4gICAgICAgIHRoaXMucHJvaiA9IHByb2o7XG4gICAgfVxuXG4gICAgZ2V0R2VvbSgpOiBvbC5nZW9tLkdlb21ldHJ5IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2VvbTtcbiAgICB9XG5cbiAgICBnZXRQcm9qKCk6IG9sLnByb2ouUHJvamVjdGlvbiB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb2o7XG4gICAgfVxuXG4gICAgZ2V0RXh0ZW50KHByb2o6IG9sLnByb2ouUHJvamVjdGlvbik6IG9sLkV4dGVudCB7XG4gICAgICAgIGlmICh0aGlzLnByb2ogIT09IHByb2opIHtcbiAgICAgICAgICAgIHJldHVybiAoPG9sLmdlb20uR2VvbWV0cnk+KDxhbnk+IHRoaXMuZ2VvbSkuY2xvbmUoKSkudHJhbnNmb3JtKHRoaXMucHJvaiwgcHJvaikuZ2V0RXh0ZW50KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gKDxvbC5nZW9tLkdlb21ldHJ5Pig8YW55PiB0aGlzLmdlb20pLmNsb25lKCkpLmdldEV4dGVudCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGdldFBvbHlnb25Gb3JFeHRlbnQocHJvajogb2wucHJvai5Qcm9qZWN0aW9uKSB7XG4gICAgICAgIHJldHVybiBvbC5nZW9tLlBvbHlnb24uZnJvbUV4dGVudCh0aGlzLmdldEV4dGVudChwcm9qKSk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgT2w0RXh0ZW50IGV4dGVuZHMgT2w0R2VvbSB7XG4gICAgcHVibGljIHN0YXRpYyBmcm9tQXJyYXkob3JkaW5hdGVzOiBudW1iZXJbXSwgcHJvajogb2wucHJvai5Qcm9qZWN0aW9uKTogT2w0RXh0ZW50IHtcbiAgICAgICAgbGV0IGdlb20gPSBuZXcgb2wuZ2VvbS5NdWx0aVBvaW50KFtbb3JkaW5hdGVzWzBdLCBvcmRpbmF0ZXNbMV1dLCBbb3JkaW5hdGVzWzJdLCBvcmRpbmF0ZXNbM11dXSk7XG4gICAgICAgIHJldHVybiBuZXcgT2w0RXh0ZW50KGdlb20sIHByb2opO1xuICAgIH1cbn1cblxuZXhwb3J0IGNvbnN0IFVVSUQ6IHN0cmluZyA9ICd1dWlkJztcbmV4cG9ydCBjb25zdCBMQVlFUl9VVUlEOiBzdHJpbmcgPSAnbGF5ZXJ1dWlkJztcbmV4cG9ydCBjb25zdCBUSVRMRTogc3RyaW5nID0gJ3RpdGxlJztcbmV4cG9ydCBjb25zdCBNRVRBRE9SX0VQU0c6IG9sLlByb2plY3Rpb25MaWtlID0gJ0VQU0c6NDMyNic7XG5leHBvcnQgY29uc3QgTEFZRVJfVkVDVE9SID0gJ3ZlY3Rvcic7XG5leHBvcnQgY29uc3QgTEFZRVJfSU1BR0UgPSAnaW1hZ2UnO1xuXG5leHBvcnQgY2xhc3MgT2w0TWFwIHtcbiAgICBwcml2YXRlIHN0YXRpYyBfdXVpZCA9IDA7XG4gICAgcHJpdmF0ZSBzdGF0aWMgX2luc3RhbmNlOiBPbDRNYXAgPSBudWxsOyAvLyBzaW5nbGV0b25cbiAgICBwcm90ZWN0ZWQgb2xNYXA6IG9sLk1hcCA9IG51bGw7XG4gICAgcHJvdGVjdGVkIHNjYWxlczogbnVtYmVyW107XG4gICAgLy8gICAgcHJvdGVjdGVkIHByb2o6IG9sLnByb2ouUHJvamVjdGlvbiA9IG51bGw7XG4gICAgcHJvdGVjdGVkIHN0YXJ0RXh0ZW50OiBPbDRFeHRlbnQgPSBudWxsOyAgLy8geG1pbiwgeW1pbiwgeG1heCwgeW1heCBvcHRpb25zWydzdGFydEV4dGVudCddXG4gICAgcHJvdGVjdGVkIG1heEV4dGVudDogT2w0RXh0ZW50ID0gbnVsbDtcbiAgICBwcm90ZWN0ZWQgZHJhd2VyOiBPbDREcmF3ZXI7XG4gICAgcHJvdGVjdGVkIHdtc1NvdXJjZTogT2w0V21zU291cmNlO1xuICAgIHByb3RlY3RlZCB2ZWNTb3VyY2U6IE9sNFZlY3RvclNvdXJjZTtcbiAgICBwcml2YXRlIGxheWVydHJlZTogTGF5ZXJUcmVlO1xuICAgIHByb3RlY3RlZCBzdHlsZXM6IE9iamVjdDtcbiAgICBwcm90ZWN0ZWQgaGdMYXllcjogb2wubGF5ZXIuVmVjdG9yO1xuICAgIHByb3RlY3RlZCBkcmFnem9vbTogb2wuaW50ZXJhY3Rpb24uRHJhZ1pvb207XG5cbiAgICBwcml2YXRlIHN0YXRpYyBnZXRVdWlkKHByZWZpeDogc3RyaW5nID0gJycpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gcHJlZml4ICsgKCsrT2w0TWFwLl91dWlkKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKG9wdGlvbnM6IGFueSkgeyAvLyBzaW5nbGV0b25cbiAgICAgICAgLy8gb2xbJ0VOQUJMRV9SQVNURVJfUkVQUk9KRUNUSU9OJ10gPSBmYWxzZTtcbiAgICAgICAgT2w0VXRpbHMuaW5pdFByb2o0RGVmcyhvcHRpb25zWydwcm9qNERlZnMnXSk7XG4gICAgICAgIHRoaXMubGF5ZXJ0cmVlID0gTGF5ZXJUcmVlLmNyZWF0ZSh0aGlzKTtcbiAgICAgICAgdGhpcy53bXNTb3VyY2UgPSBPbDRXbXNTb3VyY2UuY3JlYXRlKHRoaXMsIHRydWUsIHRoaXMubGF5ZXJ0cmVlKTtcbiAgICAgICAgdGhpcy52ZWNTb3VyY2UgPSBPbDRWZWN0b3JTb3VyY2UuY3JlYXRlKHRoaXMpO1xuICAgICAgICAoPEhUTUxGb3JtRWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuLWpzLWNycy1jb2RlJykpLnZhbHVlID0gb3B0aW9uc1sndmlldyddWydwcm9qZWN0aW9uJ107XG4gICAgICAgIGxldCBwcm9qOiBvbC5wcm9qLlByb2plY3Rpb24gPSBvbC5wcm9qLmdldChvcHRpb25zWyd2aWV3J11bJ3Byb2plY3Rpb24nXSk7XG4gICAgICAgIHRoaXMuc3R5bGVzID0gb3B0aW9uc1snc3R5bGVzJ107XG4gICAgICAgIHRoaXMuc2NhbGVzID0gb3B0aW9uc1sndmlldyddWydzY2FsZXMnXTtcbiAgICAgICAgdGhpcy5zdGFydEV4dGVudCA9IE9sNEV4dGVudC5mcm9tQXJyYXkob3B0aW9uc1sndmlldyddWydzdGFydEV4dGVudCddLCBwcm9qKTtcbiAgICAgICAgdGhpcy5tYXhFeHRlbnQgPSBPbDRFeHRlbnQuZnJvbUFycmF5KG9wdGlvbnNbJ3ZpZXcnXVsnbWF4RXh0ZW50J10sIHByb2opO1xuICAgICAgICB2YXIgaW50ZXJhY3Rpb25zID0gb2wuaW50ZXJhY3Rpb24uZGVmYXVsdHMoXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYWx0U2hpZnREcmFnUm90YXRlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBwaW5jaFJvdGF0ZTogZmFsc2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5vbE1hcCA9IG5ldyBvbC5NYXAoe1xuICAgICAgICAgICAgaW50ZXJhY3Rpb25zOiBpbnRlcmFjdGlvbnMsXG4gICAgICAgICAgICB0YXJnZXQ6IG9wdGlvbnNbJ21hcCddWyd0YXJnZXQnXSxcbiAgICAgICAgICAgIHJlbmRlcmVyOiAnY2FudmFzJ1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5vbE1hcC5zZXRWaWV3KFxuICAgICAgICAgICAgdGhpcy5jcmVhdGVWaWV3KFxuICAgICAgICAgICAgICAgIHByb2osXG4gICAgICAgICAgICAgICAgdGhpcy5tYXhFeHRlbnQuZ2V0RXh0ZW50KHByb2opLFxuICAgICAgICAgICAgICAgIE9sNFV0aWxzLnJlc29sdXRpb25zRm9yU2NhbGVzKHRoaXMuc2NhbGVzLCBwcm9qLmdldFVuaXRzKCkpLnJldmVyc2UoKVxuICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgICAgICAvKiBtYWtlIGEgZ3JvdXAgbGF5ZXIgZm9yIGFsbCBpbWFnZSBsYXllcnMgKFdNUyBldGMuKSovXG4gICAgICAgIGxldCBpbWFnZUdyb3VwID0gbmV3IG9sLmxheWVyLkdyb3VwKFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGxheWVyczogbmV3IG9sLkNvbGxlY3Rpb248b2wubGF5ZXIuQmFzZT4oKVxuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgICBpbWFnZUdyb3VwLnNldChVVUlELCBMQVlFUl9JTUFHRSlcbiAgICAgICAgdGhpcy5vbE1hcC5hZGRMYXllcihpbWFnZUdyb3VwKTtcbiAgICAgICAgLyogbWFrZSBhIGdyb3VwIGxheWVyIGZvciBhbGwgdmVjdG9yIGxheWVycyAoSGlnaHRsaWdodCwgU2VhcmNoIHJlc3VsdHMgZXRjLikqL1xuICAgICAgICBsZXQgdmVjdG9yR3JvdXAgPSBuZXcgb2wubGF5ZXIuR3JvdXAoXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbGF5ZXJzOiBuZXcgb2wuQ29sbGVjdGlvbjxvbC5sYXllci5CYXNlPigpXG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICAgIHZlY3Rvckdyb3VwLnNldChVVUlELCBMQVlFUl9WRUNUT1IpXG4gICAgICAgIHRoaXMub2xNYXAuYWRkTGF5ZXIodmVjdG9yR3JvdXApO1xuXG5cbiAgICAgICAgZm9yIChsZXQgc291cmNlT3B0aW9ucyBvZiBvcHRpb25zWydzb3VyY2UnXSkge1xuICAgICAgICAgICAgaWYgKHNvdXJjZU9wdGlvbnNbJ3R5cGUnXSA9PT0gJ1dNUycpIHtcbiAgICAgICAgICAgICAgICBsZXQgd21zTGF5ZXIgPSB0aGlzLmFkZExheWVyKFxuICAgICAgICAgICAgICAgICAgICB0aGlzLndtc1NvdXJjZS5jcmVhdGVMYXllcihcbiAgICAgICAgICAgICAgICAgICAgICAgIE9sNE1hcC5nZXRVdWlkKCdvbGF5LScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlT3B0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub2xNYXAuZ2V0VmlldygpLmdldFByb2plY3Rpb24oKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZU9wdGlvbnNbJ3Zpc2libGUnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnNlRmxvYXQoc291cmNlT3B0aW9uc1snb3BhY2l0eSddKVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihzb3VyY2VPcHRpb25zWyd0eXBlJ10gKyAnIGlzIG5vdCBzdXBwb3J0ZWQuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5vbE1hcC5hZGRDb250cm9sKG5ldyBvbC5jb250cm9sLlNjYWxlTGluZSgpKTtcblxuICAgICAgICB0aGlzLm9sTWFwLmFkZENvbnRyb2wobmV3IG9sLmNvbnRyb2wuWm9vbVRvRXh0ZW50KHtcbiAgICAgICAgICAgIGV4dGVudDogdGhpcy5tYXhFeHRlbnQuZ2V0RXh0ZW50KHByb2opXG4gICAgICAgIH0pKTtcbiAgICAgICAgdGhpcy5vbE1hcC5hZGRJbnRlcmFjdGlvbihuZXcgb2wuaW50ZXJhY3Rpb24uRHJhZ1pvb20oKSk7XG4gICAgICAgIHRoaXMub2xNYXAuYWRkQ29udHJvbChuZXcgb2wuY29udHJvbC5Nb3VzZVBvc2l0aW9uKFxuICAgICAgICAgICAgLy8ge1xuICAgICAgICAgICAgLy8gICAgIGNvb3JkaW5hdGVGb3JtYXQ6IGZ1bmN0aW9uIChjb29yZGluYXRlcykge1xuICAgICAgICAgICAgLy8gICAgICAgICB2YXIgY29vcmRfeCA9IGNvb3JkaW5hdGVzWzBdLnRvRml4ZWQoMyk7XG4gICAgICAgICAgICAvLyAgICAgICAgIHZhciBjb29yZF95ID0gY29vcmRpbmF0ZXNbMV0udG9GaXhlZCgzKTtcbiAgICAgICAgICAgIC8vICAgICAgICAgcmV0dXJuIGNvb3JkX3ggKyAnLCAnICsgY29vcmRfeTtcbiAgICAgICAgICAgIC8vICAgICB9XG4gICAgICAgICAgICAvLyB9XG4gICAgICAgICkpO1xuICAgICAgICB0aGlzLnpvb21Ub0V4dGVudCh0aGlzLnN0YXJ0RXh0ZW50LmdldFBvbHlnb25Gb3JFeHRlbnQocHJvaikpO1xuICAgICAgICBsZXQgaGdsID0gdGhpcy52ZWNTb3VyY2UuY3JlYXRlTGF5ZXIoXG4gICAgICAgICAgICBPbDRNYXAuZ2V0VXVpZCgnb2xheS0nKSxcbiAgICAgICAgICAgIHsnc3R5bGUnOiBPbDRVdGlscy5nZXRTdHlsZSh0aGlzLnN0eWxlc1snaGlnaGxpZ2h0J10pfSxcbiAgICAgICAgICAgIHRoaXMub2xNYXAuZ2V0VmlldygpLmdldFByb2plY3Rpb24oKVxuICAgICAgICApO1xuICAgICAgICB0aGlzLmhnTGF5ZXIgPSA8b2wubGF5ZXIuVmVjdG9yPnRoaXMuYWRkTGF5ZXIoaGdsKTtcblxuICAgICAgICBsZXQgdkxheWVyID0gPG9sLmxheWVyLlZlY3Rvcj50aGlzLmFkZExheWVyKFxuICAgICAgICAgICAgdGhpcy52ZWNTb3VyY2UuY3JlYXRlTGF5ZXIoXG4gICAgICAgICAgICAgICAgT2w0TWFwLmdldFV1aWQoJ29sYXktJyksXG4gICAgICAgICAgICAgICAgeydzdHlsZSc6IE9sNFV0aWxzLmdldFN0eWxlKHRoaXMuc3R5bGVzWydzZWFyY2gnXSl9LFxuICAgICAgICAgICAgICAgIHRoaXMub2xNYXAuZ2V0VmlldygpLmdldFByb2plY3Rpb24oKVxuICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgICAgICB2TGF5ZXIuc2V0TWFwKHRoaXMub2xNYXApO1xuICAgICAgICB0aGlzLmRyYXdlciA9IG5ldyBPbDREcmF3ZXIodkxheWVyKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNyZWF0ZVZpZXcocHJvajogb2wucHJvai5Qcm9qZWN0aW9uLCBleHRlbnQ6IG9sLkV4dGVudCwgcmVzb2x1dGlvbnM6IG51bWJlcltdKSB7XG4gICAgICAgIHJldHVybiBuZXcgb2wuVmlldyh7XG4gICAgICAgICAgICBwcm9qZWN0aW9uOiBwcm9qLFxuICAgICAgICAgICAgcmVzb2x1dGlvbnM6IHJlc29sdXRpb25zLFxuICAgICAgICAgICAgZXh0ZW50OiBleHRlbnRcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgem9vbVRvRXh0ZW50KGdlb21ldHJ5OiBvbC5nZW9tLlNpbXBsZUdlb21ldHJ5IHwgb2wuRXh0ZW50KSB7XG4gICAgICAgIHRoaXMub2xNYXAuZ2V0VmlldygpLmZpdChnZW9tZXRyeSwgPG9seC52aWV3LkZpdE9wdGlvbnM+dGhpcy5vbE1hcC5nZXRTaXplKCkpO1xuICAgIH1cblxuICAgIHN0YXRpYyBjcmVhdGUob3B0aW9uczogYW55KTogT2w0TWFwIHtcbiAgICAgICAgaWYgKCFPbDRNYXAuX2luc3RhbmNlKSB7Ly8gc2luZ2xldG9uXG4gICAgICAgICAgICBPbDRNYXAuX2luc3RhbmNlID0gbmV3IE9sNE1hcChvcHRpb25zKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gT2w0TWFwLl9pbnN0YW5jZTtcbiAgICB9XG5cbiAgICBnZXRQcm9qZWN0aW9uKCk6IG9sLnByb2ouUHJvamVjdGlvbiB7XG4gICAgICAgIHJldHVybiB0aGlzLm9sTWFwLmdldFZpZXcoKS5nZXRQcm9qZWN0aW9uKCk7XG4gICAgfVxuXG4gICAgZ2V0RHJhd2VyKCk6IE9sNERyYXdlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmRyYXdlcjtcbiAgICB9XG5cbiAgICBnZXRIZ0xheWVyKCk6IG9sLmxheWVyLlZlY3RvciB7XG4gICAgICAgIHJldHVybiB0aGlzLmhnTGF5ZXI7XG4gICAgfVxuXG4gICAgYWRkTGF5ZXJGb3JPcHRpb25zKG9wdGlvbnM6IGFueSkge1xuICAgICAgICBpZiAob3B0aW9uc1sndHlwZSddID09PSAnV01TJykge1xuICAgICAgICAgICAgbGV0IHdtc0xheWVyID0gdGhpcy5hZGRMYXllcihcbiAgICAgICAgICAgICAgICB0aGlzLndtc1NvdXJjZS5jcmVhdGVMYXllcihcbiAgICAgICAgICAgICAgICAgICAgT2w0TWFwLmdldFV1aWQoJ29sYXktJyksXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub2xNYXAuZ2V0VmlldygpLmdldFByb2plY3Rpb24oKSxcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uc1sndmlzaWJsZSddLFxuICAgICAgICAgICAgICAgICAgICBwYXJzZUZsb2F0KG9wdGlvbnNbJ29wYWNpdHknXSlcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihvcHRpb25zWyd0eXBlJ10gKyAnIGlzIG5vdCBzdXBwb3J0ZWQuJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhZGRMYXllcihsYXllcjogb2wubGF5ZXIuQmFzZSk6IG9sLmxheWVyLkJhc2Uge1xuICAgICAgICBpZiAobGF5ZXIgaW5zdGFuY2VvZiBvbC5sYXllci5JbWFnZSkge1xuICAgICAgICAgICAgbGV0IGdyb3VwOiBvbC5sYXllci5Hcm91cCA9IDxvbC5sYXllci5Hcm91cD4gdGhpcy5maW5kTGF5ZXIoTEFZRVJfSU1BR0UpO1xuICAgICAgICAgICAgZ3JvdXAuZ2V0TGF5ZXJzKCkuaW5zZXJ0QXQoZ3JvdXAuZ2V0TGF5ZXJzKCkuZ2V0TGVuZ3RoKCksIGxheWVyKTtcbiAgICAgICAgICAgIHJldHVybiBsYXllcjtcbiAgICAgICAgfSBlbHNlIGlmIChsYXllciBpbnN0YW5jZW9mIG9sLmxheWVyLlZlY3Rvcikge1xuICAgICAgICAgICAgbGV0IGdyb3VwOiBvbC5sYXllci5Hcm91cCA9IDxvbC5sYXllci5Hcm91cD4gdGhpcy5maW5kTGF5ZXIoTEFZRVJfVkVDVE9SKTtcbiAgICAgICAgICAgIGdyb3VwLmdldExheWVycygpLmluc2VydEF0KGdyb3VwLmdldExheWVycygpLmdldExlbmd0aCgpLCBsYXllcik7XG4gICAgICAgICAgICByZXR1cm4gbGF5ZXI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmVtb3ZlTGF5ZXIobGF5ZXI6IG9sLmxheWVyLkJhc2UpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5vbE1hcC5yZW1vdmVMYXllcihsYXllcik7XG4gICAgfVxuXG4gICAgbW92ZUxheWVyKHV1aWQ6IHN0cmluZywgb2xkUG9zOiBudW1iZXIsIG5ld1BvczogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIGxldCBsYXllcjogb2wubGF5ZXIuQmFzZSA9IHRoaXMuZmluZExheWVyKHV1aWQpO1xuICAgICAgICBpZiAobGF5ZXIgaW5zdGFuY2VvZiBvbC5sYXllci5JbWFnZSkge1xuICAgICAgICAgICAgbGV0IGdyb3VwOiBvbC5sYXllci5Hcm91cCA9IDxvbC5sYXllci5Hcm91cD4gdGhpcy5maW5kTGF5ZXIoTEFZRVJfSU1BR0UpO1xuICAgICAgICAgICAgbGV0IGxheWVybGwgPSBncm91cC5nZXRMYXllcnMoKS5yZW1vdmUobGF5ZXIpO1xuICAgICAgICAgICAgZ3JvdXAuZ2V0TGF5ZXJzKCkuaW5zZXJ0QXQobmV3UG9zLCBsYXllcmxsKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgZmluZExheWVyKHV1aWQ6IHN0cmluZyk6IG9sLmxheWVyLkJhc2Uge1xuICAgICAgICBsZXQgbGF5ZXJzID0gdGhpcy5vbE1hcC5nZXRMYXllcnMoKS5nZXRBcnJheSgpO1xuICAgICAgICBmb3IgKGxldCBsYXllciBvZiBsYXllcnMpIHtcbiAgICAgICAgICAgIGxldCBzb3VyY2U6IG9sLnNvdXJjZS5Tb3VyY2U7XG4gICAgICAgICAgICBpZiAobGF5ZXIuZ2V0KFVVSUQpID09PSB1dWlkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxheWVyO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChsYXllciBpbnN0YW5jZW9mIG9sLmxheWVyLkdyb3VwKSB7XG4gICAgICAgICAgICAgICAgbGV0IHN1YmxheWVycyA9ICg8b2wubGF5ZXIuR3JvdXA+bGF5ZXIpLmdldExheWVycygpLmdldEFycmF5KCk7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgc3VibGF5ZXIgb2Ygc3VibGF5ZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzdWJsYXllci5nZXQoVVVJRCkgPT09IHV1aWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzdWJsYXllcjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICB1cGRhdGVNYXAoKTogdm9pZCB7XG4gICAgICAgIHRoaXMub2xNYXAudXBkYXRlU2l6ZSgpO1xuICAgIH1cblxuICAgIGNoYW5nZUNycyhjcnM6IHN0cmluZykgeyAvLyBUT0RPXG4gICAgICAgIGxldCB0b1Byb2ogPSBudWxsO1xuICAgICAgICBpZiAoKHRvUHJvaiA9IG9sLnByb2ouZ2V0KGNycykpKSB7XG4gICAgICAgICAgICBsZXQgZXh0ZW50ID0gT2w0RXh0ZW50LmZyb21BcnJheShcbiAgICAgICAgICAgICAgICB0aGlzLm9sTWFwLmdldFZpZXcoKS5jYWxjdWxhdGVFeHRlbnQodGhpcy5vbE1hcC5nZXRTaXplKCkpLFxuICAgICAgICAgICAgICAgIHRoaXMuZ2V0UHJvamVjdGlvbigpXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgbGV0IGZyb21Qcm9qID0gdGhpcy5nZXRQcm9qZWN0aW9uKCk7XG4gICAgICAgICAgICBsZXQgY2VudGVyID0gdGhpcy5vbE1hcC5nZXRWaWV3KCkuZ2V0Q2VudGVyKCk7XG4gICAgICAgICAgICBsZXQgbGF5ZXJzID0gKDxvbC5sYXllci5Hcm91cD50aGlzLmZpbmRMYXllcihMQVlFUl9JTUFHRSkpLmdldExheWVycygpLmdldEFycmF5KCk7XG4gICAgICAgICAgICB0aGlzLmNoYW5nZUNyc0xpc3QoKDxvbC5sYXllci5Hcm91cD50aGlzLmZpbmRMYXllcihMQVlFUl9JTUFHRSkpLmdldExheWVycygpLCBmcm9tUHJvaiwgdG9Qcm9qKTtcbiAgICAgICAgICAgIHRoaXMuY2hhbmdlQ3JzTGlzdCgoPG9sLmxheWVyLkdyb3VwPnRoaXMuZmluZExheWVyKExBWUVSX1ZFQ1RPUikpLmdldExheWVycygpLCBmcm9tUHJvaiwgdG9Qcm9qKTtcbiAgICAgICAgICAgIHRoaXMub2xNYXAuc2V0VmlldyhcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZVZpZXcoXG4gICAgICAgICAgICAgICAgICAgIHRvUHJvaixcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXhFeHRlbnQuZ2V0RXh0ZW50KHRvUHJvaiksXG4gICAgICAgICAgICAgICAgICAgIE9sNFV0aWxzLnJlc29sdXRpb25zRm9yU2NhbGVzKHRoaXMuc2NhbGVzLCB0b1Byb2ouZ2V0VW5pdHMoKSkucmV2ZXJzZSgpXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHRoaXMuem9vbVRvRXh0ZW50KGV4dGVudC5nZXRQb2x5Z29uRm9yRXh0ZW50KHRvUHJvaikpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjaGFuZ2VDcnNMaXN0KGxheWVyczogb2wuQ29sbGVjdGlvbjxvbC5sYXllci5CYXNlPiwgZnJvbVByb2osIHRvUHJvaikge1xuICAgICAgICBmb3IgKGxldCBsYXllciBvZiBsYXllcnMuZ2V0QXJyYXkoKSkge1xuICAgICAgICAgICAgbGV0IHNvdXJjZTogb2wuc291cmNlLlNvdXJjZTtcbiAgICAgICAgICAgIGlmICgoc291cmNlID0gKDxvbC5sYXllci5MYXllcj5sYXllcikuZ2V0U291cmNlKCkpIGluc3RhbmNlb2Ygb2wuc291cmNlLkltYWdlV01TKSB7XG4gICAgICAgICAgICAgICAgdGhpcy53bXNTb3VyY2UucmVmcmVzaFNvdXJjZSg8b2wubGF5ZXIuSW1hZ2U+bGF5ZXIsIGZyb21Qcm9qLCB0b1Byb2opO1xuICAgICAgICAgICAgfSBlbHNlIGlmICgoc291cmNlID0gKDxvbC5sYXllci5MYXllcj5sYXllcikuZ2V0U291cmNlKCkpIGluc3RhbmNlb2Ygb2wuc291cmNlLlZlY3Rvcikge1xuICAgICAgICAgICAgICAgIGxldCBmZWF0dXJlczogb2wuRmVhdHVyZVtdID0gKDxvbC5zb3VyY2UuVmVjdG9yPnNvdXJjZSkuZ2V0RmVhdHVyZXMoKTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBmZWF0dXJlIG9mIGZlYXR1cmVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGZlYXR1cmUuc2V0R2VvbWV0cnkoZmVhdHVyZS5nZXRHZW9tZXRyeSgpLnRyYW5zZm9ybShmcm9tUHJvaiwgdG9Qcm9qKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2V0VmlzaWJsZShsYXllclVpaWQ6IHN0cmluZywgdmlzaWJsaXR5OiBib29sZWFuKTogdm9pZCB7XG4gICAgICAgIGxldCBsYXllcjogb2wubGF5ZXIuQmFzZSA9IHRoaXMuZmluZExheWVyKGxheWVyVWlpZCk7XG4gICAgICAgIGlmIChsYXllcikge1xuICAgICAgICAgICAgbGF5ZXIuc2V0VmlzaWJsZSh2aXNpYmxpdHkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2V0T3BhY2l0eShsYXllclVpaWQ6IHN0cmluZywgb3BhY2l0eTogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIGxldCBsYXllcjogb2wubGF5ZXIuQmFzZSA9IHRoaXMuZmluZExheWVyKGxheWVyVWlpZCk7XG4gICAgICAgIGlmIChsYXllcikge1xuICAgICAgICAgICAgbGF5ZXIuc2V0T3BhY2l0eShvcGFjaXR5KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRyYWdab29tKGFjdGl2YXRlOiBib29sZWFuLCBvblpvb21FbmQ6IEZ1bmN0aW9uID0gbnVsbCkge1xuICAgICAgICBpZiAoIXRoaXMuZHJhZ3pvb20pIHtcbiAgICAgICAgICAgIHRoaXMuZHJhZ3pvb20gPSBuZXcgb2wuaW50ZXJhY3Rpb24uRHJhZ1pvb20oe1xuICAgICAgICAgICAgICAgIGNvbmRpdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGxldCBkcmFnem9vbSA9IHRoaXMuZHJhZ3pvb207XG4gICAgICAgICAgICBsZXQgbWFwID0gdGhpcy5vbE1hcDtcbiAgICAgICAgICAgIHRoaXMuZHJhZ3pvb20ub24oJ2JveGVuZCcsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKGV2ZW50OiBvbC5pbnRlcmFjdGlvbi5EcmF3LkV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIG1hcC5yZW1vdmVJbnRlcmFjdGlvbihkcmFnem9vbSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvblpvb21FbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uWm9vbUVuZCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFjdGl2YXRlKSB7XG4gICAgICAgICAgICB0aGlzLm9sTWFwLmFkZEludGVyYWN0aW9uKHRoaXMuZHJhZ3pvb20pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5vbE1hcC5yZW1vdmVJbnRlcmFjdGlvbih0aGlzLmRyYWd6b29tKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRyYXdHZW9tZXRyeUZvclNlYXJjaChnZW9Kc29uOiBPYmplY3QsIG9uRHJhd0VuZDogRnVuY3Rpb24gPSBudWxsKSB7XG4gICAgICAgIGxldCBvbDRtYXAgPSB0aGlzO1xuICAgICAgICBsZXQgb2xNYXAgPSB0aGlzLm9sTWFwO1xuICAgICAgICB0aGlzLnZlY1NvdXJjZS5jbGVhckZlYXR1cmVzKHRoaXMuZHJhd2VyLmdldExheWVyKCkpO1xuICAgICAgICB0aGlzLnZlY1NvdXJjZS5zaG93RmVhdHVyZXModGhpcy5kcmF3ZXIuZ2V0TGF5ZXIoKSwgZ2VvSnNvbik7XG4gICAgICAgIGlmIChvbkRyYXdFbmQgIT09IG51bGwpIHtcbiAgICAgICAgICAgIG9uRHJhd0VuZChnZW9Kc29uKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnpvb21Ub0V4dGVudCh0aGlzLmRyYXdlci5nZXRMYXllcigpLmdldFNvdXJjZSgpLmdldEV4dGVudCgpKTtcbiAgICB9XG5cbiAgICBkcmF3U2hhcGVGb3JTZWFyY2goc2hhcGVUeXBlOiBTSEFQRVMgPSBudWxsLCBvbkRyYXdFbmQ6IEZ1bmN0aW9uID0gbnVsbCkge1xuICAgICAgICBsZXQgb2w0bWFwID0gdGhpcztcbiAgICAgICAgbGV0IG9sTWFwID0gdGhpcy5vbE1hcDtcbiAgICAgICAgY29uc3Qgc2hhcGU6IFNIQVBFUyA9IHR5cGVvZiBzaGFwZVR5cGUgPT09ICdzdHJpbmcnID8gU0hBUEVTWzxzdHJpbmc+IHNoYXBlVHlwZV0gOiBzaGFwZVR5cGU7XG4gICAgICAgIGlmICh0aGlzLmRyYXdlci5nZXRJbnRlcmFjdGlvbigpKSB7XG4gICAgICAgICAgICB0aGlzLm9sTWFwLnJlbW92ZUludGVyYWN0aW9uKHRoaXMuZHJhd2VyLmdldEludGVyYWN0aW9uKCkpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZHJhd2VyLnNldEludGVyYWN0aW9uKHNoYXBlLCBPbDRVdGlscy5nZXRTdHlsZSh0aGlzLnN0eWxlc1snc2VhcmNoJ10pKTtcbiAgICAgICAgaWYgKHRoaXMuZHJhd2VyLmdldEludGVyYWN0aW9uKCkpIHtcbiAgICAgICAgICAgIGxldCBkcmF3ZXIgPSB0aGlzLmRyYXdlcjtcbiAgICAgICAgICAgIHRoaXMuZ2V0RHJhd2VyKCkuZ2V0TGF5ZXIoKS5nZXRTb3VyY2UoKS5jbGVhcigpO1xuICAgICAgICAgICAgdGhpcy5vbE1hcC5hZGRJbnRlcmFjdGlvbih0aGlzLmRyYXdlci5nZXRJbnRlcmFjdGlvbigpKTtcbiAgICAgICAgICAgIHRoaXMuZHJhd2VyLmdldEludGVyYWN0aW9uKCkub24oXG4gICAgICAgICAgICAgICAgJ2RyYXdzdGFydCcsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgb2w0bWFwLmdldERyYXdlcigpLmdldExheWVyKCkuZ2V0U291cmNlKCkuY2xlYXIoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgdGhpcy5kcmF3ZXIuZ2V0SW50ZXJhY3Rpb24oKS5vbihcbiAgICAgICAgICAgICAgICAnZHJhd2VuZCcsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGdlb2pzb24gPSBuZXcgb2wuZm9ybWF0Lkdlb0pTT04oKS53cml0ZUZlYXR1cmVPYmplY3QoXG4gICAgICAgICAgICAgICAgICAgICAgICBlLmZlYXR1cmUsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RhdGFQcm9qZWN0aW9uJzogTUVUQURPUl9FUFNHLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdmZWF0dXJlUHJvamVjdGlvbic6IG9sNG1hcC5nZXRQcm9qZWN0aW9uKClcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgb25EcmF3RW5kKGdlb2pzb24pO1xuICAgICAgICAgICAgICAgICAgICBvbE1hcC5yZW1vdmVJbnRlcmFjdGlvbihkcmF3ZXIuZ2V0SW50ZXJhY3Rpb24oKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZ2V0RHJhd2VyKCkuZ2V0TGF5ZXIoKS5nZXRTb3VyY2UoKS5jbGVhcigpO1xuICAgICAgICAgICAgb25EcmF3RW5kKG51bGwpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgZW51bSBTSEFQRVMge05PTkUsIEJPWCwgUE9MWUdPTn1cbjtcblxuZXhwb3J0IGNsYXNzIE9sNERyYXdlciB7XG4gICAgLy8gcHJpdmF0ZSBzdGF0aWMgX2luc3RhbmNlOiBPbDREcmF3ZXI7XG4gICAgcHJvdGVjdGVkIGxheWVyOiBvbC5sYXllci5WZWN0b3I7XG4gICAgcHJvdGVjdGVkIGludGVyYWN0aW9uOiBvbC5pbnRlcmFjdGlvbi5EcmF3O1xuXG4gICAgY29uc3RydWN0b3IobGF5ZXI6IG9sLmxheWVyLlZlY3Rvcikge1xuICAgICAgICB0aGlzLmxheWVyID0gbGF5ZXI7XG4gICAgfVxuXG4gICAgcHVibGljIGdldExheWVyKCk6IG9sLmxheWVyLlZlY3RvciB7XG4gICAgICAgIHJldHVybiB0aGlzLmxheWVyO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRJbnRlcmFjdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJhY3Rpb247XG4gICAgfVxuXG4gICAgcHVibGljIHNldEludGVyYWN0aW9uKHR5cGU6IFNIQVBFUywgZHJhd1N0eWxlOiBvbC5zdHlsZS5TdHlsZSkge1xuICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgU0hBUEVTLkJPWDpcbiAgICAgICAgICAgICAgICB0aGlzLmludGVyYWN0aW9uID0gbmV3IG9sLmludGVyYWN0aW9uLkRyYXcoe1xuICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IHRoaXMubGF5ZXIuZ2V0U291cmNlKCksXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdDaXJjbGUnLFxuICAgICAgICAgICAgICAgICAgICBzdHlsZTogZHJhd1N0eWxlLFxuICAgICAgICAgICAgICAgICAgICBnZW9tZXRyeUZ1bmN0aW9uOiBjcmVhdGVCb3goKSAvLyBvbC5kLnRzIGhhcyBubyBmdW5jdGlvbiBcIm9sLmludGVyYWN0aW9uLkRyYXcuY3JlYXRlQm94KClcIlxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBTSEFQRVMuUE9MWUdPTjpcbiAgICAgICAgICAgICAgICB0aGlzLmludGVyYWN0aW9uID0gbmV3IG9sLmludGVyYWN0aW9uLkRyYXcoe1xuICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IHRoaXMubGF5ZXIuZ2V0U291cmNlKCksXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdQb2x5Z29uJyxcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IGRyYXdTdHlsZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aGlzLmludGVyYWN0aW9uID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBvbC5kLnRzIGhhcyBubyBmdW5jdGlvbiBcIm9sLmludGVyYWN0aW9uLkRyYXcuY3JlYXRlQm94KClcIlxuICogQHJldHVybnMgeyhjb29yZGluYXRlczphbnksIG9wdF9nZW9tZXRyeTphbnkpPT5hbnl8b2wuZ2VvbS5Qb2x5Z29ufVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQm94KCkge1xuICAgIHJldHVybiAoXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0ge29sLkNvb3JkaW5hdGV8QXJyYXkuPG9sLkNvb3JkaW5hdGU+fEFycmF5LjxBcnJheS48b2wuQ29vcmRpbmF0ZT4+fSBjb29yZGluYXRlc1xuICAgICAgICAgKiBAcGFyYW0ge29sLmdlb20uU2ltcGxlR2VvbWV0cnk9fSBvcHRfZ2VvbWV0cnlcbiAgICAgICAgICogQHJldHVybiB7b2wuZ2VvbS5TaW1wbGVHZW9tZXRyeX1cbiAgICAgICAgICovXG4gICAgICAgIGZ1bmN0aW9uIChjb29yZGluYXRlcywgb3B0X2dlb21ldHJ5KSB7XG4gICAgICAgICAgICB2YXIgZXh0ZW50ID0gb2wuZXh0ZW50LmJvdW5kaW5nRXh0ZW50KGNvb3JkaW5hdGVzKTtcbiAgICAgICAgICAgIHZhciBnZW9tZXRyeSA9IG9wdF9nZW9tZXRyeSB8fCBuZXcgb2wuZ2VvbS5Qb2x5Z29uKG51bGwpO1xuICAgICAgICAgICAgZ2VvbWV0cnkuc2V0Q29vcmRpbmF0ZXMoW1tcbiAgICAgICAgICAgICAgICBvbC5leHRlbnQuZ2V0Qm90dG9tTGVmdChleHRlbnQpLFxuICAgICAgICAgICAgICAgIG9sLmV4dGVudC5nZXRCb3R0b21SaWdodChleHRlbnQpLFxuICAgICAgICAgICAgICAgIG9sLmV4dGVudC5nZXRUb3BSaWdodChleHRlbnQpLFxuICAgICAgICAgICAgICAgIG9sLmV4dGVudC5nZXRUb3BMZWZ0KGV4dGVudCksXG4gICAgICAgICAgICAgICAgb2wuZXh0ZW50LmdldEJvdHRvbUxlZnQoZXh0ZW50KVxuICAgICAgICAgICAgXV0pO1xuICAgICAgICAgICAgcmV0dXJuIGdlb21ldHJ5O1xuICAgICAgICB9XG4gICAgKTtcbn07XG5cblxuZXhwb3J0IGNsYXNzIFVpVXRpbHMge1xuXG59XG5cbmV4cG9ydCBjbGFzcyBHZW9tTG9hZGVyIHtcbiAgICBwcml2YXRlIG1hcDogT2w0TWFwO1xuICAgIHByaXZhdGUgZm9ybTogSFRNTEZvcm1FbGVtZW50O1xuXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKG1hcDogT2w0TWFwLCBmb3JtOiBIVE1MRm9ybUVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5tYXAgPSBtYXA7XG4gICAgICAgIHRoaXMuZm9ybSA9IGZvcm07XG4gICAgICAgIHRoaXMub24oKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgb24oKSB7XG4gICAgICAgIHRoaXMuZm9ybS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCB0aGlzLnVwbG9hZC5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB1cGxvYWQoZTogRXZlbnQpIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coZSk7XG4gICAgICAgIC8vIEh0dHBVdGlscy5IdHRwLnNlbmRGb3JtKHRoaXMuZm9ybSwgdGhpcy5mb3JtLmFjdGlvbiwgSHR0cFV0aWxzLkhUVFBfTUVUSE9ELlBPU1QsIEh0dHBVdGlscy5IVFRQX0RBVEFUWVBFLmpzb24pXG4gICAgICAgIC8vICAgICAudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgLy8gICAgICAgICBjb25zb2xlLmxvZygnQ29udGVudHM6ICcgKyB2YWx1ZSk7XG4gICAgICAgIC8vICAgICB9KVxuICAgICAgICAvLyAgICAgLmNhdGNoKGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgLy8gICAgICAgICBjb25zb2xlLmVycm9yKHJlYXNvbik7XG4gICAgICAgIC8vICAgICB9KTtcbiAgICB9XG59IiwiaW1wb3J0IHtUSVRMRSwgVVVJRCwgTEFZRVJfVVVJRCwgT2w0TWFwfSBmcm9tIFwiLi9PbDRcIjtcbmltcG9ydCB7TGF5ZXJUcmVlfSBmcm9tICcuL0xheWVyVHJlZSc7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBPbDRTb3VyY2Uge1xuXG4gICAgYWJzdHJhY3QgY3JlYXRlTGF5ZXIobGF5ZXJVdWlkOiBzdHJpbmcsIG9wdGlvbnM6IGFueSwgcHJvajogb2wuUHJvamVjdGlvbkxpa2UsIHZpc2libGU6IGJvb2xlYW4sIG9wYWNpdHk6IG51bWJlcik7XG5cbiAgICBhYnN0cmFjdCByZWZyZXNoU291cmNlKGxheWVyOiBvbC5sYXllci5CYXNlLCBmcm9tUHJvajogb2wuUHJvamVjdGlvbkxpa2UsIHRvUHJvajogb2wuUHJvamVjdGlvbkxpa2UpO1xuXG4gICAgLy9cbiAgICAvLyBhYnN0cmFjdCBzaG93TGF5ZXIoKTtcbiAgICAvL1xuICAgIC8vIGFic3RyYWN0IGhpZGVMYXllcigpO1xufVxuXG5leHBvcnQgY2xhc3MgT2w0VmVjdG9yU291cmNlIGltcGxlbWVudHMgT2w0U291cmNlIHtcbiAgICBwcml2YXRlIHN0YXRpYyBfaW5zdGFuY2U6IE9sNFZlY3RvclNvdXJjZTtcbiAgICBwcm90ZWN0ZWQgc2hvd2FibGU6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICBwcml2YXRlIG9sNE1hcDogT2w0TWFwO1xuXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihvbDRNYXA6IE9sNE1hcCkge1xuICAgICAgICAvLyBzdXBlcihmYWxzZSk7XG4gICAgICAgIHRoaXMub2w0TWFwID0gb2w0TWFwO1xuICAgICAgICAvLyB0aGlzLnNldFNob3dhYmxlKGZhbHNlKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgY3JlYXRlKG9sNG1hcDogT2w0TWFwKTogT2w0VmVjdG9yU291cmNlIHtcbiAgICAgICAgaWYgKCFPbDRWZWN0b3JTb3VyY2UuX2luc3RhbmNlKSB7Ly8gc2luZ2xldG9uXG4gICAgICAgICAgICBPbDRWZWN0b3JTb3VyY2UuX2luc3RhbmNlID0gbmV3IE9sNFZlY3RvclNvdXJjZShvbDRtYXApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBPbDRWZWN0b3JTb3VyY2UuX2luc3RhbmNlO1xuICAgIH1cblxuICAgIGNyZWF0ZUxheWVyKGxheWVyVXVpZDogc3RyaW5nLCBvcHRpb25zOiBhbnksIHByb2o6IG9sLlByb2plY3Rpb25MaWtlLCB2aXNpYmxlOiBib29sZWFuID0gdHJ1ZSwgb3BhY2l0eTogbnVtYmVyID0gMS4wKTogb2wubGF5ZXIuVmVjdG9yIHtcbiAgICAgICAgbGV0IHZMYXllciA9IG5ldyBvbC5sYXllci5WZWN0b3Ioe1xuICAgICAgICAgICAgc291cmNlOiBuZXcgb2wuc291cmNlLlZlY3Rvcih7d3JhcFg6IGZhbHNlfSksXG4gICAgICAgICAgICBzdHlsZTogb3B0aW9uc1snc3R5bGUnXVxuICAgICAgICB9KTtcbiAgICAgICAgdkxheWVyLnNldChVVUlELCBsYXllclV1aWQpO1xuICAgICAgICByZXR1cm4gdkxheWVyO1xuICAgIH1cblxuICAgIHJlZnJlc2hTb3VyY2UobGF5ZXI6IG9sLmxheWVyLkJhc2UsIGZyb21Qcm9qOiBvbC5Qcm9qZWN0aW9uTGlrZSwgdG9Qcm9qOiBvbC5Qcm9qZWN0aW9uTGlrZSkge1xuICAgICAgICBsZXQgc291cmNlID0gKDxvbC5sYXllci5MYXllcj5sYXllcikuZ2V0U291cmNlKCk7XG4gICAgICAgIGxldCBmZWF0dXJlczogb2wuRmVhdHVyZVtdID0gKDxvbC5zb3VyY2UuVmVjdG9yPnNvdXJjZSkuZ2V0RmVhdHVyZXMoKTtcbiAgICAgICAgZm9yIChsZXQgZmVhdHVyZSBvZiBmZWF0dXJlcykge1xuICAgICAgICAgICAgZmVhdHVyZS5zZXRHZW9tZXRyeShmZWF0dXJlLmdldEdlb21ldHJ5KCkudHJhbnNmb3JtKGZyb21Qcm9qLCB0b1Byb2opKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vXG4gICAgLy8gc2hvd0xheWVyKCl7XG4gICAgLy9cbiAgICAvLyB9XG4gICAgLy9cbiAgICAvLyBoaWRlTGF5ZXIoKXtcbiAgICAvL1xuICAgIC8vIH1cblxuICAgIHNob3dGZWF0dXJlcyh2TGF5ZXI6IG9sLmxheWVyLlZlY3RvciwgZ2VvSnNvbjogT2JqZWN0KSB7XG4gICAgICAgIGxldCBnZW9Kc29uUmVhZGVyOiBvbC5mb3JtYXQuR2VvSlNPTiA9IG5ldyBvbC5mb3JtYXQuR2VvSlNPTigpO1xuICAgICAgICBsZXQgZGF0YXByb2ogPSBnZW9Kc29uUmVhZGVyLnJlYWRQcm9qZWN0aW9uKGdlb0pzb24pO1xuICAgICAgICBsZXQgZmVhdHVyZXMgPSBnZW9Kc29uUmVhZGVyLnJlYWRGZWF0dXJlcyhcbiAgICAgICAgICAgIGdlb0pzb24sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgJ2RhdGFQcm9qZWN0aW9uJzogZ2VvSnNvblJlYWRlci5yZWFkUHJvamVjdGlvbihnZW9Kc29uKSxcbiAgICAgICAgICAgICAgICAnZmVhdHVyZVByb2plY3Rpb24nOiB0aGlzLm9sNE1hcC5nZXRQcm9qZWN0aW9uKClcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB2TGF5ZXIuZ2V0U291cmNlKCkuYWRkRmVhdHVyZXMoZmVhdHVyZXMpO1xuICAgIH1cblxuICAgIGNsZWFyRmVhdHVyZXModkxheWVyOiBvbC5sYXllci5WZWN0b3IpIHtcbiAgICAgICAgdkxheWVyLmdldFNvdXJjZSgpLmNsZWFyKHRydWUpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIE9sNFdtc1NvdXJjZSBpbXBsZW1lbnRzIE9sNFNvdXJjZSB7XG4gICAgcHJpdmF0ZSBzdGF0aWMgX2luc3RhbmNlOiBPbDRXbXNTb3VyY2U7XG4gICAgcHJpdmF0ZSBvbDRNYXA6IE9sNE1hcDtcbiAgICBwcml2YXRlIHVzZUxvYWRFdmVudHM6IGJvb2xlYW47XG4gICAgcHJpdmF0ZSBsYXllcnRyZWU6IExheWVyVHJlZTtcbiAgICBwcml2YXRlIHN0YXRpYyBtYXBBY3Rpdml0eTogTWFwQWN0aXZpdHk7XG5cbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKG9sNE1hcDogT2w0TWFwLCB1c2VMb2FkRXZlbnRzOiBib29sZWFuID0gdHJ1ZSwgbGF5ZXJ0cmVlOiBMYXllclRyZWUgPSBudWxsKSB7XG4gICAgICAgIHRoaXMub2w0TWFwID0gb2w0TWFwO1xuICAgICAgICB0aGlzLnVzZUxvYWRFdmVudHMgPSB1c2VMb2FkRXZlbnRzO1xuICAgICAgICB0aGlzLmxheWVydHJlZSA9IGxheWVydHJlZTtcbiAgICAgICAgaWYgKHRoaXMudXNlTG9hZEV2ZW50cykge1xuICAgICAgICAgICAgT2w0V21zU291cmNlLm1hcEFjdGl2aXR5ID0gTWFwQWN0aXZpdHkuY3JlYXRlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgY3JlYXRlKG9sNE1hcDogT2w0TWFwLCB1c2VMb2FkRXZlbnRzOiBib29sZWFuID0gdHJ1ZSwgbGF5ZXJ0cmVlOiBMYXllclRyZWUgPSBudWxsKTogT2w0V21zU291cmNlIHtcbiAgICAgICAgaWYgKCFPbDRXbXNTb3VyY2UuX2luc3RhbmNlKSB7Ly8gc2luZ2xldG9uXG4gICAgICAgICAgICBPbDRXbXNTb3VyY2UuX2luc3RhbmNlID0gbmV3IE9sNFdtc1NvdXJjZShvbDRNYXAsIHVzZUxvYWRFdmVudHMsIGxheWVydHJlZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE9sNFdtc1NvdXJjZS5faW5zdGFuY2U7XG4gICAgfVxuXG4gICAgY3JlYXRlTGF5ZXIobGF5ZXJVdWlkOiBzdHJpbmcsIG9wdGlvbnM6IGFueSA9IG51bGwsIHByb2o6IG9sLlByb2plY3Rpb25MaWtlLCB2aXNpYmxlOiBib29sZWFuLCBvcGFjaXR5OiBudW1iZXIpOiBvbC5sYXllci5JbWFnZSB7XG4gICAgICAgIGxldCBzb3VyY2UgPSB0aGlzLmNyZWF0ZVNvdXJjZShsYXllclV1aWQsIG9wdGlvbnNbJ3VybCddLCBvcHRpb25zWydwYXJhbXMnXSwgcHJvaik7XG4gICAgICAgIGxldCBzb3VyY2VXbXMgPSBuZXcgb2wubGF5ZXIuSW1hZ2Uoe1xuICAgICAgICAgICAgc291cmNlOiBzb3VyY2UsXG4gICAgICAgICAgICB2aXNpYmxlOiB2aXNpYmxlLFxuICAgICAgICAgICAgb3BhY2l0eTogb3BhY2l0eVxuICAgICAgICB9KTtcbiAgICAgICAgc291cmNlV21zLnNldChVVUlELCBsYXllclV1aWQpO1xuICAgICAgICBpZiAob3B0aW9uc1sndGl0bGUnXSkge1xuICAgICAgICAgICAgc291cmNlV21zLnNldChUSVRMRSwgb3B0aW9uc1sndGl0bGUnXSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMubGF5ZXJ0cmVlICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLmxheWVydHJlZS5hZGQoc291cmNlV21zKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc291cmNlV21zO1xuICAgIH1cblxuICAgIHByaXZhdGUgY3JlYXRlU291cmNlKGxheWVyVXVpZDogc3RyaW5nLCB1cmw6IHN0cmluZywgcGFyYW1zOiBhbnksIHByb2o6IG9sLlByb2plY3Rpb25MaWtlKTogb2wuc291cmNlLkltYWdlV01TIHtcbiAgICAgICAgbGV0IHNvdXJjZSA9IG5ldyBvbC5zb3VyY2UuSW1hZ2VXTVMoe1xuICAgICAgICAgICAgdXJsOiB1cmwsXG4gICAgICAgICAgICBwYXJhbXM6IHBhcmFtcyxcbiAgICAgICAgICAgIHByb2plY3Rpb246IHByb2pcbiAgICAgICAgfSk7XG4gICAgICAgIHNvdXJjZS5zZXQoTEFZRVJfVVVJRCwgbGF5ZXJVdWlkKTtcbiAgICAgICAgdGhpcy5zZXRMb2FkRXZlbnRzKHNvdXJjZSk7XG4gICAgICAgIHJldHVybiBzb3VyY2U7XG4gICAgfVxuXG4gICAgcmVmcmVzaFNvdXJjZShsYXllcjogb2wubGF5ZXIuQmFzZSwgZnJvbVByb2o6IG9sLlByb2plY3Rpb25MaWtlLCB0b1Byb2o6IG9sLlByb2plY3Rpb25MaWtlKSB7XG4gICAgICAgIGxldCBvbGRzb3VyY2UgPSA8b2wuc291cmNlLkltYWdlV01TPig8b2wubGF5ZXIuTGF5ZXI+bGF5ZXIpLmdldFNvdXJjZSgpO1xuICAgICAgICAoPG9sLmxheWVyLkxheWVyPmxheWVyKS5zZXRTb3VyY2UodGhpcy5jcmVhdGVTb3VyY2UobGF5ZXIuZ2V0KFVVSUQpLCBvbGRzb3VyY2UuZ2V0VXJsKCksIG9sZHNvdXJjZS5nZXRQYXJhbXMoKSwgdG9Qcm9qKSk7XG4gICAgfVxuXG4gICAgLy9cbiAgICAvLyBzaG93TGF5ZXIoKXtcbiAgICAvL1xuICAgIC8vIH1cbiAgICAvL1xuICAgIC8vIGhpZGVMYXllcigpe1xuICAgIC8vXG4gICAgLy8gfVxuXG4gICAgcHJpdmF0ZSBzZXRMb2FkRXZlbnRzKHNvdXJjZTogb2wuc291cmNlLkltYWdlV01TKSB7XG4gICAgICAgIGlmICh0aGlzLnVzZUxvYWRFdmVudHMpIHtcbiAgICAgICAgICAgIHNvdXJjZS5vbignaW1hZ2Vsb2Fkc3RhcnQnLCBPbDRXbXNTb3VyY2UuaW1hZ2VMb2FkU3RhcnQpO1xuICAgICAgICAgICAgc291cmNlLm9uKCdpbWFnZWxvYWRlbmQnLCBPbDRXbXNTb3VyY2UuaW1hZ2VMb2FkRW5kKTtcbiAgICAgICAgICAgIHNvdXJjZS5vbignaW1hZ2Vsb2FkZXJyb3InLCBPbDRXbXNTb3VyY2UuaW1hZ2VMb2FkRXJyb3IpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIGltYWdlTG9hZFN0YXJ0KGU6IG9sLnNvdXJjZS5JbWFnZUV2ZW50KSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdzdGFydCcsICg8b2wuc291cmNlLkltYWdlV01TPmUudGFyZ2V0KS5nZXQoTEFZRVJfVVVJRCkpO1xuICAgICAgICBpZihPbDRXbXNTb3VyY2UubWFwQWN0aXZpdHkpIHtcbiAgICAgICAgICAgIE9sNFdtc1NvdXJjZS5tYXBBY3Rpdml0eS5sb2FkU3RhcnQoKDxvbC5zb3VyY2UuSW1hZ2VXTVM+ZS50YXJnZXQpLmdldChMQVlFUl9VVUlEKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgaW1hZ2VMb2FkRW5kKGU6IG9sLnNvdXJjZS5JbWFnZUV2ZW50KSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdlbmQnLCAoPG9sLnNvdXJjZS5JbWFnZVdNUz5lLnRhcmdldCkuZ2V0KExBWUVSX1VVSUQpKTtcbiAgICAgICAgaWYoT2w0V21zU291cmNlLm1hcEFjdGl2aXR5KSB7XG4gICAgICAgICAgICBPbDRXbXNTb3VyY2UubWFwQWN0aXZpdHkubG9hZEVuZCgoPG9sLnNvdXJjZS5JbWFnZVdNUz5lLnRhcmdldCkuZ2V0KExBWUVSX1VVSUQpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBpbWFnZUxvYWRFcnJvcihlOiBvbC5zb3VyY2UuSW1hZ2VFdmVudCkge1xuICAgICAgICAvLyBjb25zb2xlLmxvZygnZXJyb3InLCAoPG9sLnNvdXJjZS5JbWFnZVdNUz5lLnRhcmdldCkuZ2V0KExBWUVSX1VVSUQpKTtcbiAgICAgICAgaWYoT2w0V21zU291cmNlLm1hcEFjdGl2aXR5KSB7XG4gICAgICAgICAgICBPbDRXbXNTb3VyY2UubWFwQWN0aXZpdHkubG9hZEVycm9yKCg8b2wuc291cmNlLkltYWdlV01TPmUudGFyZ2V0KS5nZXQoTEFZRVJfVVVJRCkpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgTWFwQWN0aXZpdHkge1xuICAgIHByaXZhdGUgc3RhdGljIF9pbnN0YW5jZTogTWFwQWN0aXZpdHk7XG4gICAgcHJpdmF0ZSBsYXllcnM6IGFueSA9IHt9O1xuICAgIHByaXZhdGUgaXNMb2FkaW5nOiBib29sZWFuID0gZmFsc2U7XG5cbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKCkge1xuICAgIH1cblxuICAgIHN0YXRpYyBjcmVhdGUoKTogTWFwQWN0aXZpdHkge1xuICAgICAgICBpZiAoIU1hcEFjdGl2aXR5Ll9pbnN0YW5jZSkgey8vIHNpbmdsZXRvblxuICAgICAgICAgICAgTWFwQWN0aXZpdHkuX2luc3RhbmNlID0gbmV3IE1hcEFjdGl2aXR5KCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE1hcEFjdGl2aXR5Ll9pbnN0YW5jZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFjdGl2aXR5U3RhcnQobGF5ZXJOYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5sYXllcnNbbGF5ZXJOYW1lXSA9IHRydWU7XG4gICAgICAgIGlmICh0aGlzLmlzTG9hZGluZyA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHRoaXMuaXNMb2FkaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIHdpbmRvd1snbWV0YWRvciddLnByZWxvYWRlclN0YXJ0KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGFjdGl2aXR5RW5kKGxheWVyTmFtZTogc3RyaW5nKSB7XG4gICAgICAgIGlmICh0aGlzLmxheWVyc1tsYXllck5hbWVdKSB7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5sYXllcnNbbGF5ZXJOYW1lXTtcbiAgICAgICAgfVxuICAgICAgICBmb3IobGV0IGxheWVyTiBpbiB0aGlzLmxheWVycykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XG4gICAgICAgIHdpbmRvd1snbWV0YWRvciddLnByZWxvYWRlclN0b3AoKTtcbiAgICB9XG5cbiAgICBsb2FkU3RhcnQobGF5ZXJOYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5hY3Rpdml0eVN0YXJ0KGxheWVyTmFtZSk7XG4gICAgfVxuXG4gICAgbG9hZEVuZChsYXllck5hbWU6IHN0cmluZykge1xuICAgICAgICB0aGlzLmFjdGl2aXR5RW5kKGxheWVyTmFtZSk7XG4gICAgfVxuXG4gICAgbG9hZEVycm9yKGxheWVyTmFtZTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuYWN0aXZpdHlFbmQobGF5ZXJOYW1lKTtcbiAgICB9XG59XG4iLCJleHBvcnQgY2xhc3MgRUVsZW1lbnQge1xuICAgIHByaXZhdGUgX2VsZW1lbnQ6IEhUTUxFbGVtZW50O1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQ6IEhUTUxFbGVtZW50KXtcbiAgICAgICAgdGhpcy5fZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgfVxuXG4gICAgZ2V0IGVsZW1lbnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9lbGVtZW50O1xuICAgIH1cblxuICAgIHNldEF0dHJzKGF0dHJzOiBPYmplY3QgPSB7fSkge1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBhdHRycykge1xuICAgICAgICAgICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoa2V5LCBhdHRyc1trZXldKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzZXRBdHRyKGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKGtleSwgdmFsdWUpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgZ2V0QXR0cihrZXk6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gdGhpcy5fZWxlbWVudC5nZXRBdHRyaWJ1dGUoa2V5KTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBkb20ge1xuICAgIC8vIHByaXZhdGUgc3RhdGljIGRhdGEgPSBkYXRhO1xuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gdGFnbmFtZVxuICAgICAqIEBwYXJhbSBvcHRpb25zXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fVxuICAgICAqL1xuICAgIHN0YXRpYyBjcmVhdGUodGFnbmFtZTogc3RyaW5nLCBhdHRyczogYW55ID0ge30sIGNsYXNzZXM6IHN0cmluZ1tdID0gW10sIHRleHQ6IHN0cmluZyA9ICcnLCBkYXRhOiBhbnkgPSB7fSk6IEhUTUxFbGVtZW50IHtcbiAgICAgICAgbGV0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZ25hbWUpO1xuICAgICAgICByZXR1cm4gZG9tLmFkZChlbGVtZW50LCBhdHRycywgY2xhc3NlcywgdGV4dCwgZGF0YSk7XG4gICAgfVxuXG4gICAgc3RhdGljIGFkZChlbGVtZW50OiBIVE1MRWxlbWVudCwgYXR0cnM6IGFueSA9IHt9LCBjbGFzc2VzOiBzdHJpbmdbXSA9IFtdLCB0ZXh0OiBzdHJpbmcgPSAnJywgZGF0YTogYW55ID0ge30pOiBIVE1MRWxlbWVudCB7XG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIGF0dHJzKSB7XG4gICAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShrZXksIGF0dHJzW2tleV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChjb25zdCBuYW1lIG9mIGNsYXNzZXMpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChuYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGV4dCAhPT0gJycpIHtcbiAgICAgICAgICAgIGVsZW1lbnQudGV4dENvbnRlbnQgPSB0ZXh0O1xuICAgICAgICB9XG4gICAgICAgIC8vIGZvciAoY29uc3Qga2V5IGluIGRhdGEpIHtcbiAgICAgICAgLy8gICAgIGVsZW1lbnQuZGF0YXNldFtrZXldID0gZGF0YVtrZXldO1xuICAgICAgICAvLyB9XG5cbiAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gc2VsZWN0b3JcbiAgICAgKiBAcmV0dXJucyB7Tm9kZUxpc3RPZjxFbGVtZW50Pn1cbiAgICAgKi9cbiAgICBzdGF0aWMgZmluZChzZWxlY3Rvcjogc3RyaW5nLCBjb250ZXh0OiBhbnkgPSBkb2N1bWVudCk6IE5vZGVMaXN0T2Y8RWxlbWVudD4ge1xuICAgICAgICBpZiAoY29udGV4dCBpbnN0YW5jZW9mIERvY3VtZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gY29udGV4dC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgICAgICAgfSBlbHNlIGlmIChjb250ZXh0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBjb250ZXh0LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7IC8vIFRPRE8gcmV0dXJuIGEgYmxhbmsgTm9kZUxpc3RPZjxFbGVtZW50PlxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gc2VsZWN0b3JcbiAgICAgKiBAcmV0dXJucyB7RWxlbWVudHxudWxsfVxuICAgICAqL1xuICAgIHN0YXRpYyBmaW5kRmlyc3Qoc2VsZWN0b3I6IHN0cmluZywgY29udGV4dDogYW55ID0gZG9jdW1lbnQpOiBFbGVtZW50IHtcbiAgICAgICAgaWYgKGNvbnRleHQgaW5zdGFuY2VvZiBEb2N1bWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGNvbnRleHQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgICAgIH0gZWxzZSBpZiAoY29udGV4dCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gY29udGV4dC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZWxlbWVudFxuICAgICAqIEBwYXJhbSBuYW1lXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgYW4gZWxlbWVudCBjb250YWlucyBhIGNsYXNzIG5hbWVcbiAgICAgKi9cbiAgICBzdGF0aWMgaGFzQ2xhc3MoZWxlbWVudDogSFRNTEVsZW1lbnQsIG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gZWxlbWVudCAhPT0gbnVsbCAmJiBlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhuYW1lKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZWxlbWVudFxuICAgICAqIEBwYXJhbSBuYW1lXG4gICAgICogQHJldHVybnMge0VsZW1lbnR9XG4gICAgICovXG4gICAgc3RhdGljIGFkZENsYXNzKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBuYW1lOiBzdHJpbmcpOiBIVE1MRWxlbWVudCB8IG51bGwge1xuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQobmFtZSk7XG4gICAgICAgIHJldHVybiBlbGVtZW50O1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBwYXJhbSBlbGVtZW50XG4gICAgICogQHBhcmFtIG5hbWVcbiAgICAgKiBAcmV0dXJucyB7RWxlbWVudH1cbiAgICAgKi9cbiAgICBzdGF0aWMgcmVtb3ZlQ2xhc3MoZWxlbWVudDogSFRNTEVsZW1lbnQsIG5hbWU6IHN0cmluZyk6IEhUTUxFbGVtZW50IHwgbnVsbCB7XG4gICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShuYW1lKTtcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0gbmFtZVxuICAgICAqIEByZXR1cm5zIHtFbGVtZW50fVxuICAgICAqL1xuICAgIHN0YXRpYyB0b2dnbGVDbGFzcyhlbGVtZW50OiBFbGVtZW50LCBuYW1lOiBzdHJpbmcpOiBFbGVtZW50IHwgbnVsbCB7XG4gICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShuYW1lKTtcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgfVxuXG4gICAgLy9cbiAgICAvLyAvKipcbiAgICAvLyAgKiBSZXR1cm5zIHdpdGggZWxlbWVudCBiaW5kZWQgZGF0YS5cbiAgICAvLyAgKiBAcGFyYW0gZWxlbWVudFxuICAgIC8vICAqIEBwYXJhbSBrZXlcbiAgICAvLyAgKiBAcmV0dXJucyB7YW55fVxuICAgIC8vICAqL1xuICAgIC8vIHN0YXRpYyBnZXREYXRhKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBrZXk6IHN0cmluZyA9IG51bGwpOiBhbnkge1xuICAgIC8vICAgICBpZiAoIWRvbS5oYXNEYXRhKGVsZW1lbnQsIGtleSkpIHtcbiAgICAvLyAgICAgICAgIHJldHVybiBudWxsO1xuICAgIC8vICAgICB9IGVsc2UgaWYgKGtleSA9PT0gbnVsbCkge1xuICAgIC8vICAgICAgICAgcmV0dXJuIGRvbS5kYXRhLmdldChlbGVtZW50KTtcbiAgICAvLyAgICAgfSBlbHNlIHtcbiAgICAvLyAgICAgICAgIHJldHVybiBkb20uZGF0YS5nZXQoZWxlbWVudClba2V5XTtcbiAgICAvLyAgICAgfVxuICAgIC8vIH1cbiAgICAvL1xuICAgIC8vIC8qKlxuICAgIC8vICAqIEJpbmRzIHdpdGggYW4gZWxlbWVudCBhIGRhdGEuXG4gICAgLy8gICogQHBhcmFtIGVsZW1lbnRcbiAgICAvLyAgKiBAcGFyYW0ga2V5XG4gICAgLy8gICogQHBhcmFtIHZhbHVlXG4gICAgLy8gICovXG4gICAgLy8gc3RhdGljIHNldERhdGEoZWxlbWVudDogSFRNTEVsZW1lbnQsIGtleTogc3RyaW5nLCB2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgLy8gICAgIGlmICghZG9tLmhhc0RhdGEoZWxlbWVudCkpIHtcbiAgICAvLyAgICAgICAgIGRvbS5kYXRhLnNldChlbGVtZW50LCB7a2V5OiB2YWx1ZX0pO1xuICAgIC8vICAgICB9IGVsc2Uge1xuICAgIC8vICAgICAgICAgbGV0IHRtcCA9IGRvbS5nZXREYXRhKGVsZW1lbnQpO1xuICAgIC8vICAgICAgICAgdG1wW2tleV0gPSB2YWx1ZTtcbiAgICAvLyAgICAgICAgIGRvbS5kYXRhLnNldChlbGVtZW50LCB0bXApO1xuICAgIC8vICAgICB9XG4gICAgLy8gfVxuICAgIC8vXG4gICAgLy8gLyoqXG4gICAgLy8gICogQ2hlY2tzIGlmIHRoZSBlbGVtZW50IGlzIGJpbmRpbmcgd2l0aCBhIGRhdGFcbiAgICAvLyAgKiBAcGFyYW0gZWxlbWVudFxuICAgIC8vICAqIEBwYXJhbSBrZXlcbiAgICAvLyAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAvLyAgKi9cbiAgICAvLyBzdGF0aWMgaGFzRGF0YShlbGVtZW50OiBIVE1MRWxlbWVudCwga2V5OiBzdHJpbmcgPSBudWxsKTogYm9vbGVhbiB7XG4gICAgLy8gICAgIGlmICghZG9tLmRhdGEuaGFzKGVsZW1lbnQpKSB7XG4gICAgLy8gICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgLy8gICAgIH0gZWxzZSBpZiAoa2V5ID09PSBudWxsKSB7XG4gICAgLy8gICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAvLyAgICAgfSBlbHNlIHtcbiAgICAvLyAgICAgICAgIHJldHVybiBkb20uZ2V0RGF0YShlbGVtZW50KVtrZXldICE9PSBudWxsID8gdHJ1ZSA6IGZhbHNlO1xuICAgIC8vICAgICB9XG4gICAgLy8gfVxuICAgIC8vXG4gICAgLy8gLyoqXG4gICAgLy8gICogRGVsZXRlcyB3aXRoIGFuIGVsZW1lbnQgYmluZGluZyBkYXRhXG4gICAgLy8gICogQHBhcmFtIGVsZW1lbnRcbiAgICAvLyAgKiBAcGFyYW0ga2V5XG4gICAgLy8gICovXG4gICAgLy8gc3RhdGljIGRlbGV0ZURhdGEoZWxlbWVudDogSFRNTEVsZW1lbnQsIGtleTogc3RyaW5nID0gbnVsbCk6IHZvaWQge1xuICAgIC8vICAgICBpZiAoZG9tLmhhc0RhdGEoZWxlbWVudCwga2V5KSkge1xuICAgIC8vICAgICAgICAgaWYgKGtleSA9PT0gbnVsbCkge1xuICAgIC8vICAgICAgICAgICAgIGRvbS5kYXRhLmRlbGV0ZShlbGVtZW50KTtcbiAgICAvLyAgICAgICAgIH0gZWxzZSB7XG4gICAgLy8gICAgICAgICAgICAgbGV0IHRtcCA9IGRvbS5nZXREYXRhKGVsZW1lbnQpO1xuICAgIC8vICAgICAgICAgICAgIGRlbGV0ZSB0bXBba2V5XTtcbiAgICAvLyAgICAgICAgICAgICBkb20uZGF0YS5zZXQoZWxlbWVudCwgdG1wKTtcbiAgICAvLyAgICAgICAgIH1cbiAgICAvLyAgICAgfVxuICAgIC8vIH1cbn0iLCJpbXBvcnQgKiBhcyBtZXRhZG9yIGZyb20gJy4vT2w0JztcblxuZGVjbGFyZSB2YXIgQ29uZmlndXJhdGlvbjogYW55O1xuXG5sZXQgY29udGV4dDogYW55ID0gV2luZG93O1xuY29udGV4dC5tZXRhZG9yID0gbWV0YWRvcjtcblxuZXhwb3J0IGZ1bmN0aW9uIGluaXQoKSB7XG5cbiAgICB2YXIgbWV0YWRvck1hcENvbmZpZyA9IHtcbiAgICAgICAgbWFwOiB7XG4gICAgICAgICAgICB0YXJnZXQ6ICdtYXAnLFxuICAgICAgICAgICAgc3JzOiBbXCJFUFNHOjQzMjZcIiwgXCJFUFNHOjMxNDY2XCIsIFwiRVBTRzoyNTgzMlwiXVxuICAgICAgICB9LFxuICAgICAgICB2aWV3OiB7XG4gICAgICAgICAgICBwcm9qZWN0aW9uOiBDb25maWd1cmF0aW9uLnNldHRpbmdzWydtYXBfY3JzJ10sLy8nOiAnOSw0OSwxMSw1MycsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdcbiAgICAgICAgICAgIG1heEV4dGVudDogQ29uZmlndXJhdGlvbi5zZXR0aW5nc1snbWFwX2Jib3hfbWF4J10uc3BsaXQoLyxcXHM/LyksLy9bNS44LCA0Ny4wLCAxNS4wLCA1NS4wXSwgLy8gcHJpb3JpdHkgZm9yIHNjYWxlcyBvciBmb3IgbWF4RXh0ZW50P1xuICAgICAgICAgICAgc3RhcnRFeHRlbnQ6IENvbmZpZ3VyYXRpb24uc2V0dGluZ3NbJ21hcF9iYm94X3N0YXJ0J10uc3BsaXQoLyxcXHM/LyksXG4gICAgICAgICAgICBzY2FsZXM6IFs1MDAwLCAyNTAwMCwgNTAwMDAsIDEwMDAwMCwgMjAwMDAwLCAyNTAwMDAsIDUwMDAwMCwgMTAwMDAwMCwgMjAwMDAwMCwgNTAwMDAwMCwgMTAwMDAwMDBdLy8sIDIwMDAwMDAwLCA1MDAwMDAwMF1cbiAgICAgICAgfSxcbiAgICAgICAgc3R5bGVzOiB7XG4gICAgICAgICAgICBoaWdobGlnaHQ6IHtcbiAgICAgICAgICAgICAgICBmaWxsOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiAncmdiYSg2MCwgNjAsIDI1NSwgMC4xKSdcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHN0cm9rZToge1xuICAgICAgICAgICAgICAgICAgICBjb2xvcjogJ3JnYmEoNjAsIDYwLCAyNTUsIDEuMCknLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogMlxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZWFyY2g6IHtcbiAgICAgICAgICAgICAgICBmaWxsOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiAncmdiYSgyNTUsIDYwLCA2MCwgMC4xKSdcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHN0cm9rZToge1xuICAgICAgICAgICAgICAgICAgICBjb2xvcjogJ3JnYmEoMjU1LCA2MCwgNjAsIDEuMCknLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogMlxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgaW1hZ2U6IHtcbiAgICAgICAgICAgICAgICAgICAgY2lyY2xlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByYWRpdXM6IDUsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxsOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6ICdyZ2JhKDI1NSwgNjAsIDYwLCAwLjYpJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBzb3VyY2U6IFtdLFxuICAgICAgICAvLyBhZGQgYWRkaXRpb25hbCBwYXJhbWV0ZXJzIHdpdGggKyBcIkFERElUSU9OQUxcIlxuICAgICAgICBwcm9qNERlZnM6IHtcbiAgICAgICAgICAgIFwiRVBTRzo0MzI2XCI6IFwiK3Byb2o9bG9uZ2xhdCArZGF0dW09V0dTODQgK3VuaXRzPWRlZ3JlZXMgK25vX2RlZnNcIiArIFwiICtheGlzPW5ldVwiLFxuICAgICAgICAgICAgXCJFUFNHOjQyNThcIjogXCIrcHJvaj1sb25nbGF0ICtlbGxwcz1HUlM4MCArdG93Z3M4ND0wLDAsMCwwLDAsMCwwICtub19kZWZzXCIgKyBcIiArdW5pdHM9ZGVncmVlcyArYXhpcz1uZXVcIixcbiAgICAgICAgICAgIFwiRVBTRzozMTQ2NlwiOiBcIitwcm9qPXRtZXJjICtsYXRfMD0wICtsb25fMD02ICtrPTEgK3hfMD0yNTAwMDAwICt5XzA9MCArZWxscHM9YmVzc2VsICt0b3dnczg0PTU5OC4xLDczLjcsNDE4LjIsMC4yMDIsMC4wNDUsLTIuNDU1LDYuNyArdW5pdHM9bSArbm9fZGVmc1wiICsgXCIgK2F4aXM9bmV1XCIsXG4gICAgICAgICAgICBcIkVQU0c6MzE0NjdcIjogXCIrcHJvaj10bWVyYyArbGF0XzA9MCArbG9uXzA9OSAraz0xICt4XzA9MzUwMDAwMCAreV8wPTAgK2VsbHBzPWJlc3NlbCArdG93Z3M4ND01OTguMSw3My43LDQxOC4yLDAuMjAyLDAuMDQ1LC0yLjQ1NSw2LjcgK3VuaXRzPW0gK25vX2RlZnNcIiArIFwiICtheGlzPW5ldVwiLFxuICAgICAgICAgICAgLy8gXCJFUFNHOjMxNDY4XCI6IFwiK3Byb2o9dG1lcmMgK2xhdF8wPTAgK2xvbl8wPTEyICtrPTEgK3hfMD00NTAwMDAwICt5XzA9MCArZWxscHM9YmVzc2VsICt0b3dnczg0PTU5OC4xLDczLjcsNDE4LjIsMC4yMDIsMC4wNDUsLTIuNDU1LDYuNyArdW5pdHM9bSArbm9fZGVmc1wiICsgXCIgK2F4aXM9bmV1XCIsXG4gICAgICAgICAgICAvLyBcIkVQU0c6MzE0NjlcIjogXCIrcHJvaj10bWVyYyArbGF0XzA9MCArbG9uXzA9MTUgK2s9MSAreF8wPTU1MDAwMDAgK3lfMD0wICtlbGxwcz1iZXNzZWwgK3Rvd2dzODQ9NTk4LjEsNzMuNyw0MTguMiwwLjIwMiwwLjA0NSwtMi40NTUsNi43ICt1bml0cz1tICtub19kZWZzXCIgKyBcIiArYXhpcz1uZXVcIixcbiAgICAgICAgICAgIFwiRVBTRzoyNTgzMlwiOiBcIitwcm9qPXV0bSArem9uZT0zMiArZWxscHM9R1JTODAgK3Rvd2dzODQ9MCwwLDAsMCwwLDAsMCArdW5pdHM9bSArbm9fZGVmc1wiLFxuICAgICAgICAgICAgLy8gXCJFUFNHOjI1ODMzXCI6IFwiK3Byb2o9dXRtICt6b25lPTMzICtlbGxwcz1HUlM4MCArdG93Z3M4ND0wLDAsMCwwLDAsMCwwICt1bml0cz1tICtub19kZWZzXCJcbiAgICAgICAgfSxcbiAgICAgICAgY29tcG9uZW50OiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY2xhc3M6ICcnLFxuICAgICAgICAgICAgICAgIHNlbGVjdG9yOiBcIlwiXG4gICAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICB9O1xuXG4gICAgLy8gY29uc29sZS5sb2coQ29uZmlndXJhdGlvbik7XG4gICAgZm9yIChjb25zdCBrZXkgaW4gQ29uZmlndXJhdGlvbi5jb25maWcubWFwX2JhY2tncm91bmQpIHtcbiAgICAgICAgbGV0IHdtcyA9IENvbmZpZ3VyYXRpb24uY29uZmlnLm1hcF9iYWNrZ3JvdW5kW2tleV07XG4gICAgICAgIGxldCBsYXllcnMgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBsIGluIHdtcy5sYXllcnMpIHtcbiAgICAgICAgICAgIGxheWVycy5wdXNoKHdtcy5sYXllcnNbbF0pO1xuICAgICAgICB9XG4gICAgICAgIG1ldGFkb3JNYXBDb25maWcuc291cmNlLnB1c2goe1xuICAgICAgICAgICAgJ3R5cGUnOiAnV01TJyxcbiAgICAgICAgICAgICd1cmwnOiB3bXMudXJsLFxuICAgICAgICAgICAgJ3RpdGxlJzogd21zLnRpdGxlLFxuICAgICAgICAgICAgJ29wYWNpdHknOiB3bXMub3BhY2l0eSxcbiAgICAgICAgICAgICd2aXNpYmxlJzogd21zLnZpc2libGUsXG4gICAgICAgICAgICAncGFyYW1zJzoge1xuICAgICAgICAgICAgICAgICdMQVlFUlMnOiBsYXllcnMuam9pbihcIixcIiksXG4gICAgICAgICAgICAgICAgJ1ZFUlNJT04nOiB3bXMudmVyc2lvbixcbiAgICAgICAgICAgICAgICAnRk9STUFUJzogd21zLmZvcm1hdFxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLy8gY29uc29sZS5sb2cobWV0YWRvck1hcENvbmZpZyk7XG4gICAgbGV0IG1ldGFkb3JNYXAgPSBtZXRhZG9yLk9sNE1hcC5jcmVhdGUobWV0YWRvck1hcENvbmZpZyk7XG4gICAgLy8gbWV0YWRvck1hcC5pbml0TGF5ZXJ0cmVlKCk7XG4gICAgbWV0YWRvclsnbWV0YWRvck1hcCddID0gbWV0YWRvck1hcDtcbiAgICAvLyBtZXRhZG9yWydnZW9tTG9hZGVyJ10gPSBuZXcgbWV0YWRvci5HZW9tTG9hZGVyKG1ldGFkb3JNYXAsIDxIVE1MRm9ybUVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2ZpbGUtdXBsb2FkLWZvcm0nKSk7XG59XG5cbm1ldGFkb3JbJ2luaXRNYXAnXSA9IGluaXQ7Il19
