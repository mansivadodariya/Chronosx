'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

let cachedVisibleTabs = null;
let fetchPromise = null;
const listeners = new Set();

export function normalizeTabName(name) {
  return (name || '').toLowerCase().trim();
}

export function checkPermissionInSet(set, tabName) {
  if (!set || set.size === 0) return true;
  const target = normalizeTabName(tabName);
  
  if (target === 'subscription plans' || target === 'plans' || target === 'pricing') {
    return (
      set.has('subscription plans') ||
      set.has('subscription_plans') ||
      set.has('plans') ||
      set.has('pricing') ||
      set.has('subscription')
    );
  }

  return set.has(target);
}

export function getVisibleTabNamesSync() {
  if (cachedVisibleTabs) return cachedVisibleTabs;
  if (typeof window !== 'undefined') {
    try {
      const stored = sessionStorage.getItem('visible_tab_names');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          cachedVisibleTabs = new Set(parsed.map(normalizeTabName));
          return cachedVisibleTabs;
        }
      }
    } catch { /* ignore */ }
  }
  return null;
}

export async function fetchVisibleTabNames() {
  if (cachedVisibleTabs) return cachedVisibleTabs;

  if (typeof window !== 'undefined') {
    try {
      const stored = sessionStorage.getItem('visible_tab_names');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          cachedVisibleTabs = new Set(parsed.map(normalizeTabName));
          return cachedVisibleTabs;
        }
      }
    } catch { /* ignore */ }
  }

  if (fetchPromise) return fetchPromise;

  fetchPromise = (async () => {
    try {
      if (supabase) {
        const { data, error } = await supabase.rpc('get_visible_dashboard_tabs');
        if (!error && Array.isArray(data)) {
          const names = new Set(
            data.map(t => normalizeTabName(typeof t === 'string' ? t : (t?.name || t?.tab_name || '')))
          );
          cachedVisibleTabs = names;
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('visible_tab_names', JSON.stringify([...names]));
          }
          listeners.forEach(fn => fn(cachedVisibleTabs));
        }
      }
    } catch (e) {
      console.warn("Failed to fetch visible tab names:", e);
    } finally {
      fetchPromise = null;
    }
    return cachedVisibleTabs;
  })();

  return fetchPromise;
}

export function useTabPermission(tabName) {
  const [isAllowed, setIsAllowed] = useState(() => {
    if (typeof window === 'undefined') return true;
    try {
      if (cachedVisibleTabs) {
        return checkPermissionInSet(cachedVisibleTabs, tabName);
      }
      const stored = sessionStorage.getItem('visible_tab_names');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const set = new Set(parsed.map(normalizeTabName));
          return checkPermissionInSet(set, tabName);
        }
      }
    } catch { /* ignore */ }
    return true;
  });

  useEffect(() => {
    let isMounted = true;
    const update = (set) => {
      if (!isMounted || !set) return;
      setIsAllowed(checkPermissionInSet(set, tabName));
    };

    listeners.add(update);
    fetchVisibleTabNames().then(set => {
      if (set && isMounted) update(set);
    });

    return () => {
      isMounted = false;
      listeners.delete(update);
    };
  }, [tabName]);

  return isAllowed;
}
