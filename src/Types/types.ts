export type ShapeName = 'RECTANGLE' | 'CIRCLE';

export interface ShapeElement {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    stroke: Stroke | null;
    fill: string;
    type: ShapeName | '';
    isMoving: boolean;
    isSelected: boolean;
}
export interface Coords {
    x: number;
    y:number;
}

export interface ShapeCoords {
    start: Coords;
    end: Coords;
}

export interface Stroke {
    width: number;
    style: string;
}