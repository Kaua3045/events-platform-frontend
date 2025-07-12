// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  css: ["~/assets/css/tailwind.css"],
  modules: ["@nuxtjs/tailwindcss", "@nuxt/eslint", "vue-sonner/nuxt"],
  runtimeConfig: {
    backendUrl: process.env.BACKEND_URL || "http://localhost:8080",
    clientId: process.env.CLIENT_ID || "client_id",
    clientSecret: process.env.CLIENT_SECRET || "client_secret",
    refreshTokenExpires: process.env.REFRESH_TOKEN_EXPIRES_IN,
    public: {
      apiUrl: process.env.API_URL,
    },
  },
});
