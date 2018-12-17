

import * as ol from "openlayers";
import {Ol4Geom} from "./Ol4Geom";


export class Ol4Extent extends Ol4Geom {
    public static fromArray(ordinates: number[], proj: ol.proj.Projection): Ol4Extent {
        let geom = new ol.geom.MultiPoint([[ordinates[0], ordinates[1]], [ordinates[2], ordinates[3]]]);
        return new Ol4Extent(geom, proj);
    }
}
