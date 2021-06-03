<template>
    <canvas id="canvas" ref="canvas" tabindex="-1"></canvas>
</template>

<script lang="ts">
import { Dictionary, Shadow, ShapeName} from '@/Types/types';
import { Shape } from './shape';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import {
  State,
  namespace
} from 'vuex-class'
import { Color } from '@/store/properties/types';
import { Tool, ToolbarStore } from '@/store/toolbar/types';
import { degreesToRadians, getMouseLocal } from '@/helpers/geometry';

const properties = namespace('properties');
const toolbar = namespace('toolbar');

let timer: number;
@Component
export default class Canvas extends Vue {
    @Prop() saveCanvas!: boolean;
    @State('toolbar') private toolbar!: ToolbarStore;
    @toolbar.Getter('getActiveTool') getActiveTool!: Tool;

    @properties.Getter('getId') public getShapeId!: string;
    @properties.Getter('getCanvas') public getCanvas!: string;
    @properties.Getter('getX') public getX!: number;
    @properties.Getter('getY') public getY!: number;
    @properties.Getter('getWidth') public getWidth!: number;
    @properties.Getter('getHeight') public getHeight!: number;
    @properties.Getter('getShadow') public getShadow!: Shadow;
    @properties.Getter('getShapeProperties') public getShapeProperties!: any;
    @properties.Getter('getSaveCanvas') public getSaveCanvas!: boolean;
    @properties.Getter('getRotation') public getRotation!: number;
    @properties.Getter('getRadius') public getRadius!: number[] | null;


    private canvas: HTMLCanvasElement | null = null;
    private ctx: CanvasRenderingContext2D | null = null;
    private redrawCanvas = false;
    private mouseIsDown = false;
    private mouseIsDragging = false;
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
    private selectedShapes: string[] = [];
    private shapes: Dictionary<Shape> = {};
    private copyShapes: string[] = [];

    @Watch('getRotation')
    private rotationChanged(rotation: number) {
        if(this.getShapeId) {
            this.shapes[this.getShapeId].rotation = rotation;
            this.draw();
        }
    }

    @Watch('getRadius')
    private radiusChanged(radius:  number[] | null) {
        if(this.getShapeId) {
            if(!this.shapes[this.getShapeId].radius) {
                this.shapes[this.getShapeId].radius = [];
            }
            if(radius) {
                const newRadius = radius;
                this.shapes[this.getShapeId].radius[0] = newRadius.NW;
                this.shapes[this.getShapeId].radius[1] = newRadius.NE;
                this.shapes[this.getShapeId].radius[2] = newRadius.SE;
                this.shapes[this.getShapeId].radius[3] = newRadius.SW;
            } else {
                this.shapes[this.getShapeId].radius = null;
            }
        }
        this.draw();
    }

    @Watch('getActiveTool')
    private activeToolChanged() {
        this.$store.commit('properties/resetProperties');
    }

    @Watch('getShapeProperties')
    private onShapePropertiesChange(newShapeProperties: any) {
        if(newShapeProperties.id) {
            this.shapes[newShapeProperties.id].x = newShapeProperties.x;
            this.shapes[newShapeProperties.id].y = newShapeProperties.y;
            this.shapes[newShapeProperties.id].width = newShapeProperties.width;
            this.shapes[newShapeProperties.id].height = newShapeProperties.height;
            this.shapes[newShapeProperties.id].fill = newShapeProperties.fill;
            this.shapes[newShapeProperties.id].stroke = newShapeProperties.stroke;
            this.draw();
        }
    }

    @Watch('getShadow')
    private shadowUpdated(newShadowColor: Shadow) {
        if(this.getShapeProperties.id) {
            this.shapes[this.getShapeProperties.id].shadow = {...newShadowColor};
            this.draw();
        }
    }

    @Watch('getSaveCanvas')
    private onSaveCanvas(shouldSaveCanvas: boolean) {
        console.log('here')
        if(shouldSaveCanvas) {
            const link = document.createElement('a');
            link.download = 'myCreation.png';
            link.href = this.canvas!.toDataURL('image/png')
            link.click();
            link.remove;
            this.$store.commit('properties/saveCanvas');
        }
    }

    @Watch('getCanvas')
    private canvasChangedColorOrOpacity(newCanvas: Color) {
        this.draw();
    }

    private mounted(): void {
        this.setupCanvas();
    }

    private setupCanvas(): void {
        window.addEventListener('resize', this.onResize);
        this.canvas = this.$refs.canvas as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d');
        this.setCanvasSize();
        const canvasBounding = this.canvas.getBoundingClientRect();
        this.offsetX = canvasBounding.left;
        this.offsetY = canvasBounding.top;

        this.canvas.addEventListener("mousedown", this.mouseDown);
        this.canvas.addEventListener("mouseup", this.mouseUp);
        this.canvas.addEventListener("mousemove", this.mouseMove);
        this.canvas.addEventListener("keydown", this.onKeyDown);
        this.canvas.addEventListener("keyup", this.onKeyUp);
        this.canvas.addEventListener("contextmenu", this.showContextMenu);
    }

    private mouseDown(e: MouseEvent) {
        e.preventDefault();
        (this.$refs.canvas as HTMLCanvasElement).focus();
        const mouseX = e.clientX - this.offsetX;
        const mouseY = e.clientY - this.offsetY;
        this.mouseIsDown = true;
        this.$set(this.startPoint, 'x', mouseX);
        this.$set(this.startPoint, 'y', mouseY);
        if(this.getActiveTool === 'SELECT') {
            this.selectedShapes = [];
            this.$store.commit('properties/resetProperties');
            for (const id in this.shapes) {
                const shape = this.shapes[id];
                if (shape.mouseIsOver(e, this.offsetX, this.offsetY)) {
                    shape.isSelected = true;
                    if(this.selectedShapes.indexOf(shape.id) === -1) {
                        this.selectedShapes = [shape.id];
                    }
                    const shapeProps = {
                        id: shape.id, 
                        x: shape.x, 
                        y: shape.y,
                        width: shape.width,
                        height: shape.height,
                        fill: shape.fill, 
                        stroke: shape.stroke,
                        shadowColor: shape.shadow?.color,
                        shadowBlur: shape.shadow?.blur,
                        shadowX: shape.shadow?.x,
                        shadowY: shape.shadow?.y,
                        rotation: shape.rotation,
                        radius: shape.radius,
                    };
                    this.$store.dispatch('properties/setCurrentShape', shapeProps);
                } 
                else {
                    shape.isSelected = false;
                }
            }
            this.draw();
            return;
        }
        for (const id in this.shapes) {
            const shape = this.shapes[id];
            shape.isSelected = false;
            this.selectedShapes = this.selectedShapes.filter(x => x !== shape.id);
        }
    }

    private mouseUp(e: MouseEvent): void {
        e.preventDefault();
        e.stopPropagation();
        const mouseX = e.clientX - this.offsetX;
        const mouseY = e.clientY - this.offsetY;
        this.mouseIsDown = false;
        this.$set(this.endPoint, 'x', mouseX);
        this.$set(this.endPoint, 'y', mouseY);
        if(['RECTANGLE', 'CIRCLE', 'LINE'].includes(this.getActiveTool)) {
            const fill = this.getShapeProperties.fill;
            const stroke = this.getShapeProperties.stroke;
            console.log(stroke);
            // @ts-ignore
            const s = new Shape(this.getActiveTool, { coords: {start: {...this.startPoint}, end: {x: mouseX, y: mouseY}}, fill: fill, stroke });
            this.$set(this.shapes, s.id, s);
            this.draw();
        }
        this.resetActiveTool();
    }

    private resetActiveTool(): void {
        if(this.getActiveTool !== 'PAN') {
            this.$store.commit('toolbar/setActiveTool', 'SELECT');
        }
    }

    private mouseMove(e: MouseEvent): void {
        e.preventDefault();
        e.stopPropagation();
        const mouseX = e.clientX - this.offsetX;
        const mouseY = e.clientY - this.offsetY;
        const dx = e.movementX;
        const dy = e.movementY;
        if(!this.mouseDown) {
            return;
        }
        if(this.mouseIsDown) {
            this.draw();
            if(this.getActiveTool === 'SELECT') {
                for (const id in this.shapes) {
                    const shape = this.shapes[id];
                    const localMouse = getMouseLocal(mouseX, mouseY, 0, 0, 1, 1, degreesToRadians(0))
                    if(shape.isSelected && shape.type === 'LINE') {
                        shape.x += dx;
                        shape.y += dy;
                        shape.endX += dx;
                        shape.endY += dy;
                    }
                    if(shape.isSelected && shape.type !== 'LINE') {
                        this.debounce(() => {
                            this.$store.commit('properties/setX', shape.x);
                            this.$store.commit('properties/setY', shape.y);
                        }, 20);
                        
                        shape.x += dx;
                        shape.y += dy;
                    }
                }
            }
            if(this.getActiveTool === 'PAN') {
                console.log('panning');
                return;
            }
            if(['RECTANGLE', 'CIRCLE', 'LINE'].includes(this.getActiveTool)) {
                // @ts-ignore
                this.drawShapeGhost({x: mouseX, y: mouseY}, this.ctx!, this.getActiveTool);
            }
        }
    }

    public onKeyDown(e: KeyboardEvent) {
        e.preventDefault();
        const shiftIsPressed = e.shiftKey;
        const ctrlIsPressed = e.ctrlKey || e.metaKey;
        if(this.getActiveTool === 'SELECT') {
            if(e.code.indexOf('Arrow') > -1) {
                this.nudgeSelection(e.code, { 
                    shift: shiftIsPressed, 
                    ctrl: ctrlIsPressed
                });
                this.draw();
            }
            if(e.code === 'Backspace' || e.code === 'Delete') {
                this.deleteSelection();
                this.draw();
            }
        }
    }

    private onKeyUp(e: KeyboardEvent) {
        e.preventDefault();
        const keyCode = e.key.toLowerCase();
        const ctrlIsPressed = e.ctrlKey || e.metaKey;
        if(keyCode === 'c' && ctrlIsPressed && this.selectedShapes.length) {
            this.copyShapes.splice(0);
            this.copyShapes = [...this.selectedShapes];
        }
        if(keyCode === 'v' && ctrlIsPressed) {
            for(const id of this.selectedShapes) {
                const shape = this.shapes[id];
                shape.isSelected = false;
            }
            this.copyShapes.map(s => {
                const shape = this.shapes[s];
                const shapeCopy = new Shape((shape.type as ShapeName), { stroke: shape.stroke!, fill: shape.fill }, {x: shape.x + 20, y: shape.y + 20, w: shape.width, h: shape.height});
                shapeCopy.isSelected = true;
                shapeCopy.radius = shape.radius;
                shapeCopy.rotation = shape.rotation;
                shapeCopy.shadow = shape.shadow;
                this.shapes = {...this.shapes, [shapeCopy.id]: shapeCopy}
            });
            this.draw();
        }
        switch(keyCode) {
            case 'h':
                this.$store.commit('toolbar/setActiveTool', 'PAN');
                break;
            case 'v':
                this.$store.commit('toolbar/setActiveTool', 'SELECT');
                break;
            case 'r':
                this.$store.commit('toolbar/setActiveTool', 'RECTANGLE');
                break;
            case 'o':
                this.$store.commit('toolbar/setActiveTool', 'CIRCLE');
                break;
            case 'l':
                this.$store.commit('toolbar/setActiveTool', 'LINE');
                break;
        }
    }

    private deleteSelection() {
        for(const id in this.shapes) {
            const shape = this.shapes[id];
            if(shape.isSelected) {
                this.$delete(this.shapes, id);
                this.$store.commit('properties/resetProperties');
            }
        }
    }

    private nudgeSelection(key: string, modifier: {shift: boolean, ctrl: boolean}) {
        const nudgeAmount = modifier.shift ? 20 : modifier.ctrl ? 1 : 10;

        for(const id in this.shapes) {
            const shape = this.shapes[id];
            if(shape.isSelected) {
                switch(key) {
                    case 'ArrowRight':
                        shape.x += nudgeAmount;
                        this.$store.commit('properties/setX', shape.x);
                        break;
                    case 'ArrowLeft':
                        shape.x -= nudgeAmount;
                        this.$store.commit('properties/setX', shape.x);
                        break;
                    case 'ArrowUp':
                        shape.y -= nudgeAmount;
                        this.$store.commit('properties/setY', shape.y);
                        break;
                    case 'ArrowDown':
                        shape.y += nudgeAmount;
                        this.$store.commit('properties/setY', shape.y);
                        break;
                }
            }
        }
    }

    private onResize(e: Event) {
        this.setCanvasSize();
        this.debounce(this.draw, 100);
    }

    private debounce(fn: () => any, ms: number) {
        clearTimeout(timer);
        timer = setTimeout(() => fn(), ms);
    }

    private setCanvasSize() {
        this.canvas!.width = window.innerWidth;
        this.canvas!.height = window.innerHeight;
    }

    private mouseIsOverElement(e: MouseEvent, shape: any): boolean {
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

    private drawShapeGhost(coords: {x: number, y: number}, ctx: CanvasRenderingContext2D, shape: ShapeName): void {
        ctx!.setLineDash([5, 3]);
        ctx!.strokeStyle = 'black';
        ctx!.lineWidth = 1;
        ctx!.fillStyle = 'rgba(255, 191, 203, 0.3)';
        switch(shape) {
            case 'RECTANGLE':
                ctx.beginPath();
                ctx!.fillRect(this.startPoint.x, this.startPoint.y, coords.x - this.startPoint.x, coords.y - this.startPoint.y);
                ctx!.strokeRect(this.startPoint.x, this.startPoint.y,  coords.x - this.startPoint.x, coords.y - this.startPoint.y);
                ctx.closePath();
                break;
            case 'CIRCLE':
                ctx.beginPath();
                ctx.ellipse(
                    coords.x - ((coords.x - this.startPoint.x) / 2), 
                    coords.y - ((coords.y - this.startPoint.y) / 2), 
                    Math.abs( (coords.x - this.startPoint.x) / 2), 
                    Math.abs((coords.y - this.startPoint.y) / 2), 
                    0,
                    0,
                    2*Math.PI
                );
                ctx.stroke();
                ctx.closePath();
                break;
            case 'LINE':
                ctx.moveTo(coords.x, coords.y);
                ctx!.strokeStyle = 'rgba(255, 191, 255, 0.9)';
                ctx.beginPath();
                ctx.lineTo(this.endPoint.x, this.endPoint.y);
                ctx.stroke()
                ctx.closePath();
                break;
        }
    }

    private draw(): void {
        this.clear();
        for(const id in this.shapes) {
            const shape = this.shapes[id];
            shape.drawShape(this.ctx!);
        }
    }

    private clear(): void {
        this.ctx!.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx!.fillStyle = this.getCanvas;
        this.ctx!.fillRect(0, 0, this.canvas!.width, this.canvas!.height)
    }

    private showContextMenu(e: MouseEvent): void {
        e.preventDefault();
        this.$store.commit('toolbar/showContextMenu', { visible: true, x: e.clientX, y: e.clientY });
    }

}

</script>