import express from 'express';
import path from 'node:path';
import db from './config/connection.js';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { typeDefs, resolvers } from './schemas/index.js';
import { authenticateToken } from './services/auth.js';
import cors from 'cors';

const PORT = process.env.PORT || 3001;
const app = express();

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

await server.start();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  '/graphql',
  expressMiddleware(server, {
    context: async ({ req }: { req: express.Request }) => authenticateToken({ req }),

  })
);

db.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

console.log('⏳ Waiting for DB to connect...');



if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(process.cwd(), 'client/dist/')));
  app.get('*', (_, res) => {
    res.sendFile(path.join(process.cwd(), 'client/dist/index.html'));
  });
}

db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
    console.log(`GraphQL at http://localhost:${PORT}/graphql`);
  });
});

