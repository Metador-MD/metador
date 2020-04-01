
import {Ol4Source} from "./Ol4Source";
import * as ol from 'openlayers';
import {LAYER_UUID, Ol4Map, TITLE, UUID} from "./Ol4Map";
import {MapActivity} from "./MapActivity";

export class Ol4WmsSource implements Ol4Source {
    private static _instance: Ol4WmsSource;
    private ol4Map: Ol4Map;
    private useLoadEvents: boolean;
    public static mapActivity: MapActivity;// = MapActivity.create();
    public disabled: any;

    private constructor(ol4Map: Ol4Map, useLoadEvents: boolean = true) {
        this.ol4Map = ol4Map;
        this.useLoadEvents = useLoadEvents;
        if (this.useLoadEvents) {
            Ol4WmsSource.mapActivity = MapActivity.create();
        }
        this.disabled = {};
    }

    static create(ol4Map: Ol4Map, useLoadEvents: boolean = true): Ol4WmsSource {
        if (!Ol4WmsSource._instance) {// singleton
            Ol4WmsSource._instance = new Ol4WmsSource(ol4Map, useLoadEvents);
        }
        return Ol4WmsSource._instance;
    }

    public addDisabled(layer: ol.layer.Base) {
        this.disabled[layer.get(UUID)] = layer.get(UUID);
        this.ol4Map.getLayerTree().setDisable(layer, true);
        this.ol4Map.setVisible(layer, false);
    }

    public removeDisabled(layer: ol.layer.Base) {
        if (layer.get(UUID)){
            this.ol4Map.getLayerTree().setDisable(layer, false);
            let visible = this.ol4Map.getLayerTree().getVisible(layer);
            this.ol4Map.setVisible(layer, visible);
            delete this.disabled[layer.get(UUID)];
        }
    }

    createLayer(layerUuid: string, options: any = null, proj: ol.ProjectionLike, visible: boolean, opacity: number): ol.layer.Base {
        let source = this.createSource(layerUuid, options['url'], options['params'], proj);
        let layerWms = this._createLayer(layerUuid, visible, opacity, source, options['title'] ? options['title'] : null);
        return layerWms;
    }

    private _createLayer(layerUuid: string, visible: boolean, opacity: number, source: ol.source.ImageWMS, title: string = null) {
        let layerWms = new ol.layer.Image({
            source: source,
            visible: visible,
            opacity: opacity
        });
        layerWms.set(UUID, layerUuid);
        if (title !== null) {
            layerWms.set(TITLE, title);
        }
        return layerWms;
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

    reprojectionSource(layer: ol.layer.Base, fromProj: ol.ProjectionLike, toProj: ol.ProjectionLike) {
        let oldsource = <ol.source.ImageWMS>(<ol.layer.Layer>layer).getSource();
        let newSource = this.createSource(layer.get(UUID), oldsource.getUrl(), oldsource.getParams(), toProj);
        (<ol.layer.Layer>layer).setSource(newSource);
        this.removeDisabled(layer);
    }

    cloneLayer(layer: ol.layer.Base, fromProj: ol.ProjectionLike, toProj: ol.ProjectionLike): ol.layer.Base {
        let oldsource = <ol.source.ImageWMS>(<ol.layer.Layer>layer).getSource();
        let newSource = this.createSource(layer.get(UUID), oldsource.getUrl(), oldsource.getParams(), toProj);
        let oldLayer = (<ol.layer.Layer>layer);
        let newLayer = this._createLayer(oldLayer.get(UUID), oldLayer.getVisible(), oldLayer.getOpacity(), newSource, oldLayer.get(TITLE));
        return newLayer;
    }


    private setLoadEvents(source: ol.source.ImageWMS) {
        if (this.useLoadEvents) {
            // source.setImageLoadFunction(this.imageLoadFunction.bind(this));
            source.on('imageloadstart', this.imageLoadStart.bind(this));
            source.on('imageloadend', this.imageLoadEnd.bind(this));
            source.on('imageloaderror', this.imageLoadError.bind(this));
        }
    }

    imageLoadStart(e: ol.source.ImageEvent) {
        if (Ol4WmsSource.mapActivity) {
            Ol4WmsSource.mapActivity.loadStart((<ol.source.ImageWMS>e.target).get(LAYER_UUID));
        }
    }

    imageLoadEnd(e: ol.source.ImageEvent) {
        if (Ol4WmsSource.mapActivity) {
            Ol4WmsSource.mapActivity.loadEnd((<ol.source.ImageWMS>e.target).get(LAYER_UUID));
        }
    }

    imageLoadError(e: ol.source.ImageEvent) {
        if (Ol4WmsSource.mapActivity) {
            Ol4WmsSource.mapActivity.loadError((<ol.source.ImageWMS>e.target).get(LAYER_UUID));
        }
        let layer = this.ol4Map.findLayer((<ol.source.ImageWMS>e.target).get(LAYER_UUID));
        this.addDisabled(layer);
    }

}
