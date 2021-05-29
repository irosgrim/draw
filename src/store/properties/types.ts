import { Shape } from '@/components/canvas/canvas';
import { Stroke } from '@/Types/types';

export interface Color {
    color: string;
    opacity: number;
}
export interface PropertiesStore {
    selectedShape: Shape | null;
    stroke: Stroke | null;
    fill: Color | null;
    canvas: Color;
}