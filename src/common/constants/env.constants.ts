import logger from 'jet-logger';
import { z } from 'zod';

export const NodeEnvs = {
  DEVELOPMENT: 'development',
  TEST: 'test',
  PRODUCTION: 'production',
} as const;
export type NodeEnvs = z.infer<typeof NodeEnvsEnum>;

export const Env = {
  NODE_ENV: process.env.NODE_ENV?.toLowerCase(),
  PORT: Number(process.env.PORT),
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
} as const;

const NodeEnvsEnum = z.enum(NodeEnvs, 'Not a valid node environment');

const EnvSchema = z.object({
  NODE_ENV: NodeEnvsEnum,
  PORT: z.uint32('Express port must be a positive integer'),
  OPENAI_API_KEY: z.string('OpenAI API key is required'),
});

{
  try {
    EnvSchema.parse(Env);
  } catch (err) {
    logger.err(err);
    throw err;
  }
}
