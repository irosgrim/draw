import { Coords, PolarCoordinate } from '@/Types/types';

export class Mouse {
    private canvas : HTMLCanvasElement;
    private offsetX = 0;
    private offsetY = 0;
    private mouseX  = 0;
    private mouseY  = 0;

    constructor(e: MouseEvent, canvas: HTMLCanvasElement) {
        this.canvas  = canvas;
        const canvasBounding = this.canvas.getBoundingClientRect();
        this.offsetX = canvasBounding.left;
        this.offsetY = canvasBounding.top;
        this.mouseX  = e.clientX - this.offsetX;
        this.mouseY  = e.clientY - this.offsetY;
    }
    public get mousePosition(): Coords {
        return {
            x: this.mouseX,
            y: this.mouseY
        }
    }
}

export class ResizeHandle {
    private handleSize = 5;
    constructor(public position: PolarCoordinate, private coords: Coords, private width: number, private height: number, private ctx: CanvasRenderingContext2D) {
        this.createHandle();
    }
    private createHandle() {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.strokeStyle = '#000000';

        const NW = {
            x: this.coords.x - this.handleSize / 2,
            y: this.coords.y - this.handleSize / 2
        }

        const NE = {
            x: this.coords.x + this.width - this.handleSize / 2,
            y: NW.y,
        }

        const SW = {
            x: NW.x, 
            y: this.coords.y + this.height - this.handleSize / 2
        }

        const SE = {
            x: NE.x,
            y: SW.y
        }

        switch (this.position) {
            
            case 'NW':
                this.ctx.fillRect(NW.x, NW.y, this.handleSize, this.handleSize);
                this.ctx.strokeRect(NW.x, NW.y, this.handleSize, this.handleSize);
                break;
            case 'NE':
                this.ctx.fillRect(NE.x, NE.y, this.handleSize, this.handleSize);
                this.ctx.strokeRect(NE.x, NE.y, this.handleSize, this.handleSize);
                break;
            case 'SW':
                this.ctx.fillRect(SW.x, SW.y, this.handleSize, this.handleSize);
                this.ctx.strokeRect(SW.x, SW.y, this.handleSize, this.handleSize);
                break;
            case 'SE':
                this.ctx.fillRect(SE.x, SE.y, this.handleSize, this.handleSize);
                this.ctx.strokeRect(SE.x, SE.y, this.handleSize, this.handleSize);
                break;
            case 'W':
                this.ctx.fillRect(this.coords.x - this.handleSize, this.coords.y - this.handleSize / 2, this.handleSize, this.handleSize);
                this.ctx.strokeRect(this.coords.x - this.handleSize, this.coords.y - this.handleSize / 2, this.handleSize, this.handleSize);
                break;
            case 'E':
                this.ctx.fillRect(this.coords.x - this.handleSize, this.coords.y - this.handleSize / 2, this.handleSize, this.handleSize);
                this.ctx.strokeRect(this.coords.x - this.width + this.handleSize, this.coords.y + this.height + this.handleSize / 2, this.handleSize, this.handleSize);
                break;
        }
    }
    public mouseIsOver(): boolean {
        return false;
    }
}
