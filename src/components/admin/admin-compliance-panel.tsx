import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type {
  ComplianceCase,
  ComplianceCaseSeverity,
  ComplianceCaseStatus,
  PaginationPayload,
} from '@/types/admin';

interface AdminCompliancePanelProps {
  cases: ComplianceCase[];
  pagination: PaginationPayload | null;
  isLoading: boolean;
  statusFilter: 'all' | ComplianceCaseStatus;
  severityFilter: 'all' | ComplianceCaseSeverity;
  onStatusFilterChange: (value: 'all' | ComplianceCaseStatus) => void;
  onSeverityFilterChange: (value: 'all' | ComplianceCaseSeverity) => void;
  onApplyFilters: () => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onCreateCase: (payload: {
    title: string;
    description: string;
    category: 'account_abuse' | 'content_policy' | 'payment_risk' | 'policy_violation' | 'other';
    severity: 'low' | 'medium' | 'high' | 'critical';
  }) => Promise<void>;
  onUpdateCaseStatus: (payload: {
    caseId: string;
    status: ComplianceCaseStatus;
    reason: string;
    resolutionNote?: string;
  }) => Promise<void>;
}

export function AdminCompliancePanel({
  cases,
  pagination,
  isLoading,
  statusFilter,
  severityFilter,
  onStatusFilterChange,
  onSeverityFilterChange,
  onApplyFilters,
  onPreviousPage,
  onNextPage,
  onCreateCase,
  onUpdateCaseStatus,
}: AdminCompliancePanelProps) {
  const [caseTitle, setCaseTitle] = useState('');
  const [caseDescription, setCaseDescription] = useState('');
  const [caseCategory, setCaseCategory] = useState<
    'account_abuse' | 'content_policy' | 'payment_risk' | 'policy_violation' | 'other'
  >('policy_violation');
  const [caseSeverity, setCaseSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>(
    'medium'
  );
  const [statusReasonByCaseId, setStatusReasonByCaseId] = useState<Record<string, string>>({});

  const currentPage = pagination?.page ?? 1;
  const totalPages = pagination?.totalPages ?? 1;

  return (
    <section className="rounded-2xl border border-border bg-card/80 p-4 backdrop-blur md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Compliance case management</h2>
          <p className="text-sm text-muted-foreground">
            Open, track, and resolve compliance incidents with explicit governance records.
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-border bg-background/70 p-4">
        <h3 className="text-sm font-semibold text-foreground">Create case</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <input
            value={caseTitle}
            onChange={(event) => setCaseTitle(event.target.value)}
            placeholder="Case title"
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none"
          />
          <Select
            value={caseCategory}
            onValueChange={(value) => setCaseCategory(value as typeof caseCategory)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="account_abuse">Account abuse</SelectItem>
              <SelectItem value="content_policy">Content policy</SelectItem>
              <SelectItem value="payment_risk">Payment risk</SelectItem>
              <SelectItem value="policy_violation">Policy violation</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <textarea
            value={caseDescription}
            onChange={(event) => setCaseDescription(event.target.value)}
            placeholder="Case description"
            className="min-h-20 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none md:col-span-2"
          />
          <Select
            value={caseSeverity}
            onValueChange={(value) => setCaseSeverity(value as typeof caseSeverity)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
          <button
            className="h-10 rounded-lg border border-border bg-background/80 px-4 text-sm font-semibold text-foreground"
            onClick={async () => {
              await onCreateCase({
                title: caseTitle,
                description: caseDescription,
                category: caseCategory,
                severity: caseSeverity,
              });
              setCaseTitle('');
              setCaseDescription('');
            }}
          >
            Create case
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <Select
          value={statusFilter}
          onValueChange={(value) => onStatusFilterChange(value as typeof statusFilter)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_review">In review</SelectItem>
            <SelectItem value="actioned">Actioned</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={severityFilter}
          onValueChange={(value) => onSeverityFilterChange(value as typeof severityFilter)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All severity</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>

        <button
          onClick={onApplyFilters}
          className="h-10 rounded-lg border border-border bg-background/80 px-4 text-sm font-semibold text-foreground"
        >
          Apply case filters
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading compliance cases...</p>
        ) : cases.length === 0 ? (
          <p className="text-sm text-muted-foreground">No compliance cases found.</p>
        ) : (
          cases.map((item) => (
            <article
              key={item._id}
              className="rounded-xl border border-border bg-background/70 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <span className="text-xs text-muted-foreground">
                  {item.severity} • {item.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              <div className="mt-3 grid gap-2 md:grid-cols-3">
                <Select
                  value={item.status}
                  onValueChange={(value) => {
                    onUpdateCaseStatus({
                      caseId: item._id,
                      status: value as ComplianceCaseStatus,
                      reason: statusReasonByCaseId[item._id] || 'Status updated by admin panel',
                      resolutionNote:
                        value === 'resolved'
                          ? statusReasonByCaseId[item._id] || 'Case resolved by admin'
                          : undefined,
                    }).catch(() => undefined);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_review">In review</SelectItem>
                    <SelectItem value="actioned">Actioned</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
                <input
                  value={statusReasonByCaseId[item._id] ?? ''}
                  onChange={(event) =>
                    setStatusReasonByCaseId((current) => ({
                      ...current,
                      [item._id]: event.target.value,
                    }))
                  }
                  placeholder="Reason for status change"
                  className="h-10 rounded-lg border border-input bg-background px-3 text-xs text-foreground outline-none md:col-span-2"
                />
              </div>
            </article>
          ))
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>{`Page ${currentPage} of ${totalPages}`}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={onPreviousPage}
            disabled={!pagination?.hasPrevPage || isLoading}
            className="rounded-md border border-border bg-background/80 px-3 py-1.5 font-medium text-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            Previous
          </button>
          <button
            onClick={onNextPage}
            disabled={!pagination?.hasNextPage || isLoading}
            className="rounded-md border border-border bg-background/80 px-3 py-1.5 font-medium text-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
