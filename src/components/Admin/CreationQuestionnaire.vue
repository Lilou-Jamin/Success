<script setup>
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';

import '@/assets/base.css';

import { ref, onMounted } from 'vue';
import { supabase } from '@/clients/supabase.js';
import { useRouter } from 'vue-router';

const account = ref(null);
const classes = ref([]);
const selectedClasses = ref([]);
const router = useRouter();

async function getSession() {
  try {
    account.value = await supabase.auth.getSession();
    console.log(account.value);
  } catch (err) {
    console.error("Erreur lors de la récupération de la session :", err);
  }
}

async function fetchClasses() {
  try {
    const { data: testData, error: testError } = await supabase.rpc('get_classe');

    if (testError) {
      console.error("Erreur lors de la récupération des classes :", testError.message);
    } else {
      classes.value = testData;
      console.log("Données reçues :", classes.value);
    }
  } catch (err) {
    console.error("Erreur :", err);
  }
}

onMounted(() => {
  getSession();
  fetchClasses();
});

async function handleSubmit() {
  const nomQuestionnaire = document.getElementById("questionnaire-name").value.trim();
  let heure = parseInt(document.getElementById("heure").value) || 0;
  let minutes = parseInt(document.getElementById("minutes").value) || 0;
  const classeSelect = selectedClasses.value;

  // Vérification que les classes sont sélectionnées
  if (!classeSelect || classeSelect.length === 0) {
    alert("Veuillez sélectionner au moins une classe.");
    return;
  }

  // Validation des valeurs d'heure et minute
  if (heure < 0 || heure > 23) {
    alert("L'heure doit être entre 0 et 23.");
    return;
  }

  if (minutes < 0 || minutes > 59) {
    alert("Les minutes doivent être entre 0 et 59.");
    return;
  }

  // Vérification du nom du questionnaire et durée
  if (!nomQuestionnaire || (heure === 0 && minutes === 0)) {
    alert("Veuillez remplir tous les champs correctement.");
    return;
  }

  const formattedTime = `${String(heure).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;

  try {
    // Appel RPC Supabase
    const { data, error } = await supabase.rpc('create_questionnaire', {
      matiere_questionnaire: nomQuestionnaire,
      temps_pour_questionnaire: formattedTime,
      id_groupes_select: classeSelect,
    });

    if (error) {
      console.error("Erreur lors de la création du questionnaire :", error.message);
      alert("Une erreur est survenue lors de la création du questionnaire.");
      return;
    }

    console.log("Questionnaire créé avec succès :", data);
    alert("Le questionnaire a été créé avec succès !");

    // Réinitialisation du formulaire
    document.getElementById("questionnaire-name").value = '';
    document.getElementById("heure").value = '';
    document.getElementById("minutes").value = '';
    selectedClasses.value = [];
    router.push('/ListeQuestionnaires');

  } catch (err) {
    console.error("Erreur lors de l'appel à Supabase :", err);
    alert("Une erreur inattendue est survenue.");
  }
}


// Limite la valeur maximale pour les inputs
function limitInput(event, max) {
  let value = event.target.value;
  if (value > max) {
    event.target.value = max;
  }
}
</script>


<template>
  <Header />

  <div class="main-content">
    <h2>CRÉER UN QUESTIONNAIRE</h2>
    <div class="priority-result-box">
      <form @submit.prevent="handleSubmit">
        <div class="createQuestionnaire">
          <label class="selabel" for="questionnaire-name">Nom du questionnaire</label>
          <input class="seinput" id="questionnaire-name" type="text" placeholder="Nom du Questionnaire" required>

          <div class="time">
            <label class="selabel" for="heure">Heures</label>
            <input class="seinput" id="heure" type="number" name="heure" placeholder="H" min="0" max="23" required
                   @input="limitInput($event, 23)">
            <label class="selabel" for="minutes">Minutes</label>
            <input class="seinput" id="minutes" type="number" name="minutes" placeholder="M" min="0" max="59" required
                   @input="limitInput($event, 59)">
          </div>

          <label class="selabel">Classes</label>
          <div class="checkbox-group">
            <div v-for="classe in classes" :key="classe.id_classe" class="checkbox-item">
              <input 
                type="checkbox"
                :id="'classe-' + classe.id_classe"
                :value="classe.id_classe"
                v-model="selectedClasses"
              />
              <label :for="'classe-' + classe.id_classe">{{ classe.nom_classe }}</label>
            </div>
          </div>
          <br>
          <button class="sebutton" type="submit">Valider</button>
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

.priority-result-box {
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
    min-height: 300px;
}

.main-content h2 {
  color: #fff;
  margin-bottom: 20px;
  font-size: 32px;
}

.createQuestionnaire {
  width: 100%;
  max-width: 600px;
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

.time {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.time input {
  flex: 1;
}
</style>