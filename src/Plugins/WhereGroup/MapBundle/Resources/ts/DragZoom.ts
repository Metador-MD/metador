import {dom} from './dom';

export class DragZoom {
    private static buttonSelector: string = '.-js-zoom-box';
    private dragzoom: ol.interaction.DragZoom;
    private olMap: ol.Map;

    constructor(map: ol.Map) {
        this.olMap = map;
        this.dragzoom = new ol.interaction.DragZoom({
            condition: function () {
                return true;
            }
        });
        dom.findFirst(DragZoom.buttonSelector).addEventListener('click', this.buttonClick.bind(this), false);
        this.dragzoom.on('boxend', this.deactivate.bind(this));
    }

    private buttonClick(e) {
        if (!dom.hasClass(e.target, 'success')) {
            this.activate();
        } else {
            this.deactivate();
        }
    }

    private activate() {
        dom.addClass(<HTMLElement>dom.findFirst(DragZoom.buttonSelector), 'success');
        this.olMap.addInteraction(this.dragzoom);
    }

    private deactivate() {
        dom.removeClass(<HTMLElement>dom.findFirst(DragZoom.buttonSelector), 'success');
        this.olMap.removeInteraction(this.dragzoom);
    }
}