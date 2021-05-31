export type Tool = 'SELECT' | 'RECTANGLE' | 'CIRCLE' | 'PAN' | 'LINE';

export interface ToolbarStore {
    selectedTool: Tool;
}