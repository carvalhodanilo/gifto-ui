export type PublicCampaignLanding = {
  tenant: {
    displayName: string;
    primaryBrandColor: string | null;
    secondaryBrandColor: string | null;
  };
  campaign: {
    id: string;
    name: string;
    status: string;
    startsAt: string;
    endsAt: string;
    expirationDays: number;
    bannerUrl: string | null;
  };
  stores: Array<{
    merchantId: string;
    displayName: string;
    landingLogoUrl: string | null;
    city: string | null;
  }>;
};
