import snippet from 'tui-code-snippet';

class Range {
    constructor(rangeElement, defaultValue = 0) {
        this.value = defaultValue;
        this.rangeElement = rangeElement;
        this.drawRangeElement();
        this.rangeWidth = parseInt(window.getComputedStyle(rangeElement, null).width, 10);

        this.min = Number(rangeElement.getAttribute('min'));
        this.max = Number(rangeElement.getAttribute('max'));
        this.absMax = this.min < 0 ? (this.min * -1) + this.max : this.max;

        this.addClickEvent();
        this.addDragEvent();
        this.setValue(defaultValue);
    }

    setValue(value) {
        const absValue = value + Math.abs(this.min);
        const leftPosition = absValue * this.rangeWidth / this.absMax;
        this.pointer.style.left = `${leftPosition}px`;

        setTimeout(() => {
            this.fire('change', value);
        });
    }

    drawRangeElement() {
        this.rangeElement.classList.add('tui-image-editor-range');

        this.bar = document.createElement('div');
        this.bar.className = 'tui-image-editor-virtual-range-bar';

        this.pointer = document.createElement('div');
        this.pointer.className = 'tui-image-editor-virtual-range-pointer';

        this.bar.appendChild(this.pointer);
        this.rangeElement.appendChild(this.bar);
    }

    addClickEvent() {
        this.rangeElement.addEventListener('click', event => {
            if (event.target.className !== 'tui-image-editor-range') {
                return;
            }
            const touchPx = event.offsetX;
            const ratio = touchPx / this.rangeWidth;
            const value = (this.absMax * ratio) + this.min;
            this.pointer.style.left = `${(ratio * this.rangeWidth) - 7}px`;

            this.fire('change', value);
        });
    }

    addDragEvent() {
        this.pointer.addEventListener('mousedown', event => {
            const firstPosition = event.screenX;
            const left = parseInt(this.pointer.style.left, 10) || 0;
            const changeAngle = changeEvent => {
                const changePosition = changeEvent.screenX;
                const diffPosition = changePosition - firstPosition;
                let touchPx = left + diffPosition;
                touchPx = touchPx > this.rangeWidth ? this.rangeWidth : touchPx;
                touchPx = touchPx < 0 ? 0 : touchPx;

                this.pointer.style.left = `${touchPx - 7}px`;
                const ratio = touchPx / this.rangeWidth;
                const value = (this.absMax * ratio) + this.min;

                this.fire('change', value);
            };
            const stopChangingAngle = () => {
                document.removeEventListener('mousemove', changeAngle);
                document.removeEventListener('mouseup', stopChangingAngle);
            };

            document.addEventListener('mousemove', changeAngle);
            document.addEventListener('mouseup', stopChangingAngle);
        });
    }
}

snippet.CustomEvents.mixin(Range);
export default Range;
