import { defineConfig } from 'vite'
import handlebars from 'vite-plugin-handlebars'
import { resolve } from 'path'
import vue2 from '@vitejs/plugin-vue2'
import vue2Jsx from '@vitejs/plugin-vue2-jsx'
import indexParams from './partials/index-params'
import babel from 'vite-plugin-babel'
import svgPlugin from 'unplugin-svg-vue-component/vite'
import { splitVendorChunkPlugin } from 'vite'

const isProd = process.env.NODE_ENV === 'production'

const handlebarParams = isProd
  ? indexParams.production
  : indexParams.development

export default defineConfig({
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      if (isProd) {
        if (hostType === 'html') {
          return '{{staticURL}}/' + filename
        } else if (hostType === 'js') {
          return {
            runtime: `window.__setStaticUrl(${JSON.stringify(filename)})`,
          }
        }
      } else {
        return '/' + filename
      }
    },
  },
  server: { port: 9090, host: 'localhost', allowedHosts: 'all' },
  resolve: {
    alias: {
      '@': __dirname,
    },
  },
  build: {
    sourcemap: false,
    minify: true,
    commonjsOptions: { transformMixedEsModules: true },
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
  plugins: [
    handlebars({
      context: { ...handlebarParams },
      partialDirectory: resolve(__dirname, 'partials'),
    }),
    vue2(),
    vue2Jsx(),
    babel({
      babelConfig: {
        babelrc: false,
        configFile: false,
        plugins: [
          [
            '@babel/plugin-proposal-decorators',
            { loose: true, version: '2022-03' },
          ],
          ['@babel/plugin-syntax-jsx'],
        ],
      },
    }),
    svgPlugin({ vueVersion: 2 }),
    splitVendorChunkPlugin(),
  ],
})
