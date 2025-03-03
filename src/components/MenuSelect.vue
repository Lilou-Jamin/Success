<template>
  <div class="button-container">
      <button class="card" @click="$emit('onClick')">  
          <p class="title">{{ title }}</p>
          <p class="classe">{{ classe }}</p>
          <div class="icon">
              <!-- Utilisation correcte de la prop pour l'URL de l'image -->
              <img :src="filename" />
          </div>
      </button>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
title: {
  type: String,
  required: true
},
classe: {
  type: String,
  required: false
},
filename: {
  type: String,
  required: true
}
})
</script>

<style setup>
  .card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #19376D;
    padding: 20px;
    border-radius: 10px;
    margin-bottom: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    width: 40%;
  }
  
  .title {
    color: white;
    font-size: 32px;
    font-weight: bold;
  }
  
  .icon {
    background-color: #5F6EB1;
    padding: 10px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  img{
    height: 50px;
  }

</style>
