<template>
  <Header />
  <div class="main-content">
      <h2>Gestion des collaborateurs</h2>
      <ButtonAdd :isEditable="false" :filename="Ajouter" :initialText="'Créer un utilisateur'" @click="showOverlay" />

      <!-- Affichage des collaborateurs -->
      <div v-if="collaborateurs.length > 0">
          <MenuSelect
              v-for="(collab, index) in collaborateurs"
              :key="collab.id_utilisateur"
              :title="`${collab.prenom_utilisateur} ${collab.nom_utilisateur}`"
              :filename="Poubelle"
              @click="deleteCollaborateur(collab.id_utilisateur)"
          />
      </div>

      <!-- Affichage d'un message d'erreur si nécessaire -->
      <p v-if="error" class="error-message">{{ error }}</p>

      <!-- Contenu de l'overlay -->
      <Overlay class="overlay" v-if="overlayVisible" @close-overlay="hideOverlay">
          <p class="TitreOverlay">Crée un utilisateur</p>
          <form @submit.prevent="submitForm">
              <p class="etape">Nom</p>
              <input type="text" id="nom" v-model="nom" placeholder="Nom" required />

              <p class="etape">Prenom</p>
              <input type="text" id="prenom" v-model="prenom" placeholder="Prenom" required />

              <p class="etape">Mail</p>
              <input type="text" id="mail" v-model="mail" placeholder="Mail" required />

              <p class="etape">Mot de passe</p>
              <input type="password" id="password" v-model="password" placeholder="Mot de passe" required />

              <p class="etape">Confirmation mot de passe</p>
              <input type="password" id="confirmMdp" v-model="confirmPassword" placeholder="Confirmer le mot de passe" required />

              <button type="submit">Créer</button>
          </form>
      </Overlay>
  </div>
  <Footer />
</template>

<script setup>
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import MenuSelect from '@/components/MenuSelect.vue'
import Poubelle from '@/components/icons/trash.svg'
import '@/assets/base.css'
import { ref, onMounted } from 'vue'
import { supabase } from '@/clients/supabase.js'
import Overlay from '@/components/Overlay.vue'
import ButtonAdd from '@/components/ButtonAdd.vue'
import Ajouter from '@/components/icons/ajouter.png'

const account = ref(null)
const collaborateurs = ref([]) 
const error = ref(null)
const overlayVisible = ref(false)
const nom = ref('')
const prenom = ref('')
const mail = ref('')
const password = ref('')
const confirmPassword = ref('')

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

// Fonction pour afficher l'overlay
function showOverlay() {
overlayVisible.value = true
}

// Fonction pour masquer l'overlay
function hideOverlay() {
overlayVisible.value = false
}

// Fonction pour créer un utilisateur
const submitForm = async () => {
  // Vérifier si les mots de passe correspondent
  if (password.value !== confirmPassword.value) {
    error.value = "Les mots de passe ne correspondent pas.";
    console.log('Les mots de passe ne correspondent pas.');
    return;
  }

  // Création de l'utilisateur côté serveur + assignation au groupe 2 (collabo)
  try {
    const { data, error: rpcError } = await supabase.auth.signUp({
        email: mail.value,
        password: password.value,
        options: {
          data: {
            nom_utilisateur: nom.value,
            prenom_utilisateur: prenom.value,
            user_verified: true
          }
        }
      });


    if (rpcError) {
      console.error('Erreur lors de la création:', rpcError.message);
      error.value = 'Erreur lors de la création du collaborateur : ' + rpcError.message;
    } else {
      console.log('Collaborateur créé:', data);
      // Rafraîchir la liste des collaborateurs après création
      hideOverlay();
      getCollaborateurs();
    }
  } catch (err) {
    console.error('Erreur inattendue lors de la création:', err);
    error.value = 'Erreur inattendue lors de la création.';
  }
};


// Fonction pour supprimer un collaborateur via une fonction RPC dans Supabase
async function deleteCollaborateur(idUtilisateur) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
        try {
            // Appel de la fonction RPC pour supprimer l'utilisateur dans la table 'faire_partie'
            const { data, error: rpcError } = await supabase.rpc('delete_collabo_by_id', {
                idutilisateur: idUtilisateur,
            });

            if (rpcError) {
                console.error('Erreur lors de la suppression:', rpcError.message);
                error.value = 'Erreur lors de la suppression du collaborateur : ' + rpcError.message;
            } else {
                console.log('Collaborateur supprimé:', data);
                // Rafraîchir la liste des collaborateurs après suppression
                getCollaborateurs();
            }
        } catch (err) {
            console.error('Erreur inattendue lors de la suppression:', err);
            error.value = 'Erreur inattendue lors de la suppression.';
        }
    }
}

// Fonction pour récupérer les collaborateurs depuis Supabase
const getCollaborateurs = async () => {
  try {
      const { data: testData, error: testError } = await supabase.rpc('get_all_collabo', {})

      if (testError) {
          console.error('Error fetching collaborators:', testError.message)
          error.value = testError.message
      } else {
          collaborateurs.value = testData
          console.log('Collaborators:', collaborateurs.value)
      }
  } catch (err) {
      console.error('Error in getCollaborateurs:', err)
      error.value = err.message
  }
}

// En entrant sur la page récup : la session et tout les collaborateurs du site
onMounted(() => {
  getSession()
  getCollaborateurs()
})
</script>

<style scoped>
.error-message {
    color: red;
    font-weight: bold;
    font-size: 14px;
    margin-top: 10px;
    text-align: center;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

p{
    color: white;
}

.TitreOverlay{
    color: #000;
    font-size: 24px;
    text-align: center;
}

.etape {
  font-size: 14px;
  color: #333;
  margin-top: 10px;
  text-align: left;
  font-weight: 600;
  margin-bottom: 6px;
}

form {
  background-color: white;
  padding: 30px 25px;
  width: 100%;
  max-width: 350px;
  text-align: center;
  transition: transform 0.3s ease;
}

input {
  width: 100%;
  padding: 12px;
  margin: 6px 0 12px 0;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 16px;
  color: #000000;
  background-color: #f9f9f9;
  transition: border-color 0.3s ease, background-color 0.3s ease;
}
input:focus {
  border-color: #007bff;
  background-color: #e6f3ff;
  outline: none;
}

input::placeholder {
  color: rgba(0, 0, 0, 0.6);
  font-style: normal;
}

button {
  background-color: #000;
  color: white;
  border: none;
  padding: 12px 24px;
  font-size: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  width: 100%;
}

button:hover {
  background-color: #444;
  transform: translateY(-2px);
}

button:active {
  background-color: #222;
  transform: translateY(1px);
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f4f4f4;
}



</style>
