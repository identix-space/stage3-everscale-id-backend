import {AccountStatus, Resolvers, VcTemplateType} from '../generated/graphql_api';
import {getLogger} from '../tools/Logger';
import StatusCodes from '../tools/StatusCodes';
import {AuthUtils} from '../tools/AuthUtils';
import config from '../config/config';
import * as PrismaClient from '@prisma/client';
import express from 'express';
import GraphQLError from '../tools/GraphQLError';
import uaParse from 'ua-parser-js';
import geoip from 'geoip-lite';
import {DIDTools} from '../tools/DIDTools';
import {ICredentialSubject, IDIDDocument, IVerifiableCredentialEd25519} from '../tools/DIDInterfaces';
import {DIDDocument} from 'everscaleid-sdk/build/src/DIDDocument';
import {libNode} from '@tonclient/lib-node';
import {DIDRegistry} from 'everscaleid-sdk/build/src/DIDRegistry';

const log = getLogger('mutation');

async function createNewSession(prisma: PrismaClient.PrismaClient, accountId: number, token: string, request: express.Request): Promise<PrismaClient.AccountSession> {
    const ipAddr: string = request.headers['x-forwarded-for'] ? request.headers['x-forwarded-for'].toString().split(', ')[0] : request.socket.remoteAddress || 'unknown';

    return await prisma.accountSession.create({
        data: {
            account: {connect: {id: accountId}},
            token,
            expiresAt: new Date(new Date().getTime() + config.server.sessionExpiresIn),
            ipAddr,
            userAgent: request.headers['user-agent']
        }
    });
}

const mutation: Resolvers = {
    Mutation: {
        echo: (parent, args) => {
            log.trace({args});
            return args.text;
        },
        logout: async (parent, {sessionIds}, {prisma, session}) => {
            if (!session?.account) {
                throw new GraphQLError({message: 'Forbidden', code: StatusCodes.FORBIDDEN});
            }

            let deletedSessions: number;

            if (sessionIds && sessionIds.length > 0) {
                deletedSessions = (await prisma.accountSession.deleteMany({
                    where: {
                        AND: [
                            {
                                OR: sessionIds.map(sessionId => ({
                                    id: sessionId
                                }))
                            },
                            {account: {id: session.account.id}}
                        ]
                    }
                })).count;
            } else {
                deletedSessions = (await prisma.accountSession.deleteMany({
                    where: {
                        AND: [
                            {id: session.id},
                            {account: {id: session.account.id}}
                        ]
                    }
                })).count;
            }

            return deletedSessions > 0;
        },
        loginGenerate: async (parent, {did}, {prisma}) => {
            const message = `Please sign this data: ${AuthUtils.generateToken()}`;

            const ONE_HOUR = 3600000;
            const expiresAt = new Date(new Date().getTime() + ONE_HOUR);
            await prisma.verifyMessage.upsert({
                where: {did},
                update: {did, message, expiresAt},
                create: {did, message, expiresAt}
            });
            return message;
        },
        createDidDocument: async (parent, {ownerPublicKey}) => {
            if (!ownerPublicKey.startsWith('0x')) {
                throw new GraphQLError({
                    message: 'Invalid ownerPublicKey, it should start with "0x"',
                    code: StatusCodes.BAD_REQUEST
                });
            }

            const didRegistry = new DIDRegistry({
                tonBinary: libNode,
                didRegistryAddress: config.didRegistryAddress,
                everscaleApiUrls: config.everscaleEndpoints
            });
            const didDoc: IDIDDocument = {
                id: `did:ever:${ownerPublicKey}`,
                createdAt: new Date().getTime().toString(),
                '@context': [
                    'https://www.w3.org/ns/did/v1',
                    'https://w3id.org/security/suites/ed25519-2020/v1'
                ],
                publicKey: ownerPublicKey,
                verificationMethod: {
                    id: 'null',
                    type: 'Ed25519VerificationKey2020',
                    controller: 'null',
                    publicKeyMultibase: ownerPublicKey
                }
            };

            return await didRegistry.issueDidDocument({
                initialDocBalance: config.didRegistryInitialDocBalance,
                controllerKeys: config.didRegistryControllerKeys,
                content: JSON.stringify(didDoc),
                docOwnerPubKey: ownerPublicKey
            });
        },
        // eslint-disable-next-line complexity
        loginVerify: async (parent, {did, signatureHex}, {prisma, request}) => {
            const message = await prisma.verifyMessage.findFirst({where: {did}});
            if (!message) {
                throw new GraphQLError({message: 'Not found generated messages', code: StatusCodes.NOT_FOUND});
            }
            if (message.expiresAt.getTime() < new Date().getTime()) {
                throw new GraphQLError({message: 'Message expired', code: StatusCodes.GONE});
            }

            const didDocumentAddress = did.split('did:ever:').join('');

            const didDoc = new DIDDocument({
                tonBinary: libNode,
                didDocumentAddress,
                everscaleApiUrls: config.everscaleEndpoints
            });

            const didDocContentString = await didDoc.getContent();
            const didDocContent = JSON.parse(didDocContentString) as IDIDDocument;

            const publicKey = didDocContent.publicKey;

            if (!await DIDTools.verifyMessage({
                signatureHex,
                message: message.message,
                publicKey: publicKey.split('0x').join('')
            })) {
                throw new GraphQLError({message: 'Wrong signature', code: StatusCodes.FORBIDDEN});
            }

            await prisma.verifyMessage.delete({where: {did}});
            const account = await prisma.account.upsert({
                where: {did},
                create: {did, status: AccountStatus.Active},
                update: {did}
            });
            const token = AuthUtils.generateToken();
            const session = await createNewSession(prisma, account.id, token, request);

            const location = geoip.lookup(session.ipAddr);
            let address = '';
            if (location) {
                address = location.country;
                if (location.city.length > 0) {
                    address = `${address} (${location.city})`;
                }
            }

            return {
                account: {
                    ...account,
                    sessions: [
                        {
                            ...session,
                            userAgent: !session.userAgent ? undefined : uaParse(session.userAgent),
                            address: address.length > 0 ? address : undefined,
                            account: {
                                ...account,
                                status: account.status as AccountStatus
                            }
                        }
                    ],
                    status: account.status as AccountStatus
                },
                token
            };
        },
        vcCreateProofOfTonAddressGenerate: async (parent, args, {session, prisma}) => {
            if (!session?.account) {
                throw new GraphQLError({message: 'Forbidden', code: StatusCodes.FORBIDDEN});
            }

            // const message = '123'; //todo REMOVE ME
            const message = AuthUtils.generateToken();

            await prisma.oneTimeMessage.upsert({
                where: {accountId: session.account.id},
                create: {message, account: {connect: {id: session.account.id}}},
                update: {message}
            });

            return message;
        },
        vcCreateProofOfTonAddressVerify: async (parent, {signatureHex, walletAddress}, {session, prisma}) => {
            if (!session?.account) {
                throw new GraphQLError({message: 'Forbidden', code: StatusCodes.FORBIDDEN});
            }

            const OTMessage = await prisma.oneTimeMessage.findFirst({where: {account: {id: session.account.id}}});
            if (!OTMessage) {
                throw new GraphQLError({
                    message: 'Code not generated',
                    code: StatusCodes.NOT_FOUND,
                    internalData: {did: session.account.did}
                });
            }

            const didDocumentAddress = session.account.did;

            const didDoc = new DIDDocument({
                tonBinary: libNode,
                didDocumentAddress,
                everscaleApiUrls: config.everscaleEndpoints
            });

            const didDocContentString = await didDoc.getContent();
            const didDocContent = JSON.parse(didDocContentString) as IDIDDocument;

            const valid = await DIDTools.verifyMessage({
                signatureHex,
                message: OTMessage.message,
                publicKey: didDocContent.publicKey.split('0x').join('')
            });

            if (!valid) {
                throw new GraphQLError({
                    message: 'Wrong signature',
                    code: StatusCodes.FORBIDDEN,
                    internalData: {did: session.account.did}
                });
            }

            await prisma.oneTimeMessage.delete({where: {id: OTMessage.id}});

            await prisma.vC.deleteMany({
                where: {
                    owner: {id: session.account.id},
                    vcTemplate: {type: VcTemplateType.ProofOfTonAddress}
                }
            }); // todo remove me in future (in version 2.0)

            const walletCustodians = await DIDTools.getMultiSigCustodians(walletAddress);
            if (!walletCustodians || walletCustodians?.indexOf(didDocContent.publicKey) === -1) {
                throw new GraphQLError({
                    message: 'You are not wallet custodians',
                    code: StatusCodes.FORBIDDEN
                });
            }

            const credentialSubject: ICredentialSubject = {
                id: `did:ever:${session.account.did}`,
                degree: {
                    type: VcTemplateType.ProofOfTonAddress,
                    data: {
                        address: walletAddress
                    }
                }
            };

            const vcSignature = await DIDTools.signMessage({
                message: JSON.stringify(credentialSubject),
                privateKey: config.everscaleKeyPair.secret
            });

            const VC: IVerifiableCredentialEd25519 = {
                '@context': ['https://www.w3.org/2018/credentials/v1'],
                id: session.account.did,
                type: ['VerifiableCredential'],
                proof: {
                    type: VcTemplateType.ProofOfTonAddress,
                    signature: vcSignature,
                    created: new Date(),
                    verificationMethod: `did:ever:${config.everscaleKeyPair.public}#${session.account.did}`
                },
                credentialSubject,
                issuanceDate: new Date(),
                issuer: {
                    id: `did:ever:${config.everscaleKeyPair.public}`
                }
            };

            const res = await prisma.vC.create({
                data: {
                    vcTemplate: {connect: {type: VcTemplateType.ProofOfTonAddress}},
                    owner: {connect: {id: session.account.id}},
                    valueJson: JSON.stringify({VC})
                }
            });
            return {
                ...res,
                value: VC
            };
        },

        vcCreateProofOfStateId: async (parent, args, {session, prisma}) => {
            if (!session?.account) {
                throw new GraphQLError({message: 'Forbidden', code: StatusCodes.FORBIDDEN});
            }

            await prisma.vC.deleteMany({
                where: {
                    owner: {id: session.account.id},
                    vcTemplate: {type: VcTemplateType.ProofOfStateId}
                }
            });

            const credentialSubject: ICredentialSubject = {
                id: `did:ever:${session.account.did}`,
                degree: {
                    type: VcTemplateType.ProofOfStateId,
                    data: {
                        name: 'Name Lastname',
                        id: '123456789',
                        birthday: '01.01.1970',
                        country: 'Free TON Land',
                        issuing_body: 'Administration'
                    }
                }
            };

            const vcSignature = await DIDTools.signMessage({
                message: JSON.stringify(credentialSubject),
                privateKey: config.everscaleKeyPair.secret
            });

            const VC: IVerifiableCredentialEd25519 = {
                '@context': ['https://www.w3.org/2018/credentials/v1'],
                id: session.account.did,
                type: ['VerifiableCredential'],
                proof: {
                    type: VcTemplateType.ProofOfStateId,
                    signature: vcSignature,
                    created: new Date(),
                    verificationMethod: `did:ever:${config.everscaleKeyPair.public}#${session.account.did}`
                },
                credentialSubject,
                issuanceDate: new Date(),
                issuer: {
                    id: `did:ever:${config.everscaleKeyPair.public}`
                }
            };

            const res = await prisma.vC.create({
                data: {
                    vcTemplate: {connect: {type: VcTemplateType.ProofOfStateId}},
                    owner: {connect: {id: session.account.id}},
                    valueJson: JSON.stringify({VC})
                }
            });
            return {
                ...res,
                value: VC
            };
        },
        vcCreateProofOfTaxResidency: async (parent, args, {session, prisma}) => {
            if (!session?.account) {
                throw new GraphQLError({message: 'Forbidden', code: StatusCodes.FORBIDDEN});
            }

            await prisma.vC.deleteMany({
                where: {
                    owner: {id: session.account.id},
                    vcTemplate: {type: VcTemplateType.ProofOfTaxResidency}
                }
            });

            const credentialSubject: ICredentialSubject = {
                id: `did:ever:${session.account.did}`,
                degree: {
                    type: VcTemplateType.ProofOfTaxResidency,
                    data: {
                        name: 'Name Lastname',
                        id: '123456789',
                        tax_residency: 'Free TON Land',
                        issuing_body: 'Administration'
                    }
                }
            };

            const vcSignature = await DIDTools.signMessage({
                message: JSON.stringify(credentialSubject),
                privateKey: config.everscaleKeyPair.secret
            });

            const VC: IVerifiableCredentialEd25519 = {
                '@context': ['https://www.w3.org/2018/credentials/v1'],
                id: session.account.did,
                type: ['VerifiableCredential'],
                proof: {
                    type: VcTemplateType.ProofOfTaxResidency,
                    signature: vcSignature,
                    created: new Date(),
                    verificationMethod: `did:ever:${config.everscaleKeyPair.public}#${session.account.did}`
                },
                credentialSubject,
                issuanceDate: new Date(),
                issuer: {
                    id: `did:ever:${config.everscaleKeyPair.public}`
                }
            };

            const res = await prisma.vC.create({
                data: {
                    vcTemplate: {connect: {type: VcTemplateType.ProofOfTaxResidency}},
                    owner: {connect: {id: session.account.id}},
                    valueJson: JSON.stringify({VC})
                }
            });
            return {
                ...res,
                value: VC
            };
        },
        vcCreateProofOfEthAddress: async (parent, args, {session, prisma}) => {
            if (!session?.account) {
                throw new GraphQLError({message: 'Forbidden', code: StatusCodes.FORBIDDEN});
            }

            await prisma.vC.deleteMany({
                where: {
                    owner: {id: session.account.id},
                    vcTemplate: {type: VcTemplateType.ProofOfEthAddress}
                }
            });

            const credentialSubject: ICredentialSubject = {
                id: `did:ever:${session.account.did}`,
                degree: {
                    type: VcTemplateType.ProofOfEthAddress,
                    data: {
                        address: '0xC572Ec7B6F4404A1806aeBbE5ABa5854F73f4091'
                    }
                }
            };

            const vcSignature = await DIDTools.signMessage({
                message: JSON.stringify(credentialSubject),
                privateKey: config.everscaleKeyPair.secret
            });

            const VC: IVerifiableCredentialEd25519 = {
                '@context': ['https://www.w3.org/2018/credentials/v1'],
                id: session.account.did,
                type: ['VerifiableCredential'],
                proof: {
                    type: VcTemplateType.ProofOfEthAddress,
                    signature: vcSignature,
                    created: new Date(),
                    verificationMethod: `did:ever:${config.everscaleKeyPair.public}#${session.account.did}`
                },
                credentialSubject,
                issuanceDate: new Date(),
                issuer: {
                    id: `did:ever:${config.everscaleKeyPair.public}`
                }
            };

            const res = await prisma.vC.create({
                data: {
                    vcTemplate: {connect: {type: VcTemplateType.ProofOfEthAddress}},
                    owner: {connect: {id: session.account.id}},
                    valueJson: JSON.stringify({VC})
                }
            });
            return {
                ...res,
                value: VC
            };
        },
        vcCreateProofOfUniswapAccount: async (parent, args, {session, prisma}) => {
            if (!session?.account) {
                throw new GraphQLError({message: 'Forbidden', code: StatusCodes.FORBIDDEN});
            }

            await prisma.vC.deleteMany({
                where: {
                    owner: {id: session.account.id},
                    vcTemplate: {type: VcTemplateType.ProofOfUniswapAccount}
                }
            });

            const credentialSubject: ICredentialSubject = {
                id: `did:ever:${session.account.did}`,
                degree: {
                    type: VcTemplateType.ProofOfUniswapAccount,
                    data: {
                        eth_address: '0xC572Ec7B6F4404A1806aeBbE5ABa5854F73f4091',
                        uniswap_status: 'active trader'
                    }
                }
            };

            const vcSignature = await DIDTools.signMessage({
                message: JSON.stringify(credentialSubject),
                privateKey: config.everscaleKeyPair.secret
            });

            const VC: IVerifiableCredentialEd25519 = {
                '@context': ['https://www.w3.org/2018/credentials/v1'],
                id: session.account.did,
                type: ['VerifiableCredential'],
                proof: {
                    type: VcTemplateType.ProofOfUniswapAccount,
                    signature: vcSignature,
                    created: new Date(),
                    verificationMethod: `did:ever:${config.everscaleKeyPair.public}#${session.account.did}`
                },
                credentialSubject,
                issuanceDate: new Date(),
                issuer: {
                    id: `did:ever:${config.everscaleKeyPair.public}`
                }
            };

            const res = await prisma.vC.create({
                data: {
                    vcTemplate: {connect: {type: VcTemplateType.ProofOfUniswapAccount}},
                    owner: {connect: {id: session.account.id}},
                    valueJson: JSON.stringify({VC})
                }
            });
            return {
                ...res,
                value: VC
            };
        },
        vcCreateProofOfTwitterAccount: async (parent, args, {session, prisma}) => {
            if (!session?.account) {
                throw new GraphQLError({message: 'Forbidden', code: StatusCodes.FORBIDDEN});
            }

            await prisma.vC.deleteMany({
                where: {
                    owner: {id: session.account.id},
                    vcTemplate: {type: VcTemplateType.ProofOfTwitterAccount}
                }
            });

            const credentialSubject: ICredentialSubject = {
                id: `did:ever:${session.account.did}`,
                degree: {
                    type: VcTemplateType.ProofOfTwitterAccount,
                    data: {
                        twitter_id: '@username'
                    }
                }
            };

            const vcSignature = await DIDTools.signMessage({
                message: JSON.stringify(credentialSubject),
                privateKey: config.everscaleKeyPair.secret
            });

            const VC: IVerifiableCredentialEd25519 = {
                '@context': ['https://www.w3.org/2018/credentials/v1'],
                id: session.account.did,
                type: ['VerifiableCredential'],
                proof: {
                    type: VcTemplateType.ProofOfTwitterAccount,
                    signature: vcSignature,
                    created: new Date(),
                    verificationMethod: `did:ever:${config.everscaleKeyPair.public}#${session.account.did}`
                },
                credentialSubject,
                issuanceDate: new Date(),
                issuer: {
                    id: `did:ever:${config.everscaleKeyPair.public}`
                }
            };

            const res = await prisma.vC.create({
                data: {
                    vcTemplate: {connect: {type: VcTemplateType.ProofOfTwitterAccount}},
                    owner: {connect: {id: session.account.id}},
                    valueJson: JSON.stringify({VC})
                }
            });
            return {
                ...res,
                value: VC
            };
        },
        vcCreateProofOfFunfairAccount: async (parent, args, {session, prisma}) => {
            if (!session?.account) {
                throw new GraphQLError({message: 'Forbidden', code: StatusCodes.FORBIDDEN});
            }

            await prisma.vC.deleteMany({
                where: {
                    owner: {id: session.account.id},
                    vcTemplate: {type: VcTemplateType.ProofOfFunfairAccount}
                }
            });

            const credentialSubject: ICredentialSubject = {
                id: `did:ever:${session.account.did}`,
                degree: {
                    type: VcTemplateType.ProofOfFunfairAccount,
                    data: {
                        eth_address: '0xC572Ec7B6F4404A1806aeBbE5ABa5854F73f4091',
                        gamer_status: 'gold player'
                    }
                }
            };

            const vcSignature = await DIDTools.signMessage({
                message: JSON.stringify(credentialSubject),
                privateKey: config.everscaleKeyPair.secret
            });

            const VC: IVerifiableCredentialEd25519 = {
                '@context': ['https://www.w3.org/2018/credentials/v1'],
                id: session.account.did,
                type: ['VerifiableCredential'],
                proof: {
                    type: VcTemplateType.ProofOfFunfairAccount,
                    signature: vcSignature,
                    created: new Date(),
                    verificationMethod: `did:ever:${config.everscaleKeyPair.public}#${session.account.did}`
                },
                credentialSubject,
                issuanceDate: new Date(),
                issuer: {
                    id: `did:ever:${config.everscaleKeyPair.public}`
                }
            };

            const res = await prisma.vC.create({
                data: {
                    vcTemplate: {connect: {type: VcTemplateType.ProofOfFunfairAccount}},
                    owner: {connect: {id: session.account.id}},
                    valueJson: JSON.stringify({VC})
                }
            });
            return {
                ...res,
                value: VC
            };
        }

    }
};

export default mutation;
