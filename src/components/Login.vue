<template>
    <div class="header">
        <img src="./icons/logo.svg" alt="Logo">
    </div>

      <div class="login-content">
          <div class="container">
              <h2>Veuillez vous connecter</h2>
              <!-- submit prevent évite de recharger la page -->
              <form @submit.prevent="login">
                <input type="text" id="email" v-model="email" placeholder="Email" required>
                <input type="password" id="password" v-model="password" placeholder="Mot de passe" required>
                <br>
                <button type="submit">Connexion</button>
              </form>

              <button type="button" @click="LoginA">Admin</button>
              <button type="button" @click="LoginC">Collaborateur</button>
          </div>
      </div>
    <Footer/>
</template>

<script setup>
import { ref } from 'vue';
import { supabase } from '../clients/supabase.js';
import Footer from '@/components/Footer.vue';
import Router from "@/router/index.js"
let email = ref("");
let password = ref("");


async function login(){
    console.log("Connexion")
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value
    })

    if(error){
        console.log(error);
    }else{
      // Connexion réussie
      if (data) {
        const userId = data.user.id;
          // Récupère le groupe de l'utilisateur
          const { data: roleData, error: roleError } = await supabase
            .rpc('get_user_group', { user_id: userId });
              
          // Redirection en fonction du groupe
          if (roleError) {
              console.log("Erreur lors de la récupération du rôle :", roleError.message);
          } else {
              const idGroupe = roleData; 
              if (idGroupe === 1) {
                  Router.push('/MenuAdmin');
              } else if (idGroupe === 2) {
                  Router.push('/MenuUser');
              }
          }
      }
  }
}

async function LoginA() {
  console.log("Connexion")
    const { data, error } = await supabase.auth.signInWithPassword({
      email: "admin@admin.com",
      password: "password"
    })

    if(error){
        console.log(error);
    }else{
      // Connexion réussie
      if (data) {
        const userId = data.user.id;
          // Récupère le groupe de l'utilisateur
          const { data: roleData, error: roleError } = await supabase
            .rpc('get_user_group', { user_id: userId });
              
          // Redirection en fonction du groupe
          if (roleError) {
              console.log("Erreur lors de la récupération du rôle :", roleError.message);
          } else {
              const idGroupe = roleData; 
              if (idGroupe === 1) {
                  Router.push('/MenuAdmin');
              } else if (idGroupe === 2) {
                  Router.push('/MenuUser');
              }
          }
      }
  }
}
async function LoginC() {
  console.log("Connexion")
    const { data, error } = await supabase.auth.signInWithPassword({
      email: "collabo1@collabo.com",
      password: "password"
    })

    if(error){
        console.log(error);
    }else{
      // Connexion réussie
      if (data) {
        const userId = data.user.id;
          // Récupère le groupe de l'utilisateur
          const { data: roleData, error: roleError } = await supabase
            .rpc('get_user_group', { user_id: userId });
              
          // Redirection en fonction du groupe
          if (roleError) {
              console.log("Erreur lors de la récupération du rôle :", roleError.message);
          } else {
              const idGroupe = roleData; 
              if (idGroupe === 1) {
                  Router.push('/MenuAdmin');
              } else if (idGroupe === 2) {
                  Router.push('/MenuUser');
              }
          }
      }
  }
}

/*
async function seeCurrentUser(){
    const localUser = await supabase.auth.getSession();
    console.log(localUser);
}*/

/*
async function createAccount(){
    const { data, error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
        email_confirm: true
    })

    if(error){
        console.log(error);
    }else{
        console.log(data);
    }
}*/
</script>

<style>
.header {
  background-color: #19376D;
  padding: 20px 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header img {
  height: 60px;
}

.login-content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 120px); 
  flex-grow: 1;
}

.container {
  background-color: #19376D;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  text-align: center;
  width: 500px;
}

.container h2 {
  color: #fff;
  margin-bottom: 20px;
  font-size: 1.5em;
}

input[type="text"], input[type="password"] {
  width: 70%;
  padding: 12px 15px;
  margin-bottom: 20px;
  border: 2px solid transparent;
  border-radius: 5px;
  background-color: rgba(255, 255, 255, 0.15);
  color: white;
  font-size: 1em;
  transition: all 0.3s ease;
  outline: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

input[type="text"]:focus, input[type="password"]:focus {
  background-color: rgba(255, 255, 255, 0.25);
  border-color: #5F6EB1;
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
}

::placeholder {
  color: rgba(255, 255, 255, 0.6);
  opacity: 1;
  font-style: italic;
}

button {
  background-color: #5F6EB1;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 5px;
  font-size: 1em;
  cursor: pointer;
  margin-top: 10px;
  width: 40%;
  margin-left: 3px;
}

button:hover {
  background-color: #4a5996;
  transition: all 0.3s ease;
}
</style>