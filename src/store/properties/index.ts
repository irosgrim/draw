import { Shape } from '@/components/canvas/shape';
import { Coords, Dictionary, Shadow, Stroke } from '@/Types/types';
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
    width: 0,
    height: 0,
    stroke: null,
    fill: 'rgba(255, 192, 203, 1)',
    shadowX: 0,
    shadowY: 0,
    shadowBlur: 0,
    shadowColor: '',
    canvas: 'rgba(255, 255, 255, 1)',
}

const defaultShadow = {
    color: 'rgba(255, 24, 42, 0.8)',
    x: 10,
    y: 10,
    blur: 20,
}

export const propertiesStore: PropertiesStore = {
    id: '',
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    radius: [5, 5, 5, 5],
    stroke: null,
    fill: 'rgba(255, 192, 203, 1)',
    shadowX: 0,
    shadowY: 0,
    shadowBlur: 0,
    shadowColor: '',
    canvas: 'rgba(255, 255, 255, 1)',
    saveCanvas: false,
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
    getRadius(state): any | null {
        if(state.radius) {
            return {
                NW: state.radius[0],
                NE: state.radius[1],
                SE: state.radius[2],
                SW: state.radius[3],
            }
        }
        return null;
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
    getShadowColor(state) {
        return state.shadowColor;
    },
    getShadow(state) {
        return {
            x: state.shadowX,
            y: state.shadowY,
            blur: state.shadowBlur,
            color: state.shadowColor,
        }
    },
    getShapeProperties(state) {
        return {
            id: state.id,
            x: state.x,
            y: state.y,
            width: state.width,
            height: state.height,
            stroke: state.stroke,
            fill: state.fill,
            shadowX: state.shadowX,
            shadowY: state.shadowY,
            shadowBlur: state.shadowBlur,
            shadowColor: state.shadowColor,
        }
    },
    getSaveCanvas(state) {
        return state.saveCanvas;
    }
};

export const mutations: MutationTree<PropertiesStore> = {
    updateProperties(state, properties: { x?: number, y?: number, width?: number, height?: number }) {
        state.x = properties.x || state.x;
        state.y = properties.y || state.y;
        state.width = properties.width || state.width;
        state.height = properties.height || state.height;
    },
    updateProperty(state, payload: {property: string, value: string}) {
        if(payload.property === 'X') {
            state.x = parseFloat(payload.value);
        }
        if(payload.property === 'Y') {
            state.y = parseFloat(payload.value);
        }
        if(payload.property === 'WIDTH') {
            state.width = parseFloat(payload.value);
        }
        if(payload.property === 'HEIGHT') {
            state.height = parseFloat(payload.value);
        }
    },
    setDefaultShadow(state) {
            state.shadowX = defaultShadow.x;
            state.shadowY = defaultShadow.y;
            state.shadowBlur = defaultShadow.blur;
            state.shadowColor = defaultShadow.color;
    },
    setCurrentShape(state, shapeProperties: {
        id:string, 
        x: string, 
        y: string, 
        width: string, 
        height: string, 
        fill: string, 
        stroke: Stroke | null,
        shadowX: string,
        shadowY: string,
        shadowBlur: string,
        shadowColor: string,
        radius: number[] | null,
    }) {
        state.id = shapeProperties.id || state.id;
        state.x = parseInt(shapeProperties.x, 10) || state.x;
        state.y = parseInt(shapeProperties.y, 10) || state.y;
        state.width = parseInt(shapeProperties.width, 10) || state.width;
        state.height = parseInt(shapeProperties.height, 10) || state.height;
        state.fill = shapeProperties.fill || state.fill;
        state.stroke = shapeProperties.stroke || state.stroke;
        state.shadowX = parseInt(shapeProperties.shadowX, 10) || state.shadowX;
        state.shadowY = parseInt(shapeProperties.shadowY, 10) || state.shadowY;
        state.shadowBlur = parseInt(shapeProperties.shadowBlur, 10) || state.shadowBlur;
        state.shadowColor = shapeProperties.shadowColor || state.shadowColor;
        state.radius = shapeProperties.radius;
    },
    setShadow(state, shadowProperty: {property: 'shadowX' | 'shadowY' | 'shadowBlur' | 'shadowColor', value: string | number}) {
        // @ts-ignore
        state[shadowProperty.property] = shadowProperty.value;
    },
    // setShadowColor(state, shadowColor: string) {
    //     console.log('new color', shadowColor);
    //     const newShadow = {...state.shadow, color: shadowColor};
    //     Object.assign(state.shadow, newShadow);
    //     // state.shadow!.color = shadowColor;
    // },
    setStroke(state, stroke: Stroke | null) {
        state.stroke = stroke;
    },
    setFill(state, color: string) {
        state.fill = color;
    },
    setCanvas(state, color: string) {
        state.canvas = color;
    },
    removeShadow(state) {
        state.shadowBlur = 0;
        state.shadowX = 0;
        state.shadowY = 0;
        state.shadowColor = '';
    },
    resetProperties(state) {
        state.id = defaultProperties.id;
        state.x = defaultProperties.x;
        state.y = defaultProperties.y;
        state.fill = defaultProperties.fill;
        state.stroke = defaultProperties.stroke;
        state.shadowBlur = defaultProperties.shadowBlur;
        state.shadowColor = defaultProperties.shadowColor;
        state.shadowX = defaultProperties.shadowX;
        state.shadowY = defaultProperties.shadowY;
    },
    setX(state, x: number) {
        state.x = x;
    },
    setY(state, y: number) {
        state.y = y;
    },
    setRadius(state, payload: {corner: string, value: string}) {
        console.log(payload)
        const value = parseInt(payload.value, 10);
        if(state.radius) {
            switch(payload.corner) {
                case 'NW':
                    state.radius.splice(0, 1, value);
                    break;
                case 'NE':
                    state.radius.splice(1, 1, value);
                    break;
                case 'SW':
                    state.radius.splice(2, 1, value);
                    break;
                case 'SE':
                    state.radius.splice(3, 1, value);
                    break;
            }
        }
    },
    saveCanvas(state) {
        state.saveCanvas = !state.saveCanvas;
    }
};

export const actions: ActionTree<PropertiesStore, RootState> = {
    async setSomething({ commit }, payload) {
        await commit('setSomething', payload);
    },
    async setCurrentShape({ commit }, shapeProperties: {id?:string, x?: number, y?: number, fill?: string, stroke?: Stroke | null, shadow?: Shadow | null}) {
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
