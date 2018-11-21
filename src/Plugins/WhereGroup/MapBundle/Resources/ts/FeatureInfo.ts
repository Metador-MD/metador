import {TITLE, UUID} from "./Ol4";
import {dom} from './dom';

export class FeatureInfo {
    private static itemTagName: string = 'span';
    private olMap: ol.Map;
    private tooltip: ol.Overlay;
    private tooltipCoord: ol.Coordinate;
    private tooltipElm: HTMLElement;
    private layer: ol.layer.Vector;
    // private callbackSelect: Function;
    // private callbackUnSelect: Function;
    private select: ol.interaction.Select;
    private button: HTMLButtonElement;

    constructor(map: ol.Map, layer: ol.layer.Vector = null) {
        this.olMap = map;
        this.layer = layer;
        this.initSelect();
        this.button = <HTMLButtonElement>dom.create("button", {type: "button", title: "FeatureInfo aktivieren"}, ["icon-info-circle"]);
        this.button.addEventListener('click', this.buttonClick.bind(this), false);
        const wrapper = dom.create("div", {}, ["feature-info", "ol-unselectable", "ol-control"]);
        wrapper.appendChild(this.button);
        this.olMap.addControl(
            new ol.control.Control(
                {
                    element: wrapper
                }
            )
        );
    }

    private buttonClick(e) {
        // console.log(e);
        if (!dom.hasClass(e.target, 'success')) {
            dom.addClass(e.target,"success");
            // console.log("fi activated");
            this.activate();
        } else {
            dom.removeClass(e.target,"success");
            // console.log("fi deactivated");
            this.deactivate();
        }
    }

    private initSelect() {
        const fi = this;
        let timestamp: number = 0;
        this.select = new ol.interaction.Select({
            multi: true,
            layers: [this.layer],
            filter: function (feature: ol.Feature) {
                timestamp = Date.now() + 5;
                setTimeout(function () {
                    if (Date.now() >= timestamp) {
                        if (fi.tooltipElm) {
                            fi.showTooltip();
                        }
                    }
                }, 5);
                return true;
            }
        });
        this.select.on('select', function (e) {
            if (e.target.getFeatures().getLength() === 0) {
                if (fi.tooltipElm) {
                    fi.showTooltip();
                }
            }
        });
    }

    reset() {
        if (this.select) {
            this.select.getFeatures().clear();
        }
        if (this.tooltipElm) {
            dom.addClass(this.tooltipElm, 'hidden');
        }
        search.clearMetadataMarks();
    }

    selectFeatures(uuids: string[]) {
        const fi = this;
        if (this.layer && this.select) {
            this.reset();
            this.layer.getSource().forEachFeature(
                function (feature: ol.Feature) {
                    for (const uuid of uuids) {
                        if (feature.get(UUID) === uuid) {
                            fi.select.getFeatures().push(feature);
                        }
                    }
                }
            )
            if (this.tooltipElm) {
                this.showTooltip();
            }
        }
    }

    activate() {//tooltipElm: HTMLElement, callbackSelect: Function, callbackUnSelect: Function, callbackUnSelectAll: Function) {
        // this.callbackSelect = callbackSelect;
        // this.callbackUnSelect = callbackUnSelect;
        this.olMap.on('click', this.setTooltipPosition, this);
        this.tooltipElm = dom.create("div", {}, ["tooltip", "hidden"]);
        this.tooltipElm.appendChild(dom.create("span", {}, ["icon-cross"]));
        this.tooltipElm.addEventListener('click', this.itemClick.bind(this), false);
        this.tooltip = new ol.Overlay({
            element: this.tooltipElm,
            offset: [0, -6],
            positioning: 'bottom-center'
        });
        this.olMap.addOverlay(this.tooltip);

        this.select.getFeatures().clear();
        this.olMap.addInteraction(this.select);
    }

    deactivate() {
        this.select.getFeatures().clear();
        this.olMap.removeInteraction(this.select);
        // this.select = null;
        search.clearMetadataMarks();
        this.tooltipElm.removeEventListener('click', this.itemClick.bind(this));
        this.tooltipElm.remove();
        this.olMap.removeOverlay(this.tooltip);
        this.olMap.un('click', this.setTooltipPosition, this);
    }

    private itemClick(e: Event) {
        if ((<any>e.target).tagName === FeatureInfo.itemTagName.toUpperCase()) {
            let tag = (<HTMLElement>e.target);
            if (!dom.hasClass(tag, '-js-tooltip-item')) {
                this.select.getFeatures().clear();
                this.unSelectDataset();
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

    private hideTooltip() {
        if (this.tooltipElm) {
            dom.addClass(this.tooltipElm, 'hidden');
        }
    }

    private showTooltip() {
        const features: ol.Feature[] = this.select.getFeatures().getArray();
        dom.remove('.-js-tooltip-item', this.tooltipElm);
        this.unSelectDataset();
        if (features.length === 0) {
            this.hideTooltip();
        } else if (features.length === 1) {
            this.hideTooltip();
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
            dom.removeClass(this.tooltipElm, 'hidden');
            this.tooltip.setPosition(this.tooltipCoord);
        }
    }

    private selectDataset(selector: string) {
        if (search.markMetadata) {
            search.markMetadata(selector);
        }
    }

    private unSelectDataset(selector: string = null) {
        if (selector !== null && search.unmarkMetadata) {
            search.unmarkMetadata(selector);
        } else if (selector === null && search.clearMetadataMarks) {
            search.clearMetadataMarks();
        }
    }
}

declare var search: any;