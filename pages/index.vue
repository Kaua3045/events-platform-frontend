<template>
  <section class="min-h-screen bg-background text-text-primary p-8">
    <header class="flex justify-between items-center mb-10">
      <h1 class="text-3xl font-bold">Eventos+</h1>
      <div class="space-x-4">
        <NuxtLink to="/login" class="text-primary">Login</NuxtLink>
        <NuxtLink to="/register" class="bg-primary text-white px-4 py-2 rounded"
          >Cadastrar</NuxtLink
        >
      </div>
    </header>
    <div class="text-center">
      <h2 class="text-4xl font-bold mb-4">
        Descubra e participe de eventos incríveis
      </h2>
      <p class="text-text-secondary">
        Plataforma simples e poderosa para gestão e participação de eventos
      </p>
      <p class="text-text-secondary">Autenticado {{ isAuthenticated }}</p>
      <p class="text-text-secondary">User {{ user }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
const { fetchUser, isAuthenticated, user } = useAuth();

onMounted(() => fetchUser());
</script>
