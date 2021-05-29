import { Shape } from '@/components/canvas/canvas';
import { Coords, Stroke } from '@/Types/types';
import { Module } from 'vuex';
import { GetterTree } from 'vuex';
import { ActionTree } from 'vuex';
import { MutationTree } from 'vuex';
import { RootState } from '../types';
import { Color, PropertiesStore } from './types';

const namespaced = true;

export const propertiesStore: PropertiesStore = {
    selectedShape: null,
    stroke: null,
    fill: {
        color: '#ffc0cb',
        opacity: 100
    },
    canvas: {
        color: '#ffffff',
        opacity: 100
    },
};

export const getters: GetterTree<PropertiesStore, RootState> = {
    getCurrentShape(state): Shape | null{
        return state.selectedShape;
    },
    getStroke(state) {
        return state.stroke;
    },
    getFill(state) {
        return state.fill ;
    },
    getCanvas(state) {
        return state.canvas;
    },
};

export const mutations: MutationTree<PropertiesStore> = {
    setCurrentShape(state, shape: Shape | null) {
        state.selectedShape = shape;
    },
    resetProperties(state, shape: Shape | null) {
        state.fill = {
            color: '#ffc0cb',
            opacity: 100
        }
        state.stroke = null;
    },
    setCurrentShapePosition(state, coords: Coords) {
        if(state.selectedShape) {
            state.selectedShape.x = coords.x;
            state.selectedShape.y = coords.y;
        }
    },
    setStroke(state, stroke: Stroke) {
        state.stroke = stroke;
    },
    setFill(state, color: Color) {
        state.fill = color;
    },
    setCanvas(state, color: Color) {
        state.canvas = color;
    },
};

export const actions: ActionTree<PropertiesStore, RootState> = {
    async setSomething({ commit }, payload) {
        await commit('setSomething', payload);
    },
    setCurrentShape({ commit }, shape: Shape | null) {
        commit('setCurrentShape', shape);
        commit('resetProperties');
    },
};

export const properties: Module<PropertiesStore, RootState> = {
    namespaced,
    state: propertiesStore,
    getters,
    actions,
    mutations,
};
