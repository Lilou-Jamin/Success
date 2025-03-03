<!-- Explication : "isEditable" permet de faire apparaitre une zone de texte à remplir (en fonction de si true ou false)
                    "isEmpty" si on ne veut rien d'autre que le "+" (true pour que sa marche) 
                    "initialText" pour afficher du text a coté du +
                    "onClick" appelle la fonction que vous mettez quand on click sur le plus -->

<template>
  <div class="button-container">
    <div v-if="isEmpty"></div>

    <textarea
      name="new_classe"
      v-else-if="isEditable"
      v-model="text"
      rows="4" cols="50"
      class="custom-textarea"
      :placeholder="placeholderText"
      required
    ></textarea>
    
    <p class="text" v-else>{{ text }}</p>

    <img :src="filename" alt="Image" class="image" @click="handleClick" style="cursor: pointer;" />
  </div>
</template>

<script setup>
import { ref, defineProps } from 'vue'

const props = defineProps({
  filename: {
    type: String,
    required: true
  },
  isEditable: {
    type: Boolean,
    required: true
  },
  isEmpty: {
    type: Boolean,
    default: false
  },
  initialText: {
    type: String,
    default: '' 
  },
  placeholderText: {
    type: String,
    default: 'text' 
  },
  fonction: {
    type: String,
    default: '' 
  },
  onClick: {
    type: Function,
    required: true
  }
})

const text = ref(props.initialText)

// Fonction appellée par le bouton
function handleClick() {
    if (!text.value || text.value.trim() === '') {
        console.log('Veuillez entrer une valeur.');
        return;
    }
    props.onClick(text.value);
}


</script>

<style scoped>

.text{
  color: antiquewhite;
}

.button-container {
  align-items: center;
  display: flex;
  justify-content: flex-end;
}

img{
  margin-left: 5px;
}

.custom-textarea {
  background-color: #6c7989; 
  color: white;
  border: none;
  border-radius: 5px; 
  padding: 10px; 
  font-family: Arial, sans-serif; 
  font-size: 14px; 
  text-align: center; 
  width: 200px; 
  height: 40px; 
  resize: none; 
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.custom-textarea::placeholder {
  color: white; 
  opacity: 0.8; 
}

.custom-textarea:focus {
  outline: none; 
  box-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
}

button{
  all: unset;
}
</style>
