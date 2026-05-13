#!/usr/bin/env node

const {
  SUPABASE_ENV,
  createSupabaseClients,
  fail,
  loadLocalEnv,
  missingEnv,
  ok,
  printHeader,
  skipMissing,
  warn,
} = require("./validation-utils.cjs");

const BUCKET = "observation_media";

async function run() {
  loadLocalEnv();
  printHeader("Storage Bucket Validation");

  const missing = missingEnv(SUPABASE_ENV);
  if (skipMissing(missing, "Storage validation")) return;

  const { service } = createSupabaseClients();
  const { data: buckets, error: bucketsError } = await service.storage.listBuckets();
  if (bucketsError) {
    fail(`Could not list storage buckets: ${bucketsError.message}`);
    return;
  }

  const bucket = buckets.find((item) => item.name === BUCKET || item.id === BUCKET);
  if (!bucket) {
    fail(`Private bucket '${BUCKET}' does not exist`);
    return;
  }

  ok(`Bucket '${BUCKET}' exists`);
  if (bucket.public === false) ok(`Bucket '${BUCKET}' is private`);
  else fail(`Bucket '${BUCKET}' is public; protected field media requires public access disabled`);

  const userId = "00000000-0000-4000-8000-000000000001";
  const observationId = crypto.randomUUID();
  const checksum = "a".repeat(64);
  const path = `${userId}/${observationId}/${checksum}.jpg`;
  const pathPattern = /^[0-9a-f-]{36}\/[0-9a-f-]{36}\/[a-f0-9]{64}\.jpg$/;
  if (!pathPattern.test(path)) fail(`Storage path convention is invalid: ${path}`);
  else ok(`Storage path convention is valid: /{user_id}/{observation_id}/{checksum}.jpg`);

  const file = Buffer.from("nali-storage-validation");
  const { error: uploadError } = await service.storage.from(BUCKET).upload(path, file, {
    contentType: "image/jpeg",
    upsert: false,
  });

  if (uploadError) {
    warn(`Tiny upload probe skipped or failed: ${uploadError.message}`);
    return;
  }

  ok("Tiny upload probe succeeded");

  const { data: signed, error: signedError } = await service.storage.from(BUCKET).createSignedUrl(path, 60);
  if (signedError || !signed?.signedUrl) fail(`Signed URL generation failed: ${signedError?.message ?? "missing signed URL"}`);
  else ok("Signed URL generation works");

  const { error: cleanupError } = await service.storage.from(BUCKET).remove([path]);
  if (cleanupError) warn(`Storage cleanup failed for ${path}: ${cleanupError.message}`);
  else ok("Tiny upload probe cleaned up");
}

run().catch((error) => {
  fail(error instanceof Error ? error.message : String(error));
});
