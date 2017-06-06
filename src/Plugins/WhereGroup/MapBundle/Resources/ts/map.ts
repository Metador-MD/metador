import Object = ol.Object;
declare class proj4 {
    static defs(name: string, def: string): void;
}

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

    public static getStyle(options: any): ol.style.Style {
        return new ol.style.Style({
            fill: new ol.style.Fill(options['fill']),
            stroke: new ol.style.Stroke(options['stroke'])//,
            // image: new ol.style.Circle({
            //     radius: 7,
            //     fill: new ol.style.Fill(options['fill'])
            // })
        });
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
export const UUID = 'uuid';
export const TITLE = 'title';

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
        for (let layer of this.olMap.getLayers().getArray()) {
            let source;
            if (layer instanceof ol.layer.Group) { // instance of ol.layer.Group
                console.error('ol.layer.Group as Layer is not suported');
                throw new Error('ol.layer.Group as Layer is not suported');
            } else if ((source = (<ol.layer.Layer>layer).getSource()) instanceof ol.source.ImageWMS) {

            }
        }
        this.hgLayer = this.addVectorLayer(Ol4Utils.getStyle(this.styles['highlight']));
    }

    static create(options: any): Ol4Map {
        if (!Ol4Map._instance) {// singleton
            Ol4Map._instance = new Ol4Map(options);
        }
        return Ol4Map._instance;
    }

    // renderTreeOption() {
    //     let ul = document.querySelector('.-js-map-layertree ul');
    //     var button = document.createElement("button");
    //     document.body.append(button);
    //     button.style.position = 'absolute';
    //     button.style.top = '10px';
    //     button.style.left = '10px';
    //     button.style.zIndex = 10000;
    //     button.onclick = copyClicked;
    // }

    getDrawer(): Ol4Drawer {
        return this.drawer;
    }

    addLayerForOptions(options: any) {
        if(options['type'] === 'WMS') {
            let wmsLayer = this.addLayer(
                Ol4WmsLayer.createLayer(options['url'],
                    options['params'],
                    this.olMap.getView().getProjection(),
                    options['visible'],
                    parseFloat(options['opacity'])),
                options['title']
            );
            addSource(wmsLayer.get('uuid'), wmsLayer.get('title'), wmsLayer.getVisible(), wmsLayer.getOpacity());
        } else {
            console.error(options['type'] + ' is not supported.');
        }
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
        if(title) {
            layer.set(TITLE, title);
        }
        this.olMap.addLayer(layer);
        return layer;
    }

    removeLayer(layer: ol.layer.Base): void {
        this.olMap.removeLayer(layer);
    }

    private findLayer(uuid: string): ol.layer.Base {
        let layers = this.olMap.getLayers().getArray();
        let llength = layers.length;
        for (let layer of layers) {
            let source: ol.source.Source;
            if (layer instanceof ol.layer.Group) { // instance of ol.layer.Group
                console.error('ol.layer.Group as Layer is not suported');
                throw new Error('ol.layer.Group as Layer is not suported');
            } else if (layer.get(UUID) === uuid) {
                return layer;
            }
        }
        return null;
    }

    updateMap(): void {
        this.olMap.updateSize();
    }

    setCrs(crs: string) {
        this.changeCrs(crs);
    }

    changeCrs(crs: string) {
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
            let llength = layers.length;
            for (let layer of layers) {
                let source: ol.source.Source;
                if (layer instanceof ol.layer.Group) { // instance of ol.layer.Group
                    console.error('ol.layer.Group as Layer is not suported');
                    throw new Error('ol.layer.Group as Layer is not suported');
                } else if ((source = (<ol.layer.Layer>layer).getSource()) instanceof ol.source.ImageWMS) {
                    (<ol.layer.Image>layer).setSource(Ol4WmsLayer.createFromSource(<ol.source.ImageWMS> source, proj));
                }
            }
            this.olMap.setView(newView);
            console.log(center);
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

    setDraw(shapeType: SHAPES = null, onDrawEnd: Function = null) {
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
        this.drawer.setInteraction(shape);
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
                    let geom = e.feature.getGeometry().transform(olMap.getView().getProjection(), 'EPSG:4326');
                    onDrawEnd(geom);
                    olMap.removeInteraction(drawer.getInteraction());
                }
            );
        } else {
            this.getDrawer().getLayer().getSource().clear();
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

    public setInteraction(type: SHAPES) {
        switch (type) {
            case SHAPES.BOX:
                this.interaction = new ol.interaction.Draw({
                    source: this.layer.getSource(),
                    type: 'Circle',
                    geometryFunction: createBox() // ol.d.ts has no function "ol.interaction.Draw.createBox()"
                });
                break;
            case SHAPES.POLYGON:
                this.interaction = new ol.interaction.Draw({
                    source: this.layer.getSource(),
                    type: 'Polygon'
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
