<template>
  <div class="timer-display">
    <span>{{ formatTime(hrs) }}h</span>
    <span>{{ formatTime(min) }}min</span>
    <span>{{ formatTime(sec) }}sec</span>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

// Emit permet d'envoyer des évènements de composants enfants à des composants parents
const emit = defineEmits(['timeUp']);

const hrs = ref(0); 
const min = ref(0); 
const sec = ref(0); 

const initializeTimer = () => {
  const questionnaireduree = sessionStorage.getItem('Durée Questionnaire');
  if (questionnaireduree) {
    const [hours, minutes, seconds] = questionnaireduree.split(':');
    hrs.value = parseInt(hours, 10) || 0;
    min.value = parseInt(minutes, 10) || 0;
    sec.value = parseInt(seconds, 10) || 0;
  }
};

let timerInterval = null; 

const startTimer = () => {
  timerInterval = setInterval(() => {
    if (sec.value > 0) {
      sec.value--;
    } else if (min.value > 0) {
      min.value--;
      sec.value = 59;
    } else if (hrs.value > 0) {
      hrs.value--;
      min.value = 59;
      sec.value = 59;
    } else {
      clearInterval(timerInterval);
      sessionStorage.setItem("Dans les temps", false);
      alert("Temps écoulé, vous ne pouvez plus sélectionner des réponses")
      emit('timeUp'); // Envoie le timeUp au composant parent  
    }
  }, 1000);
};

onMounted(() => {
  sessionStorage.setItem("Dans les temps", true);
  initializeTimer();
  startTimer();
});

const clearTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
};

onUnmounted(() => {
  clearTimer();
});

// Permet d'afficher les heures, minutes et secondes avec deux caractères (rajoute des 0 devant les chiffres seuls)
const formatTime = (value) => {
  return value.toString().padStart(2, "0");
};
</script>