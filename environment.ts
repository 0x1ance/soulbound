import { cleanEnv, str } from 'envalid'
import Dotenv from 'dotenv'
Dotenv.config({ path: `.env.${process.env.NODE_ENV}` })

export const isProduction = process.env.NODE_ENV === 'production'

export const env = cleanEnv(process.env, {
  NODE_ENV: str({ default: 'development' }),
  INFURA_API_KEY: str({ default: '' }),
  ROOT_WALLET_PRIVATE_KEY: str({ default: '' }),
  ROOT_WALLET_ADDRESS: str({ default: '' }),
})
