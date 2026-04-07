import type { ChangelogData } from '../../../.vitepress/theme/composables/useChangelog'
import releasesJson from './releases.json'

export default {
  load(): ChangelogData {
    return releasesJson as unknown as ChangelogData
  },
}
