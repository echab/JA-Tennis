module.exports = {
  presets: [
    "@babel/preset-env",
    "babel-preset-solid", // required by DialogInfo.spec.tsx

    // only if you use TS with solid-jest
    "@babel/preset-typescript",
  ],
};
