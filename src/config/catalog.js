/**
 * catalog.js — конфигурация источников данных каталога
 *
 * SHEETS_PRICES_URL — URL вашего Google Apps Script Web App.
 * Как получить URL:
 *   1. Откройте Google Таблицу с ценами
 *   2. Расширения → Apps Script
 *   3. Вставьте код из инструкции, нажмите «Развернуть» → «Новое развёртывание»
 *   4. Тип: «Веб-приложение», доступ: «Все»
 *   5. Скопируйте URL и вставьте сюда
 *
 * Если строка пустая — сайт будет использовать цены из локального products.json
 */
export const SHEETS_PRICES_URL = 'https://script.google.com/macros/s/AKfycbypZg3ECx-siAGXfi4zoXfhDOwCU0QEKjkUXMr8bRXJ6Jg-UHwhY_hg4vZ2L0Fy-Mra/exec'  // ← вставьте сюда URL вида

/**
 * Время жизни кэша цен в миллисекундах.
 * По умолчанию — 5 минут.
 * Изменения в таблице станут видны посетителям через это время.
 */
export const PRICES_CACHE_TTL = 0
