export type AppealIssueType =
  | 'account_suspension'
  | 'policy_warning'
  | 'payment_restriction'
  | 'content_violation'
  | 'other';

export interface CreateAppealRequestPayload {
  fullName: string;
  workEmail: string;
  company: string;
  accountEmail: string;
  issueType: AppealIssueType;
  timeline: string;
  whatHappened: string;
  correctiveActions: string;
  evidenceLinks?: string[];
  consent: boolean;
  source?: 'public-website' | 'authenticated-website';
}

export interface CreateAppealRequestResponse {
  success: boolean;
  message: string;
  data: {
    referenceCode: string;
    status: 'submitted' | 'in_review' | 'resolved' | 'rejected';
    createdAt: string;
  };
}
