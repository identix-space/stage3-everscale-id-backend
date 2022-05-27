import {signerNone, TonClient} from '@tonclient/core';
import {libNode} from '@tonclient/lib-node';
import {Account} from '@tonclient/appkit';
import {ServiceName, VCTemplateSectionTitle} from './DIDInterfaces';
import {getLogger} from './Logger';
import {PrismaClient} from '@prisma/client';
import {VcTemplateType} from '../generated/graphql_api';
import * as ed from 'noble-ed25519';
import crypto from 'crypto';
import {SafeMultiSigABI} from './SafeMultiSigABI';
import config from '../config/config';

const log = getLogger('DIDTools');

TonClient.useBinaryLibrary(libNode);
export const tonClient = new TonClient({network: {endpoints: config.everscaleEndpoints}});

export class DIDTools {
    static async getMultiSigCustodians(walletAddress: string): Promise<string[] | null> {
        try {
            const acc = new Account({abi: SafeMultiSigABI}, {
                address: walletAddress,
                client: tonClient,
                signer: signerNone()
            });

            const response = await acc.runLocal('getCustodians', {});
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return response.decoded?.output.custodians.map((custodian: any) => custodian.pubkey);
        } catch (err: any) {
            log.warn('getMultiSigCustodians err:', err.message);
            return null;
        }
    }

    static async verifyMessage(input: {
        signatureHex: string,
        message: string,
        publicKey: string
    }): Promise<boolean> {
        // return true;//todo delete me
        const hash = crypto.createHash('sha256').update(input.message).digest('hex');
        return await ed.verify(input.signatureHex, hash, input.publicKey);
    }

    static async signMessage(input: {
        message: string,
        privateKey: string
    }): Promise<string> {
        const msgHash = crypto.createHash('sha256').update(input.message).digest('hex');
        return await ed.sign(msgHash, input.privateKey);
    }

    static async initDB(prisma: PrismaClient): Promise<void> {
        log.info('DID Init DB start...');

        //todo delete me
        // await prisma.vCTemplateSection.deleteMany();
        // await prisma.vC.deleteMany();
        // await prisma.vCTemplate.deleteMany();
        // await prisma.account.deleteMany();
        // await prisma.accountSession.deleteMany();

        await prisma.service.upsert({
            where: {name: ServiceName.TON_SWAP},
            update: {
                name: ServiceName.TON_SWAP,
                logoUrl: 'https://i.imgur.com/rp4Zthu.png',
                description: 'TON Swap is a decentralized exchange (DEX) that allows users to carry out DeFi operations with EVERSCALE tokens. Provide verifiable credentials (VCs) to get special offers from TON SWAP',
                pros: '0,5% of price in USDT/TON conversion \n+1% premium to any liquidity pool staking transaction'
            },
            create: {
                name: ServiceName.TON_SWAP,
                logoUrl: 'https://i.imgur.com/rp4Zthu.png',
                description: 'TON Swap is a decentralized exchange (DEX) that allows users to carry out DeFi operations with EVERSCALE tokens. Provide verifiable credentials (VCs) to get special offers from TON SWAP',
                pros: '0,5% of price in USDT/TON conversion \n+1% premium to any liquidity pool staking transaction'
            }
        });
        await prisma.service.upsert({
            where: {name: ServiceName.POKER_TON},
            update: {
                name: ServiceName.POKER_TON,
                logoUrl: 'https://i.imgur.com/fmmTbQk.png',
                description: 'Poker TON is a decentralized Telegram-based platform for playing poker.',
                pros: 'Provide VCs to obtain the access to premium poker rooms with only 1,5% rake from your bank!'
            },
            create: {
                name: ServiceName.POKER_TON,
                logoUrl: 'https://i.imgur.com/fmmTbQk.png',
                description: 'Poker TON is a decentralized Telegram-based platform for playing poker.',
                pros: 'Provide VCs to obtain the access to premium poker rooms with only 1,5% rake from your bank!'
            }
        });
        await prisma.service.upsert({
            where: {name: ServiceName.EASY_VOTE},
            update: {
                name: ServiceName.EASY_VOTE,
                logoUrl: 'https://i.imgur.com/E6ZWPPx.png',
                description: 'Easy vote is a primary tool for EVERSCALE Jury that provides functionality for submissions analysis and contests voting.',
                pros: 'Provide VCs and become a member of the Jury team without excessive bureaucracy with several clicks!'
            },
            create: {
                name: ServiceName.EASY_VOTE,
                logoUrl: 'https://i.imgur.com/E6ZWPPx.png',
                description: 'Easy vote is a primary tool for EVERSCALE Jury that provides functionality for submissions analysis and contests voting.',
                pros: 'Provide VCs and become a member of the Jury team without excessive bureaucracy with several clicks!'
            }
        });

        await prisma.vCTemplateSection.upsert({
            where: {title: VCTemplateSectionTitle.STATE_DOCS},
            update: {
                title: VCTemplateSectionTitle.STATE_DOCS
            },
            create: {
                title: VCTemplateSectionTitle.STATE_DOCS
            }
        });
        await prisma.vCTemplateSection.upsert({
            where: {title: VCTemplateSectionTitle.SOCIAL_NETWORKS},
            update: {
                title: VCTemplateSectionTitle.SOCIAL_NETWORKS
            },
            create: {
                title: VCTemplateSectionTitle.SOCIAL_NETWORKS
            }
        });
        await prisma.vCTemplateSection.upsert({
            where: {title: VCTemplateSectionTitle.DEFI_OWNERSHIP},
            update: {
                title: VCTemplateSectionTitle.DEFI_OWNERSHIP
            },
            create: {
                title: VCTemplateSectionTitle.DEFI_OWNERSHIP
            }
        });
        await prisma.vCTemplateSection.upsert({
            where: {title: VCTemplateSectionTitle.GAMES},
            update: {
                title: VCTemplateSectionTitle.GAMES
            },
            create: {
                title: VCTemplateSectionTitle.GAMES
            }
        });

        await prisma.vCTemplate.upsert({
            where: {type: VcTemplateType.ProofOfTonAddress},
            update: {
                type: VcTemplateType.ProofOfTonAddress,
                title: 'Proof of EVERSCALE address',
                description: 'Prove the ownership of EVERSCALE blockchain address with a verifiable credential. This credential in necessary to ensure you’ve been an EVERSCALE network user.',
                sections: {connect: {title: VCTemplateSectionTitle.DEFI_OWNERSHIP}},
                services: {connect: [{name: ServiceName.TON_SWAP}, {name: ServiceName.POKER_TON}, {name: ServiceName.EASY_VOTE}]},
                issuer: 'EVERSCALE.id'
            },
            create: {
                type: VcTemplateType.ProofOfTonAddress,
                title: 'Proof of EVERSCALE address',
                description: 'Prove the ownership of EVERSCALE blockchain address with a verifiable credential. This credential in necessary to ensure you’ve been an EVERSCALE network user.',
                sections: {connect: {title: VCTemplateSectionTitle.DEFI_OWNERSHIP}},
                services: {connect: [{name: ServiceName.TON_SWAP}, {name: ServiceName.POKER_TON}, {name: ServiceName.EASY_VOTE}]},
                issuer: 'EVERSCALE.id'
            }
        });
        await prisma.vCTemplate.upsert({
            where: {type: VcTemplateType.ProofOfStateId},
            update: {
                type: VcTemplateType.ProofOfStateId,
                title: 'Proof of State ID',
                description: 'An official State ID in the form of a verifiable credential. This credential may be requested to ensure your real identity.',
                sections: {connect: {title: VCTemplateSectionTitle.STATE_DOCS}},
                services: {connect: [{name: ServiceName.POKER_TON}]},
                issuer: 'EVERSCALE.id'
            },
            create: {
                type: VcTemplateType.ProofOfStateId,
                title: 'Proof of State ID',
                description: 'An official State ID in the form of a verifiable credential. This credential may be requested to ensure your real identity.',
                sections: {connect: {title: VCTemplateSectionTitle.STATE_DOCS}},
                services: {connect: [{name: ServiceName.POKER_TON}]},
                issuer: 'EVERSCALE.id'
            }
        });
        await prisma.vCTemplate.upsert({
            where: {type: VcTemplateType.ProofOfTaxResidency},
            update: {
                type: VcTemplateType.ProofOfTaxResidency,
                title: 'Proof of Tax Residency',
                description: 'A verifiable credential that confirms your tax residency. Requested to authorize in certain financial services for law compliance.',
                sections: {connect: {title: VCTemplateSectionTitle.STATE_DOCS}},
                services: {connect: {name: ServiceName.TON_SWAP}},
                issuer: 'EVERSCALE.id'
            },
            create: {
                type: VcTemplateType.ProofOfTaxResidency,
                title: 'Proof of Tax Residency',
                description: 'A verifiable credential that confirms your tax residency. Requested to authorize in certain financial services for law compliance.',
                sections: {connect: {title: VCTemplateSectionTitle.STATE_DOCS}},
                services: {connect: {name: ServiceName.TON_SWAP}},
                issuer: 'EVERSCALE.id'
            }
        });
        await prisma.vCTemplate.upsert({
            where: {type: VcTemplateType.ProofOfEthAddress},
            update: {
                type: VcTemplateType.ProofOfEthAddress,
                title: 'Proof of ETH address',
                description: 'Prove the ownership of Ethereum blockchain address with a verifiable credential. This credential is necessary to ensure you’ve been a Ethereum network user.',
                sections: {connect: {title: VCTemplateSectionTitle.DEFI_OWNERSHIP}},
                services: {connect: [{name: ServiceName.TON_SWAP}]},
                issuer: 'EVERSCALE.id'
            },
            create: {
                type: VcTemplateType.ProofOfEthAddress,
                title: 'Proof of ETH address',
                description: 'Prove the ownership of Ethereum blockchain address with a verifiable credential. This credential is necessary to ensure you’ve been a Ethereum network user.',
                sections: {connect: {title: VCTemplateSectionTitle.DEFI_OWNERSHIP}},
                services: {connect: [{name: ServiceName.TON_SWAP}]},
                issuer: 'EVERSCALE.id'
            }
        });
        await prisma.vCTemplate.upsert({
            where: {type: VcTemplateType.ProofOfUniswapAccount},
            update: {
                type: VcTemplateType.ProofOfUniswapAccount,
                title: 'Proof of Uniswap account',
                description: 'A verifiable credential that proves your ownership of a Uniswap account. Some DeFI-oriented services may require it for authorization.',
                sections: {connect: {title: VCTemplateSectionTitle.DEFI_OWNERSHIP}},
                services: {connect: [{name: ServiceName.TON_SWAP}]},
                issuer: 'EVERSCALE.id'
            },
            create: {
                type: VcTemplateType.ProofOfUniswapAccount,
                title: 'Proof of Uniswap account',
                description: 'A verifiable credential that proves you own a Uniswap account. Some DeFI-oriented services may require it for authorization.',
                sections: {connect: {title: VCTemplateSectionTitle.DEFI_OWNERSHIP}},
                services: {connect: [{name: ServiceName.TON_SWAP}]},
                issuer: 'EVERSCALE.id'
            }
        });
        await prisma.vCTemplate.upsert({
            where: {type: VcTemplateType.ProofOfTwitterAccount},
            update: {
                type: VcTemplateType.ProofOfTwitterAccount,
                title: 'Proof of Twitter account',
                description: 'Prove you own a Twitter account with a verifiable credential. Some services may need to make sure of your public activity and analyze it.',
                sections: {connect: {title: VCTemplateSectionTitle.SOCIAL_NETWORKS}},
                services: {connect: [{name: ServiceName.EASY_VOTE}]},
                issuer: 'EVERSCALE.id'
            },
            create: {
                type: VcTemplateType.ProofOfTwitterAccount,
                title: 'Proof of Twitter account',
                description: 'Prove you own a Twitter account with a verifiable credential. Some services may need to make sure of your public activity and analyze it.',
                sections: {connect: {title: VCTemplateSectionTitle.SOCIAL_NETWORKS}},
                services: {connect: [{name: ServiceName.EASY_VOTE}]},
                issuer: 'EVERSCALE.id'
            }
        });
        await prisma.vCTemplate.upsert({
            where: {type: VcTemplateType.ProofOfFunfairAccount},
            update: {
                type: VcTemplateType.ProofOfFunfairAccount,
                title: 'Proof of Funfair account',
                description: 'This verifiable credential proves the ownership of FunFair account. You may be asked to provide it to some decentralized services to prove your gambling expertise.',
                sections: {connect: {title: VCTemplateSectionTitle.GAMES}},
                services: {connect: {name: ServiceName.POKER_TON}},
                issuer: 'EVERSCALE.id'
            },
            create: {
                type: VcTemplateType.ProofOfFunfairAccount,
                title: 'Proof of Funfair account',
                description: 'This verifiable credential proves the ownership of FunFair account. You may be asked to provide it to some decentralized services to prove your gambling expertise.',
                sections: {connect: {title: VCTemplateSectionTitle.GAMES}},
                services: {connect: {name: ServiceName.POKER_TON}},
                issuer: 'EVERSCALE.id'
            }
        });

        log.info('DID Init DB success');
    }
}
