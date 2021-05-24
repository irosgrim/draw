export type Tool = 'SELECT' | 'RECTANGLE' | 'CIRCLE';

export interface ToolbarStore {
    selectedTool: Tool;
}