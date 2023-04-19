export interface IAuthorData {
  amazonAuthorId: string;
  asin: string;
  iridiumId: string;
  localizedNames: {
    es_CL: string;
    it_IT: string;
    en_GB: string;
    fr_FR: string;
    es_CO: string;
    pt_BR: string;
    en_NG: string;
    zh_CN: string;
    en_IN: string;
    fr_BE: string;
    es_ES: string;
    pl_PL: string;
    de_DE: string;
    en_CA: string;
    nl_NL: string;
    en_AU: string;
    tr_TR: string;
    ar_AE: string;
    en_SG: string;
    sv_SE: string;
    es_MX: string;
    en_ZA: string;
    ja_JP: string;
    en_US: string;
    en_AE: string;
  };
}

export interface IIdentity {
  customerId: string;
  amazonAuthorId: string;
  claimedAuthorName: string;
  createdAt: Date;
  updatedAt: Date;
  state: string;
  marketplace: string;
  vendorId: string;
  isLegacyClaim: boolean;
  version: number;
}

export interface IAmazonData {
  preferences: {
    emailSubscriber: boolean;
    locale: string;
  };
  identities: IIdentity[];
  sitewide_notification: any;
  general_notifications: [
    {
      id: string;
      localizedTitleString: string;
      date: string;
      link: string;
      allowedMarketplaces: string;
      read: boolean;
    },
    {
      id: string;
      localizedTitleString: string;
      date: string;
      link: string;
      allowedMarketplaces: string;
      read: boolean;
    }
  ];
  author: IAuthorData | IAuthorData[];
  domain: string;
  a2c_config: {
    privacyPolicyUrl: string;
    conditionsOfUseUrl: string;
    cookiePolicyUrl: string;
    termsAndConditionsKey: string;
  };
  weblabs: [
    {
      experiment: string;
      treatment: string;
    },
    {
      experiment: string;
      treatment: string;
    },
    {
      experiment: string;
      treatment: string;
    }
  ];
  csrftoken: {
    token: string;
  };
  account: {
    customerId: string;
    acceptedTerms: boolean;
    createdAt: Date;
    locale: string;
    isEmailConfirmed: boolean;
    emailConfirmed: boolean;
  };
  i18n: any[];
  tld_marketplace: string;
}
