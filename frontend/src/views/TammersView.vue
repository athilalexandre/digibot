<template>
  <div class="tammers">
    <h1>Lista de Tammers</h1>
    <p v-if="loading">Carregando tammers...</p>
    <p v-if="error" style="color: red;">{{ error }}</p>
    <table v-if="tammers.length > 0">
      <thead>
        <tr>
          <th>Username</th>
          <th>Digimon</th>
          <th>Estágio</th>
          <th>Level</th>
          <th>Coins</th>
          <th>XP</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="tammer in tammers" :key="tammer.twitchUserId">
          <td>{{ tammer.username }}</td>
          <td>{{ tammer.digimonName }}</td>
          <td>{{ tammer.digimonStage }}</td>
          <td>{{ tammer.digimonLevel }}</td>
          <td>{{ tammer.coins }}</td>
          <td>{{ tammer.digimonXp }}</td>
        </tr>
      </tbody>
    </table>
    <p v-if="!loading && tammers.length === 0 && !error">Nenhum tammer registrado.</p>
  </div>
</template>

<script>
export default {
  name: 'TammersView',
  data() {
    return {
      tammers: [],
      loading: true,
      error: null
    };
  },
  async created() {
    try {
      const response = await this.$http.get('/tammers');
      this.tammers = response.data;
    } catch (err) {
      this.error = 'Falha ao carregar tammers: ' + (err.response?.data?.message || err.message);
    } finally {
      this.loading = false;
    }
  }
}
</script>
