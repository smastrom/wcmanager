<script setup lang="ts">
const mainRef = ref<HTMLElement | null>(null)
const mainTop = ref<number | undefined>(undefined)

const viewportHeight = CSS.supports('width: 1svh') ? '100svh' : '100vh'

const mainHeight = computed(() =>
   !mainTop.value ? viewportHeight : `calc(${viewportHeight} - ${mainTop.value}px)`
)

function setTop() {
   mainTop.value = mainRef.value?.getBoundingClientRect().top ?? 0
}

onMounted(setTop)
onUpdated(setTop)
</script>

<template>
   <main class="Main" ref="mainRef">
      <slot name="toolbar" />
      <div class="Content">
         <slot name="explorer" />
         <slot name="preview" />
      </div>
   </main>
</template>

<style scoped>
.Main {
   margin: var(--size-4) auto 0 auto;
   padding: var(--size-4);
   border-radius: var(--radius-3) var(--radius-3) 0 0;
   width: var(--container-width);
   max-width: 100%;
   background-color: var(--bg-color);
   height: v-bind(mainHeight);
   display: flex;
   flex-direction: column;
   gap: var(--size-4);

   @media (--size-md) {
      padding: var(--size-3);
      gap: var(--size-3);
   }
}

.Content {
   display: grid;
   grid-template-columns: 1.5fr 1fr;
   overflow: auto;
   gap: var(--size-8);
   overflow: hidden;
   height: 100%;

   @media (--layout-switch) {
      grid-template-columns: 1fr;
   }
}
</style>
