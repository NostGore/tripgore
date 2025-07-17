const mediaDB = require('../../src/mediaDB');

exports.handler = async (event, context) => {
  try {
    // Habilita CORS
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET'
    };

    // Manejar solicitud OPTIONS para CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 204,
        headers,
        body: ''
      };
    }

    // Obtener parámetros
    const { id } = event.queryStringParameters || {};

    // Si hay un ID, buscar video específico
    if (id) {
      const video = mediaDB.videos.find(v => v.id === id);
      if (video) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(video)
        };
      }
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Video no encontrado' })
      };
    }

    // Si no hay ID, devolver todos los videos
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(mediaDB.videos)
    };
    
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Error interno del servidor' })
    };
  }
};