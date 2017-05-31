import * as metador from './map';

let context: any = Window;
context.metador = metador;


var metadorMapConfig = {
    map: {
        target: 'map',
        srs: ["EPSG:4326", "EPSG:31466", "EPSG:25832"]
    },
    view: {
        projection: 'EPSG:4326',
        maxExtent: [5.8, 47.0, 15.0, 55.0], // priority for scales or for maxExtent?
        startExtent: [9, 49, 11, 53],
        scales: [5000, 25000, 50000, 100000, 200000, 250000, 500000, 1000000, 2000000, 5000000, 10000000]//, 20000000, 50000000]
    },
    source: [
        {
            type: 'WMS',
            url: 'http://osm-demo.wheregroup.com/service?',
            params: {
                LAYERS: 'osm',
                VERSION: '1.1.1',
                FORMAT: 'image/png'
            }
        }
        ,
        {
            type: 'WMS',
            url: 'http://wms.wheregroup.com/cgi-bin/mapbender_user.xml?',
            params: {
                LAYERS: 'Mapbender',
                VERSION: '1.1.1',
                FORMAT: 'image/png'
            }
        }
    ],
    proj4Defs: {
        "EPSG:4326": "+proj=longlat +datum=WGS84 +no_defs",
        "EPSG:4258": "+proj=longlat +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +no_defs",
        // "EPSG:31466": "+proj=tmerc +lat_0=0 +lon_0=6 +k=1 +x_0=2500000 +y_0=0 +ellps=bessel +towgs84=598.1,73.7,418.2,0.202,0.045,-2.455,6.7 +units=m +no_defs",
        // "EPSG:31467": "+proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=bessel +towgs84=598.1,73.7,418.2,0.202,0.045,-2.455,6.7 +units=m +no_defs",
        // "EPSG:31468": "+proj=tmerc +lat_0=0 +lon_0=12 +k=1 +x_0=4500000 +y_0=0 +ellps=bessel +towgs84=598.1,73.7,418.2,0.202,0.045,-2.455,6.7 +units=m +no_defs",
        // "EPSG:31469": "+proj=tmerc +lat_0=0 +lon_0=15 +k=1 +x_0=5500000 +y_0=0 +ellps=bessel +towgs84=598.1,73.7,418.2,0.202,0.045,-2.455,6.7 +units=m +no_defs",
        "EPSG:25832": "+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
        // "EPSG:25833": "+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
    }
};
let metadorMap =metador.Ol4Map.create(metadorMapConfig);
metador['metadorMap'] = metadorMap;
// console.log(metador['metadorMap']);