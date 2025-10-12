'use server';
import { prisma } from '@/lib/prisma';
import CryptoJS from 'crypto-js';
import type { DataSourceType } from '@prisma/client';

const ENC_KEY = process.env.DATASOURCE_ENCRYPTION_KEY!;
if (!ENC_KEY || ENC_KEY.length !== 32) throw new Error('DATASOURCE_ENCRYPTION_KEY must be 32 chars');

const encrypt = (o: any) => CryptoJS.AES.encrypt(JSON.stringify(o), ENC_KEY).toString();

// allowed values mirror Prisma enum DataSourceType in prisma/schema.prisma
const ALLOWED_TYPES = ['POS_SYSTEM', 'ERP', 'DATABASE', 'API', 'FILE_IMPORT', 'CUSTOM'] as const;

export async function createDataSourceServer(orgId: string, type: string, name: string, config: any) {
  if (!ALLOWED_TYPES.includes(type as any)) {
    throw new Error(`Invalid data source type: ${type}. Allowed: ${ALLOWED_TYPES.join(', ')}`);
  }

  // Cast to Prisma enum type for the create call (we validated above)
  const dsType = type as DataSourceType;

  return prisma.dataSource.create({
    data: { orgId, type: dsType, name, config: encrypt(config) },
  });
}