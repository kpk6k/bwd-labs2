import swaggerJsdoc from 'swagger-jsdoc'

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API for event management',
            description: "API endpoints for an event manager",
            version: '1.0.0',
        },
        servers: [
            {
                url: "http://localhost:4000/",
                description: "Local server"
            },
        ],
		components: {
			securitySchemes: {
				BearerAuth: {
          			type: 'http',
          			scheme: 'bearer',
          			bearerFormat: 'JWT',
          			description: "Введите JWT токен в формате: Bearer <token>"
        		}
			}
    	},
		security: [
			{
        		BearerAuth: []
			}
		]
	},
    // looks for configuration in specified directories.
    // path from the directory where 'package.json' resides
    apis: ['src/controller/*.js', 'src/database/model/*.js'],
}

const swaggerSpec = swaggerJsdoc(options);

export { swaggerSpec }
