import { useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { AdminCompliancePanel } from '@/components/admin/admin-compliance-panel';
import { AdminRiskOverview } from '@/components/admin/admin-risk-overview';
import {
  useComplianceCases,
  useComplianceRiskOverview,
  useCreateComplianceCase,
  useUpdateComplianceCaseStatus,
} from '@/hooks/use-compliance';
import { toast } from '@/hooks/use-toast';
import type { ComplianceCaseSeverity, ComplianceCaseStatus } from '@/types/admin';

export function AdminComplianceView() {
  const { data: session } = useSession();
  const [compliancePage, setCompliancePage] = useState(1);
  const [complianceStatusFilter, setComplianceStatusFilter] = useState<
    'all' | ComplianceCaseStatus
  >('all');
  const [complianceSeverityFilter, setComplianceSeverityFilter] = useState<
    'all' | ComplianceCaseSeverity
  >('all');

  const authHeader = useMemo(() => {
    if (!session?.accessToken) {
      return null;
    }

    return {
      Authorization: `Bearer ${session.accessToken}`,
    };
  }, [session?.accessToken]);

  const complianceRiskQuery = useComplianceRiskOverview(authHeader);
  const complianceCasesQuery = useComplianceCases({
    headers: authHeader,
    page: compliancePage,
    status: complianceStatusFilter,
    severity: complianceSeverityFilter,
  });
  const createComplianceCaseMutation = useCreateComplianceCase(authHeader);
  const updateComplianceCaseStatusMutation = useUpdateComplianceCaseStatus(authHeader);

  return (
    <>
      <section className="rounded-2xl border border-border bg-card/80 p-6 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
          Admin / Compliance
        </p>
        <h1 className="mt-3 text-2xl font-bold md:text-3xl">Compliance operations</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Track risk posture, manage case workflow, and preserve enforcement records.
        </p>
      </section>

      <AdminRiskOverview
        data={complianceRiskQuery.data?.data ?? null}
        isLoading={complianceRiskQuery.isFetching}
      />

      <AdminCompliancePanel
        cases={complianceCasesQuery.data?.data.data ?? []}
        pagination={complianceCasesQuery.data?.data.pagination ?? null}
        isLoading={complianceCasesQuery.isFetching}
        statusFilter={complianceStatusFilter}
        severityFilter={complianceSeverityFilter}
        onStatusFilterChange={setComplianceStatusFilter}
        onSeverityFilterChange={setComplianceSeverityFilter}
        onApplyFilters={() => {
          setCompliancePage(1);
          complianceCasesQuery.refetch();
        }}
        onPreviousPage={() => setCompliancePage((current) => Math.max(1, current - 1))}
        onNextPage={() => setCompliancePage((current) => current + 1)}
        onCreateCase={async (payload) => {
          try {
            await createComplianceCaseMutation.mutateAsync(payload);
            toast({ title: 'Compliance case created' });
            await Promise.all([complianceRiskQuery.refetch(), complianceCasesQuery.refetch()]);
          } catch (error) {
            toast({
              title: error instanceof Error ? error.message : 'Unable to create compliance case',
              variant: 'destructive',
            });
          }
        }}
        onUpdateCaseStatus={async (payload) => {
          try {
            await updateComplianceCaseStatusMutation.mutateAsync(payload);
            toast({ title: 'Compliance case status updated' });
            await Promise.all([complianceRiskQuery.refetch(), complianceCasesQuery.refetch()]);
          } catch (error) {
            toast({
              title:
                error instanceof Error ? error.message : 'Unable to update compliance case status',
              variant: 'destructive',
            });
          }
        }}
      />
    </>
  );
}
