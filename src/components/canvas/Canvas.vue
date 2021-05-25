<template>
    <canvas id="canvas" ref="canvas"></canvas>
</template>

<script lang="ts">
import { uid } from 'uid';
import { ShapeCoords, ShapeName, ShapeElement, Stroke } from '@/Types/types';
import { Vue, Component, Prop } from 'vue-property-decorator';
import {
  State,
  namespace
} from 'vuex-class'
import { PropertiesStore } from '@/store/properties/types';
import { Tool, ToolbarStore } from '@/store/toolbar/types';

const properties = namespace('properties');
const toolbar = namespace('toolbar');

let timer: number;
@Component
export default class Canvas extends Vue {
    @Prop({default: 'SELECT'}) private selectedTool!: Tool;
    @State('properties') private properties!: PropertiesStore;
    @State('toolbar') private toolbar!: ToolbarStore;

    private canvas: HTMLCanvasElement | null = null;
    private mouseIsDown = false;
    private offsetX = 0;
    private offsetY = 0;
    private startPoint = {
        x: 0,
        y: 0
    }
    private endPoint = {
        x: 0,
        y: 0
    }

    private shapes: Shape[] = [];
    public mounted(): void {
        this.setupCanvas();
        window.addEventListener('resize', this.onResize);
        document.addEventListener("keydown", this.onKeyDown);
        this.draw();
    }

    public onKeyDown(e: KeyboardEvent) {
        e.preventDefault();
        const shiftIsPressed = e.shiftKey;
        const ctrlIsPressed = e.ctrlKey || e.metaKey;
        if(this.selectedTool === 'SELECT') {
            if(e.code.indexOf('Arrow') > -1) {
                this.nudgeSelection(e.code, {shift: shiftIsPressed, ctrl: ctrlIsPressed})
                this.draw();
            }
            if(e.code === 'Backspace' || e.code === 'Delete') {
                this.deleteSelection();
                this.draw();
            }
        }

    }
    public deleteSelection() {
        for(const shape of this.shapes) {
            if(shape.isSelected) {
                this.shapes = this.shapes.filter(x => !x.isSelected);
            }
        }
    }

    public nudgeSelection(key: string, modifier: {shift: boolean, ctrl: boolean}) {
        switch(key) {
            case 'ArrowRight':
                for(const shape of this.shapes) {
                    if(shape.isSelected) {
                        if(modifier.shift) {
                            shape.x += 20;
                        }
                        if(modifier.ctrl) {
                            shape.x += 1;
                        }
                        if(!modifier.shift && !modifier.ctrl) {
                            shape.x += 10;
                        }
                    }
                }
                break;
            case 'ArrowLeft':
                for(const shape of this.shapes) {
                    if(shape.isSelected) {
                        if(modifier.shift) {
                            shape.x -= 20;
                        }
                        if(modifier.ctrl) {
                            shape.x -= 1;
                        }
                        if(!modifier.shift && !modifier.ctrl) {
                            shape.x -= 10;
                        }
                    }
                }
                break;
             case 'ArrowUp':
                for(const shape of this.shapes) {
                    if(shape.isSelected) {
                        if(modifier.shift) {
                            shape.y -= 20;
                        }
                        if(modifier.ctrl) {
                            shape.y -= 1;
                        }
                        if(!modifier.shift && !modifier.ctrl) {
                            shape.y -= 10;
                        }
                    }
                }
                break;
            case 'ArrowDown':
                for(const shape of this.shapes) {
                    if(shape.isSelected) {
                        if(modifier.shift) {
                            shape.y += 20;
                        }
                        if(modifier.ctrl) {
                            shape.y += 1;
                        }
                        if(!modifier.shift && !modifier.ctrl) {
                            shape.y += 10;
                        }
                    }
                }
                break;
        }
        
    }
    public onResize(e: Event) {
        this.resizeCanvas();
        this.debounce(this.draw, 100);
    }

    public debounce(fn: () => any, ms: number) {
        clearTimeout(timer);
        timer = setTimeout(fn, ms);
    }

    public resizeCanvas() {
        this.canvas!.width = window.innerWidth;
        this.canvas!.height = window.innerHeight;
    }

    public setupCanvas(): void {
        this.canvas = this.$refs.canvas as HTMLCanvasElement;
        this.resizeCanvas();
        const canvasBounding = this.canvas.getBoundingClientRect();
        this.offsetX = canvasBounding.left;
        this.offsetY = canvasBounding.top;

        this.canvas.onmousemove = this.mouseMove;
        this.canvas.onmousedown = this.mouseDown;
        this.canvas.onmouseup = this.mouseUp;
        this.canvas.oncontextmenu = this.showContextMenu;
    }

    public mouseDown(e: MouseEvent) {
        e.preventDefault();
        (this.$refs.canvas as HTMLCanvasElement).focus();
        const mouseX = e.clientX - this.offsetX;
        const mouseY = e.clientY - this.offsetY;
        this.mouseIsDown = true;
        if(this.selectedTool === 'SELECT') {
            for (let shape of this.shapes) {
                if (shape.mouseIsOver(e, this.offsetX, this.offsetY)) {
                    shape.isMoving = true;
                    shape.isSelected = true;
                } else {
                    shape.isSelected = false;
                }
            }
            this.draw();
            return;
        }
        for (const shape of this.shapes) {
            shape.isSelected = false;
        }
        this.$set(this.startPoint, 'x', mouseX);
        this.$set(this.startPoint, 'y', mouseY);
    }

    public mouseUp(e: MouseEvent): void {
        e.preventDefault();
        e.stopPropagation();
        const mouseX = e.clientX - this.offsetX;
        const mouseY = e.clientY - this.offsetY;
        this.mouseIsDown = false;
        if(this.selectedTool === 'SELECT') {
            for (const shape of this.shapes) {
                shape.isMoving = false;
                if(!shape.mouseIsOver(e, this.offsetX, this.offsetY)) {
                    shape.isSelected = false;
                }
            }
            return;
        }
        this.$set(this.endPoint, 'x', mouseX);
        this.$set(this.endPoint, 'y', mouseY);
        const s = new Shape(this.selectedTool, { coords: {start: {...this.startPoint}, end: {...this.endPoint}}, fill: 'pink'});
        this.shapes = [...this.shapes, s];
        this.draw();
        this.$emit('mouse-up');
    }

    public mouseMove(e: MouseEvent): void {
        e.preventDefault();
        e.stopPropagation();

        const mouseX = e.clientX - this.offsetX;
        const mouseY = e.clientY - this.offsetY;
        const dx = e.movementX;
        const dy = e.movementY;
        if(this.selectedTool === 'SELECT' && this.mouseIsDown) {
            for (let shape of this.shapes) {
               if(shape.isMoving) {
                    shape.x += dx;
                    shape.y += dy;
               }
            }
        }
        this.draw();
        if(this.mouseIsDown && this.selectedTool === 'RECTANGLE') {
            this.drawShapeGhost({x: mouseX, y: mouseY},'RECTANGLE');
        }
    }

    public mouseIsOverElement(e: MouseEvent, shape: any): boolean {
        const mouseX = e.clientX - this.offsetX;
        const mouseY = e.clientY - this.offsetY;
        if (
            mouseX > shape.x &&
            mouseX < shape.x + shape.width &&
            mouseY > shape.y &&
            mouseY < shape.y + shape.height
            ) {
                return true;
            } else {
                return false;
            }
    }

    public drawShapeGhost(coords: {x: number, y: number}, shape: string): void {
        const context = this.canvas?.getContext('2d');
        context!.setLineDash([5, 3]);
        context!.strokeStyle = 'black';
        context!.lineWidth = 1;
        context!.fillStyle = 'rgba(255, 191, 203, 0.3)';
        context!.fillRect(this.startPoint.x, this.startPoint.y, coords.x - this.startPoint.x, coords.y - this.startPoint.y);
        context!.strokeRect(this.startPoint.x, this.startPoint.y,  coords.x - this.startPoint.x, coords.y - this.startPoint.y);
    }

    public draw(): void {
        this.clear();
        for (const shape of this.shapes) {
            shape.drawShape(this.canvas!);
        }
    }

    public clear(): void {
        const context = this.canvas?.getContext('2d');
        context!.clearRect(0, 0, this.canvas!.width, this.canvas!.height);
    }

    public showContextMenu(e: MouseEvent): void {
        e.preventDefault();
        console.log('context menu ', {clientX: e.clientX, clientY: e.clientY});
    }
}

class Shape {
    public id = '';
    public x = 0;
    public y = 0;
    public width = 0;
    public height = 0;
    public stroke: Stroke | null = null;
    public fill = '';
    public type = '';
    public _isMoving = false;
    public _isSelected = false;
    
    constructor(type: ShapeName, shapeProperties: {coords: ShapeCoords, stroke?: Stroke, fill?: string}) {
        this.id = uid(12);
        this.x = shapeProperties.coords.start.x;
        this.y = shapeProperties.coords.start.y;
        this.width = shapeProperties.coords.end.x - shapeProperties.coords.start.x;
        this.height = shapeProperties.coords.end.y - shapeProperties.coords.start.y;
        this.stroke = shapeProperties.stroke ? shapeProperties.stroke : null;
        this.fill = shapeProperties.fill ? shapeProperties.fill : '';
        this.type = type;
    }
    public mouseIsOver(e: MouseEvent, offsetX: number, offsetY: number) {
        const mouseX = e.clientX - offsetX;
        const mouseY = e.clientY - offsetY;
        if (
            mouseX > this.x &&
            mouseX < this.x + this.width &&
            mouseY > this.y &&
            mouseY < this.y + this.height
        ) {
            return true;
        } else {
            return false;
        }
    }

    public get isSelected(): boolean {
        return this._isSelected;
    }

    public set isSelected(value: boolean) {
        this._isSelected = value;
    }

    public get isMoving(): boolean {
        return this._isMoving;
    }

    public set isMoving(value: boolean) {
        this._isMoving = value;
    }

    public drawShape(canvas: HTMLCanvasElement) {
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;

        if(this.fill) {
                context.fillStyle = this.fill;
                context.fillRect(this.x, this.y, this.width, this.height);
            }
            if(this.stroke) {
                context.setLineDash([]);
                context.strokeStyle = this.stroke.style;
                context.lineWidth = this.stroke.width;
                context.strokeRect(this.x, this.y, this.width, this.height);
            }
            if(this.isSelected) {
                context.setLineDash([]);
                context.lineWidth = 1;

                context.strokeStyle = '#2ea5f4';
                context.strokeRect(this.x, this.y, this.width, this.height);

                context.fillStyle = '#ffffff';
                context.fillRect(this.x - 2.5, this.y - 2.5, 5, 5);
                context.fillRect(this.x + this.width - 2.5, this.y - 2.5, 5, 5);
                context.fillRect(this.x - 2.5, this.y + this.height - 2.5, 5, 5);
                context.fillRect(this.x + this.width - 2.5, this.y + this.height - 2.5, 5, 5);
                context.strokeStyle = '#000000';
                context.strokeRect(this.x - 2.5, this.y - 2.5, 5, 5);
                context.strokeRect(this.x + this.width - 2.5, this.y - 2.5, 5, 5);
                context.strokeRect(this.x - 2.5, this.y + this.height - 2.5, 5, 5);
                context.strokeRect(this.x + this.width - 2.5, this.y + this.height - 2.5, 5, 5);

            }
    }

}
</script>