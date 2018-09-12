const sketch = require('sketch')
const { DataSupplier } = sketch
const util = require('util')

const YANDEX_API_KEY = "trnsl.1.1.20180912T154941Z.a526333405a74b23.f809d9991b4d9e56bf40c95e7d5325513669a25b"
const API_URL = `https://translate.yandex.net/api/v1.5/tr.json/translate`

export function onStartup () {
  // Register the plugin
  DataSupplier.registerDataSupplier('public.text', 'Data Translate To Russian', 'SupplyRussianTranslation')
  DataSupplier.registerDataSupplier('public.text', 'Data Translate To Japanese', 'SupplyJapaneseTranslation')
}

export function onShutdown () {
  // Deregister the plugin
  DataSupplier.deregisterDataSuppliers()
}

function translateURL(lang, text) {
  return `${API_URL}?key=${YANDEX_API_KEY}&lang=en-${lang}&text=${encodeURIComponent(text)}`
}

function supplyTranslation (context, lang) {
  let dataKey = context.data.key
  const items = util.toArray(context.data.items).map(sketch.fromNative)
  items.forEach((item, index) => {
    fetch(translateURL(lang, item.text))
      .then(response => response.json() )
      .then(json => {
        DataSupplier.supplyDataAtIndex(dataKey, json.text[0], index)
      })
      .catch(e => console.error(e))
  })
}

export function onSupplyRussianTranslation (context) {
  return supplyTranslation(context, 'ru')
}

export function onSupplyJapaneseTranslation (context) {
  return supplyTranslation(context, 'ja')
}
