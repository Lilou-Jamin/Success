<template>
  <Header/>

  <div class="stats-content">
    <h2>STATISTIQUES "{{ nomQuestionnaire }}"</h2>
    
    <div class="content">
      <p>Moyenne des notes : <b>{{ moyenne }}</b></p>

      <p>Notes des utilisateurs qui ont passé ce questionnaire :</p>

      <div class="each-utlisateur-by-questionnaire-passe" v-for="utilisateur in utilisateursByQuestionnairePasse" :key="utilisateur.id_utilisateur">
        <div class="utilisateur-stats"> 
          <p>{{ utilisateur.nom_utilisateur }}</p>
          <p> {{ utilisateur.note }} / {{ points }}</p>
        </div>
      </div>
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
  import { useRoute } from 'vue-router'

  const route = useRoute();
  const idQuestionnaire = ref(route.query.id); 
  const nomQuestionnaire = ref(route.query.nom); 
  const userId = ref(null);

  const error = ref(null);
  const utilisateursByQuestionnairePasse = ref(null);
  const moyenne = ref(null);
  const points = ref(null);

onMounted(async () => {
  try {
      // Récupère la session actuelle pour savoir qui envoie le formulaire de questions
      const { data, error } = await supabase.auth.getSession();
      if (error) {
          console.error("Erreur lors de la récupération de la session:", error);
      } else if (data.session) {
          userId.value = data.session.user.id;
      } else {
          console.log("Aucune session active trouvée.");
      }
  } catch (err) {
      console.error("Erreur lors de la récupération de la session:", err);
  }

  try {
    // Récupère la moyenne des notes de tous les utilisateurs d'un questionnaire
    const { data, error } = await supabase.rpc('get_moyenne_notes', { questionnaireid: idQuestionnaire.value })

      if (error) {
          console.error('Erreur lors de la récupération de la moyenne :', error.message)
          error.value = error.message;
      } else {
          moyenne.value = data;
      }
  } catch (err) {
      console.error("Erreur lors de la récupération de la session:", err);
  }

  try {
    // Récupère les utilisateurs qui ont passés un questionnaire spécifique
    const { data, error } = await supabase.rpc('get_utilisateurs_by_questionnaire_passe', { questionnaireid: idQuestionnaire.value })

      if (error) {
          console.error('Error fetching classes:', error.message)
          error.value = error.message;
      } else {
          utilisateursByQuestionnairePasse.value = data;
      }
  } catch (err) {
      console.error("Erreur lors de la récupération de la session:", err);
  }

  try {
    // Récupère sur quel nombre de points est le questionnaire (sur 20, 30, 40 etc...)
    const { data, error } = await supabase.rpc('get_total_points_questionnaire', { idquestionnaire: idQuestionnaire.value })

      if (error) {
          console.error('Error fetching classes:', error.message)
          error.value = error.message;
      } else {
          points.value = data;
      }
  } catch (err) {
      console.error("Erreur lors de la récupération de la session:", err);
  }
});


</script>

<style setup>
.stats-content{
  padding: 50px;
  color: #fff;
  margin-bottom: 20px;
  font-size: 24px;
}

.stats-content h2{
  font-size: 32px;
}

.stats-content p{
  margin: 20px;
}

.utilisateur-stats{
  background-color: #193375;
  padding: 20px;
  border-radius: 15px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}


</style>


