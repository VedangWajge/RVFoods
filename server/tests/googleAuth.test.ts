import { afterEach, beforeEach, mock, test } from "node:test";
import assert from "node:assert/strict";
import { OAuth2Client } from "google-auth-library";
import { User } from "../src/models/User.js";
import { googleLogin } from "../src/controllers/authController.js";
import { verifyGoogleCredential } from "../src/utils/googleAuth.js";
import { googleLoginSchema } from "../src/validators/authSchemas.js";

const GOOGLE_PAYLOAD = {
  sub: "google-123",
  email: "Asha@Example.com",
  email_verified: true,
  name: "Asha Patil",
};

const mockGoogle = (payload: object | undefined = GOOGLE_PAYLOAD) =>
  mock.method(OAuth2Client.prototype, "verifyIdToken", () =>
    Promise.resolve({ getPayload: () => payload })
  );

const fakeUser = (fields: object = {}): any => ({
  _id: { toString: () => "64b000000000000000000001" },
  name: "Existing Name",
  email: "asha@example.com",
  role: "user",
  isVerified: true,
  saves: 0,
  save() {
    this.saves += 1;
    return Promise.resolve(this);
  },
  ...fields,
});

/** Answers the two lookups the sign-in makes: by Google ID, then by email. */
const mockUsers = ({ byGoogleId = null, byEmail = null }: { byGoogleId?: any; byEmail?: any }) =>
  mock.method(User, "findOne", (filter: Record<string, unknown>) => {
    const found = filter.googleId ? byGoogleId : byEmail;
    const query = Promise.resolve(found) as any;
    query.select = () => Promise.resolve(found);
    return query;
  });

const signIn = (): Promise<any> =>
  new Promise((resolve, reject) => {
    const res = {
      cookies: {} as Record<string, string>,
      statusCode: 200,
      cookie(name: string, value: string) {
        this.cookies[name] = value;
      },
      status(code: number) {
        this.statusCode = code;
        return this;
      },
      json(body: unknown) {
        resolve({ body, cookies: this.cookies, statusCode: this.statusCode });
        return this;
      },
    };
    googleLogin({ body: { credential: "token" } } as never, res as never, reject as never);
  });

beforeEach(() => {
  process.env.GOOGLE_CLIENT_ID = "test-client-id";
  process.env.JWT_SECRET = "test-secret";
  process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
});

afterEach(() => mock.restoreAll());

test("a new Google user gets a verified account and a session", async () => {
  mockGoogle();
  mockUsers({});
  const create = mock.method(User, "create", (data: any) =>
    Promise.resolve(fakeUser({ ...data }))
  );

  const { body, cookies } = await signIn();

  assert.deepEqual(create.mock.calls[0].arguments[0], {
    name: "Asha Patil",
    email: "asha@example.com",
    googleId: "google-123",
    isVerified: true,
  });
  assert.equal(body.success, true);
  assert.ok(body.data.accessToken);
  assert.equal(body.data.user.email, "asha@example.com");
  assert.ok(cookies.refreshToken, "same session cookie as email login");
});

test("a returning Google user signs in to the same account", async () => {
  mockGoogle();
  const user = fakeUser({ googleId: "google-123", role: "admin" });
  mockUsers({ byGoogleId: user });
  const create = mock.method(User, "create", () => Promise.resolve({}));

  const { body } = await signIn();

  assert.equal(create.mock.callCount(), 0);
  assert.equal(body.data.user.role, "admin");
});

test("signing in with Google links a verified email account and keeps its password", async () => {
  mockGoogle();
  const user = fakeUser({ password: "hashed-password", role: "admin" });
  mockUsers({ byEmail: user });

  const { body } = await signIn();

  assert.equal(user.googleId, "google-123");
  assert.equal(user.password, "hashed-password");
  assert.equal(body.data.user.role, "admin", "an admin stays an admin");
});

test("an unverified account's password is removed, so whoever set it loses access", async () => {
  mockGoogle();
  const user = fakeUser({
    isVerified: false,
    password: "attacker-password",
    emailOtpHash: "otp",
    emailOtpExpires: new Date(),
    passwordResetTokenHash: "reset",
    passwordResetExpires: new Date(),
  });
  mockUsers({ byEmail: user });

  await signIn();

  assert.equal(user.password, undefined);
  assert.equal(user.emailOtpHash, undefined);
  assert.equal(user.passwordResetTokenHash, undefined);
  assert.equal(user.isVerified, true);
  assert.equal(user.googleId, "google-123");
});

test("an email already linked to another Google account is refused", async () => {
  mockGoogle();
  mockUsers({ byEmail: fakeUser({ googleId: "someone-else" }) });

  await assert.rejects(signIn(), { statusCode: 409 });
});

test("a Google account with an unverified email is refused", async () => {
  mockGoogle({ ...GOOGLE_PAYLOAD, email_verified: false });
  const find = mockUsers({});

  await assert.rejects(signIn(), { statusCode: 400, message: /isn't verified/ });
  assert.equal(find.mock.callCount(), 0);
});

test("the credential must have been issued for this site", async () => {
  const verify = mockGoogle();

  await verifyGoogleCredential("token");

  assert.deepEqual(verify.mock.calls[0].arguments[0], {
    idToken: "token",
    audience: "test-client-id",
  });
});

test("a forged credential is refused by the real Google library", async () => {
  mockUsers({});
  await assert.rejects(verifyGoogleCredential("not-a-real-token"), {
    statusCode: 400,
    message: /sign-in failed/,
  });
});

test("failures don't use 401, which would trigger the client's session refresh", async () => {
  mock.method(OAuth2Client.prototype, "verifyIdToken", () =>
    Promise.reject(new Error("bad signature"))
  );
  await assert.rejects(verifyGoogleCredential("token"), { statusCode: 400 });
});

test("a missing Client ID says unavailable rather than crashing", async () => {
  delete process.env.GOOGLE_CLIENT_ID;
  await assert.rejects(verifyGoogleCredential("token"), { statusCode: 503 });
});

test("a name is filled in when Google doesn't send one", async () => {
  mockGoogle({ sub: "1", email: "asha@example.com", email_verified: true });
  assert.equal((await verifyGoogleCredential("token")).name, "asha");
});

test("the request must include a credential", () => {
  assert.equal(googleLoginSchema.safeParse({}).success, false);
  assert.equal(googleLoginSchema.safeParse({ credential: "" }).success, false);
  assert.equal(googleLoginSchema.safeParse({ credential: "token" }).success, true);
});
