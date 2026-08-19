// eslint-config-next 16 ships native flat config, so the eslintrc FlatCompat
// shim is no longer needed — running it through the shim throws on a circular
// structure while validating the legacy schema.
import next from "eslint-config-next";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import jsxA11y from "eslint-plugin-jsx-a11y";
import prettierRecommended from "eslint-plugin-prettier/recommended";

const eslintConfig = [
  ...next,
  ...nextCoreWebVitals,
  ...nextTypescript,
  prettierRecommended,
  {
    // eslint-config-next already registers the jsx-a11y plugin, so take the
    // recommended rules without re-registering it.
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,
      "prettier/prettier": "error",
      "react/react-in-jsx-scope": "off",
      "jsx-a11y/alt-text": "warn",
      "jsx-a11y/aria-props": "warn",
      "jsx-a11y/aria-proptypes": "warn",
      "jsx-a11y/aria-unsupported-elements": "warn",
      "jsx-a11y/role-has-required-aria-props": "warn",
      "jsx-a11y/role-supports-aria-props": "warn",
    },
  },
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts"],
  },
];

export default eslintConfig;
