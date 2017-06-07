(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var metador = require("./map");
var context = Window;
context.metador = metador;
metador['metadorMap'] = metador.Ol4Map.create(Configuration.spatial);

},{"./map":2}],2:[function(require,module,exports){
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
    Ol4Utils.getStyle = function (options) {
        return new ol.style.Style({
            fill: new ol.style.Fill(options['fill']),
            stroke: new ol.style.Stroke(options['stroke']) //,
            // image: new ol.style.Circle({
            //     radius: 7,
            //     fill: new ol.style.Fill(options['fill'])
            // })
        });
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
        for (var _b = 0, _c = this.olMap.getLayers().getArray(); _b < _c.length; _b++) {
            var layer = _c[_b];
            var source = void 0;
            if (layer instanceof ol.layer.Group) {
                console.error('ol.layer.Group as Layer is not suported');
                throw new Error('ol.layer.Group as Layer is not suported');
            }
            else if ((source = layer.getSource()) instanceof ol.source.ImageWMS) {
            }
        }
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
    // renderTreeOption() {
    //     let ul = document.querySelector('.-js-map-layertree ul');
    //     var button = document.createElement("button");
    //     document.body.append(button);
    //     button.style.position = 'absolute';
    //     button.style.top = '10px';
    //     button.style.left = '10px';
    //     button.style.zIndex = 10000;
    //     button.onclick = copyClicked;
    // }
    Ol4Map.prototype.getDrawer = function () {
        return this.drawer;
    };
    Ol4Map.prototype.addLayerForOptions = function (options) {
        if (options['type'] === 'WMS') {
            var wmsLayer = this.addLayer(Ol4WmsLayer.createLayer(options['url'], options['params'], this.olMap.getView().getProjection(), options['visible'], parseFloat(options['opacity'])), options['title']);
            addSource(wmsLayer.get('uuid'), wmsLayer.get('title'), wmsLayer.getVisible(), wmsLayer.getOpacity());
        }
        else {
            console.error(options['type'] + ' is not supported.');
        }
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
        this.olMap.addLayer(layer);
        return layer;
    };
    Ol4Map.prototype.removeLayer = function (layer) {
        this.olMap.removeLayer(layer);
    };
    Ol4Map.prototype.findLayer = function (uuid) {
        var layers = this.olMap.getLayers().getArray();
        var llength = layers.length;
        for (var _i = 0, layers_1 = layers; _i < layers_1.length; _i++) {
            var layer = layers_1[_i];
            var source = void 0;
            if (layer instanceof ol.layer.Group) {
                console.error('ol.layer.Group as Layer is not suported');
                throw new Error('ol.layer.Group as Layer is not suported');
            }
            else if (layer.get(exports.UUID) === uuid) {
                return layer;
            }
        }
        return null;
    };
    Ol4Map.prototype.updateMap = function () {
        this.olMap.updateSize();
    };
    Ol4Map.prototype.changeCrs = function (crs) {
        var proj = null;
        if ((proj = ol.proj.get(crs))) {
            var extent = Ol4Extent.fromArray(this.olMap.getView().calculateExtent(this.olMap.getSize()), this.olMap.getView().getProjection());
            var projection = this.olMap.getView().getProjection();
            var center = this.olMap.getView().getCenter();
            var newView = new ol.View({
                projection: proj,
                resolutions: Ol4Utils.resolutionsForScales(this.scales, proj.getUnits()).reverse(),
                extent: this.maxExtent.getExtent(proj)
            });
            var layers = this.olMap.getLayers().getArray();
            var llength = layers.length;
            for (var _i = 0, layers_2 = layers; _i < layers_2.length; _i++) {
                var layer = layers_2[_i];
                var source = void 0;
                if (layer instanceof ol.layer.Group) {
                    console.error('ol.layer.Group as Layer is not suported');
                    throw new Error('ol.layer.Group as Layer is not suported');
                }
                else if ((source = layer.getSource()) instanceof ol.source.ImageWMS) {
                    layer.setSource(Ol4WmsLayer.createFromSource(source, proj));
                }
            }
            this.olMap.setView(newView);
            console.log(center);
            this.olMap.getView().fit(extent.getPolygonForExtent(proj), this.olMap.getSize());
            // let cpoint = <ol.geom.Point> new ol.geom.Point(center).transform(projection, proj);
            // console.log(cpoint.getCoordinates());
            // this.olMap.getView().setCenter(cpoint.getCoordinates());
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
    Ol4Map.prototype.setDraw = function (shapeType, onDrawEnd) {
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
        this.drawer.setInteraction(shape);
        if (this.drawer.getInteraction()) {
            var drawer_1 = this.drawer;
            this.getDrawer().getLayer().getSource().clear();
            this.olMap.addInteraction(this.drawer.getInteraction());
            this.drawer.getInteraction().on('drawstart', function (e) {
                ol4map.getDrawer().getLayer().getSource().clear();
            });
            this.drawer.getInteraction().on('drawend', function (e) {
                var geom = e.feature.getGeometry().transform(olMap.getView().getProjection(), 'EPSG:4326');
                onDrawEnd(geom);
                olMap.removeInteraction(drawer_1.getInteraction());
            });
        }
        else {
            this.getDrawer().getLayer().getSource().clear();
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
    Ol4Drawer.prototype.setInteraction = function (type) {
        switch (type) {
            case SHAPES.BOX:
                this.interaction = new ol.interaction.Draw({
                    source: this.layer.getSource(),
                    type: 'Circle',
                    geometryFunction: createBox() // ol.d.ts has no function "ol.interaction.Draw.createBox()"
                });
                break;
            case SHAPES.POLYGON:
                this.interaction = new ol.interaction.Draw({
                    source: this.layer.getSource(),
                    type: 'Polygon'
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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvUGx1Z2lucy9XaGVyZUdyb3VwL01hcEJ1bmRsZS9SZXNvdXJjZXMvdHMvYXBwLnRzIiwic3JjL1BsdWdpbnMvV2hlcmVHcm91cC9NYXBCdW5kbGUvUmVzb3VyY2VzL3RzL21hcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsK0JBQWlDO0FBRWpDLElBQUksT0FBTyxHQUFRLE1BQU0sQ0FBQztBQUMxQixPQUFPLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztBQUkxQixPQUFPLENBQUMsWUFBWSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7QUNBckU7SUFBQTtJQXFFQSxDQUFDO0lBcEVHOztPQUVHO0lBQ1csOEJBQXFCLEdBQW5DLFVBQW9DLEtBQWE7UUFDN0MsSUFBSSxHQUFHLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQztRQUN0QixJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN6QyxJQUFJLGNBQWMsR0FBRyxLQUFLLENBQUM7UUFDM0IsTUFBTSxDQUFDLEdBQUcsR0FBRyxjQUFjLEdBQUcsR0FBRyxDQUFDO0lBQ3RDLENBQUM7SUFFYSwyQkFBa0IsR0FBaEMsVUFBaUMsS0FBYSxFQUFFLE1BQWM7UUFDMUQsTUFBTSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUM7SUFDMUIsQ0FBQztJQUVhLDZCQUFvQixHQUFsQyxVQUFtQyxNQUFnQixFQUFFLEtBQWE7UUFDOUQsSUFBSSxXQUFXLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLElBQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNuRCxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVB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QUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ25ELElBQUksUUFBUSxHQUFHLFlBQVksSUFBSSxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3pELFFBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFDckIsRUFBRSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDO2dCQUMvQixFQUFFLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUM7Z0JBQ2hDLEVBQUUsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQztnQkFDN0IsRUFBRSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDO2dCQUM1QixFQUFFLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUM7YUFDbEMsQ0FBQyxDQUFDLENBQUM7UUFDSixNQUFNLENBQUMsUUFBUSxDQUFDO0lBQ3BCLENBQUMsQ0FDSixDQUFDO0FBQ04sQ0FBQztBQXBCRCw4QkFvQkM7QUFBQSxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCAqIGFzIG1ldGFkb3IgZnJvbSAnLi9tYXAnO1xuXG5sZXQgY29udGV4dDogYW55ID0gV2luZG93O1xuY29udGV4dC5tZXRhZG9yID0gbWV0YWRvcjtcblxuZGVjbGFyZSB2YXIgQ29uZmlndXJhdGlvbjogYW55O1xuXG5tZXRhZG9yWydtZXRhZG9yTWFwJ10gPSBtZXRhZG9yLk9sNE1hcC5jcmVhdGUoQ29uZmlndXJhdGlvbi5zcGF0aWFsKTtcbiIsImltcG9ydCBPYmplY3QgPSBvbC5PYmplY3Q7XG5kZWNsYXJlIGNsYXNzIHByb2o0IHtcbiAgICBzdGF0aWMgZGVmcyhuYW1lOiBzdHJpbmcsIGRlZjogc3RyaW5nKTogdm9pZDtcbn1cblxuZGVjbGFyZSBmdW5jdGlvbiBhZGRTb3VyY2UoaWQ6IHN0cmluZywgdGl0bGU6IHN0cmluZywgdmlzaWJpbGl0eTogYm9vbGVhbiwgb3BhY2l0eTogbnVtYmVyKTogdm9pZDtcblxuZXhwb3J0IGNsYXNzIE9sNFV0aWxzIHtcbiAgICAvKiBcbiAgICAgKiB1bml0czogJ2RlZ3JlZXMnfCdmdCd8J20nfCd1cy1mdCdcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHJlc29sdXRpb25TY2FsZUZhY3Rvcih1bml0czogc3RyaW5nKTogbnVtYmVyIHtcbiAgICAgICAgbGV0IGRwaSA9IDI1LjQgLyAwLjI4O1xuICAgICAgICBsZXQgbXB1ID0gb2wucHJvai5NRVRFUlNfUEVSX1VOSVRbdW5pdHNdO1xuICAgICAgICBsZXQgaW5jaGVzUGVyTWV0ZXIgPSAzOS4zNztcbiAgICAgICAgcmV0dXJuIG1wdSAqIGluY2hlc1Blck1ldGVyICogZHBpO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgcmVzb2x1dGlvbkZvclNjYWxlKHNjYWxlOiBudW1iZXIsIGZhY3RvcjogbnVtYmVyKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHNjYWxlIC8gZmFjdG9yO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgcmVzb2x1dGlvbnNGb3JTY2FsZXMoc2NhbGVzOiBudW1iZXJbXSwgdW5pdHM6IHN0cmluZyk6IG51bWJlcltdIHtcbiAgICAgICAgbGV0IHJlc29sdXRpb25zID0gW107XG4gICAgICAgIGxldCBmYWN0b3IgPSBPbDRVdGlscy5yZXNvbHV0aW9uU2NhbGVGYWN0b3IodW5pdHMpO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNjYWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcmVzb2x1dGlvbnMucHVzaChPbDRVdGlscy5yZXNvbHV0aW9uRm9yU2NhbGUoc2NhbGVzW2ldLCBmYWN0b3IpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzb2x1dGlvbnM7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBzY2FsZUZvclJlc29sdXRpb24ocmVzb2x1dGlvbjogbnVtYmVyLCBmYWN0b3I6IG51bWJlcik6IG51bWJlciB7XG4gICAgICAgIHJldHVybiByZXNvbHV0aW9uICogZmFjdG9yO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgc2NhbGVzRm9yUmVzb2x1dGlvbnMocmVzb2x1dGlvbnM6IG51bWJlcltdLCB1bml0czogc3RyaW5nKTogbnVtYmVyW10ge1xuICAgICAgICBsZXQgc2NhbGVzID0gW107XG4gICAgICAgIGxldCBmYWN0b3IgPSBPbDRVdGlscy5yZXNvbHV0aW9uU2NhbGVGYWN0b3IodW5pdHMpO1xuICAgICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgcmVzb2x1dGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHNjYWxlcy5wdXNoKE9sNFV0aWxzLnNjYWxlRm9yUmVzb2x1dGlvbihyZXNvbHV0aW9uc1tpXSwgZmFjdG9yKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNjYWxlcztcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGluaXRQcm9qNERlZnMocHJvajREZWZzOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgZm9yIChjb25zdCBuYW1lIGluIHByb2o0RGVmcykge1xuICAgICAgICAgICAgcHJvajQuZGVmcyhuYW1lLCBwcm9qNERlZnNbbmFtZV0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBnZXRQcm9qKHByb2pDb2RlOiBzdHJpbmcpOiBvbC5wcm9qLlByb2plY3Rpb24ge1xuICAgICAgICByZXR1cm4gb2wucHJvai5nZXQocHJvakNvZGUpO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0U3R5bGUob3B0aW9uczogYW55KTogb2wuc3R5bGUuU3R5bGUge1xuICAgICAgICByZXR1cm4gbmV3IG9sLnN0eWxlLlN0eWxlKHtcbiAgICAgICAgICAgIGZpbGw6IG5ldyBvbC5zdHlsZS5GaWxsKG9wdGlvbnNbJ2ZpbGwnXSksXG4gICAgICAgICAgICBzdHJva2U6IG5ldyBvbC5zdHlsZS5TdHJva2Uob3B0aW9uc1snc3Ryb2tlJ10pLy8sXG4gICAgICAgICAgICAvLyBpbWFnZTogbmV3IG9sLnN0eWxlLkNpcmNsZSh7XG4gICAgICAgICAgICAvLyAgICAgcmFkaXVzOiA3LFxuICAgICAgICAgICAgLy8gICAgIGZpbGw6IG5ldyBvbC5zdHlsZS5GaWxsKG9wdGlvbnNbJ2ZpbGwnXSlcbiAgICAgICAgICAgIC8vIH0pXG4gICAgICAgIH0pO1xuICAgIH1cblxuLy8gZmlsbFxuLy8ge1xuLy8gICAgIGNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMilcbi8vIH1cbi8vIHN0cm9rZVxuLy8ge1xuLy8gICAgIGNvbG9yOiAnI2ZmY2MzMycsXG4vLyAgICAgd2lkdGg6IDJcbi8vICAgICBkYXNoOlxuLy8gfVxuLy8gaW1hZ2Vcbn1cblxuZXhwb3J0IGNsYXNzIE9sNEdlb20ge1xuICAgIHByb3RlY3RlZCBnZW9tOiBvbC5nZW9tLkdlb21ldHJ5ID0gbnVsbDtcbiAgICBwcm90ZWN0ZWQgcHJvajogb2wucHJvai5Qcm9qZWN0aW9uID0gbnVsbDtcblxuICAgIGNvbnN0cnVjdG9yKGdlb206IG9sLmdlb20uR2VvbWV0cnksIHByb2o6IG9sLnByb2ouUHJvamVjdGlvbikge1xuICAgICAgICB0aGlzLmdlb20gPSBnZW9tO1xuICAgICAgICB0aGlzLnByb2ogPSBwcm9qO1xuICAgIH1cblxuICAgIGdldEdlb20oKTogb2wuZ2VvbS5HZW9tZXRyeSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdlb207XG4gICAgfVxuXG4gICAgZ2V0UHJvaigpOiBvbC5wcm9qLlByb2plY3Rpb24ge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9qO1xuICAgIH1cblxuICAgIGdldEV4dGVudChwcm9qOiBvbC5wcm9qLlByb2plY3Rpb24pOiBvbC5FeHRlbnQge1xuICAgICAgICBpZiAodGhpcy5wcm9qICE9PSBwcm9qKSB7XG4gICAgICAgICAgICByZXR1cm4gKDxvbC5nZW9tLkdlb21ldHJ5Pig8YW55PiB0aGlzLmdlb20pLmNsb25lKCkpLnRyYW5zZm9ybSh0aGlzLnByb2osIHByb2opLmdldEV4dGVudCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuICg8b2wuZ2VvbS5HZW9tZXRyeT4oPGFueT4gdGhpcy5nZW9tKS5jbG9uZSgpKS5nZXRFeHRlbnQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBnZXRQb2x5Z29uRm9yRXh0ZW50KHByb2o6IG9sLnByb2ouUHJvamVjdGlvbikge1xuICAgICAgICByZXR1cm4gb2wuZ2VvbS5Qb2x5Z29uLmZyb21FeHRlbnQodGhpcy5nZXRFeHRlbnQocHJvaikpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIE9sNEV4dGVudCBleHRlbmRzIE9sNEdlb20ge1xuICAgIHB1YmxpYyBzdGF0aWMgZnJvbUFycmF5KG9yZGluYXRlczogbnVtYmVyW10sIHByb2o6IG9sLnByb2ouUHJvamVjdGlvbik6IE9sNEV4dGVudCB7XG4gICAgICAgIGxldCBnZW9tID0gbmV3IG9sLmdlb20uTXVsdGlQb2ludChbW29yZGluYXRlc1swXSwgb3JkaW5hdGVzWzFdXSwgW29yZGluYXRlc1syXSwgb3JkaW5hdGVzWzNdXV0pO1xuICAgICAgICByZXR1cm4gbmV3IE9sNEV4dGVudChnZW9tLCBwcm9qKTtcbiAgICB9XG59XG5leHBvcnQgY29uc3QgVVVJRCA9ICd1dWlkJztcbmV4cG9ydCBjb25zdCBUSVRMRSA9ICd0aXRsZSc7XG5cbmV4cG9ydCBjbGFzcyBPbDRNYXAge1xuICAgIHByaXZhdGUgc3RhdGljIF91dWlkID0gMDtcbiAgICBwcml2YXRlIHN0YXRpYyBfaW5zdGFuY2U6IE9sNE1hcCA9IG51bGw7IC8vIHNpbmdsZXRvblxuICAgIHByb3RlY3RlZCBvbE1hcDogb2wuTWFwID0gbnVsbDtcbiAgICBwcm90ZWN0ZWQgc2NhbGVzOiBudW1iZXJbXTtcbiAgICAvLyAgICBwcm90ZWN0ZWQgcHJvajogb2wucHJvai5Qcm9qZWN0aW9uID0gbnVsbDtcbiAgICBwcm90ZWN0ZWQgc3RhcnRFeHRlbnQ6IE9sNEV4dGVudCA9IG51bGw7ICAvLyB4bWluLCB5bWluLCB4bWF4LCB5bWF4IG9wdGlvbnNbJ3N0YXJ0RXh0ZW50J11cbiAgICBwcm90ZWN0ZWQgbWF4RXh0ZW50OiBPbDRFeHRlbnQgPSBudWxsO1xuICAgIHByb3RlY3RlZCBkcmF3ZXI6IE9sNERyYXdlcjtcbiAgICBwcm90ZWN0ZWQgc3R5bGVzOiBPYmplY3Q7XG4gICAgcHJvdGVjdGVkIGhnTGF5ZXI6IG9sLmxheWVyLlZlY3RvcjtcbiAgICBwcm90ZWN0ZWQgZHJhZ3pvb206IG9sLmludGVyYWN0aW9uLkRyYWdab29tO1xuXG4gICAgcHJpdmF0ZSBzdGF0aWMgZ2V0VXVpZChwcmVmaXg6IHN0cmluZyA9ICcnKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHByZWZpeCArICgrK09sNE1hcC5fdXVpZCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihvcHRpb25zOiBhbnkpIHsgLy8gc2luZ2xldG9uXG4gICAgICAgIC8vIGluaXQgZ2l2ZW4gY3JzZXNcbiAgICAgICAgLy8gb2xbJ0VOQUJMRV9SQVNURVJfUkVQUk9KRUNUSU9OJ10gPSBmYWxzZTtcbiAgICAgICAgT2w0VXRpbHMuaW5pdFByb2o0RGVmcyhvcHRpb25zWydwcm9qNERlZnMnXSk7XG4gICAgICAgIGxldCBwcm9qOiBvbC5wcm9qLlByb2plY3Rpb24gPSBvbC5wcm9qLmdldChvcHRpb25zWyd2aWV3J11bJ3Byb2plY3Rpb24nXSk7XG4gICAgICAgIHRoaXMuc3R5bGVzID0gb3B0aW9uc1snc3R5bGVzJ107XG4gICAgICAgIHRoaXMuc2NhbGVzID0gb3B0aW9uc1sndmlldyddWydzY2FsZXMnXTtcbiAgICAgICAgdGhpcy5zdGFydEV4dGVudCA9IE9sNEV4dGVudC5mcm9tQXJyYXkob3B0aW9uc1sndmlldyddWydzdGFydEV4dGVudCddLCBwcm9qKTtcbiAgICAgICAgdGhpcy5tYXhFeHRlbnQgPSBPbDRFeHRlbnQuZnJvbUFycmF5KG9wdGlvbnNbJ3ZpZXcnXVsnbWF4RXh0ZW50J10sIHByb2opO1xuICAgICAgICB0aGlzLm9sTWFwID0gbmV3IG9sLk1hcCh7XG4gICAgICAgICAgICB0YXJnZXQ6IG9wdGlvbnNbJ21hcCddWyd0YXJnZXQnXSxcbiAgICAgICAgICAgIHJlbmRlcmVyOiAnY2FudmFzJ1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5vbE1hcC5zZXRWaWV3KFxuICAgICAgICAgICAgbmV3IG9sLlZpZXcoe1xuICAgICAgICAgICAgICAgIHByb2plY3Rpb246IHByb2osXG4gICAgICAgICAgICAgICAgcmVzb2x1dGlvbnM6IE9sNFV0aWxzLnJlc29sdXRpb25zRm9yU2NhbGVzKHRoaXMuc2NhbGVzLCBwcm9qLmdldFVuaXRzKCkpLnJldmVyc2UoKSxcbiAgICAgICAgICAgICAgICBleHRlbnQ6IHRoaXMubWF4RXh0ZW50LmdldEV4dGVudChwcm9qKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICAgICAgZm9yIChsZXQgc291cmNlIG9mIG9wdGlvbnNbJ3NvdXJjZSddKSB7XG4gICAgICAgICAgICB0aGlzLmFkZExheWVyRm9yT3B0aW9ucyhzb3VyY2UpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMub2xNYXAuYWRkQ29udHJvbChuZXcgb2wuY29udHJvbC5TY2FsZUxpbmUoKSk7XG5cbiAgICAgICAgdGhpcy5vbE1hcC5hZGRDb250cm9sKG5ldyBvbC5jb250cm9sLlpvb21Ub0V4dGVudCh7XG4gICAgICAgICAgICBleHRlbnQ6IHRoaXMubWF4RXh0ZW50LmdldEV4dGVudChwcm9qKVxuICAgICAgICB9KSk7XG4gICAgICAgIHRoaXMub2xNYXAuYWRkSW50ZXJhY3Rpb24obmV3IG9sLmludGVyYWN0aW9uLkRyYWdab29tKCkpO1xuICAgICAgICB0aGlzLm9sTWFwLmFkZENvbnRyb2wobmV3IG9sLmNvbnRyb2wuTW91c2VQb3NpdGlvbihcbiAgICAgICAgICAgIC8vIHtcbiAgICAgICAgICAgIC8vICAgICBjb29yZGluYXRlRm9ybWF0OiBmdW5jdGlvbiAoY29vcmRpbmF0ZXMpIHtcbiAgICAgICAgICAgIC8vICAgICAgICAgdmFyIGNvb3JkX3ggPSBjb29yZGluYXRlc1swXS50b0ZpeGVkKDMpO1xuICAgICAgICAgICAgLy8gICAgICAgICB2YXIgY29vcmRfeSA9IGNvb3JkaW5hdGVzWzFdLnRvRml4ZWQoMyk7XG4gICAgICAgICAgICAvLyAgICAgICAgIHJldHVybiBjb29yZF94ICsgJywgJyArIGNvb3JkX3k7XG4gICAgICAgICAgICAvLyAgICAgfVxuICAgICAgICAgICAgLy8gfVxuICAgICAgICApKTtcbiAgICAgICAgdGhpcy5vbE1hcC5nZXRWaWV3KCkuZml0KHRoaXMuc3RhcnRFeHRlbnQuZ2V0UG9seWdvbkZvckV4dGVudChwcm9qKSwgdGhpcy5vbE1hcC5nZXRTaXplKCkpO1xuICAgICAgICBmb3IgKGxldCBsYXllciBvZiB0aGlzLm9sTWFwLmdldExheWVycygpLmdldEFycmF5KCkpIHtcbiAgICAgICAgICAgIGxldCBzb3VyY2U7XG4gICAgICAgICAgICBpZiAobGF5ZXIgaW5zdGFuY2VvZiBvbC5sYXllci5Hcm91cCkgeyAvLyBpbnN0YW5jZSBvZiBvbC5sYXllci5Hcm91cFxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ29sLmxheWVyLkdyb3VwIGFzIExheWVyIGlzIG5vdCBzdXBvcnRlZCcpO1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignb2wubGF5ZXIuR3JvdXAgYXMgTGF5ZXIgaXMgbm90IHN1cG9ydGVkJyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKChzb3VyY2UgPSAoPG9sLmxheWVyLkxheWVyPmxheWVyKS5nZXRTb3VyY2UoKSkgaW5zdGFuY2VvZiBvbC5zb3VyY2UuSW1hZ2VXTVMpIHtcblxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuaGdMYXllciA9IHRoaXMuYWRkVmVjdG9yTGF5ZXIoT2w0VXRpbHMuZ2V0U3R5bGUodGhpcy5zdHlsZXNbJ2hpZ2hsaWdodCddKSk7XG4gICAgfVxuXG4gICAgc3RhdGljIGNyZWF0ZShvcHRpb25zOiBhbnkpOiBPbDRNYXAge1xuICAgICAgICBpZiAoIU9sNE1hcC5faW5zdGFuY2UpIHsvLyBzaW5nbGV0b25cbiAgICAgICAgICAgIE9sNE1hcC5faW5zdGFuY2UgPSBuZXcgT2w0TWFwKG9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBPbDRNYXAuX2luc3RhbmNlO1xuICAgIH1cblxuICAgIC8vIHJlbmRlclRyZWVPcHRpb24oKSB7XG4gICAgLy8gICAgIGxldCB1bCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy4tanMtbWFwLWxheWVydHJlZSB1bCcpO1xuICAgIC8vICAgICB2YXIgYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTtcbiAgICAvLyAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmQoYnV0dG9uKTtcbiAgICAvLyAgICAgYnV0dG9uLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAvLyAgICAgYnV0dG9uLnN0eWxlLnRvcCA9ICcxMHB4JztcbiAgICAvLyAgICAgYnV0dG9uLnN0eWxlLmxlZnQgPSAnMTBweCc7XG4gICAgLy8gICAgIGJ1dHRvbi5zdHlsZS56SW5kZXggPSAxMDAwMDtcbiAgICAvLyAgICAgYnV0dG9uLm9uY2xpY2sgPSBjb3B5Q2xpY2tlZDtcbiAgICAvLyB9XG5cbiAgICBnZXREcmF3ZXIoKTogT2w0RHJhd2VyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZHJhd2VyO1xuICAgIH1cblxuICAgIGFkZExheWVyRm9yT3B0aW9ucyhvcHRpb25zOiBhbnkpIHtcbiAgICAgICAgaWYob3B0aW9uc1sndHlwZSddID09PSAnV01TJykge1xuICAgICAgICAgICAgbGV0IHdtc0xheWVyID0gdGhpcy5hZGRMYXllcihcbiAgICAgICAgICAgICAgICBPbDRXbXNMYXllci5jcmVhdGVMYXllcihvcHRpb25zWyd1cmwnXSxcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uc1sncGFyYW1zJ10sXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub2xNYXAuZ2V0VmlldygpLmdldFByb2plY3Rpb24oKSxcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uc1sndmlzaWJsZSddLFxuICAgICAgICAgICAgICAgICAgICBwYXJzZUZsb2F0KG9wdGlvbnNbJ29wYWNpdHknXSkpLFxuICAgICAgICAgICAgICAgIG9wdGlvbnNbJ3RpdGxlJ11cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBhZGRTb3VyY2Uod21zTGF5ZXIuZ2V0KCd1dWlkJyksIHdtc0xheWVyLmdldCgndGl0bGUnKSwgd21zTGF5ZXIuZ2V0VmlzaWJsZSgpLCB3bXNMYXllci5nZXRPcGFjaXR5KCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihvcHRpb25zWyd0eXBlJ10gKyAnIGlzIG5vdCBzdXBwb3J0ZWQuJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhZGRWZWN0b3JMYXllcihzdHlsZTogb2wuc3R5bGUuU3R5bGUpOiBvbC5sYXllci5WZWN0b3Ige1xuICAgICAgICBsZXQgb3B0aW9ucyA9IHtcbiAgICAgICAgICAgIHdyYXBYOiBmYWxzZVxuICAgICAgICB9O1xuICAgICAgICBsZXQgdkxheWVyID0gbmV3IG9sLmxheWVyLlZlY3Rvcih7XG4gICAgICAgICAgICBzb3VyY2U6IG5ldyBvbC5zb3VyY2UuVmVjdG9yKG9wdGlvbnMpLFxuICAgICAgICAgICAgc3R5bGU6IHN0eWxlXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gPG9sLmxheWVyLlZlY3Rvcj50aGlzLmFkZExheWVyKHZMYXllcik7XG4gICAgfVxuXG4gICAgYWRkTGF5ZXIobGF5ZXI6IG9sLmxheWVyLkJhc2UsIHRpdGxlOiBzdHJpbmcgPSBudWxsKTogb2wubGF5ZXIuQmFzZSB7XG4gICAgICAgIGxheWVyLnNldChVVUlELCBPbDRNYXAuZ2V0VXVpZCgnb2xheS0nKSk7XG4gICAgICAgIGlmKHRpdGxlKSB7XG4gICAgICAgICAgICBsYXllci5zZXQoVElUTEUsIHRpdGxlKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm9sTWFwLmFkZExheWVyKGxheWVyKTtcbiAgICAgICAgcmV0dXJuIGxheWVyO1xuICAgIH1cblxuICAgIHJlbW92ZUxheWVyKGxheWVyOiBvbC5sYXllci5CYXNlKTogdm9pZCB7XG4gICAgICAgIHRoaXMub2xNYXAucmVtb3ZlTGF5ZXIobGF5ZXIpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZmluZExheWVyKHV1aWQ6IHN0cmluZyk6IG9sLmxheWVyLkJhc2Uge1xuICAgICAgICBsZXQgbGF5ZXJzID0gdGhpcy5vbE1hcC5nZXRMYXllcnMoKS5nZXRBcnJheSgpO1xuICAgICAgICBsZXQgbGxlbmd0aCA9IGxheWVycy5sZW5ndGg7XG4gICAgICAgIGZvciAobGV0IGxheWVyIG9mIGxheWVycykge1xuICAgICAgICAgICAgbGV0IHNvdXJjZTogb2wuc291cmNlLlNvdXJjZTtcbiAgICAgICAgICAgIGlmIChsYXllciBpbnN0YW5jZW9mIG9sLmxheWVyLkdyb3VwKSB7IC8vIGluc3RhbmNlIG9mIG9sLmxheWVyLkdyb3VwXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignb2wubGF5ZXIuR3JvdXAgYXMgTGF5ZXIgaXMgbm90IHN1cG9ydGVkJyk7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdvbC5sYXllci5Hcm91cCBhcyBMYXllciBpcyBub3Qgc3Vwb3J0ZWQnKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobGF5ZXIuZ2V0KFVVSUQpID09PSB1dWlkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxheWVyO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHVwZGF0ZU1hcCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5vbE1hcC51cGRhdGVTaXplKCk7XG4gICAgfVxuXG4gICAgY2hhbmdlQ3JzKGNyczogc3RyaW5nKSB7IC8vIFRPRE9cbiAgICAgICAgbGV0IHByb2ogPSBudWxsO1xuICAgICAgICBpZiAoKHByb2ogPSBvbC5wcm9qLmdldChjcnMpKSkge1xuICAgICAgICAgICAgbGV0IGV4dGVudCA9IE9sNEV4dGVudC5mcm9tQXJyYXkoXG4gICAgICAgICAgICAgICAgdGhpcy5vbE1hcC5nZXRWaWV3KCkuY2FsY3VsYXRlRXh0ZW50KHRoaXMub2xNYXAuZ2V0U2l6ZSgpKSxcbiAgICAgICAgICAgICAgICB0aGlzLm9sTWFwLmdldFZpZXcoKS5nZXRQcm9qZWN0aW9uKClcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBsZXQgcHJvamVjdGlvbiA9IHRoaXMub2xNYXAuZ2V0VmlldygpLmdldFByb2plY3Rpb24oKTtcbiAgICAgICAgICAgIGxldCBjZW50ZXIgPSB0aGlzLm9sTWFwLmdldFZpZXcoKS5nZXRDZW50ZXIoKTtcbiAgICAgICAgICAgIGxldCBuZXdWaWV3ID0gbmV3IG9sLlZpZXcoe1xuICAgICAgICAgICAgICAgIHByb2plY3Rpb246IHByb2osXG4gICAgICAgICAgICAgICAgcmVzb2x1dGlvbnM6IE9sNFV0aWxzLnJlc29sdXRpb25zRm9yU2NhbGVzKHRoaXMuc2NhbGVzLCBwcm9qLmdldFVuaXRzKCkpLnJldmVyc2UoKSxcbiAgICAgICAgICAgICAgICBleHRlbnQ6IHRoaXMubWF4RXh0ZW50LmdldEV4dGVudChwcm9qKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBsZXQgbGF5ZXJzID0gdGhpcy5vbE1hcC5nZXRMYXllcnMoKS5nZXRBcnJheSgpO1xuICAgICAgICAgICAgbGV0IGxsZW5ndGggPSBsYXllcnMubGVuZ3RoO1xuICAgICAgICAgICAgZm9yIChsZXQgbGF5ZXIgb2YgbGF5ZXJzKSB7XG4gICAgICAgICAgICAgICAgbGV0IHNvdXJjZTogb2wuc291cmNlLlNvdXJjZTtcbiAgICAgICAgICAgICAgICBpZiAobGF5ZXIgaW5zdGFuY2VvZiBvbC5sYXllci5Hcm91cCkgeyAvLyBpbnN0YW5jZSBvZiBvbC5sYXllci5Hcm91cFxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdvbC5sYXllci5Hcm91cCBhcyBMYXllciBpcyBub3Qgc3Vwb3J0ZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdvbC5sYXllci5Hcm91cCBhcyBMYXllciBpcyBub3Qgc3Vwb3J0ZWQnKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKChzb3VyY2UgPSAoPG9sLmxheWVyLkxheWVyPmxheWVyKS5nZXRTb3VyY2UoKSkgaW5zdGFuY2VvZiBvbC5zb3VyY2UuSW1hZ2VXTVMpIHtcbiAgICAgICAgICAgICAgICAgICAgKDxvbC5sYXllci5JbWFnZT5sYXllcikuc2V0U291cmNlKE9sNFdtc0xheWVyLmNyZWF0ZUZyb21Tb3VyY2UoPG9sLnNvdXJjZS5JbWFnZVdNUz4gc291cmNlLCBwcm9qKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5vbE1hcC5zZXRWaWV3KG5ld1ZpZXcpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coY2VudGVyKTtcbiAgICAgICAgICAgIHRoaXMub2xNYXAuZ2V0VmlldygpLmZpdChleHRlbnQuZ2V0UG9seWdvbkZvckV4dGVudChwcm9qKSwgdGhpcy5vbE1hcC5nZXRTaXplKCkpO1xuICAgICAgICAgICAgLy8gbGV0IGNwb2ludCA9IDxvbC5nZW9tLlBvaW50PiBuZXcgb2wuZ2VvbS5Qb2ludChjZW50ZXIpLnRyYW5zZm9ybShwcm9qZWN0aW9uLCBwcm9qKTtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGNwb2ludC5nZXRDb29yZGluYXRlcygpKTtcbiAgICAgICAgICAgIC8vIHRoaXMub2xNYXAuZ2V0VmlldygpLnNldENlbnRlcihjcG9pbnQuZ2V0Q29vcmRpbmF0ZXMoKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZXRWaXNpYmxlKGxheWVyVWlpZDogc3RyaW5nLCB2aXNpYmxpdHk6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICAgICAgbGV0IGxheWVyOiBvbC5sYXllci5CYXNlID0gdGhpcy5maW5kTGF5ZXIobGF5ZXJVaWlkKTtcbiAgICAgICAgaWYgKGxheWVyKSB7XG4gICAgICAgICAgICBsYXllci5zZXRWaXNpYmxlKHZpc2libGl0eSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZXRPcGFjaXR5KGxheWVyVWlpZDogc3RyaW5nLCBvcGFjaXR5OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgbGV0IGxheWVyOiBvbC5sYXllci5CYXNlID0gdGhpcy5maW5kTGF5ZXIobGF5ZXJVaWlkKTtcbiAgICAgICAgaWYgKGxheWVyKSB7XG4gICAgICAgICAgICBsYXllci5zZXRPcGFjaXR5KG9wYWNpdHkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZHJhZ1pvb20oYWN0aXZhdGU6IGJvb2xlYW4sIG9uWm9vbUVuZDogRnVuY3Rpb24gPSBudWxsKSB7XG4gICAgICAgIGlmICghdGhpcy5kcmFnem9vbSkge1xuICAgICAgICAgICAgdGhpcy5kcmFnem9vbSA9IG5ldyBvbC5pbnRlcmFjdGlvbi5EcmFnWm9vbSh7XG4gICAgICAgICAgICAgICAgY29uZGl0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbGV0IGRyYWd6b29tID0gdGhpcy5kcmFnem9vbTtcbiAgICAgICAgICAgIGxldCBtYXAgPSB0aGlzLm9sTWFwO1xuICAgICAgICAgICAgdGhpcy5kcmFnem9vbS5vbignYm94ZW5kJyxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoZXZlbnQ6IG9sLmludGVyYWN0aW9uLkRyYXcuRXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgbWFwLnJlbW92ZUludGVyYWN0aW9uKGRyYWd6b29tKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9uWm9vbUVuZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25ab29tRW5kKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYWN0aXZhdGUpIHtcbiAgICAgICAgICAgIHRoaXMub2xNYXAuYWRkSW50ZXJhY3Rpb24odGhpcy5kcmFnem9vbSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLm9sTWFwLnJlbW92ZUludGVyYWN0aW9uKHRoaXMuZHJhZ3pvb20pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2V0RHJhdyhzaGFwZVR5cGU6IFNIQVBFUyA9IG51bGwsIG9uRHJhd0VuZDogRnVuY3Rpb24gPSBudWxsKSB7XG4gICAgICAgIGxldCBvbDRtYXAgPSB0aGlzO1xuICAgICAgICBsZXQgb2xNYXAgPSB0aGlzLm9sTWFwO1xuICAgICAgICBpZiAoIXRoaXMuZHJhd2VyKSB7XG4gICAgICAgICAgICBsZXQgdkxheWVyID0gdGhpcy5hZGRWZWN0b3JMYXllcihPbDRVdGlscy5nZXRTdHlsZSh0aGlzLnN0eWxlc1snc2VhcmNoJ10pKTtcbiAgICAgICAgICAgIHZMYXllci5zZXRNYXAodGhpcy5vbE1hcCk7XG4gICAgICAgICAgICB0aGlzLmRyYXdlciA9IG5ldyBPbDREcmF3ZXIodkxheWVyKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzaGFwZTogU0hBUEVTID0gdHlwZW9mIHNoYXBlVHlwZSA9PT0gJ3N0cmluZycgPyBTSEFQRVNbPHN0cmluZz4gc2hhcGVUeXBlXSA6IHNoYXBlVHlwZTtcbiAgICAgICAgaWYgKHRoaXMuZHJhd2VyLmdldEludGVyYWN0aW9uKCkpIHtcbiAgICAgICAgICAgIHRoaXMub2xNYXAucmVtb3ZlSW50ZXJhY3Rpb24odGhpcy5kcmF3ZXIuZ2V0SW50ZXJhY3Rpb24oKSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5kcmF3ZXIuc2V0SW50ZXJhY3Rpb24oc2hhcGUpO1xuICAgICAgICBpZiAodGhpcy5kcmF3ZXIuZ2V0SW50ZXJhY3Rpb24oKSkge1xuICAgICAgICAgICAgbGV0IGRyYXdlciA9IHRoaXMuZHJhd2VyO1xuICAgICAgICAgICAgdGhpcy5nZXREcmF3ZXIoKS5nZXRMYXllcigpLmdldFNvdXJjZSgpLmNsZWFyKCk7XG4gICAgICAgICAgICB0aGlzLm9sTWFwLmFkZEludGVyYWN0aW9uKHRoaXMuZHJhd2VyLmdldEludGVyYWN0aW9uKCkpO1xuICAgICAgICAgICAgdGhpcy5kcmF3ZXIuZ2V0SW50ZXJhY3Rpb24oKS5vbihcbiAgICAgICAgICAgICAgICAnZHJhd3N0YXJ0JyxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICBvbDRtYXAuZ2V0RHJhd2VyKCkuZ2V0TGF5ZXIoKS5nZXRTb3VyY2UoKS5jbGVhcigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICB0aGlzLmRyYXdlci5nZXRJbnRlcmFjdGlvbigpLm9uKFxuICAgICAgICAgICAgICAgICdkcmF3ZW5kJyxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgZ2VvbSA9IGUuZmVhdHVyZS5nZXRHZW9tZXRyeSgpLnRyYW5zZm9ybShvbE1hcC5nZXRWaWV3KCkuZ2V0UHJvamVjdGlvbigpLCAnRVBTRzo0MzI2Jyk7XG4gICAgICAgICAgICAgICAgICAgIG9uRHJhd0VuZChnZW9tKTtcbiAgICAgICAgICAgICAgICAgICAgb2xNYXAucmVtb3ZlSW50ZXJhY3Rpb24oZHJhd2VyLmdldEludGVyYWN0aW9uKCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmdldERyYXdlcigpLmdldExheWVyKCkuZ2V0U291cmNlKCkuY2xlYXIoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIE9sNFdtc0xheWVyIHtcbiAgICBzdGF0aWMgY3JlYXRlTGF5ZXIodXJsOiBzdHJpbmcsIHBhcmFtczogYW55LCBwcm9qOiBvbC5Qcm9qZWN0aW9uTGlrZSwgdmlzaWJsZTogYm9vbGVhbiwgb3BhY2l0eTogbnVtYmVyKTogb2wubGF5ZXIuSW1hZ2Uge1xuICAgICAgICBsZXQgc291cmNlV21zID0gbmV3IG9sLmxheWVyLkltYWdlKHtcbiAgICAgICAgICAgIHNvdXJjZTogT2w0V21zTGF5ZXIuY3JlYXRlU291cmNlKHVybCwgcGFyYW1zLCBwcm9qKSxcbiAgICAgICAgICAgIHZpc2libGU6IHZpc2libGUsXG4gICAgICAgICAgICBvcGFjaXR5OiBvcGFjaXR5XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gc291cmNlV21zO1xuICAgIH1cblxuICAgIHN0YXRpYyBjcmVhdGVTb3VyY2UodXJsOiBzdHJpbmcsIHBhcmFtczogYW55LCBwcm9qOiBvbC5Qcm9qZWN0aW9uTGlrZSk6IG9sLnNvdXJjZS5JbWFnZVdNUyB7XG4gICAgICAgIHJldHVybiBuZXcgb2wuc291cmNlLkltYWdlV01TKHtcbiAgICAgICAgICAgIHVybDogdXJsLFxuICAgICAgICAgICAgcGFyYW1zOiBwYXJhbXMsXG4gICAgICAgICAgICBwcm9qZWN0aW9uOiBwcm9qXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHN0YXRpYyBjcmVhdGVGcm9tU291cmNlKHNvdXJjZTogb2wuc291cmNlLkltYWdlV01TLCBwcm9qOiBvbC5Qcm9qZWN0aW9uTGlrZSkge1xuICAgICAgICByZXR1cm4gbmV3IG9sLnNvdXJjZS5JbWFnZVdNUyh7XG4gICAgICAgICAgICB1cmw6IHNvdXJjZS5nZXRVcmwoKSxcbiAgICAgICAgICAgIHBhcmFtczogc291cmNlLmdldFBhcmFtcygpLFxuICAgICAgICAgICAgcHJvamVjdGlvbjogcHJvalxuICAgICAgICB9KTtcbiAgICB9XG59XG5cbmV4cG9ydCBlbnVtIFNIQVBFUyB7Tk9ORSwgQk9YLCBQT0xZR09OfVxuO1xuXG5leHBvcnQgY2xhc3MgT2w0RHJhd2VyIHtcbiAgICAvLyBwcml2YXRlIHN0YXRpYyBfaW5zdGFuY2U6IE9sNERyYXdlcjtcbiAgICBwcm90ZWN0ZWQgbGF5ZXI6IG9sLmxheWVyLlZlY3RvcjtcbiAgICBwcm90ZWN0ZWQgaW50ZXJhY3Rpb246IG9sLmludGVyYWN0aW9uLkRyYXc7XG5cbiAgICBjb25zdHJ1Y3RvcihsYXllcjogb2wubGF5ZXIuVmVjdG9yKSB7XG4gICAgICAgIHRoaXMubGF5ZXIgPSBsYXllcjtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0TGF5ZXIoKTogb2wubGF5ZXIuVmVjdG9yIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubGF5ZXI7XG4gICAgfVxuXG4gICAgcHVibGljIGdldEludGVyYWN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnRlcmFjdGlvbjtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0SW50ZXJhY3Rpb24odHlwZTogU0hBUEVTKSB7XG4gICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgY2FzZSBTSEFQRVMuQk9YOlxuICAgICAgICAgICAgICAgIHRoaXMuaW50ZXJhY3Rpb24gPSBuZXcgb2wuaW50ZXJhY3Rpb24uRHJhdyh7XG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogdGhpcy5sYXllci5nZXRTb3VyY2UoKSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ0NpcmNsZScsXG4gICAgICAgICAgICAgICAgICAgIGdlb21ldHJ5RnVuY3Rpb246IGNyZWF0ZUJveCgpIC8vIG9sLmQudHMgaGFzIG5vIGZ1bmN0aW9uIFwib2wuaW50ZXJhY3Rpb24uRHJhdy5jcmVhdGVCb3goKVwiXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFNIQVBFUy5QT0xZR09OOlxuICAgICAgICAgICAgICAgIHRoaXMuaW50ZXJhY3Rpb24gPSBuZXcgb2wuaW50ZXJhY3Rpb24uRHJhdyh7XG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogdGhpcy5sYXllci5nZXRTb3VyY2UoKSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ1BvbHlnb24nXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRoaXMuaW50ZXJhY3Rpb24gPSBudWxsO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIG9sLmQudHMgaGFzIG5vIGZ1bmN0aW9uIFwib2wuaW50ZXJhY3Rpb24uRHJhdy5jcmVhdGVCb3goKVwiXG4gKiBAcmV0dXJucyB7KGNvb3JkaW5hdGVzOmFueSwgb3B0X2dlb21ldHJ5OmFueSk9PmFueXxvbC5nZW9tLlBvbHlnb259XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVCb3goKSB7XG4gICAgcmV0dXJuIChcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSB7b2wuQ29vcmRpbmF0ZXxBcnJheS48b2wuQ29vcmRpbmF0ZT58QXJyYXkuPEFycmF5LjxvbC5Db29yZGluYXRlPj59IGNvb3JkaW5hdGVzXG4gICAgICAgICAqIEBwYXJhbSB7b2wuZ2VvbS5TaW1wbGVHZW9tZXRyeT19IG9wdF9nZW9tZXRyeVxuICAgICAgICAgKiBAcmV0dXJuIHtvbC5nZW9tLlNpbXBsZUdlb21ldHJ5fVxuICAgICAgICAgKi9cbiAgICAgICAgICAgIGZ1bmN0aW9uIChjb29yZGluYXRlcywgb3B0X2dlb21ldHJ5KSB7XG4gICAgICAgICAgICB2YXIgZXh0ZW50ID0gb2wuZXh0ZW50LmJvdW5kaW5nRXh0ZW50KGNvb3JkaW5hdGVzKTtcbiAgICAgICAgICAgIHZhciBnZW9tZXRyeSA9IG9wdF9nZW9tZXRyeSB8fCBuZXcgb2wuZ2VvbS5Qb2x5Z29uKG51bGwpO1xuICAgICAgICAgICAgZ2VvbWV0cnkuc2V0Q29vcmRpbmF0ZXMoW1tcbiAgICAgICAgICAgICAgICBvbC5leHRlbnQuZ2V0Qm90dG9tTGVmdChleHRlbnQpLFxuICAgICAgICAgICAgICAgIG9sLmV4dGVudC5nZXRCb3R0b21SaWdodChleHRlbnQpLFxuICAgICAgICAgICAgICAgIG9sLmV4dGVudC5nZXRUb3BSaWdodChleHRlbnQpLFxuICAgICAgICAgICAgICAgIG9sLmV4dGVudC5nZXRUb3BMZWZ0KGV4dGVudCksXG4gICAgICAgICAgICAgICAgb2wuZXh0ZW50LmdldEJvdHRvbUxlZnQoZXh0ZW50KVxuICAgICAgICAgICAgXV0pO1xuICAgICAgICAgICAgcmV0dXJuIGdlb21ldHJ5O1xuICAgICAgICB9XG4gICAgKTtcbn07XG4iXX0=
