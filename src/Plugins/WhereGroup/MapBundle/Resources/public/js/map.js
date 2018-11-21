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
        this.button = dom_1.dom.create("button", { type: "button", title: "Ausschnitt aufziehen" }, ["icon-map"]);
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
        this.button = dom_1.dom.create("button", { type: "button", title: "FeatureInfo aktivieren" }, ["icon-info-circle"]);
        this.button.addEventListener('click', this.buttonClick.bind(this), false);
        var wrapper = dom_1.dom.create("div", {}, ["feature-info", "ol-unselectable", "ol-control"]);
        wrapper.appendChild(this.button);
        this.olMap.addControl(new ol.control.Control({
            element: wrapper
        }));
    }
    FeatureInfo.prototype.buttonClick = function (e) {
        if (!dom_1.dom.hasClass(e.target, 'success')) {
            dom_1.dom.addClass(e.target, "success");
            this.activate();
        }
        else {
            dom_1.dom.removeClass(e.target, "success");
            this.deactivate();
        }
    };
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
        search.clearMetadataMarks();
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
    FeatureInfo.prototype.activate = function () {
        this.olMap.on('click', this.setTooltipPosition, this);
        this.tooltipElm = dom_1.dom.create("div", {}, ["tooltip", "hidden"]);
        this.tooltipElm.appendChild(dom_1.dom.create("span", {}, ["icon-cross"]));
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
        search.clearMetadataMarks();
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
        if (search.markMetadata) {
            search.markMetadata(selector);
        }
    };
    FeatureInfo.prototype.unSelectDataset = function (selector) {
        if (selector === void 0) { selector = null; }
        if (selector !== null && search.unmarkMetadata) {
            search.unmarkMetadata(selector);
        }
        else if (selector === null && search.clearMetadataMarks) {
            search.clearMetadataMarks();
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
        var select = dom_1.dom.create('select', { title: "Transparenz setzen" }, ['input-element', 'medium', 'simple', 'map-source-opacity', '-js-map-source-opacity']);
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
            label: icon,
            tipLabel: "Zoom auf gesamte Ausdehnung"
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
        this.activateFeatureInfo();
    }
    Ol4Map.getUuid = function (prefix) {
        if (prefix === void 0) { prefix = ''; }
        return prefix + (++Ol4Map._uuid);
    };
    Ol4Map.prototype.activateFeatureInfo = function () {
        this.featureInfo.activate();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvUGx1Z2lucy9XaGVyZUdyb3VwL01hcEJ1bmRsZS9SZXNvdXJjZXMvdHMvRHJhZ1pvb20udHMiLCJzcmMvUGx1Z2lucy9XaGVyZUdyb3VwL01hcEJ1bmRsZS9SZXNvdXJjZXMvdHMvRmVhdHVyZUluZm8udHMiLCJzcmMvUGx1Z2lucy9XaGVyZUdyb3VwL01hcEJ1bmRsZS9SZXNvdXJjZXMvdHMvTGF5ZXJUcmVlLnRzIiwic3JjL1BsdWdpbnMvV2hlcmVHcm91cC9NYXBCdW5kbGUvUmVzb3VyY2VzL3RzL09sNC50cyIsInNyYy9QbHVnaW5zL1doZXJlR3JvdXAvTWFwQnVuZGxlL1Jlc291cmNlcy90cy9PbDRTb3VyY2UudHMiLCJzcmMvUGx1Z2lucy9XaGVyZUdyb3VwL01hcEJ1bmRsZS9SZXNvdXJjZXMvdHMvZG9tLnRzIiwic3JjL1BsdWdpbnMvV2hlcmVHcm91cC9NYXBCdW5kbGUvUmVzb3VyY2VzL3RzL21hcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsNkJBQTBCO0FBRTFCO0lBS0ksa0JBQVksR0FBVztRQUNuQixJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQztRQUNqQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksRUFBRSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUM7WUFDeEMsU0FBUyxFQUFFO2dCQUNQLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDaEIsQ0FBQztTQUNKLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxNQUFNLEdBQ1AsU0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxzQkFBc0IsRUFBQyxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUN4RixJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE9B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dEIsUUFBUSxFQUFFLEdBQUcsQ0FBQyxNQUFNO2FBQ3ZCO1NBQ0osQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFFekQsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxVQUFVLENBQUM7QUFHeEMsQ0FBQztBQXhGRCxvQkF3RkM7QUFDRCxJQUFJLEVBQUUsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQge2RvbX0gZnJvbSAnLi9kb20nO1xuXG5leHBvcnQgY2xhc3MgRHJhZ1pvb20ge1xuICAgIHByaXZhdGUgZHJhZ3pvb206IG9sLmludGVyYWN0aW9uLkRyYWdab29tO1xuICAgIHByaXZhdGUgb2xNYXA6IG9sLk1hcDtcbiAgICBwcml2YXRlIGJ1dHRvbjogSFRNTEJ1dHRvbkVsZW1lbnQ7XG5cbiAgICBjb25zdHJ1Y3RvcihtYXA6IG9sLk1hcCkge1xuICAgICAgICB0aGlzLm9sTWFwID0gbWFwO1xuICAgICAgICB0aGlzLmRyYWd6b29tID0gbmV3IG9sLmludGVyYWN0aW9uLkRyYWdab29tKHtcbiAgICAgICAgICAgIGNvbmRpdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5idXR0b24gPSA8SFRNTEJ1dHRvbkVsZW1lbnQ+XG4gICAgICAgICAgICBkb20uY3JlYXRlKFwiYnV0dG9uXCIsIHt0eXBlOiBcImJ1dHRvblwiLCB0aXRsZTogXCJBdXNzY2huaXR0IGF1ZnppZWhlblwifSwgW1wiaWNvbi1tYXBcIl0pO1xuICAgICAgICB0aGlzLmJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuYnV0dG9uQ2xpY2suYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgICAgICB0aGlzLmRyYWd6b29tLm9uKCdib3hlbmQnLCB0aGlzLmRlYWN0aXZhdGUuYmluZCh0aGlzKSk7XG4gICAgICAgIGNvbnN0IHdyYXBwZXIgPSBkb20uY3JlYXRlKFwiZGl2XCIsIHt9LCBbXCJkcmFnLXpvb21cIiwgXCJvbC11bnNlbGVjdGFibGVcIiwgXCJvbC1jb250cm9sXCJdKTtcbiAgICAgICAgd3JhcHBlci5hcHBlbmRDaGlsZCh0aGlzLmJ1dHRvbik7XG4gICAgICAgIHRoaXMub2xNYXAuYWRkQ29udHJvbChcbiAgICAgICAgICAgIG5ldyBvbC5jb250cm9sLkNvbnRyb2woXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50OiB3cmFwcGVyXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgIH1cblxuICAgIHByaXZhdGUgYnV0dG9uQ2xpY2soZSkge1xuICAgICAgICBpZiAoIWRvbS5oYXNDbGFzcyhlLnRhcmdldCwgJ3N1Y2Nlc3MnKSkge1xuICAgICAgICAgICAgdGhpcy5hY3RpdmF0ZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5kZWFjdGl2YXRlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGFjdGl2YXRlKCkge1xuICAgICAgICBkb20uYWRkQ2xhc3ModGhpcy5idXR0b24sICdzdWNjZXNzJyk7XG4gICAgICAgIHRoaXMub2xNYXAuYWRkSW50ZXJhY3Rpb24odGhpcy5kcmFnem9vbSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBkZWFjdGl2YXRlKCkge1xuICAgICAgICBkb20ucmVtb3ZlQ2xhc3ModGhpcy5idXR0b24sICdzdWNjZXNzJyk7XG4gICAgICAgIHRoaXMub2xNYXAucmVtb3ZlSW50ZXJhY3Rpb24odGhpcy5kcmFnem9vbSk7XG4gICAgfVxufSIsImltcG9ydCB7VElUTEUsIFVVSUR9IGZyb20gXCIuL09sNFwiO1xuaW1wb3J0IHtkb219IGZyb20gJy4vZG9tJztcblxuZXhwb3J0IGNsYXNzIEZlYXR1cmVJbmZvIHtcbiAgICBwcml2YXRlIHN0YXRpYyBpdGVtVGFnTmFtZTogc3RyaW5nID0gJ3NwYW4nO1xuICAgIHByaXZhdGUgb2xNYXA6IG9sLk1hcDtcbiAgICBwcml2YXRlIHRvb2x0aXA6IG9sLk92ZXJsYXk7XG4gICAgcHJpdmF0ZSB0b29sdGlwQ29vcmQ6IG9sLkNvb3JkaW5hdGU7XG4gICAgcHJpdmF0ZSB0b29sdGlwRWxtOiBIVE1MRWxlbWVudDtcbiAgICBwcml2YXRlIGxheWVyOiBvbC5sYXllci5WZWN0b3I7XG4gICAgLy8gcHJpdmF0ZSBjYWxsYmFja1NlbGVjdDogRnVuY3Rpb247XG4gICAgLy8gcHJpdmF0ZSBjYWxsYmFja1VuU2VsZWN0OiBGdW5jdGlvbjtcbiAgICBwcml2YXRlIHNlbGVjdDogb2wuaW50ZXJhY3Rpb24uU2VsZWN0O1xuICAgIHByaXZhdGUgYnV0dG9uOiBIVE1MQnV0dG9uRWxlbWVudDtcblxuICAgIGNvbnN0cnVjdG9yKG1hcDogb2wuTWFwLCBsYXllcjogb2wubGF5ZXIuVmVjdG9yID0gbnVsbCkge1xuICAgICAgICB0aGlzLm9sTWFwID0gbWFwO1xuICAgICAgICB0aGlzLmxheWVyID0gbGF5ZXI7XG4gICAgICAgIHRoaXMuaW5pdFNlbGVjdCgpO1xuICAgICAgICB0aGlzLmJ1dHRvbiA9IDxIVE1MQnV0dG9uRWxlbWVudD5kb20uY3JlYXRlKFwiYnV0dG9uXCIsIHt0eXBlOiBcImJ1dHRvblwiLCB0aXRsZTogXCJGZWF0dXJlSW5mbyBha3RpdmllcmVuXCJ9LCBbXCJpY29uLWluZm8tY2lyY2xlXCJdKTtcbiAgICAgICAgdGhpcy5idXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLmJ1dHRvbkNsaWNrLmJpbmQodGhpcyksIGZhbHNlKTtcbiAgICAgICAgY29uc3Qgd3JhcHBlciA9IGRvbS5jcmVhdGUoXCJkaXZcIiwge30sIFtcImZlYXR1cmUtaW5mb1wiLCBcIm9sLXVuc2VsZWN0YWJsZVwiLCBcIm9sLWNvbnRyb2xcIl0pO1xuICAgICAgICB3cmFwcGVyLmFwcGVuZENoaWxkKHRoaXMuYnV0dG9uKTtcbiAgICAgICAgdGhpcy5vbE1hcC5hZGRDb250cm9sKFxuICAgICAgICAgICAgbmV3IG9sLmNvbnRyb2wuQ29udHJvbChcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQ6IHdyYXBwZXJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBidXR0b25DbGljayhlKSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGUpO1xuICAgICAgICBpZiAoIWRvbS5oYXNDbGFzcyhlLnRhcmdldCwgJ3N1Y2Nlc3MnKSkge1xuICAgICAgICAgICAgZG9tLmFkZENsYXNzKGUudGFyZ2V0LFwic3VjY2Vzc1wiKTtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiZmkgYWN0aXZhdGVkXCIpO1xuICAgICAgICAgICAgdGhpcy5hY3RpdmF0ZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZG9tLnJlbW92ZUNsYXNzKGUudGFyZ2V0LFwic3VjY2Vzc1wiKTtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiZmkgZGVhY3RpdmF0ZWRcIik7XG4gICAgICAgICAgICB0aGlzLmRlYWN0aXZhdGUoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgaW5pdFNlbGVjdCgpIHtcbiAgICAgICAgY29uc3QgZmkgPSB0aGlzO1xuICAgICAgICBsZXQgdGltZXN0YW1wOiBudW1iZXIgPSAwO1xuICAgICAgICB0aGlzLnNlbGVjdCA9IG5ldyBvbC5pbnRlcmFjdGlvbi5TZWxlY3Qoe1xuICAgICAgICAgICAgbXVsdGk6IHRydWUsXG4gICAgICAgICAgICBsYXllcnM6IFt0aGlzLmxheWVyXSxcbiAgICAgICAgICAgIGZpbHRlcjogZnVuY3Rpb24gKGZlYXR1cmU6IG9sLkZlYXR1cmUpIHtcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXAgPSBEYXRlLm5vdygpICsgNTtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKERhdGUubm93KCkgPj0gdGltZXN0YW1wKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmkudG9vbHRpcEVsbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpLnNob3dUb29sdGlwKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCA1KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuc2VsZWN0Lm9uKCdzZWxlY3QnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgaWYgKGUudGFyZ2V0LmdldEZlYXR1cmVzKCkuZ2V0TGVuZ3RoKCkgPT09IDApIHtcbiAgICAgICAgICAgICAgICBpZiAoZmkudG9vbHRpcEVsbSkge1xuICAgICAgICAgICAgICAgICAgICBmaS5zaG93VG9vbHRpcCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmVzZXQoKSB7XG4gICAgICAgIGlmICh0aGlzLnNlbGVjdCkge1xuICAgICAgICAgICAgdGhpcy5zZWxlY3QuZ2V0RmVhdHVyZXMoKS5jbGVhcigpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnRvb2x0aXBFbG0pIHtcbiAgICAgICAgICAgIGRvbS5hZGRDbGFzcyh0aGlzLnRvb2x0aXBFbG0sICdoaWRkZW4nKTtcbiAgICAgICAgfVxuICAgICAgICBzZWFyY2guY2xlYXJNZXRhZGF0YU1hcmtzKCk7XG4gICAgfVxuXG4gICAgc2VsZWN0RmVhdHVyZXModXVpZHM6IHN0cmluZ1tdKSB7XG4gICAgICAgIGNvbnN0IGZpID0gdGhpcztcbiAgICAgICAgaWYgKHRoaXMubGF5ZXIgJiYgdGhpcy5zZWxlY3QpIHtcbiAgICAgICAgICAgIHRoaXMucmVzZXQoKTtcbiAgICAgICAgICAgIHRoaXMubGF5ZXIuZ2V0U291cmNlKCkuZm9yRWFjaEZlYXR1cmUoXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKGZlYXR1cmU6IG9sLkZlYXR1cmUpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCB1dWlkIG9mIHV1aWRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmVhdHVyZS5nZXQoVVVJRCkgPT09IHV1aWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaS5zZWxlY3QuZ2V0RmVhdHVyZXMoKS5wdXNoKGZlYXR1cmUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgaWYgKHRoaXMudG9vbHRpcEVsbSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd1Rvb2x0aXAoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFjdGl2YXRlKCkgey8vdG9vbHRpcEVsbTogSFRNTEVsZW1lbnQsIGNhbGxiYWNrU2VsZWN0OiBGdW5jdGlvbiwgY2FsbGJhY2tVblNlbGVjdDogRnVuY3Rpb24sIGNhbGxiYWNrVW5TZWxlY3RBbGw6IEZ1bmN0aW9uKSB7XG4gICAgICAgIC8vIHRoaXMuY2FsbGJhY2tTZWxlY3QgPSBjYWxsYmFja1NlbGVjdDtcbiAgICAgICAgLy8gdGhpcy5jYWxsYmFja1VuU2VsZWN0ID0gY2FsbGJhY2tVblNlbGVjdDtcbiAgICAgICAgdGhpcy5vbE1hcC5vbignY2xpY2snLCB0aGlzLnNldFRvb2x0aXBQb3NpdGlvbiwgdGhpcyk7XG4gICAgICAgIHRoaXMudG9vbHRpcEVsbSA9IGRvbS5jcmVhdGUoXCJkaXZcIiwge30sIFtcInRvb2x0aXBcIiwgXCJoaWRkZW5cIl0pO1xuICAgICAgICB0aGlzLnRvb2x0aXBFbG0uYXBwZW5kQ2hpbGQoZG9tLmNyZWF0ZShcInNwYW5cIiwge30sIFtcImljb24tY3Jvc3NcIl0pKTtcbiAgICAgICAgdGhpcy50b29sdGlwRWxtLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5pdGVtQ2xpY2suYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgICAgICB0aGlzLnRvb2x0aXAgPSBuZXcgb2wuT3ZlcmxheSh7XG4gICAgICAgICAgICBlbGVtZW50OiB0aGlzLnRvb2x0aXBFbG0sXG4gICAgICAgICAgICBvZmZzZXQ6IFswLCAtNl0sXG4gICAgICAgICAgICBwb3NpdGlvbmluZzogJ2JvdHRvbS1jZW50ZXInXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLm9sTWFwLmFkZE92ZXJsYXkodGhpcy50b29sdGlwKTtcblxuICAgICAgICB0aGlzLnNlbGVjdC5nZXRGZWF0dXJlcygpLmNsZWFyKCk7XG4gICAgICAgIHRoaXMub2xNYXAuYWRkSW50ZXJhY3Rpb24odGhpcy5zZWxlY3QpO1xuICAgIH1cblxuICAgIGRlYWN0aXZhdGUoKSB7XG4gICAgICAgIHRoaXMuc2VsZWN0LmdldEZlYXR1cmVzKCkuY2xlYXIoKTtcbiAgICAgICAgdGhpcy5vbE1hcC5yZW1vdmVJbnRlcmFjdGlvbih0aGlzLnNlbGVjdCk7XG4gICAgICAgIC8vIHRoaXMuc2VsZWN0ID0gbnVsbDtcbiAgICAgICAgc2VhcmNoLmNsZWFyTWV0YWRhdGFNYXJrcygpO1xuICAgICAgICB0aGlzLnRvb2x0aXBFbG0ucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLml0ZW1DbGljay5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy50b29sdGlwRWxtLnJlbW92ZSgpO1xuICAgICAgICB0aGlzLm9sTWFwLnJlbW92ZU92ZXJsYXkodGhpcy50b29sdGlwKTtcbiAgICAgICAgdGhpcy5vbE1hcC51bignY2xpY2snLCB0aGlzLnNldFRvb2x0aXBQb3NpdGlvbiwgdGhpcyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpdGVtQ2xpY2soZTogRXZlbnQpIHtcbiAgICAgICAgaWYgKCg8YW55PmUudGFyZ2V0KS50YWdOYW1lID09PSBGZWF0dXJlSW5mby5pdGVtVGFnTmFtZS50b1VwcGVyQ2FzZSgpKSB7XG4gICAgICAgICAgICBsZXQgdGFnID0gKDxIVE1MRWxlbWVudD5lLnRhcmdldCk7XG4gICAgICAgICAgICBpZiAoIWRvbS5oYXNDbGFzcyh0YWcsICctanMtdG9vbHRpcC1pdGVtJykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdC5nZXRGZWF0dXJlcygpLmNsZWFyKCk7XG4gICAgICAgICAgICAgICAgdGhpcy51blNlbGVjdERhdGFzZXQoKTtcbiAgICAgICAgICAgICAgICBkb20uYWRkQ2xhc3ModGhpcy50b29sdGlwRWxtLCAnaGlkZGVuJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRvbS5yZW1vdmVDbGFzcyh0YWcucGFyZW50RWxlbWVudCwgJ3NlbGVjdGVkJywgJ3NwYW4nKTtcbiAgICAgICAgICAgICAgICBkb20uYWRkQ2xhc3ModGFnLCAnc2VsZWN0ZWQnKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdC5nZXRGZWF0dXJlcygpLmNsZWFyKCk7XG4gICAgICAgICAgICAgICAgdGhpcy51blNlbGVjdERhdGFzZXQoKTtcbiAgICAgICAgICAgICAgICBjb25zdCBmZWF0dXJlID0gdGhpcy5sYXllci5nZXRTb3VyY2UoKS5nZXRGZWF0dXJlQnlJZCh0YWcuZ2V0QXR0cmlidXRlKCdkYXRhLWlkJykpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0LmdldEZlYXR1cmVzKCkucHVzaChmZWF0dXJlKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdERhdGFzZXQoZmVhdHVyZS5nZXQoVVVJRCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgc2V0VG9vbHRpcFBvc2l0aW9uKGVuOiBvbC5NYXBCcm93c2VyRXZlbnQpIHtcbiAgICAgICAgdGhpcy50b29sdGlwQ29vcmQgPSBlbi5jb29yZGluYXRlO1xuICAgIH1cblxuICAgIHByaXZhdGUgaGlkZVRvb2x0aXAoKSB7XG4gICAgICAgIGlmICh0aGlzLnRvb2x0aXBFbG0pIHtcbiAgICAgICAgICAgIGRvbS5hZGRDbGFzcyh0aGlzLnRvb2x0aXBFbG0sICdoaWRkZW4nKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgc2hvd1Rvb2x0aXAoKSB7XG4gICAgICAgIGNvbnN0IGZlYXR1cmVzOiBvbC5GZWF0dXJlW10gPSB0aGlzLnNlbGVjdC5nZXRGZWF0dXJlcygpLmdldEFycmF5KCk7XG4gICAgICAgIGRvbS5yZW1vdmUoJy4tanMtdG9vbHRpcC1pdGVtJywgdGhpcy50b29sdGlwRWxtKTtcbiAgICAgICAgdGhpcy51blNlbGVjdERhdGFzZXQoKTtcbiAgICAgICAgaWYgKGZlYXR1cmVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgdGhpcy5oaWRlVG9vbHRpcCgpO1xuICAgICAgICB9IGVsc2UgaWYgKGZlYXR1cmVzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgdGhpcy5oaWRlVG9vbHRpcCgpO1xuICAgICAgICAgICAgdGhpcy5zZWxlY3REYXRhc2V0KGZlYXR1cmVzWzBdLmdldChVVUlEKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3IgKGxldCBmZWF0dXJlIG9mIGZlYXR1cmVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFmZWF0dXJlLmdldElkKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgZmVhdHVyZS5zZXRJZChmZWF0dXJlLmdldChVVUlEKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxldCBhdHRycyA9IHtcbiAgICAgICAgICAgICAgICAgICAgXCJ0aXRsZVwiOiBmZWF0dXJlLmdldChUSVRMRSksXG4gICAgICAgICAgICAgICAgICAgIFwiZGF0YS11dWlkXCI6IGZlYXR1cmUuZ2V0KFVVSUQpLFxuICAgICAgICAgICAgICAgICAgICBcImRhdGEtaWRcIjogZmVhdHVyZS5nZXRJZCgpXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB0aGlzLnRvb2x0aXBFbG0uYXBwZW5kQ2hpbGQoXG4gICAgICAgICAgICAgICAgICAgIGRvbS5jcmVhdGUoRmVhdHVyZUluZm8uaXRlbVRhZ05hbWUsIGF0dHJzLCBbJy1qcy10b29sdGlwLWl0ZW0nLCAnc2VsZWN0ZWQnXSwgZmVhdHVyZS5nZXQoVElUTEUpKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3REYXRhc2V0KGZlYXR1cmUuZ2V0KFVVSUQpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRvbS5yZW1vdmVDbGFzcyh0aGlzLnRvb2x0aXBFbG0sICdoaWRkZW4nKTtcbiAgICAgICAgICAgIHRoaXMudG9vbHRpcC5zZXRQb3NpdGlvbih0aGlzLnRvb2x0aXBDb29yZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHNlbGVjdERhdGFzZXQoc2VsZWN0b3I6IHN0cmluZykge1xuICAgICAgICBpZiAoc2VhcmNoLm1hcmtNZXRhZGF0YSkge1xuICAgICAgICAgICAgc2VhcmNoLm1hcmtNZXRhZGF0YShzZWxlY3Rvcik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHVuU2VsZWN0RGF0YXNldChzZWxlY3Rvcjogc3RyaW5nID0gbnVsbCkge1xuICAgICAgICBpZiAoc2VsZWN0b3IgIT09IG51bGwgJiYgc2VhcmNoLnVubWFya01ldGFkYXRhKSB7XG4gICAgICAgICAgICBzZWFyY2gudW5tYXJrTWV0YWRhdGEoc2VsZWN0b3IpO1xuICAgICAgICB9IGVsc2UgaWYgKHNlbGVjdG9yID09PSBudWxsICYmIHNlYXJjaC5jbGVhck1ldGFkYXRhTWFya3MpIHtcbiAgICAgICAgICAgIHNlYXJjaC5jbGVhck1ldGFkYXRhTWFya3MoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZGVjbGFyZSB2YXIgc2VhcmNoOiBhbnk7IiwiaW1wb3J0IHtkb219IGZyb20gJy4vZG9tJztcbmltcG9ydCB7T2w0TWFwLCBUSVRMRSwgVVVJRH0gZnJvbSBcIi4vT2w0XCI7XG5cbi8vIGltcG9ydCAqIGFzICQgZnJvbSAnanF1ZXJ5JztcblxuZXhwb3J0IGNsYXNzIExheWVyVHJlZSB7XG4gICAgcHJpdmF0ZSBzdGF0aWMgX2luc3RhbmNlOiBMYXllclRyZWU7XG4gICAgcHJpdmF0ZSBzdGF0aWMgbWF4bGVuZ3RoOiBudW1iZXIgPSAxNjtcbiAgICBwcml2YXRlIHN0YXRpYyB0cmVlc2VsZWN0b3I6IHN0cmluZyA9ICcuLWpzLW1hcC1sYXllcnRyZWUgdWwubGF5ZXItdHJlZS1saXN0JztcbiAgICBwcml2YXRlIHN0YXRpYyBkdW1teXNlbGVjdG9yOiBzdHJpbmcgPSAnLi1qcy1kdW1teS1sYXllcic7XG4gICAgcHJpdmF0ZSBzdGF0aWMgdXNlT3BhY2l0eTogYm9vbGVhbiA9IHRydWU7XG4gICAgcHJpdmF0ZSBzdGF0aWMgdXNlVmlzaWJsZTogYm9vbGVhbiA9IHRydWU7XG4gICAgcHJpdmF0ZSBzdGF0aWMgdXNlU29ydGFibGU6IGJvb2xlYW4gPSB0cnVlO1xuICAgIHByaXZhdGUgc3RhdGljIHNob3dTdGF0dXM6IGJvb2xlYW4gPSB0cnVlO1xuICAgIHByaXZhdGUgb2w0TWFwOiBPbDRNYXA7XG4gICAgcHJpdmF0ZSB0cmVlOiBIVE1MRWxlbWVudDtcbiAgICBwcml2YXRlIGN1cnJlbnRMYXllciA9IG51bGw7XG4gICAgcHJpdmF0ZSBvbGRQb3NpdGlvbiA9IDA7XG5cbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKG9sNE1hcDogT2w0TWFwKSB7XG4gICAgICAgIHRoaXMub2w0TWFwID0gb2w0TWFwO1xuICAgICAgICB0aGlzLnRyZWUgPSA8SFRNTEVsZW1lbnQ+ZG9tLmZpbmRGaXJzdChMYXllclRyZWUudHJlZXNlbGVjdG9yKTtcbiAgICAgICAgaWYgKExheWVyVHJlZS51c2VTb3J0YWJsZSkge1xuICAgICAgICAgICAgbGV0IGR1bW15ID0gZG9tLmZpbmRGaXJzdChMYXllclRyZWUuZHVtbXlzZWxlY3RvciwgdGhpcy50cmVlKTtcbiAgICAgICAgICAgIHRoaXMuYWRkRHJhZ2dhYmxlKDxIVE1MRWxlbWVudD5kdW1teSwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgY3JlYXRlKG9sNE1hcDogT2w0TWFwKTogTGF5ZXJUcmVlIHtcbiAgICAgICAgaWYgKCFMYXllclRyZWUuX2luc3RhbmNlKSB7Ly8gc2luZ2xldG9uXG4gICAgICAgICAgICBMYXllclRyZWUuX2luc3RhbmNlID0gbmV3IExheWVyVHJlZShvbDRNYXApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBMYXllclRyZWUuX2luc3RhbmNlO1xuICAgIH1cblxuICAgIHByaXZhdGUgZmluZExheWVySXRlbShsYXllcjogb2wubGF5ZXIuQmFzZSk6IEhUTUxFbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIDxIVE1MRWxlbWVudD5kb20uZmluZEZpcnN0KCcjJyArIGxheWVyLmdldChVVUlEKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBmaW5kTGF5ZXJMYWJlbChsYXllcjogb2wubGF5ZXIuQmFzZSk6IEhUTUxFbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIDxIVE1MRWxlbWVudD5kb20uZmluZEZpcnN0KCcjJyArIGxheWVyLmdldChVVUlEKSArICcgPiBsYWJlbCcpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZmluZExheWVyVmlzaWJsZShsYXllcjogb2wubGF5ZXIuQmFzZSk6IEhUTUxGb3JtRWxlbWVudCB7XG4gICAgICAgIHJldHVybiA8SFRNTEZvcm1FbGVtZW50PmRvbS5maW5kRmlyc3QoJyMnICsgbGF5ZXIuZ2V0KFVVSUQpICsgJyAuLWpzLW1hcC1zb3VyY2UtdmlzaWJsZScpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZmluZExheWVyT3BhY2l0eShsYXllcjogb2wubGF5ZXIuQmFzZSk6IEhUTUxGb3JtRWxlbWVudCB7XG4gICAgICAgIHJldHVybiA8SFRNTEZvcm1FbGVtZW50PmRvbS5maW5kRmlyc3QoJyMnICsgbGF5ZXIuZ2V0KFVVSUQpICsgJyAuLWpzLW1hcC1zb3VyY2Utb3BhY2l0eScpO1xuICAgIH1cblxuICAgIGdldFZpc2libGUobGF5ZXI6IG9sLmxheWVyLkJhc2UpIHtcbiAgICAgICAgbGV0IGNoZWNrYm94ID0gdGhpcy5maW5kTGF5ZXJWaXNpYmxlKGxheWVyKTtcbiAgICAgICAgcmV0dXJuIGNoZWNrYm94LmNoZWNrZWQ7XG4gICAgfVxuXG4gICAgc2V0VmlzaWJsZShsYXllcjogb2wubGF5ZXIuQmFzZSwgdmlzaWJsZTogYm9vbGVhbiwgYWN0aW9uOiBib29sZWFuID0gZmFsc2UpIHtcbiAgICAgICAgbGV0IGNoZWNrYm94ID0gdGhpcy5maW5kTGF5ZXJWaXNpYmxlKGxheWVyKTtcbiAgICAgICAgaWYgKGNoZWNrYm94LmNoZWNrZWQgIT09IHZpc2libGUgJiYgIWFjdGlvbikge1xuICAgICAgICAgICAgY2hlY2tib3guY2hlY2tlZCA9IHZpc2libGU7XG4gICAgICAgIH0gZWxzZSBpZiAoY2hlY2tib3guY2hlY2tlZCAhPT0gdmlzaWJsZSAmJiBhY3Rpb24pIHtcbiAgICAgICAgICAgIGNoZWNrYm94LmNsaWNrKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZXREaXNhYmxlKGxheWVyOiBvbC5sYXllci5CYXNlLCBkaXNhYmxlOiBib29sZWFuKSB7XG4gICAgICAgIGxldCBpdGVtID0gdGhpcy5maW5kTGF5ZXJJdGVtKGxheWVyKTtcbiAgICAgICAgbGV0IGNoZWNrYm94VmlzaWJsZSA9IHRoaXMuZmluZExheWVyVmlzaWJsZShsYXllcik7XG4gICAgICAgIGxldCBzZWxlY3RPcGFjaXR5ID0gdGhpcy5maW5kTGF5ZXJPcGFjaXR5KGxheWVyKTtcbiAgICAgICAgbGV0IGxhYmVsID0gdGhpcy5maW5kTGF5ZXJMYWJlbChsYXllcik7XG4gICAgICAgIGlmIChkaXNhYmxlKSB7XG4gICAgICAgICAgICBkb20uYWRkQ2xhc3MoaXRlbSwgJ2Rpc2FibGVkJyk7XG4gICAgICAgICAgICBjaGVja2JveFZpc2libGUuc2V0QXR0cmlidXRlKCdkaXNhYmxlZCcsICd0cnVlJyk7XG4gICAgICAgICAgICBzZWxlY3RPcGFjaXR5LnNldEF0dHJpYnV0ZSgnZGlzYWJsZWQnLCAndHJ1ZScpO1xuICAgICAgICAgICAgZG9tLmFkZChsYWJlbCwgeyd0aXRsZSc6ICdEZXIgRGllbnN0IGlzdCBuaWNodCBlcnJlaWNoYmFyISd9KTtcbiAgICAgICAgICAgIGlmIChMYXllclRyZWUudXNlU29ydGFibGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZURyYWdnYWJsZShpdGVtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRvbS5yZW1vdmVDbGFzcyhpdGVtLCAnZGlzYWJsZWQnKTtcbiAgICAgICAgICAgIGNoZWNrYm94VmlzaWJsZS5yZW1vdmVBdHRyaWJ1dGUoJ2Rpc2FibGVkJyk7XG4gICAgICAgICAgICBzZWxlY3RPcGFjaXR5LnJlbW92ZUF0dHJpYnV0ZSgnZGlzYWJsZWQnKTtcbiAgICAgICAgICAgIGRvbS5hZGQobGFiZWwsIHsndGl0bGUnOiBsYXllci5nZXQoVElUTEUpfSk7XG4gICAgICAgICAgICBpZiAoTGF5ZXJUcmVlLnVzZVNvcnRhYmxlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGREcmFnZ2FibGUoaXRlbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHN1YnN0cmluZ1RpdGxlKHRleHQ6IHN0cmluZykge1xuICAgICAgICBpZiAodGV4dC5sZW5ndGggPiBMYXllclRyZWUubWF4bGVuZ3RoKSB7XG4gICAgICAgICAgICB0ZXh0ID0gdGV4dC5zdWJzdHJpbmcoMCwgTGF5ZXJUcmVlLm1heGxlbmd0aCk7XG4gICAgICAgICAgICBpZiAodGV4dC5sYXN0SW5kZXhPZignICcpID4gMCkge1xuICAgICAgICAgICAgICAgIHRleHQgPSB0ZXh0LnN1YnN0cmluZygwLCB0ZXh0Lmxhc3RJbmRleE9mKCcgJykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0ZXh0O1xuICAgIH1cblxuICAgIHJlbW92ZShsYXllcjogb2wubGF5ZXIuQmFzZSkge1xuICAgICAgICBsZXQgbGF5ZXJOb2RlID0gdGhpcy5maW5kTGF5ZXJJdGVtKGxheWVyKTtcbiAgICAgICAgaWYgKGxheWVyTm9kZSkge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVEcmFnZ2FibGUoPEhUTUxFbGVtZW50PmxheWVyTm9kZSk7XG4gICAgICAgICAgICBsYXllck5vZGUucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhZGQobGF5ZXI6IG9sLmxheWVyLkJhc2UpIHtcbiAgICAgICAgbGV0IGxheWVyTm9kZSA9IGRvbS5jcmVhdGUoJ2xpJywgeydpZCc6IGxheWVyLmdldChVVUlEKX0pO1xuICAgICAgICBpZiAoTGF5ZXJUcmVlLnVzZVZpc2libGUpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkVmlzaWJsZShsYXllck5vZGUsIGxheWVyKTtcbiAgICAgICAgfVxuICAgICAgICBsYXllck5vZGUuYXBwZW5kQ2hpbGQoXG4gICAgICAgICAgICBkb20uY3JlYXRlKCdsYWJlbCcsXG4gICAgICAgICAgICAgICAgeydpZCc6IGxheWVyLmdldChVVUlEKSwgJ2Zvcic6ICdjaGItJyArIGxheWVyLmdldChVVUlEKSwgJ3RpdGxlJzogbGF5ZXIuZ2V0KFRJVExFKX0sXG4gICAgICAgICAgICAgICAgWydmb3JtLWxhYmVsJ10sIHRoaXMuc3Vic3RyaW5nVGl0bGUobGF5ZXIuZ2V0KFRJVExFKSkpXG4gICAgICAgICk7XG4gICAgICAgIGlmIChMYXllclRyZWUudXNlT3BhY2l0eSkge1xuICAgICAgICAgICAgdGhpcy5hZGRPcGFjaXR5KGxheWVyTm9kZSwgbGF5ZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy50cmVlLmluc2VydEJlZm9yZShsYXllck5vZGUsIGRvbS5maW5kRmlyc3QoJ2xpJywgdGhpcy50cmVlKSk7XG4gICAgICAgIGlmIChMYXllclRyZWUudXNlU29ydGFibGUpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkRHJhZ2dhYmxlKGxheWVyTm9kZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGFkZFZpc2libGUobGF5ZXJOb2RlOiBIVE1MRWxlbWVudCwgbGF5ZXI6IG9sLmxheWVyLkJhc2UpIHtcbiAgICAgICAgbGV0IGlucHV0ID0gZG9tLmNyZWF0ZSgnaW5wdXQnLCB7J3R5cGUnOiAnY2hlY2tib3gnfSxcbiAgICAgICAgICAgIFsnY2hlY2snLCAnLWpzLW1hcC1zb3VyY2UtdmlzaWJsZSddKTtcbiAgICAgICAgKDxIVE1MRm9ybUVsZW1lbnQ+aW5wdXQpLmNoZWNrZWQgPSBsYXllci5nZXRWaXNpYmxlKCk7XG4gICAgICAgIGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIHRoaXMuY2hhbmdlVmlzaWJsZS5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgICAgIGxheWVyTm9kZS5hcHBlbmRDaGlsZChpbnB1dCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjaGFuZ2VWaXNpYmxlKGUpIHtcbiAgICAgICAgdGhpcy5vbDRNYXAuc2V0VmlzaWJsZShlLnRhcmdldC5wYXJlbnRFbGVtZW50LmlkLCBlLnRhcmdldC5jaGVja2VkKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFkZE9wYWNpdHkobGF5ZXJOb2RlOiBIVE1MRWxlbWVudCwgbGF5ZXI6IG9sLmxheWVyLkJhc2UpOiB2b2lkIHtcbiAgICAgICAgbGV0IHNlbGVjdCA9IGRvbS5jcmVhdGUoJ3NlbGVjdCcsIHt0aXRsZTogXCJUcmFuc3BhcmVueiBzZXR6ZW5cIn0sXG4gICAgICAgICAgICBbJ2lucHV0LWVsZW1lbnQnLCAnbWVkaXVtJywgJ3NpbXBsZScsICdtYXAtc291cmNlLW9wYWNpdHknLCAnLWpzLW1hcC1zb3VyY2Utb3BhY2l0eSddKTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8PSAxMDsgaSsrKSB7XG4gICAgICAgICAgICBzZWxlY3QuYXBwZW5kQ2hpbGQoZG9tLmNyZWF0ZSgnb3B0aW9uJywgeyd2YWx1ZSc6IGkgLyAxMH0sIFtdLCAoaSAqIDEwKSArICcgJScpKTtcbiAgICAgICAgfVxuICAgICAgICAoPEhUTUxGb3JtRWxlbWVudD5zZWxlY3QpLnZhbHVlID0gbGF5ZXIuZ2V0T3BhY2l0eSgpLnRvU3RyaW5nKCk7XG4gICAgICAgIHNlbGVjdC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCB0aGlzLmNoYW5nZU9wYWNpdHkuYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgICAgICBsYXllck5vZGUuYXBwZW5kQ2hpbGQoc2VsZWN0KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNoYW5nZU9wYWNpdHkoZSkge1xuICAgICAgICB0aGlzLm9sNE1hcC5zZXRPcGFjaXR5KGUudGFyZ2V0LnBhcmVudEVsZW1lbnQuaWQsIHBhcnNlRmxvYXQoZS50YXJnZXQudmFsdWUpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFkZERyYWdnYWJsZShsYXllcjogSFRNTEVsZW1lbnQsIGlzRHVtbXk6IGJvb2xlYW4gPSBmYWxzZSkge1xuICAgICAgICBkb20uYWRkKGxheWVyLCB7J2RyYWdnYWJsZSc6ICd0cnVlJ30sIFsnZHJhZ2dhYmxlJywgJy1qcy1kcmFnZ2FibGUnXSk7XG4gICAgICAgIGlmICghaXNEdW1teSkge1xuICAgICAgICAgICAgbGF5ZXIuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ3N0YXJ0JywgdGhpcy5kcmFnU3RhcnQuYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgICAgICAgICAgbGF5ZXIuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ2VuZCcsIHRoaXMuZHJhZ0VuZC5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgICAgbGF5ZXIuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ2VudGVyJywgdGhpcy5kcmFnRW50ZXIuYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgICAgICBsYXllci5hZGRFdmVudExpc3RlbmVyKCdkcmFnb3ZlcicsIHRoaXMuZHJhZ092ZXIuYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgICAgICBsYXllci5hZGRFdmVudExpc3RlbmVyKCdkcm9wJywgdGhpcy5kcmFnRHJvcC5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW1vdmVEcmFnZ2FibGUobGF5ZXI6IEhUTUxFbGVtZW50LCBpc0R1bW15OiBib29sZWFuID0gZmFsc2UpIHtcbiAgICAgICAgZG9tLmRlbGV0ZShsYXllciwgWydkcmFnZ2FibGUnXSwgWydkcmFnZ2FibGUnLCAnLWpzLWRyYWdnYWJsZSddKTtcbiAgICAgICAgaWYgKCFpc0R1bW15KSB7XG4gICAgICAgICAgICBsYXllci5yZW1vdmVFdmVudExpc3RlbmVyKCdkcmFnc3RhcnQnLCB0aGlzLmRyYWdTdGFydC5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgICAgICAgICBsYXllci5yZW1vdmVFdmVudExpc3RlbmVyKCdkcmFnZW5kJywgdGhpcy5kcmFnRW5kLmJpbmQodGhpcyksIGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgICBsYXllci5yZW1vdmVFdmVudExpc3RlbmVyKCdkcmFnZW50ZXInLCB0aGlzLmRyYWdFbnRlci5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgICAgIGxheWVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2RyYWdvdmVyJywgdGhpcy5kcmFnT3Zlci5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgICAgIGxheWVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCB0aGlzLmRyYWdEcm9wLmJpbmQodGhpcyksIGZhbHNlKTtcbiAgICB9XG5cblxuICAgIHByaXZhdGUgZHJhZ1N0YXJ0KGUpIHtcbiAgICAgICAgdGhpcy5jdXJyZW50TGF5ZXIgPSBlLnRhcmdldDtcbiAgICAgICAgdGhpcy5vbGRQb3NpdGlvbiA9IHRoaXMuZ2V0TGF5ZXJQb3NpdGlvbih0aGlzLmN1cnJlbnRMYXllcik7XG4gICAgICAgIGUuZGF0YVRyYW5zZmVyLmVmZmVjdEFsbG93ZWQgPSAnbW92ZSc7XG4gICAgICAgIGUuZGF0YVRyYW5zZmVyLnNldERhdGEoJ3RleHQvaHRtbCcsIHRoaXMuY3VycmVudExheWVyLmlubmVySFRNTCk7XG4gICAgICAgIGRvbS5hZGRDbGFzcyh0aGlzLmN1cnJlbnRMYXllciwgXCJtb3ZlXCIpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZHJhZ092ZXIoZSkge1xuICAgICAgICBpZiAoZS5wcmV2ZW50RGVmYXVsdCkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgICAgIGUuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3QgPSAnbW92ZSc7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGRyYWdFbnRlcihlKSB7XG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRMYXllciAmJiBlLnRhcmdldCAhPT0gdW5kZWZpbmVkICYmIHRoaXMuY3VycmVudExheWVyICE9PSBlLnRhcmdldCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB0aGlzLnRyZWUuaW5zZXJ0QmVmb3JlKFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRMYXllcixcbiAgICAgICAgICAgICAgICAgICAgZS50YXJnZXQuZHJhZ2dhYmxlID8gZS50YXJnZXQgOiBlLnRhcmdldC5wYXJlbnRFbGVtZW50XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgZHJhZ0Ryb3AoZSkge1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGRvbS5yZW1vdmVDbGFzcyhlLnRhcmdldCwgXCJvdmVyXCIpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZHJhZ0VuZChlKSB7XG4gICAgICAgIGRvbS5yZW1vdmVDbGFzcyhlLnRhcmdldCwgXCJtb3ZlXCIpO1xuICAgICAgICB0aGlzLm9sNE1hcC5tb3ZlTGF5ZXIodGhpcy5jdXJyZW50TGF5ZXIuaWQsIHRoaXMub2xkUG9zaXRpb24sIHRoaXMuZ2V0TGF5ZXJQb3NpdGlvbih0aGlzLmN1cnJlbnRMYXllcikpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0TGF5ZXJQb3NpdGlvbihsYXllcikge1xuICAgICAgICBsZXQgbGlzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy4tanMtbWFwLWxheWVydHJlZSB1bCAuLWpzLWRyYWdnYWJsZScpO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChsaXN0W2ldLmlkID09PSBsYXllci5pZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBsaXN0Lmxlbmd0aCAtIDEgLSBpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cbiIsImltcG9ydCAqIGFzIG9sNCBmcm9tICdvcGVubGF5ZXJzJzsvLyA/Pz9cblxuaW1wb3J0IHtMYXllclRyZWV9IGZyb20gJy4vTGF5ZXJUcmVlJztcbmltcG9ydCB7RHJhZ1pvb219IGZyb20gJy4vRHJhZ1pvb20nO1xuaW1wb3J0IHtPbDRTb3VyY2UsIE9sNFZlY3RvclNvdXJjZSwgT2w0V21zU291cmNlfSBmcm9tIFwiLi9PbDRTb3VyY2VcIlxuaW1wb3J0IHtGZWF0dXJlSW5mb30gZnJvbSBcIi4vRmVhdHVyZUluZm9cIjtcblxuZGVjbGFyZSBjbGFzcyBwcm9qNCB7XG4gICAgc3RhdGljIGRlZnMobmFtZTogc3RyaW5nLCBkZWY6IHN0cmluZyk6IHZvaWQ7XG59XG5cbi8vIGRlY2xhcmUgZnVuY3Rpb24gYWRkU291cmNlKGlkOiBzdHJpbmcsIHRpdGxlOiBzdHJpbmcsIHZpc2liaWxpdHk6IGJvb2xlYW4sIG9wYWNpdHk6IG51bWJlcik6IHZvaWQ7XG5leHBvcnQgY2xhc3MgT2w0VXRpbHMge1xuICAgIC8qIFxuICAgICAqIHVuaXRzOiAnZGVncmVlcyd8J2Z0J3wnbSd8J3VzLWZ0J1xuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgcmVzb2x1dGlvblNjYWxlRmFjdG9yKHVuaXRzOiBzdHJpbmcpOiBudW1iZXIge1xuICAgICAgICBsZXQgZHBpID0gMjUuNCAvIDAuMjg7XG4gICAgICAgIGxldCBtcHUgPSBvbC5wcm9qLk1FVEVSU19QRVJfVU5JVFt1bml0c107XG4gICAgICAgIGxldCBpbmNoZXNQZXJNZXRlciA9IDM5LjM3O1xuICAgICAgICByZXR1cm4gbXB1ICogaW5jaGVzUGVyTWV0ZXIgKiBkcGk7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyByZXNvbHV0aW9uRm9yU2NhbGUoc2NhbGU6IG51bWJlciwgZmFjdG9yOiBudW1iZXIpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gc2NhbGUgLyBmYWN0b3I7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyByZXNvbHV0aW9uc0ZvclNjYWxlcyhzY2FsZXM6IG51bWJlcltdLCB1bml0czogc3RyaW5nKTogbnVtYmVyW10ge1xuICAgICAgICBsZXQgcmVzb2x1dGlvbnMgPSBbXTtcbiAgICAgICAgbGV0IGZhY3RvciA9IE9sNFV0aWxzLnJlc29sdXRpb25TY2FsZUZhY3Rvcih1bml0cyk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2NhbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICByZXNvbHV0aW9ucy5wdXNoKE9sNFV0aWxzLnJlc29sdXRpb25Gb3JTY2FsZShzY2FsZXNbaV0sIGZhY3RvcikpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXNvbHV0aW9ucztcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIHNjYWxlRm9yUmVzb2x1dGlvbihyZXNvbHV0aW9uOiBudW1iZXIsIGZhY3RvcjogbnVtYmVyKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHJlc29sdXRpb24gKiBmYWN0b3I7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBzY2FsZXNGb3JSZXNvbHV0aW9ucyhyZXNvbHV0aW9uczogbnVtYmVyW10sIHVuaXRzOiBzdHJpbmcpOiBudW1iZXJbXSB7XG4gICAgICAgIGxldCBzY2FsZXMgPSBbXTtcbiAgICAgICAgbGV0IGZhY3RvciA9IE9sNFV0aWxzLnJlc29sdXRpb25TY2FsZUZhY3Rvcih1bml0cyk7XG4gICAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCByZXNvbHV0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgc2NhbGVzLnB1c2goT2w0VXRpbHMuc2NhbGVGb3JSZXNvbHV0aW9uKHJlc29sdXRpb25zW2ldLCBmYWN0b3IpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2NhbGVzO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgaW5pdFByb2o0RGVmcyhwcm9qNERlZnM6IGFueSk6IHZvaWQge1xuICAgICAgICBmb3IgKGNvbnN0IG5hbWUgaW4gcHJvajREZWZzKSB7XG4gICAgICAgICAgICBwcm9qNC5kZWZzKG5hbWUsIHByb2o0RGVmc1tuYW1lXSk7XG4gICAgICAgICAgICBsZXQgcHIgPSBvbC5wcm9qLmdldChuYW1lKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0UHJvaihwcm9qQ29kZTogc3RyaW5nKTogb2wucHJvai5Qcm9qZWN0aW9uIHtcbiAgICAgICAgcmV0dXJuIG9sLnByb2ouZ2V0KHByb2pDb2RlKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGdldFN0eWxlKG9wdGlvbnM6IGFueSwgc3R5bGU6IG9sLnN0eWxlLlN0eWxlID0gbnVsbCk6IG9sLnN0eWxlLlN0eWxlIHtcbiAgICAgICAgbGV0IHN0eWxlXyA9IHN0eWxlID8gc3R5bGUgOiBuZXcgb2wuc3R5bGUuU3R5bGUoKTtcbiAgICAgICAgc3R5bGVfLnNldEZpbGwobmV3IG9sLnN0eWxlLkZpbGwob3B0aW9uc1snZmlsbCddKSk7XG4gICAgICAgIHN0eWxlXy5zZXRTdHJva2UobmV3IG9sLnN0eWxlLlN0cm9rZShvcHRpb25zWydzdHJva2UnXSkpO1xuICAgICAgICBpZiAob3B0aW9uc1snaW1hZ2UnXSAmJiBvcHRpb25zWydpbWFnZSddWydjaXJjbGUnXSkge1xuICAgICAgICAgICAgc3R5bGVfLnNldEltYWdlKG5ldyBvbC5zdHlsZS5DaXJjbGUoe1xuICAgICAgICAgICAgICAgICAgICByYWRpdXM6IG9wdGlvbnNbJ2ltYWdlJ11bJ2NpcmNsZSddWydyYWRpdXMnXSxcbiAgICAgICAgICAgICAgICAgICAgZmlsbDogbmV3IG9sLnN0eWxlLkZpbGwoe1xuICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6IG9wdGlvbnNbJ2ltYWdlJ11bJ2NpcmNsZSddWydmaWxsJ11bJ2NvbG9yJ11cbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3R5bGVfO1xuICAgICAgICAvL1xuICAgICAgICAvLyByZXR1cm4gbmV3IG9sLnN0eWxlXy5TdHlsZSh7XG4gICAgICAgIC8vICAgICBmaWxsOiBuZXcgb2wuc3R5bGVfLkZpbGwob3B0aW9uc1snZmlsbCddKSxcbiAgICAgICAgLy8gICAgIHN0cm9rZTogbmV3IG9sLnN0eWxlXy5TdHJva2Uob3B0aW9uc1snc3Ryb2tlJ10pLy8sXG4gICAgICAgIC8vICAgICAvLyBpbWFnZTogbmV3IG9sLnN0eWxlXy5DaXJjbGUoe1xuICAgICAgICAvLyAgICAgLy8gICAgIHJhZGl1czogNyxcbiAgICAgICAgLy8gICAgIC8vICAgICBmaWxsOiBuZXcgb2wuc3R5bGVfLkZpbGwob3B0aW9uc1snZmlsbCddKVxuICAgICAgICAvLyAgICAgLy8gfSlcbiAgICAgICAgLy8gfSk7XG4gICAgfVxuXG4vLyBmaWxsXG4vLyB7XG4vLyAgICAgY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4yKVxuLy8gfVxuLy8gc3Ryb2tlXG4vLyB7XG4vLyAgICAgY29sb3I6ICcjZmZjYzMzJyxcbi8vICAgICB3aWR0aDogMlxuLy8gICAgIGRhc2g6XG4vLyB9XG4vLyBpbWFnZVxufVxuXG5leHBvcnQgY2xhc3MgT2w0R2VvbSB7XG4gICAgcHJvdGVjdGVkIGdlb206IG9sLmdlb20uR2VvbWV0cnkgPSBudWxsO1xuICAgIHByb3RlY3RlZCBwcm9qOiBvbC5wcm9qLlByb2plY3Rpb24gPSBudWxsO1xuXG4gICAgY29uc3RydWN0b3IoZ2VvbTogb2wuZ2VvbS5HZW9tZXRyeSwgcHJvajogb2wucHJvai5Qcm9qZWN0aW9uKSB7XG4gICAgICAgIHRoaXMuZ2VvbSA9IGdlb207XG4gICAgICAgIHRoaXMucHJvaiA9IHByb2o7XG4gICAgfVxuXG4gICAgZ2V0R2VvbSgpOiBvbC5nZW9tLkdlb21ldHJ5IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2VvbTtcbiAgICB9XG5cbiAgICBnZXRQcm9qKCk6IG9sLnByb2ouUHJvamVjdGlvbiB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb2o7XG4gICAgfVxuXG4gICAgZ2V0RXh0ZW50KHByb2o6IG9sLnByb2ouUHJvamVjdGlvbik6IG9sLkV4dGVudCB7XG4gICAgICAgIGlmICh0aGlzLnByb2ogIT09IHByb2opIHtcbiAgICAgICAgICAgIHJldHVybiAoPG9sLmdlb20uR2VvbWV0cnk+KDxhbnk+IHRoaXMuZ2VvbSkuY2xvbmUoKSkudHJhbnNmb3JtKHRoaXMucHJvaiwgcHJvaikuZ2V0RXh0ZW50KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gKDxvbC5nZW9tLkdlb21ldHJ5Pig8YW55PiB0aGlzLmdlb20pLmNsb25lKCkpLmdldEV4dGVudCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGdldFBvbHlnb25Gb3JFeHRlbnQocHJvajogb2wucHJvai5Qcm9qZWN0aW9uKSB7XG4gICAgICAgIHJldHVybiBvbC5nZW9tLlBvbHlnb24uZnJvbUV4dGVudCh0aGlzLmdldEV4dGVudChwcm9qKSk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgT2w0RXh0ZW50IGV4dGVuZHMgT2w0R2VvbSB7XG4gICAgcHVibGljIHN0YXRpYyBmcm9tQXJyYXkob3JkaW5hdGVzOiBudW1iZXJbXSwgcHJvajogb2wucHJvai5Qcm9qZWN0aW9uKTogT2w0RXh0ZW50IHtcbiAgICAgICAgbGV0IGdlb20gPSBuZXcgb2wuZ2VvbS5NdWx0aVBvaW50KFtbb3JkaW5hdGVzWzBdLCBvcmRpbmF0ZXNbMV1dLCBbb3JkaW5hdGVzWzJdLCBvcmRpbmF0ZXNbM11dXSk7XG4gICAgICAgIHJldHVybiBuZXcgT2w0RXh0ZW50KGdlb20sIHByb2opO1xuICAgIH1cbn1cblxuZXhwb3J0IGNvbnN0IFVVSUQ6IHN0cmluZyA9ICd1dWlkJztcbmV4cG9ydCBjb25zdCBMQVlFUl9VVUlEOiBzdHJpbmcgPSAnbGF5ZXJ1dWlkJztcbmV4cG9ydCBjb25zdCBUSVRMRTogc3RyaW5nID0gJ3RpdGxlJztcbmV4cG9ydCBjb25zdCBNRVRBRE9SX0VQU0c6IG9sLlByb2plY3Rpb25MaWtlID0gJ0VQU0c6NDMyNic7XG5leHBvcnQgY29uc3QgTEFZRVJfVkVDVE9SID0gJ3ZlY3Rvcic7XG5leHBvcnQgY29uc3QgTEFZRVJfSU1BR0UgPSAnaW1hZ2UnO1xuXG5leHBvcnQgY2xhc3MgT2w0TWFwIHtcbiAgICBwcml2YXRlIHN0YXRpYyBfdXVpZCA9IDA7XG4gICAgcHJpdmF0ZSBzdGF0aWMgX2luc3RhbmNlOiBPbDRNYXAgPSBudWxsOyAvLyBzaW5nbGV0b25cbiAgICBwcml2YXRlIG9sTWFwOiBvbC5NYXAgPSBudWxsO1xuICAgIHByaXZhdGUgc2NhbGVzOiBudW1iZXJbXTtcbiAgICAvLyAgICBwcm90ZWN0ZWQgcHJvajogb2wucHJvai5Qcm9qZWN0aW9uID0gbnVsbDtcbiAgICBwcml2YXRlIHN0YXJ0RXh0ZW50OiBPbDRFeHRlbnQgPSBudWxsOyAgLy8geG1pbiwgeW1pbiwgeG1heCwgeW1heCBvcHRpb25zWydzdGFydEV4dGVudCddXG4gICAgcHJpdmF0ZSBtYXhFeHRlbnQ6IE9sNEV4dGVudCA9IG51bGw7XG4gICAgcHJpdmF0ZSBkcmF3ZXI6IE9sNERyYXdlcjtcbiAgICBwcml2YXRlIHdtc1NvdXJjZTogT2w0V21zU291cmNlO1xuICAgIHByaXZhdGUgdmVjU291cmNlOiBPbDRWZWN0b3JTb3VyY2U7XG4gICAgcHJpdmF0ZSBsYXllcnRyZWU6IExheWVyVHJlZTtcbiAgICBwcml2YXRlIHN0eWxlczogT2JqZWN0O1xuICAgIHByaXZhdGUgaGdMYXllcjogb2wubGF5ZXIuVmVjdG9yO1xuICAgIC8vIHByb3RlY3RlZCBkcmFnem9vbTogb2wuaW50ZXJhY3Rpb24uRHJhZ1pvb207XG4gICAgcHJpdmF0ZSBkcmFnem9vbTogRHJhZ1pvb207XG4gICAgcHJpdmF0ZSBmZWF0dXJlSW5mbzogRmVhdHVyZUluZm87XG5cbiAgICBwcml2YXRlIHN0YXRpYyBnZXRVdWlkKHByZWZpeDogc3RyaW5nID0gJycpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gcHJlZml4ICsgKCsrT2w0TWFwLl91dWlkKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKG9wdGlvbnM6IGFueSkgeyAvLyBzaW5nbGV0b25cbiAgICAgICAgb2xbJ0VOQUJMRV9SQVNURVJfUkVQUk9KRUNUSU9OJ10gPSBmYWxzZTtcbiAgICAgICAgT2w0VXRpbHMuaW5pdFByb2o0RGVmcyhvcHRpb25zWydwcm9qNERlZnMnXSk7XG4gICAgICAgIHRoaXMubGF5ZXJ0cmVlID0gTGF5ZXJUcmVlLmNyZWF0ZSh0aGlzKTtcbiAgICAgICAgdGhpcy53bXNTb3VyY2UgPSBPbDRXbXNTb3VyY2UuY3JlYXRlKHRoaXMsIHRydWUpO1xuICAgICAgICB0aGlzLnZlY1NvdXJjZSA9IE9sNFZlY3RvclNvdXJjZS5jcmVhdGUodGhpcyk7XG4gICAgICAgICg8SFRNTEZvcm1FbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy4tanMtY3JzLWNvZGUnKSkudmFsdWUgPSBvcHRpb25zWyd2aWV3J11bJ3Byb2plY3Rpb24nXTtcbiAgICAgICAgbGV0IHByb2o6IG9sLnByb2ouUHJvamVjdGlvbiA9IG9sLnByb2ouZ2V0KG9wdGlvbnNbJ3ZpZXcnXVsncHJvamVjdGlvbiddKTtcbiAgICAgICAgdGhpcy5zdHlsZXMgPSBvcHRpb25zWydzdHlsZXMnXTtcbiAgICAgICAgdGhpcy5zY2FsZXMgPSBvcHRpb25zWyd2aWV3J11bJ3NjYWxlcyddO1xuICAgICAgICB0aGlzLnN0YXJ0RXh0ZW50ID0gT2w0RXh0ZW50LmZyb21BcnJheShvcHRpb25zWyd2aWV3J11bJ3N0YXJ0RXh0ZW50J10sIHByb2opO1xuICAgICAgICB0aGlzLm1heEV4dGVudCA9IE9sNEV4dGVudC5mcm9tQXJyYXkob3B0aW9uc1sndmlldyddWydtYXhFeHRlbnQnXSwgcHJvaik7XG4gICAgICAgIGxldCBpbnRlcmFjdGlvbnMgPSBvbC5pbnRlcmFjdGlvbi5kZWZhdWx0cyhcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBhbHRTaGlmdERyYWdSb3RhdGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHBpbmNoUm90YXRlOiBmYWxzZVxuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgICBsZXQgY29udHJvbHMgPSBvbC5jb250cm9sLmRlZmF1bHRzKHthdHRyaWJ1dGlvbjogZmFsc2V9KTsvLy5leHRlbmQoW2F0dHJpYnV0aW9uXSlcbiAgICAgICAgdGhpcy5vbE1hcCA9IG5ldyBvbC5NYXAoe1xuICAgICAgICAgICAgaW50ZXJhY3Rpb25zOiBpbnRlcmFjdGlvbnMsXG4gICAgICAgICAgICB0YXJnZXQ6IG9wdGlvbnNbJ21hcCddWyd0YXJnZXQnXSxcbiAgICAgICAgICAgIHJlbmRlcmVyOiAnY2FudmFzJyxcbiAgICAgICAgICAgIGNvbnRyb2xzOiBjb250cm9sc1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5vbE1hcC5zZXRWaWV3KFxuICAgICAgICAgICAgdGhpcy5jcmVhdGVWaWV3KFxuICAgICAgICAgICAgICAgIHByb2osXG4gICAgICAgICAgICAgICAgdGhpcy5tYXhFeHRlbnQuZ2V0RXh0ZW50KHByb2opLFxuICAgICAgICAgICAgICAgIE9sNFV0aWxzLnJlc29sdXRpb25zRm9yU2NhbGVzKHRoaXMuc2NhbGVzLCBwcm9qLmdldFVuaXRzKCkpLnJldmVyc2UoKVxuICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgICAgICAvKiBtYWtlIGEgZ3JvdXAgbGF5ZXIgZm9yIGFsbCBpbWFnZSBsYXllcnMgKFdNUyBldGMuKSovXG4gICAgICAgIGxldCBpbWFnZUdyb3VwID0gbmV3IG9sLmxheWVyLkdyb3VwKHtcbiAgICAgICAgICAgIGxheWVyczogbmV3IG9sLkNvbGxlY3Rpb248b2wubGF5ZXIuQmFzZT4oKVxuICAgICAgICB9KTtcbiAgICAgICAgaW1hZ2VHcm91cC5zZXQoVVVJRCwgTEFZRVJfSU1BR0UpXG4gICAgICAgIHRoaXMub2xNYXAuYWRkTGF5ZXIoaW1hZ2VHcm91cCk7XG4gICAgICAgIC8qIG1ha2UgYSBncm91cCBsYXllciBmb3IgYWxsIHZlY3RvciBsYXllcnMgKEhpZ2h0bGlnaHQsIFNlYXJjaCByZXN1bHRzIGV0Yy4pKi9cbiAgICAgICAgbGV0IHZlY3Rvckdyb3VwID0gbmV3IG9sLmxheWVyLkdyb3VwKHtcbiAgICAgICAgICAgIGxheWVyczogbmV3IG9sLkNvbGxlY3Rpb248b2wubGF5ZXIuQmFzZT4oKVxuICAgICAgICB9KTtcbiAgICAgICAgdmVjdG9yR3JvdXAuc2V0KFVVSUQsIExBWUVSX1ZFQ1RPUilcbiAgICAgICAgdGhpcy5vbE1hcC5hZGRMYXllcih2ZWN0b3JHcm91cCk7XG5cbiAgICAgICAgZm9yIChsZXQgc291cmNlT3B0aW9ucyBvZiBvcHRpb25zWydzb3VyY2UnXSkge1xuICAgICAgICAgICAgaWYgKHNvdXJjZU9wdGlvbnNbJ3R5cGUnXSA9PT0gJ1dNUycpIHtcbiAgICAgICAgICAgICAgICBsZXQgd21zTGF5ZXIgPSB0aGlzLmFkZExheWVyKFxuICAgICAgICAgICAgICAgICAgICB0aGlzLndtc1NvdXJjZS5jcmVhdGVMYXllcihcbiAgICAgICAgICAgICAgICAgICAgICAgIE9sNE1hcC5nZXRVdWlkKCdvbGF5LScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlT3B0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub2xNYXAuZ2V0VmlldygpLmdldFByb2plY3Rpb24oKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZU9wdGlvbnNbJ3Zpc2libGUnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnNlRmxvYXQoc291cmNlT3B0aW9uc1snb3BhY2l0eSddKVxuICAgICAgICAgICAgICAgICAgICApLCB0cnVlXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihzb3VyY2VPcHRpb25zWyd0eXBlJ10gKyAnIGlzIG5vdCBzdXBwb3J0ZWQuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5vbE1hcC5hZGRDb250cm9sKG5ldyBvbC5jb250cm9sLlNjYWxlTGluZSgpKTtcblxuICAgICAgICBsZXQgaWNvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgaWNvbi5jbGFzc05hbWUgPSBcImljb24tZWFydGhcIjtcbiAgICAgICAgdGhpcy5vbE1hcC5hZGRDb250cm9sKG5ldyBvbC5jb250cm9sLlpvb21Ub0V4dGVudCh7XG4gICAgICAgICAgICBleHRlbnQ6IHRoaXMubWF4RXh0ZW50LmdldEV4dGVudChwcm9qKSxcbiAgICAgICAgICAgIGxhYmVsOiBpY29uLFxuICAgICAgICAgICAgdGlwTGFiZWw6IFwiWm9vbSBhdWYgZ2VzYW10ZSBBdXNkZWhudW5nXCJcbiAgICAgICAgfSkpO1xuICAgICAgICB0aGlzLm9sTWFwLmFkZEludGVyYWN0aW9uKG5ldyBvbC5pbnRlcmFjdGlvbi5EcmFnWm9vbSgpKTtcbiAgICAgICAgdGhpcy5vbE1hcC5hZGRDb250cm9sKG5ldyBvbC5jb250cm9sLk1vdXNlUG9zaXRpb24oXG4gICAgICAgICAgICAvLyB7XG4gICAgICAgICAgICAvLyAgICAgY29vcmRpbmF0ZUZvcm1hdDogZnVuY3Rpb24gKGNvb3JkaW5hdGVzKSB7XG4gICAgICAgICAgICAvLyAgICAgICAgIHZhciBjb29yZF94ID0gY29vcmRpbmF0ZXNbMF0udG9GaXhlZCgzKTtcbiAgICAgICAgICAgIC8vICAgICAgICAgdmFyIGNvb3JkX3kgPSBjb29yZGluYXRlc1sxXS50b0ZpeGVkKDMpO1xuICAgICAgICAgICAgLy8gICAgICAgICByZXR1cm4gY29vcmRfeCArICcsICcgKyBjb29yZF95O1xuICAgICAgICAgICAgLy8gICAgIH1cbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgKSk7XG4gICAgICAgIGxldCBtYXBzaXplID0gdGhpcy5vbE1hcC5nZXRTaXplKCk7XG4gICAgICAgIGlmKG1hcHNpemVbMF0gIT09IDAgJiYgbWFwc2l6ZVsxXSkge1xuICAgICAgICAgICAgdGhpcy56b29tVG9FeHRlbnQodGhpcy5zdGFydEV4dGVudC5nZXRQb2x5Z29uRm9yRXh0ZW50KHByb2opKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgaGdsID0gdGhpcy52ZWNTb3VyY2UuY3JlYXRlTGF5ZXIoXG4gICAgICAgICAgICBPbDRNYXAuZ2V0VXVpZCgnb2xheS0nKSxcbiAgICAgICAgICAgIHsnc3R5bGUnOiBPbDRVdGlscy5nZXRTdHlsZSh0aGlzLnN0eWxlc1snaGlnaGxpZ2h0J10pfSxcbiAgICAgICAgICAgIHRoaXMub2xNYXAuZ2V0VmlldygpLmdldFByb2plY3Rpb24oKVxuICAgICAgICApO1xuICAgICAgICB0aGlzLmhnTGF5ZXIgPSA8b2wubGF5ZXIuVmVjdG9yPnRoaXMuYWRkTGF5ZXIoaGdsKTtcblxuICAgICAgICBsZXQgdkxheWVyID0gPG9sLmxheWVyLlZlY3Rvcj50aGlzLmFkZExheWVyKFxuICAgICAgICAgICAgdGhpcy52ZWNTb3VyY2UuY3JlYXRlTGF5ZXIoXG4gICAgICAgICAgICAgICAgT2w0TWFwLmdldFV1aWQoJ29sYXktJyksXG4gICAgICAgICAgICAgICAgeydzdHlsZSc6IE9sNFV0aWxzLmdldFN0eWxlKHRoaXMuc3R5bGVzWydzZWFyY2gnXSl9LFxuICAgICAgICAgICAgICAgIHRoaXMub2xNYXAuZ2V0VmlldygpLmdldFByb2plY3Rpb24oKVxuICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgICAgICB2TGF5ZXIuc2V0TWFwKHRoaXMub2xNYXApO1xuICAgICAgICB0aGlzLmRyYXdlciA9IG5ldyBPbDREcmF3ZXIodkxheWVyKTtcbiAgICAgICAgdGhpcy5kcmFnem9vbSA9IG5ldyBEcmFnWm9vbSh0aGlzLm9sTWFwKTtcbiAgICAgICAgdGhpcy5mZWF0dXJlSW5mbyA9IG5ldyBGZWF0dXJlSW5mbyh0aGlzLm9sTWFwLCB0aGlzLmhnTGF5ZXIpO1xuICAgICAgICB0aGlzLmFjdGl2YXRlRmVhdHVyZUluZm8oKTtcbiAgICB9XG5cbiAgICBhY3RpdmF0ZUZlYXR1cmVJbmZvKCk6IHZvaWQge1xuICAgICAgICB0aGlzLmZlYXR1cmVJbmZvLmFjdGl2YXRlKCk7XG4gICAgfVxuXG4gICAgZGVhY3RpdmF0ZUZlYXR1cmVJbmZvKCk6IHZvaWQge1xuICAgICAgICB0aGlzLmZlYXR1cmVJbmZvLmRlYWN0aXZhdGUoKTtcbiAgICB9XG5cbiAgICByZXNldEZlYXR1cmVJbmZvKCkge1xuICAgICAgICB0aGlzLmZlYXR1cmVJbmZvLnJlc2V0KCk7XG4gICAgfVxuXG4gICAgc2VsZWN0RmVhdHVyZXModXVpZHM6IHN0cmluZ1tdKSB7XG4gICAgICAgIHRoaXMuZmVhdHVyZUluZm8uc2VsZWN0RmVhdHVyZXModXVpZHMpO1xuICAgIH1cblxuICAgIGdldExheWVyVHJlZSgpOiBMYXllclRyZWUge1xuICAgICAgICByZXR1cm4gdGhpcy5sYXllcnRyZWU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhZGRJbnRvTGF5ZXJUcmVlKGxheWVyOiBvbC5sYXllci5CYXNlKSB7XG4gICAgICAgIGlmICh0aGlzLmxheWVydHJlZSkge1xuICAgICAgICAgICAgdGhpcy5sYXllcnRyZWUuYWRkKGxheWVyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgY3JlYXRlVmlldyhwcm9qOiBvbC5wcm9qLlByb2plY3Rpb24sIGV4dGVudDogb2wuRXh0ZW50LCByZXNvbHV0aW9uczogbnVtYmVyW10pIHtcbiAgICAgICAgcmV0dXJuIG5ldyBvbC5WaWV3KHtcbiAgICAgICAgICAgIHByb2plY3Rpb246IHByb2osXG4gICAgICAgICAgICByZXNvbHV0aW9uczogcmVzb2x1dGlvbnMsXG4gICAgICAgICAgICBleHRlbnQ6IGV4dGVudFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB6b29tVG9FeHRlbnQoZ2VvbWV0cnk6IG9sLmdlb20uU2ltcGxlR2VvbWV0cnkgfCBvbC5FeHRlbnQpIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coZ2VvbWV0cnksIHRoaXMub2xNYXAuZ2V0U2l6ZSgpKTtcbiAgICAgICAgdGhpcy5vbE1hcC5nZXRWaWV3KCkuZml0KGdlb21ldHJ5LCA8b2x4LnZpZXcuRml0T3B0aW9ucz50aGlzLm9sTWFwLmdldFNpemUoKSk7XG4gICAgfVxuXG4gICAgc3RhdGljIGNyZWF0ZShvcHRpb25zOiBhbnkpOiBPbDRNYXAge1xuICAgICAgICBpZiAoIU9sNE1hcC5faW5zdGFuY2UpIHsvLyBzaW5nbGV0b25cbiAgICAgICAgICAgIE9sNE1hcC5faW5zdGFuY2UgPSBuZXcgT2w0TWFwKG9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBPbDRNYXAuX2luc3RhbmNlO1xuICAgIH1cblxuICAgIGdldFByb2plY3Rpb24oKTogb2wucHJvai5Qcm9qZWN0aW9uIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub2xNYXAuZ2V0VmlldygpLmdldFByb2plY3Rpb24oKTtcbiAgICB9XG5cbiAgICBnZXREcmF3ZXIoKTogT2w0RHJhd2VyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZHJhd2VyO1xuICAgIH1cblxuICAgIGdldEhnTGF5ZXIoKTogb2wubGF5ZXIuVmVjdG9yIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGdMYXllcjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgbGF5ZXIgaW50byBhIG1hcC5cbiAgICAgKiBAcGFyYW0gb3B0aW9uc1xuICAgICAqL1xuICAgIGFkZExheWVyRm9yT3B0aW9ucyhvcHRpb25zOiBhbnkpIHtcbiAgICAgICAgaWYgKG9wdGlvbnNbJ3R5cGUnXSA9PT0gJ1dNUycpIHtcbiAgICAgICAgICAgIGxldCB3bXNMYXllciA9IHRoaXMuYWRkTGF5ZXIoXG4gICAgICAgICAgICAgICAgdGhpcy53bXNTb3VyY2UuY3JlYXRlTGF5ZXIoXG4gICAgICAgICAgICAgICAgICAgIE9sNE1hcC5nZXRVdWlkKCdvbGF5LScpLFxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9sTWFwLmdldFZpZXcoKS5nZXRQcm9qZWN0aW9uKCksXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnNbJ3Zpc2libGUnXSxcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VGbG9hdChvcHRpb25zWydvcGFjaXR5J10pXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihvcHRpb25zWyd0eXBlJ10gKyAnIGlzIG5vdCBzdXBwb3J0ZWQuJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhZGRMYXllcihsYXllcjogb2wubGF5ZXIuQmFzZSwgYWRkVG9MYXllcnRyZWU6IGJvb2xlYW4gPSBmYWxzZSk6IG9sLmxheWVyLkJhc2Uge1xuICAgICAgICBpZiAobGF5ZXIgaW5zdGFuY2VvZiBvbC5sYXllci5JbWFnZSkge1xuICAgICAgICAgICAgbGV0IGdyb3VwOiBvbC5sYXllci5Hcm91cCA9IDxvbC5sYXllci5Hcm91cD4gdGhpcy5maW5kTGF5ZXIoTEFZRVJfSU1BR0UpO1xuICAgICAgICAgICAgZ3JvdXAuZ2V0TGF5ZXJzKCkuaW5zZXJ0QXQoZ3JvdXAuZ2V0TGF5ZXJzKCkuZ2V0TGVuZ3RoKCksIGxheWVyKTtcbiAgICAgICAgfSBlbHNlIGlmIChsYXllciBpbnN0YW5jZW9mIG9sLmxheWVyLlZlY3Rvcikge1xuICAgICAgICAgICAgbGV0IGdyb3VwOiBvbC5sYXllci5Hcm91cCA9IDxvbC5sYXllci5Hcm91cD4gdGhpcy5maW5kTGF5ZXIoTEFZRVJfVkVDVE9SKTtcbiAgICAgICAgICAgIGdyb3VwLmdldExheWVycygpLmluc2VydEF0KGdyb3VwLmdldExheWVycygpLmdldExlbmd0aCgpLCBsYXllcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYWRkVG9MYXllcnRyZWUpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkSW50b0xheWVyVHJlZShsYXllcik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxheWVyO1xuICAgIH1cblxuICAgIHJlbW92ZUxheWVyKGxheWVyOiBvbC5sYXllci5CYXNlKTogdm9pZCB7XG4gICAgICAgIHRoaXMub2xNYXAucmVtb3ZlTGF5ZXIobGF5ZXIpO1xuICAgIH1cblxuICAgIG1vdmVMYXllcih1dWlkOiBzdHJpbmcsIG9sZFBvczogbnVtYmVyLCBuZXdQb3M6IG51bWJlcik6IHZvaWQge1xuICAgICAgICBsZXQgbGF5ZXI6IG9sLmxheWVyLkJhc2UgPSB0aGlzLmZpbmRMYXllcih1dWlkKTtcbiAgICAgICAgaWYgKGxheWVyIGluc3RhbmNlb2Ygb2wubGF5ZXIuSW1hZ2UpIHtcbiAgICAgICAgICAgIGxldCBncm91cDogb2wubGF5ZXIuR3JvdXAgPSA8b2wubGF5ZXIuR3JvdXA+IHRoaXMuZmluZExheWVyKExBWUVSX0lNQUdFKTtcbiAgICAgICAgICAgIGxldCBsYXllcmxsID0gZ3JvdXAuZ2V0TGF5ZXJzKCkucmVtb3ZlKGxheWVyKTtcbiAgICAgICAgICAgIGdyb3VwLmdldExheWVycygpLmluc2VydEF0KG5ld1BvcywgbGF5ZXJsbCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmaW5kTGF5ZXIodXVpZDogc3RyaW5nKTogb2wubGF5ZXIuQmFzZSB7XG4gICAgICAgIGxldCBsYXllcnMgPSB0aGlzLm9sTWFwLmdldExheWVycygpLmdldEFycmF5KCk7XG4gICAgICAgIGZvciAobGV0IGxheWVyIG9mIGxheWVycykge1xuICAgICAgICAgICAgbGV0IHNvdXJjZTogb2wuc291cmNlLlNvdXJjZTtcbiAgICAgICAgICAgIGlmIChsYXllci5nZXQoVVVJRCkgPT09IHV1aWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbGF5ZXI7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGxheWVyIGluc3RhbmNlb2Ygb2wubGF5ZXIuR3JvdXApIHtcbiAgICAgICAgICAgICAgICBsZXQgc3VibGF5ZXJzID0gKDxvbC5sYXllci5Hcm91cD5sYXllcikuZ2V0TGF5ZXJzKCkuZ2V0QXJyYXkoKTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBzdWJsYXllciBvZiBzdWJsYXllcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN1YmxheWVyLmdldChVVUlEKSA9PT0gdXVpZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN1YmxheWVyO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHVwZGF0ZU1hcCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5vbE1hcC51cGRhdGVTaXplKCk7XG4gICAgICAgIHRoaXMuem9vbVRvRXh0ZW50KHRoaXMuc3RhcnRFeHRlbnQuZ2V0UG9seWdvbkZvckV4dGVudCh0aGlzLm9sTWFwLmdldFZpZXcoKS5nZXRQcm9qZWN0aW9uKCkpKTtcbiAgICB9XG5cbiAgICBjaGFuZ2VDcnMoY3JzOiBzdHJpbmcpIHsgLy8gVE9ET1xuICAgICAgICBsZXQgdG9Qcm9qID0gbnVsbDtcbiAgICAgICAgaWYgKCh0b1Byb2ogPSBvbC5wcm9qLmdldChjcnMpKSkge1xuICAgICAgICAgICAgbGV0IGV4dGVudCA9IE9sNEV4dGVudC5mcm9tQXJyYXkoXG4gICAgICAgICAgICAgICAgdGhpcy5vbE1hcC5nZXRWaWV3KCkuY2FsY3VsYXRlRXh0ZW50KHRoaXMub2xNYXAuZ2V0U2l6ZSgpKSxcbiAgICAgICAgICAgICAgICB0aGlzLmdldFByb2plY3Rpb24oKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGxldCBmcm9tUHJvaiA9IHRoaXMuZ2V0UHJvamVjdGlvbigpO1xuICAgICAgICAgICAgLy8gbGV0IGNlbnRlciA9IHRoaXMub2xNYXAuZ2V0VmlldygpLmdldENlbnRlcigpO1xuICAgICAgICAgICAgLy8gbGV0IGxheWVycyA9ICg8b2wubGF5ZXIuR3JvdXA+dGhpcy5maW5kTGF5ZXIoTEFZRVJfSU1BR0UpKS5nZXRMYXllcnMoKS5nZXRBcnJheSgpO1xuICAgICAgICAgICAgdGhpcy5vbE1hcC5zZXRWaWV3KFxuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlVmlldyhcbiAgICAgICAgICAgICAgICAgICAgdG9Qcm9qLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1heEV4dGVudC5nZXRFeHRlbnQodG9Qcm9qKSxcbiAgICAgICAgICAgICAgICAgICAgT2w0VXRpbHMucmVzb2x1dGlvbnNGb3JTY2FsZXModGhpcy5zY2FsZXMsIHRvUHJvai5nZXRVbml0cygpKS5yZXZlcnNlKClcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgdGhpcy5jaGFuZ2VGb3JJTGF5ZXJzSSgoPG9sLmxheWVyLkdyb3VwPnRoaXMuZmluZExheWVyKExBWUVSX0lNQUdFKSkuZ2V0TGF5ZXJzKCksIGZyb21Qcm9qLCB0b1Byb2opO1xuICAgICAgICAgICAgdGhpcy5jaGFuZ2VGb3JWTGF5ZXJzKCg8b2wubGF5ZXIuR3JvdXA+dGhpcy5maW5kTGF5ZXIoTEFZRVJfVkVDVE9SKSkuZ2V0TGF5ZXJzKCksIGZyb21Qcm9qLCB0b1Byb2opO1xuICAgICAgICAgICAgdGhpcy56b29tVG9FeHRlbnQoZXh0ZW50LmdldFBvbHlnb25Gb3JFeHRlbnQodG9Qcm9qKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGNoYW5nZUZvclZMYXllcnMobGF5ZXJzOiBvbC5Db2xsZWN0aW9uPG9sLmxheWVyLkJhc2U+LCBmcm9tUHJvaiwgdG9Qcm9qKSB7XG4gICAgICAgIGZvciAobGV0IGxheWVyIG9mIGxheWVycy5nZXRBcnJheSgpKSB7XG4gICAgICAgICAgICB0aGlzLnZlY1NvdXJjZS5yZXByb2plY3Rpb25Tb3VyY2UobGF5ZXIsIGZyb21Qcm9qLCB0b1Byb2opO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjaGFuZ2VGb3JJTGF5ZXJzSShsYXllcnM6IG9sLkNvbGxlY3Rpb248b2wubGF5ZXIuQmFzZT4sIGZyb21Qcm9qLCB0b1Byb2opIHtcbiAgICAgICAgZm9yIChsZXQgbGF5ZXIgb2YgbGF5ZXJzLmdldEFycmF5KCkpIHtcbiAgICAgICAgICAgIHRoaXMud21zU291cmNlLnJlcHJvamVjdGlvblNvdXJjZSg8b2wubGF5ZXIuSW1hZ2U+bGF5ZXIsIGZyb21Qcm9qLCB0b1Byb2opO1xuICAgICAgICAgICAgbGV0IHNvdXJjZSA9IDxvbC5zb3VyY2UuSW1hZ2VXTVM+KDxvbC5sYXllci5JbWFnZT5sYXllcikuZ2V0U291cmNlKCk7XG4gICAgICAgICAgICBsZXQgaWxmOiBvbC5JbWFnZUxvYWRGdW5jdGlvblR5cGUgPSBzb3VyY2UuZ2V0SW1hZ2VMb2FkRnVuY3Rpb24oKTtcbiAgICAgICAgICAgIHNvdXJjZS5zZXRJbWFnZUxvYWRGdW5jdGlvbihpbGYpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2V0VmlzaWJsZShsYXllcjogb2wubGF5ZXIuQmFzZSB8IHN0cmluZywgdmlzaWJsaXR5OiBib29sZWFuKTogdm9pZCB7XG4gICAgICAgIGxldCBfbGF5ZXI6IG9sLmxheWVyLkJhc2UgPSBsYXllciBpbnN0YW5jZW9mIG9sLmxheWVyLkJhc2UgPyBsYXllciA6IHRoaXMuZmluZExheWVyKDxzdHJpbmc+bGF5ZXIpO1xuICAgICAgICBpZiAoX2xheWVyKSB7XG4gICAgICAgICAgICBfbGF5ZXIuc2V0VmlzaWJsZSh2aXNpYmxpdHkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2V0T3BhY2l0eShsYXllcjogb2wubGF5ZXIuQmFzZSB8IHN0cmluZywgb3BhY2l0eTogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIGxldCBfbGF5ZXI6IG9sLmxheWVyLkJhc2UgPSBsYXllciBpbnN0YW5jZW9mIG9sLmxheWVyLkJhc2UgPyBsYXllciA6IHRoaXMuZmluZExheWVyKDxzdHJpbmc+bGF5ZXIpO1xuICAgICAgICBpZiAoX2xheWVyKSB7XG4gICAgICAgICAgICBfbGF5ZXIuc2V0T3BhY2l0eShvcGFjaXR5KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNsZWFyRmVhdHVyZXMoKSB7XG4gICAgICAgIHRoaXMudmVjU291cmNlLmNsZWFyRmVhdHVyZXModGhpcy5oZ0xheWVyKTtcbiAgICB9XG5cbiAgICBzaG93RmVhdHVyZXMoZ2VvSnNvbjogT2JqZWN0KSB7XG4gICAgICAgIHRoaXMudmVjU291cmNlLnNob3dGZWF0dXJlcyh0aGlzLmhnTGF5ZXIsIGdlb0pzb24pO1xuICAgIH1cblxuICAgIGdldEZpcnN0R2VvbUZvclNlYXJjaCgpOiBvYmplY3Qge1xuICAgICAgICBsZXQgZmVhdHVyZXMgPSB0aGlzLmRyYXdlci5nZXRMYXllcigpLmdldFNvdXJjZSgpLmdldEZlYXR1cmVzKCk7XG4gICAgICAgIGlmKGZlYXR1cmVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGdlb2pzb24gPSBuZXcgb2wuZm9ybWF0Lkdlb0pTT04oKS53cml0ZUZlYXR1cmVPYmplY3QoXG4gICAgICAgICAgICBmZWF0dXJlc1swXSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAnZGF0YVByb2plY3Rpb24nOiBNRVRBRE9SX0VQU0csXG4gICAgICAgICAgICAgICAgJ2ZlYXR1cmVQcm9qZWN0aW9uJzogdGhpcy5nZXRQcm9qZWN0aW9uKClcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgICAgZ2VvanNvblsnYmJveCddID0gbmV3IE9sNEdlb20oZmVhdHVyZXNbMF0uZ2V0R2VvbWV0cnkoKSwgdGhpcy5nZXRQcm9qZWN0aW9uKCkpXG4gICAgICAgICAgICAuZ2V0RXh0ZW50KG9sLnByb2ouZ2V0KE1FVEFET1JfRVBTRykpO1xuICAgICAgICByZXR1cm4gZ2VvanNvbjtcbiAgICB9XG5cbiAgICBkcmF3R2VvbWV0cnlGb3JTZWFyY2goZ2VvSnNvbjogT2JqZWN0LCBvbkRyYXdFbmQ6IEZ1bmN0aW9uID0gbnVsbCkge1xuICAgICAgICBsZXQgb2w0bWFwID0gdGhpcztcbiAgICAgICAgbGV0IG9sTWFwID0gdGhpcy5vbE1hcDtcbiAgICAgICAgdGhpcy52ZWNTb3VyY2UuY2xlYXJGZWF0dXJlcyh0aGlzLmRyYXdlci5nZXRMYXllcigpKTtcbiAgICAgICAgdGhpcy52ZWNTb3VyY2Uuc2hvd0ZlYXR1cmVzKHRoaXMuZHJhd2VyLmdldExheWVyKCksIGdlb0pzb24pO1xuICAgICAgICBsZXQgbXVsdGlQb2ludDogb2wuZ2VvbS5NdWx0aVBvaW50ID0gPG9sLmdlb20uTXVsdGlQb2ludD4gT2w0RXh0ZW50LmZyb21BcnJheShcbiAgICAgICAgICAgIHRoaXMuZHJhd2VyLmdldExheWVyKCkuZ2V0U291cmNlKCkuZ2V0RXh0ZW50KCksXG4gICAgICAgICAgICB0aGlzLm9sTWFwLmdldFZpZXcoKS5nZXRQcm9qZWN0aW9uKClcbiAgICAgICAgKS5nZXRHZW9tKCk7XG4gICAgICAgIGxldCBtYXhleHRlbnQgPSB0aGlzLm1heEV4dGVudC5nZXRQb2x5Z29uRm9yRXh0ZW50KHRoaXMub2xNYXAuZ2V0VmlldygpLmdldFByb2plY3Rpb24oKSk7XG4gICAgICAgIGlmIChtYXhleHRlbnQuaW50ZXJzZWN0c0Nvb3JkaW5hdGUobXVsdGlQb2ludC5nZXRQb2ludCgwKS5nZXRDb29yZGluYXRlcygpKVxuICAgICAgICAgICAgfHwgbWF4ZXh0ZW50LmludGVyc2VjdHNDb29yZGluYXRlKG11bHRpUG9pbnQuZ2V0UG9pbnQoMSkuZ2V0Q29vcmRpbmF0ZXMoKSkpIHtcbiAgICAgICAgICAgIHRoaXMuem9vbVRvRXh0ZW50KHRoaXMuZHJhd2VyLmdldExheWVyKCkuZ2V0U291cmNlKCkuZ2V0RXh0ZW50KCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbWV0YWRvci5kaXNwbGF5RXJyb3IoJ0RpZSBHZW9tZXRyaWUgaXN0IGF1w59lcmhhbGIgZGVyIHLDpHVtbGljaGVuIEVyc3RyZWNrdW5nLicpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBnZW9GZWF0dXJlID0gdGhpcy5nZXRGaXJzdEdlb21Gb3JTZWFyY2goKTtcbiAgICAgICAgaWYgKG9uRHJhd0VuZCAhPT0gbnVsbCAmJiBnZW9GZWF0dXJlKSB7XG4gICAgICAgICAgICBvbkRyYXdFbmQoZ2VvRmVhdHVyZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkcmF3U2hhcGVGb3JTZWFyY2goc2hhcGVUeXBlOiBTSEFQRVMgPSBudWxsLCBvbkRyYXdFbmQ6IEZ1bmN0aW9uID0gbnVsbCkge1xuICAgICAgICB0aGlzLnNldERvdWJsZUNsaWNrWm9vbShmYWxzZSk7XG4gICAgICAgIGxldCBvbDRtYXAgPSB0aGlzO1xuICAgICAgICBsZXQgb2xNYXAgPSB0aGlzLm9sTWFwO1xuICAgICAgICBjb25zdCBzaGFwZTogU0hBUEVTID0gdHlwZW9mIHNoYXBlVHlwZSA9PT0gJ3N0cmluZycgPyBTSEFQRVNbPHN0cmluZz4gc2hhcGVUeXBlXSA6IHNoYXBlVHlwZTtcbiAgICAgICAgaWYgKHRoaXMuZHJhd2VyLmdldEludGVyYWN0aW9uKCkpIHtcbiAgICAgICAgICAgIHRoaXMub2xNYXAucmVtb3ZlSW50ZXJhY3Rpb24odGhpcy5kcmF3ZXIuZ2V0SW50ZXJhY3Rpb24oKSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5kcmF3ZXIuc2V0SW50ZXJhY3Rpb24oc2hhcGUsIE9sNFV0aWxzLmdldFN0eWxlKHRoaXMuc3R5bGVzWydzZWFyY2gnXSkpO1xuICAgICAgICBpZiAodGhpcy5kcmF3ZXIuZ2V0SW50ZXJhY3Rpb24oKSkge1xuICAgICAgICAgICAgbGV0IGRyYXdlciA9IHRoaXMuZHJhd2VyO1xuICAgICAgICAgICAgdGhpcy5nZXREcmF3ZXIoKS5nZXRMYXllcigpLmdldFNvdXJjZSgpLmNsZWFyKCk7XG4gICAgICAgICAgICB0aGlzLm9sTWFwLmFkZEludGVyYWN0aW9uKHRoaXMuZHJhd2VyLmdldEludGVyYWN0aW9uKCkpO1xuICAgICAgICAgICAgdGhpcy5kcmF3ZXIuZ2V0SW50ZXJhY3Rpb24oKS5vbihcbiAgICAgICAgICAgICAgICAnZHJhd3N0YXJ0JyxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICBvbDRtYXAuZ2V0RHJhd2VyKCkuZ2V0TGF5ZXIoKS5nZXRTb3VyY2UoKS5jbGVhcigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICB0aGlzLmRyYXdlci5nZXRJbnRlcmFjdGlvbigpLm9uKFxuICAgICAgICAgICAgICAgICdkcmF3ZW5kJyxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgZ2VvanNvbiA9IG5ldyBvbC5mb3JtYXQuR2VvSlNPTigpLndyaXRlRmVhdHVyZU9iamVjdChcbiAgICAgICAgICAgICAgICAgICAgICAgIGUuZmVhdHVyZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGF0YVByb2plY3Rpb24nOiBNRVRBRE9SX0VQU0csXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2ZlYXR1cmVQcm9qZWN0aW9uJzogb2w0bWFwLmdldFByb2plY3Rpb24oKVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICBnZW9qc29uWydiYm94J10gPSBuZXcgT2w0R2VvbShlLmZlYXR1cmUuZ2V0R2VvbWV0cnkoKSwgb2w0bWFwLmdldFByb2plY3Rpb24oKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5nZXRFeHRlbnQob2wucHJvai5nZXQoTUVUQURPUl9FUFNHKSk7XG4gICAgICAgICAgICAgICAgICAgIG9uRHJhd0VuZChnZW9qc29uKTtcbiAgICAgICAgICAgICAgICAgICAgb2xNYXAucmVtb3ZlSW50ZXJhY3Rpb24oZHJhd2VyLmdldEludGVyYWN0aW9uKCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmdldERyYXdlcigpLmdldExheWVyKCkuZ2V0U291cmNlKCkuY2xlYXIoKTtcbiAgICAgICAgICAgIG9uRHJhd0VuZChudWxsKTtcbiAgICAgICAgICAgIHRoaXMuc2V0RG91YmxlQ2xpY2tab29tKHRydWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWN0aXZhdGVzIC8gZGVhY3RpdmF0ZXMgaW50ZXJhY3Rpb24gb2wuaW50ZXJhY3Rpb24uRG91YmxlQ2xpY2tab29tXG4gICAgICogQHBhcmFtIHtib29sZWFufSBzdGF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgc2V0RG91YmxlQ2xpY2tab29tKHN0YXRlOiBib29sZWFuKSB7XG4gICAgICAgIGZvciAobGV0IGludGVyYWN0aW9uIG9mIHRoaXMub2xNYXAuZ2V0SW50ZXJhY3Rpb25zKCkuZ2V0QXJyYXkoKSkge1xuICAgICAgICAgICAgaWYgKGludGVyYWN0aW9uIGluc3RhbmNlb2Ygb2wuaW50ZXJhY3Rpb24uRG91YmxlQ2xpY2tab29tKSB7XG4gICAgICAgICAgICAgICAgaW50ZXJhY3Rpb24uc2V0QWN0aXZlKHN0YXRlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGVudW0gU0hBUEVTIHtOT05FLCBCT1gsIFBPTFlHT059XG47XG5cbmV4cG9ydCBjbGFzcyBPbDREcmF3ZXIge1xuICAgIC8vIHByaXZhdGUgc3RhdGljIF9pbnN0YW5jZTogT2w0RHJhd2VyO1xuICAgIHByb3RlY3RlZCBsYXllcjogb2wubGF5ZXIuVmVjdG9yO1xuICAgIHByb3RlY3RlZCBpbnRlcmFjdGlvbjogb2wuaW50ZXJhY3Rpb24uRHJhdztcblxuICAgIGNvbnN0cnVjdG9yKGxheWVyOiBvbC5sYXllci5WZWN0b3IpIHtcbiAgICAgICAgdGhpcy5sYXllciA9IGxheWVyO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRMYXllcigpOiBvbC5sYXllci5WZWN0b3Ige1xuICAgICAgICByZXR1cm4gdGhpcy5sYXllcjtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0SW50ZXJhY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmludGVyYWN0aW9uO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRJbnRlcmFjdGlvbih0eXBlOiBTSEFQRVMsIGRyYXdTdHlsZTogb2wuc3R5bGUuU3R5bGUpIHtcbiAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICBjYXNlIFNIQVBFUy5CT1g6XG4gICAgICAgICAgICAgICAgdGhpcy5pbnRlcmFjdGlvbiA9IG5ldyBvbC5pbnRlcmFjdGlvbi5EcmF3KHtcbiAgICAgICAgICAgICAgICAgICAgc291cmNlOiB0aGlzLmxheWVyLmdldFNvdXJjZSgpLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnQ2lyY2xlJyxcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IGRyYXdTdHlsZSxcbiAgICAgICAgICAgICAgICAgICAgZ2VvbWV0cnlGdW5jdGlvbjogY3JlYXRlQm94KCkgLy8gb2wuZC50cyBoYXMgbm8gZnVuY3Rpb24gXCJvbC5pbnRlcmFjdGlvbi5EcmF3LmNyZWF0ZUJveCgpXCJcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgU0hBUEVTLlBPTFlHT046XG4gICAgICAgICAgICAgICAgdGhpcy5pbnRlcmFjdGlvbiA9IG5ldyBvbC5pbnRlcmFjdGlvbi5EcmF3KHtcbiAgICAgICAgICAgICAgICAgICAgc291cmNlOiB0aGlzLmxheWVyLmdldFNvdXJjZSgpLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnUG9seWdvbicsXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiBkcmF3U3R5bGVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhpcy5pbnRlcmFjdGlvbiA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogb2wuZC50cyBoYXMgbm8gZnVuY3Rpb24gXCJvbC5pbnRlcmFjdGlvbi5EcmF3LmNyZWF0ZUJveCgpXCJcbiAqIEByZXR1cm5zIHsoY29vcmRpbmF0ZXM6YW55LCBvcHRfZ2VvbWV0cnk6YW55KT0+YW55fG9sLmdlb20uUG9seWdvbn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUJveCgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtIHtvbC5Db29yZGluYXRlfEFycmF5LjxvbC5Db29yZGluYXRlPnxBcnJheS48QXJyYXkuPG9sLkNvb3JkaW5hdGU+Pn0gY29vcmRpbmF0ZXNcbiAgICAgICAgICogQHBhcmFtIHtvbC5nZW9tLlNpbXBsZUdlb21ldHJ5PX0gb3B0X2dlb21ldHJ5XG4gICAgICAgICAqIEByZXR1cm4ge29sLmdlb20uU2ltcGxlR2VvbWV0cnl9XG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiAoY29vcmRpbmF0ZXMsIG9wdF9nZW9tZXRyeSkge1xuICAgICAgICAgICAgdmFyIGV4dGVudCA9IG9sLmV4dGVudC5ib3VuZGluZ0V4dGVudChjb29yZGluYXRlcyk7XG4gICAgICAgICAgICB2YXIgZ2VvbWV0cnkgPSBvcHRfZ2VvbWV0cnkgfHwgbmV3IG9sLmdlb20uUG9seWdvbihudWxsKTtcbiAgICAgICAgICAgIGdlb21ldHJ5LnNldENvb3JkaW5hdGVzKFtbXG4gICAgICAgICAgICAgICAgb2wuZXh0ZW50LmdldEJvdHRvbUxlZnQoZXh0ZW50KSxcbiAgICAgICAgICAgICAgICBvbC5leHRlbnQuZ2V0Qm90dG9tUmlnaHQoZXh0ZW50KSxcbiAgICAgICAgICAgICAgICBvbC5leHRlbnQuZ2V0VG9wUmlnaHQoZXh0ZW50KSxcbiAgICAgICAgICAgICAgICBvbC5leHRlbnQuZ2V0VG9wTGVmdChleHRlbnQpLFxuICAgICAgICAgICAgICAgIG9sLmV4dGVudC5nZXRCb3R0b21MZWZ0KGV4dGVudClcbiAgICAgICAgICAgIF1dKTtcbiAgICAgICAgICAgIHJldHVybiBnZW9tZXRyeTtcbiAgICAgICAgfVxuICAgICk7XG59XG5cbmRlY2xhcmUgdmFyIG1ldGFkb3I6IGFueTsiLCJpbXBvcnQge1RJVExFLCBVVUlELCBMQVlFUl9VVUlELCBPbDRNYXB9IGZyb20gXCIuL09sNFwiO1xuaW1wb3J0IHtMYXllclRyZWV9IGZyb20gJy4vTGF5ZXJUcmVlJztcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIE9sNFNvdXJjZSB7XG5cbiAgICBhYnN0cmFjdCBjcmVhdGVMYXllcihsYXllclV1aWQ6IHN0cmluZywgb3B0aW9uczogYW55LCBwcm9qOiBvbC5Qcm9qZWN0aW9uTGlrZSwgdmlzaWJsZTogYm9vbGVhbiwgb3BhY2l0eTogbnVtYmVyKTogb2wubGF5ZXIuQmFzZTtcblxuICAgIGFic3RyYWN0IHJlcHJvamVjdGlvblNvdXJjZShsYXllcjogb2wubGF5ZXIuQmFzZSwgZnJvbVByb2o6IG9sLlByb2plY3Rpb25MaWtlLCB0b1Byb2o6IG9sLlByb2plY3Rpb25MaWtlKTtcblxuICAgIGFic3RyYWN0IGNsb25lTGF5ZXIobGF5ZXI6IG9sLmxheWVyLkJhc2UsIGZyb21Qcm9qOiBvbC5Qcm9qZWN0aW9uTGlrZSwgdG9Qcm9qOiBvbC5Qcm9qZWN0aW9uTGlrZSk6IG9sLmxheWVyLkJhc2U7XG59XG5cbmV4cG9ydCBjbGFzcyBPbDRWZWN0b3JTb3VyY2UgaW1wbGVtZW50cyBPbDRTb3VyY2Uge1xuICAgIHByaXZhdGUgc3RhdGljIF9pbnN0YW5jZTogT2w0VmVjdG9yU291cmNlO1xuICAgIHByb3RlY3RlZCBzaG93YWJsZTogYm9vbGVhbiA9IGZhbHNlO1xuICAgIHByaXZhdGUgb2w0TWFwOiBPbDRNYXA7XG5cbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKG9sNE1hcDogT2w0TWFwKSB7XG4gICAgICAgIC8vIHN1cGVyKGZhbHNlKTtcbiAgICAgICAgdGhpcy5vbDRNYXAgPSBvbDRNYXA7XG4gICAgICAgIC8vIHRoaXMuc2V0U2hvd2FibGUoZmFsc2UpO1xuICAgIH1cblxuICAgIHN0YXRpYyBjcmVhdGUob2w0bWFwOiBPbDRNYXApOiBPbDRWZWN0b3JTb3VyY2Uge1xuICAgICAgICBpZiAoIU9sNFZlY3RvclNvdXJjZS5faW5zdGFuY2UpIHsvLyBzaW5nbGV0b25cbiAgICAgICAgICAgIE9sNFZlY3RvclNvdXJjZS5faW5zdGFuY2UgPSBuZXcgT2w0VmVjdG9yU291cmNlKG9sNG1hcCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE9sNFZlY3RvclNvdXJjZS5faW5zdGFuY2U7XG4gICAgfVxuXG4gICAgY3JlYXRlTGF5ZXIobGF5ZXJVdWlkOiBzdHJpbmcsIG9wdGlvbnM6IGFueSwgcHJvajogb2wuUHJvamVjdGlvbkxpa2UsIHZpc2libGU6IGJvb2xlYW4gPSB0cnVlLCBvcGFjaXR5OiBudW1iZXIgPSAxLjApOiBvbC5sYXllci5CYXNlIHtcbiAgICAgICAgbGV0IHZMYXllciA9IG5ldyBvbC5sYXllci5WZWN0b3Ioe1xuICAgICAgICAgICAgc291cmNlOiBuZXcgb2wuc291cmNlLlZlY3Rvcih7d3JhcFg6IGZhbHNlfSksXG4gICAgICAgICAgICBzdHlsZTogb3B0aW9uc1snc3R5bGUnXVxuICAgICAgICB9KTtcbiAgICAgICAgdkxheWVyLnNldChVVUlELCBsYXllclV1aWQpO1xuICAgICAgICByZXR1cm4gdkxheWVyO1xuICAgIH1cblxuICAgIHJlcHJvamVjdGlvblNvdXJjZShsYXllcjogb2wubGF5ZXIuQmFzZSwgZnJvbVByb2o6IG9sLlByb2plY3Rpb25MaWtlLCB0b1Byb2o6IG9sLlByb2plY3Rpb25MaWtlKSB7XG4gICAgICAgIGxldCBzb3VyY2UgPSAoPG9sLmxheWVyLkxheWVyPmxheWVyKS5nZXRTb3VyY2UoKTtcbiAgICAgICAgbGV0IGZlYXR1cmVzOiBvbC5GZWF0dXJlW10gPSAoPG9sLnNvdXJjZS5WZWN0b3I+c291cmNlKS5nZXRGZWF0dXJlcygpO1xuICAgICAgICBmb3IgKGxldCBmZWF0dXJlIG9mIGZlYXR1cmVzKSB7XG4gICAgICAgICAgICBmZWF0dXJlLnNldEdlb21ldHJ5KGZlYXR1cmUuZ2V0R2VvbWV0cnkoKS50cmFuc2Zvcm0oZnJvbVByb2osIHRvUHJvaikpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY2xvbmVMYXllcihsYXllcjogb2wubGF5ZXIuQmFzZSwgZnJvbVByb2o6IG9sLlByb2plY3Rpb25MaWtlLCB0b1Byb2o6IG9sLlByb2plY3Rpb25MaWtlKTogb2wubGF5ZXIuQmFzZSB7XG4gICAgICAgIC8qIFRPRE8gZm9yIGNsb25lICovXG4gICAgICAgIHJldHVybiBsYXllcjtcbiAgICB9XG5cbiAgICBzaG93RmVhdHVyZXModkxheWVyOiBvbC5sYXllci5WZWN0b3IsIGdlb0pzb246IE9iamVjdCkge1xuICAgICAgICBsZXQgZ2VvSnNvblJlYWRlcjogb2wuZm9ybWF0Lkdlb0pTT04gPSBuZXcgb2wuZm9ybWF0Lkdlb0pTT04oKTtcbiAgICAgICAgbGV0IGRhdGFwcm9qID0gZ2VvSnNvblJlYWRlci5yZWFkUHJvamVjdGlvbihnZW9Kc29uKTtcbiAgICAgICAgbGV0IGZlYXR1cmVzID0gZ2VvSnNvblJlYWRlci5yZWFkRmVhdHVyZXMoXG4gICAgICAgICAgICBnZW9Kc29uLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICdkYXRhUHJvamVjdGlvbic6IGdlb0pzb25SZWFkZXIucmVhZFByb2plY3Rpb24oZ2VvSnNvbiksXG4gICAgICAgICAgICAgICAgJ2ZlYXR1cmVQcm9qZWN0aW9uJzogdGhpcy5vbDRNYXAuZ2V0UHJvamVjdGlvbigpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgdkxheWVyLmdldFNvdXJjZSgpLmFkZEZlYXR1cmVzKGZlYXR1cmVzKTtcbiAgICB9XG5cbiAgICBjbGVhckZlYXR1cmVzKHZMYXllcjogb2wubGF5ZXIuVmVjdG9yKSB7XG4gICAgICAgIHZMYXllci5nZXRTb3VyY2UoKS5jbGVhcih0cnVlKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBPbDRXbXNTb3VyY2UgaW1wbGVtZW50cyBPbDRTb3VyY2Uge1xuICAgIHByaXZhdGUgc3RhdGljIF9pbnN0YW5jZTogT2w0V21zU291cmNlO1xuICAgIHByaXZhdGUgb2w0TWFwOiBPbDRNYXA7XG4gICAgcHJpdmF0ZSB1c2VMb2FkRXZlbnRzOiBib29sZWFuO1xuICAgIHB1YmxpYyBzdGF0aWMgbWFwQWN0aXZpdHk6IE1hcEFjdGl2aXR5Oy8vID0gTWFwQWN0aXZpdHkuY3JlYXRlKCk7XG4gICAgcHVibGljIGRpc2FibGVkOiBhbnk7XG5cbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKG9sNE1hcDogT2w0TWFwLCB1c2VMb2FkRXZlbnRzOiBib29sZWFuID0gdHJ1ZSkge1xuICAgICAgICB0aGlzLm9sNE1hcCA9IG9sNE1hcDtcbiAgICAgICAgdGhpcy51c2VMb2FkRXZlbnRzID0gdXNlTG9hZEV2ZW50cztcbiAgICAgICAgaWYgKHRoaXMudXNlTG9hZEV2ZW50cykge1xuICAgICAgICAgICAgT2w0V21zU291cmNlLm1hcEFjdGl2aXR5ID0gTWFwQWN0aXZpdHkuY3JlYXRlKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5kaXNhYmxlZCA9IHt9O1xuICAgIH1cblxuICAgIHN0YXRpYyBjcmVhdGUob2w0TWFwOiBPbDRNYXAsIHVzZUxvYWRFdmVudHM6IGJvb2xlYW4gPSB0cnVlKTogT2w0V21zU291cmNlIHtcbiAgICAgICAgaWYgKCFPbDRXbXNTb3VyY2UuX2luc3RhbmNlKSB7Ly8gc2luZ2xldG9uXG4gICAgICAgICAgICBPbDRXbXNTb3VyY2UuX2luc3RhbmNlID0gbmV3IE9sNFdtc1NvdXJjZShvbDRNYXAsIHVzZUxvYWRFdmVudHMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBPbDRXbXNTb3VyY2UuX2luc3RhbmNlO1xuICAgIH1cblxuICAgIHB1YmxpYyBhZGREaXNhYmxlZChsYXllcjogb2wubGF5ZXIuQmFzZSkge1xuICAgICAgICB0aGlzLmRpc2FibGVkW2xheWVyLmdldChVVUlEKV0gPSBsYXllci5nZXQoVVVJRCk7XG4gICAgICAgIHRoaXMub2w0TWFwLmdldExheWVyVHJlZSgpLnNldERpc2FibGUobGF5ZXIsIHRydWUpO1xuICAgICAgICB0aGlzLm9sNE1hcC5zZXRWaXNpYmxlKGxheWVyLCBmYWxzZSk7XG4gICAgfVxuXG4gICAgcHVibGljIHJlbW92ZURpc2FibGVkKGxheWVyOiBvbC5sYXllci5CYXNlKSB7XG4gICAgICAgIGlmIChsYXllci5nZXQoVVVJRCkpe1xuICAgICAgICAgICAgdGhpcy5vbDRNYXAuZ2V0TGF5ZXJUcmVlKCkuc2V0RGlzYWJsZShsYXllciwgZmFsc2UpO1xuICAgICAgICAgICAgbGV0IHZpc2libGUgPSB0aGlzLm9sNE1hcC5nZXRMYXllclRyZWUoKS5nZXRWaXNpYmxlKGxheWVyKTtcbiAgICAgICAgICAgIHRoaXMub2w0TWFwLnNldFZpc2libGUobGF5ZXIsIHZpc2libGUpO1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMuZGlzYWJsZWRbbGF5ZXIuZ2V0KFVVSUQpXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNyZWF0ZUxheWVyKGxheWVyVXVpZDogc3RyaW5nLCBvcHRpb25zOiBhbnkgPSBudWxsLCBwcm9qOiBvbC5Qcm9qZWN0aW9uTGlrZSwgdmlzaWJsZTogYm9vbGVhbiwgb3BhY2l0eTogbnVtYmVyKTogb2wubGF5ZXIuQmFzZSB7XG4gICAgICAgIGxldCBzb3VyY2UgPSB0aGlzLmNyZWF0ZVNvdXJjZShsYXllclV1aWQsIG9wdGlvbnNbJ3VybCddLCBvcHRpb25zWydwYXJhbXMnXSwgcHJvaik7XG4gICAgICAgIGxldCBsYXllcldtcyA9IHRoaXMuX2NyZWF0ZUxheWVyKGxheWVyVXVpZCwgdmlzaWJsZSwgb3BhY2l0eSwgc291cmNlLCBvcHRpb25zWyd0aXRsZSddID8gb3B0aW9uc1sndGl0bGUnXSA6IG51bGwpO1xuICAgICAgICByZXR1cm4gbGF5ZXJXbXM7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfY3JlYXRlTGF5ZXIobGF5ZXJVdWlkOiBzdHJpbmcsIHZpc2libGU6IGJvb2xlYW4sIG9wYWNpdHk6IG51bWJlciwgc291cmNlOiBvbC5zb3VyY2UuSW1hZ2VXTVMsIHRpdGxlOiBzdHJpbmcgPSBudWxsKSB7XG4gICAgICAgIGxldCBsYXllcldtcyA9IG5ldyBvbC5sYXllci5JbWFnZSh7XG4gICAgICAgICAgICBzb3VyY2U6IHNvdXJjZSxcbiAgICAgICAgICAgIHZpc2libGU6IHZpc2libGUsXG4gICAgICAgICAgICBvcGFjaXR5OiBvcGFjaXR5XG4gICAgICAgIH0pO1xuICAgICAgICBsYXllcldtcy5zZXQoVVVJRCwgbGF5ZXJVdWlkKTtcbiAgICAgICAgaWYgKHRpdGxlICE9PSBudWxsKSB7XG4gICAgICAgICAgICBsYXllcldtcy5zZXQoVElUTEUsIHRpdGxlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbGF5ZXJXbXM7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjcmVhdGVTb3VyY2UobGF5ZXJVdWlkOiBzdHJpbmcsIHVybDogc3RyaW5nLCBwYXJhbXM6IGFueSwgcHJvajogb2wuUHJvamVjdGlvbkxpa2UpOiBvbC5zb3VyY2UuSW1hZ2VXTVMge1xuICAgICAgICBsZXQgc291cmNlID0gbmV3IG9sLnNvdXJjZS5JbWFnZVdNUyh7XG4gICAgICAgICAgICB1cmw6IHVybCxcbiAgICAgICAgICAgIHBhcmFtczogcGFyYW1zLFxuICAgICAgICAgICAgcHJvamVjdGlvbjogcHJvalxuICAgICAgICB9KTtcbiAgICAgICAgc291cmNlLnNldChMQVlFUl9VVUlELCBsYXllclV1aWQpO1xuICAgICAgICB0aGlzLnNldExvYWRFdmVudHMoc291cmNlKTtcbiAgICAgICAgcmV0dXJuIHNvdXJjZTtcbiAgICB9XG5cbiAgICByZXByb2plY3Rpb25Tb3VyY2UobGF5ZXI6IG9sLmxheWVyLkJhc2UsIGZyb21Qcm9qOiBvbC5Qcm9qZWN0aW9uTGlrZSwgdG9Qcm9qOiBvbC5Qcm9qZWN0aW9uTGlrZSkge1xuICAgICAgICBsZXQgb2xkc291cmNlID0gPG9sLnNvdXJjZS5JbWFnZVdNUz4oPG9sLmxheWVyLkxheWVyPmxheWVyKS5nZXRTb3VyY2UoKTtcbiAgICAgICAgbGV0IG5ld1NvdXJjZSA9IHRoaXMuY3JlYXRlU291cmNlKGxheWVyLmdldChVVUlEKSwgb2xkc291cmNlLmdldFVybCgpLCBvbGRzb3VyY2UuZ2V0UGFyYW1zKCksIHRvUHJvaik7XG4gICAgICAgICg8b2wubGF5ZXIuTGF5ZXI+bGF5ZXIpLnNldFNvdXJjZShuZXdTb3VyY2UpO1xuICAgICAgICB0aGlzLnJlbW92ZURpc2FibGVkKGxheWVyKTtcbiAgICB9XG5cbiAgICBjbG9uZUxheWVyKGxheWVyOiBvbC5sYXllci5CYXNlLCBmcm9tUHJvajogb2wuUHJvamVjdGlvbkxpa2UsIHRvUHJvajogb2wuUHJvamVjdGlvbkxpa2UpOiBvbC5sYXllci5CYXNlIHtcbiAgICAgICAgbGV0IG9sZHNvdXJjZSA9IDxvbC5zb3VyY2UuSW1hZ2VXTVM+KDxvbC5sYXllci5MYXllcj5sYXllcikuZ2V0U291cmNlKCk7XG4gICAgICAgIGxldCBuZXdTb3VyY2UgPSB0aGlzLmNyZWF0ZVNvdXJjZShsYXllci5nZXQoVVVJRCksIG9sZHNvdXJjZS5nZXRVcmwoKSwgb2xkc291cmNlLmdldFBhcmFtcygpLCB0b1Byb2opO1xuICAgICAgICBsZXQgb2xkTGF5ZXIgPSAoPG9sLmxheWVyLkxheWVyPmxheWVyKTtcbiAgICAgICAgbGV0IG5ld0xheWVyID0gdGhpcy5fY3JlYXRlTGF5ZXIob2xkTGF5ZXIuZ2V0KFVVSUQpLCBvbGRMYXllci5nZXRWaXNpYmxlKCksIG9sZExheWVyLmdldE9wYWNpdHkoKSwgbmV3U291cmNlLCBvbGRMYXllci5nZXQoVElUTEUpKTtcbiAgICAgICAgcmV0dXJuIG5ld0xheWVyO1xuICAgIH1cblxuXG4gICAgcHJpdmF0ZSBzZXRMb2FkRXZlbnRzKHNvdXJjZTogb2wuc291cmNlLkltYWdlV01TKSB7XG4gICAgICAgIGlmICh0aGlzLnVzZUxvYWRFdmVudHMpIHtcbiAgICAgICAgICAgIC8vIHNvdXJjZS5zZXRJbWFnZUxvYWRGdW5jdGlvbih0aGlzLmltYWdlTG9hZEZ1bmN0aW9uLmJpbmQodGhpcykpO1xuICAgICAgICAgICAgc291cmNlLm9uKCdpbWFnZWxvYWRzdGFydCcsIHRoaXMuaW1hZ2VMb2FkU3RhcnQuYmluZCh0aGlzKSk7XG4gICAgICAgICAgICBzb3VyY2Uub24oJ2ltYWdlbG9hZGVuZCcsIHRoaXMuaW1hZ2VMb2FkRW5kLmJpbmQodGhpcykpO1xuICAgICAgICAgICAgc291cmNlLm9uKCdpbWFnZWxvYWRlcnJvcicsIHRoaXMuaW1hZ2VMb2FkRXJyb3IuYmluZCh0aGlzKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpbWFnZUxvYWRTdGFydChlOiBvbC5zb3VyY2UuSW1hZ2VFdmVudCkge1xuICAgICAgICAvLyBjb25zb2xlLmxvZygnc3RhcnQnLCAoPG9sLnNvdXJjZS5JbWFnZVdNUz5lLnRhcmdldCkuZ2V0KExBWUVSX1VVSUQpKTtcbiAgICAgICAgaWYgKE9sNFdtc1NvdXJjZS5tYXBBY3Rpdml0eSkge1xuICAgICAgICAgICAgT2w0V21zU291cmNlLm1hcEFjdGl2aXR5LmxvYWRTdGFydCgoPG9sLnNvdXJjZS5JbWFnZVdNUz5lLnRhcmdldCkuZ2V0KExBWUVSX1VVSUQpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGltYWdlTG9hZEVuZChlOiBvbC5zb3VyY2UuSW1hZ2VFdmVudCkge1xuICAgICAgICAvLyBjb25zb2xlLmxvZygnZW5kJywgKDxvbC5zb3VyY2UuSW1hZ2VXTVM+ZS50YXJnZXQpLmdldChMQVlFUl9VVUlEKSk7XG4gICAgICAgIGlmIChPbDRXbXNTb3VyY2UubWFwQWN0aXZpdHkpIHtcbiAgICAgICAgICAgIE9sNFdtc1NvdXJjZS5tYXBBY3Rpdml0eS5sb2FkRW5kKCg8b2wuc291cmNlLkltYWdlV01TPmUudGFyZ2V0KS5nZXQoTEFZRVJfVVVJRCkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaW1hZ2VMb2FkRXJyb3IoZTogb2wuc291cmNlLkltYWdlRXZlbnQpIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ2Vycm9yJywgKDxvbC5zb3VyY2UuSW1hZ2VXTVM+ZS50YXJnZXQpLmdldChMQVlFUl9VVUlEKSk7XG4gICAgICAgIGlmIChPbDRXbXNTb3VyY2UubWFwQWN0aXZpdHkpIHtcbiAgICAgICAgICAgIE9sNFdtc1NvdXJjZS5tYXBBY3Rpdml0eS5sb2FkRXJyb3IoKDxvbC5zb3VyY2UuSW1hZ2VXTVM+ZS50YXJnZXQpLmdldChMQVlFUl9VVUlEKSk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGxheWVyID0gdGhpcy5vbDRNYXAuZmluZExheWVyKCg8b2wuc291cmNlLkltYWdlV01TPmUudGFyZ2V0KS5nZXQoTEFZRVJfVVVJRCkpO1xuICAgICAgICB0aGlzLmFkZERpc2FibGVkKGxheWVyKTtcbiAgICB9XG5cbn1cblxuZXhwb3J0IGNsYXNzIE1hcEFjdGl2aXR5IHtcbiAgICBwcml2YXRlIHN0YXRpYyBfaW5zdGFuY2U6IE1hcEFjdGl2aXR5O1xuICAgIHByaXZhdGUgbGF5ZXJzOiBhbnkgPSB7fTtcbiAgICBwcml2YXRlIGlzTG9hZGluZzogYm9vbGVhbiA9IGZhbHNlO1xuXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcigpIHtcbiAgICB9XG5cbiAgICBzdGF0aWMgY3JlYXRlKCk6IE1hcEFjdGl2aXR5IHtcbiAgICAgICAgaWYgKCFNYXBBY3Rpdml0eS5faW5zdGFuY2UpIHsvLyBzaW5nbGV0b25cbiAgICAgICAgICAgIE1hcEFjdGl2aXR5Ll9pbnN0YW5jZSA9IG5ldyBNYXBBY3Rpdml0eSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBNYXBBY3Rpdml0eS5faW5zdGFuY2U7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhY3Rpdml0eVN0YXJ0KGxheWVyTmFtZTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMubGF5ZXJzW2xheWVyTmFtZV0gPSB0cnVlO1xuICAgICAgICBpZiAodGhpcy5pc0xvYWRpbmcgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICB0aGlzLmlzTG9hZGluZyA9IHRydWU7XG4gICAgICAgICAgICB3aW5kb3dbJ21ldGFkb3InXS5wcmVsb2FkZXJTdGFydCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhY3Rpdml0eUVuZChsYXllck5hbWU6IHN0cmluZykge1xuICAgICAgICBpZiAodGhpcy5sYXllcnNbbGF5ZXJOYW1lXSkge1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMubGF5ZXJzW2xheWVyTmFtZV07XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChsZXQgbGF5ZXJOIGluIHRoaXMubGF5ZXJzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgd2luZG93WydtZXRhZG9yJ10ucHJlbG9hZGVyU3RvcCgpO1xuICAgIH1cblxuICAgIGxvYWRTdGFydChsYXllck5hbWU6IHN0cmluZykge1xuICAgICAgICB0aGlzLmFjdGl2aXR5U3RhcnQobGF5ZXJOYW1lKTtcbiAgICB9XG5cbiAgICBsb2FkRW5kKGxheWVyTmFtZTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuYWN0aXZpdHlFbmQobGF5ZXJOYW1lKTtcbiAgICB9XG5cbiAgICBsb2FkRXJyb3IobGF5ZXJOYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5hY3Rpdml0eUVuZChsYXllck5hbWUpO1xuICAgIH1cbn1cbiIsImV4cG9ydCBjbGFzcyBFRWxlbWVudCB7XG4gICAgcHJpdmF0ZSBfZWxlbWVudDogSFRNTEVsZW1lbnQ7XG5cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50OiBIVE1MRWxlbWVudCkge1xuICAgICAgICB0aGlzLl9lbGVtZW50ID0gZWxlbWVudDtcbiAgICB9XG5cbiAgICBnZXQgZWxlbWVudCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2VsZW1lbnQ7XG4gICAgfVxuXG4gICAgc2V0QXR0cnMoYXR0cnM6IE9iamVjdCA9IHt9KSB7XG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIGF0dHJzKSB7XG4gICAgICAgICAgICB0aGlzLl9lbGVtZW50LnNldEF0dHJpYnV0ZShrZXksIGF0dHJzW2tleV0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2V0QXR0cihrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZykge1xuICAgICAgICB0aGlzLl9lbGVtZW50LnNldEF0dHJpYnV0ZShrZXksIHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZ2V0QXR0cihrZXk6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gdGhpcy5fZWxlbWVudC5nZXRBdHRyaWJ1dGUoa2V5KTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBkb20ge1xuICAgIC8vIHByaXZhdGUgc3RhdGljIGRhdGEgPSBkYXRhO1xuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gdGFnbmFtZVxuICAgICAqIEBwYXJhbSBvcHRpb25zXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fVxuICAgICAqL1xuICAgIHN0YXRpYyBjcmVhdGUodGFnbmFtZTogc3RyaW5nLCBhdHRyczogYW55ID0ge30sIGNsYXNzZXM6IHN0cmluZ1tdID0gW10sIHRleHQ6IHN0cmluZyA9ICcnLCBkYXRhOiBhbnkgPSB7fSk6IEhUTUxFbGVtZW50IHtcbiAgICAgICAgbGV0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZ25hbWUpO1xuICAgICAgICByZXR1cm4gZG9tLmFkZChlbGVtZW50LCBhdHRycywgY2xhc3NlcywgdGV4dCwgZGF0YSk7XG4gICAgfVxuXG4gICAgc3RhdGljIGFkZChlbGVtZW50OiBIVE1MRWxlbWVudCwgYXR0cnM6IGFueSA9IHt9LCBjbGFzc2VzOiBzdHJpbmdbXSA9IFtdLCB0ZXh0OiBzdHJpbmcgPSAnJywgZGF0YTogYW55ID0ge30pOiBIVE1MRWxlbWVudCB7XG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIGF0dHJzKSB7XG4gICAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShrZXksIGF0dHJzW2tleV0pO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgbmFtZSBvZiBjbGFzc2VzKSB7XG4gICAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQobmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRleHQgIT09ICcnKSB7XG4gICAgICAgICAgICBlbGVtZW50LnRleHRDb250ZW50ID0gdGV4dDtcbiAgICAgICAgfVxuICAgICAgICAvLyBmb3IgKGNvbnN0IGtleSBpbiBkYXRhKSB7XG4gICAgICAgIC8vICAgICBlbGVtZW50LmRhdGFzZXRba2V5XSA9IGRhdGFba2V5XTtcbiAgICAgICAgLy8gfVxuXG4gICAgICAgIHJldHVybiBlbGVtZW50O1xuICAgIH1cblxuICAgIHN0YXRpYyBkZWxldGUoZWxlbWVudDogSFRNTEVsZW1lbnQsIGF0dHJzOiBzdHJpbmdbXSA9IFtdLCBjbGFzc2VzOiBzdHJpbmdbXSA9IFtdLCB0ZXh0OiBib29sZWFuID0gZmFsc2UsIGRhdGE6IGFueSA9IHt9KTogSFRNTEVsZW1lbnQge1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBhdHRycykge1xuICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoa2V5KTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IGNsIG9mIGNsYXNzZXMpIHtcbiAgICAgICAgICAgIGRvbS5yZW1vdmVDbGFzcyhlbGVtZW50LCBjbCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gc2VsZWN0b3JcbiAgICAgKiBAcmV0dXJucyB7Tm9kZUxpc3RPZjxFbGVtZW50Pn1cbiAgICAgKi9cbiAgICBzdGF0aWMgZmluZChzZWxlY3Rvcjogc3RyaW5nLCBjb250ZXh0OiBhbnkgPSBkb2N1bWVudCk6IE5vZGVMaXN0T2Y8RWxlbWVudD4ge1xuICAgICAgICBpZiAoY29udGV4dCBpbnN0YW5jZW9mIERvY3VtZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gY29udGV4dC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgICAgICAgfSBlbHNlIGlmIChjb250ZXh0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBjb250ZXh0LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7IC8vIFRPRE8gcmV0dXJuIGEgYmxhbmsgTm9kZUxpc3RPZjxFbGVtZW50PlxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gc2VsZWN0b3JcbiAgICAgKiBAcmV0dXJucyB7RWxlbWVudHxudWxsfVxuICAgICAqL1xuICAgIHN0YXRpYyBmaW5kRmlyc3Qoc2VsZWN0b3I6IHN0cmluZywgY29udGV4dDogYW55ID0gZG9jdW1lbnQpOiBFbGVtZW50IHtcbiAgICAgICAgaWYgKGNvbnRleHQgaW5zdGFuY2VvZiBEb2N1bWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGNvbnRleHQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgICAgIH0gZWxzZSBpZiAoY29udGV4dCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gY29udGV4dC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZWxlbWVudFxuICAgICAqIEBwYXJhbSBuYW1lXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgYW4gZWxlbWVudCBjb250YWlucyBhIGNsYXNzIG5hbWVcbiAgICAgKi9cbiAgICBzdGF0aWMgaGFzQ2xhc3MoZWxlbWVudDogSFRNTEVsZW1lbnQsIG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gZWxlbWVudCAhPT0gbnVsbCAmJiBlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhuYW1lKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gY29udGV4dFxuICAgICAqIEBwYXJhbSBuYW1lXG4gICAgICogQHJldHVybnMge0VsZW1lbnR9XG4gICAgICovXG4gICAgc3RhdGljIGFkZENsYXNzKGNvbnRleHQ6IEhUTUxFbGVtZW50LCBuYW1lOiBzdHJpbmcsIHNlbGVjdG9yOiBzdHJpbmcgPSBudWxsKTogdm9pZCB7XG4gICAgICAgIGlmIChzZWxlY3Rvcikge1xuICAgICAgICAgICAgbGV0IGxpc3Q6IE5vZGVMaXN0T2Y8RWxlbWVudD4gPSBkb20uZmluZChzZWxlY3RvciwgY29udGV4dCk7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsaXN0W2ldLmNsYXNzTGlzdC5hZGQobmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb250ZXh0LmNsYXNzTGlzdC5hZGQobmFtZSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gY29udGV4dFxuICAgICAqIEBwYXJhbSBuYW1lXG4gICAgICogQHJldHVybnMge0VsZW1lbnR9XG4gICAgICovXG4gICAgc3RhdGljIHJlbW92ZUNsYXNzKGNvbnRleHQ6IEVsZW1lbnQsIG5hbWU6IHN0cmluZywgc2VsZWN0b3I6IHN0cmluZyA9IG51bGwpOiB2b2lkIHtcbiAgICAgICAgaWYgKHNlbGVjdG9yKSB7XG4gICAgICAgICAgICBsZXQgbGlzdDogTm9kZUxpc3RPZjxFbGVtZW50PiA9IGRvbS5maW5kKHNlbGVjdG9yLCBjb250ZXh0KTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGxpc3RbaV0uY2xhc3NMaXN0LnJlbW92ZShuYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnRleHQuY2xhc3NMaXN0LnJlbW92ZShuYW1lKTtcbiAgICAgICAgfVxuICAgIH07XG5cblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0gbmFtZVxuICAgICAqIEByZXR1cm5zIHtFbGVtZW50fVxuICAgICAqL1xuICAgIHN0YXRpYyByZW1vdmUoc2VsZWN0b3I6IHN0cmluZywgY29udGV4dDogYW55ID0gZG9jdW1lbnQpOiBOb2RlTGlzdE9mPEVsZW1lbnQ+IHwgbnVsbCB7XG4gICAgICAgIGxldCBsaXN0OiBOb2RlTGlzdE9mPEVsZW1lbnQ+ID0gZG9tLmZpbmQoc2VsZWN0b3IsIGNvbnRleHQpO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGxpc3RbaV0ucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxpc3Q7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0gbmFtZVxuICAgICAqIEByZXR1cm5zIHtFbGVtZW50fVxuICAgICAqL1xuICAgIHN0YXRpYyB0b2dnbGVDbGFzcyhlbGVtZW50OiBFbGVtZW50LCBuYW1lOiBzdHJpbmcpOiBFbGVtZW50IHwgbnVsbCB7XG4gICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShuYW1lKTtcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgfVxuXG4gICAgLy9cbiAgICAvLyAvKipcbiAgICAvLyAgKiBSZXR1cm5zIHdpdGggZWxlbWVudCBiaW5kZWQgZGF0YS5cbiAgICAvLyAgKiBAcGFyYW0gZWxlbWVudFxuICAgIC8vICAqIEBwYXJhbSBrZXlcbiAgICAvLyAgKiBAcmV0dXJucyB7YW55fVxuICAgIC8vICAqL1xuICAgIC8vIHN0YXRpYyBnZXREYXRhKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBrZXk6IHN0cmluZyA9IG51bGwpOiBhbnkge1xuICAgIC8vICAgICBpZiAoIWRvbS5oYXNEYXRhKGVsZW1lbnQsIGtleSkpIHtcbiAgICAvLyAgICAgICAgIHJldHVybiBudWxsO1xuICAgIC8vICAgICB9IGVsc2UgaWYgKGtleSA9PT0gbnVsbCkge1xuICAgIC8vICAgICAgICAgcmV0dXJuIGRvbS5kYXRhLmdldChlbGVtZW50KTtcbiAgICAvLyAgICAgfSBlbHNlIHtcbiAgICAvLyAgICAgICAgIHJldHVybiBkb20uZGF0YS5nZXQoZWxlbWVudClba2V5XTtcbiAgICAvLyAgICAgfVxuICAgIC8vIH1cbiAgICAvL1xuICAgIC8vIC8qKlxuICAgIC8vICAqIEJpbmRzIHdpdGggYW4gZWxlbWVudCBhIGRhdGEuXG4gICAgLy8gICogQHBhcmFtIGVsZW1lbnRcbiAgICAvLyAgKiBAcGFyYW0ga2V5XG4gICAgLy8gICogQHBhcmFtIHZhbHVlXG4gICAgLy8gICovXG4gICAgLy8gc3RhdGljIHNldERhdGEoZWxlbWVudDogSFRNTEVsZW1lbnQsIGtleTogc3RyaW5nLCB2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgLy8gICAgIGlmICghZG9tLmhhc0RhdGEoZWxlbWVudCkpIHtcbiAgICAvLyAgICAgICAgIGRvbS5kYXRhLnNldChlbGVtZW50LCB7a2V5OiB2YWx1ZX0pO1xuICAgIC8vICAgICB9IGVsc2Uge1xuICAgIC8vICAgICAgICAgbGV0IHRtcCA9IGRvbS5nZXREYXRhKGVsZW1lbnQpO1xuICAgIC8vICAgICAgICAgdG1wW2tleV0gPSB2YWx1ZTtcbiAgICAvLyAgICAgICAgIGRvbS5kYXRhLnNldChlbGVtZW50LCB0bXApO1xuICAgIC8vICAgICB9XG4gICAgLy8gfVxuICAgIC8vXG4gICAgLy8gLyoqXG4gICAgLy8gICogQ2hlY2tzIGlmIHRoZSBlbGVtZW50IGlzIGJpbmRpbmcgd2l0aCBhIGRhdGFcbiAgICAvLyAgKiBAcGFyYW0gZWxlbWVudFxuICAgIC8vICAqIEBwYXJhbSBrZXlcbiAgICAvLyAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAvLyAgKi9cbiAgICAvLyBzdGF0aWMgaGFzRGF0YShlbGVtZW50OiBIVE1MRWxlbWVudCwga2V5OiBzdHJpbmcgPSBudWxsKTogYm9vbGVhbiB7XG4gICAgLy8gICAgIGlmICghZG9tLmRhdGEuaGFzKGVsZW1lbnQpKSB7XG4gICAgLy8gICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgLy8gICAgIH0gZWxzZSBpZiAoa2V5ID09PSBudWxsKSB7XG4gICAgLy8gICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAvLyAgICAgfSBlbHNlIHtcbiAgICAvLyAgICAgICAgIHJldHVybiBkb20uZ2V0RGF0YShlbGVtZW50KVtrZXldICE9PSBudWxsID8gdHJ1ZSA6IGZhbHNlO1xuICAgIC8vICAgICB9XG4gICAgLy8gfVxuICAgIC8vXG4gICAgLy8gLyoqXG4gICAgLy8gICogRGVsZXRlcyB3aXRoIGFuIGVsZW1lbnQgYmluZGluZyBkYXRhXG4gICAgLy8gICogQHBhcmFtIGVsZW1lbnRcbiAgICAvLyAgKiBAcGFyYW0ga2V5XG4gICAgLy8gICovXG4gICAgLy8gc3RhdGljIGRlbGV0ZURhdGEoZWxlbWVudDogSFRNTEVsZW1lbnQsIGtleTogc3RyaW5nID0gbnVsbCk6IHZvaWQge1xuICAgIC8vICAgICBpZiAoZG9tLmhhc0RhdGEoZWxlbWVudCwga2V5KSkge1xuICAgIC8vICAgICAgICAgaWYgKGtleSA9PT0gbnVsbCkge1xuICAgIC8vICAgICAgICAgICAgIGRvbS5kYXRhLmRlbGV0ZShlbGVtZW50KTtcbiAgICAvLyAgICAgICAgIH0gZWxzZSB7XG4gICAgLy8gICAgICAgICAgICAgbGV0IHRtcCA9IGRvbS5nZXREYXRhKGVsZW1lbnQpO1xuICAgIC8vICAgICAgICAgICAgIGRlbGV0ZSB0bXBba2V5XTtcbiAgICAvLyAgICAgICAgICAgICBkb20uZGF0YS5zZXQoZWxlbWVudCwgdG1wKTtcbiAgICAvLyAgICAgICAgIH1cbiAgICAvLyAgICAgfVxuICAgIC8vIH1cbn0iLCJpbXBvcnQgKiBhcyBtZXRhZG9yIGZyb20gJy4vT2w0JztcblxuZGVjbGFyZSB2YXIgQ29uZmlndXJhdGlvbjogYW55O1xuXG5sZXQgY29udGV4dDogYW55ID0gd2luZG93O1xuY29udGV4dC5zcGF0aWFsID0gbWV0YWRvcjtcblxuZXhwb3J0IGZ1bmN0aW9uIGluaXQoKSB7XG5cbiAgICB2YXIgbWV0YWRvck1hcENvbmZpZyA9IHtcbiAgICAgICAgbWFwOiB7XG4gICAgICAgICAgICB0YXJnZXQ6ICdtYXAnLFxuICAgICAgICAgICAgc3JzOiBbXCJFUFNHOjQzMjZcIiwgXCJFUFNHOjMxNDY2XCIsIFwiRVBTRzoyNTgzMlwiXVxuICAgICAgICB9LFxuICAgICAgICB2aWV3OiB7XG4gICAgICAgICAgICBwcm9qZWN0aW9uOiBDb25maWd1cmF0aW9uLnNldHRpbmdzWydtYXBfY3JzJ10sLy8nOiAnOSw0OSwxMSw1MycsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdcbiAgICAgICAgICAgIG1heEV4dGVudDogQ29uZmlndXJhdGlvbi5zZXR0aW5nc1snbWFwX2Jib3hfbWF4J10uc3BsaXQoLyxcXHM/LyksLy9bNS44LCA0Ny4wLCAxNS4wLCA1NS4wXSwgLy8gcHJpb3JpdHkgZm9yIHNjYWxlcyBvciBmb3IgbWF4RXh0ZW50P1xuICAgICAgICAgICAgc3RhcnRFeHRlbnQ6IENvbmZpZ3VyYXRpb24uc2V0dGluZ3NbJ21hcF9iYm94X3N0YXJ0J10uc3BsaXQoLyxcXHM/LyksXG4gICAgICAgICAgICBzY2FsZXM6IFs1MDAwLCAyNTAwMCwgNTAwMDAsIDEwMDAwMCwgMjAwMDAwLCAyNTAwMDAsIDUwMDAwMCwgMTAwMDAwMCwgMjAwMDAwMCwgNTAwMDAwMCwgMTAwMDAwMDBdLy8sIDIwMDAwMDAwLCA1MDAwMDAwMF1cbiAgICAgICAgfSxcbiAgICAgICAgc3R5bGVzOiB7XG4gICAgICAgICAgICBoaWdobGlnaHQ6IHtcbiAgICAgICAgICAgICAgICBmaWxsOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiAncmdiYSg2MCwgNjAsIDI1NSwgMC4xKSdcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHN0cm9rZToge1xuICAgICAgICAgICAgICAgICAgICBjb2xvcjogJ3JnYmEoNjAsIDYwLCAyNTUsIDEuMCknLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogMlxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZWFyY2g6IHtcbiAgICAgICAgICAgICAgICBmaWxsOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiAncmdiYSgyNTUsIDYwLCA2MCwgMC4xKSdcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHN0cm9rZToge1xuICAgICAgICAgICAgICAgICAgICBjb2xvcjogJ3JnYmEoMjU1LCA2MCwgNjAsIDEuMCknLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogMlxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgaW1hZ2U6IHtcbiAgICAgICAgICAgICAgICAgICAgY2lyY2xlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByYWRpdXM6IDUsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxsOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6ICdyZ2JhKDI1NSwgNjAsIDYwLCAwLjYpJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBzb3VyY2U6IFtdLFxuICAgICAgICAvLyBhZGQgYWRkaXRpb25hbCBwYXJhbWV0ZXJzIHdpdGggKyBcIkFERElUSU9OQUxcIlxuICAgICAgICBwcm9qNERlZnM6IHtcbiAgICAgICAgICAgIFwiRVBTRzo0MzI2XCI6IFwiK3Byb2o9bG9uZ2xhdCArZGF0dW09V0dTODQgK3VuaXRzPWRlZ3JlZXMgK25vX2RlZnNcIiArIFwiICtheGlzPW5ldVwiLFxuICAgICAgICAgICAgXCJFUFNHOjQyNThcIjogXCIrcHJvaj1sb25nbGF0ICtlbGxwcz1HUlM4MCArdG93Z3M4ND0wLDAsMCwwLDAsMCwwICtub19kZWZzXCIgKyBcIiArdW5pdHM9ZGVncmVlcyArYXhpcz1uZXVcIixcbiAgICAgICAgICAgIFwiRVBTRzozMTQ2NlwiOiBcIitwcm9qPXRtZXJjICtsYXRfMD0wICtsb25fMD02ICtrPTEgK3hfMD0yNTAwMDAwICt5XzA9MCArZWxscHM9YmVzc2VsICt0b3dnczg0PTU5OC4xLDczLjcsNDE4LjIsMC4yMDIsMC4wNDUsLTIuNDU1LDYuNyArdW5pdHM9bSArbm9fZGVmc1wiICsgXCIgK2F4aXM9bmV1XCIsXG4gICAgICAgICAgICBcIkVQU0c6MzE0NjdcIjogXCIrcHJvaj10bWVyYyArbGF0XzA9MCArbG9uXzA9OSAraz0xICt4XzA9MzUwMDAwMCAreV8wPTAgK2VsbHBzPWJlc3NlbCArdG93Z3M4ND01OTguMSw3My43LDQxOC4yLDAuMjAyLDAuMDQ1LC0yLjQ1NSw2LjcgK3VuaXRzPW0gK25vX2RlZnNcIiArIFwiICtheGlzPW5ldVwiLFxuICAgICAgICAgICAgLy8gXCJFUFNHOjMxNDY4XCI6IFwiK3Byb2o9dG1lcmMgK2xhdF8wPTAgK2xvbl8wPTEyICtrPTEgK3hfMD00NTAwMDAwICt5XzA9MCArZWxscHM9YmVzc2VsICt0b3dnczg0PTU5OC4xLDczLjcsNDE4LjIsMC4yMDIsMC4wNDUsLTIuNDU1LDYuNyArdW5pdHM9bSArbm9fZGVmc1wiICsgXCIgK2F4aXM9bmV1XCIsXG4gICAgICAgICAgICAvLyBcIkVQU0c6MzE0NjlcIjogXCIrcHJvaj10bWVyYyArbGF0XzA9MCArbG9uXzA9MTUgK2s9MSAreF8wPTU1MDAwMDAgK3lfMD0wICtlbGxwcz1iZXNzZWwgK3Rvd2dzODQ9NTk4LjEsNzMuNyw0MTguMiwwLjIwMiwwLjA0NSwtMi40NTUsNi43ICt1bml0cz1tICtub19kZWZzXCIgKyBcIiArYXhpcz1uZXVcIixcbiAgICAgICAgICAgIFwiRVBTRzoyNTgzMlwiOiBcIitwcm9qPXV0bSArem9uZT0zMiArZWxscHM9R1JTODAgK3Rvd2dzODQ9MCwwLDAsMCwwLDAsMCArdW5pdHM9bSArbm9fZGVmc1wiLFxuICAgICAgICAgICAgLy8gXCJFUFNHOjI1ODMzXCI6IFwiK3Byb2o9dXRtICt6b25lPTMzICtlbGxwcz1HUlM4MCArdG93Z3M4ND0wLDAsMCwwLDAsMCwwICt1bml0cz1tICtub19kZWZzXCJcbiAgICAgICAgfSxcbiAgICAgICAgY29tcG9uZW50OiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY2xhc3M6ICcnLFxuICAgICAgICAgICAgICAgIHNlbGVjdG9yOiBcIlwiXG4gICAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICB9O1xuXG4gICAgLy8gY29uc29sZS5sb2coQ29uZmlndXJhdGlvbik7XG4gICAgZm9yIChjb25zdCBrZXkgaW4gQ29uZmlndXJhdGlvbi5jb25maWcubWFwX2JhY2tncm91bmQpIHtcbiAgICAgICAgbGV0IHdtcyA9IENvbmZpZ3VyYXRpb24uY29uZmlnLm1hcF9iYWNrZ3JvdW5kW2tleV07XG4gICAgICAgIGxldCBsYXllcnMgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBsIGluIHdtcy5sYXllcnMpIHtcbiAgICAgICAgICAgIGxheWVycy5wdXNoKHdtcy5sYXllcnNbbF0pO1xuICAgICAgICB9XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHdtcyk7XG4gICAgICAgIG1ldGFkb3JNYXBDb25maWcuc291cmNlLnB1c2goe1xuICAgICAgICAgICAgJ3R5cGUnOiAnV01TJyxcbiAgICAgICAgICAgICd1cmwnOiB3bXMudXJsLFxuICAgICAgICAgICAgJ3RpdGxlJzogd21zLnRpdGxlLFxuICAgICAgICAgICAgJ29wYWNpdHknOiB3bXMub3BhY2l0eSxcbiAgICAgICAgICAgICd2aXNpYmxlJzogd21zLnZpc2libGUsXG4gICAgICAgICAgICAncGFyYW1zJzoge1xuICAgICAgICAgICAgICAgICdMQVlFUlMnOiBsYXllcnMuam9pbihcIixcIiksXG4gICAgICAgICAgICAgICAgJ1ZFUlNJT04nOiB3bXMudmVyc2lvbixcbiAgICAgICAgICAgICAgICAnRk9STUFUJzogd21zLmZvcm1hdFxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLy8gY29uc29sZS5sb2cobWV0YWRvck1hcENvbmZpZyk7XG4gICAgbGV0IG1ldGFkb3JNYXAgPSBtZXRhZG9yLk9sNE1hcC5jcmVhdGUobWV0YWRvck1hcENvbmZpZyk7XG4gICAgLy8gbWV0YWRvck1hcC5pbml0TGF5ZXJ0cmVlKCk7XG4gICAgY29udGV4dC5zcGF0aWFsWydtYXAnXSA9IG1ldGFkb3JNYXA7XG4gICAgLy8gbWV0YWRvclsnbWV0YWRvck1hcCddID0gbWV0YWRvck1hcDtcbiAgICAvLyBtZXRhZG9yWydnZW9tTG9hZGVyJ10gPSBuZXcgbWV0YWRvci5HZW9tTG9hZGVyKG1ldGFkb3JNYXAsIDxIVE1MRm9ybUVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2ZpbGUtdXBsb2FkLWZvcm0nKSk7XG59XG5pbml0KCk7Il19
