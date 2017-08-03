import {TITLE, UUID, LAYER_UUID, Ol4Map} from "./Ol4";
import {LayerTree} from './LayerTree';

export abstract class Ol4Source {

    abstract createLayer(layerUuid: string, options: any, proj: ol.ProjectionLike, visible: boolean, opacity: number);

    abstract refreshSource(layer: ol.layer.Base, fromProj: ol.ProjectionLike, toProj: ol.ProjectionLike);

    //
    // abstract showLayer();
    //
    // abstract hideLayer();
}

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

    createLayer(layerUuid: string, options: any, proj: ol.ProjectionLike, visible: boolean = true, opacity: number = 1.0): ol.layer.Vector {
        let vLayer = new ol.layer.Vector({
            source: new ol.source.Vector({wrapX: false}),
            style: options['style']
        });
        vLayer.set(UUID, layerUuid);
        return vLayer;
    }

    refreshSource(layer: ol.layer.Base, fromProj: ol.ProjectionLike, toProj: ol.ProjectionLike) {
        let source = (<ol.layer.Layer>layer).getSource();
        let features: ol.Feature[] = (<ol.source.Vector>source).getFeatures();
        for (let feature of features) {
            feature.setGeometry(feature.getGeometry().transform(fromProj, toProj));
        }
    }

    //
    // showLayer(){
    //
    // }
    //
    // hideLayer(){
    //
    // }

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

export class Ol4WmsSource implements Ol4Source {
    private static _instance: Ol4WmsSource;
    private ol4Map: Ol4Map;
    private useLoadEvents: boolean;
    private layertree: LayerTree;
    private static mapActivity: MapActivity;

    private constructor(ol4Map: Ol4Map, useLoadEvents: boolean = true, layertree: LayerTree = null) {
        this.ol4Map = ol4Map;
        this.useLoadEvents = useLoadEvents;
        this.layertree = layertree;
        if (this.useLoadEvents) {
            Ol4WmsSource.mapActivity = MapActivity.create();
        }
    }

    static create(ol4Map: Ol4Map, useLoadEvents: boolean = true, layertree: LayerTree = null): Ol4WmsSource {
        if (!Ol4WmsSource._instance) {// singleton
            Ol4WmsSource._instance = new Ol4WmsSource(ol4Map, useLoadEvents, layertree);
        }
        return Ol4WmsSource._instance;
    }

    createLayer(layerUuid: string, options: any = null, proj: ol.ProjectionLike, visible: boolean, opacity: number): ol.layer.Image {
        let source = this.createSource(layerUuid, options['url'], options['params'], proj);
        let sourceWms = new ol.layer.Image({
            source: source,
            visible: visible,
            opacity: opacity
        });
        sourceWms.set(UUID, layerUuid);
        if (options['title']) {
            sourceWms.set(TITLE, options['title']);
        }
        if (this.layertree !== null) {
            this.layertree.add(sourceWms);
        }
        return sourceWms;
    }

    private createSource(layerUuid: string, url: string, params: any, proj: ol.ProjectionLike): ol.source.ImageWMS {
        let source = new ol.source.ImageWMS({
            url: url,
            params: params,
            projection: proj
        });
        source.set(LAYER_UUID, layerUuid);
        this.setLoadEvents(source);
        return source;
    }

    refreshSource(layer: ol.layer.Base, fromProj: ol.ProjectionLike, toProj: ol.ProjectionLike) {
        let oldsource = <ol.source.ImageWMS>(<ol.layer.Layer>layer).getSource();
        (<ol.layer.Layer>layer).setSource(this.createSource(layer.get(UUID), oldsource.getUrl(), oldsource.getParams(), toProj));
    }

    private setLoadEvents(source: ol.source.ImageWMS) {
        if (this.useLoadEvents) {
            source.on('imageloadstart', Ol4WmsSource.imageLoadStart);
            source.on('imageloadend', Ol4WmsSource.imageLoadEnd);
            source.on('imageloaderror', Ol4WmsSource.imageLoadError);
        }
    }

    static imageLoadStart(e: ol.source.ImageEvent) {
        // console.log('start', (<ol.source.ImageWMS>e.target).get(LAYER_UUID));
        if(Ol4WmsSource.mapActivity) {
            Ol4WmsSource.mapActivity.loadStart((<ol.source.ImageWMS>e.target).get(LAYER_UUID));
        }
    }

    static imageLoadEnd(e: ol.source.ImageEvent) {
        // console.log('end', (<ol.source.ImageWMS>e.target).get(LAYER_UUID));
        if(Ol4WmsSource.mapActivity) {
            Ol4WmsSource.mapActivity.loadEnd((<ol.source.ImageWMS>e.target).get(LAYER_UUID));
        }
    }

    static imageLoadError(e: ol.source.ImageEvent) {
        // console.log('error', (<ol.source.ImageWMS>e.target).get(LAYER_UUID));
        if(Ol4WmsSource.mapActivity) {
            Ol4WmsSource.mapActivity.loadError((<ol.source.ImageWMS>e.target).get(LAYER_UUID));
        }
    }
}

export class MapActivity {
    private static _instance: MapActivity;
    private layers: any = {};
    private isLoading: boolean = false;

    private constructor() {
    }

    static create(): MapActivity {
        if (!MapActivity._instance) {// singleton
            MapActivity._instance = new MapActivity();
        }
        return MapActivity._instance;
    }

    private activityStart(layerName: string) {
        this.layers[layerName] = true;
        if (this.isLoading === false) {
            this.isLoading = true;
            window['metador'].preloaderStart();
        }
    }

    private activityEnd(layerName: string) {
        if (this.layers[layerName]) {
            delete this.layers[layerName];
        }
        for(let layerN in this.layers) {
            return;
        }
        this.isLoading = false;
        window['metador'].preloaderStop();
    }

    loadStart(layerName: string) {
        this.activityStart(layerName);
    }

    loadEnd(layerName: string) {
        this.activityEnd(layerName);
    }

    loadError(layerName: string) {
        this.activityEnd(layerName);
    }
}
