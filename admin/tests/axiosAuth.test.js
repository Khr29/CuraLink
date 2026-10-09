import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import axios, { AxiosError } from "axios";

// Exercises the REAL interceptor (src/utils/axiosAuth.js) with real axios;
// only the network adapter is faked. Browser globals the module touches are
// minimal stubs.
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};
globalThis.window = { location: { pathname: "/doctor-dashboard", href: "/doctor-dashboard" } };

const { installAuthInterceptor, registerTokenSetter } = await import("../src/utils/axiosAuth.js");

const BACKEND = "http://backend.test";
const ROLES = [
  { role: "doctor",   header: "dtoken", key: "dToken", refresh: "/api/doctor/refresh-token" },
  { role: "hospital", header: "htoken", key: "hToken", refresh: "/api/hospital/refresh-token" },
  { role: "pharmacy", header: "ptoken", key: "pToken", refresh: "/api/pharmacy/refresh-token" },
  { role: "admin",    header: "atoken", key: "aToken", refresh: "/api/admin/refresh-token" },
];

// Fake server: a token is valid iff it is in `validTokens`. Refresh behaviour is configurable.
let validTokens, refreshCalls, requestLog, refreshImpl, setterCalls;
const respond = (config, status, data) => {
  const response = { status, data, headers: {}, config, statusText: String(status) };
  if (status >= 200 && status < 300) return Promise.resolve(response);
  return Promise.reject(new AxiosError(`Request failed with status code ${status}`, "ERR_BAD_REQUEST", config, null, response));
};
const adapter = async (config) => {
  const path = config.url.replace(BACKEND, "");
  if (path.endsWith("/refresh-token")) {
    refreshCalls.push({ path, withCredentials: config.withCredentials });
    return refreshImpl(config, path);
  }
  const sent = config.headers.toJSON();
  const roleHeaderKeys = Object.keys(sent).filter((k) => /^[dhpa]?token$/i.test(k));
  requestLog.push({ path, sent });
  // "stale duplicate header" guard: exactly one role header may be present
  if (roleHeaderKeys.length !== 1) return respond(config, 400, { message: "dup headers " + roleHeaderKeys });
  return validTokens.has(sent[roleHeaderKeys[0]]) ? respond(config, 200, { success: true }) : respond(config, 401, { success: false });
};

installAuthInterceptor(BACKEND);
axios.defaults.adapter = adapter;
for (const r of ROLES) registerTokenSetter(r.header, (v) => setterCalls.push([r.header, v]));

beforeEach(() => {
  store.clear();
  validTokens = new Set();
  refreshCalls = [];
  requestLog = [];
  setterCalls = [];
  window.location.pathname = "/doctor-dashboard";
  window.location.href = "/doctor-dashboard";
  refreshImpl = (config) => respond(config, 200, { success: true, token: "NEW" });
});

// Doctor call sites in the app use `{ dToken }` (camelCase) as the header key;
// the other roles use lowercase. Both spellings must be recognised.
const spellings = (r) => [r.header, r.key];

for (const r of ROLES) {
  for (const spelling of spellings(r)) {
    test(`${r.role}: expired token sent as "${spelling}" -> silent refresh -> original request retried and succeeds`, async () => {
      store.set(r.key, "OLD");
      validTokens.add("NEW");
      const res = await axios.get(`${BACKEND}/api/x`, { headers: { [spelling]: "OLD" } });
      assert.equal(res.status, 200);
      assert.equal(refreshCalls.length, 1);
      assert.equal(refreshCalls[0].path, r.refresh);
      assert.equal(refreshCalls[0].withCredentials, true, "refresh cookie must be sent");
      assert.equal(store.get(r.key), "NEW", "new token persisted");
      assert.deepEqual(setterCalls, [[r.header, "NEW"]], "React state updated");
      assert.equal(requestLog.length, 2, "original + exactly one retry");
      assert.equal(requestLog[1].sent[Object.keys(requestLog[1].sent).find((k) => k.toLowerCase() === r.header)], "NEW");
      assert.equal(window.location.href, "/doctor-dashboard", "not redirected");
    });
  }
}

test("valid access token: no refresh at all", async () => {
  validTokens.add("GOOD");
  const res = await axios.get(`${BACKEND}/api/x`, { headers: { dToken: "GOOD" } });
  assert.equal(res.status, 200);
  assert.equal(refreshCalls.length, 0);
});

test("invalid/expired refresh cookie: fails safely -> signed out, no raw 401 surfaced", async () => {
  store.set("dToken", "OLD");
  refreshImpl = (config) => respond(config, 401, { success: false, message: "Session expired, please login again" });
  const outcome = await Promise.race([
    axios.get(`${BACKEND}/api/x`, { headers: { dToken: "OLD" } }).then(() => "resolved", () => "rejected"),
    new Promise((r) => setTimeout(() => r("pending"), 150)),
  ]);
  // never rejects (a rejection would trigger the page's own "Request failed with status code 401" toast)
  assert.equal(outcome, "pending");
  assert.equal(refreshCalls.length, 1);
  assert.equal(store.has("dToken"), false, "stored token cleared");
  assert.deepEqual(setterCalls, [["dtoken", ""]], "React auth state cleared");
  assert.equal(window.location.href, "/", "redirected to login");
});

test("concurrent 401s share ONE refresh and all retry successfully", async () => {
  store.set("dToken", "OLD");
  validTokens.add("NEW");
  let release;
  const gate = new Promise((r) => (release = r));
  refreshImpl = async (config) => { await gate; return respond(config, 200, { success: true, token: "NEW" }); };
  const calls = Array.from({ length: 6 }, (_, i) => axios.get(`${BACKEND}/api/x${i}`, { headers: { dToken: "OLD" } }));
  await new Promise((r) => setTimeout(r, 30));
  release();
  const results = await Promise.all(calls);
  assert.ok(results.every((x) => x.status === 200));
  assert.equal(refreshCalls.length, 1, "refresh-token rotation must be hit once, not once per request");
});

test("a late 401 carrying an already-replaced token retries with the newer token, without rotating again", async () => {
  store.set("dToken", "NEWER"); // another request already refreshed
  validTokens.add("NEWER");
  const res = await axios.get(`${BACKEND}/api/x`, { headers: { dToken: "OLD" } });
  assert.equal(res.status, 200);
  assert.equal(refreshCalls.length, 0);
});

test("no auth bypass: a retry that still 401s is rejected, not looped or granted", async () => {
  store.set("dToken", "OLD");
  // refresh "succeeds" but the minted token is not accepted by the server
  refreshImpl = (config) => respond(config, 200, { success: true, token: "STILL-BAD" });
  await assert.rejects(axios.get(`${BACKEND}/api/x`, { headers: { dToken: "OLD" } }), (e) => e.response?.status === 401);
  assert.equal(refreshCalls.length, 1, "no refresh loop");
});

test("requests without a role token (public / patient-style) are untouched: 401 passes through, no refresh", async () => {
  await assert.rejects(axios.get(`${BACKEND}/api/x`, { headers: { somethingelse: "1" } }), () => true);
  assert.equal(refreshCalls.length, 0);
});
