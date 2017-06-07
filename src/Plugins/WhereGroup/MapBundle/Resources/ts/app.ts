import * as metador from './map';

let context: any = Window;
context.metador = metador;

declare var Configuration: any;

metador['metadorMap'] = metador.Ol4Map.create(Configuration.spatial);

// var geojsonObject = {
//     'type': 'FeatureCollection',
//     'crs': {
//         'type': 'name',
//         'properties': {
//             'name': 'EPSG:3857'
//         }
//     },
//     'features': [{
//         'type': 'Feature',
//         'geometry': {
//             'type': 'Polygon',
//             'coordinates': [[[9, 49], [12, 50], [9, 51], [9, 49]]]
//         }
//     }]
// };