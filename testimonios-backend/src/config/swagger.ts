import config from "@config";
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Sistema de archivo de testimonios del bicentenario',
      version: '1.0.0',
      description: 'Documentación de la API de Testimonios',
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: 'Servidor de desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{
      bearerAuth: [],
    }],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);

export const swaggerUiOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "API de Testimonios - Documentación",
  customfavIcon: "/favicon.ico",
  swaggerOptions: {
    persistAuthorization: true,
  },
}; 