<template>
    <Header/>
    <div class="main-content">
        <h2>HISTORIQUE</h2>
        <div class="each-questionnaire-passe" v-for="questionnaire in questionnairesPasses" :key="questionnaire.id_questionnaire">
          <MenuSelect :title="`Questionnaire ${questionnaire.nom_questionnaire}`" :filename="statsImage" @click="goToEval(questionnaire.id_questionnaire, questionnaire.nom_questionnaire)"/>
        </div>
    </div>
    <Footer/>
</template>

<script setup>
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';
import MenuSelect from '@/components/MenuSelect.vue';
import statsImage from '@/components/icons/stats.svg';
import { useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';
import { supabase } from '@/clients/supabase.js';

const questionnairesPasses = ref([]); 
const router = useRouter(); 
const userId = ref(null);

// Fonction pour récupérer les questionnaires passés
onMounted(async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Erreur lors de la récupération de la session:", error);
      return;
    }
    
    if (data && data.session) {
      userId.value = data.session.user.id;
      sessionStorage.setItem('Id user', userId.value);
      console.log("ID de l'utilisateur connecté :", userId.value);
    } else {
      console.log("Aucune session active trouvée.");
    }
  } catch (err) {
    console.error("Erreur lors de la récupération de la session:", err);
  }

  // Assurez-vous que l'ID utilisateur est défini avant de récupérer les questionnaires
  if (userId.value) {
    try {
      const { data: questionnaires, error } = await supabase.rpc('get_questionnaires_by_iduser', { idutilisateur: userId.value });

      if (error) {
        console.error("Erreur lors de la récupération des questionnaires d'un utilisateur :", error.message);
      } else {
        questionnairesPasses.value = questionnaires;
        console.log("Questionnaires passés :", questionnairesPasses.value);
      }
    } catch (err) {
      console.error("Erreur :", err);
    }
  }
});

// Fonction pour aller vers la page d'évaluation
function goToEval(idQuestionnaire, nomQuestionnaire) {
  router.push({ 
    path: '/StatEvaluation', 
    query: { id: idQuestionnaire, nom: nomQuestionnaire } 
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

.menu-buttons{
  display: flex;
  flex-direction: column;
  gap: 2rem
}
</style>