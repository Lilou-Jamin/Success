<template>
  <Header />

  <div class="main-content">
    <h2>CORRECTION "{{ questionnairenom }}"</h2>
    <div class="correction-content">
      <div class="each-question" v-for="question in questions" :key="question.id_question">
        <div class="question-title">
          <h3>{{ question.titre_question }}</h3>
          <span class="question-points">· {{ question.points_question }} pts</span>
        </div>

        <div class="question-answers">
          <ul class="answer">
            <!-- On parcourt chaque réponse d'une question -->
            <li v-for="reponse in question.reponses" :key="reponse.id_reponse">
              <div>
                <!-- Vérifie que correction existe avant d'accéder à ses propriétés -->
                 <!-- Si la réponse est celle donnée par l'utilisateur et qu'elle est correcte, on l'affiche en vert -->
                <p v-if="question.correction && reponse.libelle_reponse === question.correction.libelle_reponse && question.correction.avoir_bon">
                  <span class="correct">{{ reponse.libelle_reponse }}</span>
                </p>

                <!-- Si la réponse est celle donnée par l'utilisateur mais qu'elle est fausse, on l'affiche en rouge -->
                <p v-else-if="question.correction && reponse.id_reponse === question.correction.id_reponse && !question.correction.avoir_bon">
                  <span class="incorrect">{{ reponse.libelle_reponse }}</span>
                </p>

                <!-- Si la réponse est celle donnée par l'utilisateur mais qu'elle est fausse, on affiche la bonne en vert -->
                <p v-else-if="question.correction && reponse.libelle_reponse === question.correction.libelle_reponse && !question.correction.avoir_bon">
                  <span class="correct">{{ reponse.libelle_reponse }}</span>
                </p>

                <p v-else>
                  <span class="radio-label">{{ reponse.libelle_reponse }}</span>
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
  <Footer />
</template>

<script setup>
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';
import '@/assets/base.css';

import { useRoute } from 'vue-router';
import { ref, onMounted } from 'vue';
import { supabase } from '@/clients/supabase.js'

const route = useRoute();
const idquestionnaire = route.query.id;
const questionnairenom = route.query.nom;

const questions = ref([]);
const userId = ref(null);

onMounted(async () => {
  try {
    // On récupère l'utilisateur connecté
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Erreur lors de la récupération de la session:", error);
    } else if (data && data.session) {
      userId.value = data.session.user.id;
      console.log(userId.value)
    } else {
      console.log("Aucune session active trouvée.");
    }
  } catch (err) {
    console.error("Erreur lors de la récupération de la session:", err);
  }

  if (userId.value && idquestionnaire) {
  try {
    // Récupération des questions
    const { data: questionsData, error: questionsError } = await supabase
      .rpc('get_questions_by_idquestionnaire', { questionnaireid: idquestionnaire });

    if (questionsError) {
      console.error("Erreur lors de la récupération des questions :", questionsError.message);
    } else {
      questions.value = questionsData;
    }

    // Récupération des réponses de l'utilisateur
    const { data: correctionData, error: correctionError } = await supabase
      .rpc('get_user_reponses', { id_utilisateur: userId.value, questionnaireid: idquestionnaire });

    if (correctionError) {
      console.error("Erreur lors de la récupération des réponses utilisateur :", correctionError.message);
    } else {
      // Associer chaque correction à la question correspondante
      questions.value = questions.value.map(question => { // .map() crée un nouveau tableau en appliquant une fonction à chaque élément du tableau existant
        const correction = correctionData.find(c => c.id_question === question.id_question); // .find() recherche le premier élément dans correctionData qui satisfait une condition donnée
        return {
          ...question, // ... ajoute toutes les propriétés de l'objet question au nouvel objet retourné
          correction: correction || { libelle_reponse: "Non répondu", avoir_bon: false, id_bonne_reponse: null },
        };
      });
    }
  } catch (err) {
    console.error("Erreur :", err);
  }
}
});
</script>

<style scoped>
.correction-content{
  color: white;
}

.correct {
  color: green;
}

.incorrect {
  color: red;
}

.bonne-reponse {
  font-weight: bold;
  margin-top: 5px;
}
</style>