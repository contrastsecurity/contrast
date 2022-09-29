import { getHttpClient } from '../utils/commonApi'
import { getAuth } from '../utils/paramsUtil/paramHandler'
import { AnalyticsOption } from './types'

export const postAnalytics = (data: AnalyticsOption, provider = 'aws') => {
  const config = getAuth()
  const client = getHttpClient(config)
  return client.postAnalyticsFunction(config, provider, data)
}
