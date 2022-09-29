import { getHttpClient } from '../utils/commonApi'

export const generateSbom = (config: any, type: string) => {
  const client = getHttpClient(config)
  return client
    .getSbom(config, type)
    .then((res: { statusCode: number; body: any }) => {
      if (res.statusCode === 200) {
        return res.body
      } else {
        console.log('Unable to retrieve Software Bill of Materials (SBOM)')
      }
    })
    .catch((err: any) => {
      console.log(err)
    })
}
