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
    w: number
    ): boolean => {
    const mX = mouseX - canvasOffsetX;
    const mY = mouseY - canvasOffsetY;
    
    return (mX > rectangleX && mX < rectangleX + w && mY > rectangleY && mY < rectangleY + h)
}