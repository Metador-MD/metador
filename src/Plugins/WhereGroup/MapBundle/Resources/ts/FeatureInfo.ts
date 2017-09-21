import {UUID} from './Ol4';
import {dom} from './dom';

export class FeatureInfo {
    private static keyId: string = 'uuid';
    private static keyTitle: string = 'title';
    private static itemTagName: string = 'span';
    private olMap: ol.Map;
    private tooltip: ol.Overlay;
    private tooltipElm: HTMLElement;
    private layer: ol.layer.Vector;
    private callbackSelect: Function;
    private callbackUnSelect: Function;
    private callbackUnSelectAll: Function;

    constructor(map: ol.Map, layer: ol.layer.Vector = null) {
        this.olMap = map;
        this.layer = layer;
    }

    public activate(callbackSelect: Function, callbackUnSelect: Function, callbackUnSelectAll: Function) {
        this.callbackSelect = callbackSelect;
        this.callbackUnSelect = callbackUnSelect;
        this.callbackUnSelectAll = callbackUnSelectAll;
        this.olMap.on('click', this.mapClick, this);
        this.tooltipElm = dom.create('div', {}, ['tooltip', 'hidden']);
        this.tooltipElm.setAttribute('style', 'padding-right:20px;');
        this.tooltipElm.addEventListener('click', this.itemClick.bind(this), false);
        this.tooltip = new ol.Overlay({
            element: this.tooltipElm,
            offset: [0, -6],
            positioning: 'bottom-center'
        });
        this.olMap.addOverlay(this.tooltip);
    }

    public deactivate() {
        this.callbackUnSelectAll();
        this.callbackSelect = null;
        this.callbackUnSelect = null;
        this.callbackUnSelectAll = null;
        this.tooltipElm.removeEventListener('click', this.itemClick.bind(this));
        this.tooltipElm.remove();
        this.olMap.removeOverlay(this.tooltip);
        this.olMap.un('click', this.mapClick, this);
    }

    private itemClick(e: Event) {
        if ((<any>e.target).tagName === FeatureInfo.itemTagName.toUpperCase()) {
            let tag = (<HTMLElement>e.target);
            if (dom.hasClass(tag, 'icon-plus-circle')) {
                dom.addClass(this.tooltipElm, 'hidden');
            } else {
                this.selectDataset(tag.getAttribute(FeatureInfo.dataAttrName(FeatureInfo.keyId)));
            }
        } else {
            e.stopPropagation();
        }
    }

    private static dataAttrName(name: string) {
        return 'data-' + name;
    }

    private mapClick(e: ol.MapBrowserEvent) {
        this.tooltipElm.innerHTML = '<span class="icon-plus-circle" style="position:absolute;right:2px;top:2px;"></span>';
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
            this.callbackUnSelectAll();
            dom.addClass(this.tooltipElm, 'hidden');
        } else if (features.length === 1) {
            dom.addClass(this.tooltipElm, 'hidden');
            this.selectDataset(features[0].get(FeatureInfo.keyId));
        } else {
            for (let feature of features) {
                let title = feature.get(FeatureInfo.keyTitle);
                let attrs = {
                    dataAttr: feature.get(FeatureInfo.keyId),
                    title: title
                };
                attrs[FeatureInfo.dataAttrName(FeatureInfo.keyId)] = feature.get(FeatureInfo.keyId);
                this.tooltipElm.appendChild(dom.create(FeatureInfo.itemTagName, attrs, [], title));
            }
            this.tooltip.setPosition(e.coordinate);
            dom.removeClass(this.tooltipElm, 'hidden');
        }
    }

    private selectDataset(selector: string) {
        this.callbackUnSelectAll();
        this.callbackSelect(selector);
    }

    private unSelectDataset(selector: string) {
        this.callbackUnSelect(selector);
    }
}