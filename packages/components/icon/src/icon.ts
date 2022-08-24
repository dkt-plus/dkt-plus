import { buildProps, definePropType } from '@dkt-plus/utils'

export const iconProps = buildProps({
  size: {
    type: definePropType<number | string>([Number, String])
  },
  color: {
    type: String
  }
} as const)
