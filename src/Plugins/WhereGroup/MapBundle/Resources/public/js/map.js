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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvUGx1Z2lucy9XaGVyZUdyb3VwL01hcEJ1bmRsZS9SZXNvdXJjZXMvdHMvRHJhZ1pvb20udHMiLCJzcmMvUGx1Z2lucy9XaGVyZUdyb3VwL01hcEJ1bmRsZS9SZXNvdXJjZXMvdHMvRmVhdHVyZUluZm8udHMiLCJzcmMvUGx1Z2lucy9XaGVyZUdyb3VwL01hcEJ1bmRsZS9SZXNvdXJjZXMvdHMvTGF5ZXJUcmVlLnRzIiwic3JjL1BsdWdpbnMvV2hlcmVHcm91cC9NYXBCdW5kbGUvUmVzb3VyY2VzL3RzL09sNC50cyIsInNyYy9QbHVnaW5zL1doZXJlR3JvdXAvTWFwQnVuZGxlL1Jlc291cmNlcy90cy9PbDRTb3VyY2UudHMiLCJzcmMvUGx1Z2lucy9XaGVyZUdyb3VwL01hcEJ1bmRsZS9SZXNvdXJjZXMvdHMvZG9tLnRzIiwic3JjL1BsdWdpbnMvV2hlcmVHcm91cC9NYXBCdW5kbGUvUmVzb3VyY2VzL3RzL21hcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsNkJBQTBCO0FBRTFCO0lBS0ksa0JBQVksR0FBVztRQUNuQixJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQztRQUNqQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksRUFBRSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUM7WUFDeEMsU0FBUyxFQUFFO2dCQUNQLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDaEIsQ0FBQztTQUNKLENBQUMsQ0FBQztRQUNILFNBQUcsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNyRyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FB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LENBQUM7UUFFRCxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQ3pCLE1BQU0sRUFBRSxLQUFLO1lBQ2IsS0FBSyxFQUFFLEdBQUcsQ0FBQyxHQUFHO1lBQ2QsT0FBTyxFQUFFLEdBQUcsQ0FBQyxLQUFLO1lBQ2xCLFNBQVMsRUFBRSxHQUFHLENBQUMsT0FBTztZQUN0QixTQUFTLEVBQUUsR0FBRyxDQUFDLE9BQU87WUFDdEIsUUFBUSxFQUFFO2dCQUNOLFFBQVEsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQztnQkFDMUIsU0FBUyxFQUFFLEdBQUcsQ0FBQyxPQUFPO2dCQUN0QixRQUFRLEVBQUUsR0FBRyxDQUFDLE1BQU07YUFDdkI7U0FDSixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUV6RCxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLFVBQVUsQ0FBQztBQUd4QyxDQUFDO0FBeEZELG9CQXdGQztBQUNELElBQUksRUFBRSxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCB7ZG9tfSBmcm9tICcuL2RvbSc7XG5cbmV4cG9ydCBjbGFzcyBEcmFnWm9vbSB7XG4gICAgcHJpdmF0ZSBzdGF0aWMgYnV0dG9uU2VsZWN0b3I6IHN0cmluZyA9ICcuLWpzLXpvb20tYm94JztcbiAgICBwcml2YXRlIGRyYWd6b29tOiBvbC5pbnRlcmFjdGlvbi5EcmFnWm9vbTtcbiAgICBwcml2YXRlIG9sTWFwOiBvbC5NYXA7XG5cbiAgICBjb25zdHJ1Y3RvcihtYXA6IG9sLk1hcCkge1xuICAgICAgICB0aGlzLm9sTWFwID0gbWFwO1xuICAgICAgICB0aGlzLmRyYWd6b29tID0gbmV3IG9sLmludGVyYWN0aW9uLkRyYWdab29tKHtcbiAgICAgICAgICAgIGNvbmRpdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgZG9tLmZpbmRGaXJzdChEcmFnWm9vbS5idXR0b25TZWxlY3RvcikuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLmJ1dHRvbkNsaWNrLmJpbmQodGhpcyksIGZhbHNlKTtcbiAgICAgICAgdGhpcy5kcmFnem9vbS5vbignYm94ZW5kJywgdGhpcy5kZWFjdGl2YXRlLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIHByaXZhdGUgYnV0dG9uQ2xpY2soZSkge1xuICAgICAgICBpZiAoIWRvbS5oYXNDbGFzcyhlLnRhcmdldCwgJ3N1Y2Nlc3MnKSkge1xuICAgICAgICAgICAgdGhpcy5hY3RpdmF0ZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5kZWFjdGl2YXRlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGFjdGl2YXRlKCkge1xuICAgICAgICBkb20uYWRkQ2xhc3MoPEhUTUxFbGVtZW50PmRvbS5maW5kRmlyc3QoRHJhZ1pvb20uYnV0dG9uU2VsZWN0b3IpLCAnc3VjY2VzcycpO1xuICAgICAgICB0aGlzLm9sTWFwLmFkZEludGVyYWN0aW9uKHRoaXMuZHJhZ3pvb20pO1xuICAgIH1cblxuICAgIHByaXZhdGUgZGVhY3RpdmF0ZSgpIHtcbiAgICAgICAgZG9tLnJlbW92ZUNsYXNzKDxIVE1MRWxlbWVudD5kb20uZmluZEZpcnN0KERyYWdab29tLmJ1dHRvblNlbGVjdG9yKSwgJ3N1Y2Nlc3MnKTtcbiAgICAgICAgdGhpcy5vbE1hcC5yZW1vdmVJbnRlcmFjdGlvbih0aGlzLmRyYWd6b29tKTtcbiAgICB9XG59IiwiaW1wb3J0IHtVVUlEfSBmcm9tICcuL09sNCc7XG5pbXBvcnQge2RvbX0gZnJvbSAnLi9kb20nO1xuXG5leHBvcnQgY2xhc3MgRmVhdHVyZUluZm8ge1xuICAgIHByaXZhdGUgc3RhdGljIGJ1dHRvblNlbGVjdG9yOiBzdHJpbmcgPSAnLi1qcy1tYXAtaW5mbyc7XG4gICAgcHJpdmF0ZSBzdGF0aWMgc2VsZWN0Q2xhc3M6IHN0cmluZyA9ICdzZWxlY3QnO1xuICAgIHByaXZhdGUgc3RhdGljIGtleUlkOiBzdHJpbmcgPSAndXVpZCc7XG4gICAgcHJpdmF0ZSBzdGF0aWMga2V5VGl0bGU6IHN0cmluZyA9ICd0aXRsZSc7XG4gICAgcHJpdmF0ZSBzdGF0aWMga2V5QWx0ZXJuYXRlVGl0bGU6IHN0cmluZyA9ICdhbHRlcm5hdGVUaXRsZSc7XG4gICAgcHJpdmF0ZSBzdGF0aWMgaXRlbVRhZ05hbWU6IHN0cmluZyA9ICdzcGFuJztcbiAgICBwcml2YXRlIG9sTWFwOiBvbC5NYXA7XG4gICAgcHJpdmF0ZSB0b29sdGlwOiBvbC5PdmVybGF5O1xuICAgIHByaXZhdGUgdG9vbHRpcEVsbTogSFRNTEVsZW1lbnQ7XG4gICAgcHJpdmF0ZSBsYXllcjogb2wubGF5ZXIuVmVjdG9yO1xuXG4gICAgY29uc3RydWN0b3IobWFwOiBvbC5NYXAsIGxheWVyOiBvbC5sYXllci5WZWN0b3IgPSBudWxsKSB7XG4gICAgICAgIHRoaXMub2xNYXAgPSBtYXA7XG4gICAgICAgIHRoaXMubGF5ZXIgPSBsYXllcjtcbiAgICAgICAgZG9tLmZpbmRGaXJzdChGZWF0dXJlSW5mby5idXR0b25TZWxlY3RvcikuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLmJ1dHRvbkNsaWNrLmJpbmQodGhpcyksIGZhbHNlKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGJ1dHRvbkNsaWNrKGUpIHtcbiAgICAgICAgaWYgKCFkb20uaGFzQ2xhc3MoZS5jdXJyZW50VGFyZ2V0LCAnc3VjY2VzcycpKSB7XG4gICAgICAgICAgICB0aGlzLmFjdGl2YXRlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmRlYWN0aXZhdGUoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYWN0aXZhdGUoKSB7XG4gICAgICAgIGRvbS5hZGRDbGFzcyg8SFRNTEVsZW1lbnQ+ZG9tLmZpbmRGaXJzdChGZWF0dXJlSW5mby5idXR0b25TZWxlY3RvciksICdzdWNjZXNzJyk7XG4gICAgICAgIHRoaXMub2xNYXAub24oJ2NsaWNrJywgdGhpcy5tYXBDbGljaywgdGhpcyk7XG4gICAgICAgIHRoaXMudG9vbHRpcEVsbSA9IGRvbS5jcmVhdGUoJ2RpdicsIHt9LCBbJ3Rvb2x0aXAnLCAnaGlkZGVuJ10pO1xuICAgICAgICB0aGlzLnRvb2x0aXBFbG0uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLml0ZW1DbGljay5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgICAgIHRoaXMudG9vbHRpcCA9IG5ldyBvbC5PdmVybGF5KHtcbiAgICAgICAgICAgIGVsZW1lbnQ6IHRoaXMudG9vbHRpcEVsbSxcbiAgICAgICAgICAgIG9mZnNldDogWzAsIC02XSxcbiAgICAgICAgICAgIHBvc2l0aW9uaW5nOiAnYm90dG9tLWNlbnRlcidcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMub2xNYXAuYWRkT3ZlcmxheSh0aGlzLnRvb2x0aXApO1xuICAgIH1cblxuICAgIHByaXZhdGUgZGVhY3RpdmF0ZSgpIHtcbiAgICAgICAgZG9tLnJlbW92ZUNsYXNzKDxIVE1MRWxlbWVudD5kb20uZmluZEZpcnN0KEZlYXR1cmVJbmZvLmJ1dHRvblNlbGVjdG9yKSwgJ3N1Y2Nlc3MnKTtcbiAgICAgICAgdGhpcy50b29sdGlwRWxtLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5pdGVtQ2xpY2suYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMudG9vbHRpcEVsbS5yZW1vdmUoKTtcbiAgICAgICAgdGhpcy5vbE1hcC5yZW1vdmVPdmVybGF5KHRoaXMudG9vbHRpcCk7XG4gICAgICAgIHRoaXMub2xNYXAudW4oJ2NsaWNrJywgdGhpcy5tYXBDbGljaywgdGhpcyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpdGVtQ2xpY2soZTogRXZlbnQpIHtcbiAgICAgICAgaWYgKCg8YW55PmUudGFyZ2V0KS50YWdOYW1lID09PSBGZWF0dXJlSW5mby5pdGVtVGFnTmFtZS50b1VwcGVyQ2FzZSgpKSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdERhdGFzZXQoKDxIVE1MRWxlbWVudD5lLnRhcmdldCkuZ2V0QXR0cmlidXRlKEZlYXR1cmVJbmZvLmRhdGFBdHRyTmFtZShGZWF0dXJlSW5mby5rZXlJZCkpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXRpYyBkYXRhQXR0ck5hbWUobmFtZTogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiAnZGF0YS0nICsgbmFtZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG1hcENsaWNrKGU6IG9sLk1hcEJyb3dzZXJFdmVudCkge1xuICAgICAgICB0aGlzLnRvb2x0aXBFbG0uaW5uZXJIVE1MID0gJyc7XG4gICAgICAgIGxldCBsYXkgPSB0aGlzLmxheWVyO1xuICAgICAgICBsZXQgZmVhdHVyZXM6IG9sLkZlYXR1cmVbXSA9IG5ldyBBcnJheTxvbC5GZWF0dXJlPigpO1xuICAgICAgICB0aGlzLm9sTWFwLmZvckVhY2hGZWF0dXJlQXRQaXhlbChlLnBpeGVsLCBmdW5jdGlvbiAoZmVhdHVyZTogb2wuRmVhdHVyZSkge1xuICAgICAgICAgICAgZmVhdHVyZXMucHVzaChmZWF0dXJlKTtcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgbGF5ZXJGaWx0ZXI6IGZ1bmN0aW9uIChsYXllcikge1xuICAgICAgICAgICAgICAgIHJldHVybiBsYXllci5nZXQoVVVJRCkgPT09IGxheS5nZXQoVVVJRCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoZmVhdHVyZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBkb20uYWRkQ2xhc3ModGhpcy50b29sdGlwRWxtLCAnaGlkZGVuJyk7XG4gICAgICAgIH0gZWxzZSBpZiAoZmVhdHVyZXMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICBkb20uYWRkQ2xhc3ModGhpcy50b29sdGlwRWxtLCAnaGlkZGVuJyk7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdERhdGFzZXQoZmVhdHVyZXNbMF0uZ2V0KEZlYXR1cmVJbmZvLmtleUlkKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3IgKGxldCBmZWF0dXJlIG9mIGZlYXR1cmVzKSB7XG4gICAgICAgICAgICAgICAgbGV0IGRhdGFBdHRyID0gRmVhdHVyZUluZm8uZGF0YUF0dHJOYW1lKEZlYXR1cmVJbmZvLmtleUlkKTtcbiAgICAgICAgICAgICAgICBsZXQgdGl0bGUgPSBmZWF0dXJlLmdldChGZWF0dXJlSW5mby5rZXlUaXRsZSk7XG4gICAgICAgICAgICAgICAgbGV0IGFUaXRsZSA9IGZlYXR1cmUuZ2V0KEZlYXR1cmVJbmZvLmtleUFsdGVybmF0ZVRpdGxlKTtcbiAgICAgICAgICAgICAgICBsZXQgYXR0cnMgPSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGFBdHRyOiBmZWF0dXJlLmdldChGZWF0dXJlSW5mby5rZXlJZCksXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBhVGl0bGUgPyB0aXRsZSArICcgLyAnICsgYVRpdGxlIDogdGl0bGVcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGF0dHJzW0ZlYXR1cmVJbmZvLmRhdGFBdHRyTmFtZShGZWF0dXJlSW5mby5rZXlJZCldID0gZmVhdHVyZS5nZXQoRmVhdHVyZUluZm8ua2V5SWQpO1xuICAgICAgICAgICAgICAgIHRoaXMudG9vbHRpcEVsbS5hcHBlbmRDaGlsZChkb20uY3JlYXRlKEZlYXR1cmVJbmZvLml0ZW1UYWdOYW1lLCBhdHRycywgW10sIHRpdGxlKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnRvb2x0aXAuc2V0UG9zaXRpb24oZS5jb29yZGluYXRlKTtcbiAgICAgICAgICAgIGRvbS5yZW1vdmVDbGFzcyh0aGlzLnRvb2x0aXBFbG0sICdoaWRkZW4nKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgc2VsZWN0RGF0YXNldChzZWxlY3Rvcjogc3RyaW5nKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdzZXQgY2xhc3MgJyArIEZlYXR1cmVJbmZvLnNlbGVjdENsYXNzICsgJyBmb3IgZGF0YXNldCcgKyBzZWxlY3Rvcik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB1blNlbGVjdERhdGFzZXQoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdyZW1vdmUgY2xhc3MgJyArIEZlYXR1cmVJbmZvLnNlbGVjdENsYXNzICsgJyBmb3IgYWxsIGRhdGFzZXRzJyk7XG4gICAgfVxufSIsImltcG9ydCB7ZG9tfSBmcm9tICcuL2RvbSc7XG5pbXBvcnQge09sNE1hcCwgVElUTEUsIFVVSUR9IGZyb20gXCIuL09sNFwiO1xuXG4vLyBpbXBvcnQgKiBhcyAkIGZyb20gJ2pxdWVyeSc7XG5cbmV4cG9ydCBjbGFzcyBMYXllclRyZWUge1xuICAgIHByaXZhdGUgc3RhdGljIF9pbnN0YW5jZTogTGF5ZXJUcmVlO1xuICAgIHByaXZhdGUgc3RhdGljIG1heGxlbmd0aDogbnVtYmVyID0gMTY7XG4gICAgcHJpdmF0ZSBzdGF0aWMgdHJlZXNlbGVjdG9yOiBzdHJpbmcgPSAnLi1qcy1tYXAtbGF5ZXJ0cmVlIHVsLmxheWVyLXRyZWUtbGlzdCc7XG4gICAgcHJpdmF0ZSBzdGF0aWMgZHVtbXlzZWxlY3Rvcjogc3RyaW5nID0gJy4tanMtZHVtbXktbGF5ZXInO1xuICAgIHByaXZhdGUgc3RhdGljIHVzZU9wYWNpdHk6IGJvb2xlYW4gPSB0cnVlO1xuICAgIHByaXZhdGUgc3RhdGljIHVzZVZpc2libGU6IGJvb2xlYW4gPSB0cnVlO1xuICAgIHByaXZhdGUgc3RhdGljIHVzZVNvcnRhYmxlOiBib29sZWFuID0gdHJ1ZTtcbiAgICBwcml2YXRlIHN0YXRpYyBzaG93U3RhdHVzOiBib29sZWFuID0gdHJ1ZTtcbiAgICBwcml2YXRlIG9sNE1hcDogT2w0TWFwO1xuICAgIHByaXZhdGUgdHJlZTogSFRNTEVsZW1lbnQ7XG4gICAgcHJpdmF0ZSBjdXJyZW50TGF5ZXIgPSBudWxsO1xuICAgIHByaXZhdGUgb2xkUG9zaXRpb24gPSAwO1xuXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihvbDRNYXA6IE9sNE1hcCkge1xuICAgICAgICB0aGlzLm9sNE1hcCA9IG9sNE1hcDtcbiAgICAgICAgdGhpcy50cmVlID0gPEhUTUxFbGVtZW50PmRvbS5maW5kRmlyc3QoTGF5ZXJUcmVlLnRyZWVzZWxlY3Rvcik7XG4gICAgICAgIGlmIChMYXllclRyZWUudXNlU29ydGFibGUpIHtcbiAgICAgICAgICAgIGxldCBkdW1teSA9IGRvbS5maW5kRmlyc3QoTGF5ZXJUcmVlLmR1bW15c2VsZWN0b3IsIHRoaXMudHJlZSk7XG4gICAgICAgICAgICB0aGlzLmFkZERyYWdnYWJsZSg8SFRNTEVsZW1lbnQ+ZHVtbXksIHRydWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIGNyZWF0ZShvbDRNYXA6IE9sNE1hcCk6IExheWVyVHJlZSB7XG4gICAgICAgIGlmICghTGF5ZXJUcmVlLl9pbnN0YW5jZSkgey8vIHNpbmdsZXRvblxuICAgICAgICAgICAgTGF5ZXJUcmVlLl9pbnN0YW5jZSA9IG5ldyBMYXllclRyZWUob2w0TWFwKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gTGF5ZXJUcmVlLl9pbnN0YW5jZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGZpbmRMYXllckl0ZW0obGF5ZXI6IG9sLmxheWVyLkJhc2UpOiBIVE1MRWxlbWVudCB7XG4gICAgICAgIHJldHVybiA8SFRNTEVsZW1lbnQ+ZG9tLmZpbmRGaXJzdCgnIycgKyBsYXllci5nZXQoVVVJRCkpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZmluZExheWVyVmlzaWJsZShsYXllcjogb2wubGF5ZXIuQmFzZSk6IEhUTUxGb3JtRWxlbWVudCB7XG4gICAgICAgIHJldHVybiA8SFRNTEZvcm1FbGVtZW50PmRvbS5maW5kRmlyc3QoJyMnICsgbGF5ZXIuZ2V0KFVVSUQpICsgJyAuLWpzLW1hcC1zb3VyY2UtdmlzaWJsZScpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZmluZExheWVyT3BhY2l0eShsYXllcjogb2wubGF5ZXIuQmFzZSk6IEhUTUxGb3JtRWxlbWVudCB7XG4gICAgICAgIHJldHVybiA8SFRNTEZvcm1FbGVtZW50PmRvbS5maW5kRmlyc3QoJyMnICsgbGF5ZXIuZ2V0KFVVSUQpICsgJyAuLWpzLW1hcC1zb3VyY2Utb3BhY2l0eScpO1xuICAgIH1cblxuICAgIGdldFZpc2libGUobGF5ZXI6IG9sLmxheWVyLkJhc2UpIHtcbiAgICAgICAgbGV0IGNoZWNrYm94ID0gdGhpcy5maW5kTGF5ZXJWaXNpYmxlKGxheWVyKTtcbiAgICAgICAgcmV0dXJuIGNoZWNrYm94LmNoZWNrZWQ7XG4gICAgfVxuXG4gICAgc2V0VmlzaWJsZShsYXllcjogb2wubGF5ZXIuQmFzZSwgdmlzaWJsZTogYm9vbGVhbiwgYWN0aW9uOiBib29sZWFuID0gZmFsc2UpIHtcbiAgICAgICAgbGV0IGNoZWNrYm94ID0gdGhpcy5maW5kTGF5ZXJWaXNpYmxlKGxheWVyKTtcbiAgICAgICAgaWYgKGNoZWNrYm94LmNoZWNrZWQgIT09IHZpc2libGUgJiYgIWFjdGlvbikge1xuICAgICAgICAgICAgY2hlY2tib3guY2hlY2tlZCA9IHZpc2libGU7XG4gICAgICAgIH0gZWxzZSBpZiAoY2hlY2tib3guY2hlY2tlZCAhPT0gdmlzaWJsZSAmJiBhY3Rpb24pIHtcbiAgICAgICAgICAgIGNoZWNrYm94LmNsaWNrKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZXREaXNhYmxlKGxheWVyOiBvbC5sYXllci5CYXNlLCBkaXNhYmxlOiBib29sZWFuKSB7XG4gICAgICAgIGxldCBpdGVtID0gdGhpcy5maW5kTGF5ZXJJdGVtKGxheWVyKTtcbiAgICAgICAgbGV0IGNoZWNrYm94VmlzaWJsZSA9IHRoaXMuZmluZExheWVyVmlzaWJsZShsYXllcik7XG4gICAgICAgIGxldCBzZWxlY3RPcGFjaXR5ID0gdGhpcy5maW5kTGF5ZXJPcGFjaXR5KGxheWVyKTtcbiAgICAgICAgaWYgKGRpc2FibGUpIHtcbiAgICAgICAgICAgIGRvbS5hZGRDbGFzcyhpdGVtLCAnZGlzYWJsZWQnKTtcbiAgICAgICAgICAgIGNoZWNrYm94VmlzaWJsZS5zZXRBdHRyaWJ1dGUoJ2Rpc2FibGVkJywgJ3RydWUnKTtcbiAgICAgICAgICAgIHNlbGVjdE9wYWNpdHkuc2V0QXR0cmlidXRlKCdkaXNhYmxlZCcsICd0cnVlJylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRvbS5yZW1vdmVDbGFzcyhpdGVtLCAnZGlzYWJsZWQnKTtcbiAgICAgICAgICAgIGNoZWNrYm94VmlzaWJsZS5yZW1vdmVBdHRyaWJ1dGUoJ2Rpc2FibGVkJyk7XG4gICAgICAgICAgICBzZWxlY3RPcGFjaXR5LnJlbW92ZUF0dHJpYnV0ZSgnZGlzYWJsZWQnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgc3Vic3RyaW5nVGl0bGUodGV4dDogc3RyaW5nKSB7XG4gICAgICAgIGlmICh0ZXh0Lmxlbmd0aCA+IExheWVyVHJlZS5tYXhsZW5ndGgpIHtcbiAgICAgICAgICAgIHRleHQgPSB0ZXh0LnN1YnN0cmluZygwLCBMYXllclRyZWUubWF4bGVuZ3RoKTtcbiAgICAgICAgICAgIGlmICh0ZXh0Lmxhc3RJbmRleE9mKCcgJykgPiAwKSB7XG4gICAgICAgICAgICAgICAgdGV4dCA9IHRleHQuc3Vic3RyaW5nKDAsIHRleHQubGFzdEluZGV4T2YoJyAnKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfVxuXG4gICAgcmVtb3ZlKGxheWVyOiBvbC5sYXllci5CYXNlKSB7XG4gICAgICAgIGxldCBsYXllck5vZGUgPSB0aGlzLmZpbmRMYXllckl0ZW0obGF5ZXIpO1xuICAgICAgICBpZiAobGF5ZXJOb2RlKSB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZURyYWdnYWJsZSg8SFRNTEVsZW1lbnQ+bGF5ZXJOb2RlKTtcbiAgICAgICAgICAgIGxheWVyTm9kZS5yZW1vdmUoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFkZChsYXllcjogb2wubGF5ZXIuQmFzZSkge1xuICAgICAgICBsZXQgbGF5ZXJOb2RlID0gZG9tLmNyZWF0ZSgnbGknLCB7J2lkJzogbGF5ZXIuZ2V0KFVVSUQpLCAnZHJhZ2dhYmxlJzogXCJ0cnVlXCJ9LCBbJ2RyYWdnYWJsZScsICctanMtZHJhZ2dhYmxlJ10pO1xuICAgICAgICBpZiAoTGF5ZXJUcmVlLnVzZVZpc2libGUpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkVmlzaWJsZShsYXllck5vZGUsIGxheWVyKTtcbiAgICAgICAgfVxuICAgICAgICBsYXllck5vZGUuYXBwZW5kQ2hpbGQoXG4gICAgICAgICAgICBkb20uY3JlYXRlKCdsYWJlbCcsXG4gICAgICAgICAgICAgICAgeydpZCc6IGxheWVyLmdldChVVUlEKSwgJ2Zvcic6ICdjaGItJyArIGxheWVyLmdldChVVUlEKSwgJ3RpdGxlJzogbGF5ZXIuZ2V0KFRJVExFKX0sXG4gICAgICAgICAgICAgICAgWydmb3JtLWxhYmVsJ10sIHRoaXMuc3Vic3RyaW5nVGl0bGUobGF5ZXIuZ2V0KFRJVExFKSkpXG4gICAgICAgICk7XG4gICAgICAgIGlmIChMYXllclRyZWUudXNlT3BhY2l0eSkge1xuICAgICAgICAgICAgdGhpcy5hZGRPcGFjaXR5KGxheWVyTm9kZSwgbGF5ZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy50cmVlLmluc2VydEJlZm9yZShsYXllck5vZGUsIGRvbS5maW5kRmlyc3QoJ2xpJywgdGhpcy50cmVlKSk7XG4gICAgICAgIGlmIChMYXllclRyZWUudXNlU29ydGFibGUpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkRHJhZ2dhYmxlKGxheWVyTm9kZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGFkZFZpc2libGUobGF5ZXJOb2RlOiBIVE1MRWxlbWVudCwgbGF5ZXI6IG9sLmxheWVyLkJhc2UpIHtcbiAgICAgICAgbGV0IGlucHV0ID0gZG9tLmNyZWF0ZSgnaW5wdXQnLCB7J3R5cGUnOiAnY2hlY2tib3gnfSxcbiAgICAgICAgICAgIFsnY2hlY2snLCAnLWpzLW1hcC1zb3VyY2UtdmlzaWJsZSddKTtcbiAgICAgICAgKDxIVE1MRm9ybUVsZW1lbnQ+aW5wdXQpLmNoZWNrZWQgPSBsYXllci5nZXRWaXNpYmxlKCk7XG4gICAgICAgIGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIHRoaXMuY2hhbmdlVmlzaWJsZS5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgICAgIGxheWVyTm9kZS5hcHBlbmRDaGlsZChpbnB1dCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjaGFuZ2VWaXNpYmxlKGUpIHtcbiAgICAgICAgdGhpcy5vbDRNYXAuc2V0VmlzaWJsZShlLnRhcmdldC5wYXJlbnRFbGVtZW50LmlkLCBlLnRhcmdldC5jaGVja2VkKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFkZE9wYWNpdHkobGF5ZXJOb2RlOiBIVE1MRWxlbWVudCwgbGF5ZXI6IG9sLmxheWVyLkJhc2UpOiB2b2lkIHtcbiAgICAgICAgbGV0IHNlbGVjdCA9IGRvbS5jcmVhdGUoJ3NlbGVjdCcsIHt9LFxuICAgICAgICAgICAgWydpbnB1dC1lbGVtZW50JywgJ21lZGl1bScsICdzaW1wbGUnLCAnbWFwLXNvdXJjZS1vcGFjaXR5JywgJy1qcy1tYXAtc291cmNlLW9wYWNpdHknXSk7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPD0gMTA7IGkrKykge1xuICAgICAgICAgICAgc2VsZWN0LmFwcGVuZENoaWxkKGRvbS5jcmVhdGUoJ29wdGlvbicsIHsndmFsdWUnOiBpIC8gMTB9LCBbXSwgKGkgKiAxMCkgKyAnICUnKSk7XG4gICAgICAgIH1cbiAgICAgICAgKDxIVE1MRm9ybUVsZW1lbnQ+c2VsZWN0KS52YWx1ZSA9IGxheWVyLmdldE9wYWNpdHkoKS50b1N0cmluZygpO1xuICAgICAgICBzZWxlY3QuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgdGhpcy5jaGFuZ2VPcGFjaXR5LmJpbmQodGhpcyksIGZhbHNlKTtcbiAgICAgICAgbGF5ZXJOb2RlLmFwcGVuZENoaWxkKHNlbGVjdCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjaGFuZ2VPcGFjaXR5KGUpIHtcbiAgICAgICAgdGhpcy5vbDRNYXAuc2V0T3BhY2l0eShlLnRhcmdldC5wYXJlbnRFbGVtZW50LmlkLCBwYXJzZUZsb2F0KGUudGFyZ2V0LnZhbHVlKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhZGREcmFnZ2FibGUobGF5ZXI6IEhUTUxFbGVtZW50LCBpc0R1bW15OiBib29sZWFuID0gZmFsc2UpIHtcbiAgICAgICAgaWYgKCFpc0R1bW15KSB7XG4gICAgICAgICAgICBsYXllci5hZGRFdmVudExpc3RlbmVyKCdkcmFnc3RhcnQnLCB0aGlzLmRyYWdTdGFydC5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgICAgICAgICBsYXllci5hZGRFdmVudExpc3RlbmVyKCdkcmFnZW5kJywgdGhpcy5kcmFnRW5kLmJpbmQodGhpcyksIGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgICBsYXllci5hZGRFdmVudExpc3RlbmVyKCdkcmFnZW50ZXInLCB0aGlzLmRyYWdFbnRlci5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgICAgIGxheWVyLmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdvdmVyJywgdGhpcy5kcmFnT3Zlci5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgICAgIGxheWVyLmFkZEV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCB0aGlzLmRyYWdEcm9wLmJpbmQodGhpcyksIGZhbHNlKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlbW92ZURyYWdnYWJsZShsYXllcjogSFRNTEVsZW1lbnQsIGlzRHVtbXk6IGJvb2xlYW4gPSBmYWxzZSkge1xuICAgICAgICBpZiAoIWlzRHVtbXkpIHtcbiAgICAgICAgICAgIGxheWVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2RyYWdzdGFydCcsIHRoaXMuZHJhZ1N0YXJ0LmJpbmQodGhpcyksIGZhbHNlKTtcbiAgICAgICAgICAgIGxheWVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2RyYWdlbmQnLCB0aGlzLmRyYWdFbmQuYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgICAgICB9XG4gICAgICAgIGxheWVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2RyYWdlbnRlcicsIHRoaXMuZHJhZ0VudGVyLmJpbmQodGhpcyksIGZhbHNlKTtcbiAgICAgICAgbGF5ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcignZHJhZ292ZXInLCB0aGlzLmRyYWdPdmVyLmJpbmQodGhpcyksIGZhbHNlKTtcbiAgICAgICAgbGF5ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcignZHJvcCcsIHRoaXMuZHJhZ0Ryb3AuYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgIH1cblxuXG4gICAgcHJpdmF0ZSBkcmFnU3RhcnQoZSkge1xuICAgICAgICB0aGlzLmN1cnJlbnRMYXllciA9IGUudGFyZ2V0O1xuICAgICAgICB0aGlzLm9sZFBvc2l0aW9uID0gdGhpcy5nZXRMYXllclBvc2l0aW9uKHRoaXMuY3VycmVudExheWVyKTtcbiAgICAgICAgZS5kYXRhVHJhbnNmZXIuZWZmZWN0QWxsb3dlZCA9ICdtb3ZlJztcbiAgICAgICAgZS5kYXRhVHJhbnNmZXIuc2V0RGF0YSgndGV4dC9odG1sJywgdGhpcy5jdXJyZW50TGF5ZXIuaW5uZXJIVE1MKTtcbiAgICAgICAgZG9tLmFkZENsYXNzKHRoaXMuY3VycmVudExheWVyLCBcIm1vdmVcIik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBkcmFnT3ZlcihlKSB7XG4gICAgICAgIGlmIChlLnByZXZlbnREZWZhdWx0KSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICAgICAgZS5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9ICdtb3ZlJztcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHByaXZhdGUgZHJhZ0VudGVyKGUpIHtcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudExheWVyICYmIGUudGFyZ2V0ICE9PSB1bmRlZmluZWQgJiYgdGhpcy5jdXJyZW50TGF5ZXIgIT09IGUudGFyZ2V0KSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHRoaXMudHJlZS5pbnNlcnRCZWZvcmUoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudExheWVyLFxuICAgICAgICAgICAgICAgICAgICBlLnRhcmdldC5kcmFnZ2FibGUgPyBlLnRhcmdldCA6IGUudGFyZ2V0LnBhcmVudEVsZW1lbnRcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBkcmFnRHJvcChlKSB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZG9tLnJlbW92ZUNsYXNzKGUudGFyZ2V0LCBcIm92ZXJcIik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBkcmFnRW5kKGUpIHtcbiAgICAgICAgZG9tLnJlbW92ZUNsYXNzKGUudGFyZ2V0LCBcIm1vdmVcIik7XG4gICAgICAgIHRoaXMub2w0TWFwLm1vdmVMYXllcih0aGlzLmN1cnJlbnRMYXllci5pZCwgdGhpcy5vbGRQb3NpdGlvbiwgdGhpcy5nZXRMYXllclBvc2l0aW9uKHRoaXMuY3VycmVudExheWVyKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRMYXllclBvc2l0aW9uKGxheWVyKSB7XG4gICAgICAgIGxldCBsaXN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLi1qcy1tYXAtbGF5ZXJ0cmVlIHVsIC4tanMtZHJhZ2dhYmxlJyk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGxpc3RbaV0uaWQgPT09IGxheWVyLmlkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxpc3QubGVuZ3RoIC0gMSAtIGk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuIiwiaW1wb3J0ICogYXMgb2w0IGZyb20gJ29wZW5sYXllcnMnOy8vID8/P1xuLy8gaW1wb3J0ICogYXMganF1ZXJ5IGZyb20gJ2pxdWVyeSc7IC8vZXJyb3IgaW4gaW5kZXguZC50cyBmb3IgQHR5cGVzL2pxdWVyeVxuaW1wb3J0IHtMYXllclRyZWV9IGZyb20gJy4vTGF5ZXJUcmVlJztcbmltcG9ydCB7RHJhZ1pvb219IGZyb20gJy4vRHJhZ1pvb20nO1xuaW1wb3J0IHtPbDRTb3VyY2UsIE9sNFZlY3RvclNvdXJjZSwgT2w0V21zU291cmNlfSBmcm9tIFwiLi9PbDRTb3VyY2VcIlxuaW1wb3J0IHtGZWF0dXJlSW5mb30gZnJvbSBcIi4vRmVhdHVyZUluZm9cIjtcblxuZGVjbGFyZSBjbGFzcyBwcm9qNCB7XG4gICAgc3RhdGljIGRlZnMobmFtZTogc3RyaW5nLCBkZWY6IHN0cmluZyk6IHZvaWQ7XG59XG5cbi8vIGRlY2xhcmUgZnVuY3Rpb24gYWRkU291cmNlKGlkOiBzdHJpbmcsIHRpdGxlOiBzdHJpbmcsIHZpc2liaWxpdHk6IGJvb2xlYW4sIG9wYWNpdHk6IG51bWJlcik6IHZvaWQ7XG5leHBvcnQgY2xhc3MgT2w0VXRpbHMge1xuICAgIC8qIFxuICAgICAqIHVuaXRzOiAnZGVncmVlcyd8J2Z0J3wnbSd8J3VzLWZ0J1xuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgcmVzb2x1dGlvblNjYWxlRmFjdG9yKHVuaXRzOiBzdHJpbmcpOiBudW1iZXIge1xuICAgICAgICBsZXQgZHBpID0gMjUuNCAvIDAuMjg7XG4gICAgICAgIGxldCBtcHUgPSBvbC5wcm9qLk1FVEVSU19QRVJfVU5JVFt1bml0c107XG4gICAgICAgIGxldCBpbmNoZXNQZXJNZXRlciA9IDM5LjM3O1xuICAgICAgICByZXR1cm4gbXB1ICogaW5jaGVzUGVyTWV0ZXIgKiBkcGk7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyByZXNvbHV0aW9uRm9yU2NhbGUoc2NhbGU6IG51bWJlciwgZmFjdG9yOiBudW1iZXIpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gc2NhbGUgLyBmYWN0b3I7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyByZXNvbHV0aW9uc0ZvclNjYWxlcyhzY2FsZXM6IG51bWJlcltdLCB1bml0czogc3RyaW5nKTogbnVtYmVyW10ge1xuICAgICAgICBsZXQgcmVzb2x1dGlvbnMgPSBbXTtcbiAgICAgICAgbGV0IGZhY3RvciA9IE9sNFV0aWxzLnJlc29sdXRpb25TY2FsZUZhY3Rvcih1bml0cyk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2NhbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICByZXNvbHV0aW9ucy5wdXNoKE9sNFV0aWxzLnJlc29sdXRpb25Gb3JTY2FsZShzY2FsZXNbaV0sIGZhY3RvcikpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXNvbHV0aW9ucztcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIHNjYWxlRm9yUmVzb2x1dGlvbihyZXNvbHV0aW9uOiBudW1iZXIsIGZhY3RvcjogbnVtYmVyKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHJlc29sdXRpb24gKiBmYWN0b3I7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBzY2FsZXNGb3JSZXNvbHV0aW9ucyhyZXNvbHV0aW9uczogbnVtYmVyW10sIHVuaXRzOiBzdHJpbmcpOiBudW1iZXJbXSB7XG4gICAgICAgIGxldCBzY2FsZXMgPSBbXTtcbiAgICAgICAgbGV0IGZhY3RvciA9IE9sNFV0aWxzLnJlc29sdXRpb25TY2FsZUZhY3Rvcih1bml0cyk7XG4gICAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCByZXNvbHV0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgc2NhbGVzLnB1c2goT2w0VXRpbHMuc2NhbGVGb3JSZXNvbHV0aW9uKHJlc29sdXRpb25zW2ldLCBmYWN0b3IpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2NhbGVzO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgaW5pdFByb2o0RGVmcyhwcm9qNERlZnM6IGFueSk6IHZvaWQge1xuICAgICAgICBmb3IgKGNvbnN0IG5hbWUgaW4gcHJvajREZWZzKSB7XG4gICAgICAgICAgICBwcm9qNC5kZWZzKG5hbWUsIHByb2o0RGVmc1tuYW1lXSk7XG4gICAgICAgICAgICBsZXQgcHIgPSBvbC5wcm9qLmdldChuYW1lKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0UHJvaihwcm9qQ29kZTogc3RyaW5nKTogb2wucHJvai5Qcm9qZWN0aW9uIHtcbiAgICAgICAgcmV0dXJuIG9sLnByb2ouZ2V0KHByb2pDb2RlKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGdldFN0eWxlKG9wdGlvbnM6IGFueSwgc3R5bGU6IG9sLnN0eWxlLlN0eWxlID0gbnVsbCk6IG9sLnN0eWxlLlN0eWxlIHtcbiAgICAgICAgbGV0IHN0eWxlXyA9IHN0eWxlID8gc3R5bGUgOiBuZXcgb2wuc3R5bGUuU3R5bGUoKTtcbiAgICAgICAgc3R5bGVfLnNldEZpbGwobmV3IG9sLnN0eWxlLkZpbGwob3B0aW9uc1snZmlsbCddKSk7XG4gICAgICAgIHN0eWxlXy5zZXRTdHJva2UobmV3IG9sLnN0eWxlLlN0cm9rZShvcHRpb25zWydzdHJva2UnXSkpO1xuICAgICAgICBpZiAob3B0aW9uc1snaW1hZ2UnXSAmJiBvcHRpb25zWydpbWFnZSddWydjaXJjbGUnXSkge1xuICAgICAgICAgICAgc3R5bGVfLnNldEltYWdlKG5ldyBvbC5zdHlsZS5DaXJjbGUoe1xuICAgICAgICAgICAgICAgICAgICByYWRpdXM6IG9wdGlvbnNbJ2ltYWdlJ11bJ2NpcmNsZSddWydyYWRpdXMnXSxcbiAgICAgICAgICAgICAgICAgICAgZmlsbDogbmV3IG9sLnN0eWxlLkZpbGwoe1xuICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6IG9wdGlvbnNbJ2ltYWdlJ11bJ2NpcmNsZSddWydmaWxsJ11bJ2NvbG9yJ11cbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3R5bGVfO1xuICAgICAgICAvL1xuICAgICAgICAvLyByZXR1cm4gbmV3IG9sLnN0eWxlXy5TdHlsZSh7XG4gICAgICAgIC8vICAgICBmaWxsOiBuZXcgb2wuc3R5bGVfLkZpbGwob3B0aW9uc1snZmlsbCddKSxcbiAgICAgICAgLy8gICAgIHN0cm9rZTogbmV3IG9sLnN0eWxlXy5TdHJva2Uob3B0aW9uc1snc3Ryb2tlJ10pLy8sXG4gICAgICAgIC8vICAgICAvLyBpbWFnZTogbmV3IG9sLnN0eWxlXy5DaXJjbGUoe1xuICAgICAgICAvLyAgICAgLy8gICAgIHJhZGl1czogNyxcbiAgICAgICAgLy8gICAgIC8vICAgICBmaWxsOiBuZXcgb2wuc3R5bGVfLkZpbGwob3B0aW9uc1snZmlsbCddKVxuICAgICAgICAvLyAgICAgLy8gfSlcbiAgICAgICAgLy8gfSk7XG4gICAgfVxuXG4vLyBmaWxsXG4vLyB7XG4vLyAgICAgY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4yKVxuLy8gfVxuLy8gc3Ryb2tlXG4vLyB7XG4vLyAgICAgY29sb3I6ICcjZmZjYzMzJyxcbi8vICAgICB3aWR0aDogMlxuLy8gICAgIGRhc2g6XG4vLyB9XG4vLyBpbWFnZVxufVxuXG5leHBvcnQgY2xhc3MgT2w0R2VvbSB7XG4gICAgcHJvdGVjdGVkIGdlb206IG9sLmdlb20uR2VvbWV0cnkgPSBudWxsO1xuICAgIHByb3RlY3RlZCBwcm9qOiBvbC5wcm9qLlByb2plY3Rpb24gPSBudWxsO1xuXG4gICAgY29uc3RydWN0b3IoZ2VvbTogb2wuZ2VvbS5HZW9tZXRyeSwgcHJvajogb2wucHJvai5Qcm9qZWN0aW9uKSB7XG4gICAgICAgIHRoaXMuZ2VvbSA9IGdlb207XG4gICAgICAgIHRoaXMucHJvaiA9IHByb2o7XG4gICAgfVxuXG4gICAgZ2V0R2VvbSgpOiBvbC5nZW9tLkdlb21ldHJ5IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2VvbTtcbiAgICB9XG5cbiAgICBnZXRQcm9qKCk6IG9sLnByb2ouUHJvamVjdGlvbiB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb2o7XG4gICAgfVxuXG4gICAgZ2V0RXh0ZW50KHByb2o6IG9sLnByb2ouUHJvamVjdGlvbik6IG9sLkV4dGVudCB7XG4gICAgICAgIGlmICh0aGlzLnByb2ogIT09IHByb2opIHtcbiAgICAgICAgICAgIHJldHVybiAoPG9sLmdlb20uR2VvbWV0cnk+KDxhbnk+IHRoaXMuZ2VvbSkuY2xvbmUoKSkudHJhbnNmb3JtKHRoaXMucHJvaiwgcHJvaikuZ2V0RXh0ZW50KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gKDxvbC5nZW9tLkdlb21ldHJ5Pig8YW55PiB0aGlzLmdlb20pLmNsb25lKCkpLmdldEV4dGVudCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGdldFBvbHlnb25Gb3JFeHRlbnQocHJvajogb2wucHJvai5Qcm9qZWN0aW9uKSB7XG4gICAgICAgIHJldHVybiBvbC5nZW9tLlBvbHlnb24uZnJvbUV4dGVudCh0aGlzLmdldEV4dGVudChwcm9qKSk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgT2w0RXh0ZW50IGV4dGVuZHMgT2w0R2VvbSB7XG4gICAgcHVibGljIHN0YXRpYyBmcm9tQXJyYXkob3JkaW5hdGVzOiBudW1iZXJbXSwgcHJvajogb2wucHJvai5Qcm9qZWN0aW9uKTogT2w0RXh0ZW50IHtcbiAgICAgICAgbGV0IGdlb20gPSBuZXcgb2wuZ2VvbS5NdWx0aVBvaW50KFtbb3JkaW5hdGVzWzBdLCBvcmRpbmF0ZXNbMV1dLCBbb3JkaW5hdGVzWzJdLCBvcmRpbmF0ZXNbM11dXSk7XG4gICAgICAgIHJldHVybiBuZXcgT2w0RXh0ZW50KGdlb20sIHByb2opO1xuICAgIH1cbn1cblxuZXhwb3J0IGNvbnN0IFVVSUQ6IHN0cmluZyA9ICd1dWlkJztcbmV4cG9ydCBjb25zdCBMQVlFUl9VVUlEOiBzdHJpbmcgPSAnbGF5ZXJ1dWlkJztcbmV4cG9ydCBjb25zdCBUSVRMRTogc3RyaW5nID0gJ3RpdGxlJztcbmV4cG9ydCBjb25zdCBNRVRBRE9SX0VQU0c6IG9sLlByb2plY3Rpb25MaWtlID0gJ0VQU0c6NDMyNic7XG5leHBvcnQgY29uc3QgTEFZRVJfVkVDVE9SID0gJ3ZlY3Rvcic7XG5leHBvcnQgY29uc3QgTEFZRVJfSU1BR0UgPSAnaW1hZ2UnO1xuXG5leHBvcnQgY2xhc3MgT2w0TWFwIHtcbiAgICBwcml2YXRlIHN0YXRpYyBfdXVpZCA9IDA7XG4gICAgcHJpdmF0ZSBzdGF0aWMgX2luc3RhbmNlOiBPbDRNYXAgPSBudWxsOyAvLyBzaW5nbGV0b25cbiAgICBwcml2YXRlIG9sTWFwOiBvbC5NYXAgPSBudWxsO1xuICAgIHByaXZhdGUgc2NhbGVzOiBudW1iZXJbXTtcbiAgICAvLyAgICBwcm90ZWN0ZWQgcHJvajogb2wucHJvai5Qcm9qZWN0aW9uID0gbnVsbDtcbiAgICBwcml2YXRlIHN0YXJ0RXh0ZW50OiBPbDRFeHRlbnQgPSBudWxsOyAgLy8geG1pbiwgeW1pbiwgeG1heCwgeW1heCBvcHRpb25zWydzdGFydEV4dGVudCddXG4gICAgcHJpdmF0ZSBtYXhFeHRlbnQ6IE9sNEV4dGVudCA9IG51bGw7XG4gICAgcHJpdmF0ZSBkcmF3ZXI6IE9sNERyYXdlcjtcbiAgICBwcml2YXRlIHdtc1NvdXJjZTogT2w0V21zU291cmNlO1xuICAgIHByaXZhdGUgdmVjU291cmNlOiBPbDRWZWN0b3JTb3VyY2U7XG4gICAgcHJpdmF0ZSBsYXllcnRyZWU6IExheWVyVHJlZTtcbiAgICBwcml2YXRlIHN0eWxlczogT2JqZWN0O1xuICAgIHByaXZhdGUgaGdMYXllcjogb2wubGF5ZXIuVmVjdG9yO1xuICAgIC8vIHByb3RlY3RlZCBkcmFnem9vbTogb2wuaW50ZXJhY3Rpb24uRHJhZ1pvb207XG4gICAgcHJpdmF0ZSBkcmFnem9vbTogRHJhZ1pvb207XG4gICAgcHJpdmF0ZSBmZWF0dXJlSW5mbzogRmVhdHVyZUluZm87XG5cbiAgICBwcml2YXRlIHN0YXRpYyBnZXRVdWlkKHByZWZpeDogc3RyaW5nID0gJycpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gcHJlZml4ICsgKCsrT2w0TWFwLl91dWlkKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKG9wdGlvbnM6IGFueSkgeyAvLyBzaW5nbGV0b25cbiAgICAgICAgb2xbJ0VOQUJMRV9SQVNURVJfUkVQUk9KRUNUSU9OJ10gPSBmYWxzZTtcbiAgICAgICAgT2w0VXRpbHMuaW5pdFByb2o0RGVmcyhvcHRpb25zWydwcm9qNERlZnMnXSk7XG4gICAgICAgIHRoaXMubGF5ZXJ0cmVlID0gTGF5ZXJUcmVlLmNyZWF0ZSh0aGlzKTtcbiAgICAgICAgdGhpcy53bXNTb3VyY2UgPSBPbDRXbXNTb3VyY2UuY3JlYXRlKHRoaXMsIHRydWUpO1xuICAgICAgICB0aGlzLnZlY1NvdXJjZSA9IE9sNFZlY3RvclNvdXJjZS5jcmVhdGUodGhpcyk7XG4gICAgICAgICg8SFRNTEZvcm1FbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy4tanMtY3JzLWNvZGUnKSkudmFsdWUgPSBvcHRpb25zWyd2aWV3J11bJ3Byb2plY3Rpb24nXTtcbiAgICAgICAgbGV0IHByb2o6IG9sLnByb2ouUHJvamVjdGlvbiA9IG9sLnByb2ouZ2V0KG9wdGlvbnNbJ3ZpZXcnXVsncHJvamVjdGlvbiddKTtcbiAgICAgICAgdGhpcy5zdHlsZXMgPSBvcHRpb25zWydzdHlsZXMnXTtcbiAgICAgICAgdGhpcy5zY2FsZXMgPSBvcHRpb25zWyd2aWV3J11bJ3NjYWxlcyddO1xuICAgICAgICB0aGlzLnN0YXJ0RXh0ZW50ID0gT2w0RXh0ZW50LmZyb21BcnJheShvcHRpb25zWyd2aWV3J11bJ3N0YXJ0RXh0ZW50J10sIHByb2opO1xuICAgICAgICB0aGlzLm1heEV4dGVudCA9IE9sNEV4dGVudC5mcm9tQXJyYXkob3B0aW9uc1sndmlldyddWydtYXhFeHRlbnQnXSwgcHJvaik7XG4gICAgICAgIGxldCBpbnRlcmFjdGlvbnMgPSBvbC5pbnRlcmFjdGlvbi5kZWZhdWx0cyhcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBhbHRTaGlmdERyYWdSb3RhdGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHBpbmNoUm90YXRlOiBmYWxzZVxuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgICBsZXQgY29udHJvbHMgPSBvbC5jb250cm9sLmRlZmF1bHRzKHthdHRyaWJ1dGlvbjogZmFsc2V9KTsvLy5leHRlbmQoW2F0dHJpYnV0aW9uXSlcbiAgICAgICAgdGhpcy5vbE1hcCA9IG5ldyBvbC5NYXAoe1xuICAgICAgICAgICAgaW50ZXJhY3Rpb25zOiBpbnRlcmFjdGlvbnMsXG4gICAgICAgICAgICB0YXJnZXQ6IG9wdGlvbnNbJ21hcCddWyd0YXJnZXQnXSxcbiAgICAgICAgICAgIHJlbmRlcmVyOiAnY2FudmFzJyxcbiAgICAgICAgICAgIGNvbnRyb2xzOiBjb250cm9sc1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5vbE1hcC5zZXRWaWV3KFxuICAgICAgICAgICAgdGhpcy5jcmVhdGVWaWV3KFxuICAgICAgICAgICAgICAgIHByb2osXG4gICAgICAgICAgICAgICAgdGhpcy5tYXhFeHRlbnQuZ2V0RXh0ZW50KHByb2opLFxuICAgICAgICAgICAgICAgIE9sNFV0aWxzLnJlc29sdXRpb25zRm9yU2NhbGVzKHRoaXMuc2NhbGVzLCBwcm9qLmdldFVuaXRzKCkpLnJldmVyc2UoKVxuICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgICAgICAvKiBtYWtlIGEgZ3JvdXAgbGF5ZXIgZm9yIGFsbCBpbWFnZSBsYXllcnMgKFdNUyBldGMuKSovXG4gICAgICAgIGxldCBpbWFnZUdyb3VwID0gbmV3IG9sLmxheWVyLkdyb3VwKHtcbiAgICAgICAgICAgIGxheWVyczogbmV3IG9sLkNvbGxlY3Rpb248b2wubGF5ZXIuQmFzZT4oKVxuICAgICAgICB9KTtcbiAgICAgICAgaW1hZ2VHcm91cC5zZXQoVVVJRCwgTEFZRVJfSU1BR0UpXG4gICAgICAgIHRoaXMub2xNYXAuYWRkTGF5ZXIoaW1hZ2VHcm91cCk7XG4gICAgICAgIC8qIG1ha2UgYSBncm91cCBsYXllciBmb3IgYWxsIHZlY3RvciBsYXllcnMgKEhpZ2h0bGlnaHQsIFNlYXJjaCByZXN1bHRzIGV0Yy4pKi9cbiAgICAgICAgbGV0IHZlY3Rvckdyb3VwID0gbmV3IG9sLmxheWVyLkdyb3VwKHtcbiAgICAgICAgICAgIGxheWVyczogbmV3IG9sLkNvbGxlY3Rpb248b2wubGF5ZXIuQmFzZT4oKVxuICAgICAgICB9KTtcbiAgICAgICAgdmVjdG9yR3JvdXAuc2V0KFVVSUQsIExBWUVSX1ZFQ1RPUilcbiAgICAgICAgdGhpcy5vbE1hcC5hZGRMYXllcih2ZWN0b3JHcm91cCk7XG5cbiAgICAgICAgZm9yIChsZXQgc291cmNlT3B0aW9ucyBvZiBvcHRpb25zWydzb3VyY2UnXSkge1xuICAgICAgICAgICAgaWYgKHNvdXJjZU9wdGlvbnNbJ3R5cGUnXSA9PT0gJ1dNUycpIHtcbiAgICAgICAgICAgICAgICBsZXQgd21zTGF5ZXIgPSB0aGlzLmFkZExheWVyKFxuICAgICAgICAgICAgICAgICAgICB0aGlzLndtc1NvdXJjZS5jcmVhdGVMYXllcihcbiAgICAgICAgICAgICAgICAgICAgICAgIE9sNE1hcC5nZXRVdWlkKCdvbGF5LScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlT3B0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub2xNYXAuZ2V0VmlldygpLmdldFByb2plY3Rpb24oKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZU9wdGlvbnNbJ3Zpc2libGUnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnNlRmxvYXQoc291cmNlT3B0aW9uc1snb3BhY2l0eSddKVxuICAgICAgICAgICAgICAgICAgICApLCB0cnVlXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihzb3VyY2VPcHRpb25zWyd0eXBlJ10gKyAnIGlzIG5vdCBzdXBwb3J0ZWQuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5vbE1hcC5hZGRDb250cm9sKG5ldyBvbC5jb250cm9sLlNjYWxlTGluZSgpKTtcblxuICAgICAgICB0aGlzLm9sTWFwLmFkZENvbnRyb2wobmV3IG9sLmNvbnRyb2wuWm9vbVRvRXh0ZW50KHtcbiAgICAgICAgICAgIGV4dGVudDogdGhpcy5tYXhFeHRlbnQuZ2V0RXh0ZW50KHByb2opXG4gICAgICAgIH0pKTtcbiAgICAgICAgdGhpcy5vbE1hcC5hZGRJbnRlcmFjdGlvbihuZXcgb2wuaW50ZXJhY3Rpb24uRHJhZ1pvb20oKSk7XG4gICAgICAgIHRoaXMub2xNYXAuYWRkQ29udHJvbChuZXcgb2wuY29udHJvbC5Nb3VzZVBvc2l0aW9uKFxuICAgICAgICAgICAgLy8ge1xuICAgICAgICAgICAgLy8gICAgIGNvb3JkaW5hdGVGb3JtYXQ6IGZ1bmN0aW9uIChjb29yZGluYXRlcykge1xuICAgICAgICAgICAgLy8gICAgICAgICB2YXIgY29vcmRfeCA9IGNvb3JkaW5hdGVzWzBdLnRvRml4ZWQoMyk7XG4gICAgICAgICAgICAvLyAgICAgICAgIHZhciBjb29yZF95ID0gY29vcmRpbmF0ZXNbMV0udG9GaXhlZCgzKTtcbiAgICAgICAgICAgIC8vICAgICAgICAgcmV0dXJuIGNvb3JkX3ggKyAnLCAnICsgY29vcmRfeTtcbiAgICAgICAgICAgIC8vICAgICB9XG4gICAgICAgICAgICAvLyB9XG4gICAgICAgICkpO1xuICAgICAgICB0aGlzLnpvb21Ub0V4dGVudCh0aGlzLnN0YXJ0RXh0ZW50LmdldFBvbHlnb25Gb3JFeHRlbnQocHJvaikpO1xuICAgICAgICBsZXQgaGdsID0gdGhpcy52ZWNTb3VyY2UuY3JlYXRlTGF5ZXIoXG4gICAgICAgICAgICBPbDRNYXAuZ2V0VXVpZCgnb2xheS0nKSxcbiAgICAgICAgICAgIHsnc3R5bGUnOiBPbDRVdGlscy5nZXRTdHlsZSh0aGlzLnN0eWxlc1snaGlnaGxpZ2h0J10pfSxcbiAgICAgICAgICAgIHRoaXMub2xNYXAuZ2V0VmlldygpLmdldFByb2plY3Rpb24oKVxuICAgICAgICApO1xuICAgICAgICB0aGlzLmhnTGF5ZXIgPSA8b2wubGF5ZXIuVmVjdG9yPnRoaXMuYWRkTGF5ZXIoaGdsKTtcblxuICAgICAgICBsZXQgdkxheWVyID0gPG9sLmxheWVyLlZlY3Rvcj50aGlzLmFkZExheWVyKFxuICAgICAgICAgICAgdGhpcy52ZWNTb3VyY2UuY3JlYXRlTGF5ZXIoXG4gICAgICAgICAgICAgICAgT2w0TWFwLmdldFV1aWQoJ29sYXktJyksXG4gICAgICAgICAgICAgICAgeydzdHlsZSc6IE9sNFV0aWxzLmdldFN0eWxlKHRoaXMuc3R5bGVzWydzZWFyY2gnXSl9LFxuICAgICAgICAgICAgICAgIHRoaXMub2xNYXAuZ2V0VmlldygpLmdldFByb2plY3Rpb24oKVxuICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgICAgICB2TGF5ZXIuc2V0TWFwKHRoaXMub2xNYXApO1xuICAgICAgICB0aGlzLmRyYXdlciA9IG5ldyBPbDREcmF3ZXIodkxheWVyKTtcbiAgICAgICAgdGhpcy5kcmFnem9vbSA9IG5ldyBEcmFnWm9vbSh0aGlzLm9sTWFwKTtcbiAgICAgICAgdGhpcy5mZWF0dXJlSW5mbyA9IG5ldyBGZWF0dXJlSW5mbyh0aGlzLm9sTWFwLCB0aGlzLmhnTGF5ZXIpO1xuICAgIH1cblxuICAgIGdldExheWVyVHJlZSgpOiBMYXllclRyZWUge1xuICAgICAgICByZXR1cm4gdGhpcy5sYXllcnRyZWU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhZGRJbnRvTGF5ZXJUcmVlKGxheWVyOiBvbC5sYXllci5CYXNlKSB7XG4gICAgICAgIGlmICh0aGlzLmxheWVydHJlZSkge1xuICAgICAgICAgICAgdGhpcy5sYXllcnRyZWUuYWRkKGxheWVyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgY3JlYXRlVmlldyhwcm9qOiBvbC5wcm9qLlByb2plY3Rpb24sIGV4dGVudDogb2wuRXh0ZW50LCByZXNvbHV0aW9uczogbnVtYmVyW10pIHtcbiAgICAgICAgcmV0dXJuIG5ldyBvbC5WaWV3KHtcbiAgICAgICAgICAgIHByb2plY3Rpb246IHByb2osXG4gICAgICAgICAgICByZXNvbHV0aW9uczogcmVzb2x1dGlvbnMsXG4gICAgICAgICAgICBleHRlbnQ6IGV4dGVudFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB6b29tVG9FeHRlbnQoZ2VvbWV0cnk6IG9sLmdlb20uU2ltcGxlR2VvbWV0cnkgfCBvbC5FeHRlbnQpIHtcbiAgICAgICAgdGhpcy5vbE1hcC5nZXRWaWV3KCkuZml0KGdlb21ldHJ5LCA8b2x4LnZpZXcuRml0T3B0aW9ucz50aGlzLm9sTWFwLmdldFNpemUoKSk7XG4gICAgfVxuXG4gICAgc3RhdGljIGNyZWF0ZShvcHRpb25zOiBhbnkpOiBPbDRNYXAge1xuICAgICAgICBpZiAoIU9sNE1hcC5faW5zdGFuY2UpIHsvLyBzaW5nbGV0b25cbiAgICAgICAgICAgIE9sNE1hcC5faW5zdGFuY2UgPSBuZXcgT2w0TWFwKG9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBPbDRNYXAuX2luc3RhbmNlO1xuICAgIH1cblxuICAgIGdldFByb2plY3Rpb24oKTogb2wucHJvai5Qcm9qZWN0aW9uIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub2xNYXAuZ2V0VmlldygpLmdldFByb2plY3Rpb24oKTtcbiAgICB9XG5cbiAgICBnZXREcmF3ZXIoKTogT2w0RHJhd2VyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZHJhd2VyO1xuICAgIH1cblxuICAgIGdldEhnTGF5ZXIoKTogb2wubGF5ZXIuVmVjdG9yIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGdMYXllcjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgbGF5ZXIgaW50byBhIG1hcC5cbiAgICAgKiBAcGFyYW0gb3B0aW9uc1xuICAgICAqL1xuICAgIGFkZExheWVyRm9yT3B0aW9ucyhvcHRpb25zOiBhbnkpIHtcbiAgICAgICAgaWYgKG9wdGlvbnNbJ3R5cGUnXSA9PT0gJ1dNUycpIHtcbiAgICAgICAgICAgIGxldCB3bXNMYXllciA9IHRoaXMuYWRkTGF5ZXIoXG4gICAgICAgICAgICAgICAgdGhpcy53bXNTb3VyY2UuY3JlYXRlTGF5ZXIoXG4gICAgICAgICAgICAgICAgICAgIE9sNE1hcC5nZXRVdWlkKCdvbGF5LScpLFxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9sTWFwLmdldFZpZXcoKS5nZXRQcm9qZWN0aW9uKCksXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnNbJ3Zpc2libGUnXSxcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VGbG9hdChvcHRpb25zWydvcGFjaXR5J10pXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihvcHRpb25zWyd0eXBlJ10gKyAnIGlzIG5vdCBzdXBwb3J0ZWQuJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhZGRMYXllcihsYXllcjogb2wubGF5ZXIuQmFzZSwgYWRkVG9MYXllcnRyZWU6IGJvb2xlYW4gPSBmYWxzZSk6IG9sLmxheWVyLkJhc2Uge1xuICAgICAgICBpZiAobGF5ZXIgaW5zdGFuY2VvZiBvbC5sYXllci5JbWFnZSkge1xuICAgICAgICAgICAgbGV0IGdyb3VwOiBvbC5sYXllci5Hcm91cCA9IDxvbC5sYXllci5Hcm91cD4gdGhpcy5maW5kTGF5ZXIoTEFZRVJfSU1BR0UpO1xuICAgICAgICAgICAgZ3JvdXAuZ2V0TGF5ZXJzKCkuaW5zZXJ0QXQoZ3JvdXAuZ2V0TGF5ZXJzKCkuZ2V0TGVuZ3RoKCksIGxheWVyKTtcbiAgICAgICAgfSBlbHNlIGlmIChsYXllciBpbnN0YW5jZW9mIG9sLmxheWVyLlZlY3Rvcikge1xuICAgICAgICAgICAgbGV0IGdyb3VwOiBvbC5sYXllci5Hcm91cCA9IDxvbC5sYXllci5Hcm91cD4gdGhpcy5maW5kTGF5ZXIoTEFZRVJfVkVDVE9SKTtcbiAgICAgICAgICAgIGdyb3VwLmdldExheWVycygpLmluc2VydEF0KGdyb3VwLmdldExheWVycygpLmdldExlbmd0aCgpLCBsYXllcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYWRkVG9MYXllcnRyZWUpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkSW50b0xheWVyVHJlZShsYXllcik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxheWVyO1xuICAgIH1cblxuICAgIHJlbW92ZUxheWVyKGxheWVyOiBvbC5sYXllci5CYXNlKTogdm9pZCB7XG4gICAgICAgIHRoaXMub2xNYXAucmVtb3ZlTGF5ZXIobGF5ZXIpO1xuICAgIH1cblxuICAgIG1vdmVMYXllcih1dWlkOiBzdHJpbmcsIG9sZFBvczogbnVtYmVyLCBuZXdQb3M6IG51bWJlcik6IHZvaWQge1xuICAgICAgICBsZXQgbGF5ZXI6IG9sLmxheWVyLkJhc2UgPSB0aGlzLmZpbmRMYXllcih1dWlkKTtcbiAgICAgICAgaWYgKGxheWVyIGluc3RhbmNlb2Ygb2wubGF5ZXIuSW1hZ2UpIHtcbiAgICAgICAgICAgIGxldCBncm91cDogb2wubGF5ZXIuR3JvdXAgPSA8b2wubGF5ZXIuR3JvdXA+IHRoaXMuZmluZExheWVyKExBWUVSX0lNQUdFKTtcbiAgICAgICAgICAgIGxldCBsYXllcmxsID0gZ3JvdXAuZ2V0TGF5ZXJzKCkucmVtb3ZlKGxheWVyKTtcbiAgICAgICAgICAgIGdyb3VwLmdldExheWVycygpLmluc2VydEF0KG5ld1BvcywgbGF5ZXJsbCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmaW5kTGF5ZXIodXVpZDogc3RyaW5nKTogb2wubGF5ZXIuQmFzZSB7XG4gICAgICAgIGxldCBsYXllcnMgPSB0aGlzLm9sTWFwLmdldExheWVycygpLmdldEFycmF5KCk7XG4gICAgICAgIGZvciAobGV0IGxheWVyIG9mIGxheWVycykge1xuICAgICAgICAgICAgbGV0IHNvdXJjZTogb2wuc291cmNlLlNvdXJjZTtcbiAgICAgICAgICAgIGlmIChsYXllci5nZXQoVVVJRCkgPT09IHV1aWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbGF5ZXI7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGxheWVyIGluc3RhbmNlb2Ygb2wubGF5ZXIuR3JvdXApIHtcbiAgICAgICAgICAgICAgICBsZXQgc3VibGF5ZXJzID0gKDxvbC5sYXllci5Hcm91cD5sYXllcikuZ2V0TGF5ZXJzKCkuZ2V0QXJyYXkoKTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBzdWJsYXllciBvZiBzdWJsYXllcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN1YmxheWVyLmdldChVVUlEKSA9PT0gdXVpZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN1YmxheWVyO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHVwZGF0ZU1hcCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5vbE1hcC51cGRhdGVTaXplKCk7XG4gICAgfVxuXG4gICAgY2hhbmdlQ3JzKGNyczogc3RyaW5nKSB7IC8vIFRPRE9cbiAgICAgICAgbGV0IHRvUHJvaiA9IG51bGw7XG4gICAgICAgIGlmICgodG9Qcm9qID0gb2wucHJvai5nZXQoY3JzKSkpIHtcbiAgICAgICAgICAgIGxldCBleHRlbnQgPSBPbDRFeHRlbnQuZnJvbUFycmF5KFxuICAgICAgICAgICAgICAgIHRoaXMub2xNYXAuZ2V0VmlldygpLmNhbGN1bGF0ZUV4dGVudCh0aGlzLm9sTWFwLmdldFNpemUoKSksXG4gICAgICAgICAgICAgICAgdGhpcy5nZXRQcm9qZWN0aW9uKClcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBsZXQgZnJvbVByb2ogPSB0aGlzLmdldFByb2plY3Rpb24oKTtcbiAgICAgICAgICAgIC8vIGxldCBjZW50ZXIgPSB0aGlzLm9sTWFwLmdldFZpZXcoKS5nZXRDZW50ZXIoKTtcbiAgICAgICAgICAgIC8vIGxldCBsYXllcnMgPSAoPG9sLmxheWVyLkdyb3VwPnRoaXMuZmluZExheWVyKExBWUVSX0lNQUdFKSkuZ2V0TGF5ZXJzKCkuZ2V0QXJyYXkoKTtcbiAgICAgICAgICAgIHRoaXMub2xNYXAuc2V0VmlldyhcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZVZpZXcoXG4gICAgICAgICAgICAgICAgICAgIHRvUHJvaixcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXhFeHRlbnQuZ2V0RXh0ZW50KHRvUHJvaiksXG4gICAgICAgICAgICAgICAgICAgIE9sNFV0aWxzLnJlc29sdXRpb25zRm9yU2NhbGVzKHRoaXMuc2NhbGVzLCB0b1Byb2ouZ2V0VW5pdHMoKSkucmV2ZXJzZSgpXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHRoaXMuY2hhbmdlRm9ySUxheWVyc0koKDxvbC5sYXllci5Hcm91cD50aGlzLmZpbmRMYXllcihMQVlFUl9JTUFHRSkpLmdldExheWVycygpLCBmcm9tUHJvaiwgdG9Qcm9qKTtcbiAgICAgICAgICAgIHRoaXMuY2hhbmdlRm9yVkxheWVycygoPG9sLmxheWVyLkdyb3VwPnRoaXMuZmluZExheWVyKExBWUVSX1ZFQ1RPUikpLmdldExheWVycygpLCBmcm9tUHJvaiwgdG9Qcm9qKTtcbiAgICAgICAgICAgIHRoaXMuem9vbVRvRXh0ZW50KGV4dGVudC5nZXRQb2x5Z29uRm9yRXh0ZW50KHRvUHJvaikpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjaGFuZ2VGb3JWTGF5ZXJzKGxheWVyczogb2wuQ29sbGVjdGlvbjxvbC5sYXllci5CYXNlPiwgZnJvbVByb2osIHRvUHJvaikge1xuICAgICAgICBmb3IgKGxldCBsYXllciBvZiBsYXllcnMuZ2V0QXJyYXkoKSkge1xuICAgICAgICAgICAgdGhpcy52ZWNTb3VyY2UucmVwcm9qZWN0aW9uU291cmNlKGxheWVyLCBmcm9tUHJvaiwgdG9Qcm9qKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgY2hhbmdlRm9ySUxheWVyc0kobGF5ZXJzOiBvbC5Db2xsZWN0aW9uPG9sLmxheWVyLkJhc2U+LCBmcm9tUHJvaiwgdG9Qcm9qKSB7XG4gICAgICAgIGZvciAobGV0IGxheWVyIG9mIGxheWVycy5nZXRBcnJheSgpKSB7XG4gICAgICAgICAgICB0aGlzLndtc1NvdXJjZS5yZXByb2plY3Rpb25Tb3VyY2UoPG9sLmxheWVyLkltYWdlPmxheWVyLCBmcm9tUHJvaiwgdG9Qcm9qKTtcbiAgICAgICAgICAgIGxldCBzb3VyY2UgPSA8b2wuc291cmNlLkltYWdlV01TPig8b2wubGF5ZXIuSW1hZ2U+bGF5ZXIpLmdldFNvdXJjZSgpO1xuICAgICAgICAgICAgbGV0IGlsZjogb2wuSW1hZ2VMb2FkRnVuY3Rpb25UeXBlID0gc291cmNlLmdldEltYWdlTG9hZEZ1bmN0aW9uKCk7XG4gICAgICAgICAgICBzb3VyY2Uuc2V0SW1hZ2VMb2FkRnVuY3Rpb24oaWxmKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldFZpc2libGUobGF5ZXI6IG9sLmxheWVyLkJhc2UgfCBzdHJpbmcsIHZpc2libGl0eTogYm9vbGVhbik6IHZvaWQge1xuICAgICAgICBsZXQgX2xheWVyOiBvbC5sYXllci5CYXNlID0gbGF5ZXIgaW5zdGFuY2VvZiBvbC5sYXllci5CYXNlID8gbGF5ZXIgOiB0aGlzLmZpbmRMYXllcig8c3RyaW5nPmxheWVyKTtcbiAgICAgICAgaWYgKF9sYXllcikge1xuICAgICAgICAgICAgX2xheWVyLnNldFZpc2libGUodmlzaWJsaXR5KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldE9wYWNpdHkobGF5ZXI6IG9sLmxheWVyLkJhc2UgfCBzdHJpbmcsIG9wYWNpdHk6IG51bWJlcik6IHZvaWQge1xuICAgICAgICBsZXQgX2xheWVyOiBvbC5sYXllci5CYXNlID0gbGF5ZXIgaW5zdGFuY2VvZiBvbC5sYXllci5CYXNlID8gbGF5ZXIgOiB0aGlzLmZpbmRMYXllcig8c3RyaW5nPmxheWVyKTtcbiAgICAgICAgaWYgKF9sYXllcikge1xuICAgICAgICAgICAgX2xheWVyLnNldE9wYWNpdHkob3BhY2l0eSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjbGVhckZlYXR1cmVzKCkge1xuICAgICAgICB0aGlzLnZlY1NvdXJjZS5jbGVhckZlYXR1cmVzKHRoaXMuaGdMYXllcik7XG4gICAgfVxuXG4gICAgc2hvd0ZlYXR1cmVzKGdlb0pzb246IE9iamVjdCkge1xuICAgICAgICB0aGlzLnZlY1NvdXJjZS5zaG93RmVhdHVyZXModGhpcy5oZ0xheWVyLCBnZW9Kc29uKTtcbiAgICB9XG5cbiAgICBnZXRGaXJzdEdlb21Gb3JTZWFyY2goKTogb2JqZWN0IHtcbiAgICAgICAgbGV0IGZlYXR1cmVzID0gdGhpcy5kcmF3ZXIuZ2V0TGF5ZXIoKS5nZXRTb3VyY2UoKS5nZXRGZWF0dXJlcygpO1xuICAgICAgICBpZihmZWF0dXJlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGxldCBnZW9qc29uID0gbmV3IG9sLmZvcm1hdC5HZW9KU09OKCkud3JpdGVGZWF0dXJlT2JqZWN0KFxuICAgICAgICAgICAgZmVhdHVyZXNbMF0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgJ2RhdGFQcm9qZWN0aW9uJzogTUVUQURPUl9FUFNHLFxuICAgICAgICAgICAgICAgICdmZWF0dXJlUHJvamVjdGlvbic6IHRoaXMuZ2V0UHJvamVjdGlvbigpXG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICAgIGdlb2pzb25bJ2Jib3gnXSA9IG5ldyBPbDRHZW9tKGZlYXR1cmVzWzBdLmdldEdlb21ldHJ5KCksIHRoaXMuZ2V0UHJvamVjdGlvbigpKVxuICAgICAgICAgICAgLmdldEV4dGVudChvbC5wcm9qLmdldChNRVRBRE9SX0VQU0cpKTtcbiAgICAgICAgcmV0dXJuIGdlb2pzb247XG4gICAgfVxuXG4gICAgZHJhd0dlb21ldHJ5Rm9yU2VhcmNoKGdlb0pzb246IE9iamVjdCwgb25EcmF3RW5kOiBGdW5jdGlvbiA9IG51bGwpIHtcbiAgICAgICAgbGV0IG9sNG1hcCA9IHRoaXM7XG4gICAgICAgIGxldCBvbE1hcCA9IHRoaXMub2xNYXA7XG4gICAgICAgIHRoaXMudmVjU291cmNlLmNsZWFyRmVhdHVyZXModGhpcy5kcmF3ZXIuZ2V0TGF5ZXIoKSk7XG4gICAgICAgIHRoaXMudmVjU291cmNlLnNob3dGZWF0dXJlcyh0aGlzLmRyYXdlci5nZXRMYXllcigpLCBnZW9Kc29uKTtcbiAgICAgICAgbGV0IG11bHRpUG9pbnQ6IG9sLmdlb20uTXVsdGlQb2ludCA9IDxvbC5nZW9tLk11bHRpUG9pbnQ+IE9sNEV4dGVudC5mcm9tQXJyYXkoXG4gICAgICAgICAgICB0aGlzLmRyYXdlci5nZXRMYXllcigpLmdldFNvdXJjZSgpLmdldEV4dGVudCgpLFxuICAgICAgICAgICAgdGhpcy5vbE1hcC5nZXRWaWV3KCkuZ2V0UHJvamVjdGlvbigpXG4gICAgICAgICkuZ2V0R2VvbSgpO1xuICAgICAgICBsZXQgbWF4ZXh0ZW50ID0gdGhpcy5tYXhFeHRlbnQuZ2V0UG9seWdvbkZvckV4dGVudCh0aGlzLm9sTWFwLmdldFZpZXcoKS5nZXRQcm9qZWN0aW9uKCkpO1xuICAgICAgICBpZiAobWF4ZXh0ZW50LmludGVyc2VjdHNDb29yZGluYXRlKG11bHRpUG9pbnQuZ2V0UG9pbnQoMCkuZ2V0Q29vcmRpbmF0ZXMoKSlcbiAgICAgICAgICAgICYmIG1heGV4dGVudC5pbnRlcnNlY3RzQ29vcmRpbmF0ZShtdWx0aVBvaW50LmdldFBvaW50KDEpLmdldENvb3JkaW5hdGVzKCkpKSB7XG4gICAgICAgICAgICB0aGlzLnpvb21Ub0V4dGVudCh0aGlzLmRyYXdlci5nZXRMYXllcigpLmdldFNvdXJjZSgpLmdldEV4dGVudCgpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1ldGFkb3IuZGlzcGxheUVycm9yKCdEaWUgR2VvbWV0cmllIGlzdCBhdcOfZXJoYWxiIGRlciByw6R1bWxpY2hlbiBFcnN0cmVja3VuZy4nKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgZ2VvRmVhdHVyZSA9IHRoaXMuZ2V0Rmlyc3RHZW9tRm9yU2VhcmNoKCk7XG4gICAgICAgIGlmIChvbkRyYXdFbmQgIT09IG51bGwgJiYgZ2VvRmVhdHVyZSkge1xuICAgICAgICAgICAgb25EcmF3RW5kKGdlb0ZlYXR1cmUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZHJhd1NoYXBlRm9yU2VhcmNoKHNoYXBlVHlwZTogU0hBUEVTID0gbnVsbCwgb25EcmF3RW5kOiBGdW5jdGlvbiA9IG51bGwpIHtcbiAgICAgICAgdGhpcy5zZXREb3VibGVDbGlja1pvb20oZmFsc2UpO1xuICAgICAgICBsZXQgb2w0bWFwID0gdGhpcztcbiAgICAgICAgbGV0IG9sTWFwID0gdGhpcy5vbE1hcDtcbiAgICAgICAgY29uc3Qgc2hhcGU6IFNIQVBFUyA9IHR5cGVvZiBzaGFwZVR5cGUgPT09ICdzdHJpbmcnID8gU0hBUEVTWzxzdHJpbmc+IHNoYXBlVHlwZV0gOiBzaGFwZVR5cGU7XG4gICAgICAgIGlmICh0aGlzLmRyYXdlci5nZXRJbnRlcmFjdGlvbigpKSB7XG4gICAgICAgICAgICB0aGlzLm9sTWFwLnJlbW92ZUludGVyYWN0aW9uKHRoaXMuZHJhd2VyLmdldEludGVyYWN0aW9uKCkpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZHJhd2VyLnNldEludGVyYWN0aW9uKHNoYXBlLCBPbDRVdGlscy5nZXRTdHlsZSh0aGlzLnN0eWxlc1snc2VhcmNoJ10pKTtcbiAgICAgICAgaWYgKHRoaXMuZHJhd2VyLmdldEludGVyYWN0aW9uKCkpIHtcbiAgICAgICAgICAgIGxldCBkcmF3ZXIgPSB0aGlzLmRyYXdlcjtcbiAgICAgICAgICAgIHRoaXMuZ2V0RHJhd2VyKCkuZ2V0TGF5ZXIoKS5nZXRTb3VyY2UoKS5jbGVhcigpO1xuICAgICAgICAgICAgdGhpcy5vbE1hcC5hZGRJbnRlcmFjdGlvbih0aGlzLmRyYXdlci5nZXRJbnRlcmFjdGlvbigpKTtcbiAgICAgICAgICAgIHRoaXMuZHJhd2VyLmdldEludGVyYWN0aW9uKCkub24oXG4gICAgICAgICAgICAgICAgJ2RyYXdzdGFydCcsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgb2w0bWFwLmdldERyYXdlcigpLmdldExheWVyKCkuZ2V0U291cmNlKCkuY2xlYXIoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgdGhpcy5kcmF3ZXIuZ2V0SW50ZXJhY3Rpb24oKS5vbihcbiAgICAgICAgICAgICAgICAnZHJhd2VuZCcsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGdlb2pzb24gPSBuZXcgb2wuZm9ybWF0Lkdlb0pTT04oKS53cml0ZUZlYXR1cmVPYmplY3QoXG4gICAgICAgICAgICAgICAgICAgICAgICBlLmZlYXR1cmUsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RhdGFQcm9qZWN0aW9uJzogTUVUQURPUl9FUFNHLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdmZWF0dXJlUHJvamVjdGlvbic6IG9sNG1hcC5nZXRQcm9qZWN0aW9uKClcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgZ2VvanNvblsnYmJveCddID0gbmV3IE9sNEdlb20oZS5mZWF0dXJlLmdldEdlb21ldHJ5KCksIG9sNG1hcC5nZXRQcm9qZWN0aW9uKCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAuZ2V0RXh0ZW50KG9sLnByb2ouZ2V0KE1FVEFET1JfRVBTRykpO1xuICAgICAgICAgICAgICAgICAgICBvbkRyYXdFbmQoZ2VvanNvbik7XG4gICAgICAgICAgICAgICAgICAgIG9sTWFwLnJlbW92ZUludGVyYWN0aW9uKGRyYXdlci5nZXRJbnRlcmFjdGlvbigpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5nZXREcmF3ZXIoKS5nZXRMYXllcigpLmdldFNvdXJjZSgpLmNsZWFyKCk7XG4gICAgICAgICAgICBvbkRyYXdFbmQobnVsbCk7XG4gICAgICAgICAgICB0aGlzLnNldERvdWJsZUNsaWNrWm9vbSh0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFjdGl2YXRlcyAvIGRlYWN0aXZhdGVzIGludGVyYWN0aW9uIG9sLmludGVyYWN0aW9uLkRvdWJsZUNsaWNrWm9vbVxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gc3RhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIHNldERvdWJsZUNsaWNrWm9vbShzdGF0ZTogYm9vbGVhbikge1xuICAgICAgICBmb3IgKGxldCBpbnRlcmFjdGlvbiBvZiB0aGlzLm9sTWFwLmdldEludGVyYWN0aW9ucygpLmdldEFycmF5KCkpIHtcbiAgICAgICAgICAgIGlmIChpbnRlcmFjdGlvbiBpbnN0YW5jZW9mIG9sLmludGVyYWN0aW9uLkRvdWJsZUNsaWNrWm9vbSkge1xuICAgICAgICAgICAgICAgIGludGVyYWN0aW9uLnNldEFjdGl2ZShzdGF0ZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBlbnVtIFNIQVBFUyB7Tk9ORSwgQk9YLCBQT0xZR09OfVxuO1xuXG5leHBvcnQgY2xhc3MgT2w0RHJhd2VyIHtcbiAgICAvLyBwcml2YXRlIHN0YXRpYyBfaW5zdGFuY2U6IE9sNERyYXdlcjtcbiAgICBwcm90ZWN0ZWQgbGF5ZXI6IG9sLmxheWVyLlZlY3RvcjtcbiAgICBwcm90ZWN0ZWQgaW50ZXJhY3Rpb246IG9sLmludGVyYWN0aW9uLkRyYXc7XG5cbiAgICBjb25zdHJ1Y3RvcihsYXllcjogb2wubGF5ZXIuVmVjdG9yKSB7XG4gICAgICAgIHRoaXMubGF5ZXIgPSBsYXllcjtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0TGF5ZXIoKTogb2wubGF5ZXIuVmVjdG9yIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubGF5ZXI7XG4gICAgfVxuXG4gICAgcHVibGljIGdldEludGVyYWN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnRlcmFjdGlvbjtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0SW50ZXJhY3Rpb24odHlwZTogU0hBUEVTLCBkcmF3U3R5bGU6IG9sLnN0eWxlLlN0eWxlKSB7XG4gICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgY2FzZSBTSEFQRVMuQk9YOlxuICAgICAgICAgICAgICAgIHRoaXMuaW50ZXJhY3Rpb24gPSBuZXcgb2wuaW50ZXJhY3Rpb24uRHJhdyh7XG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogdGhpcy5sYXllci5nZXRTb3VyY2UoKSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ0NpcmNsZScsXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiBkcmF3U3R5bGUsXG4gICAgICAgICAgICAgICAgICAgIGdlb21ldHJ5RnVuY3Rpb246IGNyZWF0ZUJveCgpIC8vIG9sLmQudHMgaGFzIG5vIGZ1bmN0aW9uIFwib2wuaW50ZXJhY3Rpb24uRHJhdy5jcmVhdGVCb3goKVwiXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFNIQVBFUy5QT0xZR09OOlxuICAgICAgICAgICAgICAgIHRoaXMuaW50ZXJhY3Rpb24gPSBuZXcgb2wuaW50ZXJhY3Rpb24uRHJhdyh7XG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogdGhpcy5sYXllci5nZXRTb3VyY2UoKSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ1BvbHlnb24nLFxuICAgICAgICAgICAgICAgICAgICBzdHlsZTogZHJhd1N0eWxlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRoaXMuaW50ZXJhY3Rpb24gPSBudWxsO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIG9sLmQudHMgaGFzIG5vIGZ1bmN0aW9uIFwib2wuaW50ZXJhY3Rpb24uRHJhdy5jcmVhdGVCb3goKVwiXG4gKiBAcmV0dXJucyB7KGNvb3JkaW5hdGVzOmFueSwgb3B0X2dlb21ldHJ5OmFueSk9PmFueXxvbC5nZW9tLlBvbHlnb259XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVCb3goKSB7XG4gICAgcmV0dXJuIChcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSB7b2wuQ29vcmRpbmF0ZXxBcnJheS48b2wuQ29vcmRpbmF0ZT58QXJyYXkuPEFycmF5LjxvbC5Db29yZGluYXRlPj59IGNvb3JkaW5hdGVzXG4gICAgICAgICAqIEBwYXJhbSB7b2wuZ2VvbS5TaW1wbGVHZW9tZXRyeT19IG9wdF9nZW9tZXRyeVxuICAgICAgICAgKiBAcmV0dXJuIHtvbC5nZW9tLlNpbXBsZUdlb21ldHJ5fVxuICAgICAgICAgKi9cbiAgICAgICAgZnVuY3Rpb24gKGNvb3JkaW5hdGVzLCBvcHRfZ2VvbWV0cnkpIHtcbiAgICAgICAgICAgIHZhciBleHRlbnQgPSBvbC5leHRlbnQuYm91bmRpbmdFeHRlbnQoY29vcmRpbmF0ZXMpO1xuICAgICAgICAgICAgdmFyIGdlb21ldHJ5ID0gb3B0X2dlb21ldHJ5IHx8IG5ldyBvbC5nZW9tLlBvbHlnb24obnVsbCk7XG4gICAgICAgICAgICBnZW9tZXRyeS5zZXRDb29yZGluYXRlcyhbW1xuICAgICAgICAgICAgICAgIG9sLmV4dGVudC5nZXRCb3R0b21MZWZ0KGV4dGVudCksXG4gICAgICAgICAgICAgICAgb2wuZXh0ZW50LmdldEJvdHRvbVJpZ2h0KGV4dGVudCksXG4gICAgICAgICAgICAgICAgb2wuZXh0ZW50LmdldFRvcFJpZ2h0KGV4dGVudCksXG4gICAgICAgICAgICAgICAgb2wuZXh0ZW50LmdldFRvcExlZnQoZXh0ZW50KSxcbiAgICAgICAgICAgICAgICBvbC5leHRlbnQuZ2V0Qm90dG9tTGVmdChleHRlbnQpXG4gICAgICAgICAgICBdXSk7XG4gICAgICAgICAgICByZXR1cm4gZ2VvbWV0cnk7XG4gICAgICAgIH1cbiAgICApO1xufVxuXG5leHBvcnQgY2xhc3MgR2VvbUxvYWRlciB7XG4gICAgcHJpdmF0ZSBtYXA6IE9sNE1hcDtcbiAgICBwcml2YXRlIGZvcm06IEhUTUxGb3JtRWxlbWVudDtcblxuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcihtYXA6IE9sNE1hcCwgZm9ybTogSFRNTEZvcm1FbGVtZW50KSB7XG4gICAgICAgIHRoaXMubWFwID0gbWFwO1xuICAgICAgICB0aGlzLmZvcm0gPSBmb3JtO1xuICAgICAgICB0aGlzLm9uKCk7XG4gICAgfVxuXG4gICAgcHVibGljIG9uKCkge1xuICAgICAgICB0aGlzLmZvcm0uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgdGhpcy51cGxvYWQuYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgIH1cblxuICAgIHByaXZhdGUgdXBsb2FkKGU6IEV2ZW50KSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGUpO1xuICAgICAgICAvLyBIdHRwVXRpbHMuSHR0cC5zZW5kRm9ybSh0aGlzLmZvcm0sIHRoaXMuZm9ybS5hY3Rpb24sIEh0dHBVdGlscy5IVFRQX01FVEhPRC5QT1NULCBIdHRwVXRpbHMuSFRUUF9EQVRBVFlQRS5qc29uKVxuICAgICAgICAvLyAgICAgLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIC8vICAgICAgICAgY29uc29sZS5sb2coJ0NvbnRlbnRzOiAnICsgdmFsdWUpO1xuICAgICAgICAvLyAgICAgfSlcbiAgICAgICAgLy8gICAgIC5jYXRjaChmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgIC8vICAgICAgICAgY29uc29sZS5lcnJvcihyZWFzb24pO1xuICAgICAgICAvLyAgICAgfSk7XG4gICAgfVxufVxuXG5kZWNsYXJlIHZhciBtZXRhZG9yOiBhbnk7IiwiaW1wb3J0IHtUSVRMRSwgVVVJRCwgTEFZRVJfVVVJRCwgT2w0TWFwfSBmcm9tIFwiLi9PbDRcIjtcbmltcG9ydCB7TGF5ZXJUcmVlfSBmcm9tICcuL0xheWVyVHJlZSc7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBPbDRTb3VyY2Uge1xuXG4gICAgYWJzdHJhY3QgY3JlYXRlTGF5ZXIobGF5ZXJVdWlkOiBzdHJpbmcsIG9wdGlvbnM6IGFueSwgcHJvajogb2wuUHJvamVjdGlvbkxpa2UsIHZpc2libGU6IGJvb2xlYW4sIG9wYWNpdHk6IG51bWJlcik6IG9sLmxheWVyLkJhc2U7XG5cbiAgICBhYnN0cmFjdCByZXByb2plY3Rpb25Tb3VyY2UobGF5ZXI6IG9sLmxheWVyLkJhc2UsIGZyb21Qcm9qOiBvbC5Qcm9qZWN0aW9uTGlrZSwgdG9Qcm9qOiBvbC5Qcm9qZWN0aW9uTGlrZSk7XG5cbiAgICBhYnN0cmFjdCBjbG9uZUxheWVyKGxheWVyOiBvbC5sYXllci5CYXNlLCBmcm9tUHJvajogb2wuUHJvamVjdGlvbkxpa2UsIHRvUHJvajogb2wuUHJvamVjdGlvbkxpa2UpOiBvbC5sYXllci5CYXNlO1xufVxuXG5leHBvcnQgY2xhc3MgT2w0VmVjdG9yU291cmNlIGltcGxlbWVudHMgT2w0U291cmNlIHtcbiAgICBwcml2YXRlIHN0YXRpYyBfaW5zdGFuY2U6IE9sNFZlY3RvclNvdXJjZTtcbiAgICBwcm90ZWN0ZWQgc2hvd2FibGU6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICBwcml2YXRlIG9sNE1hcDogT2w0TWFwO1xuXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihvbDRNYXA6IE9sNE1hcCkge1xuICAgICAgICAvLyBzdXBlcihmYWxzZSk7XG4gICAgICAgIHRoaXMub2w0TWFwID0gb2w0TWFwO1xuICAgICAgICAvLyB0aGlzLnNldFNob3dhYmxlKGZhbHNlKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgY3JlYXRlKG9sNG1hcDogT2w0TWFwKTogT2w0VmVjdG9yU291cmNlIHtcbiAgICAgICAgaWYgKCFPbDRWZWN0b3JTb3VyY2UuX2luc3RhbmNlKSB7Ly8gc2luZ2xldG9uXG4gICAgICAgICAgICBPbDRWZWN0b3JTb3VyY2UuX2luc3RhbmNlID0gbmV3IE9sNFZlY3RvclNvdXJjZShvbDRtYXApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBPbDRWZWN0b3JTb3VyY2UuX2luc3RhbmNlO1xuICAgIH1cblxuICAgIGNyZWF0ZUxheWVyKGxheWVyVXVpZDogc3RyaW5nLCBvcHRpb25zOiBhbnksIHByb2o6IG9sLlByb2plY3Rpb25MaWtlLCB2aXNpYmxlOiBib29sZWFuID0gdHJ1ZSwgb3BhY2l0eTogbnVtYmVyID0gMS4wKTogb2wubGF5ZXIuQmFzZSB7XG4gICAgICAgIGxldCB2TGF5ZXIgPSBuZXcgb2wubGF5ZXIuVmVjdG9yKHtcbiAgICAgICAgICAgIHNvdXJjZTogbmV3IG9sLnNvdXJjZS5WZWN0b3Ioe3dyYXBYOiBmYWxzZX0pLFxuICAgICAgICAgICAgc3R5bGU6IG9wdGlvbnNbJ3N0eWxlJ11cbiAgICAgICAgfSk7XG4gICAgICAgIHZMYXllci5zZXQoVVVJRCwgbGF5ZXJVdWlkKTtcbiAgICAgICAgcmV0dXJuIHZMYXllcjtcbiAgICB9XG5cbiAgICByZXByb2plY3Rpb25Tb3VyY2UobGF5ZXI6IG9sLmxheWVyLkJhc2UsIGZyb21Qcm9qOiBvbC5Qcm9qZWN0aW9uTGlrZSwgdG9Qcm9qOiBvbC5Qcm9qZWN0aW9uTGlrZSkge1xuICAgICAgICBsZXQgc291cmNlID0gKDxvbC5sYXllci5MYXllcj5sYXllcikuZ2V0U291cmNlKCk7XG4gICAgICAgIGxldCBmZWF0dXJlczogb2wuRmVhdHVyZVtdID0gKDxvbC5zb3VyY2UuVmVjdG9yPnNvdXJjZSkuZ2V0RmVhdHVyZXMoKTtcbiAgICAgICAgZm9yIChsZXQgZmVhdHVyZSBvZiBmZWF0dXJlcykge1xuICAgICAgICAgICAgZmVhdHVyZS5zZXRHZW9tZXRyeShmZWF0dXJlLmdldEdlb21ldHJ5KCkudHJhbnNmb3JtKGZyb21Qcm9qLCB0b1Byb2opKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNsb25lTGF5ZXIobGF5ZXI6IG9sLmxheWVyLkJhc2UsIGZyb21Qcm9qOiBvbC5Qcm9qZWN0aW9uTGlrZSwgdG9Qcm9qOiBvbC5Qcm9qZWN0aW9uTGlrZSk6IG9sLmxheWVyLkJhc2Uge1xuICAgICAgICAvKiBUT0RPIGZvciBjbG9uZSAqL1xuICAgICAgICByZXR1cm4gbGF5ZXI7XG4gICAgfVxuXG4gICAgc2hvd0ZlYXR1cmVzKHZMYXllcjogb2wubGF5ZXIuVmVjdG9yLCBnZW9Kc29uOiBPYmplY3QpIHtcbiAgICAgICAgbGV0IGdlb0pzb25SZWFkZXI6IG9sLmZvcm1hdC5HZW9KU09OID0gbmV3IG9sLmZvcm1hdC5HZW9KU09OKCk7XG4gICAgICAgIGxldCBkYXRhcHJvaiA9IGdlb0pzb25SZWFkZXIucmVhZFByb2plY3Rpb24oZ2VvSnNvbik7XG4gICAgICAgIGxldCBmZWF0dXJlcyA9IGdlb0pzb25SZWFkZXIucmVhZEZlYXR1cmVzKFxuICAgICAgICAgICAgZ2VvSnNvbixcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAnZGF0YVByb2plY3Rpb24nOiBnZW9Kc29uUmVhZGVyLnJlYWRQcm9qZWN0aW9uKGdlb0pzb24pLFxuICAgICAgICAgICAgICAgICdmZWF0dXJlUHJvamVjdGlvbic6IHRoaXMub2w0TWFwLmdldFByb2plY3Rpb24oKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIHZMYXllci5nZXRTb3VyY2UoKS5hZGRGZWF0dXJlcyhmZWF0dXJlcyk7XG4gICAgfVxuXG4gICAgY2xlYXJGZWF0dXJlcyh2TGF5ZXI6IG9sLmxheWVyLlZlY3Rvcikge1xuICAgICAgICB2TGF5ZXIuZ2V0U291cmNlKCkuY2xlYXIodHJ1ZSk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgT2w0V21zU291cmNlIGltcGxlbWVudHMgT2w0U291cmNlIHtcbiAgICBwcml2YXRlIHN0YXRpYyBfaW5zdGFuY2U6IE9sNFdtc1NvdXJjZTtcbiAgICBwcml2YXRlIG9sNE1hcDogT2w0TWFwO1xuICAgIHByaXZhdGUgdXNlTG9hZEV2ZW50czogYm9vbGVhbjtcbiAgICBwdWJsaWMgc3RhdGljIG1hcEFjdGl2aXR5OiBNYXBBY3Rpdml0eTsvLyA9IE1hcEFjdGl2aXR5LmNyZWF0ZSgpO1xuICAgIHB1YmxpYyBkaXNhYmxlZDogYW55O1xuXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihvbDRNYXA6IE9sNE1hcCwgdXNlTG9hZEV2ZW50czogYm9vbGVhbiA9IHRydWUpIHtcbiAgICAgICAgdGhpcy5vbDRNYXAgPSBvbDRNYXA7XG4gICAgICAgIHRoaXMudXNlTG9hZEV2ZW50cyA9IHVzZUxvYWRFdmVudHM7XG4gICAgICAgIGlmICh0aGlzLnVzZUxvYWRFdmVudHMpIHtcbiAgICAgICAgICAgIE9sNFdtc1NvdXJjZS5tYXBBY3Rpdml0eSA9IE1hcEFjdGl2aXR5LmNyZWF0ZSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZGlzYWJsZWQgPSB7fTtcbiAgICB9XG5cbiAgICBzdGF0aWMgY3JlYXRlKG9sNE1hcDogT2w0TWFwLCB1c2VMb2FkRXZlbnRzOiBib29sZWFuID0gdHJ1ZSk6IE9sNFdtc1NvdXJjZSB7XG4gICAgICAgIGlmICghT2w0V21zU291cmNlLl9pbnN0YW5jZSkgey8vIHNpbmdsZXRvblxuICAgICAgICAgICAgT2w0V21zU291cmNlLl9pbnN0YW5jZSA9IG5ldyBPbDRXbXNTb3VyY2Uob2w0TWFwLCB1c2VMb2FkRXZlbnRzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gT2w0V21zU291cmNlLl9pbnN0YW5jZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYWRkRGlzYWJsZWQobGF5ZXI6IG9sLmxheWVyLkJhc2UpIHtcbiAgICAgICAgdGhpcy5kaXNhYmxlZFtsYXllci5nZXQoVVVJRCldID0gbGF5ZXIuZ2V0KFVVSUQpO1xuICAgICAgICB0aGlzLm9sNE1hcC5nZXRMYXllclRyZWUoKS5zZXREaXNhYmxlKGxheWVyLCB0cnVlKTtcbiAgICAgICAgdGhpcy5vbDRNYXAuc2V0VmlzaWJsZShsYXllciwgZmFsc2UpO1xuICAgIH1cblxuICAgIHB1YmxpYyByZW1vdmVEaXNhYmxlZChsYXllcjogb2wubGF5ZXIuQmFzZSkge1xuICAgICAgICBpZiAobGF5ZXIuZ2V0KFVVSUQpKXtcbiAgICAgICAgICAgIHRoaXMub2w0TWFwLmdldExheWVyVHJlZSgpLnNldERpc2FibGUobGF5ZXIsIGZhbHNlKTtcbiAgICAgICAgICAgIGxldCB2aXNpYmxlID0gdGhpcy5vbDRNYXAuZ2V0TGF5ZXJUcmVlKCkuZ2V0VmlzaWJsZShsYXllcik7XG4gICAgICAgICAgICB0aGlzLm9sNE1hcC5zZXRWaXNpYmxlKGxheWVyLCB2aXNpYmxlKTtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLmRpc2FibGVkW2xheWVyLmdldChVVUlEKV07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjcmVhdGVMYXllcihsYXllclV1aWQ6IHN0cmluZywgb3B0aW9uczogYW55ID0gbnVsbCwgcHJvajogb2wuUHJvamVjdGlvbkxpa2UsIHZpc2libGU6IGJvb2xlYW4sIG9wYWNpdHk6IG51bWJlcik6IG9sLmxheWVyLkJhc2Uge1xuICAgICAgICBsZXQgc291cmNlID0gdGhpcy5jcmVhdGVTb3VyY2UobGF5ZXJVdWlkLCBvcHRpb25zWyd1cmwnXSwgb3B0aW9uc1sncGFyYW1zJ10sIHByb2opO1xuICAgICAgICBsZXQgbGF5ZXJXbXMgPSB0aGlzLl9jcmVhdGVMYXllcihsYXllclV1aWQsIHZpc2libGUsIG9wYWNpdHksIHNvdXJjZSwgb3B0aW9uc1sndGl0bGUnXSA/IG9wdGlvbnNbJ3RpdGxlJ10gOiBudWxsKTtcbiAgICAgICAgcmV0dXJuIGxheWVyV21zO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2NyZWF0ZUxheWVyKGxheWVyVXVpZDogc3RyaW5nLCB2aXNpYmxlOiBib29sZWFuLCBvcGFjaXR5OiBudW1iZXIsIHNvdXJjZTogb2wuc291cmNlLkltYWdlV01TLCB0aXRsZTogc3RyaW5nID0gbnVsbCkge1xuICAgICAgICBsZXQgbGF5ZXJXbXMgPSBuZXcgb2wubGF5ZXIuSW1hZ2Uoe1xuICAgICAgICAgICAgc291cmNlOiBzb3VyY2UsXG4gICAgICAgICAgICB2aXNpYmxlOiB2aXNpYmxlLFxuICAgICAgICAgICAgb3BhY2l0eTogb3BhY2l0eVxuICAgICAgICB9KTtcbiAgICAgICAgbGF5ZXJXbXMuc2V0KFVVSUQsIGxheWVyVXVpZCk7XG4gICAgICAgIGlmICh0aXRsZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgbGF5ZXJXbXMuc2V0KFRJVExFLCB0aXRsZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxheWVyV21zO1xuICAgIH1cblxuICAgIHByaXZhdGUgY3JlYXRlU291cmNlKGxheWVyVXVpZDogc3RyaW5nLCB1cmw6IHN0cmluZywgcGFyYW1zOiBhbnksIHByb2o6IG9sLlByb2plY3Rpb25MaWtlKTogb2wuc291cmNlLkltYWdlV01TIHtcbiAgICAgICAgbGV0IHNvdXJjZSA9IG5ldyBvbC5zb3VyY2UuSW1hZ2VXTVMoe1xuICAgICAgICAgICAgdXJsOiB1cmwsXG4gICAgICAgICAgICBwYXJhbXM6IHBhcmFtcyxcbiAgICAgICAgICAgIHByb2plY3Rpb246IHByb2pcbiAgICAgICAgfSk7XG4gICAgICAgIHNvdXJjZS5zZXQoTEFZRVJfVVVJRCwgbGF5ZXJVdWlkKTtcbiAgICAgICAgdGhpcy5zZXRMb2FkRXZlbnRzKHNvdXJjZSk7XG4gICAgICAgIHJldHVybiBzb3VyY2U7XG4gICAgfVxuXG4gICAgcmVwcm9qZWN0aW9uU291cmNlKGxheWVyOiBvbC5sYXllci5CYXNlLCBmcm9tUHJvajogb2wuUHJvamVjdGlvbkxpa2UsIHRvUHJvajogb2wuUHJvamVjdGlvbkxpa2UpIHtcbiAgICAgICAgbGV0IG9sZHNvdXJjZSA9IDxvbC5zb3VyY2UuSW1hZ2VXTVM+KDxvbC5sYXllci5MYXllcj5sYXllcikuZ2V0U291cmNlKCk7XG4gICAgICAgIGxldCBuZXdTb3VyY2UgPSB0aGlzLmNyZWF0ZVNvdXJjZShsYXllci5nZXQoVVVJRCksIG9sZHNvdXJjZS5nZXRVcmwoKSwgb2xkc291cmNlLmdldFBhcmFtcygpLCB0b1Byb2opO1xuICAgICAgICAoPG9sLmxheWVyLkxheWVyPmxheWVyKS5zZXRTb3VyY2UobmV3U291cmNlKTtcbiAgICAgICAgdGhpcy5yZW1vdmVEaXNhYmxlZChsYXllcik7XG4gICAgfVxuXG4gICAgY2xvbmVMYXllcihsYXllcjogb2wubGF5ZXIuQmFzZSwgZnJvbVByb2o6IG9sLlByb2plY3Rpb25MaWtlLCB0b1Byb2o6IG9sLlByb2plY3Rpb25MaWtlKTogb2wubGF5ZXIuQmFzZSB7XG4gICAgICAgIGxldCBvbGRzb3VyY2UgPSA8b2wuc291cmNlLkltYWdlV01TPig8b2wubGF5ZXIuTGF5ZXI+bGF5ZXIpLmdldFNvdXJjZSgpO1xuICAgICAgICBsZXQgbmV3U291cmNlID0gdGhpcy5jcmVhdGVTb3VyY2UobGF5ZXIuZ2V0KFVVSUQpLCBvbGRzb3VyY2UuZ2V0VXJsKCksIG9sZHNvdXJjZS5nZXRQYXJhbXMoKSwgdG9Qcm9qKTtcbiAgICAgICAgbGV0IG9sZExheWVyID0gKDxvbC5sYXllci5MYXllcj5sYXllcik7XG4gICAgICAgIGxldCBuZXdMYXllciA9IHRoaXMuX2NyZWF0ZUxheWVyKG9sZExheWVyLmdldChVVUlEKSwgb2xkTGF5ZXIuZ2V0VmlzaWJsZSgpLCBvbGRMYXllci5nZXRPcGFjaXR5KCksIG5ld1NvdXJjZSwgb2xkTGF5ZXIuZ2V0KFRJVExFKSk7XG4gICAgICAgIHJldHVybiBuZXdMYXllcjtcbiAgICB9XG5cblxuICAgIHByaXZhdGUgc2V0TG9hZEV2ZW50cyhzb3VyY2U6IG9sLnNvdXJjZS5JbWFnZVdNUykge1xuICAgICAgICBpZiAodGhpcy51c2VMb2FkRXZlbnRzKSB7XG4gICAgICAgICAgICAvLyBzb3VyY2Uuc2V0SW1hZ2VMb2FkRnVuY3Rpb24odGhpcy5pbWFnZUxvYWRGdW5jdGlvbi5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIHNvdXJjZS5vbignaW1hZ2Vsb2Fkc3RhcnQnLCB0aGlzLmltYWdlTG9hZFN0YXJ0LmJpbmQodGhpcykpO1xuICAgICAgICAgICAgc291cmNlLm9uKCdpbWFnZWxvYWRlbmQnLCB0aGlzLmltYWdlTG9hZEVuZC5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIHNvdXJjZS5vbignaW1hZ2Vsb2FkZXJyb3InLCB0aGlzLmltYWdlTG9hZEVycm9yLmJpbmQodGhpcykpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaW1hZ2VMb2FkU3RhcnQoZTogb2wuc291cmNlLkltYWdlRXZlbnQpIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ3N0YXJ0JywgKDxvbC5zb3VyY2UuSW1hZ2VXTVM+ZS50YXJnZXQpLmdldChMQVlFUl9VVUlEKSk7XG4gICAgICAgIGlmIChPbDRXbXNTb3VyY2UubWFwQWN0aXZpdHkpIHtcbiAgICAgICAgICAgIE9sNFdtc1NvdXJjZS5tYXBBY3Rpdml0eS5sb2FkU3RhcnQoKDxvbC5zb3VyY2UuSW1hZ2VXTVM+ZS50YXJnZXQpLmdldChMQVlFUl9VVUlEKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpbWFnZUxvYWRFbmQoZTogb2wuc291cmNlLkltYWdlRXZlbnQpIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ2VuZCcsICg8b2wuc291cmNlLkltYWdlV01TPmUudGFyZ2V0KS5nZXQoTEFZRVJfVVVJRCkpO1xuICAgICAgICBpZiAoT2w0V21zU291cmNlLm1hcEFjdGl2aXR5KSB7XG4gICAgICAgICAgICBPbDRXbXNTb3VyY2UubWFwQWN0aXZpdHkubG9hZEVuZCgoPG9sLnNvdXJjZS5JbWFnZVdNUz5lLnRhcmdldCkuZ2V0KExBWUVSX1VVSUQpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGltYWdlTG9hZEVycm9yKGU6IG9sLnNvdXJjZS5JbWFnZUV2ZW50KSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdlcnJvcicsICg8b2wuc291cmNlLkltYWdlV01TPmUudGFyZ2V0KS5nZXQoTEFZRVJfVVVJRCkpO1xuICAgICAgICBpZiAoT2w0V21zU291cmNlLm1hcEFjdGl2aXR5KSB7XG4gICAgICAgICAgICBPbDRXbXNTb3VyY2UubWFwQWN0aXZpdHkubG9hZEVycm9yKCg8b2wuc291cmNlLkltYWdlV01TPmUudGFyZ2V0KS5nZXQoTEFZRVJfVVVJRCkpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBsYXllciA9IHRoaXMub2w0TWFwLmZpbmRMYXllcigoPG9sLnNvdXJjZS5JbWFnZVdNUz5lLnRhcmdldCkuZ2V0KExBWUVSX1VVSUQpKTtcbiAgICAgICAgdGhpcy5hZGREaXNhYmxlZChsYXllcik7XG4gICAgfVxuXG59XG5cbmV4cG9ydCBjbGFzcyBNYXBBY3Rpdml0eSB7XG4gICAgcHJpdmF0ZSBzdGF0aWMgX2luc3RhbmNlOiBNYXBBY3Rpdml0eTtcbiAgICBwcml2YXRlIGxheWVyczogYW55ID0ge307XG4gICAgcHJpdmF0ZSBpc0xvYWRpbmc6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgIHByaXZhdGUgY29uc3RydWN0b3IoKSB7XG4gICAgfVxuXG4gICAgc3RhdGljIGNyZWF0ZSgpOiBNYXBBY3Rpdml0eSB7XG4gICAgICAgIGlmICghTWFwQWN0aXZpdHkuX2luc3RhbmNlKSB7Ly8gc2luZ2xldG9uXG4gICAgICAgICAgICBNYXBBY3Rpdml0eS5faW5zdGFuY2UgPSBuZXcgTWFwQWN0aXZpdHkoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gTWFwQWN0aXZpdHkuX2luc3RhbmNlO1xuICAgIH1cblxuICAgIHByaXZhdGUgYWN0aXZpdHlTdGFydChsYXllck5hbWU6IHN0cmluZykge1xuICAgICAgICB0aGlzLmxheWVyc1tsYXllck5hbWVdID0gdHJ1ZTtcbiAgICAgICAgaWYgKHRoaXMuaXNMb2FkaW5nID09PSBmYWxzZSkge1xuICAgICAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgd2luZG93WydtZXRhZG9yJ10ucHJlbG9hZGVyU3RhcnQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYWN0aXZpdHlFbmQobGF5ZXJOYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgaWYgKHRoaXMubGF5ZXJzW2xheWVyTmFtZV0pIHtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLmxheWVyc1tsYXllck5hbWVdO1xuICAgICAgICB9XG4gICAgICAgIGZvciAobGV0IGxheWVyTiBpbiB0aGlzLmxheWVycykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XG4gICAgICAgIHdpbmRvd1snbWV0YWRvciddLnByZWxvYWRlclN0b3AoKTtcbiAgICB9XG5cbiAgICBsb2FkU3RhcnQobGF5ZXJOYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5hY3Rpdml0eVN0YXJ0KGxheWVyTmFtZSk7XG4gICAgfVxuXG4gICAgbG9hZEVuZChsYXllck5hbWU6IHN0cmluZykge1xuICAgICAgICB0aGlzLmFjdGl2aXR5RW5kKGxheWVyTmFtZSk7XG4gICAgfVxuXG4gICAgbG9hZEVycm9yKGxheWVyTmFtZTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuYWN0aXZpdHlFbmQobGF5ZXJOYW1lKTtcbiAgICB9XG59XG4iLCJleHBvcnQgY2xhc3MgRUVsZW1lbnQge1xuICAgIHByaXZhdGUgX2VsZW1lbnQ6IEhUTUxFbGVtZW50O1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQ6IEhUTUxFbGVtZW50KXtcbiAgICAgICAgdGhpcy5fZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgfVxuXG4gICAgZ2V0IGVsZW1lbnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9lbGVtZW50O1xuICAgIH1cblxuICAgIHNldEF0dHJzKGF0dHJzOiBPYmplY3QgPSB7fSkge1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBhdHRycykge1xuICAgICAgICAgICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoa2V5LCBhdHRyc1trZXldKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzZXRBdHRyKGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKGtleSwgdmFsdWUpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgZ2V0QXR0cihrZXk6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gdGhpcy5fZWxlbWVudC5nZXRBdHRyaWJ1dGUoa2V5KTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBkb20ge1xuICAgIC8vIHByaXZhdGUgc3RhdGljIGRhdGEgPSBkYXRhO1xuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gdGFnbmFtZVxuICAgICAqIEBwYXJhbSBvcHRpb25zXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fVxuICAgICAqL1xuICAgIHN0YXRpYyBjcmVhdGUodGFnbmFtZTogc3RyaW5nLCBhdHRyczogYW55ID0ge30sIGNsYXNzZXM6IHN0cmluZ1tdID0gW10sIHRleHQ6IHN0cmluZyA9ICcnLCBkYXRhOiBhbnkgPSB7fSk6IEhUTUxFbGVtZW50IHtcbiAgICAgICAgbGV0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZ25hbWUpO1xuICAgICAgICByZXR1cm4gZG9tLmFkZChlbGVtZW50LCBhdHRycywgY2xhc3NlcywgdGV4dCwgZGF0YSk7XG4gICAgfVxuXG4gICAgc3RhdGljIGFkZChlbGVtZW50OiBIVE1MRWxlbWVudCwgYXR0cnM6IGFueSA9IHt9LCBjbGFzc2VzOiBzdHJpbmdbXSA9IFtdLCB0ZXh0OiBzdHJpbmcgPSAnJywgZGF0YTogYW55ID0ge30pOiBIVE1MRWxlbWVudCB7XG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIGF0dHJzKSB7XG4gICAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShrZXksIGF0dHJzW2tleV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChjb25zdCBuYW1lIG9mIGNsYXNzZXMpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChuYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGV4dCAhPT0gJycpIHtcbiAgICAgICAgICAgIGVsZW1lbnQudGV4dENvbnRlbnQgPSB0ZXh0O1xuICAgICAgICB9XG4gICAgICAgIC8vIGZvciAoY29uc3Qga2V5IGluIGRhdGEpIHtcbiAgICAgICAgLy8gICAgIGVsZW1lbnQuZGF0YXNldFtrZXldID0gZGF0YVtrZXldO1xuICAgICAgICAvLyB9XG5cbiAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gc2VsZWN0b3JcbiAgICAgKiBAcmV0dXJucyB7Tm9kZUxpc3RPZjxFbGVtZW50Pn1cbiAgICAgKi9cbiAgICBzdGF0aWMgZmluZChzZWxlY3Rvcjogc3RyaW5nLCBjb250ZXh0OiBhbnkgPSBkb2N1bWVudCk6IE5vZGVMaXN0T2Y8RWxlbWVudD4ge1xuICAgICAgICBpZiAoY29udGV4dCBpbnN0YW5jZW9mIERvY3VtZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gY29udGV4dC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgICAgICAgfSBlbHNlIGlmIChjb250ZXh0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBjb250ZXh0LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7IC8vIFRPRE8gcmV0dXJuIGEgYmxhbmsgTm9kZUxpc3RPZjxFbGVtZW50PlxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gc2VsZWN0b3JcbiAgICAgKiBAcmV0dXJucyB7RWxlbWVudHxudWxsfVxuICAgICAqL1xuICAgIHN0YXRpYyBmaW5kRmlyc3Qoc2VsZWN0b3I6IHN0cmluZywgY29udGV4dDogYW55ID0gZG9jdW1lbnQpOiBFbGVtZW50IHtcbiAgICAgICAgaWYgKGNvbnRleHQgaW5zdGFuY2VvZiBEb2N1bWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGNvbnRleHQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgICAgIH0gZWxzZSBpZiAoY29udGV4dCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gY29udGV4dC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZWxlbWVudFxuICAgICAqIEBwYXJhbSBuYW1lXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgYW4gZWxlbWVudCBjb250YWlucyBhIGNsYXNzIG5hbWVcbiAgICAgKi9cbiAgICBzdGF0aWMgaGFzQ2xhc3MoZWxlbWVudDogSFRNTEVsZW1lbnQsIG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gZWxlbWVudCAhPT0gbnVsbCAmJiBlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhuYW1lKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZWxlbWVudFxuICAgICAqIEBwYXJhbSBuYW1lXG4gICAgICogQHJldHVybnMge0VsZW1lbnR9XG4gICAgICovXG4gICAgc3RhdGljIGFkZENsYXNzKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBuYW1lOiBzdHJpbmcpOiBIVE1MRWxlbWVudCB8IG51bGwge1xuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQobmFtZSk7XG4gICAgICAgIHJldHVybiBlbGVtZW50O1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBwYXJhbSBlbGVtZW50XG4gICAgICogQHBhcmFtIG5hbWVcbiAgICAgKiBAcmV0dXJucyB7RWxlbWVudH1cbiAgICAgKi9cbiAgICBzdGF0aWMgcmVtb3ZlQ2xhc3MoZWxlbWVudDogSFRNTEVsZW1lbnQsIG5hbWU6IHN0cmluZyk6IEhUTUxFbGVtZW50IHwgbnVsbCB7XG4gICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShuYW1lKTtcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0gbmFtZVxuICAgICAqIEByZXR1cm5zIHtFbGVtZW50fVxuICAgICAqL1xuICAgIHN0YXRpYyB0b2dnbGVDbGFzcyhlbGVtZW50OiBFbGVtZW50LCBuYW1lOiBzdHJpbmcpOiBFbGVtZW50IHwgbnVsbCB7XG4gICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShuYW1lKTtcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgfVxuXG4gICAgLy9cbiAgICAvLyAvKipcbiAgICAvLyAgKiBSZXR1cm5zIHdpdGggZWxlbWVudCBiaW5kZWQgZGF0YS5cbiAgICAvLyAgKiBAcGFyYW0gZWxlbWVudFxuICAgIC8vICAqIEBwYXJhbSBrZXlcbiAgICAvLyAgKiBAcmV0dXJucyB7YW55fVxuICAgIC8vICAqL1xuICAgIC8vIHN0YXRpYyBnZXREYXRhKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBrZXk6IHN0cmluZyA9IG51bGwpOiBhbnkge1xuICAgIC8vICAgICBpZiAoIWRvbS5oYXNEYXRhKGVsZW1lbnQsIGtleSkpIHtcbiAgICAvLyAgICAgICAgIHJldHVybiBudWxsO1xuICAgIC8vICAgICB9IGVsc2UgaWYgKGtleSA9PT0gbnVsbCkge1xuICAgIC8vICAgICAgICAgcmV0dXJuIGRvbS5kYXRhLmdldChlbGVtZW50KTtcbiAgICAvLyAgICAgfSBlbHNlIHtcbiAgICAvLyAgICAgICAgIHJldHVybiBkb20uZGF0YS5nZXQoZWxlbWVudClba2V5XTtcbiAgICAvLyAgICAgfVxuICAgIC8vIH1cbiAgICAvL1xuICAgIC8vIC8qKlxuICAgIC8vICAqIEJpbmRzIHdpdGggYW4gZWxlbWVudCBhIGRhdGEuXG4gICAgLy8gICogQHBhcmFtIGVsZW1lbnRcbiAgICAvLyAgKiBAcGFyYW0ga2V5XG4gICAgLy8gICogQHBhcmFtIHZhbHVlXG4gICAgLy8gICovXG4gICAgLy8gc3RhdGljIHNldERhdGEoZWxlbWVudDogSFRNTEVsZW1lbnQsIGtleTogc3RyaW5nLCB2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgLy8gICAgIGlmICghZG9tLmhhc0RhdGEoZWxlbWVudCkpIHtcbiAgICAvLyAgICAgICAgIGRvbS5kYXRhLnNldChlbGVtZW50LCB7a2V5OiB2YWx1ZX0pO1xuICAgIC8vICAgICB9IGVsc2Uge1xuICAgIC8vICAgICAgICAgbGV0IHRtcCA9IGRvbS5nZXREYXRhKGVsZW1lbnQpO1xuICAgIC8vICAgICAgICAgdG1wW2tleV0gPSB2YWx1ZTtcbiAgICAvLyAgICAgICAgIGRvbS5kYXRhLnNldChlbGVtZW50LCB0bXApO1xuICAgIC8vICAgICB9XG4gICAgLy8gfVxuICAgIC8vXG4gICAgLy8gLyoqXG4gICAgLy8gICogQ2hlY2tzIGlmIHRoZSBlbGVtZW50IGlzIGJpbmRpbmcgd2l0aCBhIGRhdGFcbiAgICAvLyAgKiBAcGFyYW0gZWxlbWVudFxuICAgIC8vICAqIEBwYXJhbSBrZXlcbiAgICAvLyAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAvLyAgKi9cbiAgICAvLyBzdGF0aWMgaGFzRGF0YShlbGVtZW50OiBIVE1MRWxlbWVudCwga2V5OiBzdHJpbmcgPSBudWxsKTogYm9vbGVhbiB7XG4gICAgLy8gICAgIGlmICghZG9tLmRhdGEuaGFzKGVsZW1lbnQpKSB7XG4gICAgLy8gICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgLy8gICAgIH0gZWxzZSBpZiAoa2V5ID09PSBudWxsKSB7XG4gICAgLy8gICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAvLyAgICAgfSBlbHNlIHtcbiAgICAvLyAgICAgICAgIHJldHVybiBkb20uZ2V0RGF0YShlbGVtZW50KVtrZXldICE9PSBudWxsID8gdHJ1ZSA6IGZhbHNlO1xuICAgIC8vICAgICB9XG4gICAgLy8gfVxuICAgIC8vXG4gICAgLy8gLyoqXG4gICAgLy8gICogRGVsZXRlcyB3aXRoIGFuIGVsZW1lbnQgYmluZGluZyBkYXRhXG4gICAgLy8gICogQHBhcmFtIGVsZW1lbnRcbiAgICAvLyAgKiBAcGFyYW0ga2V5XG4gICAgLy8gICovXG4gICAgLy8gc3RhdGljIGRlbGV0ZURhdGEoZWxlbWVudDogSFRNTEVsZW1lbnQsIGtleTogc3RyaW5nID0gbnVsbCk6IHZvaWQge1xuICAgIC8vICAgICBpZiAoZG9tLmhhc0RhdGEoZWxlbWVudCwga2V5KSkge1xuICAgIC8vICAgICAgICAgaWYgKGtleSA9PT0gbnVsbCkge1xuICAgIC8vICAgICAgICAgICAgIGRvbS5kYXRhLmRlbGV0ZShlbGVtZW50KTtcbiAgICAvLyAgICAgICAgIH0gZWxzZSB7XG4gICAgLy8gICAgICAgICAgICAgbGV0IHRtcCA9IGRvbS5nZXREYXRhKGVsZW1lbnQpO1xuICAgIC8vICAgICAgICAgICAgIGRlbGV0ZSB0bXBba2V5XTtcbiAgICAvLyAgICAgICAgICAgICBkb20uZGF0YS5zZXQoZWxlbWVudCwgdG1wKTtcbiAgICAvLyAgICAgICAgIH1cbiAgICAvLyAgICAgfVxuICAgIC8vIH1cbn0iLCJpbXBvcnQgKiBhcyBtZXRhZG9yIGZyb20gJy4vT2w0JztcblxuZGVjbGFyZSB2YXIgQ29uZmlndXJhdGlvbjogYW55O1xuXG5sZXQgY29udGV4dDogYW55ID0gd2luZG93O1xuY29udGV4dC5zcGF0aWFsID0gbWV0YWRvcjtcblxuZXhwb3J0IGZ1bmN0aW9uIGluaXQoKSB7XG5cbiAgICB2YXIgbWV0YWRvck1hcENvbmZpZyA9IHtcbiAgICAgICAgbWFwOiB7XG4gICAgICAgICAgICB0YXJnZXQ6ICdtYXAnLFxuICAgICAgICAgICAgc3JzOiBbXCJFUFNHOjQzMjZcIiwgXCJFUFNHOjMxNDY2XCIsIFwiRVBTRzoyNTgzMlwiXVxuICAgICAgICB9LFxuICAgICAgICB2aWV3OiB7XG4gICAgICAgICAgICBwcm9qZWN0aW9uOiBDb25maWd1cmF0aW9uLnNldHRpbmdzWydtYXBfY3JzJ10sLy8nOiAnOSw0OSwxMSw1MycsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdcbiAgICAgICAgICAgIG1heEV4dGVudDogQ29uZmlndXJhdGlvbi5zZXR0aW5nc1snbWFwX2Jib3hfbWF4J10uc3BsaXQoLyxcXHM/LyksLy9bNS44LCA0Ny4wLCAxNS4wLCA1NS4wXSwgLy8gcHJpb3JpdHkgZm9yIHNjYWxlcyBvciBmb3IgbWF4RXh0ZW50P1xuICAgICAgICAgICAgc3RhcnRFeHRlbnQ6IENvbmZpZ3VyYXRpb24uc2V0dGluZ3NbJ21hcF9iYm94X3N0YXJ0J10uc3BsaXQoLyxcXHM/LyksXG4gICAgICAgICAgICBzY2FsZXM6IFs1MDAwLCAyNTAwMCwgNTAwMDAsIDEwMDAwMCwgMjAwMDAwLCAyNTAwMDAsIDUwMDAwMCwgMTAwMDAwMCwgMjAwMDAwMCwgNTAwMDAwMCwgMTAwMDAwMDBdLy8sIDIwMDAwMDAwLCA1MDAwMDAwMF1cbiAgICAgICAgfSxcbiAgICAgICAgc3R5bGVzOiB7XG4gICAgICAgICAgICBoaWdobGlnaHQ6IHtcbiAgICAgICAgICAgICAgICBmaWxsOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiAncmdiYSg2MCwgNjAsIDI1NSwgMC4xKSdcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHN0cm9rZToge1xuICAgICAgICAgICAgICAgICAgICBjb2xvcjogJ3JnYmEoNjAsIDYwLCAyNTUsIDEuMCknLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogMlxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZWFyY2g6IHtcbiAgICAgICAgICAgICAgICBmaWxsOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiAncmdiYSgyNTUsIDYwLCA2MCwgMC4xKSdcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHN0cm9rZToge1xuICAgICAgICAgICAgICAgICAgICBjb2xvcjogJ3JnYmEoMjU1LCA2MCwgNjAsIDEuMCknLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogMlxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgaW1hZ2U6IHtcbiAgICAgICAgICAgICAgICAgICAgY2lyY2xlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByYWRpdXM6IDUsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxsOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6ICdyZ2JhKDI1NSwgNjAsIDYwLCAwLjYpJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBzb3VyY2U6IFtdLFxuICAgICAgICAvLyBhZGQgYWRkaXRpb25hbCBwYXJhbWV0ZXJzIHdpdGggKyBcIkFERElUSU9OQUxcIlxuICAgICAgICBwcm9qNERlZnM6IHtcbiAgICAgICAgICAgIFwiRVBTRzo0MzI2XCI6IFwiK3Byb2o9bG9uZ2xhdCArZGF0dW09V0dTODQgK3VuaXRzPWRlZ3JlZXMgK25vX2RlZnNcIiArIFwiICtheGlzPW5ldVwiLFxuICAgICAgICAgICAgXCJFUFNHOjQyNThcIjogXCIrcHJvaj1sb25nbGF0ICtlbGxwcz1HUlM4MCArdG93Z3M4ND0wLDAsMCwwLDAsMCwwICtub19kZWZzXCIgKyBcIiArdW5pdHM9ZGVncmVlcyArYXhpcz1uZXVcIixcbiAgICAgICAgICAgIFwiRVBTRzozMTQ2NlwiOiBcIitwcm9qPXRtZXJjICtsYXRfMD0wICtsb25fMD02ICtrPTEgK3hfMD0yNTAwMDAwICt5XzA9MCArZWxscHM9YmVzc2VsICt0b3dnczg0PTU5OC4xLDczLjcsNDE4LjIsMC4yMDIsMC4wNDUsLTIuNDU1LDYuNyArdW5pdHM9bSArbm9fZGVmc1wiICsgXCIgK2F4aXM9bmV1XCIsXG4gICAgICAgICAgICBcIkVQU0c6MzE0NjdcIjogXCIrcHJvaj10bWVyYyArbGF0XzA9MCArbG9uXzA9OSAraz0xICt4XzA9MzUwMDAwMCAreV8wPTAgK2VsbHBzPWJlc3NlbCArdG93Z3M4ND01OTguMSw3My43LDQxOC4yLDAuMjAyLDAuMDQ1LC0yLjQ1NSw2LjcgK3VuaXRzPW0gK25vX2RlZnNcIiArIFwiICtheGlzPW5ldVwiLFxuICAgICAgICAgICAgLy8gXCJFUFNHOjMxNDY4XCI6IFwiK3Byb2o9dG1lcmMgK2xhdF8wPTAgK2xvbl8wPTEyICtrPTEgK3hfMD00NTAwMDAwICt5XzA9MCArZWxscHM9YmVzc2VsICt0b3dnczg0PTU5OC4xLDczLjcsNDE4LjIsMC4yMDIsMC4wNDUsLTIuNDU1LDYuNyArdW5pdHM9bSArbm9fZGVmc1wiICsgXCIgK2F4aXM9bmV1XCIsXG4gICAgICAgICAgICAvLyBcIkVQU0c6MzE0NjlcIjogXCIrcHJvaj10bWVyYyArbGF0XzA9MCArbG9uXzA9MTUgK2s9MSAreF8wPTU1MDAwMDAgK3lfMD0wICtlbGxwcz1iZXNzZWwgK3Rvd2dzODQ9NTk4LjEsNzMuNyw0MTguMiwwLjIwMiwwLjA0NSwtMi40NTUsNi43ICt1bml0cz1tICtub19kZWZzXCIgKyBcIiArYXhpcz1uZXVcIixcbiAgICAgICAgICAgIFwiRVBTRzoyNTgzMlwiOiBcIitwcm9qPXV0bSArem9uZT0zMiArZWxscHM9R1JTODAgK3Rvd2dzODQ9MCwwLDAsMCwwLDAsMCArdW5pdHM9bSArbm9fZGVmc1wiLFxuICAgICAgICAgICAgLy8gXCJFUFNHOjI1ODMzXCI6IFwiK3Byb2o9dXRtICt6b25lPTMzICtlbGxwcz1HUlM4MCArdG93Z3M4ND0wLDAsMCwwLDAsMCwwICt1bml0cz1tICtub19kZWZzXCJcbiAgICAgICAgfSxcbiAgICAgICAgY29tcG9uZW50OiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY2xhc3M6ICcnLFxuICAgICAgICAgICAgICAgIHNlbGVjdG9yOiBcIlwiXG4gICAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICB9O1xuXG4gICAgLy8gY29uc29sZS5sb2coQ29uZmlndXJhdGlvbik7XG4gICAgZm9yIChjb25zdCBrZXkgaW4gQ29uZmlndXJhdGlvbi5jb25maWcubWFwX2JhY2tncm91bmQpIHtcbiAgICAgICAgbGV0IHdtcyA9IENvbmZpZ3VyYXRpb24uY29uZmlnLm1hcF9iYWNrZ3JvdW5kW2tleV07XG4gICAgICAgIGxldCBsYXllcnMgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBsIGluIHdtcy5sYXllcnMpIHtcbiAgICAgICAgICAgIGxheWVycy5wdXNoKHdtcy5sYXllcnNbbF0pO1xuICAgICAgICB9XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHdtcyk7XG4gICAgICAgIG1ldGFkb3JNYXBDb25maWcuc291cmNlLnB1c2goe1xuICAgICAgICAgICAgJ3R5cGUnOiAnV01TJyxcbiAgICAgICAgICAgICd1cmwnOiB3bXMudXJsLFxuICAgICAgICAgICAgJ3RpdGxlJzogd21zLnRpdGxlLFxuICAgICAgICAgICAgJ29wYWNpdHknOiB3bXMub3BhY2l0eSxcbiAgICAgICAgICAgICd2aXNpYmxlJzogd21zLnZpc2libGUsXG4gICAgICAgICAgICAncGFyYW1zJzoge1xuICAgICAgICAgICAgICAgICdMQVlFUlMnOiBsYXllcnMuam9pbihcIixcIiksXG4gICAgICAgICAgICAgICAgJ1ZFUlNJT04nOiB3bXMudmVyc2lvbixcbiAgICAgICAgICAgICAgICAnRk9STUFUJzogd21zLmZvcm1hdFxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLy8gY29uc29sZS5sb2cobWV0YWRvck1hcENvbmZpZyk7XG4gICAgbGV0IG1ldGFkb3JNYXAgPSBtZXRhZG9yLk9sNE1hcC5jcmVhdGUobWV0YWRvck1hcENvbmZpZyk7XG4gICAgLy8gbWV0YWRvck1hcC5pbml0TGF5ZXJ0cmVlKCk7XG4gICAgY29udGV4dC5zcGF0aWFsWydtYXAnXSA9IG1ldGFkb3JNYXA7XG4gICAgLy8gbWV0YWRvclsnbWV0YWRvck1hcCddID0gbWV0YWRvck1hcDtcbiAgICAvLyBtZXRhZG9yWydnZW9tTG9hZGVyJ10gPSBuZXcgbWV0YWRvci5HZW9tTG9hZGVyKG1ldGFkb3JNYXAsIDxIVE1MRm9ybUVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2ZpbGUtdXBsb2FkLWZvcm0nKSk7XG59XG5pbml0KCk7Il19
