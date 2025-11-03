// Script para generar sitemap-videos.xml desde mediaDB.js
// Uso: node generate-video-sitemap.js

const fs = require('fs');
const path = require('path');

// Leer el archivo mediaDB.js
const mediaDBPath = path.join(__dirname, 'database', 'mediaDB.js');
const mediaDBContent = fs.readFileSync(mediaDBPath, 'utf8');

// Extraer todos los videos usando regex
const videoObjects = [];
const videoBlockRegex = /\{\s*id:\s*"([^"]+)",[\s\S]*?titulo:\s*"([^"]+)",[\s\S]*?fecha:\s*"([^"]+)"\s*\},?/g;

let match;
while ((match = videoBlockRegex.exec(mediaDBContent)) !== null) {
    const [, id, titulo, fecha] = match;
    if (id) {
        videoObjects.push({ id, titulo: titulo || '', fecha: fecha || '' });
    }
}

// Si no se encontraron videos con el regex completo, usar método más simple
if (videoObjects.length === 0) {
    console.log('⚠️ Método regex completo no funcionó, usando método alternativo...');
    const idMatches = [...mediaDBContent.matchAll(/id:\s*"([^"]+)"/g)];
    idMatches.forEach(match => {
        videoObjects.push({ id: match[1], titulo: '', fecha: '' });
    });
}

// Función para convertir fecha DD/MM/YY o DD/MM/YYYY a formato ISO
function parseDate(dateStr) {
    if (!dateStr) return new Date().toISOString().split('T')[0] + 'T00:00:00+00:00';
    
    const parts = dateStr.split('/');
    if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        let year = parts[2];
        
        // Si el año tiene 2 dígitos, asumir 20XX
        if (year.length === 2) {
            year = '20' + year;
        }
        
        return `${year}-${month}-${day}T00:00:00+00:00`;
    }
    return new Date().toISOString();
}

// Generar sitemap XML
const baseUrl = 'https://tripgore.space';
const currentDate = new Date().toISOString().split('T')[0] + 'T00:00:00+00:00';

let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

`;

// Agregar cada video al sitemap
videoObjects.forEach(video => {
    if (video && video.id) {
        const videoDate = video.fecha ? parseDate(video.fecha) : currentDate;
        sitemap += `  <url>
    <loc>${baseUrl}/video.html?id=${encodeURIComponent(video.id)}</loc>
    <lastmod>${videoDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

`;
    }
});

sitemap += `</urlset>`;

// Guardar el sitemap
const sitemapPath = path.join(__dirname, 'sitemap-videos.xml');
fs.writeFileSync(sitemapPath, sitemap, 'utf8');

console.log(`✅ Sitemap generado exitosamente: ${videoObjects.length} videos incluidos`);
console.log(`📁 Archivo guardado en: ${sitemapPath}`);
