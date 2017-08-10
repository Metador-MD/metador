import {UUID} from './Ol4';
import {dom} from './dom';

export class FeatureInfo {
    private static buttonSelector: string = '.-js-map-info';
    private static selectClass: string = 'select';
    private static keyId: string = 'uuid';
    private static keyTitle: string = 'title';
    private static keyAlternateTitle: string = 'alternateTitle';
    private static itemTagName: string = 'span';
    private olMap: ol.Map;
    private tooltip: ol.Overlay;
    private tooltipElm: HTMLElement;
    private layer: ol.layer.Vector;

    constructor(map: ol.Map, layer: ol.layer.Vector = null) {
        this.olMap = map;
        this.layer = layer;
        dom.findFirst(FeatureInfo.buttonSelector).addEventListener('click', this.buttonClick.bind(this), false);
    }

    private buttonClick(e) {
        if (!dom.hasClass(e.currentTarget, 'success')) {
            this.activate();
        } else {
            this.deactivate();
        }
    }

    private activate() {
        dom.addClass(<HTMLElement>dom.findFirst(FeatureInfo.buttonSelector), 'success');
        this.olMap.on('click', this.mapClick, this);
        this.tooltipElm = dom.create('div', {}, ['tooltip', 'hidden']);
        this.tooltipElm.addEventListener('click', this.itemClick.bind(this), false);
        this.tooltip = new ol.Overlay({
            element: this.tooltipElm,
            offset: [0, -6],
            positioning: 'bottom-center'
        });
        this.olMap.addOverlay(this.tooltip);
    }

    private deactivate() {
        dom.removeClass(<HTMLElement>dom.findFirst(FeatureInfo.buttonSelector), 'success');
        this.tooltipElm.removeEventListener('click', this.itemClick.bind(this));
        this.tooltipElm.remove();
        this.olMap.removeOverlay(this.tooltip);
        this.olMap.un('click', this.mapClick, this);
    }

    private itemClick(e: Event) {
        if ((<any>e.target).tagName === FeatureInfo.itemTagName.toUpperCase()) {
            this.selectDataset((<HTMLElement>e.target).getAttribute(FeatureInfo.dataAttrName(FeatureInfo.keyId)));
        } else {
            e.stopPropagation();
        }
    }

    private static dataAttrName(name: string) {
        return 'data-' + name;
    }

    private mapClick(e: ol.MapBrowserEvent) {
        this.tooltipElm.innerHTML = '';
        let lay = this.layer;
        let features: ol.Feature[] = new Array<ol.Feature>();
        this.olMap.forEachFeatureAtPixel(e.pixel, function (feature: ol.Feature) {
            features.push(feature);
        }, {
            layerFilter: function (layer) {
                return layer.get(UUID) === lay.get(UUID);
            }
        });
        if (features.length === 0) {
            dom.addClass(this.tooltipElm, 'hidden');
        } else if (features.length === 1) {
            dom.addClass(this.tooltipElm, 'hidden');
            this.selectDataset(features[0].get(FeatureInfo.keyId));
        } else {
            for (let feature of features) {
                let dataAttr = FeatureInfo.dataAttrName(FeatureInfo.keyId);
                let title = feature.get(FeatureInfo.keyTitle);
                let aTitle = feature.get(FeatureInfo.keyAlternateTitle);
                let attrs = {
                    dataAttr: feature.get(FeatureInfo.keyId),
                    title: aTitle ? title + ' / ' + aTitle : title
                };
                attrs[FeatureInfo.dataAttrName(FeatureInfo.keyId)] = feature.get(FeatureInfo.keyId);
                this.tooltipElm.appendChild(dom.create(FeatureInfo.itemTagName, attrs, [], title));
            }
            this.tooltip.setPosition(e.coordinate);
            dom.removeClass(this.tooltipElm, 'hidden');
        }
    }

    private selectDataset(selector: string) {
        console.log('set class ' + FeatureInfo.selectClass + ' for dataset' + selector);
    }

    private unSelectDataset() {
        console.log('remove class ' + FeatureInfo.selectClass + ' for all datasets');
    }
}