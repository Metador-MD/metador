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
        this.button = dom_1.dom.create("button", { type: "button", title: "Ausschnitt aufziehen" }, []);
        this.button.appendChild(dom_1.dom.create("span", {}, ["icon-map"]));
        this.button.addEventListener('click', this.buttonClick.bind(this), false);
        this.dragzoom.on('boxend', this.deactivate.bind(this));
        var wrapper = dom_1.dom.create("div", {}, ["drag-zoom", "ol-unselectable", "ol-control"]);
        wrapper.appendChild(this.button);
        this.olMap.addControl(new ol.control.Control({
            element: wrapper
        }));
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
        dom_1.dom.addClass(this.button, 'success');
        this.olMap.addInteraction(this.dragzoom);
    };
    DragZoom.prototype.deactivate = function () {
        dom_1.dom.removeClass(this.button, 'success');
        this.olMap.removeInteraction(this.dragzoom);
    };
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
                        if (fi.tooltipElm) {
                            fi.showTooltip();
                        }
                    }
                }, 5);
                return true;
            }
        });
        this.select.on('select', function (e) {
            if (e.target.getFeatures().getLength() === 0) {
                if (fi.tooltipElm) {
                    fi.showTooltip();
                }
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
            if (this.tooltipElm) {
                this.showTooltip();
            }
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
        if (this.tooltipElm) {
            dom_1.dom.addClass(this.tooltipElm, 'hidden');
        }
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
    LayerTree.prototype.findLayerLabel = function (layer) {
        return dom_1.dom.findFirst('#' + layer.get(Ol4_1.UUID) + ' > label');
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
        var label = this.findLayerLabel(layer);
        if (disable) {
            dom_1.dom.addClass(item, 'disabled');
            checkboxVisible.setAttribute('disabled', 'true');
            selectOpacity.setAttribute('disabled', 'true');
            dom_1.dom.add(label, { 'title': 'Der Dienst ist nicht erreichbar!' });
            if (LayerTree.useSortable) {
                this.removeDraggable(item);
            }
        }
        else {
            dom_1.dom.removeClass(item, 'disabled');
            checkboxVisible.removeAttribute('disabled');
            selectOpacity.removeAttribute('disabled');
            dom_1.dom.add(label, { 'title': layer.get(Ol4_1.TITLE) });
            if (LayerTree.useSortable) {
                this.addDraggable(item);
            }
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
        var layerNode = dom_1.dom.create('li', { 'id': layer.get(Ol4_1.UUID) });
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
        dom_1.dom.add(layer, { 'draggable': 'true' }, ['draggable', '-js-draggable']);
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
        dom_1.dom.delete(layer, ['draggable'], ['draggable', '-js-draggable']);
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
        var icon = document.createElement('span');
        icon.className = "icon-earth";
        this.olMap.addControl(new ol.control.ZoomToExtent({
            extent: this.maxExtent.getExtent(proj),
            label: icon
        }));
        this.olMap.addInteraction(new ol.interaction.DragZoom());
        this.olMap.addControl(new ol.control.MousePosition());
        var mapsize = this.olMap.getSize();
        if (mapsize[0] !== 0 && mapsize[1]) {
            this.zoomToExtent(this.startExtent.getPolygonForExtent(proj));
        }
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
        console.log(geometry, this.olMap.getSize());
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
        this.zoomToExtent(this.startExtent.getPolygonForExtent(this.olMap.getView().getProjection()));
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
            || maxextent.intersectsCoordinate(multiPoint.getPoint(1).getCoordinates())) {
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
    dom.delete = function (element, attrs, classes, text, data) {
        if (attrs === void 0) { attrs = []; }
        if (classes === void 0) { classes = []; }
        if (text === void 0) { text = false; }
        if (data === void 0) { data = {}; }
        for (var _i = 0, attrs_1 = attrs; _i < attrs_1.length; _i++) {
            var key = attrs_1[_i];
            element.removeAttribute(key);
        }
        for (var _a = 0, classes_2 = classes; _a < classes_2.length; _a++) {
            var cl = classes_2[_a];
            dom.removeClass(element, cl);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvUGx1Z2lucy9XaGVyZUdyb3VwL01hcEJ1bmRsZS9SZXNvdXJjZXMvdHMvRHJhZ1pvb20udHMiLCJzcmMvUGx1Z2lucy9XaGVyZUdyb3VwL01hcEJ1bmRsZS9SZXNvdXJjZXMvdHMvRmVhdHVyZUluZm8udHMiLCJzcmMvUGx1Z2lucy9XaGVyZUdyb3VwL01hcEJ1bmRsZS9SZXNvdXJjZXMvdHMvTGF5ZXJUcmVlLnRzIiwic3JjL1BsdWdpbnMvV2hlcmVHcm91cC9NYXBCdW5kbGUvUmVzb3VyY2VzL3RzL09sNC50cyIsInNyYy9QbHVnaW5zL1doZXJlR3JvdXAvTWFwQnVuZGxlL1Jlc291cmNlcy90cy9PbDRTb3VyY2UudHMiLCJzcmMvUGx1Z2lucy9XaGVyZUdyb3VwL01hcEJ1bmRsZS9SZXNvdXJjZXMvdHMvZG9tLnRzIiwic3JjL1BsdWdpbnMvV2hlcmVHcm91cC9NYXBCdW5kbGUvUmVzb3VyY2VzL3RzL21hcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsNkJBQTBCO0FBRTFCO0lBS0ksa0JBQVksR0FBVztRQUNuQixJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQztRQUNqQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksRUFBRSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUM7WUFDeEMsU0FBUyxFQUFFO2dCQUNQLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDaEIsQ0FBQztTQUNKLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxNQUFNLEdBQXNCLFNBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsc0JBQXNCLEVBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMzRyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxTQUFHLENBQUMsTUFB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SUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUN6QixNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMvQixDQUFDO1FBRUQsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztZQUN6QixNQUFNLEVBQUUsS0FBSztZQUNiLEtBQUssRUFBRSxHQUFHLENBQUMsR0FBRztZQUNkLE9BQU8sRUFBRSxHQUFHLENBQUMsS0FBSztZQUNsQixTQUFTLEVBQUUsR0FBRyxDQUFDLE9BQU87WUFDdEIsU0FBUyxFQUFFLEdBQUcsQ0FBQyxPQUFPO1lBQ3RCLFFBQVEsRUFBRTtnQkFDTixRQUFRLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7Z0JBQzFCLFNBQVMsRUFBRSxHQUFHLENBQUMsT0FBTztnQkFDdEIsUUFBUSxFQUFFLEdBQUcsQ0FBQyxNQUFNO2FBQ3ZCO1NBQ0osQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFFekQsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxVQUFVLENBQUM7QUFHeEMsQ0FBQztBQXhGRCxvQkF3RkM7QUFDRCxJQUFJLEVBQUUsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQge2RvbX0gZnJvbSAnLi9kb20nO1xuXG5leHBvcnQgY2xhc3MgRHJhZ1pvb20ge1xuICAgIHByaXZhdGUgZHJhZ3pvb206IG9sLmludGVyYWN0aW9uLkRyYWdab29tO1xuICAgIHByaXZhdGUgb2xNYXA6IG9sLk1hcDtcbiAgICBwcml2YXRlIGJ1dHRvbjogSFRNTEJ1dHRvbkVsZW1lbnQ7XG5cbiAgICBjb25zdHJ1Y3RvcihtYXA6IG9sLk1hcCkge1xuICAgICAgICB0aGlzLm9sTWFwID0gbWFwO1xuICAgICAgICB0aGlzLmRyYWd6b29tID0gbmV3IG9sLmludGVyYWN0aW9uLkRyYWdab29tKHtcbiAgICAgICAgICAgIGNvbmRpdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5idXR0b24gPSA8SFRNTEJ1dHRvbkVsZW1lbnQ+ZG9tLmNyZWF0ZShcImJ1dHRvblwiLCB7dHlwZTogXCJidXR0b25cIiwgdGl0bGU6IFwiQXVzc2Nobml0dCBhdWZ6aWVoZW5cIn0sIFtdKTtcbiAgICAgICAgdGhpcy5idXR0b24uYXBwZW5kQ2hpbGQoZG9tLmNyZWF0ZShcInNwYW5cIiwge30sIFtcImljb24tbWFwXCJdKSk7XG4gICAgICAgIHRoaXMuYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5idXR0b25DbGljay5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgICAgIHRoaXMuZHJhZ3pvb20ub24oJ2JveGVuZCcsIHRoaXMuZGVhY3RpdmF0ZS5iaW5kKHRoaXMpKTtcbiAgICAgICAgY29uc3Qgd3JhcHBlciA9IGRvbS5jcmVhdGUoXCJkaXZcIiwge30sIFtcImRyYWctem9vbVwiLCBcIm9sLXVuc2VsZWN0YWJsZVwiLCBcIm9sLWNvbnRyb2xcIl0pO1xuICAgICAgICB3cmFwcGVyLmFwcGVuZENoaWxkKHRoaXMuYnV0dG9uKTtcbiAgICAgICAgdGhpcy5vbE1hcC5hZGRDb250cm9sKFxuICAgICAgICAgICAgbmV3IG9sLmNvbnRyb2wuQ29udHJvbChcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQ6IHdyYXBwZXJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBidXR0b25DbGljayhlKSB7XG4gICAgICAgIGlmICghZG9tLmhhc0NsYXNzKGUudGFyZ2V0LCAnc3VjY2VzcycpKSB7XG4gICAgICAgICAgICB0aGlzLmFjdGl2YXRlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmRlYWN0aXZhdGUoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYWN0aXZhdGUoKSB7XG4gICAgICAgIGRvbS5hZGRDbGFzcyh0aGlzLmJ1dHRvbiwgJ3N1Y2Nlc3MnKTtcbiAgICAgICAgdGhpcy5vbE1hcC5hZGRJbnRlcmFjdGlvbih0aGlzLmRyYWd6b29tKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGRlYWN0aXZhdGUoKSB7XG4gICAgICAgIGRvbS5yZW1vdmVDbGFzcyh0aGlzLmJ1dHRvbiwgJ3N1Y2Nlc3MnKTtcbiAgICAgICAgdGhpcy5vbE1hcC5yZW1vdmVJbnRlcmFjdGlvbih0aGlzLmRyYWd6b29tKTtcbiAgICB9XG59IiwiaW1wb3J0IHtUSVRMRSwgVVVJRH0gZnJvbSBcIi4vT2w0XCI7XG5pbXBvcnQge2RvbX0gZnJvbSAnLi9kb20nO1xuXG5leHBvcnQgY2xhc3MgRmVhdHVyZUluZm8ge1xuICAgIHByaXZhdGUgc3RhdGljIGl0ZW1UYWdOYW1lOiBzdHJpbmcgPSAnc3Bhbic7XG4gICAgcHJpdmF0ZSBvbE1hcDogb2wuTWFwO1xuICAgIHByaXZhdGUgdG9vbHRpcDogb2wuT3ZlcmxheTtcbiAgICBwcml2YXRlIHRvb2x0aXBDb29yZDogb2wuQ29vcmRpbmF0ZTtcbiAgICBwcml2YXRlIHRvb2x0aXBFbG06IEhUTUxFbGVtZW50O1xuICAgIHByaXZhdGUgbGF5ZXI6IG9sLmxheWVyLlZlY3RvcjtcbiAgICBwcml2YXRlIGNhbGxiYWNrU2VsZWN0OiBGdW5jdGlvbjtcbiAgICBwcml2YXRlIGNhbGxiYWNrVW5TZWxlY3Q6IEZ1bmN0aW9uO1xuICAgIHByaXZhdGUgY2FsbGJhY2tVblNlbGVjdEFsbDogRnVuY3Rpb247XG4gICAgcHJpdmF0ZSBzZWxlY3Q6IG9sLmludGVyYWN0aW9uLlNlbGVjdDtcblxuICAgIGNvbnN0cnVjdG9yKG1hcDogb2wuTWFwLCBsYXllcjogb2wubGF5ZXIuVmVjdG9yID0gbnVsbCkge1xuICAgICAgICB0aGlzLm9sTWFwID0gbWFwO1xuICAgICAgICB0aGlzLmxheWVyID0gbGF5ZXI7XG4gICAgICAgIHRoaXMuaW5pdFNlbGVjdCgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgaW5pdFNlbGVjdCgpIHtcbiAgICAgICAgY29uc3QgZmkgPSB0aGlzO1xuICAgICAgICBsZXQgdGltZXN0YW1wOiBudW1iZXIgPSAwO1xuICAgICAgICB0aGlzLnNlbGVjdCA9IG5ldyBvbC5pbnRlcmFjdGlvbi5TZWxlY3Qoe1xuICAgICAgICAgICAgbXVsdGk6IHRydWUsXG4gICAgICAgICAgICBsYXllcnM6IFt0aGlzLmxheWVyXSxcbiAgICAgICAgICAgIGZpbHRlcjogZnVuY3Rpb24gKGZlYXR1cmU6IG9sLkZlYXR1cmUpIHtcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXAgPSBEYXRlLm5vdygpICsgNTtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKERhdGUubm93KCkgPj0gdGltZXN0YW1wKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmkudG9vbHRpcEVsbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpLnNob3dUb29sdGlwKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCA1KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuc2VsZWN0Lm9uKCdzZWxlY3QnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgaWYgKGUudGFyZ2V0LmdldEZlYXR1cmVzKCkuZ2V0TGVuZ3RoKCkgPT09IDApIHtcbiAgICAgICAgICAgICAgICBpZiAoZmkudG9vbHRpcEVsbSkge1xuICAgICAgICAgICAgICAgICAgICBmaS5zaG93VG9vbHRpcCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmVzZXQoKSB7XG4gICAgICAgIGlmICh0aGlzLnNlbGVjdCkge1xuICAgICAgICAgICAgdGhpcy5zZWxlY3QuZ2V0RmVhdHVyZXMoKS5jbGVhcigpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnRvb2x0aXBFbG0pIHtcbiAgICAgICAgICAgIGRvbS5hZGRDbGFzcyh0aGlzLnRvb2x0aXBFbG0sICdoaWRkZW4nKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5jYWxsYmFja1VuU2VsZWN0QWxsKSB7XG4gICAgICAgICAgICB0aGlzLmNhbGxiYWNrVW5TZWxlY3RBbGwoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNlbGVjdEZlYXR1cmVzKHV1aWRzOiBzdHJpbmdbXSkge1xuICAgICAgICBjb25zdCBmaSA9IHRoaXM7XG4gICAgICAgIGlmICh0aGlzLmxheWVyICYmIHRoaXMuc2VsZWN0KSB7XG4gICAgICAgICAgICB0aGlzLnJlc2V0KCk7XG4gICAgICAgICAgICB0aGlzLmxheWVyLmdldFNvdXJjZSgpLmZvckVhY2hGZWF0dXJlKFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChmZWF0dXJlOiBvbC5GZWF0dXJlKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgdXVpZCBvZiB1dWlkcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZlYXR1cmUuZ2V0KFVVSUQpID09PSB1dWlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmkuc2VsZWN0LmdldEZlYXR1cmVzKCkucHVzaChmZWF0dXJlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIGlmICh0aGlzLnRvb2x0aXBFbG0pIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dUb29sdGlwKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhY3RpdmF0ZSh0b29sdGlwRWxtOiBIVE1MRWxlbWVudCwgY2FsbGJhY2tTZWxlY3Q6IEZ1bmN0aW9uLCBjYWxsYmFja1VuU2VsZWN0OiBGdW5jdGlvbiwgY2FsbGJhY2tVblNlbGVjdEFsbDogRnVuY3Rpb24pIHtcbiAgICAgICAgdGhpcy5jYWxsYmFja1NlbGVjdCA9IGNhbGxiYWNrU2VsZWN0O1xuICAgICAgICB0aGlzLmNhbGxiYWNrVW5TZWxlY3QgPSBjYWxsYmFja1VuU2VsZWN0O1xuICAgICAgICB0aGlzLmNhbGxiYWNrVW5TZWxlY3RBbGwgPSBjYWxsYmFja1VuU2VsZWN0QWxsO1xuICAgICAgICB0aGlzLm9sTWFwLm9uKCdjbGljaycsIHRoaXMuc2V0VG9vbHRpcFBvc2l0aW9uLCB0aGlzKTtcbiAgICAgICAgdGhpcy50b29sdGlwRWxtID0gdG9vbHRpcEVsbTtcbiAgICAgICAgdGhpcy50b29sdGlwRWxtLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5pdGVtQ2xpY2suYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgICAgICB0aGlzLnRvb2x0aXAgPSBuZXcgb2wuT3ZlcmxheSh7XG4gICAgICAgICAgICBlbGVtZW50OiB0aGlzLnRvb2x0aXBFbG0sXG4gICAgICAgICAgICBvZmZzZXQ6IFswLCAtNl0sXG4gICAgICAgICAgICBwb3NpdGlvbmluZzogJ2JvdHRvbS1jZW50ZXInXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLm9sTWFwLmFkZE92ZXJsYXkodGhpcy50b29sdGlwKTtcblxuICAgICAgICB0aGlzLnNlbGVjdC5nZXRGZWF0dXJlcygpLmNsZWFyKCk7XG4gICAgICAgIHRoaXMub2xNYXAuYWRkSW50ZXJhY3Rpb24odGhpcy5zZWxlY3QpO1xuICAgIH1cblxuICAgIGRlYWN0aXZhdGUoKSB7XG4gICAgICAgIHRoaXMuc2VsZWN0LmdldEZlYXR1cmVzKCkuY2xlYXIoKTtcbiAgICAgICAgdGhpcy5vbE1hcC5yZW1vdmVJbnRlcmFjdGlvbih0aGlzLnNlbGVjdCk7XG4gICAgICAgIC8vIHRoaXMuc2VsZWN0ID0gbnVsbDtcbiAgICAgICAgdGhpcy5jYWxsYmFja1VuU2VsZWN0QWxsKCk7XG4gICAgICAgIHRoaXMuY2FsbGJhY2tTZWxlY3QgPSBudWxsO1xuICAgICAgICB0aGlzLmNhbGxiYWNrVW5TZWxlY3QgPSBudWxsO1xuICAgICAgICB0aGlzLmNhbGxiYWNrVW5TZWxlY3RBbGwgPSBudWxsO1xuICAgICAgICB0aGlzLnRvb2x0aXBFbG0ucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLml0ZW1DbGljay5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy50b29sdGlwRWxtLnJlbW92ZSgpO1xuICAgICAgICB0aGlzLm9sTWFwLnJlbW92ZU92ZXJsYXkodGhpcy50b29sdGlwKTtcbiAgICAgICAgdGhpcy5vbE1hcC51bignY2xpY2snLCB0aGlzLnNldFRvb2x0aXBQb3NpdGlvbiwgdGhpcyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpdGVtQ2xpY2soZTogRXZlbnQpIHtcbiAgICAgICAgaWYgKCg8YW55PmUudGFyZ2V0KS50YWdOYW1lID09PSBGZWF0dXJlSW5mby5pdGVtVGFnTmFtZS50b1VwcGVyQ2FzZSgpKSB7XG4gICAgICAgICAgICBsZXQgdGFnID0gKDxIVE1MRWxlbWVudD5lLnRhcmdldCk7XG4gICAgICAgICAgICBpZiAoIWRvbS5oYXNDbGFzcyh0YWcsICctanMtdG9vbHRpcC1pdGVtJykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdC5nZXRGZWF0dXJlcygpLmNsZWFyKCk7XG4gICAgICAgICAgICAgICAgdGhpcy51blNlbGVjdERhdGFzZXQoKTtcbiAgICAgICAgICAgICAgICBkb20uYWRkQ2xhc3ModGhpcy50b29sdGlwRWxtLCAnaGlkZGVuJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRvbS5yZW1vdmVDbGFzcyh0YWcucGFyZW50RWxlbWVudCwgJ3NlbGVjdGVkJywgJ3NwYW4nKTtcbiAgICAgICAgICAgICAgICBkb20uYWRkQ2xhc3ModGFnLCAnc2VsZWN0ZWQnKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdC5nZXRGZWF0dXJlcygpLmNsZWFyKCk7XG4gICAgICAgICAgICAgICAgdGhpcy51blNlbGVjdERhdGFzZXQoKTtcbiAgICAgICAgICAgICAgICBjb25zdCBmZWF0dXJlID0gdGhpcy5sYXllci5nZXRTb3VyY2UoKS5nZXRGZWF0dXJlQnlJZCh0YWcuZ2V0QXR0cmlidXRlKCdkYXRhLWlkJykpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0LmdldEZlYXR1cmVzKCkucHVzaChmZWF0dXJlKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdERhdGFzZXQoZmVhdHVyZS5nZXQoVVVJRCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgc2V0VG9vbHRpcFBvc2l0aW9uKGVuOiBvbC5NYXBCcm93c2VyRXZlbnQpIHtcbiAgICAgICAgdGhpcy50b29sdGlwQ29vcmQgPSBlbi5jb29yZGluYXRlO1xuICAgIH1cblxuICAgIHByaXZhdGUgaGlkZVRvb2x0aXAoKSB7XG4gICAgICAgIGlmICh0aGlzLnRvb2x0aXBFbG0pIHtcbiAgICAgICAgICAgIGRvbS5hZGRDbGFzcyh0aGlzLnRvb2x0aXBFbG0sICdoaWRkZW4nKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgc2hvd1Rvb2x0aXAoKSB7XG4gICAgICAgIGNvbnN0IGZlYXR1cmVzOiBvbC5GZWF0dXJlW10gPSB0aGlzLnNlbGVjdC5nZXRGZWF0dXJlcygpLmdldEFycmF5KCk7XG4gICAgICAgIGRvbS5yZW1vdmUoJy4tanMtdG9vbHRpcC1pdGVtJywgdGhpcy50b29sdGlwRWxtKTtcbiAgICAgICAgdGhpcy51blNlbGVjdERhdGFzZXQoKTtcbiAgICAgICAgaWYgKGZlYXR1cmVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgdGhpcy5oaWRlVG9vbHRpcCgpO1xuICAgICAgICB9IGVsc2UgaWYgKGZlYXR1cmVzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgdGhpcy5oaWRlVG9vbHRpcCgpO1xuICAgICAgICAgICAgdGhpcy5zZWxlY3REYXRhc2V0KGZlYXR1cmVzWzBdLmdldChVVUlEKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3IgKGxldCBmZWF0dXJlIG9mIGZlYXR1cmVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFmZWF0dXJlLmdldElkKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgZmVhdHVyZS5zZXRJZChmZWF0dXJlLmdldChVVUlEKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxldCBhdHRycyA9IHtcbiAgICAgICAgICAgICAgICAgICAgXCJ0aXRsZVwiOiBmZWF0dXJlLmdldChUSVRMRSksXG4gICAgICAgICAgICAgICAgICAgIFwiZGF0YS11dWlkXCI6IGZlYXR1cmUuZ2V0KFVVSUQpLFxuICAgICAgICAgICAgICAgICAgICBcImRhdGEtaWRcIjogZmVhdHVyZS5nZXRJZCgpXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB0aGlzLnRvb2x0aXBFbG0uYXBwZW5kQ2hpbGQoXG4gICAgICAgICAgICAgICAgICAgIGRvbS5jcmVhdGUoRmVhdHVyZUluZm8uaXRlbVRhZ05hbWUsIGF0dHJzLCBbJy1qcy10b29sdGlwLWl0ZW0nLCAnc2VsZWN0ZWQnXSwgZmVhdHVyZS5nZXQoVElUTEUpKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3REYXRhc2V0KGZlYXR1cmUuZ2V0KFVVSUQpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRvbS5yZW1vdmVDbGFzcyh0aGlzLnRvb2x0aXBFbG0sICdoaWRkZW4nKTtcbiAgICAgICAgICAgIHRoaXMudG9vbHRpcC5zZXRQb3NpdGlvbih0aGlzLnRvb2x0aXBDb29yZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHNlbGVjdERhdGFzZXQoc2VsZWN0b3I6IHN0cmluZykge1xuICAgICAgICBpZiAodGhpcy5jYWxsYmFja1NlbGVjdCkge1xuICAgICAgICAgICAgdGhpcy5jYWxsYmFja1NlbGVjdChzZWxlY3Rvcik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHVuU2VsZWN0RGF0YXNldChzZWxlY3Rvcjogc3RyaW5nID0gbnVsbCkge1xuICAgICAgICBpZiAoc2VsZWN0b3IgIT09IG51bGwgJiYgdGhpcy5jYWxsYmFja1VuU2VsZWN0KSB7XG4gICAgICAgICAgICB0aGlzLmNhbGxiYWNrVW5TZWxlY3Qoc2VsZWN0b3IpO1xuICAgICAgICB9IGVsc2UgaWYgKHNlbGVjdG9yID09PSBudWxsICYmIHRoaXMuY2FsbGJhY2tVblNlbGVjdEFsbCkge1xuICAgICAgICAgICAgdGhpcy5jYWxsYmFja1VuU2VsZWN0QWxsKCk7XG4gICAgICAgIH1cbiAgICB9XG59IiwiaW1wb3J0IHtkb219IGZyb20gJy4vZG9tJztcbmltcG9ydCB7T2w0TWFwLCBUSVRMRSwgVVVJRH0gZnJvbSBcIi4vT2w0XCI7XG5cbi8vIGltcG9ydCAqIGFzICQgZnJvbSAnanF1ZXJ5JztcblxuZXhwb3J0IGNsYXNzIExheWVyVHJlZSB7XG4gICAgcHJpdmF0ZSBzdGF0aWMgX2luc3RhbmNlOiBMYXllclRyZWU7XG4gICAgcHJpdmF0ZSBzdGF0aWMgbWF4bGVuZ3RoOiBudW1iZXIgPSAxNjtcbiAgICBwcml2YXRlIHN0YXRpYyB0cmVlc2VsZWN0b3I6IHN0cmluZyA9ICcuLWpzLW1hcC1sYXllcnRyZWUgdWwubGF5ZXItdHJlZS1saXN0JztcbiAgICBwcml2YXRlIHN0YXRpYyBkdW1teXNlbGVjdG9yOiBzdHJpbmcgPSAnLi1qcy1kdW1teS1sYXllcic7XG4gICAgcHJpdmF0ZSBzdGF0aWMgdXNlT3BhY2l0eTogYm9vbGVhbiA9IHRydWU7XG4gICAgcHJpdmF0ZSBzdGF0aWMgdXNlVmlzaWJsZTogYm9vbGVhbiA9IHRydWU7XG4gICAgcHJpdmF0ZSBzdGF0aWMgdXNlU29ydGFibGU6IGJvb2xlYW4gPSB0cnVlO1xuICAgIHByaXZhdGUgc3RhdGljIHNob3dTdGF0dXM6IGJvb2xlYW4gPSB0cnVlO1xuICAgIHByaXZhdGUgb2w0TWFwOiBPbDRNYXA7XG4gICAgcHJpdmF0ZSB0cmVlOiBIVE1MRWxlbWVudDtcbiAgICBwcml2YXRlIGN1cnJlbnRMYXllciA9IG51bGw7XG4gICAgcHJpdmF0ZSBvbGRQb3NpdGlvbiA9IDA7XG5cbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKG9sNE1hcDogT2w0TWFwKSB7XG4gICAgICAgIHRoaXMub2w0TWFwID0gb2w0TWFwO1xuICAgICAgICB0aGlzLnRyZWUgPSA8SFRNTEVsZW1lbnQ+ZG9tLmZpbmRGaXJzdChMYXllclRyZWUudHJlZXNlbGVjdG9yKTtcbiAgICAgICAgaWYgKExheWVyVHJlZS51c2VTb3J0YWJsZSkge1xuICAgICAgICAgICAgbGV0IGR1bW15ID0gZG9tLmZpbmRGaXJzdChMYXllclRyZWUuZHVtbXlzZWxlY3RvciwgdGhpcy50cmVlKTtcbiAgICAgICAgICAgIHRoaXMuYWRkRHJhZ2dhYmxlKDxIVE1MRWxlbWVudD5kdW1teSwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgY3JlYXRlKG9sNE1hcDogT2w0TWFwKTogTGF5ZXJUcmVlIHtcbiAgICAgICAgaWYgKCFMYXllclRyZWUuX2luc3RhbmNlKSB7Ly8gc2luZ2xldG9uXG4gICAgICAgICAgICBMYXllclRyZWUuX2luc3RhbmNlID0gbmV3IExheWVyVHJlZShvbDRNYXApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBMYXllclRyZWUuX2luc3RhbmNlO1xuICAgIH1cblxuICAgIHByaXZhdGUgZmluZExheWVySXRlbShsYXllcjogb2wubGF5ZXIuQmFzZSk6IEhUTUxFbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIDxIVE1MRWxlbWVudD5kb20uZmluZEZpcnN0KCcjJyArIGxheWVyLmdldChVVUlEKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBmaW5kTGF5ZXJMYWJlbChsYXllcjogb2wubGF5ZXIuQmFzZSk6IEhUTUxFbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIDxIVE1MRWxlbWVudD5kb20uZmluZEZpcnN0KCcjJyArIGxheWVyLmdldChVVUlEKSArICcgPiBsYWJlbCcpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZmluZExheWVyVmlzaWJsZShsYXllcjogb2wubGF5ZXIuQmFzZSk6IEhUTUxGb3JtRWxlbWVudCB7XG4gICAgICAgIHJldHVybiA8SFRNTEZvcm1FbGVtZW50PmRvbS5maW5kRmlyc3QoJyMnICsgbGF5ZXIuZ2V0KFVVSUQpICsgJyAuLWpzLW1hcC1zb3VyY2UtdmlzaWJsZScpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZmluZExheWVyT3BhY2l0eShsYXllcjogb2wubGF5ZXIuQmFzZSk6IEhUTUxGb3JtRWxlbWVudCB7XG4gICAgICAgIHJldHVybiA8SFRNTEZvcm1FbGVtZW50PmRvbS5maW5kRmlyc3QoJyMnICsgbGF5ZXIuZ2V0KFVVSUQpICsgJyAuLWpzLW1hcC1zb3VyY2Utb3BhY2l0eScpO1xuICAgIH1cblxuICAgIGdldFZpc2libGUobGF5ZXI6IG9sLmxheWVyLkJhc2UpIHtcbiAgICAgICAgbGV0IGNoZWNrYm94ID0gdGhpcy5maW5kTGF5ZXJWaXNpYmxlKGxheWVyKTtcbiAgICAgICAgcmV0dXJuIGNoZWNrYm94LmNoZWNrZWQ7XG4gICAgfVxuXG4gICAgc2V0VmlzaWJsZShsYXllcjogb2wubGF5ZXIuQmFzZSwgdmlzaWJsZTogYm9vbGVhbiwgYWN0aW9uOiBib29sZWFuID0gZmFsc2UpIHtcbiAgICAgICAgbGV0IGNoZWNrYm94ID0gdGhpcy5maW5kTGF5ZXJWaXNpYmxlKGxheWVyKTtcbiAgICAgICAgaWYgKGNoZWNrYm94LmNoZWNrZWQgIT09IHZpc2libGUgJiYgIWFjdGlvbikge1xuICAgICAgICAgICAgY2hlY2tib3guY2hlY2tlZCA9IHZpc2libGU7XG4gICAgICAgIH0gZWxzZSBpZiAoY2hlY2tib3guY2hlY2tlZCAhPT0gdmlzaWJsZSAmJiBhY3Rpb24pIHtcbiAgICAgICAgICAgIGNoZWNrYm94LmNsaWNrKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZXREaXNhYmxlKGxheWVyOiBvbC5sYXllci5CYXNlLCBkaXNhYmxlOiBib29sZWFuKSB7XG4gICAgICAgIGxldCBpdGVtID0gdGhpcy5maW5kTGF5ZXJJdGVtKGxheWVyKTtcbiAgICAgICAgbGV0IGNoZWNrYm94VmlzaWJsZSA9IHRoaXMuZmluZExheWVyVmlzaWJsZShsYXllcik7XG4gICAgICAgIGxldCBzZWxlY3RPcGFjaXR5ID0gdGhpcy5maW5kTGF5ZXJPcGFjaXR5KGxheWVyKTtcbiAgICAgICAgbGV0IGxhYmVsID0gdGhpcy5maW5kTGF5ZXJMYWJlbChsYXllcik7XG4gICAgICAgIGlmIChkaXNhYmxlKSB7XG4gICAgICAgICAgICBkb20uYWRkQ2xhc3MoaXRlbSwgJ2Rpc2FibGVkJyk7XG4gICAgICAgICAgICBjaGVja2JveFZpc2libGUuc2V0QXR0cmlidXRlKCdkaXNhYmxlZCcsICd0cnVlJyk7XG4gICAgICAgICAgICBzZWxlY3RPcGFjaXR5LnNldEF0dHJpYnV0ZSgnZGlzYWJsZWQnLCAndHJ1ZScpO1xuICAgICAgICAgICAgZG9tLmFkZChsYWJlbCwgeyd0aXRsZSc6ICdEZXIgRGllbnN0IGlzdCBuaWNodCBlcnJlaWNoYmFyISd9KTtcbiAgICAgICAgICAgIGlmIChMYXllclRyZWUudXNlU29ydGFibGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZURyYWdnYWJsZShpdGVtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRvbS5yZW1vdmVDbGFzcyhpdGVtLCAnZGlzYWJsZWQnKTtcbiAgICAgICAgICAgIGNoZWNrYm94VmlzaWJsZS5yZW1vdmVBdHRyaWJ1dGUoJ2Rpc2FibGVkJyk7XG4gICAgICAgICAgICBzZWxlY3RPcGFjaXR5LnJlbW92ZUF0dHJpYnV0ZSgnZGlzYWJsZWQnKTtcbiAgICAgICAgICAgIGRvbS5hZGQobGFiZWwsIHsndGl0bGUnOiBsYXllci5nZXQoVElUTEUpfSk7XG4gICAgICAgICAgICBpZiAoTGF5ZXJUcmVlLnVzZVNvcnRhYmxlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGREcmFnZ2FibGUoaXRlbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHN1YnN0cmluZ1RpdGxlKHRleHQ6IHN0cmluZykge1xuICAgICAgICBpZiAodGV4dC5sZW5ndGggPiBMYXllclRyZWUubWF4bGVuZ3RoKSB7XG4gICAgICAgICAgICB0ZXh0ID0gdGV4dC5zdWJzdHJpbmcoMCwgTGF5ZXJUcmVlLm1heGxlbmd0aCk7XG4gICAgICAgICAgICBpZiAodGV4dC5sYXN0SW5kZXhPZignICcpID4gMCkge1xuICAgICAgICAgICAgICAgIHRleHQgPSB0ZXh0LnN1YnN0cmluZygwLCB0ZXh0Lmxhc3RJbmRleE9mKCcgJykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0ZXh0O1xuICAgIH1cblxuICAgIHJlbW92ZShsYXllcjogb2wubGF5ZXIuQmFzZSkge1xuICAgICAgICBsZXQgbGF5ZXJOb2RlID0gdGhpcy5maW5kTGF5ZXJJdGVtKGxheWVyKTtcbiAgICAgICAgaWYgKGxheWVyTm9kZSkge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVEcmFnZ2FibGUoPEhUTUxFbGVtZW50PmxheWVyTm9kZSk7XG4gICAgICAgICAgICBsYXllck5vZGUucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhZGQobGF5ZXI6IG9sLmxheWVyLkJhc2UpIHtcbiAgICAgICAgbGV0IGxheWVyTm9kZSA9IGRvbS5jcmVhdGUoJ2xpJywgeydpZCc6IGxheWVyLmdldChVVUlEKX0pO1xuICAgICAgICBpZiAoTGF5ZXJUcmVlLnVzZVZpc2libGUpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkVmlzaWJsZShsYXllck5vZGUsIGxheWVyKTtcbiAgICAgICAgfVxuICAgICAgICBsYXllck5vZGUuYXBwZW5kQ2hpbGQoXG4gICAgICAgICAgICBkb20uY3JlYXRlKCdsYWJlbCcsXG4gICAgICAgICAgICAgICAgeydpZCc6IGxheWVyLmdldChVVUlEKSwgJ2Zvcic6ICdjaGItJyArIGxheWVyLmdldChVVUlEKSwgJ3RpdGxlJzogbGF5ZXIuZ2V0KFRJVExFKX0sXG4gICAgICAgICAgICAgICAgWydmb3JtLWxhYmVsJ10sIHRoaXMuc3Vic3RyaW5nVGl0bGUobGF5ZXIuZ2V0KFRJVExFKSkpXG4gICAgICAgICk7XG4gICAgICAgIGlmIChMYXllclRyZWUudXNlT3BhY2l0eSkge1xuICAgICAgICAgICAgdGhpcy5hZGRPcGFjaXR5KGxheWVyTm9kZSwgbGF5ZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy50cmVlLmluc2VydEJlZm9yZShsYXllck5vZGUsIGRvbS5maW5kRmlyc3QoJ2xpJywgdGhpcy50cmVlKSk7XG4gICAgICAgIGlmIChMYXllclRyZWUudXNlU29ydGFibGUpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkRHJhZ2dhYmxlKGxheWVyTm9kZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGFkZFZpc2libGUobGF5ZXJOb2RlOiBIVE1MRWxlbWVudCwgbGF5ZXI6IG9sLmxheWVyLkJhc2UpIHtcbiAgICAgICAgbGV0IGlucHV0ID0gZG9tLmNyZWF0ZSgnaW5wdXQnLCB7J3R5cGUnOiAnY2hlY2tib3gnfSxcbiAgICAgICAgICAgIFsnY2hlY2snLCAnLWpzLW1hcC1zb3VyY2UtdmlzaWJsZSddKTtcbiAgICAgICAgKDxIVE1MRm9ybUVsZW1lbnQ+aW5wdXQpLmNoZWNrZWQgPSBsYXllci5nZXRWaXNpYmxlKCk7XG4gICAgICAgIGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIHRoaXMuY2hhbmdlVmlzaWJsZS5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgICAgIGxheWVyTm9kZS5hcHBlbmRDaGlsZChpbnB1dCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjaGFuZ2VWaXNpYmxlKGUpIHtcbiAgICAgICAgdGhpcy5vbDRNYXAuc2V0VmlzaWJsZShlLnRhcmdldC5wYXJlbnRFbGVtZW50LmlkLCBlLnRhcmdldC5jaGVja2VkKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFkZE9wYWNpdHkobGF5ZXJOb2RlOiBIVE1MRWxlbWVudCwgbGF5ZXI6IG9sLmxheWVyLkJhc2UpOiB2b2lkIHtcbiAgICAgICAgbGV0IHNlbGVjdCA9IGRvbS5jcmVhdGUoJ3NlbGVjdCcsIHt9LFxuICAgICAgICAgICAgWydpbnB1dC1lbGVtZW50JywgJ21lZGl1bScsICdzaW1wbGUnLCAnbWFwLXNvdXJjZS1vcGFjaXR5JywgJy1qcy1tYXAtc291cmNlLW9wYWNpdHknXSk7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPD0gMTA7IGkrKykge1xuICAgICAgICAgICAgc2VsZWN0LmFwcGVuZENoaWxkKGRvbS5jcmVhdGUoJ29wdGlvbicsIHsndmFsdWUnOiBpIC8gMTB9LCBbXSwgKGkgKiAxMCkgKyAnICUnKSk7XG4gICAgICAgIH1cbiAgICAgICAgKDxIVE1MRm9ybUVsZW1lbnQ+c2VsZWN0KS52YWx1ZSA9IGxheWVyLmdldE9wYWNpdHkoKS50b1N0cmluZygpO1xuICAgICAgICBzZWxlY3QuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgdGhpcy5jaGFuZ2VPcGFjaXR5LmJpbmQodGhpcyksIGZhbHNlKTtcbiAgICAgICAgbGF5ZXJOb2RlLmFwcGVuZENoaWxkKHNlbGVjdCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjaGFuZ2VPcGFjaXR5KGUpIHtcbiAgICAgICAgdGhpcy5vbDRNYXAuc2V0T3BhY2l0eShlLnRhcmdldC5wYXJlbnRFbGVtZW50LmlkLCBwYXJzZUZsb2F0KGUudGFyZ2V0LnZhbHVlKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhZGREcmFnZ2FibGUobGF5ZXI6IEhUTUxFbGVtZW50LCBpc0R1bW15OiBib29sZWFuID0gZmFsc2UpIHtcbiAgICAgICAgZG9tLmFkZChsYXllciwgeydkcmFnZ2FibGUnOiAndHJ1ZSd9LCBbJ2RyYWdnYWJsZScsICctanMtZHJhZ2dhYmxlJ10pO1xuICAgICAgICBpZiAoIWlzRHVtbXkpIHtcbiAgICAgICAgICAgIGxheWVyLmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdzdGFydCcsIHRoaXMuZHJhZ1N0YXJ0LmJpbmQodGhpcyksIGZhbHNlKTtcbiAgICAgICAgICAgIGxheWVyLmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdlbmQnLCB0aGlzLmRyYWdFbmQuYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgICAgICB9XG4gICAgICAgIGxheWVyLmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdlbnRlcicsIHRoaXMuZHJhZ0VudGVyLmJpbmQodGhpcyksIGZhbHNlKTtcbiAgICAgICAgbGF5ZXIuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ292ZXInLCB0aGlzLmRyYWdPdmVyLmJpbmQodGhpcyksIGZhbHNlKTtcbiAgICAgICAgbGF5ZXIuYWRkRXZlbnRMaXN0ZW5lcignZHJvcCcsIHRoaXMuZHJhZ0Ryb3AuYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVtb3ZlRHJhZ2dhYmxlKGxheWVyOiBIVE1MRWxlbWVudCwgaXNEdW1teTogYm9vbGVhbiA9IGZhbHNlKSB7XG4gICAgICAgIGRvbS5kZWxldGUobGF5ZXIsIFsnZHJhZ2dhYmxlJ10sIFsnZHJhZ2dhYmxlJywgJy1qcy1kcmFnZ2FibGUnXSk7XG4gICAgICAgIGlmICghaXNEdW1teSkge1xuICAgICAgICAgICAgbGF5ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcignZHJhZ3N0YXJ0JywgdGhpcy5kcmFnU3RhcnQuYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgICAgICAgICAgbGF5ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcignZHJhZ2VuZCcsIHRoaXMuZHJhZ0VuZC5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgICAgbGF5ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcignZHJhZ2VudGVyJywgdGhpcy5kcmFnRW50ZXIuYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgICAgICBsYXllci5yZW1vdmVFdmVudExpc3RlbmVyKCdkcmFnb3ZlcicsIHRoaXMuZHJhZ092ZXIuYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgICAgICBsYXllci5yZW1vdmVFdmVudExpc3RlbmVyKCdkcm9wJywgdGhpcy5kcmFnRHJvcC5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgfVxuXG5cbiAgICBwcml2YXRlIGRyYWdTdGFydChlKSB7XG4gICAgICAgIHRoaXMuY3VycmVudExheWVyID0gZS50YXJnZXQ7XG4gICAgICAgIHRoaXMub2xkUG9zaXRpb24gPSB0aGlzLmdldExheWVyUG9zaXRpb24odGhpcy5jdXJyZW50TGF5ZXIpO1xuICAgICAgICBlLmRhdGFUcmFuc2Zlci5lZmZlY3RBbGxvd2VkID0gJ21vdmUnO1xuICAgICAgICBlLmRhdGFUcmFuc2Zlci5zZXREYXRhKCd0ZXh0L2h0bWwnLCB0aGlzLmN1cnJlbnRMYXllci5pbm5lckhUTUwpO1xuICAgICAgICBkb20uYWRkQ2xhc3ModGhpcy5jdXJyZW50TGF5ZXIsIFwibW92ZVwiKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGRyYWdPdmVyKGUpIHtcbiAgICAgICAgaWYgKGUucHJldmVudERlZmF1bHQpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgICAgICBlLmRhdGFUcmFuc2Zlci5kcm9wRWZmZWN0ID0gJ21vdmUnO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBkcmFnRW50ZXIoZSkge1xuICAgICAgICBpZiAodGhpcy5jdXJyZW50TGF5ZXIgJiYgZS50YXJnZXQgIT09IHVuZGVmaW5lZCAmJiB0aGlzLmN1cnJlbnRMYXllciAhPT0gZS50YXJnZXQpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdGhpcy50cmVlLmluc2VydEJlZm9yZShcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50TGF5ZXIsXG4gICAgICAgICAgICAgICAgICAgIGUudGFyZ2V0LmRyYWdnYWJsZSA/IGUudGFyZ2V0IDogZS50YXJnZXQucGFyZW50RWxlbWVudFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGRyYWdEcm9wKGUpIHtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBkb20ucmVtb3ZlQ2xhc3MoZS50YXJnZXQsIFwib3ZlclwiKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGRyYWdFbmQoZSkge1xuICAgICAgICBkb20ucmVtb3ZlQ2xhc3MoZS50YXJnZXQsIFwibW92ZVwiKTtcbiAgICAgICAgdGhpcy5vbDRNYXAubW92ZUxheWVyKHRoaXMuY3VycmVudExheWVyLmlkLCB0aGlzLm9sZFBvc2l0aW9uLCB0aGlzLmdldExheWVyUG9zaXRpb24odGhpcy5jdXJyZW50TGF5ZXIpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldExheWVyUG9zaXRpb24obGF5ZXIpIHtcbiAgICAgICAgbGV0IGxpc3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuLWpzLW1hcC1sYXllcnRyZWUgdWwgLi1qcy1kcmFnZ2FibGUnKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAobGlzdFtpXS5pZCA9PT0gbGF5ZXIuaWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbGlzdC5sZW5ndGggLSAxIC0gaTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG4iLCJpbXBvcnQgKiBhcyBvbDQgZnJvbSAnb3BlbmxheWVycyc7Ly8gPz8/XG5cbmltcG9ydCB7TGF5ZXJUcmVlfSBmcm9tICcuL0xheWVyVHJlZSc7XG5pbXBvcnQge0RyYWdab29tfSBmcm9tICcuL0RyYWdab29tJztcbmltcG9ydCB7T2w0U291cmNlLCBPbDRWZWN0b3JTb3VyY2UsIE9sNFdtc1NvdXJjZX0gZnJvbSBcIi4vT2w0U291cmNlXCJcbmltcG9ydCB7RmVhdHVyZUluZm99IGZyb20gXCIuL0ZlYXR1cmVJbmZvXCI7XG5cbmRlY2xhcmUgY2xhc3MgcHJvajQge1xuICAgIHN0YXRpYyBkZWZzKG5hbWU6IHN0cmluZywgZGVmOiBzdHJpbmcpOiB2b2lkO1xufVxuXG4vLyBkZWNsYXJlIGZ1bmN0aW9uIGFkZFNvdXJjZShpZDogc3RyaW5nLCB0aXRsZTogc3RyaW5nLCB2aXNpYmlsaXR5OiBib29sZWFuLCBvcGFjaXR5OiBudW1iZXIpOiB2b2lkO1xuZXhwb3J0IGNsYXNzIE9sNFV0aWxzIHtcbiAgICAvKiBcbiAgICAgKiB1bml0czogJ2RlZ3JlZXMnfCdmdCd8J20nfCd1cy1mdCdcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHJlc29sdXRpb25TY2FsZUZhY3Rvcih1bml0czogc3RyaW5nKTogbnVtYmVyIHtcbiAgICAgICAgbGV0IGRwaSA9IDI1LjQgLyAwLjI4O1xuICAgICAgICBsZXQgbXB1ID0gb2wucHJvai5NRVRFUlNfUEVSX1VOSVRbdW5pdHNdO1xuICAgICAgICBsZXQgaW5jaGVzUGVyTWV0ZXIgPSAzOS4zNztcbiAgICAgICAgcmV0dXJuIG1wdSAqIGluY2hlc1Blck1ldGVyICogZHBpO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgcmVzb2x1dGlvbkZvclNjYWxlKHNjYWxlOiBudW1iZXIsIGZhY3RvcjogbnVtYmVyKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHNjYWxlIC8gZmFjdG9yO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgcmVzb2x1dGlvbnNGb3JTY2FsZXMoc2NhbGVzOiBudW1iZXJbXSwgdW5pdHM6IHN0cmluZyk6IG51bWJlcltdIHtcbiAgICAgICAgbGV0IHJlc29sdXRpb25zID0gW107XG4gICAgICAgIGxldCBmYWN0b3IgPSBPbDRVdGlscy5yZXNvbHV0aW9uU2NhbGVGYWN0b3IodW5pdHMpO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNjYWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcmVzb2x1dGlvbnMucHVzaChPbDRVdGlscy5yZXNvbHV0aW9uRm9yU2NhbGUoc2NhbGVzW2ldLCBmYWN0b3IpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzb2x1dGlvbnM7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBzY2FsZUZvclJlc29sdXRpb24ocmVzb2x1dGlvbjogbnVtYmVyLCBmYWN0b3I6IG51bWJlcik6IG51bWJlciB7XG4gICAgICAgIHJldHVybiByZXNvbHV0aW9uICogZmFjdG9yO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgc2NhbGVzRm9yUmVzb2x1dGlvbnMocmVzb2x1dGlvbnM6IG51bWJlcltdLCB1bml0czogc3RyaW5nKTogbnVtYmVyW10ge1xuICAgICAgICBsZXQgc2NhbGVzID0gW107XG4gICAgICAgIGxldCBmYWN0b3IgPSBPbDRVdGlscy5yZXNvbHV0aW9uU2NhbGVGYWN0b3IodW5pdHMpO1xuICAgICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgcmVzb2x1dGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHNjYWxlcy5wdXNoKE9sNFV0aWxzLnNjYWxlRm9yUmVzb2x1dGlvbihyZXNvbHV0aW9uc1tpXSwgZmFjdG9yKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNjYWxlcztcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGluaXRQcm9qNERlZnMocHJvajREZWZzOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgZm9yIChjb25zdCBuYW1lIGluIHByb2o0RGVmcykge1xuICAgICAgICAgICAgcHJvajQuZGVmcyhuYW1lLCBwcm9qNERlZnNbbmFtZV0pO1xuICAgICAgICAgICAgbGV0IHByID0gb2wucHJvai5nZXQobmFtZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGdldFByb2oocHJvakNvZGU6IHN0cmluZyk6IG9sLnByb2ouUHJvamVjdGlvbiB7XG4gICAgICAgIHJldHVybiBvbC5wcm9qLmdldChwcm9qQ29kZSk7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBnZXRTdHlsZShvcHRpb25zOiBhbnksIHN0eWxlOiBvbC5zdHlsZS5TdHlsZSA9IG51bGwpOiBvbC5zdHlsZS5TdHlsZSB7XG4gICAgICAgIGxldCBzdHlsZV8gPSBzdHlsZSA/IHN0eWxlIDogbmV3IG9sLnN0eWxlLlN0eWxlKCk7XG4gICAgICAgIHN0eWxlXy5zZXRGaWxsKG5ldyBvbC5zdHlsZS5GaWxsKG9wdGlvbnNbJ2ZpbGwnXSkpO1xuICAgICAgICBzdHlsZV8uc2V0U3Ryb2tlKG5ldyBvbC5zdHlsZS5TdHJva2Uob3B0aW9uc1snc3Ryb2tlJ10pKTtcbiAgICAgICAgaWYgKG9wdGlvbnNbJ2ltYWdlJ10gJiYgb3B0aW9uc1snaW1hZ2UnXVsnY2lyY2xlJ10pIHtcbiAgICAgICAgICAgIHN0eWxlXy5zZXRJbWFnZShuZXcgb2wuc3R5bGUuQ2lyY2xlKHtcbiAgICAgICAgICAgICAgICAgICAgcmFkaXVzOiBvcHRpb25zWydpbWFnZSddWydjaXJjbGUnXVsncmFkaXVzJ10sXG4gICAgICAgICAgICAgICAgICAgIGZpbGw6IG5ldyBvbC5zdHlsZS5GaWxsKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiBvcHRpb25zWydpbWFnZSddWydjaXJjbGUnXVsnZmlsbCddWydjb2xvciddXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0eWxlXztcbiAgICAgICAgLy9cbiAgICAgICAgLy8gcmV0dXJuIG5ldyBvbC5zdHlsZV8uU3R5bGUoe1xuICAgICAgICAvLyAgICAgZmlsbDogbmV3IG9sLnN0eWxlXy5GaWxsKG9wdGlvbnNbJ2ZpbGwnXSksXG4gICAgICAgIC8vICAgICBzdHJva2U6IG5ldyBvbC5zdHlsZV8uU3Ryb2tlKG9wdGlvbnNbJ3N0cm9rZSddKS8vLFxuICAgICAgICAvLyAgICAgLy8gaW1hZ2U6IG5ldyBvbC5zdHlsZV8uQ2lyY2xlKHtcbiAgICAgICAgLy8gICAgIC8vICAgICByYWRpdXM6IDcsXG4gICAgICAgIC8vICAgICAvLyAgICAgZmlsbDogbmV3IG9sLnN0eWxlXy5GaWxsKG9wdGlvbnNbJ2ZpbGwnXSlcbiAgICAgICAgLy8gICAgIC8vIH0pXG4gICAgICAgIC8vIH0pO1xuICAgIH1cblxuLy8gZmlsbFxuLy8ge1xuLy8gICAgIGNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMilcbi8vIH1cbi8vIHN0cm9rZVxuLy8ge1xuLy8gICAgIGNvbG9yOiAnI2ZmY2MzMycsXG4vLyAgICAgd2lkdGg6IDJcbi8vICAgICBkYXNoOlxuLy8gfVxuLy8gaW1hZ2Vcbn1cblxuZXhwb3J0IGNsYXNzIE9sNEdlb20ge1xuICAgIHByb3RlY3RlZCBnZW9tOiBvbC5nZW9tLkdlb21ldHJ5ID0gbnVsbDtcbiAgICBwcm90ZWN0ZWQgcHJvajogb2wucHJvai5Qcm9qZWN0aW9uID0gbnVsbDtcblxuICAgIGNvbnN0cnVjdG9yKGdlb206IG9sLmdlb20uR2VvbWV0cnksIHByb2o6IG9sLnByb2ouUHJvamVjdGlvbikge1xuICAgICAgICB0aGlzLmdlb20gPSBnZW9tO1xuICAgICAgICB0aGlzLnByb2ogPSBwcm9qO1xuICAgIH1cblxuICAgIGdldEdlb20oKTogb2wuZ2VvbS5HZW9tZXRyeSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdlb207XG4gICAgfVxuXG4gICAgZ2V0UHJvaigpOiBvbC5wcm9qLlByb2plY3Rpb24ge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9qO1xuICAgIH1cblxuICAgIGdldEV4dGVudChwcm9qOiBvbC5wcm9qLlByb2plY3Rpb24pOiBvbC5FeHRlbnQge1xuICAgICAgICBpZiAodGhpcy5wcm9qICE9PSBwcm9qKSB7XG4gICAgICAgICAgICByZXR1cm4gKDxvbC5nZW9tLkdlb21ldHJ5Pig8YW55PiB0aGlzLmdlb20pLmNsb25lKCkpLnRyYW5zZm9ybSh0aGlzLnByb2osIHByb2opLmdldEV4dGVudCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuICg8b2wuZ2VvbS5HZW9tZXRyeT4oPGFueT4gdGhpcy5nZW9tKS5jbG9uZSgpKS5nZXRFeHRlbnQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBnZXRQb2x5Z29uRm9yRXh0ZW50KHByb2o6IG9sLnByb2ouUHJvamVjdGlvbikge1xuICAgICAgICByZXR1cm4gb2wuZ2VvbS5Qb2x5Z29uLmZyb21FeHRlbnQodGhpcy5nZXRFeHRlbnQocHJvaikpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIE9sNEV4dGVudCBleHRlbmRzIE9sNEdlb20ge1xuICAgIHB1YmxpYyBzdGF0aWMgZnJvbUFycmF5KG9yZGluYXRlczogbnVtYmVyW10sIHByb2o6IG9sLnByb2ouUHJvamVjdGlvbik6IE9sNEV4dGVudCB7XG4gICAgICAgIGxldCBnZW9tID0gbmV3IG9sLmdlb20uTXVsdGlQb2ludChbW29yZGluYXRlc1swXSwgb3JkaW5hdGVzWzFdXSwgW29yZGluYXRlc1syXSwgb3JkaW5hdGVzWzNdXV0pO1xuICAgICAgICByZXR1cm4gbmV3IE9sNEV4dGVudChnZW9tLCBwcm9qKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjb25zdCBVVUlEOiBzdHJpbmcgPSAndXVpZCc7XG5leHBvcnQgY29uc3QgTEFZRVJfVVVJRDogc3RyaW5nID0gJ2xheWVydXVpZCc7XG5leHBvcnQgY29uc3QgVElUTEU6IHN0cmluZyA9ICd0aXRsZSc7XG5leHBvcnQgY29uc3QgTUVUQURPUl9FUFNHOiBvbC5Qcm9qZWN0aW9uTGlrZSA9ICdFUFNHOjQzMjYnO1xuZXhwb3J0IGNvbnN0IExBWUVSX1ZFQ1RPUiA9ICd2ZWN0b3InO1xuZXhwb3J0IGNvbnN0IExBWUVSX0lNQUdFID0gJ2ltYWdlJztcblxuZXhwb3J0IGNsYXNzIE9sNE1hcCB7XG4gICAgcHJpdmF0ZSBzdGF0aWMgX3V1aWQgPSAwO1xuICAgIHByaXZhdGUgc3RhdGljIF9pbnN0YW5jZTogT2w0TWFwID0gbnVsbDsgLy8gc2luZ2xldG9uXG4gICAgcHJpdmF0ZSBvbE1hcDogb2wuTWFwID0gbnVsbDtcbiAgICBwcml2YXRlIHNjYWxlczogbnVtYmVyW107XG4gICAgLy8gICAgcHJvdGVjdGVkIHByb2o6IG9sLnByb2ouUHJvamVjdGlvbiA9IG51bGw7XG4gICAgcHJpdmF0ZSBzdGFydEV4dGVudDogT2w0RXh0ZW50ID0gbnVsbDsgIC8vIHhtaW4sIHltaW4sIHhtYXgsIHltYXggb3B0aW9uc1snc3RhcnRFeHRlbnQnXVxuICAgIHByaXZhdGUgbWF4RXh0ZW50OiBPbDRFeHRlbnQgPSBudWxsO1xuICAgIHByaXZhdGUgZHJhd2VyOiBPbDREcmF3ZXI7XG4gICAgcHJpdmF0ZSB3bXNTb3VyY2U6IE9sNFdtc1NvdXJjZTtcbiAgICBwcml2YXRlIHZlY1NvdXJjZTogT2w0VmVjdG9yU291cmNlO1xuICAgIHByaXZhdGUgbGF5ZXJ0cmVlOiBMYXllclRyZWU7XG4gICAgcHJpdmF0ZSBzdHlsZXM6IE9iamVjdDtcbiAgICBwcml2YXRlIGhnTGF5ZXI6IG9sLmxheWVyLlZlY3RvcjtcbiAgICAvLyBwcm90ZWN0ZWQgZHJhZ3pvb206IG9sLmludGVyYWN0aW9uLkRyYWdab29tO1xuICAgIHByaXZhdGUgZHJhZ3pvb206IERyYWdab29tO1xuICAgIHByaXZhdGUgZmVhdHVyZUluZm86IEZlYXR1cmVJbmZvO1xuXG4gICAgcHJpdmF0ZSBzdGF0aWMgZ2V0VXVpZChwcmVmaXg6IHN0cmluZyA9ICcnKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHByZWZpeCArICgrK09sNE1hcC5fdXVpZCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihvcHRpb25zOiBhbnkpIHsgLy8gc2luZ2xldG9uXG4gICAgICAgIG9sWydFTkFCTEVfUkFTVEVSX1JFUFJPSkVDVElPTiddID0gZmFsc2U7XG4gICAgICAgIE9sNFV0aWxzLmluaXRQcm9qNERlZnMob3B0aW9uc1sncHJvajREZWZzJ10pO1xuICAgICAgICB0aGlzLmxheWVydHJlZSA9IExheWVyVHJlZS5jcmVhdGUodGhpcyk7XG4gICAgICAgIHRoaXMud21zU291cmNlID0gT2w0V21zU291cmNlLmNyZWF0ZSh0aGlzLCB0cnVlKTtcbiAgICAgICAgdGhpcy52ZWNTb3VyY2UgPSBPbDRWZWN0b3JTb3VyY2UuY3JlYXRlKHRoaXMpO1xuICAgICAgICAoPEhUTUxGb3JtRWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuLWpzLWNycy1jb2RlJykpLnZhbHVlID0gb3B0aW9uc1sndmlldyddWydwcm9qZWN0aW9uJ107XG4gICAgICAgIGxldCBwcm9qOiBvbC5wcm9qLlByb2plY3Rpb24gPSBvbC5wcm9qLmdldChvcHRpb25zWyd2aWV3J11bJ3Byb2plY3Rpb24nXSk7XG4gICAgICAgIHRoaXMuc3R5bGVzID0gb3B0aW9uc1snc3R5bGVzJ107XG4gICAgICAgIHRoaXMuc2NhbGVzID0gb3B0aW9uc1sndmlldyddWydzY2FsZXMnXTtcbiAgICAgICAgdGhpcy5zdGFydEV4dGVudCA9IE9sNEV4dGVudC5mcm9tQXJyYXkob3B0aW9uc1sndmlldyddWydzdGFydEV4dGVudCddLCBwcm9qKTtcbiAgICAgICAgdGhpcy5tYXhFeHRlbnQgPSBPbDRFeHRlbnQuZnJvbUFycmF5KG9wdGlvbnNbJ3ZpZXcnXVsnbWF4RXh0ZW50J10sIHByb2opO1xuICAgICAgICBsZXQgaW50ZXJhY3Rpb25zID0gb2wuaW50ZXJhY3Rpb24uZGVmYXVsdHMoXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYWx0U2hpZnREcmFnUm90YXRlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBwaW5jaFJvdGF0ZTogZmFsc2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgICAgbGV0IGNvbnRyb2xzID0gb2wuY29udHJvbC5kZWZhdWx0cyh7YXR0cmlidXRpb246IGZhbHNlfSk7Ly8uZXh0ZW5kKFthdHRyaWJ1dGlvbl0pXG4gICAgICAgIHRoaXMub2xNYXAgPSBuZXcgb2wuTWFwKHtcbiAgICAgICAgICAgIGludGVyYWN0aW9uczogaW50ZXJhY3Rpb25zLFxuICAgICAgICAgICAgdGFyZ2V0OiBvcHRpb25zWydtYXAnXVsndGFyZ2V0J10sXG4gICAgICAgICAgICByZW5kZXJlcjogJ2NhbnZhcycsXG4gICAgICAgICAgICBjb250cm9sczogY29udHJvbHNcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMub2xNYXAuc2V0VmlldyhcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlVmlldyhcbiAgICAgICAgICAgICAgICBwcm9qLFxuICAgICAgICAgICAgICAgIHRoaXMubWF4RXh0ZW50LmdldEV4dGVudChwcm9qKSxcbiAgICAgICAgICAgICAgICBPbDRVdGlscy5yZXNvbHV0aW9uc0ZvclNjYWxlcyh0aGlzLnNjYWxlcywgcHJvai5nZXRVbml0cygpKS5yZXZlcnNlKClcbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICAgICAgLyogbWFrZSBhIGdyb3VwIGxheWVyIGZvciBhbGwgaW1hZ2UgbGF5ZXJzIChXTVMgZXRjLikqL1xuICAgICAgICBsZXQgaW1hZ2VHcm91cCA9IG5ldyBvbC5sYXllci5Hcm91cCh7XG4gICAgICAgICAgICBsYXllcnM6IG5ldyBvbC5Db2xsZWN0aW9uPG9sLmxheWVyLkJhc2U+KClcbiAgICAgICAgfSk7XG4gICAgICAgIGltYWdlR3JvdXAuc2V0KFVVSUQsIExBWUVSX0lNQUdFKVxuICAgICAgICB0aGlzLm9sTWFwLmFkZExheWVyKGltYWdlR3JvdXApO1xuICAgICAgICAvKiBtYWtlIGEgZ3JvdXAgbGF5ZXIgZm9yIGFsbCB2ZWN0b3IgbGF5ZXJzIChIaWdodGxpZ2h0LCBTZWFyY2ggcmVzdWx0cyBldGMuKSovXG4gICAgICAgIGxldCB2ZWN0b3JHcm91cCA9IG5ldyBvbC5sYXllci5Hcm91cCh7XG4gICAgICAgICAgICBsYXllcnM6IG5ldyBvbC5Db2xsZWN0aW9uPG9sLmxheWVyLkJhc2U+KClcbiAgICAgICAgfSk7XG4gICAgICAgIHZlY3Rvckdyb3VwLnNldChVVUlELCBMQVlFUl9WRUNUT1IpXG4gICAgICAgIHRoaXMub2xNYXAuYWRkTGF5ZXIodmVjdG9yR3JvdXApO1xuXG4gICAgICAgIGZvciAobGV0IHNvdXJjZU9wdGlvbnMgb2Ygb3B0aW9uc1snc291cmNlJ10pIHtcbiAgICAgICAgICAgIGlmIChzb3VyY2VPcHRpb25zWyd0eXBlJ10gPT09ICdXTVMnKSB7XG4gICAgICAgICAgICAgICAgbGV0IHdtc0xheWVyID0gdGhpcy5hZGRMYXllcihcbiAgICAgICAgICAgICAgICAgICAgdGhpcy53bXNTb3VyY2UuY3JlYXRlTGF5ZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICBPbDRNYXAuZ2V0VXVpZCgnb2xheS0nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZU9wdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9sTWFwLmdldFZpZXcoKS5nZXRQcm9qZWN0aW9uKCksXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VPcHRpb25zWyd2aXNpYmxlJ10sXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJzZUZsb2F0KHNvdXJjZU9wdGlvbnNbJ29wYWNpdHknXSlcbiAgICAgICAgICAgICAgICAgICAgKSwgdHJ1ZVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3Ioc291cmNlT3B0aW9uc1sndHlwZSddICsgJyBpcyBub3Qgc3VwcG9ydGVkLicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMub2xNYXAuYWRkQ29udHJvbChuZXcgb2wuY29udHJvbC5TY2FsZUxpbmUoKSk7XG5cbiAgICAgICAgbGV0IGljb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgIGljb24uY2xhc3NOYW1lID0gXCJpY29uLWVhcnRoXCI7XG4gICAgICAgIHRoaXMub2xNYXAuYWRkQ29udHJvbChuZXcgb2wuY29udHJvbC5ab29tVG9FeHRlbnQoe1xuICAgICAgICAgICAgZXh0ZW50OiB0aGlzLm1heEV4dGVudC5nZXRFeHRlbnQocHJvaiksXG4gICAgICAgICAgICBsYWJlbDogaWNvblxuICAgICAgICB9KSk7XG4gICAgICAgIHRoaXMub2xNYXAuYWRkSW50ZXJhY3Rpb24obmV3IG9sLmludGVyYWN0aW9uLkRyYWdab29tKCkpO1xuICAgICAgICB0aGlzLm9sTWFwLmFkZENvbnRyb2wobmV3IG9sLmNvbnRyb2wuTW91c2VQb3NpdGlvbihcbiAgICAgICAgICAgIC8vIHtcbiAgICAgICAgICAgIC8vICAgICBjb29yZGluYXRlRm9ybWF0OiBmdW5jdGlvbiAoY29vcmRpbmF0ZXMpIHtcbiAgICAgICAgICAgIC8vICAgICAgICAgdmFyIGNvb3JkX3ggPSBjb29yZGluYXRlc1swXS50b0ZpeGVkKDMpO1xuICAgICAgICAgICAgLy8gICAgICAgICB2YXIgY29vcmRfeSA9IGNvb3JkaW5hdGVzWzFdLnRvRml4ZWQoMyk7XG4gICAgICAgICAgICAvLyAgICAgICAgIHJldHVybiBjb29yZF94ICsgJywgJyArIGNvb3JkX3k7XG4gICAgICAgICAgICAvLyAgICAgfVxuICAgICAgICAgICAgLy8gfVxuICAgICAgICApKTtcbiAgICAgICAgbGV0IG1hcHNpemUgPSB0aGlzLm9sTWFwLmdldFNpemUoKTtcbiAgICAgICAgaWYobWFwc2l6ZVswXSAhPT0gMCAmJiBtYXBzaXplWzFdKSB7XG4gICAgICAgICAgICB0aGlzLnpvb21Ub0V4dGVudCh0aGlzLnN0YXJ0RXh0ZW50LmdldFBvbHlnb25Gb3JFeHRlbnQocHJvaikpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBoZ2wgPSB0aGlzLnZlY1NvdXJjZS5jcmVhdGVMYXllcihcbiAgICAgICAgICAgIE9sNE1hcC5nZXRVdWlkKCdvbGF5LScpLFxuICAgICAgICAgICAgeydzdHlsZSc6IE9sNFV0aWxzLmdldFN0eWxlKHRoaXMuc3R5bGVzWydoaWdobGlnaHQnXSl9LFxuICAgICAgICAgICAgdGhpcy5vbE1hcC5nZXRWaWV3KCkuZ2V0UHJvamVjdGlvbigpXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMuaGdMYXllciA9IDxvbC5sYXllci5WZWN0b3I+dGhpcy5hZGRMYXllcihoZ2wpO1xuXG4gICAgICAgIGxldCB2TGF5ZXIgPSA8b2wubGF5ZXIuVmVjdG9yPnRoaXMuYWRkTGF5ZXIoXG4gICAgICAgICAgICB0aGlzLnZlY1NvdXJjZS5jcmVhdGVMYXllcihcbiAgICAgICAgICAgICAgICBPbDRNYXAuZ2V0VXVpZCgnb2xheS0nKSxcbiAgICAgICAgICAgICAgICB7J3N0eWxlJzogT2w0VXRpbHMuZ2V0U3R5bGUodGhpcy5zdHlsZXNbJ3NlYXJjaCddKX0sXG4gICAgICAgICAgICAgICAgdGhpcy5vbE1hcC5nZXRWaWV3KCkuZ2V0UHJvamVjdGlvbigpXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgICAgIHZMYXllci5zZXRNYXAodGhpcy5vbE1hcCk7XG4gICAgICAgIHRoaXMuZHJhd2VyID0gbmV3IE9sNERyYXdlcih2TGF5ZXIpO1xuICAgICAgICB0aGlzLmRyYWd6b29tID0gbmV3IERyYWdab29tKHRoaXMub2xNYXApO1xuICAgICAgICB0aGlzLmZlYXR1cmVJbmZvID0gbmV3IEZlYXR1cmVJbmZvKHRoaXMub2xNYXAsIHRoaXMuaGdMYXllcik7XG4gICAgfVxuXG4gICAgYWN0aXZhdGVGZWF0dXJlSW5mbyhcbiAgICAgICAgdG9vbHRpcEVsbTogSFRNTEVsZW1lbnQsXG4gICAgICAgIGNhbGxiYWNrU2VsZWN0OiBGdW5jdGlvbixcbiAgICAgICAgY2FsbGJhY2tVblNlbGVjdDogRnVuY3Rpb24sXG4gICAgICAgIGNhbGxiYWNrVW5TZWxlY3RBbGw6IEZ1bmN0aW9uXG4gICAgKTogdm9pZCB7XG4gICAgICAgIHRoaXMuZmVhdHVyZUluZm8uYWN0aXZhdGUodG9vbHRpcEVsbSwgY2FsbGJhY2tTZWxlY3QsIGNhbGxiYWNrVW5TZWxlY3QsIGNhbGxiYWNrVW5TZWxlY3RBbGwpO1xuICAgIH1cblxuICAgIGRlYWN0aXZhdGVGZWF0dXJlSW5mbygpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5mZWF0dXJlSW5mby5kZWFjdGl2YXRlKCk7XG4gICAgfVxuXG4gICAgcmVzZXRGZWF0dXJlSW5mbygpIHtcbiAgICAgICAgdGhpcy5mZWF0dXJlSW5mby5yZXNldCgpO1xuICAgIH1cblxuICAgIHNlbGVjdEZlYXR1cmVzKHV1aWRzOiBzdHJpbmdbXSkge1xuICAgICAgICB0aGlzLmZlYXR1cmVJbmZvLnNlbGVjdEZlYXR1cmVzKHV1aWRzKTtcbiAgICB9XG5cbiAgICBnZXRMYXllclRyZWUoKTogTGF5ZXJUcmVlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubGF5ZXJ0cmVlO1xuICAgIH1cblxuICAgIHByaXZhdGUgYWRkSW50b0xheWVyVHJlZShsYXllcjogb2wubGF5ZXIuQmFzZSkge1xuICAgICAgICBpZiAodGhpcy5sYXllcnRyZWUpIHtcbiAgICAgICAgICAgIHRoaXMubGF5ZXJ0cmVlLmFkZChsYXllcik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGNyZWF0ZVZpZXcocHJvajogb2wucHJvai5Qcm9qZWN0aW9uLCBleHRlbnQ6IG9sLkV4dGVudCwgcmVzb2x1dGlvbnM6IG51bWJlcltdKSB7XG4gICAgICAgIHJldHVybiBuZXcgb2wuVmlldyh7XG4gICAgICAgICAgICBwcm9qZWN0aW9uOiBwcm9qLFxuICAgICAgICAgICAgcmVzb2x1dGlvbnM6IHJlc29sdXRpb25zLFxuICAgICAgICAgICAgZXh0ZW50OiBleHRlbnRcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgem9vbVRvRXh0ZW50KGdlb21ldHJ5OiBvbC5nZW9tLlNpbXBsZUdlb21ldHJ5IHwgb2wuRXh0ZW50KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGdlb21ldHJ5LCB0aGlzLm9sTWFwLmdldFNpemUoKSk7XG4gICAgICAgIHRoaXMub2xNYXAuZ2V0VmlldygpLmZpdChnZW9tZXRyeSwgPG9seC52aWV3LkZpdE9wdGlvbnM+dGhpcy5vbE1hcC5nZXRTaXplKCkpO1xuICAgIH1cblxuICAgIHN0YXRpYyBjcmVhdGUob3B0aW9uczogYW55KTogT2w0TWFwIHtcbiAgICAgICAgaWYgKCFPbDRNYXAuX2luc3RhbmNlKSB7Ly8gc2luZ2xldG9uXG4gICAgICAgICAgICBPbDRNYXAuX2luc3RhbmNlID0gbmV3IE9sNE1hcChvcHRpb25zKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gT2w0TWFwLl9pbnN0YW5jZTtcbiAgICB9XG5cbiAgICBnZXRQcm9qZWN0aW9uKCk6IG9sLnByb2ouUHJvamVjdGlvbiB7XG4gICAgICAgIHJldHVybiB0aGlzLm9sTWFwLmdldFZpZXcoKS5nZXRQcm9qZWN0aW9uKCk7XG4gICAgfVxuXG4gICAgZ2V0RHJhd2VyKCk6IE9sNERyYXdlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmRyYXdlcjtcbiAgICB9XG5cbiAgICBnZXRIZ0xheWVyKCk6IG9sLmxheWVyLlZlY3RvciB7XG4gICAgICAgIHJldHVybiB0aGlzLmhnTGF5ZXI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBhIGxheWVyIGludG8gYSBtYXAuXG4gICAgICogQHBhcmFtIG9wdGlvbnNcbiAgICAgKi9cbiAgICBhZGRMYXllckZvck9wdGlvbnMob3B0aW9uczogYW55KSB7XG4gICAgICAgIGlmIChvcHRpb25zWyd0eXBlJ10gPT09ICdXTVMnKSB7XG4gICAgICAgICAgICBsZXQgd21zTGF5ZXIgPSB0aGlzLmFkZExheWVyKFxuICAgICAgICAgICAgICAgIHRoaXMud21zU291cmNlLmNyZWF0ZUxheWVyKFxuICAgICAgICAgICAgICAgICAgICBPbDRNYXAuZ2V0VXVpZCgnb2xheS0nKSxcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vbE1hcC5nZXRWaWV3KCkuZ2V0UHJvamVjdGlvbigpLFxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zWyd2aXNpYmxlJ10sXG4gICAgICAgICAgICAgICAgICAgIHBhcnNlRmxvYXQob3B0aW9uc1snb3BhY2l0eSddKVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3Iob3B0aW9uc1sndHlwZSddICsgJyBpcyBub3Qgc3VwcG9ydGVkLicpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYWRkTGF5ZXIobGF5ZXI6IG9sLmxheWVyLkJhc2UsIGFkZFRvTGF5ZXJ0cmVlOiBib29sZWFuID0gZmFsc2UpOiBvbC5sYXllci5CYXNlIHtcbiAgICAgICAgaWYgKGxheWVyIGluc3RhbmNlb2Ygb2wubGF5ZXIuSW1hZ2UpIHtcbiAgICAgICAgICAgIGxldCBncm91cDogb2wubGF5ZXIuR3JvdXAgPSA8b2wubGF5ZXIuR3JvdXA+IHRoaXMuZmluZExheWVyKExBWUVSX0lNQUdFKTtcbiAgICAgICAgICAgIGdyb3VwLmdldExheWVycygpLmluc2VydEF0KGdyb3VwLmdldExheWVycygpLmdldExlbmd0aCgpLCBsYXllcik7XG4gICAgICAgIH0gZWxzZSBpZiAobGF5ZXIgaW5zdGFuY2VvZiBvbC5sYXllci5WZWN0b3IpIHtcbiAgICAgICAgICAgIGxldCBncm91cDogb2wubGF5ZXIuR3JvdXAgPSA8b2wubGF5ZXIuR3JvdXA+IHRoaXMuZmluZExheWVyKExBWUVSX1ZFQ1RPUik7XG4gICAgICAgICAgICBncm91cC5nZXRMYXllcnMoKS5pbnNlcnRBdChncm91cC5nZXRMYXllcnMoKS5nZXRMZW5ndGgoKSwgbGF5ZXIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFkZFRvTGF5ZXJ0cmVlKSB7XG4gICAgICAgICAgICB0aGlzLmFkZEludG9MYXllclRyZWUobGF5ZXIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsYXllcjtcbiAgICB9XG5cbiAgICByZW1vdmVMYXllcihsYXllcjogb2wubGF5ZXIuQmFzZSk6IHZvaWQge1xuICAgICAgICB0aGlzLm9sTWFwLnJlbW92ZUxheWVyKGxheWVyKTtcbiAgICB9XG5cbiAgICBtb3ZlTGF5ZXIodXVpZDogc3RyaW5nLCBvbGRQb3M6IG51bWJlciwgbmV3UG9zOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgbGV0IGxheWVyOiBvbC5sYXllci5CYXNlID0gdGhpcy5maW5kTGF5ZXIodXVpZCk7XG4gICAgICAgIGlmIChsYXllciBpbnN0YW5jZW9mIG9sLmxheWVyLkltYWdlKSB7XG4gICAgICAgICAgICBsZXQgZ3JvdXA6IG9sLmxheWVyLkdyb3VwID0gPG9sLmxheWVyLkdyb3VwPiB0aGlzLmZpbmRMYXllcihMQVlFUl9JTUFHRSk7XG4gICAgICAgICAgICBsZXQgbGF5ZXJsbCA9IGdyb3VwLmdldExheWVycygpLnJlbW92ZShsYXllcik7XG4gICAgICAgICAgICBncm91cC5nZXRMYXllcnMoKS5pbnNlcnRBdChuZXdQb3MsIGxheWVybGwpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZmluZExheWVyKHV1aWQ6IHN0cmluZyk6IG9sLmxheWVyLkJhc2Uge1xuICAgICAgICBsZXQgbGF5ZXJzID0gdGhpcy5vbE1hcC5nZXRMYXllcnMoKS5nZXRBcnJheSgpO1xuICAgICAgICBmb3IgKGxldCBsYXllciBvZiBsYXllcnMpIHtcbiAgICAgICAgICAgIGxldCBzb3VyY2U6IG9sLnNvdXJjZS5Tb3VyY2U7XG4gICAgICAgICAgICBpZiAobGF5ZXIuZ2V0KFVVSUQpID09PSB1dWlkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxheWVyO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChsYXllciBpbnN0YW5jZW9mIG9sLmxheWVyLkdyb3VwKSB7XG4gICAgICAgICAgICAgICAgbGV0IHN1YmxheWVycyA9ICg8b2wubGF5ZXIuR3JvdXA+bGF5ZXIpLmdldExheWVycygpLmdldEFycmF5KCk7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgc3VibGF5ZXIgb2Ygc3VibGF5ZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzdWJsYXllci5nZXQoVVVJRCkgPT09IHV1aWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzdWJsYXllcjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICB1cGRhdGVNYXAoKTogdm9pZCB7XG4gICAgICAgIHRoaXMub2xNYXAudXBkYXRlU2l6ZSgpO1xuICAgICAgICB0aGlzLnpvb21Ub0V4dGVudCh0aGlzLnN0YXJ0RXh0ZW50LmdldFBvbHlnb25Gb3JFeHRlbnQodGhpcy5vbE1hcC5nZXRWaWV3KCkuZ2V0UHJvamVjdGlvbigpKSk7XG4gICAgfVxuXG4gICAgY2hhbmdlQ3JzKGNyczogc3RyaW5nKSB7IC8vIFRPRE9cbiAgICAgICAgbGV0IHRvUHJvaiA9IG51bGw7XG4gICAgICAgIGlmICgodG9Qcm9qID0gb2wucHJvai5nZXQoY3JzKSkpIHtcbiAgICAgICAgICAgIGxldCBleHRlbnQgPSBPbDRFeHRlbnQuZnJvbUFycmF5KFxuICAgICAgICAgICAgICAgIHRoaXMub2xNYXAuZ2V0VmlldygpLmNhbGN1bGF0ZUV4dGVudCh0aGlzLm9sTWFwLmdldFNpemUoKSksXG4gICAgICAgICAgICAgICAgdGhpcy5nZXRQcm9qZWN0aW9uKClcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBsZXQgZnJvbVByb2ogPSB0aGlzLmdldFByb2plY3Rpb24oKTtcbiAgICAgICAgICAgIC8vIGxldCBjZW50ZXIgPSB0aGlzLm9sTWFwLmdldFZpZXcoKS5nZXRDZW50ZXIoKTtcbiAgICAgICAgICAgIC8vIGxldCBsYXllcnMgPSAoPG9sLmxheWVyLkdyb3VwPnRoaXMuZmluZExheWVyKExBWUVSX0lNQUdFKSkuZ2V0TGF5ZXJzKCkuZ2V0QXJyYXkoKTtcbiAgICAgICAgICAgIHRoaXMub2xNYXAuc2V0VmlldyhcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZVZpZXcoXG4gICAgICAgICAgICAgICAgICAgIHRvUHJvaixcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXhFeHRlbnQuZ2V0RXh0ZW50KHRvUHJvaiksXG4gICAgICAgICAgICAgICAgICAgIE9sNFV0aWxzLnJlc29sdXRpb25zRm9yU2NhbGVzKHRoaXMuc2NhbGVzLCB0b1Byb2ouZ2V0VW5pdHMoKSkucmV2ZXJzZSgpXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHRoaXMuY2hhbmdlRm9ySUxheWVyc0koKDxvbC5sYXllci5Hcm91cD50aGlzLmZpbmRMYXllcihMQVlFUl9JTUFHRSkpLmdldExheWVycygpLCBmcm9tUHJvaiwgdG9Qcm9qKTtcbiAgICAgICAgICAgIHRoaXMuY2hhbmdlRm9yVkxheWVycygoPG9sLmxheWVyLkdyb3VwPnRoaXMuZmluZExheWVyKExBWUVSX1ZFQ1RPUikpLmdldExheWVycygpLCBmcm9tUHJvaiwgdG9Qcm9qKTtcbiAgICAgICAgICAgIHRoaXMuem9vbVRvRXh0ZW50KGV4dGVudC5nZXRQb2x5Z29uRm9yRXh0ZW50KHRvUHJvaikpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjaGFuZ2VGb3JWTGF5ZXJzKGxheWVyczogb2wuQ29sbGVjdGlvbjxvbC5sYXllci5CYXNlPiwgZnJvbVByb2osIHRvUHJvaikge1xuICAgICAgICBmb3IgKGxldCBsYXllciBvZiBsYXllcnMuZ2V0QXJyYXkoKSkge1xuICAgICAgICAgICAgdGhpcy52ZWNTb3VyY2UucmVwcm9qZWN0aW9uU291cmNlKGxheWVyLCBmcm9tUHJvaiwgdG9Qcm9qKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgY2hhbmdlRm9ySUxheWVyc0kobGF5ZXJzOiBvbC5Db2xsZWN0aW9uPG9sLmxheWVyLkJhc2U+LCBmcm9tUHJvaiwgdG9Qcm9qKSB7XG4gICAgICAgIGZvciAobGV0IGxheWVyIG9mIGxheWVycy5nZXRBcnJheSgpKSB7XG4gICAgICAgICAgICB0aGlzLndtc1NvdXJjZS5yZXByb2plY3Rpb25Tb3VyY2UoPG9sLmxheWVyLkltYWdlPmxheWVyLCBmcm9tUHJvaiwgdG9Qcm9qKTtcbiAgICAgICAgICAgIGxldCBzb3VyY2UgPSA8b2wuc291cmNlLkltYWdlV01TPig8b2wubGF5ZXIuSW1hZ2U+bGF5ZXIpLmdldFNvdXJjZSgpO1xuICAgICAgICAgICAgbGV0IGlsZjogb2wuSW1hZ2VMb2FkRnVuY3Rpb25UeXBlID0gc291cmNlLmdldEltYWdlTG9hZEZ1bmN0aW9uKCk7XG4gICAgICAgICAgICBzb3VyY2Uuc2V0SW1hZ2VMb2FkRnVuY3Rpb24oaWxmKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldFZpc2libGUobGF5ZXI6IG9sLmxheWVyLkJhc2UgfCBzdHJpbmcsIHZpc2libGl0eTogYm9vbGVhbik6IHZvaWQge1xuICAgICAgICBsZXQgX2xheWVyOiBvbC5sYXllci5CYXNlID0gbGF5ZXIgaW5zdGFuY2VvZiBvbC5sYXllci5CYXNlID8gbGF5ZXIgOiB0aGlzLmZpbmRMYXllcig8c3RyaW5nPmxheWVyKTtcbiAgICAgICAgaWYgKF9sYXllcikge1xuICAgICAgICAgICAgX2xheWVyLnNldFZpc2libGUodmlzaWJsaXR5KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldE9wYWNpdHkobGF5ZXI6IG9sLmxheWVyLkJhc2UgfCBzdHJpbmcsIG9wYWNpdHk6IG51bWJlcik6IHZvaWQge1xuICAgICAgICBsZXQgX2xheWVyOiBvbC5sYXllci5CYXNlID0gbGF5ZXIgaW5zdGFuY2VvZiBvbC5sYXllci5CYXNlID8gbGF5ZXIgOiB0aGlzLmZpbmRMYXllcig8c3RyaW5nPmxheWVyKTtcbiAgICAgICAgaWYgKF9sYXllcikge1xuICAgICAgICAgICAgX2xheWVyLnNldE9wYWNpdHkob3BhY2l0eSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjbGVhckZlYXR1cmVzKCkge1xuICAgICAgICB0aGlzLnZlY1NvdXJjZS5jbGVhckZlYXR1cmVzKHRoaXMuaGdMYXllcik7XG4gICAgfVxuXG4gICAgc2hvd0ZlYXR1cmVzKGdlb0pzb246IE9iamVjdCkge1xuICAgICAgICB0aGlzLnZlY1NvdXJjZS5zaG93RmVhdHVyZXModGhpcy5oZ0xheWVyLCBnZW9Kc29uKTtcbiAgICB9XG5cbiAgICBnZXRGaXJzdEdlb21Gb3JTZWFyY2goKTogb2JqZWN0IHtcbiAgICAgICAgbGV0IGZlYXR1cmVzID0gdGhpcy5kcmF3ZXIuZ2V0TGF5ZXIoKS5nZXRTb3VyY2UoKS5nZXRGZWF0dXJlcygpO1xuICAgICAgICBpZihmZWF0dXJlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGxldCBnZW9qc29uID0gbmV3IG9sLmZvcm1hdC5HZW9KU09OKCkud3JpdGVGZWF0dXJlT2JqZWN0KFxuICAgICAgICAgICAgZmVhdHVyZXNbMF0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgJ2RhdGFQcm9qZWN0aW9uJzogTUVUQURPUl9FUFNHLFxuICAgICAgICAgICAgICAgICdmZWF0dXJlUHJvamVjdGlvbic6IHRoaXMuZ2V0UHJvamVjdGlvbigpXG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICAgIGdlb2pzb25bJ2Jib3gnXSA9IG5ldyBPbDRHZW9tKGZlYXR1cmVzWzBdLmdldEdlb21ldHJ5KCksIHRoaXMuZ2V0UHJvamVjdGlvbigpKVxuICAgICAgICAgICAgLmdldEV4dGVudChvbC5wcm9qLmdldChNRVRBRE9SX0VQU0cpKTtcbiAgICAgICAgcmV0dXJuIGdlb2pzb247XG4gICAgfVxuXG4gICAgZHJhd0dlb21ldHJ5Rm9yU2VhcmNoKGdlb0pzb246IE9iamVjdCwgb25EcmF3RW5kOiBGdW5jdGlvbiA9IG51bGwpIHtcbiAgICAgICAgbGV0IG9sNG1hcCA9IHRoaXM7XG4gICAgICAgIGxldCBvbE1hcCA9IHRoaXMub2xNYXA7XG4gICAgICAgIHRoaXMudmVjU291cmNlLmNsZWFyRmVhdHVyZXModGhpcy5kcmF3ZXIuZ2V0TGF5ZXIoKSk7XG4gICAgICAgIHRoaXMudmVjU291cmNlLnNob3dGZWF0dXJlcyh0aGlzLmRyYXdlci5nZXRMYXllcigpLCBnZW9Kc29uKTtcbiAgICAgICAgbGV0IG11bHRpUG9pbnQ6IG9sLmdlb20uTXVsdGlQb2ludCA9IDxvbC5nZW9tLk11bHRpUG9pbnQ+IE9sNEV4dGVudC5mcm9tQXJyYXkoXG4gICAgICAgICAgICB0aGlzLmRyYXdlci5nZXRMYXllcigpLmdldFNvdXJjZSgpLmdldEV4dGVudCgpLFxuICAgICAgICAgICAgdGhpcy5vbE1hcC5nZXRWaWV3KCkuZ2V0UHJvamVjdGlvbigpXG4gICAgICAgICkuZ2V0R2VvbSgpO1xuICAgICAgICBsZXQgbWF4ZXh0ZW50ID0gdGhpcy5tYXhFeHRlbnQuZ2V0UG9seWdvbkZvckV4dGVudCh0aGlzLm9sTWFwLmdldFZpZXcoKS5nZXRQcm9qZWN0aW9uKCkpO1xuICAgICAgICBpZiAobWF4ZXh0ZW50LmludGVyc2VjdHNDb29yZGluYXRlKG11bHRpUG9pbnQuZ2V0UG9pbnQoMCkuZ2V0Q29vcmRpbmF0ZXMoKSlcbiAgICAgICAgICAgIHx8IG1heGV4dGVudC5pbnRlcnNlY3RzQ29vcmRpbmF0ZShtdWx0aVBvaW50LmdldFBvaW50KDEpLmdldENvb3JkaW5hdGVzKCkpKSB7XG4gICAgICAgICAgICB0aGlzLnpvb21Ub0V4dGVudCh0aGlzLmRyYXdlci5nZXRMYXllcigpLmdldFNvdXJjZSgpLmdldEV4dGVudCgpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1ldGFkb3IuZGlzcGxheUVycm9yKCdEaWUgR2VvbWV0cmllIGlzdCBhdcOfZXJoYWxiIGRlciByw6R1bWxpY2hlbiBFcnN0cmVja3VuZy4nKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgZ2VvRmVhdHVyZSA9IHRoaXMuZ2V0Rmlyc3RHZW9tRm9yU2VhcmNoKCk7XG4gICAgICAgIGlmIChvbkRyYXdFbmQgIT09IG51bGwgJiYgZ2VvRmVhdHVyZSkge1xuICAgICAgICAgICAgb25EcmF3RW5kKGdlb0ZlYXR1cmUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZHJhd1NoYXBlRm9yU2VhcmNoKHNoYXBlVHlwZTogU0hBUEVTID0gbnVsbCwgb25EcmF3RW5kOiBGdW5jdGlvbiA9IG51bGwpIHtcbiAgICAgICAgdGhpcy5zZXREb3VibGVDbGlja1pvb20oZmFsc2UpO1xuICAgICAgICBsZXQgb2w0bWFwID0gdGhpcztcbiAgICAgICAgbGV0IG9sTWFwID0gdGhpcy5vbE1hcDtcbiAgICAgICAgY29uc3Qgc2hhcGU6IFNIQVBFUyA9IHR5cGVvZiBzaGFwZVR5cGUgPT09ICdzdHJpbmcnID8gU0hBUEVTWzxzdHJpbmc+IHNoYXBlVHlwZV0gOiBzaGFwZVR5cGU7XG4gICAgICAgIGlmICh0aGlzLmRyYXdlci5nZXRJbnRlcmFjdGlvbigpKSB7XG4gICAgICAgICAgICB0aGlzLm9sTWFwLnJlbW92ZUludGVyYWN0aW9uKHRoaXMuZHJhd2VyLmdldEludGVyYWN0aW9uKCkpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZHJhd2VyLnNldEludGVyYWN0aW9uKHNoYXBlLCBPbDRVdGlscy5nZXRTdHlsZSh0aGlzLnN0eWxlc1snc2VhcmNoJ10pKTtcbiAgICAgICAgaWYgKHRoaXMuZHJhd2VyLmdldEludGVyYWN0aW9uKCkpIHtcbiAgICAgICAgICAgIGxldCBkcmF3ZXIgPSB0aGlzLmRyYXdlcjtcbiAgICAgICAgICAgIHRoaXMuZ2V0RHJhd2VyKCkuZ2V0TGF5ZXIoKS5nZXRTb3VyY2UoKS5jbGVhcigpO1xuICAgICAgICAgICAgdGhpcy5vbE1hcC5hZGRJbnRlcmFjdGlvbih0aGlzLmRyYXdlci5nZXRJbnRlcmFjdGlvbigpKTtcbiAgICAgICAgICAgIHRoaXMuZHJhd2VyLmdldEludGVyYWN0aW9uKCkub24oXG4gICAgICAgICAgICAgICAgJ2RyYXdzdGFydCcsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgb2w0bWFwLmdldERyYXdlcigpLmdldExheWVyKCkuZ2V0U291cmNlKCkuY2xlYXIoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgdGhpcy5kcmF3ZXIuZ2V0SW50ZXJhY3Rpb24oKS5vbihcbiAgICAgICAgICAgICAgICAnZHJhd2VuZCcsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGdlb2pzb24gPSBuZXcgb2wuZm9ybWF0Lkdlb0pTT04oKS53cml0ZUZlYXR1cmVPYmplY3QoXG4gICAgICAgICAgICAgICAgICAgICAgICBlLmZlYXR1cmUsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RhdGFQcm9qZWN0aW9uJzogTUVUQURPUl9FUFNHLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdmZWF0dXJlUHJvamVjdGlvbic6IG9sNG1hcC5nZXRQcm9qZWN0aW9uKClcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgZ2VvanNvblsnYmJveCddID0gbmV3IE9sNEdlb20oZS5mZWF0dXJlLmdldEdlb21ldHJ5KCksIG9sNG1hcC5nZXRQcm9qZWN0aW9uKCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAuZ2V0RXh0ZW50KG9sLnByb2ouZ2V0KE1FVEFET1JfRVBTRykpO1xuICAgICAgICAgICAgICAgICAgICBvbkRyYXdFbmQoZ2VvanNvbik7XG4gICAgICAgICAgICAgICAgICAgIG9sTWFwLnJlbW92ZUludGVyYWN0aW9uKGRyYXdlci5nZXRJbnRlcmFjdGlvbigpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5nZXREcmF3ZXIoKS5nZXRMYXllcigpLmdldFNvdXJjZSgpLmNsZWFyKCk7XG4gICAgICAgICAgICBvbkRyYXdFbmQobnVsbCk7XG4gICAgICAgICAgICB0aGlzLnNldERvdWJsZUNsaWNrWm9vbSh0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFjdGl2YXRlcyAvIGRlYWN0aXZhdGVzIGludGVyYWN0aW9uIG9sLmludGVyYWN0aW9uLkRvdWJsZUNsaWNrWm9vbVxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gc3RhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIHNldERvdWJsZUNsaWNrWm9vbShzdGF0ZTogYm9vbGVhbikge1xuICAgICAgICBmb3IgKGxldCBpbnRlcmFjdGlvbiBvZiB0aGlzLm9sTWFwLmdldEludGVyYWN0aW9ucygpLmdldEFycmF5KCkpIHtcbiAgICAgICAgICAgIGlmIChpbnRlcmFjdGlvbiBpbnN0YW5jZW9mIG9sLmludGVyYWN0aW9uLkRvdWJsZUNsaWNrWm9vbSkge1xuICAgICAgICAgICAgICAgIGludGVyYWN0aW9uLnNldEFjdGl2ZShzdGF0ZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBlbnVtIFNIQVBFUyB7Tk9ORSwgQk9YLCBQT0xZR09OfVxuO1xuXG5leHBvcnQgY2xhc3MgT2w0RHJhd2VyIHtcbiAgICAvLyBwcml2YXRlIHN0YXRpYyBfaW5zdGFuY2U6IE9sNERyYXdlcjtcbiAgICBwcm90ZWN0ZWQgbGF5ZXI6IG9sLmxheWVyLlZlY3RvcjtcbiAgICBwcm90ZWN0ZWQgaW50ZXJhY3Rpb246IG9sLmludGVyYWN0aW9uLkRyYXc7XG5cbiAgICBjb25zdHJ1Y3RvcihsYXllcjogb2wubGF5ZXIuVmVjdG9yKSB7XG4gICAgICAgIHRoaXMubGF5ZXIgPSBsYXllcjtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0TGF5ZXIoKTogb2wubGF5ZXIuVmVjdG9yIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubGF5ZXI7XG4gICAgfVxuXG4gICAgcHVibGljIGdldEludGVyYWN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnRlcmFjdGlvbjtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0SW50ZXJhY3Rpb24odHlwZTogU0hBUEVTLCBkcmF3U3R5bGU6IG9sLnN0eWxlLlN0eWxlKSB7XG4gICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgY2FzZSBTSEFQRVMuQk9YOlxuICAgICAgICAgICAgICAgIHRoaXMuaW50ZXJhY3Rpb24gPSBuZXcgb2wuaW50ZXJhY3Rpb24uRHJhdyh7XG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogdGhpcy5sYXllci5nZXRTb3VyY2UoKSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ0NpcmNsZScsXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiBkcmF3U3R5bGUsXG4gICAgICAgICAgICAgICAgICAgIGdlb21ldHJ5RnVuY3Rpb246IGNyZWF0ZUJveCgpIC8vIG9sLmQudHMgaGFzIG5vIGZ1bmN0aW9uIFwib2wuaW50ZXJhY3Rpb24uRHJhdy5jcmVhdGVCb3goKVwiXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFNIQVBFUy5QT0xZR09OOlxuICAgICAgICAgICAgICAgIHRoaXMuaW50ZXJhY3Rpb24gPSBuZXcgb2wuaW50ZXJhY3Rpb24uRHJhdyh7XG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogdGhpcy5sYXllci5nZXRTb3VyY2UoKSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ1BvbHlnb24nLFxuICAgICAgICAgICAgICAgICAgICBzdHlsZTogZHJhd1N0eWxlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRoaXMuaW50ZXJhY3Rpb24gPSBudWxsO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIG9sLmQudHMgaGFzIG5vIGZ1bmN0aW9uIFwib2wuaW50ZXJhY3Rpb24uRHJhdy5jcmVhdGVCb3goKVwiXG4gKiBAcmV0dXJucyB7KGNvb3JkaW5hdGVzOmFueSwgb3B0X2dlb21ldHJ5OmFueSk9PmFueXxvbC5nZW9tLlBvbHlnb259XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVCb3goKSB7XG4gICAgcmV0dXJuIChcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSB7b2wuQ29vcmRpbmF0ZXxBcnJheS48b2wuQ29vcmRpbmF0ZT58QXJyYXkuPEFycmF5LjxvbC5Db29yZGluYXRlPj59IGNvb3JkaW5hdGVzXG4gICAgICAgICAqIEBwYXJhbSB7b2wuZ2VvbS5TaW1wbGVHZW9tZXRyeT19IG9wdF9nZW9tZXRyeVxuICAgICAgICAgKiBAcmV0dXJuIHtvbC5nZW9tLlNpbXBsZUdlb21ldHJ5fVxuICAgICAgICAgKi9cbiAgICAgICAgZnVuY3Rpb24gKGNvb3JkaW5hdGVzLCBvcHRfZ2VvbWV0cnkpIHtcbiAgICAgICAgICAgIHZhciBleHRlbnQgPSBvbC5leHRlbnQuYm91bmRpbmdFeHRlbnQoY29vcmRpbmF0ZXMpO1xuICAgICAgICAgICAgdmFyIGdlb21ldHJ5ID0gb3B0X2dlb21ldHJ5IHx8IG5ldyBvbC5nZW9tLlBvbHlnb24obnVsbCk7XG4gICAgICAgICAgICBnZW9tZXRyeS5zZXRDb29yZGluYXRlcyhbW1xuICAgICAgICAgICAgICAgIG9sLmV4dGVudC5nZXRCb3R0b21MZWZ0KGV4dGVudCksXG4gICAgICAgICAgICAgICAgb2wuZXh0ZW50LmdldEJvdHRvbVJpZ2h0KGV4dGVudCksXG4gICAgICAgICAgICAgICAgb2wuZXh0ZW50LmdldFRvcFJpZ2h0KGV4dGVudCksXG4gICAgICAgICAgICAgICAgb2wuZXh0ZW50LmdldFRvcExlZnQoZXh0ZW50KSxcbiAgICAgICAgICAgICAgICBvbC5leHRlbnQuZ2V0Qm90dG9tTGVmdChleHRlbnQpXG4gICAgICAgICAgICBdXSk7XG4gICAgICAgICAgICByZXR1cm4gZ2VvbWV0cnk7XG4gICAgICAgIH1cbiAgICApO1xufVxuXG5kZWNsYXJlIHZhciBtZXRhZG9yOiBhbnk7IiwiaW1wb3J0IHtUSVRMRSwgVVVJRCwgTEFZRVJfVVVJRCwgT2w0TWFwfSBmcm9tIFwiLi9PbDRcIjtcbmltcG9ydCB7TGF5ZXJUcmVlfSBmcm9tICcuL0xheWVyVHJlZSc7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBPbDRTb3VyY2Uge1xuXG4gICAgYWJzdHJhY3QgY3JlYXRlTGF5ZXIobGF5ZXJVdWlkOiBzdHJpbmcsIG9wdGlvbnM6IGFueSwgcHJvajogb2wuUHJvamVjdGlvbkxpa2UsIHZpc2libGU6IGJvb2xlYW4sIG9wYWNpdHk6IG51bWJlcik6IG9sLmxheWVyLkJhc2U7XG5cbiAgICBhYnN0cmFjdCByZXByb2plY3Rpb25Tb3VyY2UobGF5ZXI6IG9sLmxheWVyLkJhc2UsIGZyb21Qcm9qOiBvbC5Qcm9qZWN0aW9uTGlrZSwgdG9Qcm9qOiBvbC5Qcm9qZWN0aW9uTGlrZSk7XG5cbiAgICBhYnN0cmFjdCBjbG9uZUxheWVyKGxheWVyOiBvbC5sYXllci5CYXNlLCBmcm9tUHJvajogb2wuUHJvamVjdGlvbkxpa2UsIHRvUHJvajogb2wuUHJvamVjdGlvbkxpa2UpOiBvbC5sYXllci5CYXNlO1xufVxuXG5leHBvcnQgY2xhc3MgT2w0VmVjdG9yU291cmNlIGltcGxlbWVudHMgT2w0U291cmNlIHtcbiAgICBwcml2YXRlIHN0YXRpYyBfaW5zdGFuY2U6IE9sNFZlY3RvclNvdXJjZTtcbiAgICBwcm90ZWN0ZWQgc2hvd2FibGU6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICBwcml2YXRlIG9sNE1hcDogT2w0TWFwO1xuXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihvbDRNYXA6IE9sNE1hcCkge1xuICAgICAgICAvLyBzdXBlcihmYWxzZSk7XG4gICAgICAgIHRoaXMub2w0TWFwID0gb2w0TWFwO1xuICAgICAgICAvLyB0aGlzLnNldFNob3dhYmxlKGZhbHNlKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgY3JlYXRlKG9sNG1hcDogT2w0TWFwKTogT2w0VmVjdG9yU291cmNlIHtcbiAgICAgICAgaWYgKCFPbDRWZWN0b3JTb3VyY2UuX2luc3RhbmNlKSB7Ly8gc2luZ2xldG9uXG4gICAgICAgICAgICBPbDRWZWN0b3JTb3VyY2UuX2luc3RhbmNlID0gbmV3IE9sNFZlY3RvclNvdXJjZShvbDRtYXApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBPbDRWZWN0b3JTb3VyY2UuX2luc3RhbmNlO1xuICAgIH1cblxuICAgIGNyZWF0ZUxheWVyKGxheWVyVXVpZDogc3RyaW5nLCBvcHRpb25zOiBhbnksIHByb2o6IG9sLlByb2plY3Rpb25MaWtlLCB2aXNpYmxlOiBib29sZWFuID0gdHJ1ZSwgb3BhY2l0eTogbnVtYmVyID0gMS4wKTogb2wubGF5ZXIuQmFzZSB7XG4gICAgICAgIGxldCB2TGF5ZXIgPSBuZXcgb2wubGF5ZXIuVmVjdG9yKHtcbiAgICAgICAgICAgIHNvdXJjZTogbmV3IG9sLnNvdXJjZS5WZWN0b3Ioe3dyYXBYOiBmYWxzZX0pLFxuICAgICAgICAgICAgc3R5bGU6IG9wdGlvbnNbJ3N0eWxlJ11cbiAgICAgICAgfSk7XG4gICAgICAgIHZMYXllci5zZXQoVVVJRCwgbGF5ZXJVdWlkKTtcbiAgICAgICAgcmV0dXJuIHZMYXllcjtcbiAgICB9XG5cbiAgICByZXByb2plY3Rpb25Tb3VyY2UobGF5ZXI6IG9sLmxheWVyLkJhc2UsIGZyb21Qcm9qOiBvbC5Qcm9qZWN0aW9uTGlrZSwgdG9Qcm9qOiBvbC5Qcm9qZWN0aW9uTGlrZSkge1xuICAgICAgICBsZXQgc291cmNlID0gKDxvbC5sYXllci5MYXllcj5sYXllcikuZ2V0U291cmNlKCk7XG4gICAgICAgIGxldCBmZWF0dXJlczogb2wuRmVhdHVyZVtdID0gKDxvbC5zb3VyY2UuVmVjdG9yPnNvdXJjZSkuZ2V0RmVhdHVyZXMoKTtcbiAgICAgICAgZm9yIChsZXQgZmVhdHVyZSBvZiBmZWF0dXJlcykge1xuICAgICAgICAgICAgZmVhdHVyZS5zZXRHZW9tZXRyeShmZWF0dXJlLmdldEdlb21ldHJ5KCkudHJhbnNmb3JtKGZyb21Qcm9qLCB0b1Byb2opKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNsb25lTGF5ZXIobGF5ZXI6IG9sLmxheWVyLkJhc2UsIGZyb21Qcm9qOiBvbC5Qcm9qZWN0aW9uTGlrZSwgdG9Qcm9qOiBvbC5Qcm9qZWN0aW9uTGlrZSk6IG9sLmxheWVyLkJhc2Uge1xuICAgICAgICAvKiBUT0RPIGZvciBjbG9uZSAqL1xuICAgICAgICByZXR1cm4gbGF5ZXI7XG4gICAgfVxuXG4gICAgc2hvd0ZlYXR1cmVzKHZMYXllcjogb2wubGF5ZXIuVmVjdG9yLCBnZW9Kc29uOiBPYmplY3QpIHtcbiAgICAgICAgbGV0IGdlb0pzb25SZWFkZXI6IG9sLmZvcm1hdC5HZW9KU09OID0gbmV3IG9sLmZvcm1hdC5HZW9KU09OKCk7XG4gICAgICAgIGxldCBkYXRhcHJvaiA9IGdlb0pzb25SZWFkZXIucmVhZFByb2plY3Rpb24oZ2VvSnNvbik7XG4gICAgICAgIGxldCBmZWF0dXJlcyA9IGdlb0pzb25SZWFkZXIucmVhZEZlYXR1cmVzKFxuICAgICAgICAgICAgZ2VvSnNvbixcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAnZGF0YVByb2plY3Rpb24nOiBnZW9Kc29uUmVhZGVyLnJlYWRQcm9qZWN0aW9uKGdlb0pzb24pLFxuICAgICAgICAgICAgICAgICdmZWF0dXJlUHJvamVjdGlvbic6IHRoaXMub2w0TWFwLmdldFByb2plY3Rpb24oKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIHZMYXllci5nZXRTb3VyY2UoKS5hZGRGZWF0dXJlcyhmZWF0dXJlcyk7XG4gICAgfVxuXG4gICAgY2xlYXJGZWF0dXJlcyh2TGF5ZXI6IG9sLmxheWVyLlZlY3Rvcikge1xuICAgICAgICB2TGF5ZXIuZ2V0U291cmNlKCkuY2xlYXIodHJ1ZSk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgT2w0V21zU291cmNlIGltcGxlbWVudHMgT2w0U291cmNlIHtcbiAgICBwcml2YXRlIHN0YXRpYyBfaW5zdGFuY2U6IE9sNFdtc1NvdXJjZTtcbiAgICBwcml2YXRlIG9sNE1hcDogT2w0TWFwO1xuICAgIHByaXZhdGUgdXNlTG9hZEV2ZW50czogYm9vbGVhbjtcbiAgICBwdWJsaWMgc3RhdGljIG1hcEFjdGl2aXR5OiBNYXBBY3Rpdml0eTsvLyA9IE1hcEFjdGl2aXR5LmNyZWF0ZSgpO1xuICAgIHB1YmxpYyBkaXNhYmxlZDogYW55O1xuXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihvbDRNYXA6IE9sNE1hcCwgdXNlTG9hZEV2ZW50czogYm9vbGVhbiA9IHRydWUpIHtcbiAgICAgICAgdGhpcy5vbDRNYXAgPSBvbDRNYXA7XG4gICAgICAgIHRoaXMudXNlTG9hZEV2ZW50cyA9IHVzZUxvYWRFdmVudHM7XG4gICAgICAgIGlmICh0aGlzLnVzZUxvYWRFdmVudHMpIHtcbiAgICAgICAgICAgIE9sNFdtc1NvdXJjZS5tYXBBY3Rpdml0eSA9IE1hcEFjdGl2aXR5LmNyZWF0ZSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZGlzYWJsZWQgPSB7fTtcbiAgICB9XG5cbiAgICBzdGF0aWMgY3JlYXRlKG9sNE1hcDogT2w0TWFwLCB1c2VMb2FkRXZlbnRzOiBib29sZWFuID0gdHJ1ZSk6IE9sNFdtc1NvdXJjZSB7XG4gICAgICAgIGlmICghT2w0V21zU291cmNlLl9pbnN0YW5jZSkgey8vIHNpbmdsZXRvblxuICAgICAgICAgICAgT2w0V21zU291cmNlLl9pbnN0YW5jZSA9IG5ldyBPbDRXbXNTb3VyY2Uob2w0TWFwLCB1c2VMb2FkRXZlbnRzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gT2w0V21zU291cmNlLl9pbnN0YW5jZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYWRkRGlzYWJsZWQobGF5ZXI6IG9sLmxheWVyLkJhc2UpIHtcbiAgICAgICAgdGhpcy5kaXNhYmxlZFtsYXllci5nZXQoVVVJRCldID0gbGF5ZXIuZ2V0KFVVSUQpO1xuICAgICAgICB0aGlzLm9sNE1hcC5nZXRMYXllclRyZWUoKS5zZXREaXNhYmxlKGxheWVyLCB0cnVlKTtcbiAgICAgICAgdGhpcy5vbDRNYXAuc2V0VmlzaWJsZShsYXllciwgZmFsc2UpO1xuICAgIH1cblxuICAgIHB1YmxpYyByZW1vdmVEaXNhYmxlZChsYXllcjogb2wubGF5ZXIuQmFzZSkge1xuICAgICAgICBpZiAobGF5ZXIuZ2V0KFVVSUQpKXtcbiAgICAgICAgICAgIHRoaXMub2w0TWFwLmdldExheWVyVHJlZSgpLnNldERpc2FibGUobGF5ZXIsIGZhbHNlKTtcbiAgICAgICAgICAgIGxldCB2aXNpYmxlID0gdGhpcy5vbDRNYXAuZ2V0TGF5ZXJUcmVlKCkuZ2V0VmlzaWJsZShsYXllcik7XG4gICAgICAgICAgICB0aGlzLm9sNE1hcC5zZXRWaXNpYmxlKGxheWVyLCB2aXNpYmxlKTtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLmRpc2FibGVkW2xheWVyLmdldChVVUlEKV07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjcmVhdGVMYXllcihsYXllclV1aWQ6IHN0cmluZywgb3B0aW9uczogYW55ID0gbnVsbCwgcHJvajogb2wuUHJvamVjdGlvbkxpa2UsIHZpc2libGU6IGJvb2xlYW4sIG9wYWNpdHk6IG51bWJlcik6IG9sLmxheWVyLkJhc2Uge1xuICAgICAgICBsZXQgc291cmNlID0gdGhpcy5jcmVhdGVTb3VyY2UobGF5ZXJVdWlkLCBvcHRpb25zWyd1cmwnXSwgb3B0aW9uc1sncGFyYW1zJ10sIHByb2opO1xuICAgICAgICBsZXQgbGF5ZXJXbXMgPSB0aGlzLl9jcmVhdGVMYXllcihsYXllclV1aWQsIHZpc2libGUsIG9wYWNpdHksIHNvdXJjZSwgb3B0aW9uc1sndGl0bGUnXSA/IG9wdGlvbnNbJ3RpdGxlJ10gOiBudWxsKTtcbiAgICAgICAgcmV0dXJuIGxheWVyV21zO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2NyZWF0ZUxheWVyKGxheWVyVXVpZDogc3RyaW5nLCB2aXNpYmxlOiBib29sZWFuLCBvcGFjaXR5OiBudW1iZXIsIHNvdXJjZTogb2wuc291cmNlLkltYWdlV01TLCB0aXRsZTogc3RyaW5nID0gbnVsbCkge1xuICAgICAgICBsZXQgbGF5ZXJXbXMgPSBuZXcgb2wubGF5ZXIuSW1hZ2Uoe1xuICAgICAgICAgICAgc291cmNlOiBzb3VyY2UsXG4gICAgICAgICAgICB2aXNpYmxlOiB2aXNpYmxlLFxuICAgICAgICAgICAgb3BhY2l0eTogb3BhY2l0eVxuICAgICAgICB9KTtcbiAgICAgICAgbGF5ZXJXbXMuc2V0KFVVSUQsIGxheWVyVXVpZCk7XG4gICAgICAgIGlmICh0aXRsZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgbGF5ZXJXbXMuc2V0KFRJVExFLCB0aXRsZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxheWVyV21zO1xuICAgIH1cblxuICAgIHByaXZhdGUgY3JlYXRlU291cmNlKGxheWVyVXVpZDogc3RyaW5nLCB1cmw6IHN0cmluZywgcGFyYW1zOiBhbnksIHByb2o6IG9sLlByb2plY3Rpb25MaWtlKTogb2wuc291cmNlLkltYWdlV01TIHtcbiAgICAgICAgbGV0IHNvdXJjZSA9IG5ldyBvbC5zb3VyY2UuSW1hZ2VXTVMoe1xuICAgICAgICAgICAgdXJsOiB1cmwsXG4gICAgICAgICAgICBwYXJhbXM6IHBhcmFtcyxcbiAgICAgICAgICAgIHByb2plY3Rpb246IHByb2pcbiAgICAgICAgfSk7XG4gICAgICAgIHNvdXJjZS5zZXQoTEFZRVJfVVVJRCwgbGF5ZXJVdWlkKTtcbiAgICAgICAgdGhpcy5zZXRMb2FkRXZlbnRzKHNvdXJjZSk7XG4gICAgICAgIHJldHVybiBzb3VyY2U7XG4gICAgfVxuXG4gICAgcmVwcm9qZWN0aW9uU291cmNlKGxheWVyOiBvbC5sYXllci5CYXNlLCBmcm9tUHJvajogb2wuUHJvamVjdGlvbkxpa2UsIHRvUHJvajogb2wuUHJvamVjdGlvbkxpa2UpIHtcbiAgICAgICAgbGV0IG9sZHNvdXJjZSA9IDxvbC5zb3VyY2UuSW1hZ2VXTVM+KDxvbC5sYXllci5MYXllcj5sYXllcikuZ2V0U291cmNlKCk7XG4gICAgICAgIGxldCBuZXdTb3VyY2UgPSB0aGlzLmNyZWF0ZVNvdXJjZShsYXllci5nZXQoVVVJRCksIG9sZHNvdXJjZS5nZXRVcmwoKSwgb2xkc291cmNlLmdldFBhcmFtcygpLCB0b1Byb2opO1xuICAgICAgICAoPG9sLmxheWVyLkxheWVyPmxheWVyKS5zZXRTb3VyY2UobmV3U291cmNlKTtcbiAgICAgICAgdGhpcy5yZW1vdmVEaXNhYmxlZChsYXllcik7XG4gICAgfVxuXG4gICAgY2xvbmVMYXllcihsYXllcjogb2wubGF5ZXIuQmFzZSwgZnJvbVByb2o6IG9sLlByb2plY3Rpb25MaWtlLCB0b1Byb2o6IG9sLlByb2plY3Rpb25MaWtlKTogb2wubGF5ZXIuQmFzZSB7XG4gICAgICAgIGxldCBvbGRzb3VyY2UgPSA8b2wuc291cmNlLkltYWdlV01TPig8b2wubGF5ZXIuTGF5ZXI+bGF5ZXIpLmdldFNvdXJjZSgpO1xuICAgICAgICBsZXQgbmV3U291cmNlID0gdGhpcy5jcmVhdGVTb3VyY2UobGF5ZXIuZ2V0KFVVSUQpLCBvbGRzb3VyY2UuZ2V0VXJsKCksIG9sZHNvdXJjZS5nZXRQYXJhbXMoKSwgdG9Qcm9qKTtcbiAgICAgICAgbGV0IG9sZExheWVyID0gKDxvbC5sYXllci5MYXllcj5sYXllcik7XG4gICAgICAgIGxldCBuZXdMYXllciA9IHRoaXMuX2NyZWF0ZUxheWVyKG9sZExheWVyLmdldChVVUlEKSwgb2xkTGF5ZXIuZ2V0VmlzaWJsZSgpLCBvbGRMYXllci5nZXRPcGFjaXR5KCksIG5ld1NvdXJjZSwgb2xkTGF5ZXIuZ2V0KFRJVExFKSk7XG4gICAgICAgIHJldHVybiBuZXdMYXllcjtcbiAgICB9XG5cblxuICAgIHByaXZhdGUgc2V0TG9hZEV2ZW50cyhzb3VyY2U6IG9sLnNvdXJjZS5JbWFnZVdNUykge1xuICAgICAgICBpZiAodGhpcy51c2VMb2FkRXZlbnRzKSB7XG4gICAgICAgICAgICAvLyBzb3VyY2Uuc2V0SW1hZ2VMb2FkRnVuY3Rpb24odGhpcy5pbWFnZUxvYWRGdW5jdGlvbi5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIHNvdXJjZS5vbignaW1hZ2Vsb2Fkc3RhcnQnLCB0aGlzLmltYWdlTG9hZFN0YXJ0LmJpbmQodGhpcykpO1xuICAgICAgICAgICAgc291cmNlLm9uKCdpbWFnZWxvYWRlbmQnLCB0aGlzLmltYWdlTG9hZEVuZC5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIHNvdXJjZS5vbignaW1hZ2Vsb2FkZXJyb3InLCB0aGlzLmltYWdlTG9hZEVycm9yLmJpbmQodGhpcykpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaW1hZ2VMb2FkU3RhcnQoZTogb2wuc291cmNlLkltYWdlRXZlbnQpIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ3N0YXJ0JywgKDxvbC5zb3VyY2UuSW1hZ2VXTVM+ZS50YXJnZXQpLmdldChMQVlFUl9VVUlEKSk7XG4gICAgICAgIGlmIChPbDRXbXNTb3VyY2UubWFwQWN0aXZpdHkpIHtcbiAgICAgICAgICAgIE9sNFdtc1NvdXJjZS5tYXBBY3Rpdml0eS5sb2FkU3RhcnQoKDxvbC5zb3VyY2UuSW1hZ2VXTVM+ZS50YXJnZXQpLmdldChMQVlFUl9VVUlEKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpbWFnZUxvYWRFbmQoZTogb2wuc291cmNlLkltYWdlRXZlbnQpIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ2VuZCcsICg8b2wuc291cmNlLkltYWdlV01TPmUudGFyZ2V0KS5nZXQoTEFZRVJfVVVJRCkpO1xuICAgICAgICBpZiAoT2w0V21zU291cmNlLm1hcEFjdGl2aXR5KSB7XG4gICAgICAgICAgICBPbDRXbXNTb3VyY2UubWFwQWN0aXZpdHkubG9hZEVuZCgoPG9sLnNvdXJjZS5JbWFnZVdNUz5lLnRhcmdldCkuZ2V0KExBWUVSX1VVSUQpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGltYWdlTG9hZEVycm9yKGU6IG9sLnNvdXJjZS5JbWFnZUV2ZW50KSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdlcnJvcicsICg8b2wuc291cmNlLkltYWdlV01TPmUudGFyZ2V0KS5nZXQoTEFZRVJfVVVJRCkpO1xuICAgICAgICBpZiAoT2w0V21zU291cmNlLm1hcEFjdGl2aXR5KSB7XG4gICAgICAgICAgICBPbDRXbXNTb3VyY2UubWFwQWN0aXZpdHkubG9hZEVycm9yKCg8b2wuc291cmNlLkltYWdlV01TPmUudGFyZ2V0KS5nZXQoTEFZRVJfVVVJRCkpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBsYXllciA9IHRoaXMub2w0TWFwLmZpbmRMYXllcigoPG9sLnNvdXJjZS5JbWFnZVdNUz5lLnRhcmdldCkuZ2V0KExBWUVSX1VVSUQpKTtcbiAgICAgICAgdGhpcy5hZGREaXNhYmxlZChsYXllcik7XG4gICAgfVxuXG59XG5cbmV4cG9ydCBjbGFzcyBNYXBBY3Rpdml0eSB7XG4gICAgcHJpdmF0ZSBzdGF0aWMgX2luc3RhbmNlOiBNYXBBY3Rpdml0eTtcbiAgICBwcml2YXRlIGxheWVyczogYW55ID0ge307XG4gICAgcHJpdmF0ZSBpc0xvYWRpbmc6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgIHByaXZhdGUgY29uc3RydWN0b3IoKSB7XG4gICAgfVxuXG4gICAgc3RhdGljIGNyZWF0ZSgpOiBNYXBBY3Rpdml0eSB7XG4gICAgICAgIGlmICghTWFwQWN0aXZpdHkuX2luc3RhbmNlKSB7Ly8gc2luZ2xldG9uXG4gICAgICAgICAgICBNYXBBY3Rpdml0eS5faW5zdGFuY2UgPSBuZXcgTWFwQWN0aXZpdHkoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gTWFwQWN0aXZpdHkuX2luc3RhbmNlO1xuICAgIH1cblxuICAgIHByaXZhdGUgYWN0aXZpdHlTdGFydChsYXllck5hbWU6IHN0cmluZykge1xuICAgICAgICB0aGlzLmxheWVyc1tsYXllck5hbWVdID0gdHJ1ZTtcbiAgICAgICAgaWYgKHRoaXMuaXNMb2FkaW5nID09PSBmYWxzZSkge1xuICAgICAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgd2luZG93WydtZXRhZG9yJ10ucHJlbG9hZGVyU3RhcnQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYWN0aXZpdHlFbmQobGF5ZXJOYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgaWYgKHRoaXMubGF5ZXJzW2xheWVyTmFtZV0pIHtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLmxheWVyc1tsYXllck5hbWVdO1xuICAgICAgICB9XG4gICAgICAgIGZvciAobGV0IGxheWVyTiBpbiB0aGlzLmxheWVycykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XG4gICAgICAgIHdpbmRvd1snbWV0YWRvciddLnByZWxvYWRlclN0b3AoKTtcbiAgICB9XG5cbiAgICBsb2FkU3RhcnQobGF5ZXJOYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5hY3Rpdml0eVN0YXJ0KGxheWVyTmFtZSk7XG4gICAgfVxuXG4gICAgbG9hZEVuZChsYXllck5hbWU6IHN0cmluZykge1xuICAgICAgICB0aGlzLmFjdGl2aXR5RW5kKGxheWVyTmFtZSk7XG4gICAgfVxuXG4gICAgbG9hZEVycm9yKGxheWVyTmFtZTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuYWN0aXZpdHlFbmQobGF5ZXJOYW1lKTtcbiAgICB9XG59XG4iLCJleHBvcnQgY2xhc3MgRUVsZW1lbnQge1xuICAgIHByaXZhdGUgX2VsZW1lbnQ6IEhUTUxFbGVtZW50O1xuXG4gICAgY29uc3RydWN0b3IoZWxlbWVudDogSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5fZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgfVxuXG4gICAgZ2V0IGVsZW1lbnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9lbGVtZW50O1xuICAgIH1cblxuICAgIHNldEF0dHJzKGF0dHJzOiBPYmplY3QgPSB7fSkge1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBhdHRycykge1xuICAgICAgICAgICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoa2V5LCBhdHRyc1trZXldKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldEF0dHIoa2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoa2V5LCB2YWx1ZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGdldEF0dHIoa2V5OiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2VsZW1lbnQuZ2V0QXR0cmlidXRlKGtleSk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgZG9tIHtcbiAgICAvLyBwcml2YXRlIHN0YXRpYyBkYXRhID0gZGF0YTtcblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIHRhZ25hbWVcbiAgICAgKiBAcGFyYW0gb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH1cbiAgICAgKi9cbiAgICBzdGF0aWMgY3JlYXRlKHRhZ25hbWU6IHN0cmluZywgYXR0cnM6IGFueSA9IHt9LCBjbGFzc2VzOiBzdHJpbmdbXSA9IFtdLCB0ZXh0OiBzdHJpbmcgPSAnJywgZGF0YTogYW55ID0ge30pOiBIVE1MRWxlbWVudCB7XG4gICAgICAgIGxldCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWduYW1lKTtcbiAgICAgICAgcmV0dXJuIGRvbS5hZGQoZWxlbWVudCwgYXR0cnMsIGNsYXNzZXMsIHRleHQsIGRhdGEpO1xuICAgIH1cblxuICAgIHN0YXRpYyBhZGQoZWxlbWVudDogSFRNTEVsZW1lbnQsIGF0dHJzOiBhbnkgPSB7fSwgY2xhc3Nlczogc3RyaW5nW10gPSBbXSwgdGV4dDogc3RyaW5nID0gJycsIGRhdGE6IGFueSA9IHt9KTogSFRNTEVsZW1lbnQge1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBhdHRycykge1xuICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoa2V5LCBhdHRyc1trZXldKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IG5hbWUgb2YgY2xhc3Nlcykge1xuICAgICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKG5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0ZXh0ICE9PSAnJykge1xuICAgICAgICAgICAgZWxlbWVudC50ZXh0Q29udGVudCA9IHRleHQ7XG4gICAgICAgIH1cbiAgICAgICAgLy8gZm9yIChjb25zdCBrZXkgaW4gZGF0YSkge1xuICAgICAgICAvLyAgICAgZWxlbWVudC5kYXRhc2V0W2tleV0gPSBkYXRhW2tleV07XG4gICAgICAgIC8vIH1cblxuICAgICAgICByZXR1cm4gZWxlbWVudDtcbiAgICB9XG5cbiAgICBzdGF0aWMgZGVsZXRlKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBhdHRyczogc3RyaW5nW10gPSBbXSwgY2xhc3Nlczogc3RyaW5nW10gPSBbXSwgdGV4dDogYm9vbGVhbiA9IGZhbHNlLCBkYXRhOiBhbnkgPSB7fSk6IEhUTUxFbGVtZW50IHtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgYXR0cnMpIHtcbiAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKGtleSk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBjbCBvZiBjbGFzc2VzKSB7XG4gICAgICAgICAgICBkb20ucmVtb3ZlQ2xhc3MoZWxlbWVudCwgY2wpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbGVtZW50O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIHNlbGVjdG9yXG4gICAgICogQHJldHVybnMge05vZGVMaXN0T2Y8RWxlbWVudD59XG4gICAgICovXG4gICAgc3RhdGljIGZpbmQoc2VsZWN0b3I6IHN0cmluZywgY29udGV4dDogYW55ID0gZG9jdW1lbnQpOiBOb2RlTGlzdE9mPEVsZW1lbnQ+IHtcbiAgICAgICAgaWYgKGNvbnRleHQgaW5zdGFuY2VvZiBEb2N1bWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGNvbnRleHQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gICAgICAgIH0gZWxzZSBpZiAoY29udGV4dCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gY29udGV4dC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsOyAvLyBUT0RPIHJldHVybiBhIGJsYW5rIE5vZGVMaXN0T2Y8RWxlbWVudD5cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIHNlbGVjdG9yXG4gICAgICogQHJldHVybnMge0VsZW1lbnR8bnVsbH1cbiAgICAgKi9cbiAgICBzdGF0aWMgZmluZEZpcnN0KHNlbGVjdG9yOiBzdHJpbmcsIGNvbnRleHQ6IGFueSA9IGRvY3VtZW50KTogRWxlbWVudCB7XG4gICAgICAgIGlmIChjb250ZXh0IGluc3RhbmNlb2YgRG9jdW1lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBjb250ZXh0LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgICAgICB9IGVsc2UgaWYgKGNvbnRleHQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGNvbnRleHQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0gbmFtZVxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIGFuIGVsZW1lbnQgY29udGFpbnMgYSBjbGFzcyBuYW1lXG4gICAgICovXG4gICAgc3RhdGljIGhhc0NsYXNzKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQgIT09IG51bGwgJiYgZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMobmFtZSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIGNvbnRleHRcbiAgICAgKiBAcGFyYW0gbmFtZVxuICAgICAqIEByZXR1cm5zIHtFbGVtZW50fVxuICAgICAqL1xuICAgIHN0YXRpYyBhZGRDbGFzcyhjb250ZXh0OiBIVE1MRWxlbWVudCwgbmFtZTogc3RyaW5nLCBzZWxlY3Rvcjogc3RyaW5nID0gbnVsbCk6IHZvaWQge1xuICAgICAgICBpZiAoc2VsZWN0b3IpIHtcbiAgICAgICAgICAgIGxldCBsaXN0OiBOb2RlTGlzdE9mPEVsZW1lbnQ+ID0gZG9tLmZpbmQoc2VsZWN0b3IsIGNvbnRleHQpO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGlzdFtpXS5jbGFzc0xpc3QuYWRkKG5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29udGV4dC5jbGFzc0xpc3QuYWRkKG5hbWUpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIGNvbnRleHRcbiAgICAgKiBAcGFyYW0gbmFtZVxuICAgICAqIEByZXR1cm5zIHtFbGVtZW50fVxuICAgICAqL1xuICAgIHN0YXRpYyByZW1vdmVDbGFzcyhjb250ZXh0OiBFbGVtZW50LCBuYW1lOiBzdHJpbmcsIHNlbGVjdG9yOiBzdHJpbmcgPSBudWxsKTogdm9pZCB7XG4gICAgICAgIGlmIChzZWxlY3Rvcikge1xuICAgICAgICAgICAgbGV0IGxpc3Q6IE5vZGVMaXN0T2Y8RWxlbWVudD4gPSBkb20uZmluZChzZWxlY3RvciwgY29udGV4dCk7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsaXN0W2ldLmNsYXNzTGlzdC5yZW1vdmUobmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb250ZXh0LmNsYXNzTGlzdC5yZW1vdmUobmFtZSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG5cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBwYXJhbSBlbGVtZW50XG4gICAgICogQHBhcmFtIG5hbWVcbiAgICAgKiBAcmV0dXJucyB7RWxlbWVudH1cbiAgICAgKi9cbiAgICBzdGF0aWMgcmVtb3ZlKHNlbGVjdG9yOiBzdHJpbmcsIGNvbnRleHQ6IGFueSA9IGRvY3VtZW50KTogTm9kZUxpc3RPZjxFbGVtZW50PiB8IG51bGwge1xuICAgICAgICBsZXQgbGlzdDogTm9kZUxpc3RPZjxFbGVtZW50PiA9IGRvbS5maW5kKHNlbGVjdG9yLCBjb250ZXh0KTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBsaXN0W2ldLnJlbW92ZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsaXN0O1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBwYXJhbSBlbGVtZW50XG4gICAgICogQHBhcmFtIG5hbWVcbiAgICAgKiBAcmV0dXJucyB7RWxlbWVudH1cbiAgICAgKi9cbiAgICBzdGF0aWMgdG9nZ2xlQ2xhc3MoZWxlbWVudDogRWxlbWVudCwgbmFtZTogc3RyaW5nKTogRWxlbWVudCB8IG51bGwge1xuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUobmFtZSk7XG4gICAgICAgIHJldHVybiBlbGVtZW50O1xuICAgIH1cblxuICAgIC8vXG4gICAgLy8gLyoqXG4gICAgLy8gICogUmV0dXJucyB3aXRoIGVsZW1lbnQgYmluZGVkIGRhdGEuXG4gICAgLy8gICogQHBhcmFtIGVsZW1lbnRcbiAgICAvLyAgKiBAcGFyYW0ga2V5XG4gICAgLy8gICogQHJldHVybnMge2FueX1cbiAgICAvLyAgKi9cbiAgICAvLyBzdGF0aWMgZ2V0RGF0YShlbGVtZW50OiBIVE1MRWxlbWVudCwga2V5OiBzdHJpbmcgPSBudWxsKTogYW55IHtcbiAgICAvLyAgICAgaWYgKCFkb20uaGFzRGF0YShlbGVtZW50LCBrZXkpKSB7XG4gICAgLy8gICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAvLyAgICAgfSBlbHNlIGlmIChrZXkgPT09IG51bGwpIHtcbiAgICAvLyAgICAgICAgIHJldHVybiBkb20uZGF0YS5nZXQoZWxlbWVudCk7XG4gICAgLy8gICAgIH0gZWxzZSB7XG4gICAgLy8gICAgICAgICByZXR1cm4gZG9tLmRhdGEuZ2V0KGVsZW1lbnQpW2tleV07XG4gICAgLy8gICAgIH1cbiAgICAvLyB9XG4gICAgLy9cbiAgICAvLyAvKipcbiAgICAvLyAgKiBCaW5kcyB3aXRoIGFuIGVsZW1lbnQgYSBkYXRhLlxuICAgIC8vICAqIEBwYXJhbSBlbGVtZW50XG4gICAgLy8gICogQHBhcmFtIGtleVxuICAgIC8vICAqIEBwYXJhbSB2YWx1ZVxuICAgIC8vICAqL1xuICAgIC8vIHN0YXRpYyBzZXREYXRhKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBrZXk6IHN0cmluZywgdmFsdWU6IGFueSk6IHZvaWQge1xuICAgIC8vICAgICBpZiAoIWRvbS5oYXNEYXRhKGVsZW1lbnQpKSB7XG4gICAgLy8gICAgICAgICBkb20uZGF0YS5zZXQoZWxlbWVudCwge2tleTogdmFsdWV9KTtcbiAgICAvLyAgICAgfSBlbHNlIHtcbiAgICAvLyAgICAgICAgIGxldCB0bXAgPSBkb20uZ2V0RGF0YShlbGVtZW50KTtcbiAgICAvLyAgICAgICAgIHRtcFtrZXldID0gdmFsdWU7XG4gICAgLy8gICAgICAgICBkb20uZGF0YS5zZXQoZWxlbWVudCwgdG1wKTtcbiAgICAvLyAgICAgfVxuICAgIC8vIH1cbiAgICAvL1xuICAgIC8vIC8qKlxuICAgIC8vICAqIENoZWNrcyBpZiB0aGUgZWxlbWVudCBpcyBiaW5kaW5nIHdpdGggYSBkYXRhXG4gICAgLy8gICogQHBhcmFtIGVsZW1lbnRcbiAgICAvLyAgKiBAcGFyYW0ga2V5XG4gICAgLy8gICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgLy8gICovXG4gICAgLy8gc3RhdGljIGhhc0RhdGEoZWxlbWVudDogSFRNTEVsZW1lbnQsIGtleTogc3RyaW5nID0gbnVsbCk6IGJvb2xlYW4ge1xuICAgIC8vICAgICBpZiAoIWRvbS5kYXRhLmhhcyhlbGVtZW50KSkge1xuICAgIC8vICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIC8vICAgICB9IGVsc2UgaWYgKGtleSA9PT0gbnVsbCkge1xuICAgIC8vICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgLy8gICAgIH0gZWxzZSB7XG4gICAgLy8gICAgICAgICByZXR1cm4gZG9tLmdldERhdGEoZWxlbWVudClba2V5XSAhPT0gbnVsbCA/IHRydWUgOiBmYWxzZTtcbiAgICAvLyAgICAgfVxuICAgIC8vIH1cbiAgICAvL1xuICAgIC8vIC8qKlxuICAgIC8vICAqIERlbGV0ZXMgd2l0aCBhbiBlbGVtZW50IGJpbmRpbmcgZGF0YVxuICAgIC8vICAqIEBwYXJhbSBlbGVtZW50XG4gICAgLy8gICogQHBhcmFtIGtleVxuICAgIC8vICAqL1xuICAgIC8vIHN0YXRpYyBkZWxldGVEYXRhKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBrZXk6IHN0cmluZyA9IG51bGwpOiB2b2lkIHtcbiAgICAvLyAgICAgaWYgKGRvbS5oYXNEYXRhKGVsZW1lbnQsIGtleSkpIHtcbiAgICAvLyAgICAgICAgIGlmIChrZXkgPT09IG51bGwpIHtcbiAgICAvLyAgICAgICAgICAgICBkb20uZGF0YS5kZWxldGUoZWxlbWVudCk7XG4gICAgLy8gICAgICAgICB9IGVsc2Uge1xuICAgIC8vICAgICAgICAgICAgIGxldCB0bXAgPSBkb20uZ2V0RGF0YShlbGVtZW50KTtcbiAgICAvLyAgICAgICAgICAgICBkZWxldGUgdG1wW2tleV07XG4gICAgLy8gICAgICAgICAgICAgZG9tLmRhdGEuc2V0KGVsZW1lbnQsIHRtcCk7XG4gICAgLy8gICAgICAgICB9XG4gICAgLy8gICAgIH1cbiAgICAvLyB9XG59IiwiaW1wb3J0ICogYXMgbWV0YWRvciBmcm9tICcuL09sNCc7XG5cbmRlY2xhcmUgdmFyIENvbmZpZ3VyYXRpb246IGFueTtcblxubGV0IGNvbnRleHQ6IGFueSA9IHdpbmRvdztcbmNvbnRleHQuc3BhdGlhbCA9IG1ldGFkb3I7XG5cbmV4cG9ydCBmdW5jdGlvbiBpbml0KCkge1xuXG4gICAgdmFyIG1ldGFkb3JNYXBDb25maWcgPSB7XG4gICAgICAgIG1hcDoge1xuICAgICAgICAgICAgdGFyZ2V0OiAnbWFwJyxcbiAgICAgICAgICAgIHNyczogW1wiRVBTRzo0MzI2XCIsIFwiRVBTRzozMTQ2NlwiLCBcIkVQU0c6MjU4MzJcIl1cbiAgICAgICAgfSxcbiAgICAgICAgdmlldzoge1xuICAgICAgICAgICAgcHJvamVjdGlvbjogQ29uZmlndXJhdGlvbi5zZXR0aW5nc1snbWFwX2NycyddLC8vJzogJzksNDksMTEsNTMnLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnXG4gICAgICAgICAgICBtYXhFeHRlbnQ6IENvbmZpZ3VyYXRpb24uc2V0dGluZ3NbJ21hcF9iYm94X21heCddLnNwbGl0KC8sXFxzPy8pLC8vWzUuOCwgNDcuMCwgMTUuMCwgNTUuMF0sIC8vIHByaW9yaXR5IGZvciBzY2FsZXMgb3IgZm9yIG1heEV4dGVudD9cbiAgICAgICAgICAgIHN0YXJ0RXh0ZW50OiBDb25maWd1cmF0aW9uLnNldHRpbmdzWydtYXBfYmJveF9zdGFydCddLnNwbGl0KC8sXFxzPy8pLFxuICAgICAgICAgICAgc2NhbGVzOiBbNTAwMCwgMjUwMDAsIDUwMDAwLCAxMDAwMDAsIDIwMDAwMCwgMjUwMDAwLCA1MDAwMDAsIDEwMDAwMDAsIDIwMDAwMDAsIDUwMDAwMDAsIDEwMDAwMDAwXS8vLCAyMDAwMDAwMCwgNTAwMDAwMDBdXG4gICAgICAgIH0sXG4gICAgICAgIHN0eWxlczoge1xuICAgICAgICAgICAgaGlnaGxpZ2h0OiB7XG4gICAgICAgICAgICAgICAgZmlsbDoge1xuICAgICAgICAgICAgICAgICAgICBjb2xvcjogJ3JnYmEoNjAsIDYwLCAyNTUsIDAuMSknXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzdHJva2U6IHtcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICdyZ2JhKDYwLCA2MCwgMjU1LCAxLjApJyxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2VhcmNoOiB7XG4gICAgICAgICAgICAgICAgZmlsbDoge1xuICAgICAgICAgICAgICAgICAgICBjb2xvcjogJ3JnYmEoMjU1LCA2MCwgNjAsIDAuMSknXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzdHJva2U6IHtcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICdyZ2JhKDI1NSwgNjAsIDYwLCAxLjApJyxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDJcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGltYWdlOiB7XG4gICAgICAgICAgICAgICAgICAgIGNpcmNsZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmFkaXVzOiA1LFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsbDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiAncmdiYSgyNTUsIDYwLCA2MCwgMC42KSdcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgc291cmNlOiBbXSxcbiAgICAgICAgLy8gYWRkIGFkZGl0aW9uYWwgcGFyYW1ldGVycyB3aXRoICsgXCJBRERJVElPTkFMXCJcbiAgICAgICAgcHJvajREZWZzOiB7XG4gICAgICAgICAgICBcIkVQU0c6NDMyNlwiOiBcIitwcm9qPWxvbmdsYXQgK2RhdHVtPVdHUzg0ICt1bml0cz1kZWdyZWVzICtub19kZWZzXCIgKyBcIiArYXhpcz1uZXVcIixcbiAgICAgICAgICAgIFwiRVBTRzo0MjU4XCI6IFwiK3Byb2o9bG9uZ2xhdCArZWxscHM9R1JTODAgK3Rvd2dzODQ9MCwwLDAsMCwwLDAsMCArbm9fZGVmc1wiICsgXCIgK3VuaXRzPWRlZ3JlZXMgK2F4aXM9bmV1XCIsXG4gICAgICAgICAgICBcIkVQU0c6MzE0NjZcIjogXCIrcHJvaj10bWVyYyArbGF0XzA9MCArbG9uXzA9NiAraz0xICt4XzA9MjUwMDAwMCAreV8wPTAgK2VsbHBzPWJlc3NlbCArdG93Z3M4ND01OTguMSw3My43LDQxOC4yLDAuMjAyLDAuMDQ1LC0yLjQ1NSw2LjcgK3VuaXRzPW0gK25vX2RlZnNcIiArIFwiICtheGlzPW5ldVwiLFxuICAgICAgICAgICAgXCJFUFNHOjMxNDY3XCI6IFwiK3Byb2o9dG1lcmMgK2xhdF8wPTAgK2xvbl8wPTkgK2s9MSAreF8wPTM1MDAwMDAgK3lfMD0wICtlbGxwcz1iZXNzZWwgK3Rvd2dzODQ9NTk4LjEsNzMuNyw0MTguMiwwLjIwMiwwLjA0NSwtMi40NTUsNi43ICt1bml0cz1tICtub19kZWZzXCIgKyBcIiArYXhpcz1uZXVcIixcbiAgICAgICAgICAgIC8vIFwiRVBTRzozMTQ2OFwiOiBcIitwcm9qPXRtZXJjICtsYXRfMD0wICtsb25fMD0xMiAraz0xICt4XzA9NDUwMDAwMCAreV8wPTAgK2VsbHBzPWJlc3NlbCArdG93Z3M4ND01OTguMSw3My43LDQxOC4yLDAuMjAyLDAuMDQ1LC0yLjQ1NSw2LjcgK3VuaXRzPW0gK25vX2RlZnNcIiArIFwiICtheGlzPW5ldVwiLFxuICAgICAgICAgICAgLy8gXCJFUFNHOjMxNDY5XCI6IFwiK3Byb2o9dG1lcmMgK2xhdF8wPTAgK2xvbl8wPTE1ICtrPTEgK3hfMD01NTAwMDAwICt5XzA9MCArZWxscHM9YmVzc2VsICt0b3dnczg0PTU5OC4xLDczLjcsNDE4LjIsMC4yMDIsMC4wNDUsLTIuNDU1LDYuNyArdW5pdHM9bSArbm9fZGVmc1wiICsgXCIgK2F4aXM9bmV1XCIsXG4gICAgICAgICAgICBcIkVQU0c6MjU4MzJcIjogXCIrcHJvaj11dG0gK3pvbmU9MzIgK2VsbHBzPUdSUzgwICt0b3dnczg0PTAsMCwwLDAsMCwwLDAgK3VuaXRzPW0gK25vX2RlZnNcIixcbiAgICAgICAgICAgIC8vIFwiRVBTRzoyNTgzM1wiOiBcIitwcm9qPXV0bSArem9uZT0zMyArZWxscHM9R1JTODAgK3Rvd2dzODQ9MCwwLDAsMCwwLDAsMCArdW5pdHM9bSArbm9fZGVmc1wiXG4gICAgICAgIH0sXG4gICAgICAgIGNvbXBvbmVudDogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNsYXNzOiAnJyxcbiAgICAgICAgICAgICAgICBzZWxlY3RvcjogXCJcIlxuICAgICAgICAgICAgfVxuICAgICAgICBdXG4gICAgfTtcblxuICAgIC8vIGNvbnNvbGUubG9nKENvbmZpZ3VyYXRpb24pO1xuICAgIGZvciAoY29uc3Qga2V5IGluIENvbmZpZ3VyYXRpb24uY29uZmlnLm1hcF9iYWNrZ3JvdW5kKSB7XG4gICAgICAgIGxldCB3bXMgPSBDb25maWd1cmF0aW9uLmNvbmZpZy5tYXBfYmFja2dyb3VuZFtrZXldO1xuICAgICAgICBsZXQgbGF5ZXJzID0gW107XG4gICAgICAgIGZvciAoY29uc3QgbCBpbiB3bXMubGF5ZXJzKSB7XG4gICAgICAgICAgICBsYXllcnMucHVzaCh3bXMubGF5ZXJzW2xdKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBjb25zb2xlLmxvZyh3bXMpO1xuICAgICAgICBtZXRhZG9yTWFwQ29uZmlnLnNvdXJjZS5wdXNoKHtcbiAgICAgICAgICAgICd0eXBlJzogJ1dNUycsXG4gICAgICAgICAgICAndXJsJzogd21zLnVybCxcbiAgICAgICAgICAgICd0aXRsZSc6IHdtcy50aXRsZSxcbiAgICAgICAgICAgICdvcGFjaXR5Jzogd21zLm9wYWNpdHksXG4gICAgICAgICAgICAndmlzaWJsZSc6IHdtcy52aXNpYmxlLFxuICAgICAgICAgICAgJ3BhcmFtcyc6IHtcbiAgICAgICAgICAgICAgICAnTEFZRVJTJzogbGF5ZXJzLmpvaW4oXCIsXCIpLFxuICAgICAgICAgICAgICAgICdWRVJTSU9OJzogd21zLnZlcnNpb24sXG4gICAgICAgICAgICAgICAgJ0ZPUk1BVCc6IHdtcy5mb3JtYXRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8vIGNvbnNvbGUubG9nKG1ldGFkb3JNYXBDb25maWcpO1xuICAgIGxldCBtZXRhZG9yTWFwID0gbWV0YWRvci5PbDRNYXAuY3JlYXRlKG1ldGFkb3JNYXBDb25maWcpO1xuICAgIC8vIG1ldGFkb3JNYXAuaW5pdExheWVydHJlZSgpO1xuICAgIGNvbnRleHQuc3BhdGlhbFsnbWFwJ10gPSBtZXRhZG9yTWFwO1xuICAgIC8vIG1ldGFkb3JbJ21ldGFkb3JNYXAnXSA9IG1ldGFkb3JNYXA7XG4gICAgLy8gbWV0YWRvclsnZ2VvbUxvYWRlciddID0gbmV3IG1ldGFkb3IuR2VvbUxvYWRlcihtZXRhZG9yTWFwLCA8SFRNTEZvcm1FbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNmaWxlLXVwbG9hZC1mb3JtJykpO1xufVxuaW5pdCgpOyJdfQ==
