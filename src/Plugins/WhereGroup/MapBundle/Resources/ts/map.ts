import Object = ol.Object;
declare class proj4 {
    static defs(name: string, def: string): void;
}

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

export class Extent extends Ol4Geom {
    public static fromArray(ordinates: number[], proj: ol.proj.Projection): Extent {
        let geom = new ol.geom.MultiPoint([[ordinates[0], ordinates[1]], [ordinates[2], ordinates[3]]]);
        return new Ol4Geom(geom, proj);
    }
}

export class Ol4Map {
    private static _instance: Ol4Map = null; // singleton
    protected olMap: ol.Map = null;
    //    protected proj: ol.proj.Projection = null;
    protected startExtent: Extent = null;  // xmin, ymin, xmax, ymax options['startExtent']
    protected maxExtent: Extent = null;
    protected drawer: Ol4Drawer;

    private constructor(options: any) { // singleton
        // init given crses
        Ol4Utils.initProj4Defs(options['proj4Defs']);
        let proj: ol.proj.Projection = ol.proj.get(options['view']['projection']);
        let resolutions = Ol4Utils.resolutionsForScales(options['view']['scales'], proj.getUnits()).reverse();
        this.startExtent = Extent.fromArray(options['view']['startExtent'], proj);
        this.maxExtent = Extent.fromArray(options['view']['maxExtent'], proj);
        this.olMap = new ol.Map({
            target: options['map']['target']
        });
        this.olMap.setView(
            new ol.View({
                projection: proj,
                resolutions: resolutions
            })
        );
        for (const source of options['source']) {
            if (source['type'] === 'WMS') {
                this.addWmsSource(source, proj);
            }
        }
        this.olMap.addControl(new ol.control.ScaleLine());

        this.olMap.addControl(new ol.control.ZoomToExtent({
            extent: this.maxExtent.getExtent(proj)
        }));
        this.olMap.getView().fit(this.startExtent.getPolygonForExtent(proj), this.olMap.getSize());
        this.setDraw(SHAPES.Box, function () {
        });
    }

    public static create(options: any): Ol4Map {
        console.log('create');
        if (!Ol4Map._instance) {// singleton
            Ol4Map._instance = new Ol4Map(options);
        }
        return Ol4Map._instance;
    }

    addWmsSource(options: any, proj: ol.proj.Projection): void {
        let sourceWms = new ol.layer.Image({
            source: new ol.source.ImageWMS({
                url: options['url'],
                params: options['params'],
                projection: proj
            }),
            visible: true
        });
        this.olMap.addLayer(sourceWms);
    }

    updateMap(): void {
        this.olMap.updateSize();
    }

    public setDraw(type: SHAPES = null, onDrawEnd: Function = null) {
        console.log('draw');
        if (!this.drawer) {
            let vlayer = new ol.layer.Vector({
                source: new ol.source.Vector({wrapX: false})
            });
            this.olMap.addLayer(vlayer);
            this.drawer = new Ol4Drawer(this.olMap, vlayer);
        }
        this.drawer.setInteraction(type);
        if (onDrawEnd && this.drawer.getInteraction()) {
            let drawer = this.drawer;
            this.drawer.getInteraction().on(
                'drawend',
                function () {
                    drawer.setInteraction(SHAPES.None);
                    onDrawEnd;
                }
            );
        }
    }

    getHgLayer() {

    }
}

export enum SHAPES {None, Box, Polygon}
;

export class Ol4Drawer {
    protected map: ol.Map;
    protected layer: ol.layer.Vector;
    protected interaction: ol.interaction.Draw;

    constructor(map: ol.Map, layer: ol.layer.Vector) {
        this.map = map;
        this.layer = layer;
    }

    public getInteraction() {
        return this.interaction;
    }

    public setInteraction(type: SHAPES) {
        this.removeInteraction();
        switch (type) {
            case SHAPES.Box:
                this.interaction = new ol.interaction.Draw({
                    source: this.layer.getSource(),
                    type: 'Circle',
                    geometryFunction: createBox() // ol.d.ts has no function "ol.interaction.Draw.createBox()"
                });
                break;
            case SHAPES.Polygon:
                this.interaction = new ol.interaction.Draw({
                    source: this.layer.getSource(),
                    type: 'Polygon'
                });
                break;
            default:
                this.interaction = null;
        }
        this.addInteraction();
    }

    private removeInteraction() {
        if (this.interaction) {
            this.map.removeInteraction(this.interaction);
        }
    }

    private addInteraction() {
        if (this.interaction) {
            this.map.addInteraction(this.interaction);
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
