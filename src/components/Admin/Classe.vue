<template>
    <Header/>
    <div class="main-content">
        <h2>GESTION DE LA CLASSE {{ nomClasse }}</h2> 
        <ButtonAdd :isEditable="false" :filename="Ajouter" :initialText="'Ajoutez un élève'" @click="showOverlay"/>
        
        <!-- Affiche les collaborateurs -->
        <div v-if="collaborateurs.length > 0">
            <MenuSelect
                v-for="(collab, index) in collaborateurs"
                :key="collab.id_utilisateur"
                :title="`${collab.prenom_utilisateur} ${collab.nom_utilisateur}`"
                :filename="Poubelle"
                @click="deleteCollaborateur(collab.id_utilisateur, idClasse)"
            />
        </div>
        
        <!-- Affiche ce message dans le cas où il n'y as pas de collorateurs  -->
        <p v-else class="no-collaborator-message">Aucun collaborateur n'est assigné à cette classe.</p>
        
        <!-- Affichage en cas d'erreur -->
        <p v-if="error" class="error-message">{{ error }}</p>

        <!-- Ce bouton permet de supprimer la classe -->
        <div class="Button_supp_classe">
            <button class="card2" @click="deleteClasse(idClasse)">  
                <p class="title2">Supprimer la classe</p>
                <div class="icon2">
                    <img :src="Poubelle" />
                </div>
            </button>
        </div>

        <!-- Contenu de l'overlay quand l'on clique sur "Ajouter un élève" -->
        <Overlay v-if="overlayVisible" @close-overlay="hideOverlay">
            <div v-if="collaborateursNonClasse.length > 0">
                <p>Sélectionnez les collaborateurs que vous souhaitez ajouter à la classe {{ nomClasse }}</p>
                <p></p>
                <table id="collaboratorsTable">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Collaborateurs</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(Ncollab, index) in collaborateursNonClasse" :key="Ncollab.id_utilisateur">
                            <td>
                                <input 
                                    type="checkbox" 
                                    class="select-checkbox" 
                                    :value="Ncollab.id_utilisateur" 
                                    @change="handleCheckboxChange(Ncollab.id_utilisateur)"
                                />
                            </td>
                            <td>{{ Ncollab.nom_utilisateur }} {{ Ncollab.prenom_utilisateur }}</td>
                        </tr>
                    </tbody>
                </table>
                <button id="submitSelection" @click="addCollaborateursToClasse">Ajouter la sélection</button>
            </div>
            
            <!-- Message quand aucun utilisateur ne peux être ajouter -->
            <p v-else>Aucun utilisateur ne peut être ajouté</p>
        </Overlay>

    </div>
    <Footer />
</template>

<script setup>
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import ButtonAdd from '@/components/ButtonAdd.vue'
import MenuSelect from '@/components/MenuSelect.vue'
import Poubelle from '@/components/icons/trash.svg'
import Ajouter from '@/components/icons/ajouter.png'
import '@/assets/base.css'
import { useRoute, useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';
import { supabase } from '@/clients/supabase.js';
import Overlay from '@/components/Overlay.vue';

const account = ref(null);
const collaborateurs = ref([]); // Contiens les collaborateurs se trouvant dans la classe
const collaborateursNonClasse = ref([]); // Contiens les collaborateurs ne se trouvant pas dans la classe
const nomClasse = ref('');
const error = ref(null);
const route = useRoute();
const router = useRouter();
const idClasse = route.query.id; // Récupérer l'ID dans l'URL
const overlayVisible = ref(false); // Ferme de base l'overlay
const selectedCollaborateurs = ref([]);  // Tableau pour l'ajout de plusieurs utilisateur


// Fonction pour récupérer la session
async function getSession() {
    try {
        const session = await supabase.auth.getSession();
        account.value = session;
        console.log('Session:', account.value);
    } catch (err) {
        console.error('Error fetching session:', err);
        error.value = 'Erreur lors de la récupération de la session utilisateur.';
    }
}

// Fonction pour afficher l'overlay
function showOverlay() {
  overlayVisible.value = true;
}

// Fonction pour masquer l'overlay
function hideOverlay() {
  overlayVisible.value = false;
}

// Fonction qui vas gérer quels utilisateurs ont été séléctionner avant d'essayer de les ajouter
function handleCheckboxChange(idUtilisateur) {
    const index = selectedCollaborateurs.value.indexOf(idUtilisateur);
    
    if (index === -1) {
        // Si l'utilisateur n'est pas déjà sélectionné, on l'ajoute
        selectedCollaborateurs.value.push(idUtilisateur);
    } else {
        // Si l'utilisateur est déjà sélectionné, on le retire
        selectedCollaborateurs.value.splice(index, 1);
    }
}

// Fonction pour ajouter les utilisateurs a cette classe
async function addCollaborateursToClasse() {
    try {
        if (selectedCollaborateurs.value.length === 0) {
            alert('Aucun collaborateur sélectionné');
            return;
        }

        // Itérer sur chaque collaborateur sélectionné et ajouter un par un
        for (let i = 0; i < selectedCollaborateurs.value.length; i++) {
            const idUtilisateur = selectedCollaborateurs.value[i];
            
            // Appel de la fonction RPC pour ajouter chaque collaborateur
            const { data, error: rpcError } = await supabase.rpc('add_collab_to_classe', {
                idutilisateur: idUtilisateur, // Passer l'ID directement, sans tableau
                idclasse: idClasse
            });

            if (rpcError) {
                console.error('Erreur lors de l\'ajout du collaborateur:', rpcError.message);
                error.value = 'Erreur lors de l\'ajout du collaborateur : ' + rpcError.message;
                return; // Si une erreur se produit, on arrête l'ajout
            } else {
                console.log(`Collaborateur avec l'ID ${idUtilisateur} ajouté`);
            }
        }

        // Rafraîchir la liste des collaborateurs après l'ajout
        window.location.reload();
        hideOverlay();  // Fermer l'overlay après l'ajout
    } catch (err) {
        console.error('Erreur inattendue lors de l\'ajout des collaborateurs:', err);
        error.value = 'Erreur inattendue lors de l\'ajout des collaborateurs.';
    }
}

// Fonction pour récupérer les collaborateurs en fonction de la classe
async function getCollaborateurs() {
    try {
        if (!idClasse) {
            error.value = 'Aucun ID de classe trouvé dans l\'URL';
            return;
        }

        const { data, error: rpcError } = await supabase.rpc('get_collab_by_classe', { idclasse: idClasse });

        if (rpcError) {
            console.error('Error fetching collaborators:', rpcError.message);
            error.value = 'Erreur lors de la récupération des collaborateurs : ' + rpcError.message;
            collaborateurs.value = [];
        } else {
            collaborateurs.value = data || []; 
            console.log('Collaborators:', collaborateurs.value);
        }
    } catch (err) {
        console.error('Error in getCollaborateurs:', err);
        error.value = 'Erreur inattendue lors de la récupération des collaborateurs.';
    }
}

// Fonction pour récup les collabo ne se trouvant pas dans cette classe
async function getCollaborateursNonClasse() {
    try {
        if (!idClasse) {
            error.value = 'Aucun ID de classe trouvé dans l\'URL';
            return;
        }
        
        const { data, error: rpcError } = await supabase.rpc('get_collabo_not_in_classe', { idclasse: idClasse });
        
        if (rpcError) {
            console.error('Error fetching collaborators:', rpcError.message);
            error.value = 'Erreur lors de la récupération des collaborateurs non présent dans cette classe : ' + rpcError.message;
            collaborateursNonClasse.value = [];
        } else {
            collaborateursNonClasse.value = data || []; 
            console.log('NonCollaborators:', collaborateursNonClasse.value);
        }
    } catch (err) {
        console.error('Error in getCollaborateursNonClasse:', err);
        error.value = 'Erreur inattendue lors de la récupération des collaborateurs non présent dans cette classe.';
    }
}

// Fonction pour récupérer le nom de la classe
async function getNomClasse() {
    try {
        if (!idClasse) {
            error.value = 'Aucun ID de classe trouvé dans l\'URL';
            return;
        }

        const { data, error: rpcError } = await supabase.rpc('get_classe');

        if (rpcError) {
            console.error('Erreur lors de la récupération de la classe:', rpcError.message);
            error.value = 'Erreur lors de la récupération des informations de la classe : ' + rpcError.message;
        } else if (data && data.length > 0) {
            const classeTrouvee = data.find(classe => String(classe.id_classe) === String(idClasse));

            if (classeTrouvee) {
                nomClasse.value = classeTrouvee.nom_classe || 'Nom de la classe inconnu';
            } else {
                nomClasse.value = 'Classe non trouvée';
            }
        } else {
            // Si aucune donnée n'est retournée
            nomClasse.value = 'Aucune classe disponible';
        }
    } catch (err) {
        console.error('Erreur dans getNomClasse:', err);
        error.value = 'Erreur inattendue lors de la récupération des informations de la classe.';
    }
}

// Fonction pour supprimer un collaborateur d'une classe via une fonction RPC dans Supabase
async function deleteCollaborateur(idUtilisateur, idClasse) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
        try {
            // Appel de la fonction RPC pour supprimer l'utilisateur dans la table 'faire_partie'
            const { data, error: rpcError } = await supabase.rpc('delete_collabo_from_classe', {
                idutilisateur: idUtilisateur,
                idclasse: idClasse
            });

            if (rpcError) {
                console.error('Erreur lors de la suppression:', rpcError.message);
                error.value = 'Erreur lors de la suppression du collaborateur : ' + rpcError.message;
            } else {
                console.log('Collaborateur supprimé:', data);
                // Rafraîchir la liste des collaborateurs après suppression
                window.location.reload();
            }
        } catch (err) {
            console.error('Erreur inattendue lors de la suppression:', err);
            error.value = 'Erreur inattendue lors de la suppression.';
        }
    }
}

// Fonction pour supprimer un utilisateur de cette classe
async function deleteClasse(idClasse) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette classe ?')) {
        try {
            // Appel de la fonction RPC pour supprimer la classe'
            // Appel de la fonction pour supprimer la classe'
            const { data, error: rpcError } = await supabase.rpc('delete_classe', {
                idclasse: idClasse
            });

            if (rpcError) {
                console.error('Erreur lors de la suppression:', rpcError.message);
                error.value = 'Erreur lors de la suppression de la classe : ' + rpcError.message;
            } else {
                console.log('Classe supprimée:', data);
                // Retour à la liste des classes
                // Retourne à la liste des classes aprés suppression
                goBack();
            }
        } catch (err) {
            console.error('Erreur inattendue lors de la suppression:', err);
            error.value = 'Erreur inattendue lors de la suppression.';
        }
    }
}

// Fonction pour que l'utilisateur soir rediriger vers la page précédente (le menu de création d'une classe)
function goBack() {
  router.back();
}

// En entrant sur la page récup : la session, le nom de la classe, les collaborateur de la classe et les collaborateurs qui n'y sont pas
onMounted(() => {
    getSession();
    getNomClasse();
    getCollaborateurs();
    getCollaborateursNonClasse();
});
</script>

<style scoped>

p {
    font-family: Arial, sans-serif;
    font-size: 16px;
    color: #1d3557;
    margin-bottom: 10px;
}


table {
    width: 100%;
    border-collapse: collapse;
    background-color: #ffffff;
    color: #0B2447; 
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    margin-top: 10px;
}


th, td {
    padding: 15px;
    text-align: left;
    border: 1px solid #0B2447; 
    color: black;
}


th {
    background-color: #ffffff;
    color: #0B2447; 
    font-weight: bold;
    font-size: 18px;
}


tr:nth-child(even) {
    background-color: #ffffff; 
}


tr:nth-child(odd) {
    background-color: #ffffff;
}


tr:hover {
    background-color: #457b9d;
    color: #ffffff; 
}


table + p {
    margin-top: 15px;
}

.error-message {
    color: red;
    font-weight: bold;
}

.no-collaborator-message {
    color: orange;
    font-weight: bold;
    font-size: 16px;
}

.Button_supp_classe  {
    align-items: center;
    display: flex;
    justify-content: center; 
    margin-top: 20px; 
}

.card2 {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #d32f2f; 
    padding: 20px 30px; 
    border-radius: 12px; 
    margin-bottom: 20px; 
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    cursor: pointer; 
}


.card2:hover {
    transform: scale(1.05); 
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4); 
}


.title2 {
    color: white;
    font-size: 24px; 
    font-weight: bold;
}


.icon2 {
    background-color: #a72a1ade;
    padding: 12px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
}


img {
    height: 40px; 
    width: auto;
}

</style>
