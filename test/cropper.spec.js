/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Test cases of "src/js/component/cropper.js"
 */
import Cropper from '../src/js/component/cropper';
import Main from '../src/js/component/main';

describe('Cropper', () => {
    let cropper, main, canvas;

    beforeEach(() => {
        canvas = new fabric.Canvas($('<canvas>')[0]);
        main = new Main();
        main.canvas = canvas;
        cropper = new Cropper(main);
    });

    describe('start()', () => {
        it('should create a cropzone', () => {
            cropper.start();

            expect(cropper._cropzone).toBeDefined();
        });

        it('should add a cropzone to canvas', () => {
            spyOn(canvas, 'add');
            cropper.start();

            expect(canvas.add).toHaveBeenCalledWith(cropper._cropzone);
        });

        it('should no action if a croppzone has been defined', () => {
            cropper._cropzone = {};
            spyOn(canvas, 'add');
            cropper.start();

            expect(canvas.add).not.toHaveBeenCalled();
        });

        it('should set "evented" of all objects to false', () => {
            const objects = [
                new fabric.Object({evented: true}),
                new fabric.Object({evented: true}),
                new fabric.Object({evented: true})
            ];
            canvas.add(objects[0], objects[1], objects[2]);

            cropper.start();
            expect(objects[0].evented).toBe(false);
            expect(objects[1].evented).toBe(false);
            expect(objects[2].evented).toBe(false);
        });
    });

    describe('"onFabricMouseDown()"', () => {
        let fEvent;
        beforeEach(() => {
            fEvent = {
                e: {}
            };
            spyOn(canvas, 'getPointer').and.returnValue({
                x: 10,
                y: 20
            });
        });

        it('should set "selection" to false', () => {
            cropper._onFabricMouseDown(fEvent);
            expect(canvas.selection).toBe(false);
        });

        it('should set "startX, startY"', () => {
            // canvas.getPointer will return object{x: 10, y: 20}
            cropper._onFabricMouseDown(fEvent);
            expect(cropper._startX).toEqual(10);
            expect(cropper._startY).toEqual(20);
        });
    });

    describe('"onFabricMouseMove()', () => {
        beforeEach(() => {
            spyOn(canvas, 'getPointer').and.returnValue({
                x: 10,
                y: 20
            });
            spyOn(canvas, 'getWidth').and.returnValue(100);
            spyOn(canvas, 'getHeight').and.returnValue(200);
        });

        it('should re-render(remove->set->add) cropzone ' +
            'if the mouse moving is over the threshold(=10)', () => {
            cropper._startX = 0;
            cropper._startY = 0;

            cropper.start();
            spyOn(cropper._cropzone, 'remove');
            spyOn(cropper._cropzone, 'set');
            spyOn(canvas, 'add');
            cropper._onFabricMouseMove({e: {}});

            expect(cropper._cropzone.remove).toHaveBeenCalled();
            expect(cropper._cropzone.set).toHaveBeenCalled();
            expect(canvas.add).toHaveBeenCalled();
        });

        it('should not re-render cropzone ' +
            'if the mouse moving is under the threshold', () => {
            cropper._startX = 14;
            cropper._startY = 18;

            cropper.start();
            spyOn(cropper._cropzone, 'remove');
            spyOn(cropper._cropzone, 'set');
            spyOn(canvas, 'add');
            cropper._onFabricMouseMove({e: {}});

            expect(cropper._cropzone.remove).not.toHaveBeenCalled();
            expect(cropper._cropzone.set).not.toHaveBeenCalled();
            expect(canvas.add).not.toHaveBeenCalled();
        });
    });

    describe('_calcRectDimensionFromPoint()', () => {
        beforeEach(() => {
            cropper._startX = 10;
            cropper._startY = 20;
            tui.util.extend(canvas, {
                getWidth() {
                    return 100;
                },
                getHeight() {
                    return 200;
                }
            });
        });

        it('should return cropzone-left&top (min: 0, max: startX,Y)', () => {
            const x = 20,
                y = -1,
                expected = {
                    left: 10,
                    top: 0,
                    width: jasmine.any(Number),
                    height: jasmine.any(Number)
                },
                actual = cropper._calcRectDimensionFromPoint(x, y);

            expect(actual).toEqual(expected);
        });

        it('should calculate and return cropzone-width&height', () => {
            let x, y, expected, actual;

            x = 30;
            y = 40;
            expected = {
                left: 10,
                top: 20,
                width: 20,
                height: 20
            };
            actual = cropper._calcRectDimensionFromPoint(x, y);
            expect(actual).toEqual(expected);

            x = 300;
            y = 400;
            expected = {
                left: 10,
                top: 20,
                width: 90,
                height: 180
            };
            actual = cropper._calcRectDimensionFromPoint(x, y);
            expect(actual).toEqual(expected);
        });


        it('should create cropzone that has fixed ratio during shift key is pressed.', () => {
            const x = 100;
            const y = 200;
            const expected = {
                left: 10,
                top: 20,
                width: 180,
                height: 180
            };

            cropper._withShiftKey = true;

            const actual = cropper._calcRectDimensionFromPoint(x, y);

            expect(actual).toEqual(expected);
        });

        it('should create cropzone that inverted current mouse position during shift key is pressed.', () => {
            const x = -10;
            const y = -20;
            const expected = {
                left: -10,
                top: 0,
                width: 20,
                height: 20
            };

            cropper._withShiftKey = true;

            const actual = cropper._calcRectDimensionFromPoint(x, y);

            expect(actual).toEqual(expected);
        });
    });

    it('"onFabricMouseUp()" should activate cropzone', () => {
        canvas.setActiveObject = jasmine.createSpy();
        cropper.start();
        cropper._onFabricMouseUp();

        expect(canvas.setActiveObject).toHaveBeenCalledWith(cropper._cropzone);
    });

    describe('"end()"', () => {
        it('should set cropzone of cropper to null', () => {
            cropper.start();
            cropper.end();

            expect(cropper._cropzone).toBe(null);
        });

        it('should return cropzone data if the cropzone is valid and not canceled', () => {
            cropper.start();
            spyOn(cropper._cropzone, 'isValid').and.returnValue(true);

            expect(cropper.end(true)).toEqual({
                imageName: jasmine.any(String),
                url: jasmine.any(String)
            });
        });

        it('should not post command if cropzone is invalid or crop is canceled', () => {
            cropper.start();
            spyOn(cropper._cropzone, 'isValid').and.returnValue(true);
            expect(cropper.end(false)).toBeFalsy();

            cropper.start();
            spyOn(cropper._cropzone, 'isValid').and.returnValue(false);
            expect(cropper.end(false)).toBeFalsy();
        });

        it('should set "evented" of all obejcts to true', () => {
            const objects = [
                new fabric.Object({evented: false}),
                new fabric.Object({evented: false}),
                new fabric.Object({evented: false})
            ];
            canvas.add(objects[0], objects[1], objects[2]);

            cropper.start();
            cropper.end();
            expect(objects[0].evented).toBe(true);
            expect(objects[1].evented).toBe(true);
            expect(objects[2].evented).toBe(true);
        });
    });
});
