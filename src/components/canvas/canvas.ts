import { mouseIsInsideEllipse, mouseIsInsideRectangle } from '@/helpers/geometry';
import { Coords, PolarCoordinate, ShapeCoords, ShapeName, Stroke } from '@/Types/types';
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

    public drawShape(context: CanvasRenderingContext2D) {
        switch(this.type) {
            case 'RECTANGLE':
                this.drawRectangle(context);
                break;
            case 'CIRCLE':
                this.drawCircle(context)
                break;
            case 'LINE':
                this.drawLine(context)
                break;


        }
    }
    public drawCircle(context: CanvasRenderingContext2D) {
        context.beginPath();
        if(this.fill) {
            context.fillStyle = this.fill;
            context.ellipse(this.x + this.width/2, this.y + this.height/2, this.width/2, this.height/2, 0, 0, 2*Math.PI);
            context.fill();
        }
        if(this.stroke) {
            context.setLineDash([]);
            context.strokeStyle = this.stroke.style;
            context.lineWidth = this.stroke.width;
            context.ellipse(this.x + this.width/2, this.y + this.height/2, this.width/2, this.height/2, 0, 0, 2*Math.PI);
            context.stroke();
        }

        if(this.isSelected) {
            this.drawResizeHandles(context);
        }
        context.closePath();
    }

    public drawRectangle(context: CanvasRenderingContext2D) {
        context.save();
        // context.translate(this.x, this.y);
        context.rotate((Math.PI / 180) * this.rotation);
        context.translate(50, -800);
        context.shadowColor = "rgba(0, 0, 0, 0.2)";
        context.shadowBlur    = 20;
        context.shadowOffsetX = 30;
        context.shadowOffsetY = 30;
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
            this.drawResizeHandles(context);
        }
        context.restore();

    }

    public drawLine(context: CanvasRenderingContext2D) {
        // if(this.fill) {
        //     // context.fillStyle = this.fill;
        //     // context.fillRect(this.x, this.y, this.width, this.height);
        // }
        // if(this.stroke) {
        //     // context.setLineDash([]);
        //     // context.strokeStyle = this.stroke.style;
        //     // context.lineWidth = this.stroke.width;
        //     // context.strokeRect(this.x, this.y, this.width, this.height);
        // }
        context.beginPath();
        context.setLineDash([]);
        context.strokeStyle = 'black';
        context.moveTo(this.x, this.y);
        context.lineTo(this.endX, this.endY);
        context.stroke()
        context.closePath();
        if(this.isSelected) {
            this.drawLineResizeHandles(context);
        }
    }
    drawLineResizeHandles(context: CanvasRenderingContext2D) {
        context.setLineDash([]);
        new ResizeHandle('W', {x: this.x, y: this.y}, Math.abs(this.endX - this.x), Math.abs(this.endY - this.y), context);
        // new ResizeHandle('E', {x: this.endX, y: this.endY}, Math.abs(this.endX - this.x), Math.abs(this.endY - this.y), context);
    }

    private drawResizeHandles(context: CanvasRenderingContext2D) {
            context.setLineDash([]);
            context.lineWidth = 1;
            context.strokeStyle = '#00a7f9';
            context.strokeRect(this.x, this.y, this.width, this.height);

            (["NW", "NE", "SW", "SE"] as PolarCoordinate[]).forEach(x => new ResizeHandle(x, {x: this.x, y: this.y}, this.width, this.height, context));

            const text = `${this.width} x ${this.height}`;
            const infoBoxH = 16;
            const textWidth = context.measureText(text).width;
            const infoBoxW = textWidth + 16;
            context.fillStyle = 'rgba(0, 166, 249, 0.7)';

            context.fillRect(this.x + this.width / 2 - infoBoxW / 2, this.y + this.height + 16 - infoBoxH / 2, infoBoxW, infoBoxH);
            context.fillStyle = "#ffffff";
            context.textAlign = "center";
            context.font = "12px Arial";
            context.fillText(text, this.x + this.width / 2, this.y + this.height + 16 + infoBoxH / 3.6);

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
    constructor(public position: PolarCoordinate, private coords: Coords, private width: number, private height: number, private context: CanvasRenderingContext2D) {
        this.createHandle();
    }
    private createHandle() {
        this.context.fillStyle = '#ffffff';
        this.context.strokeStyle = '#000000';

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
                this.context.fillRect(NW.x, NW.y, this.handleSize, this.handleSize);
                this.context.strokeRect(NW.x, NW.y, this.handleSize, this.handleSize);
                break;
            case 'NE':
                this.context.fillRect(NE.x, NE.y, this.handleSize, this.handleSize);
                this.context.strokeRect(NE.x, NE.y, this.handleSize, this.handleSize);
                break;
            case 'SW':
                this.context.fillRect(SW.x, SW.y, this.handleSize, this.handleSize);
                this.context.strokeRect(SW.x, SW.y, this.handleSize, this.handleSize);
                break;
            case 'SE':
                this.context.fillRect(SE.x, SE.y, this.handleSize, this.handleSize);
                this.context.strokeRect(SE.x, SE.y, this.handleSize, this.handleSize);
                break;
            case 'W':
                this.context.fillRect(this.coords.x - this.handleSize, this.coords.y - this.handleSize / 2, this.handleSize, this.handleSize);
                this.context.strokeRect(this.coords.x - this.handleSize, this.coords.y - this.handleSize / 2, this.handleSize, this.handleSize);
                break;
            case 'E':
                this.context.fillRect(this.coords.x - this.handleSize, this.coords.y - this.handleSize / 2, this.handleSize, this.handleSize);
                this.context.strokeRect(this.coords.x - this.width + this.handleSize, this.coords.y + this.height + this.handleSize / 2, this.handleSize, this.handleSize);
                break;
        }
    }
    public mouseIsOver(): boolean {
        return false;
    }
}