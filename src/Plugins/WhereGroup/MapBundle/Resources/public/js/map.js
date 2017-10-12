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
        this.initSelect();
    }
    FeatureInfo.prototype.initSelect = function () {
        var fi = this;
        var timestamp = 0;
        this.select = new ol.interaction.Select({
            multi: true,
            layers: [this.layer],
            filter: function (feature) {
                timestamp = Date.now() + 5;
                setTimeout(function () {
                    if (Date.now() >= timestamp) {
                        fi.showTooltip();
                    }
                }, 5);
                return true;
            }
        });
        this.select.on('select', function (e) {
            if (e.target.getFeatures().getLength() === 0) {
                fi.showTooltip();
            }
        });
    };
    FeatureInfo.prototype.reset = function () {
        if (this.select) {
            this.select.getFeatures().clear();
        }
        if (this.tooltipElm) {
            dom_1.dom.addClass(this.tooltipElm, 'hidden');
        }
        if (this.callbackUnSelectAll) {
            this.callbackUnSelectAll();
        }
    };
    FeatureInfo.prototype.selectFeatures = function (uuids) {
        var fi = this;
        if (this.layer && this.select) {
            this.reset();
            this.layer.getSource().forEachFeature(function (feature) {
                for (var _i = 0, uuids_1 = uuids; _i < uuids_1.length; _i++) {
                    var uuid = uuids_1[_i];
                    if (feature.get(Ol4_1.UUID) === uuid) {
                        fi.select.getFeatures().push(feature);
                    }
                }
            });
            this.showTooltip();
        }
    };
    FeatureInfo.prototype.activate = function (tooltipElm, callbackSelect, callbackUnSelect, callbackUnSelectAll) {
        this.callbackSelect = callbackSelect;
        this.callbackUnSelect = callbackUnSelect;
        this.callbackUnSelectAll = callbackUnSelectAll;
        this.olMap.on('click', this.setTooltipPosition, this);
        this.tooltipElm = tooltipElm;
        this.tooltipElm.addEventListener('click', this.itemClick.bind(this), false);
        this.tooltip = new ol.Overlay({
            element: this.tooltipElm,
            offset: [0, -6],
            positioning: 'bottom-center'
        });
        this.olMap.addOverlay(this.tooltip);
        this.select.getFeatures().clear();
        this.olMap.addInteraction(this.select);
    };
    FeatureInfo.prototype.deactivate = function () {
        this.select.getFeatures().clear();
        this.olMap.removeInteraction(this.select);
        this.callbackUnSelectAll();
        this.callbackSelect = null;
        this.callbackUnSelect = null;
        this.callbackUnSelectAll = null;
        this.tooltipElm.removeEventListener('click', this.itemClick.bind(this));
        this.tooltipElm.remove();
        this.olMap.removeOverlay(this.tooltip);
        this.olMap.un('click', this.setTooltipPosition, this);
    };
    FeatureInfo.prototype.itemClick = function (e) {
        if (e.target.tagName === FeatureInfo.itemTagName.toUpperCase()) {
            var tag = e.target;
            if (!dom_1.dom.hasClass(tag, '-js-tooltip-item')) {
                this.select.getFeatures().clear();
                this.unSelectDataset();
                dom_1.dom.addClass(this.tooltipElm, 'hidden');
            }
            else {
                dom_1.dom.removeClass(tag.parentElement, 'selected', 'span');
                dom_1.dom.addClass(tag, 'selected');
                this.select.getFeatures().clear();
                this.unSelectDataset();
                var feature = this.layer.getSource().getFeatureById(tag.getAttribute('data-id'));
                this.select.getFeatures().push(feature);
                this.selectDataset(feature.get(Ol4_1.UUID));
            }
        }
        else {
            e.stopPropagation();
        }
    };
    FeatureInfo.prototype.setTooltipPosition = function (en) {
        this.tooltipCoord = en.coordinate;
    };
    FeatureInfo.prototype.hideTooltip = function () {
        dom_1.dom.addClass(this.tooltipElm, 'hidden');
    };
    FeatureInfo.prototype.showTooltip = function () {
        var features = this.select.getFeatures().getArray();
        dom_1.dom.remove('.-js-tooltip-item', this.tooltipElm);
        this.unSelectDataset();
        if (features.length === 0) {
            this.hideTooltip();
        }
        else if (features.length === 1) {
            this.hideTooltip();
            this.selectDataset(features[0].get(Ol4_1.UUID));
        }
        else {
            for (var _i = 0, features_1 = features; _i < features_1.length; _i++) {
                var feature = features_1[_i];
                if (!feature.getId()) {
                    feature.setId(feature.get(Ol4_1.UUID));
                }
                var attrs = {
                    "title": feature.get(Ol4_1.TITLE),
                    "data-uuid": feature.get(Ol4_1.UUID),
                    "data-id": feature.getId()
                };
                this.tooltipElm.appendChild(dom_1.dom.create(FeatureInfo.itemTagName, attrs, ['-js-tooltip-item', 'selected'], feature.get(Ol4_1.TITLE)));
                this.selectDataset(feature.get(Ol4_1.UUID));
            }
            dom_1.dom.removeClass(this.tooltipElm, 'hidden');
            this.tooltip.setPosition(this.tooltipCoord);
        }
    };
    FeatureInfo.prototype.selectDataset = function (selector) {
        if (this.callbackSelect) {
            this.callbackSelect(selector);
        }
    };
    FeatureInfo.prototype.unSelectDataset = function (selector) {
        if (selector === void 0) { selector = null; }
        if (selector !== null && this.callbackUnSelect) {
            this.callbackUnSelect(selector);
        }
        else if (selector === null && this.callbackUnSelectAll) {
            this.callbackUnSelectAll();
        }
    };
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
    Ol4Map.prototype.resetFeatureInfo = function () {
        this.featureInfo.reset();
    };
    Ol4Map.prototype.selectFeatures = function (uuids) {
        this.featureInfo.selectFeatures(uuids);
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
    dom.addClass = function (context, name, selector) {
        if (selector === void 0) { selector = null; }
        if (selector) {
            var list = dom.find(selector, context);
            for (var i = 0; i < list.length; i++) {
                list[i].classList.add(name);
            }
        }
        else {
            context.classList.add(name);
        }
    };
    ;
    dom.removeClass = function (context, name, selector) {
        if (selector === void 0) { selector = null; }
        if (selector) {
            var list = dom.find(selector, context);
            for (var i = 0; i < list.length; i++) {
                list[i].classList.remove(name);
            }
        }
        else {
            context.classList.remove(name);
        }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvUGx1Z2lucy9XaGVyZUdyb3VwL01hcEJ1bmRsZS9SZXNvdXJjZXMvdHMvRHJhZ1pvb20udHMiLCJzcmMvUGx1Z2lucy9XaGVyZUdyb3VwL01hcEJ1bmRsZS9SZXNvdXJjZXMvdHMvRmVhdHVyZUluZm8udHMiLCJzcmMvUGx1Z2lucy9XaGVyZUdyb3VwL01hcEJ1bmRsZS9SZXNvdXJjZXMvdHMvTGF5ZXJUcmVlLnRzIiwic3JjL1BsdWdpbnMvV2hlcmVHcm91cC9NYXBCdW5kbGUvUmVzb3VyY2VzL3RzL09sNC50cyIsInNyYy9QbHVnaW5zL1doZXJlR3JvdXAvTWFwQnVuZGxlL1Jlc291cmNlcy90cy9PbDRTb3VyY2UudHMiLCJzcmMvUGx1Z2lucy9XaGVyZUdyb3VwL01hcEJ1bmRsZS9SZXNvdXJjZXMvdHMvZG9tLnRzIiwic3JjL1BsdWdpbnMvV2hlcmVHcm91cC9NYXBCdW5kbGUvUmVzb3VyY2VzL3RzL21hcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsNkJBQTBCO0FBRTFCO0lBS0ksa0JBQVksR0FBVztRQUNuQixJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQztRQUNqQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksRUFBRSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUM7WUFDeEMsU0FBUyxFQUFFO2dCQUNQLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDaEIsQ0FBQztTQUNKLENBQUMsQ0FBQztRQUNILFNBQUcsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNyRyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUMzRCxDQUFDO0lBRU8sOEJBQVcsR0FBbkIsVUFBb0IsQ0FBQztRQUNqQixFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3BCLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUN0QixDQUFDO0lBQ0wsQ0FBQztJQUVPLDJCQUFRLEdBQWhCO1FBQ0ksU0FBRyxDQUFDLFFBQVEsQ0FBYyxTQUFHLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUM3RSxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVPLDZCQUFVLEdBQWxCO1FBQ0ksU0FBRyxDQUFDLFdBQVcsQ0FBYyxTQUFHLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUNoRixJQUFJLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBL0JjLHVCQUFjLEdBQVcsZUFBZSxDQUFDO0lBZ0M1RCxlQUFDO0NBakNELEFBaUNDLElBQUE7QUFqQ1ksNEJBQVE7Ozs7O0FDRnJCLDZCQUFrQztBQUNsQyw2QkFBMEI7QUFFMUI7SUFZSSxxQkFBWSxHQUFXLEVBQUUsS0FBNkI7UUFBN0Isc0JBQUEsRUFBQSxZQUE2QjtRQUNsRCxJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQztRQUNqQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7SUFDdEIsQ0FBQztJQUVPLGdDQUFVLEdBQWxCO1FBQ0ksSUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ2hCLElBQUksU0FBUyxHQUFXLENBQUMsQ0FBQztRQUMxQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksRUFBRSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUM7WUFDcEMsS0FBSyxFQUFFLElBQUk7WUFDWCxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQ3BCLE1BQU0sRUFBRSxVQUFVLE9BQW1CO2dCQUNqQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDM0IsVUFBVSxDQUFDO29CQUNQLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDO3dCQUMxQixFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7b0JBQ3JCLENBQUM7Z0JBQ0wsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNOLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDaEIsQ0FBQztTQUNKLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUM7WUFDaEMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMzQyxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDckIsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELDJCQUFLLEdBQUw7UUFDSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNkLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDdEMsQ0FBQztRQUNELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQ2xCLFNBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUM1QyxDQUFDO1FBQ0QsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQztZQUMzQixJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUMvQixDQUFDO0lBQ0wsQ0FBQztJQUVELG9DQUFjLEdBQWQsVUFBZ0IsS0FBZTtRQUMzQixJQUFNLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDaEIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUM1QixJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDYixJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDLGNBQWMsQ0FDakMsVUFBVSxPQUFtQjtnQkFDekIsR0FBRyxDQUFDLENBQWUsVUFBSyxFQUFMLGVBQUssRUFBTCxtQkFBSyxFQUFMLElBQUs7b0JBQW5CLElBQU0sSUFBSSxjQUFBO29CQUNYLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQzt3QkFDN0IsRUFBRSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQzFDLENBQUM7aUJBQ0o7WUFDTCxDQUFDLENBQ0osQ0FBQTtZQUNELElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUN2QixDQUFDO0lBQ0wsQ0FBQztJQUVELDhCQUFRLEdBQVIsVUFBUyxVQUF1QixFQUFFLGNBQXdCLEVBQUUsZ0JBQTBCLEVBQUUsbUJBQTZCO1FBQ2pILElBQUksQ0FBQyxjQUFjLEdBQUcsY0FBYyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQztRQUN6QyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsbUJBQW1CLENBQUM7UUFDL0MsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN0RCxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUM3QixJQUFJLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM1RSxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQztZQUMxQixPQUFPLEVBQUUsSUFBSSxDQUFDLFVBQVU7WUFDeEIsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2YsV0FBVyxFQUFFLGVBQWU7U0FDL0IsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRXBDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDbEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzNDLENBQUM7SUFFRCxnQ0FBVSxHQUFWO1FBQ0ksSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNsQyxJQUFJLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUUxQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUMzQixJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQztRQUMzQixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO1FBQzdCLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLENBQUM7UUFDaEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUN4RSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN2QyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFFTywrQkFBUyxHQUFqQixVQUFrQixDQUFRO1FBQ3RCLEVBQUUsQ0FBQyxDQUFPLENBQUMsQ0FBQyxNQUFPLENBQUMsT0FBTyxLQUFLLFdBQVcsQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3BFLElBQUksR0FBRyxHQUFpQixDQUFDLENBQUMsTUFBTyxDQUFDO1lBQ2xDLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ2xDLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztnQkFDdkIsU0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQzVDLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDSixTQUFHLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUN2RCxTQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxVQUFVLENBQUMsQ0FBQztnQkFDOUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDbEMsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO2dCQUN2QixJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7Z0JBQ25GLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUN4QyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBSSxDQUFDLENBQUMsQ0FBQztZQUMxQyxDQUFDO1FBQ0wsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3hCLENBQUM7SUFDTCxDQUFDO0lBRU8sd0NBQWtCLEdBQTFCLFVBQTJCLEVBQXNCO1FBQzdDLElBQUksQ0FBQyxZQUFZLEdBQUcsRUFBRSxDQUFDLFVBQVUsQ0FBQztJQUN0QyxDQUFDO0lBRU8saUNBQVcsR0FBbkI7UUFDSSxTQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVPLGlDQUFXLEdBQW5CO1FBQ0ksSUFBTSxRQUFRLEdBQWlCLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDcEUsU0FBRyxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDakQsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3ZCLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4QixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDdkIsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ25CLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFJLENBQUMsQ0FBQyxDQUFDO1FBQzlDLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLEdBQUcsQ0FBQyxDQUFnQixVQUFRLEVBQVIscUJBQVEsRUFBUixzQkFBUSxFQUFSLElBQVE7Z0JBQXZCLElBQUksT0FBTyxpQkFBQTtnQkFDWixFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQ25CLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUNyQyxDQUFDO2dCQUNELElBQUksS0FBSyxHQUFHO29CQUNSLE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQUssQ0FBQztvQkFDM0IsV0FBVyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBSSxDQUFDO29CQUM5QixTQUFTLEVBQUUsT0FBTyxDQUFDLEtBQUssRUFBRTtpQkFDN0IsQ0FBQztnQkFDRixJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FDdkIsU0FBRyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDLGtCQUFrQixFQUFFLFVBQVUsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBSyxDQUFDLENBQUMsQ0FDbkcsQ0FBQztnQkFDRixJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBSSxDQUFDLENBQUMsQ0FBQzthQUN6QztZQUNELFNBQUcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUMzQyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDaEQsQ0FBQztJQUNMLENBQUM7SUFFTyxtQ0FBYSxHQUFyQixVQUFzQixRQUFnQjtRQUNsQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztZQUN0QixJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2xDLENBQUM7SUFDTCxDQUFDO0lBRU8scUNBQWUsR0FBdkIsVUFBd0IsUUFBdUI7UUFBdkIseUJBQUEsRUFBQSxlQUF1QjtRQUMzQyxFQUFFLENBQUMsQ0FBQyxRQUFRLEtBQUssSUFBSSxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7WUFDN0MsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3BDLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsUUFBUSxLQUFLLElBQUksSUFBSSxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO1lBQ3ZELElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1FBQy9CLENBQUM7SUFDTCxDQUFDO0lBM0tjLHVCQUFXLEdBQVcsTUFBTSxDQUFDO0lBNEtoRCxrQkFBQztDQTdLRCxBQTZLQyxJQUFBO0FBN0tZLGtDQUFXOzs7OztBQ0h4Qiw2QkFBMEI7QUFDMUIsNkJBQTBDO0FBSTFDO0lBY0ksbUJBQW9CLE1BQWM7UUFIMUIsaUJBQVksR0FBRyxJQUFJLENBQUM7UUFDcEIsZ0JBQVcsR0FBRyxDQUFDLENBQUM7UUFHcEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLElBQUksR0FBZ0IsU0FBRyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDL0QsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDeEIsSUFBSSxLQUFLLEdBQUcsU0FBRyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM5RCxJQUFJLENBQUMsWUFBWSxDQUFjLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNoRCxDQUFDO0lBQ0wsQ0FBQztJQUVNLGdCQUFNLEdBQWIsVUFBYyxNQUFjO1FBQ3hCLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDdkIsU0FBUyxDQUFDLFNBQVMsR0FBRyxJQUFJLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNoRCxDQUFDO1FBQ0QsTUFBTSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUM7SUFDL0IsQ0FBQztJQUVPLGlDQUFhLEdBQXJCLFVBQXNCLEtBQW9CO1FBQ3RDLE1BQU0sQ0FBYyxTQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQUksQ0FBQyxDQUFDLENBQUM7SUFDN0QsQ0FBQztJQUVPLG9DQUFnQixHQUF4QixVQUF5QixLQUFvQjtRQUN6QyxNQUFNLENBQWtCLFNBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBSSxDQUFDLEdBQUcsMEJBQTBCLENBQUMsQ0FBQztJQUM5RixDQUFDO0lBRU8sb0NBQWdCLEdBQXhCLFVBQXlCLEtBQW9CO1FBQ3pDLE1BQU0sQ0FBa0IsU0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFJLENBQUMsR0FBRywwQkFBMEIsQ0FBQyxDQUFDO0lBQzlGLENBQUM7SUFFRCw4QkFBVSxHQUFWLFVBQVcsS0FBb0I7UUFDM0IsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzVDLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDO0lBQzVCLENBQUM7SUFFRCw4QkFBVSxHQUFWLFVBQVcsS0FBb0IsRUFBRSxPQUFnQixFQUFFLE1BQXVCO1FBQXZCLHVCQUFBLEVBQUEsY0FBdUI7UUFDdEUsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzVDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEtBQUssT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUMxQyxRQUFRLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUMvQixDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEtBQUssT0FBTyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDaEQsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3JCLENBQUM7SUFDTCxDQUFDO0lBRUQsOEJBQVUsR0FBVixVQUFXLEtBQW9CLEVBQUUsT0FBZ0I7UUFDN0MsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNyQyxJQUFJLGVBQWUsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbkQsSUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2pELEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDVixTQUFHLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztZQUMvQixlQUFlLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNqRCxhQUFhLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQTtRQUNsRCxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixTQUFHLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztZQUNsQyxlQUFlLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzVDLGFBQWEsQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDOUMsQ0FBQztJQUNMLENBQUM7SUFFTyxrQ0FBYyxHQUF0QixVQUF1QixJQUFZO1FBQy9CLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDcEMsSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUM5QyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzVCLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDcEQsQ0FBQztRQUNMLENBQUM7UUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRCwwQkFBTSxHQUFOLFVBQU8sS0FBb0I7UUFDdkIsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMxQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ1osSUFBSSxDQUFDLGVBQWUsQ0FBYyxTQUFTLENBQUMsQ0FBQztZQUM3QyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDdkIsQ0FBQztJQUNMLENBQUM7SUFFRCx1QkFBRyxHQUFILFVBQUksS0FBb0I7UUFDcEIsSUFBSSxTQUFTLEdBQUcsU0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFJLENBQUMsRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsZUFBZSxDQUFDLENBQUMsQ0FBQztRQUMvRyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUN2QixJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN0QyxDQUFDO1FBQ0QsU0FBUyxDQUFDLFdBQVcsQ0FDakIsU0FBRyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQ2QsRUFBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsTUFBTSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsV0FBSyxDQUFDLEVBQUMsRUFDbkYsQ0FBQyxZQUFZLENBQUMsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsV0FBSyxDQUFDLENBQUMsQ0FBQyxDQUM3RCxDQUFDO1FBQ0YsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDdkIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDdEMsQ0FBQztRQUVELElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxTQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNsRSxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUN4QixJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2pDLENBQUM7SUFDTCxDQUFDO0lBRU8sOEJBQVUsR0FBbEIsVUFBbUIsU0FBc0IsRUFBRSxLQUFvQjtRQUMzRCxJQUFJLEtBQUssR0FBRyxTQUFHLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUMsRUFDaEQsQ0FBQyxPQUFPLEVBQUUsd0JBQXdCLENBQUMsQ0FBQyxDQUFDO1FBQ3ZCLEtBQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ3RELEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDdkUsU0FBUyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNqQyxDQUFDO0lBRU8saUNBQWEsR0FBckIsVUFBc0IsQ0FBQztRQUNuQixJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN4RSxDQUFDO0lBRU8sOEJBQVUsR0FBbEIsVUFBbUIsU0FBc0IsRUFBRSxLQUFvQjtRQUMzRCxJQUFJLE1BQU0sR0FBRyxTQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxFQUFFLEVBQ2hDLENBQUMsZUFBZSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsb0JBQW9CLEVBQUUsd0JBQXdCLENBQUMsQ0FBQyxDQUFDO1FBRTNGLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDM0IsTUFBTSxDQUFDLFdBQVcsQ0FBQyxTQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxFQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDckYsQ0FBQztRQUNpQixNQUFPLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNoRSxNQUFNLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3hFLFNBQVMsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUVPLGlDQUFhLEdBQXJCLFVBQXNCLENBQUM7UUFDbkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsRUFBRSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDbEYsQ0FBQztJQUVPLGdDQUFZLEdBQXBCLFVBQXFCLEtBQWtCLEVBQUUsT0FBd0I7UUFBeEIsd0JBQUEsRUFBQSxlQUF3QjtRQUM3RCxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDWCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3RFLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDdEUsQ0FBQztRQUNELEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDdEUsS0FBSyxDQUFDLGdCQUFnQixDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNwRSxLQUFLLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3BFLENBQUM7SUFFTyxtQ0FBZSxHQUF2QixVQUF3QixLQUFrQixFQUFFLE9BQXdCO1FBQXhCLHdCQUFBLEVBQUEsZUFBd0I7UUFDaEUsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ1gsS0FBSyxDQUFDLG1CQUFtQixDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUN6RSxLQUFLLENBQUMsbUJBQW1CLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3pFLENBQUM7UUFDRCxLQUFLLENBQUMsbUJBQW1CLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3pFLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDdkUsS0FBSyxDQUFDLG1CQUFtQixDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN2RSxDQUFDO0lBR08sNkJBQVMsR0FBakIsVUFBa0IsQ0FBQztRQUNmLElBQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUM3QixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDNUQsQ0FBQyxDQUFDLFlBQVksQ0FBQyxhQUFhLEdBQUcsTUFBTSxDQUFDO1FBQ3RDLENBQUMsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2pFLFNBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxNQUFNLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBRU8sNEJBQVEsR0FBaEIsVUFBaUIsQ0FBQztRQUNkLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO1lBQ25CLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN2QixDQUFDO1FBQ0QsQ0FBQyxDQUFDLFlBQVksQ0FBQyxVQUFVLEdBQUcsTUFBTSxDQUFDO1FBQ25DLE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUVPLDZCQUFTLEdBQWpCLFVBQWtCLENBQUM7UUFDZixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxJQUFJLENBQUMsQ0FBQyxNQUFNLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxZQUFZLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDaEYsSUFBSSxDQUFDO2dCQUNELElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUNsQixJQUFJLENBQUMsWUFBWSxFQUNqQixDQUFDLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQ3pELENBQUM7WUFDTixDQUFDO1lBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNiLENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztJQUVPLDRCQUFRLEdBQWhCLFVBQWlCLENBQUM7UUFDZCxDQUFDLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDcEIsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ25CLFNBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztJQUN0QyxDQUFDO0lBRU8sMkJBQU8sR0FBZixVQUFnQixDQUFDO1FBQ2IsU0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO0lBQzVHLENBQUM7SUFFTyxvQ0FBZ0IsR0FBeEIsVUFBeUIsS0FBSztRQUMxQixJQUFJLElBQUksR0FBRyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsc0NBQXNDLENBQUMsQ0FBQztRQUM3RSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUNuQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUMxQixNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQy9CLENBQUM7UUFDTCxDQUFDO1FBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNoQixDQUFDO0lBM01jLG1CQUFTLEdBQVcsRUFBRSxDQUFDO0lBQ3ZCLHNCQUFZLEdBQVcsdUNBQXVDLENBQUM7SUFDL0QsdUJBQWEsR0FBVyxrQkFBa0IsQ0FBQztJQUMzQyxvQkFBVSxHQUFZLElBQUksQ0FBQztJQUMzQixvQkFBVSxHQUFZLElBQUksQ0FBQztJQUMzQixxQkFBVyxHQUFZLElBQUksQ0FBQztJQUM1QixvQkFBVSxHQUFZLElBQUksQ0FBQztJQXNNOUMsZ0JBQUM7Q0E5TUQsQUE4TUMsSUFBQTtBQTlNWSw4QkFBUzs7Ozs7Ozs7Ozs7Ozs7O0FDSHRCLHlDQUFzQztBQUN0Qyx1Q0FBb0M7QUFDcEMseUNBQW9FO0FBQ3BFLDZDQUEwQztBQU8xQztJQUFBO0lBb0ZBLENBQUM7SUFoRmlCLDhCQUFxQixHQUFuQyxVQUFvQyxLQUFhO1FBQzdDLElBQUksR0FBRyxHQUFHLElBQUksR0FBRyxJQUFJLENBQUM7UUFDdEIsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDekMsSUFBSSxjQUFjLEdBQUcsS0FBSyxDQUFDO1FBQzNCLE1BQU0sQ0FBQyxHQUFHLEdBQUcsY0FBYyxHQUFHLEdBQUcsQ0FBQztJQUN0QyxDQUFDO0lBRWEsMkJBQWtCLEdBQWhDLFVBQWlDLEtBQWEsRUFBRSxNQUFjO1FBQzFELE1BQU0sQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDO0lBQzFCLENBQUM7SUFFYSw2QkFBb0IsR0FBbEMsVUFBbUMsTUFBZ0IsRUFBRSxLQUFhO1FBQzlELElBQUksV0FBVyxHQUFHLEVBQUUsQ0FBQztRQUNyQixJQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMscUJBQXFCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbkQsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDckMsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDckUsQ0FBQztRQUNELE1BQU0sQ0FBQyxXQUFXLENBQUM7SUFDdkIsQ0FBQztJQUVhLDJCQUFrQixHQUFoQyxVQUFpQyxVQUFrQixFQUFFLE1BQWM7UUFDL0QsTUFBTSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUM7SUFDL0IsQ0FBQztJQUVhLDZCQUFvQixHQUFsQyxVQUFtQyxXQUFxQixFQUFFLEtBQWE7UUFDbkUsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2hCLElBQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNuRCxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBVyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUNsRCxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNyRSxDQUFDO1FBQ0QsTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUNsQixDQUFDO0lBRWEsc0JBQWEsR0FBM0IsVUFBNEIsU0FBYztRQUN0QyxHQUFHLENBQUMsQ0FBQyxJQUFNLE1BQUksSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQzNCLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBSSxFQUFFLFNBQVMsQ0FBQyxNQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ2xDLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQUksQ0FBQyxDQUFDO1FBQy9CLENBQUM7SUFDTCxDQUFDO0lBRWEsZ0JBQU8sR0FBckIsVUFBc0IsUUFBZ0I7UUFDbEMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ2pDLENBQUM7SUFFYSxpQkFBUSxHQUF0QixVQUF1QixPQUFZLEVBQUUsS0FBNEI7UUFBNUIsc0JBQUEsRUFBQSxZQUE0QjtRQUM3RCxJQUFJLE1BQU0sR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2xELE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25ELE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pELEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pELE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztnQkFDNUIsTUFBTSxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxRQUFRLENBQUM7Z0JBQzVDLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO29CQUNwQixLQUFLLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQztpQkFDckQsQ0FBQzthQUNMLENBQ0osQ0FBQyxDQUFDO1FBQ1AsQ0FBQztRQUNELE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFVbEIsQ0FBQztJQWFMLGVBQUM7QUFBRCxDQXBGQSxBQW9GQyxJQUFBO0FBcEZZLDRCQUFRO0FBc0ZyQjtJQUlJLGlCQUFZLElBQXNCLEVBQUUsSUFBd0I7UUFIbEQsU0FBSSxHQUFxQixJQUFJLENBQUM7UUFDOUIsU0FBSSxHQUF1QixJQUFJLENBQUM7UUFHdEMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7SUFDckIsQ0FBQztJQUVELHlCQUFPLEdBQVA7UUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztJQUNyQixDQUFDO0lBRUQseUJBQU8sR0FBUDtRQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0lBQ3JCLENBQUM7SUFFRCwyQkFBUyxHQUFULFVBQVUsSUFBd0I7UUFDOUIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLE1BQU0sQ0FBMkIsSUFBSSxDQUFDLElBQUssQ0FBQyxLQUFLLEVBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNoRyxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixNQUFNLENBQTJCLElBQUksQ0FBQyxJQUFLLENBQUMsS0FBSyxFQUFHLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDckUsQ0FBQztJQUNMLENBQUM7SUFFTSxxQ0FBbUIsR0FBMUIsVUFBMkIsSUFBd0I7UUFDL0MsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDNUQsQ0FBQztJQUNMLGNBQUM7QUFBRCxDQTVCQSxBQTRCQyxJQUFBO0FBNUJZLDBCQUFPO0FBOEJwQjtJQUErQiw2QkFBTztJQUF0Qzs7SUFLQSxDQUFDO0lBSmlCLG1CQUFTLEdBQXZCLFVBQXdCLFNBQW1CLEVBQUUsSUFBd0I7UUFDakUsSUFBSSxJQUFJLEdBQUcsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNoRyxNQUFNLENBQUMsSUFBSSxTQUFTLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFDTCxnQkFBQztBQUFELENBTEEsQUFLQyxDQUw4QixPQUFPLEdBS3JDO0FBTFksOEJBQVM7QUFPVCxRQUFBLElBQUksR0FBVyxNQUFNLENBQUM7QUFDdEIsUUFBQSxVQUFVLEdBQVcsV0FBVyxDQUFDO0FBQ2pDLFFBQUEsS0FBSyxHQUFXLE9BQU8sQ0FBQztBQUN4QixRQUFBLFlBQVksR0FBc0IsV0FBVyxDQUFDO0FBQzlDLFFBQUEsWUFBWSxHQUFHLFFBQVEsQ0FBQztBQUN4QixRQUFBLFdBQVcsR0FBRyxPQUFPLENBQUM7QUFFbkM7SUFzQkksZ0JBQW9CLE9BQVk7UUFuQnhCLFVBQUssR0FBVyxJQUFJLENBQUM7UUFHckIsZ0JBQVcsR0FBYyxJQUFJLENBQUM7UUFDOUIsY0FBUyxHQUFjLElBQUksQ0FBQztRQWdCaEMsRUFBRSxDQUFDLDRCQUE0QixDQUFDLEdBQUcsS0FBSyxDQUFDO1FBQ3pDLFFBQVEsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7UUFDN0MsSUFBSSxDQUFDLFNBQVMsR0FBRyxxQkFBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN4QyxJQUFJLENBQUMsU0FBUyxHQUFHLHdCQUFZLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNqRCxJQUFJLENBQUMsU0FBUyxHQUFHLDJCQUFlLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzVCLFFBQVEsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFFLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUNqRyxJQUFJLElBQUksR0FBdUIsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7UUFDMUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDaEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDeEMsSUFBSSxDQUFDLFdBQVcsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxhQUFhLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM3RSxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFdBQVcsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3pFLElBQUksWUFBWSxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUN0QztZQUNJLGtCQUFrQixFQUFFLEtBQUs7WUFDekIsV0FBVyxFQUFFLEtBQUs7U0FDckIsQ0FDSixDQUFDO1FBQ0YsSUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBQyxXQUFXLEVBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQztRQUN6RCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQztZQUNwQixZQUFZLEVBQUUsWUFBWTtZQUMxQixNQUFNLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLFFBQVEsQ0FBQztZQUNoQyxRQUFRLEVBQUUsUUFBUTtZQUNsQixRQUFRLEVBQUUsUUFBUTtTQUNyQixDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FDZCxJQUFJLENBQUMsVUFBVSxDQUNYLElBQUksRUFDSixJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFDOUIsUUFBUSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQ3hFLENBQ0osQ0FBQztRQUVGLElBQUksVUFBVSxHQUFHLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7WUFDaEMsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLFVBQVUsRUFBaUI7U0FDN0MsQ0FBQyxDQUFDO1FBQ0gsVUFBVSxDQUFDLEdBQUcsQ0FBQyxZQUFJLEVBQUUsbUJBQVcsQ0FBQyxDQUFBO1FBQ2pDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRWhDLElBQUksV0FBVyxHQUFHLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7WUFDakMsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLFVBQVUsRUFBaUI7U0FDN0MsQ0FBQyxDQUFDO1FBQ0gsV0FBVyxDQUFDLEdBQUcsQ0FBQyxZQUFJLEVBQUUsb0JBQVksQ0FBQyxDQUFBO1FBQ25DLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRWpDLEdBQUcsQ0FBQyxDQUFzQixVQUFpQixFQUFqQixLQUFBLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBakIsY0FBaUIsRUFBakIsSUFBaUI7WUFBdEMsSUFBSSxhQUFhLFNBQUE7WUFDbEIsRUFBRSxDQUFDLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ2xDLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQ3hCLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUN0QixNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUN2QixhQUFhLEVBQ2IsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxhQUFhLEVBQUUsRUFDcEMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxFQUN4QixVQUFVLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQ3ZDLEVBQUUsSUFBSSxDQUNWLENBQUM7WUFDTixDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ0osT0FBTyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLEdBQUcsb0JBQW9CLENBQUMsQ0FBQztZQUNoRSxDQUFDO1NBQ0o7UUFDRCxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztRQUVsRCxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDO1lBQzlDLE1BQU0sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUM7U0FDekMsQ0FBQyxDQUFDLENBQUM7UUFDSixJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUN6RCxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUMsYUFBYSxFQVFqRCxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUM5RCxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FDaEMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFDdkIsRUFBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUMsRUFDdEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxhQUFhLEVBQUUsQ0FDdkMsQ0FBQztRQUNGLElBQUksQ0FBQyxPQUFPLEdBQW9CLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFbkQsSUFBSSxNQUFNLEdBQW9CLElBQUksQ0FBQyxRQUFRLENBQ3ZDLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUN0QixNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUN2QixFQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBQyxFQUNuRCxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLGFBQWEsRUFBRSxDQUN2QyxDQUNKLENBQUM7UUFDRixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMxQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxtQkFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN6QyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUkseUJBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNqRSxDQUFDO0lBbEdjLGNBQU8sR0FBdEIsVUFBdUIsTUFBbUI7UUFBbkIsdUJBQUEsRUFBQSxXQUFtQjtRQUN0QyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDckMsQ0FBQztJQWtHRCxvQ0FBbUIsR0FBbkIsVUFDSSxVQUF1QixFQUN2QixjQUF3QixFQUN4QixnQkFBMEIsRUFDMUIsbUJBQTZCO1FBRTdCLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxjQUFjLEVBQUUsZ0JBQWdCLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztJQUNqRyxDQUFDO0lBRUQsc0NBQXFCLEdBQXJCO1FBQ0ksSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUNsQyxDQUFDO0lBRUQsaUNBQWdCLEdBQWhCO1FBQ0ksSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUM3QixDQUFDO0lBRUQsK0JBQWMsR0FBZCxVQUFlLEtBQWU7UUFDMUIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUVELDZCQUFZLEdBQVo7UUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUMxQixDQUFDO0lBRU8saUNBQWdCLEdBQXhCLFVBQXlCLEtBQW9CO1FBQ3pDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ2pCLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzlCLENBQUM7SUFDTCxDQUFDO0lBRU8sMkJBQVUsR0FBbEIsVUFBbUIsSUFBd0IsRUFBRSxNQUFpQixFQUFFLFdBQXFCO1FBQ2pGLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUM7WUFDZixVQUFVLEVBQUUsSUFBSTtZQUNoQixXQUFXLEVBQUUsV0FBVztZQUN4QixNQUFNLEVBQUUsTUFBTTtTQUNqQixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsNkJBQVksR0FBWixVQUFhLFFBQTRDO1FBQ3JELElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBdUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0lBQ2xGLENBQUM7SUFFTSxhQUFNLEdBQWIsVUFBYyxPQUFZO1FBQ3RCLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDcEIsTUFBTSxDQUFDLFNBQVMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMzQyxDQUFDO1FBQ0QsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUM7SUFDNUIsQ0FBQztJQUVELDhCQUFhLEdBQWI7UUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUNoRCxDQUFDO0lBRUQsMEJBQVMsR0FBVDtRQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBQ3ZCLENBQUM7SUFFRCwyQkFBVSxHQUFWO1FBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDeEIsQ0FBQztJQU1ELG1DQUFrQixHQUFsQixVQUFtQixPQUFZO1FBQzNCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQzVCLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQ3hCLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUN0QixNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUN2QixPQUFPLEVBQ1AsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxhQUFhLEVBQUUsRUFDcEMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUNsQixVQUFVLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQ2pDLEVBQ0QsSUFBSSxDQUNQLENBQUM7UUFDTixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxvQkFBb0IsQ0FBQyxDQUFDO1FBQzFELENBQUM7SUFDTCxDQUFDO0lBRUQseUJBQVEsR0FBUixVQUFTLEtBQW9CLEVBQUUsY0FBK0I7UUFBL0IsK0JBQUEsRUFBQSxzQkFBK0I7UUFDMUQsRUFBRSxDQUFDLENBQUMsS0FBSyxZQUFZLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNsQyxJQUFJLEtBQUssR0FBb0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBVyxDQUFDLENBQUM7WUFDekUsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUMsU0FBUyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDckUsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLFlBQVksRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQzFDLElBQUksS0FBSyxHQUFvQyxJQUFJLENBQUMsU0FBUyxDQUFDLG9CQUFZLENBQUMsQ0FBQztZQUMxRSxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQyxTQUFTLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNyRSxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2hCLENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO1lBQ2pCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNqQyxDQUFDO1FBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBRUQsNEJBQVcsR0FBWCxVQUFZLEtBQW9CO1FBQzVCLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFFRCwwQkFBUyxHQUFULFVBQVUsSUFBWSxFQUFFLE1BQWMsRUFBRSxNQUFjO1FBQ2xELElBQUksS0FBSyxHQUFrQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2hELEVBQUUsQ0FBQyxDQUFDLEtBQUssWUFBWSxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDbEMsSUFBSSxLQUFLLEdBQW9DLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQVcsQ0FBQyxDQUFDO1lBQ3pFLElBQUksT0FBTyxHQUFHLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDOUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDaEQsQ0FBQztJQUNMLENBQUM7SUFFRCwwQkFBUyxHQUFULFVBQVUsSUFBWTtRQUNsQixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQy9DLEdBQUcsQ0FBQyxDQUFjLFVBQU0sRUFBTixpQkFBTSxFQUFOLG9CQUFNLEVBQU4sSUFBTTtZQUFuQixJQUFJLEtBQUssZUFBQTtZQUNWLElBQUksTUFBTSxTQUFrQixDQUFDO1lBQzdCLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsWUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDM0IsTUFBTSxDQUFDLEtBQUssQ0FBQztZQUNqQixDQUFDO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssWUFBWSxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ3pDLElBQUksU0FBUyxHQUFvQixLQUFNLENBQUMsU0FBUyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQy9ELEdBQUcsQ0FBQyxDQUFpQixVQUFTLEVBQVQsdUJBQVMsRUFBVCx1QkFBUyxFQUFULElBQVM7b0JBQXpCLElBQUksUUFBUSxrQkFBQTtvQkFDYixFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFlBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7d0JBQzlCLE1BQU0sQ0FBQyxRQUFRLENBQUM7b0JBQ3BCLENBQUM7aUJBQ0o7WUFDTCxDQUFDO1NBQ0o7UUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRCwwQkFBUyxHQUFUO1FBQ0ksSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUM1QixDQUFDO0lBRUQsMEJBQVMsR0FBVCxVQUFVLEdBQVc7UUFDakIsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlCLElBQUksTUFBTSxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQzVCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsRUFDMUQsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUN2QixDQUFDO1lBQ0YsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBR3BDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUNkLElBQUksQ0FBQyxVQUFVLENBQ1gsTUFBTSxFQUNOLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxFQUNoQyxRQUFRLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FDMUUsQ0FDSixDQUFDO1lBQ0YsSUFBSSxDQUFDLGlCQUFpQixDQUFrQixJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFXLENBQUUsQ0FBQyxTQUFTLEVBQUUsRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDcEcsSUFBSSxDQUFDLGdCQUFnQixDQUFrQixJQUFJLENBQUMsU0FBUyxDQUFDLG9CQUFZLENBQUUsQ0FBQyxTQUFTLEVBQUUsRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDcEcsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUMxRCxDQUFDO0lBQ0wsQ0FBQztJQUVPLGlDQUFnQixHQUF4QixVQUF5QixNQUFvQyxFQUFFLFFBQVEsRUFBRSxNQUFNO1FBQzNFLEdBQUcsQ0FBQyxDQUFjLFVBQWlCLEVBQWpCLEtBQUEsTUFBTSxDQUFDLFFBQVEsRUFBRSxFQUFqQixjQUFpQixFQUFqQixJQUFpQjtZQUE5QixJQUFJLEtBQUssU0FBQTtZQUNWLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztTQUM5RDtJQUNMLENBQUM7SUFFTyxrQ0FBaUIsR0FBekIsVUFBMEIsTUFBb0MsRUFBRSxRQUFRLEVBQUUsTUFBTTtRQUM1RSxHQUFHLENBQUMsQ0FBYyxVQUFpQixFQUFqQixLQUFBLE1BQU0sQ0FBQyxRQUFRLEVBQUUsRUFBakIsY0FBaUIsRUFBakIsSUFBaUI7WUFBOUIsSUFBSSxLQUFLLFNBQUE7WUFDVixJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUFpQixLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQzNFLElBQUksTUFBTSxHQUF3QyxLQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDckUsSUFBSSxHQUFHLEdBQTZCLE1BQU0sQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1lBQ2xFLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUNwQztJQUNMLENBQUM7SUFFRCwyQkFBVSxHQUFWLFVBQVcsS0FBNkIsRUFBRSxTQUFrQjtRQUN4RCxJQUFJLE1BQU0sR0FBa0IsS0FBSyxZQUFZLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQVMsS0FBSyxDQUFDLENBQUM7UUFDbkcsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNULE1BQU0sQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDakMsQ0FBQztJQUNMLENBQUM7SUFFRCwyQkFBVSxHQUFWLFVBQVcsS0FBNkIsRUFBRSxPQUFlO1FBQ3JELElBQUksTUFBTSxHQUFrQixLQUFLLFlBQVksRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBUyxLQUFLLENBQUMsQ0FBQztRQUNuRyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ1QsTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMvQixDQUFDO0lBQ0wsQ0FBQztJQUVELDhCQUFhLEdBQWI7UUFDSSxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUVELDZCQUFZLEdBQVosVUFBYSxPQUFlO1FBQ3hCLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDdkQsQ0FBQztJQUVELHNDQUFxQixHQUFyQjtRQUNJLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsU0FBUyxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDaEUsRUFBRSxDQUFBLENBQUMsUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZCLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDaEIsQ0FBQztRQUNELElBQUksT0FBTyxHQUFHLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxrQkFBa0IsQ0FDcEQsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUNYO1lBQ0ksZ0JBQWdCLEVBQUUsb0JBQVk7WUFDOUIsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRTtTQUM1QyxDQUNKLENBQUM7UUFDRixPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQzthQUN6RSxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsb0JBQVksQ0FBQyxDQUFDLENBQUM7UUFDMUMsTUFBTSxDQUFDLE9BQU8sQ0FBQztJQUNuQixDQUFDO0lBRUQsc0NBQXFCLEdBQXJCLFVBQXNCLE9BQWUsRUFBRSxTQUEwQjtRQUExQiwwQkFBQSxFQUFBLGdCQUEwQjtRQUM3RCxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUM7UUFDbEIsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN2QixJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDckQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM3RCxJQUFJLFVBQVUsR0FBNEMsU0FBUyxDQUFDLFNBQVMsQ0FDekUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxTQUFTLEVBQUUsRUFDOUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxhQUFhLEVBQUUsQ0FDdkMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNaLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDO1FBQ3pGLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO2VBQ3BFLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdFLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO1FBQ3RFLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLE9BQU8sQ0FBQyxZQUFZLENBQUMseURBQXlELENBQUMsQ0FBQztRQUNwRixDQUFDO1FBQ0QsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7UUFDOUMsRUFBRSxDQUFDLENBQUMsU0FBUyxLQUFLLElBQUksSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQ25DLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUMxQixDQUFDO0lBQ0wsQ0FBQztJQUVELG1DQUFrQixHQUFsQixVQUFtQixTQUF3QixFQUFFLFNBQTBCO1FBQXBELDBCQUFBLEVBQUEsZ0JBQXdCO1FBQUUsMEJBQUEsRUFBQSxnQkFBMEI7UUFDbkUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQy9CLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQztRQUNsQixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3ZCLElBQU0sS0FBSyxHQUFXLE9BQU8sU0FBUyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFVLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDN0YsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUM7UUFDL0QsQ0FBQztRQUNELElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQy9CLElBQUksUUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7WUFDekIsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2hELElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQztZQUN4RCxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFDLEVBQUUsQ0FDM0IsV0FBVyxFQUNYLFVBQVUsQ0FBQztnQkFDUCxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUMsU0FBUyxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDdEQsQ0FBQyxDQUNKLENBQUM7WUFDRixJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFDLEVBQUUsQ0FDM0IsU0FBUyxFQUNULFVBQVUsQ0FBQztnQkFDUCxJQUFJLE9BQU8sR0FBRyxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUMsa0JBQWtCLENBQ3BELENBQUMsQ0FBQyxPQUFPLEVBQ1Q7b0JBQ0ksZ0JBQWdCLEVBQUUsb0JBQVk7b0JBQzlCLG1CQUFtQixFQUFFLE1BQU0sQ0FBQyxhQUFhLEVBQUU7aUJBQzlDLENBQ0osQ0FBQztnQkFDRixPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsRUFBRSxNQUFNLENBQUMsYUFBYSxFQUFFLENBQUM7cUJBQ3pFLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxvQkFBWSxDQUFDLENBQUMsQ0FBQztnQkFDMUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUNuQixLQUFLLENBQUMsaUJBQWlCLENBQUMsUUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUM7WUFDckQsQ0FBQyxDQUNKLENBQUM7UUFDTixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUMsU0FBUyxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDaEQsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2hCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNsQyxDQUFDO0lBQ0wsQ0FBQztJQU1PLG1DQUFrQixHQUExQixVQUEyQixLQUFjO1FBQ3JDLEdBQUcsQ0FBQyxDQUFvQixVQUF1QyxFQUF2QyxLQUFBLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxFQUFFLENBQUMsUUFBUSxFQUFFLEVBQXZDLGNBQXVDLEVBQXZDLElBQXVDO1lBQTFELElBQUksV0FBVyxTQUFBO1lBQ2hCLEVBQUUsQ0FBQyxDQUFDLFdBQVcsWUFBWSxFQUFFLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hELFdBQVcsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzdCLEtBQUssQ0FBQztZQUNWLENBQUM7U0FDSjtJQUNMLENBQUM7SUFuWmMsWUFBSyxHQUFHLENBQUMsQ0FBQztJQUNWLGdCQUFTLEdBQVcsSUFBSSxDQUFDO0lBbVo1QyxhQUFDO0NBclpELEFBcVpDLElBQUE7QUFyWlksd0JBQU07QUF1Wm5CLElBQVksTUFBMkI7QUFBdkMsV0FBWSxNQUFNO0lBQUUsbUNBQUksQ0FBQTtJQUFFLGlDQUFHLENBQUE7SUFBRSx5Q0FBTyxDQUFBO0FBQUEsQ0FBQyxFQUEzQixNQUFNLEdBQU4sY0FBTSxLQUFOLGNBQU0sUUFBcUI7QUFDdkMsQ0FBQztBQUVEO0lBS0ksbUJBQVksS0FBc0I7UUFDOUIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDdkIsQ0FBQztJQUVNLDRCQUFRLEdBQWY7UUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztJQUN0QixDQUFDO0lBRU0sa0NBQWMsR0FBckI7UUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQztJQUM1QixDQUFDO0lBRU0sa0NBQWMsR0FBckIsVUFBc0IsSUFBWSxFQUFFLFNBQXlCO1FBQ3pELE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDWCxLQUFLLE1BQU0sQ0FBQyxHQUFHO2dCQUNYLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxFQUFFLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQztvQkFDdkMsTUFBTSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFO29CQUM5QixJQUFJLEVBQUUsUUFBUTtvQkFDZCxLQUFLLEVBQUUsU0FBUztvQkFDaEIsZ0JBQWdCLEVBQUUsU0FBUyxFQUFFO2lCQUNoQyxDQUFDLENBQUM7Z0JBQ0gsS0FBSyxDQUFDO1lBQ1YsS0FBSyxNQUFNLENBQUMsT0FBTztnQkFDZixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksRUFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUM7b0JBQ3ZDLE1BQU0sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRTtvQkFDOUIsSUFBSSxFQUFFLFNBQVM7b0JBQ2YsS0FBSyxFQUFFLFNBQVM7aUJBQ25CLENBQUMsQ0FBQztnQkFDSCxLQUFLLENBQUM7WUFDVjtnQkFDSSxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztRQUNoQyxDQUFDO0lBQ0wsQ0FBQztJQUNMLGdCQUFDO0FBQUQsQ0F0Q0EsQUFzQ0MsSUFBQTtBQXRDWSw4QkFBUztBQTRDdEI7SUFDSSxNQUFNLENBQUMsQ0FNSCxVQUFVLFdBQVcsRUFBRSxZQUFZO1FBQy9CLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ25ELElBQUksUUFBUSxHQUFHLFlBQVksSUFBSSxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3pELFFBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFDckIsRUFBRSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDO2dCQUMvQixFQUFFLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUM7Z0JBQ2hDLEVBQUUsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQztnQkFDN0IsRUFBRSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDO2dCQUM1QixFQUFFLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUM7YUFDbEMsQ0FBQyxDQUFDLENBQUM7UUFDSixNQUFNLENBQUMsUUFBUSxDQUFDO0lBQ3BCLENBQUMsQ0FDSixDQUFDO0FBQ04sQ0FBQztBQXBCRCw4QkFvQkM7Ozs7O0FDeG1CRCw2QkFBc0Q7QUFHdEQ7SUFBQTtJQU9BLENBQUM7SUFBRCxnQkFBQztBQUFELENBUEEsQUFPQyxJQUFBO0FBUHFCLDhCQUFTO0FBUy9CO0lBS0kseUJBQW9CLE1BQWM7UUFIeEIsYUFBUSxHQUFZLEtBQUssQ0FBQztRQUtoQyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztJQUV6QixDQUFDO0lBRU0sc0JBQU0sR0FBYixVQUFjLE1BQWM7UUFDeEIsRUFBRSxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUM3QixlQUFlLENBQUMsU0FBUyxHQUFHLElBQUksZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzVELENBQUM7UUFDRCxNQUFNLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQztJQUNyQyxDQUFDO0lBRUQscUNBQVcsR0FBWCxVQUFZLFNBQWlCLEVBQUUsT0FBWSxFQUFFLElBQXVCLEVBQUUsT0FBdUIsRUFBRSxPQUFxQjtRQUE5Qyx3QkFBQSxFQUFBLGNBQXVCO1FBQUUsd0JBQUEsRUFBQSxhQUFxQjtRQUNoSCxJQUFJLE1BQU0sR0FBRyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO1lBQzdCLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUMsS0FBSyxFQUFFLEtBQUssRUFBQyxDQUFDO1lBQzVDLEtBQUssRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDO1NBQzFCLENBQUMsQ0FBQztRQUNILE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQzVCLE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUVELDRDQUFrQixHQUFsQixVQUFtQixLQUFvQixFQUFFLFFBQTJCLEVBQUUsTUFBeUI7UUFDM0YsSUFBSSxNQUFNLEdBQW9CLEtBQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNqRCxJQUFJLFFBQVEsR0FBb0MsTUFBTyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3RFLEdBQUcsQ0FBQyxDQUFnQixVQUFRLEVBQVIscUJBQVEsRUFBUixzQkFBUSxFQUFSLElBQVE7WUFBdkIsSUFBSSxPQUFPLGlCQUFBO1lBQ1osT0FBTyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO1NBQzFFO0lBQ0wsQ0FBQztJQUVELG9DQUFVLEdBQVYsVUFBVyxLQUFvQixFQUFFLFFBQTJCLEVBQUUsTUFBeUI7UUFFbkYsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBRUQsc0NBQVksR0FBWixVQUFhLE1BQXVCLEVBQUUsT0FBZTtRQUNqRCxJQUFJLGFBQWEsR0FBc0IsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQy9ELElBQUksUUFBUSxHQUFHLGFBQWEsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDckQsSUFBSSxRQUFRLEdBQUcsYUFBYSxDQUFDLFlBQVksQ0FDckMsT0FBTyxFQUNQO1lBQ0ksZ0JBQWdCLEVBQUUsYUFBYSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUM7WUFDdkQsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUU7U0FDbkQsQ0FBQyxDQUFDO1FBQ1AsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBRUQsdUNBQWEsR0FBYixVQUFjLE1BQXVCO1FBQ2pDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQUNMLHNCQUFDO0FBQUQsQ0F2REEsQUF1REMsSUFBQTtBQXZEWSwwQ0FBZTtBQXlENUI7SUFPSSxzQkFBb0IsTUFBYyxFQUFFLGFBQTZCO1FBQTdCLDhCQUFBLEVBQUEsb0JBQTZCO1FBQzdELElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO1FBQ25DLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLFlBQVksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3BELENBQUM7UUFDRCxJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztJQUN2QixDQUFDO0lBRU0sbUJBQU0sR0FBYixVQUFjLE1BQWMsRUFBRSxhQUE2QjtRQUE3Qiw4QkFBQSxFQUFBLG9CQUE2QjtRQUN2RCxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQzFCLFlBQVksQ0FBQyxTQUFTLEdBQUcsSUFBSSxZQUFZLENBQUMsTUFBTSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQ3JFLENBQUM7UUFDRCxNQUFNLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQztJQUNsQyxDQUFDO0lBRU0sa0NBQVcsR0FBbEIsVUFBbUIsS0FBb0I7UUFDbkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFJLENBQUMsQ0FBQztRQUNqRCxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDbkQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFFTSxxQ0FBYyxHQUFyQixVQUFzQixLQUFvQjtRQUN0QyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQUksQ0FBQyxDQUFDLENBQUEsQ0FBQztZQUNqQixJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDcEQsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDM0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ3ZDLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQUksQ0FBQyxDQUFDLENBQUM7UUFDMUMsQ0FBQztJQUNMLENBQUM7SUFFRCxrQ0FBVyxHQUFYLFVBQVksU0FBaUIsRUFBRSxPQUFtQixFQUFFLElBQXVCLEVBQUUsT0FBZ0IsRUFBRSxPQUFlO1FBQS9FLHdCQUFBLEVBQUEsY0FBbUI7UUFDOUMsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNuRixJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbEgsTUFBTSxDQUFDLFFBQVEsQ0FBQztJQUNwQixDQUFDO0lBRU8sbUNBQVksR0FBcEIsVUFBcUIsU0FBaUIsRUFBRSxPQUFnQixFQUFFLE9BQWUsRUFBRSxNQUEwQixFQUFFLEtBQW9CO1FBQXBCLHNCQUFBLEVBQUEsWUFBb0I7UUFDdkgsSUFBSSxRQUFRLEdBQUcsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztZQUM5QixNQUFNLEVBQUUsTUFBTTtZQUNkLE9BQU8sRUFBRSxPQUFPO1lBQ2hCLE9BQU8sRUFBRSxPQUFPO1NBQ25CLENBQUMsQ0FBQztRQUNILFFBQVEsQ0FBQyxHQUFHLENBQUMsVUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQzlCLEVBQUUsQ0FBQyxDQUFDLEtBQUssS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ2pCLFFBQVEsQ0FBQyxHQUFHLENBQUMsV0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQy9CLENBQUM7UUFDRCxNQUFNLENBQUMsUUFBUSxDQUFDO0lBQ3BCLENBQUM7SUFFTyxtQ0FBWSxHQUFwQixVQUFxQixTQUFpQixFQUFFLEdBQVcsRUFBRSxNQUFXLEVBQUUsSUFBdUI7UUFDckYsSUFBSSxNQUFNLEdBQUcsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQztZQUNoQyxHQUFHLEVBQUUsR0FBRztZQUNSLE1BQU0sRUFBRSxNQUFNO1lBQ2QsVUFBVSxFQUFFLElBQUk7U0FDbkIsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxDQUFDLEdBQUcsQ0FBQyxnQkFBVSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDM0IsTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUNsQixDQUFDO0lBRUQseUNBQWtCLEdBQWxCLFVBQW1CLEtBQW9CLEVBQUUsUUFBMkIsRUFBRSxNQUF5QjtRQUMzRixJQUFJLFNBQVMsR0FBd0MsS0FBTSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3hFLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFJLENBQUMsRUFBRSxTQUFTLENBQUMsTUFBTSxFQUFFLEVBQUUsU0FBUyxDQUFDLFNBQVMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3JGLEtBQU0sQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDN0MsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRUQsaUNBQVUsR0FBVixVQUFXLEtBQW9CLEVBQUUsUUFBMkIsRUFBRSxNQUF5QjtRQUNuRixJQUFJLFNBQVMsR0FBd0MsS0FBTSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3hFLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFJLENBQUMsRUFBRSxTQUFTLENBQUMsTUFBTSxFQUFFLEVBQUUsU0FBUyxDQUFDLFNBQVMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3RHLElBQUksUUFBUSxHQUFvQixLQUFNLENBQUM7UUFDdkMsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFVBQUksQ0FBQyxFQUFFLFFBQVEsQ0FBQyxVQUFVLEVBQUUsRUFBRSxRQUFRLENBQUMsVUFBVSxFQUFFLEVBQUUsU0FBUyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsV0FBSyxDQUFDLENBQUMsQ0FBQztRQUNuSSxNQUFNLENBQUMsUUFBUSxDQUFDO0lBQ3BCLENBQUM7SUFHTyxvQ0FBYSxHQUFyQixVQUFzQixNQUEwQjtRQUM1QyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUVyQixNQUFNLENBQUMsRUFBRSxDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDNUQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUN4RCxNQUFNLENBQUMsRUFBRSxDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDaEUsQ0FBQztJQUNMLENBQUM7SUFFRCxxQ0FBYyxHQUFkLFVBQWUsQ0FBdUI7UUFFbEMsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDM0IsWUFBWSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQXNCLENBQUMsQ0FBQyxNQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFVLENBQUMsQ0FBQyxDQUFDO1FBQ3ZGLENBQUM7SUFDTCxDQUFDO0lBRUQsbUNBQVksR0FBWixVQUFhLENBQXVCO1FBRWhDLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQzNCLFlBQVksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFzQixDQUFDLENBQUMsTUFBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBVSxDQUFDLENBQUMsQ0FBQztRQUNyRixDQUFDO0lBQ0wsQ0FBQztJQUVELHFDQUFjLEdBQWQsVUFBZSxDQUF1QjtRQUVsQyxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUMzQixZQUFZLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBc0IsQ0FBQyxDQUFDLE1BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQVUsQ0FBQyxDQUFDLENBQUM7UUFDdkYsQ0FBQztRQUNELElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFzQixDQUFDLENBQUMsTUFBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBVSxDQUFDLENBQUMsQ0FBQztRQUNsRixJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFFTCxtQkFBQztBQUFELENBcEhBLEFBb0hDLElBQUE7QUFwSFksb0NBQVk7QUFzSHpCO0lBS0k7UUFIUSxXQUFNLEdBQVEsRUFBRSxDQUFDO1FBQ2pCLGNBQVMsR0FBWSxLQUFLLENBQUM7SUFHbkMsQ0FBQztJQUVNLGtCQUFNLEdBQWI7UUFDSSxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ3pCLFdBQVcsQ0FBQyxTQUFTLEdBQUcsSUFBSSxXQUFXLEVBQUUsQ0FBQztRQUM5QyxDQUFDO1FBQ0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUM7SUFDakMsQ0FBQztJQUVPLG1DQUFhLEdBQXJCLFVBQXNCLFNBQWlCO1FBQ25DLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQzlCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQztZQUMzQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztZQUN0QixNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDdkMsQ0FBQztJQUNMLENBQUM7SUFFTyxpQ0FBVyxHQUFuQixVQUFvQixTQUFpQjtRQUNqQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6QixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDbEMsQ0FBQztRQUNELEdBQUcsQ0FBQyxDQUFDLElBQUksTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQzdCLE1BQU0sQ0FBQztRQUNYLENBQUM7UUFDRCxJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztRQUN2QixNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDdEMsQ0FBQztJQUVELCtCQUFTLEdBQVQsVUFBVSxTQUFpQjtRQUN2QixJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFFRCw2QkFBTyxHQUFQLFVBQVEsU0FBaUI7UUFDckIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNoQyxDQUFDO0lBRUQsK0JBQVMsR0FBVCxVQUFVLFNBQWlCO1FBQ3ZCLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUNMLGtCQUFDO0FBQUQsQ0E3Q0EsQUE2Q0MsSUFBQTtBQTdDWSxrQ0FBVzs7Ozs7QUMzTHhCO0lBRUksa0JBQVksT0FBb0I7UUFDNUIsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7SUFDNUIsQ0FBQztJQUVELHNCQUFJLDZCQUFPO2FBQVg7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUN6QixDQUFDOzs7T0FBQTtJQUVELDJCQUFRLEdBQVIsVUFBUyxLQUFrQjtRQUFsQixzQkFBQSxFQUFBLFVBQWtCO1FBQ3ZCLEdBQUcsQ0FBQyxDQUFDLElBQU0sR0FBRyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDdEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2hELENBQUM7SUFDTCxDQUFDO0lBQ0QsMEJBQU8sR0FBUCxVQUFRLEdBQVcsRUFBRSxLQUFhO1FBQzlCLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN2QyxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFDRCwwQkFBTyxHQUFQLFVBQVEsR0FBVztRQUNmLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBQ0wsZUFBQztBQUFELENBdEJBLEFBc0JDLElBQUE7QUF0QlksNEJBQVE7QUF3QnJCO0lBQUE7SUFzTUEsQ0FBQztJQTdMVSxVQUFNLEdBQWIsVUFBYyxPQUFlLEVBQUUsS0FBZSxFQUFFLE9BQXNCLEVBQUUsSUFBaUIsRUFBRSxJQUFjO1FBQTFFLHNCQUFBLEVBQUEsVUFBZTtRQUFFLHdCQUFBLEVBQUEsWUFBc0I7UUFBRSxxQkFBQSxFQUFBLFNBQWlCO1FBQUUscUJBQUEsRUFBQSxTQUFjO1FBQ3JHLElBQUksT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDOUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3hELENBQUM7SUFFTSxPQUFHLEdBQVYsVUFBVyxPQUFvQixFQUFFLEtBQWUsRUFBRSxPQUFzQixFQUFFLElBQWlCLEVBQUUsSUFBYztRQUExRSxzQkFBQSxFQUFBLFVBQWU7UUFBRSx3QkFBQSxFQUFBLFlBQXNCO1FBQUUscUJBQUEsRUFBQSxTQUFpQjtRQUFFLHFCQUFBLEVBQUEsU0FBYztRQUN2RyxHQUFHLENBQUMsQ0FBQyxJQUFNLEdBQUcsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ3RCLE9BQU8sQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzFDLENBQUM7UUFFRCxHQUFHLENBQUMsQ0FBZSxVQUFPLEVBQVAsbUJBQU8sRUFBUCxxQkFBTyxFQUFQLElBQU87WUFBckIsSUFBTSxNQUFJLGdCQUFBO1lBQ1gsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBSSxDQUFDLENBQUM7U0FDL0I7UUFDRCxFQUFFLENBQUMsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNkLE9BQU8sQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1FBQy9CLENBQUM7UUFLRCxNQUFNLENBQUMsT0FBTyxDQUFDO0lBQ25CLENBQUM7SUFPTSxRQUFJLEdBQVgsVUFBWSxRQUFnQixFQUFFLE9BQXVCO1FBQXZCLHdCQUFBLEVBQUEsa0JBQXVCO1FBQ2pELEVBQUUsQ0FBQyxDQUFDLE9BQU8sWUFBWSxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQzlCLE1BQU0sQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDOUMsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLFlBQVksV0FBVyxDQUFDLENBQUMsQ0FBQztZQUN4QyxNQUFNLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzlDLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDaEIsQ0FBQztJQUNMLENBQUM7SUFPTSxhQUFTLEdBQWhCLFVBQWlCLFFBQWdCLEVBQUUsT0FBdUI7UUFBdkIsd0JBQUEsRUFBQSxrQkFBdUI7UUFDdEQsRUFBRSxDQUFDLENBQUMsT0FBTyxZQUFZLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDOUIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDM0MsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLFlBQVksV0FBVyxDQUFDLENBQUMsQ0FBQztZQUN4QyxNQUFNLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMzQyxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2hCLENBQUM7SUFDTCxDQUFDO0lBUU0sWUFBUSxHQUFmLFVBQWdCLE9BQW9CLEVBQUUsSUFBWTtRQUM5QyxNQUFNLENBQUMsT0FBTyxLQUFLLElBQUksSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNoRSxDQUFDO0lBQUEsQ0FBQztJQVFLLFlBQVEsR0FBZixVQUFnQixPQUFvQixFQUFFLElBQVksRUFBRSxRQUF1QjtRQUF2Qix5QkFBQSxFQUFBLGVBQXVCO1FBQ3ZFLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDWCxJQUFJLElBQUksR0FBd0IsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDNUQsR0FBRyxDQUFBLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQ2xDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2hDLENBQUM7UUFDTCxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNoQyxDQUFDO0lBQ0wsQ0FBQztJQUFBLENBQUM7SUFRSyxlQUFXLEdBQWxCLFVBQW1CLE9BQWdCLEVBQUUsSUFBWSxFQUFFLFFBQXVCO1FBQXZCLHlCQUFBLEVBQUEsZUFBdUI7UUFDdEUsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNYLElBQUksSUFBSSxHQUF3QixHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUM1RCxHQUFHLENBQUEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDbEMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbkMsQ0FBQztRQUNMLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ25DLENBQUM7SUFDTCxDQUFDO0lBQUEsQ0FBQztJQVVLLFVBQU0sR0FBYixVQUFjLFFBQWdCLEVBQUUsT0FBdUI7UUFBdkIsd0JBQUEsRUFBQSxrQkFBdUI7UUFDbkQsSUFBSSxJQUFJLEdBQXdCLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzVELEdBQUcsQ0FBQSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ2xDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNyQixDQUFDO1FBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNoQixDQUFDO0lBQUEsQ0FBQztJQVFLLGVBQVcsR0FBbEIsVUFBbUIsT0FBZ0IsRUFBRSxJQUFZO1FBQzdDLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9CLE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFDbkIsQ0FBQztJQW1FTCxVQUFDO0FBQUQsQ0F0TUEsQUFzTUMsSUFBQTtBQXRNWSxrQkFBRzs7Ozs7QUN4QmhCLCtCQUFpQztBQUlqQyxJQUFJLE9BQU8sR0FBUSxNQUFNLENBQUM7QUFDMUIsT0FBTyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7QUFFMUI7SUFFSSxJQUFJLGdCQUFnQixHQUFHO1FBQ25CLEdBQUcsRUFBRTtZQUNELE1BQU0sRUFBRSxLQUFLO1lBQ2IsR0FBRyxFQUFFLENBQUMsV0FBVyxFQUFFLFlBQVksRUFBRSxZQUFZLENBQUM7U0FDakQ7UUFDRCxJQUFJLEVBQUU7WUFDRixVQUFVLEVBQUUsYUFBYSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUM7WUFDN0MsU0FBUyxFQUFFLGFBQWEsQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztZQUMvRCxXQUFXLEVBQUUsYUFBYSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7WUFDbkUsTUFBTSxFQUFFLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQztTQUNwRztRQUNELE1BQU0sRUFBRTtZQUNKLFNBQVMsRUFBRTtnQkFDUCxJQUFJLEVBQUU7b0JBQ0YsS0FBSyxFQUFFLHdCQUF3QjtpQkFDbEM7Z0JBQ0QsTUFBTSxFQUFFO29CQUNKLEtBQUssRUFBRSx3QkFBd0I7b0JBQy9CLEtBQUssRUFBRSxDQUFDO2lCQUNYO2FBQ0o7WUFDRCxNQUFNLEVBQUU7Z0JBQ0osSUFBSSxFQUFFO29CQUNGLEtBQUssRUFBRSx3QkFBd0I7aUJBQ2xDO2dCQUNELE1BQU0sRUFBRTtvQkFDSixLQUFLLEVBQUUsd0JBQXdCO29CQUMvQixLQUFLLEVBQUUsQ0FBQztpQkFDWDtnQkFDRCxLQUFLLEVBQUU7b0JBQ0gsTUFBTSxFQUFFO3dCQUNKLE1BQU0sRUFBRSxDQUFDO3dCQUNULElBQUksRUFBRTs0QkFDRixLQUFLLEVBQUUsd0JBQXdCO3lCQUNsQztxQkFDSjtpQkFDSjthQUNKO1NBQ0o7UUFDRCxNQUFNLEVBQUUsRUFBRTtRQUVWLFNBQVMsRUFBRTtZQUNQLFdBQVcsRUFBRSxvREFBb0QsR0FBRyxZQUFZO1lBQ2hGLFdBQVcsRUFBRSw0REFBNEQsR0FBRywyQkFBMkI7WUFDdkcsWUFBWSxFQUFFLHlJQUF5SSxHQUFHLFlBQVk7WUFDdEssWUFBWSxFQUFFLHlJQUF5SSxHQUFHLFlBQVk7WUFHdEssWUFBWSxFQUFFLDBFQUEwRTtTQUUzRjtRQUNELFNBQVMsRUFBRTtZQUNQO2dCQUNJLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxFQUFFO2FBQ2Y7U0FDSjtLQUNKLENBQUM7SUFHRixHQUFHLENBQUMsQ0FBQyxJQUFNLEdBQUcsSUFBSSxhQUFhLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7UUFDcEQsSUFBSSxHQUFHLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDbkQsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2hCLEdBQUcsQ0FBQyxDQUFDLElBQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ3pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQy9CLENBQUM7UUFFRCxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQ3pCLE1BQU0sRUFBRSxLQUFLO1lBQ2IsS0FBSyxFQUFFLEdBQUcsQ0FBQyxHQUFHO1lBQ2QsT0FBTyxFQUFFLEdBQUcsQ0FBQyxLQUFLO1lBQ2xCLFNBQVMsRUFBRSxHQUFHLENBQUMsT0FBTztZQUN0QixTQUFTLEVBQUUsR0FBRyxDQUFDLE9BQU87WUFDdEIsUUFBUSxFQUFFO2dCQUNOLFFBQVEsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQztnQkFDMUIsU0FBUyxFQUFFLEdBQUcsQ0FBQyxPQUFPO2dCQUN0QixRQUFRLEVBQUUsR0FBRyxDQUFDLE1BQU07YUFDdkI7U0FDSixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUV6RCxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLFVBQVUsQ0FBQztBQUd4QyxDQUFDO0FBeEZELG9CQXdGQztBQUNELElBQUksRUFBRSxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCB7ZG9tfSBmcm9tICcuL2RvbSc7XG5cbmV4cG9ydCBjbGFzcyBEcmFnWm9vbSB7XG4gICAgcHJpdmF0ZSBzdGF0aWMgYnV0dG9uU2VsZWN0b3I6IHN0cmluZyA9ICcuLWpzLXpvb20tYm94JztcbiAgICBwcml2YXRlIGRyYWd6b29tOiBvbC5pbnRlcmFjdGlvbi5EcmFnWm9vbTtcbiAgICBwcml2YXRlIG9sTWFwOiBvbC5NYXA7XG5cbiAgICBjb25zdHJ1Y3RvcihtYXA6IG9sLk1hcCkge1xuICAgICAgICB0aGlzLm9sTWFwID0gbWFwO1xuICAgICAgICB0aGlzLmRyYWd6b29tID0gbmV3IG9sLmludGVyYWN0aW9uLkRyYWdab29tKHtcbiAgICAgICAgICAgIGNvbmRpdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgZG9tLmZpbmRGaXJzdChEcmFnWm9vbS5idXR0b25TZWxlY3RvcikuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLmJ1dHRvbkNsaWNrLmJpbmQodGhpcyksIGZhbHNlKTtcbiAgICAgICAgdGhpcy5kcmFnem9vbS5vbignYm94ZW5kJywgdGhpcy5kZWFjdGl2YXRlLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIHByaXZhdGUgYnV0dG9uQ2xpY2soZSkge1xuICAgICAgICBpZiAoIWRvbS5oYXNDbGFzcyhlLnRhcmdldCwgJ3N1Y2Nlc3MnKSkge1xuICAgICAgICAgICAgdGhpcy5hY3RpdmF0ZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5kZWFjdGl2YXRlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGFjdGl2YXRlKCkge1xuICAgICAgICBkb20uYWRkQ2xhc3MoPEhUTUxFbGVtZW50PmRvbS5maW5kRmlyc3QoRHJhZ1pvb20uYnV0dG9uU2VsZWN0b3IpLCAnc3VjY2VzcycpO1xuICAgICAgICB0aGlzLm9sTWFwLmFkZEludGVyYWN0aW9uKHRoaXMuZHJhZ3pvb20pO1xuICAgIH1cblxuICAgIHByaXZhdGUgZGVhY3RpdmF0ZSgpIHtcbiAgICAgICAgZG9tLnJlbW92ZUNsYXNzKDxIVE1MRWxlbWVudD5kb20uZmluZEZpcnN0KERyYWdab29tLmJ1dHRvblNlbGVjdG9yKSwgJ3N1Y2Nlc3MnKTtcbiAgICAgICAgdGhpcy5vbE1hcC5yZW1vdmVJbnRlcmFjdGlvbih0aGlzLmRyYWd6b29tKTtcbiAgICB9XG59IiwiaW1wb3J0IHtUSVRMRSwgVVVJRH0gZnJvbSBcIi4vT2w0XCI7XG5pbXBvcnQge2RvbX0gZnJvbSAnLi9kb20nO1xuXG5leHBvcnQgY2xhc3MgRmVhdHVyZUluZm8ge1xuICAgIHByaXZhdGUgc3RhdGljIGl0ZW1UYWdOYW1lOiBzdHJpbmcgPSAnc3Bhbic7XG4gICAgcHJpdmF0ZSBvbE1hcDogb2wuTWFwO1xuICAgIHByaXZhdGUgdG9vbHRpcDogb2wuT3ZlcmxheTtcbiAgICBwcml2YXRlIHRvb2x0aXBDb29yZDogb2wuQ29vcmRpbmF0ZTtcbiAgICBwcml2YXRlIHRvb2x0aXBFbG06IEhUTUxFbGVtZW50O1xuICAgIHByaXZhdGUgbGF5ZXI6IG9sLmxheWVyLlZlY3RvcjtcbiAgICBwcml2YXRlIGNhbGxiYWNrU2VsZWN0OiBGdW5jdGlvbjtcbiAgICBwcml2YXRlIGNhbGxiYWNrVW5TZWxlY3Q6IEZ1bmN0aW9uO1xuICAgIHByaXZhdGUgY2FsbGJhY2tVblNlbGVjdEFsbDogRnVuY3Rpb247XG4gICAgcHJpdmF0ZSBzZWxlY3Q6IG9sLmludGVyYWN0aW9uLlNlbGVjdDtcblxuICAgIGNvbnN0cnVjdG9yKG1hcDogb2wuTWFwLCBsYXllcjogb2wubGF5ZXIuVmVjdG9yID0gbnVsbCkge1xuICAgICAgICB0aGlzLm9sTWFwID0gbWFwO1xuICAgICAgICB0aGlzLmxheWVyID0gbGF5ZXI7XG4gICAgICAgIHRoaXMuaW5pdFNlbGVjdCgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgaW5pdFNlbGVjdCgpe1xuICAgICAgICBjb25zdCBmaSA9IHRoaXM7XG4gICAgICAgIGxldCB0aW1lc3RhbXA6IG51bWJlciA9IDA7XG4gICAgICAgIHRoaXMuc2VsZWN0ID0gbmV3IG9sLmludGVyYWN0aW9uLlNlbGVjdCh7XG4gICAgICAgICAgICBtdWx0aTogdHJ1ZSxcbiAgICAgICAgICAgIGxheWVyczogW3RoaXMubGF5ZXJdLFxuICAgICAgICAgICAgZmlsdGVyOiBmdW5jdGlvbiAoZmVhdHVyZTogb2wuRmVhdHVyZSkge1xuICAgICAgICAgICAgICAgIHRpbWVzdGFtcCA9IERhdGUubm93KCkgKyA1O1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgaWYgKERhdGUubm93KCkgPj0gdGltZXN0YW1wKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaS5zaG93VG9vbHRpcCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgNSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnNlbGVjdC5vbignc2VsZWN0JywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGlmIChlLnRhcmdldC5nZXRGZWF0dXJlcygpLmdldExlbmd0aCgpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgZmkuc2hvd1Rvb2x0aXAoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmVzZXQoKSB7XG4gICAgICAgIGlmICh0aGlzLnNlbGVjdCkge1xuICAgICAgICAgICAgdGhpcy5zZWxlY3QuZ2V0RmVhdHVyZXMoKS5jbGVhcigpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnRvb2x0aXBFbG0pIHtcbiAgICAgICAgICAgIGRvbS5hZGRDbGFzcyh0aGlzLnRvb2x0aXBFbG0sICdoaWRkZW4nKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5jYWxsYmFja1VuU2VsZWN0QWxsKSB7XG4gICAgICAgICAgICB0aGlzLmNhbGxiYWNrVW5TZWxlY3RBbGwoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNlbGVjdEZlYXR1cmVzICh1dWlkczogc3RyaW5nW10pIHtcbiAgICAgICAgY29uc3QgZmkgPSB0aGlzO1xuICAgICAgICBpZiAodGhpcy5sYXllciAmJiB0aGlzLnNlbGVjdCkge1xuICAgICAgICAgICAgdGhpcy5yZXNldCgpO1xuICAgICAgICAgICAgdGhpcy5sYXllci5nZXRTb3VyY2UoKS5mb3JFYWNoRmVhdHVyZShcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoZmVhdHVyZTogb2wuRmVhdHVyZSkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHV1aWQgb2YgdXVpZHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmZWF0dXJlLmdldChVVUlEKSA9PT0gdXVpZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpLnNlbGVjdC5nZXRGZWF0dXJlcygpLnB1c2goZmVhdHVyZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApXG4gICAgICAgICAgICB0aGlzLnNob3dUb29sdGlwKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhY3RpdmF0ZSh0b29sdGlwRWxtOiBIVE1MRWxlbWVudCwgY2FsbGJhY2tTZWxlY3Q6IEZ1bmN0aW9uLCBjYWxsYmFja1VuU2VsZWN0OiBGdW5jdGlvbiwgY2FsbGJhY2tVblNlbGVjdEFsbDogRnVuY3Rpb24pIHtcbiAgICAgICAgdGhpcy5jYWxsYmFja1NlbGVjdCA9IGNhbGxiYWNrU2VsZWN0O1xuICAgICAgICB0aGlzLmNhbGxiYWNrVW5TZWxlY3QgPSBjYWxsYmFja1VuU2VsZWN0O1xuICAgICAgICB0aGlzLmNhbGxiYWNrVW5TZWxlY3RBbGwgPSBjYWxsYmFja1VuU2VsZWN0QWxsO1xuICAgICAgICB0aGlzLm9sTWFwLm9uKCdjbGljaycsIHRoaXMuc2V0VG9vbHRpcFBvc2l0aW9uLCB0aGlzKTtcbiAgICAgICAgdGhpcy50b29sdGlwRWxtID0gdG9vbHRpcEVsbTtcbiAgICAgICAgdGhpcy50b29sdGlwRWxtLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5pdGVtQ2xpY2suYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgICAgICB0aGlzLnRvb2x0aXAgPSBuZXcgb2wuT3ZlcmxheSh7XG4gICAgICAgICAgICBlbGVtZW50OiB0aGlzLnRvb2x0aXBFbG0sXG4gICAgICAgICAgICBvZmZzZXQ6IFswLCAtNl0sXG4gICAgICAgICAgICBwb3NpdGlvbmluZzogJ2JvdHRvbS1jZW50ZXInXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLm9sTWFwLmFkZE92ZXJsYXkodGhpcy50b29sdGlwKTtcblxuICAgICAgICB0aGlzLnNlbGVjdC5nZXRGZWF0dXJlcygpLmNsZWFyKCk7XG4gICAgICAgIHRoaXMub2xNYXAuYWRkSW50ZXJhY3Rpb24odGhpcy5zZWxlY3QpO1xuICAgIH1cblxuICAgIGRlYWN0aXZhdGUoKSB7XG4gICAgICAgIHRoaXMuc2VsZWN0LmdldEZlYXR1cmVzKCkuY2xlYXIoKTtcbiAgICAgICAgdGhpcy5vbE1hcC5yZW1vdmVJbnRlcmFjdGlvbih0aGlzLnNlbGVjdCk7XG4gICAgICAgIC8vIHRoaXMuc2VsZWN0ID0gbnVsbDtcbiAgICAgICAgdGhpcy5jYWxsYmFja1VuU2VsZWN0QWxsKCk7XG4gICAgICAgIHRoaXMuY2FsbGJhY2tTZWxlY3QgPSBudWxsO1xuICAgICAgICB0aGlzLmNhbGxiYWNrVW5TZWxlY3QgPSBudWxsO1xuICAgICAgICB0aGlzLmNhbGxiYWNrVW5TZWxlY3RBbGwgPSBudWxsO1xuICAgICAgICB0aGlzLnRvb2x0aXBFbG0ucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLml0ZW1DbGljay5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy50b29sdGlwRWxtLnJlbW92ZSgpO1xuICAgICAgICB0aGlzLm9sTWFwLnJlbW92ZU92ZXJsYXkodGhpcy50b29sdGlwKTtcbiAgICAgICAgdGhpcy5vbE1hcC51bignY2xpY2snLCB0aGlzLnNldFRvb2x0aXBQb3NpdGlvbiwgdGhpcyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpdGVtQ2xpY2soZTogRXZlbnQpIHtcbiAgICAgICAgaWYgKCg8YW55PmUudGFyZ2V0KS50YWdOYW1lID09PSBGZWF0dXJlSW5mby5pdGVtVGFnTmFtZS50b1VwcGVyQ2FzZSgpKSB7XG4gICAgICAgICAgICBsZXQgdGFnID0gKDxIVE1MRWxlbWVudD5lLnRhcmdldCk7XG4gICAgICAgICAgICBpZiAoIWRvbS5oYXNDbGFzcyh0YWcsICctanMtdG9vbHRpcC1pdGVtJykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdC5nZXRGZWF0dXJlcygpLmNsZWFyKCk7XG4gICAgICAgICAgICAgICAgdGhpcy51blNlbGVjdERhdGFzZXQoKTtcbiAgICAgICAgICAgICAgICBkb20uYWRkQ2xhc3ModGhpcy50b29sdGlwRWxtLCAnaGlkZGVuJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRvbS5yZW1vdmVDbGFzcyh0YWcucGFyZW50RWxlbWVudCwgJ3NlbGVjdGVkJywgJ3NwYW4nKTtcbiAgICAgICAgICAgICAgICBkb20uYWRkQ2xhc3ModGFnLCAnc2VsZWN0ZWQnKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdC5nZXRGZWF0dXJlcygpLmNsZWFyKCk7XG4gICAgICAgICAgICAgICAgdGhpcy51blNlbGVjdERhdGFzZXQoKTtcbiAgICAgICAgICAgICAgICBjb25zdCBmZWF0dXJlID0gdGhpcy5sYXllci5nZXRTb3VyY2UoKS5nZXRGZWF0dXJlQnlJZCh0YWcuZ2V0QXR0cmlidXRlKCdkYXRhLWlkJykpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0LmdldEZlYXR1cmVzKCkucHVzaChmZWF0dXJlKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdERhdGFzZXQoZmVhdHVyZS5nZXQoVVVJRCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgc2V0VG9vbHRpcFBvc2l0aW9uKGVuOiBvbC5NYXBCcm93c2VyRXZlbnQpIHtcbiAgICAgICAgdGhpcy50b29sdGlwQ29vcmQgPSBlbi5jb29yZGluYXRlO1xuICAgIH1cblxuICAgIHByaXZhdGUgaGlkZVRvb2x0aXAoKSB7XG4gICAgICAgIGRvbS5hZGRDbGFzcyh0aGlzLnRvb2x0aXBFbG0sICdoaWRkZW4nKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNob3dUb29sdGlwKCkge1xuICAgICAgICBjb25zdCBmZWF0dXJlczogb2wuRmVhdHVyZVtdID0gdGhpcy5zZWxlY3QuZ2V0RmVhdHVyZXMoKS5nZXRBcnJheSgpO1xuICAgICAgICBkb20ucmVtb3ZlKCcuLWpzLXRvb2x0aXAtaXRlbScsIHRoaXMudG9vbHRpcEVsbSk7XG4gICAgICAgIHRoaXMudW5TZWxlY3REYXRhc2V0KCk7XG4gICAgICAgIGlmIChmZWF0dXJlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHRoaXMuaGlkZVRvb2x0aXAoKTtcbiAgICAgICAgfSBlbHNlIGlmIChmZWF0dXJlcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgIHRoaXMuaGlkZVRvb2x0aXAoKTtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0RGF0YXNldChmZWF0dXJlc1swXS5nZXQoVVVJRCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9yIChsZXQgZmVhdHVyZSBvZiBmZWF0dXJlcykge1xuICAgICAgICAgICAgICAgIGlmICghZmVhdHVyZS5nZXRJZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGZlYXR1cmUuc2V0SWQoZmVhdHVyZS5nZXQoVVVJRCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZXQgYXR0cnMgPSB7XG4gICAgICAgICAgICAgICAgICAgIFwidGl0bGVcIjogZmVhdHVyZS5nZXQoVElUTEUpLFxuICAgICAgICAgICAgICAgICAgICBcImRhdGEtdXVpZFwiOiBmZWF0dXJlLmdldChVVUlEKSxcbiAgICAgICAgICAgICAgICAgICAgXCJkYXRhLWlkXCI6IGZlYXR1cmUuZ2V0SWQoKVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdGhpcy50b29sdGlwRWxtLmFwcGVuZENoaWxkKFxuICAgICAgICAgICAgICAgICAgICBkb20uY3JlYXRlKEZlYXR1cmVJbmZvLml0ZW1UYWdOYW1lLCBhdHRycywgWyctanMtdG9vbHRpcC1pdGVtJywgJ3NlbGVjdGVkJ10sIGZlYXR1cmUuZ2V0KFRJVExFKSlcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0RGF0YXNldChmZWF0dXJlLmdldChVVUlEKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkb20ucmVtb3ZlQ2xhc3ModGhpcy50b29sdGlwRWxtLCAnaGlkZGVuJyk7XG4gICAgICAgICAgICB0aGlzLnRvb2x0aXAuc2V0UG9zaXRpb24odGhpcy50b29sdGlwQ29vcmQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZWxlY3REYXRhc2V0KHNlbGVjdG9yOiBzdHJpbmcpIHtcbiAgICAgICAgaWYgKHRoaXMuY2FsbGJhY2tTZWxlY3QpIHtcbiAgICAgICAgICAgIHRoaXMuY2FsbGJhY2tTZWxlY3Qoc2VsZWN0b3IpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB1blNlbGVjdERhdGFzZXQoc2VsZWN0b3I6IHN0cmluZyA9IG51bGwpIHtcbiAgICAgICAgaWYgKHNlbGVjdG9yICE9PSBudWxsICYmIHRoaXMuY2FsbGJhY2tVblNlbGVjdCkge1xuICAgICAgICAgICAgdGhpcy5jYWxsYmFja1VuU2VsZWN0KHNlbGVjdG9yKTtcbiAgICAgICAgfSBlbHNlIGlmIChzZWxlY3RvciA9PT0gbnVsbCAmJiB0aGlzLmNhbGxiYWNrVW5TZWxlY3RBbGwpIHtcbiAgICAgICAgICAgIHRoaXMuY2FsbGJhY2tVblNlbGVjdEFsbCgpO1xuICAgICAgICB9XG4gICAgfVxufSIsImltcG9ydCB7ZG9tfSBmcm9tICcuL2RvbSc7XG5pbXBvcnQge09sNE1hcCwgVElUTEUsIFVVSUR9IGZyb20gXCIuL09sNFwiO1xuXG4vLyBpbXBvcnQgKiBhcyAkIGZyb20gJ2pxdWVyeSc7XG5cbmV4cG9ydCBjbGFzcyBMYXllclRyZWUge1xuICAgIHByaXZhdGUgc3RhdGljIF9pbnN0YW5jZTogTGF5ZXJUcmVlO1xuICAgIHByaXZhdGUgc3RhdGljIG1heGxlbmd0aDogbnVtYmVyID0gMTY7XG4gICAgcHJpdmF0ZSBzdGF0aWMgdHJlZXNlbGVjdG9yOiBzdHJpbmcgPSAnLi1qcy1tYXAtbGF5ZXJ0cmVlIHVsLmxheWVyLXRyZWUtbGlzdCc7XG4gICAgcHJpdmF0ZSBzdGF0aWMgZHVtbXlzZWxlY3Rvcjogc3RyaW5nID0gJy4tanMtZHVtbXktbGF5ZXInO1xuICAgIHByaXZhdGUgc3RhdGljIHVzZU9wYWNpdHk6IGJvb2xlYW4gPSB0cnVlO1xuICAgIHByaXZhdGUgc3RhdGljIHVzZVZpc2libGU6IGJvb2xlYW4gPSB0cnVlO1xuICAgIHByaXZhdGUgc3RhdGljIHVzZVNvcnRhYmxlOiBib29sZWFuID0gdHJ1ZTtcbiAgICBwcml2YXRlIHN0YXRpYyBzaG93U3RhdHVzOiBib29sZWFuID0gdHJ1ZTtcbiAgICBwcml2YXRlIG9sNE1hcDogT2w0TWFwO1xuICAgIHByaXZhdGUgdHJlZTogSFRNTEVsZW1lbnQ7XG4gICAgcHJpdmF0ZSBjdXJyZW50TGF5ZXIgPSBudWxsO1xuICAgIHByaXZhdGUgb2xkUG9zaXRpb24gPSAwO1xuXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihvbDRNYXA6IE9sNE1hcCkge1xuICAgICAgICB0aGlzLm9sNE1hcCA9IG9sNE1hcDtcbiAgICAgICAgdGhpcy50cmVlID0gPEhUTUxFbGVtZW50PmRvbS5maW5kRmlyc3QoTGF5ZXJUcmVlLnRyZWVzZWxlY3Rvcik7XG4gICAgICAgIGlmIChMYXllclRyZWUudXNlU29ydGFibGUpIHtcbiAgICAgICAgICAgIGxldCBkdW1teSA9IGRvbS5maW5kRmlyc3QoTGF5ZXJUcmVlLmR1bW15c2VsZWN0b3IsIHRoaXMudHJlZSk7XG4gICAgICAgICAgICB0aGlzLmFkZERyYWdnYWJsZSg8SFRNTEVsZW1lbnQ+ZHVtbXksIHRydWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIGNyZWF0ZShvbDRNYXA6IE9sNE1hcCk6IExheWVyVHJlZSB7XG4gICAgICAgIGlmICghTGF5ZXJUcmVlLl9pbnN0YW5jZSkgey8vIHNpbmdsZXRvblxuICAgICAgICAgICAgTGF5ZXJUcmVlLl9pbnN0YW5jZSA9IG5ldyBMYXllclRyZWUob2w0TWFwKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gTGF5ZXJUcmVlLl9pbnN0YW5jZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGZpbmRMYXllckl0ZW0obGF5ZXI6IG9sLmxheWVyLkJhc2UpOiBIVE1MRWxlbWVudCB7XG4gICAgICAgIHJldHVybiA8SFRNTEVsZW1lbnQ+ZG9tLmZpbmRGaXJzdCgnIycgKyBsYXllci5nZXQoVVVJRCkpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZmluZExheWVyVmlzaWJsZShsYXllcjogb2wubGF5ZXIuQmFzZSk6IEhUTUxGb3JtRWxlbWVudCB7XG4gICAgICAgIHJldHVybiA8SFRNTEZvcm1FbGVtZW50PmRvbS5maW5kRmlyc3QoJyMnICsgbGF5ZXIuZ2V0KFVVSUQpICsgJyAuLWpzLW1hcC1zb3VyY2UtdmlzaWJsZScpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZmluZExheWVyT3BhY2l0eShsYXllcjogb2wubGF5ZXIuQmFzZSk6IEhUTUxGb3JtRWxlbWVudCB7XG4gICAgICAgIHJldHVybiA8SFRNTEZvcm1FbGVtZW50PmRvbS5maW5kRmlyc3QoJyMnICsgbGF5ZXIuZ2V0KFVVSUQpICsgJyAuLWpzLW1hcC1zb3VyY2Utb3BhY2l0eScpO1xuICAgIH1cblxuICAgIGdldFZpc2libGUobGF5ZXI6IG9sLmxheWVyLkJhc2UpIHtcbiAgICAgICAgbGV0IGNoZWNrYm94ID0gdGhpcy5maW5kTGF5ZXJWaXNpYmxlKGxheWVyKTtcbiAgICAgICAgcmV0dXJuIGNoZWNrYm94LmNoZWNrZWQ7XG4gICAgfVxuXG4gICAgc2V0VmlzaWJsZShsYXllcjogb2wubGF5ZXIuQmFzZSwgdmlzaWJsZTogYm9vbGVhbiwgYWN0aW9uOiBib29sZWFuID0gZmFsc2UpIHtcbiAgICAgICAgbGV0IGNoZWNrYm94ID0gdGhpcy5maW5kTGF5ZXJWaXNpYmxlKGxheWVyKTtcbiAgICAgICAgaWYgKGNoZWNrYm94LmNoZWNrZWQgIT09IHZpc2libGUgJiYgIWFjdGlvbikge1xuICAgICAgICAgICAgY2hlY2tib3guY2hlY2tlZCA9IHZpc2libGU7XG4gICAgICAgIH0gZWxzZSBpZiAoY2hlY2tib3guY2hlY2tlZCAhPT0gdmlzaWJsZSAmJiBhY3Rpb24pIHtcbiAgICAgICAgICAgIGNoZWNrYm94LmNsaWNrKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZXREaXNhYmxlKGxheWVyOiBvbC5sYXllci5CYXNlLCBkaXNhYmxlOiBib29sZWFuKSB7XG4gICAgICAgIGxldCBpdGVtID0gdGhpcy5maW5kTGF5ZXJJdGVtKGxheWVyKTtcbiAgICAgICAgbGV0IGNoZWNrYm94VmlzaWJsZSA9IHRoaXMuZmluZExheWVyVmlzaWJsZShsYXllcik7XG4gICAgICAgIGxldCBzZWxlY3RPcGFjaXR5ID0gdGhpcy5maW5kTGF5ZXJPcGFjaXR5KGxheWVyKTtcbiAgICAgICAgaWYgKGRpc2FibGUpIHtcbiAgICAgICAgICAgIGRvbS5hZGRDbGFzcyhpdGVtLCAnZGlzYWJsZWQnKTtcbiAgICAgICAgICAgIGNoZWNrYm94VmlzaWJsZS5zZXRBdHRyaWJ1dGUoJ2Rpc2FibGVkJywgJ3RydWUnKTtcbiAgICAgICAgICAgIHNlbGVjdE9wYWNpdHkuc2V0QXR0cmlidXRlKCdkaXNhYmxlZCcsICd0cnVlJylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRvbS5yZW1vdmVDbGFzcyhpdGVtLCAnZGlzYWJsZWQnKTtcbiAgICAgICAgICAgIGNoZWNrYm94VmlzaWJsZS5yZW1vdmVBdHRyaWJ1dGUoJ2Rpc2FibGVkJyk7XG4gICAgICAgICAgICBzZWxlY3RPcGFjaXR5LnJlbW92ZUF0dHJpYnV0ZSgnZGlzYWJsZWQnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgc3Vic3RyaW5nVGl0bGUodGV4dDogc3RyaW5nKSB7XG4gICAgICAgIGlmICh0ZXh0Lmxlbmd0aCA+IExheWVyVHJlZS5tYXhsZW5ndGgpIHtcbiAgICAgICAgICAgIHRleHQgPSB0ZXh0LnN1YnN0cmluZygwLCBMYXllclRyZWUubWF4bGVuZ3RoKTtcbiAgICAgICAgICAgIGlmICh0ZXh0Lmxhc3RJbmRleE9mKCcgJykgPiAwKSB7XG4gICAgICAgICAgICAgICAgdGV4dCA9IHRleHQuc3Vic3RyaW5nKDAsIHRleHQubGFzdEluZGV4T2YoJyAnKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfVxuXG4gICAgcmVtb3ZlKGxheWVyOiBvbC5sYXllci5CYXNlKSB7XG4gICAgICAgIGxldCBsYXllck5vZGUgPSB0aGlzLmZpbmRMYXllckl0ZW0obGF5ZXIpO1xuICAgICAgICBpZiAobGF5ZXJOb2RlKSB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZURyYWdnYWJsZSg8SFRNTEVsZW1lbnQ+bGF5ZXJOb2RlKTtcbiAgICAgICAgICAgIGxheWVyTm9kZS5yZW1vdmUoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFkZChsYXllcjogb2wubGF5ZXIuQmFzZSkge1xuICAgICAgICBsZXQgbGF5ZXJOb2RlID0gZG9tLmNyZWF0ZSgnbGknLCB7J2lkJzogbGF5ZXIuZ2V0KFVVSUQpLCAnZHJhZ2dhYmxlJzogXCJ0cnVlXCJ9LCBbJ2RyYWdnYWJsZScsICctanMtZHJhZ2dhYmxlJ10pO1xuICAgICAgICBpZiAoTGF5ZXJUcmVlLnVzZVZpc2libGUpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkVmlzaWJsZShsYXllck5vZGUsIGxheWVyKTtcbiAgICAgICAgfVxuICAgICAgICBsYXllck5vZGUuYXBwZW5kQ2hpbGQoXG4gICAgICAgICAgICBkb20uY3JlYXRlKCdsYWJlbCcsXG4gICAgICAgICAgICAgICAgeydpZCc6IGxheWVyLmdldChVVUlEKSwgJ2Zvcic6ICdjaGItJyArIGxheWVyLmdldChVVUlEKSwgJ3RpdGxlJzogbGF5ZXIuZ2V0KFRJVExFKX0sXG4gICAgICAgICAgICAgICAgWydmb3JtLWxhYmVsJ10sIHRoaXMuc3Vic3RyaW5nVGl0bGUobGF5ZXIuZ2V0KFRJVExFKSkpXG4gICAgICAgICk7XG4gICAgICAgIGlmIChMYXllclRyZWUudXNlT3BhY2l0eSkge1xuICAgICAgICAgICAgdGhpcy5hZGRPcGFjaXR5KGxheWVyTm9kZSwgbGF5ZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy50cmVlLmluc2VydEJlZm9yZShsYXllck5vZGUsIGRvbS5maW5kRmlyc3QoJ2xpJywgdGhpcy50cmVlKSk7XG4gICAgICAgIGlmIChMYXllclRyZWUudXNlU29ydGFibGUpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkRHJhZ2dhYmxlKGxheWVyTm9kZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGFkZFZpc2libGUobGF5ZXJOb2RlOiBIVE1MRWxlbWVudCwgbGF5ZXI6IG9sLmxheWVyLkJhc2UpIHtcbiAgICAgICAgbGV0IGlucHV0ID0gZG9tLmNyZWF0ZSgnaW5wdXQnLCB7J3R5cGUnOiAnY2hlY2tib3gnfSxcbiAgICAgICAgICAgIFsnY2hlY2snLCAnLWpzLW1hcC1zb3VyY2UtdmlzaWJsZSddKTtcbiAgICAgICAgKDxIVE1MRm9ybUVsZW1lbnQ+aW5wdXQpLmNoZWNrZWQgPSBsYXllci5nZXRWaXNpYmxlKCk7XG4gICAgICAgIGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIHRoaXMuY2hhbmdlVmlzaWJsZS5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgICAgIGxheWVyTm9kZS5hcHBlbmRDaGlsZChpbnB1dCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjaGFuZ2VWaXNpYmxlKGUpIHtcbiAgICAgICAgdGhpcy5vbDRNYXAuc2V0VmlzaWJsZShlLnRhcmdldC5wYXJlbnRFbGVtZW50LmlkLCBlLnRhcmdldC5jaGVja2VkKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFkZE9wYWNpdHkobGF5ZXJOb2RlOiBIVE1MRWxlbWVudCwgbGF5ZXI6IG9sLmxheWVyLkJhc2UpOiB2b2lkIHtcbiAgICAgICAgbGV0IHNlbGVjdCA9IGRvbS5jcmVhdGUoJ3NlbGVjdCcsIHt9LFxuICAgICAgICAgICAgWydpbnB1dC1lbGVtZW50JywgJ21lZGl1bScsICdzaW1wbGUnLCAnbWFwLXNvdXJjZS1vcGFjaXR5JywgJy1qcy1tYXAtc291cmNlLW9wYWNpdHknXSk7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPD0gMTA7IGkrKykge1xuICAgICAgICAgICAgc2VsZWN0LmFwcGVuZENoaWxkKGRvbS5jcmVhdGUoJ29wdGlvbicsIHsndmFsdWUnOiBpIC8gMTB9LCBbXSwgKGkgKiAxMCkgKyAnICUnKSk7XG4gICAgICAgIH1cbiAgICAgICAgKDxIVE1MRm9ybUVsZW1lbnQ+c2VsZWN0KS52YWx1ZSA9IGxheWVyLmdldE9wYWNpdHkoKS50b1N0cmluZygpO1xuICAgICAgICBzZWxlY3QuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgdGhpcy5jaGFuZ2VPcGFjaXR5LmJpbmQodGhpcyksIGZhbHNlKTtcbiAgICAgICAgbGF5ZXJOb2RlLmFwcGVuZENoaWxkKHNlbGVjdCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjaGFuZ2VPcGFjaXR5KGUpIHtcbiAgICAgICAgdGhpcy5vbDRNYXAuc2V0T3BhY2l0eShlLnRhcmdldC5wYXJlbnRFbGVtZW50LmlkLCBwYXJzZUZsb2F0KGUudGFyZ2V0LnZhbHVlKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhZGREcmFnZ2FibGUobGF5ZXI6IEhUTUxFbGVtZW50LCBpc0R1bW15OiBib29sZWFuID0gZmFsc2UpIHtcbiAgICAgICAgaWYgKCFpc0R1bW15KSB7XG4gICAgICAgICAgICBsYXllci5hZGRFdmVudExpc3RlbmVyKCdkcmFnc3RhcnQnLCB0aGlzLmRyYWdTdGFydC5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgICAgICAgICBsYXllci5hZGRFdmVudExpc3RlbmVyKCdkcmFnZW5kJywgdGhpcy5kcmFnRW5kLmJpbmQodGhpcyksIGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgICBsYXllci5hZGRFdmVudExpc3RlbmVyKCdkcmFnZW50ZXInLCB0aGlzLmRyYWdFbnRlci5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgICAgIGxheWVyLmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdvdmVyJywgdGhpcy5kcmFnT3Zlci5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgICAgIGxheWVyLmFkZEV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCB0aGlzLmRyYWdEcm9wLmJpbmQodGhpcyksIGZhbHNlKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlbW92ZURyYWdnYWJsZShsYXllcjogSFRNTEVsZW1lbnQsIGlzRHVtbXk6IGJvb2xlYW4gPSBmYWxzZSkge1xuICAgICAgICBpZiAoIWlzRHVtbXkpIHtcbiAgICAgICAgICAgIGxheWVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2RyYWdzdGFydCcsIHRoaXMuZHJhZ1N0YXJ0LmJpbmQodGhpcyksIGZhbHNlKTtcbiAgICAgICAgICAgIGxheWVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2RyYWdlbmQnLCB0aGlzLmRyYWdFbmQuYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgICAgICB9XG4gICAgICAgIGxheWVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2RyYWdlbnRlcicsIHRoaXMuZHJhZ0VudGVyLmJpbmQodGhpcyksIGZhbHNlKTtcbiAgICAgICAgbGF5ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcignZHJhZ292ZXInLCB0aGlzLmRyYWdPdmVyLmJpbmQodGhpcyksIGZhbHNlKTtcbiAgICAgICAgbGF5ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcignZHJvcCcsIHRoaXMuZHJhZ0Ryb3AuYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgIH1cblxuXG4gICAgcHJpdmF0ZSBkcmFnU3RhcnQoZSkge1xuICAgICAgICB0aGlzLmN1cnJlbnRMYXllciA9IGUudGFyZ2V0O1xuICAgICAgICB0aGlzLm9sZFBvc2l0aW9uID0gdGhpcy5nZXRMYXllclBvc2l0aW9uKHRoaXMuY3VycmVudExheWVyKTtcbiAgICAgICAgZS5kYXRhVHJhbnNmZXIuZWZmZWN0QWxsb3dlZCA9ICdtb3ZlJztcbiAgICAgICAgZS5kYXRhVHJhbnNmZXIuc2V0RGF0YSgndGV4dC9odG1sJywgdGhpcy5jdXJyZW50TGF5ZXIuaW5uZXJIVE1MKTtcbiAgICAgICAgZG9tLmFkZENsYXNzKHRoaXMuY3VycmVudExheWVyLCBcIm1vdmVcIik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBkcmFnT3ZlcihlKSB7XG4gICAgICAgIGlmIChlLnByZXZlbnREZWZhdWx0KSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICAgICAgZS5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9ICdtb3ZlJztcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHByaXZhdGUgZHJhZ0VudGVyKGUpIHtcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudExheWVyICYmIGUudGFyZ2V0ICE9PSB1bmRlZmluZWQgJiYgdGhpcy5jdXJyZW50TGF5ZXIgIT09IGUudGFyZ2V0KSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHRoaXMudHJlZS5pbnNlcnRCZWZvcmUoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudExheWVyLFxuICAgICAgICAgICAgICAgICAgICBlLnRhcmdldC5kcmFnZ2FibGUgPyBlLnRhcmdldCA6IGUudGFyZ2V0LnBhcmVudEVsZW1lbnRcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBkcmFnRHJvcChlKSB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZG9tLnJlbW92ZUNsYXNzKGUudGFyZ2V0LCBcIm92ZXJcIik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBkcmFnRW5kKGUpIHtcbiAgICAgICAgZG9tLnJlbW92ZUNsYXNzKGUudGFyZ2V0LCBcIm1vdmVcIik7XG4gICAgICAgIHRoaXMub2w0TWFwLm1vdmVMYXllcih0aGlzLmN1cnJlbnRMYXllci5pZCwgdGhpcy5vbGRQb3NpdGlvbiwgdGhpcy5nZXRMYXllclBvc2l0aW9uKHRoaXMuY3VycmVudExheWVyKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRMYXllclBvc2l0aW9uKGxheWVyKSB7XG4gICAgICAgIGxldCBsaXN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLi1qcy1tYXAtbGF5ZXJ0cmVlIHVsIC4tanMtZHJhZ2dhYmxlJyk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGxpc3RbaV0uaWQgPT09IGxheWVyLmlkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxpc3QubGVuZ3RoIC0gMSAtIGk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuIiwiaW1wb3J0ICogYXMgb2w0IGZyb20gJ29wZW5sYXllcnMnOy8vID8/P1xuLy8gaW1wb3J0ICogYXMganF1ZXJ5IGZyb20gJ2pxdWVyeSc7IC8vZXJyb3IgaW4gaW5kZXguZC50cyBmb3IgQHR5cGVzL2pxdWVyeVxuaW1wb3J0IHtMYXllclRyZWV9IGZyb20gJy4vTGF5ZXJUcmVlJztcbmltcG9ydCB7RHJhZ1pvb219IGZyb20gJy4vRHJhZ1pvb20nO1xuaW1wb3J0IHtPbDRTb3VyY2UsIE9sNFZlY3RvclNvdXJjZSwgT2w0V21zU291cmNlfSBmcm9tIFwiLi9PbDRTb3VyY2VcIlxuaW1wb3J0IHtGZWF0dXJlSW5mb30gZnJvbSBcIi4vRmVhdHVyZUluZm9cIjtcblxuZGVjbGFyZSBjbGFzcyBwcm9qNCB7XG4gICAgc3RhdGljIGRlZnMobmFtZTogc3RyaW5nLCBkZWY6IHN0cmluZyk6IHZvaWQ7XG59XG5cbi8vIGRlY2xhcmUgZnVuY3Rpb24gYWRkU291cmNlKGlkOiBzdHJpbmcsIHRpdGxlOiBzdHJpbmcsIHZpc2liaWxpdHk6IGJvb2xlYW4sIG9wYWNpdHk6IG51bWJlcik6IHZvaWQ7XG5leHBvcnQgY2xhc3MgT2w0VXRpbHMge1xuICAgIC8qIFxuICAgICAqIHVuaXRzOiAnZGVncmVlcyd8J2Z0J3wnbSd8J3VzLWZ0J1xuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgcmVzb2x1dGlvblNjYWxlRmFjdG9yKHVuaXRzOiBzdHJpbmcpOiBudW1iZXIge1xuICAgICAgICBsZXQgZHBpID0gMjUuNCAvIDAuMjg7XG4gICAgICAgIGxldCBtcHUgPSBvbC5wcm9qLk1FVEVSU19QRVJfVU5JVFt1bml0c107XG4gICAgICAgIGxldCBpbmNoZXNQZXJNZXRlciA9IDM5LjM3O1xuICAgICAgICByZXR1cm4gbXB1ICogaW5jaGVzUGVyTWV0ZXIgKiBkcGk7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyByZXNvbHV0aW9uRm9yU2NhbGUoc2NhbGU6IG51bWJlciwgZmFjdG9yOiBudW1iZXIpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gc2NhbGUgLyBmYWN0b3I7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyByZXNvbHV0aW9uc0ZvclNjYWxlcyhzY2FsZXM6IG51bWJlcltdLCB1bml0czogc3RyaW5nKTogbnVtYmVyW10ge1xuICAgICAgICBsZXQgcmVzb2x1dGlvbnMgPSBbXTtcbiAgICAgICAgbGV0IGZhY3RvciA9IE9sNFV0aWxzLnJlc29sdXRpb25TY2FsZUZhY3Rvcih1bml0cyk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2NhbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICByZXNvbHV0aW9ucy5wdXNoKE9sNFV0aWxzLnJlc29sdXRpb25Gb3JTY2FsZShzY2FsZXNbaV0sIGZhY3RvcikpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXNvbHV0aW9ucztcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIHNjYWxlRm9yUmVzb2x1dGlvbihyZXNvbHV0aW9uOiBudW1iZXIsIGZhY3RvcjogbnVtYmVyKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHJlc29sdXRpb24gKiBmYWN0b3I7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBzY2FsZXNGb3JSZXNvbHV0aW9ucyhyZXNvbHV0aW9uczogbnVtYmVyW10sIHVuaXRzOiBzdHJpbmcpOiBudW1iZXJbXSB7XG4gICAgICAgIGxldCBzY2FsZXMgPSBbXTtcbiAgICAgICAgbGV0IGZhY3RvciA9IE9sNFV0aWxzLnJlc29sdXRpb25TY2FsZUZhY3Rvcih1bml0cyk7XG4gICAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCByZXNvbHV0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgc2NhbGVzLnB1c2goT2w0VXRpbHMuc2NhbGVGb3JSZXNvbHV0aW9uKHJlc29sdXRpb25zW2ldLCBmYWN0b3IpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2NhbGVzO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgaW5pdFByb2o0RGVmcyhwcm9qNERlZnM6IGFueSk6IHZvaWQge1xuICAgICAgICBmb3IgKGNvbnN0IG5hbWUgaW4gcHJvajREZWZzKSB7XG4gICAgICAgICAgICBwcm9qNC5kZWZzKG5hbWUsIHByb2o0RGVmc1tuYW1lXSk7XG4gICAgICAgICAgICBsZXQgcHIgPSBvbC5wcm9qLmdldChuYW1lKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0UHJvaihwcm9qQ29kZTogc3RyaW5nKTogb2wucHJvai5Qcm9qZWN0aW9uIHtcbiAgICAgICAgcmV0dXJuIG9sLnByb2ouZ2V0KHByb2pDb2RlKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGdldFN0eWxlKG9wdGlvbnM6IGFueSwgc3R5bGU6IG9sLnN0eWxlLlN0eWxlID0gbnVsbCk6IG9sLnN0eWxlLlN0eWxlIHtcbiAgICAgICAgbGV0IHN0eWxlXyA9IHN0eWxlID8gc3R5bGUgOiBuZXcgb2wuc3R5bGUuU3R5bGUoKTtcbiAgICAgICAgc3R5bGVfLnNldEZpbGwobmV3IG9sLnN0eWxlLkZpbGwob3B0aW9uc1snZmlsbCddKSk7XG4gICAgICAgIHN0eWxlXy5zZXRTdHJva2UobmV3IG9sLnN0eWxlLlN0cm9rZShvcHRpb25zWydzdHJva2UnXSkpO1xuICAgICAgICBpZiAob3B0aW9uc1snaW1hZ2UnXSAmJiBvcHRpb25zWydpbWFnZSddWydjaXJjbGUnXSkge1xuICAgICAgICAgICAgc3R5bGVfLnNldEltYWdlKG5ldyBvbC5zdHlsZS5DaXJjbGUoe1xuICAgICAgICAgICAgICAgICAgICByYWRpdXM6IG9wdGlvbnNbJ2ltYWdlJ11bJ2NpcmNsZSddWydyYWRpdXMnXSxcbiAgICAgICAgICAgICAgICAgICAgZmlsbDogbmV3IG9sLnN0eWxlLkZpbGwoe1xuICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6IG9wdGlvbnNbJ2ltYWdlJ11bJ2NpcmNsZSddWydmaWxsJ11bJ2NvbG9yJ11cbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3R5bGVfO1xuICAgICAgICAvL1xuICAgICAgICAvLyByZXR1cm4gbmV3IG9sLnN0eWxlXy5TdHlsZSh7XG4gICAgICAgIC8vICAgICBmaWxsOiBuZXcgb2wuc3R5bGVfLkZpbGwob3B0aW9uc1snZmlsbCddKSxcbiAgICAgICAgLy8gICAgIHN0cm9rZTogbmV3IG9sLnN0eWxlXy5TdHJva2Uob3B0aW9uc1snc3Ryb2tlJ10pLy8sXG4gICAgICAgIC8vICAgICAvLyBpbWFnZTogbmV3IG9sLnN0eWxlXy5DaXJjbGUoe1xuICAgICAgICAvLyAgICAgLy8gICAgIHJhZGl1czogNyxcbiAgICAgICAgLy8gICAgIC8vICAgICBmaWxsOiBuZXcgb2wuc3R5bGVfLkZpbGwob3B0aW9uc1snZmlsbCddKVxuICAgICAgICAvLyAgICAgLy8gfSlcbiAgICAgICAgLy8gfSk7XG4gICAgfVxuXG4vLyBmaWxsXG4vLyB7XG4vLyAgICAgY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4yKVxuLy8gfVxuLy8gc3Ryb2tlXG4vLyB7XG4vLyAgICAgY29sb3I6ICcjZmZjYzMzJyxcbi8vICAgICB3aWR0aDogMlxuLy8gICAgIGRhc2g6XG4vLyB9XG4vLyBpbWFnZVxufVxuXG5leHBvcnQgY2xhc3MgT2w0R2VvbSB7XG4gICAgcHJvdGVjdGVkIGdlb206IG9sLmdlb20uR2VvbWV0cnkgPSBudWxsO1xuICAgIHByb3RlY3RlZCBwcm9qOiBvbC5wcm9qLlByb2plY3Rpb24gPSBudWxsO1xuXG4gICAgY29uc3RydWN0b3IoZ2VvbTogb2wuZ2VvbS5HZW9tZXRyeSwgcHJvajogb2wucHJvai5Qcm9qZWN0aW9uKSB7XG4gICAgICAgIHRoaXMuZ2VvbSA9IGdlb207XG4gICAgICAgIHRoaXMucHJvaiA9IHByb2o7XG4gICAgfVxuXG4gICAgZ2V0R2VvbSgpOiBvbC5nZW9tLkdlb21ldHJ5IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2VvbTtcbiAgICB9XG5cbiAgICBnZXRQcm9qKCk6IG9sLnByb2ouUHJvamVjdGlvbiB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb2o7XG4gICAgfVxuXG4gICAgZ2V0RXh0ZW50KHByb2o6IG9sLnByb2ouUHJvamVjdGlvbik6IG9sLkV4dGVudCB7XG4gICAgICAgIGlmICh0aGlzLnByb2ogIT09IHByb2opIHtcbiAgICAgICAgICAgIHJldHVybiAoPG9sLmdlb20uR2VvbWV0cnk+KDxhbnk+IHRoaXMuZ2VvbSkuY2xvbmUoKSkudHJhbnNmb3JtKHRoaXMucHJvaiwgcHJvaikuZ2V0RXh0ZW50KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gKDxvbC5nZW9tLkdlb21ldHJ5Pig8YW55PiB0aGlzLmdlb20pLmNsb25lKCkpLmdldEV4dGVudCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGdldFBvbHlnb25Gb3JFeHRlbnQocHJvajogb2wucHJvai5Qcm9qZWN0aW9uKSB7XG4gICAgICAgIHJldHVybiBvbC5nZW9tLlBvbHlnb24uZnJvbUV4dGVudCh0aGlzLmdldEV4dGVudChwcm9qKSk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgT2w0RXh0ZW50IGV4dGVuZHMgT2w0R2VvbSB7XG4gICAgcHVibGljIHN0YXRpYyBmcm9tQXJyYXkob3JkaW5hdGVzOiBudW1iZXJbXSwgcHJvajogb2wucHJvai5Qcm9qZWN0aW9uKTogT2w0RXh0ZW50IHtcbiAgICAgICAgbGV0IGdlb20gPSBuZXcgb2wuZ2VvbS5NdWx0aVBvaW50KFtbb3JkaW5hdGVzWzBdLCBvcmRpbmF0ZXNbMV1dLCBbb3JkaW5hdGVzWzJdLCBvcmRpbmF0ZXNbM11dXSk7XG4gICAgICAgIHJldHVybiBuZXcgT2w0RXh0ZW50KGdlb20sIHByb2opO1xuICAgIH1cbn1cblxuZXhwb3J0IGNvbnN0IFVVSUQ6IHN0cmluZyA9ICd1dWlkJztcbmV4cG9ydCBjb25zdCBMQVlFUl9VVUlEOiBzdHJpbmcgPSAnbGF5ZXJ1dWlkJztcbmV4cG9ydCBjb25zdCBUSVRMRTogc3RyaW5nID0gJ3RpdGxlJztcbmV4cG9ydCBjb25zdCBNRVRBRE9SX0VQU0c6IG9sLlByb2plY3Rpb25MaWtlID0gJ0VQU0c6NDMyNic7XG5leHBvcnQgY29uc3QgTEFZRVJfVkVDVE9SID0gJ3ZlY3Rvcic7XG5leHBvcnQgY29uc3QgTEFZRVJfSU1BR0UgPSAnaW1hZ2UnO1xuXG5leHBvcnQgY2xhc3MgT2w0TWFwIHtcbiAgICBwcml2YXRlIHN0YXRpYyBfdXVpZCA9IDA7XG4gICAgcHJpdmF0ZSBzdGF0aWMgX2luc3RhbmNlOiBPbDRNYXAgPSBudWxsOyAvLyBzaW5nbGV0b25cbiAgICBwcml2YXRlIG9sTWFwOiBvbC5NYXAgPSBudWxsO1xuICAgIHByaXZhdGUgc2NhbGVzOiBudW1iZXJbXTtcbiAgICAvLyAgICBwcm90ZWN0ZWQgcHJvajogb2wucHJvai5Qcm9qZWN0aW9uID0gbnVsbDtcbiAgICBwcml2YXRlIHN0YXJ0RXh0ZW50OiBPbDRFeHRlbnQgPSBudWxsOyAgLy8geG1pbiwgeW1pbiwgeG1heCwgeW1heCBvcHRpb25zWydzdGFydEV4dGVudCddXG4gICAgcHJpdmF0ZSBtYXhFeHRlbnQ6IE9sNEV4dGVudCA9IG51bGw7XG4gICAgcHJpdmF0ZSBkcmF3ZXI6IE9sNERyYXdlcjtcbiAgICBwcml2YXRlIHdtc1NvdXJjZTogT2w0V21zU291cmNlO1xuICAgIHByaXZhdGUgdmVjU291cmNlOiBPbDRWZWN0b3JTb3VyY2U7XG4gICAgcHJpdmF0ZSBsYXllcnRyZWU6IExheWVyVHJlZTtcbiAgICBwcml2YXRlIHN0eWxlczogT2JqZWN0O1xuICAgIHByaXZhdGUgaGdMYXllcjogb2wubGF5ZXIuVmVjdG9yO1xuICAgIC8vIHByb3RlY3RlZCBkcmFnem9vbTogb2wuaW50ZXJhY3Rpb24uRHJhZ1pvb207XG4gICAgcHJpdmF0ZSBkcmFnem9vbTogRHJhZ1pvb207XG4gICAgcHJpdmF0ZSBmZWF0dXJlSW5mbzogRmVhdHVyZUluZm87XG5cbiAgICBwcml2YXRlIHN0YXRpYyBnZXRVdWlkKHByZWZpeDogc3RyaW5nID0gJycpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gcHJlZml4ICsgKCsrT2w0TWFwLl91dWlkKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKG9wdGlvbnM6IGFueSkgeyAvLyBzaW5nbGV0b25cbiAgICAgICAgb2xbJ0VOQUJMRV9SQVNURVJfUkVQUk9KRUNUSU9OJ10gPSBmYWxzZTtcbiAgICAgICAgT2w0VXRpbHMuaW5pdFByb2o0RGVmcyhvcHRpb25zWydwcm9qNERlZnMnXSk7XG4gICAgICAgIHRoaXMubGF5ZXJ0cmVlID0gTGF5ZXJUcmVlLmNyZWF0ZSh0aGlzKTtcbiAgICAgICAgdGhpcy53bXNTb3VyY2UgPSBPbDRXbXNTb3VyY2UuY3JlYXRlKHRoaXMsIHRydWUpO1xuICAgICAgICB0aGlzLnZlY1NvdXJjZSA9IE9sNFZlY3RvclNvdXJjZS5jcmVhdGUodGhpcyk7XG4gICAgICAgICg8SFRNTEZvcm1FbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy4tanMtY3JzLWNvZGUnKSkudmFsdWUgPSBvcHRpb25zWyd2aWV3J11bJ3Byb2plY3Rpb24nXTtcbiAgICAgICAgbGV0IHByb2o6IG9sLnByb2ouUHJvamVjdGlvbiA9IG9sLnByb2ouZ2V0KG9wdGlvbnNbJ3ZpZXcnXVsncHJvamVjdGlvbiddKTtcbiAgICAgICAgdGhpcy5zdHlsZXMgPSBvcHRpb25zWydzdHlsZXMnXTtcbiAgICAgICAgdGhpcy5zY2FsZXMgPSBvcHRpb25zWyd2aWV3J11bJ3NjYWxlcyddO1xuICAgICAgICB0aGlzLnN0YXJ0RXh0ZW50ID0gT2w0RXh0ZW50LmZyb21BcnJheShvcHRpb25zWyd2aWV3J11bJ3N0YXJ0RXh0ZW50J10sIHByb2opO1xuICAgICAgICB0aGlzLm1heEV4dGVudCA9IE9sNEV4dGVudC5mcm9tQXJyYXkob3B0aW9uc1sndmlldyddWydtYXhFeHRlbnQnXSwgcHJvaik7XG4gICAgICAgIGxldCBpbnRlcmFjdGlvbnMgPSBvbC5pbnRlcmFjdGlvbi5kZWZhdWx0cyhcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBhbHRTaGlmdERyYWdSb3RhdGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHBpbmNoUm90YXRlOiBmYWxzZVxuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgICBsZXQgY29udHJvbHMgPSBvbC5jb250cm9sLmRlZmF1bHRzKHthdHRyaWJ1dGlvbjogZmFsc2V9KTsvLy5leHRlbmQoW2F0dHJpYnV0aW9uXSlcbiAgICAgICAgdGhpcy5vbE1hcCA9IG5ldyBvbC5NYXAoe1xuICAgICAgICAgICAgaW50ZXJhY3Rpb25zOiBpbnRlcmFjdGlvbnMsXG4gICAgICAgICAgICB0YXJnZXQ6IG9wdGlvbnNbJ21hcCddWyd0YXJnZXQnXSxcbiAgICAgICAgICAgIHJlbmRlcmVyOiAnY2FudmFzJyxcbiAgICAgICAgICAgIGNvbnRyb2xzOiBjb250cm9sc1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5vbE1hcC5zZXRWaWV3KFxuICAgICAgICAgICAgdGhpcy5jcmVhdGVWaWV3KFxuICAgICAgICAgICAgICAgIHByb2osXG4gICAgICAgICAgICAgICAgdGhpcy5tYXhFeHRlbnQuZ2V0RXh0ZW50KHByb2opLFxuICAgICAgICAgICAgICAgIE9sNFV0aWxzLnJlc29sdXRpb25zRm9yU2NhbGVzKHRoaXMuc2NhbGVzLCBwcm9qLmdldFVuaXRzKCkpLnJldmVyc2UoKVxuICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgICAgICAvKiBtYWtlIGEgZ3JvdXAgbGF5ZXIgZm9yIGFsbCBpbWFnZSBsYXllcnMgKFdNUyBldGMuKSovXG4gICAgICAgIGxldCBpbWFnZUdyb3VwID0gbmV3IG9sLmxheWVyLkdyb3VwKHtcbiAgICAgICAgICAgIGxheWVyczogbmV3IG9sLkNvbGxlY3Rpb248b2wubGF5ZXIuQmFzZT4oKVxuICAgICAgICB9KTtcbiAgICAgICAgaW1hZ2VHcm91cC5zZXQoVVVJRCwgTEFZRVJfSU1BR0UpXG4gICAgICAgIHRoaXMub2xNYXAuYWRkTGF5ZXIoaW1hZ2VHcm91cCk7XG4gICAgICAgIC8qIG1ha2UgYSBncm91cCBsYXllciBmb3IgYWxsIHZlY3RvciBsYXllcnMgKEhpZ2h0bGlnaHQsIFNlYXJjaCByZXN1bHRzIGV0Yy4pKi9cbiAgICAgICAgbGV0IHZlY3Rvckdyb3VwID0gbmV3IG9sLmxheWVyLkdyb3VwKHtcbiAgICAgICAgICAgIGxheWVyczogbmV3IG9sLkNvbGxlY3Rpb248b2wubGF5ZXIuQmFzZT4oKVxuICAgICAgICB9KTtcbiAgICAgICAgdmVjdG9yR3JvdXAuc2V0KFVVSUQsIExBWUVSX1ZFQ1RPUilcbiAgICAgICAgdGhpcy5vbE1hcC5hZGRMYXllcih2ZWN0b3JHcm91cCk7XG5cbiAgICAgICAgZm9yIChsZXQgc291cmNlT3B0aW9ucyBvZiBvcHRpb25zWydzb3VyY2UnXSkge1xuICAgICAgICAgICAgaWYgKHNvdXJjZU9wdGlvbnNbJ3R5cGUnXSA9PT0gJ1dNUycpIHtcbiAgICAgICAgICAgICAgICBsZXQgd21zTGF5ZXIgPSB0aGlzLmFkZExheWVyKFxuICAgICAgICAgICAgICAgICAgICB0aGlzLndtc1NvdXJjZS5jcmVhdGVMYXllcihcbiAgICAgICAgICAgICAgICAgICAgICAgIE9sNE1hcC5nZXRVdWlkKCdvbGF5LScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlT3B0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub2xNYXAuZ2V0VmlldygpLmdldFByb2plY3Rpb24oKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZU9wdGlvbnNbJ3Zpc2libGUnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnNlRmxvYXQoc291cmNlT3B0aW9uc1snb3BhY2l0eSddKVxuICAgICAgICAgICAgICAgICAgICApLCB0cnVlXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihzb3VyY2VPcHRpb25zWyd0eXBlJ10gKyAnIGlzIG5vdCBzdXBwb3J0ZWQuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5vbE1hcC5hZGRDb250cm9sKG5ldyBvbC5jb250cm9sLlNjYWxlTGluZSgpKTtcblxuICAgICAgICB0aGlzLm9sTWFwLmFkZENvbnRyb2wobmV3IG9sLmNvbnRyb2wuWm9vbVRvRXh0ZW50KHtcbiAgICAgICAgICAgIGV4dGVudDogdGhpcy5tYXhFeHRlbnQuZ2V0RXh0ZW50KHByb2opXG4gICAgICAgIH0pKTtcbiAgICAgICAgdGhpcy5vbE1hcC5hZGRJbnRlcmFjdGlvbihuZXcgb2wuaW50ZXJhY3Rpb24uRHJhZ1pvb20oKSk7XG4gICAgICAgIHRoaXMub2xNYXAuYWRkQ29udHJvbChuZXcgb2wuY29udHJvbC5Nb3VzZVBvc2l0aW9uKFxuICAgICAgICAgICAgLy8ge1xuICAgICAgICAgICAgLy8gICAgIGNvb3JkaW5hdGVGb3JtYXQ6IGZ1bmN0aW9uIChjb29yZGluYXRlcykge1xuICAgICAgICAgICAgLy8gICAgICAgICB2YXIgY29vcmRfeCA9IGNvb3JkaW5hdGVzWzBdLnRvRml4ZWQoMyk7XG4gICAgICAgICAgICAvLyAgICAgICAgIHZhciBjb29yZF95ID0gY29vcmRpbmF0ZXNbMV0udG9GaXhlZCgzKTtcbiAgICAgICAgICAgIC8vICAgICAgICAgcmV0dXJuIGNvb3JkX3ggKyAnLCAnICsgY29vcmRfeTtcbiAgICAgICAgICAgIC8vICAgICB9XG4gICAgICAgICAgICAvLyB9XG4gICAgICAgICkpO1xuICAgICAgICB0aGlzLnpvb21Ub0V4dGVudCh0aGlzLnN0YXJ0RXh0ZW50LmdldFBvbHlnb25Gb3JFeHRlbnQocHJvaikpO1xuICAgICAgICBsZXQgaGdsID0gdGhpcy52ZWNTb3VyY2UuY3JlYXRlTGF5ZXIoXG4gICAgICAgICAgICBPbDRNYXAuZ2V0VXVpZCgnb2xheS0nKSxcbiAgICAgICAgICAgIHsnc3R5bGUnOiBPbDRVdGlscy5nZXRTdHlsZSh0aGlzLnN0eWxlc1snaGlnaGxpZ2h0J10pfSxcbiAgICAgICAgICAgIHRoaXMub2xNYXAuZ2V0VmlldygpLmdldFByb2plY3Rpb24oKVxuICAgICAgICApO1xuICAgICAgICB0aGlzLmhnTGF5ZXIgPSA8b2wubGF5ZXIuVmVjdG9yPnRoaXMuYWRkTGF5ZXIoaGdsKTtcblxuICAgICAgICBsZXQgdkxheWVyID0gPG9sLmxheWVyLlZlY3Rvcj50aGlzLmFkZExheWVyKFxuICAgICAgICAgICAgdGhpcy52ZWNTb3VyY2UuY3JlYXRlTGF5ZXIoXG4gICAgICAgICAgICAgICAgT2w0TWFwLmdldFV1aWQoJ29sYXktJyksXG4gICAgICAgICAgICAgICAgeydzdHlsZSc6IE9sNFV0aWxzLmdldFN0eWxlKHRoaXMuc3R5bGVzWydzZWFyY2gnXSl9LFxuICAgICAgICAgICAgICAgIHRoaXMub2xNYXAuZ2V0VmlldygpLmdldFByb2plY3Rpb24oKVxuICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgICAgICB2TGF5ZXIuc2V0TWFwKHRoaXMub2xNYXApO1xuICAgICAgICB0aGlzLmRyYXdlciA9IG5ldyBPbDREcmF3ZXIodkxheWVyKTtcbiAgICAgICAgdGhpcy5kcmFnem9vbSA9IG5ldyBEcmFnWm9vbSh0aGlzLm9sTWFwKTtcbiAgICAgICAgdGhpcy5mZWF0dXJlSW5mbyA9IG5ldyBGZWF0dXJlSW5mbyh0aGlzLm9sTWFwLCB0aGlzLmhnTGF5ZXIpO1xuICAgIH1cblxuICAgIGFjdGl2YXRlRmVhdHVyZUluZm8oXG4gICAgICAgIHRvb2x0aXBFbG06IEhUTUxFbGVtZW50LFxuICAgICAgICBjYWxsYmFja1NlbGVjdDogRnVuY3Rpb24sXG4gICAgICAgIGNhbGxiYWNrVW5TZWxlY3Q6IEZ1bmN0aW9uLFxuICAgICAgICBjYWxsYmFja1VuU2VsZWN0QWxsOiBGdW5jdGlvblxuICAgICk6IHZvaWQge1xuICAgICAgICB0aGlzLmZlYXR1cmVJbmZvLmFjdGl2YXRlKHRvb2x0aXBFbG0sIGNhbGxiYWNrU2VsZWN0LCBjYWxsYmFja1VuU2VsZWN0LCBjYWxsYmFja1VuU2VsZWN0QWxsKTtcbiAgICB9XG5cbiAgICBkZWFjdGl2YXRlRmVhdHVyZUluZm8oKTogdm9pZCB7XG4gICAgICAgIHRoaXMuZmVhdHVyZUluZm8uZGVhY3RpdmF0ZSgpO1xuICAgIH1cblxuICAgIHJlc2V0RmVhdHVyZUluZm8oKSB7XG4gICAgICAgIHRoaXMuZmVhdHVyZUluZm8ucmVzZXQoKTtcbiAgICB9XG5cbiAgICBzZWxlY3RGZWF0dXJlcyh1dWlkczogc3RyaW5nW10pIHtcbiAgICAgICAgdGhpcy5mZWF0dXJlSW5mby5zZWxlY3RGZWF0dXJlcyh1dWlkcyk7XG4gICAgfVxuXG4gICAgZ2V0TGF5ZXJUcmVlKCk6IExheWVyVHJlZSB7XG4gICAgICAgIHJldHVybiB0aGlzLmxheWVydHJlZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFkZEludG9MYXllclRyZWUobGF5ZXI6IG9sLmxheWVyLkJhc2UpIHtcbiAgICAgICAgaWYgKHRoaXMubGF5ZXJ0cmVlKSB7XG4gICAgICAgICAgICB0aGlzLmxheWVydHJlZS5hZGQobGF5ZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjcmVhdGVWaWV3KHByb2o6IG9sLnByb2ouUHJvamVjdGlvbiwgZXh0ZW50OiBvbC5FeHRlbnQsIHJlc29sdXRpb25zOiBudW1iZXJbXSkge1xuICAgICAgICByZXR1cm4gbmV3IG9sLlZpZXcoe1xuICAgICAgICAgICAgcHJvamVjdGlvbjogcHJvaixcbiAgICAgICAgICAgIHJlc29sdXRpb25zOiByZXNvbHV0aW9ucyxcbiAgICAgICAgICAgIGV4dGVudDogZXh0ZW50XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHpvb21Ub0V4dGVudChnZW9tZXRyeTogb2wuZ2VvbS5TaW1wbGVHZW9tZXRyeSB8IG9sLkV4dGVudCkge1xuICAgICAgICB0aGlzLm9sTWFwLmdldFZpZXcoKS5maXQoZ2VvbWV0cnksIDxvbHgudmlldy5GaXRPcHRpb25zPnRoaXMub2xNYXAuZ2V0U2l6ZSgpKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgY3JlYXRlKG9wdGlvbnM6IGFueSk6IE9sNE1hcCB7XG4gICAgICAgIGlmICghT2w0TWFwLl9pbnN0YW5jZSkgey8vIHNpbmdsZXRvblxuICAgICAgICAgICAgT2w0TWFwLl9pbnN0YW5jZSA9IG5ldyBPbDRNYXAob3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE9sNE1hcC5faW5zdGFuY2U7XG4gICAgfVxuXG4gICAgZ2V0UHJvamVjdGlvbigpOiBvbC5wcm9qLlByb2plY3Rpb24ge1xuICAgICAgICByZXR1cm4gdGhpcy5vbE1hcC5nZXRWaWV3KCkuZ2V0UHJvamVjdGlvbigpO1xuICAgIH1cblxuICAgIGdldERyYXdlcigpOiBPbDREcmF3ZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5kcmF3ZXI7XG4gICAgfVxuXG4gICAgZ2V0SGdMYXllcigpOiBvbC5sYXllci5WZWN0b3Ige1xuICAgICAgICByZXR1cm4gdGhpcy5oZ0xheWVyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgYSBsYXllciBpbnRvIGEgbWFwLlxuICAgICAqIEBwYXJhbSBvcHRpb25zXG4gICAgICovXG4gICAgYWRkTGF5ZXJGb3JPcHRpb25zKG9wdGlvbnM6IGFueSkge1xuICAgICAgICBpZiAob3B0aW9uc1sndHlwZSddID09PSAnV01TJykge1xuICAgICAgICAgICAgbGV0IHdtc0xheWVyID0gdGhpcy5hZGRMYXllcihcbiAgICAgICAgICAgICAgICB0aGlzLndtc1NvdXJjZS5jcmVhdGVMYXllcihcbiAgICAgICAgICAgICAgICAgICAgT2w0TWFwLmdldFV1aWQoJ29sYXktJyksXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub2xNYXAuZ2V0VmlldygpLmdldFByb2plY3Rpb24oKSxcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uc1sndmlzaWJsZSddLFxuICAgICAgICAgICAgICAgICAgICBwYXJzZUZsb2F0KG9wdGlvbnNbJ29wYWNpdHknXSlcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKG9wdGlvbnNbJ3R5cGUnXSArICcgaXMgbm90IHN1cHBvcnRlZC4nKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFkZExheWVyKGxheWVyOiBvbC5sYXllci5CYXNlLCBhZGRUb0xheWVydHJlZTogYm9vbGVhbiA9IGZhbHNlKTogb2wubGF5ZXIuQmFzZSB7XG4gICAgICAgIGlmIChsYXllciBpbnN0YW5jZW9mIG9sLmxheWVyLkltYWdlKSB7XG4gICAgICAgICAgICBsZXQgZ3JvdXA6IG9sLmxheWVyLkdyb3VwID0gPG9sLmxheWVyLkdyb3VwPiB0aGlzLmZpbmRMYXllcihMQVlFUl9JTUFHRSk7XG4gICAgICAgICAgICBncm91cC5nZXRMYXllcnMoKS5pbnNlcnRBdChncm91cC5nZXRMYXllcnMoKS5nZXRMZW5ndGgoKSwgbGF5ZXIpO1xuICAgICAgICB9IGVsc2UgaWYgKGxheWVyIGluc3RhbmNlb2Ygb2wubGF5ZXIuVmVjdG9yKSB7XG4gICAgICAgICAgICBsZXQgZ3JvdXA6IG9sLmxheWVyLkdyb3VwID0gPG9sLmxheWVyLkdyb3VwPiB0aGlzLmZpbmRMYXllcihMQVlFUl9WRUNUT1IpO1xuICAgICAgICAgICAgZ3JvdXAuZ2V0TGF5ZXJzKCkuaW5zZXJ0QXQoZ3JvdXAuZ2V0TGF5ZXJzKCkuZ2V0TGVuZ3RoKCksIGxheWVyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhZGRUb0xheWVydHJlZSkge1xuICAgICAgICAgICAgdGhpcy5hZGRJbnRvTGF5ZXJUcmVlKGxheWVyKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbGF5ZXI7XG4gICAgfVxuXG4gICAgcmVtb3ZlTGF5ZXIobGF5ZXI6IG9sLmxheWVyLkJhc2UpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5vbE1hcC5yZW1vdmVMYXllcihsYXllcik7XG4gICAgfVxuXG4gICAgbW92ZUxheWVyKHV1aWQ6IHN0cmluZywgb2xkUG9zOiBudW1iZXIsIG5ld1BvczogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIGxldCBsYXllcjogb2wubGF5ZXIuQmFzZSA9IHRoaXMuZmluZExheWVyKHV1aWQpO1xuICAgICAgICBpZiAobGF5ZXIgaW5zdGFuY2VvZiBvbC5sYXllci5JbWFnZSkge1xuICAgICAgICAgICAgbGV0IGdyb3VwOiBvbC5sYXllci5Hcm91cCA9IDxvbC5sYXllci5Hcm91cD4gdGhpcy5maW5kTGF5ZXIoTEFZRVJfSU1BR0UpO1xuICAgICAgICAgICAgbGV0IGxheWVybGwgPSBncm91cC5nZXRMYXllcnMoKS5yZW1vdmUobGF5ZXIpO1xuICAgICAgICAgICAgZ3JvdXAuZ2V0TGF5ZXJzKCkuaW5zZXJ0QXQobmV3UG9zLCBsYXllcmxsKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZpbmRMYXllcih1dWlkOiBzdHJpbmcpOiBvbC5sYXllci5CYXNlIHtcbiAgICAgICAgbGV0IGxheWVycyA9IHRoaXMub2xNYXAuZ2V0TGF5ZXJzKCkuZ2V0QXJyYXkoKTtcbiAgICAgICAgZm9yIChsZXQgbGF5ZXIgb2YgbGF5ZXJzKSB7XG4gICAgICAgICAgICBsZXQgc291cmNlOiBvbC5zb3VyY2UuU291cmNlO1xuICAgICAgICAgICAgaWYgKGxheWVyLmdldChVVUlEKSA9PT0gdXVpZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBsYXllcjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobGF5ZXIgaW5zdGFuY2VvZiBvbC5sYXllci5Hcm91cCkge1xuICAgICAgICAgICAgICAgIGxldCBzdWJsYXllcnMgPSAoPG9sLmxheWVyLkdyb3VwPmxheWVyKS5nZXRMYXllcnMoKS5nZXRBcnJheSgpO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IHN1YmxheWVyIG9mIHN1YmxheWVycykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3VibGF5ZXIuZ2V0KFVVSUQpID09PSB1dWlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3VibGF5ZXI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgdXBkYXRlTWFwKCk6IHZvaWQge1xuICAgICAgICB0aGlzLm9sTWFwLnVwZGF0ZVNpemUoKTtcbiAgICB9XG5cbiAgICBjaGFuZ2VDcnMoY3JzOiBzdHJpbmcpIHsgLy8gVE9ET1xuICAgICAgICBsZXQgdG9Qcm9qID0gbnVsbDtcbiAgICAgICAgaWYgKCh0b1Byb2ogPSBvbC5wcm9qLmdldChjcnMpKSkge1xuICAgICAgICAgICAgbGV0IGV4dGVudCA9IE9sNEV4dGVudC5mcm9tQXJyYXkoXG4gICAgICAgICAgICAgICAgdGhpcy5vbE1hcC5nZXRWaWV3KCkuY2FsY3VsYXRlRXh0ZW50KHRoaXMub2xNYXAuZ2V0U2l6ZSgpKSxcbiAgICAgICAgICAgICAgICB0aGlzLmdldFByb2plY3Rpb24oKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGxldCBmcm9tUHJvaiA9IHRoaXMuZ2V0UHJvamVjdGlvbigpO1xuICAgICAgICAgICAgLy8gbGV0IGNlbnRlciA9IHRoaXMub2xNYXAuZ2V0VmlldygpLmdldENlbnRlcigpO1xuICAgICAgICAgICAgLy8gbGV0IGxheWVycyA9ICg8b2wubGF5ZXIuR3JvdXA+dGhpcy5maW5kTGF5ZXIoTEFZRVJfSU1BR0UpKS5nZXRMYXllcnMoKS5nZXRBcnJheSgpO1xuICAgICAgICAgICAgdGhpcy5vbE1hcC5zZXRWaWV3KFxuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlVmlldyhcbiAgICAgICAgICAgICAgICAgICAgdG9Qcm9qLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1heEV4dGVudC5nZXRFeHRlbnQodG9Qcm9qKSxcbiAgICAgICAgICAgICAgICAgICAgT2w0VXRpbHMucmVzb2x1dGlvbnNGb3JTY2FsZXModGhpcy5zY2FsZXMsIHRvUHJvai5nZXRVbml0cygpKS5yZXZlcnNlKClcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgdGhpcy5jaGFuZ2VGb3JJTGF5ZXJzSSgoPG9sLmxheWVyLkdyb3VwPnRoaXMuZmluZExheWVyKExBWUVSX0lNQUdFKSkuZ2V0TGF5ZXJzKCksIGZyb21Qcm9qLCB0b1Byb2opO1xuICAgICAgICAgICAgdGhpcy5jaGFuZ2VGb3JWTGF5ZXJzKCg8b2wubGF5ZXIuR3JvdXA+dGhpcy5maW5kTGF5ZXIoTEFZRVJfVkVDVE9SKSkuZ2V0TGF5ZXJzKCksIGZyb21Qcm9qLCB0b1Byb2opO1xuICAgICAgICAgICAgdGhpcy56b29tVG9FeHRlbnQoZXh0ZW50LmdldFBvbHlnb25Gb3JFeHRlbnQodG9Qcm9qKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGNoYW5nZUZvclZMYXllcnMobGF5ZXJzOiBvbC5Db2xsZWN0aW9uPG9sLmxheWVyLkJhc2U+LCBmcm9tUHJvaiwgdG9Qcm9qKSB7XG4gICAgICAgIGZvciAobGV0IGxheWVyIG9mIGxheWVycy5nZXRBcnJheSgpKSB7XG4gICAgICAgICAgICB0aGlzLnZlY1NvdXJjZS5yZXByb2plY3Rpb25Tb3VyY2UobGF5ZXIsIGZyb21Qcm9qLCB0b1Byb2opO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjaGFuZ2VGb3JJTGF5ZXJzSShsYXllcnM6IG9sLkNvbGxlY3Rpb248b2wubGF5ZXIuQmFzZT4sIGZyb21Qcm9qLCB0b1Byb2opIHtcbiAgICAgICAgZm9yIChsZXQgbGF5ZXIgb2YgbGF5ZXJzLmdldEFycmF5KCkpIHtcbiAgICAgICAgICAgIHRoaXMud21zU291cmNlLnJlcHJvamVjdGlvblNvdXJjZSg8b2wubGF5ZXIuSW1hZ2U+bGF5ZXIsIGZyb21Qcm9qLCB0b1Byb2opO1xuICAgICAgICAgICAgbGV0IHNvdXJjZSA9IDxvbC5zb3VyY2UuSW1hZ2VXTVM+KDxvbC5sYXllci5JbWFnZT5sYXllcikuZ2V0U291cmNlKCk7XG4gICAgICAgICAgICBsZXQgaWxmOiBvbC5JbWFnZUxvYWRGdW5jdGlvblR5cGUgPSBzb3VyY2UuZ2V0SW1hZ2VMb2FkRnVuY3Rpb24oKTtcbiAgICAgICAgICAgIHNvdXJjZS5zZXRJbWFnZUxvYWRGdW5jdGlvbihpbGYpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2V0VmlzaWJsZShsYXllcjogb2wubGF5ZXIuQmFzZSB8IHN0cmluZywgdmlzaWJsaXR5OiBib29sZWFuKTogdm9pZCB7XG4gICAgICAgIGxldCBfbGF5ZXI6IG9sLmxheWVyLkJhc2UgPSBsYXllciBpbnN0YW5jZW9mIG9sLmxheWVyLkJhc2UgPyBsYXllciA6IHRoaXMuZmluZExheWVyKDxzdHJpbmc+bGF5ZXIpO1xuICAgICAgICBpZiAoX2xheWVyKSB7XG4gICAgICAgICAgICBfbGF5ZXIuc2V0VmlzaWJsZSh2aXNpYmxpdHkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2V0T3BhY2l0eShsYXllcjogb2wubGF5ZXIuQmFzZSB8IHN0cmluZywgb3BhY2l0eTogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIGxldCBfbGF5ZXI6IG9sLmxheWVyLkJhc2UgPSBsYXllciBpbnN0YW5jZW9mIG9sLmxheWVyLkJhc2UgPyBsYXllciA6IHRoaXMuZmluZExheWVyKDxzdHJpbmc+bGF5ZXIpO1xuICAgICAgICBpZiAoX2xheWVyKSB7XG4gICAgICAgICAgICBfbGF5ZXIuc2V0T3BhY2l0eShvcGFjaXR5KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNsZWFyRmVhdHVyZXMoKSB7XG4gICAgICAgIHRoaXMudmVjU291cmNlLmNsZWFyRmVhdHVyZXModGhpcy5oZ0xheWVyKTtcbiAgICB9XG5cbiAgICBzaG93RmVhdHVyZXMoZ2VvSnNvbjogT2JqZWN0KSB7XG4gICAgICAgIHRoaXMudmVjU291cmNlLnNob3dGZWF0dXJlcyh0aGlzLmhnTGF5ZXIsIGdlb0pzb24pO1xuICAgIH1cblxuICAgIGdldEZpcnN0R2VvbUZvclNlYXJjaCgpOiBvYmplY3Qge1xuICAgICAgICBsZXQgZmVhdHVyZXMgPSB0aGlzLmRyYXdlci5nZXRMYXllcigpLmdldFNvdXJjZSgpLmdldEZlYXR1cmVzKCk7XG4gICAgICAgIGlmKGZlYXR1cmVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGdlb2pzb24gPSBuZXcgb2wuZm9ybWF0Lkdlb0pTT04oKS53cml0ZUZlYXR1cmVPYmplY3QoXG4gICAgICAgICAgICBmZWF0dXJlc1swXSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAnZGF0YVByb2plY3Rpb24nOiBNRVRBRE9SX0VQU0csXG4gICAgICAgICAgICAgICAgJ2ZlYXR1cmVQcm9qZWN0aW9uJzogdGhpcy5nZXRQcm9qZWN0aW9uKClcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgICAgZ2VvanNvblsnYmJveCddID0gbmV3IE9sNEdlb20oZmVhdHVyZXNbMF0uZ2V0R2VvbWV0cnkoKSwgdGhpcy5nZXRQcm9qZWN0aW9uKCkpXG4gICAgICAgICAgICAuZ2V0RXh0ZW50KG9sLnByb2ouZ2V0KE1FVEFET1JfRVBTRykpO1xuICAgICAgICByZXR1cm4gZ2VvanNvbjtcbiAgICB9XG5cbiAgICBkcmF3R2VvbWV0cnlGb3JTZWFyY2goZ2VvSnNvbjogT2JqZWN0LCBvbkRyYXdFbmQ6IEZ1bmN0aW9uID0gbnVsbCkge1xuICAgICAgICBsZXQgb2w0bWFwID0gdGhpcztcbiAgICAgICAgbGV0IG9sTWFwID0gdGhpcy5vbE1hcDtcbiAgICAgICAgdGhpcy52ZWNTb3VyY2UuY2xlYXJGZWF0dXJlcyh0aGlzLmRyYXdlci5nZXRMYXllcigpKTtcbiAgICAgICAgdGhpcy52ZWNTb3VyY2Uuc2hvd0ZlYXR1cmVzKHRoaXMuZHJhd2VyLmdldExheWVyKCksIGdlb0pzb24pO1xuICAgICAgICBsZXQgbXVsdGlQb2ludDogb2wuZ2VvbS5NdWx0aVBvaW50ID0gPG9sLmdlb20uTXVsdGlQb2ludD4gT2w0RXh0ZW50LmZyb21BcnJheShcbiAgICAgICAgICAgIHRoaXMuZHJhd2VyLmdldExheWVyKCkuZ2V0U291cmNlKCkuZ2V0RXh0ZW50KCksXG4gICAgICAgICAgICB0aGlzLm9sTWFwLmdldFZpZXcoKS5nZXRQcm9qZWN0aW9uKClcbiAgICAgICAgKS5nZXRHZW9tKCk7XG4gICAgICAgIGxldCBtYXhleHRlbnQgPSB0aGlzLm1heEV4dGVudC5nZXRQb2x5Z29uRm9yRXh0ZW50KHRoaXMub2xNYXAuZ2V0VmlldygpLmdldFByb2plY3Rpb24oKSk7XG4gICAgICAgIGlmIChtYXhleHRlbnQuaW50ZXJzZWN0c0Nvb3JkaW5hdGUobXVsdGlQb2ludC5nZXRQb2ludCgwKS5nZXRDb29yZGluYXRlcygpKVxuICAgICAgICAgICAgJiYgbWF4ZXh0ZW50LmludGVyc2VjdHNDb29yZGluYXRlKG11bHRpUG9pbnQuZ2V0UG9pbnQoMSkuZ2V0Q29vcmRpbmF0ZXMoKSkpIHtcbiAgICAgICAgICAgIHRoaXMuem9vbVRvRXh0ZW50KHRoaXMuZHJhd2VyLmdldExheWVyKCkuZ2V0U291cmNlKCkuZ2V0RXh0ZW50KCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbWV0YWRvci5kaXNwbGF5RXJyb3IoJ0RpZSBHZW9tZXRyaWUgaXN0IGF1w59lcmhhbGIgZGVyIHLDpHVtbGljaGVuIEVyc3RyZWNrdW5nLicpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBnZW9GZWF0dXJlID0gdGhpcy5nZXRGaXJzdEdlb21Gb3JTZWFyY2goKTtcbiAgICAgICAgaWYgKG9uRHJhd0VuZCAhPT0gbnVsbCAmJiBnZW9GZWF0dXJlKSB7XG4gICAgICAgICAgICBvbkRyYXdFbmQoZ2VvRmVhdHVyZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkcmF3U2hhcGVGb3JTZWFyY2goc2hhcGVUeXBlOiBTSEFQRVMgPSBudWxsLCBvbkRyYXdFbmQ6IEZ1bmN0aW9uID0gbnVsbCkge1xuICAgICAgICB0aGlzLnNldERvdWJsZUNsaWNrWm9vbShmYWxzZSk7XG4gICAgICAgIGxldCBvbDRtYXAgPSB0aGlzO1xuICAgICAgICBsZXQgb2xNYXAgPSB0aGlzLm9sTWFwO1xuICAgICAgICBjb25zdCBzaGFwZTogU0hBUEVTID0gdHlwZW9mIHNoYXBlVHlwZSA9PT0gJ3N0cmluZycgPyBTSEFQRVNbPHN0cmluZz4gc2hhcGVUeXBlXSA6IHNoYXBlVHlwZTtcbiAgICAgICAgaWYgKHRoaXMuZHJhd2VyLmdldEludGVyYWN0aW9uKCkpIHtcbiAgICAgICAgICAgIHRoaXMub2xNYXAucmVtb3ZlSW50ZXJhY3Rpb24odGhpcy5kcmF3ZXIuZ2V0SW50ZXJhY3Rpb24oKSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5kcmF3ZXIuc2V0SW50ZXJhY3Rpb24oc2hhcGUsIE9sNFV0aWxzLmdldFN0eWxlKHRoaXMuc3R5bGVzWydzZWFyY2gnXSkpO1xuICAgICAgICBpZiAodGhpcy5kcmF3ZXIuZ2V0SW50ZXJhY3Rpb24oKSkge1xuICAgICAgICAgICAgbGV0IGRyYXdlciA9IHRoaXMuZHJhd2VyO1xuICAgICAgICAgICAgdGhpcy5nZXREcmF3ZXIoKS5nZXRMYXllcigpLmdldFNvdXJjZSgpLmNsZWFyKCk7XG4gICAgICAgICAgICB0aGlzLm9sTWFwLmFkZEludGVyYWN0aW9uKHRoaXMuZHJhd2VyLmdldEludGVyYWN0aW9uKCkpO1xuICAgICAgICAgICAgdGhpcy5kcmF3ZXIuZ2V0SW50ZXJhY3Rpb24oKS5vbihcbiAgICAgICAgICAgICAgICAnZHJhd3N0YXJ0JyxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICBvbDRtYXAuZ2V0RHJhd2VyKCkuZ2V0TGF5ZXIoKS5nZXRTb3VyY2UoKS5jbGVhcigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICB0aGlzLmRyYXdlci5nZXRJbnRlcmFjdGlvbigpLm9uKFxuICAgICAgICAgICAgICAgICdkcmF3ZW5kJyxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgZ2VvanNvbiA9IG5ldyBvbC5mb3JtYXQuR2VvSlNPTigpLndyaXRlRmVhdHVyZU9iamVjdChcbiAgICAgICAgICAgICAgICAgICAgICAgIGUuZmVhdHVyZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGF0YVByb2plY3Rpb24nOiBNRVRBRE9SX0VQU0csXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2ZlYXR1cmVQcm9qZWN0aW9uJzogb2w0bWFwLmdldFByb2plY3Rpb24oKVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICBnZW9qc29uWydiYm94J10gPSBuZXcgT2w0R2VvbShlLmZlYXR1cmUuZ2V0R2VvbWV0cnkoKSwgb2w0bWFwLmdldFByb2plY3Rpb24oKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5nZXRFeHRlbnQob2wucHJvai5nZXQoTUVUQURPUl9FUFNHKSk7XG4gICAgICAgICAgICAgICAgICAgIG9uRHJhd0VuZChnZW9qc29uKTtcbiAgICAgICAgICAgICAgICAgICAgb2xNYXAucmVtb3ZlSW50ZXJhY3Rpb24oZHJhd2VyLmdldEludGVyYWN0aW9uKCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmdldERyYXdlcigpLmdldExheWVyKCkuZ2V0U291cmNlKCkuY2xlYXIoKTtcbiAgICAgICAgICAgIG9uRHJhd0VuZChudWxsKTtcbiAgICAgICAgICAgIHRoaXMuc2V0RG91YmxlQ2xpY2tab29tKHRydWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWN0aXZhdGVzIC8gZGVhY3RpdmF0ZXMgaW50ZXJhY3Rpb24gb2wuaW50ZXJhY3Rpb24uRG91YmxlQ2xpY2tab29tXG4gICAgICogQHBhcmFtIHtib29sZWFufSBzdGF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgc2V0RG91YmxlQ2xpY2tab29tKHN0YXRlOiBib29sZWFuKSB7XG4gICAgICAgIGZvciAobGV0IGludGVyYWN0aW9uIG9mIHRoaXMub2xNYXAuZ2V0SW50ZXJhY3Rpb25zKCkuZ2V0QXJyYXkoKSkge1xuICAgICAgICAgICAgaWYgKGludGVyYWN0aW9uIGluc3RhbmNlb2Ygb2wuaW50ZXJhY3Rpb24uRG91YmxlQ2xpY2tab29tKSB7XG4gICAgICAgICAgICAgICAgaW50ZXJhY3Rpb24uc2V0QWN0aXZlKHN0YXRlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGVudW0gU0hBUEVTIHtOT05FLCBCT1gsIFBPTFlHT059XG47XG5cbmV4cG9ydCBjbGFzcyBPbDREcmF3ZXIge1xuICAgIC8vIHByaXZhdGUgc3RhdGljIF9pbnN0YW5jZTogT2w0RHJhd2VyO1xuICAgIHByb3RlY3RlZCBsYXllcjogb2wubGF5ZXIuVmVjdG9yO1xuICAgIHByb3RlY3RlZCBpbnRlcmFjdGlvbjogb2wuaW50ZXJhY3Rpb24uRHJhdztcblxuICAgIGNvbnN0cnVjdG9yKGxheWVyOiBvbC5sYXllci5WZWN0b3IpIHtcbiAgICAgICAgdGhpcy5sYXllciA9IGxheWVyO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRMYXllcigpOiBvbC5sYXllci5WZWN0b3Ige1xuICAgICAgICByZXR1cm4gdGhpcy5sYXllcjtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0SW50ZXJhY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmludGVyYWN0aW9uO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRJbnRlcmFjdGlvbih0eXBlOiBTSEFQRVMsIGRyYXdTdHlsZTogb2wuc3R5bGUuU3R5bGUpIHtcbiAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICBjYXNlIFNIQVBFUy5CT1g6XG4gICAgICAgICAgICAgICAgdGhpcy5pbnRlcmFjdGlvbiA9IG5ldyBvbC5pbnRlcmFjdGlvbi5EcmF3KHtcbiAgICAgICAgICAgICAgICAgICAgc291cmNlOiB0aGlzLmxheWVyLmdldFNvdXJjZSgpLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnQ2lyY2xlJyxcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IGRyYXdTdHlsZSxcbiAgICAgICAgICAgICAgICAgICAgZ2VvbWV0cnlGdW5jdGlvbjogY3JlYXRlQm94KCkgLy8gb2wuZC50cyBoYXMgbm8gZnVuY3Rpb24gXCJvbC5pbnRlcmFjdGlvbi5EcmF3LmNyZWF0ZUJveCgpXCJcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgU0hBUEVTLlBPTFlHT046XG4gICAgICAgICAgICAgICAgdGhpcy5pbnRlcmFjdGlvbiA9IG5ldyBvbC5pbnRlcmFjdGlvbi5EcmF3KHtcbiAgICAgICAgICAgICAgICAgICAgc291cmNlOiB0aGlzLmxheWVyLmdldFNvdXJjZSgpLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnUG9seWdvbicsXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiBkcmF3U3R5bGVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhpcy5pbnRlcmFjdGlvbiA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogb2wuZC50cyBoYXMgbm8gZnVuY3Rpb24gXCJvbC5pbnRlcmFjdGlvbi5EcmF3LmNyZWF0ZUJveCgpXCJcbiAqIEByZXR1cm5zIHsoY29vcmRpbmF0ZXM6YW55LCBvcHRfZ2VvbWV0cnk6YW55KT0+YW55fG9sLmdlb20uUG9seWdvbn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUJveCgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtIHtvbC5Db29yZGluYXRlfEFycmF5LjxvbC5Db29yZGluYXRlPnxBcnJheS48QXJyYXkuPG9sLkNvb3JkaW5hdGU+Pn0gY29vcmRpbmF0ZXNcbiAgICAgICAgICogQHBhcmFtIHtvbC5nZW9tLlNpbXBsZUdlb21ldHJ5PX0gb3B0X2dlb21ldHJ5XG4gICAgICAgICAqIEByZXR1cm4ge29sLmdlb20uU2ltcGxlR2VvbWV0cnl9XG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiAoY29vcmRpbmF0ZXMsIG9wdF9nZW9tZXRyeSkge1xuICAgICAgICAgICAgdmFyIGV4dGVudCA9IG9sLmV4dGVudC5ib3VuZGluZ0V4dGVudChjb29yZGluYXRlcyk7XG4gICAgICAgICAgICB2YXIgZ2VvbWV0cnkgPSBvcHRfZ2VvbWV0cnkgfHwgbmV3IG9sLmdlb20uUG9seWdvbihudWxsKTtcbiAgICAgICAgICAgIGdlb21ldHJ5LnNldENvb3JkaW5hdGVzKFtbXG4gICAgICAgICAgICAgICAgb2wuZXh0ZW50LmdldEJvdHRvbUxlZnQoZXh0ZW50KSxcbiAgICAgICAgICAgICAgICBvbC5leHRlbnQuZ2V0Qm90dG9tUmlnaHQoZXh0ZW50KSxcbiAgICAgICAgICAgICAgICBvbC5leHRlbnQuZ2V0VG9wUmlnaHQoZXh0ZW50KSxcbiAgICAgICAgICAgICAgICBvbC5leHRlbnQuZ2V0VG9wTGVmdChleHRlbnQpLFxuICAgICAgICAgICAgICAgIG9sLmV4dGVudC5nZXRCb3R0b21MZWZ0KGV4dGVudClcbiAgICAgICAgICAgIF1dKTtcbiAgICAgICAgICAgIHJldHVybiBnZW9tZXRyeTtcbiAgICAgICAgfVxuICAgICk7XG59XG5cbmRlY2xhcmUgdmFyIG1ldGFkb3I6IGFueTsiLCJpbXBvcnQge1RJVExFLCBVVUlELCBMQVlFUl9VVUlELCBPbDRNYXB9IGZyb20gXCIuL09sNFwiO1xuaW1wb3J0IHtMYXllclRyZWV9IGZyb20gJy4vTGF5ZXJUcmVlJztcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIE9sNFNvdXJjZSB7XG5cbiAgICBhYnN0cmFjdCBjcmVhdGVMYXllcihsYXllclV1aWQ6IHN0cmluZywgb3B0aW9uczogYW55LCBwcm9qOiBvbC5Qcm9qZWN0aW9uTGlrZSwgdmlzaWJsZTogYm9vbGVhbiwgb3BhY2l0eTogbnVtYmVyKTogb2wubGF5ZXIuQmFzZTtcblxuICAgIGFic3RyYWN0IHJlcHJvamVjdGlvblNvdXJjZShsYXllcjogb2wubGF5ZXIuQmFzZSwgZnJvbVByb2o6IG9sLlByb2plY3Rpb25MaWtlLCB0b1Byb2o6IG9sLlByb2plY3Rpb25MaWtlKTtcblxuICAgIGFic3RyYWN0IGNsb25lTGF5ZXIobGF5ZXI6IG9sLmxheWVyLkJhc2UsIGZyb21Qcm9qOiBvbC5Qcm9qZWN0aW9uTGlrZSwgdG9Qcm9qOiBvbC5Qcm9qZWN0aW9uTGlrZSk6IG9sLmxheWVyLkJhc2U7XG59XG5cbmV4cG9ydCBjbGFzcyBPbDRWZWN0b3JTb3VyY2UgaW1wbGVtZW50cyBPbDRTb3VyY2Uge1xuICAgIHByaXZhdGUgc3RhdGljIF9pbnN0YW5jZTogT2w0VmVjdG9yU291cmNlO1xuICAgIHByb3RlY3RlZCBzaG93YWJsZTogYm9vbGVhbiA9IGZhbHNlO1xuICAgIHByaXZhdGUgb2w0TWFwOiBPbDRNYXA7XG5cbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKG9sNE1hcDogT2w0TWFwKSB7XG4gICAgICAgIC8vIHN1cGVyKGZhbHNlKTtcbiAgICAgICAgdGhpcy5vbDRNYXAgPSBvbDRNYXA7XG4gICAgICAgIC8vIHRoaXMuc2V0U2hvd2FibGUoZmFsc2UpO1xuICAgIH1cblxuICAgIHN0YXRpYyBjcmVhdGUob2w0bWFwOiBPbDRNYXApOiBPbDRWZWN0b3JTb3VyY2Uge1xuICAgICAgICBpZiAoIU9sNFZlY3RvclNvdXJjZS5faW5zdGFuY2UpIHsvLyBzaW5nbGV0b25cbiAgICAgICAgICAgIE9sNFZlY3RvclNvdXJjZS5faW5zdGFuY2UgPSBuZXcgT2w0VmVjdG9yU291cmNlKG9sNG1hcCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE9sNFZlY3RvclNvdXJjZS5faW5zdGFuY2U7XG4gICAgfVxuXG4gICAgY3JlYXRlTGF5ZXIobGF5ZXJVdWlkOiBzdHJpbmcsIG9wdGlvbnM6IGFueSwgcHJvajogb2wuUHJvamVjdGlvbkxpa2UsIHZpc2libGU6IGJvb2xlYW4gPSB0cnVlLCBvcGFjaXR5OiBudW1iZXIgPSAxLjApOiBvbC5sYXllci5CYXNlIHtcbiAgICAgICAgbGV0IHZMYXllciA9IG5ldyBvbC5sYXllci5WZWN0b3Ioe1xuICAgICAgICAgICAgc291cmNlOiBuZXcgb2wuc291cmNlLlZlY3Rvcih7d3JhcFg6IGZhbHNlfSksXG4gICAgICAgICAgICBzdHlsZTogb3B0aW9uc1snc3R5bGUnXVxuICAgICAgICB9KTtcbiAgICAgICAgdkxheWVyLnNldChVVUlELCBsYXllclV1aWQpO1xuICAgICAgICByZXR1cm4gdkxheWVyO1xuICAgIH1cblxuICAgIHJlcHJvamVjdGlvblNvdXJjZShsYXllcjogb2wubGF5ZXIuQmFzZSwgZnJvbVByb2o6IG9sLlByb2plY3Rpb25MaWtlLCB0b1Byb2o6IG9sLlByb2plY3Rpb25MaWtlKSB7XG4gICAgICAgIGxldCBzb3VyY2UgPSAoPG9sLmxheWVyLkxheWVyPmxheWVyKS5nZXRTb3VyY2UoKTtcbiAgICAgICAgbGV0IGZlYXR1cmVzOiBvbC5GZWF0dXJlW10gPSAoPG9sLnNvdXJjZS5WZWN0b3I+c291cmNlKS5nZXRGZWF0dXJlcygpO1xuICAgICAgICBmb3IgKGxldCBmZWF0dXJlIG9mIGZlYXR1cmVzKSB7XG4gICAgICAgICAgICBmZWF0dXJlLnNldEdlb21ldHJ5KGZlYXR1cmUuZ2V0R2VvbWV0cnkoKS50cmFuc2Zvcm0oZnJvbVByb2osIHRvUHJvaikpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY2xvbmVMYXllcihsYXllcjogb2wubGF5ZXIuQmFzZSwgZnJvbVByb2o6IG9sLlByb2plY3Rpb25MaWtlLCB0b1Byb2o6IG9sLlByb2plY3Rpb25MaWtlKTogb2wubGF5ZXIuQmFzZSB7XG4gICAgICAgIC8qIFRPRE8gZm9yIGNsb25lICovXG4gICAgICAgIHJldHVybiBsYXllcjtcbiAgICB9XG5cbiAgICBzaG93RmVhdHVyZXModkxheWVyOiBvbC5sYXllci5WZWN0b3IsIGdlb0pzb246IE9iamVjdCkge1xuICAgICAgICBsZXQgZ2VvSnNvblJlYWRlcjogb2wuZm9ybWF0Lkdlb0pTT04gPSBuZXcgb2wuZm9ybWF0Lkdlb0pTT04oKTtcbiAgICAgICAgbGV0IGRhdGFwcm9qID0gZ2VvSnNvblJlYWRlci5yZWFkUHJvamVjdGlvbihnZW9Kc29uKTtcbiAgICAgICAgbGV0IGZlYXR1cmVzID0gZ2VvSnNvblJlYWRlci5yZWFkRmVhdHVyZXMoXG4gICAgICAgICAgICBnZW9Kc29uLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICdkYXRhUHJvamVjdGlvbic6IGdlb0pzb25SZWFkZXIucmVhZFByb2plY3Rpb24oZ2VvSnNvbiksXG4gICAgICAgICAgICAgICAgJ2ZlYXR1cmVQcm9qZWN0aW9uJzogdGhpcy5vbDRNYXAuZ2V0UHJvamVjdGlvbigpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgdkxheWVyLmdldFNvdXJjZSgpLmFkZEZlYXR1cmVzKGZlYXR1cmVzKTtcbiAgICB9XG5cbiAgICBjbGVhckZlYXR1cmVzKHZMYXllcjogb2wubGF5ZXIuVmVjdG9yKSB7XG4gICAgICAgIHZMYXllci5nZXRTb3VyY2UoKS5jbGVhcih0cnVlKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBPbDRXbXNTb3VyY2UgaW1wbGVtZW50cyBPbDRTb3VyY2Uge1xuICAgIHByaXZhdGUgc3RhdGljIF9pbnN0YW5jZTogT2w0V21zU291cmNlO1xuICAgIHByaXZhdGUgb2w0TWFwOiBPbDRNYXA7XG4gICAgcHJpdmF0ZSB1c2VMb2FkRXZlbnRzOiBib29sZWFuO1xuICAgIHB1YmxpYyBzdGF0aWMgbWFwQWN0aXZpdHk6IE1hcEFjdGl2aXR5Oy8vID0gTWFwQWN0aXZpdHkuY3JlYXRlKCk7XG4gICAgcHVibGljIGRpc2FibGVkOiBhbnk7XG5cbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKG9sNE1hcDogT2w0TWFwLCB1c2VMb2FkRXZlbnRzOiBib29sZWFuID0gdHJ1ZSkge1xuICAgICAgICB0aGlzLm9sNE1hcCA9IG9sNE1hcDtcbiAgICAgICAgdGhpcy51c2VMb2FkRXZlbnRzID0gdXNlTG9hZEV2ZW50cztcbiAgICAgICAgaWYgKHRoaXMudXNlTG9hZEV2ZW50cykge1xuICAgICAgICAgICAgT2w0V21zU291cmNlLm1hcEFjdGl2aXR5ID0gTWFwQWN0aXZpdHkuY3JlYXRlKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5kaXNhYmxlZCA9IHt9O1xuICAgIH1cblxuICAgIHN0YXRpYyBjcmVhdGUob2w0TWFwOiBPbDRNYXAsIHVzZUxvYWRFdmVudHM6IGJvb2xlYW4gPSB0cnVlKTogT2w0V21zU291cmNlIHtcbiAgICAgICAgaWYgKCFPbDRXbXNTb3VyY2UuX2luc3RhbmNlKSB7Ly8gc2luZ2xldG9uXG4gICAgICAgICAgICBPbDRXbXNTb3VyY2UuX2luc3RhbmNlID0gbmV3IE9sNFdtc1NvdXJjZShvbDRNYXAsIHVzZUxvYWRFdmVudHMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBPbDRXbXNTb3VyY2UuX2luc3RhbmNlO1xuICAgIH1cblxuICAgIHB1YmxpYyBhZGREaXNhYmxlZChsYXllcjogb2wubGF5ZXIuQmFzZSkge1xuICAgICAgICB0aGlzLmRpc2FibGVkW2xheWVyLmdldChVVUlEKV0gPSBsYXllci5nZXQoVVVJRCk7XG4gICAgICAgIHRoaXMub2w0TWFwLmdldExheWVyVHJlZSgpLnNldERpc2FibGUobGF5ZXIsIHRydWUpO1xuICAgICAgICB0aGlzLm9sNE1hcC5zZXRWaXNpYmxlKGxheWVyLCBmYWxzZSk7XG4gICAgfVxuXG4gICAgcHVibGljIHJlbW92ZURpc2FibGVkKGxheWVyOiBvbC5sYXllci5CYXNlKSB7XG4gICAgICAgIGlmIChsYXllci5nZXQoVVVJRCkpe1xuICAgICAgICAgICAgdGhpcy5vbDRNYXAuZ2V0TGF5ZXJUcmVlKCkuc2V0RGlzYWJsZShsYXllciwgZmFsc2UpO1xuICAgICAgICAgICAgbGV0IHZpc2libGUgPSB0aGlzLm9sNE1hcC5nZXRMYXllclRyZWUoKS5nZXRWaXNpYmxlKGxheWVyKTtcbiAgICAgICAgICAgIHRoaXMub2w0TWFwLnNldFZpc2libGUobGF5ZXIsIHZpc2libGUpO1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMuZGlzYWJsZWRbbGF5ZXIuZ2V0KFVVSUQpXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNyZWF0ZUxheWVyKGxheWVyVXVpZDogc3RyaW5nLCBvcHRpb25zOiBhbnkgPSBudWxsLCBwcm9qOiBvbC5Qcm9qZWN0aW9uTGlrZSwgdmlzaWJsZTogYm9vbGVhbiwgb3BhY2l0eTogbnVtYmVyKTogb2wubGF5ZXIuQmFzZSB7XG4gICAgICAgIGxldCBzb3VyY2UgPSB0aGlzLmNyZWF0ZVNvdXJjZShsYXllclV1aWQsIG9wdGlvbnNbJ3VybCddLCBvcHRpb25zWydwYXJhbXMnXSwgcHJvaik7XG4gICAgICAgIGxldCBsYXllcldtcyA9IHRoaXMuX2NyZWF0ZUxheWVyKGxheWVyVXVpZCwgdmlzaWJsZSwgb3BhY2l0eSwgc291cmNlLCBvcHRpb25zWyd0aXRsZSddID8gb3B0aW9uc1sndGl0bGUnXSA6IG51bGwpO1xuICAgICAgICByZXR1cm4gbGF5ZXJXbXM7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfY3JlYXRlTGF5ZXIobGF5ZXJVdWlkOiBzdHJpbmcsIHZpc2libGU6IGJvb2xlYW4sIG9wYWNpdHk6IG51bWJlciwgc291cmNlOiBvbC5zb3VyY2UuSW1hZ2VXTVMsIHRpdGxlOiBzdHJpbmcgPSBudWxsKSB7XG4gICAgICAgIGxldCBsYXllcldtcyA9IG5ldyBvbC5sYXllci5JbWFnZSh7XG4gICAgICAgICAgICBzb3VyY2U6IHNvdXJjZSxcbiAgICAgICAgICAgIHZpc2libGU6IHZpc2libGUsXG4gICAgICAgICAgICBvcGFjaXR5OiBvcGFjaXR5XG4gICAgICAgIH0pO1xuICAgICAgICBsYXllcldtcy5zZXQoVVVJRCwgbGF5ZXJVdWlkKTtcbiAgICAgICAgaWYgKHRpdGxlICE9PSBudWxsKSB7XG4gICAgICAgICAgICBsYXllcldtcy5zZXQoVElUTEUsIHRpdGxlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbGF5ZXJXbXM7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjcmVhdGVTb3VyY2UobGF5ZXJVdWlkOiBzdHJpbmcsIHVybDogc3RyaW5nLCBwYXJhbXM6IGFueSwgcHJvajogb2wuUHJvamVjdGlvbkxpa2UpOiBvbC5zb3VyY2UuSW1hZ2VXTVMge1xuICAgICAgICBsZXQgc291cmNlID0gbmV3IG9sLnNvdXJjZS5JbWFnZVdNUyh7XG4gICAgICAgICAgICB1cmw6IHVybCxcbiAgICAgICAgICAgIHBhcmFtczogcGFyYW1zLFxuICAgICAgICAgICAgcHJvamVjdGlvbjogcHJvalxuICAgICAgICB9KTtcbiAgICAgICAgc291cmNlLnNldChMQVlFUl9VVUlELCBsYXllclV1aWQpO1xuICAgICAgICB0aGlzLnNldExvYWRFdmVudHMoc291cmNlKTtcbiAgICAgICAgcmV0dXJuIHNvdXJjZTtcbiAgICB9XG5cbiAgICByZXByb2plY3Rpb25Tb3VyY2UobGF5ZXI6IG9sLmxheWVyLkJhc2UsIGZyb21Qcm9qOiBvbC5Qcm9qZWN0aW9uTGlrZSwgdG9Qcm9qOiBvbC5Qcm9qZWN0aW9uTGlrZSkge1xuICAgICAgICBsZXQgb2xkc291cmNlID0gPG9sLnNvdXJjZS5JbWFnZVdNUz4oPG9sLmxheWVyLkxheWVyPmxheWVyKS5nZXRTb3VyY2UoKTtcbiAgICAgICAgbGV0IG5ld1NvdXJjZSA9IHRoaXMuY3JlYXRlU291cmNlKGxheWVyLmdldChVVUlEKSwgb2xkc291cmNlLmdldFVybCgpLCBvbGRzb3VyY2UuZ2V0UGFyYW1zKCksIHRvUHJvaik7XG4gICAgICAgICg8b2wubGF5ZXIuTGF5ZXI+bGF5ZXIpLnNldFNvdXJjZShuZXdTb3VyY2UpO1xuICAgICAgICB0aGlzLnJlbW92ZURpc2FibGVkKGxheWVyKTtcbiAgICB9XG5cbiAgICBjbG9uZUxheWVyKGxheWVyOiBvbC5sYXllci5CYXNlLCBmcm9tUHJvajogb2wuUHJvamVjdGlvbkxpa2UsIHRvUHJvajogb2wuUHJvamVjdGlvbkxpa2UpOiBvbC5sYXllci5CYXNlIHtcbiAgICAgICAgbGV0IG9sZHNvdXJjZSA9IDxvbC5zb3VyY2UuSW1hZ2VXTVM+KDxvbC5sYXllci5MYXllcj5sYXllcikuZ2V0U291cmNlKCk7XG4gICAgICAgIGxldCBuZXdTb3VyY2UgPSB0aGlzLmNyZWF0ZVNvdXJjZShsYXllci5nZXQoVVVJRCksIG9sZHNvdXJjZS5nZXRVcmwoKSwgb2xkc291cmNlLmdldFBhcmFtcygpLCB0b1Byb2opO1xuICAgICAgICBsZXQgb2xkTGF5ZXIgPSAoPG9sLmxheWVyLkxheWVyPmxheWVyKTtcbiAgICAgICAgbGV0IG5ld0xheWVyID0gdGhpcy5fY3JlYXRlTGF5ZXIob2xkTGF5ZXIuZ2V0KFVVSUQpLCBvbGRMYXllci5nZXRWaXNpYmxlKCksIG9sZExheWVyLmdldE9wYWNpdHkoKSwgbmV3U291cmNlLCBvbGRMYXllci5nZXQoVElUTEUpKTtcbiAgICAgICAgcmV0dXJuIG5ld0xheWVyO1xuICAgIH1cblxuXG4gICAgcHJpdmF0ZSBzZXRMb2FkRXZlbnRzKHNvdXJjZTogb2wuc291cmNlLkltYWdlV01TKSB7XG4gICAgICAgIGlmICh0aGlzLnVzZUxvYWRFdmVudHMpIHtcbiAgICAgICAgICAgIC8vIHNvdXJjZS5zZXRJbWFnZUxvYWRGdW5jdGlvbih0aGlzLmltYWdlTG9hZEZ1bmN0aW9uLmJpbmQodGhpcykpO1xuICAgICAgICAgICAgc291cmNlLm9uKCdpbWFnZWxvYWRzdGFydCcsIHRoaXMuaW1hZ2VMb2FkU3RhcnQuYmluZCh0aGlzKSk7XG4gICAgICAgICAgICBzb3VyY2Uub24oJ2ltYWdlbG9hZGVuZCcsIHRoaXMuaW1hZ2VMb2FkRW5kLmJpbmQodGhpcykpO1xuICAgICAgICAgICAgc291cmNlLm9uKCdpbWFnZWxvYWRlcnJvcicsIHRoaXMuaW1hZ2VMb2FkRXJyb3IuYmluZCh0aGlzKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpbWFnZUxvYWRTdGFydChlOiBvbC5zb3VyY2UuSW1hZ2VFdmVudCkge1xuICAgICAgICAvLyBjb25zb2xlLmxvZygnc3RhcnQnLCAoPG9sLnNvdXJjZS5JbWFnZVdNUz5lLnRhcmdldCkuZ2V0KExBWUVSX1VVSUQpKTtcbiAgICAgICAgaWYgKE9sNFdtc1NvdXJjZS5tYXBBY3Rpdml0eSkge1xuICAgICAgICAgICAgT2w0V21zU291cmNlLm1hcEFjdGl2aXR5LmxvYWRTdGFydCgoPG9sLnNvdXJjZS5JbWFnZVdNUz5lLnRhcmdldCkuZ2V0KExBWUVSX1VVSUQpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGltYWdlTG9hZEVuZChlOiBvbC5zb3VyY2UuSW1hZ2VFdmVudCkge1xuICAgICAgICAvLyBjb25zb2xlLmxvZygnZW5kJywgKDxvbC5zb3VyY2UuSW1hZ2VXTVM+ZS50YXJnZXQpLmdldChMQVlFUl9VVUlEKSk7XG4gICAgICAgIGlmIChPbDRXbXNTb3VyY2UubWFwQWN0aXZpdHkpIHtcbiAgICAgICAgICAgIE9sNFdtc1NvdXJjZS5tYXBBY3Rpdml0eS5sb2FkRW5kKCg8b2wuc291cmNlLkltYWdlV01TPmUudGFyZ2V0KS5nZXQoTEFZRVJfVVVJRCkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaW1hZ2VMb2FkRXJyb3IoZTogb2wuc291cmNlLkltYWdlRXZlbnQpIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ2Vycm9yJywgKDxvbC5zb3VyY2UuSW1hZ2VXTVM+ZS50YXJnZXQpLmdldChMQVlFUl9VVUlEKSk7XG4gICAgICAgIGlmIChPbDRXbXNTb3VyY2UubWFwQWN0aXZpdHkpIHtcbiAgICAgICAgICAgIE9sNFdtc1NvdXJjZS5tYXBBY3Rpdml0eS5sb2FkRXJyb3IoKDxvbC5zb3VyY2UuSW1hZ2VXTVM+ZS50YXJnZXQpLmdldChMQVlFUl9VVUlEKSk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGxheWVyID0gdGhpcy5vbDRNYXAuZmluZExheWVyKCg8b2wuc291cmNlLkltYWdlV01TPmUudGFyZ2V0KS5nZXQoTEFZRVJfVVVJRCkpO1xuICAgICAgICB0aGlzLmFkZERpc2FibGVkKGxheWVyKTtcbiAgICB9XG5cbn1cblxuZXhwb3J0IGNsYXNzIE1hcEFjdGl2aXR5IHtcbiAgICBwcml2YXRlIHN0YXRpYyBfaW5zdGFuY2U6IE1hcEFjdGl2aXR5O1xuICAgIHByaXZhdGUgbGF5ZXJzOiBhbnkgPSB7fTtcbiAgICBwcml2YXRlIGlzTG9hZGluZzogYm9vbGVhbiA9IGZhbHNlO1xuXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcigpIHtcbiAgICB9XG5cbiAgICBzdGF0aWMgY3JlYXRlKCk6IE1hcEFjdGl2aXR5IHtcbiAgICAgICAgaWYgKCFNYXBBY3Rpdml0eS5faW5zdGFuY2UpIHsvLyBzaW5nbGV0b25cbiAgICAgICAgICAgIE1hcEFjdGl2aXR5Ll9pbnN0YW5jZSA9IG5ldyBNYXBBY3Rpdml0eSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBNYXBBY3Rpdml0eS5faW5zdGFuY2U7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhY3Rpdml0eVN0YXJ0KGxheWVyTmFtZTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMubGF5ZXJzW2xheWVyTmFtZV0gPSB0cnVlO1xuICAgICAgICBpZiAodGhpcy5pc0xvYWRpbmcgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICB0aGlzLmlzTG9hZGluZyA9IHRydWU7XG4gICAgICAgICAgICB3aW5kb3dbJ21ldGFkb3InXS5wcmVsb2FkZXJTdGFydCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhY3Rpdml0eUVuZChsYXllck5hbWU6IHN0cmluZykge1xuICAgICAgICBpZiAodGhpcy5sYXllcnNbbGF5ZXJOYW1lXSkge1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMubGF5ZXJzW2xheWVyTmFtZV07XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChsZXQgbGF5ZXJOIGluIHRoaXMubGF5ZXJzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgd2luZG93WydtZXRhZG9yJ10ucHJlbG9hZGVyU3RvcCgpO1xuICAgIH1cblxuICAgIGxvYWRTdGFydChsYXllck5hbWU6IHN0cmluZykge1xuICAgICAgICB0aGlzLmFjdGl2aXR5U3RhcnQobGF5ZXJOYW1lKTtcbiAgICB9XG5cbiAgICBsb2FkRW5kKGxheWVyTmFtZTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuYWN0aXZpdHlFbmQobGF5ZXJOYW1lKTtcbiAgICB9XG5cbiAgICBsb2FkRXJyb3IobGF5ZXJOYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5hY3Rpdml0eUVuZChsYXllck5hbWUpO1xuICAgIH1cbn1cbiIsImV4cG9ydCBjbGFzcyBFRWxlbWVudCB7XG4gICAgcHJpdmF0ZSBfZWxlbWVudDogSFRNTEVsZW1lbnQ7XG4gICAgY29uc3RydWN0b3IoZWxlbWVudDogSFRNTEVsZW1lbnQpe1xuICAgICAgICB0aGlzLl9lbGVtZW50ID0gZWxlbWVudDtcbiAgICB9XG5cbiAgICBnZXQgZWxlbWVudCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2VsZW1lbnQ7XG4gICAgfVxuXG4gICAgc2V0QXR0cnMoYXR0cnM6IE9iamVjdCA9IHt9KSB7XG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIGF0dHJzKSB7XG4gICAgICAgICAgICB0aGlzLl9lbGVtZW50LnNldEF0dHJpYnV0ZShrZXksIGF0dHJzW2tleV0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHNldEF0dHIoa2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoa2V5LCB2YWx1ZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBnZXRBdHRyKGtleTogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9lbGVtZW50LmdldEF0dHJpYnV0ZShrZXkpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIGRvbSB7XG4gICAgLy8gcHJpdmF0ZSBzdGF0aWMgZGF0YSA9IGRhdGE7XG5cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBwYXJhbSB0YWduYW1lXG4gICAgICogQHBhcmFtIG9wdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9XG4gICAgICovXG4gICAgc3RhdGljIGNyZWF0ZSh0YWduYW1lOiBzdHJpbmcsIGF0dHJzOiBhbnkgPSB7fSwgY2xhc3Nlczogc3RyaW5nW10gPSBbXSwgdGV4dDogc3RyaW5nID0gJycsIGRhdGE6IGFueSA9IHt9KTogSFRNTEVsZW1lbnQge1xuICAgICAgICBsZXQgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnbmFtZSk7XG4gICAgICAgIHJldHVybiBkb20uYWRkKGVsZW1lbnQsIGF0dHJzLCBjbGFzc2VzLCB0ZXh0LCBkYXRhKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgYWRkKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBhdHRyczogYW55ID0ge30sIGNsYXNzZXM6IHN0cmluZ1tdID0gW10sIHRleHQ6IHN0cmluZyA9ICcnLCBkYXRhOiBhbnkgPSB7fSk6IEhUTUxFbGVtZW50IHtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gYXR0cnMpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKGtleSwgYXR0cnNba2V5XSk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGNvbnN0IG5hbWUgb2YgY2xhc3Nlcykge1xuICAgICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKG5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0ZXh0ICE9PSAnJykge1xuICAgICAgICAgICAgZWxlbWVudC50ZXh0Q29udGVudCA9IHRleHQ7XG4gICAgICAgIH1cbiAgICAgICAgLy8gZm9yIChjb25zdCBrZXkgaW4gZGF0YSkge1xuICAgICAgICAvLyAgICAgZWxlbWVudC5kYXRhc2V0W2tleV0gPSBkYXRhW2tleV07XG4gICAgICAgIC8vIH1cblxuICAgICAgICByZXR1cm4gZWxlbWVudDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBwYXJhbSBzZWxlY3RvclxuICAgICAqIEByZXR1cm5zIHtOb2RlTGlzdE9mPEVsZW1lbnQ+fVxuICAgICAqL1xuICAgIHN0YXRpYyBmaW5kKHNlbGVjdG9yOiBzdHJpbmcsIGNvbnRleHQ6IGFueSA9IGRvY3VtZW50KTogTm9kZUxpc3RPZjxFbGVtZW50PiB7XG4gICAgICAgIGlmIChjb250ZXh0IGluc3RhbmNlb2YgRG9jdW1lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBjb250ZXh0LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICAgICAgICB9IGVsc2UgaWYgKGNvbnRleHQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGNvbnRleHQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDsgLy8gVE9ETyByZXR1cm4gYSBibGFuayBOb2RlTGlzdE9mPEVsZW1lbnQ+XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBwYXJhbSBzZWxlY3RvclxuICAgICAqIEByZXR1cm5zIHtFbGVtZW50fG51bGx9XG4gICAgICovXG4gICAgc3RhdGljIGZpbmRGaXJzdChzZWxlY3Rvcjogc3RyaW5nLCBjb250ZXh0OiBhbnkgPSBkb2N1bWVudCk6IEVsZW1lbnQge1xuICAgICAgICBpZiAoY29udGV4dCBpbnN0YW5jZW9mIERvY3VtZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gY29udGV4dC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgICAgfSBlbHNlIGlmIChjb250ZXh0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBjb250ZXh0LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBwYXJhbSBlbGVtZW50XG4gICAgICogQHBhcmFtIG5hbWVcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiBhbiBlbGVtZW50IGNvbnRhaW5zIGEgY2xhc3MgbmFtZVxuICAgICAqL1xuICAgIHN0YXRpYyBoYXNDbGFzcyhlbGVtZW50OiBIVE1MRWxlbWVudCwgbmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiBlbGVtZW50ICE9PSBudWxsICYmIGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKG5hbWUpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBwYXJhbSBjb250ZXh0XG4gICAgICogQHBhcmFtIG5hbWVcbiAgICAgKiBAcmV0dXJucyB7RWxlbWVudH1cbiAgICAgKi9cbiAgICBzdGF0aWMgYWRkQ2xhc3MoY29udGV4dDogSFRNTEVsZW1lbnQsIG5hbWU6IHN0cmluZywgc2VsZWN0b3I6IHN0cmluZyA9IG51bGwpOiB2b2lkIHtcbiAgICAgICAgaWYgKHNlbGVjdG9yKSB7XG4gICAgICAgICAgICBsZXQgbGlzdDogTm9kZUxpc3RPZjxFbGVtZW50PiA9IGRvbS5maW5kKHNlbGVjdG9yLCBjb250ZXh0KTtcbiAgICAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGlzdFtpXS5jbGFzc0xpc3QuYWRkKG5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29udGV4dC5jbGFzc0xpc3QuYWRkKG5hbWUpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIGNvbnRleHRcbiAgICAgKiBAcGFyYW0gbmFtZVxuICAgICAqIEByZXR1cm5zIHtFbGVtZW50fVxuICAgICAqL1xuICAgIHN0YXRpYyByZW1vdmVDbGFzcyhjb250ZXh0OiBFbGVtZW50LCBuYW1lOiBzdHJpbmcsIHNlbGVjdG9yOiBzdHJpbmcgPSBudWxsKTogdm9pZCB7XG4gICAgICAgIGlmIChzZWxlY3Rvcikge1xuICAgICAgICAgICAgbGV0IGxpc3Q6IE5vZGVMaXN0T2Y8RWxlbWVudD4gPSBkb20uZmluZChzZWxlY3RvciwgY29udGV4dCk7XG4gICAgICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGxpc3RbaV0uY2xhc3NMaXN0LnJlbW92ZShuYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnRleHQuY2xhc3NMaXN0LnJlbW92ZShuYW1lKTtcbiAgICAgICAgfVxuICAgIH07XG5cblxuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZWxlbWVudFxuICAgICAqIEBwYXJhbSBuYW1lXG4gICAgICogQHJldHVybnMge0VsZW1lbnR9XG4gICAgICovXG4gICAgc3RhdGljIHJlbW92ZShzZWxlY3Rvcjogc3RyaW5nLCBjb250ZXh0OiBhbnkgPSBkb2N1bWVudCk6IE5vZGVMaXN0T2Y8RWxlbWVudD4gfCBudWxsIHtcbiAgICAgICAgbGV0IGxpc3Q6IE5vZGVMaXN0T2Y8RWxlbWVudD4gPSBkb20uZmluZChzZWxlY3RvciwgY29udGV4dCk7XG4gICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBsaXN0W2ldLnJlbW92ZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsaXN0O1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBwYXJhbSBlbGVtZW50XG4gICAgICogQHBhcmFtIG5hbWVcbiAgICAgKiBAcmV0dXJucyB7RWxlbWVudH1cbiAgICAgKi9cbiAgICBzdGF0aWMgdG9nZ2xlQ2xhc3MoZWxlbWVudDogRWxlbWVudCwgbmFtZTogc3RyaW5nKTogRWxlbWVudCB8IG51bGwge1xuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUobmFtZSk7XG4gICAgICAgIHJldHVybiBlbGVtZW50O1xuICAgIH1cblxuICAgIC8vXG4gICAgLy8gLyoqXG4gICAgLy8gICogUmV0dXJucyB3aXRoIGVsZW1lbnQgYmluZGVkIGRhdGEuXG4gICAgLy8gICogQHBhcmFtIGVsZW1lbnRcbiAgICAvLyAgKiBAcGFyYW0ga2V5XG4gICAgLy8gICogQHJldHVybnMge2FueX1cbiAgICAvLyAgKi9cbiAgICAvLyBzdGF0aWMgZ2V0RGF0YShlbGVtZW50OiBIVE1MRWxlbWVudCwga2V5OiBzdHJpbmcgPSBudWxsKTogYW55IHtcbiAgICAvLyAgICAgaWYgKCFkb20uaGFzRGF0YShlbGVtZW50LCBrZXkpKSB7XG4gICAgLy8gICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAvLyAgICAgfSBlbHNlIGlmIChrZXkgPT09IG51bGwpIHtcbiAgICAvLyAgICAgICAgIHJldHVybiBkb20uZGF0YS5nZXQoZWxlbWVudCk7XG4gICAgLy8gICAgIH0gZWxzZSB7XG4gICAgLy8gICAgICAgICByZXR1cm4gZG9tLmRhdGEuZ2V0KGVsZW1lbnQpW2tleV07XG4gICAgLy8gICAgIH1cbiAgICAvLyB9XG4gICAgLy9cbiAgICAvLyAvKipcbiAgICAvLyAgKiBCaW5kcyB3aXRoIGFuIGVsZW1lbnQgYSBkYXRhLlxuICAgIC8vICAqIEBwYXJhbSBlbGVtZW50XG4gICAgLy8gICogQHBhcmFtIGtleVxuICAgIC8vICAqIEBwYXJhbSB2YWx1ZVxuICAgIC8vICAqL1xuICAgIC8vIHN0YXRpYyBzZXREYXRhKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBrZXk6IHN0cmluZywgdmFsdWU6IGFueSk6IHZvaWQge1xuICAgIC8vICAgICBpZiAoIWRvbS5oYXNEYXRhKGVsZW1lbnQpKSB7XG4gICAgLy8gICAgICAgICBkb20uZGF0YS5zZXQoZWxlbWVudCwge2tleTogdmFsdWV9KTtcbiAgICAvLyAgICAgfSBlbHNlIHtcbiAgICAvLyAgICAgICAgIGxldCB0bXAgPSBkb20uZ2V0RGF0YShlbGVtZW50KTtcbiAgICAvLyAgICAgICAgIHRtcFtrZXldID0gdmFsdWU7XG4gICAgLy8gICAgICAgICBkb20uZGF0YS5zZXQoZWxlbWVudCwgdG1wKTtcbiAgICAvLyAgICAgfVxuICAgIC8vIH1cbiAgICAvL1xuICAgIC8vIC8qKlxuICAgIC8vICAqIENoZWNrcyBpZiB0aGUgZWxlbWVudCBpcyBiaW5kaW5nIHdpdGggYSBkYXRhXG4gICAgLy8gICogQHBhcmFtIGVsZW1lbnRcbiAgICAvLyAgKiBAcGFyYW0ga2V5XG4gICAgLy8gICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgLy8gICovXG4gICAgLy8gc3RhdGljIGhhc0RhdGEoZWxlbWVudDogSFRNTEVsZW1lbnQsIGtleTogc3RyaW5nID0gbnVsbCk6IGJvb2xlYW4ge1xuICAgIC8vICAgICBpZiAoIWRvbS5kYXRhLmhhcyhlbGVtZW50KSkge1xuICAgIC8vICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIC8vICAgICB9IGVsc2UgaWYgKGtleSA9PT0gbnVsbCkge1xuICAgIC8vICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgLy8gICAgIH0gZWxzZSB7XG4gICAgLy8gICAgICAgICByZXR1cm4gZG9tLmdldERhdGEoZWxlbWVudClba2V5XSAhPT0gbnVsbCA/IHRydWUgOiBmYWxzZTtcbiAgICAvLyAgICAgfVxuICAgIC8vIH1cbiAgICAvL1xuICAgIC8vIC8qKlxuICAgIC8vICAqIERlbGV0ZXMgd2l0aCBhbiBlbGVtZW50IGJpbmRpbmcgZGF0YVxuICAgIC8vICAqIEBwYXJhbSBlbGVtZW50XG4gICAgLy8gICogQHBhcmFtIGtleVxuICAgIC8vICAqL1xuICAgIC8vIHN0YXRpYyBkZWxldGVEYXRhKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBrZXk6IHN0cmluZyA9IG51bGwpOiB2b2lkIHtcbiAgICAvLyAgICAgaWYgKGRvbS5oYXNEYXRhKGVsZW1lbnQsIGtleSkpIHtcbiAgICAvLyAgICAgICAgIGlmIChrZXkgPT09IG51bGwpIHtcbiAgICAvLyAgICAgICAgICAgICBkb20uZGF0YS5kZWxldGUoZWxlbWVudCk7XG4gICAgLy8gICAgICAgICB9IGVsc2Uge1xuICAgIC8vICAgICAgICAgICAgIGxldCB0bXAgPSBkb20uZ2V0RGF0YShlbGVtZW50KTtcbiAgICAvLyAgICAgICAgICAgICBkZWxldGUgdG1wW2tleV07XG4gICAgLy8gICAgICAgICAgICAgZG9tLmRhdGEuc2V0KGVsZW1lbnQsIHRtcCk7XG4gICAgLy8gICAgICAgICB9XG4gICAgLy8gICAgIH1cbiAgICAvLyB9XG59IiwiaW1wb3J0ICogYXMgbWV0YWRvciBmcm9tICcuL09sNCc7XG5cbmRlY2xhcmUgdmFyIENvbmZpZ3VyYXRpb246IGFueTtcblxubGV0IGNvbnRleHQ6IGFueSA9IHdpbmRvdztcbmNvbnRleHQuc3BhdGlhbCA9IG1ldGFkb3I7XG5cbmV4cG9ydCBmdW5jdGlvbiBpbml0KCkge1xuXG4gICAgdmFyIG1ldGFkb3JNYXBDb25maWcgPSB7XG4gICAgICAgIG1hcDoge1xuICAgICAgICAgICAgdGFyZ2V0OiAnbWFwJyxcbiAgICAgICAgICAgIHNyczogW1wiRVBTRzo0MzI2XCIsIFwiRVBTRzozMTQ2NlwiLCBcIkVQU0c6MjU4MzJcIl1cbiAgICAgICAgfSxcbiAgICAgICAgdmlldzoge1xuICAgICAgICAgICAgcHJvamVjdGlvbjogQ29uZmlndXJhdGlvbi5zZXR0aW5nc1snbWFwX2NycyddLC8vJzogJzksNDksMTEsNTMnLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnXG4gICAgICAgICAgICBtYXhFeHRlbnQ6IENvbmZpZ3VyYXRpb24uc2V0dGluZ3NbJ21hcF9iYm94X21heCddLnNwbGl0KC8sXFxzPy8pLC8vWzUuOCwgNDcuMCwgMTUuMCwgNTUuMF0sIC8vIHByaW9yaXR5IGZvciBzY2FsZXMgb3IgZm9yIG1heEV4dGVudD9cbiAgICAgICAgICAgIHN0YXJ0RXh0ZW50OiBDb25maWd1cmF0aW9uLnNldHRpbmdzWydtYXBfYmJveF9zdGFydCddLnNwbGl0KC8sXFxzPy8pLFxuICAgICAgICAgICAgc2NhbGVzOiBbNTAwMCwgMjUwMDAsIDUwMDAwLCAxMDAwMDAsIDIwMDAwMCwgMjUwMDAwLCA1MDAwMDAsIDEwMDAwMDAsIDIwMDAwMDAsIDUwMDAwMDAsIDEwMDAwMDAwXS8vLCAyMDAwMDAwMCwgNTAwMDAwMDBdXG4gICAgICAgIH0sXG4gICAgICAgIHN0eWxlczoge1xuICAgICAgICAgICAgaGlnaGxpZ2h0OiB7XG4gICAgICAgICAgICAgICAgZmlsbDoge1xuICAgICAgICAgICAgICAgICAgICBjb2xvcjogJ3JnYmEoNjAsIDYwLCAyNTUsIDAuMSknXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzdHJva2U6IHtcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICdyZ2JhKDYwLCA2MCwgMjU1LCAxLjApJyxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2VhcmNoOiB7XG4gICAgICAgICAgICAgICAgZmlsbDoge1xuICAgICAgICAgICAgICAgICAgICBjb2xvcjogJ3JnYmEoMjU1LCA2MCwgNjAsIDAuMSknXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzdHJva2U6IHtcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICdyZ2JhKDI1NSwgNjAsIDYwLCAxLjApJyxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDJcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGltYWdlOiB7XG4gICAgICAgICAgICAgICAgICAgIGNpcmNsZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmFkaXVzOiA1LFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsbDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiAncmdiYSgyNTUsIDYwLCA2MCwgMC42KSdcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgc291cmNlOiBbXSxcbiAgICAgICAgLy8gYWRkIGFkZGl0aW9uYWwgcGFyYW1ldGVycyB3aXRoICsgXCJBRERJVElPTkFMXCJcbiAgICAgICAgcHJvajREZWZzOiB7XG4gICAgICAgICAgICBcIkVQU0c6NDMyNlwiOiBcIitwcm9qPWxvbmdsYXQgK2RhdHVtPVdHUzg0ICt1bml0cz1kZWdyZWVzICtub19kZWZzXCIgKyBcIiArYXhpcz1uZXVcIixcbiAgICAgICAgICAgIFwiRVBTRzo0MjU4XCI6IFwiK3Byb2o9bG9uZ2xhdCArZWxscHM9R1JTODAgK3Rvd2dzODQ9MCwwLDAsMCwwLDAsMCArbm9fZGVmc1wiICsgXCIgK3VuaXRzPWRlZ3JlZXMgK2F4aXM9bmV1XCIsXG4gICAgICAgICAgICBcIkVQU0c6MzE0NjZcIjogXCIrcHJvaj10bWVyYyArbGF0XzA9MCArbG9uXzA9NiAraz0xICt4XzA9MjUwMDAwMCAreV8wPTAgK2VsbHBzPWJlc3NlbCArdG93Z3M4ND01OTguMSw3My43LDQxOC4yLDAuMjAyLDAuMDQ1LC0yLjQ1NSw2LjcgK3VuaXRzPW0gK25vX2RlZnNcIiArIFwiICtheGlzPW5ldVwiLFxuICAgICAgICAgICAgXCJFUFNHOjMxNDY3XCI6IFwiK3Byb2o9dG1lcmMgK2xhdF8wPTAgK2xvbl8wPTkgK2s9MSAreF8wPTM1MDAwMDAgK3lfMD0wICtlbGxwcz1iZXNzZWwgK3Rvd2dzODQ9NTk4LjEsNzMuNyw0MTguMiwwLjIwMiwwLjA0NSwtMi40NTUsNi43ICt1bml0cz1tICtub19kZWZzXCIgKyBcIiArYXhpcz1uZXVcIixcbiAgICAgICAgICAgIC8vIFwiRVBTRzozMTQ2OFwiOiBcIitwcm9qPXRtZXJjICtsYXRfMD0wICtsb25fMD0xMiAraz0xICt4XzA9NDUwMDAwMCAreV8wPTAgK2VsbHBzPWJlc3NlbCArdG93Z3M4ND01OTguMSw3My43LDQxOC4yLDAuMjAyLDAuMDQ1LC0yLjQ1NSw2LjcgK3VuaXRzPW0gK25vX2RlZnNcIiArIFwiICtheGlzPW5ldVwiLFxuICAgICAgICAgICAgLy8gXCJFUFNHOjMxNDY5XCI6IFwiK3Byb2o9dG1lcmMgK2xhdF8wPTAgK2xvbl8wPTE1ICtrPTEgK3hfMD01NTAwMDAwICt5XzA9MCArZWxscHM9YmVzc2VsICt0b3dnczg0PTU5OC4xLDczLjcsNDE4LjIsMC4yMDIsMC4wNDUsLTIuNDU1LDYuNyArdW5pdHM9bSArbm9fZGVmc1wiICsgXCIgK2F4aXM9bmV1XCIsXG4gICAgICAgICAgICBcIkVQU0c6MjU4MzJcIjogXCIrcHJvaj11dG0gK3pvbmU9MzIgK2VsbHBzPUdSUzgwICt0b3dnczg0PTAsMCwwLDAsMCwwLDAgK3VuaXRzPW0gK25vX2RlZnNcIixcbiAgICAgICAgICAgIC8vIFwiRVBTRzoyNTgzM1wiOiBcIitwcm9qPXV0bSArem9uZT0zMyArZWxscHM9R1JTODAgK3Rvd2dzODQ9MCwwLDAsMCwwLDAsMCArdW5pdHM9bSArbm9fZGVmc1wiXG4gICAgICAgIH0sXG4gICAgICAgIGNvbXBvbmVudDogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNsYXNzOiAnJyxcbiAgICAgICAgICAgICAgICBzZWxlY3RvcjogXCJcIlxuICAgICAgICAgICAgfVxuICAgICAgICBdXG4gICAgfTtcblxuICAgIC8vIGNvbnNvbGUubG9nKENvbmZpZ3VyYXRpb24pO1xuICAgIGZvciAoY29uc3Qga2V5IGluIENvbmZpZ3VyYXRpb24uY29uZmlnLm1hcF9iYWNrZ3JvdW5kKSB7XG4gICAgICAgIGxldCB3bXMgPSBDb25maWd1cmF0aW9uLmNvbmZpZy5tYXBfYmFja2dyb3VuZFtrZXldO1xuICAgICAgICBsZXQgbGF5ZXJzID0gW107XG4gICAgICAgIGZvciAoY29uc3QgbCBpbiB3bXMubGF5ZXJzKSB7XG4gICAgICAgICAgICBsYXllcnMucHVzaCh3bXMubGF5ZXJzW2xdKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBjb25zb2xlLmxvZyh3bXMpO1xuICAgICAgICBtZXRhZG9yTWFwQ29uZmlnLnNvdXJjZS5wdXNoKHtcbiAgICAgICAgICAgICd0eXBlJzogJ1dNUycsXG4gICAgICAgICAgICAndXJsJzogd21zLnVybCxcbiAgICAgICAgICAgICd0aXRsZSc6IHdtcy50aXRsZSxcbiAgICAgICAgICAgICdvcGFjaXR5Jzogd21zLm9wYWNpdHksXG4gICAgICAgICAgICAndmlzaWJsZSc6IHdtcy52aXNpYmxlLFxuICAgICAgICAgICAgJ3BhcmFtcyc6IHtcbiAgICAgICAgICAgICAgICAnTEFZRVJTJzogbGF5ZXJzLmpvaW4oXCIsXCIpLFxuICAgICAgICAgICAgICAgICdWRVJTSU9OJzogd21zLnZlcnNpb24sXG4gICAgICAgICAgICAgICAgJ0ZPUk1BVCc6IHdtcy5mb3JtYXRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8vIGNvbnNvbGUubG9nKG1ldGFkb3JNYXBDb25maWcpO1xuICAgIGxldCBtZXRhZG9yTWFwID0gbWV0YWRvci5PbDRNYXAuY3JlYXRlKG1ldGFkb3JNYXBDb25maWcpO1xuICAgIC8vIG1ldGFkb3JNYXAuaW5pdExheWVydHJlZSgpO1xuICAgIGNvbnRleHQuc3BhdGlhbFsnbWFwJ10gPSBtZXRhZG9yTWFwO1xuICAgIC8vIG1ldGFkb3JbJ21ldGFkb3JNYXAnXSA9IG1ldGFkb3JNYXA7XG4gICAgLy8gbWV0YWRvclsnZ2VvbUxvYWRlciddID0gbmV3IG1ldGFkb3IuR2VvbUxvYWRlcihtZXRhZG9yTWFwLCA8SFRNTEZvcm1FbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNmaWxlLXVwbG9hZC1mb3JtJykpO1xufVxuaW5pdCgpOyJdfQ==
