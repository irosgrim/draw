import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import { RootState } from './types';
import { properties } from './properties';
import { toolbar } from './toolbar';

Vue.use(Vuex);

const store: StoreOptions<RootState> = {
    state: {
        version: '0.0.1', 
    },
    modules: {
        properties,
        toolbar,
    },
};

export default new Vuex.Store<RootState>(store);
