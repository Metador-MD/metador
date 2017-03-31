<<<<<<< 4f7f91fa668e0dc8f27e5432ed9ea11c0dc6df7a
class Ol4MapI {
    protected olMap: any;
    constructor(options: any){
        // @TODO
=======
/// <reference path="../../../../../typings/ol.d.ts"/> // for only NetBeans

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
        this.olMap.getView().fit(this.startExtent.getPolygonForExtent(proj), this.olMap.getSize());
    }

    public static create(options: any): Ol4Map {
        if (!Ol4Map._instance) {// singleton
            Ol4Map._instance = new Ol4Map(options);
        }
        return Ol4Map._instance;
    }

    getMap(): ol.Map {
        return this.olMap;
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
>>>>>>> deactivate map.js, add browserify, add map.ts
    }
}
