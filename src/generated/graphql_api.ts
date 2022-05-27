/* eslint-disable */
// @ts-nocheck
import { GraphQLContext } from '../IContext';
import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Date: any;
  Json: any;
};

/** Account (one DID = one account) */
export type Account = Node & {
  __typename?: 'Account';
  createdAt: Scalars['Date'];
  /** Decentralized ID, ex.: 978cae5ccb0048de4bf6c76ffba5c2686987fd72494137de8373a84e5f720063 */
  did: Scalars['String'];
  id: Scalars['Int'];
  sessions?: Maybe<Array<AccountSession>>;
  status: AccountStatus;
  updatedAt: Scalars['Date'];
};

/** Account session for authenticate user */
export type AccountSession = Node & {
  __typename?: 'AccountSession';
  account: Account;
  address?: Maybe<Scalars['String']>;
  createdAt: Scalars['Date'];
  expiresAt: Scalars['Date'];
  id: Scalars['Int'];
  ipAddr: Scalars['String'];
  updatedAt: Scalars['Date'];
  userAgent?: Maybe<UserAgent>;
};

export enum AccountStatus {
  Active = 'ACTIVE',
  Disabled = 'DISABLED'
}

export type AuthResult = {
  __typename?: 'AuthResult';
  account: Account;
  token: Scalars['String'];
};

export type CostComplexity = {
  max?: Maybe<Scalars['Int']>;
  min?: Maybe<Scalars['Int']>;
};

export type GenerateEmailCodeResult = {
  __typename?: 'GenerateEmailCodeResult';
  expiresAt: Scalars['Date'];
  result: Scalars['Boolean'];
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Create new DID Document and return it address */
  createDidDocument: Scalars['String'];
  /** Just test backend available. Return provided text */
  echo: Scalars['String'];
  /** Generate data to sign */
  loginGenerate: Scalars['String'];
  /** Auth method. Request for verify signed data */
  loginVerify: AuthResult;
  /** Logout. Required providing actual token in headers */
  logout: Scalars['Boolean'];
  vcCreateProofOfEthAddress: Vc;
  vcCreateProofOfFunfairAccount: Vc;
  vcCreateProofOfStateId: Vc;
  vcCreateProofOfTaxResidency: Vc;
  /** Request for generate one-time message to sign by user's wallet */
  vcCreateProofOfTonAddressGenerate: Scalars['String'];
  /** Check user's wallet signature and create Verifiable Claim in success case */
  vcCreateProofOfTonAddressVerify: Vc;
  vcCreateProofOfTwitterAccount: Vc;
  vcCreateProofOfUniswapAccount: Vc;
};


export type MutationCreateDidDocumentArgs = {
  ownerPublicKey: Scalars['String'];
};


export type MutationEchoArgs = {
  text: Scalars['String'];
};


export type MutationLoginGenerateArgs = {
  did: Scalars['String'];
};


export type MutationLoginVerifyArgs = {
  did: Scalars['String'];
  signatureHex: Scalars['String'];
};


export type MutationLogoutArgs = {
  sessionIds?: Maybe<Array<Scalars['Int']>>;
};


export type MutationVcCreateProofOfTonAddressVerifyArgs = {
  signatureHex: Scalars['String'];
  walletAddress: Scalars['String'];
};

/** Abstract declaration of every database object */
export type Node = {
  createdAt: Scalars['Date'];
  id: Scalars['Int'];
  updatedAt: Scalars['Date'];
};

export type Query = {
  __typename?: 'Query';
  /** Request for getting account session info by provided token in headers */
  currentSession: AccountSession;
  /** Just test backend available. Return provided text */
  echo: Scalars['String'];
  /** Get service by id */
  service: Service;
  /** Get services ex.: TON Swap */
  services?: Maybe<Array<Service>>;
  /** Get Verifiable Claim template by id */
  vcTemplate: VcTemplate;
  /** Get Verifiable Claims template sections */
  vcTemplateSections?: Maybe<Array<VcTemplateSection>>;
  version?: Maybe<Scalars['String']>;
  /** Request for getting account info by provided token in headers */
  whoami: Account;
};


export type QueryEchoArgs = {
  text: Scalars['String'];
};


export type QueryServiceArgs = {
  id: Scalars['Int'];
};


export type QueryServicesArgs = {
  filter?: Maybe<ServicesFilter>;
};


export type QueryVcTemplateArgs = {
  id: Scalars['Int'];
};

/** Service that uses verifiable representation, ex.: TON Swap */
export type Service = Node & {
  __typename?: 'Service';
  createdAt: Scalars['Date'];
  description: Scalars['String'];
  id: Scalars['Int'];
  logoUrl: Scalars['String'];
  name: Scalars['String'];
  pros: Scalars['String'];
  updatedAt: Scalars['Date'];
  vcTemplates?: Maybe<Array<VcTemplate>>;
};

export type ServicesFilter = {
  vcTemplateId?: Maybe<Scalars['Int']>;
};

export type UserAgent = {
  __typename?: 'UserAgent';
  browser?: Maybe<UserAgentBrowser>;
  cpu?: Maybe<UserAgentCpu>;
  engine?: Maybe<UserAgentEngine>;
  os?: Maybe<UserAgentOs>;
  ua?: Maybe<Scalars['String']>;
};

export type UserAgentBrowser = {
  __typename?: 'UserAgentBrowser';
  major?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  version?: Maybe<Scalars['String']>;
};

export type UserAgentCpu = {
  __typename?: 'UserAgentCpu';
  architecture?: Maybe<Scalars['String']>;
};

export type UserAgentEngine = {
  __typename?: 'UserAgentEngine';
  name?: Maybe<Scalars['String']>;
  version?: Maybe<Scalars['String']>;
};

export type UserAgentOs = {
  __typename?: 'UserAgentOs';
  name?: Maybe<Scalars['String']>;
  version?: Maybe<Scalars['String']>;
};

/** Verifiable Claim */
export type Vc = Node & {
  __typename?: 'VC';
  createdAt: Scalars['Date'];
  id: Scalars['Int'];
  owner: Account;
  updatedAt: Scalars['Date'];
  value: Scalars['Json'];
  vcTemplate: VcTemplate;
};

/** Verifiable Claim Template, ex.: PROOF_OF_TON_ADDRESS */
export type VcTemplate = Node & {
  __typename?: 'VCTemplate';
  createdAt: Scalars['Date'];
  description: Scalars['String'];
  id: Scalars['Int'];
  issuer: Scalars['String'];
  sections?: Maybe<Array<VcTemplateSection>>;
  services?: Maybe<Array<Service>>;
  title: Scalars['String'];
  type: Scalars['String'];
  updatedAt: Scalars['Date'];
  vc?: Maybe<Vc>;
};

/** Verifiable Claim Template section, that can contain many templates inside */
export type VcTemplateSection = Node & {
  __typename?: 'VCTemplateSection';
  createdAt: Scalars['Date'];
  id: Scalars['Int'];
  title: Scalars['String'];
  updatedAt: Scalars['Date'];
  vcTemplates?: Maybe<Array<VcTemplate>>;
};

/** Verifiable Claim template variants */
export enum VcTemplateType {
  ProofOfEthAddress = 'PROOF_OF_ETH_ADDRESS',
  ProofOfFunfairAccount = 'PROOF_OF_FUNFAIR_ACCOUNT',
  ProofOfStateId = 'PROOF_OF_STATE_ID',
  ProofOfTaxResidency = 'PROOF_OF_TAX_RESIDENCY',
  ProofOfTonAddress = 'PROOF_OF_TON_ADDRESS',
  ProofOfTwitterAccount = 'PROOF_OF_TWITTER_ACCOUNT',
  ProofOfUniswapAccount = 'PROOF_OF_UNISWAP_ACCOUNT'
}

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Account: ResolverTypeWrapper<Partial<Account>>;
  AccountSession: ResolverTypeWrapper<Partial<AccountSession>>;
  AccountStatus: ResolverTypeWrapper<Partial<AccountStatus>>;
  AuthResult: ResolverTypeWrapper<Partial<AuthResult>>;
  Boolean: ResolverTypeWrapper<Partial<Scalars['Boolean']>>;
  CostComplexity: ResolverTypeWrapper<Partial<CostComplexity>>;
  Date: ResolverTypeWrapper<Partial<Scalars['Date']>>;
  GenerateEmailCodeResult: ResolverTypeWrapper<Partial<GenerateEmailCodeResult>>;
  Int: ResolverTypeWrapper<Partial<Scalars['Int']>>;
  Json: ResolverTypeWrapper<Partial<Scalars['Json']>>;
  Mutation: ResolverTypeWrapper<{}>;
  Node: ResolversTypes['Account'] | ResolversTypes['AccountSession'] | ResolversTypes['Service'] | ResolversTypes['VC'] | ResolversTypes['VCTemplate'] | ResolversTypes['VCTemplateSection'];
  Query: ResolverTypeWrapper<{}>;
  Service: ResolverTypeWrapper<Partial<Service>>;
  ServicesFilter: ResolverTypeWrapper<Partial<ServicesFilter>>;
  String: ResolverTypeWrapper<Partial<Scalars['String']>>;
  UserAgent: ResolverTypeWrapper<Partial<UserAgent>>;
  UserAgentBrowser: ResolverTypeWrapper<Partial<UserAgentBrowser>>;
  UserAgentCpu: ResolverTypeWrapper<Partial<UserAgentCpu>>;
  UserAgentEngine: ResolverTypeWrapper<Partial<UserAgentEngine>>;
  UserAgentOs: ResolverTypeWrapper<Partial<UserAgentOs>>;
  VC: ResolverTypeWrapper<Partial<Vc>>;
  VCTemplate: ResolverTypeWrapper<Partial<VcTemplate>>;
  VCTemplateSection: ResolverTypeWrapper<Partial<VcTemplateSection>>;
  VCTemplateType: ResolverTypeWrapper<Partial<VcTemplateType>>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Account: Partial<Account>;
  AccountSession: Partial<AccountSession>;
  AuthResult: Partial<AuthResult>;
  Boolean: Partial<Scalars['Boolean']>;
  CostComplexity: Partial<CostComplexity>;
  Date: Partial<Scalars['Date']>;
  GenerateEmailCodeResult: Partial<GenerateEmailCodeResult>;
  Int: Partial<Scalars['Int']>;
  Json: Partial<Scalars['Json']>;
  Mutation: {};
  Node: ResolversParentTypes['Account'] | ResolversParentTypes['AccountSession'] | ResolversParentTypes['Service'] | ResolversParentTypes['VC'] | ResolversParentTypes['VCTemplate'] | ResolversParentTypes['VCTemplateSection'];
  Query: {};
  Service: Partial<Service>;
  ServicesFilter: Partial<ServicesFilter>;
  String: Partial<Scalars['String']>;
  UserAgent: Partial<UserAgent>;
  UserAgentBrowser: Partial<UserAgentBrowser>;
  UserAgentCpu: Partial<UserAgentCpu>;
  UserAgentEngine: Partial<UserAgentEngine>;
  UserAgentOs: Partial<UserAgentOs>;
  VC: Partial<Vc>;
  VCTemplate: Partial<VcTemplate>;
  VCTemplateSection: Partial<VcTemplateSection>;
}>;

export type CostDirectiveArgs = {
  complexity?: Maybe<CostComplexity>;
  multipliers?: Maybe<Array<Maybe<Scalars['String']>>>;
  useMultipliers?: Maybe<Scalars['Boolean']>;
};

export type CostDirectiveResolver<Result, Parent, ContextType = GraphQLContext, Args = CostDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type AccountResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Account'] = ResolversParentTypes['Account']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  did?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  sessions?: Resolver<Maybe<Array<ResolversTypes['AccountSession']>>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['AccountStatus'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AccountSessionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AccountSession'] = ResolversParentTypes['AccountSession']> = ResolversObject<{
  account?: Resolver<ResolversTypes['Account'], ParentType, ContextType>;
  address?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  expiresAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  ipAddr?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  userAgent?: Resolver<Maybe<ResolversTypes['UserAgent']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AuthResultResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AuthResult'] = ResolversParentTypes['AuthResult']> = ResolversObject<{
  account?: Resolver<ResolversTypes['Account'], ParentType, ContextType>;
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface DateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Date'], any> {
  name: 'Date';
}

export type GenerateEmailCodeResultResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['GenerateEmailCodeResult'] = ResolversParentTypes['GenerateEmailCodeResult']> = ResolversObject<{
  expiresAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  result?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface JsonScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Json'], any> {
  name: 'Json';
}

export type MutationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  createDidDocument?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationCreateDidDocumentArgs, 'ownerPublicKey'>>;
  echo?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationEchoArgs, 'text'>>;
  loginGenerate?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationLoginGenerateArgs, 'did'>>;
  loginVerify?: Resolver<ResolversTypes['AuthResult'], ParentType, ContextType, RequireFields<MutationLoginVerifyArgs, 'did' | 'signatureHex'>>;
  logout?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationLogoutArgs, never>>;
  vcCreateProofOfEthAddress?: Resolver<ResolversTypes['VC'], ParentType, ContextType>;
  vcCreateProofOfFunfairAccount?: Resolver<ResolversTypes['VC'], ParentType, ContextType>;
  vcCreateProofOfStateId?: Resolver<ResolversTypes['VC'], ParentType, ContextType>;
  vcCreateProofOfTaxResidency?: Resolver<ResolversTypes['VC'], ParentType, ContextType>;
  vcCreateProofOfTonAddressGenerate?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  vcCreateProofOfTonAddressVerify?: Resolver<ResolversTypes['VC'], ParentType, ContextType, RequireFields<MutationVcCreateProofOfTonAddressVerifyArgs, 'signatureHex' | 'walletAddress'>>;
  vcCreateProofOfTwitterAccount?: Resolver<ResolversTypes['VC'], ParentType, ContextType>;
  vcCreateProofOfUniswapAccount?: Resolver<ResolversTypes['VC'], ParentType, ContextType>;
}>;

export type NodeResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Node'] = ResolversParentTypes['Node']> = ResolversObject<{
  __resolveType: TypeResolveFn<'Account' | 'AccountSession' | 'Service' | 'VC' | 'VCTemplate' | 'VCTemplateSection', ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  currentSession?: Resolver<ResolversTypes['AccountSession'], ParentType, ContextType>;
  echo?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<QueryEchoArgs, 'text'>>;
  service?: Resolver<ResolversTypes['Service'], ParentType, ContextType, RequireFields<QueryServiceArgs, 'id'>>;
  services?: Resolver<Maybe<Array<ResolversTypes['Service']>>, ParentType, ContextType, RequireFields<QueryServicesArgs, never>>;
  vcTemplate?: Resolver<ResolversTypes['VCTemplate'], ParentType, ContextType, RequireFields<QueryVcTemplateArgs, 'id'>>;
  vcTemplateSections?: Resolver<Maybe<Array<ResolversTypes['VCTemplateSection']>>, ParentType, ContextType>;
  version?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  whoami?: Resolver<ResolversTypes['Account'], ParentType, ContextType>;
}>;

export type ServiceResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Service'] = ResolversParentTypes['Service']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  logoUrl?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  pros?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  vcTemplates?: Resolver<Maybe<Array<ResolversTypes['VCTemplate']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserAgentResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['UserAgent'] = ResolversParentTypes['UserAgent']> = ResolversObject<{
  browser?: Resolver<Maybe<ResolversTypes['UserAgentBrowser']>, ParentType, ContextType>;
  cpu?: Resolver<Maybe<ResolversTypes['UserAgentCpu']>, ParentType, ContextType>;
  engine?: Resolver<Maybe<ResolversTypes['UserAgentEngine']>, ParentType, ContextType>;
  os?: Resolver<Maybe<ResolversTypes['UserAgentOs']>, ParentType, ContextType>;
  ua?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserAgentBrowserResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['UserAgentBrowser'] = ResolversParentTypes['UserAgentBrowser']> = ResolversObject<{
  major?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  version?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserAgentCpuResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['UserAgentCpu'] = ResolversParentTypes['UserAgentCpu']> = ResolversObject<{
  architecture?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserAgentEngineResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['UserAgentEngine'] = ResolversParentTypes['UserAgentEngine']> = ResolversObject<{
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  version?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserAgentOsResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['UserAgentOs'] = ResolversParentTypes['UserAgentOs']> = ResolversObject<{
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  version?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type VcResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['VC'] = ResolversParentTypes['VC']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  owner?: Resolver<ResolversTypes['Account'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['Json'], ParentType, ContextType>;
  vcTemplate?: Resolver<ResolversTypes['VCTemplate'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type VcTemplateResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['VCTemplate'] = ResolversParentTypes['VCTemplate']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  issuer?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  sections?: Resolver<Maybe<Array<ResolversTypes['VCTemplateSection']>>, ParentType, ContextType>;
  services?: Resolver<Maybe<Array<ResolversTypes['Service']>>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  vc?: Resolver<Maybe<ResolversTypes['VC']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type VcTemplateSectionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['VCTemplateSection'] = ResolversParentTypes['VCTemplateSection']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  vcTemplates?: Resolver<Maybe<Array<ResolversTypes['VCTemplate']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = GraphQLContext> = ResolversObject<{
  Account?: AccountResolvers<ContextType>;
  AccountSession?: AccountSessionResolvers<ContextType>;
  AuthResult?: AuthResultResolvers<ContextType>;
  Date?: GraphQLScalarType;
  GenerateEmailCodeResult?: GenerateEmailCodeResultResolvers<ContextType>;
  Json?: GraphQLScalarType;
  Mutation?: MutationResolvers<ContextType>;
  Node?: NodeResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Service?: ServiceResolvers<ContextType>;
  UserAgent?: UserAgentResolvers<ContextType>;
  UserAgentBrowser?: UserAgentBrowserResolvers<ContextType>;
  UserAgentCpu?: UserAgentCpuResolvers<ContextType>;
  UserAgentEngine?: UserAgentEngineResolvers<ContextType>;
  UserAgentOs?: UserAgentOsResolvers<ContextType>;
  VC?: VcResolvers<ContextType>;
  VCTemplate?: VcTemplateResolvers<ContextType>;
  VCTemplateSection?: VcTemplateSectionResolvers<ContextType>;
}>;

export type DirectiveResolvers<ContextType = GraphQLContext> = ResolversObject<{
  cost?: CostDirectiveResolver<any, any, ContextType>;
}>;
