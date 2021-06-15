import { degreesToRadians, getMouseLocal, mouseIsInsideEllipse, mouseIsInsideRectangle, setTransform } from '@/helpers/geometry';
import { PolarCoordinate, Shadow, ShapeCoords, ShapeName, Stroke } from '@/Types/types';
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
    public scale = 1;
    
    constructor(type: ShapeName, shapeProperties: {coords?: ShapeCoords, stroke?: Stroke, fill?: string}, copyShape?: {x: number, y: number, h: number, w: number}) {
        this.id = uid(12);

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

    private drawLineResizeHandles(ctx: CanvasRenderingContext2D) {
        ctx.setLineDash([]);
        new ResizeHandle('W', {x: this.x, y: this.y}, Math.abs(this.endX - this.x), Math.abs(this.endY - this.y), ctx, this.scale);
        // new ResizeHandle('E', {x: this.endX, y: this.endY}, Math.abs(this.endX - this.x), Math.abs(this.endY - this.y), ctx);
    }

    private drawResizeHandles(ctx: CanvasRenderingContext2D, scale = 1) {
        ctx.setLineDash([]);
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#00a7f9';
        ctx.strokeRect(-this.width/2, -this.height/2, this.width, this.height);

        const handleCoordinate = ["NW", "NE", "SW", "SE", "N", "S", "W", "E"] as PolarCoordinate[];
        this.resizeHandles = [];

        handleCoordinate.forEach(polarPosition=> {
            this.resizeHandles = [...this.resizeHandles, new ResizeHandle(polarPosition, {x: -this.width/2, y:-this.height/2}, this.width, this.height, ctx, scale)];
        });

        const text = `${this.width} x ${this.height}`;
        const infoBoxH = 16;
        const textWidth = ctx.measureText(text).width;
        const infoBoxW = textWidth + 16;

        ctx.fillStyle = 'rgba(0, 166, 249, 0.7)';
        ctx.fillRect(-this.width/2 + this.width / 2 - infoBoxW / 2, -this.height/2 + this.height + 16 - infoBoxH / 2, infoBoxW, infoBoxH);
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.font = "12px Arial";
        ctx.fillText(text, -this.width/2 + this.width / 2, -this.height/2 + this.height + 16 + infoBoxH / 3.6);
    }

    private drawRadiusHandles(ctx: CanvasRenderingContext2D) {
        const handleCoordinate = ["NW", "NE", "SW", "SE"] as PolarCoordinate[];
        if(this.type === 'RECTANGLE' && this.width >= 50 && this.height >= 50) {
            this.radiusHandles = [];
            handleCoordinate.forEach((polarPosition, index) => {
                this.radiusHandles = [...this.radiusHandles!, new RadiusHandle(polarPosition, {x: -this.width/2, y: -this.height/2}, this.width, this.height, ctx, this.radius![index])]
            });
        }
    }

    public mouseIsOver(e: MouseEvent, offsetX: number, offsetY: number) {
        const mouseX = e.clientX - offsetX;
        const mouseY = e.clientY - offsetY;

        if(this.type === 'CIRCLE') {
            return mouseIsInsideEllipse(mouseX, mouseY, offsetX, offsetY, this.x, this.y, this.height, this.width);
        }

        if(this.type === 'RECTANGLE') {
            return mouseIsInsideRectangle(mouseX, mouseY, offsetX, offsetY, this.x, this.y, this.height, this.width, this.rotation);
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
        // const horisontalCenter = this.x + ( this.width / 2);
        // const verticalCenter = this.y + (this.height / 2);

        // ctx.translate(horisontalCenter, verticalCenter);
        // ctx.rotate(degreesToRadians(this.rotation));
        // ctx.translate(- horisontalCenter, - verticalCenter);
        setTransform(
            ctx,
            this.x + this.width / 2,
            this.y + this.height / 2,
            this.scale,
            this.scale,
            degreesToRadians(this.rotation)
          );

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
            ctx.ellipse(0, 0, this.width/2, this.height/2, 0, 0, 2*Math.PI);
            ctx.fill();
        }

        if(this.stroke) {
            ctx.setLineDash([]);
            ctx.strokeStyle = this.stroke.style;
            ctx.lineWidth = this.stroke.width;
            ctx.ellipse(-this.width/2, -this.height/2, this.width/2, this.height/2, 0, 0, 2*Math.PI);
            ctx.stroke();
        }

        // ctx.restore();

        if(this.isSelected) {
            this.drawResizeHandles(ctx);
        }
        ctx.closePath();
    }

    public drawRectangle(ctx: CanvasRenderingContext2D) {
        // ctx.save();
        // setTransform(
        //     ctx,
        //     this.x + this.width / 2,
        //     this.y + this.height / 2,
        //     1,
        //     1,
        //     degreesToRadians(this.rotation)
        //   );

        if(this.fill) {
            ctx.fillStyle = this.fill;
            this.roundedRectangle(ctx, -this.width/2, -this.height/2, this.width, this.height, this.radius || [0,0,0,0]);
            ctx.fill();
        }

        if(this.fill && !this.radius) {
            ctx.fillStyle = this.fill;
            ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
        }
        
        if(this.stroke) {
            ctx.setLineDash([]);
            ctx.strokeStyle = this.stroke.style;
            ctx.lineWidth = this.stroke.width;
            this.roundedRectangle(ctx, -this.width/2, -this.height/2, this.width, this.height, this.radius || [0,0,0,0]);
            ctx.stroke();
        }

        
        if(this.isSelected) {
            this.drawResizeHandles(ctx, this.scale);
            this.drawRadiusHandles(ctx);
        }
        // ctx.restore();
    }

    public drawLine(ctx: CanvasRenderingContext2D) {
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

    public mouseIsOverRadiusHandle(mouse: {x: number, y:number}) {
        const localMouse = getMouseLocal(
            mouse.x,
            mouse.y,
            this.x + this.width / 2,
            this.y + this.height / 2,
            1,
            1,
            degreesToRadians(this.rotation)
          );
        if(this.type === 'RECTANGLE') {

            return this.radiusHandles?.find(x => x.mouseIsOver(localMouse.x, localMouse.y))?.position || null;
        }
    }

    public mouseIsOverResizeHandle(mouse: {x: number, y: number}) {
        const localMouse = getMouseLocal(
            mouse.x,
            mouse.y,
            this.x + this.width / 2,
            this.y + this.height / 2,
            1,
            1,
            degreesToRadians(this.rotation)
          );
        return this.resizeHandles.find(x => x.mouseIsOver(localMouse.x, localMouse.y))?.position || null;
    }

}
