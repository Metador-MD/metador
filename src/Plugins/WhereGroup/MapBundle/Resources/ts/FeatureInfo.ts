import {TITLE, UUID} from "./Ol4";
import {dom} from './dom';

export class FeatureInfo {
    private static itemTagName: string = 'span';
    private olMap: ol.Map;
    private tooltip: ol.Overlay;
    private tooltipCoord: ol.Coordinate;
    private tooltipElm: HTMLElement;
    private layer: ol.layer.Vector;
    private callbackSelect: Function;
    private callbackUnSelect: Function;
    private callbackUnSelectAll: Function;
    private select: ol.interaction.Select;

    constructor(map: ol.Map, layer: ol.layer.Vector = null) {
        this.olMap = map;
        this.layer = layer;
    }

    reset() {
        if (this.tooltipElm) {
            dom.addClass(this.tooltipElm, 'hidden');
        }
        if (this.callbackUnSelectAll) {
            this.callbackUnSelectAll();
        }
    }

    activate(tooltipElm: HTMLElement, callbackSelect: Function, callbackUnSelect: Function, callbackUnSelectAll: Function) {
        const fi = this;
        this.callbackSelect = callbackSelect;
        this.callbackUnSelect = callbackUnSelect;
        this.callbackUnSelectAll = callbackUnSelectAll;
        this.olMap.on('click', this.setTooltipPosition, this);
        this.tooltipElm = tooltipElm;
        this.tooltipElm.addEventListener('click', this.itemClick.bind(this), false);
        this.tooltip = new ol.Overlay({
            element: this.tooltipElm,
            offset: [0, -6],
            positioning: 'bottom-center'
        });
        this.olMap.addOverlay(this.tooltip);

        this.select = new ol.interaction.Select({
            multi: true,
            layers: [this.layer],
            filter: function (feature: ol.Feature) {
                return true;
            }
        });

        this.select.on('select', function (e) {
            fi.showTooltip(e.target.getFeatures().getArray());
        });
        this.select.getFeatures().clear();
        this.olMap.addInteraction(this.select);
    }

    public deactivate() {
        this.select.getFeatures().clear();
        this.olMap.removeInteraction(this.select);
        this.select = null;
        this.callbackUnSelectAll();
        this.callbackSelect = null;
        this.callbackUnSelect = null;
        this.callbackUnSelectAll = null;
        this.tooltipElm.removeEventListener('click', this.itemClick.bind(this));
        this.tooltipElm.remove();
        this.olMap.removeOverlay(this.tooltip);
        this.olMap.un('click', this.setTooltipPosition, this);
    }

    private itemClick(e: Event) {
        if ((<any>e.target).tagName === FeatureInfo.itemTagName.toUpperCase()) {
            let tag = (<HTMLElement>e.target);
            if (!dom.hasClass(tag, '-js-tooltip-item')) {
                dom.addClass(this.tooltipElm, 'hidden');
            } else {
                dom.removeClass(tag.parentElement, 'selected', 'span');
                dom.addClass(tag, 'selected');
                this.select.getFeatures().clear();
                this.unSelectDataset();
                const feature = this.layer.getSource().getFeatureById(tag.getAttribute('data-id'));
                this.select.getFeatures().push(feature);
                this.selectDataset(feature.get(UUID));
            }
        } else {
            e.stopPropagation();
        }
    }

    private setTooltipPosition(en: ol.MapBrowserEvent) {
        this.tooltipCoord = en.coordinate;
    }

    private showTooltip(features: ol.Feature[]) {
        dom.remove('.-js-tooltip-item', this.tooltipElm);
        this.unSelectDataset();
        if (features.length === 0) {
            dom.addClass(this.tooltipElm, 'hidden');
        } else if (features.length === 1) {
            dom.addClass(this.tooltipElm, 'hidden');
            this.selectDataset(features[0].get(UUID));
        } else {
            for (let feature of features) {
                if (!feature.getId()) {
                    feature.setId(feature.get(UUID));
                }
                let attrs = {
                    "title": feature.get(TITLE),
                    "data-uuid": feature.get(UUID),
                    "data-id": feature.getId()
                };
                this.tooltipElm.appendChild(
                    dom.create(FeatureInfo.itemTagName, attrs, ['-js-tooltip-item', 'selected'], feature.get(TITLE))
                );
                this.selectDataset(feature.get(UUID));
            }
            this.tooltip.setPosition(this.tooltipCoord);
            dom.removeClass(this.tooltipElm, 'hidden');
        }
    }

    private selectDataset(selector: string) {
        this.callbackSelect(selector);
    }

    private unSelectDataset(selector: string = null) {
        if (selector !== null) {
            this.callbackUnSelect(selector);
        } else {
            this.callbackUnSelectAll();
        }
    }
}