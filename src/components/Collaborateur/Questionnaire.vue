<template>
    <Header/>

    <div class="main-content" v-if="hasAccess">
        <h2>VALIDATION</h2>
        <div class="test-content">
            <div class="test-panel">
                <h2>Questionnaire {{ questionnairenom }}</h2>
                <div class="infos-test">
                    <h3>Nombre de questions : {{ nb_questions }}</h3>
                    <h3>Durée totale : {{ duree }}</h3>
                </div>
                <form @submit.prevent="start">
                    <button type="submit" class="validate-button-test">DÉMARRER</button>
                </form>
            </div>
        </div>
    </div>

    <div v-else class="access-denied">
        <p>Accès refusé : vous n'avez pas accès à ce questionnaire.</p>
    </div>

    <Footer/>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';
import '@/assets/base.css';

import { useRoute } from 'vue-router';
import { supabase } from '@/clients/supabase.js';
import Router from '@/router/index.js';

const route = useRoute();
const questionnaireid = route.query.id;
sessionStorage.setItem("Id Questionnaire", route.query.id);

const questionnairenom = route.query.nom;
sessionStorage.setItem("Nom Questionnaire", route.query.nom);

const duree = ref('');
const nb_questions = ref(null);
const questions = ref(null);
const hasAccess = ref(false); // Indique si l'utilisateur a accès
const error = ref(null);
const iduser = sessionStorage.getItem("Id user");

onMounted(async () => {
    try {
        // Vérifie si l'utilisateur a accès au questionnaire
        const { data: accessData, error: accessError } = await supabase
            .rpc('check_acces', { 
                idutilisateur: iduser, 
                idquestionnaire: questionnaireid 
            });

        if (accessError) {
            console.error("Erreur lors de la vérification de l'accès :", accessError.message);
            return;
        }

        if (accessData) {
            hasAccess.value = true;
            console.log("Accès autorisé");

            // Si l'accès est autorisé, récupérer les données du questionnaire
            await fetchQuestionnaireData();
        } else {
            console.log("Accès refusé");
        }
    } catch (err) {
        console.error("Erreur lors de la vérification de l'accès :", err);
    }
});

async function fetchQuestionnaireData() {
    try {
        // Ajoute dans la table "passer" la date de passage
        const { error } = await supabase.rpc('passer_questionnaire', { id_utilisateur: iduser, id_questionnaire: questionnaireid });
        if (error) console.error("Erreur lors de l'envoi du passage :", error.message);

        // Récupère le nombre de questions
        const { data: nbData, error: nbError } = await supabase.rpc('get_nb_questions_questionnaire', { questionnaireid });
        if (nbError) console.error("Erreur lors de la récupération des infos :", nbError.message);
        else nb_questions.value = nbData;

        // Récupère la durée du questionnaire
        const { data: dureeData, error: dureeError } = await supabase.rpc('get_duree_questionnaire', { questionnaireid });
        if (dureeError) console.error("Erreur lors de la récupération de la durée :", dureeError.message);
        else {
            sessionStorage.setItem('Durée Questionnaire', dureeData);
            duree.value = dureeData;
        }

        // Récupère les questions
        const { data: questionsData, error: questionsError } = await supabase.rpc('get_questions', { questionnaireid });
        if (questionsError) console.error("Erreur lors de la récupération des questions :", questionsError.message);
        else questions.value = questionsData;

    } catch (err) {
        console.error("Erreur lors de la récupération des données :", err);
    }
} 

// Quand on démarre le questionnaire, il nous envoie vers une question
async function start() {
    Router.push({ 
        path: '/Question',
        query: { id: questions.value[0] } 
    });
}
</script>
  
<style>
.test-content{
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(76vh - 120px); 
    flex-grow: 1;
}

.test-panel {
    width: 500px;
    padding: 50px 20px;
    background-color: #19376D; 
    border-radius: 10px;
    text-align: center;
    color: #ffffff; 
    margin: auto;
}

.test-panel h2 {
    font-size: 32px;
    font-weight: bold;
    margin-bottom: 20px;
}

.infos-test{
    text-align: left;
}

.validate-button-test {
    margin-top: 25px;
    padding: 10px;
    background-color: #3d56b2; 
    color: #ffffff;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
}

.access-denied{
    color: #ffffff;
    padding: 20px;
}
</style>