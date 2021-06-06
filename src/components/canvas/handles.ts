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
    public x = 0;
    public y = 0;
    constructor(public position: PolarCoordinate, private coords: Coords, private shapeWidth: number, private shapeHeight: number, private ctx: CanvasRenderingContext2D) {
        this.createHandle();
    }

    private draw(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.ctx.fillRect(x, y, this.handleSize, this.handleSize);
        this.ctx.strokeRect(x, y, this.handleSize, this.handleSize);
    }

    private createHandle() {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.strokeStyle = '#000000';

        const NW = {
            x: this.coords.x - this.handleSize / 2,
            y: this.coords.y - this.handleSize / 2
        }

        const NE = {
            x: this.coords.x + this.shapeWidth - this.handleSize / 2,
            y: NW.y,
        }

        const SW = {
            x: NW.x, 
            y: this.coords.y + this.shapeHeight - this.handleSize / 2
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
                this.ctx.fillRect(this.coords.x - this.handleSize, this.coords.y - this.handleSize / 2, this.handleSize, this.handleSize);
                this.ctx.strokeRect(this.coords.x - this.handleSize, this.coords.y - this.handleSize / 2, this.handleSize, this.handleSize);
                break;
            case 'E':
                this.ctx.fillRect(this.coords.x - this.handleSize, this.coords.y - this.handleSize / 2, this.handleSize, this.handleSize);
                this.ctx.strokeRect(this.coords.x - this.shapeWidth + this.handleSize, this.coords.y + this.shapeHeight + this.handleSize / 2, this.handleSize, this.handleSize);
                break;
        }
    }
    public mouseIsOver(mouseX: number, mouseY: number): boolean {
        const hotSpotNW = mouseX >= this.x - 15 && mouseX <= this.x + 2.5 && mouseY >= this.y - 15 && mouseY <= this.y + 2.5;
        const hotSpotNE = mouseX >= this.x - 2.5 && mouseX <= this.x + 15 && mouseY >= this.y - 15 && mouseY <= this.y + 15;
        const hotSpotSE = mouseX >= this.x - 2.5 && mouseX <= this.x + 15 && mouseY >= this.y - 15 && mouseY <= this.y + 15;
        const hotSpotSW = mouseX >= this.x - 15 && mouseX <= this.x + 2.5 && mouseY >= this.y - 15 && mouseY <= this.y + 15;
        switch (this.position) {
            case 'NW':
                return hotSpotNW;
            case 'NE':
                return hotSpotNE;
            case 'SE':
                return hotSpotSE;
            case 'SW':
                return hotSpotSW;
        }
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
        return mouseX >= this.x - this.hotSpot && mouseX <=  this.x + this.hotSpot && mouseY >= this.y - this.hotSpot && mouseY <= this.y + this.hotSpot;
    }

    private draw(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = '#00a7f9';
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.handleRadius, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.handleRadius, 0, 2 * Math.PI);
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
