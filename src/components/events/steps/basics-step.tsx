'use client';

import { Image as ImageIcon, Loader2, Upload, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import type { ChangeEvent } from 'react';
import { useMemo, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { uploadEventCover } from '@/lib/api/events';
import { toPublicMediaUrl } from '@/lib/media-url';
import { CATEGORY_LABEL_MAP } from '@/components/events/constants';
import {
  EVENT_CATEGORY_OPTIONS,
  type EventCreateFormValues,
} from '@/lib/schemas/event-create.schema';
import { toast } from '@/hooks/use-toast';
import { useFormContext } from 'react-hook-form';

export function BasicsStep() {
  const { data: session } = useSession();
  const form = useFormContext<EventCreateFormValues>();
  const selectedCategory = form.watch('category');
  const coverImage = form.watch('coverImage');
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const coverPreviewUrl = useMemo(() => toPublicMediaUrl(coverImage), [coverImage]);

  const handleCoverImageSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    event.target.value = '';

    if (!selectedFile) {
      return;
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(selectedFile.type)) {
      toast({
        title: 'Only JPEG, PNG, and WEBP are supported',
        variant: 'destructive',
      });
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast({
        title: 'Cover image must be under 5MB',
        variant: 'destructive',
      });
      return;
    }

    if (!session?.accessToken) {
      toast({
        title: 'Session expired, please sign in again',
        variant: 'destructive',
      });
      return;
    }

    setIsUploadingCover(true);

    try {
      const uploaded = await uploadEventCover(selectedFile, session.accessToken);

      form.setValue('coverImage', uploaded.url, {
        shouldDirty: true,
        shouldValidate: true,
      });

      toast({ title: 'Cover image uploaded' });
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : 'Unable to upload image',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleRemoveCoverImage = () => {
    form.setValue('coverImage', '', {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <>
      <div className="rounded-xl border border-border bg-card/70 p-4 backdrop-blur">
        <p className="text-sm font-medium text-foreground">Cover image</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Auto-upload on selection (JPEG, PNG, WEBP up to 5MB)
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-border bg-background/80 px-4 text-sm font-medium text-foreground transition hover:border-ring/40 hover:bg-muted">
            {isUploadingCover ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {isUploadingCover ? 'Uploading...' : 'Choose image'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleCoverImageSelect}
              disabled={isUploadingCover}
            />
          </label>

          {coverImage ? (
            <button
              type="button"
              onClick={handleRemoveCoverImage}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-background/70 px-3 text-sm text-muted-foreground transition hover:border-ring/35 hover:text-foreground"
            >
              <X className="h-4 w-4" /> Remove
            </button>
          ) : null}
        </div>

        <div className="mt-4 overflow-hidden rounded-lg border border-border bg-muted/30">
          {coverPreviewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverPreviewUrl} alt="Event cover" className="h-40 w-full object-cover" />
          ) : (
            <div className="flex h-40 items-center justify-center text-muted-foreground">
              <div className="inline-flex items-center gap-2 text-sm">
                <ImageIcon className="h-4 w-4" /> No cover image selected
              </div>
            </div>
          )}
        </div>
      </div>

      <label className="block space-y-2">
        <span className="text-sm text-muted-foreground">Event title</span>
        <input
          {...form.register('title')}
          className="h-11 w-full rounded-xl border border-input bg-background/85 px-3.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring"
          placeholder="e.g. EventForge Growth Summit 2026"
        />
        <p className="text-xs text-destructive">{form.formState.errors.title?.message}</p>
      </label>

      <label className="block space-y-2">
        <span className="text-sm text-muted-foreground">Short summary</span>
        <input
          {...form.register('shortSummary')}
          className="h-11 w-full rounded-xl border border-input bg-background/85 px-3.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring"
          placeholder="One line that explains the value"
        />
        <p className="text-xs text-destructive">{form.formState.errors.shortSummary?.message}</p>
      </label>

      <label className="block space-y-2">
        <span className="text-sm text-muted-foreground">Description</span>
        <textarea
          {...form.register('description')}
          className="min-h-30 w-full rounded-xl border border-input bg-background/85 px-3.5 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring"
          placeholder="Write the full event details"
        />
        <p className="text-xs text-destructive">{form.formState.errors.description?.message}</p>
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm text-muted-foreground">Category</span>
          <Select
            value={selectedCategory}
            onValueChange={(value) => {
              form.setValue('category', value as EventCreateFormValues['category'], {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {EVENT_CATEGORY_OPTIONS.map((category) => (
                <SelectItem key={category} value={category}>
                  {CATEGORY_LABEL_MAP[category]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-destructive">{form.formState.errors.category?.message}</p>
        </label>

        <label className="block space-y-2">
          <span className="text-sm text-muted-foreground">Tags (comma separated)</span>
          <input
            {...form.register('tagsRaw')}
            className="h-11 w-full rounded-xl border border-input bg-background/85 px-3.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring"
            placeholder="growth, startup, marketing"
          />
        </label>
      </div>

      {selectedCategory === 'other' ? (
        <label className="block space-y-2">
          <span className="text-sm text-muted-foreground">Custom category</span>
          <input
            {...form.register('customCategory')}
            className="h-11 w-full rounded-xl border border-input bg-background/85 px-3.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring"
            placeholder="Enter your custom category"
          />
          <p className="text-xs text-destructive">
            {form.formState.errors.customCategory?.message}
          </p>
        </label>
      ) : null}
    </>
  );
}
