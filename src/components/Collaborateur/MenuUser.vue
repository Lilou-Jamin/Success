<script setup>
  import Header from '@/components/Header.vue'
  import Footer from '@/components/Footer.vue'
  import MenuBouton from '@/components/MenuBouton.vue'
  import Router from "@/router/index.js"
  import '@/assets/base.css'
  import { ref } from 'vue'
  import { supabase } from '@/clients/supabase.js'

  function goToHistorique(){
      Router.push('/HistoriqueUser');
  }

  function goToJoinTest(){
      Router.push('/JoinTest');
  }

const account = ref(null);
getSession();

async function getSession() {
  try {
    // Récupérer la session actuelle
    account.value = await supabase.auth.getSession();
    
    if (account.value.data && account.value.data.session) {
      const userId = account.value.data.session.user.id;
      console.log("ID de l'utilisateur connecté :", userId);
      const idUser = sessionStorage.setItem("IDUSERDEFEUR", userId.value)
    } else {
      console.log("Aucune session active trouvée.");
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de la session :", error);
  }
}
</script>

<template>
    <Header/>

      <div class="main-content">
        <h2>COLLABORATEUR</h2>
        <div class="menu-buttons">
          <MenuBouton title="Questionnaire" subtitle="Rejoindre un questionnaire" @click="goToJoinTest"/>
          <MenuBouton title="Historique" subtitle="Voir les notes et résultats des questionnaires passés" @click="goToHistorique"/>
        </div>
      </div>
      
  <Footer/>
</template>


