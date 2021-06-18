import { Shape } from '@/components/canvas/shape';
import { Dictionary } from '@/Types/types';


export interface CanvasStore {
    shapes: Dictionary<Shape> | null;
}