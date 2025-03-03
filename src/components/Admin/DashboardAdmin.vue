<script setup> 
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import MenuSelect from '@/components/MenuSelect.vue'
import statsImage from '@/components/icons/stats.svg'
import Router from "@/router/index.js"

import '@/assets/base.css'

import { ref, onMounted } from 'vue'
import { supabase } from '@/clients/supabase.js'

const account = ref();
getSession();

async function getSession(){
account.value = await supabase.auth.getSession();
console.log(account.value)
}

const questionnairesPasses = ref(null);
const idQuestionnaire = ref(null);

onMounted(async () => {
    try {
        // Récupère les questionnaires depuis Supabase
        const { data, error: testError } = await supabase.rpc('get_questionnaires_passes')

        if (testError) {
            console.error('Error fetching classes:', testError.message)
            error.value = testError.message;
        } else {
            questionnairesPasses.value = data;
        }
    } catch (err) {
        console.error("Erreur lors de la récupération de la session:", err);
    }
})

function goToStatQuestionnaire(id_questionnaire, nom_questionnaire){
    Router.push({
        path: '/StatQuestionnaire',
        query: { id: id_questionnaire, nom: nom_questionnaire }
    });
}
</script>

<template>
    <Header/>
    <div class="main-content">
        <h2>STATISTIQUES DES QUESTIONNAIRES PASSÉS</h2>
        <div v-if="questionnairesPasses && questionnairesPasses.length > 0">
            <MenuSelect
            v-for="(questionnairePasse, index) in questionnairesPasses"
            :key="questionnairePasse.id_questionnaire"
            :title="questionnairePasse.nom_questionnaire"
            :filename="statsImage"
            @onClick="goToStatQuestionnaire(questionnairePasse.id_questionnaire, questionnairePasse.nom_questionnaire)" 
            />
        </div>
    </div>
    <Footer/>
</template>