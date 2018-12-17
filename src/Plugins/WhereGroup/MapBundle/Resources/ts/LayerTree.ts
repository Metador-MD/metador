import {dom} from './dom';
import {Ol4Map, TITLE, UUID} from "./Ol4Map";

// import * as $ from 'jquery';

export class LayerTree {
    private static _instance: LayerTree;
    private static maxlength: number = 16;
    private static treeselector: string = '.-js-map-layertree ul.layer-tree-list';
    private static dummyselector: string = '.-js-dummy-layer';
    private static useOpacity: boolean = true;
    private static useVisible: boolean = true;
    private static useSortable: boolean = true;
    private static showStatus: boolean = true;
    private ol4Map: Ol4Map;
    private tree: HTMLElement;
    private currentLayer = null;
    private oldPosition = 0;

    private constructor(ol4Map: Ol4Map) {
        this.ol4Map = ol4Map;
        this.tree = <HTMLElement>dom.findFirst(LayerTree.treeselector);
        if (LayerTree.useSortable) {
            let dummy = dom.findFirst(LayerTree.dummyselector, this.tree);
            this.addDraggable(<HTMLElement>dummy, true);
        }
    }

    static create(ol4Map: Ol4Map): LayerTree {
        if (!LayerTree._instance) {// singleton
            LayerTree._instance = new LayerTree(ol4Map);
        }
        return LayerTree._instance;
    }

    private findLayerItem(layer: ol.layer.Base): HTMLElement {
        return <HTMLElement>dom.findFirst('#' + layer.get(UUID));
    }

    private findLayerLabel(layer: ol.layer.Base): HTMLElement {
        return <HTMLElement>dom.findFirst('#' + layer.get(UUID) + ' > label');
    }

    private findLayerVisible(layer: ol.layer.Base): HTMLFormElement {
        return <HTMLFormElement>dom.findFirst('#' + layer.get(UUID) + ' .-js-map-source-visible');
    }

    private findLayerOpacity(layer: ol.layer.Base): HTMLFormElement {
        return <HTMLFormElement>dom.findFirst('#' + layer.get(UUID) + ' .-js-map-source-opacity');
    }

    getVisible(layer: ol.layer.Base) {
        let checkbox = this.findLayerVisible(layer);
        return checkbox.checked;
    }

    setVisible(layer: ol.layer.Base, visible: boolean, action: boolean = false) {
        let checkbox = this.findLayerVisible(layer);
        if (checkbox.checked !== visible && !action) {
            checkbox.checked = visible;
        } else if (checkbox.checked !== visible && action) {
            checkbox.click();
        }
    }

    setDisable(layer: ol.layer.Base, disable: boolean) {
        let item = this.findLayerItem(layer);
        let checkboxVisible = this.findLayerVisible(layer);
        let selectOpacity = this.findLayerOpacity(layer);
        let label = this.findLayerLabel(layer);
        if (disable) {
            dom.addClass(item, 'disabled');
            checkboxVisible.setAttribute('disabled', 'true');
            selectOpacity.setAttribute('disabled', 'true');
            dom.add(label, {'title': 'Der Dienst ist nicht erreichbar!'});
            if (LayerTree.useSortable) {
                this.removeDraggable(item);
            }
        } else {
            dom.removeClass(item, 'disabled');
            checkboxVisible.removeAttribute('disabled');
            selectOpacity.removeAttribute('disabled');
            dom.add(label, {'title': layer.get(TITLE)});
            if (LayerTree.useSortable) {
                this.addDraggable(item);
            }
        }
    }

    private substringTitle(text: string) {
        if (text.length > LayerTree.maxlength) {
            text = text.substring(0, LayerTree.maxlength);
            if (text.lastIndexOf(' ') > 0) {
                text = text.substring(0, text.lastIndexOf(' '));
            }
        }
        return text;
    }

    remove(layer: ol.layer.Base) {
        let layerNode = this.findLayerItem(layer);
        if (layerNode) {
            this.removeDraggable(<HTMLElement>layerNode);
            layerNode.remove();
        }
    }

    add(layer: ol.layer.Base) {
        let layerNode = dom.create('li', {'id': layer.get(UUID)});
        if (LayerTree.useVisible) {
            this.addVisible(layerNode, layer);
        }
        layerNode.appendChild(
            dom.create('label',
                {'id': layer.get(UUID), 'for': 'chb-' + layer.get(UUID), 'title': layer.get(TITLE)},
                ['form-label'], this.substringTitle(layer.get(TITLE)))
        );
        if (LayerTree.useOpacity) {
            this.addOpacity(layerNode, layer);
        }

        this.tree.insertBefore(layerNode, dom.findFirst('li', this.tree));
        if (LayerTree.useSortable) {
            this.addDraggable(layerNode);
        }
    }

    private addVisible(layerNode: HTMLElement, layer: ol.layer.Base) {
        let input = dom.create('input', {'type': 'checkbox'},
            ['check', '-js-map-source-visible']);
        (<HTMLFormElement>input).checked = layer.getVisible();
        input.addEventListener('change', this.changeVisible.bind(this), false);
        layerNode.appendChild(input);
    }

    private changeVisible(e) {
        this.ol4Map.setVisible(e.target.parentElement.id, e.target.checked);
    }

    private addOpacity(layerNode: HTMLElement, layer: ol.layer.Base): void {
        let select = dom.create('select', {title: "Transparenz setzen"},
            ['input-element', 'medium', 'simple', 'map-source-opacity', '-js-map-source-opacity']);

        for (var i = 0; i <= 10; i++) {
            select.appendChild(dom.create('option', {'value': i / 10}, [], (i * 10) + ' %'));
        }
        (<HTMLFormElement>select).value = layer.getOpacity().toString();
        select.addEventListener('change', this.changeOpacity.bind(this), false);
        layerNode.appendChild(select);
    }

    private changeOpacity(e) {
        this.ol4Map.setOpacity(e.target.parentElement.id, parseFloat(e.target.value));
    }

    private addDraggable(layer: HTMLElement, isDummy: boolean = false) {
        dom.add(layer, {'draggable': 'true'}, ['draggable', '-js-draggable']);
        if (!isDummy) {
            layer.addEventListener('dragstart', this.dragStart.bind(this), false);
            layer.addEventListener('dragend', this.dragEnd.bind(this), false);
        }
        layer.addEventListener('dragenter', this.dragEnter.bind(this), false);
        layer.addEventListener('dragover', this.dragOver.bind(this), false);
        layer.addEventListener('drop', this.dragDrop.bind(this), false);
    }

    private removeDraggable(layer: HTMLElement, isDummy: boolean = false) {
        dom.delete(layer, ['draggable'], ['draggable', '-js-draggable']);
        if (!isDummy) {
            layer.removeEventListener('dragstart', this.dragStart.bind(this), false);
            layer.removeEventListener('dragend', this.dragEnd.bind(this), false);
        }
        layer.removeEventListener('dragenter', this.dragEnter.bind(this), false);
        layer.removeEventListener('dragover', this.dragOver.bind(this), false);
        layer.removeEventListener('drop', this.dragDrop.bind(this), false);
    }


    private dragStart(e) {
        this.currentLayer = e.target;
        this.oldPosition = this.getLayerPosition(this.currentLayer);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.currentLayer.innerHTML);
        dom.addClass(this.currentLayer, "move");
    }

    private dragOver(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        e.dataTransfer.dropEffect = 'move';
        return false;
    }

    private dragEnter(e) {
        if (this.currentLayer && e.target !== undefined && this.currentLayer !== e.target) {
            try {
                this.tree.insertBefore(
                    this.currentLayer,
                    e.target.draggable ? e.target : e.target.parentElement
                );
            } catch (e) {
            }
        }
    }

    private dragDrop(e) {
        e.stopPropagation();
        e.preventDefault();
        dom.removeClass(e.target, "over");
    }

    private dragEnd(e) {
        dom.removeClass(e.target, "move");
        this.ol4Map.moveLayer(this.currentLayer.id, this.oldPosition, this.getLayerPosition(this.currentLayer));
    }

    private getLayerPosition(layer) {
        let list = document.querySelectorAll('.-js-map-layertree ul .-js-draggable');
        for (let i = 0; i < list.length; i++) {
            if (list[i].id === layer.id) {
                return list.length - 1 - i;
            }
        }
        return null;
    }
}
