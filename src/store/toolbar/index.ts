import { Module } from 'vuex';
import { GetterTree } from 'vuex';
import { ActionTree } from 'vuex';
import { MutationTree } from 'vuex';
import { RootState } from '../types';
import { Tool, ToolbarStore } from './types';

const namespaced = true;

export const toolbarStore: ToolbarStore = {
    selectedTool: 'SELECT',
};

export const getters: GetterTree<ToolbarStore, RootState> = {
    getSomething(state) {
        return 'something';
    },
};

export const mutations: MutationTree<ToolbarStore> = {
    setSomething(state, something: Tool) {
        state.selectedTool = something;
    },
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
