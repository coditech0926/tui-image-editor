/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Tests command with command-factory
 */
import snippet from 'tui-code-snippet';
import fabric from 'fabric/dist/fabric.require';
import $ from 'jquery';
import Graphics from '../src/js/graphics';
import consts from '../src/js/consts';

const {drawingModes} = consts;
const components = consts.componentNames;

describe('Graphics', () => {
    const cssMaxWidth = 900;
    const cssMaxHeight = 700;
    let graphics, canvas;

    beforeEach(() => {
        graphics = new Graphics($('<canvas>'), {
            cssMaxWidth,
            cssMaxHeight
        });
        canvas = graphics.getCanvas();
    });

    it('has several properties', () => {
        expect(canvas).not.toBe(null);
        expect(canvas).toEqual(jasmine.any(fabric.Canvas));
        expect(graphics.cssMaxWidth).toBe(900);
        expect(graphics.cssMaxHeight).toBe(700);
        expect(graphics.canvasImage).toBe(null);
        expect(graphics.imageName).toBe('');
        expect(graphics._drawingMode).toBe(drawingModes.NORMAL);
        expect(graphics._componentMap).not.toBe(null);
    });

    it('can attach canvas events', () => {
        const onMousedown = jasmine.createSpy('onMousedown');
        const onObjectAdded = jasmine.createSpy('onObjectAdded');
        const onObjectSelected = jasmine.createSpy('onObjectSelected');

        graphics.on({
            'mousedown': onMousedown,
            'object:added': onObjectAdded
        });
        graphics.once('object:selected', onObjectSelected);

        graphics.fire('mousedown');
        graphics.fire('mousedown');
        graphics.fire('object:added');
        graphics.fire('object:added');
        graphics.fire('object:selected');
        graphics.fire('object:selected');

        expect(onMousedown.calls.count()).toBe(2);
        expect(onObjectAdded.calls.count()).toBe(2);
        expect(onObjectSelected.calls.count()).toBe(1);
    });

    it('deactivates all objects', () => {
        const triangle = new fabric.Triangle({
            width: 20,
            height: 30
        });

        canvas.add(triangle).setActiveObject(triangle);
        expect(canvas.getActiveObject()).not.toBe(null);
        graphics.deactivateAll();
        expect(canvas.getActiveObject()).toBe(null);
    });

    it('renders objects', done => {
        let beforeRender = false;
        const triangle = new fabric.Triangle({
            width: 20,
            height: 30
        });

        canvas.add(triangle);
        canvas.on('before:render', () => {
            beforeRender = true;
        });
        canvas.on('after:render', () => {
            expect(beforeRender).toBe(true);
            done();
        });
        graphics.renderAll();
    });

    it('removes a object or group by id', () => {
        const triangle = new fabric.Triangle({
            width: 20,
            height: 30
        });

        graphics.add(triangle);
        const objectId = snippet.stamp(triangle);
        graphics.removeObjectById(objectId);
        expect(graphics.getObjects().length).toBe(0);
    });

    it('switches drawing modes', () => {
        let modeName;
        for (modeName in drawingModes) {
            if (drawingModes.hasOwnProperty(modeName)) {
                graphics.startDrawingMode(modeName);
                expect(graphics.getDrawingMode()).toBe(modeName);
                graphics.stopDrawingMode();
                expect(graphics.getDrawingMode()).toBe(drawingModes.NORMAL);
            }
        }
    });

    it('can get the cropped image data', () => {
        graphics.startDrawingMode(drawingModes.CROPPER);
        spyOn(graphics.getComponent(components.CROPPER)._cropzone, 'isValid').and.returnValue(true);

        expect(graphics.getCropzoneRect()).toBeTruthy();
        expect(graphics.getCroppedImageData(graphics.getCropzoneRect())).toEqual({
            imageName: jasmine.any(String),
            url: jasmine.any(String)
        });

        graphics.stopDrawingMode();
    });

    it('can set brush setting into LINE_DRAWING, FREE_DRAWING', () => {
        graphics.startDrawingMode(drawingModes.LINE_DRAWING);
        graphics.setBrush({
            width: 12,
            color: 'FFFF00'
        });
        const brush = canvas.freeDrawingBrush;
        expect(brush.width).toBe(12);
        expect(brush.color).toBe('rgba(255,255,0,1)');
        graphics.stopDrawingMode();
    });

    it('can change a drawing shape', () => {
        const shapeComp = graphics.getComponent(components.SHAPE);
        graphics.setDrawingShape('circle', {
            fill: 'transparent',
            stroke: 'blue',
            strokeWidth: 3,
            rx: 10,
            ry: 100
        });
        expect(shapeComp._type).toBe('circle');
        expect(shapeComp._options).toEqual({
            strokeWidth: 3,
            stroke: 'blue',
            fill: 'transparent',
            width: 1,
            height: 1,
            rx: 10,
            ry: 100,
            lockSkewingX: true,
            lockSkewingY: true,
            lockUniScaling: false,
            bringForward: true,
            isRegular: false
        });
    });

    it('can register custom icon', () => {
        const iconComp = graphics.getComponent(components.ICON);
        graphics.registerPaths({
            customIcon: 'M 0 0 L 20 20 L 10 10 Z'
        });

        expect(iconComp._pathMap).toEqual(jasmine.objectContaining({
            customIcon: 'M 0 0 L 20 20 L 10 10 Z'
        }));
    });

    it('has the filter', () => {
        expect(graphics.hasFilter('Grayscale')).toBe(false);
    });
});
