const sketch = require('sketch')
const { DataSupplier, UI } = sketch
const util = require('util')
const config = {}

const YANDEX_API_KEY = "trnsl.1.1.20180912T154941Z.a526333405a74b23.f809d9991b4d9e56bf40c95e7d5325513669a25b"
const API_URL = `https://translate.yandex.net/api/v1.5/tr.json/`

export function onStartup () {
  // Register the plugin
  DataSupplier.registerDataSupplier('public.text', 'Data Translate', 'SupplyTranslation')
}

export function onShutdown () {
  // Deregister the plugin
  DataSupplier.deregisterDataSuppliers()
}

export function onSupplyTranslation (context) {
  getAvailableLanguages()
    .then(langs => {
      UI.message('🕑 Translating…')
      let dataKey = context.data.key
      const items = util.toArray(context.data.items).map(sketch.fromNative)
      items.forEach((item, index) => {
        detectLanguageFor(item.text)
          .then(sourceLanguage => {
            let targetLanguage = langs[Math.floor(Math.random()*langs.length)]
            const url = `${API_URL}translate?key=${YANDEX_API_KEY}&lang=${sourceLanguage}-${targetLanguage}&text=${encodeURI(item.text)}`
            fetch(url)
              .then(response => response.json())
              .then(json => {
                DataSupplier.supplyDataAtIndex(dataKey, json.text[0], index)
                UI.message(null)
              })
          })
      })
    }).catch(e => console.error(e))
}

function getAvailableLanguages(){
  return new Promise(function(resolve, reject){
    fetch(`${API_URL}getLangs?key=${YANDEX_API_KEY}&ui=en`)
      .then(response => response.json())
      .then(json => resolve(Object.keys(json.langs)))
  })
}

function detectLanguageFor(text){
  return new Promise(function(resolve, reject){
    let detectURL = `${API_URL}detect?key=${YANDEX_API_KEY}&text=${encodeURI(text)}`
    fetch(detectURL)
    .then(response => response.json())
    .then(json => {
      resolve(json.lang)
    })
  })
}
