'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Html5Qrcode } from 'html5-qrcode';
import { useEffect, useRef, useState } from 'react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { useCheckInByQr, useEventAttendance, useUndoCheckIn } from '@/hooks/use-event-checkin';
import { toast } from '@/hooks/use-toast';
import type { CheckInResponse } from '@/lib/api/event-checkin';

const SCANNER_ELEMENT_ID = 'organizer-checkin-scanner';

export default function OrganizerCheckInPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const attendanceQuery = useEventAttendance(id, session?.accessToken);
  const checkInMutation = useCheckInByQr(id, session?.accessToken);
  const undoCheckInMutation = useUndoCheckIn(id, session?.accessToken);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isProcessingScanRef = useRef(false);

  const [isScannerRunning, setIsScannerRunning] = useState(false);
  const [manualQrCode, setManualQrCode] = useState('');
  const [lastScanResult, setLastScanResult] = useState<CheckInResponse | null>(null);

  const stopScanner = async () => {
    if (!scannerRef.current) {
      return;
    }

    try {
      await scannerRef.current.stop();
      scannerRef.current.clear();
    } catch {
      scannerRef.current.clear();
    } finally {
      scannerRef.current = null;
      setIsScannerRunning(false);
    }
  };

  const processQrCode = async (qrCode: string, source: 'scanner' | 'manual') => {
    if (isProcessingScanRef.current) {
      return;
    }

    isProcessingScanRef.current = true;

    try {
      const result = await checkInMutation.mutateAsync({ qrCode, source });
      setLastScanResult(result);

      if (result.alreadyCheckedIn) {
        toast({
          title: 'Already checked in',
          description: `${result.attendeeName} was already checked in earlier.`,
        });
      } else {
        toast({
          title: 'Check-in successful',
          description: `${result.attendeeName} is now marked present.`,
        });
      }
    } catch (error) {
      toast({
        title: 'Check-in failed',
        description: error instanceof Error ? error.message : 'Unable to check in attendee',
        variant: 'destructive',
      });
    } finally {
      isProcessingScanRef.current = false;
    }
  };

  const startScanner = async () => {
    try {
      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        toast({
          title: 'No camera found',
          description: 'Please use manual ticket code entry.',
          variant: 'destructive',
        });
        return;
      }

      const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);
      scannerRef.current = scanner;

      await scanner.start(
        cameras[0].id,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        (decodedText) => {
          void processQrCode(decodedText, 'scanner');
        },
        () => undefined
      );

      setIsScannerRunning(true);
    } catch (error) {
      toast({
        title: 'Unable to start scanner',
        description: error instanceof Error ? error.message : 'Camera permission may be blocked.',
        variant: 'destructive',
      });
      await stopScanner();
    }
  };

  useEffect(() => {
    return () => {
      void stopScanner();
    };
  }, []);

  const handleManualCheckIn = async () => {
    const normalized = manualQrCode.trim();
    if (!normalized) {
      toast({
        title: 'Ticket code required',
        description: 'Paste or type a valid ticket code to continue.',
        variant: 'destructive',
      });
      return;
    }

    await processQrCode(normalized, 'manual');
    setManualQrCode('');
  };

  const handleUndoLastCheckIn = async () => {
    if (!lastScanResult) {
      return;
    }

    try {
      await undoCheckInMutation.mutateAsync(lastScanResult.ticketId);
      toast({
        title: 'Undo complete',
        description: `${lastScanResult.attendeeName} is now marked as not checked in.`,
      });
      setLastScanResult(null);
    } catch (error) {
      toast({
        title: 'Unable to undo check-in',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardShell requiredRole="organizer">
      <section className="w-full space-y-6">
        <div className="rounded-2xl border border-border bg-card/80 p-6 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Organizer / Event check-in
          </p>
          <h1 className="mt-3 text-3xl font-bold">QR Check-In Scanner</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Scan attendee QR tickets, handle duplicates, and monitor live attendance.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/dashboard/organizer/events/${id}`}
              className="inline-flex h-9 items-center rounded-lg border border-border bg-background/80 px-4 text-sm font-medium text-foreground"
            >
              Back to event details
            </Link>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-4">
          <article className="rounded-xl border border-border bg-card/70 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Registered</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {attendanceQuery.data?.registeredCount ?? 0}
            </p>
          </article>
          <article className="rounded-xl border border-border bg-card/70 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Checked in</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {attendanceQuery.data?.checkedInCount ?? 0}
            </p>
          </article>
          <article className="rounded-xl border border-border bg-card/70 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Waitlisted</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {attendanceQuery.data?.waitlistedCount ?? 0}
            </p>
          </article>
          <article className="rounded-xl border border-border bg-card/70 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Attendance</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {attendanceQuery.data?.attendanceRate ?? 0}%
            </p>
          </article>
        </section>

        <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-2xl border border-border bg-card/80 p-5">
            <h2 className="text-lg font-semibold text-foreground">Camera scanner</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Allow camera access, then point at attendee QR tickets.
            </p>

            <div
              id={SCANNER_ELEMENT_ID}
              className="mt-4 min-h-84 overflow-hidden rounded-xl border border-border bg-background/70 p-2"
            />

            <div className="mt-4 flex flex-wrap gap-2">
              {!isScannerRunning ? (
                <button
                  type="button"
                  onClick={() => void startScanner()}
                  className="inline-flex h-9 items-center rounded-lg border border-primary/40 bg-primary px-4 text-sm font-medium text-primary-foreground"
                >
                  Start scanner
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void stopScanner()}
                  className="inline-flex h-9 items-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground"
                >
                  Stop scanner
                </button>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <article className="rounded-2xl border border-border bg-card/80 p-5">
              <h3 className="text-base font-semibold text-foreground">
                Manual ticket code check-in
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Use this fallback when camera scanning is not available.
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <input
                  value={manualQrCode}
                  onChange={(event) => setManualQrCode(event.target.value)}
                  placeholder="Paste ticket code"
                  className="h-10 flex-1 rounded-lg border border-input bg-background/85 px-3 text-sm text-foreground outline-none transition focus:border-ring"
                />
                <button
                  type="button"
                  onClick={() => void handleManualCheckIn()}
                  disabled={checkInMutation.isPending}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-primary/40 bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Check in
                </button>
              </div>
            </article>

            <article className="rounded-2xl border border-border bg-card/80 p-5">
              <h3 className="text-base font-semibold text-foreground">Latest scan result</h3>
              {!lastScanResult ? (
                <p className="mt-2 text-sm text-muted-foreground">No scans yet.</p>
              ) : (
                <div className="mt-3 space-y-2 text-sm">
                  <p className="text-foreground">
                    <span className="font-medium">Attendee:</span> {lastScanResult.attendeeName}
                  </p>
                  <p className="text-muted-foreground">{lastScanResult.attendeeEmail}</p>
                  <p
                    className={
                      lastScanResult.alreadyCheckedIn ? 'text-amber-600' : 'text-emerald-600'
                    }
                  >
                    {lastScanResult.alreadyCheckedIn
                      ? 'Already checked in'
                      : 'Checked in successfully'}
                  </p>
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => void handleUndoLastCheckIn()}
                      disabled={undoCheckInMutation.isPending}
                      className="inline-flex h-8 items-center rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      Undo last check-in
                    </button>
                  </div>
                </div>
              )}
            </article>
          </section>
        </div>
      </section>
    </DashboardShell>
  );
}
