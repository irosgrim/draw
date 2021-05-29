import { Shape } from '@/components/canvas/canvas';
import { Coords, Dictionary, Stroke } from '@/Types/types';
import { Module } from 'vuex';
import { GetterTree } from 'vuex';
import { ActionTree } from 'vuex';
import { MutationTree } from 'vuex';
import { RootState } from '../types';
import { Color, PropertiesStore } from './types';

const namespaced = true;

const defaultProperties = {
    id: '',
    x: 0,
    y: 0,
    stroke: null,
    fill: {
        color: '#ffc0cb',
        opacity: 100
    },
    canvas: {
        color: '#ffffff',
        opacity: 100
    }
}

export const propertiesStore: PropertiesStore = {
    id: '',
    x: 0,
    y: 0,
    width: 0,
    height: 0,
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
    setCurrentShape(state, shapeProperties: {id:string, x: number, y: number, width: number, height: number, fill: Color, stroke: Stroke | null}) {
        state.id = shapeProperties.id;
        state.x = shapeProperties.x;
        state.y = shapeProperties.y;
        state.width = shapeProperties.width;
        state.height = shapeProperties.height;
        state.fill = { color: shapeProperties.fill.color, opacity: shapeProperties.fill.opacity ? shapeProperties.fill.opacity : 100};
        state.stroke = shapeProperties.stroke;
    },
    setStroke(state, stroke: Stroke | null) {
        state.stroke = stroke;
    },
    setFill(state, color: Color) {
        state.fill = color;
    },
    setCanvas(state, color: Color) {
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
    async setCurrentShape({ commit }, shapeProperties: {id:string, x: number, y: number, fill: Color, stroke: Stroke | null}) {
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
