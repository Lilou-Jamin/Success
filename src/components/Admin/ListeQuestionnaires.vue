<script setup>
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';
import Poubelle from '@/components/icons/trash.svg';
import Ajouter from '@/components/icons/ajouter.png';
import edit from '@/components/icons/edit.png';

import '@/assets/base.css';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '@/clients/supabase.js';

const router = useRouter();
const account = ref();
const questionnaires = ref([]);

async function getSession() {
  account.value = await supabase.auth.getSession();
  console.log(account.value);
}

function goToCreationQuestionnaire() {
  console.log("Redirection vers la page de création...");
  router.push('/CreationQuestionnaire');
}

async function fetchQuestionnaires() {
  try {
    const { data: testData, error: testError } = await supabase.rpc('get_informations_questionnaire');

    if (testError) {
      console.error("Erreur lors de la récupération des questionnaires :", testError.message);
    } else {
      questionnaires.value = testData;
      console.log("Données reçues :", questionnaires.value);
    }
  } catch (err) {
    console.error("Erreur :", err);
  }
}

async function deleteQuestionnaire(id_questionnaire) {
  const confirmation = confirm("Êtes-vous sûr de vouloir supprimer ce questionnaire ?");
  if (!confirmation) return;

  try {
    const { data, error } = await supabase.rpc('delete_questionnaire', { idquestionnaire: id_questionnaire });

    if (error) {
      console.error("Erreur lors de la suppression du questionnaire :", error.message);
    } else {
      console.log("Questionnaire supprimé :", data);
      questionnaires.value = questionnaires.value.filter(q => q.id_questionnaire !== id_questionnaire);

    }
  } catch (err) {
    console.error("Erreur lors de l'appel à Supabase :", err);
  }
}

function formatDate(date) {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Date(date).toLocaleDateString('fr-FR', options);
}

function goToDetailsQuestionnaire(id_questionnaire) {
  router.push({ 
    path: '/DetailsQuestionnaire', 
    query: { id: id_questionnaire }
  });
}


onMounted(() => {
  getSession();
  fetchQuestionnaires();
});
</script>

<template>
  <Header />

  <div class="main-content">
    <div class="Titre_et_Ajouter">
      <h2>EVALUATION</h2>
      <img :src="Ajouter" @click="goToCreationQuestionnaire" />
    </div>
    <div class="liste-questionnaire-result-box">
      <table>
        <thead>
          <tr>
            <th>Nom du Questionnaire</th>
            <th>Classe Assigné</th>
            <th>Date de création</th>
            <th>Code</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="questionnaire in questionnaires" :key="questionnaire.id_questionnaire">
            <td>{{ questionnaire.nom_questionnaire }}</td>
            <td>{{ questionnaire.nom_classe }}</td>
            <td>{{ formatDate(questionnaire.date_creation_questionnaire) }}</td>
            <td>{{ questionnaire.cle_questionnaire }}</td>
            <td>
              <img 
                :src="edit" 
                alt="Modifier" 
                title="Modifier" 
                @click="goToDetailsQuestionnaire(questionnaire.id_questionnaire)" 
              />
              <img 
                :src="Poubelle" 
                alt="Supprimer" 
                title="Supprimer" 
                @click="deleteQuestionnaire(questionnaire.id_questionnaire)" 
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <Footer />
</template>

<style setup>
.main-content {
  padding: 50px;
}

.liste-questionnaire-result-box {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  background-color: #193375; 
  padding: 20px;
  border-radius: 10px;
  color: #ffffff; 
  display: flex;
  width: 100%; 
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.Titre_et_Ajouter {
  display: flex;
  justify-content: space-between;
}
.Titre_et_Ajouter img {
  cursor: pointer;
}

table {
  width: 90%;
  border-collapse: collapse;
  text-align: center;
  vertical-align: middle;
}

th, td {
  padding: 6px;
  border: 2px solid #738EBF;
}

th {
  background-color: #738EBF;
  color: #ffffff;
  padding: 20px;
}

table img {
  width: 40px;
  height: 40px;
  cursor: pointer;
  margin: 0 5px;
}

td {
  color: white;
}

.main-content h2 {
  color: #fff;
  margin-bottom: 20px;
  font-size: 32px;
}

.correction-button {
  background-color: #6673c6;
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  align-self: flex-end;
}

.correction-button:hover {
  background-color: #5563a4;
}
</style>
