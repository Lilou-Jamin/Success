<script setup>
  import Header from '@/components/Header.vue'
  import Footer from '@/components/Footer.vue'
  import MenuBouton from '@/components/MenuBouton.vue'
  import Router from "@/router/index.js"
  import '@/assets/base.css'
  import { ref } from 'vue'
  import { supabase } from '@/clients/supabase.js'

  const account = ref();
  getSession();

  async function getSession(){
    account.value = await supabase.auth.getSession();
    console.log(account.value)
  }

  function goToDashboardAdmin(){
    Router.push('/DashboardAdmin');
  }
  function goToGestionCollaborateur(){
    Router.push('/GestionCollaborateur');
  }
  function goToListeQuestionnaires(){
    Router.push('/ListeQuestionnaires');
  }
  function GoToGestionClasses(){
    Router.push('/GestionClasses');
  }

</script>

<template>
    <Header/>

    <div class="main-content">
      <h2>ADMINISTRATEUR</h2>
      
      <div class="menu-buttons">
        <MenuBouton title="Statistiques" subtitle="Visualiser les statistiques, les graphiques" @click="goToDashboardAdmin"/>
        <MenuBouton title="Questionnaires" subtitle="Création de questionnaires et gestion des questions " @click="goToListeQuestionnaires"/>
        <MenuBouton title="Gestion classe" subtitle="Ajout et suppression de classe et d'utilisateur dans les classes" @click="GoToGestionClasses"/>
        <MenuBouton title="Gestion collaborateurs" subtitle="Suppression et ajout de collaborateurs" @click="goToGestionCollaborateur"/>
      </div>
    </div>
<Footer/>
</template>

<style setup>
.main-content h2 {
  color: #fff;
  margin-bottom: 20px;
  font-size: 32px;
}

.menu-buttons {
  display: grid;
  grid-template-columns: auto auto; 
  gap: 2rem; 
}
</style>
