<script setup lang="ts">
import { useStore } from '@/lib/store'
import { injectEditorFonts } from '@/lib/injectFonts'
import { randomID, reloadPage } from '@/lib/utils'
import { useViewport } from '@/lib/useViewport'

import HorizontalSpinnerIcon from './icons/HorizontalSpinnerIcon.vue'
import SpinnerIcon from '@/components/shared/icons/SpinnerIcon.vue'
import EditorExplorerEntry from './EditorExplorerEntry.vue'

import type { AppFont } from '@/types/store'

const store = useStore()
const { isMatch: isMobile } = useViewport('1100px')

const explorerFonts = shallowRef<AppFont[]>(store.editor.activeFontsComputed.slice(0, 15))
const previewText = ref('')

/* UI */

const isFetchingAdditionalFonts = ref(false)
const isFetchError = ref(false)

/* Intersection Observer */

let intersectionObserver: IntersectionObserver

const rootRef = ref<HTMLDivElement | null>(null)
const sentinelRef = ref<HTMLDivElement | null>(null)

/* Refresh Fetch */

watch(
   () => store.editor.activeFontsComputed,
   async (newValue) => {
      try {
         store.editor.actions.setIsLoadingAllFonts(true)

         const first15Fonts = newValue.slice(0, 15)
         await injectEditorFonts(first15Fonts)

         explorerFonts.value = first15Fonts
      } catch (error) {
         isFetchError.value = true
      } finally {
         store.editor.actions.setIsLoadingAllFonts(false)
         rootRef.value?.scrollTo({ top: 0 })
      }
   }
)

/* Intersection Observer Fetch */

onMounted(() => {
   intersectionObserver = new IntersectionObserver(
      async ([{ isIntersecting }]) => {
         if (explorerFonts.value.length > 0 && !store.editor.isLoadingAllFonts && isIntersecting) {
            try {
               isFetchingAdditionalFonts.value = true

               const next10Fonts = store.editor.activeFontsComputed.slice(
                  explorerFonts.value.length,
                  explorerFonts.value.length + 10
               )

               await injectEditorFonts(next10Fonts)

               explorerFonts.value = explorerFonts.value.concat(next10Fonts)
            } catch (error) {
               isFetchError.value = true
            } finally {
               isFetchingAdditionalFonts.value = false
            }
         }
      },
      { root: rootRef.value, rootMargin: '-200px 0px 600px 0px', threshold: 0.8 }
   )

   if (!sentinelRef.value) return
   intersectionObserver.observe(sentinelRef.value)
})

onBeforeUnmount(() => intersectionObserver?.disconnect())

const ariaProps = {
   ariaAtomic: 'true',
   ariaLive: 'polite',
   role: 'status'
}

const previewTextId = randomID()
</script>

<template>
   <section class="Explorer_Wrapper" ref="rootRef">
      <!-- Preview Text -->
      <label :for="previewTextId" class="Global_VisuallyHidden">Email</label>
      <input
         :id="previewTextId"
         type="text"
         placeholder="Preview some text..."
         v-model="previewText"
         class="Global_InputField Explorer_InputField"
      />

      <div v-if="store.editor.isLoadingAllFonts && !isFetchError" class="InitialSpinner_Wrapper">
         <SpinnerIcon width="100px" />
         <div class="Global_VisuallyHidden" v-bind="ariaProps">Loading additional fonts...</div>
      </div>

      <div>
         <!-- Preview -->

         <ul
            v-if="explorerFonts.length > 0 && !store.editor.isLoadingAllFonts"
            class="Explorer_List"
         >
            <EditorExplorerEntry
               v-for="font in explorerFonts"
               :isMobile="isMobile"
               :key="font.family"
               :appWeights="font.appWeights"
               :familyName="font.family"
               :previewText="previewText"
            />
         </ul>

         <div v-if="explorerFonts.length === 0 && !store.editor.isLoadingAllFonts">
            <h2 class="Explorer_NoResults" v-bind="ariaProps">
               No results matched your search. Please try again.
            </h2>
         </div>

         <div ref="sentinelRef" />

         <HorizontalSpinnerIcon
            v-if="isFetchingAdditionalFonts && !isFetchError"
            width="80px"
            class="HorizontalSpinner_Wrapper"
         />

         <!-- No results -->

         <div v-if="isFetchError" class="FetchError_Wrapper">
            <h2>There was an error with Google servers.</h2>
            <button @click="reloadPage" class="Global_ActionButton">Reload Page</button>
         </div>
      </div>
   </section>
</template>

<style scoped>
.Explorer_Wrapper {
   overflow: auto;
   position: relative;
   display: flex;
   flex-direction: column;
   height: 100%;
}

.Explorer_InputField {
   width: 100%;
   position: sticky;
   top: 0;
   z-index: 5;
   box-shadow: 0 0 0 var(--size-3) var(--bg-color);
}

.Explorer_NoResults {
   margin-top: var(--size-6);
}

.InitialSpinner_Wrapper {
   display: flex;
   justify-content: center;
   align-items: center;
   height: 100%;
}

.HorizontalSpinner_Wrapper {
   margin-bottom: var(--size-6);

   @media (--size-lg) {
      margin-bottom: var(--size-2);
   }
}

.FetchError_Wrapper {
   display: flex;
   flex-direction: column;
   gap: var(--size-3);
   padding-bottom: var(--size-6);

   & h2 {
      font-size: var(--font-size-3);
      font-weight: 700;
   }

   & button {
      width: max-content;
   }
}
</style>
