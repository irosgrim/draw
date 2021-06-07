import { Module } from 'vuex';
import { GetterTree } from 'vuex';
import { ActionTree } from 'vuex';
import { MutationTree } from 'vuex';
import { RootState } from '../types';
import { Tool, ToolbarStore } from './types';

const namespaced = true;

export const toolbarStore: ToolbarStore = {
    tools: {
        SELECT: {
            label: 'SELECT',
            icon: 'select.svg',
            selected: true,
            disabled: false
        },
        RECTANGLE: {
            label: 'RECTANGLE',
            icon: 'rectangle.svg',
            selected: false,
            disabled: false
        },
        CIRCLE: {
            label: 'CIRCLE',
            icon: 'circle.svg',
            selected: false,
            disabled: false
        },
        LINE: {
            label: 'LINE',
            icon: 'line.svg',
            selected: false,
            disabled: false
        },
        POLYGON: {
            label: 'POLYGON',
            icon: 'polygon.svg',
            selected: false,
            disabled: false
        },
        PAN: {
            label: 'PAN',
            icon: 'pan.svg',
            selected: false,
            disabled: true
        },
        LAYERS: {
            label: 'LAYERS',
            icon: 'layers.svg',
            selected: false,
            disabled: true
        }
    },
    activeTool: 'SELECT',
    contextMenu: {
        visible: false,
        x: 0,
        y: 0,
    },
};

export const getters: GetterTree<ToolbarStore, RootState> = {
    getActiveTool(state) {
        return state.activeTool;
    },
    getContextMenu(state) {
        return state.contextMenu;
    }
};

export const mutations: MutationTree<ToolbarStore> = {
    setActiveTool(state, tool: Tool) {
        state.activeTool = tool;
    },
    showContextMenu(state, payload: { visible: boolean; x: number, y: number}) {
        state.contextMenu = {...payload };
    }
};

export const actions: ActionTree<ToolbarStore, RootState> = {
    async setSomething({ commit }, payload) {
        await commit('setSomething', payload);
    },
};

export const toolbar: Module<ToolbarStore, RootState> = {
    namespaced,
    state: toolbarStore,
    getters,
    actions,
    mutations,
};
