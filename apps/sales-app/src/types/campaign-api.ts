/** Item retornado por GET /campaigns?tenantId= (campaignList). */
export interface CampaignApiItem {
  id: string;
  campaignName: string;
}

export interface GetCampaignsResponse {
  campaignList: CampaignApiItem[];
}

/** Campanha retornada por GET /campaigns/all e GET /campaigns/{id}. */
export interface CampaignListItem {
  id: string;
  name: string;
  expirationDays: number;
  startsAt: string; // ISO 8601
  endsAt: string; // ISO 8601
  status: string;
  bannerUrl?: string | null;
  externalLandingUrl?: string | null;
}

/** Resposta de GET /campaigns/all. */
export interface GetAllByTenantOutput {
  campaignList: CampaignListItem[];
}

/** Body de POST /campaigns e PUT /campaigns/{id}/update. */
export interface CreateCampaignRequest {
  name: string;
  expirationDays: number;
  startsAt: string; // ISO 8601
  endsAt: string; // ISO 8601
  externalLandingUrl: string | null;
}

/** Resposta de POST /campaigns. */
export interface CreateCampaignResponse {
  campaignId: string;
}
