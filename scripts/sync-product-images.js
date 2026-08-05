/**
 * sync-product-images.js
 *
 * Синхронизирует поле images[] в products.json с реальными файлами
 * в папках /public/images/products/product_{id}/.
 *
 * Запуск:
 *   node scripts/sync-product-images.js
 *   или автоматически через prebuild в package.json
 *
 * Как добавить ещё фото для товара:
 *   1. Положите файлы в /public/images/products/product_{id}/
 *      Файлы могут называться как угодно — photo_2.jpg, back.jpg и т.д.
 *   2. Запустите этот скрипт (или пересоберите проект: npm run build)
 *   3. Поле images[] в products.json обновится автоматически
 */

const fs   = require('fs')
const path = require('path')

const PRODUCTS_DIR = path.resolve(__dirname, '../public/images/products')
const DATA_FILE    = path.resolve(__dirname, '../public/data/products.json')

function main() {
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
  let changed = false

  data.products.forEach(product => {
    const id         = product.id
    const folderPath = path.join(PRODUCTS_DIR, `product_${id}`)

    if (!fs.existsSync(folderPath)) return

    const extraPhotos = fs.readdirSync(folderPath)
      .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
      .sort()
      .map(f => `/images/products/product_${id}/${f}`)

    if (extraPhotos.length === 0) {
      // Нет доп. фото — убираем поле images если оно было
      if (product.images !== undefined) {
        delete product.images
        changed = true
        console.log(`[sync] Removed images[] from product ${id}`)
      }
      return
    }

    const mainImage = product.image
    const allImages = mainImage ? [mainImage, ...extraPhotos] : extraPhotos

    const current = JSON.stringify(product.images ?? null)
    const updated = JSON.stringify(allImages)

    if (current !== updated) {
      product.images = allImages
      changed = true
      console.log(`[sync] Updated product ${id}: ${allImages.length} photo(s)`)
    }
  })

  if (changed) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8')
    console.log('[sync] products.json saved.')
  } else {
    console.log('[sync] products.json is already up to date.')
  }
}

main()
