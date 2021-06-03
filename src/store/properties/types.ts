import { Shadow, Stroke } from '@/Types/types';
export interface Color {
    color: string;
    opacity: number;
}
export interface PropertiesStore {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    radius: number[] | null;
    stroke: Stroke | null;
    fill: string;
    shadowX: number;
    shadowY: number;
    shadowBlur: number;
    shadowColor: string;
    canvas: string;
    saveCanvas: boolean;
}