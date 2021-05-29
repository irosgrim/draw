import { Coords, PolarCoordinate, ShapeCoords, ShapeName, Stroke } from '@/Types/types';
import { uid } from 'uid';

export class Shape {
    public id = '';
    public x = 0;
    public y = 0;
    public width = 0;
    public height = 0;
    public stroke: Stroke | null = null;
    public fill = '';
    public type: ShapeName | '' = '';
    public _isMoving = false;
    public _isSelected = false;
    
    constructor(type: ShapeName, shapeProperties: {coords: ShapeCoords, stroke?: Stroke, fill?: string}) {
        this.id = uid(12);
        if(shapeProperties.coords.end.x <= shapeProperties.coords.start.x) {
            this.x = shapeProperties.coords.end.x;
            this.width = Math.abs(shapeProperties.coords.start.x - shapeProperties.coords.end.x);
        } else {
            this.x = shapeProperties.coords.start.x;
            this.width = Math.abs(shapeProperties.coords.end.x - shapeProperties.coords.start.x);
        }
        if(shapeProperties.coords.end.y <= shapeProperties.coords.start.y) {
            this.y = shapeProperties.coords.end.y;
            this.height = Math.abs(shapeProperties.coords.start.y - shapeProperties.coords.end.y);
        } else {
            this.y = shapeProperties.coords.start.y;
            this.height = Math.abs(shapeProperties.coords.end.y - shapeProperties.coords.start.y);
        }
        this.stroke = shapeProperties.stroke ? shapeProperties.stroke : null;
        this.fill = shapeProperties.fill ? shapeProperties.fill : '';
        this.type = type;
    }
    public mouseIsOver(e: MouseEvent, offsetX: number, offsetY: number) {
        const mouseX = e.clientX - offsetX;
        const mouseY = e.clientY - offsetY;
        if (
            mouseX > this.x &&
            mouseX < this.x + this.width &&
            mouseY > this.y &&
            mouseY < this.y + this.height
        ) {
            return true;
        } else {
            return false;
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


        }
    }
    private drawCircle(context: CanvasRenderingContext2D) {
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
            this.drawPolarCoordinates(context);
        }
        context.closePath();
    }
    private drawPolarCoordinates(context: CanvasRenderingContext2D) {
        context.setLineDash([]);
        context.lineWidth = 1;
        context.strokeStyle = '#00a7f9';
        context.strokeRect(this.x, this.y, this.width, this.height);
        (["NW", "NE", "SW", "SE"] as PolarCoordinate[]).forEach(x => new ResizeHandler(x, {x: this.x, y: this.y}, this.width, this.height, context));
    }

    private drawRectangle(context: CanvasRenderingContext2D) {
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
            context.setLineDash([]);
            context.lineWidth = 1;
            context.strokeStyle = '#00a7f9';
            context.strokeRect(this.x, this.y, this.width, this.height);
            (["NW", "NE", "SW", "SE"] as PolarCoordinate[]).forEach(x => new ResizeHandler(x, {x: this.x, y: this.y}, this.width, this.height, context));
        }
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
        this.mouseX = e.clientX - this.offsetX;
        this.mouseY = e.clientY - this.offsetY;
    }
    public get mousePosition(): Coords {
        return {
            x: this.mouseX,
            y: this.mouseY
        }
    }
}

export class ResizeHandler {
    private handlerSize = 5;
    constructor(public position: PolarCoordinate, private coords: Coords, private width: number, private height: number, private context: CanvasRenderingContext2D) {
        this.createHandler();
    }
    private createHandler() {
        this.context.fillStyle = '#ffffff';
        this.context.strokeStyle = '#000000';

        const NW = {
            x: this.coords.x - this.handlerSize / 2,
            y: this.coords.y - this.handlerSize / 2
        }

        const NE = {
            x: this.coords.x + this.width - this.handlerSize / 2,
            y: NW.y,
        }

        const SW = {
            x: NW.x, 
            y: this.coords.y + this.height - this.handlerSize / 2
        }

        const SE = {
            x: NE.x,
            y: SW.y
        }

        switch (this.position) {
            
            case 'NW':
                this.context.fillRect(NW.x, NW.y, this.handlerSize, this.handlerSize);
                this.context.strokeRect(NW.x, NW.y, this.handlerSize, this.handlerSize);
                break;
            case 'NE':
                this.context.fillRect(NE.x, NE.y, this.handlerSize, this.handlerSize);
                this.context.strokeRect(NE.x, NE.y, this.handlerSize, this.handlerSize);
                break;
            case 'SW':
                this.context.fillRect(SW.x, SW.y, this.handlerSize, this.handlerSize);
                this.context.strokeRect(SW.x, SW.y, this.handlerSize, this.handlerSize);
                break;
            case 'SE':
                this.context.fillRect(SE.x, SE.y, this.handlerSize, this.handlerSize);
                this.context.strokeRect(SE.x, SE.y, this.handlerSize, this.handlerSize);
                break;
        }
    }
    public mouseIsOver(): boolean {
        return true;
    }
}