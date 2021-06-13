import { ShapeName } from '@/Types/types';

export const drawShapeGhost = (startX: number, startY: number, mouseX: number, mouseY: number, ctx: CanvasRenderingContext2D, shape: ShapeName): void => {
    ctx!.setLineDash([5, 3]);
    ctx!.strokeStyle = 'black';
    ctx!.lineWidth = 1;
    ctx!.fillStyle = 'rgba(255, 191, 203, 0.3)';
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