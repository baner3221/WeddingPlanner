import React, { useState, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

type FileObject = {
  name: string;
  url: string;
};

export default function Inspiration() {
  const [images, setImages] = useState<FileObject[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState<string>('all');

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase.storage.from('inspiration').list(activeCategory === 'all' ? '' : activeCategory);
      if (error) throw error;

      const fileObjects = (data || [])
        .filter(file => file.name !== '.emptyFolderPlaceholder')
        .map(file => {
          const path = activeCategory === 'all' ? file.name : `${activeCategory}/${file.name}`;
          const { data: publicUrl } = supabase.storage.from('inspiration').getPublicUrl(path);
          return { name: file.name, url: publicUrl.publicUrl };
        });

      setImages(fileObjects);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchImages();
  }, [activeCategory]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    setIsUploading(true);
    const toastId = toast.loading('Uploading inspiration...');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;

      const { error } = await supabase.storage.from('inspiration').upload(fileName, file);
      if (error) throw error;

      // Log the activity to backend so AI knows about it
      await api.post('/api/activity', {
        action_type: 'image_uploaded',
        description: `Uploaded a new inspiration image: ${file.name}`
      }).catch(() => {}); // Ignore error if backend isn't ready for this yet

      toast.success('Uploaded successfully!', { id: toastId });
      fetchImages();
    } catch (e: any) {
      toast.error('Failed to upload image. Ensure bucket is public.', { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title">Inspiration Board</h1>
          <p className="page-subtitle">Gather your ideas, dresses, and decor.</p>
        </div>

        <label className="cursor-pointer btn-primary">
          <UploadCloud size={20} />
          {isUploading ? 'Uploading...' : 'Upload Image'}
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={isUploading}
            className="hidden"
          />
        </label>
      </header>

      <div className="flex space-x-1 border-b border-border-subtle overflow-x-auto">
        {['all', 'dresses', 'decor', 'venues'].map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`tab capitalize ${activeCategory === cat ? 'tab-active' : ''}`}
          >
            {cat}
          </button>
        ))}
      </div>


      {isLoading ? (
        <div className="py-20 flex justify-center">
          <p className="text-text-tertiary animate-pulse">Loading your board...</p>
        </div>
      ) : images.length === 0 ? (
        <div className="card-static border-dashed p-16 flex flex-col items-center justify-center text-center">
          <div className="empty-state-icon mb-4">
            <ImageIcon size={24} />
          </div>
          <h3 className="text-lg font-medium text-text-primary mb-1">It's a blank canvas</h3>
          <p className="text-text-secondary text-sm">Upload your first inspiration image to start planning.</p>
        </div>
      ) : (
        <div className="masonry-grid">
          {images.map((img) => (
            <div key={img.name} className="masonry-item relative group">
              <img
                src={img.url}
                alt="Inspiration"
                className="w-full rounded-2xl bg-white/5 object-cover shadow-md transition-transform duration-300 group-hover:scale-[1.02]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-2xl pointer-events-none" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
