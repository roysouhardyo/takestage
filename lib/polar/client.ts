import { Polar } from '@polar-sh/sdk'

export function getPolarClient() {
  const accessToken = process.env.POLAR_ACCESS_TOKEN || ''
  const server = process.env.POLAR_ENVIRONMENT === 'production' ? 'production' : 'sandbox'

  return new Polar({
    accessToken,
    server,
  })
}
