<!-- exemple d'utilisation sur la page "Classe.vue", "GestionCollaborateur.vue" ou enore "GestionCollaborateur.vue" -->

<template>
  <div class="overlay" @click="closeOverlay">
    <div class="overlay-content" @click.stop> <!-- Empêche de fermer l'overlay quand tu clique dessus -->
      <slot></slot>
    </div>
  </div>
</template>
  
<script>

export default {
  methods: {
    closeOverlay() {
      this.$emit('close-overlay'); // Fermer l'overlay
    }
  }
};
</script>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.overlay-content {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

</style>