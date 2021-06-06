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

export class RadiusHandle {
    private handleRadius = 5;
    private x = 0;
    private y = 0;
    private hotSpot = 15;
    constructor(public position: PolarCoordinate, public coords: Coords, private shapeWidth: number, private shapeHeight: number, private ctx: CanvasRenderingContext2D, private radius: number) {
        this.createHandle();
    }

    public mouseIsOver(mouseX: number, mouseY: number): boolean {
        const hotSpot = mouseX >= this.x - 15 && mouseX <=  this.x + 15 && mouseY >= this.y - 15 && mouseY <= this.y + 15;
        return hotSpot;
    }

    private draw(x: number, y: number, handleRadius = 5) {
        this.x = x;
        this.y = y;
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = '#00a7f9';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 5, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(x, y, 5, 0, 2 * Math.PI);
        this.ctx.stroke();
    }
    private createHandle() {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.strokeStyle = '#000000';

        const NW = {
            x: this.coords.x + 15 + this.radius/Math.PI,
            y: this.coords.y + 15 + this.radius/Math.PI
        }

        const NE = {
            x: this.coords.x + this.shapeWidth - 15 - this.radius/Math.PI,
            y: NW.y,
        }

        const SW = {
            x: NW.x, 
            y: this.coords.y + this.shapeHeight - 15 - this.radius/Math.PI
        }

        const SE = {
            x: NE.x,
            y: SW.y
        }

        switch (this.position) {
            case 'NW':
                this.draw(NW.x, NW.y);
                break;
            case 'NE':
                this.draw(NE.x, NE.y);
                break;
            case 'SW':
                this.draw(SW.x, SW.y);
                break;
            case 'SE':
                this.draw(SE.x, SE.y);
                break;
            case 'W':
                break;
            case 'E':
                break;
        }
        
    }
    
}
