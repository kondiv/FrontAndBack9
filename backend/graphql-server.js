const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const http = require('http');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/lib/use/ws');
const fs = require('fs');
const path = require('path');

const PORT = 4000;
const PRODUCTS_FILE = path.join(__dirname, 'products.json');

const productsData = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));

const typeDefs = `
  type Product {
    id: ID!
    name: String!
    price: Float!
    description: String
    category: String
  }

  type Query {
    products: [Product]
    product(id: ID!): Product
    productNames: [String]
    productPrices: [Float]
    productsWithNamesAndPrices: [ProductNamePrice]
  }

  type ProductNamePrice {
    name: String!
    price: Float!
  }
`;

const resolvers = {
  Query: {
    products: () => productsData,
    product: (_, { id }) => productsData.find(product => product.id == id),
    productNames: () => productsData.map(product => product.name),
    productPrices: () => productsData.map(product => product.price),
    productsWithNamesAndPrices: () => 
      productsData.map(({name, price}) => ({name, price}))
  }
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

const app = express();
const httpServer = http.createServer(app);

const server = new ApolloServer({
  schema,
  plugins: [{
    async serverWillStart() {
      return {
        async drainServer() {
          await serverCleanup.dispose();
        }
      };
    }
  }]
});

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql'
});

const serverCleanup = useServer({ schema }, wsServer);

(async () => {
  await server.start();
  server.applyMiddleware({ app });

  httpServer.listen(PORT, () => {
    console.log(`GraphQL server running on http://localhost:${PORT}/graphql`);
    console.log(`WebSocket server running on ws://localhost:${PORT}/graphql`);
  });
})();