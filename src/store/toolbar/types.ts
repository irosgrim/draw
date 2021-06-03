import { DefaultMenu, Dictionary } from '@/Types/types';

export type Tool = 'SELECT' | 'RECTANGLE' | 'CIRCLE' | 'PAN' | 'LINE';

export interface ToolbarStore {
    tools: Dictionary<DefaultMenu>;
    activeTool: Tool;
    contextMenu: {
        visible: boolean;
        x: number;
        y: number;
    }
}

export interface ContextMenu {
    visible: boolean;
    x: number;
    y: number;
}