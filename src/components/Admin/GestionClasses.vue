<template classe="all">
    <Header />
        <!-- Titre et bouton pour ajouter une classe -->
        <div class="Top_page">
            <h2>GESTION DES CLASSES</h2>
            <ButtonAdd :isEditable="true" :filename="logo_add" :onClick="add_classe" :placeholderText="'Nom pour nouvelle classe'" />
        </div>
        <!-- Affichage des classes -->
        <div class="Mid_page">
            <div v-if="classes && classes.length > 0">
                <MenuSelect
                    v-for="(classe, index) in classes"
                    :key="classe.id_classe"
                    :title="classe.nom_classe"
                    :filename="Edit"
                    @onClick="goToClasse(classe.id_classe)" 
                />
            </div>
        </div>
    <Footer />
</template>

<script setup>

import { ref, onMounted } from 'vue'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import ButtonAdd from '@/components/ButtonAdd.vue'
import { supabase } from '@/clients/supabase.js'
import logo_add from '@/components/icons/logo_add.png'
import MenuSelect from '@/components/MenuSelect.vue'
import Edit from '@/components/icons/edit.png'
import router from "@/router/index.js"

import '@/assets/base.css'

const account = ref(null)
const classes = ref(null)
const error = ref(null)

getSession();

// Fonction pour récupérer la session
async function getSession() {
    try {
        const session = await supabase.auth.getSession()
        account.value = session
        console.log(account.value)
    } catch (err) {
        console.error('Error fetching session:', err)
        error.value = err.message
    }
}

// Fonction de redirection vers la classe cliquer
function goToClasse(id_classe) {
    router.push({
        path: '/Classe',
        query: { id: id_classe },
    });
    console.log("Navigation réussie vers la classe");
}

// Fonction pour ajouter une classe
async function add_classe(nom_classe) {
    try {
        // Appelle la fonction 'create_classe' de Supabase avec le nom de la classe
        const { data, error } = await supabase.rpc('create_classe', { nom_classe });

        if (error) {
            console.error('Error creating class:', error.message);
            throw new Error(error.message); 
        }

        // Appeler fetchClasses pour rafraîchir la liste des classes
        await fetchClasses();

        console.log('Class created successfully:', data);
        return data; 
    } catch (err) {
        console.error('Error in add_classe:', err);
        throw err; 
    }
}

// Fonction pour récup ou refresh les classes
async function fetchClasses() {
    try {
        const { data: testData, error: testError } = await supabase.rpc('get_classe', {});

        if (testError) {
            console.error('Error fetching classes:', testError.message);
            error.value = testError.message;
        } else {
            classes.value = testData; // Mise à jour de la liste des classes
            console.log('Classes refreshed:', classes.value);
        }
    } catch (err) {
        console.error('Error in fetchClasses:', err);
        error.value = err.message;
    }
}

// Récup les classes en entrant sur la page
onMounted(async () => {
    try {
        // Récupère les classes depuis Supabase
        const { data: testData, error: testError } = await supabase.rpc('get_classe', {})

        if (testError) {
            console.error('Error fetching classes:', testError.message)
            error.value = testError.message
        } else {
            classes.value = testData // On met les données dans la variable classes
            console.log('classes:', classes.value)
        }
    } catch (err) {
        console.error('Error in onMounted:', err)
        error.value = err.message
    }
})
</script>

<style scoped>
body {
    margin: 0;
    padding: 0;
    font-family: Arial, sans-serif;
    background-color: #0A1633; 
    color: #FFFFFF;
}

.Top_page h2 {
    color: #FFFFFF;
    text-align: center;
    font-weight: bold;
    font-size: 32px;
    padding: 20px;
}

.Top_page {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
}

.ButtonAdd {
    display: flex;
    align-items: center;
    gap: 10px;
    background-color: #1D3557; 
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    border: none;
    color: #FFFFFF;
    font-size: 16px;
    transition: background-color 0.3s ease;
}

.ButtonAdd:hover {
    background-color: #457B9D;
}

.ButtonAdd input[type="text"] {
    background: none;
    border: none;
    outline: none;
    color: #FFFFFF;
    font-size: 16px;
    padding-left: 10px;
}

.Mid_page {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 15px;
    padding-bottom: 50px;
}

.MenuSelect {
    background-color: #1D2A5A;
    padding: 15px;
    border-radius: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: background-color 0.3s ease;
}

.MenuSelect:hover {
    background-color: #2A4887;
}

.MenuSelect .title {
    font-size: 18px;
    font-weight: bold;
}

.MenuSelect .members {
    font-size: 14px;
    opacity: 0.8;
}

.EditButton {
    background-color: #394973;
    padding: 10px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.EditButton:hover {
    background-color: #4A5C94;
}

.EditButton img {
    width: 16px;
    height: 16px;
}
</style>
