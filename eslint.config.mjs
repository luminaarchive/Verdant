import nextConfig from "eslint-config-next";
import reactHooks from "eslint-plugin-react-hooks";

const eslintConfig = [
  ...nextConfig,
  {
    ignores: [".vercel/**", ".next/**", "node_modules/**", "test-eslint.mjs"]
  },
  {
    plugins: {
      "react-hooks": reactHooks
    },
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "@next/next/no-assign-module-variable": "off",
      "react-hooks/exhaustive-deps": "warn"
    }
  }
];

export default eslintConfig;
