/** @type {import('next').NextConfig} */
module.exports = {
  basePath: process.env.NEXT_PUBLIC_BASE_PATH,
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH,
  output: "export",
  distDir: "build",
};
