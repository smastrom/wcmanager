<script setup lang="ts">
import { downloadSingleFonts } from '@/lib/fetch'

import ActionButton from './ActionButton.vue'
import ArrowLeftIcon from './icons/ArrowLeftIcon.vue'

import type { DBFontFamilyData } from '@/types/db'

const props = withDefaults(
   defineProps<{
      label: string
      headingCombination: DBFontFamilyData
      bodyCombination: DBFontFamilyData
      accentColor?: string
   }>(),
   {
      accentColor: 'var(--color-primary)'
   }
)

function onHeadlineClick() {
   try {
      downloadSingleFonts(props.headingCombination.family, props.headingCombination.weight)
   } catch (error) {
      //
   }
}

function onBodyClick() {
   try {
      downloadSingleFonts(props.bodyCombination.family, props.bodyCombination.weight)
   } catch (error) {
      //
   }
}
</script>

<template>
   <div class="Bar_Wrapper">
      <h2 class="Bar_Label"><span class="Bar_Label_Tip" />{{ props.label }}</h2>

      <!-- Heading -->

      <div class="Bar_Font_List">
         <div class="Bar_Font">
            <div class="Bar_FontIcon">H</div>
            <div class="Bar_FontFamily">
               {{ props.headingCombination.family }} {{ props.headingCombination.weight }}
            </div>
         </div>

         <ActionButton
            :isActive="false"
            label="Download heading combination"
            @click="onHeadlineClick"
            :activeColor="props.accentColor"
            class="Bar_DownloadButton"
         >
            <ArrowLeftIcon style="rotate: -90deg" />
         </ActionButton>
      </div>

      <!-- Body -->

      <div class="Bar_Font_List">
         <div class="Bar_Font">
            <div class="Bar_FontIcon">P</div>
            <div class="Bar_FontFamily">
               {{ props.bodyCombination.family }} {{ props.bodyCombination.weight }}
            </div>
         </div>

         <ActionButton
            label="Download body combination"
            @click="onBodyClick"
            :activeColor="props.accentColor"
            class="Bar_DownloadButton"
         >
            <ArrowLeftIcon style="rotate: -90deg" />
         </ActionButton>
      </div>
   </div>
</template>

<style scoped>
.Bar_Wrapper {
   display: flex;
   flex-direction: column;
   gap: var(--size-2);
}

.Bar_Label {
   text-transform: uppercase;
   font-size: var(--font-size-0);
   display: flex;
   gap: var(--size-2);
   margin-bottom: var(--size-2);
}

.Bar_Label_Tip {
   width: 3px;
   align-self: stretch;
   background-color: v-bind(props.accentColor);
   border-radius: var(--radius-round);
}

.Bar_Font_List {
   display: flex;
   justify-content: space-between;
   gap: var(--size-4);
}

.Bar_Font {
   display: flex;
   align-items: center;
   gap: var(--size-2);
}
.Bar_FontIcon {
   width: var(--size-6);
   height: var(--size-6);
   border-radius: var(--radius-2);
   display: flex;
   align-items: center;
   line-height: 1;
   justify-content: center;
   user-select: none;
   background-color: var(--bg-elv-color);
   color: var(--fg-body-light-color);
}

.Bar_FontFamily {
   font-weight: 700;
   font-size: var(--font-size-0);
   line-height: 1;

   @media (--size-xs) {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 120px;
   }
}

.Bar_DownloadButton {
   margin-right: var(--size-1);
}
</style>