// Updated ESLint configuration for Phase 1
// Temporarily relaxes some rules while maintaining code quality

module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
  ],
  rules: {
    // Temporarily disable strict any rules for migration
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unsafe-assignment": "warn",
    "@typescript-eslint/no-unsafe-member-access": "warn",
    "@typescript-eslint/no-unsafe-call": "warn",
    "@typescript-eslint/no-unsafe-argument": "warn",
    "@typescript-eslint/no-unsafe-return": "warn",
    
    // Relax unused vars to warning
    "@typescript-eslint/no-unused-vars": ["warn", {
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_",
    }],
    
    // Allow non-null assertions temporarily
    "@typescript-eslint/no-non-null-assertion": "warn",
    
    // Relax template expression rules
    "@typescript-eslint/restrict-template-expressions": "warn",
    
    // Keep these as errors for safety
    "@typescript-eslint/no-misused-promises": "error",
    
    // Import type consistency
    "@typescript-eslint/consistent-type-imports": ["warn", {
      prefer: "type-imports",
      fixStyle: "inline-type-imports",
    }],
  },
};
