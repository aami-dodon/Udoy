import prisma from '../../utils/prismaClient.js';
import env from '../../config/env.js';
import minioClient from '../../integrations/minioClient.js';

export async function getHealthStatus(req, res) {
  const checks = {};
  let isHealthy = true;

  try {
    await prisma.healthCheck.count();
    checks.database = { status: 'up' };
  } catch (error) {
    isHealthy = false;
    checks.database = {
      status: 'down',
      message: error.message,
    };
  }

  if (env.minio && minioClient) {
    try {
      const bucketName = env.minio.bucket;
      const bucketExists = bucketName
        ? await minioClient.bucketExists(bucketName)
        : true;

      if (bucketExists) {
        checks.minio = {
          status: 'up',
          bucket: bucketName || null,
        };
      } else {
        isHealthy = false;
        checks.minio = {
          status: 'down',
          bucket: bucketName,
          message: 'Configured bucket not found',
        };
      }
    } catch (error) {
      isHealthy = false;
      checks.minio = {
        status: 'down',
        message: error.message,
      };
    }
  } else {
    checks.minio = {
      status: 'skipped',
      message: 'MinIO not configured',
    };
  }

  const corsStatus = {
    enabled: true,
    allowedOrigins: env.corsAllowedOrigins,
    allowCredentials: true,
  };

  const responsePayload = {
    status: isHealthy ? 'ok' : 'error',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks,
    cors: corsStatus,
  };

  res.status(isHealthy ? 200 : 503).json(responsePayload);
}
