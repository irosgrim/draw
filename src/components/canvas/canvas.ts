import { Dictionary, PolarCoordinate, Shadow, ShapeName} from '@/Types/types';
import { Shape } from './shape';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import {
  State,
  namespace
} from 'vuex-class'
import { Color } from '@/store/properties/types';
import { Tool, ToolbarStore } from '@/store/toolbar/types';
import { degreesToRadians, getMouseLocal } from '@/helpers/geometry';
import { drawShapeGhost } from './shapeGhost';

const properties = namespace('properties');
const toolbar = namespace('toolbar');

let timer: number;
@Component
export class Canvas extends Vue {
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
    private mouse = {
        x: 0,
        y: 0,
    }
    private selectedShapes: string[] = [];
    private shapes: Dictionary<Shape> = {};
    private copyShapes: string[] = [];
    private activeRadiusModifier: PolarCoordinate | null = null;
    private activeResizeModifier: PolarCoordinate | null = null;

    @Watch('getRotation')
    private rotationChanged(rotation: number) {
        if(this.getShapeId) {
            this.shapes[this.getShapeId].rotation = rotation;
            this.draw();
        }
    }

    @Watch('getRadius')
    private radiusChanged(radius:  {NW: number, NE: number, SE: number, SW: number}| null) {
        if(this.getShapeId) {
            if(!this.shapes[this.getShapeId].radius) {
                this.shapes[this.getShapeId].radius = [];
            }
            if( radius ) {
                const newRadius = radius;
                const shapeRadius = this.shapes[this.getShapeId].radius!;
                shapeRadius[0] = newRadius.NW;
                shapeRadius[1] = newRadius.NE;
                shapeRadius[2] = newRadius.SE;
                shapeRadius[3] = newRadius.SW;
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
        this.mouse.x = e.clientX - this.offsetX;
        this.mouse.y = e.clientY - this.offsetY;
        this.mouseIsDown = true;
        this.$set(this.startPoint, 'x', this.mouse.x);
        this.$set(this.startPoint, 'y',this.mouse.y);
        if(this.activeResizeModifier) {
            this.mouseIsDragging = true;
        }
        if(this.activeRadiusModifier) {
            this.mouseIsDragging = true;
        }
        if(this.getActiveTool === 'SELECT') {
            this.selectedShapes = [];
            this.$store.commit('properties/resetProperties');
            for (const id in this.shapes) {
                const shape = this.shapes[id];
                const mouseIsOverShape = shape.mouseIsOver(e, this.offsetX, this.offsetY);
                if (mouseIsOverShape || (this.activeResizeModifier && shape.isSelected)) {
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
        this.mouseIsDown = false;
        this.mouseIsDragging = false;
        this.activeResizeModifier = null;
        this.activeRadiusModifier = null;
        this.mouse.x = e.clientX - this.offsetX;
        this.mouse.y = e.clientY - this.offsetY;
        this.$set(this.endPoint, 'x', this.mouse.x);
        this.$set(this.endPoint, 'y', this.mouse.y);

        if(['RECTANGLE', 'CIRCLE', 'LINE'].includes(this.getActiveTool)) {
            const fill = this.getShapeProperties.fill;
            const stroke = this.getShapeProperties.stroke;
            const s = new Shape((this.getActiveTool as ShapeName), { coords: {start: {...this.startPoint}, end: this.mouse}, fill: fill, stroke });
            s.scale = 2;
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
        this.mouse.x = e.clientX - this.offsetX;
        this.mouse.y = e.clientY - this.offsetY;
        const dx = e.movementX;
        const dy = e.movementY;
        if(this.activeResizeModifier && this.mouseIsDragging) {
            this.resize(this.mouse);
        }
        if(this.activeRadiusModifier && this.mouseIsDragging) {
            this.makeRadius(this.mouse);
        }
        if(!this.mouseIsDown && this.selectedShapes.length) {
            this.debounce(() => {
                for (const id in this.shapes) {
                    const shape = this.shapes[id];
                    const activeRadiusHandle = shape.width >= 50 && shape.height>= 50 && shape.mouseIsOverRadiusHandle(this.mouse);
                    const activeResizeHandle = shape.mouseIsOverResizeHandle(this.mouse);
                    if(shape.isSelected && activeResizeHandle) {
                        this.activeResizeModifier = activeResizeHandle;
                        this.setResizeMousePointer(activeResizeHandle, this.canvas!);
                    } else {
                        this.activeResizeModifier = null;
                        this.canvas!.className = '';
                    }
                    if(shape.isSelected && shape.type === 'RECTANGLE' && activeRadiusHandle) { 
                        this.activeRadiusModifier = activeRadiusHandle;
                        this.canvas?.classList.add('radius-cursor');
                    } else {
                        this.canvas!.classList.remove('radius-cursor');
                        this.activeRadiusModifier = null;
                    }
                }
            }, 10);

        }
        if(this.mouseIsDown && !this.activeRadiusModifier && !this.activeResizeModifier) {
            this.draw();
            if(this.getActiveTool === 'SELECT') {
                for (const id in this.shapes) {
                    const shape = this.shapes[id];
                    const localMouse = getMouseLocal(this.mouse.x, this.mouse.y, 0, 0, 1, 1, degreesToRadians(0))
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
                this.ctx!.setTransform(1, 0, 0, 1, 0, 0);
                drawShapeGhost(this.startPoint.x, this.startPoint.y, this.mouse.x, this.mouse.y, this.ctx!, (this.getActiveTool as ShapeName))
            }
        }
    }

    private setResizeMousePointer(activeResizeHandle: PolarCoordinate, canvasElement: HTMLCanvasElement) {
        switch(activeResizeHandle) {
            case 'N':
            case 'S':
                canvasElement.classList.add('resize-NS');
                break;
            case 'W':
            case 'E':
                canvasElement.classList.add('resize-WE');
                break;
            case 'NW':
                canvasElement.classList.add('resize-NW');
                break;
            case 'NE':
                canvasElement.classList.add('resize-NE');
                break;
            case 'SE':
                canvasElement.classList.add('resize-SE');
                break;
            case 'SW':
                canvasElement.classList.add('resize-SW');
                break;
        }
    }

    private makeRadius(mouse: {x: number, y: number}) {
        this.activeResizeModifier = null;
            let dX = 0;
            if( this.activeRadiusModifier === 'NW' || this.activeRadiusModifier === 'SW') {
                dX = mouse.x - this.startPoint.x;
            } else {
                dX = this.startPoint.x - mouse.x;
            }
            if(dX > 0 && dX <= this.shapes[this.getShapeId].width / 2 && dX <= this.shapes[this.getShapeId].height / 2) {
                this.$store.dispatch('properties/setCurrentShape', { radius: [dX, dX, dX, dX]});
            }
    }

    private resize(mouse: {x: number, y: number}) {
        this.activeRadiusModifier = null;
            const originalShapeX = this.getX;
            const originalShapeY = this.getY;
            let newX = 0;
            let newY = 0;
            let newWidth = 0;
            let newHeight = 0;
            if(this.activeResizeModifier === 'N') {
                newY = mouse.y;
                newHeight = this.getHeight + originalShapeY - mouse.y > 0 ? this.getHeight + originalShapeY - mouse.y : Math.abs(this.getHeight + originalShapeY - mouse.y);
                this.$store.dispatch('properties/setCurrentShape', { y: newY, height: newHeight });
            }
            if(this.activeResizeModifier === 'S') {
                newHeight = mouse.y - originalShapeY > 0 ? mouse.y - originalShapeY  : Math.abs(mouse.y - originalShapeY);
                this.$store.dispatch('properties/setCurrentShape', { height: newHeight });
            }
            if(this.activeResizeModifier === 'W') {
                newX = mouse.x;
                newWidth = this.getWidth + originalShapeX - mouse.x;
                this.$store.dispatch('properties/setCurrentShape', { x: newX, width: newWidth });
            }
            if(this.activeResizeModifier === 'E') {
                newWidth = mouse.x - originalShapeX > 0 ? mouse.x - originalShapeX  : Math.abs(mouse.x - originalShapeX);
                this.$store.dispatch('properties/setCurrentShape', { width: newWidth });
            }
            if(this.activeResizeModifier === 'NW') {
                newX = mouse.x;
                newY = mouse.y;
                newWidth = this.getWidth + originalShapeX - mouse.x > 0 ? this.getWidth + originalShapeX - mouse.x : Math.abs(this.getWidth + originalShapeX - mouse.x);
                newHeight = this.getHeight + originalShapeY - mouse.y > 0 ? this.getHeight + originalShapeY - mouse.y : Math.abs(this.getHeight + originalShapeY - mouse.y);
                this.$store.dispatch('properties/setCurrentShape', { x: newX, y: newY, width: newWidth, height: newHeight });
            }
            if(this.activeResizeModifier === 'NE') {
                newY = mouse.y;
                newWidth = mouse.x - originalShapeX > 0 ? mouse.x - originalShapeX : 1;
                newHeight = this.getHeight + originalShapeY - mouse.y > 0 ? this.getHeight + originalShapeY - mouse.y : 1;
                this.$store.dispatch('properties/setCurrentShape', { y: newY, width: newWidth, height: newHeight });
            }
            if(this.activeResizeModifier === 'SE') {
                newWidth = mouse.x - originalShapeX;
                newHeight = mouse.y - originalShapeY > 0 ?  mouse.y - originalShapeY : 1;
                this.$store.dispatch('properties/setCurrentShape', { width: newWidth, height: newHeight });
            }
            if(this.activeResizeModifier === 'SW') {
                newX = mouse.x;
                newWidth = this.getWidth + originalShapeX - mouse.x > 0 ? this.getWidth + originalShapeX - mouse.x : 1;
                newHeight = mouse.y - originalShapeY > 0 ?  mouse.y - originalShapeY : 1;
                this.$store.dispatch('properties/setCurrentShape', { x: newX, width: newWidth, height: newHeight });
            }
    }

    private onKeyDown(e: KeyboardEvent) {
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