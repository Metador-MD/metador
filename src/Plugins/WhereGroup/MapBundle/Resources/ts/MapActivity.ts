
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
        for (let layerN in this.layers) {
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
