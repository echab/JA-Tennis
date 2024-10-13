// @ts-check
import js from "@eslint/js";
import solid from "eslint-plugin-solid/configs/typescript";
import tsParser from "@typescript-eslint/parser";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
// import tseslint from 'typescript-eslint';
import globals from "globals";

// export default tseslint.config(
export default [
    js.configs.recommended,
    // ...tseslint.configs.recommended,
    // ...tseslint.configs.recommendedTypeChecked,
    {
        ignores: ["**/*.config.js", "**/*.config.ts", "**/.eslintrc.js"],
    },
    {
        files: ["**/*.{ts,tsx}"],
        ...solid,
        languageOptions: {
            parser: tsParser,
            // ecmaVersion: 5,
            // sourceType: "module",
            parserOptions: {
                project: "tsconfig.json",
                // projectService: true,
                // tsconfigRootDir: import.meta.dirname,
            },
            globals: {
                ...globals.browser,
                ...Object.fromEntries(Object.entries(globals.node).map(([key]) => [key, "off"])),
                ...globals.jest,
            },
        },
    },
    {
        plugins: {
            '@typescript-eslint': typescriptEslint,
        },
        rules: {
            "arrow-parens": ["off", "as-needed"],
            "constructor-super": "error",
            curly: "error",
            "dot-notation": "error",
            eqeqeq: "error",
            "guard-for-in": "error",
            "max-classes-per-file": "error",
            "new-parens": "error",
            "no-bitwise": "error",
            "no-caller": "error",
            "no-cond-assign": "error",
            "no-debugger": "error",
            "no-eval": "error",
            "no-inner-declarations": "off",
            "no-labels": "error",

            "no-multiple-empty-lines": ["error", {
                max: 1,
            }],

            "no-new-wrappers": "error",
            "no-throw-literal": "error",
            "no-trailing-spaces": "error",
            "no-unsafe-finally": "error",
            "no-var": "error",
            "prefer-const": "error",

            "space-before-function-paren": ["error", {
                anonymous: "never",
                asyncArrow: "always",
                named: "never",
            }],

            "use-isnan": "error",

            "no-unused-vars": "off",
            "no-redeclare": "off",
            "@typescript-eslint/no-unused-vars": ["error"],
            "@typescript-eslint/no-redeclare": ["error"],

            // // List of [@typescript-eslint rules](https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin#supported-rules)
            // "@typescript-eslint/adjacent-overload-signatures": "error", // grouping same method names
            // "@typescript-eslint/array-type": ["error", {                // string[] instead of Array<string>
            //     "default": "array-simple"
            // }],
            // "@typescript-eslint/ban-types": "error",                    // bans types like String in favor of string
            // "@typescript-eslint/indent": "error",                       // consistent indentation
            // "@typescript-eslint/consistent-type-assertions": "error",   // needed for .tsx, bad = <Foo>bar, good = bar as Foo
            "@typescript-eslint/no-explicit-any": "error",              // don't use :any type
            // "@typescript-eslint/no-misused-new": "error",               // no constructors for interfaces or new for classes
            // "@typescript-eslint/no-parameter-properties": "error",      // no property definitions in class constructors
            // "@typescript-eslint/no-var-requires": "error",              // use import instead of require
            // "@typescript-eslint/prefer-for-of": "error",                // prefer for-of loop over arrays
            // "@typescript-eslint/prefer-namespace-keyword": "error",     // prefer namespace over module in TypeScript
            // "@typescript-eslint/triple-slash-reference": "error",       // ban /// <reference />, prefer imports
            // "@typescript-eslint/type-annotation-spacing": "error"      // consistent space around colon ':'
        },
    }
];