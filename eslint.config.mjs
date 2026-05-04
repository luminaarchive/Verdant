import nextConfig from "eslint-config-next";

const eslintConfig = [
  ...nextConfig,
  {
    ignores: [".vercel/**", ".next/**", "node_modules/**", "test-eslint.mjs"]
  },
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "@next/next/no-assign-module-variable": "off",
      "react-hooks/exhaustive-deps": "warn"
    }
  }
];

export default eslintConfig;
