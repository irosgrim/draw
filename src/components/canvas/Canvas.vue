<template>
    <canvas id="canvas" ref="canvas"></canvas>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

let timer: number;
@Component
export default class Canvas extends Vue {
    @Prop({default: 'select'}) private selectedTool!: string;
    
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

    private shapes = [
        {
            x: 80,
            y: 80,
            width: 80,
            height: 40,
            stroke: {
                width: 1,
                style: 'black'
            },
            fill: null,
            type: "rectangle",
            isMoving: false,
            isSelected: false,
        },
        {
            x: 180,
            y: 80,
            width: 60,
            height: 40,
            stroke: null,
            fill: "red",
            type: "rectangle",
            isMoving: false,
            isSelected: false,
        },
        {
            x: 260,
            y: 80,
            width: 60,
            height: 40,
            stroke: null,
            fill: "orange",
            type: "rectangle",
            isMoving: false,
            isSelected: false,
        },
        {
            x: 340,
            y: 80,
            width: 60,
            height: 40,
            stroke: null,
            fill: "red",
            type: "rectangle",
            isMoving: false,
            isSelected: false,
        },
    ];
    public mounted(): void {
        this.setupCanvas();
        window.addEventListener('resize', this.onResize);
        document.addEventListener("keydown", this.onKeyDown);
        this.draw();
    }

    public onKeyDown(e: KeyboardEvent) {
        console.log(e);
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
        const mouseX = e.clientX - this.offsetX;
        const mouseY = e.clientY - this.offsetY;
        this.mouseIsDown = true;
        if(this.selectedTool === 'select') {
            for (let shape of this.shapes) {
                if (this.mouseIsOverElement(e, shape)) {
                    console.log('here');
                    shape.isMoving = true;
                    shape.isSelected = true;
                } else {
                    console.log('false')
                    shape.isSelected = false;
                }
            }
            this.draw();
            return;
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
        if(this.selectedTool === 'select') {
            for (const shape of this.shapes) {
                shape.isMoving = false;
                shape.isSelected = false;
            }
            return;
        }
        this.$set(this.endPoint, 'x', mouseX);
        this.$set(this.endPoint, 'y', mouseY);
        if(this.selectedTool === 'rectangle') {
            this.drawNewRectangle();
        }
        this.draw();
        this.$emit('mouse-up');
    }

    public mouseMove(e: MouseEvent): void {
        e.preventDefault();
        e.stopPropagation();

        const dx = e.movementX;
        const dy = e.movementY;
        if(this.selectedTool === 'select') {
            for (let shape of this.shapes) {
                if(this.mouseIsOverElement(e, shape)) {
                    shape.isSelected = true;
                } else {
                    shape.isSelected = false;
                }
            }
        }
        if (this.mouseIsDown) {
            for (let shape of this.shapes) {
                if (shape.isMoving) {
                    shape.x += dx;
                    shape.y += dy;
                }
            }
            this.draw();
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

    public drawNewRectangle(): void {
        const newRectangle = {
            x: this.startPoint.x,
            y: this.startPoint.y,
            width: this.endPoint.x - this.startPoint.x,
            height: this.endPoint.y - this.startPoint.y,
            stroke: null,
            fill: "pink",
            type: "rectangle",
            isMoving: false,
            isSelected: false,
        };
        this.shapes = [...this.shapes, newRectangle];
    }

    public draw(): void {
        const context = this.canvas?.getContext('2d');
        this.clear();
        for (const shape of this.shapes) {
            if(shape.fill) {
                context!.fillStyle = shape.fill;
                context!.fillRect(shape.x, shape.y, shape.width, shape.height);
            }
            if(shape.stroke) {
                context!.strokeStyle = shape.stroke.style;
                context!.lineWidth = shape.stroke.width;
                context!.strokeRect(shape.x, shape.y, shape.width, shape.height)
            }
            if(shape.isSelected) {
                context!.strokeStyle = '#22a7f2';
                context!.lineWidth = 1;
                context!.strokeRect(shape.x, shape.y, shape.width, shape.height);
            }
            context!.font = "10px Arial";
            context!.fillText(shape.isSelected.toString(), shape.x + shape.width, shape.y);
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
</script>