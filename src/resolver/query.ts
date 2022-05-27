import {AccountSession, AccountStatus, Resolvers} from '../generated/graphql_api';
import {getLogger} from '../tools/Logger';
import StatusCodes from '../tools/StatusCodes';
import {prisma} from '../tools/Prisma';
import GraphQLError from '../tools/GraphQLError';
import packageJson from '../../package.json';

const log = getLogger('query');

export function requireAccount(session: AccountSession | undefined): void {
    if (!session?.account) {
        throw new GraphQLError({message: 'Forbidden', code: StatusCodes.FORBIDDEN});
    }
}

const resolvers: Resolvers = {
    Query: {
        version: () => {
            return `${packageJson.name} (1)`;
        },
        echo: (parent, args) => {
            log.trace({args});
            return args.text;
        },
        whoami: async (parent, args, {session}) => {
            requireAccount(session);

            const accountDb = await prisma.account.findFirst({where: {id: session?.account.id}});
            if (!accountDb) {
                throw new GraphQLError({message: 'Account not found', code: StatusCodes.NOT_FOUND});
            }
            if (accountDb.status !== AccountStatus.Active) {
                throw new GraphQLError({
                    message: `Account not active. Current account status: ${accountDb.status}`,
                    code: StatusCodes.METHOD_NOT_ALLOWED
                });
            }

            return {
                ...accountDb,
                status: accountDb.status as AccountStatus
            };
        },
        currentSession: async (parent, args, {session}) => {
            if (!session) {
                throw new GraphQLError({message: 'Not found', code: StatusCodes.NOT_FOUND});
            } else {
                return session;
            }
        },
        vcTemplateSections: async (parent, args, {session, prisma}) => {
            requireAccount(session);

            return await prisma.vCTemplateSection.findMany();
        },
        services: async (parent, {filter}, {session, prisma}) => {
            requireAccount(session);

            return await prisma.service.findMany({
                where: !filter?.vcTemplateId ? undefined : {
                    vcTemplates: {
                        some: {id: filter.vcTemplateId}
                    }
                }
            });
        },
        service: async (parent, {id}, {session, prisma}) => {
            requireAccount(session);

            const res = await prisma.service.findFirst({where: {id}});
            return {
                ...res
            };
        },
        vcTemplate: async (parent, {id}, {session, prisma}) => {
            requireAccount(session);

            const res = await prisma.vCTemplate.findFirst({where: {id}});
            return {
                ...res
            };
        }
    }
};

export default resolvers;
