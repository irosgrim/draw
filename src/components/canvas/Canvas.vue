<template>
    <canvas id="canvas" ref="canvas" tabindex="-1"></canvas>
</template>

<script lang="ts">
import { uid } from 'uid';
import { Dictionary, ShapeName, Stroke } from '@/Types/types';
import { Shape } from './canvas';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import {
  State,
  namespace
} from 'vuex-class'
import { Color, PropertiesStore } from '@/store/properties/types';
import { Tool, ToolbarStore } from '@/store/toolbar/types';

const properties = namespace('properties');
const toolbar = namespace('toolbar');

let timer: number;
@Component
export default class Canvas extends Vue {
    @Prop() updatePropertiesForShape!: boolean;
    @Prop({default: 'SELECT'}) private selectedTool!: Tool;
    @Prop() saveCanvas!: boolean;

    @State('properties') private properties!: PropertiesStore;
    @State('toolbar') private toolbar!: ToolbarStore;
    @properties.Getter('getId') public getShapeId!: string;
    @properties.Getter('getStroke') public getStroke!: Stroke;
    @properties.Getter('getFill') public getFill!: string;
    @properties.Getter('getCanvas') public getCanvas!: string;
    @properties.Getter('getX') public getX!: number;
    @properties.Getter('getY') public getY!: number;
    @properties.Getter('getWidth') public getWidth!: number;
    @properties.Getter('getHeight') public getHeight!: number;



    private canvas: HTMLCanvasElement | null = null;
    private context: CanvasRenderingContext2D | null = null;
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
    public copyShapes: string[] = [];

    @Watch('updatePropertiesForShape')
    private onUpdateProperties() {
        this.shapes[this.getShapeId].x = this.getX;
        this.shapes[this.getShapeId].y = this.getY;
        this.shapes[this.getShapeId].width = this.getWidth;
        this.shapes[this.getShapeId].height = this.getHeight;
        this.shapes[this.getShapeId].stroke = this.getStroke;
        this.shapes[this.getShapeId].fill = this.getFill;
        this.draw();
    }

    @Watch('saveCanvas')
    private onSaveCanvas() {
        const link = document.createElement('a');
        link.download = 'myCreation.png';
        link.href = this.canvas!.toDataURL('image/png')
        link.click();
        link.remove;
    }

    @Watch('getFill')
    private fillChanged(newFill: string) {
        for(const id in this.shapes) {
            const shape = this.shapes[id];
            if(shape.isSelected) {
                shape.fill = newFill;
                shape.drawShape(this.context!);
            }
        }
    }

    @Watch('getStroke')
    private strokeChanged(newStroke: Stroke) {
        for(const id in this.shapes) {
            const shape = this.shapes[id];
            if(shape.isSelected) {
                shape.stroke = newStroke;
                shape.drawShape(this.context!);
            }
        }
    }

    @Watch('getCanvas')
    private canvasChanged(newCanvas: Color) {
        this.draw();
    }

    @Watch('selectedTool')
    private onSelectedTool(tool: Tool) {
        if(tool !== 'SELECT' && tool !== 'PAN') {
            for(const id in this.shapes) {
                const shape = this.shapes[id];
                shape.isSelected = false;
            }
            this.draw();
        }
        this.$store.commit('properties/resetProperties');
    }

    public mounted(): void {
        this.setupCanvas();
        const rect = new Shape('RECTANGLE', {coords: {start: { x: 600, y: 100}, end: {x: 800, y: 300}}, fill: 'rgba(0, 2, 100, 0.7)'});
        this.shapes[rect.id] = rect;
        this.shapes[rect.id].rotation = 45;
        this.draw();
    }
    public setupCanvas(): void {
        window.addEventListener('resize', this.onResize);
        this.canvas = this.$refs.canvas as HTMLCanvasElement;
        this.context = this.canvas.getContext('2d');
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

    public mouseDown(e: MouseEvent) {
        e.preventDefault();
        (this.$refs.canvas as HTMLCanvasElement).focus();
        const mouseX = e.clientX - this.offsetX;
        const mouseY = e.clientY - this.offsetY;
        this.mouseIsDown = true;
        this.$set(this.startPoint, 'x', mouseX);
        this.$set(this.startPoint, 'y', mouseY);
        if(this.selectedTool === 'SELECT') {
            this.$store.commit('properties/resetProperties');
            for (const id in this.shapes) {
                const shape = this.shapes[id];
                if (shape.mouseIsOver(e, this.offsetX, this.offsetY)) {
                    shape.isSelected = true;
                    if(this.selectedShapes.indexOf(shape.id) === -1) {
                        this.selectedShapes = [...this.selectedShapes, shape.id];
                    }
                    const shapeProps = {
                        id: shape.id, 
                        x: shape.x, 
                        y: shape.y,
                        width: shape.width,
                        height: shape.height,
                        fill: shape.fill, 
                        stroke: shape.stroke
                    };
                    this.$store.dispatch('properties/setCurrentShape', shapeProps);
                } 
                else {
                    shape.isSelected = false;
                    this.selectedShapes.splice(0);
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

    public mouseUp(e: MouseEvent): void {
        e.preventDefault();
        e.stopPropagation();
        const mouseX = e.clientX - this.offsetX;
        const mouseY = e.clientY - this.offsetY;
        this.mouseIsDown = false;
        
        if(this.selectedTool === 'SELECT') {
            for (const id in this.shapes) {
                const shape = this.shapes[id];
                // shape.isSelected = false;
                if(!shape.mouseIsOver(e, this.offsetX, this.offsetY)) {
                    shape.isSelected = false;
                    // this.$store.commit('properties/resetProperties');
                    return;
                }
                const shapeProps = {
                        id: shape.id, 
                        x: shape.x, 
                        y: shape.y,
                        width: shape.width,
                        height: shape.height,
                        fill: shape.fill, 
                        stroke: shape.stroke
                    };
                    this.$store.dispatch('properties/setCurrentShape', shapeProps);
            }
            return;
        }
        
        this.$set(this.endPoint, 'x', mouseX);
        this.$set(this.endPoint, 'y', mouseY);
        if(['RECTANGLE', 'CIRCLE', 'LINE'].includes(this.selectedTool)) {
            const fill = this.getFill;
            const stroke = this.getStroke;
            // @ts-ignore
            const s = new Shape(this.selectedTool, { coords: {start: {...this.startPoint}, end: {x: mouseX, y: mouseY}}, fill: fill, stroke });
            this.$set(this.shapes, s.id, s);
            // s.drawShape(this.context!);
            this.draw();
        }
        this.$emit('mouse-up');
    }

    public mouseMove(e: MouseEvent): void {
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
            if(this.selectedTool === 'SELECT') {
                for (const id in this.shapes) {
                    const shape = this.shapes[id];
                    if(shape.isSelected && shape.type === 'LINE') {
                        shape.x += dx;
                        shape.y += dy;
                        shape.endX += dx;
                        shape.endY += dy;
                    }
                    if(shape.isSelected && shape.type !== 'LINE') {
                        const shapeProps = {
                            id: shape.id, 
                            x: shape.x, 
                            y: shape.y,
                            width: shape.width,
                            height: shape.height,
                            fill: shape.fill, 
                            stroke: shape.stroke
                        };
                        // this.$store.dispatch('properties/setCurrentShape', shapeProps);
                        shape.x += dx;
                        shape.y += dy;
                    }
                }
            }
            if(this.selectedTool === 'PAN') {
                console.log('panning');
                return;
            }
            if(['RECTANGLE', 'CIRCLE', 'LINE'].includes(this.selectedTool)) {
                // @ts-ignore
                this.drawShapeGhost({x: mouseX, y: mouseY}, this.context!, this.selectedTool);
            }
            
        }

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
                this.shapes = {...this.shapes, [shapeCopy.id]: shapeCopy}
            });

            this.draw();
        }
        switch(keyCode) {
            case 'h':
                this.$emit('select-tool', 'PAN');
                break;
            case 'v':
                this.$emit('select-tool', 'SELECT');
                break;
            case 'r':
                this.$emit('select-tool', 'RECTANGLE');
                break;
            case 'o':
                this.$emit('select-tool', 'CIRCLE');
                break;
            case 'l':
                this.$emit('select-tool', 'LINE');
                break;
        }
    }
    public deleteSelection() {
        for(const id in this.shapes) {
            const shape = this.shapes[id];
            if(shape.isSelected) {
                this.$delete(this.shapes, id);
                this.$store.commit('properties/resetProperties');
            }
        }
    }

    public nudgeSelection(key: string, modifier: {shift: boolean, ctrl: boolean}) {
        switch(key) {
            case 'ArrowRight':
                for(const id in this.shapes) {
                    const shape = this.shapes[id];
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
                        this.$store.commit('properties/setX', shape.x);
                    }
                }
                break;
            case 'ArrowLeft':
                for(const id in this.shapes) {
                    const shape = this.shapes[id];
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
                        this.$store.commit('properties/setX', shape.x);
                    }
                }
                break;
             case 'ArrowUp':
                for(const id in this.shapes) {
                    const shape = this.shapes[id];
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
                        this.$store.commit('properties/setY', shape.y);
                    }
                }
                break;
            case 'ArrowDown':
                for(const id in this.shapes) {
                    const shape = this.shapes[id];
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
                    this.$store.commit('properties/setY', shape.y);
                }
                break;
        }
        
    }
    public onResize(e: Event) {
        this.setCanvasSize();
        this.debounce(this.draw, 100);
    }

    public debounce(fn: () => any, ms: number) {
        clearTimeout(timer);
        timer = setTimeout(fn, ms);
    }

    public setCanvasSize() {
        this.canvas!.width = window.innerWidth;
        this.canvas!.height = window.innerHeight;
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

    public drawShapeGhost(coords: {x: number, y: number}, context: CanvasRenderingContext2D, shape: ShapeName): void {
        context!.setLineDash([5, 3]);
        context!.strokeStyle = 'black';
        context!.lineWidth = 1;
        context!.fillStyle = 'rgba(255, 191, 203, 0.3)';
        switch(shape) {
            case 'RECTANGLE':
                context.beginPath();
                context!.fillRect(this.startPoint.x, this.startPoint.y, coords.x - this.startPoint.x, coords.y - this.startPoint.y);
                context!.strokeRect(this.startPoint.x, this.startPoint.y,  coords.x - this.startPoint.x, coords.y - this.startPoint.y);
                break;
            case 'CIRCLE':
                context.beginPath();
                context.ellipse(
                    coords.x - ((coords.x - this.startPoint.x) / 2), 
                    coords.y - ((coords.y - this.startPoint.y) / 2), 
                    Math.abs( (coords.x - this.startPoint.x) / 2), 
                    Math.abs((coords.y - this.startPoint.y) / 2), 
                    0,
                    0,
                    2*Math.PI
                );
                context.stroke();
                context.closePath();
                break;
            case 'LINE':
                context.beginPath();
                context!.strokeStyle = 'rgba(255, 191, 255, 0.9)';
                context.moveTo(coords.x, coords.y);
                context.lineTo(this.endPoint.x, this.endPoint.y);
                context.stroke()
                break;
        }
    }

    public draw(): void {
        this.clear();
        for(const id in this.shapes) {
            const shape = this.shapes[id];
            shape.drawShape(this.context!);
        }
    }

    public clear(): void {
        const context = this.canvas?.getContext('2d');
        this.context!.fillStyle = this.getCanvas;
        this.context!.fillRect(0, 0, this.canvas!.width, this.canvas!.height)
    }

    public showContextMenu(e: MouseEvent): void {
        e.preventDefault();
        console.log('context menu ', {clientX: e.clientX, clientY: e.clientY});
        this.$emit('context-menu', {visible: true, mouseCoords: {x: e.clientX, y: e.clientY}});
    }
}


</script>