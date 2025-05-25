# CNC Technical AI

A chatbot that provides detailed technical information about CNC machines and related products. Built with Express.js, TypeScript, and OpenAI's GPT API.

## Note

This is a work in progress and is for testing purposes only. The chatbot may not provide accurate information. Always double-check with a qualified professional.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- **Node.js**: The project is built on Node.js. You can download it from [here](https://nodejs.org/).
- **npm** or **Yarn**: This project uses npm as the package manager, but you can use Yarn as well.
- **MongoDB**: You need a MongoDB instance running locally or in the cloud. You can download MongoDB Community Edition from [here](https://www.mongodb.com/try/download/community).
- **OpenAI API Key**: You'll need an API key from OpenAI to access their GPT models. You can get one from [OpenAI's website](https://platform.openai.com/api-keys).

## Getting Started

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/Deejpotter/cnc-tools.git
   ```

2. **Navigate to the backend directory**:

   ```bash
   cd cnc-tools/backend
   ```

3. **Install Dependencies**:

   ```bash
   npm install
   # or if using Yarn
   yarn install
   ```

4. **Set Environment Variables**:
   - Copy the provided `.env.sample` file to `.env`

   ```bash
   cp .env.sample .env
   ```

   - Edit the `.env` file with your specific configuration:
     - Add your OpenAI API key
     - Configure MongoDB connection
     - Set allowed origins for CORS

5. **Run the Application**:

   ```bash
   # For development with auto-reload:
   npm run dev
   # or
   yarn dev

   # For production:
   npm run build
   npm start
   # or
   yarn build
   yarn start
   ```

6. **Testing**:

   ```bash
   # Run tests once:
   npm test
   
   # Run tests in watch mode:
   npm run test:watch
   
   # Run tests with coverage report:
   npm run test:coverage
   ```

7. **Access the API Documentation**:
   - Once the application is running, you can access the Swagger documentation at:
   - `http://localhost:3001/swagger` (or whatever port you've configured)

## Project Structure

```
backend/
├── dist/                # Compiled TypeScript output
├── src/
│   ├── actions/         # Business logic actions
│   ├── data/            # Data access layer
│   ├── routes/          # API route definitions
│   ├── services/        # Service layer (chat engine, QA manager)
│   ├── types/           # TypeScript type definitions
│   └── app.ts           # Main application entry point
├── .env                 # Environment variables (not in git)
├── .env.sample          # Sample environment variables
├── package.json         # Project dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── jest.config.js       # Test configuration
```

## Contributing

If you'd like to contribute, please fork the repository and use a feature branch. Pull requests are warmly welcome.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
