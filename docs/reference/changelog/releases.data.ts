import type { ChangelogData } from '../../../.vitepress/theme/composables/useChangelog'
import releasesJson from './releases.json'

declare const data: ChangelogData
export { data }

export default {
  load(): ChangelogData {
    return releasesJson as unknown as ChangelogData
  },
}
