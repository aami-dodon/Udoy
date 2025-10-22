import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Separator,
  Textarea,
} from '@components/ui';
import { LucideIcon } from '@icons';
import { requestUploadPresign } from './api.js';

const ACCEPTED_IMAGE_PREFIX = 'image/';
const TEST_PREFIX = 'test-uploads';

function sanitizeFileName(fileName) {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function buildDefaultObjectKey(file) {
  if (!file) {
    return '';
  }

  const cleanedName = sanitizeFileName(file.name || 'image');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${TEST_PREFIX}/${timestamp}-${cleanedName}`;
}

function formatStatus(status) {
  switch (status) {
    case 'requesting':
      return { label: 'Requesting presign URL…', variant: 'outline' };
    case 'uploading':
      return { label: 'Uploading to storage…', variant: 'secondary' };
    case 'success':
      return { label: 'Upload complete', variant: 'default' };
    case 'error':
      return { label: 'Upload failed', variant: 'destructive' };
    default:
      return { label: 'Idle', variant: 'outline' };
  }
}

function formatPublicFetchStatus(status) {
  switch (status) {
    case 'checking':
      return { label: 'Verifying access URL…', variant: 'secondary' };
    case 'signing':
      return { label: 'Requesting signed download…', variant: 'secondary' };
    case 'success':
      return { label: 'Access URL reachable', variant: 'default' };
    case 'error':
      return { label: 'Access URL failed', variant: 'destructive' };
    case 'missing':
      return { label: 'No access URL provided', variant: 'outline' };
    default:
      return { label: 'Awaiting upload', variant: 'outline' };
  }
}

function normalizeHeaders(headers) {
  if (!headers || typeof headers !== 'object' || Array.isArray(headers)) {
    return {};
  }

  return Object.entries(headers).reduce((accumulator, [key, value]) => {
    if (value !== undefined && value !== null) {
      accumulator[String(key)] = String(value);
    }
    return accumulator;
  }, {});
}

function UploadTestPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [objectKey, setObjectKey] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [presignResult, setPresignResult] = useState(null);
  const [uploadResponseDetails, setUploadResponseDetails] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copyNotice, setCopyNotice] = useState(null);
  const [publicFetchStatus, setPublicFetchStatus] = useState('idle');
  const [publicFetchError, setPublicFetchError] = useState(null);
  const [publicCheckedAt, setPublicCheckedAt] = useState(null);
  const [downloadPresignResult, setDownloadPresignResult] = useState(null);
  const [resolvedPreviewUrl, setResolvedPreviewUrl] = useState(null);

  const previewUrl = useMemo(() => {
    if (!selectedFile) {
      return null;
    }

    return URL.createObjectURL(selectedFile);
  }, [selectedFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const statusDisplay = useMemo(() => formatStatus(status), [status]);
  const publicStatusDisplay = useMemo(
    () => formatPublicFetchStatus(publicFetchStatus),
    [publicFetchStatus]
  );

  const handleFileChange = useCallback((event) => {
    const file = event.target.files?.[0];

    setPresignResult(null);
    setError(null);
    setStatus('idle');
    setPublicFetchStatus('idle');
    setPublicFetchError(null);
    setPublicCheckedAt(null);
    setUploadResponseDetails(null);
    setDownloadPresignResult(null);
    setResolvedPreviewUrl(null);

    if (!file) {
      setSelectedFile(null);
      setObjectKey('');
      setDownloadPresignResult(null);
      setResolvedPreviewUrl(null);
      return;
    }

    if (!file.type || !file.type.startsWith(ACCEPTED_IMAGE_PREFIX)) {
      setSelectedFile(null);
      setObjectKey('');
      setDownloadPresignResult(null);
      setResolvedPreviewUrl(null);
      setError('Please select a valid image file (PNG, JPG, GIF, or WebP).');
      return;
    }

    setSelectedFile(file);
    setObjectKey(buildDefaultObjectKey(file));
  }, []);

  const handlePreviewError = useCallback(() => {
    console.error('Preview image failed to render in the upload test harness.', {
      previewUrl,
      fileName: selectedFile?.name,
      fileType: selectedFile?.type,
      fileSize: selectedFile?.size,
    });
    setError('Unable to render the preview. Check the console for more details.');
  }, [previewUrl, selectedFile]);

  const handlePublicPreviewError = useCallback(() => {
    console.error('Remote access URL image failed to render in the upload test harness preview.', {
      previewUrl: resolvedPreviewUrl,
      objectKey: presignResult?.objectKey,
      signedDownloadUrl: downloadPresignResult?.url,
      verificationStatus: publicFetchStatus,
      verificationError: publicFetchError,
      verifiedAt: publicCheckedAt,
    });
    setPublicFetchStatus('error');
    setPublicFetchError((previous) => previous || 'The access URL preview could not be rendered.');
  }, [
    resolvedPreviewUrl,
    presignResult,
    downloadPresignResult,
    publicFetchStatus,
    publicFetchError,
    publicCheckedAt,
  ]);

  const handlePublicPreviewLoad = useCallback(() => {
    console.info('Remote access URL image rendered successfully in the upload test harness preview.', {
      previewUrl: resolvedPreviewUrl,
      verifiedAt: publicCheckedAt,
    });
  }, [resolvedPreviewUrl, publicCheckedAt]);

  const verifyPublicUrlAvailability = useCallback(
    async (publicUrl, objectKey) => {
      let urlToCheck = publicUrl || null;

      setPublicFetchError(null);
      setPublicCheckedAt(null);
      setDownloadPresignResult(null);
      setResolvedPreviewUrl(null);

      try {
        if (!urlToCheck) {
          setPublicFetchStatus('signing');
          console.info('No public URL returned; requesting a signed download URL for verification.', {
            objectKey,
          });

          const downloadPresign = await requestUploadPresign({
            objectKey,
            operation: 'get',
          });

          if (!downloadPresign?.url) {
            throw new Error('The presign endpoint did not return a download URL.');
          }

          setDownloadPresignResult(downloadPresign);
          urlToCheck = downloadPresign.url;
        }

        setPublicFetchStatus('checking');
        setResolvedPreviewUrl(urlToCheck);

        const response = await fetch(urlToCheck, {
          method: 'GET',
          cache: 'no-cache',
          mode: 'cors',
        });

        if (!response.ok) {
          if (response.status === 403) {
            console.error('Access denied while fetching the access URL for the uploaded image.', {
              accessUrl: urlToCheck,
              objectKey,
              status: response.status,
              statusText: response.statusText,
            });
          }
          throw new Error(`Access URL responded with status ${response.status}.`);
        }

        const contentType = response.headers.get('Content-Type');
        const contentLength = response.headers.get('Content-Length');
        setPublicFetchStatus('success');
        setPublicCheckedAt(new Date().toISOString());
        console.info('Verified the uploaded image is reachable via its access URL.', {
          accessUrl: urlToCheck,
          objectKey,
          contentType,
          contentLength,
        });
      } catch (verificationError) {
        setPublicFetchStatus('error');
        setPublicFetchError(
          verificationError?.message || 'Failed to fetch the image from the access URL.'
        );
        setPublicCheckedAt(new Date().toISOString());
        console.error('Unable to fetch the uploaded image from its access URL.', {
          accessUrl: urlToCheck,
          objectKey,
          error: verificationError,
        });
      }
    },
    []
  );

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      if (isSubmitting) {
        return;
      }

      if (!selectedFile) {
        setError('Choose an image file before requesting a presigned URL.');
        return;
      }

      const trimmedKey = objectKey.trim();

      if (!trimmedKey) {
        setError('Provide an object key to store the image in MinIO.');
        return;
      }

      setIsSubmitting(true);
      setStatus('requesting');
      setError(null);
      setCopyNotice(null);
      setPresignResult(null);
      setUploadResponseDetails(null);
      setPublicFetchStatus('idle');
      setPublicFetchError(null);
      setPublicCheckedAt(null);
      setDownloadPresignResult(null);
      setResolvedPreviewUrl(null);

      try {
        const presign = await requestUploadPresign({
          objectKey: trimmedKey,
          operation: 'put',
          contentType: selectedFile.type || 'application/octet-stream',
        });

        if (!presign?.url) {
          throw new Error('The presign endpoint did not return a URL.');
        }

        setPresignResult(presign);
        setStatus('uploading');

        const resolvedHeaders = normalizeHeaders(presign.headers);
        if (selectedFile.type && !resolvedHeaders['Content-Type'] && !resolvedHeaders['content-type']) {
          resolvedHeaders['Content-Type'] = selectedFile.type;
        }

        const uploadResponse = await fetch(presign.url, {
          method: presign.method || 'PUT',
          headers: resolvedHeaders,
          body: selectedFile,
        });

        const responseHeaders = {};
        uploadResponse.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });

        let responseBody = null;
        try {
          const text = await uploadResponse.clone().text();
          if (text && text.trim().length > 0) {
            responseBody = text;
          }
        } catch (responseReadError) {
          console.warn('Unable to read MinIO upload response body.', responseReadError);
        }

        const responseSummary = {
          ok: uploadResponse.ok,
          status: uploadResponse.status,
          statusText: uploadResponse.statusText,
          headers: responseHeaders,
          body: responseBody,
        };

        setUploadResponseDetails(responseSummary);

        if (!uploadResponse.ok) {
          if (uploadResponse.status === 403) {
            console.error('Access denied while uploading to MinIO. Verify IAM policies and presign URL configuration.', {
              objectKey: trimmedKey,
              status: uploadResponse.status,
              statusText: uploadResponse.statusText,
            });
          }
          throw new Error(`Upload failed with status ${uploadResponse.status}.`);
        }

        setStatus('success');
        await verifyPublicUrlAvailability(presign.publicUrl, trimmedKey);
      } catch (uploadError) {
        setStatus('error');
        console.error('Image upload failed in the test harness.', uploadError);
        setError(uploadError?.message || 'Failed to upload the image.');
        setUploadResponseDetails((previous) =>
          previous || {
            ok: false,
            status: null,
            statusText: null,
            headers: {},
            body: null,
            error: uploadError?.message || 'Unknown upload error occurred.',
          }
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, objectKey, selectedFile, verifyPublicUrlAvailability]
  );

  const handleCopyAccessUrl = useCallback(async () => {
    if (!resolvedPreviewUrl || !navigator?.clipboard) {
      return;
    }

    try {
      await navigator.clipboard.writeText(resolvedPreviewUrl);
      setCopyNotice('Access URL copied to clipboard.');
      setTimeout(() => setCopyNotice(null), 2000);
    } catch (copyError) {
      setCopyNotice('Unable to copy URL automatically.');
      setTimeout(() => setCopyNotice(null), 2000);
    }
  }, [resolvedPreviewUrl]);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Image Upload Test Bench</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Use this harness to request a MinIO presigned URL, upload an image, and inspect the response payload.
          </p>
        </div>
        <Badge variant={statusDisplay.variant}>{statusDisplay.label}</Badge>
      </div>

      <Card>
        <CardHeader className="space-y-2">
          <CardTitle>Upload configuration</CardTitle>
          <CardDescription>
            Select an image file and optionally adjust the storage object key before generating a presigned upload URL.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-3">
              <Label htmlFor="test-upload-file">Image file</Label>
              <Input
                id="test-upload-file"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isSubmitting}
              />
              {selectedFile ? (
                <p className="text-sm text-muted-foreground">
                  Selected {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">PNG, JPG, GIF, or WebP images up to your MinIO limits.</p>
              )}
            </div>

            {previewUrl ? (
              <div className="flex flex-col gap-2">
                <Label>Preview</Label>
                <div className="overflow-hidden rounded-xl border border-border bg-muted/30">
                  <img
                    src={previewUrl}
                    alt="Selected preview"
                    className="h-64 w-full object-contain"
                    onError={handlePreviewError}
                  />
                </div>
              </div>
            ) : null}

            <div className="space-y-3">
              <Label htmlFor="test-upload-object-key">Object key</Label>
              <Input
                id="test-upload-object-key"
                value={objectKey}
                onChange={(event) => setObjectKey(event.target.value)}
                placeholder={`${TEST_PREFIX}/2024-01-01-image.png`}
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                The key is sanitized automatically; use folders like <code>{TEST_PREFIX}/</code> to keep test uploads organised.
              </p>
            </div>

            {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Working…' : 'Request presigned URL'}
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <LucideIcon name="ShieldCheck" className="h-4 w-4" />
                MinIO permissions required: <span className="font-medium">storage.uploads.write</span>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-2">
          <CardTitle>Presign response</CardTitle>
          <CardDescription>
            The raw payload from `/api/uploads/presign` is displayed below once an upload completes successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {presignResult ? (
            <>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Method:</span>
                <Badge variant="outline">{presignResult.method}</Badge>
                <span className="font-medium text-foreground">Expires:</span>
                <span>{presignResult.expiresAt}</span>
                {resolvedPreviewUrl ? (
                  <Button variant="ghost" size="sm" type="button" onClick={handleCopyAccessUrl}>
                    Copy access URL
                  </Button>
                ) : null}
                {copyNotice ? <span className="text-xs text-secondary-foreground">{copyNotice}</span> : null}
              </div>
              <Textarea
                readOnly
                value={JSON.stringify(presignResult, null, 2)}
                className="min-h-[220px] font-mono text-xs"
              />
              {downloadPresignResult ? (
                <>
                  <Separator />
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Download method:</span>
                    <Badge variant="outline">{downloadPresignResult.method}</Badge>
                    <span className="font-medium text-foreground">Expires:</span>
                    <span>{downloadPresignResult.expiresAt}</span>
                  </div>
                  <Textarea
                    readOnly
                    value={JSON.stringify(downloadPresignResult, null, 2)}
                    className="min-h-[220px] font-mono text-xs"
                  />
                </>
              ) : null}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Generate a presigned URL to view the structured response data, headers, and derived public link.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-2">
          <CardTitle>MinIO upload response</CardTitle>
          <CardDescription>
            Inspect the direct response from MinIO after the presigned upload request completes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {uploadResponseDetails ? (
            <>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Status:</span>
                <Badge variant={uploadResponseDetails.ok ? 'default' : 'destructive'}>
                  {uploadResponseDetails.ok ? 'Success' : 'Failed'}
                </Badge>
                {uploadResponseDetails.status !== null ? (
                  <>
                    <span className="font-medium text-foreground">Code:</span>
                    <span>
                      {uploadResponseDetails.status} {uploadResponseDetails.statusText}
                    </span>
                  </>
                ) : null}
                {uploadResponseDetails.error ? (
                  <span className="text-destructive">{uploadResponseDetails.error}</span>
                ) : null}
              </div>
              <Textarea
                readOnly
                value={JSON.stringify(uploadResponseDetails, null, 2)}
                className="min-h-[220px] font-mono text-xs"
              />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Request an upload to view the HTTP status, headers, and body returned by MinIO.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-2">
          <CardTitle>Access URL verification</CardTitle>
          <CardDescription>
            After uploading, the harness resolves a public or signed access URL, verifies it, and attempts to render the remote image.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Status:</span>
            <Badge variant={publicStatusDisplay.variant}>{publicStatusDisplay.label}</Badge>
            {publicCheckedAt ? <span>Checked at {new Date(publicCheckedAt).toLocaleString()}</span> : null}
            {resolvedPreviewUrl ? (
              <Button
                asChild
                variant="ghost"
                size="sm"
                type="button"
              >
                <a href={resolvedPreviewUrl} target="_blank" rel="noreferrer">
                  Open access URL
                </a>
              </Button>
            ) : null}
          </div>

          {publicFetchError ? (
            <p className="text-sm font-medium text-destructive">{publicFetchError}</p>
          ) : null}

          {resolvedPreviewUrl ? (
            <div className="space-y-3">
              <Label>Access URL preview</Label>
              <div className="overflow-hidden rounded-xl border border-border bg-muted/30">
                <img
                  src={resolvedPreviewUrl}
                  alt="Uploaded image fetched via resolved access URL"
                  className="h-64 w-full object-contain"
                  onError={handlePublicPreviewError}
                  onLoad={handlePublicPreviewLoad}
                />
              </div>
              <p className="text-xs break-all text-muted-foreground">{resolvedPreviewUrl}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Upload an image to resolve an access URL. When public links are disabled, the harness requests a signed download automatically.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default UploadTestPage;
