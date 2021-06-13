import { ShapeName } from '@/Types/types';

const shapeGhost = {
    lineDash: [5, 3],
    strokeStyle: 'black',
    lineWidth: 1,
    fillStyle: 'rgba(255, 191, 203, 0.3)'
}

export const drawShapeGhost = (startX: number, startY: number, mouseX: number, mouseY: number, ctx: CanvasRenderingContext2D, shape: ShapeName): void => {
    ctx!.setLineDash(shapeGhost.lineDash);
    ctx!.strokeStyle = shapeGhost.strokeStyle;
    ctx!.lineWidth = shapeGhost.lineWidth;
    ctx!.fillStyle = shapeGhost.fillStyle;
    switch(shape) {
        case 'RECTANGLE':
            ctx.beginPath();
            ctx!.fillRect(startX, startY, mouseX - startX, mouseY - startY);
            ctx!.strokeRect(startX, startY,  mouseX - startX, mouseY - startY);
            ctx.closePath();
            break;
        case 'CIRCLE':
            ctx.beginPath();
            ctx.ellipse(
                mouseX - ((mouseX - startX) / 2), 
                mouseY - ((mouseY - startY) / 2), 
                Math.abs( (mouseX - startX) / 2), 
                Math.abs((mouseY - startY) / 2), 
                0,
                0,
                2*Math.PI
            );
            ctx.stroke();
            ctx.closePath();
            break;
        case 'LINE':
            ctx.moveTo(mouseX, mouseY);
            ctx!.strokeStyle = 'rgba(255, 191, 255, 0.9)';
            ctx.beginPath();
            ctx.lineTo(mouseX, mouseY);
            ctx.stroke()
            ctx.closePath();
            break;
    }
}