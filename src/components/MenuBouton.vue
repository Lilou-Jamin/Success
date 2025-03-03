<template>
    <div class="button-container">
      <button class="option">
          <h3>{{ title }}</h3>
          <p>{{ subtitle }}</p>
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
  subtitle: {
    type: String,
    required: true
  }
})
</script>

<style setup>
.button-container{
  display: flex;
}
.button-container h3 {
    font-size: 32px;
  }
    
button.option {
  background-color: #5F6EB1;
  color: white;
  border: none;
  padding: 20px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1.2em;
  text-align: left;
  width: 500px;
}

button.option:hover {
  background-color: #4a5996;
}

button.option p {
  font-size: 0.9em;
  margin-top: 5px;
  color: #c9c9c9;
}
</style>
