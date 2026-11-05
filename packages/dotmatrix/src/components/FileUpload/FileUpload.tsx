"use client";

import { type DragEvent, useEffect, useRef, useState } from "react";
import { type LayoutProps, pickLayoutProps } from "../../system/layoutProps";
import { useControllableState } from "../../system/useControllableState";
import { useFormField } from "../../system/useFormField";
import { Column } from "../Column/Column";
import { Dialog } from "../Dialog/Dialog";
import { FieldShell } from "../FieldShell/FieldShell";
import { Icon } from "../Icon/Icon";
import { IconButton } from "../IconButton/IconButton";
import { ImageEditor, type ImageEditorFeatures } from "../ImageEditor/ImageEditor";
import { Row } from "../Row/Row";
import { Text } from "../Text/Text";
import styles from "./FileUpload.module.scss";
import { formatFileSize, partitionFiles, type Rejection } from "./fileValidation";

export interface FileUploadOwnProps {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  /** Passed straight through to the native file input's `accept`. */
  accept?: string;
  /** @default false */
  multiple?: boolean;
  maxFiles?: number;
  /** Bytes. */
  maxSize?: number;
  value?: File[];
  defaultValue?: File[];
  onChange?: (files: File[]) => void;
  /** Files that didn't make it in — wrong type, too big, or over `maxFiles` — with why. */
  onReject?: (rejections: Rejection[]) => void;
  /** Opens each new image in a crop/rotate/flip step (`ImageEditor`, in a `Dialog`) before it's added. @default false */
  enableImageEditing?: boolean;
  /** Passed through to the editing step's `ImageEditor`. */
  imageEditorFeatures?: ImageEditorFeatures;
  disabled?: boolean;
  className?: string;
}

const isImage = (file: File) => file.type.startsWith("image/");

/**
 * A dropzone plus file list — real, unmodified previews (no auto-dither),
 * per this system's stance that a file the user is about to upload should
 * look like what it actually is. `enableImageEditing` is the one place that
 * changes: each new image is routed through `ImageEditor` first, one at a
 * time in a `Dialog`, before joining the list — Cancel keeps the file
 * unedited rather than dropping it, since a cancelled *edit* isn't the same
 * as a cancelled *upload*.
 */
function FileUploadImpl({
  label,
  description,
  error,
  success,
  accept,
  multiple = false,
  maxFiles,
  maxSize,
  value,
  defaultValue,
  onChange,
  onReject,
  enableImageEditing = false,
  imageEditorFeatures,
  disabled,
  className,
  ...rest
}: FileUploadOwnProps & LayoutProps) {
  const { fieldId, hintKind, hintId, describedBy } = useFormField({ error, success, description });
  const [files, setFiles] = useControllableState(value, defaultValue ?? [], onChange);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [editQueue, setEditQueue] = useState<File[]>([]);
  const [pendingBatch, setPendingBatch] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const urls = files.map((file) => (isImage(file) ? URL.createObjectURL(file) : ""));
    setPreviewUrls(urls);
    return () => {
      for (const url of urls) if (url) URL.revokeObjectURL(url);
    };
  }, [files]);

  const editingFile = editQueue[0];
  const editingUrl = useObjectUrl(editingFile);

  // Once the edit queue drains, commit whatever was accumulated (edited or
  // skipped images, plus any non-image files from the same batch) in one
  // update, rather than one `setFiles` per file.
  useEffect(() => {
    if (editQueue.length === 0 && pendingBatch.length > 0) {
      setFiles([...files, ...pendingBatch]);
      setPendingBatch([]);
    }
  }, [editQueue.length, pendingBatch, files, setFiles]);

  const addFiles = (incoming: File[]) => {
    const { accepted, rejected } = partitionFiles(files, incoming, { accept, maxSize, maxFiles });
    if (rejected.length > 0) onReject?.(rejected);
    if (accepted.length === 0) return;

    if (enableImageEditing) {
      const images = accepted.filter(isImage);
      const rest = accepted.filter((f) => !isImage(f));
      if (images.length > 0) {
        // Appended, not replaced — `addFiles` firing again while a previous
        // batch is still mid-edit (e.g. the modal hasn't painted yet) would
        // otherwise silently drop whatever was already queued.
        setEditQueue((queue) => [...queue, ...images]);
        setPendingBatch((batch) => [...batch, ...rest]);
        return;
      }
    }
    setFiles([...files, ...accepted]);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) addFiles(Array.from(event.target.files));
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    addFiles(Array.from(event.dataTransfer.files));
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <FieldShell
      fieldId={fieldId}
      label={label}
      description={description}
      error={error}
      success={success}
      hintKind={hintKind}
      hintId={hintId}
      disabled={disabled}
      layout={pickLayoutProps(rest)}
    >
      <Column gap="12">
        <Column
          as="button"
          alignItems="center"
          justifyContent="center"
          gap="8"
          type="button"
          id={fieldId}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            if (!disabled) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={[styles.dropzone, isDragging ? styles.dragging : undefined, className]
            .filter(Boolean)
            .join(" ")}
        >
          <Icon name="upload" />
          <Text fontSize="s">
            {isDragging ? "Drop to upload" : "Drag files here, or click to browse"}
          </Text>
        </Column>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleInputChange}
          className={styles.hiddenInput}
        />

        {files.length > 0 && (
          <Column as="ul" gap="4">
            {files.map((file, index) => (
              <Row
                // Files have no natural stable id; this list only ever
                // appends or removes a specific entry, never reorders, so
                // the index is safe as part of the key.
                // biome-ignore lint/suspicious/noArrayIndexKey: see comment above
                key={`${file.name}-${file.lastModified}-${index}`}
                as="li"
                gap="8"
                alignItems="center"
                className={styles.fileRow}
              >
                {previewUrls[index] ? (
                  <img src={previewUrls[index]} alt="" className={styles.thumbnail} />
                ) : (
                  <Row
                    as="span"
                    alignItems="center"
                    justifyContent="center"
                    className={styles.thumbnailPlaceholder}
                    aria-hidden
                  >
                    <Icon name="copy" size="s" />
                  </Row>
                )}
                <Column gap="0" flexGrow="1" minWidth="0">
                  <Text fontSize="s" className={styles.fileName}>
                    {file.name}
                  </Text>
                  <Text fontSize="xs" color="weak">
                    {formatFileSize(file.size)}
                  </Text>
                </Column>
                <IconButton
                  aria-label={`Remove ${file.name}`}
                  variant="ghost"
                  size="s"
                  disabled={disabled}
                  onClick={() => removeFile(index)}
                >
                  <Icon name="trash" size="s" />
                </IconButton>
              </Row>
            ))}
          </Column>
        )}
      </Column>

      {editingFile && (
        <Dialog
          open
          title={`Edit ${editingFile.name}`}
          onOpenChange={(open) => {
            if (!open) setPendingBatch((batch) => [...batch, editingFile]);
            setEditQueue((queue) => queue.slice(1));
          }}
        >
          {editingUrl && (
            <ImageEditor
              // Forces a fresh mount per queued image — otherwise ImageEditor's
              // own rotation/flip/aspect-ratio state (which has no reason to
              // reset on a `src` prop change alone) would carry over from
              // whichever image was edited previously in this queue.
              key={editingUrl}
              src={editingUrl}
              features={imageEditorFeatures}
              onSave={({ blob }) => {
                setPendingBatch((batch) => [
                  ...batch,
                  new File([blob], editingFile.name, { type: blob.type }),
                ]);
                setEditQueue((queue) => queue.slice(1));
              }}
              onCancel={() => {
                setPendingBatch((batch) => [...batch, editingFile]);
                setEditQueue((queue) => queue.slice(1));
              }}
            />
          )}
        </Dialog>
      )}
    </FieldShell>
  );
}
FileUploadImpl.displayName = "FileUpload";

function useObjectUrl(file: File | undefined): string | undefined {
  const [url, setUrl] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (!file) {
      setUrl(undefined);
      return;
    }
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);
  return url;
}

export const FileUpload = FileUploadImpl;
