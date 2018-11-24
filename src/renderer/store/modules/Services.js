import utils from '../../libs/utils';
const state = {
  services: [],
}

const mutations = {
  setServices (state,services) {
    state.services = services;
  },
}

const actions = {
  getAllServices ({ commit }) {
    utils.init();
    utils.allService().then((rows) => {
      commit('setServices',rows);
    });
  }
}

export default {
  state,
  mutations,
  actions
}
