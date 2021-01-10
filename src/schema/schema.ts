import { gql } from 'apollo-server-express';

const typeDefs = gql`
    type Restaurant {
        id: ID!
        name: String!
        address: String!
        locality: String
        city: String
        priceRange: Int
        website: String
        averageCostForTwo: Int
        featuredImage: String
        rating: Int
        phoneNumber: String
        cuisines: String
    }

    type Establishment {
        id: ID!
        name: String!
    }

    type Query {
        search(location: String!): [Restaurant]
        establishments(location: String!): [Establishment]
    }
`;

const queryResolvers = {
    Query: {
        search(_, { location }, { dataSources }) {
            return dataSources.zomatoAPI.searchForRestaurantsAtLocation(location);
        },
        establishments(_, { location }, { dataSources }) {
            return dataSources.zomatoAPI.getEstablishmentsAtLocation(location);
        }
    }
}

export const schema = typeDefs;
export const resolvers = queryResolvers;