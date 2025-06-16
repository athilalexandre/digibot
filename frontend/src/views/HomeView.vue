<template>
  <div class="home">
    <h1>Status da API</h1>
    <p v-if="loading">Carregando status...</p>
    <p v-if="error" style="color: red;">{{ error }}</p>
    <p v-if="apiStatus">{{ apiStatus.message }} (Status: {{ apiStatus.status }})</p>
  </div>
</template>

<script>
export default {
  name: 'HomeView',
  data() {
    return {
      apiStatus: null,
      loading: true,
      error: null
    };
  },
  async created() {
    try {
      const response = await this.$http.get('/bot/status');
      this.apiStatus = response.data;
    } catch (err) {
      this.error = 'Falha ao carregar status da API: ' + (err.response?.data?.message || err.message);
    } finally {
      this.loading = false;
    }
  }
}
</script>
