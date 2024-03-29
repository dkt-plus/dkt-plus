<template>
  <div
    v-if="type != 'textarea'"
    class="dkt-input"
    :class="[
      {
        ['dkt-input--' + size]: props.size != 'default',
        'dkt-input--prepend': $slots.prepend,
        'dkt-input--append': $slots.append,
        'is-disabled': props.disabled
      },
      $attrs.class
    ]"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div v-if="$slots.prepend" class="dkt-input__prepend">
      <slot name="prepend" />
    </div>
    <div
      class="dkt-input__wrapper"
      :class="{
        'is-focused': focused
      }"
    >
      <div v-if="$slots.prefix" class="dkt-input__prefix">
        <slot name="prefix" />
      </div>
      <input
        v-bind="$attrs"
        class="dkt-input__inner"
        ref="input"
        :type="props.type"
        :disabled="props.disabled"
        :placeholder="props.placeholder"
        @compositionstart="handleCompositionStart"
        @compositionupdate="handleCompositionUpdate"
        @compositionend="handleCompositionEnd"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @change="handleChange"
        @keydown="handleKeydown"
      />
      <div v-if="suffixVisible" class="dkt-input__suffix">
        <span class="dkt-input__suffix--inner">
          <template v-if="!isWordLimitVisible">
            <slot name="suffix" />
          </template>

          <span v-if="isWordLimitVisible" class="dkt-input__count">
            <span class="dkt-input__count-inner"> {{ textLength }} / {{ attrs.maxlength }} </span>
          </span>
        </span>
      </div>
    </div>
    <div v-if="$slots.append" class="dkt-input__append">
      <slot name="append" />
    </div>
  </div>
  <div class="dkt-textarea" v-else>
    <textarea
      class="dkt-textarea__inner"
      ref="textarea"
      :disabled="props.disabled"
      :placeholder="props.placeholder"
      @compositionstart="handleCompositionStart"
      @compositionupdate="handleCompositionUpdate"
      @compositionend="handleCompositionEnd"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @change="handleChange"
      @keydown="handleKeydown"
      v-bind="$attrs"
    ></textarea>
  </div>
</template>
<script setup lang="ts">
  import { inputProps } from './input'
  import type { TupleToUni, VmodelEvent } from '@dkt-plus/utils'
  import { ref, computed, shallowRef, nextTick, watch, onMounted, useSlots } from 'vue'
  import { isKorean, isNil } from '@dkt-plus/utils'
  import { UPDATE_MODEL_EVENT } from '@dkt-plus/constants'
  import { useAttrs, useCursor } from '@dkt-plus/hooks'

  const isComposing = ref(false)
  const focused = ref(false)
  const hovering = ref(false)

  const attrs = useAttrs()
  const slots = useSlots()

  defineOptions({
    name: 'DktInput'
  })

  type TargetElement = HTMLInputElement | HTMLTextAreaElement

  interface InputEmits {
    (e:"update:modelValue",value:string):void
    (e: 'input', value: string): void
    (e: 'compositionstart', event: CompositionEvent): void
    (e: 'compositionupdate', event: CompositionEvent): void
    (e: 'compositionend', event: CompositionEvent): void
    (e: 'focus', event: FocusEvent): void
    (e: 'blur', event: FocusEvent): void
    (e: 'change', event: string): void
    (e: 'keydown', event: KeyboardEvent): void
    (e: 'mouseleave', event: MouseEvent): void
    (e: 'mouseenter', event: MouseEvent): void
  }
  const props = defineProps(inputProps)

  const input = shallowRef<HTMLInputElement>()
  const textarea = shallowRef<HTMLTextAreaElement>()

  const nativeInputValue = computed(() => (isNil(props.modelValue) ? '' : String(props.modelValue)))

  const _ref = computed(() => input.value || textarea.value)
  const isWordLimitVisible = computed(
    () =>
      props.showWordLimit &&
      !!attrs.value.maxlength &&
      (props.type == 'text' || props.type == 'textarea') &&
      !props.disabled &&
      !props.readonly
  )
  const textLength = computed(() => Array.from(nativeInputValue.value).length)
  const suffixVisible = computed(() => !!slots.suffix || isWordLimitVisible.value)

  const setNativeInputValue = () => {
    const input = _ref.value
    if (!input || input.value === nativeInputValue.value) return
    input.value = nativeInputValue.value
  }

  const emit = defineEmits<InputEmits>()

  const handleInput = async (event: Event) => {
    let { value } = event.target as TargetElement
    if (isComposing.value) return
    emit(UPDATE_MODEL_EVENT, value)
    emit('input', value)
    await nextTick()
    setNativeInputValue()
  }

  const handleCompositionStart = (event: CompositionEvent) => {
    emit('compositionstart', event)
    isComposing.value = true
  }

  const handleCompositionUpdate = (event: CompositionEvent) => {
    emit('compositionupdate', event)
    const text = (event.target as HTMLInputElement)?.value
    const lastCharacter = text[text.length - 1] || ''
    isComposing.value = !isKorean(lastCharacter)
  }

  const handleCompositionEnd = (event: CompositionEvent) => {
    emit('compositionend', event)
    if (!isComposing.value) {
      isComposing.value = false
      handleInput(event)
    }
  }

  const focus = async () => {
    await nextTick()
    _ref.value?.focus()
  }
  const handleFocus = (event: FocusEvent) => {
    focused.value = true
    emit('focus', event)
  }

  const blur = () => _ref.value?.blur()

  const handleBlur = (event: FocusEvent) => {
    focused.value = false
    emit('blur', event)
    // if (props.validateEvent) {
    //   formItem?.validate?.('blur').catch((err) => debugWarn(err))
    // }
  }

  const handleChange = (event: Event) => {
    emit('change', (event.target as TargetElement).value)
  }

  const handleKeydown = (event: KeyboardEvent) => {
    emit('keydown', event)
  }

  const handleMouseLeave = (event: MouseEvent) => {
    hovering.value = false
    emit('mouseleave', event)
  }

  const handleMouseEnter = (event: MouseEvent) => {
    hovering.value = true
    emit('mouseenter', event)
  }

  watch(nativeInputValue, () => setNativeInputValue())

  onMounted(() => {
    setNativeInputValue()
  })

  defineExpose({
    input,
    textarea,
    ref: _ref,
    focus,
    blur
  })
</script>
<style lang="less" scoped>
  @import '../style/index.less';
</style>
