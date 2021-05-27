export type Tool = 'SELECT' | 'RECTANGLE' | 'CIRCLE' | 'PAN';

export interface ToolbarStore {
    selectedTool: Tool;
}