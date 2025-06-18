import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    botStatus: false,
    mongoStatus: false,
    activeUsers: [],
    config: {
      twitchUsername: '',
      oauthToken: '',
      channelName: '',
      mongoPath: '',
      mongoUri: '',
      showChat: false,
      chatMode: 'embed'
    }
  },
  mutations: {
    SET_BOT_STATUS(state, status) {
      state.botStatus = status
    },
    SET_MONGO_STATUS(state, status) {
      state.mongoStatus = status
    },
    SET_ACTIVE_USERS(state, users) {
      state.activeUsers = users
    },
    SET_CONFIG(state, config) {
      state.config = { ...state.config, ...config }
    }
  },
  actions: {
    updateBotStatus({ commit }, status) {
      commit('SET_BOT_STATUS', status)
    },
    updateMongoStatus({ commit }, status) {
      commit('SET_MONGO_STATUS', status)
    },
    updateActiveUsers({ commit }, users) {
      commit('SET_ACTIVE_USERS', users)
    },
    updateConfig({ commit }, config) {
      commit('SET_CONFIG', config)
    }
  },
  getters: {
    isBotOnline: state => state.botStatus,
    isMongoOnline: state => state.mongoStatus,
    getActiveUsers: state => state.activeUsers,
    getConfig: state => state.config
  }
}) 