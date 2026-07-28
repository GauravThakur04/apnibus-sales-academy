export function shouldGateOnAuth(state, options = {}) {
  if (!state) return false;
  if (options.requireAuth === false) return false;
  const hasRegistration = Boolean(state.userRegistration || state.googleUser || state.name);
  return !hasRegistration;
}

export function createGuestRegistration(state, fallbackName = "Guest Learner") {
  const safeName = String(fallbackName || state?.name || "Guest Learner").trim() || "Guest Learner";
  const slug = safeName.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.|\.$/g, "") || "guest";

  return {
    name: safeName,
    email: `${slug}@local.apnibus`,
    gender: "Male",
    age: "24",
    location: "Field",
    lang: state?.lang || "Hinglish",
    googleAuth: false,
    guest: true,
    registeredAt: new Date().toISOString()
  };
}

export function resolveAuthBootState(state, options = {}) {
  if (!shouldGateOnAuth(state, options)) {
    return { shouldGate: false, reason: "ready", registration: state?.userRegistration || null };
  }

  return {
    shouldGate: true,
    reason: "guest-fallback",
    registration: createGuestRegistration(state, options.fallbackName || "Guest Learner")
  };
}

if (typeof window !== "undefined") {
  window.ApniBusAuth = {
    shouldGateOnAuth,
    createGuestRegistration,
    resolveAuthBootState
  };
}
