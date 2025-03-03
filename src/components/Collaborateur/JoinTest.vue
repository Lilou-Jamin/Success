<template>
    <Header/>
    <div class="join-content">
        <div class="join-panel">
            <h2>REJOINDRE UN QUESTIONNAIRE</h2>
            <form @submit.prevent="submitKey">
                <input type="text" v-model="key" placeholder="Clé (5 chiffres)" class="key-input" required/>
                <button type="submit" class="validate-button">VALIDER</button>
            </form>
        </div>
    </div>
    <Footer/>
</template>
  
<script setup>
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import '@/assets/base.css'

import { ref } from 'vue'
import { supabase } from '@/clients/supabase.js'
import Router from "@/router/index.js"

const key = ref(""); 
const userId = ref(null);

// Fonction qui envoie la clé pour pouvoir accéder au questionnaire
async function submitKey() {
    try {
        // Récupère la session actuelle pour savoir qui envoie la clé
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

    if (key.value) {
        console.log("Clé envoyée :", key.value);
        
        try {
            // Appel de la fonction 'get_cle_questionnaire'
            const { data: idData, error: idError } = await supabase
                .rpc('get_cle_questionnaire', { key: key.value });

            if (idError) {
                console.log("Erreur lors de la récupération de la clé :", idError.message);
                return;
            }

            const idTest = idData.split(' . ');
            const idQuestionnaire = idTest[0];

            // Redirection vers la page du questionnaire
            Router.push({ 
                path: '/Questionnaire',
                query: { id: idQuestionnaire, nom: idTest[1] } 
            });
        } catch (error) {
            console.error("Erreur inattendue :", error);
        }
    }
}
</script>
  
<style>
.join-content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 120px); 
  flex-grow: 1;
}

.join-panel {
    width: 500px;
    padding: 50px 20px;
    background-color: #19376D; 
    border-radius: 10px;
    text-align: center;
    color: #ffffff; 
    margin: auto;
}

.join-panel h2 {
    font-size: 1.5em;
    font-weight: bold;
    margin-bottom: 20px;
}


.key-input {
    width: 100%;
    padding: 10px;
    margin-bottom: 20px;
    border: none;
    border-radius: 5px;
    background-color: #5a6b88; 
    color: #ffffff; 
}

.validate-button {
    padding: 10px;
    background-color: #3d56b2; 
    color: #ffffff;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
}

.validate-button:hover {
    background-color: #4b66d2; 
}
</style>