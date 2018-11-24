import utils from '../../libs/utils';
const state = {
  services: [],
}

const mutations = {
  setServices (state,services) {
    state.services = services;
  },
  setService (state, service) {
    state.services.push(service);
  },
  updateService (state, payload) {
    const index=state.services.findIndex((item) => item._id == payload.id);
    state.services[index] = Object.assign({},state.services[index],payload.data);
  },
}

const actions = {
  getAllServices ({ commit }) {
    utils.init();
    utils.allService().then((rows) => {
      commit('setServices',rows);
    });
  },
  addOneServices({commit},payload){
    commit('setService',payload);
  },
  updateServices({commit},payload){
    commit('updateService',payload);
  },
}

export default {
  state,
  mutations,
  actions
}
