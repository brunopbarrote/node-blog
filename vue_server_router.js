/**
 * 参考vue 服务器端渲染
 * 2016.10.8 更新(update)
 * vue2.0.0 释放版本
 */

module.exports = (app) => {
    process.env.VUE_ENV = 'server'             //开发调用 
    //process.env.VUE_ENV = 'production'        线上启用
    const path = require('path');
    const isProd = process.env.NODE_ENV === 'production'
    const fs = require('fs')
    const resolve = file => path.resolve(__dirname, file)
    const serialize = require('serialize-javascript')

    // https://github.com/vuejs/vue/blob/next/packages/vue-server-renderer/README.md#why-use-bundlerenderer
    const createBundleRenderer = require('vue-server-renderer').createBundleRenderer

    // parse index.html template
    const html = (() => {
        const template = fs.readFileSync(resolve('./index.html'), 'utf-8');
        const s = template.indexOf('{{ STYLE }}');
        const i = template.indexOf('{{ APP }}');
        // styles are injected dynamically via vue-style-loader in development
        const title = 'node-blog';
        const style = '<link rel="stylesheet" href="/dist/css/style.min.css">' || ''
        return {
            head: template.slice(0, s).replace('{{ TITLE }}', title) + template.slice(s, i).replace('{{ STYLE }}', style),
            tail: template.slice(i + '{{ APP }}'.length)
        }
    })()

    // setup the server renderer, depending on dev/prod environment
    var renderer;

    if (isProd) {
        // create server renderer from real fs
        const bundlePath = resolve('./web/dist/server-bundle.js')

        renderer = createRenderer(fs.readFileSync(bundlePath, 'utf-8'))

    } else {
        console.log("热加载模式！");
        require('./web/build/setup-dev-server')(app, bundle => {
            renderer = createRenderer(bundle)
        })
    }

    function createRenderer(bundle) {
        //开启服务器端渲染缓存
        // return createBundleRenderer(bundle, {
        //     cache: require('lru-cache')({
        //         max: 1000,
        //         maxAge: 1000 * 60 * 15
        //     })
        // })
        return createBundleRenderer(bundle)
    }

    function initVueServer(req, res) {

        if (!renderer) {
            return res.end('waiting for compilation...')
        }

        const context = { url: req.url }
        const renderStream = renderer.renderToStream(context)
        let firstChunk = true;

        res.write(html.head)                //写入html的头部

        renderStream.on('data', chunk => {
            if (firstChunk) {
                // embed initial store state
                if (context.initialState) {
                    res.write(
                        `<script>window.__INITIAL_STATE__=${
                        serialize(context.initialState, { isJSON: true })
                        }</script>`
                    )
                }
                firstChunk = false
            }
            res.write(chunk)
        })
        renderStream.on('end', () => {
            res.end(html.tail)              //写入html的尾部
        })
        renderStream.on('error', err => {
            throw err
        })
    }

    return initVueServer;
}
