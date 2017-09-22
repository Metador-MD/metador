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
    }
    FeatureInfo.prototype.activate = function (tooltipElm, callbackSelect, callbackUnSelect, callbackUnSelectAll) {
        this.callbackSelect = callbackSelect;
        this.callbackUnSelect = callbackUnSelect;
        this.callbackUnSelectAll = callbackUnSelectAll;
        this.olMap.on('click', this.mapClick, this);
        this.tooltipElm = tooltipElm;
        this.tooltipElm.addEventListener('click', this.itemClick.bind(this), false);
        this.tooltip = new ol.Overlay({
            element: this.tooltipElm,
            offset: [0, -6],
            positioning: 'bottom-center'
        });
        this.olMap.addOverlay(this.tooltip);
    };
    FeatureInfo.prototype.deactivate = function () {
        this.callbackUnSelectAll();
        this.callbackSelect = null;
        this.callbackUnSelect = null;
        this.callbackUnSelectAll = null;
        this.tooltipElm.removeEventListener('click', this.itemClick.bind(this));
        this.tooltipElm.remove();
        this.olMap.removeOverlay(this.tooltip);
        this.olMap.un('click', this.mapClick, this);
    };
    FeatureInfo.prototype.itemClick = function (e) {
        if (e.target.tagName === FeatureInfo.itemTagName.toUpperCase()) {
            var tag = e.target;
            if (!dom_1.dom.hasClass(tag, '-js-tooltip-item')) {
                dom_1.dom.addClass(this.tooltipElm, 'hidden');
            }
            else {
                this.selectDataset(tag.getAttribute(FeatureInfo.dataAttrName(FeatureInfo.keyId)));
            }
        }
        else {
            e.stopPropagation();
        }
    };
    FeatureInfo.dataAttrName = function (name) {
        return 'data-' + name;
    };
    FeatureInfo.prototype.mapClick = function (e) {
        dom_1.dom.remove('.-js-tooltip-item', this.tooltipElm);
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
            this.callbackUnSelectAll();
            dom_1.dom.addClass(this.tooltipElm, 'hidden');
        }
        else if (features.length === 1) {
            dom_1.dom.addClass(this.tooltipElm, 'hidden');
            this.selectDataset(features[0].get(FeatureInfo.keyId));
        }
        else {
            for (var _i = 0, features_1 = features; _i < features_1.length; _i++) {
                var feature = features_1[_i];
                var title = feature.get(FeatureInfo.keyTitle);
                var attrs = {
                    dataAttr: feature.get(FeatureInfo.keyId),
                    title: title
                };
                attrs[FeatureInfo.dataAttrName(FeatureInfo.keyId)] = feature.get(FeatureInfo.keyId);
                this.tooltipElm.appendChild(dom_1.dom.create(FeatureInfo.itemTagName, attrs, ['-js-tooltip-item'], title));
            }
            this.tooltip.setPosition(e.coordinate);
            dom_1.dom.removeClass(this.tooltipElm, 'hidden');
        }
    };
    FeatureInfo.prototype.selectDataset = function (selector) {
        this.callbackUnSelectAll();
        this.callbackSelect(selector);
    };
    FeatureInfo.prototype.unSelectDataset = function (selector) {
        this.callbackUnSelect(selector);
    };
    FeatureInfo.keyId = 'uuid';
    FeatureInfo.keyTitle = 'title';
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
        if (this.currentLayer && e.target !== undefined && this.currentLayer !== e.target) {
            try {
                this.tree.insertBefore(this.currentLayer, e.target.draggable ? e.target : e.target.parentElement);
            }
            catch (e) {
            }
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
    Ol4Map.prototype.activateFeatureInfo = function (tooltipElm, callbackSelect, callbackUnSelect, callbackUnSelectAll) {
        this.featureInfo.activate(tooltipElm, callbackSelect, callbackUnSelect, callbackUnSelectAll);
    };
    Ol4Map.prototype.deactivateFeatureInfo = function () {
        this.featureInfo.deactivate();
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
    Ol4Map.prototype.getFirstGeomForSearch = function () {
        var features = this.drawer.getLayer().getSource().getFeatures();
        if (features.length === 0) {
            return null;
        }
        var geojson = new ol.format.GeoJSON().writeFeatureObject(features[0], {
            'dataProjection': exports.METADOR_EPSG,
            'featureProjection': this.getProjection()
        });
        geojson['bbox'] = new Ol4Geom(features[0].getGeometry(), this.getProjection())
            .getExtent(ol.proj.get(exports.METADOR_EPSG));
        return geojson;
    };
    Ol4Map.prototype.drawGeometryForSearch = function (geoJson, onDrawEnd) {
        if (onDrawEnd === void 0) { onDrawEnd = null; }
        var ol4map = this;
        var olMap = this.olMap;
        this.vecSource.clearFeatures(this.drawer.getLayer());
        this.vecSource.showFeatures(this.drawer.getLayer(), geoJson);
        var multiPoint = Ol4Extent.fromArray(this.drawer.getLayer().getSource().getExtent(), this.olMap.getView().getProjection()).getGeom();
        var maxextent = this.maxExtent.getPolygonForExtent(this.olMap.getView().getProjection());
        if (maxextent.intersectsCoordinate(multiPoint.getPoint(0).getCoordinates())
            && maxextent.intersectsCoordinate(multiPoint.getPoint(1).getCoordinates())) {
            this.zoomToExtent(this.drawer.getLayer().getSource().getExtent());
        }
        else {
            metador.displayError('Die Geometrie ist außerhalb der räumlichen Erstreckung.');
        }
        var geoFeature = this.getFirstGeomForSearch();
        if (onDrawEnd !== null && geoFeature) {
            onDrawEnd(geoFeature);
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
    dom.remove = function (selector, context) {
        if (context === void 0) { context = document; }
        var list = dom.find(selector, context);
        for (var i = 0; i < list.length; i++) {
            list[i].remove();
        }
        return list;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvUGx1Z2lucy9XaGVyZUdyb3VwL01hcEJ1bmRsZS9SZXNvdXJjZXMvdHMvRHJhZ1pvb20udHMiLCJzcmMvUGx1Z2lucy9XaGVyZUdyb3VwL01hcEJ1bmRsZS9SZXNvdXJjZXMvdHMvRmVhdHVyZUluZm8udHMiLCJzcmMvUGx1Z2lucy9XaGVyZUdyb3VwL01hcEJ1bmRsZS9SZXNvdXJjZXMvdHMvTGF5ZXJUcmVlLnRzIiwic3JjL1BsdWdpbnMvV2hlcmVHcm91cC9NYXBCdW5kbGUvUmVzb3VyY2VzL3RzL09sNC50cyIsInNyYy9QbHVnaW5zL1doZXJlR3JvdXAvTWFwQnVuZGxlL1Jlc291cmNlcy90cy9PbDRTb3VyY2UudHMiLCJzcmMvUGx1Z2lucy9XaGVyZUdyb3VwL01hcEJ1bmRsZS9SZXNvdXJjZXMvdHMvZG9tLnRzIiwic3JjL1BsdWdpbnMvV2hlcmVHcm91cC9NYXBCdW5kbGUvUmVzb3VyY2VzL3RzL21hcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsNkJBQTBCO0FBRTFCO0lBS0ksa0JBQVksR0FBVztRQUNuQixJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQztRQUNqQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksRUFBRSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUM7WUFDeEMsU0FBUyxFQUFFO2dCQUNQLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDaEIsQ0FBQztTQUNKLENBQUMsQ0FBQztRQUNILFNBQUcsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNyRyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FB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LENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztRQUNwRCxJQUFJLEdBQUcsR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNuRCxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDaEIsR0FBRyxDQUFDLENBQUMsSUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDekIsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDL0IsQ0FBQztRQUVELGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDekIsTUFBTSxFQUFFLEtBQUs7WUFDYixLQUFLLEVBQUUsR0FBRyxDQUFDLEdBQUc7WUFDZCxPQUFPLEVBQUUsR0FBRyxDQUFDLEtBQUs7WUFDbEIsU0FBUyxFQUFFLEdBQUcsQ0FBQyxPQUFPO1lBQ3RCLFNBQVMsRUFBRSxHQUFHLENBQUMsT0FBTztZQUN0QixRQUFRLEVBQUU7Z0JBQ04sUUFBUSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO2dCQUMxQixTQUFTLEVBQUUsR0FBRyxDQUFDLE9BQU87Z0JBQ3RCLFFBQVEsRUFBRSxHQUFHLENBQUMsTUFBTTthQUN2QjtTQUNKLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBRXpELE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsVUFBVSxDQUFDO0FBR3hDLENBQUM7QUF4RkQsb0JBd0ZDO0FBQ0QsSUFBSSxFQUFFLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IHtkb219IGZyb20gJy4vZG9tJztcblxuZXhwb3J0IGNsYXNzIERyYWdab29tIHtcbiAgICBwcml2YXRlIHN0YXRpYyBidXR0b25TZWxlY3Rvcjogc3RyaW5nID0gJy4tanMtem9vbS1ib3gnO1xuICAgIHByaXZhdGUgZHJhZ3pvb206IG9sLmludGVyYWN0aW9uLkRyYWdab29tO1xuICAgIHByaXZhdGUgb2xNYXA6IG9sLk1hcDtcblxuICAgIGNvbnN0cnVjdG9yKG1hcDogb2wuTWFwKSB7XG4gICAgICAgIHRoaXMub2xNYXAgPSBtYXA7XG4gICAgICAgIHRoaXMuZHJhZ3pvb20gPSBuZXcgb2wuaW50ZXJhY3Rpb24uRHJhZ1pvb20oe1xuICAgICAgICAgICAgY29uZGl0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBkb20uZmluZEZpcnN0KERyYWdab29tLmJ1dHRvblNlbGVjdG9yKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuYnV0dG9uQ2xpY2suYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgICAgICB0aGlzLmRyYWd6b29tLm9uKCdib3hlbmQnLCB0aGlzLmRlYWN0aXZhdGUuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBidXR0b25DbGljayhlKSB7XG4gICAgICAgIGlmICghZG9tLmhhc0NsYXNzKGUudGFyZ2V0LCAnc3VjY2VzcycpKSB7XG4gICAgICAgICAgICB0aGlzLmFjdGl2YXRlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmRlYWN0aXZhdGUoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYWN0aXZhdGUoKSB7XG4gICAgICAgIGRvbS5hZGRDbGFzcyg8SFRNTEVsZW1lbnQ+ZG9tLmZpbmRGaXJzdChEcmFnWm9vbS5idXR0b25TZWxlY3RvciksICdzdWNjZXNzJyk7XG4gICAgICAgIHRoaXMub2xNYXAuYWRkSW50ZXJhY3Rpb24odGhpcy5kcmFnem9vbSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBkZWFjdGl2YXRlKCkge1xuICAgICAgICBkb20ucmVtb3ZlQ2xhc3MoPEhUTUxFbGVtZW50PmRvbS5maW5kRmlyc3QoRHJhZ1pvb20uYnV0dG9uU2VsZWN0b3IpLCAnc3VjY2VzcycpO1xuICAgICAgICB0aGlzLm9sTWFwLnJlbW92ZUludGVyYWN0aW9uKHRoaXMuZHJhZ3pvb20pO1xuICAgIH1cbn0iLCJpbXBvcnQge1VVSUR9IGZyb20gJy4vT2w0JztcbmltcG9ydCB7ZG9tfSBmcm9tICcuL2RvbSc7XG5cbmV4cG9ydCBjbGFzcyBGZWF0dXJlSW5mbyB7XG4gICAgcHJpdmF0ZSBzdGF0aWMga2V5SWQ6IHN0cmluZyA9ICd1dWlkJztcbiAgICBwcml2YXRlIHN0YXRpYyBrZXlUaXRsZTogc3RyaW5nID0gJ3RpdGxlJztcbiAgICBwcml2YXRlIHN0YXRpYyBpdGVtVGFnTmFtZTogc3RyaW5nID0gJ3NwYW4nO1xuICAgIHByaXZhdGUgb2xNYXA6IG9sLk1hcDtcbiAgICBwcml2YXRlIHRvb2x0aXA6IG9sLk92ZXJsYXk7XG4gICAgcHJpdmF0ZSB0b29sdGlwRWxtOiBIVE1MRWxlbWVudDtcbiAgICBwcml2YXRlIGxheWVyOiBvbC5sYXllci5WZWN0b3I7XG4gICAgcHJpdmF0ZSBjYWxsYmFja1NlbGVjdDogRnVuY3Rpb247XG4gICAgcHJpdmF0ZSBjYWxsYmFja1VuU2VsZWN0OiBGdW5jdGlvbjtcbiAgICBwcml2YXRlIGNhbGxiYWNrVW5TZWxlY3RBbGw6IEZ1bmN0aW9uO1xuXG4gICAgY29uc3RydWN0b3IobWFwOiBvbC5NYXAsIGxheWVyOiBvbC5sYXllci5WZWN0b3IgPSBudWxsKSB7XG4gICAgICAgIHRoaXMub2xNYXAgPSBtYXA7XG4gICAgICAgIHRoaXMubGF5ZXIgPSBsYXllcjtcbiAgICB9XG5cbiAgICBwdWJsaWMgYWN0aXZhdGUodG9vbHRpcEVsbTogSFRNTEVsZW1lbnQsIGNhbGxiYWNrU2VsZWN0OiBGdW5jdGlvbiwgY2FsbGJhY2tVblNlbGVjdDogRnVuY3Rpb24sIGNhbGxiYWNrVW5TZWxlY3RBbGw6IEZ1bmN0aW9uKSB7XG4gICAgICAgIHRoaXMuY2FsbGJhY2tTZWxlY3QgPSBjYWxsYmFja1NlbGVjdDtcbiAgICAgICAgdGhpcy5jYWxsYmFja1VuU2VsZWN0ID0gY2FsbGJhY2tVblNlbGVjdDtcbiAgICAgICAgdGhpcy5jYWxsYmFja1VuU2VsZWN0QWxsID0gY2FsbGJhY2tVblNlbGVjdEFsbDtcbiAgICAgICAgdGhpcy5vbE1hcC5vbignY2xpY2snLCB0aGlzLm1hcENsaWNrLCB0aGlzKTtcbiAgICAgICAgdGhpcy50b29sdGlwRWxtID0gdG9vbHRpcEVsbTtcbiAgICAgICAgdGhpcy50b29sdGlwRWxtLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5pdGVtQ2xpY2suYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgICAgICB0aGlzLnRvb2x0aXAgPSBuZXcgb2wuT3ZlcmxheSh7XG4gICAgICAgICAgICBlbGVtZW50OiB0aGlzLnRvb2x0aXBFbG0sXG4gICAgICAgICAgICBvZmZzZXQ6IFswLCAtNl0sXG4gICAgICAgICAgICBwb3NpdGlvbmluZzogJ2JvdHRvbS1jZW50ZXInXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLm9sTWFwLmFkZE92ZXJsYXkodGhpcy50b29sdGlwKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZGVhY3RpdmF0ZSgpIHtcbiAgICAgICAgdGhpcy5jYWxsYmFja1VuU2VsZWN0QWxsKCk7XG4gICAgICAgIHRoaXMuY2FsbGJhY2tTZWxlY3QgPSBudWxsO1xuICAgICAgICB0aGlzLmNhbGxiYWNrVW5TZWxlY3QgPSBudWxsO1xuICAgICAgICB0aGlzLmNhbGxiYWNrVW5TZWxlY3RBbGwgPSBudWxsO1xuICAgICAgICB0aGlzLnRvb2x0aXBFbG0ucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLml0ZW1DbGljay5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy50b29sdGlwRWxtLnJlbW92ZSgpO1xuICAgICAgICB0aGlzLm9sTWFwLnJlbW92ZU92ZXJsYXkodGhpcy50b29sdGlwKTtcbiAgICAgICAgdGhpcy5vbE1hcC51bignY2xpY2snLCB0aGlzLm1hcENsaWNrLCB0aGlzKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGl0ZW1DbGljayhlOiBFdmVudCkge1xuICAgICAgICBpZiAoKDxhbnk+ZS50YXJnZXQpLnRhZ05hbWUgPT09IEZlYXR1cmVJbmZvLml0ZW1UYWdOYW1lLnRvVXBwZXJDYXNlKCkpIHtcbiAgICAgICAgICAgIGxldCB0YWcgPSAoPEhUTUxFbGVtZW50PmUudGFyZ2V0KTtcbiAgICAgICAgICAgIGlmICghZG9tLmhhc0NsYXNzKHRhZywgJy1qcy10b29sdGlwLWl0ZW0nKSkge1xuICAgICAgICAgICAgICAgIGRvbS5hZGRDbGFzcyh0aGlzLnRvb2x0aXBFbG0sICdoaWRkZW4nKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3REYXRhc2V0KHRhZy5nZXRBdHRyaWJ1dGUoRmVhdHVyZUluZm8uZGF0YUF0dHJOYW1lKEZlYXR1cmVJbmZvLmtleUlkKSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIGRhdGFBdHRyTmFtZShuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuICdkYXRhLScgKyBuYW1lO1xuICAgIH1cblxuICAgIHByaXZhdGUgbWFwQ2xpY2soZTogb2wuTWFwQnJvd3NlckV2ZW50KSB7XG4gICAgICAgIC8vIHRoaXMudG9vbHRpcEVsbS5pbm5lckhUTUwgPSAnPHNwYW4gY2xhc3M9XCJpY29uLXBsdXMtY2lyY2xlXCIgc3R5bGU9XCJwb3NpdGlvbjphYnNvbHV0ZTtyaWdodDoycHg7dG9wOjJweDtcIj48L3NwYW4+JztcbiAgICAgICAgZG9tLnJlbW92ZSgnLi1qcy10b29sdGlwLWl0ZW0nLCB0aGlzLnRvb2x0aXBFbG0pO1xuICAgICAgICBsZXQgbGF5ID0gdGhpcy5sYXllcjtcbiAgICAgICAgbGV0IGZlYXR1cmVzOiBvbC5GZWF0dXJlW10gPSBuZXcgQXJyYXk8b2wuRmVhdHVyZT4oKTtcbiAgICAgICAgdGhpcy5vbE1hcC5mb3JFYWNoRmVhdHVyZUF0UGl4ZWwoZS5waXhlbCwgZnVuY3Rpb24gKGZlYXR1cmU6IG9sLkZlYXR1cmUpIHtcbiAgICAgICAgICAgIGZlYXR1cmVzLnB1c2goZmVhdHVyZSk7XG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGxheWVyRmlsdGVyOiBmdW5jdGlvbiAobGF5ZXIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbGF5ZXIuZ2V0KFVVSUQpID09PSBsYXkuZ2V0KFVVSUQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGZlYXR1cmVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgdGhpcy5jYWxsYmFja1VuU2VsZWN0QWxsKCk7XG4gICAgICAgICAgICBkb20uYWRkQ2xhc3ModGhpcy50b29sdGlwRWxtLCAnaGlkZGVuJyk7XG4gICAgICAgIH0gZWxzZSBpZiAoZmVhdHVyZXMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICBkb20uYWRkQ2xhc3ModGhpcy50b29sdGlwRWxtLCAnaGlkZGVuJyk7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdERhdGFzZXQoZmVhdHVyZXNbMF0uZ2V0KEZlYXR1cmVJbmZvLmtleUlkKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3IgKGxldCBmZWF0dXJlIG9mIGZlYXR1cmVzKSB7XG4gICAgICAgICAgICAgICAgbGV0IHRpdGxlID0gZmVhdHVyZS5nZXQoRmVhdHVyZUluZm8ua2V5VGl0bGUpO1xuICAgICAgICAgICAgICAgIGxldCBhdHRycyA9IHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YUF0dHI6IGZlYXR1cmUuZ2V0KEZlYXR1cmVJbmZvLmtleUlkKSxcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IHRpdGxlXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBhdHRyc1tGZWF0dXJlSW5mby5kYXRhQXR0ck5hbWUoRmVhdHVyZUluZm8ua2V5SWQpXSA9IGZlYXR1cmUuZ2V0KEZlYXR1cmVJbmZvLmtleUlkKTtcbiAgICAgICAgICAgICAgICB0aGlzLnRvb2x0aXBFbG0uYXBwZW5kQ2hpbGQoZG9tLmNyZWF0ZShGZWF0dXJlSW5mby5pdGVtVGFnTmFtZSwgYXR0cnMsIFsnLWpzLXRvb2x0aXAtaXRlbSddLCB0aXRsZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy50b29sdGlwLnNldFBvc2l0aW9uKGUuY29vcmRpbmF0ZSk7XG4gICAgICAgICAgICBkb20ucmVtb3ZlQ2xhc3ModGhpcy50b29sdGlwRWxtLCAnaGlkZGVuJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHNlbGVjdERhdGFzZXQoc2VsZWN0b3I6IHN0cmluZykge1xuICAgICAgICB0aGlzLmNhbGxiYWNrVW5TZWxlY3RBbGwoKTtcbiAgICAgICAgdGhpcy5jYWxsYmFja1NlbGVjdChzZWxlY3Rvcik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB1blNlbGVjdERhdGFzZXQoc2VsZWN0b3I6IHN0cmluZykge1xuICAgICAgICB0aGlzLmNhbGxiYWNrVW5TZWxlY3Qoc2VsZWN0b3IpO1xuICAgIH1cbn0iLCJpbXBvcnQge2RvbX0gZnJvbSAnLi9kb20nO1xuaW1wb3J0IHtPbDRNYXAsIFRJVExFLCBVVUlEfSBmcm9tIFwiLi9PbDRcIjtcblxuLy8gaW1wb3J0ICogYXMgJCBmcm9tICdqcXVlcnknO1xuXG5leHBvcnQgY2xhc3MgTGF5ZXJUcmVlIHtcbiAgICBwcml2YXRlIHN0YXRpYyBfaW5zdGFuY2U6IExheWVyVHJlZTtcbiAgICBwcml2YXRlIHN0YXRpYyBtYXhsZW5ndGg6IG51bWJlciA9IDE2O1xuICAgIHByaXZhdGUgc3RhdGljIHRyZWVzZWxlY3Rvcjogc3RyaW5nID0gJy4tanMtbWFwLWxheWVydHJlZSB1bC5sYXllci10cmVlLWxpc3QnO1xuICAgIHByaXZhdGUgc3RhdGljIGR1bW15c2VsZWN0b3I6IHN0cmluZyA9ICcuLWpzLWR1bW15LWxheWVyJztcbiAgICBwcml2YXRlIHN0YXRpYyB1c2VPcGFjaXR5OiBib29sZWFuID0gdHJ1ZTtcbiAgICBwcml2YXRlIHN0YXRpYyB1c2VWaXNpYmxlOiBib29sZWFuID0gdHJ1ZTtcbiAgICBwcml2YXRlIHN0YXRpYyB1c2VTb3J0YWJsZTogYm9vbGVhbiA9IHRydWU7XG4gICAgcHJpdmF0ZSBzdGF0aWMgc2hvd1N0YXR1czogYm9vbGVhbiA9IHRydWU7XG4gICAgcHJpdmF0ZSBvbDRNYXA6IE9sNE1hcDtcbiAgICBwcml2YXRlIHRyZWU6IEhUTUxFbGVtZW50O1xuICAgIHByaXZhdGUgY3VycmVudExheWVyID0gbnVsbDtcbiAgICBwcml2YXRlIG9sZFBvc2l0aW9uID0gMDtcblxuICAgIHByaXZhdGUgY29uc3RydWN0b3Iob2w0TWFwOiBPbDRNYXApIHtcbiAgICAgICAgdGhpcy5vbDRNYXAgPSBvbDRNYXA7XG4gICAgICAgIHRoaXMudHJlZSA9IDxIVE1MRWxlbWVudD5kb20uZmluZEZpcnN0KExheWVyVHJlZS50cmVlc2VsZWN0b3IpO1xuICAgICAgICBpZiAoTGF5ZXJUcmVlLnVzZVNvcnRhYmxlKSB7XG4gICAgICAgICAgICBsZXQgZHVtbXkgPSBkb20uZmluZEZpcnN0KExheWVyVHJlZS5kdW1teXNlbGVjdG9yLCB0aGlzLnRyZWUpO1xuICAgICAgICAgICAgdGhpcy5hZGREcmFnZ2FibGUoPEhUTUxFbGVtZW50PmR1bW15LCB0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBjcmVhdGUob2w0TWFwOiBPbDRNYXApOiBMYXllclRyZWUge1xuICAgICAgICBpZiAoIUxheWVyVHJlZS5faW5zdGFuY2UpIHsvLyBzaW5nbGV0b25cbiAgICAgICAgICAgIExheWVyVHJlZS5faW5zdGFuY2UgPSBuZXcgTGF5ZXJUcmVlKG9sNE1hcCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIExheWVyVHJlZS5faW5zdGFuY2U7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBmaW5kTGF5ZXJJdGVtKGxheWVyOiBvbC5sYXllci5CYXNlKTogSFRNTEVsZW1lbnQge1xuICAgICAgICByZXR1cm4gPEhUTUxFbGVtZW50PmRvbS5maW5kRmlyc3QoJyMnICsgbGF5ZXIuZ2V0KFVVSUQpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGZpbmRMYXllclZpc2libGUobGF5ZXI6IG9sLmxheWVyLkJhc2UpOiBIVE1MRm9ybUVsZW1lbnQge1xuICAgICAgICByZXR1cm4gPEhUTUxGb3JtRWxlbWVudD5kb20uZmluZEZpcnN0KCcjJyArIGxheWVyLmdldChVVUlEKSArICcgLi1qcy1tYXAtc291cmNlLXZpc2libGUnKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGZpbmRMYXllck9wYWNpdHkobGF5ZXI6IG9sLmxheWVyLkJhc2UpOiBIVE1MRm9ybUVsZW1lbnQge1xuICAgICAgICByZXR1cm4gPEhUTUxGb3JtRWxlbWVudD5kb20uZmluZEZpcnN0KCcjJyArIGxheWVyLmdldChVVUlEKSArICcgLi1qcy1tYXAtc291cmNlLW9wYWNpdHknKTtcbiAgICB9XG5cbiAgICBnZXRWaXNpYmxlKGxheWVyOiBvbC5sYXllci5CYXNlKSB7XG4gICAgICAgIGxldCBjaGVja2JveCA9IHRoaXMuZmluZExheWVyVmlzaWJsZShsYXllcik7XG4gICAgICAgIHJldHVybiBjaGVja2JveC5jaGVja2VkO1xuICAgIH1cblxuICAgIHNldFZpc2libGUobGF5ZXI6IG9sLmxheWVyLkJhc2UsIHZpc2libGU6IGJvb2xlYW4sIGFjdGlvbjogYm9vbGVhbiA9IGZhbHNlKSB7XG4gICAgICAgIGxldCBjaGVja2JveCA9IHRoaXMuZmluZExheWVyVmlzaWJsZShsYXllcik7XG4gICAgICAgIGlmIChjaGVja2JveC5jaGVja2VkICE9PSB2aXNpYmxlICYmICFhY3Rpb24pIHtcbiAgICAgICAgICAgIGNoZWNrYm94LmNoZWNrZWQgPSB2aXNpYmxlO1xuICAgICAgICB9IGVsc2UgaWYgKGNoZWNrYm94LmNoZWNrZWQgIT09IHZpc2libGUgJiYgYWN0aW9uKSB7XG4gICAgICAgICAgICBjaGVja2JveC5jbGljaygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2V0RGlzYWJsZShsYXllcjogb2wubGF5ZXIuQmFzZSwgZGlzYWJsZTogYm9vbGVhbikge1xuICAgICAgICBsZXQgaXRlbSA9IHRoaXMuZmluZExheWVySXRlbShsYXllcik7XG4gICAgICAgIGxldCBjaGVja2JveFZpc2libGUgPSB0aGlzLmZpbmRMYXllclZpc2libGUobGF5ZXIpO1xuICAgICAgICBsZXQgc2VsZWN0T3BhY2l0eSA9IHRoaXMuZmluZExheWVyT3BhY2l0eShsYXllcik7XG4gICAgICAgIGlmIChkaXNhYmxlKSB7XG4gICAgICAgICAgICBkb20uYWRkQ2xhc3MoaXRlbSwgJ2Rpc2FibGVkJyk7XG4gICAgICAgICAgICBjaGVja2JveFZpc2libGUuc2V0QXR0cmlidXRlKCdkaXNhYmxlZCcsICd0cnVlJyk7XG4gICAgICAgICAgICBzZWxlY3RPcGFjaXR5LnNldEF0dHJpYnV0ZSgnZGlzYWJsZWQnLCAndHJ1ZScpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkb20ucmVtb3ZlQ2xhc3MoaXRlbSwgJ2Rpc2FibGVkJyk7XG4gICAgICAgICAgICBjaGVja2JveFZpc2libGUucmVtb3ZlQXR0cmlidXRlKCdkaXNhYmxlZCcpO1xuICAgICAgICAgICAgc2VsZWN0T3BhY2l0eS5yZW1vdmVBdHRyaWJ1dGUoJ2Rpc2FibGVkJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHN1YnN0cmluZ1RpdGxlKHRleHQ6IHN0cmluZykge1xuICAgICAgICBpZiAodGV4dC5sZW5ndGggPiBMYXllclRyZWUubWF4bGVuZ3RoKSB7XG4gICAgICAgICAgICB0ZXh0ID0gdGV4dC5zdWJzdHJpbmcoMCwgTGF5ZXJUcmVlLm1heGxlbmd0aCk7XG4gICAgICAgICAgICBpZiAodGV4dC5sYXN0SW5kZXhPZignICcpID4gMCkge1xuICAgICAgICAgICAgICAgIHRleHQgPSB0ZXh0LnN1YnN0cmluZygwLCB0ZXh0Lmxhc3RJbmRleE9mKCcgJykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0ZXh0O1xuICAgIH1cblxuICAgIHJlbW92ZShsYXllcjogb2wubGF5ZXIuQmFzZSkge1xuICAgICAgICBsZXQgbGF5ZXJOb2RlID0gdGhpcy5maW5kTGF5ZXJJdGVtKGxheWVyKTtcbiAgICAgICAgaWYgKGxheWVyTm9kZSkge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVEcmFnZ2FibGUoPEhUTUxFbGVtZW50PmxheWVyTm9kZSk7XG4gICAgICAgICAgICBsYXllck5vZGUucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhZGQobGF5ZXI6IG9sLmxheWVyLkJhc2UpIHtcbiAgICAgICAgbGV0IGxheWVyTm9kZSA9IGRvbS5jcmVhdGUoJ2xpJywgeydpZCc6IGxheWVyLmdldChVVUlEKSwgJ2RyYWdnYWJsZSc6IFwidHJ1ZVwifSwgWydkcmFnZ2FibGUnLCAnLWpzLWRyYWdnYWJsZSddKTtcbiAgICAgICAgaWYgKExheWVyVHJlZS51c2VWaXNpYmxlKSB7XG4gICAgICAgICAgICB0aGlzLmFkZFZpc2libGUobGF5ZXJOb2RlLCBsYXllcik7XG4gICAgICAgIH1cbiAgICAgICAgbGF5ZXJOb2RlLmFwcGVuZENoaWxkKFxuICAgICAgICAgICAgZG9tLmNyZWF0ZSgnbGFiZWwnLFxuICAgICAgICAgICAgICAgIHsnaWQnOiBsYXllci5nZXQoVVVJRCksICdmb3InOiAnY2hiLScgKyBsYXllci5nZXQoVVVJRCksICd0aXRsZSc6IGxheWVyLmdldChUSVRMRSl9LFxuICAgICAgICAgICAgICAgIFsnZm9ybS1sYWJlbCddLCB0aGlzLnN1YnN0cmluZ1RpdGxlKGxheWVyLmdldChUSVRMRSkpKVxuICAgICAgICApO1xuICAgICAgICBpZiAoTGF5ZXJUcmVlLnVzZU9wYWNpdHkpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkT3BhY2l0eShsYXllck5vZGUsIGxheWVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudHJlZS5pbnNlcnRCZWZvcmUobGF5ZXJOb2RlLCBkb20uZmluZEZpcnN0KCdsaScsIHRoaXMudHJlZSkpO1xuICAgICAgICBpZiAoTGF5ZXJUcmVlLnVzZVNvcnRhYmxlKSB7XG4gICAgICAgICAgICB0aGlzLmFkZERyYWdnYWJsZShsYXllck5vZGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhZGRWaXNpYmxlKGxheWVyTm9kZTogSFRNTEVsZW1lbnQsIGxheWVyOiBvbC5sYXllci5CYXNlKSB7XG4gICAgICAgIGxldCBpbnB1dCA9IGRvbS5jcmVhdGUoJ2lucHV0Jywgeyd0eXBlJzogJ2NoZWNrYm94J30sXG4gICAgICAgICAgICBbJ2NoZWNrJywgJy1qcy1tYXAtc291cmNlLXZpc2libGUnXSk7XG4gICAgICAgICg8SFRNTEZvcm1FbGVtZW50PmlucHV0KS5jaGVja2VkID0gbGF5ZXIuZ2V0VmlzaWJsZSgpO1xuICAgICAgICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCB0aGlzLmNoYW5nZVZpc2libGUuYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgICAgICBsYXllck5vZGUuYXBwZW5kQ2hpbGQoaW5wdXQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgY2hhbmdlVmlzaWJsZShlKSB7XG4gICAgICAgIHRoaXMub2w0TWFwLnNldFZpc2libGUoZS50YXJnZXQucGFyZW50RWxlbWVudC5pZCwgZS50YXJnZXQuY2hlY2tlZCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhZGRPcGFjaXR5KGxheWVyTm9kZTogSFRNTEVsZW1lbnQsIGxheWVyOiBvbC5sYXllci5CYXNlKTogdm9pZCB7XG4gICAgICAgIGxldCBzZWxlY3QgPSBkb20uY3JlYXRlKCdzZWxlY3QnLCB7fSxcbiAgICAgICAgICAgIFsnaW5wdXQtZWxlbWVudCcsICdtZWRpdW0nLCAnc2ltcGxlJywgJ21hcC1zb3VyY2Utb3BhY2l0eScsICctanMtbWFwLXNvdXJjZS1vcGFjaXR5J10pO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDw9IDEwOyBpKyspIHtcbiAgICAgICAgICAgIHNlbGVjdC5hcHBlbmRDaGlsZChkb20uY3JlYXRlKCdvcHRpb24nLCB7J3ZhbHVlJzogaSAvIDEwfSwgW10sIChpICogMTApICsgJyAlJykpO1xuICAgICAgICB9XG4gICAgICAgICg8SFRNTEZvcm1FbGVtZW50PnNlbGVjdCkudmFsdWUgPSBsYXllci5nZXRPcGFjaXR5KCkudG9TdHJpbmcoKTtcbiAgICAgICAgc2VsZWN0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIHRoaXMuY2hhbmdlT3BhY2l0eS5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgICAgIGxheWVyTm9kZS5hcHBlbmRDaGlsZChzZWxlY3QpO1xuICAgIH1cblxuICAgIHByaXZhdGUgY2hhbmdlT3BhY2l0eShlKSB7XG4gICAgICAgIHRoaXMub2w0TWFwLnNldE9wYWNpdHkoZS50YXJnZXQucGFyZW50RWxlbWVudC5pZCwgcGFyc2VGbG9hdChlLnRhcmdldC52YWx1ZSkpO1xuICAgIH1cblxuICAgIHByaXZhdGUgYWRkRHJhZ2dhYmxlKGxheWVyOiBIVE1MRWxlbWVudCwgaXNEdW1teTogYm9vbGVhbiA9IGZhbHNlKSB7XG4gICAgICAgIGlmICghaXNEdW1teSkge1xuICAgICAgICAgICAgbGF5ZXIuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ3N0YXJ0JywgdGhpcy5kcmFnU3RhcnQuYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgICAgICAgICAgbGF5ZXIuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ2VuZCcsIHRoaXMuZHJhZ0VuZC5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgICAgbGF5ZXIuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ2VudGVyJywgdGhpcy5kcmFnRW50ZXIuYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgICAgICBsYXllci5hZGRFdmVudExpc3RlbmVyKCdkcmFnb3ZlcicsIHRoaXMuZHJhZ092ZXIuYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgICAgICBsYXllci5hZGRFdmVudExpc3RlbmVyKCdkcm9wJywgdGhpcy5kcmFnRHJvcC5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW1vdmVEcmFnZ2FibGUobGF5ZXI6IEhUTUxFbGVtZW50LCBpc0R1bW15OiBib29sZWFuID0gZmFsc2UpIHtcbiAgICAgICAgaWYgKCFpc0R1bW15KSB7XG4gICAgICAgICAgICBsYXllci5yZW1vdmVFdmVudExpc3RlbmVyKCdkcmFnc3RhcnQnLCB0aGlzLmRyYWdTdGFydC5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgICAgICAgICBsYXllci5yZW1vdmVFdmVudExpc3RlbmVyKCdkcmFnZW5kJywgdGhpcy5kcmFnRW5kLmJpbmQodGhpcyksIGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgICBsYXllci5yZW1vdmVFdmVudExpc3RlbmVyKCdkcmFnZW50ZXInLCB0aGlzLmRyYWdFbnRlci5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgICAgIGxheWVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2RyYWdvdmVyJywgdGhpcy5kcmFnT3Zlci5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgICAgIGxheWVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCB0aGlzLmRyYWdEcm9wLmJpbmQodGhpcyksIGZhbHNlKTtcbiAgICB9XG5cblxuICAgIHByaXZhdGUgZHJhZ1N0YXJ0KGUpIHtcbiAgICAgICAgdGhpcy5jdXJyZW50TGF5ZXIgPSBlLnRhcmdldDtcbiAgICAgICAgdGhpcy5vbGRQb3NpdGlvbiA9IHRoaXMuZ2V0TGF5ZXJQb3NpdGlvbih0aGlzLmN1cnJlbnRMYXllcik7XG4gICAgICAgIGUuZGF0YVRyYW5zZmVyLmVmZmVjdEFsbG93ZWQgPSAnbW92ZSc7XG4gICAgICAgIGUuZGF0YVRyYW5zZmVyLnNldERhdGEoJ3RleHQvaHRtbCcsIHRoaXMuY3VycmVudExheWVyLmlubmVySFRNTCk7XG4gICAgICAgIGRvbS5hZGRDbGFzcyh0aGlzLmN1cnJlbnRMYXllciwgXCJtb3ZlXCIpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZHJhZ092ZXIoZSkge1xuICAgICAgICBpZiAoZS5wcmV2ZW50RGVmYXVsdCkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgICAgIGUuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3QgPSAnbW92ZSc7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGRyYWdFbnRlcihlKSB7XG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRMYXllciAmJiBlLnRhcmdldCAhPT0gdW5kZWZpbmVkICYmIHRoaXMuY3VycmVudExheWVyICE9PSBlLnRhcmdldCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB0aGlzLnRyZWUuaW5zZXJ0QmVmb3JlKFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRMYXllcixcbiAgICAgICAgICAgICAgICAgICAgZS50YXJnZXQuZHJhZ2dhYmxlID8gZS50YXJnZXQgOiBlLnRhcmdldC5wYXJlbnRFbGVtZW50XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgZHJhZ0Ryb3AoZSkge1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGRvbS5yZW1vdmVDbGFzcyhlLnRhcmdldCwgXCJvdmVyXCIpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZHJhZ0VuZChlKSB7XG4gICAgICAgIGRvbS5yZW1vdmVDbGFzcyhlLnRhcmdldCwgXCJtb3ZlXCIpO1xuICAgICAgICB0aGlzLm9sNE1hcC5tb3ZlTGF5ZXIodGhpcy5jdXJyZW50TGF5ZXIuaWQsIHRoaXMub2xkUG9zaXRpb24sIHRoaXMuZ2V0TGF5ZXJQb3NpdGlvbih0aGlzLmN1cnJlbnRMYXllcikpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0TGF5ZXJQb3NpdGlvbihsYXllcikge1xuICAgICAgICBsZXQgbGlzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy4tanMtbWFwLWxheWVydHJlZSB1bCAuLWpzLWRyYWdnYWJsZScpO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChsaXN0W2ldLmlkID09PSBsYXllci5pZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBsaXN0Lmxlbmd0aCAtIDEgLSBpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cbiIsImltcG9ydCAqIGFzIG9sNCBmcm9tICdvcGVubGF5ZXJzJzsvLyA/Pz9cbi8vIGltcG9ydCAqIGFzIGpxdWVyeSBmcm9tICdqcXVlcnknOyAvL2Vycm9yIGluIGluZGV4LmQudHMgZm9yIEB0eXBlcy9qcXVlcnlcbmltcG9ydCB7TGF5ZXJUcmVlfSBmcm9tICcuL0xheWVyVHJlZSc7XG5pbXBvcnQge0RyYWdab29tfSBmcm9tICcuL0RyYWdab29tJztcbmltcG9ydCB7T2w0U291cmNlLCBPbDRWZWN0b3JTb3VyY2UsIE9sNFdtc1NvdXJjZX0gZnJvbSBcIi4vT2w0U291cmNlXCJcbmltcG9ydCB7RmVhdHVyZUluZm99IGZyb20gXCIuL0ZlYXR1cmVJbmZvXCI7XG5cbmRlY2xhcmUgY2xhc3MgcHJvajQge1xuICAgIHN0YXRpYyBkZWZzKG5hbWU6IHN0cmluZywgZGVmOiBzdHJpbmcpOiB2b2lkO1xufVxuXG4vLyBkZWNsYXJlIGZ1bmN0aW9uIGFkZFNvdXJjZShpZDogc3RyaW5nLCB0aXRsZTogc3RyaW5nLCB2aXNpYmlsaXR5OiBib29sZWFuLCBvcGFjaXR5OiBudW1iZXIpOiB2b2lkO1xuZXhwb3J0IGNsYXNzIE9sNFV0aWxzIHtcbiAgICAvKiBcbiAgICAgKiB1bml0czogJ2RlZ3JlZXMnfCdmdCd8J20nfCd1cy1mdCdcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHJlc29sdXRpb25TY2FsZUZhY3Rvcih1bml0czogc3RyaW5nKTogbnVtYmVyIHtcbiAgICAgICAgbGV0IGRwaSA9IDI1LjQgLyAwLjI4O1xuICAgICAgICBsZXQgbXB1ID0gb2wucHJvai5NRVRFUlNfUEVSX1VOSVRbdW5pdHNdO1xuICAgICAgICBsZXQgaW5jaGVzUGVyTWV0ZXIgPSAzOS4zNztcbiAgICAgICAgcmV0dXJuIG1wdSAqIGluY2hlc1Blck1ldGVyICogZHBpO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgcmVzb2x1dGlvbkZvclNjYWxlKHNjYWxlOiBudW1iZXIsIGZhY3RvcjogbnVtYmVyKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHNjYWxlIC8gZmFjdG9yO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgcmVzb2x1dGlvbnNGb3JTY2FsZXMoc2NhbGVzOiBudW1iZXJbXSwgdW5pdHM6IHN0cmluZyk6IG51bWJlcltdIHtcbiAgICAgICAgbGV0IHJlc29sdXRpb25zID0gW107XG4gICAgICAgIGxldCBmYWN0b3IgPSBPbDRVdGlscy5yZXNvbHV0aW9uU2NhbGVGYWN0b3IodW5pdHMpO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNjYWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcmVzb2x1dGlvbnMucHVzaChPbDRVdGlscy5yZXNvbHV0aW9uRm9yU2NhbGUoc2NhbGVzW2ldLCBmYWN0b3IpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzb2x1dGlvbnM7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBzY2FsZUZvclJlc29sdXRpb24ocmVzb2x1dGlvbjogbnVtYmVyLCBmYWN0b3I6IG51bWJlcik6IG51bWJlciB7XG4gICAgICAgIHJldHVybiByZXNvbHV0aW9uICogZmFjdG9yO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgc2NhbGVzRm9yUmVzb2x1dGlvbnMocmVzb2x1dGlvbnM6IG51bWJlcltdLCB1bml0czogc3RyaW5nKTogbnVtYmVyW10ge1xuICAgICAgICBsZXQgc2NhbGVzID0gW107XG4gICAgICAgIGxldCBmYWN0b3IgPSBPbDRVdGlscy5yZXNvbHV0aW9uU2NhbGVGYWN0b3IodW5pdHMpO1xuICAgICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgcmVzb2x1dGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHNjYWxlcy5wdXNoKE9sNFV0aWxzLnNjYWxlRm9yUmVzb2x1dGlvbihyZXNvbHV0aW9uc1tpXSwgZmFjdG9yKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNjYWxlcztcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGluaXRQcm9qNERlZnMocHJvajREZWZzOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgZm9yIChjb25zdCBuYW1lIGluIHByb2o0RGVmcykge1xuICAgICAgICAgICAgcHJvajQuZGVmcyhuYW1lLCBwcm9qNERlZnNbbmFtZV0pO1xuICAgICAgICAgICAgbGV0IHByID0gb2wucHJvai5nZXQobmFtZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGdldFByb2oocHJvakNvZGU6IHN0cmluZyk6IG9sLnByb2ouUHJvamVjdGlvbiB7XG4gICAgICAgIHJldHVybiBvbC5wcm9qLmdldChwcm9qQ29kZSk7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBnZXRTdHlsZShvcHRpb25zOiBhbnksIHN0eWxlOiBvbC5zdHlsZS5TdHlsZSA9IG51bGwpOiBvbC5zdHlsZS5TdHlsZSB7XG4gICAgICAgIGxldCBzdHlsZV8gPSBzdHlsZSA/IHN0eWxlIDogbmV3IG9sLnN0eWxlLlN0eWxlKCk7XG4gICAgICAgIHN0eWxlXy5zZXRGaWxsKG5ldyBvbC5zdHlsZS5GaWxsKG9wdGlvbnNbJ2ZpbGwnXSkpO1xuICAgICAgICBzdHlsZV8uc2V0U3Ryb2tlKG5ldyBvbC5zdHlsZS5TdHJva2Uob3B0aW9uc1snc3Ryb2tlJ10pKTtcbiAgICAgICAgaWYgKG9wdGlvbnNbJ2ltYWdlJ10gJiYgb3B0aW9uc1snaW1hZ2UnXVsnY2lyY2xlJ10pIHtcbiAgICAgICAgICAgIHN0eWxlXy5zZXRJbWFnZShuZXcgb2wuc3R5bGUuQ2lyY2xlKHtcbiAgICAgICAgICAgICAgICAgICAgcmFkaXVzOiBvcHRpb25zWydpbWFnZSddWydjaXJjbGUnXVsncmFkaXVzJ10sXG4gICAgICAgICAgICAgICAgICAgIGZpbGw6IG5ldyBvbC5zdHlsZS5GaWxsKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiBvcHRpb25zWydpbWFnZSddWydjaXJjbGUnXVsnZmlsbCddWydjb2xvciddXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0eWxlXztcbiAgICAgICAgLy9cbiAgICAgICAgLy8gcmV0dXJuIG5ldyBvbC5zdHlsZV8uU3R5bGUoe1xuICAgICAgICAvLyAgICAgZmlsbDogbmV3IG9sLnN0eWxlXy5GaWxsKG9wdGlvbnNbJ2ZpbGwnXSksXG4gICAgICAgIC8vICAgICBzdHJva2U6IG5ldyBvbC5zdHlsZV8uU3Ryb2tlKG9wdGlvbnNbJ3N0cm9rZSddKS8vLFxuICAgICAgICAvLyAgICAgLy8gaW1hZ2U6IG5ldyBvbC5zdHlsZV8uQ2lyY2xlKHtcbiAgICAgICAgLy8gICAgIC8vICAgICByYWRpdXM6IDcsXG4gICAgICAgIC8vICAgICAvLyAgICAgZmlsbDogbmV3IG9sLnN0eWxlXy5GaWxsKG9wdGlvbnNbJ2ZpbGwnXSlcbiAgICAgICAgLy8gICAgIC8vIH0pXG4gICAgICAgIC8vIH0pO1xuICAgIH1cblxuLy8gZmlsbFxuLy8ge1xuLy8gICAgIGNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMilcbi8vIH1cbi8vIHN0cm9rZVxuLy8ge1xuLy8gICAgIGNvbG9yOiAnI2ZmY2MzMycsXG4vLyAgICAgd2lkdGg6IDJcbi8vICAgICBkYXNoOlxuLy8gfVxuLy8gaW1hZ2Vcbn1cblxuZXhwb3J0IGNsYXNzIE9sNEdlb20ge1xuICAgIHByb3RlY3RlZCBnZW9tOiBvbC5nZW9tLkdlb21ldHJ5ID0gbnVsbDtcbiAgICBwcm90ZWN0ZWQgcHJvajogb2wucHJvai5Qcm9qZWN0aW9uID0gbnVsbDtcblxuICAgIGNvbnN0cnVjdG9yKGdlb206IG9sLmdlb20uR2VvbWV0cnksIHByb2o6IG9sLnByb2ouUHJvamVjdGlvbikge1xuICAgICAgICB0aGlzLmdlb20gPSBnZW9tO1xuICAgICAgICB0aGlzLnByb2ogPSBwcm9qO1xuICAgIH1cblxuICAgIGdldEdlb20oKTogb2wuZ2VvbS5HZW9tZXRyeSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdlb207XG4gICAgfVxuXG4gICAgZ2V0UHJvaigpOiBvbC5wcm9qLlByb2plY3Rpb24ge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9qO1xuICAgIH1cblxuICAgIGdldEV4dGVudChwcm9qOiBvbC5wcm9qLlByb2plY3Rpb24pOiBvbC5FeHRlbnQge1xuICAgICAgICBpZiAodGhpcy5wcm9qICE9PSBwcm9qKSB7XG4gICAgICAgICAgICByZXR1cm4gKDxvbC5nZW9tLkdlb21ldHJ5Pig8YW55PiB0aGlzLmdlb20pLmNsb25lKCkpLnRyYW5zZm9ybSh0aGlzLnByb2osIHByb2opLmdldEV4dGVudCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuICg8b2wuZ2VvbS5HZW9tZXRyeT4oPGFueT4gdGhpcy5nZW9tKS5jbG9uZSgpKS5nZXRFeHRlbnQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBnZXRQb2x5Z29uRm9yRXh0ZW50KHByb2o6IG9sLnByb2ouUHJvamVjdGlvbikge1xuICAgICAgICByZXR1cm4gb2wuZ2VvbS5Qb2x5Z29uLmZyb21FeHRlbnQodGhpcy5nZXRFeHRlbnQocHJvaikpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIE9sNEV4dGVudCBleHRlbmRzIE9sNEdlb20ge1xuICAgIHB1YmxpYyBzdGF0aWMgZnJvbUFycmF5KG9yZGluYXRlczogbnVtYmVyW10sIHByb2o6IG9sLnByb2ouUHJvamVjdGlvbik6IE9sNEV4dGVudCB7XG4gICAgICAgIGxldCBnZW9tID0gbmV3IG9sLmdlb20uTXVsdGlQb2ludChbW29yZGluYXRlc1swXSwgb3JkaW5hdGVzWzFdXSwgW29yZGluYXRlc1syXSwgb3JkaW5hdGVzWzNdXV0pO1xuICAgICAgICByZXR1cm4gbmV3IE9sNEV4dGVudChnZW9tLCBwcm9qKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjb25zdCBVVUlEOiBzdHJpbmcgPSAndXVpZCc7XG5leHBvcnQgY29uc3QgTEFZRVJfVVVJRDogc3RyaW5nID0gJ2xheWVydXVpZCc7XG5leHBvcnQgY29uc3QgVElUTEU6IHN0cmluZyA9ICd0aXRsZSc7XG5leHBvcnQgY29uc3QgTUVUQURPUl9FUFNHOiBvbC5Qcm9qZWN0aW9uTGlrZSA9ICdFUFNHOjQzMjYnO1xuZXhwb3J0IGNvbnN0IExBWUVSX1ZFQ1RPUiA9ICd2ZWN0b3InO1xuZXhwb3J0IGNvbnN0IExBWUVSX0lNQUdFID0gJ2ltYWdlJztcblxuZXhwb3J0IGNsYXNzIE9sNE1hcCB7XG4gICAgcHJpdmF0ZSBzdGF0aWMgX3V1aWQgPSAwO1xuICAgIHByaXZhdGUgc3RhdGljIF9pbnN0YW5jZTogT2w0TWFwID0gbnVsbDsgLy8gc2luZ2xldG9uXG4gICAgcHJpdmF0ZSBvbE1hcDogb2wuTWFwID0gbnVsbDtcbiAgICBwcml2YXRlIHNjYWxlczogbnVtYmVyW107XG4gICAgLy8gICAgcHJvdGVjdGVkIHByb2o6IG9sLnByb2ouUHJvamVjdGlvbiA9IG51bGw7XG4gICAgcHJpdmF0ZSBzdGFydEV4dGVudDogT2w0RXh0ZW50ID0gbnVsbDsgIC8vIHhtaW4sIHltaW4sIHhtYXgsIHltYXggb3B0aW9uc1snc3RhcnRFeHRlbnQnXVxuICAgIHByaXZhdGUgbWF4RXh0ZW50OiBPbDRFeHRlbnQgPSBudWxsO1xuICAgIHByaXZhdGUgZHJhd2VyOiBPbDREcmF3ZXI7XG4gICAgcHJpdmF0ZSB3bXNTb3VyY2U6IE9sNFdtc1NvdXJjZTtcbiAgICBwcml2YXRlIHZlY1NvdXJjZTogT2w0VmVjdG9yU291cmNlO1xuICAgIHByaXZhdGUgbGF5ZXJ0cmVlOiBMYXllclRyZWU7XG4gICAgcHJpdmF0ZSBzdHlsZXM6IE9iamVjdDtcbiAgICBwcml2YXRlIGhnTGF5ZXI6IG9sLmxheWVyLlZlY3RvcjtcbiAgICAvLyBwcm90ZWN0ZWQgZHJhZ3pvb206IG9sLmludGVyYWN0aW9uLkRyYWdab29tO1xuICAgIHByaXZhdGUgZHJhZ3pvb206IERyYWdab29tO1xuICAgIHByaXZhdGUgZmVhdHVyZUluZm86IEZlYXR1cmVJbmZvO1xuXG4gICAgcHJpdmF0ZSBzdGF0aWMgZ2V0VXVpZChwcmVmaXg6IHN0cmluZyA9ICcnKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHByZWZpeCArICgrK09sNE1hcC5fdXVpZCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihvcHRpb25zOiBhbnkpIHsgLy8gc2luZ2xldG9uXG4gICAgICAgIG9sWydFTkFCTEVfUkFTVEVSX1JFUFJPSkVDVElPTiddID0gZmFsc2U7XG4gICAgICAgIE9sNFV0aWxzLmluaXRQcm9qNERlZnMob3B0aW9uc1sncHJvajREZWZzJ10pO1xuICAgICAgICB0aGlzLmxheWVydHJlZSA9IExheWVyVHJlZS5jcmVhdGUodGhpcyk7XG4gICAgICAgIHRoaXMud21zU291cmNlID0gT2w0V21zU291cmNlLmNyZWF0ZSh0aGlzLCB0cnVlKTtcbiAgICAgICAgdGhpcy52ZWNTb3VyY2UgPSBPbDRWZWN0b3JTb3VyY2UuY3JlYXRlKHRoaXMpO1xuICAgICAgICAoPEhUTUxGb3JtRWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuLWpzLWNycy1jb2RlJykpLnZhbHVlID0gb3B0aW9uc1sndmlldyddWydwcm9qZWN0aW9uJ107XG4gICAgICAgIGxldCBwcm9qOiBvbC5wcm9qLlByb2plY3Rpb24gPSBvbC5wcm9qLmdldChvcHRpb25zWyd2aWV3J11bJ3Byb2plY3Rpb24nXSk7XG4gICAgICAgIHRoaXMuc3R5bGVzID0gb3B0aW9uc1snc3R5bGVzJ107XG4gICAgICAgIHRoaXMuc2NhbGVzID0gb3B0aW9uc1sndmlldyddWydzY2FsZXMnXTtcbiAgICAgICAgdGhpcy5zdGFydEV4dGVudCA9IE9sNEV4dGVudC5mcm9tQXJyYXkob3B0aW9uc1sndmlldyddWydzdGFydEV4dGVudCddLCBwcm9qKTtcbiAgICAgICAgdGhpcy5tYXhFeHRlbnQgPSBPbDRFeHRlbnQuZnJvbUFycmF5KG9wdGlvbnNbJ3ZpZXcnXVsnbWF4RXh0ZW50J10sIHByb2opO1xuICAgICAgICBsZXQgaW50ZXJhY3Rpb25zID0gb2wuaW50ZXJhY3Rpb24uZGVmYXVsdHMoXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYWx0U2hpZnREcmFnUm90YXRlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBwaW5jaFJvdGF0ZTogZmFsc2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgICAgbGV0IGNvbnRyb2xzID0gb2wuY29udHJvbC5kZWZhdWx0cyh7YXR0cmlidXRpb246IGZhbHNlfSk7Ly8uZXh0ZW5kKFthdHRyaWJ1dGlvbl0pXG4gICAgICAgIHRoaXMub2xNYXAgPSBuZXcgb2wuTWFwKHtcbiAgICAgICAgICAgIGludGVyYWN0aW9uczogaW50ZXJhY3Rpb25zLFxuICAgICAgICAgICAgdGFyZ2V0OiBvcHRpb25zWydtYXAnXVsndGFyZ2V0J10sXG4gICAgICAgICAgICByZW5kZXJlcjogJ2NhbnZhcycsXG4gICAgICAgICAgICBjb250cm9sczogY29udHJvbHNcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMub2xNYXAuc2V0VmlldyhcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlVmlldyhcbiAgICAgICAgICAgICAgICBwcm9qLFxuICAgICAgICAgICAgICAgIHRoaXMubWF4RXh0ZW50LmdldEV4dGVudChwcm9qKSxcbiAgICAgICAgICAgICAgICBPbDRVdGlscy5yZXNvbHV0aW9uc0ZvclNjYWxlcyh0aGlzLnNjYWxlcywgcHJvai5nZXRVbml0cygpKS5yZXZlcnNlKClcbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICAgICAgLyogbWFrZSBhIGdyb3VwIGxheWVyIGZvciBhbGwgaW1hZ2UgbGF5ZXJzIChXTVMgZXRjLikqL1xuICAgICAgICBsZXQgaW1hZ2VHcm91cCA9IG5ldyBvbC5sYXllci5Hcm91cCh7XG4gICAgICAgICAgICBsYXllcnM6IG5ldyBvbC5Db2xsZWN0aW9uPG9sLmxheWVyLkJhc2U+KClcbiAgICAgICAgfSk7XG4gICAgICAgIGltYWdlR3JvdXAuc2V0KFVVSUQsIExBWUVSX0lNQUdFKVxuICAgICAgICB0aGlzLm9sTWFwLmFkZExheWVyKGltYWdlR3JvdXApO1xuICAgICAgICAvKiBtYWtlIGEgZ3JvdXAgbGF5ZXIgZm9yIGFsbCB2ZWN0b3IgbGF5ZXJzIChIaWdodGxpZ2h0LCBTZWFyY2ggcmVzdWx0cyBldGMuKSovXG4gICAgICAgIGxldCB2ZWN0b3JHcm91cCA9IG5ldyBvbC5sYXllci5Hcm91cCh7XG4gICAgICAgICAgICBsYXllcnM6IG5ldyBvbC5Db2xsZWN0aW9uPG9sLmxheWVyLkJhc2U+KClcbiAgICAgICAgfSk7XG4gICAgICAgIHZlY3Rvckdyb3VwLnNldChVVUlELCBMQVlFUl9WRUNUT1IpXG4gICAgICAgIHRoaXMub2xNYXAuYWRkTGF5ZXIodmVjdG9yR3JvdXApO1xuXG4gICAgICAgIGZvciAobGV0IHNvdXJjZU9wdGlvbnMgb2Ygb3B0aW9uc1snc291cmNlJ10pIHtcbiAgICAgICAgICAgIGlmIChzb3VyY2VPcHRpb25zWyd0eXBlJ10gPT09ICdXTVMnKSB7XG4gICAgICAgICAgICAgICAgbGV0IHdtc0xheWVyID0gdGhpcy5hZGRMYXllcihcbiAgICAgICAgICAgICAgICAgICAgdGhpcy53bXNTb3VyY2UuY3JlYXRlTGF5ZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICBPbDRNYXAuZ2V0VXVpZCgnb2xheS0nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZU9wdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9sTWFwLmdldFZpZXcoKS5nZXRQcm9qZWN0aW9uKCksXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VPcHRpb25zWyd2aXNpYmxlJ10sXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJzZUZsb2F0KHNvdXJjZU9wdGlvbnNbJ29wYWNpdHknXSlcbiAgICAgICAgICAgICAgICAgICAgKSwgdHJ1ZVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3Ioc291cmNlT3B0aW9uc1sndHlwZSddICsgJyBpcyBub3Qgc3VwcG9ydGVkLicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMub2xNYXAuYWRkQ29udHJvbChuZXcgb2wuY29udHJvbC5TY2FsZUxpbmUoKSk7XG5cbiAgICAgICAgdGhpcy5vbE1hcC5hZGRDb250cm9sKG5ldyBvbC5jb250cm9sLlpvb21Ub0V4dGVudCh7XG4gICAgICAgICAgICBleHRlbnQ6IHRoaXMubWF4RXh0ZW50LmdldEV4dGVudChwcm9qKVxuICAgICAgICB9KSk7XG4gICAgICAgIHRoaXMub2xNYXAuYWRkSW50ZXJhY3Rpb24obmV3IG9sLmludGVyYWN0aW9uLkRyYWdab29tKCkpO1xuICAgICAgICB0aGlzLm9sTWFwLmFkZENvbnRyb2wobmV3IG9sLmNvbnRyb2wuTW91c2VQb3NpdGlvbihcbiAgICAgICAgICAgIC8vIHtcbiAgICAgICAgICAgIC8vICAgICBjb29yZGluYXRlRm9ybWF0OiBmdW5jdGlvbiAoY29vcmRpbmF0ZXMpIHtcbiAgICAgICAgICAgIC8vICAgICAgICAgdmFyIGNvb3JkX3ggPSBjb29yZGluYXRlc1swXS50b0ZpeGVkKDMpO1xuICAgICAgICAgICAgLy8gICAgICAgICB2YXIgY29vcmRfeSA9IGNvb3JkaW5hdGVzWzFdLnRvRml4ZWQoMyk7XG4gICAgICAgICAgICAvLyAgICAgICAgIHJldHVybiBjb29yZF94ICsgJywgJyArIGNvb3JkX3k7XG4gICAgICAgICAgICAvLyAgICAgfVxuICAgICAgICAgICAgLy8gfVxuICAgICAgICApKTtcbiAgICAgICAgdGhpcy56b29tVG9FeHRlbnQodGhpcy5zdGFydEV4dGVudC5nZXRQb2x5Z29uRm9yRXh0ZW50KHByb2opKTtcbiAgICAgICAgbGV0IGhnbCA9IHRoaXMudmVjU291cmNlLmNyZWF0ZUxheWVyKFxuICAgICAgICAgICAgT2w0TWFwLmdldFV1aWQoJ29sYXktJyksXG4gICAgICAgICAgICB7J3N0eWxlJzogT2w0VXRpbHMuZ2V0U3R5bGUodGhpcy5zdHlsZXNbJ2hpZ2hsaWdodCddKX0sXG4gICAgICAgICAgICB0aGlzLm9sTWFwLmdldFZpZXcoKS5nZXRQcm9qZWN0aW9uKClcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5oZ0xheWVyID0gPG9sLmxheWVyLlZlY3Rvcj50aGlzLmFkZExheWVyKGhnbCk7XG5cbiAgICAgICAgbGV0IHZMYXllciA9IDxvbC5sYXllci5WZWN0b3I+dGhpcy5hZGRMYXllcihcbiAgICAgICAgICAgIHRoaXMudmVjU291cmNlLmNyZWF0ZUxheWVyKFxuICAgICAgICAgICAgICAgIE9sNE1hcC5nZXRVdWlkKCdvbGF5LScpLFxuICAgICAgICAgICAgICAgIHsnc3R5bGUnOiBPbDRVdGlscy5nZXRTdHlsZSh0aGlzLnN0eWxlc1snc2VhcmNoJ10pfSxcbiAgICAgICAgICAgICAgICB0aGlzLm9sTWFwLmdldFZpZXcoKS5nZXRQcm9qZWN0aW9uKClcbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICAgICAgdkxheWVyLnNldE1hcCh0aGlzLm9sTWFwKTtcbiAgICAgICAgdGhpcy5kcmF3ZXIgPSBuZXcgT2w0RHJhd2VyKHZMYXllcik7XG4gICAgICAgIHRoaXMuZHJhZ3pvb20gPSBuZXcgRHJhZ1pvb20odGhpcy5vbE1hcCk7XG4gICAgICAgIHRoaXMuZmVhdHVyZUluZm8gPSBuZXcgRmVhdHVyZUluZm8odGhpcy5vbE1hcCwgdGhpcy5oZ0xheWVyKTtcbiAgICB9XG5cbiAgICBhY3RpdmF0ZUZlYXR1cmVJbmZvKFxuICAgICAgICB0b29sdGlwRWxtOiBIVE1MRWxlbWVudCxcbiAgICAgICAgY2FsbGJhY2tTZWxlY3Q6IEZ1bmN0aW9uLFxuICAgICAgICBjYWxsYmFja1VuU2VsZWN0OiBGdW5jdGlvbixcbiAgICAgICAgY2FsbGJhY2tVblNlbGVjdEFsbDogRnVuY3Rpb25cbiAgICApOiB2b2lkIHtcbiAgICAgICAgdGhpcy5mZWF0dXJlSW5mby5hY3RpdmF0ZSh0b29sdGlwRWxtLCBjYWxsYmFja1NlbGVjdCwgY2FsbGJhY2tVblNlbGVjdCwgY2FsbGJhY2tVblNlbGVjdEFsbCk7XG4gICAgfVxuXG4gICAgZGVhY3RpdmF0ZUZlYXR1cmVJbmZvKCk6IHZvaWQge1xuICAgICAgICB0aGlzLmZlYXR1cmVJbmZvLmRlYWN0aXZhdGUoKTtcbiAgICB9XG5cbiAgICBnZXRMYXllclRyZWUoKTogTGF5ZXJUcmVlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubGF5ZXJ0cmVlO1xuICAgIH1cblxuICAgIHByaXZhdGUgYWRkSW50b0xheWVyVHJlZShsYXllcjogb2wubGF5ZXIuQmFzZSkge1xuICAgICAgICBpZiAodGhpcy5sYXllcnRyZWUpIHtcbiAgICAgICAgICAgIHRoaXMubGF5ZXJ0cmVlLmFkZChsYXllcik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGNyZWF0ZVZpZXcocHJvajogb2wucHJvai5Qcm9qZWN0aW9uLCBleHRlbnQ6IG9sLkV4dGVudCwgcmVzb2x1dGlvbnM6IG51bWJlcltdKSB7XG4gICAgICAgIHJldHVybiBuZXcgb2wuVmlldyh7XG4gICAgICAgICAgICBwcm9qZWN0aW9uOiBwcm9qLFxuICAgICAgICAgICAgcmVzb2x1dGlvbnM6IHJlc29sdXRpb25zLFxuICAgICAgICAgICAgZXh0ZW50OiBleHRlbnRcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgem9vbVRvRXh0ZW50KGdlb21ldHJ5OiBvbC5nZW9tLlNpbXBsZUdlb21ldHJ5IHwgb2wuRXh0ZW50KSB7XG4gICAgICAgIHRoaXMub2xNYXAuZ2V0VmlldygpLmZpdChnZW9tZXRyeSwgPG9seC52aWV3LkZpdE9wdGlvbnM+dGhpcy5vbE1hcC5nZXRTaXplKCkpO1xuICAgIH1cblxuICAgIHN0YXRpYyBjcmVhdGUob3B0aW9uczogYW55KTogT2w0TWFwIHtcbiAgICAgICAgaWYgKCFPbDRNYXAuX2luc3RhbmNlKSB7Ly8gc2luZ2xldG9uXG4gICAgICAgICAgICBPbDRNYXAuX2luc3RhbmNlID0gbmV3IE9sNE1hcChvcHRpb25zKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gT2w0TWFwLl9pbnN0YW5jZTtcbiAgICB9XG5cbiAgICBnZXRQcm9qZWN0aW9uKCk6IG9sLnByb2ouUHJvamVjdGlvbiB7XG4gICAgICAgIHJldHVybiB0aGlzLm9sTWFwLmdldFZpZXcoKS5nZXRQcm9qZWN0aW9uKCk7XG4gICAgfVxuXG4gICAgZ2V0RHJhd2VyKCk6IE9sNERyYXdlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmRyYXdlcjtcbiAgICB9XG5cbiAgICBnZXRIZ0xheWVyKCk6IG9sLmxheWVyLlZlY3RvciB7XG4gICAgICAgIHJldHVybiB0aGlzLmhnTGF5ZXI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBhIGxheWVyIGludG8gYSBtYXAuXG4gICAgICogQHBhcmFtIG9wdGlvbnNcbiAgICAgKi9cbiAgICBhZGRMYXllckZvck9wdGlvbnMob3B0aW9uczogYW55KSB7XG4gICAgICAgIGlmIChvcHRpb25zWyd0eXBlJ10gPT09ICdXTVMnKSB7XG4gICAgICAgICAgICBsZXQgd21zTGF5ZXIgPSB0aGlzLmFkZExheWVyKFxuICAgICAgICAgICAgICAgIHRoaXMud21zU291cmNlLmNyZWF0ZUxheWVyKFxuICAgICAgICAgICAgICAgICAgICBPbDRNYXAuZ2V0VXVpZCgnb2xheS0nKSxcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vbE1hcC5nZXRWaWV3KCkuZ2V0UHJvamVjdGlvbigpLFxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zWyd2aXNpYmxlJ10sXG4gICAgICAgICAgICAgICAgICAgIHBhcnNlRmxvYXQob3B0aW9uc1snb3BhY2l0eSddKVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3Iob3B0aW9uc1sndHlwZSddICsgJyBpcyBub3Qgc3VwcG9ydGVkLicpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYWRkTGF5ZXIobGF5ZXI6IG9sLmxheWVyLkJhc2UsIGFkZFRvTGF5ZXJ0cmVlOiBib29sZWFuID0gZmFsc2UpOiBvbC5sYXllci5CYXNlIHtcbiAgICAgICAgaWYgKGxheWVyIGluc3RhbmNlb2Ygb2wubGF5ZXIuSW1hZ2UpIHtcbiAgICAgICAgICAgIGxldCBncm91cDogb2wubGF5ZXIuR3JvdXAgPSA8b2wubGF5ZXIuR3JvdXA+IHRoaXMuZmluZExheWVyKExBWUVSX0lNQUdFKTtcbiAgICAgICAgICAgIGdyb3VwLmdldExheWVycygpLmluc2VydEF0KGdyb3VwLmdldExheWVycygpLmdldExlbmd0aCgpLCBsYXllcik7XG4gICAgICAgIH0gZWxzZSBpZiAobGF5ZXIgaW5zdGFuY2VvZiBvbC5sYXllci5WZWN0b3IpIHtcbiAgICAgICAgICAgIGxldCBncm91cDogb2wubGF5ZXIuR3JvdXAgPSA8b2wubGF5ZXIuR3JvdXA+IHRoaXMuZmluZExheWVyKExBWUVSX1ZFQ1RPUik7XG4gICAgICAgICAgICBncm91cC5nZXRMYXllcnMoKS5pbnNlcnRBdChncm91cC5nZXRMYXllcnMoKS5nZXRMZW5ndGgoKSwgbGF5ZXIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFkZFRvTGF5ZXJ0cmVlKSB7XG4gICAgICAgICAgICB0aGlzLmFkZEludG9MYXllclRyZWUobGF5ZXIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsYXllcjtcbiAgICB9XG5cbiAgICByZW1vdmVMYXllcihsYXllcjogb2wubGF5ZXIuQmFzZSk6IHZvaWQge1xuICAgICAgICB0aGlzLm9sTWFwLnJlbW92ZUxheWVyKGxheWVyKTtcbiAgICB9XG5cbiAgICBtb3ZlTGF5ZXIodXVpZDogc3RyaW5nLCBvbGRQb3M6IG51bWJlciwgbmV3UG9zOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgbGV0IGxheWVyOiBvbC5sYXllci5CYXNlID0gdGhpcy5maW5kTGF5ZXIodXVpZCk7XG4gICAgICAgIGlmIChsYXllciBpbnN0YW5jZW9mIG9sLmxheWVyLkltYWdlKSB7XG4gICAgICAgICAgICBsZXQgZ3JvdXA6IG9sLmxheWVyLkdyb3VwID0gPG9sLmxheWVyLkdyb3VwPiB0aGlzLmZpbmRMYXllcihMQVlFUl9JTUFHRSk7XG4gICAgICAgICAgICBsZXQgbGF5ZXJsbCA9IGdyb3VwLmdldExheWVycygpLnJlbW92ZShsYXllcik7XG4gICAgICAgICAgICBncm91cC5nZXRMYXllcnMoKS5pbnNlcnRBdChuZXdQb3MsIGxheWVybGwpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZmluZExheWVyKHV1aWQ6IHN0cmluZyk6IG9sLmxheWVyLkJhc2Uge1xuICAgICAgICBsZXQgbGF5ZXJzID0gdGhpcy5vbE1hcC5nZXRMYXllcnMoKS5nZXRBcnJheSgpO1xuICAgICAgICBmb3IgKGxldCBsYXllciBvZiBsYXllcnMpIHtcbiAgICAgICAgICAgIGxldCBzb3VyY2U6IG9sLnNvdXJjZS5Tb3VyY2U7XG4gICAgICAgICAgICBpZiAobGF5ZXIuZ2V0KFVVSUQpID09PSB1dWlkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxheWVyO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChsYXllciBpbnN0YW5jZW9mIG9sLmxheWVyLkdyb3VwKSB7XG4gICAgICAgICAgICAgICAgbGV0IHN1YmxheWVycyA9ICg8b2wubGF5ZXIuR3JvdXA+bGF5ZXIpLmdldExheWVycygpLmdldEFycmF5KCk7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgc3VibGF5ZXIgb2Ygc3VibGF5ZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzdWJsYXllci5nZXQoVVVJRCkgPT09IHV1aWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzdWJsYXllcjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICB1cGRhdGVNYXAoKTogdm9pZCB7XG4gICAgICAgIHRoaXMub2xNYXAudXBkYXRlU2l6ZSgpO1xuICAgIH1cblxuICAgIGNoYW5nZUNycyhjcnM6IHN0cmluZykgeyAvLyBUT0RPXG4gICAgICAgIGxldCB0b1Byb2ogPSBudWxsO1xuICAgICAgICBpZiAoKHRvUHJvaiA9IG9sLnByb2ouZ2V0KGNycykpKSB7XG4gICAgICAgICAgICBsZXQgZXh0ZW50ID0gT2w0RXh0ZW50LmZyb21BcnJheShcbiAgICAgICAgICAgICAgICB0aGlzLm9sTWFwLmdldFZpZXcoKS5jYWxjdWxhdGVFeHRlbnQodGhpcy5vbE1hcC5nZXRTaXplKCkpLFxuICAgICAgICAgICAgICAgIHRoaXMuZ2V0UHJvamVjdGlvbigpXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgbGV0IGZyb21Qcm9qID0gdGhpcy5nZXRQcm9qZWN0aW9uKCk7XG4gICAgICAgICAgICAvLyBsZXQgY2VudGVyID0gdGhpcy5vbE1hcC5nZXRWaWV3KCkuZ2V0Q2VudGVyKCk7XG4gICAgICAgICAgICAvLyBsZXQgbGF5ZXJzID0gKDxvbC5sYXllci5Hcm91cD50aGlzLmZpbmRMYXllcihMQVlFUl9JTUFHRSkpLmdldExheWVycygpLmdldEFycmF5KCk7XG4gICAgICAgICAgICB0aGlzLm9sTWFwLnNldFZpZXcoXG4gICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVWaWV3KFxuICAgICAgICAgICAgICAgICAgICB0b1Byb2osXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWF4RXh0ZW50LmdldEV4dGVudCh0b1Byb2opLFxuICAgICAgICAgICAgICAgICAgICBPbDRVdGlscy5yZXNvbHV0aW9uc0ZvclNjYWxlcyh0aGlzLnNjYWxlcywgdG9Qcm9qLmdldFVuaXRzKCkpLnJldmVyc2UoKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICB0aGlzLmNoYW5nZUZvcklMYXllcnNJKCg8b2wubGF5ZXIuR3JvdXA+dGhpcy5maW5kTGF5ZXIoTEFZRVJfSU1BR0UpKS5nZXRMYXllcnMoKSwgZnJvbVByb2osIHRvUHJvaik7XG4gICAgICAgICAgICB0aGlzLmNoYW5nZUZvclZMYXllcnMoKDxvbC5sYXllci5Hcm91cD50aGlzLmZpbmRMYXllcihMQVlFUl9WRUNUT1IpKS5nZXRMYXllcnMoKSwgZnJvbVByb2osIHRvUHJvaik7XG4gICAgICAgICAgICB0aGlzLnpvb21Ub0V4dGVudChleHRlbnQuZ2V0UG9seWdvbkZvckV4dGVudCh0b1Byb2opKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgY2hhbmdlRm9yVkxheWVycyhsYXllcnM6IG9sLkNvbGxlY3Rpb248b2wubGF5ZXIuQmFzZT4sIGZyb21Qcm9qLCB0b1Byb2opIHtcbiAgICAgICAgZm9yIChsZXQgbGF5ZXIgb2YgbGF5ZXJzLmdldEFycmF5KCkpIHtcbiAgICAgICAgICAgIHRoaXMudmVjU291cmNlLnJlcHJvamVjdGlvblNvdXJjZShsYXllciwgZnJvbVByb2osIHRvUHJvaik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGNoYW5nZUZvcklMYXllcnNJKGxheWVyczogb2wuQ29sbGVjdGlvbjxvbC5sYXllci5CYXNlPiwgZnJvbVByb2osIHRvUHJvaikge1xuICAgICAgICBmb3IgKGxldCBsYXllciBvZiBsYXllcnMuZ2V0QXJyYXkoKSkge1xuICAgICAgICAgICAgdGhpcy53bXNTb3VyY2UucmVwcm9qZWN0aW9uU291cmNlKDxvbC5sYXllci5JbWFnZT5sYXllciwgZnJvbVByb2osIHRvUHJvaik7XG4gICAgICAgICAgICBsZXQgc291cmNlID0gPG9sLnNvdXJjZS5JbWFnZVdNUz4oPG9sLmxheWVyLkltYWdlPmxheWVyKS5nZXRTb3VyY2UoKTtcbiAgICAgICAgICAgIGxldCBpbGY6IG9sLkltYWdlTG9hZEZ1bmN0aW9uVHlwZSA9IHNvdXJjZS5nZXRJbWFnZUxvYWRGdW5jdGlvbigpO1xuICAgICAgICAgICAgc291cmNlLnNldEltYWdlTG9hZEZ1bmN0aW9uKGlsZik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZXRWaXNpYmxlKGxheWVyOiBvbC5sYXllci5CYXNlIHwgc3RyaW5nLCB2aXNpYmxpdHk6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICAgICAgbGV0IF9sYXllcjogb2wubGF5ZXIuQmFzZSA9IGxheWVyIGluc3RhbmNlb2Ygb2wubGF5ZXIuQmFzZSA/IGxheWVyIDogdGhpcy5maW5kTGF5ZXIoPHN0cmluZz5sYXllcik7XG4gICAgICAgIGlmIChfbGF5ZXIpIHtcbiAgICAgICAgICAgIF9sYXllci5zZXRWaXNpYmxlKHZpc2libGl0eSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZXRPcGFjaXR5KGxheWVyOiBvbC5sYXllci5CYXNlIHwgc3RyaW5nLCBvcGFjaXR5OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgbGV0IF9sYXllcjogb2wubGF5ZXIuQmFzZSA9IGxheWVyIGluc3RhbmNlb2Ygb2wubGF5ZXIuQmFzZSA/IGxheWVyIDogdGhpcy5maW5kTGF5ZXIoPHN0cmluZz5sYXllcik7XG4gICAgICAgIGlmIChfbGF5ZXIpIHtcbiAgICAgICAgICAgIF9sYXllci5zZXRPcGFjaXR5KG9wYWNpdHkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY2xlYXJGZWF0dXJlcygpIHtcbiAgICAgICAgdGhpcy52ZWNTb3VyY2UuY2xlYXJGZWF0dXJlcyh0aGlzLmhnTGF5ZXIpO1xuICAgIH1cblxuICAgIHNob3dGZWF0dXJlcyhnZW9Kc29uOiBPYmplY3QpIHtcbiAgICAgICAgdGhpcy52ZWNTb3VyY2Uuc2hvd0ZlYXR1cmVzKHRoaXMuaGdMYXllciwgZ2VvSnNvbik7XG4gICAgfVxuXG4gICAgZ2V0Rmlyc3RHZW9tRm9yU2VhcmNoKCk6IG9iamVjdCB7XG4gICAgICAgIGxldCBmZWF0dXJlcyA9IHRoaXMuZHJhd2VyLmdldExheWVyKCkuZ2V0U291cmNlKCkuZ2V0RmVhdHVyZXMoKTtcbiAgICAgICAgaWYoZmVhdHVyZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBsZXQgZ2VvanNvbiA9IG5ldyBvbC5mb3JtYXQuR2VvSlNPTigpLndyaXRlRmVhdHVyZU9iamVjdChcbiAgICAgICAgICAgIGZlYXR1cmVzWzBdLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICdkYXRhUHJvamVjdGlvbic6IE1FVEFET1JfRVBTRyxcbiAgICAgICAgICAgICAgICAnZmVhdHVyZVByb2plY3Rpb24nOiB0aGlzLmdldFByb2plY3Rpb24oKVxuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgICBnZW9qc29uWydiYm94J10gPSBuZXcgT2w0R2VvbShmZWF0dXJlc1swXS5nZXRHZW9tZXRyeSgpLCB0aGlzLmdldFByb2plY3Rpb24oKSlcbiAgICAgICAgICAgIC5nZXRFeHRlbnQob2wucHJvai5nZXQoTUVUQURPUl9FUFNHKSk7XG4gICAgICAgIHJldHVybiBnZW9qc29uO1xuICAgIH1cblxuICAgIGRyYXdHZW9tZXRyeUZvclNlYXJjaChnZW9Kc29uOiBPYmplY3QsIG9uRHJhd0VuZDogRnVuY3Rpb24gPSBudWxsKSB7XG4gICAgICAgIGxldCBvbDRtYXAgPSB0aGlzO1xuICAgICAgICBsZXQgb2xNYXAgPSB0aGlzLm9sTWFwO1xuICAgICAgICB0aGlzLnZlY1NvdXJjZS5jbGVhckZlYXR1cmVzKHRoaXMuZHJhd2VyLmdldExheWVyKCkpO1xuICAgICAgICB0aGlzLnZlY1NvdXJjZS5zaG93RmVhdHVyZXModGhpcy5kcmF3ZXIuZ2V0TGF5ZXIoKSwgZ2VvSnNvbik7XG4gICAgICAgIGxldCBtdWx0aVBvaW50OiBvbC5nZW9tLk11bHRpUG9pbnQgPSA8b2wuZ2VvbS5NdWx0aVBvaW50PiBPbDRFeHRlbnQuZnJvbUFycmF5KFxuICAgICAgICAgICAgdGhpcy5kcmF3ZXIuZ2V0TGF5ZXIoKS5nZXRTb3VyY2UoKS5nZXRFeHRlbnQoKSxcbiAgICAgICAgICAgIHRoaXMub2xNYXAuZ2V0VmlldygpLmdldFByb2plY3Rpb24oKVxuICAgICAgICApLmdldEdlb20oKTtcbiAgICAgICAgbGV0IG1heGV4dGVudCA9IHRoaXMubWF4RXh0ZW50LmdldFBvbHlnb25Gb3JFeHRlbnQodGhpcy5vbE1hcC5nZXRWaWV3KCkuZ2V0UHJvamVjdGlvbigpKTtcbiAgICAgICAgaWYgKG1heGV4dGVudC5pbnRlcnNlY3RzQ29vcmRpbmF0ZShtdWx0aVBvaW50LmdldFBvaW50KDApLmdldENvb3JkaW5hdGVzKCkpXG4gICAgICAgICAgICAmJiBtYXhleHRlbnQuaW50ZXJzZWN0c0Nvb3JkaW5hdGUobXVsdGlQb2ludC5nZXRQb2ludCgxKS5nZXRDb29yZGluYXRlcygpKSkge1xuICAgICAgICAgICAgdGhpcy56b29tVG9FeHRlbnQodGhpcy5kcmF3ZXIuZ2V0TGF5ZXIoKS5nZXRTb3VyY2UoKS5nZXRFeHRlbnQoKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtZXRhZG9yLmRpc3BsYXlFcnJvcignRGllIEdlb21ldHJpZSBpc3QgYXXDn2VyaGFsYiBkZXIgcsOkdW1saWNoZW4gRXJzdHJlY2t1bmcuJyk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGdlb0ZlYXR1cmUgPSB0aGlzLmdldEZpcnN0R2VvbUZvclNlYXJjaCgpO1xuICAgICAgICBpZiAob25EcmF3RW5kICE9PSBudWxsICYmIGdlb0ZlYXR1cmUpIHtcbiAgICAgICAgICAgIG9uRHJhd0VuZChnZW9GZWF0dXJlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRyYXdTaGFwZUZvclNlYXJjaChzaGFwZVR5cGU6IFNIQVBFUyA9IG51bGwsIG9uRHJhd0VuZDogRnVuY3Rpb24gPSBudWxsKSB7XG4gICAgICAgIHRoaXMuc2V0RG91YmxlQ2xpY2tab29tKGZhbHNlKTtcbiAgICAgICAgbGV0IG9sNG1hcCA9IHRoaXM7XG4gICAgICAgIGxldCBvbE1hcCA9IHRoaXMub2xNYXA7XG4gICAgICAgIGNvbnN0IHNoYXBlOiBTSEFQRVMgPSB0eXBlb2Ygc2hhcGVUeXBlID09PSAnc3RyaW5nJyA/IFNIQVBFU1s8c3RyaW5nPiBzaGFwZVR5cGVdIDogc2hhcGVUeXBlO1xuICAgICAgICBpZiAodGhpcy5kcmF3ZXIuZ2V0SW50ZXJhY3Rpb24oKSkge1xuICAgICAgICAgICAgdGhpcy5vbE1hcC5yZW1vdmVJbnRlcmFjdGlvbih0aGlzLmRyYXdlci5nZXRJbnRlcmFjdGlvbigpKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRyYXdlci5zZXRJbnRlcmFjdGlvbihzaGFwZSwgT2w0VXRpbHMuZ2V0U3R5bGUodGhpcy5zdHlsZXNbJ3NlYXJjaCddKSk7XG4gICAgICAgIGlmICh0aGlzLmRyYXdlci5nZXRJbnRlcmFjdGlvbigpKSB7XG4gICAgICAgICAgICBsZXQgZHJhd2VyID0gdGhpcy5kcmF3ZXI7XG4gICAgICAgICAgICB0aGlzLmdldERyYXdlcigpLmdldExheWVyKCkuZ2V0U291cmNlKCkuY2xlYXIoKTtcbiAgICAgICAgICAgIHRoaXMub2xNYXAuYWRkSW50ZXJhY3Rpb24odGhpcy5kcmF3ZXIuZ2V0SW50ZXJhY3Rpb24oKSk7XG4gICAgICAgICAgICB0aGlzLmRyYXdlci5nZXRJbnRlcmFjdGlvbigpLm9uKFxuICAgICAgICAgICAgICAgICdkcmF3c3RhcnQnLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIG9sNG1hcC5nZXREcmF3ZXIoKS5nZXRMYXllcigpLmdldFNvdXJjZSgpLmNsZWFyKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHRoaXMuZHJhd2VyLmdldEludGVyYWN0aW9uKCkub24oXG4gICAgICAgICAgICAgICAgJ2RyYXdlbmQnLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBnZW9qc29uID0gbmV3IG9sLmZvcm1hdC5HZW9KU09OKCkud3JpdGVGZWF0dXJlT2JqZWN0KFxuICAgICAgICAgICAgICAgICAgICAgICAgZS5mZWF0dXJlLFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkYXRhUHJvamVjdGlvbic6IE1FVEFET1JfRVBTRyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZmVhdHVyZVByb2plY3Rpb24nOiBvbDRtYXAuZ2V0UHJvamVjdGlvbigpXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIGdlb2pzb25bJ2Jib3gnXSA9IG5ldyBPbDRHZW9tKGUuZmVhdHVyZS5nZXRHZW9tZXRyeSgpLCBvbDRtYXAuZ2V0UHJvamVjdGlvbigpKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmdldEV4dGVudChvbC5wcm9qLmdldChNRVRBRE9SX0VQU0cpKTtcbiAgICAgICAgICAgICAgICAgICAgb25EcmF3RW5kKGdlb2pzb24pO1xuICAgICAgICAgICAgICAgICAgICBvbE1hcC5yZW1vdmVJbnRlcmFjdGlvbihkcmF3ZXIuZ2V0SW50ZXJhY3Rpb24oKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZ2V0RHJhd2VyKCkuZ2V0TGF5ZXIoKS5nZXRTb3VyY2UoKS5jbGVhcigpO1xuICAgICAgICAgICAgb25EcmF3RW5kKG51bGwpO1xuICAgICAgICAgICAgdGhpcy5zZXREb3VibGVDbGlja1pvb20odHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBY3RpdmF0ZXMgLyBkZWFjdGl2YXRlcyBpbnRlcmFjdGlvbiBvbC5pbnRlcmFjdGlvbi5Eb3VibGVDbGlja1pvb21cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IHN0YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBzZXREb3VibGVDbGlja1pvb20oc3RhdGU6IGJvb2xlYW4pIHtcbiAgICAgICAgZm9yIChsZXQgaW50ZXJhY3Rpb24gb2YgdGhpcy5vbE1hcC5nZXRJbnRlcmFjdGlvbnMoKS5nZXRBcnJheSgpKSB7XG4gICAgICAgICAgICBpZiAoaW50ZXJhY3Rpb24gaW5zdGFuY2VvZiBvbC5pbnRlcmFjdGlvbi5Eb3VibGVDbGlja1pvb20pIHtcbiAgICAgICAgICAgICAgICBpbnRlcmFjdGlvbi5zZXRBY3RpdmUoc3RhdGUpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgZW51bSBTSEFQRVMge05PTkUsIEJPWCwgUE9MWUdPTn1cbjtcblxuZXhwb3J0IGNsYXNzIE9sNERyYXdlciB7XG4gICAgLy8gcHJpdmF0ZSBzdGF0aWMgX2luc3RhbmNlOiBPbDREcmF3ZXI7XG4gICAgcHJvdGVjdGVkIGxheWVyOiBvbC5sYXllci5WZWN0b3I7XG4gICAgcHJvdGVjdGVkIGludGVyYWN0aW9uOiBvbC5pbnRlcmFjdGlvbi5EcmF3O1xuXG4gICAgY29uc3RydWN0b3IobGF5ZXI6IG9sLmxheWVyLlZlY3Rvcikge1xuICAgICAgICB0aGlzLmxheWVyID0gbGF5ZXI7XG4gICAgfVxuXG4gICAgcHVibGljIGdldExheWVyKCk6IG9sLmxheWVyLlZlY3RvciB7XG4gICAgICAgIHJldHVybiB0aGlzLmxheWVyO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRJbnRlcmFjdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJhY3Rpb247XG4gICAgfVxuXG4gICAgcHVibGljIHNldEludGVyYWN0aW9uKHR5cGU6IFNIQVBFUywgZHJhd1N0eWxlOiBvbC5zdHlsZS5TdHlsZSkge1xuICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgU0hBUEVTLkJPWDpcbiAgICAgICAgICAgICAgICB0aGlzLmludGVyYWN0aW9uID0gbmV3IG9sLmludGVyYWN0aW9uLkRyYXcoe1xuICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IHRoaXMubGF5ZXIuZ2V0U291cmNlKCksXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdDaXJjbGUnLFxuICAgICAgICAgICAgICAgICAgICBzdHlsZTogZHJhd1N0eWxlLFxuICAgICAgICAgICAgICAgICAgICBnZW9tZXRyeUZ1bmN0aW9uOiBjcmVhdGVCb3goKSAvLyBvbC5kLnRzIGhhcyBubyBmdW5jdGlvbiBcIm9sLmludGVyYWN0aW9uLkRyYXcuY3JlYXRlQm94KClcIlxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBTSEFQRVMuUE9MWUdPTjpcbiAgICAgICAgICAgICAgICB0aGlzLmludGVyYWN0aW9uID0gbmV3IG9sLmludGVyYWN0aW9uLkRyYXcoe1xuICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IHRoaXMubGF5ZXIuZ2V0U291cmNlKCksXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdQb2x5Z29uJyxcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IGRyYXdTdHlsZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aGlzLmludGVyYWN0aW9uID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBvbC5kLnRzIGhhcyBubyBmdW5jdGlvbiBcIm9sLmludGVyYWN0aW9uLkRyYXcuY3JlYXRlQm94KClcIlxuICogQHJldHVybnMgeyhjb29yZGluYXRlczphbnksIG9wdF9nZW9tZXRyeTphbnkpPT5hbnl8b2wuZ2VvbS5Qb2x5Z29ufVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQm94KCkge1xuICAgIHJldHVybiAoXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0ge29sLkNvb3JkaW5hdGV8QXJyYXkuPG9sLkNvb3JkaW5hdGU+fEFycmF5LjxBcnJheS48b2wuQ29vcmRpbmF0ZT4+fSBjb29yZGluYXRlc1xuICAgICAgICAgKiBAcGFyYW0ge29sLmdlb20uU2ltcGxlR2VvbWV0cnk9fSBvcHRfZ2VvbWV0cnlcbiAgICAgICAgICogQHJldHVybiB7b2wuZ2VvbS5TaW1wbGVHZW9tZXRyeX1cbiAgICAgICAgICovXG4gICAgICAgIGZ1bmN0aW9uIChjb29yZGluYXRlcywgb3B0X2dlb21ldHJ5KSB7XG4gICAgICAgICAgICB2YXIgZXh0ZW50ID0gb2wuZXh0ZW50LmJvdW5kaW5nRXh0ZW50KGNvb3JkaW5hdGVzKTtcbiAgICAgICAgICAgIHZhciBnZW9tZXRyeSA9IG9wdF9nZW9tZXRyeSB8fCBuZXcgb2wuZ2VvbS5Qb2x5Z29uKG51bGwpO1xuICAgICAgICAgICAgZ2VvbWV0cnkuc2V0Q29vcmRpbmF0ZXMoW1tcbiAgICAgICAgICAgICAgICBvbC5leHRlbnQuZ2V0Qm90dG9tTGVmdChleHRlbnQpLFxuICAgICAgICAgICAgICAgIG9sLmV4dGVudC5nZXRCb3R0b21SaWdodChleHRlbnQpLFxuICAgICAgICAgICAgICAgIG9sLmV4dGVudC5nZXRUb3BSaWdodChleHRlbnQpLFxuICAgICAgICAgICAgICAgIG9sLmV4dGVudC5nZXRUb3BMZWZ0KGV4dGVudCksXG4gICAgICAgICAgICAgICAgb2wuZXh0ZW50LmdldEJvdHRvbUxlZnQoZXh0ZW50KVxuICAgICAgICAgICAgXV0pO1xuICAgICAgICAgICAgcmV0dXJuIGdlb21ldHJ5O1xuICAgICAgICB9XG4gICAgKTtcbn1cblxuZXhwb3J0IGNsYXNzIEdlb21Mb2FkZXIge1xuICAgIHByaXZhdGUgbWFwOiBPbDRNYXA7XG4gICAgcHJpdmF0ZSBmb3JtOiBIVE1MRm9ybUVsZW1lbnQ7XG5cbiAgICBwdWJsaWMgY29uc3RydWN0b3IobWFwOiBPbDRNYXAsIGZvcm06IEhUTUxGb3JtRWxlbWVudCkge1xuICAgICAgICB0aGlzLm1hcCA9IG1hcDtcbiAgICAgICAgdGhpcy5mb3JtID0gZm9ybTtcbiAgICAgICAgdGhpcy5vbigpO1xuICAgIH1cblxuICAgIHB1YmxpYyBvbigpIHtcbiAgICAgICAgdGhpcy5mb3JtLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIHRoaXMudXBsb2FkLmJpbmQodGhpcyksIGZhbHNlKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHVwbG9hZChlOiBFdmVudCkge1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhlKTtcbiAgICAgICAgLy8gSHR0cFV0aWxzLkh0dHAuc2VuZEZvcm0odGhpcy5mb3JtLCB0aGlzLmZvcm0uYWN0aW9uLCBIdHRwVXRpbHMuSFRUUF9NRVRIT0QuUE9TVCwgSHR0cFV0aWxzLkhUVFBfREFUQVRZUEUuanNvbilcbiAgICAgICAgLy8gICAgIC50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAvLyAgICAgICAgIGNvbnNvbGUubG9nKCdDb250ZW50czogJyArIHZhbHVlKTtcbiAgICAgICAgLy8gICAgIH0pXG4gICAgICAgIC8vICAgICAuY2F0Y2goZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICAvLyAgICAgICAgIGNvbnNvbGUuZXJyb3IocmVhc29uKTtcbiAgICAgICAgLy8gICAgIH0pO1xuICAgIH1cbn1cblxuZGVjbGFyZSB2YXIgbWV0YWRvcjogYW55OyIsImltcG9ydCB7VElUTEUsIFVVSUQsIExBWUVSX1VVSUQsIE9sNE1hcH0gZnJvbSBcIi4vT2w0XCI7XG5pbXBvcnQge0xheWVyVHJlZX0gZnJvbSAnLi9MYXllclRyZWUnO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgT2w0U291cmNlIHtcblxuICAgIGFic3RyYWN0IGNyZWF0ZUxheWVyKGxheWVyVXVpZDogc3RyaW5nLCBvcHRpb25zOiBhbnksIHByb2o6IG9sLlByb2plY3Rpb25MaWtlLCB2aXNpYmxlOiBib29sZWFuLCBvcGFjaXR5OiBudW1iZXIpOiBvbC5sYXllci5CYXNlO1xuXG4gICAgYWJzdHJhY3QgcmVwcm9qZWN0aW9uU291cmNlKGxheWVyOiBvbC5sYXllci5CYXNlLCBmcm9tUHJvajogb2wuUHJvamVjdGlvbkxpa2UsIHRvUHJvajogb2wuUHJvamVjdGlvbkxpa2UpO1xuXG4gICAgYWJzdHJhY3QgY2xvbmVMYXllcihsYXllcjogb2wubGF5ZXIuQmFzZSwgZnJvbVByb2o6IG9sLlByb2plY3Rpb25MaWtlLCB0b1Byb2o6IG9sLlByb2plY3Rpb25MaWtlKTogb2wubGF5ZXIuQmFzZTtcbn1cblxuZXhwb3J0IGNsYXNzIE9sNFZlY3RvclNvdXJjZSBpbXBsZW1lbnRzIE9sNFNvdXJjZSB7XG4gICAgcHJpdmF0ZSBzdGF0aWMgX2luc3RhbmNlOiBPbDRWZWN0b3JTb3VyY2U7XG4gICAgcHJvdGVjdGVkIHNob3dhYmxlOiBib29sZWFuID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBvbDRNYXA6IE9sNE1hcDtcblxuICAgIHByaXZhdGUgY29uc3RydWN0b3Iob2w0TWFwOiBPbDRNYXApIHtcbiAgICAgICAgLy8gc3VwZXIoZmFsc2UpO1xuICAgICAgICB0aGlzLm9sNE1hcCA9IG9sNE1hcDtcbiAgICAgICAgLy8gdGhpcy5zZXRTaG93YWJsZShmYWxzZSk7XG4gICAgfVxuXG4gICAgc3RhdGljIGNyZWF0ZShvbDRtYXA6IE9sNE1hcCk6IE9sNFZlY3RvclNvdXJjZSB7XG4gICAgICAgIGlmICghT2w0VmVjdG9yU291cmNlLl9pbnN0YW5jZSkgey8vIHNpbmdsZXRvblxuICAgICAgICAgICAgT2w0VmVjdG9yU291cmNlLl9pbnN0YW5jZSA9IG5ldyBPbDRWZWN0b3JTb3VyY2Uob2w0bWFwKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gT2w0VmVjdG9yU291cmNlLl9pbnN0YW5jZTtcbiAgICB9XG5cbiAgICBjcmVhdGVMYXllcihsYXllclV1aWQ6IHN0cmluZywgb3B0aW9uczogYW55LCBwcm9qOiBvbC5Qcm9qZWN0aW9uTGlrZSwgdmlzaWJsZTogYm9vbGVhbiA9IHRydWUsIG9wYWNpdHk6IG51bWJlciA9IDEuMCk6IG9sLmxheWVyLkJhc2Uge1xuICAgICAgICBsZXQgdkxheWVyID0gbmV3IG9sLmxheWVyLlZlY3Rvcih7XG4gICAgICAgICAgICBzb3VyY2U6IG5ldyBvbC5zb3VyY2UuVmVjdG9yKHt3cmFwWDogZmFsc2V9KSxcbiAgICAgICAgICAgIHN0eWxlOiBvcHRpb25zWydzdHlsZSddXG4gICAgICAgIH0pO1xuICAgICAgICB2TGF5ZXIuc2V0KFVVSUQsIGxheWVyVXVpZCk7XG4gICAgICAgIHJldHVybiB2TGF5ZXI7XG4gICAgfVxuXG4gICAgcmVwcm9qZWN0aW9uU291cmNlKGxheWVyOiBvbC5sYXllci5CYXNlLCBmcm9tUHJvajogb2wuUHJvamVjdGlvbkxpa2UsIHRvUHJvajogb2wuUHJvamVjdGlvbkxpa2UpIHtcbiAgICAgICAgbGV0IHNvdXJjZSA9ICg8b2wubGF5ZXIuTGF5ZXI+bGF5ZXIpLmdldFNvdXJjZSgpO1xuICAgICAgICBsZXQgZmVhdHVyZXM6IG9sLkZlYXR1cmVbXSA9ICg8b2wuc291cmNlLlZlY3Rvcj5zb3VyY2UpLmdldEZlYXR1cmVzKCk7XG4gICAgICAgIGZvciAobGV0IGZlYXR1cmUgb2YgZmVhdHVyZXMpIHtcbiAgICAgICAgICAgIGZlYXR1cmUuc2V0R2VvbWV0cnkoZmVhdHVyZS5nZXRHZW9tZXRyeSgpLnRyYW5zZm9ybShmcm9tUHJvaiwgdG9Qcm9qKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjbG9uZUxheWVyKGxheWVyOiBvbC5sYXllci5CYXNlLCBmcm9tUHJvajogb2wuUHJvamVjdGlvbkxpa2UsIHRvUHJvajogb2wuUHJvamVjdGlvbkxpa2UpOiBvbC5sYXllci5CYXNlIHtcbiAgICAgICAgLyogVE9ETyBmb3IgY2xvbmUgKi9cbiAgICAgICAgcmV0dXJuIGxheWVyO1xuICAgIH1cblxuICAgIHNob3dGZWF0dXJlcyh2TGF5ZXI6IG9sLmxheWVyLlZlY3RvciwgZ2VvSnNvbjogT2JqZWN0KSB7XG4gICAgICAgIGxldCBnZW9Kc29uUmVhZGVyOiBvbC5mb3JtYXQuR2VvSlNPTiA9IG5ldyBvbC5mb3JtYXQuR2VvSlNPTigpO1xuICAgICAgICBsZXQgZGF0YXByb2ogPSBnZW9Kc29uUmVhZGVyLnJlYWRQcm9qZWN0aW9uKGdlb0pzb24pO1xuICAgICAgICBsZXQgZmVhdHVyZXMgPSBnZW9Kc29uUmVhZGVyLnJlYWRGZWF0dXJlcyhcbiAgICAgICAgICAgIGdlb0pzb24sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgJ2RhdGFQcm9qZWN0aW9uJzogZ2VvSnNvblJlYWRlci5yZWFkUHJvamVjdGlvbihnZW9Kc29uKSxcbiAgICAgICAgICAgICAgICAnZmVhdHVyZVByb2plY3Rpb24nOiB0aGlzLm9sNE1hcC5nZXRQcm9qZWN0aW9uKClcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB2TGF5ZXIuZ2V0U291cmNlKCkuYWRkRmVhdHVyZXMoZmVhdHVyZXMpO1xuICAgIH1cblxuICAgIGNsZWFyRmVhdHVyZXModkxheWVyOiBvbC5sYXllci5WZWN0b3IpIHtcbiAgICAgICAgdkxheWVyLmdldFNvdXJjZSgpLmNsZWFyKHRydWUpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIE9sNFdtc1NvdXJjZSBpbXBsZW1lbnRzIE9sNFNvdXJjZSB7XG4gICAgcHJpdmF0ZSBzdGF0aWMgX2luc3RhbmNlOiBPbDRXbXNTb3VyY2U7XG4gICAgcHJpdmF0ZSBvbDRNYXA6IE9sNE1hcDtcbiAgICBwcml2YXRlIHVzZUxvYWRFdmVudHM6IGJvb2xlYW47XG4gICAgcHVibGljIHN0YXRpYyBtYXBBY3Rpdml0eTogTWFwQWN0aXZpdHk7Ly8gPSBNYXBBY3Rpdml0eS5jcmVhdGUoKTtcbiAgICBwdWJsaWMgZGlzYWJsZWQ6IGFueTtcblxuICAgIHByaXZhdGUgY29uc3RydWN0b3Iob2w0TWFwOiBPbDRNYXAsIHVzZUxvYWRFdmVudHM6IGJvb2xlYW4gPSB0cnVlKSB7XG4gICAgICAgIHRoaXMub2w0TWFwID0gb2w0TWFwO1xuICAgICAgICB0aGlzLnVzZUxvYWRFdmVudHMgPSB1c2VMb2FkRXZlbnRzO1xuICAgICAgICBpZiAodGhpcy51c2VMb2FkRXZlbnRzKSB7XG4gICAgICAgICAgICBPbDRXbXNTb3VyY2UubWFwQWN0aXZpdHkgPSBNYXBBY3Rpdml0eS5jcmVhdGUoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRpc2FibGVkID0ge307XG4gICAgfVxuXG4gICAgc3RhdGljIGNyZWF0ZShvbDRNYXA6IE9sNE1hcCwgdXNlTG9hZEV2ZW50czogYm9vbGVhbiA9IHRydWUpOiBPbDRXbXNTb3VyY2Uge1xuICAgICAgICBpZiAoIU9sNFdtc1NvdXJjZS5faW5zdGFuY2UpIHsvLyBzaW5nbGV0b25cbiAgICAgICAgICAgIE9sNFdtc1NvdXJjZS5faW5zdGFuY2UgPSBuZXcgT2w0V21zU291cmNlKG9sNE1hcCwgdXNlTG9hZEV2ZW50cyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE9sNFdtc1NvdXJjZS5faW5zdGFuY2U7XG4gICAgfVxuXG4gICAgcHVibGljIGFkZERpc2FibGVkKGxheWVyOiBvbC5sYXllci5CYXNlKSB7XG4gICAgICAgIHRoaXMuZGlzYWJsZWRbbGF5ZXIuZ2V0KFVVSUQpXSA9IGxheWVyLmdldChVVUlEKTtcbiAgICAgICAgdGhpcy5vbDRNYXAuZ2V0TGF5ZXJUcmVlKCkuc2V0RGlzYWJsZShsYXllciwgdHJ1ZSk7XG4gICAgICAgIHRoaXMub2w0TWFwLnNldFZpc2libGUobGF5ZXIsIGZhbHNlKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVtb3ZlRGlzYWJsZWQobGF5ZXI6IG9sLmxheWVyLkJhc2UpIHtcbiAgICAgICAgaWYgKGxheWVyLmdldChVVUlEKSl7XG4gICAgICAgICAgICB0aGlzLm9sNE1hcC5nZXRMYXllclRyZWUoKS5zZXREaXNhYmxlKGxheWVyLCBmYWxzZSk7XG4gICAgICAgICAgICBsZXQgdmlzaWJsZSA9IHRoaXMub2w0TWFwLmdldExheWVyVHJlZSgpLmdldFZpc2libGUobGF5ZXIpO1xuICAgICAgICAgICAgdGhpcy5vbDRNYXAuc2V0VmlzaWJsZShsYXllciwgdmlzaWJsZSk7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5kaXNhYmxlZFtsYXllci5nZXQoVVVJRCldO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY3JlYXRlTGF5ZXIobGF5ZXJVdWlkOiBzdHJpbmcsIG9wdGlvbnM6IGFueSA9IG51bGwsIHByb2o6IG9sLlByb2plY3Rpb25MaWtlLCB2aXNpYmxlOiBib29sZWFuLCBvcGFjaXR5OiBudW1iZXIpOiBvbC5sYXllci5CYXNlIHtcbiAgICAgICAgbGV0IHNvdXJjZSA9IHRoaXMuY3JlYXRlU291cmNlKGxheWVyVXVpZCwgb3B0aW9uc1sndXJsJ10sIG9wdGlvbnNbJ3BhcmFtcyddLCBwcm9qKTtcbiAgICAgICAgbGV0IGxheWVyV21zID0gdGhpcy5fY3JlYXRlTGF5ZXIobGF5ZXJVdWlkLCB2aXNpYmxlLCBvcGFjaXR5LCBzb3VyY2UsIG9wdGlvbnNbJ3RpdGxlJ10gPyBvcHRpb25zWyd0aXRsZSddIDogbnVsbCk7XG4gICAgICAgIHJldHVybiBsYXllcldtcztcbiAgICB9XG5cbiAgICBwcml2YXRlIF9jcmVhdGVMYXllcihsYXllclV1aWQ6IHN0cmluZywgdmlzaWJsZTogYm9vbGVhbiwgb3BhY2l0eTogbnVtYmVyLCBzb3VyY2U6IG9sLnNvdXJjZS5JbWFnZVdNUywgdGl0bGU6IHN0cmluZyA9IG51bGwpIHtcbiAgICAgICAgbGV0IGxheWVyV21zID0gbmV3IG9sLmxheWVyLkltYWdlKHtcbiAgICAgICAgICAgIHNvdXJjZTogc291cmNlLFxuICAgICAgICAgICAgdmlzaWJsZTogdmlzaWJsZSxcbiAgICAgICAgICAgIG9wYWNpdHk6IG9wYWNpdHlcbiAgICAgICAgfSk7XG4gICAgICAgIGxheWVyV21zLnNldChVVUlELCBsYXllclV1aWQpO1xuICAgICAgICBpZiAodGl0bGUgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGxheWVyV21zLnNldChUSVRMRSwgdGl0bGUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsYXllcldtcztcbiAgICB9XG5cbiAgICBwcml2YXRlIGNyZWF0ZVNvdXJjZShsYXllclV1aWQ6IHN0cmluZywgdXJsOiBzdHJpbmcsIHBhcmFtczogYW55LCBwcm9qOiBvbC5Qcm9qZWN0aW9uTGlrZSk6IG9sLnNvdXJjZS5JbWFnZVdNUyB7XG4gICAgICAgIGxldCBzb3VyY2UgPSBuZXcgb2wuc291cmNlLkltYWdlV01TKHtcbiAgICAgICAgICAgIHVybDogdXJsLFxuICAgICAgICAgICAgcGFyYW1zOiBwYXJhbXMsXG4gICAgICAgICAgICBwcm9qZWN0aW9uOiBwcm9qXG4gICAgICAgIH0pO1xuICAgICAgICBzb3VyY2Uuc2V0KExBWUVSX1VVSUQsIGxheWVyVXVpZCk7XG4gICAgICAgIHRoaXMuc2V0TG9hZEV2ZW50cyhzb3VyY2UpO1xuICAgICAgICByZXR1cm4gc291cmNlO1xuICAgIH1cblxuICAgIHJlcHJvamVjdGlvblNvdXJjZShsYXllcjogb2wubGF5ZXIuQmFzZSwgZnJvbVByb2o6IG9sLlByb2plY3Rpb25MaWtlLCB0b1Byb2o6IG9sLlByb2plY3Rpb25MaWtlKSB7XG4gICAgICAgIGxldCBvbGRzb3VyY2UgPSA8b2wuc291cmNlLkltYWdlV01TPig8b2wubGF5ZXIuTGF5ZXI+bGF5ZXIpLmdldFNvdXJjZSgpO1xuICAgICAgICBsZXQgbmV3U291cmNlID0gdGhpcy5jcmVhdGVTb3VyY2UobGF5ZXIuZ2V0KFVVSUQpLCBvbGRzb3VyY2UuZ2V0VXJsKCksIG9sZHNvdXJjZS5nZXRQYXJhbXMoKSwgdG9Qcm9qKTtcbiAgICAgICAgKDxvbC5sYXllci5MYXllcj5sYXllcikuc2V0U291cmNlKG5ld1NvdXJjZSk7XG4gICAgICAgIHRoaXMucmVtb3ZlRGlzYWJsZWQobGF5ZXIpO1xuICAgIH1cblxuICAgIGNsb25lTGF5ZXIobGF5ZXI6IG9sLmxheWVyLkJhc2UsIGZyb21Qcm9qOiBvbC5Qcm9qZWN0aW9uTGlrZSwgdG9Qcm9qOiBvbC5Qcm9qZWN0aW9uTGlrZSk6IG9sLmxheWVyLkJhc2Uge1xuICAgICAgICBsZXQgb2xkc291cmNlID0gPG9sLnNvdXJjZS5JbWFnZVdNUz4oPG9sLmxheWVyLkxheWVyPmxheWVyKS5nZXRTb3VyY2UoKTtcbiAgICAgICAgbGV0IG5ld1NvdXJjZSA9IHRoaXMuY3JlYXRlU291cmNlKGxheWVyLmdldChVVUlEKSwgb2xkc291cmNlLmdldFVybCgpLCBvbGRzb3VyY2UuZ2V0UGFyYW1zKCksIHRvUHJvaik7XG4gICAgICAgIGxldCBvbGRMYXllciA9ICg8b2wubGF5ZXIuTGF5ZXI+bGF5ZXIpO1xuICAgICAgICBsZXQgbmV3TGF5ZXIgPSB0aGlzLl9jcmVhdGVMYXllcihvbGRMYXllci5nZXQoVVVJRCksIG9sZExheWVyLmdldFZpc2libGUoKSwgb2xkTGF5ZXIuZ2V0T3BhY2l0eSgpLCBuZXdTb3VyY2UsIG9sZExheWVyLmdldChUSVRMRSkpO1xuICAgICAgICByZXR1cm4gbmV3TGF5ZXI7XG4gICAgfVxuXG5cbiAgICBwcml2YXRlIHNldExvYWRFdmVudHMoc291cmNlOiBvbC5zb3VyY2UuSW1hZ2VXTVMpIHtcbiAgICAgICAgaWYgKHRoaXMudXNlTG9hZEV2ZW50cykge1xuICAgICAgICAgICAgLy8gc291cmNlLnNldEltYWdlTG9hZEZ1bmN0aW9uKHRoaXMuaW1hZ2VMb2FkRnVuY3Rpb24uYmluZCh0aGlzKSk7XG4gICAgICAgICAgICBzb3VyY2Uub24oJ2ltYWdlbG9hZHN0YXJ0JywgdGhpcy5pbWFnZUxvYWRTdGFydC5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIHNvdXJjZS5vbignaW1hZ2Vsb2FkZW5kJywgdGhpcy5pbWFnZUxvYWRFbmQuYmluZCh0aGlzKSk7XG4gICAgICAgICAgICBzb3VyY2Uub24oJ2ltYWdlbG9hZGVycm9yJywgdGhpcy5pbWFnZUxvYWRFcnJvci5iaW5kKHRoaXMpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGltYWdlTG9hZFN0YXJ0KGU6IG9sLnNvdXJjZS5JbWFnZUV2ZW50KSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdzdGFydCcsICg8b2wuc291cmNlLkltYWdlV01TPmUudGFyZ2V0KS5nZXQoTEFZRVJfVVVJRCkpO1xuICAgICAgICBpZiAoT2w0V21zU291cmNlLm1hcEFjdGl2aXR5KSB7XG4gICAgICAgICAgICBPbDRXbXNTb3VyY2UubWFwQWN0aXZpdHkubG9hZFN0YXJ0KCg8b2wuc291cmNlLkltYWdlV01TPmUudGFyZ2V0KS5nZXQoTEFZRVJfVVVJRCkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaW1hZ2VMb2FkRW5kKGU6IG9sLnNvdXJjZS5JbWFnZUV2ZW50KSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdlbmQnLCAoPG9sLnNvdXJjZS5JbWFnZVdNUz5lLnRhcmdldCkuZ2V0KExBWUVSX1VVSUQpKTtcbiAgICAgICAgaWYgKE9sNFdtc1NvdXJjZS5tYXBBY3Rpdml0eSkge1xuICAgICAgICAgICAgT2w0V21zU291cmNlLm1hcEFjdGl2aXR5LmxvYWRFbmQoKDxvbC5zb3VyY2UuSW1hZ2VXTVM+ZS50YXJnZXQpLmdldChMQVlFUl9VVUlEKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpbWFnZUxvYWRFcnJvcihlOiBvbC5zb3VyY2UuSW1hZ2VFdmVudCkge1xuICAgICAgICAvLyBjb25zb2xlLmxvZygnZXJyb3InLCAoPG9sLnNvdXJjZS5JbWFnZVdNUz5lLnRhcmdldCkuZ2V0KExBWUVSX1VVSUQpKTtcbiAgICAgICAgaWYgKE9sNFdtc1NvdXJjZS5tYXBBY3Rpdml0eSkge1xuICAgICAgICAgICAgT2w0V21zU291cmNlLm1hcEFjdGl2aXR5LmxvYWRFcnJvcigoPG9sLnNvdXJjZS5JbWFnZVdNUz5lLnRhcmdldCkuZ2V0KExBWUVSX1VVSUQpKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgbGF5ZXIgPSB0aGlzLm9sNE1hcC5maW5kTGF5ZXIoKDxvbC5zb3VyY2UuSW1hZ2VXTVM+ZS50YXJnZXQpLmdldChMQVlFUl9VVUlEKSk7XG4gICAgICAgIHRoaXMuYWRkRGlzYWJsZWQobGF5ZXIpO1xuICAgIH1cblxufVxuXG5leHBvcnQgY2xhc3MgTWFwQWN0aXZpdHkge1xuICAgIHByaXZhdGUgc3RhdGljIF9pbnN0YW5jZTogTWFwQWN0aXZpdHk7XG4gICAgcHJpdmF0ZSBsYXllcnM6IGFueSA9IHt9O1xuICAgIHByaXZhdGUgaXNMb2FkaW5nOiBib29sZWFuID0gZmFsc2U7XG5cbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKCkge1xuICAgIH1cblxuICAgIHN0YXRpYyBjcmVhdGUoKTogTWFwQWN0aXZpdHkge1xuICAgICAgICBpZiAoIU1hcEFjdGl2aXR5Ll9pbnN0YW5jZSkgey8vIHNpbmdsZXRvblxuICAgICAgICAgICAgTWFwQWN0aXZpdHkuX2luc3RhbmNlID0gbmV3IE1hcEFjdGl2aXR5KCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE1hcEFjdGl2aXR5Ll9pbnN0YW5jZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFjdGl2aXR5U3RhcnQobGF5ZXJOYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5sYXllcnNbbGF5ZXJOYW1lXSA9IHRydWU7XG4gICAgICAgIGlmICh0aGlzLmlzTG9hZGluZyA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHRoaXMuaXNMb2FkaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIHdpbmRvd1snbWV0YWRvciddLnByZWxvYWRlclN0YXJ0KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGFjdGl2aXR5RW5kKGxheWVyTmFtZTogc3RyaW5nKSB7XG4gICAgICAgIGlmICh0aGlzLmxheWVyc1tsYXllck5hbWVdKSB7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5sYXllcnNbbGF5ZXJOYW1lXTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGxldCBsYXllck4gaW4gdGhpcy5sYXllcnMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmlzTG9hZGluZyA9IGZhbHNlO1xuICAgICAgICB3aW5kb3dbJ21ldGFkb3InXS5wcmVsb2FkZXJTdG9wKCk7XG4gICAgfVxuXG4gICAgbG9hZFN0YXJ0KGxheWVyTmFtZTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuYWN0aXZpdHlTdGFydChsYXllck5hbWUpO1xuICAgIH1cblxuICAgIGxvYWRFbmQobGF5ZXJOYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5hY3Rpdml0eUVuZChsYXllck5hbWUpO1xuICAgIH1cblxuICAgIGxvYWRFcnJvcihsYXllck5hbWU6IHN0cmluZykge1xuICAgICAgICB0aGlzLmFjdGl2aXR5RW5kKGxheWVyTmFtZSk7XG4gICAgfVxufVxuIiwiZXhwb3J0IGNsYXNzIEVFbGVtZW50IHtcbiAgICBwcml2YXRlIF9lbGVtZW50OiBIVE1MRWxlbWVudDtcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50OiBIVE1MRWxlbWVudCl7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQgPSBlbGVtZW50O1xuICAgIH1cblxuICAgIGdldCBlbGVtZW50KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZWxlbWVudDtcbiAgICB9XG5cbiAgICBzZXRBdHRycyhhdHRyczogT2JqZWN0ID0ge30pIHtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gYXR0cnMpIHtcbiAgICAgICAgICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKGtleSwgYXR0cnNba2V5XSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgc2V0QXR0cihrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZykge1xuICAgICAgICB0aGlzLl9lbGVtZW50LnNldEF0dHJpYnV0ZShrZXksIHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGdldEF0dHIoa2V5OiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2VsZW1lbnQuZ2V0QXR0cmlidXRlKGtleSk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgZG9tIHtcbiAgICAvLyBwcml2YXRlIHN0YXRpYyBkYXRhID0gZGF0YTtcblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIHRhZ25hbWVcbiAgICAgKiBAcGFyYW0gb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH1cbiAgICAgKi9cbiAgICBzdGF0aWMgY3JlYXRlKHRhZ25hbWU6IHN0cmluZywgYXR0cnM6IGFueSA9IHt9LCBjbGFzc2VzOiBzdHJpbmdbXSA9IFtdLCB0ZXh0OiBzdHJpbmcgPSAnJywgZGF0YTogYW55ID0ge30pOiBIVE1MRWxlbWVudCB7XG4gICAgICAgIGxldCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWduYW1lKTtcbiAgICAgICAgcmV0dXJuIGRvbS5hZGQoZWxlbWVudCwgYXR0cnMsIGNsYXNzZXMsIHRleHQsIGRhdGEpO1xuICAgIH1cblxuICAgIHN0YXRpYyBhZGQoZWxlbWVudDogSFRNTEVsZW1lbnQsIGF0dHJzOiBhbnkgPSB7fSwgY2xhc3Nlczogc3RyaW5nW10gPSBbXSwgdGV4dDogc3RyaW5nID0gJycsIGRhdGE6IGFueSA9IHt9KTogSFRNTEVsZW1lbnQge1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBhdHRycykge1xuICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoa2V5LCBhdHRyc1trZXldKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAoY29uc3QgbmFtZSBvZiBjbGFzc2VzKSB7XG4gICAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQobmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRleHQgIT09ICcnKSB7XG4gICAgICAgICAgICBlbGVtZW50LnRleHRDb250ZW50ID0gdGV4dDtcbiAgICAgICAgfVxuICAgICAgICAvLyBmb3IgKGNvbnN0IGtleSBpbiBkYXRhKSB7XG4gICAgICAgIC8vICAgICBlbGVtZW50LmRhdGFzZXRba2V5XSA9IGRhdGFba2V5XTtcbiAgICAgICAgLy8gfVxuXG4gICAgICAgIHJldHVybiBlbGVtZW50O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIHNlbGVjdG9yXG4gICAgICogQHJldHVybnMge05vZGVMaXN0T2Y8RWxlbWVudD59XG4gICAgICovXG4gICAgc3RhdGljIGZpbmQoc2VsZWN0b3I6IHN0cmluZywgY29udGV4dDogYW55ID0gZG9jdW1lbnQpOiBOb2RlTGlzdE9mPEVsZW1lbnQ+IHtcbiAgICAgICAgaWYgKGNvbnRleHQgaW5zdGFuY2VvZiBEb2N1bWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGNvbnRleHQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gICAgICAgIH0gZWxzZSBpZiAoY29udGV4dCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gY29udGV4dC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsOyAvLyBUT0RPIHJldHVybiBhIGJsYW5rIE5vZGVMaXN0T2Y8RWxlbWVudD5cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIHNlbGVjdG9yXG4gICAgICogQHJldHVybnMge0VsZW1lbnR8bnVsbH1cbiAgICAgKi9cbiAgICBzdGF0aWMgZmluZEZpcnN0KHNlbGVjdG9yOiBzdHJpbmcsIGNvbnRleHQ6IGFueSA9IGRvY3VtZW50KTogRWxlbWVudCB7XG4gICAgICAgIGlmIChjb250ZXh0IGluc3RhbmNlb2YgRG9jdW1lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBjb250ZXh0LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgICAgICB9IGVsc2UgaWYgKGNvbnRleHQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGNvbnRleHQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0gbmFtZVxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIGFuIGVsZW1lbnQgY29udGFpbnMgYSBjbGFzcyBuYW1lXG4gICAgICovXG4gICAgc3RhdGljIGhhc0NsYXNzKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQgIT09IG51bGwgJiYgZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMobmFtZSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0gbmFtZVxuICAgICAqIEByZXR1cm5zIHtFbGVtZW50fVxuICAgICAqL1xuICAgIHN0YXRpYyBhZGRDbGFzcyhlbGVtZW50OiBIVE1MRWxlbWVudCwgbmFtZTogc3RyaW5nKTogSFRNTEVsZW1lbnQgfCBudWxsIHtcbiAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKG5hbWUpO1xuICAgICAgICByZXR1cm4gZWxlbWVudDtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZWxlbWVudFxuICAgICAqIEBwYXJhbSBuYW1lXG4gICAgICogQHJldHVybnMge0VsZW1lbnR9XG4gICAgICovXG4gICAgc3RhdGljIHJlbW92ZUNsYXNzKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBuYW1lOiBzdHJpbmcpOiBIVE1MRWxlbWVudCB8IG51bGwge1xuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUobmFtZSk7XG4gICAgICAgIHJldHVybiBlbGVtZW50O1xuICAgIH07XG5cblxuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZWxlbWVudFxuICAgICAqIEBwYXJhbSBuYW1lXG4gICAgICogQHJldHVybnMge0VsZW1lbnR9XG4gICAgICovXG4gICAgc3RhdGljIHJlbW92ZShzZWxlY3Rvcjogc3RyaW5nLCBjb250ZXh0OiBhbnkgPSBkb2N1bWVudCk6IE5vZGVMaXN0T2Y8RWxlbWVudD4gfCBudWxsIHtcbiAgICAgICAgbGV0IGxpc3Q6IE5vZGVMaXN0T2Y8RWxlbWVudD4gPSBkb20uZmluZChzZWxlY3RvciwgY29udGV4dCk7XG4gICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBsaXN0W2ldLnJlbW92ZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsaXN0O1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBwYXJhbSBlbGVtZW50XG4gICAgICogQHBhcmFtIG5hbWVcbiAgICAgKiBAcmV0dXJucyB7RWxlbWVudH1cbiAgICAgKi9cbiAgICBzdGF0aWMgdG9nZ2xlQ2xhc3MoZWxlbWVudDogRWxlbWVudCwgbmFtZTogc3RyaW5nKTogRWxlbWVudCB8IG51bGwge1xuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUobmFtZSk7XG4gICAgICAgIHJldHVybiBlbGVtZW50O1xuICAgIH1cblxuICAgIC8vXG4gICAgLy8gLyoqXG4gICAgLy8gICogUmV0dXJucyB3aXRoIGVsZW1lbnQgYmluZGVkIGRhdGEuXG4gICAgLy8gICogQHBhcmFtIGVsZW1lbnRcbiAgICAvLyAgKiBAcGFyYW0ga2V5XG4gICAgLy8gICogQHJldHVybnMge2FueX1cbiAgICAvLyAgKi9cbiAgICAvLyBzdGF0aWMgZ2V0RGF0YShlbGVtZW50OiBIVE1MRWxlbWVudCwga2V5OiBzdHJpbmcgPSBudWxsKTogYW55IHtcbiAgICAvLyAgICAgaWYgKCFkb20uaGFzRGF0YShlbGVtZW50LCBrZXkpKSB7XG4gICAgLy8gICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAvLyAgICAgfSBlbHNlIGlmIChrZXkgPT09IG51bGwpIHtcbiAgICAvLyAgICAgICAgIHJldHVybiBkb20uZGF0YS5nZXQoZWxlbWVudCk7XG4gICAgLy8gICAgIH0gZWxzZSB7XG4gICAgLy8gICAgICAgICByZXR1cm4gZG9tLmRhdGEuZ2V0KGVsZW1lbnQpW2tleV07XG4gICAgLy8gICAgIH1cbiAgICAvLyB9XG4gICAgLy9cbiAgICAvLyAvKipcbiAgICAvLyAgKiBCaW5kcyB3aXRoIGFuIGVsZW1lbnQgYSBkYXRhLlxuICAgIC8vICAqIEBwYXJhbSBlbGVtZW50XG4gICAgLy8gICogQHBhcmFtIGtleVxuICAgIC8vICAqIEBwYXJhbSB2YWx1ZVxuICAgIC8vICAqL1xuICAgIC8vIHN0YXRpYyBzZXREYXRhKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBrZXk6IHN0cmluZywgdmFsdWU6IGFueSk6IHZvaWQge1xuICAgIC8vICAgICBpZiAoIWRvbS5oYXNEYXRhKGVsZW1lbnQpKSB7XG4gICAgLy8gICAgICAgICBkb20uZGF0YS5zZXQoZWxlbWVudCwge2tleTogdmFsdWV9KTtcbiAgICAvLyAgICAgfSBlbHNlIHtcbiAgICAvLyAgICAgICAgIGxldCB0bXAgPSBkb20uZ2V0RGF0YShlbGVtZW50KTtcbiAgICAvLyAgICAgICAgIHRtcFtrZXldID0gdmFsdWU7XG4gICAgLy8gICAgICAgICBkb20uZGF0YS5zZXQoZWxlbWVudCwgdG1wKTtcbiAgICAvLyAgICAgfVxuICAgIC8vIH1cbiAgICAvL1xuICAgIC8vIC8qKlxuICAgIC8vICAqIENoZWNrcyBpZiB0aGUgZWxlbWVudCBpcyBiaW5kaW5nIHdpdGggYSBkYXRhXG4gICAgLy8gICogQHBhcmFtIGVsZW1lbnRcbiAgICAvLyAgKiBAcGFyYW0ga2V5XG4gICAgLy8gICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgLy8gICovXG4gICAgLy8gc3RhdGljIGhhc0RhdGEoZWxlbWVudDogSFRNTEVsZW1lbnQsIGtleTogc3RyaW5nID0gbnVsbCk6IGJvb2xlYW4ge1xuICAgIC8vICAgICBpZiAoIWRvbS5kYXRhLmhhcyhlbGVtZW50KSkge1xuICAgIC8vICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIC8vICAgICB9IGVsc2UgaWYgKGtleSA9PT0gbnVsbCkge1xuICAgIC8vICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgLy8gICAgIH0gZWxzZSB7XG4gICAgLy8gICAgICAgICByZXR1cm4gZG9tLmdldERhdGEoZWxlbWVudClba2V5XSAhPT0gbnVsbCA/IHRydWUgOiBmYWxzZTtcbiAgICAvLyAgICAgfVxuICAgIC8vIH1cbiAgICAvL1xuICAgIC8vIC8qKlxuICAgIC8vICAqIERlbGV0ZXMgd2l0aCBhbiBlbGVtZW50IGJpbmRpbmcgZGF0YVxuICAgIC8vICAqIEBwYXJhbSBlbGVtZW50XG4gICAgLy8gICogQHBhcmFtIGtleVxuICAgIC8vICAqL1xuICAgIC8vIHN0YXRpYyBkZWxldGVEYXRhKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBrZXk6IHN0cmluZyA9IG51bGwpOiB2b2lkIHtcbiAgICAvLyAgICAgaWYgKGRvbS5oYXNEYXRhKGVsZW1lbnQsIGtleSkpIHtcbiAgICAvLyAgICAgICAgIGlmIChrZXkgPT09IG51bGwpIHtcbiAgICAvLyAgICAgICAgICAgICBkb20uZGF0YS5kZWxldGUoZWxlbWVudCk7XG4gICAgLy8gICAgICAgICB9IGVsc2Uge1xuICAgIC8vICAgICAgICAgICAgIGxldCB0bXAgPSBkb20uZ2V0RGF0YShlbGVtZW50KTtcbiAgICAvLyAgICAgICAgICAgICBkZWxldGUgdG1wW2tleV07XG4gICAgLy8gICAgICAgICAgICAgZG9tLmRhdGEuc2V0KGVsZW1lbnQsIHRtcCk7XG4gICAgLy8gICAgICAgICB9XG4gICAgLy8gICAgIH1cbiAgICAvLyB9XG59IiwiaW1wb3J0ICogYXMgbWV0YWRvciBmcm9tICcuL09sNCc7XG5cbmRlY2xhcmUgdmFyIENvbmZpZ3VyYXRpb246IGFueTtcblxubGV0IGNvbnRleHQ6IGFueSA9IHdpbmRvdztcbmNvbnRleHQuc3BhdGlhbCA9IG1ldGFkb3I7XG5cbmV4cG9ydCBmdW5jdGlvbiBpbml0KCkge1xuXG4gICAgdmFyIG1ldGFkb3JNYXBDb25maWcgPSB7XG4gICAgICAgIG1hcDoge1xuICAgICAgICAgICAgdGFyZ2V0OiAnbWFwJyxcbiAgICAgICAgICAgIHNyczogW1wiRVBTRzo0MzI2XCIsIFwiRVBTRzozMTQ2NlwiLCBcIkVQU0c6MjU4MzJcIl1cbiAgICAgICAgfSxcbiAgICAgICAgdmlldzoge1xuICAgICAgICAgICAgcHJvamVjdGlvbjogQ29uZmlndXJhdGlvbi5zZXR0aW5nc1snbWFwX2NycyddLC8vJzogJzksNDksMTEsNTMnLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnXG4gICAgICAgICAgICBtYXhFeHRlbnQ6IENvbmZpZ3VyYXRpb24uc2V0dGluZ3NbJ21hcF9iYm94X21heCddLnNwbGl0KC8sXFxzPy8pLC8vWzUuOCwgNDcuMCwgMTUuMCwgNTUuMF0sIC8vIHByaW9yaXR5IGZvciBzY2FsZXMgb3IgZm9yIG1heEV4dGVudD9cbiAgICAgICAgICAgIHN0YXJ0RXh0ZW50OiBDb25maWd1cmF0aW9uLnNldHRpbmdzWydtYXBfYmJveF9zdGFydCddLnNwbGl0KC8sXFxzPy8pLFxuICAgICAgICAgICAgc2NhbGVzOiBbNTAwMCwgMjUwMDAsIDUwMDAwLCAxMDAwMDAsIDIwMDAwMCwgMjUwMDAwLCA1MDAwMDAsIDEwMDAwMDAsIDIwMDAwMDAsIDUwMDAwMDAsIDEwMDAwMDAwXS8vLCAyMDAwMDAwMCwgNTAwMDAwMDBdXG4gICAgICAgIH0sXG4gICAgICAgIHN0eWxlczoge1xuICAgICAgICAgICAgaGlnaGxpZ2h0OiB7XG4gICAgICAgICAgICAgICAgZmlsbDoge1xuICAgICAgICAgICAgICAgICAgICBjb2xvcjogJ3JnYmEoNjAsIDYwLCAyNTUsIDAuMSknXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzdHJva2U6IHtcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICdyZ2JhKDYwLCA2MCwgMjU1LCAxLjApJyxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2VhcmNoOiB7XG4gICAgICAgICAgICAgICAgZmlsbDoge1xuICAgICAgICAgICAgICAgICAgICBjb2xvcjogJ3JnYmEoMjU1LCA2MCwgNjAsIDAuMSknXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzdHJva2U6IHtcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICdyZ2JhKDI1NSwgNjAsIDYwLCAxLjApJyxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDJcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGltYWdlOiB7XG4gICAgICAgICAgICAgICAgICAgIGNpcmNsZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmFkaXVzOiA1LFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsbDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiAncmdiYSgyNTUsIDYwLCA2MCwgMC42KSdcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgc291cmNlOiBbXSxcbiAgICAgICAgLy8gYWRkIGFkZGl0aW9uYWwgcGFyYW1ldGVycyB3aXRoICsgXCJBRERJVElPTkFMXCJcbiAgICAgICAgcHJvajREZWZzOiB7XG4gICAgICAgICAgICBcIkVQU0c6NDMyNlwiOiBcIitwcm9qPWxvbmdsYXQgK2RhdHVtPVdHUzg0ICt1bml0cz1kZWdyZWVzICtub19kZWZzXCIgKyBcIiArYXhpcz1uZXVcIixcbiAgICAgICAgICAgIFwiRVBTRzo0MjU4XCI6IFwiK3Byb2o9bG9uZ2xhdCArZWxscHM9R1JTODAgK3Rvd2dzODQ9MCwwLDAsMCwwLDAsMCArbm9fZGVmc1wiICsgXCIgK3VuaXRzPWRlZ3JlZXMgK2F4aXM9bmV1XCIsXG4gICAgICAgICAgICBcIkVQU0c6MzE0NjZcIjogXCIrcHJvaj10bWVyYyArbGF0XzA9MCArbG9uXzA9NiAraz0xICt4XzA9MjUwMDAwMCAreV8wPTAgK2VsbHBzPWJlc3NlbCArdG93Z3M4ND01OTguMSw3My43LDQxOC4yLDAuMjAyLDAuMDQ1LC0yLjQ1NSw2LjcgK3VuaXRzPW0gK25vX2RlZnNcIiArIFwiICtheGlzPW5ldVwiLFxuICAgICAgICAgICAgXCJFUFNHOjMxNDY3XCI6IFwiK3Byb2o9dG1lcmMgK2xhdF8wPTAgK2xvbl8wPTkgK2s9MSAreF8wPTM1MDAwMDAgK3lfMD0wICtlbGxwcz1iZXNzZWwgK3Rvd2dzODQ9NTk4LjEsNzMuNyw0MTguMiwwLjIwMiwwLjA0NSwtMi40NTUsNi43ICt1bml0cz1tICtub19kZWZzXCIgKyBcIiArYXhpcz1uZXVcIixcbiAgICAgICAgICAgIC8vIFwiRVBTRzozMTQ2OFwiOiBcIitwcm9qPXRtZXJjICtsYXRfMD0wICtsb25fMD0xMiAraz0xICt4XzA9NDUwMDAwMCAreV8wPTAgK2VsbHBzPWJlc3NlbCArdG93Z3M4ND01OTguMSw3My43LDQxOC4yLDAuMjAyLDAuMDQ1LC0yLjQ1NSw2LjcgK3VuaXRzPW0gK25vX2RlZnNcIiArIFwiICtheGlzPW5ldVwiLFxuICAgICAgICAgICAgLy8gXCJFUFNHOjMxNDY5XCI6IFwiK3Byb2o9dG1lcmMgK2xhdF8wPTAgK2xvbl8wPTE1ICtrPTEgK3hfMD01NTAwMDAwICt5XzA9MCArZWxscHM9YmVzc2VsICt0b3dnczg0PTU5OC4xLDczLjcsNDE4LjIsMC4yMDIsMC4wNDUsLTIuNDU1LDYuNyArdW5pdHM9bSArbm9fZGVmc1wiICsgXCIgK2F4aXM9bmV1XCIsXG4gICAgICAgICAgICBcIkVQU0c6MjU4MzJcIjogXCIrcHJvaj11dG0gK3pvbmU9MzIgK2VsbHBzPUdSUzgwICt0b3dnczg0PTAsMCwwLDAsMCwwLDAgK3VuaXRzPW0gK25vX2RlZnNcIixcbiAgICAgICAgICAgIC8vIFwiRVBTRzoyNTgzM1wiOiBcIitwcm9qPXV0bSArem9uZT0zMyArZWxscHM9R1JTODAgK3Rvd2dzODQ9MCwwLDAsMCwwLDAsMCArdW5pdHM9bSArbm9fZGVmc1wiXG4gICAgICAgIH0sXG4gICAgICAgIGNvbXBvbmVudDogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNsYXNzOiAnJyxcbiAgICAgICAgICAgICAgICBzZWxlY3RvcjogXCJcIlxuICAgICAgICAgICAgfVxuICAgICAgICBdXG4gICAgfTtcblxuICAgIC8vIGNvbnNvbGUubG9nKENvbmZpZ3VyYXRpb24pO1xuICAgIGZvciAoY29uc3Qga2V5IGluIENvbmZpZ3VyYXRpb24uY29uZmlnLm1hcF9iYWNrZ3JvdW5kKSB7XG4gICAgICAgIGxldCB3bXMgPSBDb25maWd1cmF0aW9uLmNvbmZpZy5tYXBfYmFja2dyb3VuZFtrZXldO1xuICAgICAgICBsZXQgbGF5ZXJzID0gW107XG4gICAgICAgIGZvciAoY29uc3QgbCBpbiB3bXMubGF5ZXJzKSB7XG4gICAgICAgICAgICBsYXllcnMucHVzaCh3bXMubGF5ZXJzW2xdKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBjb25zb2xlLmxvZyh3bXMpO1xuICAgICAgICBtZXRhZG9yTWFwQ29uZmlnLnNvdXJjZS5wdXNoKHtcbiAgICAgICAgICAgICd0eXBlJzogJ1dNUycsXG4gICAgICAgICAgICAndXJsJzogd21zLnVybCxcbiAgICAgICAgICAgICd0aXRsZSc6IHdtcy50aXRsZSxcbiAgICAgICAgICAgICdvcGFjaXR5Jzogd21zLm9wYWNpdHksXG4gICAgICAgICAgICAndmlzaWJsZSc6IHdtcy52aXNpYmxlLFxuICAgICAgICAgICAgJ3BhcmFtcyc6IHtcbiAgICAgICAgICAgICAgICAnTEFZRVJTJzogbGF5ZXJzLmpvaW4oXCIsXCIpLFxuICAgICAgICAgICAgICAgICdWRVJTSU9OJzogd21zLnZlcnNpb24sXG4gICAgICAgICAgICAgICAgJ0ZPUk1BVCc6IHdtcy5mb3JtYXRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8vIGNvbnNvbGUubG9nKG1ldGFkb3JNYXBDb25maWcpO1xuICAgIGxldCBtZXRhZG9yTWFwID0gbWV0YWRvci5PbDRNYXAuY3JlYXRlKG1ldGFkb3JNYXBDb25maWcpO1xuICAgIC8vIG1ldGFkb3JNYXAuaW5pdExheWVydHJlZSgpO1xuICAgIGNvbnRleHQuc3BhdGlhbFsnbWFwJ10gPSBtZXRhZG9yTWFwO1xuICAgIC8vIG1ldGFkb3JbJ21ldGFkb3JNYXAnXSA9IG1ldGFkb3JNYXA7XG4gICAgLy8gbWV0YWRvclsnZ2VvbUxvYWRlciddID0gbmV3IG1ldGFkb3IuR2VvbUxvYWRlcihtZXRhZG9yTWFwLCA8SFRNTEZvcm1FbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNmaWxlLXVwbG9hZC1mb3JtJykpO1xufVxuaW5pdCgpOyJdfQ==
