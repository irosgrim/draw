export type Properties = 'STROKE' | 'FILL' | 'CANVAS' | 'SHADOW';
export type ShapeName = 'RECTANGLE' | 'CIRCLE' | 'LINE';
export type PolarCoordinate = 'NW' | 'NE' | 'SW' | 'SE' | 'N' | 'S' | 'W' | 'E';

export interface ContextMenuProperties {
    visible: boolean;
    coords: Coords;
}
export interface DefaultMenu {
    label: string;
    icon: string;
    selected: boolean;
    disabled: boolean;
}

export interface Dictionary<T> {
    [key: string] : T;
}

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

export interface Shadow {
    color: string;
    x: number;
    y: number;
    blur: number;
}