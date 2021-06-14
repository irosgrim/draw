// dx, dy - distance from current mouse position to the center
export const mouseIsInsideEllipse = (
    mouseX: number, 
    mouseY: number, 
    canvasOffsetX: number, 
    canvasOffsetY: number, 
    ellipseX: number, 
    ellipseY: number, 
    h: number, 
    w: number): boolean => {
    const mX = mouseX - canvasOffsetX;
    const mY = mouseY - canvasOffsetY;
    const radiusX = w / 2;
    const radiusY = h / 2;
    const dx = mX - (ellipseX + w / 2);
    const dy = mY - (ellipseY + h / 2);

    return (((dx ** 2)/(radiusX ** 2)+(dy ** 2)/(radiusY ** 2) <= 1));
}

export const mouseIsInsideRectangle = ( 
    mouseX: number, 
    mouseY: number, 
    canvasOffsetX: number, 
    canvasOffsetY: number,
    rectangleX: number,
    rectangleY: number,
    h: number,
    w: number,
    rotation: number
    ): boolean => {
    const mX = mouseX ;
    const mY = mouseY ;

    const localMouse = getMouseLocal(
        mouseX,
        mouseY,
        rectangleX + w / 2,
        rectangleY + h / 2,
        1,
        1,
        degreesToRadians(rotation)
      );
    
    return (localMouse.x > -w/2 && localMouse.x < w/2 && localMouse.y < h/2 &&localMouse.y > -h/2);
}

export const setTransform = (ctx: CanvasRenderingContext2D, x: number, y: number, scaleX: number, scaleY: number, rotation: number) => {
    const xDx = Math.cos(rotation);
    const xDy = Math.sin(rotation);
    ctx.setTransform(xDx * scaleX, xDy * scaleX, -xDy * scaleY, xDx * scaleY, x, y);
}

export const getMouseLocal = (mouseX: number, mouseY: number, x: number, y: number, scaleX: number, scaleY: number, rotation: number) => {
    const xDx = Math.cos(rotation);
    const xDy = Math.sin(rotation);

    const cross = xDx * scaleX * xDx * scaleY - xDy * scaleX * (-xDy) * scaleY;

    const ixDx = (xDx * scaleY) / cross;
    const ixDy = (-xDy * scaleX) / cross;
    const iyDx = (xDy * scaleY) / cross;
    const iyDy = (xDx * scaleX) / cross;

    mouseX -= x;
    mouseY -= y;

    const localMouseX = mouseX * ixDx + mouseY * iyDx;
    const localMouseY = mouseX * ixDy + mouseY * iyDy;

    return {
        x : localMouseX,
        y: localMouseY,
    }
}

export const degreesToRadians = (degrees: number) => (Math.PI * degrees) / 180;
export const radiansToDegrees = (radians: number) => radians * 180 / Math.PI;