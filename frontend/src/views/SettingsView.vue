<template>
  <div class="settings">
    <h1>Configurações do Bot</h1>
    <p v-if="loading">Carregando configurações...</p>
    <p v-if="error" style="color: red;">{{ error }}</p>
    <p v-if="successMessage" style="color: green;">{{ successMessage }}</p>
    <form @submit.prevent="saveSettings" v-if="config">
      <div>
        <label for="bitConversionRate">Taxa de Conversão de Bits (moedas do chat p/ 1 bit):</label>
        <input type="number" id="bitConversionRate" v-model.number="config.coinConversionRate">
      </div>
      <div>
        <label for="bitValueForEvents">Valor dos Bits em Eventos:</label>
        <input type="number" id="bitValueForEvents" v-model.number="config.coinValueForEvents">
      </div>
      <div>
        <label for="xpMultiplier">Multiplicador de XP para Eventos:</label>
        <input type="number" step="0.1" id="xpMultiplier" v-model.number="config.xpMultiplier">
      </div>
       <div>
        <label for="minTamersForRaid">Mínimo de Tamers para Raid:</label>
        <input type="number" id="minTamersForRaid" v-model.number="config.minTamersForRaid">
      </div>
      <button type="submit" :disabled="saving">Salvar Configurações</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'SettingsView',
  data() {
    return {
      config: null,
      loading: true,
      saving: false,
      error: null,
      successMessage: null
    };
  },
  async created() {
    await this.loadSettings();
  },
  methods: {
    async loadSettings() {
      this.loading = true;
      this.error = null;
      this.successMessage = null;
      try {
        const response = await this.$http.get('/config');
        this.config = response.data;
      } catch (err) {
        this.error = 'Falha ao carregar configurações: ' + (err.response?.data?.message || err.message);
      } finally {
        this.loading = false;
      }
    },
    async saveSettings() {
      this.saving = true;
      this.error = null;
      this.successMessage = null;
      try {
        const payload = { ...this.config };
        delete payload._id; // Não enviar _id
        delete payload.configKey; // Não enviar configKey
        const response = await this.$http.put('/config', payload);
        this.config = response.data;
        this.successMessage = 'Configurações salvas com sucesso!';
      } catch (err) {
        this.error = 'Falha ao salvar configurações: ' + (err.response?.data?.message || err.message);
      } finally {
        this.saving = false;
      }
    }
  }
}
</script>
<style scoped>
form div {
  margin-bottom: 10px;
}
label {
  display: inline-block;
  width: 300px;
  text-align: right;
  margin-right: 10px;
}
input {
  width: 100px;
}
button {
  margin-top: 15px;
  padding: 10px 15px;
}
</style>
