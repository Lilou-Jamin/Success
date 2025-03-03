<script setup>
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';
import { useRoute } from 'vue-router';

import '@/assets/base.css';

import { ref, onMounted } from 'vue';
import { supabase } from '@/clients/supabase.js';

const account = ref(null);
const reponses = ref([]);

const infos = ref([]);

const route = useRoute();


function markAsCorrect(index) {
  reponses.value.forEach((reponse, i) => {
    reponse.bonne_reponse = i === index; // Seul l'index sélectionné a bonne=true
  });
}

function deleteReponse(index) {
  reponses.value.splice(index, 1); // Supprime l'élément à l'index donné
}


async function addReponse() {
  const nouvelleReponse = document.getElementById("reponse").value;
  if (nouvelleReponse !== "") {
    reponses.value.push({ libelle_reponse: nouvelleReponse, bonne_reponse: false });
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


onMounted(async () => {

  getSession();
  const idquestion = route.query.id;

  try {
    const { data, error } = await supabase.rpc('get_details_question', {idquestion: idquestion});

    if (error) {
      console.error("Erreur lors de la récupération des donées de question :", error.message);
    } else {
      infos.value = data;
      console.log("Data question : ", infos.value);
    }
    
  } catch (err) {
    console.error("Erreur lors de l'appel à Supabase :", err);
  }

  try {
    const { data, error } = await supabase.rpc('get_details_reponses', {idquestion: idquestion});
    if (error) {
      console.error("Erreur lors de la récupération des donées de réponses :", error.message);
    } else {
      reponses.value = data;
      console.log("Data reponses : ", reponses.value);
    }
    
  } catch (err) {
    console.error("Erreur lors de l'appel à Supabase :", err);
  }
});

async function handleSubmit() {
  const idquestion = route.query.id;
  const titrequestion = document.getElementById("question-name").value;
  const pointsquestion = document.getElementById("points").value;

  // Formatage des réponses pour correspondre à la structure attendue par Supabase
  const reponsesFormatees = reponses.value.map(reponse => ({
    libelle: reponse.libelle_reponse,
    bonne: reponse.bonne_reponse,
  }));


  try {
    console.log(reponsesFormatees);
    const { data, error } = await supabase.rpc('update_question', {
      idquestion: idquestion,
      titrequestion: titrequestion,
      points: pointsquestion,
      reponses: reponsesFormatees // Envoi des réponses formatées
    });

    if (error) {
      console.error("Erreur lors de la modification de la question :", error.message);
      alert("Une erreur est survenue lors de la modification de la question.");
    } else {
      console.log("Question  avec succès :", data);
      alert("La question a été modifiée avec succès !");
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
    <h2>MODIFIER LA QUESTION</h2>
    <div class="question-result-box">
      <form @submit.prevent="handleSubmit">
        <div class="createQuestion">
          <div v-for="(question, index) in infos" :key="index">
            <label class="selabel" for="question-name">Nom de la Question</label>
            <input class="seinput" id="question-name" type="text" placeholder="Nom de la Question" :value="question.titre_question" required>

            <label class="selabel" for="points">Nombre de points</label>
            <input class="seinput" id="points" type="number" name="points" placeholder="nombre de points" min="1" :value="question.nb_points" required>
          </div>
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
              v-model="reponse.bonne_reponse"
              :checked="reponse.bonne_reponse"
            />
            <input 
              type="text" 
              v-model="reponse.libelle_reponse" 
              class="input_reponse"
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
