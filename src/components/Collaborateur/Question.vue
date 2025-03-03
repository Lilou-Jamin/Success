<template>
    <Header/>

    <div class="main-content">
        <div class="question-content">
            <div class="question-header">
                <h2> {{ questionnairenom }}</h2>
                <h2> Temps restant : <Countdown @timeUp="handleTimeUp"/></h2> <!-- Evenement associé quand le temps est écoulé -->
            </div>

            <form id="test" @submit.prevent="submitForm">
                <div class="each-question" v-for="question in questions" :key="question.id_question">
                    <div class="question-title">
                        <h3> {{ question.titre_question }}</h3>
                        <span class="question-points">· {{ question.points_question }} pts</span>
                    </div>

                    <div class="question-answers">
                        <ul class="answer">
                            <li v-for="reponse in question.reponses" :key="reponse.id_reponse">
                                <label>
                                    <input class="radio-input" type="radio"
                                    :name="'question_' + question.id_question"
                                    :value="reponse.id_reponse"
                                    :disabled="inputsDisabled"/> <!-- Désactive les boutons radio quand le temps est écoulé -->

                                    <span class="radio-label">{{ reponse.libelle_reponse }}</span>
                                </label>
                            </li>
                        </ul>
                    </div>
                </div>
                <input class="send-answers-button" type="submit" value="Envoyer les réponses"/>
            </form>     
        </div>
    </div>
    <Footer/>
</template>

<script setup>
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import '@/assets/base.css'

import Countdown from '@/components/Countdown.vue'

import { supabase } from '@/clients/supabase.js'
import { ref, onMounted } from 'vue'
import Router from "@/router/index.js"

const questionnaireid = sessionStorage.getItem("Id Questionnaire");
const questionnairenom = sessionStorage.getItem("Nom Questionnaire");

// Pour envoyer les réponses
const answers = [];

const questions = ref(null);
const userId = ref(null);

// Pour disabled les boutons radios à la fin du countdown
const inputsDisabled = ref(false);

onMounted(async () => {
    try {
        // Récupère la session actuelle pour savoir qui envoie le formulaire de questions
        const { data, error } = await supabase.auth.getSession();
        if (error) {
            console.error("Erreur lors de la récupération de la session:", error);
        } else if (data.session) {
            userId.value = data.session.user.id;
            sessionStorage.setItem('Id user', userId.value);

            console.log("ID de l'utilisateur connecté :", userId.value);
        } else {
            console.log("Aucune session active trouvée.");
        }
    } catch (err) {
        console.error("Erreur lors de la récupération de la session:", err);
    }

    try {
        // Récupère les question et leurs réponses associées par questionnaire 
        const { data: questionsData, error: questionsError } = await supabase
            .rpc('get_questions_by_idquestionnaire', { questionnaireid });

        if (questionsError) {
            console.error("Erreur lors de la récupération des questions :", questionsError.message);
        } else {
            console.log("Questions et réponses :", questionsData);
            questions.value = questionsData; // Tout est stocké dans questions
        }
    } catch (err) {
        console.error("Erreur :", err);
    }
});

// Fonction déclenchée lorsque le temps est écoulé
const handleTimeUp = () => {
  inputsDisabled.value = true;
};


// Fonction qui envoie l'id user, l'id question, l'id reponse sélectionnée et si l'user a répondu dans les temps vers Supabase
async function submitForm() {
    if (!userId.value) {
        console.error("Utilisateur non connecté");
        return;
    }

    questions.value.forEach(question => {
        const selectedAnswer = document.querySelector(
            `input[name="question_${question.id_question}"]:checked`
        );

        // Si une réponse a été sélectionnée
        if (selectedAnswer) {
            answers.push({
                id_user: userId.value,
                id_question: question.id_question,
                id_reponse: parseInt(selectedAnswer.value),
            });
        } else {
            console.warn(`Aucune réponse sélectionnée pour la question ${question.id_question}`);
        }
    });

    try {
        // Envoyer chaque réponse via la fonction a_repondu
        for (const answer of answers) {
            const { error } = await supabase.rpc('a_repondu', {
                id_utilisateur: answer.id_user,
                id_question: answer.id_question,
                idreponse: answer.id_reponse,
            });

            if (error) {
                console.error(
                    `Erreur lors de l'envoi de la réponse pour la question ${answer.id_question}:`,
                    error.message
                );
            }
        }

        try {
        // Fait l'insert dans passer
        const { data, error } = await supabase
            .rpc('insert_note_questionnaire', { questionnaireid: questionnaireid, idutilisateur: userId.value });

        if (error) {
            console.error("Erreur lors de l'insert dans passer' :", error.message);
        } else {
            console.log("L'insert est fait:");
        }
    } catch (err) {
        console.error("Erreur :", err);
    }
        console.log("Toutes les réponses ont été soumises.");

        // Redirection vers la page de fin
        Router.push({ 
            path: '/StatEvaluation', 
            query: { id: questionnaireid, nom: questionnairenom } 
        });

    } catch (err) {
        console.error("Erreur lors de l'envoi des réponses :", err);
    }
}
</script>

<style setup>
.question-content{
    color: white;
}

.question-header {
  display: flex;
  justify-content: space-between; 
  align-items: center; 
  font-size: 24px; 
}

.question-content h3{
    font-style: italic;
    font-size: 1.5rem;
}

.question-title{
    display: inline-flex;
    align-items: first baseline;
}

.each-question{
    border: solid 2px #738ebf;
    border-radius: 10px;
    padding: 20px;
    background: #19376D;
    margin-bottom: 1rem;
}
.question-answers{
    padding: 10px;
}

.answer{
    list-style: none;
}
.radio-input + .radio-label {
  display: inline-flex;
  align-items: center;
  font-size: 16px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.2rem;
}
.send-answers-button{
    margin-top: 25px;
    padding: 10px;
    background-color: #3d56b2; 
    color: #ffffff;
    border: none;
    border-radius: 5px;
    font-size: 1.2rem;
    font-weight: bold;
    cursor: pointer;
}
</style>