export interface IVerificationMethod {
    id: string;
    type: string;
    controller: string;
    publicKeyMultibase: string;
}

export interface IDIDDocument {
    '@context': string[];
    id: string;
    createdAt: string;
    publicKey: string;
    verificationMethod: IVerificationMethod;
}

export const VCTemplateSectionTitle = {
    DEFI_OWNERSHIP: 'DeFi Ownership',
    STATE_DOCS: 'State Documents',
    SOCIAL_NETWORKS: 'Social Networks',
    GAMES: 'Games'
};

export const ServiceName = {
    TON_SWAP: 'TON Swap',
    POKER_TON: 'PokerTON',
    EASY_VOTE: 'Easy Vote'
};


export interface IIssuer {
    id: string
}

export interface IDegree {
    type: string
    data: unknown
}

export interface ICredentialSubject {
    id: string
    degree: IDegree
}

export interface IProof {
    type: string
    created: Date
    verificationMethod: string
    signature: string
}

/*
EXAMPLE VC
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1"
  ],
  "id": "http://everscale.id/credentials/123",
  "type": [
    "VerifiableCredential"
  ],
  "issuer": {
    "id": "did:ever:<everscale.id_did>"
  },
  "issuanceDate": "2020-03-10T04:24:12.164Z",
  "credentialSubject": {
    "id": "did:ever:<client_did>",
    "degree": {
      "type": "ProofTonAddress",
      "address": "0xC572Ec7B6F4404A1806aeBbE5ABa5854F73f4091"
    }
  },
  "proof": {
    "type": "Ed25519VerificationKey2020",
    "created": "2020-02-15T17:13:18Z",
    "verificationMethod": "did:ever:<everscale.id_did>#<client_did>",
    "signature": "signatureOf(JSON.stringify(credentialSubject))"
  }
}
 */
export interface IVerifiableCredentialEd25519 {
    '@context': string[]
    id: string
    type: string[]
    issuer: IIssuer
    issuanceDate: Date
    credentialSubject: ICredentialSubject
    proof: IProof
}
