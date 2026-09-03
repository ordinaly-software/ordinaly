import next from "eslint-config-next/core-web-vitals";

// `eslint-config-next/core-web-vitals` is a flat-config array that already bundles
// the base Next rules, `next/typescript`, core-web-vitals, and the default ignores.
const eslintConfig = [
  ...next,
  {
    rules: {
      // eslint-config-next@16 ships eslint-plugin-react-hooks@6, which promotes a
      // batch of new advisory/perf-hint rules to "error". The existing codebase
      // predates them; keep them visible as warnings rather than failing lint on
      // patterns that were valid under the prior toolchain.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
    },
  },
];

export default eslintConfig;
