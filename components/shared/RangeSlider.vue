<script setup lang="ts">
import { FONT_SIZE_OPTIONS } from '@/lib/constants'

const props = withDefaults(
   defineProps<{
      initialValue: string
      id?: string
      steps: readonly string[]
   }>(),
   { steps: () => FONT_SIZE_OPTIONS as string[], initialIndex: 0 }
)

const emit = defineEmits<{
   (event: 'change', value: string): void
}>()

const initialIndex = props.steps.indexOf(props.initialValue)

const internalValue = ref(initialIndex === -1 ? 0 : initialIndex)

const computedPercentage = computed(() => (internalValue.value / (props.steps.length - 1)) * 100)

watch(internalValue, (newInternalValue) => {
   emit('change', props.steps[newInternalValue])
})
</script>

<template>
   <div class="Wrapper">
      <span>
         {{ props.steps[internalValue] }}
      </span>
      <input
         :id="id"
         aria-label="Font size"
         class="InputRange"
         type="range"
         min="0"
         :max="steps.length - 1"
         v-model="internalValue"
         :style="`background-size: ${computedPercentage}% 100%;`"
      />
   </div>
</template>

<style scoped>
.Wrapper {
   display: flex;
   flex-wrap: nowrap;
   align-items: center;
   gap: var(--size-2);

   & span {
      width: var(--size-9);
   }
}

.InputRange {
   -webkit-appearance: none;
   flex: 1;
   height: var(--size-1);
   background: var(--divider-color);
   border-radius: var(--radius-max);
   background-image: linear-gradient(var(--accent-color) 0 100%);
   background-repeat: no-repeat;
   transition: box-shadow 100ms var(--easing);

   &::-webkit-slider-thumb {
      @apply --input-range-thumb;

      &:hover {
         box-shadow: var(--ring-outline);
      }
   }

   &::-moz-range-thumb {
      @apply --input-range-thumb;

      &:hover {
         box-shadow: var(--ring-outline);
      }
   }

   &::-webkit-slider-runnable-track {
      @apply --input-range-track;
   }

   &::-moz-range-track {
      @apply --input-range-track;
   }
}
</style>