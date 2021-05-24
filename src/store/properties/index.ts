import { Module } from 'vuex';
import { GetterTree } from 'vuex';
import { ActionTree } from 'vuex';
import { MutationTree } from 'vuex';
import { RootState } from '../types';
import { PropertiesStore } from './types';

const namespaced = true;

export const propertiesStore: PropertiesStore = {
    background: '#ffffff',
    stroke: null,
    fill: 'pink',
    borderRadius: null,
    something: '',
};

export const getters: GetterTree<PropertiesStore, RootState> = {
    getSomething(state) {
        return 'something';
    },

};

export const mutations: MutationTree<PropertiesStore> = {
    setSomething(state, something: string) {
        state.something = something;
    },
};

export const actions: ActionTree<PropertiesStore, RootState> = {
    async setSomething({ commit }, payload) {
        await commit('setSomething', payload);
    },
};

export const properties: Module<PropertiesStore, RootState> = {
    namespaced,
    state: propertiesStore,
    getters,
    actions,
    mutations,
};
