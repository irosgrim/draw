import { Module } from 'vuex';
import { GetterTree } from 'vuex';
import { ActionTree } from 'vuex';
import { MutationTree } from 'vuex';
import { CanvasStore } from './types';
import { RootState } from '../types';
import { Shape } from '@/components/canvas/shape';

const namespaced = true;

export const canvasStore: CanvasStore = {
    shapes: null,
};

export const getters: GetterTree<CanvasStore, RootState> = {
    getShapes(state) {
        return state.shapes;
    }
};

export const mutations: MutationTree<CanvasStore> = {
    newShape(state, payload: {id: string, shape: Shape}) {
        if(!state.shapes) {
            state.shapes = {};
        }
        state.shapes = {[payload.id]: payload.shape, ...state.shapes};
    }
};

export const actions: ActionTree<CanvasStore, RootState> = {

};

export const canvas: Module<CanvasStore, RootState> = {
    namespaced,
    state: canvasStore,
    getters,
    actions,
    mutations,
};
