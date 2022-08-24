<template>
  <i v-bind="$attrs"></i>
</template>
<script setup lang="ts">
  import { computed } from 'vue'
  import { iconProps } from './icon'
  import { isUndefined, addUnit } from '@dkt-plus/utils'

  defineOptions({
    name: 'DktIcon',
    inheritAttrs: false
  })

  const props = defineProps(iconProps)

  const style = computed(() => {
    if (!props.size && !props.color) return {}
    return {
      fontSize: isUndefined(props.size) ? undefined : addUnit(props.size),
      '--color': props.color
    }
  })
</script>
<style lang="less" scoped></style>
