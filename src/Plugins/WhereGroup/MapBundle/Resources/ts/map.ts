
import * as metador from './Ol4Map';

declare var Configuration: any;

let context: any = window;
context.spatial = metador;

export function init() {

    var metadorMapConfig = {
        map: {
            target: 'map',
            srs: ["EPSG:4326", "EPSG:31466", "EPSG:25832"],
            control: {
                // mousePosition: {fractionDigit: 4}
            }
        },
        view: {
            projection: Configuration.settings['map_crs'],//': '9,49,11,53',                                        '
            maxExtent: Configuration.settings['map_bbox_max'].split(/,\s?/),//[5.8, 47.0, 15.0, 55.0], // priority for scales or for maxExtent?
            startExtent: Configuration.settings['map_bbox_start'].split(/,\s?/),
            scales: Configuration.settings['map_scales'].split(/,\s?/).map((numS) => { return parseFloat(numS);})
        },
        styles: {
            highlight: {
                fill: {
                    color: Configuration.settings['highlight_fill'] ? Configuration.settings['highlight_fill'] : 'rgba(60, 60, 255, 0.1)'
                },
                stroke: {
                    color: Configuration.settings['highlight_stroke'] ? Configuration.settings['highlight_stroke'] : 'rgba(60, 60, 255, 1.0)',
                    width: 2
                }
            },
            search: {
                fill: {
                    color: Configuration.settings['search_fill'] ? Configuration.settings['search_fill'] : 'rgba(255, 60, 60, 0.1)'
                },
                stroke: {
                    color: Configuration.settings['search_stroke'] ? Configuration.settings['search_stroke'] : 'rgba(255, 60, 60, 1.0)',
                    width: 2
                },
                image: {
                    circle: {
                        radius: 5,
                        fill: {
                            color: Configuration.settings['search_stroke'] ? Configuration.settings['search_stroke'] : 'rgba(255, 60, 60, 0.6)'
                        }
                    }
                }
            }
        },
        source: [],
        // add additional parameters with + "ADDITIONAL"
        proj4Defs: {
            "EPSG:4326": "+proj=longlat +datum=WGS84 +units=degrees +no_defs" + " +axis=neu",
            "EPSG:4258": "+proj=longlat +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +no_defs" + " +units=degrees +axis=neu",
            "EPSG:31466": "+proj=tmerc +lat_0=0 +lon_0=6 +k=1 +x_0=2500000 +y_0=0 +ellps=bessel +towgs84=598.1,73.7,418.2,0.202,0.045,-2.455,6.7 +units=m +no_defs" + " +axis=neu",
            "EPSG:31467": "+proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=bessel +towgs84=598.1,73.7,418.2,0.202,0.045,-2.455,6.7 +units=m +no_defs" + " +axis=neu",
            // "EPSG:31468": "+proj=tmerc +lat_0=0 +lon_0=12 +k=1 +x_0=4500000 +y_0=0 +ellps=bessel +towgs84=598.1,73.7,418.2,0.202,0.045,-2.455,6.7 +units=m +no_defs" + " +axis=neu",
            // "EPSG:31469": "+proj=tmerc +lat_0=0 +lon_0=15 +k=1 +x_0=5500000 +y_0=0 +ellps=bessel +towgs84=598.1,73.7,418.2,0.202,0.045,-2.455,6.7 +units=m +no_defs" + " +axis=neu",
            "EPSG:25832": "+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
            // "EPSG:25833": "+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
        },
        component: [
            {
                class: '',
                selector: ""
            }
        ]
    };

    for (const key in Configuration.config.map_background) {
        let wms = Configuration.config.map_background[key];
        let layers = [];
        for (const l in wms.layers) {
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
    let metadorMap = metador.Ol4Map.create(metadorMapConfig);
    // metadorMap.initLayertree();
    context.spatial['map'] = metadorMap;
    // metador['metadorMap'] = metadorMap;
    // metador['geomLoader'] = new metador.GeomLoader(metadorMap, <HTMLFormElement>document.querySelector('#file-upload-form'));
}
init();
