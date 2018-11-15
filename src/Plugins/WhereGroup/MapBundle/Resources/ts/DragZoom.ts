import {dom} from './dom';

export class DragZoom {
    private dragzoom: ol.interaction.DragZoom;
    private olMap: ol.Map;
    private button: HTMLButtonElement;

    constructor(map: ol.Map) {
        this.olMap = map;
        this.dragzoom = new ol.interaction.DragZoom({
            condition: function () {
                return true;
            }
        });
        this.button = <HTMLButtonElement>dom.create("button", {type: "button", title: "Ausschnitt aufziehen"}, []);
        this.button.appendChild(dom.create("span", {}, ["icon-map"]));
        this.button.addEventListener('click', this.buttonClick.bind(this), false);
        this.dragzoom.on('boxend', this.deactivate.bind(this));
        const wrapper = dom.create("div", {}, ["drag-zoom", "ol-unselectable", "ol-control"]);
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
        if (!dom.hasClass(e.target, 'success')) {
            this.activate();
        } else {
            this.deactivate();
        }
    }

    private activate() {
        dom.addClass(this.button, 'success');
        this.olMap.addInteraction(this.dragzoom);
    }

    private deactivate() {
        dom.removeClass(this.button, 'success');
        this.olMap.removeInteraction(this.dragzoom);
    }
}