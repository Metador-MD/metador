
import * as ol from "openlayers";
import {olx} from "openlayers";

import {LayerTree} from './LayerTree';
import {DragZoom} from './DragZoom';
import {FeatureInfo} from "./FeatureInfo";
import {Ol4Extent} from "./Ol4Extent";
import {Ol4Drawer, SHAPES} from "./Ol4Drawer";
import {Ol4WmsSource} from "./Ol4WmsSource";
import {Ol4VectorSource} from "./Ol4VectorSource";
import {Ol4Utils} from "./Ol4Utils";
import {Ol4Geom} from "./Ol4Geom";

export const UUID: string = 'uuid';
export const LAYER_UUID: string = 'layeruuid';
export const TITLE: string = 'title';
export const METADOR_EPSG: ol.ProjectionLike = 'EPSG:4326';
export const LAYER_VECTOR = 'vector';
export const LAYER_IMAGE = 'image';

export class Ol4Map {
    private static _uuid = 0;
    private static _instance: Ol4Map = null; // singleton
    private olMap: ol.Map = null;
    private scales: number[];
    private startExtent: Ol4Extent = null;  // xmin, ymin, xmax, ymax options['startExtent']
    private maxExtent: Ol4Extent = null;
    private drawer: Ol4Drawer;
    private wmsSource: Ol4WmsSource;
    private vecSource: Ol4VectorSource;
    private layertree: LayerTree;
    private styles: {[key: string]: any};
    private hgLayer: ol.layer.Vector;
    private dragzoom: DragZoom;
    private featureInfo: FeatureInfo;

    private static getUuid(prefix: string = ''): string {
        return prefix + (++Ol4Map._uuid);
    }

    private constructor(options: any) { // singleton
        ol['ENABLE_RASTER_REPROJECTION'] = false;
        Ol4Utils.initProj4Defs(options['proj4Defs']);
        this.layertree = LayerTree.create(this);
        this.wmsSource = Ol4WmsSource.create(this, true);
        this.vecSource = Ol4VectorSource.create(this);
        (<HTMLFormElement>document.querySelector('.-js-crs-code')).value = options['view']['projection'];
        let proj: ol.proj.Projection = ol.proj.get(options['view']['projection']);
        this.styles = options['styles'];
        this.scales = options['view']['scales'];
        this.startExtent = Ol4Extent.fromArray(options['view']['startExtent'], proj);
        this.maxExtent = Ol4Extent.fromArray(options['view']['maxExtent'], proj);
        let interactions = ol.interaction.defaults(
            {
                altShiftDragRotate: false,
                pinchRotate: false
            }
        );
        let controls = ol.control.defaults({attribution: false});//.extend([attribution])
        this.olMap = new ol.Map({
            interactions: interactions,
            target: options['map']['target'],
            renderer: 'canvas',
            controls: controls
        });
        this.olMap.setView(
            this.createView(
                proj,
                this.maxExtent.getExtent(proj),
                Ol4Utils.resolutionsForScales(this.scales, proj.getUnits()).reverse()
            )
        );
        /* make a group layer for all image layers (WMS etc.)*/
        let imageGroup = new ol.layer.Group({
            layers: new ol.Collection<ol.layer.Base>()
        });
        imageGroup.set(UUID, LAYER_IMAGE)
        this.olMap.addLayer(imageGroup);
        /* make a group layer for all vector layers (Hightlight, Search results etc.)*/
        let vectorGroup = new ol.layer.Group({
            layers: new ol.Collection<ol.layer.Base>()
        });
        vectorGroup.set(UUID, LAYER_VECTOR)
        this.olMap.addLayer(vectorGroup);

        for (let sourceOptions of options['source']) {
            if (sourceOptions['type'] === 'WMS') {
                let wmsLayer = this.addLayer(
                    this.wmsSource.createLayer(
                        Ol4Map.getUuid('olay-'),
                        sourceOptions,
                        this.olMap.getView().getProjection(),
                        sourceOptions['visible'],
                        parseFloat(sourceOptions['opacity'])
                    ), true
                );
            } else {
                console.error(sourceOptions['type'] + ' is not supported.');
            }
        }
        this.olMap.addControl(new ol.control.ScaleLine());
        // // zoom to max extent
        // icon.className = "icon-earth";
        // this.olMap.addControl(new ol.control.ZoomToExtent({
        //     extent: this.maxExtent.getExtent(proj),
        //     label: icon,
        //     tipLabel: "Zoom auf gesamte Ausdehnung"
        // }));
        // zoom to start extent
        let icon = document.createElement('span');
        icon = document.createElement('span');
        icon.className = "icon-home";
        this.olMap.addControl(new ol.control.ZoomToExtent({
            extent: this.startExtent.getExtent(proj),
            label: icon,
            tipLabel: "Zoom auf die Start-Ausdehnung"
        }));
        this.olMap.addInteraction(new ol.interaction.DragZoom());
        const control: any = options['map']['control'];
        if (control && control.mousePosition) {
            const posOptions = control.mousePosition;
            const mousePosOptions: any = {
                coordinateFormat: (coordinates) => {
                    return coordinates[0].toFixed(posOptions.fractionDigit) + ', ' + coordinates[1].toFixed(posOptions.fractionDigit);
                }
            };
            this.olMap.addControl(new ol.control.MousePosition(mousePosOptions));
        }
        let mapsize = this.olMap.getSize();
        if (mapsize[0] !== 0 && mapsize[1]) {
            this.zoomToExtent(this.startExtent.getPolygonForExtent(proj));
        }
        let hgl = this.vecSource.createLayer(
            Ol4Map.getUuid('olay-'),
            {'style': Ol4Utils.getStyle(this.styles['highlight'])},
            this.olMap.getView().getProjection()
        );
        this.hgLayer = <ol.layer.Vector>this.addLayer(hgl);

        let vLayer = <ol.layer.Vector>this.addLayer(
            this.vecSource.createLayer(
                Ol4Map.getUuid('olay-'),
                {'style': Ol4Utils.getStyle(this.styles['search'])},
                this.olMap.getView().getProjection()
            )
        );
        vLayer.setMap(this.olMap);
        this.drawer = new Ol4Drawer(vLayer);
        this.dragzoom = new DragZoom(this.olMap);
        this.featureInfo = new FeatureInfo(this.olMap, this.hgLayer);
    }

    activateFeatureInfo(): void {
        this.featureInfo.activate();
    }

    deactivateFeatureInfo(): void {
        this.featureInfo.deactivate();
    }

    resetFeatureInfo() {
        this.featureInfo.reset();
    }

    selectFeatures(uuids: string[]) {
        this.featureInfo.selectFeatures(uuids);
    }

    getLayerTree(): LayerTree {
        return this.layertree;
    }

    private addIntoLayerTree(layer: ol.layer.Base) {
        if (this.layertree) {
            this.layertree.add(layer);
        }
    }

    private createView(proj: ol.proj.Projection, extent: ol.Extent, resolutions: number[]) {
        return new ol.View({
            projection: proj,
            resolutions: resolutions,
            extent: extent
        });
    }

    zoomToExtent(geometry: ol.geom.SimpleGeometry | ol.Extent) {
        this.olMap.getView().fit(geometry, <olx.view.FitOptions>this.olMap.getSize());
    }

    static create(options: any): Ol4Map {
        if (!Ol4Map._instance) {// singleton
            Ol4Map._instance = new Ol4Map(options);
        }
        return Ol4Map._instance;
    }

    getProjection(): ol.proj.Projection {
        return this.olMap.getView().getProjection();
    }

    getDrawer(): Ol4Drawer {
        return this.drawer;
    }

    getHgLayer(): ol.layer.Vector {
        return this.hgLayer;
    }

    /**
     * Adds a layer into a map.
     * @param options
     */
    addLayerForOptions(options: any) {
        if (options['type'] === 'WMS') {
            let wmsLayer = this.addLayer(
                this.wmsSource.createLayer(
                    Ol4Map.getUuid('olay-'),
                    options,
                    this.olMap.getView().getProjection(),
                    options['visible'],
                    parseFloat(options['opacity'])
                ),
                true
            );
        } else {
            console.error(options['type'] + ' is not supported.');
        }
    }

    addLayer(layer: ol.layer.Base, addToLayertree: boolean = false): ol.layer.Base {
        if (layer instanceof ol.layer.Image) {
            let group: ol.layer.Group = <ol.layer.Group>this.findLayer(LAYER_IMAGE);
            group.getLayers().insertAt(group.getLayers().getLength(), layer);
        } else if (layer instanceof ol.layer.Vector) {
            let group: ol.layer.Group = <ol.layer.Group>this.findLayer(LAYER_VECTOR);
            group.getLayers().insertAt(group.getLayers().getLength(), layer);
        } else {
            return null;
        }
        if (addToLayertree) {
            this.addIntoLayerTree(layer);
        }
        return layer;
    }

    removeLayer(layer: ol.layer.Base): void {
        this.olMap.removeLayer(layer);
    }

    moveLayer(uuid: string, oldPos: number, newPos: number): void {
        let layer: ol.layer.Base = this.findLayer(uuid);
        if (layer instanceof ol.layer.Image) {
            let group: ol.layer.Group = <ol.layer.Group>this.findLayer(LAYER_IMAGE);
            let layerll = group.getLayers().remove(layer);
            group.getLayers().insertAt(newPos, layerll);
        }
    }

    findLayer(uuid: string): ol.layer.Base {
        let layers = this.olMap.getLayers().getArray();
        for (let layer of layers) {
            let source: ol.source.Source;
            if (layer.get(UUID) === uuid) {
                return layer;
            } else if (layer instanceof ol.layer.Group) {
                let sublayers = (<ol.layer.Group>layer).getLayers().getArray();
                for (let sublayer of sublayers) {
                    if (sublayer.get(UUID) === uuid) {
                        return sublayer;
                    }
                }
            }
        }
        return null;
    }

    updateMap(): void {
        this.olMap.updateSize();
        this.zoomToExtent(this.startExtent.getPolygonForExtent(this.olMap.getView().getProjection()));
    }

    changeCrs(crs: string) { // TODO
        let toProj = null;
        if ((toProj = ol.proj.get(crs))) {
            let extent = Ol4Extent.fromArray(
                this.olMap.getView().calculateExtent(this.olMap.getSize()),
                this.getProjection()
            );
            let fromProj = this.getProjection();
            // let center = this.olMap.getView().getCenter();
            // let layers = (<ol.layer.Group>this.findLayer(LAYER_IMAGE)).getLayers().getArray();
            this.olMap.setView(
                this.createView(
                    toProj,
                    this.maxExtent.getExtent(toProj),
                    Ol4Utils.resolutionsForScales(this.scales, toProj.getUnits()).reverse()
                )
            );
            this.changeForILayersI((<ol.layer.Group>this.findLayer(LAYER_IMAGE)).getLayers(), fromProj, toProj);
            this.changeForVLayers((<ol.layer.Group>this.findLayer(LAYER_VECTOR)).getLayers(), fromProj, toProj);
            this.zoomToExtent(extent.getPolygonForExtent(toProj));
        }
    }

    private changeForVLayers(layers: ol.Collection<ol.layer.Base>, fromProj, toProj) {
        for (let layer of layers.getArray()) {
            this.vecSource.reprojectionSource(layer, fromProj, toProj);
        }
    }

    private changeForILayersI(layers: ol.Collection<ol.layer.Base>, fromProj, toProj) {
        for (let layer of layers.getArray()) {
            this.wmsSource.reprojectionSource(<ol.layer.Image>layer, fromProj, toProj);
            let source = <ol.source.ImageWMS>(<ol.layer.Image>layer).getSource();
            let ilf: ol.ImageLoadFunctionType = source.getImageLoadFunction();
            source.setImageLoadFunction(ilf);
        }
    }

    setVisible(layer: ol.layer.Base | string, visiblity: boolean): void {
        let _layer: ol.layer.Base = layer instanceof ol.layer.Base ? layer : this.findLayer(<string>layer);
        if (_layer) {
            _layer.setVisible(visiblity);
        }
    }

    setOpacity(layer: ol.layer.Base | string, opacity: number): void {
        let _layer: ol.layer.Base = layer instanceof ol.layer.Base ? layer : this.findLayer(<string>layer);
        if (_layer) {
            _layer.setOpacity(opacity);
        }
    }

    clearFeatures() {
        this.vecSource.clearFeatures(this.hgLayer);
    }

    showFeatures(geoJson: Object) {
        this.vecSource.showFeatures(this.hgLayer, geoJson);
    }

    getFirstGeomForSearch(): object {
        let features = this.drawer.getLayer().getSource().getFeatures();
        if (features.length === 0) {
            return null;
        }
        let geojson = new ol.format.GeoJSON().writeFeatureObject(
            features[0],
            {
                'dataProjection': METADOR_EPSG,
                'featureProjection': this.getProjection()
            }
        );
        geojson['bbox'] = new Ol4Geom(features[0].getGeometry(), this.getProjection())
            .getExtent(ol.proj.get(METADOR_EPSG));
        return geojson;
    }

    drawGeometryForSearch(geoJson: Object, onDrawEnd: (geojson: any) => void) {
        let ol4map = this;
        let olMap = this.olMap;
        this.vecSource.clearFeatures(this.drawer.getLayer());
        this.vecSource.showFeatures(this.drawer.getLayer(), geoJson);
        let multiPoint: ol.geom.MultiPoint = <ol.geom.MultiPoint>Ol4Extent.fromArray(
            this.drawer.getLayer().getSource().getExtent(),
            this.olMap.getView().getProjection()
        ).getGeom();
        let maxextent = this.maxExtent.getPolygonForExtent(this.olMap.getView().getProjection());
        if (maxextent.intersectsCoordinate(multiPoint.getPoint(0).getCoordinates())
            || maxextent.intersectsCoordinate(multiPoint.getPoint(1).getCoordinates())) {
            this.zoomToExtent(this.drawer.getLayer().getSource().getExtent());
        } else {
            metador.displayError('Die Geometrie ist au??erhalb der r??umlichen Erstreckung.');
        }
        let geoFeature = this.getFirstGeomForSearch();
        if (onDrawEnd !== null && geoFeature) {
            onDrawEnd(geoFeature);
        }
    }

    drawShapeForSearch(shapeType: SHAPES = null, onDrawEnd: (geojson: any) => void) {
        this.setDoubleClickZoom(false);
        let ol4map = this;
        let olMap = this.olMap;
        const shape: SHAPES = typeof shapeType === 'string' ? SHAPES[<string>shapeType] : shapeType;
        if (this.drawer.getInteraction()) {
            this.olMap.removeInteraction(this.drawer.getInteraction());
        }
        this.drawer.setInteraction(shape, Ol4Utils.getStyle(this.styles['search']));
        if (this.drawer.getInteraction()) {
            let drawer = this.drawer;
            this.getDrawer().getLayer().getSource().clear();
            this.olMap.addInteraction(this.drawer.getInteraction());
            this.drawer.getInteraction().on(
                'drawstart',
                function (e) {
                    ol4map.getDrawer().getLayer().getSource().clear();
                }
            );
            this.drawer.getInteraction().on(
                'drawend',
                function (e: any) { // TODO replace any with real class name
                    let geojson = new ol.format.GeoJSON().writeFeatureObject(
                        e.feature,
                        {
                            'dataProjection': METADOR_EPSG,
                            'featureProjection': ol4map.getProjection()
                        }
                    );
                    geojson['bbox'] = new Ol4Geom(e.feature.getGeometry(), ol4map.getProjection())
                        .getExtent(ol.proj.get(METADOR_EPSG));
                    onDrawEnd(geojson);
                    olMap.removeInteraction(drawer.getInteraction());
                }
            );
        } else {
            this.getDrawer().getLayer().getSource().clear();
            onDrawEnd(null);
            this.setDoubleClickZoom(true);
        }
    }

    /**
     * Activates / deactivates interaction ol.interaction.DoubleClickZoom
     * @param {boolean} state
     */
    private setDoubleClickZoom(state: boolean) {
        for (let interaction of this.olMap.getInteractions().getArray()) {
            if (interaction instanceof ol.interaction.DoubleClickZoom) {
                interaction.setActive(state);
                break;
            }
        }
    }
}


declare var metador: any;
