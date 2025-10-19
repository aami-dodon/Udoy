import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { newEnforcer } from 'casbin';
import logger from '../../utils/logger.js';

let enforcerPromise = null;

function resolveCasbinPath(filename) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  return path.join(__dirname, filename);
}

async function createEnforcer() {
  const modelPath = resolveCasbinPath('model.conf');
  const policyPath = resolveCasbinPath('policy.csv');

  const enforcer = await newEnforcer(modelPath, policyPath);
  logger.info('Casbin enforcer initialized with file policy');
  return enforcer;
}

export default async function getEnforcer() {
  if (!enforcerPromise) {
    enforcerPromise = createEnforcer().catch((error) => {
      enforcerPromise = null;
      logger.error('Failed to initialize Casbin enforcer', {
        error: error.message,
      });
      throw error;
    });
  }

  return enforcerPromise;
}
