

import {Ol4Source} from "./Ol4Source";
import {Ol4Map, UUID} from "./Ol4Map";
import * as ol from 'openlayers';

export class Ol4VectorSource implements Ol4Source {
    private static _instance: Ol4VectorSource;
    protected showable: boolean = false;
    private ol4Map: Ol4Map;

    private constructor(ol4Map: Ol4Map) {
        // super(false);
        this.ol4Map = ol4Map;
        // this.setShowable(false);
    }

    static create(ol4map: Ol4Map): Ol4VectorSource {
        if (!Ol4VectorSource._instance) {// singleton
            Ol4VectorSource._instance = new Ol4VectorSource(ol4map);
        }
        return Ol4VectorSource._instance;
    }

    createLayer(layerUuid: string, options: any, proj: ol.ProjectionLike, visible: boolean = true, opacity: number = 1.0): ol.layer.Base {
        let vLayer = new ol.layer.Vector({
            source: new ol.source.Vector({wrapX: false}),
            style: options['style']
        });
        vLayer.set(UUID, layerUuid);
        return vLayer;
    }

    reprojectionSource(layer: ol.layer.Base, fromProj: ol.ProjectionLike, toProj: ol.ProjectionLike) {
        let source = (<ol.layer.Layer>layer).getSource();
        let features: ol.Feature[] = (<ol.source.Vector>source).getFeatures();
        for (let feature of features) {
            feature.setGeometry(feature.getGeometry().transform(fromProj, toProj));
        }
    }

    cloneLayer(layer: ol.layer.Base, fromProj: ol.ProjectionLike, toProj: ol.ProjectionLike): ol.layer.Base {
        /* TODO for clone */
        return layer;
    }

    showFeatures(vLayer: ol.layer.Vector, geoJson: Object) {
        let geoJsonReader: ol.format.GeoJSON = new ol.format.GeoJSON();
        let dataproj = geoJsonReader.readProjection(geoJson);
        let features = geoJsonReader.readFeatures(
            geoJson,
            {
                'dataProjection': geoJsonReader.readProjection(geoJson),
                'featureProjection': this.ol4Map.getProjection()
            });
        vLayer.getSource().addFeatures(features);
    }

    clearFeatures(vLayer: ol.layer.Vector) {
        vLayer.getSource().clear(true);
    }
}
