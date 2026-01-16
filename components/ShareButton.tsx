'use client';

import { useState } from 'react';
import { faShare, faLink, faCheck, faDownload, faImage } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface ShareButtonProps {
  postId: string;
  postTitle: string;
  postDescription?: string | null;
  postRanks: (string | null)[];
  videoUrl: string | null;
}

type ImageFormat = 'square' | 'twitter' | 'story';

export function ShareButton({ postId, postTitle, postDescription, postRanks, videoUrl }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [generatingFormats, setGeneratingFormats] = useState<Set<ImageFormat>>(new Set());
  const [isDownloadingVideo, setIsDownloadingVideo] = useState(false);

  const shareUrl = `https://ranktop.net/post/${postId}`;

  // Create share text
  const ranks = postRanks.filter(Boolean).slice(0, 3);
  const shareText = postDescription
    ? `${postTitle} - ${postDescription.slice(0, 100)}${postDescription.length > 100 ? '...' : ''}`
    : `${postTitle} - Top ${ranks.length}: ${ranks.join(', ')}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const exportVideo = async () => {
    if (!videoUrl) return; // Ensure you pass videoUrl as a prop to ShareButton
    setIsDownloadingVideo(true);

    try {
      const response = await fetch(videoUrl);
      if (!response.ok) throw new Error('Failed to download video');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${postTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsExportOpen(false);
    } catch (error) {
      console.error('Video download failed:', error);
      alert('Failed to download video. You can try right-clicking the video and selecting "Save Video As".');
    } finally {
      setIsDownloadingVideo(false);
    }
  };

  // Image export functionality with per-format loading states
  const exportAsImage = async (format: ImageFormat) => {
    setGeneratingFormats(prev => new Set(prev).add(format));

    try {
      // Define dimensions for different formats
      const dimensions = {
        square: { width: 1080, height: 1080 }, // Instagram square
        twitter: { width: 1200, height: 675 }, // Twitter 16:9
        story: { width: 1080, height: 1920 }, // Instagram/TikTok story
      };

      const { width, height } = dimensions[format];

      // Use your existing OG image endpoint but with custom dimensions
      const imageUrl = `/api/og?title=${encodeURIComponent(postTitle)}&description=${encodeURIComponent(postDescription || '')}&ranks=${encodeURIComponent(postRanks.filter(Boolean).join(','))}&width=${width}&height=${height}&format=${format}`;

      // Fetch the image
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error('Failed to generate image');

      const blob = await response.blob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${postTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${format}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsExportOpen(false);
    } catch (error) {
      console.error('Failed to export image:', error);
      alert('Failed to export image. Please try again.');
    } finally {
      setGeneratingFormats(prev => {
        const newSet = new Set(prev);
        newSet.delete(format);
        return newSet;
      });
    }
  };

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    reddit: `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(postTitle)}`,
    discord: shareUrl, // Discord auto-previews, so just the URL
  };

  // Native share API for mobile
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: postTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error occurred
        console.log('Share cancelled');
      }
    } else {
      // Fallback to copy URL
      copyToClipboard();
    }
  };

  const closeAllMenus = () => {
    setIsShareOpen(false);
    setIsExportOpen(false);
  };

  return (
    <div className="relative flex space-x-3">
      {/* Share Button */}
      <button onClick={() => { setIsExportOpen(false); setIsShareOpen(!isShareOpen); }} className="outline outline-2 outline-slate-700 rounded-md p-2 bg-slate-50 hover:bg-opacity-10 bg-opacity-5 text-slate-400 h-10 flex items-center space-x-2" aria-label="Share post">
        <FontAwesomeIcon icon={faShare} style={{ color: "#94a3b8" }} />
        <span className="hidden sm:inline">Share</span>
      </button>

      {/* Export Button */}
      <button onClick={() => { setIsShareOpen(false); setIsExportOpen(!isExportOpen); }} className="outline outline-2 outline-slate-700 rounded-md p-2 bg-slate-50 hover:bg-opacity-10 bg-opacity-5 text-slate-400 h-10 flex items-center space-x-2" aria-label="Export as image">
        <FontAwesomeIcon icon={faDownload} style={{ color: "#94a3b8" }} />
        <span className="hidden sm:inline">Export</span>
      </button>

      {(isShareOpen || isExportOpen) &&
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={closeAllMenus} />

          {/* Share menu */}
          {isShareOpen &&
            <div className="absolute right-0 top-12 z-50 bg-slate-800 border border-slate-700 rounded-md shadow-lg min-w-48 p-2">
              {/* Copy Link */}
              <button onClick={copyToClipboard} className="w-full flex items-center space-x-3 p-3 hover:bg-slate-700 rounded-md transition-colors">
                {copied ? <FontAwesomeIcon icon={faCheck} style={{ color: "#94a3b8" }} className="text-green-400" /> : <FontAwesomeIcon icon={faLink} style={{ color: "#94a3b8" }} />}
                <span className="text-slate-300">{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>

              {/* Native Share (mobile) */}
              {typeof window !== 'undefined' && 'share' in navigator && (
                <button onClick={handleNativeShare} className="w-full flex items-center space-x-3 p-3 hover:bg-slate-700 rounded-md transition-colors">
                  <FontAwesomeIcon icon={faShare} style={{ color: "#94a3b8" }} />
                  <span className="text-slate-300">Share</span>
                </button>
              )}

              <div className="border-t border-slate-600 my-2" />

              {/* Social platforms */}
              <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" className="w-full flex items-center space-x-3 p-3 hover:bg-slate-700 rounded-md transition-colors" onClick={closeAllMenus}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-blue-400">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span className="text-slate-300">Share on X</span>
              </a>

              <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-full flex items-center space-x-3 p-3 hover:bg-slate-700 rounded-md transition-colors" onClick={closeAllMenus}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-blue-500">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="text-slate-300">Share on Facebook</span>
              </a>

              <a href={shareLinks.reddit} target="_blank" rel="noopener noreferrer" className="w-full flex items-center space-x-3 p-3 hover:bg-slate-700 rounded-md transition-colors" onClick={closeAllMenus}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-orange-500">
                  <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
                </svg>
                <span className="text-slate-300">Share on Reddit</span>
              </a>

              <button onClick={() => { copyToClipboard(); closeAllMenus(); }} className="w-full flex items-center space-x-3 p-3 hover:bg-slate-700 rounded-md transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-indigo-400">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0190 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z" />
                </svg>
                <span className="text-slate-300">Copy for Discord</span>
              </button>
            </div>
          }

          {/* Export menu */}
          {isExportOpen && (
            <div className="absolute right-0 top-12 z-50 bg-slate-800 border border-slate-700 rounded-md shadow-lg min-w-64 p-2">

              {/* CASE 1: VIDEO POST */}
              {videoUrl ? (
                <>
                  <button
                    onClick={exportVideo}
                    disabled={isDownloadingVideo}
                    className="w-full flex items-center justify-between p-3 hover:bg-slate-700 rounded-md transition-colors disabled:opacity-50 group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-500/10 p-2 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                        <FontAwesomeIcon icon={faDownload} className="text-blue-400" />
                      </div>
                      <div className="text-left">
                        <div className="text-blue-400 font-bold">Download Video</div>
                        <div className="text-slate-500 text-xs font-mono">MP4 • 1080p</div>
                      </div>
                    </div>
                    {isDownloadingVideo && (
                      <div className="w-4 h-4 border-2 border-slate-600 border-t-blue-400 rounded-full animate-spin" />
                    )}
                  </button>
                </>
              ) : (
                /* CASE 2: TEXT/IMAGE POST */
                <>
                  <div className="px-3 py-2 text-xs text-slate-400 font-medium uppercase tracking-wide border-b border-slate-700 mb-2">
                    Export as Image
                  </div>

                  <button onClick={() => exportAsImage('square')} disabled={generatingFormats.has('square')} className="w-full flex items-center justify-between p-3 hover:bg-slate-700 rounded-md transition-colors disabled:opacity-50">
                    <div className="flex items-center space-x-3">
                      <FontAwesomeIcon icon={faImage} className="text-slate-400" />
                      <div className="text-left">
                        <div className="text-slate-300 font-medium">Instagram Square</div>
                        <div className="text-slate-500 text-sm">1080 × 1080</div>
                      </div>
                    </div>
                    {generatingFormats.has('square') && (
                      <div className="w-4 h-4 border-2 border-slate-600 border-t-slate-300 rounded-full animate-spin" />
                    )}
                  </button>

                  <button onClick={() => exportAsImage('twitter')} disabled={generatingFormats.has('twitter')} className="w-full flex items-center justify-between p-3 hover:bg-slate-700 rounded-md transition-colors disabled:opacity-50">
                    <div className="flex items-center space-x-3">
                      <FontAwesomeIcon icon={faImage} className="text-slate-400" />
                      <div className="text-left">
                        <div className="text-slate-300 font-medium">Twitter Card</div>
                        <div className="text-slate-500 text-sm">1200 × 675</div>
                      </div>
                    </div>
                    {generatingFormats.has('twitter') && (
                      <div className="w-4 h-4 border-2 border-slate-600 border-t-slate-300 rounded-full animate-spin" />
                    )}
                  </button>

                  <button onClick={() => exportAsImage('story')} disabled={generatingFormats.has('story')} className="w-full flex items-center justify-between p-3 hover:bg-slate-700 rounded-md transition-colors disabled:opacity-50">
                    <div className="flex items-center space-x-3">
                      <FontAwesomeIcon icon={faImage} className="text-slate-400" />
                      <div className="text-left">
                        <div className="text-slate-300 font-medium">Story Format</div>
                        <div className="text-slate-500 text-sm">1080 × 1920</div>
                      </div>
                    </div>
                    {generatingFormats.has('story') && (
                      <div className="w-4 h-4 border-2 border-slate-600 border-t-slate-300 rounded-full animate-spin" />
                    )}
                  </button>
                </>
              )}
            </div>
          )}
        </>
      }
    </div>
  );
}