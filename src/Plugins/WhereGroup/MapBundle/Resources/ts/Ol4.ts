import * as openlayers4 from 'openlayers';
// import * as jquery from 'jquery';
import {LayerTree} from './LayerTree';
import {Ol4Source, Ol4VectorSource, Ol4WmsSource} from "./Ol4Source"

declare class proj4 {
    static defs(name: string, def: string): void;
}


// declare function addSource(id: string, title: string, visibility: boolean, opacity: number): void;

export class Ol4Utils {
    /* 
     * units: 'degrees'|'ft'|'m'|'us-ft'
     */
    public static resolutionScaleFactor(units: string): number {
        let dpi = 25.4 / 0.28;
        let mpu = ol.proj.METERS_PER_UNIT[units];
        let inchesPerMeter = 39.37;
        return mpu * inchesPerMeter * dpi;
    }

    public static resolutionForScale(scale: number, factor: number): number {
        return scale / factor;
    }

    public static resolutionsForScales(scales: number[], units: string): number[] {
        let resolutions = [];
        let factor = Ol4Utils.resolutionScaleFactor(units);
        for (let i = 0; i < scales.length; i++) {
            resolutions.push(Ol4Utils.resolutionForScale(scales[i], factor));
        }
        return resolutions;
    }

    public static scaleForResolution(resolution: number, factor: number): number {
        return resolution * factor;
    }

    public static scalesForResolutions(resolutions: number[], units: string): number[] {
        let scales = [];
        let factor = Ol4Utils.resolutionScaleFactor(units);
        for (let i: number = 0; i < resolutions.length; i++) {
            scales.push(Ol4Utils.scaleForResolution(resolutions[i], factor));
        }
        return scales;
    }

    public static initProj4Defs(proj4Defs: any): void {
        for (const name in proj4Defs) {
            proj4.defs(name, proj4Defs[name]);
            let pr = ol.proj.get(name);
        }
    }

    public static getProj(projCode: string): ol.proj.Projection {
        return ol.proj.get(projCode);
    }

    public static getStyle(options: any, style: ol.style.Style = null): ol.style.Style {
        let style_ = style ? style : new ol.style.Style();
        style_.setFill(new ol.style.Fill(options['fill']));
        style_.setStroke(new ol.style.Stroke(options['stroke']));
        if (options['image'] && options['image']['circle']) {
            style_.setImage(new ol.style.Circle({
                    radius: options['image']['circle']['radius'],
                    fill: new ol.style.Fill({
                        color: options['image']['circle']['fill']['color']
                    })
                }
            ));
        }
        return style_;
        //
        // return new ol.style_.Style({
        //     fill: new ol.style_.Fill(options['fill']),
        //     stroke: new ol.style_.Stroke(options['stroke'])//,
        //     // image: new ol.style_.Circle({
        //     //     radius: 7,
        //     //     fill: new ol.style_.Fill(options['fill'])
        //     // })
        // });
    }

// fill
// {
//     color: rgba(255, 255, 255, 0.2)
// }
// stroke
// {
//     color: '#ffcc33',
//     width: 2
//     dash:
// }
// image
}

export class Ol4Geom {
    protected geom: ol.geom.Geometry = null;
    protected proj: ol.proj.Projection = null;

    constructor(geom: ol.geom.Geometry, proj: ol.proj.Projection) {
        this.geom = geom;
        this.proj = proj;
    }

    getGeom(): ol.geom.Geometry {
        return this.geom;
    }

    getProj(): ol.proj.Projection {
        return this.proj;
    }

    getExtent(proj: ol.proj.Projection): ol.Extent {
        if (this.proj !== proj) {
            return (<ol.geom.Geometry>(<any> this.geom).clone()).transform(this.proj, proj).getExtent();
        } else {
            return (<ol.geom.Geometry>(<any> this.geom).clone()).getExtent();
        }
    }

    public getPolygonForExtent(proj: ol.proj.Projection) {
        return ol.geom.Polygon.fromExtent(this.getExtent(proj));
    }
}

export class Ol4Extent extends Ol4Geom {
    public static fromArray(ordinates: number[], proj: ol.proj.Projection): Ol4Extent {
        let geom = new ol.geom.MultiPoint([[ordinates[0], ordinates[1]], [ordinates[2], ordinates[3]]]);
        return new Ol4Extent(geom, proj);
    }
}

export const UUID: string = 'uuid';
export const LAYER_UUID: string = 'layeruuid';
export const TITLE: string = 'title';
export const METADOR_EPSG: ol.ProjectionLike = 'EPSG:4326';
export const LAYER_VECTOR = 'vector';
export const LAYER_IMAGE = 'image';

export class Ol4Map {
    private static _uuid = 0;
    private static _instance: Ol4Map = null; // singleton
    protected olMap: ol.Map = null;
    protected scales: number[];
    //    protected proj: ol.proj.Projection = null;
    protected startExtent: Ol4Extent = null;  // xmin, ymin, xmax, ymax options['startExtent']
    protected maxExtent: Ol4Extent = null;
    protected drawer: Ol4Drawer;
    protected wmsSource: Ol4WmsSource;
    protected vecSource: Ol4VectorSource;
    private layertree: LayerTree;
    protected styles: Object;
    protected hgLayer: ol.layer.Vector;
    protected dragzoom: ol.interaction.DragZoom;

    private static getUuid(prefix: string = ''): string {
        return prefix + (++Ol4Map._uuid);
    }

    private constructor(options: any) { // singleton
        // ol['ENABLE_RASTER_REPROJECTION'] = false;
        Ol4Utils.initProj4Defs(options['proj4Defs']);
        this.layertree = LayerTree.create(this);
        this.wmsSource = Ol4WmsSource.create(this, true, this.layertree);
        this.vecSource = Ol4VectorSource.create(this);
        (<HTMLFormElement>document.querySelector('.-js-crs-code')).value = options['view']['projection'];
        let proj: ol.proj.Projection = ol.proj.get(options['view']['projection']);
        this.styles = options['styles'];
        this.scales = options['view']['scales'];
        this.startExtent = Ol4Extent.fromArray(options['view']['startExtent'], proj);
        this.maxExtent = Ol4Extent.fromArray(options['view']['maxExtent'], proj);
        this.olMap = new ol.Map({
            target: options['map']['target'],
            renderer: 'canvas'
        });
        this.olMap.setView(
            new ol.View({
                projection: proj,
                resolutions: Ol4Utils.resolutionsForScales(this.scales, proj.getUnits()).reverse(),
                extent: this.maxExtent.getExtent(proj)
            })
        );
        /* make a group layer for all image layers (WMS etc.)*/
        let imageGroup = new ol.layer.Group(
            {
                layers: new ol.Collection<ol.layer.Base>()
            }
        );
        imageGroup.set(UUID, LAYER_IMAGE)
        this.olMap.addLayer(imageGroup);
        /* make a group layer for all vector layers (Hightlight, Search results etc.)*/
        let vectorGroup = new ol.layer.Group(
            {
                layers: new ol.Collection<ol.layer.Base>()
            }
        );
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
                    )
                );
            } else {
                console.error(sourceOptions['type'] + ' is not supported.');
            }
        }
        this.olMap.addControl(new ol.control.ScaleLine());

        this.olMap.addControl(new ol.control.ZoomToExtent({
            extent: this.maxExtent.getExtent(proj)
        }));
        this.olMap.addInteraction(new ol.interaction.DragZoom());
        this.olMap.addControl(new ol.control.MousePosition(
            // {
            //     coordinateFormat: function (coordinates) {
            //         var coord_x = coordinates[0].toFixed(3);
            //         var coord_y = coordinates[1].toFixed(3);
            //         return coord_x + ', ' + coord_y;
            //     }
            // }
        ));
        this.zoomToExtent(this.startExtent.getPolygonForExtent(proj));
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

    addLayerForOptions(options: any) {
        if (options['type'] === 'WMS') {
            let wmsLayer = this.addLayer(
                this.wmsSource.createLayer(
                    Ol4Map.getUuid('olay-'),
                    options,
                    this.olMap.getView().getProjection(),
                    options['visible'],
                    parseFloat(options['opacity'])
                )
            );
        } else {
            console.error(options['type'] + ' is not supported.');
        }
    }

    addLayer(layer: ol.layer.Base): ol.layer.Base {
        if (layer instanceof ol.layer.Image) {
            let group: ol.layer.Group = <ol.layer.Group> this.findLayer(LAYER_IMAGE);
            group.getLayers().insertAt(group.getLayers().getLength(), layer);
            return layer;
        } else if (layer instanceof ol.layer.Vector) {
            let group: ol.layer.Group = <ol.layer.Group> this.findLayer(LAYER_VECTOR);
            group.getLayers().insertAt(group.getLayers().getLength(), layer);
            return layer;
        }
        return null;
    }

    removeLayer(layer: ol.layer.Base): void {
        this.olMap.removeLayer(layer);
    }

    moveLayer(uuid: string, oldPos: number, newPos: number): void {
        let layer: ol.layer.Base = this.findLayer(uuid);
        if (layer instanceof ol.layer.Image) {
            let group: ol.layer.Group = <ol.layer.Group> this.findLayer(LAYER_IMAGE);
            let layerll = group.getLayers().remove(layer);
            group.getLayers().insertAt(newPos, layerll);
        }
    }

    private findLayer(uuid: string): ol.layer.Base {
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
    }

    changeCrs(crs: string) { // TODO
        let toProj = null;
        if ((toProj = ol.proj.get(crs))) {
            let extent = Ol4Extent.fromArray(
                this.olMap.getView().calculateExtent(this.olMap.getSize()),
                this.getProjection()
            );
            let fromProj = this.getProjection();
            let center = this.olMap.getView().getCenter();
            let newView = new ol.View({
                projection: toProj,
                resolutions: Ol4Utils.resolutionsForScales(this.scales, toProj.getUnits()).reverse(),
                extent: this.maxExtent.getExtent(toProj)
            });
            let layers = (<ol.layer.Group>this.findLayer(LAYER_IMAGE)).getLayers().getArray();
            this.changeCrsList((<ol.layer.Group>this.findLayer(LAYER_IMAGE)).getLayers(), fromProj, toProj);
            this.changeCrsList((<ol.layer.Group>this.findLayer(LAYER_VECTOR)).getLayers(), fromProj, toProj);

            this.olMap.setView(newView);
            this.zoomToExtent(extent.getPolygonForExtent(toProj));
        }
    }

    private changeCrsList(layers: ol.Collection<ol.layer.Base>, fromProj, toProj) {
        for (let layer of layers.getArray()) {
            let source: ol.source.Source;
            if ((source = (<ol.layer.Layer>layer).getSource()) instanceof ol.source.ImageWMS) {
                this.wmsSource.refreshSource(<ol.layer.Image>layer, fromProj, toProj);
            } else if ((source = (<ol.layer.Layer>layer).getSource()) instanceof ol.source.Vector) {
                let features: ol.Feature[] = (<ol.source.Vector>source).getFeatures();
                for (let feature of features) {
                    feature.setGeometry(feature.getGeometry().transform(fromProj, toProj));
                }
            }
        }
    }

    setVisible(layerUiid: string, visiblity: boolean): void {
        let layer: ol.layer.Base = this.findLayer(layerUiid);
        if (layer) {
            layer.setVisible(visiblity);
        }
    }

    setOpacity(layerUiid: string, opacity: number): void {
        let layer: ol.layer.Base = this.findLayer(layerUiid);
        if (layer) {
            layer.setOpacity(opacity);
        }
    }

    dragZoom(activate: boolean, onZoomEnd: Function = null) {
        if (!this.dragzoom) {
            this.dragzoom = new ol.interaction.DragZoom({
                condition: function () {
                    return true;
                }
            });
            let dragzoom = this.dragzoom;
            let map = this.olMap;
            this.dragzoom.on('boxend',
                function (event: ol.interaction.Draw.Event) {
                    map.removeInteraction(dragzoom);
                    if (onZoomEnd) {
                        onZoomEnd();
                    }
                });
        }
        if (activate) {
            this.olMap.addInteraction(this.dragzoom);
        } else {
            this.olMap.removeInteraction(this.dragzoom);
        }
    }

    drawGeometryForSearch(geoJson: Object, onDrawEnd: Function = null) {
        let ol4map = this;
        let olMap = this.olMap;
        this.vecSource.clearFeatures(this.drawer.getLayer());
        this.vecSource.showFeatures(this.drawer.getLayer(), geoJson);
        if (onDrawEnd !== null) {
            onDrawEnd(geoJson);
        }
        this.zoomToExtent(this.drawer.getLayer().getSource().getExtent());
    }

    drawShapeForSearch(shapeType: SHAPES = null, onDrawEnd: Function = null) {
        let ol4map = this;
        let olMap = this.olMap;
        const shape: SHAPES = typeof shapeType === 'string' ? SHAPES[<string> shapeType] : shapeType;
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
                function (e) {
                    let geojson = new ol.format.GeoJSON().writeFeatureObject(
                        e.feature,
                        {
                            'dataProjection': METADOR_EPSG,
                            'featureProjection': ol4map.getProjection()
                        }
                    );
                    onDrawEnd(geojson);
                    olMap.removeInteraction(drawer.getInteraction());
                }
            );
        } else {
            this.getDrawer().getLayer().getSource().clear();
            onDrawEnd(null);
        }
    }
}

export enum SHAPES {NONE, BOX, POLYGON}
;

export class Ol4Drawer {
    // private static _instance: Ol4Drawer;
    protected layer: ol.layer.Vector;
    protected interaction: ol.interaction.Draw;

    constructor(layer: ol.layer.Vector) {
        this.layer = layer;
    }

    public getLayer(): ol.layer.Vector {
        return this.layer;
    }

    public getInteraction() {
        return this.interaction;
    }

    public setInteraction(type: SHAPES, drawStyle: ol.style.Style) {
        switch (type) {
            case SHAPES.BOX:
                this.interaction = new ol.interaction.Draw({
                    source: this.layer.getSource(),
                    type: 'Circle',
                    style: drawStyle,
                    geometryFunction: createBox() // ol.d.ts has no function "ol.interaction.Draw.createBox()"
                });
                break;
            case SHAPES.POLYGON:
                this.interaction = new ol.interaction.Draw({
                    source: this.layer.getSource(),
                    type: 'Polygon',
                    style: drawStyle
                });
                break;
            default:
                this.interaction = null;
        }
    }
}

/**
 * ol.d.ts has no function "ol.interaction.Draw.createBox()"
 * @returns {(coordinates:any, opt_geometry:any)=>any|ol.geom.Polygon}
 */
export function createBox() {
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
        }
    );
};


export class UiUtils {

}

export class GeomLoader {
    private map: Ol4Map;
    private form: HTMLFormElement;

    public constructor(map: Ol4Map, form: HTMLFormElement) {
        this.map = map;
        this.form = form;
        this.on();
    }

    public on() {
        this.form.addEventListener('change', this.upload.bind(this), false);
    }

    private upload(e: Event) {
        // console.log(e);
        // HttpUtils.Http.sendForm(this.form, this.form.action, HttpUtils.HTTP_METHOD.POST, HttpUtils.HTTP_DATATYPE.json)
        //     .then(function (value) {
        //         console.log('Contents: ' + value);
        //     })
        //     .catch(function (reason) {
        //         console.error(reason);
        //     });
    }
}