import utils from '../../libs/utils';
const state = {
  datas: [],
}

const mutations = {
  setDatas (state,datas) {
    state.datas = datas;
  },
  setData (state, data) {
    state.datas.push(data);
  },
  updateData (state, payload) {
    const index=state.datas.findIndex((item) => item._id == payload.id);
    state.datas[index] = Object.assign({},state.datas[index],payload.data);
  },
}

const actions = {
  getAllDatas ({ commit }) {
    utils.init();
    utils.allData().then((rows) => {
      commit('setDatas',rows);
    });
  },
  addOneDatas({commit},payload){
    commit('setData',payload);
  },
  updateDatas({commit},payload){
    commit('updateData',payload);
  },
}

export default {
  state,
  mutations,
  actions
}
