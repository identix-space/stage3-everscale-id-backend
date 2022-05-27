import Query, {requireAccount} from './query';
import Mutation from './mutation';
import {AccountStatus, Resolvers, Vc} from '../generated/graphql_api';
import {GraphQLScalarType} from 'graphql';
import {ApolloError} from 'apollo-server-express';
import StatusCodes from '../tools/StatusCodes';
import geoip from 'geoip-lite';
import uaParse from 'ua-parser-js';
import GraphQLError from '../tools/GraphQLError';
import {getLogger} from '../tools/Logger';

const log = getLogger('root resolver');

const resolvers: Resolvers = {
    Query: Query.Query,
    Mutation: Mutation.Mutation,
    Date: new GraphQLScalarType({
        name: 'Date',
        parseValue(value) {
            return new Date(value);
        },
        serialize(value) {
            return value.toISOString();
        }
    }),
    Account: {
        sessions: async (parent, args, {prisma, session}) => {
            if (parent.sessions) {
                return parent.sessions;
            }

            if (!session?.account) {
                throw new ApolloError('Forbidden', String(StatusCodes.FORBIDDEN));
            }

            const sessions = await prisma.accountSession.findMany({where: {account: {id: parent.id}}});
            return sessions.map(currentSession => {
                const location = geoip.lookup(currentSession.ipAddr);
                let address = '';
                if (location) {
                    address = location.country;
                    if (location.city.length > 0) {
                        address = `${address} (${location.city})`;
                    }
                }
                return ({
                    ...currentSession,
                    userAgent: !currentSession.userAgent ? undefined : uaParse(currentSession.userAgent),
                    address: address.length > 0 ? address : undefined
                });
            });
        }
    },
    Service: {
        vcTemplates: async (parent, args, {session, prisma}) => {
            requireAccount(session);

            const res = await prisma.service.findFirst({where: {id: parent.id}, include: {vcTemplates: true}});
            if (!res) {
                throw new GraphQLError({message: 'Not found', code: StatusCodes.NOT_FOUND});
            }
            return res.vcTemplates;
        }
    },
    VCTemplateSection: {
        // eslint-disable-next-line sonarjs/no-identical-functions
        vcTemplates: async (parent, args, {session, prisma}) => {
            requireAccount(session);

            const res = await prisma.vCTemplateSection.findFirst({where: {id: parent.id}, include: {vcTemplates: true}});
            if (!res) {
                throw new GraphQLError({message: 'Not found', code: StatusCodes.NOT_FOUND});
            }
            return res.vcTemplates;
        }
    },
    VCTemplate: {
        services: async (parent, args, {session, prisma}) => {
            requireAccount(session);

            const res = await prisma.vCTemplate.findFirst({where: {id: parent.id}, include: {services: true}});
            if (!res) {
                throw new GraphQLError({message: 'Not found', code: StatusCodes.NOT_FOUND});
            }
            return res.services;
        },
        sections: async (parent, args, {session, prisma}) => {
            requireAccount(session);

            const res = await prisma.vCTemplate.findFirst({where: {id: parent.id}, include: {sections: true}});
            if (!res) {
                throw new GraphQLError({message: 'Not found', code: StatusCodes.NOT_FOUND});
            }
            return res.sections;
        },
        vc: async (parent, args, {session, prisma}) => {
            requireAccount(session);

            const res = await prisma.vC.findFirst({
                where: {
                    vcTemplate: {id: parent.id},
                    owner: {id: session?.account.id}
                }
            });

            if (!res) {
                return null;
            }
            return {
                ...res,
                value: (JSON.parse(res.valueJson)) as Vc
            };
        }
    },
    VC: {
        vcTemplate: async (parent, args, {session, prisma}) => {
            requireAccount(session);

            const res = await prisma.vC.findFirst({where: {id: parent.id}, include: {vcTemplate: true}});
            if (!res) {
                throw new GraphQLError({message: 'Not found', code: StatusCodes.NOT_FOUND});
            }
            return res.vcTemplate;
        },
        owner: async (parent, args, {session, prisma}) => {
            requireAccount(session);

            const res = await prisma.vC.findFirst({where: {id: parent.id}, include: {owner: true}});
            if (!res) {
                throw new GraphQLError({message: 'Not found', code: StatusCodes.NOT_FOUND});
            }
            return {
                ...res.owner,
                status: res.owner.status as AccountStatus
            };
        }
    }
};
export default resolvers;
