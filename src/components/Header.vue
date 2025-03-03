<template>
  <header>
    <div class="logoAccueil">
      <img src="@/components/icons/logo.svg" alt="Logo" @click="redirectToGroupPage">

      <span v-if="showBackButton" @click="goBack">Retour</span>
    </div>

    <div class="logout-icon">
        <RouterLink to="/"><img @click="logout" src="@/components/icons/logout.svg" alt="Logout"></RouterLink>
        
        <!-- Vérifie si il y a une session puis affiche l'email -->
        <span v-if="account">{{ account.user.email }}</span>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { supabase } from '../clients/supabase.js';
import { useRouter } from 'vue-router';

const router = useRouter();
const account = ref(null);

onMounted(() => {
  getSession();
});

// Bouton retour pour aller vers la page précédente
const showBackButton = computed(() => {
  const currentPath = router.currentRoute.value.path;
  return currentPath !== '/MenuAdmin' && currentPath !== '/MenuUser';
});

// Récupère la session actuelle
async function getSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Erreur lors de la récupération de la session:", error);
    } else if (data.session) {
      account.value = data.session;
    } else {
      console.log("Aucune session active trouvée");
    }
  } catch (err) {
    console.error("Erreur lors de la récupération de la session:", err);
  }
}

// Fonction pour retourner à la page précédente
function goBack() {
  router.back();
}

// Récupère le groupe de l'utilisateur connecté
async function getUserGroup() {
  const { data } = await supabase.auth.getSession();
  if (data) {
    const userId = data.session.user.id;
      // Récupère le groupe de l'utilisateur
      const { data: roleData, error: roleError } = await supabase
        .rpc('get_user_group', { user_id: userId });
          
      // Redirection en fonction du groupe
      if (roleError) {
          console.log("Erreur lors de la récupération du rôle :", roleError.message);
      } else {
          return roleData;
      }
  }
}

// Redirection basée sur le groupe de l'utilisateur
async function redirectToGroupPage() {
  const groupId = await getUserGroup();
  // Redirige vers la page appropriée en fonction de l'id groupe
  if (groupId === 1) {
    router.push('/MenuAdmin'); 
  } else if (groupId === 2) {
    router.push('/MenuUser'); 
  } else {
    router.push('/');
  }
}

// Déconnexion
async function logout() {
const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Erreur lors de la déconnexion:", error);
  } else {
    console.log("Déconnexion réussie.");
    localStorage.removeItem('supabase.auth.token');
    sessionStorage.removeItem('supabase.auth.token');
    router.push('/');  
  }
}
</script>

<style>
header {
  background-color: #19376D;
  padding: 20px 50px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

header .logoAccueil {
  display: flex;
  align-items: center;
}

header .logoAccueil img {
  height: 60px;
}

header .logoAccueil span {
  margin-left: 10px;
  background-color: #5F6EB1;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
}

header .logout-icon {
  display: flex;
  align-items: center;
}

header .logout-icon img {
  height: 36px;
  margin-right: 10px;
}

header span {
  background-color: #5F6EB1;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
}
</style>