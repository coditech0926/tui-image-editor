import util from './util';
import snippet from 'tui-code-snippet';
import mainContainer from './template/mainContainer';
import controls from './template/controls';
import Range from './ui/range';

export default class Ui {
    constructor(element, options) {
        let selectedElement;

        this.options = this.initializeOption(options);

        if (element.jquery) {
            [selectedElement] = element;
        } else if (element.nodeType) {
            selectedElement = element;
        } else {
            selectedElement = document.querySelector(element);
        }

        // util.applyTemplate
        selectedElement.innerHTML = controls + mainContainer;

        this.selectedElement = selectedElement;

        this.selectedElement.classList.add(this.options.menuBarPosition);

        this._mainElement = this.selectedElement.querySelector('.main');

        this._editorElementWrap = this.selectedElement.querySelector('.tui-image-editor-wrap');
        this._editorElement = this.selectedElement.querySelector('.tui-image-editor');

        this._subMenuElement = this._mainElement.querySelector('.sub-menu');

        snippet.forEach(this.selectedElement.querySelectorAll('.tui-image-editor-range'), rangeElement => {
            const rangeObject = new Range(rangeElement);
        });

        this._btnElement = {
            crop: this.selectedElement.querySelector('#btn-crop'),
            flip: this.selectedElement.querySelector('#btn-flip'),
            rotate: this.selectedElement.querySelector('#btn-rotate'),
            shape: this.selectedElement.querySelector('#btn-shape')
        };

        this.submenu = false;
        this.imageSize = {};

        this.shape = {
            type: 'rect',
            options: {
                stroke: '#000000',
                fill: '#ffffff',
                strokeWidth: 3
            },
            _btnElement: {
                shapeSelectButton: this._subMenuElement.querySelector('#shape-button'),
                shapeColorButton: this._subMenuElement.querySelector('#shape-color-button')
            }
        };

        this.crop = {
            status: 'active',
            controlOption: {
                cornerStyle: 'circle',
                cornerSize: 14,
                cornerColor: '#fff',
                cornerStrokeColor: '#000',
                transparentCorners: false,
                lineWidth: 2
            },
            _btnElement: {
                apply: this._subMenuElement.querySelector('#crop-button .apply'),
                cancel: this._subMenuElement.querySelector('#crop-button .cancel')
            }
        };

        this.flip = {
            _btnElement: {
                flipButton: this._subMenuElement.querySelector('#flip-button')
            }
        };

        this.rotate = {
            _btnElement: {
                rotateButton: this._subMenuElement.querySelector('#retate-button'),
                rotateRange: this._subMenuElement.querySelector('#rotate-range'),
                rotateRangePointer: this._subMenuElement.querySelector('#rotate-range .tui-image-editor-virtual-range-pointer')
            }
        };

        this.colorPickerWrapElement = this._subMenuElement.querySelector('.color-picker-control');
        const colorPickerElement = this.colorPickerWrapElement.querySelector('.color-picker');

        tui.colorPicker.create({
            container: colorPickerElement,
            color: '#000000'
        });
    }

    initializeOption(options) {
        return snippet.extend({
            loadImage: {
                path: '',
                name: ''
            },
            initMenu: false,
            menuBarPosition: 'bottom'
        }, options);
    }

    getEditorArea() {
        return this._editorElement;
    }

    getLoadImage() {
        return this.options.loadImage;
    }

    changeMenu(menuName) {
        if (this.submenu) {
            this._btnElement[this.submenu].classList.remove('active');
            this._mainElement.classList.remove(this.submenu);
        }

        if (this.submenu === menuName) {
            this.submenu = '';
        } else {
            this._btnElement[menuName].classList.add('active');
            this._mainElement.classList.add(menuName);
            this.submenu = menuName;
        }
        this._subMenuElement.style.display = this.submenu ? 'table' : 'none';
        this.resizeEditor();
    }

    initCanvas() {
        this.gridVisual = document.createElement('div');
        this.gridVisual.className = 'grid-visual';
        const grid = `<table>
           <tr><td class="dot left-top"></td><td></td><td class="dot right-top"></td></tr>
           <tr><td></td><td></td><td></td></tr>
           <tr><td class="dot left-bottom"></td><td></td><td class="dot right-bottom"></td></tr>
         </table>`;
        this.gridVisual.innerHTML = grid;
        this._editorContainerElement = this._editorElement.querySelector('.tui-image-editor-canvas-container');
        this._editorContainerElement.appendChild(this.gridVisual);
    }

    resizeEditor(imageSize = this.imageSize) {
        if (imageSize !== this.imageSize) {
            this.imageSize = imageSize;
        }

        const maxHeight = parseFloat(this._editorContainerElement.style.maxHeight);
        const height = (this.imageSize.newHeight > maxHeight) ? maxHeight : this.imageSize.newHeight;
        // const height = imageSize.newHeight;

        const maxWidth = parseFloat(this._editorContainerElement.style.maxWidth);
        const width = (this.imageSize.newWidth > maxWidth) ? maxWidth : this.imageSize.newWidth;
        // const width = imageSize.newWidth;

        const editorElementStyle = this._editorElement.style;
        const {menuBarPosition} = this.options;

        editorElementStyle.height = `${height}px`;
        editorElementStyle.width = `${width}px`;

        let bottom = 0;
        let top = 0;
        let left = 0;
        let right = 0;

        if (this.submenu && menuBarPosition === 'bottom') {
            bottom += 150;
        }
        if (this.submenu && menuBarPosition === 'top') {
            top += 150;
        }

        if (this.submenu && menuBarPosition === 'left') {
            left += 248;
            right += 248;
        }
        if (this.submenu && menuBarPosition === 'right') {
            right += 248;
        }

        this._editorElementWrap.style.bottom = `${bottom}px`;
        this._editorElementWrap.style.top = `${top}px`;
        this._editorElementWrap.style.left = `${left}px`;
        this._editorElementWrap.style.width = `calc(100% - ${right}px)`;

        const {offsetWidth} = this._editorElementWrap;
        const {offsetHeight} = this._editorElementWrap;

        const editortop = (offsetHeight - height) / 2;
        const editorleft = (offsetWidth - width) / 2;

        this._editorElement.style.top = `${editortop}px`;
        this._editorElement.style.left = `${editorleft}px`;
    }
}










