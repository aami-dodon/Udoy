import { prisma } from '../../config/database.js';

export const listSettings = () => prisma.systemSetting.findMany();

export const upsertSetting = (key, value, description) =>
  prisma.systemSetting.upsert({
    where: { key },
    update: { value, description },
    create: { key, value, description },
  });

export const deleteSetting = (key) => prisma.systemSetting.delete({ where: { key } });
