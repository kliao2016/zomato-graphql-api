import express from 'express';
import cors from 'cors';
import { ApolloServer } from 'apollo-server-express';
import { schema, resolvers } from './schema/schema';
import { dataSources } from './zomato_api_bridge/zomato-api-bridge';

const app = express();
app.use(cors());

const server = new ApolloServer({
    typeDefs: schema,
    resolvers,
    dataSources: dataSources
});

// Apply express middleware
server.applyMiddleware({
    app,
    path: '/graphql'
});

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log('Apollo Server running on http://localhost:3000/graphql');
});
