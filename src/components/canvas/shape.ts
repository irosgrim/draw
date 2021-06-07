import { degreesToRadians, getMouseLocal, mouseIsInsideEllipse, mouseIsInsideRectangle, setTransform } from '@/helpers/geometry';
import { Coords, PolarCoordinate, Shadow, ShapeCoords, ShapeName, Stroke } from '@/Types/types';
import { uid } from 'uid';
import { RadiusHandle, ResizeHandle } from './handles';

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
    public radius: number[] | null = null;
    public shadow: Shadow | null = null;
    private _isMoving = false;
    private _isSelected = false;
    public radiusHandles: RadiusHandle[] | null =  null;
    public resizeHandles: ResizeHandle[] = [];
    
    constructor(type: ShapeName, shapeProperties: {coords?: ShapeCoords, stroke?: Stroke, fill?: string}, copyShape?: {x: number, y: number, h: number, w: number}) {
        this.id = uid(12);
        // const localMouse = getMouseLocal(_mouseX, _mouseY, this.x, this.y, 1, 1, degreesToRadians(15));
        if(type === 'RECTANGLE') {
            this.radius = [0, 0, 0, 0];
        }
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
            return mouseIsInsideEllipse(mouseX, mouseY, offsetX, offsetY, this.x, this.y, this.height, this.width);
        }
        if(this.type === 'RECTANGLE') {
            return mouseIsInsideRectangle(mouseX, mouseY, offsetX, offsetY, this.x, this.y, this.height, this.width);
        }
        if(this.type === 'LINE') { 
          
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
        const horisontalCenter = this.x + ( this.width / 2);
        const verticalCenter = this.y + (this.height / 2);
        
        ctx.translate(horisontalCenter, verticalCenter);
        ctx.rotate(degreesToRadians(this.rotation));
        ctx.translate(- horisontalCenter, - verticalCenter);
        if(this.shadow) {
            this.applyShadow(ctx);
        }
        if(this.radius) {
            const radiuses = this.radius.map( x => this.height/2 > x && this.width/2 > x);
            radiuses?.forEach( (r, i) => {
            if(!r) {
                this.radius![i] = (this.height / 2);
            }
        })
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
        // const getMouseLocal()
        if(this.fill) {
            ctx.fillStyle = this.fill;
            this.roundedRectangle(ctx, this.x, this.y, this.width, this.height, this.radius || [0,0,0,0]);
            ctx.fill();
        }

        if(this.fill && !this.radius) {
            ctx.fillStyle = this.fill;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        
        if(this.stroke) {
            ctx.setLineDash([]);
            ctx.strokeStyle = this.stroke.style;
            ctx.lineWidth = this.stroke.width;
            this.roundedRectangle(ctx, this.x, this.y, this.width, this.height, this.radius || [0,0,0,0]);
            // ctx.strokeRect(this.x, this.y, this.width, this.height);
            ctx.stroke();
        }
        ctx.restore();
        if(this.isSelected) {
            this.drawResizeHandles(ctx);
            this.drawRadiusHandles(ctx);
        }
    }

    private roundedRectangle(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number[]) {
        ctx.beginPath();
        ctx.moveTo(x + radius[0], y);
        ctx.lineTo(x + width - radius[1], y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius[1]);
        ctx.lineTo(x + width, y + height - radius[2]);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius[2], y + height);
        ctx.lineTo(x + radius[3], y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius[3]);
        ctx.lineTo(x, y + radius[0]);
        ctx.quadraticCurveTo(x, y, x + radius[0], y);
        ctx.closePath();
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

    private drawRadiusHandles(ctx: CanvasRenderingContext2D) {
        const handleCoordinate = ["NW", "NE", "SW", "SE"];
        if(this.type === 'RECTANGLE' && this.width >= 50 && this.height >= 50) {
            this.radiusHandles = [];
            (handleCoordinate as PolarCoordinate[]).forEach((polarPosition, index) => {
                this.radiusHandles = [...this.radiusHandles!, new RadiusHandle(polarPosition, {x: this.x, y: this.y}, this.width, this.height, ctx, this.radius![index])]
            });
        }
    }

    public mouseIsOverRadiusHandle(mouseX: number, mouseY: number) {
        if(this.type === 'RECTANGLE') {
            return this.radiusHandles?.find(x => x.mouseIsOver(mouseX, mouseY))?.position || null;
        }
    }

    public mouseIsOverResizeHandle(mouseX: number, mouseY: number) {
        return this.resizeHandles.find(x => x.mouseIsOver(mouseX, mouseY))?.position || null;
    }

    private drawResizeHandles(ctx: CanvasRenderingContext2D) {
        ctx.setLineDash([]);
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#00a7f9';
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        const handleCoordinate = ["NW", "NE", "SW", "SE", "N", "S", "W", "E"];
        this.resizeHandles = [];
        (handleCoordinate as PolarCoordinate[]).forEach(polarPosition=> {
            this.resizeHandles = [...this.resizeHandles, new ResizeHandle(polarPosition, {x: this.x, y: this.y}, this.width, this.height, ctx)];
        });
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
