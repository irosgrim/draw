import { mouseIsInsideEllipse, mouseIsInsideRectangle } from '@/helpers/geometry';
import { Coords, PolarCoordinate, Shadow, ShapeCoords, ShapeName, Stroke } from '@/Types/types';
import { uid } from 'uid';

export class Shape {
    public id = '';
    public x = 0;
    public y = 0;
    public endX = 0;
    public endY = 0;
    public width = 0;
    public height = 0;
    public stroke: Stroke | null = null;
    public fill = '';
    public type: ShapeName | '' = '';
    public rotation = 0;
    public shadow: Shadow | null = null;
    private _isMoving = false;
    private _isSelected = false;
    
    constructor(type: ShapeName, shapeProperties: {coords?: ShapeCoords, stroke?: Stroke, fill?: string}, copyShape?: {x: number, y: number, h: number, w: number}) {
        this.id = uid(12);
        if(shapeProperties.coords) {
            if(type === 'LINE') {
                this.x = shapeProperties.coords.start.x;
                this.y = shapeProperties.coords.start.y;
                this.endX = shapeProperties.coords.end.x;
                this.endY = shapeProperties.coords.end.y;
            } else {
                const isNegativeWidth = shapeProperties.coords.end.x <= shapeProperties.coords.start.x;
                const isNegativeHeight = shapeProperties.coords.end.y <= shapeProperties.coords.start.y;

                if(isNegativeWidth) {
                    this.x = shapeProperties.coords.end.x;
                    this.width = Math.abs(shapeProperties.coords.start.x - shapeProperties.coords.end.x);
                } else {
                    this.x = shapeProperties.coords.start.x;
                    this.width = Math.abs(shapeProperties.coords.end.x - shapeProperties.coords.start.x);
                }
                if(isNegativeHeight) {
                    this.y = shapeProperties.coords.end.y;
                    this.height = Math.abs(shapeProperties.coords.start.y - shapeProperties.coords.end.y);
                } else {
                    this.y = shapeProperties.coords.start.y;
                    this.height = Math.abs(shapeProperties.coords.end.y - shapeProperties.coords.start.y);
                }
            }
        }
        if(copyShape) {
            this.x = copyShape.x;
            this.y = copyShape.y;
            this.width = copyShape.w;
            this.height = copyShape.h;
        }

        this.stroke = shapeProperties.stroke ? shapeProperties.stroke : null;
        this.fill = shapeProperties.fill ? shapeProperties.fill : '';
        this.type = type;
    }
    public mouseIsOver(e: MouseEvent, offsetX: number, offsetY: number) {
        const mouseX = e.clientX - offsetX;
        const mouseY = e.clientY - offsetY;
        if(this.type === 'CIRCLE') {
           
            return mouseIsInsideEllipse(e.clientX, e.clientY, offsetX, offsetY, this.x, this.y, this.height, this.width);
        }
        if(this.type === 'RECTANGLE') {
            const checkIfMouseOverNEHandle = () => {
                return (
                    mouseX < this.x + this.width + 10 && mouseX > this.x + this.width - 10 &&
                    mouseY > this.y - 10 && mouseY < this.y + 10 
                )
            }

            // console.log(checkIfMouseOverNEHandle());
            return mouseIsInsideRectangle(e.clientX, e.clientY, offsetX, offsetY, this.x, this.y, this.height, this.width);
        }
        if(this.type === 'LINE') { 
            // console.log(mouseX < this.x + this.width && mouseX > this.x + this.width && mouseY > this.y - 5 && mouseY < this.y + 5);
          
            return (
                mouseX < this.endX && mouseX > this.x &&
                mouseY > this.y - 5 && mouseY < this.endY + 5
            )
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

    public drawShape(ctx: CanvasRenderingContext2D) {
        ctx.save();
        if(this.shadow) {
            this.applyShadow(ctx);
        }
        switch(this.type) {
            case 'RECTANGLE':
                this.drawRectangle(ctx);
                break;
            case 'CIRCLE':
                this.drawCircle(ctx)
                break;
            case 'LINE':
                this.drawLine(ctx)
                break;
        }

    }
    public drawCircle(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        if(this.fill) {
            ctx.fillStyle = this.fill;
            ctx.ellipse(this.x + this.width/2, this.y + this.height/2, this.width/2, this.height/2, 0, 0, 2*Math.PI);
            ctx.fill();
        }
        if(this.stroke) {
            ctx.setLineDash([]);
            ctx.strokeStyle = this.stroke.style;
            ctx.lineWidth = this.stroke.width;
            ctx.ellipse(this.x + this.width/2, this.y + this.height/2, this.width/2, this.height/2, 0, 0, 2*Math.PI);
            ctx.stroke();
        }

        ctx.restore();
        if(this.isSelected) {
            this.drawResizeHandles(ctx);
        }
        ctx.closePath();
    }

    public drawRectangle(ctx: CanvasRenderingContext2D) {
        if(this.fill) {
            ctx.fillStyle = this.fill;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
        }
        if(this.stroke) {
            ctx.setLineDash([]);
            ctx.strokeStyle = this.stroke.style;
            ctx.lineWidth = this.stroke.width;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
        ctx.restore();
        if(this.isSelected) {
            this.drawResizeHandles(ctx);
        }

    }

    private applyShadow(ctx: CanvasRenderingContext2D) {
        ctx.shadowColor = this.shadow!.color;
        ctx.shadowBlur = this.shadow!.blur;
        ctx.shadowOffsetX = this.shadow!.x;
        ctx.shadowOffsetY = this.shadow!.y;
    }

    public drawLine(ctx: CanvasRenderingContext2D) {
        // if(this.fill) {
        //     // ctx.fillStyle = this.fill;
        //     // ctx.fillRect(this.x, this.y, this.width, this.height);
        // }
        // if(this.stroke) {
        //     // ctx.setLineDash([]);
        //     // ctx.strokeStyle = this.stroke.style;
        //     // ctx.lineWidth = this.stroke.width;
        //     // ctx.strokeRect(this.x, this.y, this.width, this.height);
        // }
        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.strokeStyle = 'black';
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.endX, this.endY);
        ctx.stroke()
        ctx.closePath();
        ctx.restore();
        if(this.isSelected) {
            this.drawLineResizeHandles(ctx);
        }
    }
    drawLineResizeHandles(ctx: CanvasRenderingContext2D) {
        ctx.setLineDash([]);
        new ResizeHandle('W', {x: this.x, y: this.y}, Math.abs(this.endX - this.x), Math.abs(this.endY - this.y), ctx);
        // new ResizeHandle('E', {x: this.endX, y: this.endY}, Math.abs(this.endX - this.x), Math.abs(this.endY - this.y), ctx);
    }

    private drawResizeHandles(ctx: CanvasRenderingContext2D) {
            ctx.setLineDash([]);
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#00a7f9';
            ctx.strokeRect(this.x, this.y, this.width, this.height);

            (["NW", "NE", "SW", "SE"] as PolarCoordinate[]).forEach(x => new ResizeHandle(x, {x: this.x, y: this.y}, this.width, this.height, ctx));

            const text = `${this.width} x ${this.height}`;
            const infoBoxH = 16;
            const textWidth = ctx.measureText(text).width;
            const infoBoxW = textWidth + 16;
            ctx.fillStyle = 'rgba(0, 166, 249, 0.7)';

            ctx.fillRect(this.x + this.width / 2 - infoBoxW / 2, this.y + this.height + 16 - infoBoxH / 2, infoBoxW, infoBoxH);
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "center";
            ctx.font = "12px Arial";
            ctx.fillText(text, this.x + this.width / 2, this.y + this.height + 16 + infoBoxH / 3.6);

    }

}

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