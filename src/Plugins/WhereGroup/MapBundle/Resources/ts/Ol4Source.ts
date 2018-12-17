
import * as ol from 'openlayers';

export abstract class Ol4Source {

    abstract createLayer(layerUuid: string, options: any, proj: ol.ProjectionLike, visible: boolean, opacity: number): ol.layer.Base;

    abstract reprojectionSource(layer: ol.layer.Base, fromProj: ol.ProjectionLike, toProj: ol.ProjectionLike);

    abstract cloneLayer(layer: ol.layer.Base, fromProj: ol.ProjectionLike, toProj: ol.ProjectionLike): ol.layer.Base;
}
