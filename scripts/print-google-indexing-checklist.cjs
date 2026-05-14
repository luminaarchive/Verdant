const checks = [
  "Verify property in Google Search Console.",
  "Submit sitemap URL: https://naliai.vercel.app/sitemap.xml",
  "Inspect homepage URL: https://naliai.vercel.app",
  "Request indexing for the homepage after deployment.",
  "Check coverage and indexing status in Search Console.",
  "After indexing, search: site:naliai.vercel.app",
  "After indexing, search: NaLI wildlife intelligence",
  "After indexing, search: AI identifikasi satwa Indonesia",
  "After indexing, search: aplikasi identifikasi satwa liar",
  "Capture screenshots manually.",
  "Record date/time/query/ranking for every checked query.",
];

console.log("NaLI Google indexing checklist");
console.log("================================");
checks.forEach((check, index) => {
  console.log(`${String(index + 1).padStart(2, "0")}. ${check}`);
});
console.log("");
console.log("No one can guarantee #1 ranking.");
console.log("Proof requires Search Console or live Google result screenshots after indexing.");
