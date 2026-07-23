/** @type {import('next').NextConfig} */
module.exports = {
  // Единый канонический вид URL: со слэшем на конце (/catalog/).
  // Запросы без слэша получают 308-редирект — дублей страниц для поисковиков нет.
  trailingSlash: true,
}
