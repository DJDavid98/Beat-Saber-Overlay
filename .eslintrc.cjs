module.exports = {
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:react/recommended', "plugin:react-hooks/recommended"],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'react', 'react-hooks'],
    root: true,
    settings: {
        react: {
            version: "detect",
        },
    },
    rules: {
        'react/react-in-jsx-scope': 'off',
        "no-restricted-imports": "off",
        "@typescript-eslint/no-restricted-imports": ["error", {
            "paths": [{
                "name": "timers",
                "message": "You do not need this import",
                "allowTypeImports": false
            }]
        }]
    }
};
