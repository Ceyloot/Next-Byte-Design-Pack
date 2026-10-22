const BASE = '/api';

async function request(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${method} ${path} → ${res.status}: ${text}`);
  }
  return res.status === 204 ? null : res.json();
}

export const apiGet    = (path)        => request('GET',    path);
export const apiPost   = (path, body)  => request('POST',   path, body);
export const apiPut    = (path, body)  => request('PUT',    path, body);
export const apiPatch  = (path, body)  => request('PATCH',  path, body);
export const apiDelete = (path)        => request('DELETE', path);

// ── Projekty ──────────────────────────────────────────────────────────────────
export const getProjects       = ()           => apiGet('/projects');
export const createProject     = (id, name)   => apiPost('/projects', { id, name });
export const renameProject     = (id, name)   => apiPatch(`/projects/${id}`, { name });
export const deleteProject     = (id)         => apiDelete(`/projects/${id}`);

// ── Źródła ────────────────────────────────────────────────────────────────────
export const getSources        = (pid)        => apiGet(`/projects/${pid}/sources`);
export const createSource      = (pid, src)   => apiPost(`/projects/${pid}/sources`, src);
export const updateSource      = (pid, sid, data) => apiPut(`/projects/${pid}/sources/${sid}`, data);
export const deleteSource      = (pid, sid)   => apiDelete(`/projects/${pid}/sources/${sid}`);

export const getSelected       = (pid)        => apiGet(`/projects/${pid}/selected`);
export const setSelected       = (pid, ids)   => apiPut(`/projects/${pid}/selected`, ids);

// ── Czat ──────────────────────────────────────────────────────────────────────
export const getChat           = (pid)        => apiGet(`/projects/${pid}/chat`);
export const saveChat          = (pid, msgs)  => apiPut(`/projects/${pid}/chat`, msgs);
export const clearChat         = (pid)        => apiDelete(`/projects/${pid}/chat`);

// ── Notatki ───────────────────────────────────────────────────────────────────
export const getNotes          = (pid)        => apiGet(`/projects/${pid}/notes`);
export const saveNotes         = (pid, notes) => apiPut(`/projects/${pid}/notes`, notes);

// ── Canvas ────────────────────────────────────────────────────────────────────
export const getCanvas         = (pid)        => apiGet(`/projects/${pid}/canvas`);
export const saveCanvas        = (pid, graph) => apiPut(`/projects/${pid}/canvas`, graph);
export const deleteCanvas      = (pid)        => apiDelete(`/projects/${pid}/canvas`);

// ── Studio ────────────────────────────────────────────────────────────────────
export const getStudio = async (pid) => {
  try {
    return await apiGet(`/projects/${pid}/studio`);
  } catch {
    try { return JSON.parse(localStorage.getItem(`notebook_studio_${pid}`)) || []; } catch { return []; }
  }
};

export const saveStudio = async (pid, outputs) => {
  try { localStorage.setItem(`notebook_studio_${pid}`, JSON.stringify(outputs)); } catch {}
  try {
    return await apiPut(`/projects/${pid}/studio`, outputs);
  } catch {
    return null;
  }
};

