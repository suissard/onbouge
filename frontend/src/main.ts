import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'


import App from './App.vue'
import router from './router'

import configs from '@config'

const initialSettings = {
  theme: localStorage.getItem('theme') || 'light',
  colors: JSON.parse(localStorage.getItem('themeColors') || '{}'),
};

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: initialSettings.theme,
    themes: {
      light: {
        dark: false,
        colors: {
          primary: initialSettings.colors.primary || configs.colors.light.primary || '#1976D2',
          secondary: initialSettings.colors.secondary || configs.colors.light.secondary || '#424242',
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: initialSettings.colors.primary || configs.colors.dark.primary || '#2196F3',
          secondary: initialSettings.colors.secondary || configs.colors.dark.secondary || '#616161',
        },
      },
    },
  },
  icons: {
    defaultSet: 'mdi',
    sets: {
      mdi,
    },
  },
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)

app.mount('#app')
