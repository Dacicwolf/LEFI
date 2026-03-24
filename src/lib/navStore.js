// Centralized navigation store — isolated stack + scroll position per tab
const state = {
  Home: { stack: ["/"], scroll: 0 },
  SettingsPage: { stack: ["/SettingsPage"], scroll: 0 },
};

function getState(tab) {
  if (!state[tab]) state[tab] = { stack: ["/"], scroll: 0 };
  return state[tab];
}

export function getStack(tab) {
  return getState(tab).stack;
}

export function pushToStack(tab, path) {
  const s = getState(tab);
  // Avoid duplicate consecutive entries
  if (s.stack[s.stack.length - 1] !== path) {
    s.stack = [...s.stack, path];
    // Keep browser History API in sync so popstate fires on native back
    window.history.pushState({ tab, path }, "", path);
  }
}

export function popFromStack(tab) {
  const s = getState(tab);
  if (s.stack.length <= 1) return null;
  const next = [...s.stack];
  next.pop();
  s.stack = next;
  return next[next.length - 1];
}

export function resetStack(tab, rootPath) {
  getState(tab).stack = [rootPath];
}

export function canGoBack(tab) {
  return getState(tab).stack.length > 1;
}

export function saveScroll(tab, scrollTop) {
  getState(tab).scroll = scrollTop;
}

export function getScroll(tab) {
  return getState(tab).scroll;
}