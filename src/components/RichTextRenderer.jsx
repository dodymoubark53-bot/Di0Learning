import React, { useState, useEffect, useContext } from 'react';
import { getMedia } from '../utils/db';
import { AppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';

export default function RichTextRenderer({ content, deckId }) {
  const [renderedContent, setRenderedContent] = useState(content);
  const { user } = useContext(AppContext);

  useEffect(() => {
    let isMounted = true;
    const parseContent = async () => {
      if (!content) return;

      let workingText = content;

      // Extract sound tags [sound:filename.mp3]
      const soundRegex = /\[sound:(.*?)\]/g;
      let match;
      const soundMatches = [];
      while ((match = soundRegex.exec(content)) !== null) {
        soundMatches.push(match[1]);
      }

      // Extract img src tags
      const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/g;
      const imgMatches = [];
      while ((match = imgRegex.exec(content)) !== null) {
        imgMatches.push(match[1]);
      }

      const replacements = {};

      for (const filename of [...soundMatches, ...imgMatches]) {
        // Resolve from Supabase Storage if user is logged in
        if (supabase && user) {
          const isAudio = filename.endsWith('.mp3') || filename.endsWith('.wav') || filename.endsWith('.ogg') || filename.endsWith('.webm');
          const bucket = isAudio ? 'card-audio' : 'card-images';
          const { data } = supabase.storage
            .from(bucket)
            .getPublicUrl(`${user.id}/${filename}`);
          
          if (data?.publicUrl) {
            replacements[filename] = data.publicUrl;
            continue;
          }
        }

        // Look up by original filename inside deck or general fallback keys
        const mediaKeys = [
          `ankimedia_${deckId}_${filename}`,
          `ankimedia_General_${filename}`,
          filename
        ];

        let record = null;
        for (const key of mediaKeys) {
          record = await getMedia(key);
          if (record && record.blob) break;
        }

        if (record && record.blob) {
          const blobUrl = URL.createObjectURL(record.blob);
          replacements[filename] = blobUrl;
        }
      }

      if (!isMounted) return;

      let finalHtml = content;

      // Replace sound tags with audio controls
      finalHtml = finalHtml.replace(/\[sound:(.*?)\]/g, (match, filename) => {
        const url = replacements[filename];
        if (url) {
          return `<div class="anki-audio-wrapper" style="margin: 8px 0;"><audio controls src="${url}" style="width: 100%; max-width: 260px; height: 32px;" /></div>`;
        }
        return `[Audio: ${filename}]`;
      });

      // Replace image sources with local blob URLs
      finalHtml = finalHtml.replace(/(<img[^>]+src=["'])([^"']*)(["'][^>]*>)/g, (match, prefix, filename, suffix) => {
        const url = replacements[filename];
        if (url) {
          return `${prefix}${url}${suffix}`;
        }
        return match;
      });

      setRenderedContent(finalHtml);
    };

    parseContent();

    return () => {
      isMounted = false;
      // We don't strictly need to revoke URLs immediately to prevent page flickering,
      // browser garbage collection will clean them up, but let's release when component unmounts.
    };
  }, [content, deckId]);

  const isHtml = /<[a-z][\s\S]*>/i.test(content) || content.includes('[sound:');

  if (isHtml) {
    return (
      <div 
        dangerouslySetInnerHTML={{ __html: renderedContent }} 
        style={{ 
          width: '100%', 
          wordBreak: 'break-word',
          textAlign: 'center'
        }} 
        className="anki-rich-content"
      />
    );
  }

  return <div style={{ whiteSpace: 'pre-wrap', width: '100%', textAlign: 'center' }}>{content}</div>;
}
