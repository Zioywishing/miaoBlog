module.exports = {
  apps: [
    {
      name: "miaoBlog",
      script: "./server/index.mjs",
      // interpreter: "bun", // Bun interpreter
      env: {
        NITRO_PORT: 7058,
        // PATH: `${process.env.HOME}/.bun/bin:${process.env.PATH}`, // Add "~/.bun/bin/bun" to PATH
      },
    },
  ],
};
