<template>
    <canvas id="canvas" ref="canvas"></canvas>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

let timer: number;
@Component
export default class Canvas extends Vue {
    private canvas: HTMLCanvasElement | null = null;
    private mouseIsDown = false;
    private offsetX = 0;
    private offsetY = 0;

    private shapes = [
        {
            x: 10,
            y: 80,
            width: 80,
            height: 40,
            fill: "green",
            type: "rectangle",
            isMoving: false,
            isSelected: false,
        },
        {
            x: 100,
            y: 80,
            width: 60,
            height: 40,
            fill: "red",
            type: "rectangle",
            isMoving: false,
            isSelected: false,
        },
        {
            x: 180,
            y: 80,
            width: 60,
            height: 40,
            fill: "orange",
            type: "rectangle",
            isMoving: false,
            isSelected: false,
        },
        {
            x: 260,
            y: 80,
            width: 60,
            height: 40,
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
        const mx = e.clientX - this.offsetX;
        const my = e.clientY - this.offsetY;
        this.mouseIsDown = true;

        for (let x in this.shapes) {
            const shape = this.shapes[x];
            if (
                mx > shape.x &&
                mx < shape.x + shape.width &&
                my > shape.y &&
                my < shape.y + shape.height
            ) {
                shape.isMoving = true;
                shape.isSelected = true;
            } else {
                shape.isSelected = false;
            }
        }
    }

    public mouseUp(e: MouseEvent): void {
        e.preventDefault();
        e.stopPropagation();
        this.mouseIsDown = false;
        for (const x in this.shapes) {
            this.shapes[x].isMoving = false;
        }
    }

    public mouseMove(e: MouseEvent): void {
        e.preventDefault();
        e.stopPropagation();
        const dx = e.movementX;
        const dy = e.movementY;
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

    public draw(): void {
        const context = this.canvas?.getContext('2d');
        this.clear();
        for (const x in this.shapes) {
            const shape = this.shapes[x];
            context!.fillStyle = shape.fill;
            context!.fillRect(shape.x, shape.y, shape.width, shape.height);
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