<script setup>
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';
import { useRoute } from 'vue-router';
import { ref, onMounted } from 'vue';
import { supabase } from '@/clients/supabase.js';

const account = ref(null);
const reponses = ref([]);
const infos = ref([]);

// Variables réactives pour les champs de formulaire
const titrequestion = ref("");
const difficultequestion = ref("facile");

const route = useRoute();

function markAsCorrect(index) {
  reponses.value.forEach((reponse, i) => {
    reponse.bonne_reponse = i === index; // Seul l'index sélectionné est correct
  });
}

function deleteReponse(index) {
  reponses.value.splice(index, 1); // Supprime l'élément à l'index donné
}

async function addReponse() {
  const nouvelleReponse = document.getElementById("reponse").value;
  if (nouvelleReponse !== "") {
    reponses.value.push({ libelle_reponse: nouvelleReponse, bonne_reponse: false });
    document.getElementById("reponse").value = ""; 
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
    const { data, error } = await supabase.rpc('get_details_question', { idquestion });

    if (error) {
      console.error("Erreur lors de la récupération des données de la question :", error.message);
    } else {
      infos.value = data;
      if (data.length > 0) {
        titrequestion.value = data[0].titre_question;  
        difficultequestion.value = data[0].difficulte_question; 
      }
      console.log("Données question :", infos.value);
    }
  } catch (err) {
    console.error("Erreur lors de l'appel à Supabase :", err);
  }

  try {
    const { data, error } = await supabase.rpc('get_details_reponses', { idquestion });

    if (error) {
      console.error("Erreur lors de la récupération des données de réponses :", error.message);
    } else {
      reponses.value = data;
      console.log("Données réponses :", reponses.value);
    }
  } catch (err) {
    console.error("Erreur lors de l'appel à Supabase :", err);
  }
});


async function handleSubmit() {
  const idquestion = route.query.id;

  // Validation : s'assurer qu'il y a au moins une bonne réponse
  if (!reponses.value.some(reponse => reponse.bonne_reponse)) {
    alert("Veuillez sélectionner au moins une bonne réponse.");
    return;
  }

  // Formatage des réponses
  const reponsesFormatees = reponses.value.map(reponse => ({
    libelle: reponse.libelle_reponse,
    bonne: reponse.bonne_reponse,
  }));

  try {
    const { data, error } = await supabase.rpc('update_question', {
      idquestion,
      titrequestion: titrequestion.value,
      difficulte: difficultequestion.value,
      reponses: reponsesFormatees,
    });

    if (error) {
      alert("Une erreur est survenue lors de la modification de la question.");
    } else {
      alert("La question a été modifiée avec succès !");
    }
  } catch (err) {
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
          <label class="selabel" for="question-name">Nom de la question</label>
          <input 
            class="seinput" 
            id="question-name" 
            type="text" 
            placeholder="Nom de la question" 
            v-model="titrequestion" 
            required 
          />

          <label class="selabel" for="difficulte">Difficulté</label>
          <select v-model="difficultequestion" class="seinput" id="difficulte">
            <option value="facile">Facile</option>
            <option value="intermediaire">Intermédiaire</option>
            <option value="difficile">Difficile</option>
          </select>

          <label class="selabel" for="reponse">Ajouter une réponse :</label>
          <input class="input_reponse" name="reponse" id="reponse" placeholder="Nouvelle réponse">
          <button type="button" class="reponseButton" @click="addReponse()">Valider</button>

          <label class="selabel" for="reponses">Veuillez cocher l'unique bonne réponse :</label>

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
          <button class="sebutton" type="submit">Envoyer</button>
        </div>
      </form>
    </div>
  </div>

  <Footer />
</template>


<style setup>

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

.createQuestion {
  width: 100%;
  max-width: 700px;
  min-width: 500px;
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
  font-size: 20px;
  width: 110px;
}
.delete-button:hover {
  background-color: #c0392b;
}
</style>
