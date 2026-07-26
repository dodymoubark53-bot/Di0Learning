import { createClient } from '@supabase/supabase-js';

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isPlaceholder = (url, key) => {
  if (!url || !key) return true;
  if (url.includes('your-project-ref') || key.includes('your-anon-key')) return true;
  if (!url.startsWith('http')) return true;
  return false;
};

if (isPlaceholder(supabaseUrl, supabaseAnonKey)) {
  supabaseUrl = localStorage.getItem('supabase_url');
  supabaseAnonKey = localStorage.getItem('supabase_anon_key');
}

if (isPlaceholder(supabaseUrl, supabaseAnonKey)) {
  supabaseUrl = null;
  supabaseAnonKey = null;
}

function createLocalClient() {
  const listeners = new Set();
  let currentSession = null;

  function getUsers() {
    return JSON.parse(localStorage.getItem('_local_users') || '{}');
  }

  function saveUsers(users) {
    localStorage.setItem('_local_users', JSON.stringify(users));
  }

  function getTable(name) {
    const key = `_local_db_${name}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  }

  function saveTable(name, data) {
    localStorage.setItem(`_local_db_${name}`, JSON.stringify(data));
  }

  function getStorage() {
    return JSON.parse(localStorage.getItem('_local_storage') || '{}');
  }

  function saveStorage(data) {
    localStorage.setItem('_local_storage', JSON.stringify(data));
  }

  function notifyListeners(event, session) {
    listeners.forEach(cb => cb(event, session));
  }

  const mockClient = {
    auth: {
      signUp: async ({ email, password }) => {
        const users = getUsers();
        if (users[email]) {
          return { data: null, error: { message: 'User already exists' } };
        }
        users[email] = { email, password, id: crypto.randomUUID(), created_at: new Date().toISOString() };
        saveUsers(users);
        return { data: { user: { id: users[email].id, email }, session: null }, error: null };
      },
      signInWithPassword: async ({ email, password }) => {
        const users = getUsers();
        const user = users[email];
        if (!user || user.password !== password) {
          return { data: null, error: { message: 'Invalid login credentials' } };
        }
        currentSession = {
          user: { id: user.id, email: user.email },
          access_token: 'local_' + crypto.randomUUID(),
          expires_at: Date.now() + 86400000,
        };
        localStorage.setItem('_local_session', JSON.stringify(currentSession));
        notifyListeners('SIGNED_IN', currentSession);
        return { data: { session: currentSession, user: currentSession.user }, error: null };
      },
      signOut: async () => {
        currentSession = null;
        localStorage.removeItem('_local_session');
        notifyListeners('SIGNED_OUT', null);
        return { error: null };
      },
      getSession: async () => {
        if (!currentSession) {
          const saved = localStorage.getItem('_local_session');
          if (saved) currentSession = JSON.parse(saved);
        }
        return { data: { session: currentSession } };
      },
      onAuthStateChange: (callback) => {
        listeners.add(callback);
        return {
          data: { subscription: { unsubscribe: () => listeners.delete(callback) } },
        };
      },
      getUser: async () => {
        if (!currentSession) {
          const saved = localStorage.getItem('_local_session');
          if (saved) currentSession = JSON.parse(saved);
        }
        return { data: { user: currentSession?.user || null } };
      },
    },
    from: (table) => ({
      insert: async (data) => {
        const rows = getTable(table);
        rows.push({ ...data, id: crypto.randomUUID() });
        saveTable(table, rows);
        return { data: null, error: null };
      },
      select: async (columns = '*') => {
        const rows = getTable(table);
        return { data: rows, error: null };
      },
      upsert: async (data, options) => {
        const rows = getTable(table);
        const conflictCol = options?.onConflict || 'id';
        const idx = rows.findIndex(r => r[conflictCol] === data[conflictCol]);
        if (idx >= 0) {
          rows[idx] = { ...rows[idx], ...data };
        } else {
          rows.push({ ...data, id: crypto.randomUUID() });
        }
        saveTable(table, rows);
        return { data: null, error: null };
      },
    }),
    storage: {
      from: () => ({
        upload: async (path, file) => {
          const store = getStorage();
          const reader = new FileReader();
          return new Promise((resolve) => {
            reader.onload = () => {
              store[path] = reader.result;
              saveStorage(store);
              resolve({ data: { path }, error: null });
            };
            reader.onerror = () => {
              resolve({ data: null, error: { message: 'Failed to read file' } });
            };
            reader.readAsDataURL(file);
          });
        },
        getPublicUrl: (path) => {
          const store = getStorage();
          return { data: { publicUrl: store[path] || null } };
        },
        download: async (path) => {
          const store = getStorage();
          const dataUrl = store[path];
          if (!dataUrl) return { data: null, error: { message: 'File not found' } };
          const res = await fetch(dataUrl);
          const blob = await res.blob();
          return { data: blob, error: null };
        },
        list: async (folder) => {
          const store = getStorage();
          const files = Object.keys(store)
            .filter(k => k.startsWith(folder || ''))
            .map(k => ({ name: k }));
          return { data: files, error: null };
        },
      }),
    },
    removeChannel: () => {},
  };

  const saved = localStorage.getItem('_local_session');
  if (saved) {
    try { currentSession = JSON.parse(saved); } catch {}
  }

  return mockClient;
}

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createLocalClient();
