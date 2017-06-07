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
    Ol4Map.prototype.getHgLayer = function () {
        return this.hgLayer;
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
    Ol4Map.prototype.showFeatures = function (vLayer, geoJson) {
        vLayer.getSource().addFeatures((new ol.format.GeoJSON()).readFeatures(geoJson));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvUGx1Z2lucy9XaGVyZUdyb3VwL01hcEJ1bmRsZS9SZXNvdXJjZXMvdHMvYXBwLnRzIiwic3JjL1BsdWdpbnMvV2hlcmVHcm91cC9NYXBCdW5kbGUvUmVzb3VyY2VzL3RzL21hcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsK0JBQWlDO0FBRWpDLElBQUksT0FBTyxHQUFRLE1BQU0sQ0FBQztBQUMxQixPQUFPLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztBQUkxQixPQUFPLENBQUMsWUFBWSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7QUNBckU7SUFBQTtJQXFFQSxDQUFDO0lBcEVHOztPQUVHO0lBQ1csOEJBQXFCLEdBQW5DLFVBQW9DLEtBQWE7UUFDN0MsSUFBSSxHQUFHLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQztRQUN0QixJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN6QyxJQUFJLGNBQWMsR0FBRyxLQUFLLENBQUM7UUFDM0IsTUFBTSxDQUFDLEdBQUcsR0FBRyxjQUFjLEdBQUcsR0FBRyxDQUFDO0lBQ3RDLENBQUM7SUFFYSwyQkFBa0IsR0FBaEMsVUFBaUMsS0FBYSxFQUFFLE1BQWM7UUFDMUQsTUFBTSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUM7SUFDMUIsQ0FBQztJQUVhLDZCQUFvQixHQUFsQyxVQUFtQyxNQUFnQixFQUFFLEtBQWE7UUFDOUQsSUFBSSxXQUFXLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLElBQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNuRCxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVB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Q3ZDLE1BQU0sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRTtvQkFDOUIsSUFBSSxFQUFFLFNBQVM7aUJBQ2xCLENBQUMsQ0FBQztnQkFDSCxLQUFLLENBQUM7WUFDVjtnQkFDSSxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztRQUNoQyxDQUFDO0lBQ0wsQ0FBQztJQUNMLGdCQUFDO0FBQUQsQ0FwQ0EsQUFvQ0MsSUFBQTtBQXBDWSw4QkFBUztBQXNDdEI7OztHQUdHO0FBQ0g7SUFDSSxNQUFNLENBQUM7SUFDSDs7OztPQUlHO0lBQ0MsVUFBVSxXQUFXLEVBQUUsWUFBWTtRQUNuQyxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNuRCxJQUFJLFFBQVEsR0FBRyxZQUFZLElBQUksSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN6RCxRQUFRLENBQUMsY0FBYyxDQUFDLENBQUM7Z0JBQ3JCLEVBQUUsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQztnQkFDL0IsRUFBRSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDO2dCQUNoQyxFQUFFLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUM7Z0JBQzdCLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQztnQkFDNUIsRUFBRSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDO2FBQ2xDLENBQUMsQ0FBQyxDQUFDO1FBQ0osTUFBTSxDQUFDLFFBQVEsQ0FBQztJQUNwQixDQUFDLENBQ0osQ0FBQztBQUNOLENBQUM7QUFwQkQsOEJBb0JDO0FBQUEsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgKiBhcyBtZXRhZG9yIGZyb20gJy4vbWFwJztcblxubGV0IGNvbnRleHQ6IGFueSA9IFdpbmRvdztcbmNvbnRleHQubWV0YWRvciA9IG1ldGFkb3I7XG5cbmRlY2xhcmUgdmFyIENvbmZpZ3VyYXRpb246IGFueTtcblxubWV0YWRvclsnbWV0YWRvck1hcCddID0gbWV0YWRvci5PbDRNYXAuY3JlYXRlKENvbmZpZ3VyYXRpb24uc3BhdGlhbCk7XG4iLCJpbXBvcnQgT2JqZWN0ID0gb2wuT2JqZWN0O1xuZGVjbGFyZSBjbGFzcyBwcm9qNCB7XG4gICAgc3RhdGljIGRlZnMobmFtZTogc3RyaW5nLCBkZWY6IHN0cmluZyk6IHZvaWQ7XG59XG5cbmRlY2xhcmUgZnVuY3Rpb24gYWRkU291cmNlKGlkOiBzdHJpbmcsIHRpdGxlOiBzdHJpbmcsIHZpc2liaWxpdHk6IGJvb2xlYW4sIG9wYWNpdHk6IG51bWJlcik6IHZvaWQ7XG5cbmV4cG9ydCBjbGFzcyBPbDRVdGlscyB7XG4gICAgLyogXG4gICAgICogdW5pdHM6ICdkZWdyZWVzJ3wnZnQnfCdtJ3wndXMtZnQnXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyByZXNvbHV0aW9uU2NhbGVGYWN0b3IodW5pdHM6IHN0cmluZyk6IG51bWJlciB7XG4gICAgICAgIGxldCBkcGkgPSAyNS40IC8gMC4yODtcbiAgICAgICAgbGV0IG1wdSA9IG9sLnByb2ouTUVURVJTX1BFUl9VTklUW3VuaXRzXTtcbiAgICAgICAgbGV0IGluY2hlc1Blck1ldGVyID0gMzkuMzc7XG4gICAgICAgIHJldHVybiBtcHUgKiBpbmNoZXNQZXJNZXRlciAqIGRwaTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIHJlc29sdXRpb25Gb3JTY2FsZShzY2FsZTogbnVtYmVyLCBmYWN0b3I6IG51bWJlcik6IG51bWJlciB7XG4gICAgICAgIHJldHVybiBzY2FsZSAvIGZhY3RvcjtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIHJlc29sdXRpb25zRm9yU2NhbGVzKHNjYWxlczogbnVtYmVyW10sIHVuaXRzOiBzdHJpbmcpOiBudW1iZXJbXSB7XG4gICAgICAgIGxldCByZXNvbHV0aW9ucyA9IFtdO1xuICAgICAgICBsZXQgZmFjdG9yID0gT2w0VXRpbHMucmVzb2x1dGlvblNjYWxlRmFjdG9yKHVuaXRzKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzY2FsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHJlc29sdXRpb25zLnB1c2goT2w0VXRpbHMucmVzb2x1dGlvbkZvclNjYWxlKHNjYWxlc1tpXSwgZmFjdG9yKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc29sdXRpb25zO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgc2NhbGVGb3JSZXNvbHV0aW9uKHJlc29sdXRpb246IG51bWJlciwgZmFjdG9yOiBudW1iZXIpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gcmVzb2x1dGlvbiAqIGZhY3RvcjtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIHNjYWxlc0ZvclJlc29sdXRpb25zKHJlc29sdXRpb25zOiBudW1iZXJbXSwgdW5pdHM6IHN0cmluZyk6IG51bWJlcltdIHtcbiAgICAgICAgbGV0IHNjYWxlcyA9IFtdO1xuICAgICAgICBsZXQgZmFjdG9yID0gT2w0VXRpbHMucmVzb2x1dGlvblNjYWxlRmFjdG9yKHVuaXRzKTtcbiAgICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IHJlc29sdXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzY2FsZXMucHVzaChPbDRVdGlscy5zY2FsZUZvclJlc29sdXRpb24ocmVzb2x1dGlvbnNbaV0sIGZhY3RvcikpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzY2FsZXM7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBpbml0UHJvajREZWZzKHByb2o0RGVmczogYW55KTogdm9pZCB7XG4gICAgICAgIGZvciAoY29uc3QgbmFtZSBpbiBwcm9qNERlZnMpIHtcbiAgICAgICAgICAgIHByb2o0LmRlZnMobmFtZSwgcHJvajREZWZzW25hbWVdKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0UHJvaihwcm9qQ29kZTogc3RyaW5nKTogb2wucHJvai5Qcm9qZWN0aW9uIHtcbiAgICAgICAgcmV0dXJuIG9sLnByb2ouZ2V0KHByb2pDb2RlKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGdldFN0eWxlKG9wdGlvbnM6IGFueSk6IG9sLnN0eWxlLlN0eWxlIHtcbiAgICAgICAgcmV0dXJuIG5ldyBvbC5zdHlsZS5TdHlsZSh7XG4gICAgICAgICAgICBmaWxsOiBuZXcgb2wuc3R5bGUuRmlsbChvcHRpb25zWydmaWxsJ10pLFxuICAgICAgICAgICAgc3Ryb2tlOiBuZXcgb2wuc3R5bGUuU3Ryb2tlKG9wdGlvbnNbJ3N0cm9rZSddKS8vLFxuICAgICAgICAgICAgLy8gaW1hZ2U6IG5ldyBvbC5zdHlsZS5DaXJjbGUoe1xuICAgICAgICAgICAgLy8gICAgIHJhZGl1czogNyxcbiAgICAgICAgICAgIC8vICAgICBmaWxsOiBuZXcgb2wuc3R5bGUuRmlsbChvcHRpb25zWydmaWxsJ10pXG4gICAgICAgICAgICAvLyB9KVxuICAgICAgICB9KTtcbiAgICB9XG5cbi8vIGZpbGxcbi8vIHtcbi8vICAgICBjb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjIpXG4vLyB9XG4vLyBzdHJva2Vcbi8vIHtcbi8vICAgICBjb2xvcjogJyNmZmNjMzMnLFxuLy8gICAgIHdpZHRoOiAyXG4vLyAgICAgZGFzaDpcbi8vIH1cbi8vIGltYWdlXG59XG5cbmV4cG9ydCBjbGFzcyBPbDRHZW9tIHtcbiAgICBwcm90ZWN0ZWQgZ2VvbTogb2wuZ2VvbS5HZW9tZXRyeSA9IG51bGw7XG4gICAgcHJvdGVjdGVkIHByb2o6IG9sLnByb2ouUHJvamVjdGlvbiA9IG51bGw7XG5cbiAgICBjb25zdHJ1Y3RvcihnZW9tOiBvbC5nZW9tLkdlb21ldHJ5LCBwcm9qOiBvbC5wcm9qLlByb2plY3Rpb24pIHtcbiAgICAgICAgdGhpcy5nZW9tID0gZ2VvbTtcbiAgICAgICAgdGhpcy5wcm9qID0gcHJvajtcbiAgICB9XG5cbiAgICBnZXRHZW9tKCk6IG9sLmdlb20uR2VvbWV0cnkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZW9tO1xuICAgIH1cblxuICAgIGdldFByb2ooKTogb2wucHJvai5Qcm9qZWN0aW9uIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvajtcbiAgICB9XG5cbiAgICBnZXRFeHRlbnQocHJvajogb2wucHJvai5Qcm9qZWN0aW9uKTogb2wuRXh0ZW50IHtcbiAgICAgICAgaWYgKHRoaXMucHJvaiAhPT0gcHJvaikge1xuICAgICAgICAgICAgcmV0dXJuICg8b2wuZ2VvbS5HZW9tZXRyeT4oPGFueT4gdGhpcy5nZW9tKS5jbG9uZSgpKS50cmFuc2Zvcm0odGhpcy5wcm9qLCBwcm9qKS5nZXRFeHRlbnQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAoPG9sLmdlb20uR2VvbWV0cnk+KDxhbnk+IHRoaXMuZ2VvbSkuY2xvbmUoKSkuZ2V0RXh0ZW50KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0UG9seWdvbkZvckV4dGVudChwcm9qOiBvbC5wcm9qLlByb2plY3Rpb24pIHtcbiAgICAgICAgcmV0dXJuIG9sLmdlb20uUG9seWdvbi5mcm9tRXh0ZW50KHRoaXMuZ2V0RXh0ZW50KHByb2opKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBPbDRFeHRlbnQgZXh0ZW5kcyBPbDRHZW9tIHtcbiAgICBwdWJsaWMgc3RhdGljIGZyb21BcnJheShvcmRpbmF0ZXM6IG51bWJlcltdLCBwcm9qOiBvbC5wcm9qLlByb2plY3Rpb24pOiBPbDRFeHRlbnQge1xuICAgICAgICBsZXQgZ2VvbSA9IG5ldyBvbC5nZW9tLk11bHRpUG9pbnQoW1tvcmRpbmF0ZXNbMF0sIG9yZGluYXRlc1sxXV0sIFtvcmRpbmF0ZXNbMl0sIG9yZGluYXRlc1szXV1dKTtcbiAgICAgICAgcmV0dXJuIG5ldyBPbDRFeHRlbnQoZ2VvbSwgcHJvaik7XG4gICAgfVxufVxuZXhwb3J0IGNvbnN0IFVVSUQgPSAndXVpZCc7XG5leHBvcnQgY29uc3QgVElUTEUgPSAndGl0bGUnO1xuXG5leHBvcnQgY2xhc3MgT2w0TWFwIHtcbiAgICBwcml2YXRlIHN0YXRpYyBfdXVpZCA9IDA7XG4gICAgcHJpdmF0ZSBzdGF0aWMgX2luc3RhbmNlOiBPbDRNYXAgPSBudWxsOyAvLyBzaW5nbGV0b25cbiAgICBwcm90ZWN0ZWQgb2xNYXA6IG9sLk1hcCA9IG51bGw7XG4gICAgcHJvdGVjdGVkIHNjYWxlczogbnVtYmVyW107XG4gICAgLy8gICAgcHJvdGVjdGVkIHByb2o6IG9sLnByb2ouUHJvamVjdGlvbiA9IG51bGw7XG4gICAgcHJvdGVjdGVkIHN0YXJ0RXh0ZW50OiBPbDRFeHRlbnQgPSBudWxsOyAgLy8geG1pbiwgeW1pbiwgeG1heCwgeW1heCBvcHRpb25zWydzdGFydEV4dGVudCddXG4gICAgcHJvdGVjdGVkIG1heEV4dGVudDogT2w0RXh0ZW50ID0gbnVsbDtcbiAgICBwcm90ZWN0ZWQgZHJhd2VyOiBPbDREcmF3ZXI7XG4gICAgcHJvdGVjdGVkIHN0eWxlczogT2JqZWN0O1xuICAgIHByb3RlY3RlZCBoZ0xheWVyOiBvbC5sYXllci5WZWN0b3I7XG4gICAgcHJvdGVjdGVkIGRyYWd6b29tOiBvbC5pbnRlcmFjdGlvbi5EcmFnWm9vbTtcblxuICAgIHByaXZhdGUgc3RhdGljIGdldFV1aWQocHJlZml4OiBzdHJpbmcgPSAnJyk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBwcmVmaXggKyAoKytPbDRNYXAuX3V1aWQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgY29uc3RydWN0b3Iob3B0aW9uczogYW55KSB7IC8vIHNpbmdsZXRvblxuICAgICAgICAvLyBpbml0IGdpdmVuIGNyc2VzXG4gICAgICAgIC8vIG9sWydFTkFCTEVfUkFTVEVSX1JFUFJPSkVDVElPTiddID0gZmFsc2U7XG4gICAgICAgIE9sNFV0aWxzLmluaXRQcm9qNERlZnMob3B0aW9uc1sncHJvajREZWZzJ10pO1xuICAgICAgICBsZXQgcHJvajogb2wucHJvai5Qcm9qZWN0aW9uID0gb2wucHJvai5nZXQob3B0aW9uc1sndmlldyddWydwcm9qZWN0aW9uJ10pO1xuICAgICAgICB0aGlzLnN0eWxlcyA9IG9wdGlvbnNbJ3N0eWxlcyddO1xuICAgICAgICB0aGlzLnNjYWxlcyA9IG9wdGlvbnNbJ3ZpZXcnXVsnc2NhbGVzJ107XG4gICAgICAgIHRoaXMuc3RhcnRFeHRlbnQgPSBPbDRFeHRlbnQuZnJvbUFycmF5KG9wdGlvbnNbJ3ZpZXcnXVsnc3RhcnRFeHRlbnQnXSwgcHJvaik7XG4gICAgICAgIHRoaXMubWF4RXh0ZW50ID0gT2w0RXh0ZW50LmZyb21BcnJheShvcHRpb25zWyd2aWV3J11bJ21heEV4dGVudCddLCBwcm9qKTtcbiAgICAgICAgdGhpcy5vbE1hcCA9IG5ldyBvbC5NYXAoe1xuICAgICAgICAgICAgdGFyZ2V0OiBvcHRpb25zWydtYXAnXVsndGFyZ2V0J10sXG4gICAgICAgICAgICByZW5kZXJlcjogJ2NhbnZhcydcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMub2xNYXAuc2V0VmlldyhcbiAgICAgICAgICAgIG5ldyBvbC5WaWV3KHtcbiAgICAgICAgICAgICAgICBwcm9qZWN0aW9uOiBwcm9qLFxuICAgICAgICAgICAgICAgIHJlc29sdXRpb25zOiBPbDRVdGlscy5yZXNvbHV0aW9uc0ZvclNjYWxlcyh0aGlzLnNjYWxlcywgcHJvai5nZXRVbml0cygpKS5yZXZlcnNlKCksXG4gICAgICAgICAgICAgICAgZXh0ZW50OiB0aGlzLm1heEV4dGVudC5nZXRFeHRlbnQocHJvailcbiAgICAgICAgICAgIH0pXG4gICAgICAgICk7XG4gICAgICAgIGZvciAobGV0IHNvdXJjZSBvZiBvcHRpb25zWydzb3VyY2UnXSkge1xuICAgICAgICAgICAgdGhpcy5hZGRMYXllckZvck9wdGlvbnMoc291cmNlKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm9sTWFwLmFkZENvbnRyb2wobmV3IG9sLmNvbnRyb2wuU2NhbGVMaW5lKCkpO1xuXG4gICAgICAgIHRoaXMub2xNYXAuYWRkQ29udHJvbChuZXcgb2wuY29udHJvbC5ab29tVG9FeHRlbnQoe1xuICAgICAgICAgICAgZXh0ZW50OiB0aGlzLm1heEV4dGVudC5nZXRFeHRlbnQocHJvailcbiAgICAgICAgfSkpO1xuICAgICAgICB0aGlzLm9sTWFwLmFkZEludGVyYWN0aW9uKG5ldyBvbC5pbnRlcmFjdGlvbi5EcmFnWm9vbSgpKTtcbiAgICAgICAgdGhpcy5vbE1hcC5hZGRDb250cm9sKG5ldyBvbC5jb250cm9sLk1vdXNlUG9zaXRpb24oXG4gICAgICAgICAgICAvLyB7XG4gICAgICAgICAgICAvLyAgICAgY29vcmRpbmF0ZUZvcm1hdDogZnVuY3Rpb24gKGNvb3JkaW5hdGVzKSB7XG4gICAgICAgICAgICAvLyAgICAgICAgIHZhciBjb29yZF94ID0gY29vcmRpbmF0ZXNbMF0udG9GaXhlZCgzKTtcbiAgICAgICAgICAgIC8vICAgICAgICAgdmFyIGNvb3JkX3kgPSBjb29yZGluYXRlc1sxXS50b0ZpeGVkKDMpO1xuICAgICAgICAgICAgLy8gICAgICAgICByZXR1cm4gY29vcmRfeCArICcsICcgKyBjb29yZF95O1xuICAgICAgICAgICAgLy8gICAgIH1cbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgKSk7XG4gICAgICAgIHRoaXMub2xNYXAuZ2V0VmlldygpLmZpdCh0aGlzLnN0YXJ0RXh0ZW50LmdldFBvbHlnb25Gb3JFeHRlbnQocHJvaiksIHRoaXMub2xNYXAuZ2V0U2l6ZSgpKTtcbiAgICAgICAgZm9yIChsZXQgbGF5ZXIgb2YgdGhpcy5vbE1hcC5nZXRMYXllcnMoKS5nZXRBcnJheSgpKSB7XG4gICAgICAgICAgICBsZXQgc291cmNlO1xuICAgICAgICAgICAgaWYgKGxheWVyIGluc3RhbmNlb2Ygb2wubGF5ZXIuR3JvdXApIHsgLy8gaW5zdGFuY2Ugb2Ygb2wubGF5ZXIuR3JvdXBcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdvbC5sYXllci5Hcm91cCBhcyBMYXllciBpcyBub3Qgc3Vwb3J0ZWQnKTtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ29sLmxheWVyLkdyb3VwIGFzIExheWVyIGlzIG5vdCBzdXBvcnRlZCcpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICgoc291cmNlID0gKDxvbC5sYXllci5MYXllcj5sYXllcikuZ2V0U291cmNlKCkpIGluc3RhbmNlb2Ygb2wuc291cmNlLkltYWdlV01TKSB7XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmhnTGF5ZXIgPSB0aGlzLmFkZFZlY3RvckxheWVyKE9sNFV0aWxzLmdldFN0eWxlKHRoaXMuc3R5bGVzWydoaWdobGlnaHQnXSkpO1xuICAgIH1cblxuICAgIHN0YXRpYyBjcmVhdGUob3B0aW9uczogYW55KTogT2w0TWFwIHtcbiAgICAgICAgaWYgKCFPbDRNYXAuX2luc3RhbmNlKSB7Ly8gc2luZ2xldG9uXG4gICAgICAgICAgICBPbDRNYXAuX2luc3RhbmNlID0gbmV3IE9sNE1hcChvcHRpb25zKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gT2w0TWFwLl9pbnN0YW5jZTtcbiAgICB9XG5cbiAgICAvLyByZW5kZXJUcmVlT3B0aW9uKCkge1xuICAgIC8vICAgICBsZXQgdWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuLWpzLW1hcC1sYXllcnRyZWUgdWwnKTtcbiAgICAvLyAgICAgdmFyIGJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7XG4gICAgLy8gICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kKGJ1dHRvbik7XG4gICAgLy8gICAgIGJ1dHRvbi5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgLy8gICAgIGJ1dHRvbi5zdHlsZS50b3AgPSAnMTBweCc7XG4gICAgLy8gICAgIGJ1dHRvbi5zdHlsZS5sZWZ0ID0gJzEwcHgnO1xuICAgIC8vICAgICBidXR0b24uc3R5bGUuekluZGV4ID0gMTAwMDA7XG4gICAgLy8gICAgIGJ1dHRvbi5vbmNsaWNrID0gY29weUNsaWNrZWQ7XG4gICAgLy8gfVxuXG4gICAgZ2V0RHJhd2VyKCk6IE9sNERyYXdlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmRyYXdlcjtcbiAgICB9XG5cbiAgICBnZXRIZ0xheWVyKCk6IG9sLmxheWVyLlZlY3RvcntcbiAgICAgICAgcmV0dXJuIHRoaXMuaGdMYXllcjtcbiAgICB9XG5cbiAgICBhZGRMYXllckZvck9wdGlvbnMob3B0aW9uczogYW55KSB7XG4gICAgICAgIGlmIChvcHRpb25zWyd0eXBlJ10gPT09ICdXTVMnKSB7XG4gICAgICAgICAgICBsZXQgd21zTGF5ZXIgPSB0aGlzLmFkZExheWVyKFxuICAgICAgICAgICAgICAgIE9sNFdtc0xheWVyLmNyZWF0ZUxheWVyKG9wdGlvbnNbJ3VybCddLFxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zWydwYXJhbXMnXSxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vbE1hcC5nZXRWaWV3KCkuZ2V0UHJvamVjdGlvbigpLFxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zWyd2aXNpYmxlJ10sXG4gICAgICAgICAgICAgICAgICAgIHBhcnNlRmxvYXQob3B0aW9uc1snb3BhY2l0eSddKSksXG4gICAgICAgICAgICAgICAgb3B0aW9uc1sndGl0bGUnXVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGFkZFNvdXJjZSh3bXNMYXllci5nZXQoJ3V1aWQnKSwgd21zTGF5ZXIuZ2V0KCd0aXRsZScpLCB3bXNMYXllci5nZXRWaXNpYmxlKCksIHdtc0xheWVyLmdldE9wYWNpdHkoKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKG9wdGlvbnNbJ3R5cGUnXSArICcgaXMgbm90IHN1cHBvcnRlZC4nKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNob3dGZWF0dXJlcyh2TGF5ZXI6IG9sLmxheWVyLlZlY3RvciwgZ2VvSnNvbjogT2JqZWN0KSB7XG4gICAgICAgIHZMYXllci5nZXRTb3VyY2UoKS5hZGRGZWF0dXJlcygobmV3IG9sLmZvcm1hdC5HZW9KU09OKCkpLnJlYWRGZWF0dXJlcyhnZW9Kc29uKSk7XG4gICAgfVxuXG4gICAgY2xlYXJGZWF0dXJlcyh2TGF5ZXI6IG9sLmxheWVyLlZlY3Rvcikge1xuICAgICAgICB2TGF5ZXIuZ2V0U291cmNlKCkuY2xlYXIodHJ1ZSk7XG4gICAgfVxuXG4gICAgYWRkVmVjdG9yTGF5ZXIoc3R5bGU6IG9sLnN0eWxlLlN0eWxlKTogb2wubGF5ZXIuVmVjdG9yIHtcbiAgICAgICAgbGV0IG9wdGlvbnMgPSB7XG4gICAgICAgICAgICB3cmFwWDogZmFsc2VcbiAgICAgICAgfTtcbiAgICAgICAgbGV0IHZMYXllciA9IG5ldyBvbC5sYXllci5WZWN0b3Ioe1xuICAgICAgICAgICAgc291cmNlOiBuZXcgb2wuc291cmNlLlZlY3RvcihvcHRpb25zKSxcbiAgICAgICAgICAgIHN0eWxlOiBzdHlsZVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIDxvbC5sYXllci5WZWN0b3I+dGhpcy5hZGRMYXllcih2TGF5ZXIpO1xuICAgIH1cblxuICAgIGFkZExheWVyKGxheWVyOiBvbC5sYXllci5CYXNlLCB0aXRsZTogc3RyaW5nID0gbnVsbCk6IG9sLmxheWVyLkJhc2Uge1xuICAgICAgICBsYXllci5zZXQoVVVJRCwgT2w0TWFwLmdldFV1aWQoJ29sYXktJykpO1xuICAgICAgICBpZiAodGl0bGUpIHtcbiAgICAgICAgICAgIGxheWVyLnNldChUSVRMRSwgdGl0bGUpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMub2xNYXAuYWRkTGF5ZXIobGF5ZXIpO1xuICAgICAgICByZXR1cm4gbGF5ZXI7XG4gICAgfVxuXG4gICAgcmVtb3ZlTGF5ZXIobGF5ZXI6IG9sLmxheWVyLkJhc2UpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5vbE1hcC5yZW1vdmVMYXllcihsYXllcik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBmaW5kTGF5ZXIodXVpZDogc3RyaW5nKTogb2wubGF5ZXIuQmFzZSB7XG4gICAgICAgIGxldCBsYXllcnMgPSB0aGlzLm9sTWFwLmdldExheWVycygpLmdldEFycmF5KCk7XG4gICAgICAgIGxldCBsbGVuZ3RoID0gbGF5ZXJzLmxlbmd0aDtcbiAgICAgICAgZm9yIChsZXQgbGF5ZXIgb2YgbGF5ZXJzKSB7XG4gICAgICAgICAgICBsZXQgc291cmNlOiBvbC5zb3VyY2UuU291cmNlO1xuICAgICAgICAgICAgaWYgKGxheWVyIGluc3RhbmNlb2Ygb2wubGF5ZXIuR3JvdXApIHsgLy8gaW5zdGFuY2Ugb2Ygb2wubGF5ZXIuR3JvdXBcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdvbC5sYXllci5Hcm91cCBhcyBMYXllciBpcyBub3Qgc3Vwb3J0ZWQnKTtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ29sLmxheWVyLkdyb3VwIGFzIExheWVyIGlzIG5vdCBzdXBvcnRlZCcpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChsYXllci5nZXQoVVVJRCkgPT09IHV1aWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbGF5ZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgdXBkYXRlTWFwKCk6IHZvaWQge1xuICAgICAgICB0aGlzLm9sTWFwLnVwZGF0ZVNpemUoKTtcbiAgICB9XG5cbiAgICBjaGFuZ2VDcnMoY3JzOiBzdHJpbmcpIHsgLy8gVE9ET1xuICAgICAgICBsZXQgcHJvaiA9IG51bGw7XG4gICAgICAgIGlmICgocHJvaiA9IG9sLnByb2ouZ2V0KGNycykpKSB7XG4gICAgICAgICAgICBsZXQgZXh0ZW50ID0gT2w0RXh0ZW50LmZyb21BcnJheShcbiAgICAgICAgICAgICAgICB0aGlzLm9sTWFwLmdldFZpZXcoKS5jYWxjdWxhdGVFeHRlbnQodGhpcy5vbE1hcC5nZXRTaXplKCkpLFxuICAgICAgICAgICAgICAgIHRoaXMub2xNYXAuZ2V0VmlldygpLmdldFByb2plY3Rpb24oKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGxldCBwcm9qZWN0aW9uID0gdGhpcy5vbE1hcC5nZXRWaWV3KCkuZ2V0UHJvamVjdGlvbigpO1xuICAgICAgICAgICAgbGV0IGNlbnRlciA9IHRoaXMub2xNYXAuZ2V0VmlldygpLmdldENlbnRlcigpO1xuICAgICAgICAgICAgbGV0IG5ld1ZpZXcgPSBuZXcgb2wuVmlldyh7XG4gICAgICAgICAgICAgICAgcHJvamVjdGlvbjogcHJvaixcbiAgICAgICAgICAgICAgICByZXNvbHV0aW9uczogT2w0VXRpbHMucmVzb2x1dGlvbnNGb3JTY2FsZXModGhpcy5zY2FsZXMsIHByb2ouZ2V0VW5pdHMoKSkucmV2ZXJzZSgpLFxuICAgICAgICAgICAgICAgIGV4dGVudDogdGhpcy5tYXhFeHRlbnQuZ2V0RXh0ZW50KHByb2opXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGxldCBsYXllcnMgPSB0aGlzLm9sTWFwLmdldExheWVycygpLmdldEFycmF5KCk7XG4gICAgICAgICAgICBsZXQgbGxlbmd0aCA9IGxheWVycy5sZW5ndGg7XG4gICAgICAgICAgICBmb3IgKGxldCBsYXllciBvZiBsYXllcnMpIHtcbiAgICAgICAgICAgICAgICBsZXQgc291cmNlOiBvbC5zb3VyY2UuU291cmNlO1xuICAgICAgICAgICAgICAgIGlmIChsYXllciBpbnN0YW5jZW9mIG9sLmxheWVyLkdyb3VwKSB7IC8vIGluc3RhbmNlIG9mIG9sLmxheWVyLkdyb3VwXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ29sLmxheWVyLkdyb3VwIGFzIExheWVyIGlzIG5vdCBzdXBvcnRlZCcpO1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ29sLmxheWVyLkdyb3VwIGFzIExheWVyIGlzIG5vdCBzdXBvcnRlZCcpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoKHNvdXJjZSA9ICg8b2wubGF5ZXIuTGF5ZXI+bGF5ZXIpLmdldFNvdXJjZSgpKSBpbnN0YW5jZW9mIG9sLnNvdXJjZS5JbWFnZVdNUykge1xuICAgICAgICAgICAgICAgICAgICAoPG9sLmxheWVyLkltYWdlPmxheWVyKS5zZXRTb3VyY2UoT2w0V21zTGF5ZXIuY3JlYXRlRnJvbVNvdXJjZSg8b2wuc291cmNlLkltYWdlV01TPiBzb3VyY2UsIHByb2opKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm9sTWFwLnNldFZpZXcobmV3Vmlldyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhjZW50ZXIpO1xuICAgICAgICAgICAgdGhpcy5vbE1hcC5nZXRWaWV3KCkuZml0KGV4dGVudC5nZXRQb2x5Z29uRm9yRXh0ZW50KHByb2opLCB0aGlzLm9sTWFwLmdldFNpemUoKSk7XG4gICAgICAgICAgICAvLyBsZXQgY3BvaW50ID0gPG9sLmdlb20uUG9pbnQ+IG5ldyBvbC5nZW9tLlBvaW50KGNlbnRlcikudHJhbnNmb3JtKHByb2plY3Rpb24sIHByb2opO1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coY3BvaW50LmdldENvb3JkaW5hdGVzKCkpO1xuICAgICAgICAgICAgLy8gdGhpcy5vbE1hcC5nZXRWaWV3KCkuc2V0Q2VudGVyKGNwb2ludC5nZXRDb29yZGluYXRlcygpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldFZpc2libGUobGF5ZXJVaWlkOiBzdHJpbmcsIHZpc2libGl0eTogYm9vbGVhbik6IHZvaWQge1xuICAgICAgICBsZXQgbGF5ZXI6IG9sLmxheWVyLkJhc2UgPSB0aGlzLmZpbmRMYXllcihsYXllclVpaWQpO1xuICAgICAgICBpZiAobGF5ZXIpIHtcbiAgICAgICAgICAgIGxheWVyLnNldFZpc2libGUodmlzaWJsaXR5KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldE9wYWNpdHkobGF5ZXJVaWlkOiBzdHJpbmcsIG9wYWNpdHk6IG51bWJlcik6IHZvaWQge1xuICAgICAgICBsZXQgbGF5ZXI6IG9sLmxheWVyLkJhc2UgPSB0aGlzLmZpbmRMYXllcihsYXllclVpaWQpO1xuICAgICAgICBpZiAobGF5ZXIpIHtcbiAgICAgICAgICAgIGxheWVyLnNldE9wYWNpdHkob3BhY2l0eSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkcmFnWm9vbShhY3RpdmF0ZTogYm9vbGVhbiwgb25ab29tRW5kOiBGdW5jdGlvbiA9IG51bGwpIHtcbiAgICAgICAgaWYgKCF0aGlzLmRyYWd6b29tKSB7XG4gICAgICAgICAgICB0aGlzLmRyYWd6b29tID0gbmV3IG9sLmludGVyYWN0aW9uLkRyYWdab29tKHtcbiAgICAgICAgICAgICAgICBjb25kaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBsZXQgZHJhZ3pvb20gPSB0aGlzLmRyYWd6b29tO1xuICAgICAgICAgICAgbGV0IG1hcCA9IHRoaXMub2xNYXA7XG4gICAgICAgICAgICB0aGlzLmRyYWd6b29tLm9uKCdib3hlbmQnLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChldmVudDogb2wuaW50ZXJhY3Rpb24uRHJhdy5FdmVudCkge1xuICAgICAgICAgICAgICAgICAgICBtYXAucmVtb3ZlSW50ZXJhY3Rpb24oZHJhZ3pvb20pO1xuICAgICAgICAgICAgICAgICAgICBpZiAob25ab29tRW5kKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvblpvb21FbmQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhY3RpdmF0ZSkge1xuICAgICAgICAgICAgdGhpcy5vbE1hcC5hZGRJbnRlcmFjdGlvbih0aGlzLmRyYWd6b29tKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMub2xNYXAucmVtb3ZlSW50ZXJhY3Rpb24odGhpcy5kcmFnem9vbSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZXREcmF3KHNoYXBlVHlwZTogU0hBUEVTID0gbnVsbCwgb25EcmF3RW5kOiBGdW5jdGlvbiA9IG51bGwpIHtcbiAgICAgICAgbGV0IG9sNG1hcCA9IHRoaXM7XG4gICAgICAgIGxldCBvbE1hcCA9IHRoaXMub2xNYXA7XG4gICAgICAgIGlmICghdGhpcy5kcmF3ZXIpIHtcbiAgICAgICAgICAgIGxldCB2TGF5ZXIgPSB0aGlzLmFkZFZlY3RvckxheWVyKE9sNFV0aWxzLmdldFN0eWxlKHRoaXMuc3R5bGVzWydzZWFyY2gnXSkpO1xuICAgICAgICAgICAgdkxheWVyLnNldE1hcCh0aGlzLm9sTWFwKTtcbiAgICAgICAgICAgIHRoaXMuZHJhd2VyID0gbmV3IE9sNERyYXdlcih2TGF5ZXIpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHNoYXBlOiBTSEFQRVMgPSB0eXBlb2Ygc2hhcGVUeXBlID09PSAnc3RyaW5nJyA/IFNIQVBFU1s8c3RyaW5nPiBzaGFwZVR5cGVdIDogc2hhcGVUeXBlO1xuICAgICAgICBpZiAodGhpcy5kcmF3ZXIuZ2V0SW50ZXJhY3Rpb24oKSkge1xuICAgICAgICAgICAgdGhpcy5vbE1hcC5yZW1vdmVJbnRlcmFjdGlvbih0aGlzLmRyYXdlci5nZXRJbnRlcmFjdGlvbigpKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRyYXdlci5zZXRJbnRlcmFjdGlvbihzaGFwZSk7XG4gICAgICAgIGlmICh0aGlzLmRyYXdlci5nZXRJbnRlcmFjdGlvbigpKSB7XG4gICAgICAgICAgICBsZXQgZHJhd2VyID0gdGhpcy5kcmF3ZXI7XG4gICAgICAgICAgICB0aGlzLmdldERyYXdlcigpLmdldExheWVyKCkuZ2V0U291cmNlKCkuY2xlYXIoKTtcbiAgICAgICAgICAgIHRoaXMub2xNYXAuYWRkSW50ZXJhY3Rpb24odGhpcy5kcmF3ZXIuZ2V0SW50ZXJhY3Rpb24oKSk7XG4gICAgICAgICAgICB0aGlzLmRyYXdlci5nZXRJbnRlcmFjdGlvbigpLm9uKFxuICAgICAgICAgICAgICAgICdkcmF3c3RhcnQnLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIG9sNG1hcC5nZXREcmF3ZXIoKS5nZXRMYXllcigpLmdldFNvdXJjZSgpLmNsZWFyKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHRoaXMuZHJhd2VyLmdldEludGVyYWN0aW9uKCkub24oXG4gICAgICAgICAgICAgICAgJ2RyYXdlbmQnLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBnZW9tID0gZS5mZWF0dXJlLmdldEdlb21ldHJ5KCkudHJhbnNmb3JtKG9sTWFwLmdldFZpZXcoKS5nZXRQcm9qZWN0aW9uKCksICdFUFNHOjQzMjYnKTtcbiAgICAgICAgICAgICAgICAgICAgb25EcmF3RW5kKGdlb20pO1xuICAgICAgICAgICAgICAgICAgICBvbE1hcC5yZW1vdmVJbnRlcmFjdGlvbihkcmF3ZXIuZ2V0SW50ZXJhY3Rpb24oKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZ2V0RHJhd2VyKCkuZ2V0TGF5ZXIoKS5nZXRTb3VyY2UoKS5jbGVhcigpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgT2w0V21zTGF5ZXIge1xuICAgIHN0YXRpYyBjcmVhdGVMYXllcih1cmw6IHN0cmluZywgcGFyYW1zOiBhbnksIHByb2o6IG9sLlByb2plY3Rpb25MaWtlLCB2aXNpYmxlOiBib29sZWFuLCBvcGFjaXR5OiBudW1iZXIpOiBvbC5sYXllci5JbWFnZSB7XG4gICAgICAgIGxldCBzb3VyY2VXbXMgPSBuZXcgb2wubGF5ZXIuSW1hZ2Uoe1xuICAgICAgICAgICAgc291cmNlOiBPbDRXbXNMYXllci5jcmVhdGVTb3VyY2UodXJsLCBwYXJhbXMsIHByb2opLFxuICAgICAgICAgICAgdmlzaWJsZTogdmlzaWJsZSxcbiAgICAgICAgICAgIG9wYWNpdHk6IG9wYWNpdHlcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBzb3VyY2VXbXM7XG4gICAgfVxuXG4gICAgc3RhdGljIGNyZWF0ZVNvdXJjZSh1cmw6IHN0cmluZywgcGFyYW1zOiBhbnksIHByb2o6IG9sLlByb2plY3Rpb25MaWtlKTogb2wuc291cmNlLkltYWdlV01TIHtcbiAgICAgICAgcmV0dXJuIG5ldyBvbC5zb3VyY2UuSW1hZ2VXTVMoe1xuICAgICAgICAgICAgdXJsOiB1cmwsXG4gICAgICAgICAgICBwYXJhbXM6IHBhcmFtcyxcbiAgICAgICAgICAgIHByb2plY3Rpb246IHByb2pcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc3RhdGljIGNyZWF0ZUZyb21Tb3VyY2Uoc291cmNlOiBvbC5zb3VyY2UuSW1hZ2VXTVMsIHByb2o6IG9sLlByb2plY3Rpb25MaWtlKSB7XG4gICAgICAgIHJldHVybiBuZXcgb2wuc291cmNlLkltYWdlV01TKHtcbiAgICAgICAgICAgIHVybDogc291cmNlLmdldFVybCgpLFxuICAgICAgICAgICAgcGFyYW1zOiBzb3VyY2UuZ2V0UGFyYW1zKCksXG4gICAgICAgICAgICBwcm9qZWN0aW9uOiBwcm9qXG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGVudW0gU0hBUEVTIHtOT05FLCBCT1gsIFBPTFlHT059XG47XG5cbmV4cG9ydCBjbGFzcyBPbDREcmF3ZXIge1xuICAgIC8vIHByaXZhdGUgc3RhdGljIF9pbnN0YW5jZTogT2w0RHJhd2VyO1xuICAgIHByb3RlY3RlZCBsYXllcjogb2wubGF5ZXIuVmVjdG9yO1xuICAgIHByb3RlY3RlZCBpbnRlcmFjdGlvbjogb2wuaW50ZXJhY3Rpb24uRHJhdztcblxuICAgIGNvbnN0cnVjdG9yKGxheWVyOiBvbC5sYXllci5WZWN0b3IpIHtcbiAgICAgICAgdGhpcy5sYXllciA9IGxheWVyO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRMYXllcigpOiBvbC5sYXllci5WZWN0b3Ige1xuICAgICAgICByZXR1cm4gdGhpcy5sYXllcjtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0SW50ZXJhY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmludGVyYWN0aW9uO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRJbnRlcmFjdGlvbih0eXBlOiBTSEFQRVMpIHtcbiAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICBjYXNlIFNIQVBFUy5CT1g6XG4gICAgICAgICAgICAgICAgdGhpcy5pbnRlcmFjdGlvbiA9IG5ldyBvbC5pbnRlcmFjdGlvbi5EcmF3KHtcbiAgICAgICAgICAgICAgICAgICAgc291cmNlOiB0aGlzLmxheWVyLmdldFNvdXJjZSgpLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnQ2lyY2xlJyxcbiAgICAgICAgICAgICAgICAgICAgZ2VvbWV0cnlGdW5jdGlvbjogY3JlYXRlQm94KCkgLy8gb2wuZC50cyBoYXMgbm8gZnVuY3Rpb24gXCJvbC5pbnRlcmFjdGlvbi5EcmF3LmNyZWF0ZUJveCgpXCJcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgU0hBUEVTLlBPTFlHT046XG4gICAgICAgICAgICAgICAgdGhpcy5pbnRlcmFjdGlvbiA9IG5ldyBvbC5pbnRlcmFjdGlvbi5EcmF3KHtcbiAgICAgICAgICAgICAgICAgICAgc291cmNlOiB0aGlzLmxheWVyLmdldFNvdXJjZSgpLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnUG9seWdvbidcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhpcy5pbnRlcmFjdGlvbiA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogb2wuZC50cyBoYXMgbm8gZnVuY3Rpb24gXCJvbC5pbnRlcmFjdGlvbi5EcmF3LmNyZWF0ZUJveCgpXCJcbiAqIEByZXR1cm5zIHsoY29vcmRpbmF0ZXM6YW55LCBvcHRfZ2VvbWV0cnk6YW55KT0+YW55fG9sLmdlb20uUG9seWdvbn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUJveCgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtIHtvbC5Db29yZGluYXRlfEFycmF5LjxvbC5Db29yZGluYXRlPnxBcnJheS48QXJyYXkuPG9sLkNvb3JkaW5hdGU+Pn0gY29vcmRpbmF0ZXNcbiAgICAgICAgICogQHBhcmFtIHtvbC5nZW9tLlNpbXBsZUdlb21ldHJ5PX0gb3B0X2dlb21ldHJ5XG4gICAgICAgICAqIEByZXR1cm4ge29sLmdlb20uU2ltcGxlR2VvbWV0cnl9XG4gICAgICAgICAqL1xuICAgICAgICAgICAgZnVuY3Rpb24gKGNvb3JkaW5hdGVzLCBvcHRfZ2VvbWV0cnkpIHtcbiAgICAgICAgICAgIHZhciBleHRlbnQgPSBvbC5leHRlbnQuYm91bmRpbmdFeHRlbnQoY29vcmRpbmF0ZXMpO1xuICAgICAgICAgICAgdmFyIGdlb21ldHJ5ID0gb3B0X2dlb21ldHJ5IHx8IG5ldyBvbC5nZW9tLlBvbHlnb24obnVsbCk7XG4gICAgICAgICAgICBnZW9tZXRyeS5zZXRDb29yZGluYXRlcyhbW1xuICAgICAgICAgICAgICAgIG9sLmV4dGVudC5nZXRCb3R0b21MZWZ0KGV4dGVudCksXG4gICAgICAgICAgICAgICAgb2wuZXh0ZW50LmdldEJvdHRvbVJpZ2h0KGV4dGVudCksXG4gICAgICAgICAgICAgICAgb2wuZXh0ZW50LmdldFRvcFJpZ2h0KGV4dGVudCksXG4gICAgICAgICAgICAgICAgb2wuZXh0ZW50LmdldFRvcExlZnQoZXh0ZW50KSxcbiAgICAgICAgICAgICAgICBvbC5leHRlbnQuZ2V0Qm90dG9tTGVmdChleHRlbnQpXG4gICAgICAgICAgICBdXSk7XG4gICAgICAgICAgICByZXR1cm4gZ2VvbWV0cnk7XG4gICAgICAgIH1cbiAgICApO1xufTtcbiJdfQ==
