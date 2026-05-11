// Global Auth helper
window.Auth = (function(){
  let _profile = null;
  let _initPromise = null;

  async function fetchProfile() {
  try {
    const origin = window.location.origin || '';
    const candidates = [
      '../../backend/get_profile.php',
      origin + '/URDS_Project/backend/get_profile.php',
      origin + '/URDS_Project/backend/get_profile.php',
      origin + '/backend/get_profile.php',
      '/URDS_Project/backend/get_profile.php',
      '/backend/get_profile.php',
      './backend/get_profile.php',
      'backend/get_profile.php'
    ];

    let text = null;
    let tried = [];
    for (const url of candidates) {
      try {
        console.debug('Auth.fetchProfile trying', url);
        let resp;
        try {
          resp = await fetch(url, { credentials: 'include', cache: 'no-store' });
        } catch (e) {
          tried.push({ url, ok: false, reason: e.message });
          continue;
        }

        const contentType = resp.headers.get('content-type') || '';
        const status = resp.status;
        // prefer JSON and successful status
        if (!resp.ok) {
          tried.push({ url, ok: false, status });
          continue;
        }

        const t = await resp.text();
        // If content-type indicates JSON, accept it; otherwise skip HTML pages
        if (contentType.includes('application/json')) {
          text = t;
          tried.push({ url, ok: true, status, contentType });
          break;
        }

        // quick check for HTML (404 page) or non-JSON
        if (t && t.trim().startsWith('<')) {
          tried.push({ url, ok: false, status, reason: 'html' });
          continue;
        }

        // otherwise attempt to parse whatever we got
        text = t;
        tried.push({ url, ok: true, status, contentType });
        break;
      } catch (e) {
        tried.push({ url, ok: false, reason: e.message });
        continue;
      }
    }

    if (!text) {
      console.warn('Auth.fetchProfile: no candidate returned JSON', tried);
      return null;
    }

    // we received text from a candidate
    let data;

    try {
      data = JSON.parse(text);
    } catch {
      console.warn("Auth.fetchProfile: response not JSON", text);
      return null;
    }

    if (data?.status === "success" && data.user) {
      _profile = data.user;
      _profile.fullName =
        _profile.fullName ||
        (_profile.first_name
          ? `${_profile.first_name} ${_profile.last_name || ""}`.trim()
          : "");
      return _profile;
    }

    return null;
  } catch (e) {
    console.warn("Auth.fetchProfile error", e);
    return null;
  }
}


  function ensureInit() {
    if (_initPromise) return _initPromise;
    _initPromise = (async () => {
      if (_profile) return _profile;
      // Try once; if it fails, retry a single time after a small delay
      let p = await fetchProfile();
      if (!p) {
        await new Promise(r => setTimeout(r, 200));
        p = await fetchProfile();
      }
      return p;
    })();
    return _initPromise;
  }

  function getProfile() { return _profile; }

  function requireRole(roles = [], opts = {}) {
    // roles: array of allowed roles
    const profile = getProfile();
    const userRole = (profile?.role) || localStorage.getItem('userRole') || '';
    if (!roles.length) return true;
    if (roles.includes(userRole)) return true;
    // show simple message and redirect if provided
    if (opts.toast) {
      try { window.showToast && window.showToast(opts.message || 'Access denied.', 'error'); } catch(e){}
    } else {
      try { alert(opts.message || 'Access denied.'); } catch(e){}
    }
    if (opts.redirect) setTimeout(() => window.location.href = opts.redirect, opts.delay || 700);
    return false;
  }

  return { ensureInit, fetchProfile, getProfile, requireRole };
})();
