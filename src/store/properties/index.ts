import { Shape } from '@/components/canvas/canvas';
import { Coords, Dictionary, Stroke } from '@/Types/types';
import { Module } from 'vuex';
import { GetterTree } from 'vuex';
import { ActionTree } from 'vuex';
import { MutationTree } from 'vuex';
import { RootState } from '../types';
import { PropertiesStore } from './types';

const namespaced = true;

const defaultProperties = {
    id: '',
    x: 0,
    y: 0,
    stroke: null,
    fill: 'rgba(255, 192, 203, 1)',
    canvas: 'rgba(255, 255, 255, 1)'
}

export const propertiesStore: PropertiesStore = {
    id: '',
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    stroke: null,
    fill: 'rgba(255, 192, 203, 1)',
    canvas: 'rgba(255, 255, 255, 1)',
};

export const getters: GetterTree<PropertiesStore, RootState> = {
    getId(state) {
        return state.id;
    },
    getX(state) {
        return state.x;
    },
    getY(state) {
        return state.y;
    },
    getWidth(state) {
        return state.width;
    },
    getHeight(state) {
        return state.height;
    },
    getStroke(state) {
        return state.stroke;
    },
    getFill(state) {
        return state.fill;
    },
    getCanvas(state) {
        return state.canvas;
    },
};

export const mutations: MutationTree<PropertiesStore> = {
    setCurrentShape(state, shapeProperties: {id:string, x: number, y: number, width: number, height: number, fill: string, stroke: Stroke | null}) {
        state.id = shapeProperties.id;
        state.x = shapeProperties.x;
        state.y = shapeProperties.y;
        state.width = shapeProperties.width;
        state.height = shapeProperties.height;
        state.fill = shapeProperties.fill;
        state.stroke = shapeProperties.stroke;
    },
    setStroke(state, stroke: Stroke | null) {
        state.stroke = stroke;
    },
    setFill(state, color: string) {
        state.fill = color;
    },
    setCanvas(state, color: string) {
        console.log(color);
        state.canvas = color;
    },
    resetProperties(state) {
        state.id = defaultProperties.id;
        state.x = defaultProperties.x;
        state.y = defaultProperties.y;
        state.fill = defaultProperties.fill;
        state.stroke = defaultProperties.stroke;
    },
    setX(state, x: number) {
        state.x = x;
    },
    setY(state, y: number) {
        state.y = y;
    }
};

export const actions: ActionTree<PropertiesStore, RootState> = {
    async setSomething({ commit }, payload) {
        await commit('setSomething', payload);
    },
    async setCurrentShape({ commit }, shapeProperties: {id:string, x: number, y: number, fill: string, stroke: Stroke | null}) {
        await commit('setCurrentShape', shapeProperties);
    },
};

export const properties: Module<PropertiesStore, RootState> = {
    namespaced,
    state: propertiesStore,
    getters,
    actions,
    mutations,
};
