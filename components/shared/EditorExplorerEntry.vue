<script setup lang="ts">
import RangeSlider from './RangeSlider.vue'
import ActionButton from './ActionButton.vue'
import ArrowLeftIcon from './icons/ArrowLeftIcon.vue'

import { downloadSingleFonts } from '@/lib/fetch'
import { FONT_SIZE_OPTIONS, DEFAULT_FONTS, DEFAULT_WEIGHTS } from '@/lib/constants'
import { ExplorerFonts } from '@/lib/getExplorerFonts'
import { useStore } from '@/lib/store'
import { AppFontWeights, StoreEditorFontSizes } from '@/types/store'

const props = defineProps<{
   cssWeights: ExplorerFonts['cssWeights']
   familyName: string
   isMobile: boolean
}>()

const store = useStore()

/* UI */

const isMobile = toRef(props, 'isMobile')
const isActionBarActive = ref(isMobile.value)

const internalWeight = ref(props.cssWeights[0])
const internalSize = ref(store.editor.globalFontSize)

/* Watchers */

watch(
   () => store.editor.globalFontSize,
   (newValue) => {
      internalSize.value = newValue
   }
)

/* Computed */

// Preview

const fontPreviewName = computed(() =>
   props.cssWeights.length === 1 ? props.familyName : `${props.familyName} ${internalWeight.value}`
)

const isPreviewHeadingActive = computed(
   () =>
      store.preview.headlineFont.family === props.familyName &&
      store.preview.headlineFont.weight === internalWeight.value
)

const isPreviewBodyActive = computed(
   () =>
      store.preview.bodyFont.family === props.familyName &&
      store.preview.bodyFont.weight === internalWeight.value
)

// Assign

const isAssignedHeadlineFont = computed(() => {
   if (!store.editor.assignedHeadlineFont) return true
   return (
      store.editor.assignedHeadlineFont.family === props.familyName &&
      store.editor.assignedHeadlineFont.weight === internalWeight.value
   )
})

const isAssignedBodyFont = computed(() => {
   if (!store.editor.assignedBodyFont) return true
   return (
      store.editor.assignedBodyFont.family === props.familyName &&
      store.editor.assignedBodyFont.weight === internalWeight.value
   )
})

/* Actions */

function onFontWeightChange(value: string) {
   internalWeight.value = value as AppFontWeights
}

function onFontSizeChange(value: string) {
   internalSize.value = value as StoreEditorFontSizes
}

// Preview

function onPreviewHeadingClick() {
   store.preview.actions.setHeadlineFont({
      family: isPreviewHeadingActive.value ? DEFAULT_FONTS.headline : props.familyName,
      weight: isPreviewHeadingActive.value ? DEFAULT_WEIGHTS.headline : internalWeight.value
   })
}

function onPreviewBodyClick() {
   store.preview.actions.setBodyFont({
      family: isPreviewBodyActive.value ? DEFAULT_FONTS.headline : props.familyName,
      weight: isPreviewBodyActive.value ? DEFAULT_WEIGHTS.body : internalWeight.value
   })
}

// Assign

async function onAssignHeadingClick() {
   try {
      await nextTick()
      store.editor.actions.saveFontToDB('headline', {
         family: isAssignedHeadlineFont.value ? DEFAULT_FONTS.headline : props.familyName,
         weight: isAssignedHeadlineFont.value ? DEFAULT_WEIGHTS.headline : internalWeight.value
      })
   } catch (error) {
      // If there's an error we'll see it in the header and that's it, prev values will be kept
   }
}

async function onAssignBodyClick() {
   try {
      await nextTick()
      await store.editor.actions.saveFontToDB('body', {
         family: isAssignedBodyFont.value ? DEFAULT_FONTS.body : props.familyName,
         weight: isAssignedBodyFont.value ? DEFAULT_WEIGHTS.body : internalWeight.value
      })
   } catch (error) {
      // Same
   }
}

// Download

async function onDownloadClick() {
   try {
      await downloadSingleFonts(props.familyName, internalWeight.value)
   } catch (error) {
      // Same
   }
}

/* Events */

let activeTimeout: NodeJS.Timeout

function onPointerEnter() {
   clearTimeout(activeTimeout)

   activeTimeout = setTimeout(() => {
      isActionBarActive.value = true
      clearTimeout(activeTimeout)
   }, 300)
}

function onPointerLeave() {
   isActionBarActive.value = false
   clearTimeout(activeTimeout)
}

const pointerEvents = computed(() => {
   if (isMobile.value) return {}
   return {
      onpointerenter: onPointerEnter,
      onpointerleave: onPointerLeave
   }
})

/* Styles */

const commonRangeStyles = {
   width: 'var(--size-11)',
   fontSize: 'var(--font-size-0)'
}
</script>

<template>
   <article class="Entry_Wrapper" v-bind="pointerEvents">
      <Transition name="ActionBar_Fade">
         <nav class="ActionBar_Wrapper" v-if="(isActionBarActive && !isMobile) || isMobile">
            <!-- Font Controls  -->

            <div class="ActionBar_Controls">
               <!-- Font Size -->

               <RangeSlider
                  v-bind="commonRangeStyles"
                  :steps="FONT_SIZE_OPTIONS"
                  :initialValue="internalSize"
                  @change="onFontSizeChange"
               />

               <!-- Font Weight -->

               <RangeSlider
                  v-bind="commonRangeStyles"
                  v-if="props.cssWeights.length > 1"
                  :steps="props.cssWeights"
                  :initialValue="internalWeight"
                  @change="onFontWeightChange"
               />
            </div>

            <!-- Right Actions -->

            <div class="ActionBar_Buttons_Wrapper">
               <!-- Update Preview -->

               <div class="ActionBar_Buttons" role="group">
                  <div class="ActionBar_Buttons_Title">Preview</div>

                  <ActionButton
                     :isActive="isPreviewHeadingActive"
                     activeColor="var(--accent-color)"
                     label="Toggle headline text preview"
                     @click="onPreviewHeadingClick"
                  >
                     H
                  </ActionButton>

                  <ActionButton
                     :isActive="isPreviewBodyActive"
                     activeColor="var(--accent-color)"
                     label="Toggle body text preview"
                     @click="onPreviewBodyClick"
                  >
                     P
                  </ActionButton>
               </div>

               <!-- Assign Font -->

               <div class="ActionBar_Buttons" role="group">
                  <div class="ActionBar_Buttons_Title">Assign</div>
                  <ActionButton
                     :isActive="isAssignedHeadlineFont"
                     activeColor="var(--success-color)"
                     label="Toggle headline combination"
                     @click="onAssignHeadingClick"
                  >
                     H
                  </ActionButton>

                  <ActionButton
                     :isActive="isAssignedBodyFont"
                     label="Toggle body combination"
                     activeColor="var(--success-color)"
                     @click="onAssignBodyClick"
                  >
                     P
                  </ActionButton>
               </div>

               <span class="ActionBar_Buttons_Divider" />

               <!-- Download -->

               <ActionButton
                  :isActive="false"
                  label="Download font"
                  activeColor="var(--accent-color)"
                  @click="onDownloadClick"
               >
                  <ArrowLeftIcon class="ActionBar_Buttons_ArrowIcon" />
               </ActionButton>
            </div>
         </nav>
      </Transition>

      <!-- Font Preview -->

      <div class="Entry_Text">
         <h2>
            {{ fontPreviewName }}
         </h2>
         <div
            contenteditable="true"
            class="Entry_Text_ContentEditable"
            :style="{
               'font-family': props.familyName,
               'font-weight': internalWeight,
               'font-size': internalSize,
               'line-height': 1.15
            }"
         >
            {{ props.familyName }}
         </div>
      </div>
   </article>
</template>

<style scoped>
.Entry_Wrapper {
   --border: var(--border-size-1) solid var(--divider-color);

   position: relative;
   padding: var(--size-8) 0;
   display: flex;
   flex-direction: column;
   grid-gap: 1rem;
   border-bottom: var(--border);

   &:last-of-type {
      border-bottom: none;
   }

   @media (--size-lg) {
      padding: var(--size-10) 0 var(--size-8) 0;
   }

   @media (--size-md) {
      padding: var(--size-9) 0 var(--size-4) 0;
   }
}

.Entry_Text {
   padding: var(--size-2) 0 var(--size-2) var(--size-3);
   border-left: 3px solid var(--divider-color);
   display: flex;
   flex-direction: column;
   gap: var(--size-3);

   & h2 {
      color: var(--fg-body-light-color);
      font-weight: 700;
   }
}

.Entry_Text_ContentEditable {
   overflow: hidden;
   white-space: initial;
   word-break: break-all;

   &:focus {
      outline: none;
   }
}

.ActionBar_Fade-enter-active,
.ActionBar_Fade-leave-active {
   transition: opacity 150ms var(--easing);
}

.ActionBar_Fade-enter-from,
.ActionBar_Fade-leave-to {
   opacity: 0;
}

.ActionBar_Wrapper {
   position: absolute;
   top: 0;
   display: flex;
   justify-content: space-between;
   width: 100%;
   padding: var(--size-3) 20px var(--size-3) 0;
   overflow: auto;
   align-items: center;

   @media (--size-lg) {
      gap: var(--size-5);
   }
}

.ActionBar_Buttons_Wrapper {
   display: flex;
   gap: var(--size-3);
   align-items: center;
}

.ActionBar_Buttons_Divider {
   width: 1px;
   height: 100%;
   background-color: var(--divider-color);
}

.ActionBar_Buttons_ArrowIcon {
   transform: rotate(-90deg);
   stroke: var(--bg-color);
}

.ActionBar_Buttons_Title {
   font-size: var(--font-size-0);
}

.ActionBar_Controls {
   height: fit-content;
   display: flex;
   gap: var(--size-4);
}

.ActionBar_Buttons {
   display: flex;
   gap: var(--size-2);
   align-items: center;
}
</style>