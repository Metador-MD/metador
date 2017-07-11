import Object = ol.Object;

declare class proj4 {
    static defs(name: string, def: string): void;
}

let winContext: any = window;
declare function addSource(id: string, title: string, visibility: boolean, opacity: number): void;

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
    protected styles: Object;
    protected hgLayer: ol.layer.Vector;
    protected dragzoom: ol.interaction.DragZoom;

    private static getUuid(prefix: string = ''): string {
        return prefix + (++Ol4Map._uuid);
    }

    private constructor(options: any) { // singleton
        // init given crses
        // ol['ENABLE_RASTER_REPROJECTION'] = false;
        Ol4Utils.initProj4Defs(options['proj4Defs']);
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


        for (let source of options['source']) {
            this.addLayerForOptions(source);
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
        this.olMap.getView().fit(this.startExtent.getPolygonForExtent(proj), this.olMap.getSize());
        this.hgLayer = this.addVectorLayer(Ol4Utils.getStyle(this.styles['highlight']));
    }

    static create(options: any): Ol4Map {
        if (!Ol4Map._instance) {// singleton
            Ol4Map._instance = new Ol4Map(options);
        }
        return Ol4Map._instance;
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
                Ol4WmsLayer.createLayer(options['url'],
                    options['params'],
                    this.olMap.getView().getProjection(),
                    options['visible'],
                    parseFloat(options['opacity'])),
                options['title']
            );
        } else {
            console.error(options['type'] + ' is not supported.');
        }
    }

    initLayertree() {
        let layers = this.olMap.getLayers().getArray();
        let llength = layers.length;
        for (let layer of layers) {
            let source: ol.source.Source;
            if (layer instanceof ol.layer.Group) { // instance of ol.layer.Group
                let sublayers = (<ol.layer.Group>layer).getLayers().getArray();
                for (let slayer of sublayers) {
                    if (slayer instanceof ol.layer.Image) { // add only image layer (WMS etc.)
                        addSource(slayer.get('uuid'), slayer.get('title'), slayer.getVisible(), slayer.getOpacity());
                    }
                }
            } else if (layer instanceof ol.layer.Image) { // add only image layer (WMS etc.)
                addSource(layer.get('uuid'), layer.get('title'), layer.getVisible(), layer.getOpacity());
            }
        }
    }

    showFeatures(vLayer: ol.layer.Vector, geoJson: Object) {
        let geoJsonReader: ol.format.GeoJSON = new ol.format.GeoJSON();
        let features = geoJsonReader.readFeatures(
            geoJson,
            {
                'dataProjection': geoJsonReader.readProjection(geoJson),
                'featureProjection': this.olMap.getView().getProjection()
            });
        vLayer.getSource().addFeatures(features);
    }

    clearFeatures(vLayer: ol.layer.Vector) {
        vLayer.getSource().clear(true);
    }

    addVectorLayer(style: ol.style.Style): ol.layer.Vector {
        let options = {
            wrapX: false
        };
        let vLayer = new ol.layer.Vector({
            source: new ol.source.Vector(options),
            style: style
        });
        return <ol.layer.Vector>this.addLayer(vLayer);
    }

    addLayer(layer: ol.layer.Base, title: string = null): ol.layer.Base {
        layer.set(UUID, Ol4Map.getUuid('olay-'));
        if (title) {
            layer.set(TITLE, title);
        }
        if (layer instanceof ol.layer.Image) {
            let group: ol.layer.Group = <ol.layer.Group> this.findLayer(LAYER_IMAGE);
            group.getLayers().insertAt(group.getLayers().getLength(), layer);
        } else if (layer instanceof ol.layer.Vector) {
            let group: ol.layer.Group = <ol.layer.Group> this.findLayer(LAYER_VECTOR);
            group.getLayers().insertAt(group.getLayers().getLength(), layer);
        }
        return layer;
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
        let proj = null;
        if ((proj = ol.proj.get(crs))) {
            let extent = Ol4Extent.fromArray(
                this.olMap.getView().calculateExtent(this.olMap.getSize()),
                this.olMap.getView().getProjection()
            );
            let projection = this.olMap.getView().getProjection();
            let center = this.olMap.getView().getCenter();
            let newView = new ol.View({
                projection: proj,
                resolutions: Ol4Utils.resolutionsForScales(this.scales, proj.getUnits()).reverse(),
                extent: this.maxExtent.getExtent(proj)
            });
            let layers = this.olMap.getLayers().getArray();
            // let llength = layers.length;
            for (let layer of layers) {
                let source: ol.source.Source;
                if (layer instanceof ol.layer.Group) { // instance of ol.layer.Group
                    console.error('ol.layer.Group as Layer is not suported');
                    throw new Error('ol.layer.Group as Layer is not suported');
                } else if ((source = (<ol.layer.Layer>layer).getSource()) instanceof ol.source.ImageWMS) {
                    (<ol.layer.Image>layer).setSource(Ol4WmsLayer.createFromSource(<ol.source.ImageWMS> source, proj));
                } else if ((source = (<ol.layer.Layer>layer).getSource()) instanceof ol.source.Vector) {
                    let features: ol.Feature[] = (<ol.source.Vector>source).getFeatures();
                    for (let feature of features) {
                        feature.setGeometry(feature.getGeometry().transform(projection, proj));
                    }
                }
            }
            this.olMap.setView(newView);
            this.olMap.getView().fit(extent.getPolygonForExtent(proj), this.olMap.getSize());
            // let cpoint = <ol.geom.Point> new ol.geom.Point(center).transform(projection, proj);
            // console.log(cpoint.getCoordinates());
            // this.olMap.getView().setCenter(cpoint.getCoordinates());
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
        if (!this.drawer) {
            let vLayer = this.addVectorLayer(Ol4Utils.getStyle(this.styles['search']));
            vLayer.setMap(this.olMap);
            this.drawer = new Ol4Drawer(vLayer);
        }
        this.clearFeatures(this.drawer.getLayer());
        this.showFeatures(this.drawer.getLayer(), geoJson);
        onDrawEnd(geoJson);
    }

    drawShapeForSearch(shapeType: SHAPES = null, onDrawEnd: Function = null) {
        let ol4map = this;
        let olMap = this.olMap;
        if (!this.drawer) {
            let vLayer = this.addVectorLayer(Ol4Utils.getStyle(this.styles['search']));
            vLayer.setMap(this.olMap);
            this.drawer = new Ol4Drawer(vLayer);
        }
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
                            'featureProjection': olMap.getView().getProjection()
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

export class Ol4WmsLayer {
    static createLayer(url: string, params: any, proj: ol.ProjectionLike, visible: boolean, opacity: number): ol.layer.Image {
        let sourceWms = new ol.layer.Image({
            source: Ol4WmsLayer.createSource(url, params, proj),
            visible: visible,
            opacity: opacity
        });
        return sourceWms;
    }

    static createSource(url: string, params: any, proj: ol.ProjectionLike): ol.source.ImageWMS {
        return new ol.source.ImageWMS({
            url: url,
            params: params,
            projection: proj
        });
    }

    static createFromSource(source: ol.source.ImageWMS, proj: ol.ProjectionLike) {
        return new ol.source.ImageWMS({
            url: source.getUrl(),
            params: source.getParams(),
            projection: proj
        });
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
