<script setup lang="ts" generic="T extends string">
import { randomID } from '@/lib/utils'

defineProps<{
   isDisabled: boolean
   options: readonly {
      label: string
      value: T
   }[]
   modelValue: T
}>()

const emit = defineEmits<{
   (event: 'update:modelValue', value: T): void
}>()

function onInput(event: Event) {
   emit('update:modelValue', (event.target as HTMLInputElement).value as T)
}

const randomName = randomID()
</script>

<template>
   <div class="Wrapper">
      <label
         :data-radiogroup-disabled="isDisabled"
         class="Label"
         v-for="option in options"
         :key="option.value"
         :for="`${randomName}_${option.value}`"
      >
         <span class="Circle" :data-circle="modelValue === option.value" aria-hidden="true" />
         <input
            :disabled="isDisabled"
            class="Global_VisuallyHidden"
            :id="`${randomName}_${option.value}`"
            :name="randomName"
            type="radio"
            :value="option.value"
            @input="onInput"
            :checked="modelValue === option.value"
         />
         <span>{{ option.label }}</span>
      </label>
   </div>
</template>

<style scoped>
.Wrapper {
   display: flex;
   flex-wrap: nowrap;
   align-items: center;
   gap: var(--size-3);
}

.Label {
   user-select: none;
   white-space: nowrap;
   display: flex;
   gap: var(--size-2);
   cursor: pointer;
   align-items: center;
   transition: opacity 100ms var(--easing);

   &[data-radiogroup-disabled='true'] {
      @apply --field-loading-effect;
   }

   &:hover > .Circle {
      background-color: var(--accent-color);
   }
}

.Circle {
   display: flex;
   width: var(--size-3);
   height: var(--size-3);
   border-radius: var(--radius-round);
   background-color: var(--divider-color);
   box-shadow: inset 0 0 0 3px var(--bg-color), 0 0 0 2px var(--divider-color);
   transition: all 100ms var(--easing);

   &[data-circle='true'] {
      background-color: var(--accent-color);
      box-shadow: var(--ring-outline);
   }
}
</style>
