(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dom_1 = require("./dom");
var DragZoom = (function () {
    function DragZoom(map) {
        this.olMap = map;
        this.dragzoom = new ol.interaction.DragZoom({
            condition: function () {
                return true;
            }
        });
        dom_1.dom.findFirst(DragZoom.buttonSelector).addEventListener('click', this.buttonClick.bind(this), false);
        this.dragzoom.on('boxend', this.deactivate.bind(this));
    }
    DragZoom.prototype.buttonClick = function (e) {
        if (!dom_1.dom.hasClass(e.target, 'success')) {
            this.activate();
        }
        else {
            this.deactivate();
        }
    };
    DragZoom.prototype.activate = function () {
        dom_1.dom.addClass(dom_1.dom.findFirst(DragZoom.buttonSelector), 'success');
        this.olMap.addInteraction(this.dragzoom);
    };
    DragZoom.prototype.deactivate = function () {
        dom_1.dom.removeClass(dom_1.dom.findFirst(DragZoom.buttonSelector), 'success');
        this.olMap.removeInteraction(this.dragzoom);
    };
    DragZoom.buttonSelector = '.-js-zoom-box';
    return DragZoom;
}());
exports.DragZoom = DragZoom;

},{"./dom":6}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Ol4_1 = require("./Ol4");
var dom_1 = require("./dom");
var FeatureInfo = (function () {
    function FeatureInfo(map, layer) {
        if (layer === void 0) { layer = null; }
        this.olMap = map;
        this.layer = layer;
        dom_1.dom.findFirst(FeatureInfo.buttonSelector).addEventListener('click', this.buttonClick.bind(this), false);
    }
    FeatureInfo.prototype.buttonClick = function (e) {
        if (!dom_1.dom.hasClass(e.currentTarget, 'success')) {
            this.activate();
        }
        else {
            this.deactivate();
        }
    };
    FeatureInfo.prototype.activate = function () {
        dom_1.dom.addClass(dom_1.dom.findFirst(FeatureInfo.buttonSelector), 'success');
        this.olMap.on('click', this.mapClick, this);
        this.tooltipElm = dom_1.dom.create('div', {}, ['tooltip', 'hidden']);
        this.tooltipElm.addEventListener('click', this.itemClick.bind(this), false);
        this.tooltip = new ol.Overlay({
            element: this.tooltipElm,
            offset: [0, -6],
            positioning: 'bottom-center'
        });
        this.olMap.addOverlay(this.tooltip);
    };
    FeatureInfo.prototype.deactivate = function () {
        dom_1.dom.removeClass(dom_1.dom.findFirst(FeatureInfo.buttonSelector), 'success');
        this.tooltipElm.removeEventListener('click', this.itemClick.bind(this));
        this.tooltipElm.remove();
        this.olMap.removeOverlay(this.tooltip);
        this.olMap.un('click', this.mapClick, this);
    };
    FeatureInfo.prototype.itemClick = function (e) {
        if (e.target.tagName === FeatureInfo.itemTagName.toUpperCase()) {
            this.selectDataset(e.target.getAttribute(FeatureInfo.dataAttrName(FeatureInfo.keyId)));
        }
        else {
            e.stopPropagation();
        }
    };
    FeatureInfo.dataAttrName = function (name) {
        return 'data-' + name;
    };
    FeatureInfo.prototype.mapClick = function (e) {
        this.tooltipElm.innerHTML = '';
        var lay = this.layer;
        var features = new Array();
        this.olMap.forEachFeatureAtPixel(e.pixel, function (feature) {
            features.push(feature);
        }, {
            layerFilter: function (layer) {
                return layer.get(Ol4_1.UUID) === lay.get(Ol4_1.UUID);
            }
        });
        if (features.length === 0) {
            dom_1.dom.addClass(this.tooltipElm, 'hidden');
        }
        else if (features.length === 1) {
            dom_1.dom.addClass(this.tooltipElm, 'hidden');
            this.selectDataset(features[0].get(FeatureInfo.keyId));
        }
        else {
            for (var _i = 0, features_1 = features; _i < features_1.length; _i++) {
                var feature = features_1[_i];
                var dataAttr = FeatureInfo.dataAttrName(FeatureInfo.keyId);
                var title = feature.get(FeatureInfo.keyTitle);
                var aTitle = feature.get(FeatureInfo.keyAlternateTitle);
                var attrs = {
                    dataAttr: feature.get(FeatureInfo.keyId),
                    title: aTitle ? title + ' / ' + aTitle : title
                };
                attrs[FeatureInfo.dataAttrName(FeatureInfo.keyId)] = feature.get(FeatureInfo.keyId);
                this.tooltipElm.appendChild(dom_1.dom.create(FeatureInfo.itemTagName, attrs, [], title));
            }
            this.tooltip.setPosition(e.coordinate);
            dom_1.dom.removeClass(this.tooltipElm, 'hidden');
        }
    };
    FeatureInfo.prototype.selectDataset = function (selector) {
        console.log('set class ' + FeatureInfo.selectClass + ' for dataset' + selector);
    };
    FeatureInfo.prototype.unSelectDataset = function () {
        console.log('remove class ' + FeatureInfo.selectClass + ' for all datasets');
    };
    FeatureInfo.buttonSelector = '.-js-map-info';
    FeatureInfo.selectClass = 'select';
    FeatureInfo.keyId = 'uuid';
    FeatureInfo.keyTitle = 'title';
    FeatureInfo.keyAlternateTitle = 'alternateTitle';
    FeatureInfo.itemTagName = 'span';
    return FeatureInfo;
}());
exports.FeatureInfo = FeatureInfo;

},{"./Ol4":4,"./dom":6}],3:[function(require,module,exports){
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
            this.addDraggable(dummy, true);
        }
    }
    LayerTree.create = function (ol4Map) {
        if (!LayerTree._instance) {
            LayerTree._instance = new LayerTree(ol4Map);
        }
        return LayerTree._instance;
    };
    LayerTree.prototype.findLayerItem = function (layer) {
        return dom_1.dom.findFirst('#' + layer.get(Ol4_1.UUID));
    };
    LayerTree.prototype.findLayerVisible = function (layer) {
        return dom_1.dom.findFirst('#' + layer.get(Ol4_1.UUID) + ' .-js-map-source-visible');
    };
    LayerTree.prototype.findLayerOpacity = function (layer) {
        return dom_1.dom.findFirst('#' + layer.get(Ol4_1.UUID) + ' .-js-map-source-opacity');
    };
    LayerTree.prototype.getVisible = function (layer) {
        var checkbox = this.findLayerVisible(layer);
        return checkbox.checked;
    };
    LayerTree.prototype.setVisible = function (layer, visible, action) {
        if (action === void 0) { action = false; }
        var checkbox = this.findLayerVisible(layer);
        if (checkbox.checked !== visible && !action) {
            checkbox.checked = visible;
        }
        else if (checkbox.checked !== visible && action) {
            checkbox.click();
        }
    };
    LayerTree.prototype.setDisable = function (layer, disable) {
        var item = this.findLayerItem(layer);
        var checkboxVisible = this.findLayerVisible(layer);
        var selectOpacity = this.findLayerOpacity(layer);
        if (disable) {
            dom_1.dom.addClass(item, 'disabled');
            checkboxVisible.setAttribute('disabled', 'true');
            selectOpacity.setAttribute('disabled', 'true');
        }
        else {
            dom_1.dom.removeClass(item, 'disabled');
            checkboxVisible.removeAttribute('disabled');
            selectOpacity.removeAttribute('disabled');
        }
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
    LayerTree.prototype.remove = function (layer) {
        var layerNode = this.findLayerItem(layer);
        if (layerNode) {
            this.removeDraggable(layerNode);
            layerNode.remove();
        }
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
            this.addDraggable(layerNode);
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
        var select = dom_1.dom.create('select', {}, ['input-element', 'medium', 'simple', 'map-source-opacity', '-js-map-source-opacity']);
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
    LayerTree.prototype.addDraggable = function (layer, isDummy) {
        if (isDummy === void 0) { isDummy = false; }
        if (!isDummy) {
            layer.addEventListener('dragstart', this.dragStart.bind(this), false);
            layer.addEventListener('dragend', this.dragEnd.bind(this), false);
        }
        layer.addEventListener('dragenter', this.dragEnter.bind(this), false);
        layer.addEventListener('dragover', this.dragOver.bind(this), false);
        layer.addEventListener('drop', this.dragDrop.bind(this), false);
    };
    LayerTree.prototype.removeDraggable = function (layer, isDummy) {
        if (isDummy === void 0) { isDummy = false; }
        if (!isDummy) {
            layer.removeEventListener('dragstart', this.dragStart.bind(this), false);
            layer.removeEventListener('dragend', this.dragEnd.bind(this), false);
        }
        layer.removeEventListener('dragenter', this.dragEnter.bind(this), false);
        layer.removeEventListener('dragover', this.dragOver.bind(this), false);
        layer.removeEventListener('drop', this.dragDrop.bind(this), false);
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

},{"./Ol4":4,"./dom":6}],4:[function(require,module,exports){
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
var DragZoom_1 = require("./DragZoom");
var Ol4Source_1 = require("./Ol4Source");
var FeatureInfo_1 = require("./FeatureInfo");
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
        ol['ENABLE_RASTER_REPROJECTION'] = false;
        Ol4Utils.initProj4Defs(options['proj4Defs']);
        this.layertree = LayerTree_1.LayerTree.create(this);
        this.wmsSource = Ol4Source_1.Ol4WmsSource.create(this, true);
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
        var controls = ol.control.defaults({ attribution: false });
        this.olMap = new ol.Map({
            interactions: interactions,
            target: options['map']['target'],
            renderer: 'canvas',
            controls: controls
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
                var wmsLayer = this.addLayer(this.wmsSource.createLayer(Ol4Map.getUuid('olay-'), sourceOptions, this.olMap.getView().getProjection(), sourceOptions['visible'], parseFloat(sourceOptions['opacity'])), true);
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
        this.dragzoom = new DragZoom_1.DragZoom(this.olMap);
        this.featureInfo = new FeatureInfo_1.FeatureInfo(this.olMap, this.hgLayer);
    }
    Ol4Map.getUuid = function (prefix) {
        if (prefix === void 0) { prefix = ''; }
        return prefix + (++Ol4Map._uuid);
    };
    Ol4Map.prototype.getLayerTree = function () {
        return this.layertree;
    };
    Ol4Map.prototype.addIntoLayerTree = function (layer) {
        if (this.layertree) {
            this.layertree.add(layer);
        }
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
            var wmsLayer = this.addLayer(this.wmsSource.createLayer(Ol4Map.getUuid('olay-'), options, this.olMap.getView().getProjection(), options['visible'], parseFloat(options['opacity'])), true);
        }
        else {
            console.error(options['type'] + ' is not supported.');
        }
    };
    Ol4Map.prototype.addLayer = function (layer, addToLayertree) {
        if (addToLayertree === void 0) { addToLayertree = false; }
        if (layer instanceof ol.layer.Image) {
            var group = this.findLayer(exports.LAYER_IMAGE);
            group.getLayers().insertAt(group.getLayers().getLength(), layer);
        }
        else if (layer instanceof ol.layer.Vector) {
            var group = this.findLayer(exports.LAYER_VECTOR);
            group.getLayers().insertAt(group.getLayers().getLength(), layer);
        }
        else {
            return null;
        }
        if (addToLayertree) {
            this.addIntoLayerTree(layer);
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
            var extent = Ol4Extent.fromArray(this.olMap.getView().calculateExtent(this.olMap.getSize()), this.getProjection());
            var fromProj = this.getProjection();
            this.olMap.setView(this.createView(toProj, this.maxExtent.getExtent(toProj), Ol4Utils.resolutionsForScales(this.scales, toProj.getUnits()).reverse()));
            this.changeForILayersI(this.findLayer(exports.LAYER_IMAGE).getLayers(), fromProj, toProj);
            this.changeForVLayers(this.findLayer(exports.LAYER_VECTOR).getLayers(), fromProj, toProj);
            this.zoomToExtent(extent.getPolygonForExtent(toProj));
        }
    };
    Ol4Map.prototype.changeForVLayers = function (layers, fromProj, toProj) {
        for (var _i = 0, _a = layers.getArray(); _i < _a.length; _i++) {
            var layer = _a[_i];
            this.vecSource.reprojectionSource(layer, fromProj, toProj);
        }
    };
    Ol4Map.prototype.changeForILayersI = function (layers, fromProj, toProj) {
        for (var _i = 0, _a = layers.getArray(); _i < _a.length; _i++) {
            var layer = _a[_i];
            this.wmsSource.reprojectionSource(layer, fromProj, toProj);
            var source = layer.getSource();
            var ilf = source.getImageLoadFunction();
            source.setImageLoadFunction(ilf);
        }
    };
    Ol4Map.prototype.setVisible = function (layer, visiblity) {
        var _layer = layer instanceof ol.layer.Base ? layer : this.findLayer(layer);
        if (_layer) {
            _layer.setVisible(visiblity);
        }
    };
    Ol4Map.prototype.setOpacity = function (layer, opacity) {
        var _layer = layer instanceof ol.layer.Base ? layer : this.findLayer(layer);
        if (_layer) {
            _layer.setOpacity(opacity);
        }
    };
    Ol4Map.prototype.clearFeatures = function () {
        this.vecSource.clearFeatures(this.hgLayer);
    };
    Ol4Map.prototype.showFeatures = function (geoJson) {
        this.vecSource.showFeatures(this.hgLayer, geoJson);
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
        var multiPoint = Ol4Extent.fromArray(this.drawer.getLayer().getSource().getExtent(), this.olMap.getView().getProjection()).getGeom();
        var maxextent = this.maxExtent.getPolygonForExtent(this.olMap.getView().getProjection());
        if (maxextent.intersectsCoordinate(multiPoint.getPoint(0).getCoordinates())
            && maxextent.intersectsCoordinate(multiPoint.getPoint(1).getCoordinates())) {
            this.zoomToExtent(this.drawer.getLayer().getSource().getExtent());
        }
        else {
            metador.displayError('Die Geometrie ist außerhalb der räumlichen Erstreckung.');
        }
    };
    Ol4Map.prototype.drawShapeForSearch = function (shapeType, onDrawEnd) {
        if (shapeType === void 0) { shapeType = null; }
        if (onDrawEnd === void 0) { onDrawEnd = null; }
        this.setDoubleClickZoom(false);
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
                geojson['bbox'] = new Ol4Geom(e.feature.getGeometry(), ol4map.getProjection())
                    .getExtent(ol.proj.get(exports.METADOR_EPSG));
                onDrawEnd(geojson);
                olMap.removeInteraction(drawer_1.getInteraction());
            });
        }
        else {
            this.getDrawer().getLayer().getSource().clear();
            onDrawEnd(null);
            this.setDoubleClickZoom(true);
        }
    };
    Ol4Map.prototype.setDoubleClickZoom = function (state) {
        for (var _i = 0, _a = this.olMap.getInteractions().getArray(); _i < _a.length; _i++) {
            var interaction = _a[_i];
            if (interaction instanceof ol.interaction.DoubleClickZoom) {
                interaction.setActive(state);
                break;
            }
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

},{"./DragZoom":1,"./FeatureInfo":2,"./LayerTree":3,"./Ol4Source":5}],5:[function(require,module,exports){
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
    Ol4VectorSource.prototype.reprojectionSource = function (layer, fromProj, toProj) {
        var source = layer.getSource();
        var features = source.getFeatures();
        for (var _i = 0, features_1 = features; _i < features_1.length; _i++) {
            var feature = features_1[_i];
            feature.setGeometry(feature.getGeometry().transform(fromProj, toProj));
        }
    };
    Ol4VectorSource.prototype.cloneLayer = function (layer, fromProj, toProj) {
        return layer;
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
    function Ol4WmsSource(ol4Map, useLoadEvents) {
        if (useLoadEvents === void 0) { useLoadEvents = true; }
        this.ol4Map = ol4Map;
        this.useLoadEvents = useLoadEvents;
        if (this.useLoadEvents) {
            Ol4WmsSource.mapActivity = MapActivity.create();
        }
        this.disabled = {};
    }
    Ol4WmsSource.create = function (ol4Map, useLoadEvents) {
        if (useLoadEvents === void 0) { useLoadEvents = true; }
        if (!Ol4WmsSource._instance) {
            Ol4WmsSource._instance = new Ol4WmsSource(ol4Map, useLoadEvents);
        }
        return Ol4WmsSource._instance;
    };
    Ol4WmsSource.prototype.addDisabled = function (layer) {
        this.disabled[layer.get(Ol4_1.UUID)] = layer.get(Ol4_1.UUID);
        this.ol4Map.getLayerTree().setDisable(layer, true);
        this.ol4Map.setVisible(layer, false);
    };
    Ol4WmsSource.prototype.removeDisabled = function (layer) {
        if (layer.get(Ol4_1.UUID)) {
            this.ol4Map.getLayerTree().setDisable(layer, false);
            var visible = this.ol4Map.getLayerTree().getVisible(layer);
            this.ol4Map.setVisible(layer, visible);
            delete this.disabled[layer.get(Ol4_1.UUID)];
        }
    };
    Ol4WmsSource.prototype.createLayer = function (layerUuid, options, proj, visible, opacity) {
        if (options === void 0) { options = null; }
        var source = this.createSource(layerUuid, options['url'], options['params'], proj);
        var layerWms = this._createLayer(layerUuid, visible, opacity, source, options['title'] ? options['title'] : null);
        return layerWms;
    };
    Ol4WmsSource.prototype._createLayer = function (layerUuid, visible, opacity, source, title) {
        if (title === void 0) { title = null; }
        var layerWms = new ol.layer.Image({
            source: source,
            visible: visible,
            opacity: opacity
        });
        layerWms.set(Ol4_1.UUID, layerUuid);
        if (title !== null) {
            layerWms.set(Ol4_1.TITLE, title);
        }
        return layerWms;
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
    Ol4WmsSource.prototype.reprojectionSource = function (layer, fromProj, toProj) {
        var oldsource = layer.getSource();
        var newSource = this.createSource(layer.get(Ol4_1.UUID), oldsource.getUrl(), oldsource.getParams(), toProj);
        layer.setSource(newSource);
        this.removeDisabled(layer);
    };
    Ol4WmsSource.prototype.cloneLayer = function (layer, fromProj, toProj) {
        var oldsource = layer.getSource();
        var newSource = this.createSource(layer.get(Ol4_1.UUID), oldsource.getUrl(), oldsource.getParams(), toProj);
        var oldLayer = layer;
        var newLayer = this._createLayer(oldLayer.get(Ol4_1.UUID), oldLayer.getVisible(), oldLayer.getOpacity(), newSource, oldLayer.get(Ol4_1.TITLE));
        return newLayer;
    };
    Ol4WmsSource.prototype.setLoadEvents = function (source) {
        if (this.useLoadEvents) {
            source.on('imageloadstart', this.imageLoadStart.bind(this));
            source.on('imageloadend', this.imageLoadEnd.bind(this));
            source.on('imageloaderror', this.imageLoadError.bind(this));
        }
    };
    Ol4WmsSource.prototype.imageLoadStart = function (e) {
        if (Ol4WmsSource.mapActivity) {
            Ol4WmsSource.mapActivity.loadStart(e.target.get(Ol4_1.LAYER_UUID));
        }
    };
    Ol4WmsSource.prototype.imageLoadEnd = function (e) {
        if (Ol4WmsSource.mapActivity) {
            Ol4WmsSource.mapActivity.loadEnd(e.target.get(Ol4_1.LAYER_UUID));
        }
    };
    Ol4WmsSource.prototype.imageLoadError = function (e) {
        if (Ol4WmsSource.mapActivity) {
            Ol4WmsSource.mapActivity.loadError(e.target.get(Ol4_1.LAYER_UUID));
        }
        var layer = this.ol4Map.findLayer(e.target.get(Ol4_1.LAYER_UUID));
        this.addDisabled(layer);
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

},{"./Ol4":4}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var metador = require("./Ol4");
var context = window;
context.spatial = metador;
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
    context.spatial['map'] = metadorMap;
}
exports.init = init;
init();

},{"./Ol4":4}]},{},[7])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvUGx1Z2lucy9XaGVyZUdyb3VwL01hcEJ1bmRsZS9SZXNvdXJjZXMvdHMvRHJhZ1pvb20udHMiLCJzcmMvUGx1Z2lucy9XaGVyZUdyb3VwL01hcEJ1bmRsZS9SZXNvdXJjZXMvdHMvRmVhdHVyZUluZm8udHMiLCJzcmMvUGx1Z2lucy9XaGVyZUdyb3VwL01hcEJ1bmRsZS9SZXNvdXJjZXMvdHMvTGF5ZXJUcmVlLnRzIiwic3JjL1BsdWdpbnMvV2hlcmVHcm91cC9NYXBCdW5kbGUvUmVzb3VyY2VzL3RzL09sNC50cyIsInNyYy9QbHVnaW5zL1doZXJlR3JvdXAvTWFwQnVuZGxlL1Jlc291cmNlcy90cy9PbDRTb3VyY2UudHMiLCJzcmMvUGx1Z2lucy9XaGVyZUdyb3VwL01hcEJ1bmRsZS9SZXNvdXJjZXMvdHMvZG9tLnRzIiwic3JjL1BsdWdpbnMvV2hlcmVHcm91cC9NYXBCdW5kbGUvUmVzb3VyY2VzL3RzL21hcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsNkJBQTBCO0FBRTFCO0lBS0ksa0JBQVksR0FBVztRQUNuQixJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQztRQUNqQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksRUFBRSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUM7WUFDeEMsU0FBUyxFQUFFO2dCQUNQLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDaEIsQ0FBQztTQUNKLENBQUMsQ0FBQztRQUNILFNBQUcsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNyRyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FB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QUMsQ0FBQyxJQUFNLENBQUMsSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUN6QixNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMvQixDQUFDO1FBRUQsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztZQUN6QixNQUFNLEVBQUUsS0FBSztZQUNiLEtBQUssRUFBRSxHQUFHLENBQUMsR0FBRztZQUNkLE9BQU8sRUFBRSxHQUFHLENBQUMsS0FBSztZQUNsQixTQUFTLEVBQUUsR0FBRyxDQUFDLE9BQU87WUFDdEIsU0FBUyxFQUFFLEdBQUcsQ0FBQyxPQUFPO1lBQ3RCLFFBQVEsRUFBRTtnQkFDTixRQUFRLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7Z0JBQzFCLFNBQVMsRUFBRSxHQUFHLENBQUMsT0FBTztnQkFDdEIsUUFBUSxFQUFFLEdBQUcsQ0FBQyxNQUFNO2FBQ3ZCO1NBQ0osQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFFekQsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxVQUFVLENBQUM7QUFHeEMsQ0FBQztBQXhGRCxvQkF3RkM7QUFDRCxJQUFJLEVBQUUsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQge2RvbX0gZnJvbSAnLi9kb20nO1xuXG5leHBvcnQgY2xhc3MgRHJhZ1pvb20ge1xuICAgIHByaXZhdGUgc3RhdGljIGJ1dHRvblNlbGVjdG9yOiBzdHJpbmcgPSAnLi1qcy16b29tLWJveCc7XG4gICAgcHJpdmF0ZSBkcmFnem9vbTogb2wuaW50ZXJhY3Rpb24uRHJhZ1pvb207XG4gICAgcHJpdmF0ZSBvbE1hcDogb2wuTWFwO1xuXG4gICAgY29uc3RydWN0b3IobWFwOiBvbC5NYXApIHtcbiAgICAgICAgdGhpcy5vbE1hcCA9IG1hcDtcbiAgICAgICAgdGhpcy5kcmFnem9vbSA9IG5ldyBvbC5pbnRlcmFjdGlvbi5EcmFnWm9vbSh7XG4gICAgICAgICAgICBjb25kaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGRvbS5maW5kRmlyc3QoRHJhZ1pvb20uYnV0dG9uU2VsZWN0b3IpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5idXR0b25DbGljay5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgICAgIHRoaXMuZHJhZ3pvb20ub24oJ2JveGVuZCcsIHRoaXMuZGVhY3RpdmF0ZS5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGJ1dHRvbkNsaWNrKGUpIHtcbiAgICAgICAgaWYgKCFkb20uaGFzQ2xhc3MoZS50YXJnZXQsICdzdWNjZXNzJykpIHtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZhdGUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZGVhY3RpdmF0ZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhY3RpdmF0ZSgpIHtcbiAgICAgICAgZG9tLmFkZENsYXNzKDxIVE1MRWxlbWVudD5kb20uZmluZEZpcnN0KERyYWdab29tLmJ1dHRvblNlbGVjdG9yKSwgJ3N1Y2Nlc3MnKTtcbiAgICAgICAgdGhpcy5vbE1hcC5hZGRJbnRlcmFjdGlvbih0aGlzLmRyYWd6b29tKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGRlYWN0aXZhdGUoKSB7XG4gICAgICAgIGRvbS5yZW1vdmVDbGFzcyg8SFRNTEVsZW1lbnQ+ZG9tLmZpbmRGaXJzdChEcmFnWm9vbS5idXR0b25TZWxlY3RvciksICdzdWNjZXNzJyk7XG4gICAgICAgIHRoaXMub2xNYXAucmVtb3ZlSW50ZXJhY3Rpb24odGhpcy5kcmFnem9vbSk7XG4gICAgfVxufSIsImltcG9ydCB7VVVJRH0gZnJvbSAnLi9PbDQnO1xuaW1wb3J0IHtkb219IGZyb20gJy4vZG9tJztcblxuZXhwb3J0IGNsYXNzIEZlYXR1cmVJbmZvIHtcbiAgICBwcml2YXRlIHN0YXRpYyBidXR0b25TZWxlY3Rvcjogc3RyaW5nID0gJy4tanMtbWFwLWluZm8nO1xuICAgIHByaXZhdGUgc3RhdGljIHNlbGVjdENsYXNzOiBzdHJpbmcgPSAnc2VsZWN0JztcbiAgICBwcml2YXRlIHN0YXRpYyBrZXlJZDogc3RyaW5nID0gJ3V1aWQnO1xuICAgIHByaXZhdGUgc3RhdGljIGtleVRpdGxlOiBzdHJpbmcgPSAndGl0bGUnO1xuICAgIHByaXZhdGUgc3RhdGljIGtleUFsdGVybmF0ZVRpdGxlOiBzdHJpbmcgPSAnYWx0ZXJuYXRlVGl0bGUnO1xuICAgIHByaXZhdGUgc3RhdGljIGl0ZW1UYWdOYW1lOiBzdHJpbmcgPSAnc3Bhbic7XG4gICAgcHJpdmF0ZSBvbE1hcDogb2wuTWFwO1xuICAgIHByaXZhdGUgdG9vbHRpcDogb2wuT3ZlcmxheTtcbiAgICBwcml2YXRlIHRvb2x0aXBFbG06IEhUTUxFbGVtZW50O1xuICAgIHByaXZhdGUgbGF5ZXI6IG9sLmxheWVyLlZlY3RvcjtcblxuICAgIGNvbnN0cnVjdG9yKG1hcDogb2wuTWFwLCBsYXllcjogb2wubGF5ZXIuVmVjdG9yID0gbnVsbCkge1xuICAgICAgICB0aGlzLm9sTWFwID0gbWFwO1xuICAgICAgICB0aGlzLmxheWVyID0gbGF5ZXI7XG4gICAgICAgIGRvbS5maW5kRmlyc3QoRmVhdHVyZUluZm8uYnV0dG9uU2VsZWN0b3IpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5idXR0b25DbGljay5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBidXR0b25DbGljayhlKSB7XG4gICAgICAgIGlmICghZG9tLmhhc0NsYXNzKGUuY3VycmVudFRhcmdldCwgJ3N1Y2Nlc3MnKSkge1xuICAgICAgICAgICAgdGhpcy5hY3RpdmF0ZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5kZWFjdGl2YXRlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGFjdGl2YXRlKCkge1xuICAgICAgICBkb20uYWRkQ2xhc3MoPEhUTUxFbGVtZW50PmRvbS5maW5kRmlyc3QoRmVhdHVyZUluZm8uYnV0dG9uU2VsZWN0b3IpLCAnc3VjY2VzcycpO1xuICAgICAgICB0aGlzLm9sTWFwLm9uKCdjbGljaycsIHRoaXMubWFwQ2xpY2ssIHRoaXMpO1xuICAgICAgICB0aGlzLnRvb2x0aXBFbG0gPSBkb20uY3JlYXRlKCdkaXYnLCB7fSwgWyd0b29sdGlwJywgJ2hpZGRlbiddKTtcbiAgICAgICAgdGhpcy50b29sdGlwRWxtLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5pdGVtQ2xpY2suYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgICAgICB0aGlzLnRvb2x0aXAgPSBuZXcgb2wuT3ZlcmxheSh7XG4gICAgICAgICAgICBlbGVtZW50OiB0aGlzLnRvb2x0aXBFbG0sXG4gICAgICAgICAgICBvZmZzZXQ6IFswLCAtNl0sXG4gICAgICAgICAgICBwb3NpdGlvbmluZzogJ2JvdHRvbS1jZW50ZXInXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLm9sTWFwLmFkZE92ZXJsYXkodGhpcy50b29sdGlwKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGRlYWN0aXZhdGUoKSB7XG4gICAgICAgIGRvbS5yZW1vdmVDbGFzcyg8SFRNTEVsZW1lbnQ+ZG9tLmZpbmRGaXJzdChGZWF0dXJlSW5mby5idXR0b25TZWxlY3RvciksICdzdWNjZXNzJyk7XG4gICAgICAgIHRoaXMudG9vbHRpcEVsbS5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuaXRlbUNsaWNrLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLnRvb2x0aXBFbG0ucmVtb3ZlKCk7XG4gICAgICAgIHRoaXMub2xNYXAucmVtb3ZlT3ZlcmxheSh0aGlzLnRvb2x0aXApO1xuICAgICAgICB0aGlzLm9sTWFwLnVuKCdjbGljaycsIHRoaXMubWFwQ2xpY2ssIHRoaXMpO1xuICAgIH1cblxuICAgIHByaXZhdGUgaXRlbUNsaWNrKGU6IEV2ZW50KSB7XG4gICAgICAgIGlmICgoPGFueT5lLnRhcmdldCkudGFnTmFtZSA9PT0gRmVhdHVyZUluZm8uaXRlbVRhZ05hbWUudG9VcHBlckNhc2UoKSkge1xuICAgICAgICAgICAgdGhpcy5zZWxlY3REYXRhc2V0KCg8SFRNTEVsZW1lbnQ+ZS50YXJnZXQpLmdldEF0dHJpYnV0ZShGZWF0dXJlSW5mby5kYXRhQXR0ck5hbWUoRmVhdHVyZUluZm8ua2V5SWQpKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgZGF0YUF0dHJOYW1lKG5hbWU6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gJ2RhdGEtJyArIG5hbWU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBtYXBDbGljayhlOiBvbC5NYXBCcm93c2VyRXZlbnQpIHtcbiAgICAgICAgdGhpcy50b29sdGlwRWxtLmlubmVySFRNTCA9ICcnO1xuICAgICAgICBsZXQgbGF5ID0gdGhpcy5sYXllcjtcbiAgICAgICAgbGV0IGZlYXR1cmVzOiBvbC5GZWF0dXJlW10gPSBuZXcgQXJyYXk8b2wuRmVhdHVyZT4oKTtcbiAgICAgICAgdGhpcy5vbE1hcC5mb3JFYWNoRmVhdHVyZUF0UGl4ZWwoZS5waXhlbCwgZnVuY3Rpb24gKGZlYXR1cmU6IG9sLkZlYXR1cmUpIHtcbiAgICAgICAgICAgIGZlYXR1cmVzLnB1c2goZmVhdHVyZSk7XG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGxheWVyRmlsdGVyOiBmdW5jdGlvbiAobGF5ZXIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbGF5ZXIuZ2V0KFVVSUQpID09PSBsYXkuZ2V0KFVVSUQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGZlYXR1cmVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgZG9tLmFkZENsYXNzKHRoaXMudG9vbHRpcEVsbSwgJ2hpZGRlbicpO1xuICAgICAgICB9IGVsc2UgaWYgKGZlYXR1cmVzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgZG9tLmFkZENsYXNzKHRoaXMudG9vbHRpcEVsbSwgJ2hpZGRlbicpO1xuICAgICAgICAgICAgdGhpcy5zZWxlY3REYXRhc2V0KGZlYXR1cmVzWzBdLmdldChGZWF0dXJlSW5mby5rZXlJZCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9yIChsZXQgZmVhdHVyZSBvZiBmZWF0dXJlcykge1xuICAgICAgICAgICAgICAgIGxldCBkYXRhQXR0ciA9IEZlYXR1cmVJbmZvLmRhdGFBdHRyTmFtZShGZWF0dXJlSW5mby5rZXlJZCk7XG4gICAgICAgICAgICAgICAgbGV0IHRpdGxlID0gZmVhdHVyZS5nZXQoRmVhdHVyZUluZm8ua2V5VGl0bGUpO1xuICAgICAgICAgICAgICAgIGxldCBhVGl0bGUgPSBmZWF0dXJlLmdldChGZWF0dXJlSW5mby5rZXlBbHRlcm5hdGVUaXRsZSk7XG4gICAgICAgICAgICAgICAgbGV0IGF0dHJzID0ge1xuICAgICAgICAgICAgICAgICAgICBkYXRhQXR0cjogZmVhdHVyZS5nZXQoRmVhdHVyZUluZm8ua2V5SWQpLFxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogYVRpdGxlID8gdGl0bGUgKyAnIC8gJyArIGFUaXRsZSA6IHRpdGxlXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBhdHRyc1tGZWF0dXJlSW5mby5kYXRhQXR0ck5hbWUoRmVhdHVyZUluZm8ua2V5SWQpXSA9IGZlYXR1cmUuZ2V0KEZlYXR1cmVJbmZvLmtleUlkKTtcbiAgICAgICAgICAgICAgICB0aGlzLnRvb2x0aXBFbG0uYXBwZW5kQ2hpbGQoZG9tLmNyZWF0ZShGZWF0dXJlSW5mby5pdGVtVGFnTmFtZSwgYXR0cnMsIFtdLCB0aXRsZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy50b29sdGlwLnNldFBvc2l0aW9uKGUuY29vcmRpbmF0ZSk7XG4gICAgICAgICAgICBkb20ucmVtb3ZlQ2xhc3ModGhpcy50b29sdGlwRWxtLCAnaGlkZGVuJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHNlbGVjdERhdGFzZXQoc2VsZWN0b3I6IHN0cmluZykge1xuICAgICAgICBjb25zb2xlLmxvZygnc2V0IGNsYXNzICcgKyBGZWF0dXJlSW5mby5zZWxlY3RDbGFzcyArICcgZm9yIGRhdGFzZXQnICsgc2VsZWN0b3IpO1xuICAgIH1cblxuICAgIHByaXZhdGUgdW5TZWxlY3REYXRhc2V0KCkge1xuICAgICAgICBjb25zb2xlLmxvZygncmVtb3ZlIGNsYXNzICcgKyBGZWF0dXJlSW5mby5zZWxlY3RDbGFzcyArICcgZm9yIGFsbCBkYXRhc2V0cycpO1xuICAgIH1cbn0iLCJpbXBvcnQge2RvbX0gZnJvbSAnLi9kb20nO1xuaW1wb3J0IHtUSVRMRSwgVVVJRCwgT2w0TWFwfSBmcm9tIFwiLi9PbDRcIjtcblxuLy8gaW1wb3J0ICogYXMgJCBmcm9tICdqcXVlcnknO1xuXG5leHBvcnQgY2xhc3MgTGF5ZXJUcmVlIHtcbiAgICBwcml2YXRlIHN0YXRpYyBfaW5zdGFuY2U6IExheWVyVHJlZTtcbiAgICBwcml2YXRlIHN0YXRpYyBtYXhsZW5ndGg6IG51bWJlciA9IDE2O1xuICAgIHByaXZhdGUgc3RhdGljIHRyZWVzZWxlY3Rvcjogc3RyaW5nID0gJy4tanMtbWFwLWxheWVydHJlZSB1bC5sYXllci10cmVlLWxpc3QnO1xuICAgIHByaXZhdGUgc3RhdGljIGR1bW15c2VsZWN0b3I6IHN0cmluZyA9ICcuLWpzLWR1bW15LWxheWVyJztcbiAgICBwcml2YXRlIHN0YXRpYyB1c2VPcGFjaXR5OiBib29sZWFuID0gdHJ1ZTtcbiAgICBwcml2YXRlIHN0YXRpYyB1c2VWaXNpYmxlOiBib29sZWFuID0gdHJ1ZTtcbiAgICBwcml2YXRlIHN0YXRpYyB1c2VTb3J0YWJsZTogYm9vbGVhbiA9IHRydWU7XG4gICAgcHJpdmF0ZSBzdGF0aWMgc2hvd1N0YXR1czogYm9vbGVhbiA9IHRydWU7XG4gICAgcHJpdmF0ZSBvbDRNYXA6IE9sNE1hcDtcbiAgICBwcml2YXRlIHRyZWU6IEhUTUxFbGVtZW50O1xuICAgIHByaXZhdGUgY3VycmVudExheWVyID0gbnVsbDtcbiAgICBwcml2YXRlIG9sZFBvc2l0aW9uID0gMDtcblxuICAgIHByaXZhdGUgY29uc3RydWN0b3Iob2w0TWFwOiBPbDRNYXApIHtcbiAgICAgICAgdGhpcy5vbDRNYXAgPSBvbDRNYXA7XG4gICAgICAgIHRoaXMudHJlZSA9IDxIVE1MRWxlbWVudD5kb20uZmluZEZpcnN0KExheWVyVHJlZS50cmVlc2VsZWN0b3IpO1xuICAgICAgICBpZiAoTGF5ZXJUcmVlLnVzZVNvcnRhYmxlKSB7XG4gICAgICAgICAgICBsZXQgZHVtbXkgPSBkb20uZmluZEZpcnN0KExheWVyVHJlZS5kdW1teXNlbGVjdG9yLCB0aGlzLnRyZWUpO1xuICAgICAgICAgICAgdGhpcy5hZGREcmFnZ2FibGUoPEhUTUxFbGVtZW50PmR1bW15LCB0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBjcmVhdGUob2w0TWFwOiBPbDRNYXApOiBMYXllclRyZWUge1xuICAgICAgICBpZiAoIUxheWVyVHJlZS5faW5zdGFuY2UpIHsvLyBzaW5nbGV0b25cbiAgICAgICAgICAgIExheWVyVHJlZS5faW5zdGFuY2UgPSBuZXcgTGF5ZXJUcmVlKG9sNE1hcCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIExheWVyVHJlZS5faW5zdGFuY2U7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBmaW5kTGF5ZXJJdGVtKGxheWVyOiBvbC5sYXllci5CYXNlKTogSFRNTEVsZW1lbnQge1xuICAgICAgICByZXR1cm4gPEhUTUxFbGVtZW50PmRvbS5maW5kRmlyc3QoJyMnICsgbGF5ZXIuZ2V0KFVVSUQpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGZpbmRMYXllclZpc2libGUobGF5ZXI6IG9sLmxheWVyLkJhc2UpOiBIVE1MRm9ybUVsZW1lbnQge1xuICAgICAgICByZXR1cm4gPEhUTUxGb3JtRWxlbWVudD5kb20uZmluZEZpcnN0KCcjJyArIGxheWVyLmdldChVVUlEKSArICcgLi1qcy1tYXAtc291cmNlLXZpc2libGUnKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGZpbmRMYXllck9wYWNpdHkobGF5ZXI6IG9sLmxheWVyLkJhc2UpOiBIVE1MRm9ybUVsZW1lbnQge1xuICAgICAgICByZXR1cm4gPEhUTUxGb3JtRWxlbWVudD5kb20uZmluZEZpcnN0KCcjJyArIGxheWVyLmdldChVVUlEKSArICcgLi1qcy1tYXAtc291cmNlLW9wYWNpdHknKTtcbiAgICB9XG5cbiAgICBnZXRWaXNpYmxlKGxheWVyOiBvbC5sYXllci5CYXNlKSB7XG4gICAgICAgIGxldCBjaGVja2JveCA9IHRoaXMuZmluZExheWVyVmlzaWJsZShsYXllcik7XG4gICAgICAgIHJldHVybiBjaGVja2JveC5jaGVja2VkO1xuICAgIH1cblxuICAgIHNldFZpc2libGUobGF5ZXI6IG9sLmxheWVyLkJhc2UsIHZpc2libGU6IGJvb2xlYW4sIGFjdGlvbjogYm9vbGVhbiA9IGZhbHNlKSB7XG4gICAgICAgIGxldCBjaGVja2JveCA9IHRoaXMuZmluZExheWVyVmlzaWJsZShsYXllcik7XG4gICAgICAgIGlmIChjaGVja2JveC5jaGVja2VkICE9PSB2aXNpYmxlICYmICFhY3Rpb24pIHtcbiAgICAgICAgICAgIGNoZWNrYm94LmNoZWNrZWQgPSB2aXNpYmxlO1xuICAgICAgICB9IGVsc2UgaWYgKGNoZWNrYm94LmNoZWNrZWQgIT09IHZpc2libGUgJiYgYWN0aW9uKSB7XG4gICAgICAgICAgICBjaGVja2JveC5jbGljaygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2V0RGlzYWJsZShsYXllcjogb2wubGF5ZXIuQmFzZSwgZGlzYWJsZTogYm9vbGVhbikge1xuICAgICAgICBsZXQgaXRlbSA9IHRoaXMuZmluZExheWVySXRlbShsYXllcik7XG4gICAgICAgIGxldCBjaGVja2JveFZpc2libGUgPSB0aGlzLmZpbmRMYXllclZpc2libGUobGF5ZXIpO1xuICAgICAgICBsZXQgc2VsZWN0T3BhY2l0eSA9IHRoaXMuZmluZExheWVyT3BhY2l0eShsYXllcik7XG4gICAgICAgIGlmIChkaXNhYmxlKSB7XG4gICAgICAgICAgICBkb20uYWRkQ2xhc3MoaXRlbSwgJ2Rpc2FibGVkJyk7XG4gICAgICAgICAgICBjaGVja2JveFZpc2libGUuc2V0QXR0cmlidXRlKCdkaXNhYmxlZCcsICd0cnVlJyk7XG4gICAgICAgICAgICBzZWxlY3RPcGFjaXR5LnNldEF0dHJpYnV0ZSgnZGlzYWJsZWQnLCAndHJ1ZScpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkb20ucmVtb3ZlQ2xhc3MoaXRlbSwgJ2Rpc2FibGVkJyk7XG4gICAgICAgICAgICBjaGVja2JveFZpc2libGUucmVtb3ZlQXR0cmlidXRlKCdkaXNhYmxlZCcpO1xuICAgICAgICAgICAgc2VsZWN0T3BhY2l0eS5yZW1vdmVBdHRyaWJ1dGUoJ2Rpc2FibGVkJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHN1YnN0cmluZ1RpdGxlKHRleHQ6IHN0cmluZykge1xuICAgICAgICBpZiAodGV4dC5sZW5ndGggPiBMYXllclRyZWUubWF4bGVuZ3RoKSB7XG4gICAgICAgICAgICB0ZXh0ID0gdGV4dC5zdWJzdHJpbmcoMCwgTGF5ZXJUcmVlLm1heGxlbmd0aCk7XG4gICAgICAgICAgICBpZiAodGV4dC5sYXN0SW5kZXhPZignICcpID4gMCkge1xuICAgICAgICAgICAgICAgIHRleHQgPSB0ZXh0LnN1YnN0cmluZygwLCB0ZXh0Lmxhc3RJbmRleE9mKCcgJykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0ZXh0O1xuICAgIH1cblxuICAgIHJlbW92ZShsYXllcjogb2wubGF5ZXIuQmFzZSkge1xuICAgICAgICBsZXQgbGF5ZXJOb2RlID0gdGhpcy5maW5kTGF5ZXJJdGVtKGxheWVyKTtcbiAgICAgICAgaWYgKGxheWVyTm9kZSkge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVEcmFnZ2FibGUoPEhUTUxFbGVtZW50PmxheWVyTm9kZSk7XG4gICAgICAgICAgICBsYXllck5vZGUucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhZGQobGF5ZXI6IG9sLmxheWVyLkJhc2UpIHtcbiAgICAgICAgbGV0IGxheWVyTm9kZSA9IGRvbS5jcmVhdGUoJ2xpJywgeydpZCc6IGxheWVyLmdldChVVUlEKSwgJ2RyYWdnYWJsZSc6IFwidHJ1ZVwifSwgWydkcmFnZ2FibGUnLCAnLWpzLWRyYWdnYWJsZSddKTtcbiAgICAgICAgaWYgKExheWVyVHJlZS51c2VWaXNpYmxlKSB7XG4gICAgICAgICAgICB0aGlzLmFkZFZpc2libGUobGF5ZXJOb2RlLCBsYXllcik7XG4gICAgICAgIH1cbiAgICAgICAgbGF5ZXJOb2RlLmFwcGVuZENoaWxkKFxuICAgICAgICAgICAgZG9tLmNyZWF0ZSgnbGFiZWwnLFxuICAgICAgICAgICAgICAgIHsnaWQnOiBsYXllci5nZXQoVVVJRCksICdmb3InOiAnY2hiLScgKyBsYXllci5nZXQoVVVJRCksICd0aXRsZSc6IGxheWVyLmdldChUSVRMRSl9LFxuICAgICAgICAgICAgICAgIFsnZm9ybS1sYWJlbCddLCB0aGlzLnN1YnN0cmluZ1RpdGxlKGxheWVyLmdldChUSVRMRSkpKVxuICAgICAgICApO1xuICAgICAgICBpZiAoTGF5ZXJUcmVlLnVzZU9wYWNpdHkpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkT3BhY2l0eShsYXllck5vZGUsIGxheWVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudHJlZS5pbnNlcnRCZWZvcmUobGF5ZXJOb2RlLCBkb20uZmluZEZpcnN0KCdsaScsIHRoaXMudHJlZSkpO1xuICAgICAgICBpZiAoTGF5ZXJUcmVlLnVzZVNvcnRhYmxlKSB7XG4gICAgICAgICAgICB0aGlzLmFkZERyYWdnYWJsZShsYXllck5vZGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhZGRWaXNpYmxlKGxheWVyTm9kZTogSFRNTEVsZW1lbnQsIGxheWVyOiBvbC5sYXllci5CYXNlKSB7XG4gICAgICAgIGxldCBpbnB1dCA9IGRvbS5jcmVhdGUoJ2lucHV0Jywgeyd0eXBlJzogJ2NoZWNrYm94J30sXG4gICAgICAgICAgICBbJ2NoZWNrJywgJy1qcy1tYXAtc291cmNlLXZpc2libGUnXSk7XG4gICAgICAgICg8SFRNTEZvcm1FbGVtZW50PmlucHV0KS5jaGVja2VkID0gbGF5ZXIuZ2V0VmlzaWJsZSgpO1xuICAgICAgICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCB0aGlzLmNoYW5nZVZpc2libGUuYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgICAgICBsYXllck5vZGUuYXBwZW5kQ2hpbGQoaW5wdXQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgY2hhbmdlVmlzaWJsZShlKSB7XG4gICAgICAgIHRoaXMub2w0TWFwLnNldFZpc2libGUoZS50YXJnZXQucGFyZW50RWxlbWVudC5pZCwgZS50YXJnZXQuY2hlY2tlZCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhZGRPcGFjaXR5KGxheWVyTm9kZTogSFRNTEVsZW1lbnQsIGxheWVyOiBvbC5sYXllci5CYXNlKTogdm9pZCB7XG4gICAgICAgIGxldCBzZWxlY3QgPSBkb20uY3JlYXRlKCdzZWxlY3QnLCB7fSxcbiAgICAgICAgICAgIFsnaW5wdXQtZWxlbWVudCcsICdtZWRpdW0nLCAnc2ltcGxlJywgJ21hcC1zb3VyY2Utb3BhY2l0eScsICctanMtbWFwLXNvdXJjZS1vcGFjaXR5J10pO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDw9IDEwOyBpKyspIHtcbiAgICAgICAgICAgIHNlbGVjdC5hcHBlbmRDaGlsZChkb20uY3JlYXRlKCdvcHRpb24nLCB7J3ZhbHVlJzogaSAvIDEwfSwgW10sIChpICogMTApICsgJyAlJykpO1xuICAgICAgICB9XG4gICAgICAgICg8SFRNTEZvcm1FbGVtZW50PnNlbGVjdCkudmFsdWUgPSBsYXllci5nZXRPcGFjaXR5KCkudG9TdHJpbmcoKTtcbiAgICAgICAgc2VsZWN0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIHRoaXMuY2hhbmdlT3BhY2l0eS5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgICAgIGxheWVyTm9kZS5hcHBlbmRDaGlsZChzZWxlY3QpO1xuICAgIH1cblxuICAgIHByaXZhdGUgY2hhbmdlT3BhY2l0eShlKSB7XG4gICAgICAgIHRoaXMub2w0TWFwLnNldE9wYWNpdHkoZS50YXJnZXQucGFyZW50RWxlbWVudC5pZCwgcGFyc2VGbG9hdChlLnRhcmdldC52YWx1ZSkpO1xuICAgIH1cblxuICAgIHByaXZhdGUgYWRkRHJhZ2dhYmxlKGxheWVyOiBIVE1MRWxlbWVudCwgaXNEdW1teTogYm9vbGVhbiA9IGZhbHNlKSB7XG4gICAgICAgIGlmICghaXNEdW1teSkge1xuICAgICAgICAgICAgbGF5ZXIuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ3N0YXJ0JywgdGhpcy5kcmFnU3RhcnQuYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgICAgICAgICAgbGF5ZXIuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ2VuZCcsIHRoaXMuZHJhZ0VuZC5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgICAgbGF5ZXIuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ2VudGVyJywgdGhpcy5kcmFnRW50ZXIuYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgICAgICBsYXllci5hZGRFdmVudExpc3RlbmVyKCdkcmFnb3ZlcicsIHRoaXMuZHJhZ092ZXIuYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgICAgICBsYXllci5hZGRFdmVudExpc3RlbmVyKCdkcm9wJywgdGhpcy5kcmFnRHJvcC5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW1vdmVEcmFnZ2FibGUobGF5ZXI6IEhUTUxFbGVtZW50LCBpc0R1bW15OiBib29sZWFuID0gZmFsc2UpIHtcbiAgICAgICAgaWYgKCFpc0R1bW15KSB7XG4gICAgICAgICAgICBsYXllci5yZW1vdmVFdmVudExpc3RlbmVyKCdkcmFnc3RhcnQnLCB0aGlzLmRyYWdTdGFydC5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgICAgICAgICBsYXllci5yZW1vdmVFdmVudExpc3RlbmVyKCdkcmFnZW5kJywgdGhpcy5kcmFnRW5kLmJpbmQodGhpcyksIGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgICBsYXllci5yZW1vdmVFdmVudExpc3RlbmVyKCdkcmFnZW50ZXInLCB0aGlzLmRyYWdFbnRlci5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgICAgIGxheWVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2RyYWdvdmVyJywgdGhpcy5kcmFnT3Zlci5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgICAgIGxheWVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCB0aGlzLmRyYWdEcm9wLmJpbmQodGhpcyksIGZhbHNlKTtcbiAgICB9XG5cblxuICAgIHByaXZhdGUgZHJhZ1N0YXJ0KGUpIHtcbiAgICAgICAgdGhpcy5jdXJyZW50TGF5ZXIgPSBlLnRhcmdldDtcbiAgICAgICAgdGhpcy5vbGRQb3NpdGlvbiA9IHRoaXMuZ2V0TGF5ZXJQb3NpdGlvbih0aGlzLmN1cnJlbnRMYXllcik7XG4gICAgICAgIGUuZGF0YVRyYW5zZmVyLmVmZmVjdEFsbG93ZWQgPSAnbW92ZSc7XG4gICAgICAgIGUuZGF0YVRyYW5zZmVyLnNldERhdGEoJ3RleHQvaHRtbCcsIHRoaXMuY3VycmVudExheWVyLmlubmVySFRNTCk7XG4gICAgICAgIGRvbS5hZGRDbGFzcyh0aGlzLmN1cnJlbnRMYXllciwgXCJtb3ZlXCIpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZHJhZ092ZXIoZSkge1xuICAgICAgICBpZiAoZS5wcmV2ZW50RGVmYXVsdCkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgICAgIGUuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3QgPSAnbW92ZSc7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGRyYWdFbnRlcihlKSB7XG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRMYXllciAhPT0gZS50b0VsZW1lbnQpIHtcbiAgICAgICAgICAgIHRoaXMudHJlZS5pbnNlcnRCZWZvcmUodGhpcy5jdXJyZW50TGF5ZXIsIGUudG9FbGVtZW50LmRyYWdnYWJsZSA/IGUudG9FbGVtZW50IDogZS50b0VsZW1lbnQucGFyZW50RWxlbWVudCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGRyYWdEcm9wKGUpIHtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBkb20ucmVtb3ZlQ2xhc3MoZS50YXJnZXQsIFwib3ZlclwiKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGRyYWdFbmQoZSkge1xuICAgICAgICBkb20ucmVtb3ZlQ2xhc3MoZS50YXJnZXQsIFwibW92ZVwiKTtcbiAgICAgICAgdGhpcy5vbDRNYXAubW92ZUxheWVyKHRoaXMuY3VycmVudExheWVyLmlkLCB0aGlzLm9sZFBvc2l0aW9uLCB0aGlzLmdldExheWVyUG9zaXRpb24odGhpcy5jdXJyZW50TGF5ZXIpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldExheWVyUG9zaXRpb24obGF5ZXIpIHtcbiAgICAgICAgbGV0IGxpc3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuLWpzLW1hcC1sYXllcnRyZWUgdWwgLi1qcy1kcmFnZ2FibGUnKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAobGlzdFtpXS5pZCA9PT0gbGF5ZXIuaWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbGlzdC5sZW5ndGggLSAxIC0gaTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG4iLCJpbXBvcnQgKiBhcyBvbDQgZnJvbSAnb3BlbmxheWVycyc7Ly8gPz8/XG4vLyBpbXBvcnQgKiBhcyBqcXVlcnkgZnJvbSAnanF1ZXJ5JzsgLy9lcnJvciBpbiBpbmRleC5kLnRzIGZvciBAdHlwZXMvanF1ZXJ5XG5pbXBvcnQge0xheWVyVHJlZX0gZnJvbSAnLi9MYXllclRyZWUnO1xuaW1wb3J0IHtEcmFnWm9vbX0gZnJvbSAnLi9EcmFnWm9vbSc7XG5pbXBvcnQge09sNFNvdXJjZSwgT2w0VmVjdG9yU291cmNlLCBPbDRXbXNTb3VyY2V9IGZyb20gXCIuL09sNFNvdXJjZVwiXG5pbXBvcnQge0ZlYXR1cmVJbmZvfSBmcm9tIFwiLi9GZWF0dXJlSW5mb1wiO1xuXG5kZWNsYXJlIGNsYXNzIHByb2o0IHtcbiAgICBzdGF0aWMgZGVmcyhuYW1lOiBzdHJpbmcsIGRlZjogc3RyaW5nKTogdm9pZDtcbn1cblxuLy8gZGVjbGFyZSBmdW5jdGlvbiBhZGRTb3VyY2UoaWQ6IHN0cmluZywgdGl0bGU6IHN0cmluZywgdmlzaWJpbGl0eTogYm9vbGVhbiwgb3BhY2l0eTogbnVtYmVyKTogdm9pZDtcbmV4cG9ydCBjbGFzcyBPbDRVdGlscyB7XG4gICAgLyogXG4gICAgICogdW5pdHM6ICdkZWdyZWVzJ3wnZnQnfCdtJ3wndXMtZnQnXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyByZXNvbHV0aW9uU2NhbGVGYWN0b3IodW5pdHM6IHN0cmluZyk6IG51bWJlciB7XG4gICAgICAgIGxldCBkcGkgPSAyNS40IC8gMC4yODtcbiAgICAgICAgbGV0IG1wdSA9IG9sLnByb2ouTUVURVJTX1BFUl9VTklUW3VuaXRzXTtcbiAgICAgICAgbGV0IGluY2hlc1Blck1ldGVyID0gMzkuMzc7XG4gICAgICAgIHJldHVybiBtcHUgKiBpbmNoZXNQZXJNZXRlciAqIGRwaTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIHJlc29sdXRpb25Gb3JTY2FsZShzY2FsZTogbnVtYmVyLCBmYWN0b3I6IG51bWJlcik6IG51bWJlciB7XG4gICAgICAgIHJldHVybiBzY2FsZSAvIGZhY3RvcjtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIHJlc29sdXRpb25zRm9yU2NhbGVzKHNjYWxlczogbnVtYmVyW10sIHVuaXRzOiBzdHJpbmcpOiBudW1iZXJbXSB7XG4gICAgICAgIGxldCByZXNvbHV0aW9ucyA9IFtdO1xuICAgICAgICBsZXQgZmFjdG9yID0gT2w0VXRpbHMucmVzb2x1dGlvblNjYWxlRmFjdG9yKHVuaXRzKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzY2FsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHJlc29sdXRpb25zLnB1c2goT2w0VXRpbHMucmVzb2x1dGlvbkZvclNjYWxlKHNjYWxlc1tpXSwgZmFjdG9yKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc29sdXRpb25zO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgc2NhbGVGb3JSZXNvbHV0aW9uKHJlc29sdXRpb246IG51bWJlciwgZmFjdG9yOiBudW1iZXIpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gcmVzb2x1dGlvbiAqIGZhY3RvcjtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIHNjYWxlc0ZvclJlc29sdXRpb25zKHJlc29sdXRpb25zOiBudW1iZXJbXSwgdW5pdHM6IHN0cmluZyk6IG51bWJlcltdIHtcbiAgICAgICAgbGV0IHNjYWxlcyA9IFtdO1xuICAgICAgICBsZXQgZmFjdG9yID0gT2w0VXRpbHMucmVzb2x1dGlvblNjYWxlRmFjdG9yKHVuaXRzKTtcbiAgICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IHJlc29sdXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzY2FsZXMucHVzaChPbDRVdGlscy5zY2FsZUZvclJlc29sdXRpb24ocmVzb2x1dGlvbnNbaV0sIGZhY3RvcikpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzY2FsZXM7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBpbml0UHJvajREZWZzKHByb2o0RGVmczogYW55KTogdm9pZCB7XG4gICAgICAgIGZvciAoY29uc3QgbmFtZSBpbiBwcm9qNERlZnMpIHtcbiAgICAgICAgICAgIHByb2o0LmRlZnMobmFtZSwgcHJvajREZWZzW25hbWVdKTtcbiAgICAgICAgICAgIGxldCBwciA9IG9sLnByb2ouZ2V0KG5hbWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBnZXRQcm9qKHByb2pDb2RlOiBzdHJpbmcpOiBvbC5wcm9qLlByb2plY3Rpb24ge1xuICAgICAgICByZXR1cm4gb2wucHJvai5nZXQocHJvakNvZGUpO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0U3R5bGUob3B0aW9uczogYW55LCBzdHlsZTogb2wuc3R5bGUuU3R5bGUgPSBudWxsKTogb2wuc3R5bGUuU3R5bGUge1xuICAgICAgICBsZXQgc3R5bGVfID0gc3R5bGUgPyBzdHlsZSA6IG5ldyBvbC5zdHlsZS5TdHlsZSgpO1xuICAgICAgICBzdHlsZV8uc2V0RmlsbChuZXcgb2wuc3R5bGUuRmlsbChvcHRpb25zWydmaWxsJ10pKTtcbiAgICAgICAgc3R5bGVfLnNldFN0cm9rZShuZXcgb2wuc3R5bGUuU3Ryb2tlKG9wdGlvbnNbJ3N0cm9rZSddKSk7XG4gICAgICAgIGlmIChvcHRpb25zWydpbWFnZSddICYmIG9wdGlvbnNbJ2ltYWdlJ11bJ2NpcmNsZSddKSB7XG4gICAgICAgICAgICBzdHlsZV8uc2V0SW1hZ2UobmV3IG9sLnN0eWxlLkNpcmNsZSh7XG4gICAgICAgICAgICAgICAgICAgIHJhZGl1czogb3B0aW9uc1snaW1hZ2UnXVsnY2lyY2xlJ11bJ3JhZGl1cyddLFxuICAgICAgICAgICAgICAgICAgICBmaWxsOiBuZXcgb2wuc3R5bGUuRmlsbCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogb3B0aW9uc1snaW1hZ2UnXVsnY2lyY2xlJ11bJ2ZpbGwnXVsnY29sb3InXVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdHlsZV87XG4gICAgICAgIC8vXG4gICAgICAgIC8vIHJldHVybiBuZXcgb2wuc3R5bGVfLlN0eWxlKHtcbiAgICAgICAgLy8gICAgIGZpbGw6IG5ldyBvbC5zdHlsZV8uRmlsbChvcHRpb25zWydmaWxsJ10pLFxuICAgICAgICAvLyAgICAgc3Ryb2tlOiBuZXcgb2wuc3R5bGVfLlN0cm9rZShvcHRpb25zWydzdHJva2UnXSkvLyxcbiAgICAgICAgLy8gICAgIC8vIGltYWdlOiBuZXcgb2wuc3R5bGVfLkNpcmNsZSh7XG4gICAgICAgIC8vICAgICAvLyAgICAgcmFkaXVzOiA3LFxuICAgICAgICAvLyAgICAgLy8gICAgIGZpbGw6IG5ldyBvbC5zdHlsZV8uRmlsbChvcHRpb25zWydmaWxsJ10pXG4gICAgICAgIC8vICAgICAvLyB9KVxuICAgICAgICAvLyB9KTtcbiAgICB9XG5cbi8vIGZpbGxcbi8vIHtcbi8vICAgICBjb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjIpXG4vLyB9XG4vLyBzdHJva2Vcbi8vIHtcbi8vICAgICBjb2xvcjogJyNmZmNjMzMnLFxuLy8gICAgIHdpZHRoOiAyXG4vLyAgICAgZGFzaDpcbi8vIH1cbi8vIGltYWdlXG59XG5cbmV4cG9ydCBjbGFzcyBPbDRHZW9tIHtcbiAgICBwcm90ZWN0ZWQgZ2VvbTogb2wuZ2VvbS5HZW9tZXRyeSA9IG51bGw7XG4gICAgcHJvdGVjdGVkIHByb2o6IG9sLnByb2ouUHJvamVjdGlvbiA9IG51bGw7XG5cbiAgICBjb25zdHJ1Y3RvcihnZW9tOiBvbC5nZW9tLkdlb21ldHJ5LCBwcm9qOiBvbC5wcm9qLlByb2plY3Rpb24pIHtcbiAgICAgICAgdGhpcy5nZW9tID0gZ2VvbTtcbiAgICAgICAgdGhpcy5wcm9qID0gcHJvajtcbiAgICB9XG5cbiAgICBnZXRHZW9tKCk6IG9sLmdlb20uR2VvbWV0cnkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZW9tO1xuICAgIH1cblxuICAgIGdldFByb2ooKTogb2wucHJvai5Qcm9qZWN0aW9uIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvajtcbiAgICB9XG5cbiAgICBnZXRFeHRlbnQocHJvajogb2wucHJvai5Qcm9qZWN0aW9uKTogb2wuRXh0ZW50IHtcbiAgICAgICAgaWYgKHRoaXMucHJvaiAhPT0gcHJvaikge1xuICAgICAgICAgICAgcmV0dXJuICg8b2wuZ2VvbS5HZW9tZXRyeT4oPGFueT4gdGhpcy5nZW9tKS5jbG9uZSgpKS50cmFuc2Zvcm0odGhpcy5wcm9qLCBwcm9qKS5nZXRFeHRlbnQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAoPG9sLmdlb20uR2VvbWV0cnk+KDxhbnk+IHRoaXMuZ2VvbSkuY2xvbmUoKSkuZ2V0RXh0ZW50KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0UG9seWdvbkZvckV4dGVudChwcm9qOiBvbC5wcm9qLlByb2plY3Rpb24pIHtcbiAgICAgICAgcmV0dXJuIG9sLmdlb20uUG9seWdvbi5mcm9tRXh0ZW50KHRoaXMuZ2V0RXh0ZW50KHByb2opKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBPbDRFeHRlbnQgZXh0ZW5kcyBPbDRHZW9tIHtcbiAgICBwdWJsaWMgc3RhdGljIGZyb21BcnJheShvcmRpbmF0ZXM6IG51bWJlcltdLCBwcm9qOiBvbC5wcm9qLlByb2plY3Rpb24pOiBPbDRFeHRlbnQge1xuICAgICAgICBsZXQgZ2VvbSA9IG5ldyBvbC5nZW9tLk11bHRpUG9pbnQoW1tvcmRpbmF0ZXNbMF0sIG9yZGluYXRlc1sxXV0sIFtvcmRpbmF0ZXNbMl0sIG9yZGluYXRlc1szXV1dKTtcbiAgICAgICAgcmV0dXJuIG5ldyBPbDRFeHRlbnQoZ2VvbSwgcHJvaik7XG4gICAgfVxufVxuXG5leHBvcnQgY29uc3QgVVVJRDogc3RyaW5nID0gJ3V1aWQnO1xuZXhwb3J0IGNvbnN0IExBWUVSX1VVSUQ6IHN0cmluZyA9ICdsYXllcnV1aWQnO1xuZXhwb3J0IGNvbnN0IFRJVExFOiBzdHJpbmcgPSAndGl0bGUnO1xuZXhwb3J0IGNvbnN0IE1FVEFET1JfRVBTRzogb2wuUHJvamVjdGlvbkxpa2UgPSAnRVBTRzo0MzI2JztcbmV4cG9ydCBjb25zdCBMQVlFUl9WRUNUT1IgPSAndmVjdG9yJztcbmV4cG9ydCBjb25zdCBMQVlFUl9JTUFHRSA9ICdpbWFnZSc7XG5cbmV4cG9ydCBjbGFzcyBPbDRNYXAge1xuICAgIHByaXZhdGUgc3RhdGljIF91dWlkID0gMDtcbiAgICBwcml2YXRlIHN0YXRpYyBfaW5zdGFuY2U6IE9sNE1hcCA9IG51bGw7IC8vIHNpbmdsZXRvblxuICAgIHByaXZhdGUgb2xNYXA6IG9sLk1hcCA9IG51bGw7XG4gICAgcHJpdmF0ZSBzY2FsZXM6IG51bWJlcltdO1xuICAgIC8vICAgIHByb3RlY3RlZCBwcm9qOiBvbC5wcm9qLlByb2plY3Rpb24gPSBudWxsO1xuICAgIHByaXZhdGUgc3RhcnRFeHRlbnQ6IE9sNEV4dGVudCA9IG51bGw7ICAvLyB4bWluLCB5bWluLCB4bWF4LCB5bWF4IG9wdGlvbnNbJ3N0YXJ0RXh0ZW50J11cbiAgICBwcml2YXRlIG1heEV4dGVudDogT2w0RXh0ZW50ID0gbnVsbDtcbiAgICBwcml2YXRlIGRyYXdlcjogT2w0RHJhd2VyO1xuICAgIHByaXZhdGUgd21zU291cmNlOiBPbDRXbXNTb3VyY2U7XG4gICAgcHJpdmF0ZSB2ZWNTb3VyY2U6IE9sNFZlY3RvclNvdXJjZTtcbiAgICBwcml2YXRlIGxheWVydHJlZTogTGF5ZXJUcmVlO1xuICAgIHByaXZhdGUgc3R5bGVzOiBPYmplY3Q7XG4gICAgcHJpdmF0ZSBoZ0xheWVyOiBvbC5sYXllci5WZWN0b3I7XG4gICAgLy8gcHJvdGVjdGVkIGRyYWd6b29tOiBvbC5pbnRlcmFjdGlvbi5EcmFnWm9vbTtcbiAgICBwcml2YXRlIGRyYWd6b29tOiBEcmFnWm9vbTtcbiAgICBwcml2YXRlIGZlYXR1cmVJbmZvOiBGZWF0dXJlSW5mbztcblxuICAgIHByaXZhdGUgc3RhdGljIGdldFV1aWQocHJlZml4OiBzdHJpbmcgPSAnJyk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBwcmVmaXggKyAoKytPbDRNYXAuX3V1aWQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgY29uc3RydWN0b3Iob3B0aW9uczogYW55KSB7IC8vIHNpbmdsZXRvblxuICAgICAgICBvbFsnRU5BQkxFX1JBU1RFUl9SRVBST0pFQ1RJT04nXSA9IGZhbHNlO1xuICAgICAgICBPbDRVdGlscy5pbml0UHJvajREZWZzKG9wdGlvbnNbJ3Byb2o0RGVmcyddKTtcbiAgICAgICAgdGhpcy5sYXllcnRyZWUgPSBMYXllclRyZWUuY3JlYXRlKHRoaXMpO1xuICAgICAgICB0aGlzLndtc1NvdXJjZSA9IE9sNFdtc1NvdXJjZS5jcmVhdGUodGhpcywgdHJ1ZSk7XG4gICAgICAgIHRoaXMudmVjU291cmNlID0gT2w0VmVjdG9yU291cmNlLmNyZWF0ZSh0aGlzKTtcbiAgICAgICAgKDxIVE1MRm9ybUVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLi1qcy1jcnMtY29kZScpKS52YWx1ZSA9IG9wdGlvbnNbJ3ZpZXcnXVsncHJvamVjdGlvbiddO1xuICAgICAgICBsZXQgcHJvajogb2wucHJvai5Qcm9qZWN0aW9uID0gb2wucHJvai5nZXQob3B0aW9uc1sndmlldyddWydwcm9qZWN0aW9uJ10pO1xuICAgICAgICB0aGlzLnN0eWxlcyA9IG9wdGlvbnNbJ3N0eWxlcyddO1xuICAgICAgICB0aGlzLnNjYWxlcyA9IG9wdGlvbnNbJ3ZpZXcnXVsnc2NhbGVzJ107XG4gICAgICAgIHRoaXMuc3RhcnRFeHRlbnQgPSBPbDRFeHRlbnQuZnJvbUFycmF5KG9wdGlvbnNbJ3ZpZXcnXVsnc3RhcnRFeHRlbnQnXSwgcHJvaik7XG4gICAgICAgIHRoaXMubWF4RXh0ZW50ID0gT2w0RXh0ZW50LmZyb21BcnJheShvcHRpb25zWyd2aWV3J11bJ21heEV4dGVudCddLCBwcm9qKTtcbiAgICAgICAgbGV0IGludGVyYWN0aW9ucyA9IG9sLmludGVyYWN0aW9uLmRlZmF1bHRzKFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGFsdFNoaWZ0RHJhZ1JvdGF0ZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgcGluY2hSb3RhdGU6IGZhbHNlXG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICAgIGxldCBjb250cm9scyA9IG9sLmNvbnRyb2wuZGVmYXVsdHMoe2F0dHJpYnV0aW9uOiBmYWxzZX0pOy8vLmV4dGVuZChbYXR0cmlidXRpb25dKVxuICAgICAgICB0aGlzLm9sTWFwID0gbmV3IG9sLk1hcCh7XG4gICAgICAgICAgICBpbnRlcmFjdGlvbnM6IGludGVyYWN0aW9ucyxcbiAgICAgICAgICAgIHRhcmdldDogb3B0aW9uc1snbWFwJ11bJ3RhcmdldCddLFxuICAgICAgICAgICAgcmVuZGVyZXI6ICdjYW52YXMnLFxuICAgICAgICAgICAgY29udHJvbHM6IGNvbnRyb2xzXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLm9sTWFwLnNldFZpZXcoXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVZpZXcoXG4gICAgICAgICAgICAgICAgcHJvaixcbiAgICAgICAgICAgICAgICB0aGlzLm1heEV4dGVudC5nZXRFeHRlbnQocHJvaiksXG4gICAgICAgICAgICAgICAgT2w0VXRpbHMucmVzb2x1dGlvbnNGb3JTY2FsZXModGhpcy5zY2FsZXMsIHByb2ouZ2V0VW5pdHMoKSkucmV2ZXJzZSgpXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgICAgIC8qIG1ha2UgYSBncm91cCBsYXllciBmb3IgYWxsIGltYWdlIGxheWVycyAoV01TIGV0Yy4pKi9cbiAgICAgICAgbGV0IGltYWdlR3JvdXAgPSBuZXcgb2wubGF5ZXIuR3JvdXAoe1xuICAgICAgICAgICAgbGF5ZXJzOiBuZXcgb2wuQ29sbGVjdGlvbjxvbC5sYXllci5CYXNlPigpXG4gICAgICAgIH0pO1xuICAgICAgICBpbWFnZUdyb3VwLnNldChVVUlELCBMQVlFUl9JTUFHRSlcbiAgICAgICAgdGhpcy5vbE1hcC5hZGRMYXllcihpbWFnZUdyb3VwKTtcbiAgICAgICAgLyogbWFrZSBhIGdyb3VwIGxheWVyIGZvciBhbGwgdmVjdG9yIGxheWVycyAoSGlnaHRsaWdodCwgU2VhcmNoIHJlc3VsdHMgZXRjLikqL1xuICAgICAgICBsZXQgdmVjdG9yR3JvdXAgPSBuZXcgb2wubGF5ZXIuR3JvdXAoe1xuICAgICAgICAgICAgbGF5ZXJzOiBuZXcgb2wuQ29sbGVjdGlvbjxvbC5sYXllci5CYXNlPigpXG4gICAgICAgIH0pO1xuICAgICAgICB2ZWN0b3JHcm91cC5zZXQoVVVJRCwgTEFZRVJfVkVDVE9SKVxuICAgICAgICB0aGlzLm9sTWFwLmFkZExheWVyKHZlY3Rvckdyb3VwKTtcblxuICAgICAgICBmb3IgKGxldCBzb3VyY2VPcHRpb25zIG9mIG9wdGlvbnNbJ3NvdXJjZSddKSB7XG4gICAgICAgICAgICBpZiAoc291cmNlT3B0aW9uc1sndHlwZSddID09PSAnV01TJykge1xuICAgICAgICAgICAgICAgIGxldCB3bXNMYXllciA9IHRoaXMuYWRkTGF5ZXIoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMud21zU291cmNlLmNyZWF0ZUxheWVyKFxuICAgICAgICAgICAgICAgICAgICAgICAgT2w0TWFwLmdldFV1aWQoJ29sYXktJyksXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VPcHRpb25zLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbE1hcC5nZXRWaWV3KCkuZ2V0UHJvamVjdGlvbigpLFxuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlT3B0aW9uc1sndmlzaWJsZSddLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VGbG9hdChzb3VyY2VPcHRpb25zWydvcGFjaXR5J10pXG4gICAgICAgICAgICAgICAgICAgICksIHRydWVcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKHNvdXJjZU9wdGlvbnNbJ3R5cGUnXSArICcgaXMgbm90IHN1cHBvcnRlZC4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLm9sTWFwLmFkZENvbnRyb2wobmV3IG9sLmNvbnRyb2wuU2NhbGVMaW5lKCkpO1xuXG4gICAgICAgIHRoaXMub2xNYXAuYWRkQ29udHJvbChuZXcgb2wuY29udHJvbC5ab29tVG9FeHRlbnQoe1xuICAgICAgICAgICAgZXh0ZW50OiB0aGlzLm1heEV4dGVudC5nZXRFeHRlbnQocHJvailcbiAgICAgICAgfSkpO1xuICAgICAgICB0aGlzLm9sTWFwLmFkZEludGVyYWN0aW9uKG5ldyBvbC5pbnRlcmFjdGlvbi5EcmFnWm9vbSgpKTtcbiAgICAgICAgdGhpcy5vbE1hcC5hZGRDb250cm9sKG5ldyBvbC5jb250cm9sLk1vdXNlUG9zaXRpb24oXG4gICAgICAgICAgICAvLyB7XG4gICAgICAgICAgICAvLyAgICAgY29vcmRpbmF0ZUZvcm1hdDogZnVuY3Rpb24gKGNvb3JkaW5hdGVzKSB7XG4gICAgICAgICAgICAvLyAgICAgICAgIHZhciBjb29yZF94ID0gY29vcmRpbmF0ZXNbMF0udG9GaXhlZCgzKTtcbiAgICAgICAgICAgIC8vICAgICAgICAgdmFyIGNvb3JkX3kgPSBjb29yZGluYXRlc1sxXS50b0ZpeGVkKDMpO1xuICAgICAgICAgICAgLy8gICAgICAgICByZXR1cm4gY29vcmRfeCArICcsICcgKyBjb29yZF95O1xuICAgICAgICAgICAgLy8gICAgIH1cbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgKSk7XG4gICAgICAgIHRoaXMuem9vbVRvRXh0ZW50KHRoaXMuc3RhcnRFeHRlbnQuZ2V0UG9seWdvbkZvckV4dGVudChwcm9qKSk7XG4gICAgICAgIGxldCBoZ2wgPSB0aGlzLnZlY1NvdXJjZS5jcmVhdGVMYXllcihcbiAgICAgICAgICAgIE9sNE1hcC5nZXRVdWlkKCdvbGF5LScpLFxuICAgICAgICAgICAgeydzdHlsZSc6IE9sNFV0aWxzLmdldFN0eWxlKHRoaXMuc3R5bGVzWydoaWdobGlnaHQnXSl9LFxuICAgICAgICAgICAgdGhpcy5vbE1hcC5nZXRWaWV3KCkuZ2V0UHJvamVjdGlvbigpXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMuaGdMYXllciA9IDxvbC5sYXllci5WZWN0b3I+dGhpcy5hZGRMYXllcihoZ2wpO1xuXG4gICAgICAgIGxldCB2TGF5ZXIgPSA8b2wubGF5ZXIuVmVjdG9yPnRoaXMuYWRkTGF5ZXIoXG4gICAgICAgICAgICB0aGlzLnZlY1NvdXJjZS5jcmVhdGVMYXllcihcbiAgICAgICAgICAgICAgICBPbDRNYXAuZ2V0VXVpZCgnb2xheS0nKSxcbiAgICAgICAgICAgICAgICB7J3N0eWxlJzogT2w0VXRpbHMuZ2V0U3R5bGUodGhpcy5zdHlsZXNbJ3NlYXJjaCddKX0sXG4gICAgICAgICAgICAgICAgdGhpcy5vbE1hcC5nZXRWaWV3KCkuZ2V0UHJvamVjdGlvbigpXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgICAgIHZMYXllci5zZXRNYXAodGhpcy5vbE1hcCk7XG4gICAgICAgIHRoaXMuZHJhd2VyID0gbmV3IE9sNERyYXdlcih2TGF5ZXIpO1xuICAgICAgICB0aGlzLmRyYWd6b29tID0gbmV3IERyYWdab29tKHRoaXMub2xNYXApO1xuICAgICAgICB0aGlzLmZlYXR1cmVJbmZvID0gbmV3IEZlYXR1cmVJbmZvKHRoaXMub2xNYXAsIHRoaXMuaGdMYXllcik7XG4gICAgfVxuXG4gICAgZ2V0TGF5ZXJUcmVlKCk6IExheWVyVHJlZSB7XG4gICAgICAgIHJldHVybiB0aGlzLmxheWVydHJlZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFkZEludG9MYXllclRyZWUobGF5ZXI6IG9sLmxheWVyLkJhc2UpIHtcbiAgICAgICAgaWYgKHRoaXMubGF5ZXJ0cmVlKSB7XG4gICAgICAgICAgICB0aGlzLmxheWVydHJlZS5hZGQobGF5ZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjcmVhdGVWaWV3KHByb2o6IG9sLnByb2ouUHJvamVjdGlvbiwgZXh0ZW50OiBvbC5FeHRlbnQsIHJlc29sdXRpb25zOiBudW1iZXJbXSkge1xuICAgICAgICByZXR1cm4gbmV3IG9sLlZpZXcoe1xuICAgICAgICAgICAgcHJvamVjdGlvbjogcHJvaixcbiAgICAgICAgICAgIHJlc29sdXRpb25zOiByZXNvbHV0aW9ucyxcbiAgICAgICAgICAgIGV4dGVudDogZXh0ZW50XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHpvb21Ub0V4dGVudChnZW9tZXRyeTogb2wuZ2VvbS5TaW1wbGVHZW9tZXRyeSB8IG9sLkV4dGVudCkge1xuICAgICAgICB0aGlzLm9sTWFwLmdldFZpZXcoKS5maXQoZ2VvbWV0cnksIDxvbHgudmlldy5GaXRPcHRpb25zPnRoaXMub2xNYXAuZ2V0U2l6ZSgpKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgY3JlYXRlKG9wdGlvbnM6IGFueSk6IE9sNE1hcCB7XG4gICAgICAgIGlmICghT2w0TWFwLl9pbnN0YW5jZSkgey8vIHNpbmdsZXRvblxuICAgICAgICAgICAgT2w0TWFwLl9pbnN0YW5jZSA9IG5ldyBPbDRNYXAob3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE9sNE1hcC5faW5zdGFuY2U7XG4gICAgfVxuXG4gICAgZ2V0UHJvamVjdGlvbigpOiBvbC5wcm9qLlByb2plY3Rpb24ge1xuICAgICAgICByZXR1cm4gdGhpcy5vbE1hcC5nZXRWaWV3KCkuZ2V0UHJvamVjdGlvbigpO1xuICAgIH1cblxuICAgIGdldERyYXdlcigpOiBPbDREcmF3ZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5kcmF3ZXI7XG4gICAgfVxuXG4gICAgZ2V0SGdMYXllcigpOiBvbC5sYXllci5WZWN0b3Ige1xuICAgICAgICByZXR1cm4gdGhpcy5oZ0xheWVyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgYSBsYXllciBpbnRvIGEgbWFwLlxuICAgICAqIEBwYXJhbSBvcHRpb25zXG4gICAgICovXG4gICAgYWRkTGF5ZXJGb3JPcHRpb25zKG9wdGlvbnM6IGFueSkge1xuICAgICAgICBpZiAob3B0aW9uc1sndHlwZSddID09PSAnV01TJykge1xuICAgICAgICAgICAgbGV0IHdtc0xheWVyID0gdGhpcy5hZGRMYXllcihcbiAgICAgICAgICAgICAgICB0aGlzLndtc1NvdXJjZS5jcmVhdGVMYXllcihcbiAgICAgICAgICAgICAgICAgICAgT2w0TWFwLmdldFV1aWQoJ29sYXktJyksXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub2xNYXAuZ2V0VmlldygpLmdldFByb2plY3Rpb24oKSxcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uc1sndmlzaWJsZSddLFxuICAgICAgICAgICAgICAgICAgICBwYXJzZUZsb2F0KG9wdGlvbnNbJ29wYWNpdHknXSlcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKG9wdGlvbnNbJ3R5cGUnXSArICcgaXMgbm90IHN1cHBvcnRlZC4nKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFkZExheWVyKGxheWVyOiBvbC5sYXllci5CYXNlLCBhZGRUb0xheWVydHJlZTogYm9vbGVhbiA9IGZhbHNlKTogb2wubGF5ZXIuQmFzZSB7XG4gICAgICAgIGlmIChsYXllciBpbnN0YW5jZW9mIG9sLmxheWVyLkltYWdlKSB7XG4gICAgICAgICAgICBsZXQgZ3JvdXA6IG9sLmxheWVyLkdyb3VwID0gPG9sLmxheWVyLkdyb3VwPiB0aGlzLmZpbmRMYXllcihMQVlFUl9JTUFHRSk7XG4gICAgICAgICAgICBncm91cC5nZXRMYXllcnMoKS5pbnNlcnRBdChncm91cC5nZXRMYXllcnMoKS5nZXRMZW5ndGgoKSwgbGF5ZXIpO1xuICAgICAgICB9IGVsc2UgaWYgKGxheWVyIGluc3RhbmNlb2Ygb2wubGF5ZXIuVmVjdG9yKSB7XG4gICAgICAgICAgICBsZXQgZ3JvdXA6IG9sLmxheWVyLkdyb3VwID0gPG9sLmxheWVyLkdyb3VwPiB0aGlzLmZpbmRMYXllcihMQVlFUl9WRUNUT1IpO1xuICAgICAgICAgICAgZ3JvdXAuZ2V0TGF5ZXJzKCkuaW5zZXJ0QXQoZ3JvdXAuZ2V0TGF5ZXJzKCkuZ2V0TGVuZ3RoKCksIGxheWVyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhZGRUb0xheWVydHJlZSkge1xuICAgICAgICAgICAgdGhpcy5hZGRJbnRvTGF5ZXJUcmVlKGxheWVyKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbGF5ZXI7XG4gICAgfVxuXG4gICAgcmVtb3ZlTGF5ZXIobGF5ZXI6IG9sLmxheWVyLkJhc2UpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5vbE1hcC5yZW1vdmVMYXllcihsYXllcik7XG4gICAgfVxuXG4gICAgbW92ZUxheWVyKHV1aWQ6IHN0cmluZywgb2xkUG9zOiBudW1iZXIsIG5ld1BvczogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIGxldCBsYXllcjogb2wubGF5ZXIuQmFzZSA9IHRoaXMuZmluZExheWVyKHV1aWQpO1xuICAgICAgICBpZiAobGF5ZXIgaW5zdGFuY2VvZiBvbC5sYXllci5JbWFnZSkge1xuICAgICAgICAgICAgbGV0IGdyb3VwOiBvbC5sYXllci5Hcm91cCA9IDxvbC5sYXllci5Hcm91cD4gdGhpcy5maW5kTGF5ZXIoTEFZRVJfSU1BR0UpO1xuICAgICAgICAgICAgbGV0IGxheWVybGwgPSBncm91cC5nZXRMYXllcnMoKS5yZW1vdmUobGF5ZXIpO1xuICAgICAgICAgICAgZ3JvdXAuZ2V0TGF5ZXJzKCkuaW5zZXJ0QXQobmV3UG9zLCBsYXllcmxsKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZpbmRMYXllcih1dWlkOiBzdHJpbmcpOiBvbC5sYXllci5CYXNlIHtcbiAgICAgICAgbGV0IGxheWVycyA9IHRoaXMub2xNYXAuZ2V0TGF5ZXJzKCkuZ2V0QXJyYXkoKTtcbiAgICAgICAgZm9yIChsZXQgbGF5ZXIgb2YgbGF5ZXJzKSB7XG4gICAgICAgICAgICBsZXQgc291cmNlOiBvbC5zb3VyY2UuU291cmNlO1xuICAgICAgICAgICAgaWYgKGxheWVyLmdldChVVUlEKSA9PT0gdXVpZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBsYXllcjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobGF5ZXIgaW5zdGFuY2VvZiBvbC5sYXllci5Hcm91cCkge1xuICAgICAgICAgICAgICAgIGxldCBzdWJsYXllcnMgPSAoPG9sLmxheWVyLkdyb3VwPmxheWVyKS5nZXRMYXllcnMoKS5nZXRBcnJheSgpO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IHN1YmxheWVyIG9mIHN1YmxheWVycykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3VibGF5ZXIuZ2V0KFVVSUQpID09PSB1dWlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3VibGF5ZXI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgdXBkYXRlTWFwKCk6IHZvaWQge1xuICAgICAgICB0aGlzLm9sTWFwLnVwZGF0ZVNpemUoKTtcbiAgICB9XG5cbiAgICBjaGFuZ2VDcnMoY3JzOiBzdHJpbmcpIHsgLy8gVE9ET1xuICAgICAgICBsZXQgdG9Qcm9qID0gbnVsbDtcbiAgICAgICAgaWYgKCh0b1Byb2ogPSBvbC5wcm9qLmdldChjcnMpKSkge1xuICAgICAgICAgICAgbGV0IGV4dGVudCA9IE9sNEV4dGVudC5mcm9tQXJyYXkoXG4gICAgICAgICAgICAgICAgdGhpcy5vbE1hcC5nZXRWaWV3KCkuY2FsY3VsYXRlRXh0ZW50KHRoaXMub2xNYXAuZ2V0U2l6ZSgpKSxcbiAgICAgICAgICAgICAgICB0aGlzLmdldFByb2plY3Rpb24oKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGxldCBmcm9tUHJvaiA9IHRoaXMuZ2V0UHJvamVjdGlvbigpO1xuICAgICAgICAgICAgLy8gbGV0IGNlbnRlciA9IHRoaXMub2xNYXAuZ2V0VmlldygpLmdldENlbnRlcigpO1xuICAgICAgICAgICAgLy8gbGV0IGxheWVycyA9ICg8b2wubGF5ZXIuR3JvdXA+dGhpcy5maW5kTGF5ZXIoTEFZRVJfSU1BR0UpKS5nZXRMYXllcnMoKS5nZXRBcnJheSgpO1xuICAgICAgICAgICAgdGhpcy5vbE1hcC5zZXRWaWV3KFxuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlVmlldyhcbiAgICAgICAgICAgICAgICAgICAgdG9Qcm9qLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1heEV4dGVudC5nZXRFeHRlbnQodG9Qcm9qKSxcbiAgICAgICAgICAgICAgICAgICAgT2w0VXRpbHMucmVzb2x1dGlvbnNGb3JTY2FsZXModGhpcy5zY2FsZXMsIHRvUHJvai5nZXRVbml0cygpKS5yZXZlcnNlKClcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgdGhpcy5jaGFuZ2VGb3JJTGF5ZXJzSSgoPG9sLmxheWVyLkdyb3VwPnRoaXMuZmluZExheWVyKExBWUVSX0lNQUdFKSkuZ2V0TGF5ZXJzKCksIGZyb21Qcm9qLCB0b1Byb2opO1xuICAgICAgICAgICAgdGhpcy5jaGFuZ2VGb3JWTGF5ZXJzKCg8b2wubGF5ZXIuR3JvdXA+dGhpcy5maW5kTGF5ZXIoTEFZRVJfVkVDVE9SKSkuZ2V0TGF5ZXJzKCksIGZyb21Qcm9qLCB0b1Byb2opO1xuICAgICAgICAgICAgdGhpcy56b29tVG9FeHRlbnQoZXh0ZW50LmdldFBvbHlnb25Gb3JFeHRlbnQodG9Qcm9qKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGNoYW5nZUZvclZMYXllcnMobGF5ZXJzOiBvbC5Db2xsZWN0aW9uPG9sLmxheWVyLkJhc2U+LCBmcm9tUHJvaiwgdG9Qcm9qKSB7XG4gICAgICAgIGZvciAobGV0IGxheWVyIG9mIGxheWVycy5nZXRBcnJheSgpKSB7XG4gICAgICAgICAgICB0aGlzLnZlY1NvdXJjZS5yZXByb2plY3Rpb25Tb3VyY2UobGF5ZXIsIGZyb21Qcm9qLCB0b1Byb2opO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjaGFuZ2VGb3JJTGF5ZXJzSShsYXllcnM6IG9sLkNvbGxlY3Rpb248b2wubGF5ZXIuQmFzZT4sIGZyb21Qcm9qLCB0b1Byb2opIHtcbiAgICAgICAgZm9yIChsZXQgbGF5ZXIgb2YgbGF5ZXJzLmdldEFycmF5KCkpIHtcbiAgICAgICAgICAgIHRoaXMud21zU291cmNlLnJlcHJvamVjdGlvblNvdXJjZSg8b2wubGF5ZXIuSW1hZ2U+bGF5ZXIsIGZyb21Qcm9qLCB0b1Byb2opO1xuICAgICAgICAgICAgbGV0IHNvdXJjZSA9IDxvbC5zb3VyY2UuSW1hZ2VXTVM+KDxvbC5sYXllci5JbWFnZT5sYXllcikuZ2V0U291cmNlKCk7XG4gICAgICAgICAgICBsZXQgaWxmOiBvbC5JbWFnZUxvYWRGdW5jdGlvblR5cGUgPSBzb3VyY2UuZ2V0SW1hZ2VMb2FkRnVuY3Rpb24oKTtcbiAgICAgICAgICAgIHNvdXJjZS5zZXRJbWFnZUxvYWRGdW5jdGlvbihpbGYpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2V0VmlzaWJsZShsYXllcjogb2wubGF5ZXIuQmFzZSB8IHN0cmluZywgdmlzaWJsaXR5OiBib29sZWFuKTogdm9pZCB7XG4gICAgICAgIGxldCBfbGF5ZXI6IG9sLmxheWVyLkJhc2UgPSBsYXllciBpbnN0YW5jZW9mIG9sLmxheWVyLkJhc2UgPyBsYXllciA6IHRoaXMuZmluZExheWVyKDxzdHJpbmc+bGF5ZXIpO1xuICAgICAgICBpZiAoX2xheWVyKSB7XG4gICAgICAgICAgICBfbGF5ZXIuc2V0VmlzaWJsZSh2aXNpYmxpdHkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2V0T3BhY2l0eShsYXllcjogb2wubGF5ZXIuQmFzZSB8IHN0cmluZywgb3BhY2l0eTogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIGxldCBfbGF5ZXI6IG9sLmxheWVyLkJhc2UgPSBsYXllciBpbnN0YW5jZW9mIG9sLmxheWVyLkJhc2UgPyBsYXllciA6IHRoaXMuZmluZExheWVyKDxzdHJpbmc+bGF5ZXIpO1xuICAgICAgICBpZiAoX2xheWVyKSB7XG4gICAgICAgICAgICBfbGF5ZXIuc2V0T3BhY2l0eShvcGFjaXR5KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNsZWFyRmVhdHVyZXMoKSB7XG4gICAgICAgIHRoaXMudmVjU291cmNlLmNsZWFyRmVhdHVyZXModGhpcy5oZ0xheWVyKTtcbiAgICB9XG5cbiAgICBzaG93RmVhdHVyZXMoZ2VvSnNvbjogT2JqZWN0KSB7XG4gICAgICAgIHRoaXMudmVjU291cmNlLnNob3dGZWF0dXJlcyh0aGlzLmhnTGF5ZXIsIGdlb0pzb24pO1xuICAgIH1cblxuICAgIGRyYXdHZW9tZXRyeUZvclNlYXJjaChnZW9Kc29uOiBPYmplY3QsIG9uRHJhd0VuZDogRnVuY3Rpb24gPSBudWxsKSB7XG4gICAgICAgIGxldCBvbDRtYXAgPSB0aGlzO1xuICAgICAgICBsZXQgb2xNYXAgPSB0aGlzLm9sTWFwO1xuICAgICAgICB0aGlzLnZlY1NvdXJjZS5jbGVhckZlYXR1cmVzKHRoaXMuZHJhd2VyLmdldExheWVyKCkpO1xuICAgICAgICB0aGlzLnZlY1NvdXJjZS5zaG93RmVhdHVyZXModGhpcy5kcmF3ZXIuZ2V0TGF5ZXIoKSwgZ2VvSnNvbik7XG4gICAgICAgIGlmIChvbkRyYXdFbmQgIT09IG51bGwpIHtcbiAgICAgICAgICAgIG9uRHJhd0VuZChnZW9Kc29uKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgbXVsdGlQb2ludDogb2wuZ2VvbS5NdWx0aVBvaW50ID0gPG9sLmdlb20uTXVsdGlQb2ludD4gT2w0RXh0ZW50LmZyb21BcnJheShcbiAgICAgICAgICAgIHRoaXMuZHJhd2VyLmdldExheWVyKCkuZ2V0U291cmNlKCkuZ2V0RXh0ZW50KCksXG4gICAgICAgICAgICB0aGlzLm9sTWFwLmdldFZpZXcoKS5nZXRQcm9qZWN0aW9uKClcbiAgICAgICAgKS5nZXRHZW9tKCk7XG4gICAgICAgIGxldCBtYXhleHRlbnQgPSB0aGlzLm1heEV4dGVudC5nZXRQb2x5Z29uRm9yRXh0ZW50KHRoaXMub2xNYXAuZ2V0VmlldygpLmdldFByb2plY3Rpb24oKSk7XG4gICAgICAgIGlmIChtYXhleHRlbnQuaW50ZXJzZWN0c0Nvb3JkaW5hdGUobXVsdGlQb2ludC5nZXRQb2ludCgwKS5nZXRDb29yZGluYXRlcygpKVxuICAgICAgICAgICAgJiYgbWF4ZXh0ZW50LmludGVyc2VjdHNDb29yZGluYXRlKG11bHRpUG9pbnQuZ2V0UG9pbnQoMSkuZ2V0Q29vcmRpbmF0ZXMoKSkpIHtcbiAgICAgICAgICAgIHRoaXMuem9vbVRvRXh0ZW50KHRoaXMuZHJhd2VyLmdldExheWVyKCkuZ2V0U291cmNlKCkuZ2V0RXh0ZW50KCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbWV0YWRvci5kaXNwbGF5RXJyb3IoJ0RpZSBHZW9tZXRyaWUgaXN0IGF1w59lcmhhbGIgZGVyIHLDpHVtbGljaGVuIEVyc3RyZWNrdW5nLicpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZHJhd1NoYXBlRm9yU2VhcmNoKHNoYXBlVHlwZTogU0hBUEVTID0gbnVsbCwgb25EcmF3RW5kOiBGdW5jdGlvbiA9IG51bGwpIHtcbiAgICAgICAgdGhpcy5zZXREb3VibGVDbGlja1pvb20oZmFsc2UpO1xuICAgICAgICBsZXQgb2w0bWFwID0gdGhpcztcbiAgICAgICAgbGV0IG9sTWFwID0gdGhpcy5vbE1hcDtcbiAgICAgICAgY29uc3Qgc2hhcGU6IFNIQVBFUyA9IHR5cGVvZiBzaGFwZVR5cGUgPT09ICdzdHJpbmcnID8gU0hBUEVTWzxzdHJpbmc+IHNoYXBlVHlwZV0gOiBzaGFwZVR5cGU7XG4gICAgICAgIGlmICh0aGlzLmRyYXdlci5nZXRJbnRlcmFjdGlvbigpKSB7XG4gICAgICAgICAgICB0aGlzLm9sTWFwLnJlbW92ZUludGVyYWN0aW9uKHRoaXMuZHJhd2VyLmdldEludGVyYWN0aW9uKCkpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZHJhd2VyLnNldEludGVyYWN0aW9uKHNoYXBlLCBPbDRVdGlscy5nZXRTdHlsZSh0aGlzLnN0eWxlc1snc2VhcmNoJ10pKTtcbiAgICAgICAgaWYgKHRoaXMuZHJhd2VyLmdldEludGVyYWN0aW9uKCkpIHtcbiAgICAgICAgICAgIGxldCBkcmF3ZXIgPSB0aGlzLmRyYXdlcjtcbiAgICAgICAgICAgIHRoaXMuZ2V0RHJhd2VyKCkuZ2V0TGF5ZXIoKS5nZXRTb3VyY2UoKS5jbGVhcigpO1xuICAgICAgICAgICAgdGhpcy5vbE1hcC5hZGRJbnRlcmFjdGlvbih0aGlzLmRyYXdlci5nZXRJbnRlcmFjdGlvbigpKTtcbiAgICAgICAgICAgIHRoaXMuZHJhd2VyLmdldEludGVyYWN0aW9uKCkub24oXG4gICAgICAgICAgICAgICAgJ2RyYXdzdGFydCcsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgb2w0bWFwLmdldERyYXdlcigpLmdldExheWVyKCkuZ2V0U291cmNlKCkuY2xlYXIoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgdGhpcy5kcmF3ZXIuZ2V0SW50ZXJhY3Rpb24oKS5vbihcbiAgICAgICAgICAgICAgICAnZHJhd2VuZCcsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGdlb2pzb24gPSBuZXcgb2wuZm9ybWF0Lkdlb0pTT04oKS53cml0ZUZlYXR1cmVPYmplY3QoXG4gICAgICAgICAgICAgICAgICAgICAgICBlLmZlYXR1cmUsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RhdGFQcm9qZWN0aW9uJzogTUVUQURPUl9FUFNHLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdmZWF0dXJlUHJvamVjdGlvbic6IG9sNG1hcC5nZXRQcm9qZWN0aW9uKClcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgZ2VvanNvblsnYmJveCddID0gbmV3IE9sNEdlb20oZS5mZWF0dXJlLmdldEdlb21ldHJ5KCksIG9sNG1hcC5nZXRQcm9qZWN0aW9uKCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAuZ2V0RXh0ZW50KG9sLnByb2ouZ2V0KE1FVEFET1JfRVBTRykpO1xuICAgICAgICAgICAgICAgICAgICBvbkRyYXdFbmQoZ2VvanNvbik7XG4gICAgICAgICAgICAgICAgICAgIG9sTWFwLnJlbW92ZUludGVyYWN0aW9uKGRyYXdlci5nZXRJbnRlcmFjdGlvbigpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5nZXREcmF3ZXIoKS5nZXRMYXllcigpLmdldFNvdXJjZSgpLmNsZWFyKCk7XG4gICAgICAgICAgICBvbkRyYXdFbmQobnVsbCk7XG4gICAgICAgICAgICB0aGlzLnNldERvdWJsZUNsaWNrWm9vbSh0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFjdGl2YXRlcyAvIGRlYWN0aXZhdGVzIGludGVyYWN0aW9uIG9sLmludGVyYWN0aW9uLkRvdWJsZUNsaWNrWm9vbVxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gc3RhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIHNldERvdWJsZUNsaWNrWm9vbShzdGF0ZTogYm9vbGVhbikge1xuICAgICAgICBmb3IgKGxldCBpbnRlcmFjdGlvbiBvZiB0aGlzLm9sTWFwLmdldEludGVyYWN0aW9ucygpLmdldEFycmF5KCkpIHtcbiAgICAgICAgICAgIGlmIChpbnRlcmFjdGlvbiBpbnN0YW5jZW9mIG9sLmludGVyYWN0aW9uLkRvdWJsZUNsaWNrWm9vbSkge1xuICAgICAgICAgICAgICAgIGludGVyYWN0aW9uLnNldEFjdGl2ZShzdGF0ZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBlbnVtIFNIQVBFUyB7Tk9ORSwgQk9YLCBQT0xZR09OfVxuO1xuXG5leHBvcnQgY2xhc3MgT2w0RHJhd2VyIHtcbiAgICAvLyBwcml2YXRlIHN0YXRpYyBfaW5zdGFuY2U6IE9sNERyYXdlcjtcbiAgICBwcm90ZWN0ZWQgbGF5ZXI6IG9sLmxheWVyLlZlY3RvcjtcbiAgICBwcm90ZWN0ZWQgaW50ZXJhY3Rpb246IG9sLmludGVyYWN0aW9uLkRyYXc7XG5cbiAgICBjb25zdHJ1Y3RvcihsYXllcjogb2wubGF5ZXIuVmVjdG9yKSB7XG4gICAgICAgIHRoaXMubGF5ZXIgPSBsYXllcjtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0TGF5ZXIoKTogb2wubGF5ZXIuVmVjdG9yIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubGF5ZXI7XG4gICAgfVxuXG4gICAgcHVibGljIGdldEludGVyYWN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnRlcmFjdGlvbjtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0SW50ZXJhY3Rpb24odHlwZTogU0hBUEVTLCBkcmF3U3R5bGU6IG9sLnN0eWxlLlN0eWxlKSB7XG4gICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgY2FzZSBTSEFQRVMuQk9YOlxuICAgICAgICAgICAgICAgIHRoaXMuaW50ZXJhY3Rpb24gPSBuZXcgb2wuaW50ZXJhY3Rpb24uRHJhdyh7XG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogdGhpcy5sYXllci5nZXRTb3VyY2UoKSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ0NpcmNsZScsXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiBkcmF3U3R5bGUsXG4gICAgICAgICAgICAgICAgICAgIGdlb21ldHJ5RnVuY3Rpb246IGNyZWF0ZUJveCgpIC8vIG9sLmQudHMgaGFzIG5vIGZ1bmN0aW9uIFwib2wuaW50ZXJhY3Rpb24uRHJhdy5jcmVhdGVCb3goKVwiXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFNIQVBFUy5QT0xZR09OOlxuICAgICAgICAgICAgICAgIHRoaXMuaW50ZXJhY3Rpb24gPSBuZXcgb2wuaW50ZXJhY3Rpb24uRHJhdyh7XG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogdGhpcy5sYXllci5nZXRTb3VyY2UoKSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ1BvbHlnb24nLFxuICAgICAgICAgICAgICAgICAgICBzdHlsZTogZHJhd1N0eWxlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRoaXMuaW50ZXJhY3Rpb24gPSBudWxsO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIG9sLmQudHMgaGFzIG5vIGZ1bmN0aW9uIFwib2wuaW50ZXJhY3Rpb24uRHJhdy5jcmVhdGVCb3goKVwiXG4gKiBAcmV0dXJucyB7KGNvb3JkaW5hdGVzOmFueSwgb3B0X2dlb21ldHJ5OmFueSk9PmFueXxvbC5nZW9tLlBvbHlnb259XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVCb3goKSB7XG4gICAgcmV0dXJuIChcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSB7b2wuQ29vcmRpbmF0ZXxBcnJheS48b2wuQ29vcmRpbmF0ZT58QXJyYXkuPEFycmF5LjxvbC5Db29yZGluYXRlPj59IGNvb3JkaW5hdGVzXG4gICAgICAgICAqIEBwYXJhbSB7b2wuZ2VvbS5TaW1wbGVHZW9tZXRyeT19IG9wdF9nZW9tZXRyeVxuICAgICAgICAgKiBAcmV0dXJuIHtvbC5nZW9tLlNpbXBsZUdlb21ldHJ5fVxuICAgICAgICAgKi9cbiAgICAgICAgZnVuY3Rpb24gKGNvb3JkaW5hdGVzLCBvcHRfZ2VvbWV0cnkpIHtcbiAgICAgICAgICAgIHZhciBleHRlbnQgPSBvbC5leHRlbnQuYm91bmRpbmdFeHRlbnQoY29vcmRpbmF0ZXMpO1xuICAgICAgICAgICAgdmFyIGdlb21ldHJ5ID0gb3B0X2dlb21ldHJ5IHx8IG5ldyBvbC5nZW9tLlBvbHlnb24obnVsbCk7XG4gICAgICAgICAgICBnZW9tZXRyeS5zZXRDb29yZGluYXRlcyhbW1xuICAgICAgICAgICAgICAgIG9sLmV4dGVudC5nZXRCb3R0b21MZWZ0KGV4dGVudCksXG4gICAgICAgICAgICAgICAgb2wuZXh0ZW50LmdldEJvdHRvbVJpZ2h0KGV4dGVudCksXG4gICAgICAgICAgICAgICAgb2wuZXh0ZW50LmdldFRvcFJpZ2h0KGV4dGVudCksXG4gICAgICAgICAgICAgICAgb2wuZXh0ZW50LmdldFRvcExlZnQoZXh0ZW50KSxcbiAgICAgICAgICAgICAgICBvbC5leHRlbnQuZ2V0Qm90dG9tTGVmdChleHRlbnQpXG4gICAgICAgICAgICBdXSk7XG4gICAgICAgICAgICByZXR1cm4gZ2VvbWV0cnk7XG4gICAgICAgIH1cbiAgICApO1xufVxuXG5leHBvcnQgY2xhc3MgR2VvbUxvYWRlciB7XG4gICAgcHJpdmF0ZSBtYXA6IE9sNE1hcDtcbiAgICBwcml2YXRlIGZvcm06IEhUTUxGb3JtRWxlbWVudDtcblxuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcihtYXA6IE9sNE1hcCwgZm9ybTogSFRNTEZvcm1FbGVtZW50KSB7XG4gICAgICAgIHRoaXMubWFwID0gbWFwO1xuICAgICAgICB0aGlzLmZvcm0gPSBmb3JtO1xuICAgICAgICB0aGlzLm9uKCk7XG4gICAgfVxuXG4gICAgcHVibGljIG9uKCkge1xuICAgICAgICB0aGlzLmZvcm0uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgdGhpcy51cGxvYWQuYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgIH1cblxuICAgIHByaXZhdGUgdXBsb2FkKGU6IEV2ZW50KSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGUpO1xuICAgICAgICAvLyBIdHRwVXRpbHMuSHR0cC5zZW5kRm9ybSh0aGlzLmZvcm0sIHRoaXMuZm9ybS5hY3Rpb24sIEh0dHBVdGlscy5IVFRQX01FVEhPRC5QT1NULCBIdHRwVXRpbHMuSFRUUF9EQVRBVFlQRS5qc29uKVxuICAgICAgICAvLyAgICAgLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIC8vICAgICAgICAgY29uc29sZS5sb2coJ0NvbnRlbnRzOiAnICsgdmFsdWUpO1xuICAgICAgICAvLyAgICAgfSlcbiAgICAgICAgLy8gICAgIC5jYXRjaChmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgIC8vICAgICAgICAgY29uc29sZS5lcnJvcihyZWFzb24pO1xuICAgICAgICAvLyAgICAgfSk7XG4gICAgfVxufVxuXG5kZWNsYXJlIHZhciBtZXRhZG9yOiBhbnk7IiwiaW1wb3J0IHtUSVRMRSwgVVVJRCwgTEFZRVJfVVVJRCwgT2w0TWFwfSBmcm9tIFwiLi9PbDRcIjtcbmltcG9ydCB7TGF5ZXJUcmVlfSBmcm9tICcuL0xheWVyVHJlZSc7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBPbDRTb3VyY2Uge1xuXG4gICAgYWJzdHJhY3QgY3JlYXRlTGF5ZXIobGF5ZXJVdWlkOiBzdHJpbmcsIG9wdGlvbnM6IGFueSwgcHJvajogb2wuUHJvamVjdGlvbkxpa2UsIHZpc2libGU6IGJvb2xlYW4sIG9wYWNpdHk6IG51bWJlcik6IG9sLmxheWVyLkJhc2U7XG5cbiAgICBhYnN0cmFjdCByZXByb2plY3Rpb25Tb3VyY2UobGF5ZXI6IG9sLmxheWVyLkJhc2UsIGZyb21Qcm9qOiBvbC5Qcm9qZWN0aW9uTGlrZSwgdG9Qcm9qOiBvbC5Qcm9qZWN0aW9uTGlrZSk7XG5cbiAgICBhYnN0cmFjdCBjbG9uZUxheWVyKGxheWVyOiBvbC5sYXllci5CYXNlLCBmcm9tUHJvajogb2wuUHJvamVjdGlvbkxpa2UsIHRvUHJvajogb2wuUHJvamVjdGlvbkxpa2UpOiBvbC5sYXllci5CYXNlO1xufVxuXG5leHBvcnQgY2xhc3MgT2w0VmVjdG9yU291cmNlIGltcGxlbWVudHMgT2w0U291cmNlIHtcbiAgICBwcml2YXRlIHN0YXRpYyBfaW5zdGFuY2U6IE9sNFZlY3RvclNvdXJjZTtcbiAgICBwcm90ZWN0ZWQgc2hvd2FibGU6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICBwcml2YXRlIG9sNE1hcDogT2w0TWFwO1xuXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihvbDRNYXA6IE9sNE1hcCkge1xuICAgICAgICAvLyBzdXBlcihmYWxzZSk7XG4gICAgICAgIHRoaXMub2w0TWFwID0gb2w0TWFwO1xuICAgICAgICAvLyB0aGlzLnNldFNob3dhYmxlKGZhbHNlKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgY3JlYXRlKG9sNG1hcDogT2w0TWFwKTogT2w0VmVjdG9yU291cmNlIHtcbiAgICAgICAgaWYgKCFPbDRWZWN0b3JTb3VyY2UuX2luc3RhbmNlKSB7Ly8gc2luZ2xldG9uXG4gICAgICAgICAgICBPbDRWZWN0b3JTb3VyY2UuX2luc3RhbmNlID0gbmV3IE9sNFZlY3RvclNvdXJjZShvbDRtYXApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBPbDRWZWN0b3JTb3VyY2UuX2luc3RhbmNlO1xuICAgIH1cblxuICAgIGNyZWF0ZUxheWVyKGxheWVyVXVpZDogc3RyaW5nLCBvcHRpb25zOiBhbnksIHByb2o6IG9sLlByb2plY3Rpb25MaWtlLCB2aXNpYmxlOiBib29sZWFuID0gdHJ1ZSwgb3BhY2l0eTogbnVtYmVyID0gMS4wKTogb2wubGF5ZXIuQmFzZSB7XG4gICAgICAgIGxldCB2TGF5ZXIgPSBuZXcgb2wubGF5ZXIuVmVjdG9yKHtcbiAgICAgICAgICAgIHNvdXJjZTogbmV3IG9sLnNvdXJjZS5WZWN0b3Ioe3dyYXBYOiBmYWxzZX0pLFxuICAgICAgICAgICAgc3R5bGU6IG9wdGlvbnNbJ3N0eWxlJ11cbiAgICAgICAgfSk7XG4gICAgICAgIHZMYXllci5zZXQoVVVJRCwgbGF5ZXJVdWlkKTtcbiAgICAgICAgcmV0dXJuIHZMYXllcjtcbiAgICB9XG5cbiAgICByZXByb2plY3Rpb25Tb3VyY2UobGF5ZXI6IG9sLmxheWVyLkJhc2UsIGZyb21Qcm9qOiBvbC5Qcm9qZWN0aW9uTGlrZSwgdG9Qcm9qOiBvbC5Qcm9qZWN0aW9uTGlrZSkge1xuICAgICAgICBsZXQgc291cmNlID0gKDxvbC5sYXllci5MYXllcj5sYXllcikuZ2V0U291cmNlKCk7XG4gICAgICAgIGxldCBmZWF0dXJlczogb2wuRmVhdHVyZVtdID0gKDxvbC5zb3VyY2UuVmVjdG9yPnNvdXJjZSkuZ2V0RmVhdHVyZXMoKTtcbiAgICAgICAgZm9yIChsZXQgZmVhdHVyZSBvZiBmZWF0dXJlcykge1xuICAgICAgICAgICAgZmVhdHVyZS5zZXRHZW9tZXRyeShmZWF0dXJlLmdldEdlb21ldHJ5KCkudHJhbnNmb3JtKGZyb21Qcm9qLCB0b1Byb2opKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNsb25lTGF5ZXIobGF5ZXI6IG9sLmxheWVyLkJhc2UsIGZyb21Qcm9qOiBvbC5Qcm9qZWN0aW9uTGlrZSwgdG9Qcm9qOiBvbC5Qcm9qZWN0aW9uTGlrZSk6IG9sLmxheWVyLkJhc2Uge1xuICAgICAgICAvKiBUT0RPIGZvciBjbG9uZSAqL1xuICAgICAgICByZXR1cm4gbGF5ZXI7XG4gICAgfVxuXG4gICAgc2hvd0ZlYXR1cmVzKHZMYXllcjogb2wubGF5ZXIuVmVjdG9yLCBnZW9Kc29uOiBPYmplY3QpIHtcbiAgICAgICAgbGV0IGdlb0pzb25SZWFkZXI6IG9sLmZvcm1hdC5HZW9KU09OID0gbmV3IG9sLmZvcm1hdC5HZW9KU09OKCk7XG4gICAgICAgIGxldCBkYXRhcHJvaiA9IGdlb0pzb25SZWFkZXIucmVhZFByb2plY3Rpb24oZ2VvSnNvbik7XG4gICAgICAgIGxldCBmZWF0dXJlcyA9IGdlb0pzb25SZWFkZXIucmVhZEZlYXR1cmVzKFxuICAgICAgICAgICAgZ2VvSnNvbixcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAnZGF0YVByb2plY3Rpb24nOiBnZW9Kc29uUmVhZGVyLnJlYWRQcm9qZWN0aW9uKGdlb0pzb24pLFxuICAgICAgICAgICAgICAgICdmZWF0dXJlUHJvamVjdGlvbic6IHRoaXMub2w0TWFwLmdldFByb2plY3Rpb24oKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIHZMYXllci5nZXRTb3VyY2UoKS5hZGRGZWF0dXJlcyhmZWF0dXJlcyk7XG4gICAgfVxuXG4gICAgY2xlYXJGZWF0dXJlcyh2TGF5ZXI6IG9sLmxheWVyLlZlY3Rvcikge1xuICAgICAgICB2TGF5ZXIuZ2V0U291cmNlKCkuY2xlYXIodHJ1ZSk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgT2w0V21zU291cmNlIGltcGxlbWVudHMgT2w0U291cmNlIHtcbiAgICBwcml2YXRlIHN0YXRpYyBfaW5zdGFuY2U6IE9sNFdtc1NvdXJjZTtcbiAgICBwcml2YXRlIG9sNE1hcDogT2w0TWFwO1xuICAgIHByaXZhdGUgdXNlTG9hZEV2ZW50czogYm9vbGVhbjtcbiAgICBwdWJsaWMgc3RhdGljIG1hcEFjdGl2aXR5OiBNYXBBY3Rpdml0eTsvLyA9IE1hcEFjdGl2aXR5LmNyZWF0ZSgpO1xuICAgIHB1YmxpYyBkaXNhYmxlZDogYW55O1xuXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihvbDRNYXA6IE9sNE1hcCwgdXNlTG9hZEV2ZW50czogYm9vbGVhbiA9IHRydWUpIHtcbiAgICAgICAgdGhpcy5vbDRNYXAgPSBvbDRNYXA7XG4gICAgICAgIHRoaXMudXNlTG9hZEV2ZW50cyA9IHVzZUxvYWRFdmVudHM7XG4gICAgICAgIGlmICh0aGlzLnVzZUxvYWRFdmVudHMpIHtcbiAgICAgICAgICAgIE9sNFdtc1NvdXJjZS5tYXBBY3Rpdml0eSA9IE1hcEFjdGl2aXR5LmNyZWF0ZSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZGlzYWJsZWQgPSB7fTtcbiAgICB9XG5cbiAgICBzdGF0aWMgY3JlYXRlKG9sNE1hcDogT2w0TWFwLCB1c2VMb2FkRXZlbnRzOiBib29sZWFuID0gdHJ1ZSk6IE9sNFdtc1NvdXJjZSB7XG4gICAgICAgIGlmICghT2w0V21zU291cmNlLl9pbnN0YW5jZSkgey8vIHNpbmdsZXRvblxuICAgICAgICAgICAgT2w0V21zU291cmNlLl9pbnN0YW5jZSA9IG5ldyBPbDRXbXNTb3VyY2Uob2w0TWFwLCB1c2VMb2FkRXZlbnRzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gT2w0V21zU291cmNlLl9pbnN0YW5jZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYWRkRGlzYWJsZWQobGF5ZXI6IG9sLmxheWVyLkJhc2UpIHtcbiAgICAgICAgdGhpcy5kaXNhYmxlZFtsYXllci5nZXQoVVVJRCldID0gbGF5ZXIuZ2V0KFVVSUQpO1xuICAgICAgICB0aGlzLm9sNE1hcC5nZXRMYXllclRyZWUoKS5zZXREaXNhYmxlKGxheWVyLCB0cnVlKTtcbiAgICAgICAgdGhpcy5vbDRNYXAuc2V0VmlzaWJsZShsYXllciwgZmFsc2UpO1xuICAgIH1cblxuICAgIHB1YmxpYyByZW1vdmVEaXNhYmxlZChsYXllcjogb2wubGF5ZXIuQmFzZSkge1xuICAgICAgICBpZiAobGF5ZXIuZ2V0KFVVSUQpKXtcbiAgICAgICAgICAgIHRoaXMub2w0TWFwLmdldExheWVyVHJlZSgpLnNldERpc2FibGUobGF5ZXIsIGZhbHNlKTtcbiAgICAgICAgICAgIGxldCB2aXNpYmxlID0gdGhpcy5vbDRNYXAuZ2V0TGF5ZXJUcmVlKCkuZ2V0VmlzaWJsZShsYXllcik7XG4gICAgICAgICAgICB0aGlzLm9sNE1hcC5zZXRWaXNpYmxlKGxheWVyLCB2aXNpYmxlKTtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLmRpc2FibGVkW2xheWVyLmdldChVVUlEKV07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjcmVhdGVMYXllcihsYXllclV1aWQ6IHN0cmluZywgb3B0aW9uczogYW55ID0gbnVsbCwgcHJvajogb2wuUHJvamVjdGlvbkxpa2UsIHZpc2libGU6IGJvb2xlYW4sIG9wYWNpdHk6IG51bWJlcik6IG9sLmxheWVyLkJhc2Uge1xuICAgICAgICBsZXQgc291cmNlID0gdGhpcy5jcmVhdGVTb3VyY2UobGF5ZXJVdWlkLCBvcHRpb25zWyd1cmwnXSwgb3B0aW9uc1sncGFyYW1zJ10sIHByb2opO1xuICAgICAgICBsZXQgbGF5ZXJXbXMgPSB0aGlzLl9jcmVhdGVMYXllcihsYXllclV1aWQsIHZpc2libGUsIG9wYWNpdHksIHNvdXJjZSwgb3B0aW9uc1sndGl0bGUnXSA/IG9wdGlvbnNbJ3RpdGxlJ10gOiBudWxsKTtcbiAgICAgICAgcmV0dXJuIGxheWVyV21zO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2NyZWF0ZUxheWVyKGxheWVyVXVpZDogc3RyaW5nLCB2aXNpYmxlOiBib29sZWFuLCBvcGFjaXR5OiBudW1iZXIsIHNvdXJjZTogb2wuc291cmNlLkltYWdlV01TLCB0aXRsZTogc3RyaW5nID0gbnVsbCkge1xuICAgICAgICBsZXQgbGF5ZXJXbXMgPSBuZXcgb2wubGF5ZXIuSW1hZ2Uoe1xuICAgICAgICAgICAgc291cmNlOiBzb3VyY2UsXG4gICAgICAgICAgICB2aXNpYmxlOiB2aXNpYmxlLFxuICAgICAgICAgICAgb3BhY2l0eTogb3BhY2l0eVxuICAgICAgICB9KTtcbiAgICAgICAgbGF5ZXJXbXMuc2V0KFVVSUQsIGxheWVyVXVpZCk7XG4gICAgICAgIGlmICh0aXRsZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgbGF5ZXJXbXMuc2V0KFRJVExFLCB0aXRsZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxheWVyV21zO1xuICAgIH1cblxuICAgIHByaXZhdGUgY3JlYXRlU291cmNlKGxheWVyVXVpZDogc3RyaW5nLCB1cmw6IHN0cmluZywgcGFyYW1zOiBhbnksIHByb2o6IG9sLlByb2plY3Rpb25MaWtlKTogb2wuc291cmNlLkltYWdlV01TIHtcbiAgICAgICAgbGV0IHNvdXJjZSA9IG5ldyBvbC5zb3VyY2UuSW1hZ2VXTVMoe1xuICAgICAgICAgICAgdXJsOiB1cmwsXG4gICAgICAgICAgICBwYXJhbXM6IHBhcmFtcyxcbiAgICAgICAgICAgIHByb2plY3Rpb246IHByb2pcbiAgICAgICAgfSk7XG4gICAgICAgIHNvdXJjZS5zZXQoTEFZRVJfVVVJRCwgbGF5ZXJVdWlkKTtcbiAgICAgICAgdGhpcy5zZXRMb2FkRXZlbnRzKHNvdXJjZSk7XG4gICAgICAgIHJldHVybiBzb3VyY2U7XG4gICAgfVxuXG4gICAgcmVwcm9qZWN0aW9uU291cmNlKGxheWVyOiBvbC5sYXllci5CYXNlLCBmcm9tUHJvajogb2wuUHJvamVjdGlvbkxpa2UsIHRvUHJvajogb2wuUHJvamVjdGlvbkxpa2UpIHtcbiAgICAgICAgbGV0IG9sZHNvdXJjZSA9IDxvbC5zb3VyY2UuSW1hZ2VXTVM+KDxvbC5sYXllci5MYXllcj5sYXllcikuZ2V0U291cmNlKCk7XG4gICAgICAgIGxldCBuZXdTb3VyY2UgPSB0aGlzLmNyZWF0ZVNvdXJjZShsYXllci5nZXQoVVVJRCksIG9sZHNvdXJjZS5nZXRVcmwoKSwgb2xkc291cmNlLmdldFBhcmFtcygpLCB0b1Byb2opO1xuICAgICAgICAoPG9sLmxheWVyLkxheWVyPmxheWVyKS5zZXRTb3VyY2UobmV3U291cmNlKTtcbiAgICAgICAgdGhpcy5yZW1vdmVEaXNhYmxlZChsYXllcik7XG4gICAgfVxuXG4gICAgY2xvbmVMYXllcihsYXllcjogb2wubGF5ZXIuQmFzZSwgZnJvbVByb2o6IG9sLlByb2plY3Rpb25MaWtlLCB0b1Byb2o6IG9sLlByb2plY3Rpb25MaWtlKTogb2wubGF5ZXIuQmFzZSB7XG4gICAgICAgIGxldCBvbGRzb3VyY2UgPSA8b2wuc291cmNlLkltYWdlV01TPig8b2wubGF5ZXIuTGF5ZXI+bGF5ZXIpLmdldFNvdXJjZSgpO1xuICAgICAgICBsZXQgbmV3U291cmNlID0gdGhpcy5jcmVhdGVTb3VyY2UobGF5ZXIuZ2V0KFVVSUQpLCBvbGRzb3VyY2UuZ2V0VXJsKCksIG9sZHNvdXJjZS5nZXRQYXJhbXMoKSwgdG9Qcm9qKTtcbiAgICAgICAgbGV0IG9sZExheWVyID0gKDxvbC5sYXllci5MYXllcj5sYXllcik7XG4gICAgICAgIGxldCBuZXdMYXllciA9IHRoaXMuX2NyZWF0ZUxheWVyKG9sZExheWVyLmdldChVVUlEKSwgb2xkTGF5ZXIuZ2V0VmlzaWJsZSgpLCBvbGRMYXllci5nZXRPcGFjaXR5KCksIG5ld1NvdXJjZSwgb2xkTGF5ZXIuZ2V0KFRJVExFKSk7XG4gICAgICAgIHJldHVybiBuZXdMYXllcjtcbiAgICB9XG5cblxuICAgIHByaXZhdGUgc2V0TG9hZEV2ZW50cyhzb3VyY2U6IG9sLnNvdXJjZS5JbWFnZVdNUykge1xuICAgICAgICBpZiAodGhpcy51c2VMb2FkRXZlbnRzKSB7XG4gICAgICAgICAgICAvLyBzb3VyY2Uuc2V0SW1hZ2VMb2FkRnVuY3Rpb24odGhpcy5pbWFnZUxvYWRGdW5jdGlvbi5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIHNvdXJjZS5vbignaW1hZ2Vsb2Fkc3RhcnQnLCB0aGlzLmltYWdlTG9hZFN0YXJ0LmJpbmQodGhpcykpO1xuICAgICAgICAgICAgc291cmNlLm9uKCdpbWFnZWxvYWRlbmQnLCB0aGlzLmltYWdlTG9hZEVuZC5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIHNvdXJjZS5vbignaW1hZ2Vsb2FkZXJyb3InLCB0aGlzLmltYWdlTG9hZEVycm9yLmJpbmQodGhpcykpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaW1hZ2VMb2FkU3RhcnQoZTogb2wuc291cmNlLkltYWdlRXZlbnQpIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ3N0YXJ0JywgKDxvbC5zb3VyY2UuSW1hZ2VXTVM+ZS50YXJnZXQpLmdldChMQVlFUl9VVUlEKSk7XG4gICAgICAgIGlmIChPbDRXbXNTb3VyY2UubWFwQWN0aXZpdHkpIHtcbiAgICAgICAgICAgIE9sNFdtc1NvdXJjZS5tYXBBY3Rpdml0eS5sb2FkU3RhcnQoKDxvbC5zb3VyY2UuSW1hZ2VXTVM+ZS50YXJnZXQpLmdldChMQVlFUl9VVUlEKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpbWFnZUxvYWRFbmQoZTogb2wuc291cmNlLkltYWdlRXZlbnQpIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ2VuZCcsICg8b2wuc291cmNlLkltYWdlV01TPmUudGFyZ2V0KS5nZXQoTEFZRVJfVVVJRCkpO1xuICAgICAgICBpZiAoT2w0V21zU291cmNlLm1hcEFjdGl2aXR5KSB7XG4gICAgICAgICAgICBPbDRXbXNTb3VyY2UubWFwQWN0aXZpdHkubG9hZEVuZCgoPG9sLnNvdXJjZS5JbWFnZVdNUz5lLnRhcmdldCkuZ2V0KExBWUVSX1VVSUQpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGltYWdlTG9hZEVycm9yKGU6IG9sLnNvdXJjZS5JbWFnZUV2ZW50KSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdlcnJvcicsICg8b2wuc291cmNlLkltYWdlV01TPmUudGFyZ2V0KS5nZXQoTEFZRVJfVVVJRCkpO1xuICAgICAgICBpZiAoT2w0V21zU291cmNlLm1hcEFjdGl2aXR5KSB7XG4gICAgICAgICAgICBPbDRXbXNTb3VyY2UubWFwQWN0aXZpdHkubG9hZEVycm9yKCg8b2wuc291cmNlLkltYWdlV01TPmUudGFyZ2V0KS5nZXQoTEFZRVJfVVVJRCkpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBsYXllciA9IHRoaXMub2w0TWFwLmZpbmRMYXllcigoPG9sLnNvdXJjZS5JbWFnZVdNUz5lLnRhcmdldCkuZ2V0KExBWUVSX1VVSUQpKTtcbiAgICAgICAgdGhpcy5hZGREaXNhYmxlZChsYXllcik7XG4gICAgfVxuXG59XG5cbmV4cG9ydCBjbGFzcyBNYXBBY3Rpdml0eSB7XG4gICAgcHJpdmF0ZSBzdGF0aWMgX2luc3RhbmNlOiBNYXBBY3Rpdml0eTtcbiAgICBwcml2YXRlIGxheWVyczogYW55ID0ge307XG4gICAgcHJpdmF0ZSBpc0xvYWRpbmc6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgIHByaXZhdGUgY29uc3RydWN0b3IoKSB7XG4gICAgfVxuXG4gICAgc3RhdGljIGNyZWF0ZSgpOiBNYXBBY3Rpdml0eSB7XG4gICAgICAgIGlmICghTWFwQWN0aXZpdHkuX2luc3RhbmNlKSB7Ly8gc2luZ2xldG9uXG4gICAgICAgICAgICBNYXBBY3Rpdml0eS5faW5zdGFuY2UgPSBuZXcgTWFwQWN0aXZpdHkoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gTWFwQWN0aXZpdHkuX2luc3RhbmNlO1xuICAgIH1cblxuICAgIHByaXZhdGUgYWN0aXZpdHlTdGFydChsYXllck5hbWU6IHN0cmluZykge1xuICAgICAgICB0aGlzLmxheWVyc1tsYXllck5hbWVdID0gdHJ1ZTtcbiAgICAgICAgaWYgKHRoaXMuaXNMb2FkaW5nID09PSBmYWxzZSkge1xuICAgICAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgd2luZG93WydtZXRhZG9yJ10ucHJlbG9hZGVyU3RhcnQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYWN0aXZpdHlFbmQobGF5ZXJOYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgaWYgKHRoaXMubGF5ZXJzW2xheWVyTmFtZV0pIHtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLmxheWVyc1tsYXllck5hbWVdO1xuICAgICAgICB9XG4gICAgICAgIGZvciAobGV0IGxheWVyTiBpbiB0aGlzLmxheWVycykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XG4gICAgICAgIHdpbmRvd1snbWV0YWRvciddLnByZWxvYWRlclN0b3AoKTtcbiAgICB9XG5cbiAgICBsb2FkU3RhcnQobGF5ZXJOYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5hY3Rpdml0eVN0YXJ0KGxheWVyTmFtZSk7XG4gICAgfVxuXG4gICAgbG9hZEVuZChsYXllck5hbWU6IHN0cmluZykge1xuICAgICAgICB0aGlzLmFjdGl2aXR5RW5kKGxheWVyTmFtZSk7XG4gICAgfVxuXG4gICAgbG9hZEVycm9yKGxheWVyTmFtZTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuYWN0aXZpdHlFbmQobGF5ZXJOYW1lKTtcbiAgICB9XG59XG4iLCJleHBvcnQgY2xhc3MgRUVsZW1lbnQge1xuICAgIHByaXZhdGUgX2VsZW1lbnQ6IEhUTUxFbGVtZW50O1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQ6IEhUTUxFbGVtZW50KXtcbiAgICAgICAgdGhpcy5fZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgfVxuXG4gICAgZ2V0IGVsZW1lbnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9lbGVtZW50O1xuICAgIH1cblxuICAgIHNldEF0dHJzKGF0dHJzOiBPYmplY3QgPSB7fSkge1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBhdHRycykge1xuICAgICAgICAgICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoa2V5LCBhdHRyc1trZXldKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzZXRBdHRyKGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKGtleSwgdmFsdWUpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgZ2V0QXR0cihrZXk6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gdGhpcy5fZWxlbWVudC5nZXRBdHRyaWJ1dGUoa2V5KTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBkb20ge1xuICAgIC8vIHByaXZhdGUgc3RhdGljIGRhdGEgPSBkYXRhO1xuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gdGFnbmFtZVxuICAgICAqIEBwYXJhbSBvcHRpb25zXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fVxuICAgICAqL1xuICAgIHN0YXRpYyBjcmVhdGUodGFnbmFtZTogc3RyaW5nLCBhdHRyczogYW55ID0ge30sIGNsYXNzZXM6IHN0cmluZ1tdID0gW10sIHRleHQ6IHN0cmluZyA9ICcnLCBkYXRhOiBhbnkgPSB7fSk6IEhUTUxFbGVtZW50IHtcbiAgICAgICAgbGV0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZ25hbWUpO1xuICAgICAgICByZXR1cm4gZG9tLmFkZChlbGVtZW50LCBhdHRycywgY2xhc3NlcywgdGV4dCwgZGF0YSk7XG4gICAgfVxuXG4gICAgc3RhdGljIGFkZChlbGVtZW50OiBIVE1MRWxlbWVudCwgYXR0cnM6IGFueSA9IHt9LCBjbGFzc2VzOiBzdHJpbmdbXSA9IFtdLCB0ZXh0OiBzdHJpbmcgPSAnJywgZGF0YTogYW55ID0ge30pOiBIVE1MRWxlbWVudCB7XG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIGF0dHJzKSB7XG4gICAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShrZXksIGF0dHJzW2tleV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChjb25zdCBuYW1lIG9mIGNsYXNzZXMpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChuYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGV4dCAhPT0gJycpIHtcbiAgICAgICAgICAgIGVsZW1lbnQudGV4dENvbnRlbnQgPSB0ZXh0O1xuICAgICAgICB9XG4gICAgICAgIC8vIGZvciAoY29uc3Qga2V5IGluIGRhdGEpIHtcbiAgICAgICAgLy8gICAgIGVsZW1lbnQuZGF0YXNldFtrZXldID0gZGF0YVtrZXldO1xuICAgICAgICAvLyB9XG5cbiAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gc2VsZWN0b3JcbiAgICAgKiBAcmV0dXJucyB7Tm9kZUxpc3RPZjxFbGVtZW50Pn1cbiAgICAgKi9cbiAgICBzdGF0aWMgZmluZChzZWxlY3Rvcjogc3RyaW5nLCBjb250ZXh0OiBhbnkgPSBkb2N1bWVudCk6IE5vZGVMaXN0T2Y8RWxlbWVudD4ge1xuICAgICAgICBpZiAoY29udGV4dCBpbnN0YW5jZW9mIERvY3VtZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gY29udGV4dC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgICAgICAgfSBlbHNlIGlmIChjb250ZXh0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBjb250ZXh0LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7IC8vIFRPRE8gcmV0dXJuIGEgYmxhbmsgTm9kZUxpc3RPZjxFbGVtZW50PlxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gc2VsZWN0b3JcbiAgICAgKiBAcmV0dXJucyB7RWxlbWVudHxudWxsfVxuICAgICAqL1xuICAgIHN0YXRpYyBmaW5kRmlyc3Qoc2VsZWN0b3I6IHN0cmluZywgY29udGV4dDogYW55ID0gZG9jdW1lbnQpOiBFbGVtZW50IHtcbiAgICAgICAgaWYgKGNvbnRleHQgaW5zdGFuY2VvZiBEb2N1bWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGNvbnRleHQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgICAgIH0gZWxzZSBpZiAoY29udGV4dCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gY29udGV4dC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZWxlbWVudFxuICAgICAqIEBwYXJhbSBuYW1lXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgYW4gZWxlbWVudCBjb250YWlucyBhIGNsYXNzIG5hbWVcbiAgICAgKi9cbiAgICBzdGF0aWMgaGFzQ2xhc3MoZWxlbWVudDogSFRNTEVsZW1lbnQsIG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gZWxlbWVudCAhPT0gbnVsbCAmJiBlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhuYW1lKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZWxlbWVudFxuICAgICAqIEBwYXJhbSBuYW1lXG4gICAgICogQHJldHVybnMge0VsZW1lbnR9XG4gICAgICovXG4gICAgc3RhdGljIGFkZENsYXNzKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBuYW1lOiBzdHJpbmcpOiBIVE1MRWxlbWVudCB8IG51bGwge1xuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQobmFtZSk7XG4gICAgICAgIHJldHVybiBlbGVtZW50O1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBwYXJhbSBlbGVtZW50XG4gICAgICogQHBhcmFtIG5hbWVcbiAgICAgKiBAcmV0dXJucyB7RWxlbWVudH1cbiAgICAgKi9cbiAgICBzdGF0aWMgcmVtb3ZlQ2xhc3MoZWxlbWVudDogSFRNTEVsZW1lbnQsIG5hbWU6IHN0cmluZyk6IEhUTUxFbGVtZW50IHwgbnVsbCB7XG4gICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShuYW1lKTtcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0gbmFtZVxuICAgICAqIEByZXR1cm5zIHtFbGVtZW50fVxuICAgICAqL1xuICAgIHN0YXRpYyB0b2dnbGVDbGFzcyhlbGVtZW50OiBFbGVtZW50LCBuYW1lOiBzdHJpbmcpOiBFbGVtZW50IHwgbnVsbCB7XG4gICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShuYW1lKTtcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgfVxuXG4gICAgLy9cbiAgICAvLyAvKipcbiAgICAvLyAgKiBSZXR1cm5zIHdpdGggZWxlbWVudCBiaW5kZWQgZGF0YS5cbiAgICAvLyAgKiBAcGFyYW0gZWxlbWVudFxuICAgIC8vICAqIEBwYXJhbSBrZXlcbiAgICAvLyAgKiBAcmV0dXJucyB7YW55fVxuICAgIC8vICAqL1xuICAgIC8vIHN0YXRpYyBnZXREYXRhKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBrZXk6IHN0cmluZyA9IG51bGwpOiBhbnkge1xuICAgIC8vICAgICBpZiAoIWRvbS5oYXNEYXRhKGVsZW1lbnQsIGtleSkpIHtcbiAgICAvLyAgICAgICAgIHJldHVybiBudWxsO1xuICAgIC8vICAgICB9IGVsc2UgaWYgKGtleSA9PT0gbnVsbCkge1xuICAgIC8vICAgICAgICAgcmV0dXJuIGRvbS5kYXRhLmdldChlbGVtZW50KTtcbiAgICAvLyAgICAgfSBlbHNlIHtcbiAgICAvLyAgICAgICAgIHJldHVybiBkb20uZGF0YS5nZXQoZWxlbWVudClba2V5XTtcbiAgICAvLyAgICAgfVxuICAgIC8vIH1cbiAgICAvL1xuICAgIC8vIC8qKlxuICAgIC8vICAqIEJpbmRzIHdpdGggYW4gZWxlbWVudCBhIGRhdGEuXG4gICAgLy8gICogQHBhcmFtIGVsZW1lbnRcbiAgICAvLyAgKiBAcGFyYW0ga2V5XG4gICAgLy8gICogQHBhcmFtIHZhbHVlXG4gICAgLy8gICovXG4gICAgLy8gc3RhdGljIHNldERhdGEoZWxlbWVudDogSFRNTEVsZW1lbnQsIGtleTogc3RyaW5nLCB2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgLy8gICAgIGlmICghZG9tLmhhc0RhdGEoZWxlbWVudCkpIHtcbiAgICAvLyAgICAgICAgIGRvbS5kYXRhLnNldChlbGVtZW50LCB7a2V5OiB2YWx1ZX0pO1xuICAgIC8vICAgICB9IGVsc2Uge1xuICAgIC8vICAgICAgICAgbGV0IHRtcCA9IGRvbS5nZXREYXRhKGVsZW1lbnQpO1xuICAgIC8vICAgICAgICAgdG1wW2tleV0gPSB2YWx1ZTtcbiAgICAvLyAgICAgICAgIGRvbS5kYXRhLnNldChlbGVtZW50LCB0bXApO1xuICAgIC8vICAgICB9XG4gICAgLy8gfVxuICAgIC8vXG4gICAgLy8gLyoqXG4gICAgLy8gICogQ2hlY2tzIGlmIHRoZSBlbGVtZW50IGlzIGJpbmRpbmcgd2l0aCBhIGRhdGFcbiAgICAvLyAgKiBAcGFyYW0gZWxlbWVudFxuICAgIC8vICAqIEBwYXJhbSBrZXlcbiAgICAvLyAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAvLyAgKi9cbiAgICAvLyBzdGF0aWMgaGFzRGF0YShlbGVtZW50OiBIVE1MRWxlbWVudCwga2V5OiBzdHJpbmcgPSBudWxsKTogYm9vbGVhbiB7XG4gICAgLy8gICAgIGlmICghZG9tLmRhdGEuaGFzKGVsZW1lbnQpKSB7XG4gICAgLy8gICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgLy8gICAgIH0gZWxzZSBpZiAoa2V5ID09PSBudWxsKSB7XG4gICAgLy8gICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAvLyAgICAgfSBlbHNlIHtcbiAgICAvLyAgICAgICAgIHJldHVybiBkb20uZ2V0RGF0YShlbGVtZW50KVtrZXldICE9PSBudWxsID8gdHJ1ZSA6IGZhbHNlO1xuICAgIC8vICAgICB9XG4gICAgLy8gfVxuICAgIC8vXG4gICAgLy8gLyoqXG4gICAgLy8gICogRGVsZXRlcyB3aXRoIGFuIGVsZW1lbnQgYmluZGluZyBkYXRhXG4gICAgLy8gICogQHBhcmFtIGVsZW1lbnRcbiAgICAvLyAgKiBAcGFyYW0ga2V5XG4gICAgLy8gICovXG4gICAgLy8gc3RhdGljIGRlbGV0ZURhdGEoZWxlbWVudDogSFRNTEVsZW1lbnQsIGtleTogc3RyaW5nID0gbnVsbCk6IHZvaWQge1xuICAgIC8vICAgICBpZiAoZG9tLmhhc0RhdGEoZWxlbWVudCwga2V5KSkge1xuICAgIC8vICAgICAgICAgaWYgKGtleSA9PT0gbnVsbCkge1xuICAgIC8vICAgICAgICAgICAgIGRvbS5kYXRhLmRlbGV0ZShlbGVtZW50KTtcbiAgICAvLyAgICAgICAgIH0gZWxzZSB7XG4gICAgLy8gICAgICAgICAgICAgbGV0IHRtcCA9IGRvbS5nZXREYXRhKGVsZW1lbnQpO1xuICAgIC8vICAgICAgICAgICAgIGRlbGV0ZSB0bXBba2V5XTtcbiAgICAvLyAgICAgICAgICAgICBkb20uZGF0YS5zZXQoZWxlbWVudCwgdG1wKTtcbiAgICAvLyAgICAgICAgIH1cbiAgICAvLyAgICAgfVxuICAgIC8vIH1cbn0iLCJpbXBvcnQgKiBhcyBtZXRhZG9yIGZyb20gJy4vT2w0JztcblxuZGVjbGFyZSB2YXIgQ29uZmlndXJhdGlvbjogYW55O1xuXG5sZXQgY29udGV4dDogYW55ID0gd2luZG93O1xuY29udGV4dC5zcGF0aWFsID0gbWV0YWRvcjtcblxuZXhwb3J0IGZ1bmN0aW9uIGluaXQoKSB7XG5cbiAgICB2YXIgbWV0YWRvck1hcENvbmZpZyA9IHtcbiAgICAgICAgbWFwOiB7XG4gICAgICAgICAgICB0YXJnZXQ6ICdtYXAnLFxuICAgICAgICAgICAgc3JzOiBbXCJFUFNHOjQzMjZcIiwgXCJFUFNHOjMxNDY2XCIsIFwiRVBTRzoyNTgzMlwiXVxuICAgICAgICB9LFxuICAgICAgICB2aWV3OiB7XG4gICAgICAgICAgICBwcm9qZWN0aW9uOiBDb25maWd1cmF0aW9uLnNldHRpbmdzWydtYXBfY3JzJ10sLy8nOiAnOSw0OSwxMSw1MycsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdcbiAgICAgICAgICAgIG1heEV4dGVudDogQ29uZmlndXJhdGlvbi5zZXR0aW5nc1snbWFwX2Jib3hfbWF4J10uc3BsaXQoLyxcXHM/LyksLy9bNS44LCA0Ny4wLCAxNS4wLCA1NS4wXSwgLy8gcHJpb3JpdHkgZm9yIHNjYWxlcyBvciBmb3IgbWF4RXh0ZW50P1xuICAgICAgICAgICAgc3RhcnRFeHRlbnQ6IENvbmZpZ3VyYXRpb24uc2V0dGluZ3NbJ21hcF9iYm94X3N0YXJ0J10uc3BsaXQoLyxcXHM/LyksXG4gICAgICAgICAgICBzY2FsZXM6IFs1MDAwLCAyNTAwMCwgNTAwMDAsIDEwMDAwMCwgMjAwMDAwLCAyNTAwMDAsIDUwMDAwMCwgMTAwMDAwMCwgMjAwMDAwMCwgNTAwMDAwMCwgMTAwMDAwMDBdLy8sIDIwMDAwMDAwLCA1MDAwMDAwMF1cbiAgICAgICAgfSxcbiAgICAgICAgc3R5bGVzOiB7XG4gICAgICAgICAgICBoaWdobGlnaHQ6IHtcbiAgICAgICAgICAgICAgICBmaWxsOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiAncmdiYSg2MCwgNjAsIDI1NSwgMC4xKSdcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHN0cm9rZToge1xuICAgICAgICAgICAgICAgICAgICBjb2xvcjogJ3JnYmEoNjAsIDYwLCAyNTUsIDEuMCknLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogMlxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZWFyY2g6IHtcbiAgICAgICAgICAgICAgICBmaWxsOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiAncmdiYSgyNTUsIDYwLCA2MCwgMC4xKSdcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHN0cm9rZToge1xuICAgICAgICAgICAgICAgICAgICBjb2xvcjogJ3JnYmEoMjU1LCA2MCwgNjAsIDEuMCknLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogMlxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgaW1hZ2U6IHtcbiAgICAgICAgICAgICAgICAgICAgY2lyY2xlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByYWRpdXM6IDUsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxsOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6ICdyZ2JhKDI1NSwgNjAsIDYwLCAwLjYpJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBzb3VyY2U6IFtdLFxuICAgICAgICAvLyBhZGQgYWRkaXRpb25hbCBwYXJhbWV0ZXJzIHdpdGggKyBcIkFERElUSU9OQUxcIlxuICAgICAgICBwcm9qNERlZnM6IHtcbiAgICAgICAgICAgIFwiRVBTRzo0MzI2XCI6IFwiK3Byb2o9bG9uZ2xhdCArZGF0dW09V0dTODQgK3VuaXRzPWRlZ3JlZXMgK25vX2RlZnNcIiArIFwiICtheGlzPW5ldVwiLFxuICAgICAgICAgICAgXCJFUFNHOjQyNThcIjogXCIrcHJvaj1sb25nbGF0ICtlbGxwcz1HUlM4MCArdG93Z3M4ND0wLDAsMCwwLDAsMCwwICtub19kZWZzXCIgKyBcIiArdW5pdHM9ZGVncmVlcyArYXhpcz1uZXVcIixcbiAgICAgICAgICAgIFwiRVBTRzozMTQ2NlwiOiBcIitwcm9qPXRtZXJjICtsYXRfMD0wICtsb25fMD02ICtrPTEgK3hfMD0yNTAwMDAwICt5XzA9MCArZWxscHM9YmVzc2VsICt0b3dnczg0PTU5OC4xLDczLjcsNDE4LjIsMC4yMDIsMC4wNDUsLTIuNDU1LDYuNyArdW5pdHM9bSArbm9fZGVmc1wiICsgXCIgK2F4aXM9bmV1XCIsXG4gICAgICAgICAgICBcIkVQU0c6MzE0NjdcIjogXCIrcHJvaj10bWVyYyArbGF0XzA9MCArbG9uXzA9OSAraz0xICt4XzA9MzUwMDAwMCAreV8wPTAgK2VsbHBzPWJlc3NlbCArdG93Z3M4ND01OTguMSw3My43LDQxOC4yLDAuMjAyLDAuMDQ1LC0yLjQ1NSw2LjcgK3VuaXRzPW0gK25vX2RlZnNcIiArIFwiICtheGlzPW5ldVwiLFxuICAgICAgICAgICAgLy8gXCJFUFNHOjMxNDY4XCI6IFwiK3Byb2o9dG1lcmMgK2xhdF8wPTAgK2xvbl8wPTEyICtrPTEgK3hfMD00NTAwMDAwICt5XzA9MCArZWxscHM9YmVzc2VsICt0b3dnczg0PTU5OC4xLDczLjcsNDE4LjIsMC4yMDIsMC4wNDUsLTIuNDU1LDYuNyArdW5pdHM9bSArbm9fZGVmc1wiICsgXCIgK2F4aXM9bmV1XCIsXG4gICAgICAgICAgICAvLyBcIkVQU0c6MzE0NjlcIjogXCIrcHJvaj10bWVyYyArbGF0XzA9MCArbG9uXzA9MTUgK2s9MSAreF8wPTU1MDAwMDAgK3lfMD0wICtlbGxwcz1iZXNzZWwgK3Rvd2dzODQ9NTk4LjEsNzMuNyw0MTguMiwwLjIwMiwwLjA0NSwtMi40NTUsNi43ICt1bml0cz1tICtub19kZWZzXCIgKyBcIiArYXhpcz1uZXVcIixcbiAgICAgICAgICAgIFwiRVBTRzoyNTgzMlwiOiBcIitwcm9qPXV0bSArem9uZT0zMiArZWxscHM9R1JTODAgK3Rvd2dzODQ9MCwwLDAsMCwwLDAsMCArdW5pdHM9bSArbm9fZGVmc1wiLFxuICAgICAgICAgICAgLy8gXCJFUFNHOjI1ODMzXCI6IFwiK3Byb2o9dXRtICt6b25lPTMzICtlbGxwcz1HUlM4MCArdG93Z3M4ND0wLDAsMCwwLDAsMCwwICt1bml0cz1tICtub19kZWZzXCJcbiAgICAgICAgfSxcbiAgICAgICAgY29tcG9uZW50OiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY2xhc3M6ICcnLFxuICAgICAgICAgICAgICAgIHNlbGVjdG9yOiBcIlwiXG4gICAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICB9O1xuXG4gICAgLy8gY29uc29sZS5sb2coQ29uZmlndXJhdGlvbik7XG4gICAgZm9yIChjb25zdCBrZXkgaW4gQ29uZmlndXJhdGlvbi5jb25maWcubWFwX2JhY2tncm91bmQpIHtcbiAgICAgICAgbGV0IHdtcyA9IENvbmZpZ3VyYXRpb24uY29uZmlnLm1hcF9iYWNrZ3JvdW5kW2tleV07XG4gICAgICAgIGxldCBsYXllcnMgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBsIGluIHdtcy5sYXllcnMpIHtcbiAgICAgICAgICAgIGxheWVycy5wdXNoKHdtcy5sYXllcnNbbF0pO1xuICAgICAgICB9XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHdtcyk7XG4gICAgICAgIG1ldGFkb3JNYXBDb25maWcuc291cmNlLnB1c2goe1xuICAgICAgICAgICAgJ3R5cGUnOiAnV01TJyxcbiAgICAgICAgICAgICd1cmwnOiB3bXMudXJsLFxuICAgICAgICAgICAgJ3RpdGxlJzogd21zLnRpdGxlLFxuICAgICAgICAgICAgJ29wYWNpdHknOiB3bXMub3BhY2l0eSxcbiAgICAgICAgICAgICd2aXNpYmxlJzogd21zLnZpc2libGUsXG4gICAgICAgICAgICAncGFyYW1zJzoge1xuICAgICAgICAgICAgICAgICdMQVlFUlMnOiBsYXllcnMuam9pbihcIixcIiksXG4gICAgICAgICAgICAgICAgJ1ZFUlNJT04nOiB3bXMudmVyc2lvbixcbiAgICAgICAgICAgICAgICAnRk9STUFUJzogd21zLmZvcm1hdFxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLy8gY29uc29sZS5sb2cobWV0YWRvck1hcENvbmZpZyk7XG4gICAgbGV0IG1ldGFkb3JNYXAgPSBtZXRhZG9yLk9sNE1hcC5jcmVhdGUobWV0YWRvck1hcENvbmZpZyk7XG4gICAgLy8gbWV0YWRvck1hcC5pbml0TGF5ZXJ0cmVlKCk7XG4gICAgY29udGV4dC5zcGF0aWFsWydtYXAnXSA9IG1ldGFkb3JNYXA7XG4gICAgLy8gbWV0YWRvclsnbWV0YWRvck1hcCddID0gbWV0YWRvck1hcDtcbiAgICAvLyBtZXRhZG9yWydnZW9tTG9hZGVyJ10gPSBuZXcgbWV0YWRvci5HZW9tTG9hZGVyKG1ldGFkb3JNYXAsIDxIVE1MRm9ybUVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2ZpbGUtdXBsb2FkLWZvcm0nKSk7XG59XG5pbml0KCk7Il19
