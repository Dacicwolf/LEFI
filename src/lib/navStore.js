// Centralized navigation history store (module-level, persistent across tab switches)
const stacks = {
  Home: ["/"],
  SettingsPage: ["/SettingsPage"],
};

export function getStack(tab) {
  return stacks[tab] ?? ["/"];
}

export function pushToStack(tab, path) {
  if (!stacks[tab]) stacks[tab] = ["/"];
  stacks[tab] = [...stacks[tab], path];
}

export function popFromStack(tab) {
  if (!stacks[tab] || stacks[tab].length <= 1) return null;
  const next = [...stacks[tab]];
  next.pop();
  stacks[tab] = next;
  return next[next.length - 1];
}

export function resetStack(tab, rootPath) {
  stacks[tab] = [rootPath];
}