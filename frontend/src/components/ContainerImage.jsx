import { useEffect, useState } from 'react';
import { Box } from 'lucide-react';
import { getViewUrl } from '../lib/api.js';

// Resolves a Container's S3 imageKey to a short-lived presigned GET url.
// Falls back to a Box icon when there is no image or it fails to load.
export default function ContainerImage({ imageKey, className = '' }) {
  const [url, setUrl] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!imageKey) return;
    let active = true;
    getViewUrl(imageKey)
      .then((d) => active && setUrl(d.viewUrl))
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, [imageKey]);

  if (!imageKey || failed || !url) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg bg-slate-700 text-slate-400 ${className}`}
      >
        <Box size={20} />
      </div>
    );
  }

  return (
    <img
      src={url}
      alt=""
      onError={() => setFailed(true)}
      className={`rounded-lg object-cover ${className}`}
    />
  );
}
