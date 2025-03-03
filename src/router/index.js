import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from "@/clients/supabase.js";
import Login from "@/components/Login.vue"
import MenuUser from "@/components/Collaborateur/MenuUser.vue";
import JoinTest from "@/components/Collaborateur/JoinTest.vue";
import HistoriqueUser from "@/components/Collaborateur/HistoriqueUser.vue";
import Questionnaire from "@/components/Collaborateur/Questionnaire.vue";
import Question from "@/components/Collaborateur/Question.vue";
import StatEvaluation from "@/components/Collaborateur/StatEvaluation.vue";
import Correction from "@/components/Collaborateur/Correction.vue";
import MenuAdmin from "@/components/Admin/MenuAdmin.vue";
import DashboardAdmin from "@/components/Admin/DashboardAdmin.vue";
import GestionClasses from "@/components/Admin/GestionClasses.vue";
import GestionCollaborateur from "@/components/Admin/GestionCollaborateur.vue";
import ListeQuestionnaires from "@/components/Admin/ListeQuestionnaires.vue";
import CreationQuestionnaire from "@/components/Admin/CreationQuestionnaire.vue";
import CreationQuestion from "@/components/Admin/CreationQuestion.vue";
import DetailsQuestionnaire from "@/components/Admin/DetailsQuestionnaire.vue";
import DetailsQuestion from "@/components/Admin/DetailsQuestion.vue";
import StatQuestionnaire from "@/components/Admin/StatQuestionnaire.vue";
import Classe from "@/components/Admin/Classe.vue";

let localUser;

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/', 
            component: Login
        },
        {
            path: '/MenuUser', 
            component: MenuUser,
            meta: { requiresAuth: true, role: 2 }
        },
        {
            path: '/JoinTest', 
            component: JoinTest,
            meta: { requiresAuth: true, role: 2 }
        },
        { 
            path: '/HistoriqueUser', 
            component: HistoriqueUser,
            meta: { requiresAuth: true, role: 2 }
        },
        {
            path: '/Questionnaire', 
            component: Questionnaire,
            meta: { requiresAuth: true, role: 2 }
        },
        {
            path: '/StatEvaluation', 
            component: StatEvaluation,
            meta: { requiresAuth: true, role: 2 }
        },
        {
            path: '/Question', 
            component: Question,
            meta: { requiresAuth: true, role: 2 }
        },
        {
            path: '/Correction', 
            component: Correction,
            meta: { requiresAuth: true, role: 2 }
        },
        {
            path: '/StatQuestionnaire', 
            component: StatQuestionnaire,
            meta: { requiresAuth: true }
        },
        {
            path: '/MenuAdmin', 
            component: MenuAdmin,
            meta: { requiresAuth: true, role: 1 }
        },
        {
            path: '/DashboardAdmin', 
            component: DashboardAdmin,
            meta: { requiresAuth: true, role: 1 }
        },
        {
            path: '/GestionClasses', 
            component: GestionClasses,
            meta: { requiresAuth: true, role: 1 }
        },
        {
            path: '/GestionCollaborateur', 
            component: GestionCollaborateur,
            meta: { requiresAuth: true, role: 1 }
        },
        {
            path: '/ListeQuestionnaires', 
            component: ListeQuestionnaires,
            meta: { requiresAuth: true, role: 1 }
        },               
        {
            path: '/CreationQuestionnaire', 
            component: CreationQuestionnaire,
            meta: { requiresAuth: true, role: 1 }
        },      
        {
            path: '/DetailsQuestionnaire', 
            component: DetailsQuestionnaire,
            meta: { requiresAuth: true, role: 1 }
        },
        {
            path: '/CreationQuestion', 
            component: CreationQuestion,
            meta: { requiresAuth: true }
        },
        {
            path: '/DetailsQuestion', 
            component: DetailsQuestion,
            meta: { requiresAuth: true }
        },
        {
            path: '/Classe', 
            component: Classe,
            meta: { requiresAuth: true, role: 1 }
        },
    ]
})
// GetUser and Role Check
async function getUserRole() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session == null) return null;

    const userId = session.user.id;
    const { data: roleData, error } = await supabase
        .rpc('get_user_group', { user_id: userId });

    if (error) {
        console.error("Erreur lors de la récupération du rôle :", error);
        return null;
    }

    return roleData;  
}

// Authentification et redirection en fonction du rôle
router.beforeEach(async (to, from, next) => {
    // Vérifie si la route nécessite une authentification
    if (to.meta.requiresAuth) {
        const role = await getUserRole();

        if (!role) {
            return next('/');
        }

        // Vérifie si le rôle de l'utilisateur correspond à ce qui est autorisé pour cette route
        if (to.meta.role && to.meta.role !== role) {
            if (role === 1) {
                return next('/MenuAdmin');
            } else if (role === 2) {
                return next('/MenuUser');
            }
        }

        // L'utilisateur a le bon rôle, continuer la navigation
        next();
    } else {
        next();
    }
})

export default router;