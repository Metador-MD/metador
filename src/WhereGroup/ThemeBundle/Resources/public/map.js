'use strict';
//var ol = ol || ol;
var Ol4Utils = {
    /*
     * units: 'degrees'|'ft'|'m'|'us-ft'
     */
    resolutionScaleFactor: function(units) {
        var dpi = 25.4 / 0.28;
        var mpu = ol.proj.METERS_PER_UNIT[units];
        var inchesPerMeter = 39.37;
        return mpu * inchesPerMeter * dpi;
    },
    resolutionForScale: function(scale, factor) {
        return parseFloat(scale) / factor;
    },
    resolutionsForScales: function(scales, units) {
        var resolutions = [];
        var factor = Ol4Utils.resolutionScaleFactor(units);
        for (var i = 0; i < scales.length; i++) {
            resolutions.push(Ol4Utils.resolutionForScale(scales[i], factor));
        }
        return resolutions;
    },
    scaleForResolution: function(resolution, factor) {
        return resolution * factor;
    },
    scalesForResolutions: function(scales, units) {
        var resolutions = [];
        var factor = Ol4Utils.resolutionScaleFactor(units);
        for (var i = 0; i < scales.length; i++) {
            resolutions.push(Ol4Utils.resolutionForScale(scales[i], factor));
        }
        return resolutions;
    },
    initProj4Defs: function(proj4Defs) {
        for (var name in proj4Defs) {
            proj4.defs(name, proj4Defs[name]);
        }
    }
};
var Ol4Map = function(options) {
    this.init(options);

//    this.olMap = null;
//    this.init(options);
//    this.geosource = []; // 
//    this.basesource = []; // references from geosource
//    this.startExtent = [NaN, NaN, NaN, NaN]; // xmin, ymin, xmax, ymax options['startExtent']
//    this.maxExtent = [NaN, NaN, NaN, NaN]; // xmin, ymin, xmax, ymax  options['maxExtent']
//    this.srs = {}; // kvp-> key(uppercase): "EPSG:4326", value: "EPSG:4326" | 
};

Ol4Map.prototype = {
    init: function(options) {
        // init projections
        Ol4Utils.initProj4Defs(options.proj4Defs);
        console.log(options);
        var resolutions = Ol4Utils.resolutionsForScales(options.view.scales, 'm').reverse();
        var projection = ol.proj.get(options.view.projection);

        var extent = options.view.maxExtent;//[420000, 30000, 900000, 350000];
        var layers = [];
        for (var i = 0; i < options.source.length; i++) {
            layers.push(new ol.layer.Image({
//                extent: extent,
                source: new ol.source.ImageWMS({
                    url: options.source[i].url,
                    params: options.source[i].params
                })
            }));
        }

        console.log(resolutions);
        this.olMap = new ol.Map({
//            controls: ol.control.defaults().extend([
//                new ol.control.ScaleLine()
//            ]),
            layers: layers, 
            target: options.map.target,
            view: new ol.View({
                projection: projection,
                center: ol.extent.getCenter(options.view.startExtent),//ol.proj.fromLonLat([10, 50], projection),
                extent: extent,
//                resolutions: resolutions,//.reverse(),
//                minResolution: resolutions[0],
//                maxResolution: resolutions[resolutions.length - 1],
//                resolution: 4
//                ,
//                zoom: 8
            })
        });
        this.olMap.getView().fit(options.view.startExtent, this.olMap.getSize()); 
    },
    addGeosource: function(geosource, isBasesource) {
        var gs = new Geosource(geosource);
        this.olMap.addLayer();
        this.geosource.push(gs);
        return this;
    },
    getStartExtent: function() {
        return this.startExtent;
    },
    getMaxExtent: function() {
        return this.startExtent;
    },
    setStartExtent: function(options) {
        this.startExtent = options;
        return this;
    },
    setMaxExtent: function(options) {
        this.startExtent = options;
        return this;
    }
};

//var Ol4Map = function(options) {
//    this.map = null;
//};

var Geosource = function(options) {
    this.url = options['url'];
    this.version = options['version'];
    this.layer = options['layer'];
    this.status = null;
    this.isBasesource = false;
};

Geosource.prototype = {
    setMap: function() {
        return this.map;
    }
};

var Layertree = function() {
    this.map = null;
};

Layertree.prototype = {
    move: function() {

    }
};

var GeosourceLoader = function() {

};

GeosourceLoader.prototype = {
    addGeosource: function(url) { // static
        // check and validate url, default values: SERVICE=WMS, VERSION=1.3.0, REQUEST=GetCapabilities
    },
    onLoadError: function() { // hier ???

    },
    onLoadStart: function() {

    },
    onLoadEnd: function() {

    }
};

var VectorSource = function() {

};



var config = {
    map: {
        target: 'map',
        srs: ["EPSG:4326", "EPSG:31466", "EPSG:25832"]
    },
    view: {
        projection: 'EPSG:4326',
        maxExtent: [-180.0, -85.0511287798, 180.0, 85.0511287798],
        startExtent: [9, 49, 11, 53],
        scales: [100, 500, 1000, 5000, 25000, 50000, 100000, 200000, 250000, 500000, 1000000, 2000000, 5000000, 10000000]
    },
    source: [
        {
            url: 'http://osm-demo.wheregroup.com/service?',
            params: {
                LAYERS: 'osm',
                VERSION: '1.3.0',
                FORMAT: 'image/png'
            }
        }
    ],
    proj4Defs: {
        "EPSG:4326": "+proj=longlat +datum=WGS84 +no_defs",
        "EPSG:4258": "+proj=longlat +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +no_defs",
        "EPSG:31466": "+proj=tmerc +lat_0=0 +lon_0=6 +k=1 +x_0=2500000 +y_0=0 +ellps=bessel +towgs84=598.1,73.7,418.2,0.202,0.045,-2.455,6.7 +units=m +no_defs",
        "EPSG:31467": "+proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=bessel +towgs84=598.1,73.7,418.2,0.202,0.045,-2.455,6.7 +units=m +no_defs",
        "EPSG:31468": "+proj=tmerc +lat_0=0 +lon_0=12 +k=1 +x_0=4500000 +y_0=0 +ellps=bessel +towgs84=598.1,73.7,418.2,0.202,0.045,-2.455,6.7 +units=m +no_defs",
        "EPSG:31469": "+proj=tmerc +lat_0=0 +lon_0=15 +k=1 +x_0=5500000 +y_0=0 +ellps=bessel +towgs84=598.1,73.7,418.2,0.202,0.045,-2.455,6.7 +units=m +no_defs",
        "EPSG:25832": "+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
        "EPSG:25833": "+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
    }
};

var map = new Ol4Map(config);