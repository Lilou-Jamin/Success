<script setup>
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';
import { useRoute } from 'vue-router';

import '@/assets/base.css';

import { ref, onMounted } from 'vue';
import { supabase } from '@/clients/supabase.js';

const account = ref(null);
const reponses = ref([]);

const route = useRoute();

function markAsCorrect(index) {
  reponses.value.forEach((reponse, i) => {
    reponse.bonne = i === index; // Seul l'index sélectionné a bonne=true
  });
}

function deleteReponse(index) {
  reponses.value.splice(index, 1); // Supprime l'élément à l'index donné
}


async function addReponse() {
  const nouvelleReponse = document.getElementById("reponse").value;
  if (nouvelleReponse !== "") {
    reponses.value.push({ libelle: nouvelleReponse, bonne: false }); // Utilisez 'bonne'
    document.getElementById("reponse").value = ""; // Réinitialiser l'input
  } else {
    alert("Veuillez entrer une réponse valide.");
  }
}

async function getSession() {
  try {
    account.value = await supabase.auth.getSession();
    console.log(account.value);
  } catch (err) {
    console.error("Erreur lors de la récupération de la session :", err);
  }
}

onMounted(() => {
  getSession();
});

async function handleSubmit() {
  const idquestionnaire = route.query.id;
  const titrequestion = document.getElementById("question-name").value;
  const pointsquestion = document.getElementById("points").value;

  // Validation pour s'assurer qu'il y a une bonne réponse
  if (!reponses.value.some(reponse => reponse.bonne)) {
    alert("Veuillez sélectionner au moins une bonne réponse.");
    return;
  }

  // Formatage des réponses pour correspondre à la structure attendue par Supabase
  const reponsesFormatees = reponses.value.map(reponse => ({
    libelle: reponse.libelle,
    bonne: reponse.bonne // Maintien de la structure 'bonne'
  }));

  try {
    const { data, error } = await supabase.rpc('add_question', {
      id_questionnaire: idquestionnaire,
      titre_question: titrequestion,
      points_question: pointsquestion,
      reponses: reponsesFormatees // Envoi des réponses formatées
    });

    if (error) {
      console.error("Erreur lors de la création de la question :", error.message);
      alert("Une erreur est survenue lors de la création de la question.");
    } else {
      console.log("Question créée avec succès :", data);
      alert("La question a été créée avec succès !");
      // Réinitialiser les champs du formulaire
      document.getElementById("question-name").value = '';
      document.getElementById("points").value = '1';
      reponses.value = [];
    }
  } catch (err) {
    console.error("Erreur lors de l'appel à Supabase :", err);
    alert("Une erreur inattendue est survenue.");
  }
}
</script>

<template>
  <Header />

  <div class="main-content">
    <h2>CREER UNE QUESTION</h2>
    <div class="question-result-box">
      <form @submit.prevent="handleSubmit">
        <div class="createQuestion">
          <label class="selabel" for="question-name">Nom de la Question</label>
          <input class="seinput" id="question-name" type="text" placeholder="Nom de la Question" required>

          <label class="selabel" for="points">Nombre de points</label>
          <input class="seinput" id="points" type="number" name="points" placeholder="nombre de points" min="1" value="1" required>

          <label class="selabel" for="reponse">Ajouter une réponse : <br>
            <input class="input_reponse" name="reponse" id="reponse" placeholder="Nouvelle reponse">
            <button type="button" class="reponseButton" @click="addReponse()">Valider</button> 
          </label>

          <label class="selabel" for="reponses">Veuillez cocher l'unique bonne réponse :</label>
          <br>

          <div v-for="(reponse, index) in reponses" :key="index" class="response-option">
            <input 
              type="radio" 
              name="radio" 
              @change="markAsCorrect(index)" 
              :id="'response-' + index" 
            />
            <input 
              type="text" 
              v-model="reponse.libelle" 
              class="input_reponse" 
              placeholder="Réponse" 
            />
            <button 
              type="button" 
              @click="deleteReponse(index)" 
              class="delete-button"
            >
              Supprimer
            </button>
          </div>


          <br>
          <button class="sebutton" type="submit">Envoyer</button>
        </div>
      </form>
    </div>
  </div>

  <Footer />
</template>

<style setup>
.main-content {
  padding: 50px;
}

.question-result-box {
  background-color: #193375;
  padding: 20px;
  border-radius: 10px;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  width: 100%;
  box-shadow:0 4px 8px rgba(0, 0, 0, 0.2);
  justify-content: center;
  align-items: center;
  min-height: 00px;
}

.main-content h2 {
  color: #fff;
  margin-bottom: 20px;
  font-size: 32px;
}

.createQuestion {
  width: 100%;
  max-width: 700px;
  min-width: 300px;
  margin: 0 auto;
}

.seinput, .seselect, .sebutton {
  width: 100%; 
  padding: 12px; 
  font-size: 16px;
  margin-bottom: 15px;
}

.sebutton {
  background-color: #5F6EB1;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 5px;
  font-size: 1em;
  cursor: pointer;
  margin-top: 10px;
  width: 40%;
}

.selabel {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
  display: block;
}

.reponseButton{
  width: 100px;
}

.input_reponse{
  width: 50%;
  padding: 12px 15px;
  margin-bottom: 20px;
  border: 2px solid transparent;
  border-radius: 5px;
  background-color: rgba(255, 255, 255, 0.15);
  color: white;
  font-size: 1em;
  transition: all 0.3s ease;
  outline: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin: 8px;
}
.delete-button {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 4px;
  border-radius: 5px;
  cursor: pointer;
  margin-left: px;
  font-size: 0.9em;
  width: 71px;
}
.delete-button:hover {
  background-color: #c0392b;
}
</style>
