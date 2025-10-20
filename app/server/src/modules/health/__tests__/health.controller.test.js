import { jest } from '@jest/globals';

const createResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('getHealthStatus', () => {
  let mockPrisma;
  let mockBucketExists;
  let mockGetMinioClient;
  let mockGetMinioBucket;
  let mockIsMinioConfigured;
  let mockEnv;
  let getHealthStatus;

  const importController = async () => {
    jest.resetModules();

    mockPrisma = { healthCheck: { count: jest.fn() } };
    mockBucketExists = jest.fn();
    mockGetMinioClient = jest.fn(() => ({ bucketExists: mockBucketExists }));
    mockGetMinioBucket = jest.fn(() => 'test-bucket');
    mockIsMinioConfigured = jest.fn(() => true);
    mockEnv = {
      apiPrefix: '/api',
      corsAllowedOrigins: ['http://localhost:6004'],
      minio: { bucket: 'test-bucket' },
    };

    jest.unstable_mockModule('../../../config/env.js', () => ({
      default: mockEnv,
    }));

    jest.unstable_mockModule('../../../utils/prismaClient.js', () => ({
      default: mockPrisma,
    }));

    jest.unstable_mockModule('../../../integrations/minio/index.js', () => ({
      getMinioClient: mockGetMinioClient,
      getMinioBucket: mockGetMinioBucket,
      isMinioConfigured: mockIsMinioConfigured,
    }));

    ({ getHealthStatus } = await import('../health.controller.js'));
  };

  beforeEach(async () => {
    await importController();
  });

  it('returns a healthy response when dependencies are available', async () => {
    mockPrisma.healthCheck.count.mockResolvedValue(1);
    mockBucketExists.mockResolvedValue(true);

    const res = createResponse();

    await getHealthStatus({} , res);

    expect(res.status).toHaveBeenCalledWith(200);
    const payload = res.json.mock.calls[0][0];
    expect(payload.status).toBe('ok');
    expect(payload.checks.database).toEqual({ status: 'up' });
    expect(payload.checks.minio).toMatchObject({ status: 'up', bucket: 'test-bucket' });
  });

  it('reports degraded dependencies and responds with 503 when checks fail', async () => {
    mockPrisma.healthCheck.count.mockRejectedValue(new Error('database offline'));
    mockEnv.minio = null;
    mockIsMinioConfigured.mockReturnValue(false);
    mockGetMinioBucket.mockReturnValue(undefined);

    const res = createResponse();

    await getHealthStatus({}, res);

    expect(res.status).toHaveBeenCalledWith(503);
    const payload = res.json.mock.calls[0][0];
    expect(payload.status).toBe('error');
    expect(payload.checks.database.status).toBe('down');
    expect(payload.checks.minio.status).toBe('skipped');
  });
});
