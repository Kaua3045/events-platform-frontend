// // @ts-check
// import withNuxt from './.nuxt/eslint.config.mjs'

// export default withNuxt(
//   // Your custom configs here
//   {
//     rules: {
//       'vue/multi-word-component-names': 'off',
//     },
//   }
// )

// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import tseslint from '@typescript-eslint/eslint-plugin'
import tseslintParser from '@typescript-eslint/parser'
import vueParser from 'vue-eslint-parser'

export default withNuxt([
  {
    files: ['**/*.vue'], // <- arquivos Vue vão usar o parser do Vue
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslintParser, // <- dentro do <script> usa o parser de TypeScript
        project: ['./tsconfig.json'],
        extraFileExtensions: ['.vue'],
      },
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'off',
      'vue/html-self-closing': "off"
    },
  },
  {
    files: ['**/*.ts'], // <- arquivos TS puros
    languageOptions: {
      parser: tseslintParser,
      parserOptions: {
        project: ['./tsconfig.json'],
      },
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
])

// export default withNuxt([
//   {
//     files: ['**/*.ts', '**/*.vue'],
//     languageOptions: {
//       parser: tseslintParser,
//       parserOptions: {
//         project: ['./tsconfig.json'],
//         extraFileExtensions: ['.vue'],
//       },
//     },
//     rules: {
//       ...tseslint.configs.recommended.rules, // <- usa as regras recomendadas do @typescript-eslint
//       '@typescript-eslint/no-explicit-any': 'off', // override se quiser
//     },
//   },
//   {
//     rules: {
//       'vue/multi-word-component-names': 'off',
//     },
//   },
// ])
