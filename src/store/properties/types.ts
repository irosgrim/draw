import { Stroke } from '@/Types/types';

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
    stroke: Stroke | null;
    fill: string;
    canvas: string;
}