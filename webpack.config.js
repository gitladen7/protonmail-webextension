const path = require("path");
const webpack = require("webpack");
const fs = require("fs");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const env = {};
const vars = fs.readFileSync("./.env").toString().split("\n");
for (const envVar of vars) {
    env[envVar.replace(/=.*$/g, "")] = envVar.replace(/^[^=]*=/g, "");
}

module.exports = (webpackEnv) => {
    webpackEnv = webpackEnv || {};

    return {
        entry: "./src/background/index.ts",
        plugins: [
            new webpack.EnvironmentPlugin(env),
            new CopyWebpackPlugin([{
                from: "node_modules/webextension-polyfill/dist/browser-polyfill.js",
            },
            {
                from: "src/_locales",
                to: "_locales",
            }]),
        ],
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    exclude: /node_modules/,
                    loader: require.resolve("ts-loader"),
                    options: {
                        context: __dirname,
                        configFile: "tsconfig.background.json",
                    },
                },
            ],
        },
        resolve: {
            extensions: [".ts", ".js", ".json"],
        },
        output: {
            filename: "background.js",
            path: path.resolve(__dirname, "build"),
        },
        target: "web",
        devtool: webpackEnv.NODE_ENV === "development" ? "source-map" : undefined,
        watch: webpackEnv.NODE_ENV === "development",
    };
};
