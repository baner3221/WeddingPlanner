import React, { useState, useEffect, useRef } from 'react';
import { FolderOpen, UploadCloud, File, Trash2, ExternalLink, ShieldAlert, Download, FolderPlus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

// Google Drive API endpoints
const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3/files';
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'; // FastAPI backend

const BUCKETS = ['All', 'Quotations', 'Planning Excels', 'Inspo', 'Images'];

export default function Documents() {
  const [files, setFiles] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeBucket, setActiveBucket] = useState('All');
  
  const [token, setToken] = useState<string | null>(null);
  
  // Cache subfolder IDs: { "Quotations": "drive_folder_id", ... }
  const subfolderCache = useRef<Record<string, string>>({});
  
  const folderId = import.meta.env.VITE_DRIVE_FOLDER_ID;

  // Fetch token from backend
  const fetchToken = async () => {
    try {
      // Check for cached valid token first
      const cached = sessionStorage.getItem('drive_access_token');
      const expiresAt = sessionStorage.getItem('drive_token_expires');
      
      if (cached && expiresAt && parseInt(expiresAt) > Date.now()) {
        setToken(cached);
        return cached;
      }

      const res = await fetch(`${API_BASE_URL}/api/drive/token`);
      if (!res.ok) {
        throw new Error(await res.text());
      }
      
      const data = await res.json();
      const accessToken = data.access_token;
      // Subtract 5 minutes from expiry for safety margin
      const expiryTime = Date.now() + ((data.expires_in - 300) * 1000); 
      
      sessionStorage.setItem('drive_access_token', accessToken);
      sessionStorage.setItem('drive_token_expires', expiryTime.toString());
      
      setToken(accessToken);
      return accessToken;
    } catch (e: any) {
      console.error(e);
      toast.error('Failed to connect to Workspace Drive. Is backend running?');
      setIsLoading(false);
      return null;
    }
  };

  useEffect(() => {
    fetchToken();
  }, []);

  // Get or create a subfolder inside the main Drive folder
  const getOrCreateSubfolder = async (bucketName: string, activeToken: string): Promise<string> => {
    if (bucketName === 'All') return folderId;
    if (subfolderCache.current[bucketName]) return subfolderCache.current[bucketName];

    // Search for existing subfolder
    const q = `'${folderId}' in parents and name='${bucketName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    const searchRes = await fetch(
      `${DRIVE_API_URL}?q=${encodeURIComponent(q)}&fields=files(id,name)`,
      { headers: { 'Authorization': `Bearer ${activeToken}` } }
    );
    
    if (searchRes.ok) {
      const data = await searchRes.json();
      if (data.files && data.files.length > 0) {
        subfolderCache.current[bucketName] = data.files[0].id;
        return data.files[0].id;
      }
    }

    // Create subfolder
    const createRes = await fetch(DRIVE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${activeToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: bucketName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [folderId]
      })
    });

    if (!createRes.ok) throw new Error('Failed to create subfolder');
    const folder = await createRes.json();
    subfolderCache.current[bucketName] = folder.id;
    return folder.id;
  };

  // Fetch Files
  const fetchFiles = async () => {
    const activeToken = await fetchToken();
    if (!activeToken) return;
    
    setIsLoading(true);
    try {
      let targetFolderId = folderId;

      if (activeBucket !== 'All') {
        targetFolderId = await getOrCreateSubfolder(activeBucket, activeToken);
      }

      // For "All", we fetch files from root + all subfolders
      let q: string;
      if (activeBucket === 'All') {
        const subIds = Object.values(subfolderCache.current);
        const allParents = [folderId, ...subIds];
        const parentClauses = allParents.map(id => `'${id}' in parents`).join(' or ');
        q = `(${parentClauses}) and trashed=false and mimeType!='application/vnd.google-apps.folder'`;
      } else {
        q = `'${targetFolderId}' in parents and trashed=false and mimeType!='application/vnd.google-apps.folder'`;
      }

      const url = `${DRIVE_API_URL}?q=${encodeURIComponent(q)}&fields=files(id,name,size,createdTime,webViewLink,parents)`;
      
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${activeToken}` }
      });
      
      if (!res.ok) {
        throw new Error(await res.text());
      }
      
      const data = await res.json();
      setFiles(data.files || []);
    } catch (e: any) {
      toast.error('Failed to list files');
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Pre-load subfolder IDs on initial connect
  const loadSubfolders = async (activeToken: string) => {
    try {
      const q = `'${folderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
      const res = await fetch(
        `${DRIVE_API_URL}?q=${encodeURIComponent(q)}&fields=files(id,name)`,
        { headers: { 'Authorization': `Bearer ${activeToken}` } }
      );
      if (res.ok) {
        const data = await res.json();
        (data.files || []).forEach((f: any) => {
          subfolderCache.current[f.name] = f.id;
        });
      }
    } catch {
      // Non-critical
    }
  };

  useEffect(() => {
    if (token) {
      loadSubfolders(token).then(() => fetchFiles());
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchFiles();
    }
  }, [activeBucket]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    const activeToken = await fetchToken();
    if (!activeToken) return;

    setIsUploading(true);
    const toastId = toast.loading(`Uploading to ${activeBucket === 'All' ? 'root' : activeBucket}...`);

    try {
      const targetFolder = activeBucket === 'All' ? folderId : await getOrCreateSubfolder(activeBucket, activeToken);

      // STEP 1: Initiate Resumable Upload
      const metadata = {
        name: file.name,
        parents: [targetFolder]
      };

      const initRes = await fetch(`${DRIVE_UPLOAD_URL}?uploadType=resumable`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${activeToken}`,
          'Content-Type': 'application/json',
          'X-Upload-Content-Type': file.type || 'application/octet-stream',
          'X-Upload-Content-Length': file.size.toString()
        },
        body: JSON.stringify(metadata)
      });

      if (!initRes.ok) throw new Error(await initRes.text());
      
      const uploadUrl = initRes.headers.get('Location');
      if (!uploadUrl) throw new Error("Failed to get upload URL from Google.");

      // STEP 2: Upload the actual file bytes
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type || 'application/octet-stream'
        },
        body: file
      });

      if (!uploadRes.ok) throw new Error(await uploadRes.text());

      toast.success(`Uploaded to ${activeBucket === 'All' ? 'root folder' : activeBucket}!`, { id: toastId });
      fetchFiles();
    } catch (e: any) {
      console.error(e);
      toast.error(`Upload failed: ${e.message}`, { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (fileId: string, fileName: string) => {
    if (!window.confirm(`Are you sure you want to delete ${fileName}?`)) return;
    
    const activeToken = await fetchToken();
    if (!activeToken) return;

    try {
      const res = await fetch(`${DRIVE_API_URL}/${fileId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${activeToken}` }
      });
      if (!res.ok) throw new Error(await res.text());
      
      toast.success('Document deleted');
      fetchFiles();
    } catch (e: any) {
      toast.error('Failed to delete document');
    }
  };

  const handleDownload = async (fileId: string, fileName: string) => {
    const activeToken = await fetchToken();
    if (!activeToken) return;

    const toastId = toast.loading('Downloading...');
    try {
      const res = await fetch(`${DRIVE_API_URL}/${fileId}?alt=media`, {
        headers: { 'Authorization': `Bearer ${activeToken}` }
      });
      if (!res.ok) throw new Error("Download failed");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success('Download complete!', { id: toastId });
    } catch (e: any) {
      toast.error('Failed to download document', { id: toastId });
    }
  };

  const getBucketForFile = (file: any): string => {
    if (!file.parents) return 'Root';
    const parentId = file.parents[0];
    for (const [name, id] of Object.entries(subfolderCache.current)) {
      if (id === parentId) return name;
    }
    return 'Root';
  };

  return (
    <div className="p-4 md:p-8 lg:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title">Workspace Documents</h1>
          <p className="page-subtitle">Centralized storage for the entire wedding party.</p>
        </div>
        
        <div className="flex gap-3">
          {token && (
            <label className="cursor-pointer btn-primary shadow-lg whitespace-nowrap">
              <UploadCloud size={18} />
              {isUploading ? 'Uploading...' : `Upload to ${activeBucket === 'All' ? 'Root' : activeBucket}`}
              <input type="file" onChange={handleUpload} disabled={isUploading} className="hidden" />
            </label>
          )}
        </div>
      </header>

      {/* Bucket Tabs */}
      {token && (
        <div className="flex space-x-1 border-b border-border-subtle overflow-x-auto">
          {BUCKETS.map(bucket => (
            <button
              key={bucket}
              onClick={() => setActiveBucket(bucket)}
              className={`tab flex items-center gap-2 whitespace-nowrap ${activeBucket === bucket ? 'tab-active' : ''}`}
            >
              {bucket === 'All' ? <FolderOpen size={16} /> : <FolderPlus size={16} />}
              {bucket}
            </button>
          ))}
        </div>
      )}

      <div className="card-static min-h-[400px]">
        {isLoading && !token ? (
          <div className="p-12 flex flex-col items-center justify-center text-center h-full">
            <Loader2 size={32} className="animate-spin text-accent mb-4" />
            <p className="text-text-secondary font-medium">Connecting to Workspace Drive...</p>
          </div>
        ) : !token ? (
          <div className="p-12 flex flex-col items-center justify-center text-center h-full">
            <div className="empty-state-icon mb-4">
              <ShieldAlert size={24} className="text-error" />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">Workspace Drive Disconnected</h3>
            <p className="text-text-secondary text-sm max-w-md">
              The backend could not establish a connection to the Google Drive folder. Please check your backend logs and .env credentials.
            </p>
          </div>
        ) : files.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center h-full animate-fade-in">
            <div className="empty-state-icon mb-4">
              <FolderOpen size={24} />
            </div>
            <h3 className="text-lg font-medium text-text-primary mb-1">
              {activeBucket === 'All' ? 'No files yet' : `No files in "${activeBucket}"`}
            </h3>
            <p className="text-text-secondary text-sm max-w-md mt-2">
              Upload a file to see it appear here instantly.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto animate-fade-in">
            <div className="bg-success/10 text-success p-3 text-sm flex items-center justify-center gap-2 border-b border-success/20">
              <ShieldAlert size={16} /> Connected via Backend Proxy · {files.length} file{files.length !== 1 ? 's' : ''} in {activeBucket === 'All' ? 'all buckets' : `"${activeBucket}"`}
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="table-header whitespace-nowrap border-b border-border-subtle">
                  <th className="py-4 px-6 font-semibold text-text-tertiary text-sm">File Name</th>
                  {activeBucket === 'All' && (
                    <th className="py-4 px-6 font-semibold text-text-tertiary text-sm">Bucket</th>
                  )}
                  <th className="py-4 px-6 font-semibold text-text-tertiary text-sm">Size</th>
                  <th className="py-4 px-6 font-semibold text-text-tertiary text-sm">Uploaded</th>
                  <th className="py-4 px-6 font-semibold text-text-tertiary text-sm text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file, i) => (
                  <tr key={i} className="table-row group border-b border-border-subtle/50 last:border-0 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-accent/10 rounded-lg text-accent">
                          <File size={18} />
                        </div>
                        <span className="font-medium text-text-primary truncate max-w-[200px] md:max-w-[400px]">
                          {file.name}
                        </span>
                      </div>
                    </td>
                    {activeBucket === 'All' && (
                      <td className="py-4 px-6">
                        <span className="text-[11px] font-medium uppercase tracking-wider bg-white/5 text-text-secondary px-2.5 py-1 rounded-full border border-border-subtle">
                          {getBucketForFile(file)}
                        </span>
                      </td>
                    )}
                    <td className="py-4 px-6 text-text-secondary text-sm">
                      {file.size ? (Number(file.size) / 1024 / 1024).toFixed(2) + ' MB' : '-'}
                    </td>
                    <td className="py-4 px-6 text-text-secondary text-sm">
                      {new Date(file.createdTime).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleDownload(file.id, file.name)} 
                          className="p-2 text-text-tertiary hover:text-success transition-colors bg-white/5 rounded-lg"
                          title="Direct Download"
                        >
                          <Download size={16} />
                        </button>
                        <a 
                          href={file.webViewLink} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-2 text-text-tertiary hover:text-accent transition-colors bg-white/5 rounded-lg"
                          title="Open in Google Drive"
                        >
                          <ExternalLink size={16} />
                        </a>
                        <button 
                          onClick={() => handleDelete(file.id, file.name)} 
                          className="p-2 text-text-tertiary hover:text-error transition-colors bg-white/5 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
