<script setup> 
    import Header from '@/components/Header.vue'
    import Footer from '@/components/Footer.vue'
    import Poubelle from '@/components/icons/trash.svg'
    import edit from '@/components/icons/edit.png';
    import Ajouter from '@/components/icons/ajouter.png';
    import '@/assets/base.css'


    import { ref, onMounted } from 'vue'
    import { useRoute } from 'vue-router';
    import { useRouter } from 'vue-router';
    import { supabase } from '@/clients/supabase.js'

    // State definitions
    const account = ref(null);
    const route = useRoute();
    const router = useRouter();
    const error = ref(null);
    const question = ref([]);
    const questions = ref([]);

    function goToCreationQuestion() {
      const id_questionnaire = route.query.id;
      router.push({ 
        path: '/CreationQuestion', 
        query: { id: id_questionnaire } 
      });
    }
    
    function goToDetailsQuestion(id_question) {
      router.push({
        path: '/DetailsQuestion',
        query: { id: id_question, }
      });
    }
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
async function fetchQuestions() {
  const questionnaireid = route.query.id;
  console.log('ID du questionnaire :', questionnaireid);

  try {
    const { data: testData, error: testError } = await supabase.rpc('get_questions_only', { questionnaireid });

    if (testError) {
      error.value = testError.message;
      console.error('Erreur lors de la récupération des questions :', testError.message);
    } else {
      questions.value = testData;
      console.log('Données reçues :', questions.value);
    }
  } catch (err) {
    console.error('Erreur :', err);
  }
}
onMounted(async () => {

    const questionnaireid = route.query.id;

    console.log("ID du questionnaire :", questionnaireid);
    try {
        // Récupère le nombre de questions d'un questionnaire
        const { data: testData, error: testError } = await supabase
            .rpc('get_questions_only', { questionnaireid })
        
        if (testError) {
            error.value = testError.message
            console.error("Erreur lors de la récupération des infos du questionnaire :", testError.message)
        } else {
            questions.value = testData
            console.log("Donnée reçu", questions.value)
        }
    } catch (err) {
        console.error("Erreur :", err)
    }
}) 


async function deleteQuestion(id_question) {
  const confirmation = confirm("Êtes-vous sûr de vouloir supprimer cette question ?");
  if (!confirmation) return;

  try {
    const { data, error } = await supabase.rpc('delete_question', { idquestion: id_question });

    if (error) {
      console.error("Erreur lors de la suppression du questionnaire :", error.message);
    } else {
      console.log("Question supprimé :", data);
      question.value = question.value.filter(q => q.id_question !== id_question);
      await fetchQuestions();
    }
  } catch (err) {
    console.error("Erreur lors de l'appel à Supabase :", err);
  }
}
getSession()  // On peut aussi appeler cette fonction dans onMounted si nécessaire
</script>

<template>
    <Header/>
    <div class="main-content">
      <div class="Titre_et_Ajouter_Question">
        <h2>QUESTIONS</h2>
        <img :src="Ajouter" @click="goToCreationQuestion" />
      </div>
    
      <div class="liste-question-result-box">
          <table>
              <thead>
                  <tr>
                      <th>Numéro</th>
                      <th>Intitulé</th>
                      <th>Action</th>
                  </tr>
              </thead>
              <tbody>
                  <tr v-for="question in questions" :key="question.id_question">
                      <td>{{ question.id_question }}</td>
                      <td>{{ question.titre_question }}</td>
                      <td>
                      <img 
                          :src="edit" 
                          alt="Modifier" 
                          title="Modifier" 
                          @click="goToDetailsQuestion(question.id_question)" 
                      />
                      <img 
                          :src="Poubelle" 
                          alt="Supprimer" 
                          title="Supprimer" 
                          @click="deleteQuestion(question.id_question)" 
                      />
                      </td>
                  </tr>
              </tbody>
          </table>
          
      </div>
    </div>
    <Footer />
</template>

<style scoped>

.Titre_et_Ajouter_Question {
  display: flex;
  justify-content: space-between;
}
.Titre_et_Ajouter_Question img {
  cursor: pointer;
}
.main-content {
  padding: 50px;
  align-items: center;
}
.liste-question-result-box {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  background-color: #193375; 
  padding: 20px;
  border-radius: 10px;
  color: #ffffff; 
  display: flex;
  width: 100%; 
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

table {
  width: 90%;
  border-collapse: collapse;
  text-align: center;
  vertical-align: middle;
}

th, td {
  padding: 6px;
  border: 2px solid #738EBF;
}

th {
  background-color: #738EBF;
  color: #FFFFFF;
  padding: 20px;
}

table img {
  width: 40px;
  height: 40px;
  cursor: pointer;
  margin: 0 5px;
}
</style>
