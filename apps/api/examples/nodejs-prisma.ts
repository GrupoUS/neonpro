// Node.js example disabled for build to avoid Prisma/Runtime dependencies
export default async function handler(_req: any, res: any) {
  res.status(200).json({
    status: 'ok',
    message: 'NeonPro API - Node.js Prisma example is disabled in this build',
    timestamp: new Date().toISOString(),
  });
}
