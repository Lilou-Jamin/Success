<template>
    <Header/>

    <div class="main-content">
      <h2>RÉSULTATS</h2>
      
      <div class="result-content">
          <p>Vous avez terminé le questionnaire "{{ questionnairenom }}", voici vos résultats : </p>
          <p><u>Total des points :</u> {{ totalPoints }}</p>
        <button @click="goToCorrection" class="result-correction-button">VOIR LA CORRECTION</button>
      </div>
    </div>
   
  <Footer/>
</template>

<script setup>
  import Header from '@/components/Header.vue'
  import Footer from '@/components/Footer.vue'
  import '@/assets/base.css'

  import { ref, onMounted } from 'vue'
  import { supabase } from '@/clients/supabase.js'
  import { useRoute } from 'vue-router';
  import Router from "@/router/index.js"

  const route = useRoute();

  const iduser = sessionStorage.getItem("Id user");
  const questionnaireid = route.query.id;
  const questionnairenom = route.query.nom;
  const totalPoints = ref(null)

onMounted(async () => {
  try {
      // Récupère le total des points d'un questionnaire passé par un collaborateur
      const { data, error } = await supabase
          .rpc('get_note_totale', { idutilisateur: iduser, idquestionnaire: questionnaireid });

      if (error) {
          console.error("Erreur lors de la récupération du total de points :", error.message);
      } else {
          totalPoints.value = data; 
      }
  } catch (err) {
      console.error("Erreur :", err);
  }
});

// Fonction qui redirige vers la correction 
function goToCorrection() {
  Router.push({ 
    path: '/Correction', 
    query: { id: questionnaireid, nom : questionnairenom } 
  });
}
</script>

<style setup>
.main-content{
  padding: 50px;
}

.main-content h2{
  color: #fff;
  margin-bottom: 20px;
  font-size: 32px;
}

.result-content {
  background-color: #193375;
  padding: 20px;
  border-radius: 10px;
  color: #ffffff; 
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.result-content p {
  font-size: 24px;
  margin-bottom: 20px;
}

.result-correction-button {
  padding: 10px;
  background-color: #3d56b2; 
  color: #ffffff;
  border: none;
  border-radius: 5px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  align-self: center;
  width: 300px;
}

.result-correction-button:hover {
  background-color: #5563a4; 
}
</style>


