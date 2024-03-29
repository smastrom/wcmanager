<script setup lang="ts">
import { formatDistanceToNow } from 'date-fns'
import { useStore } from '@/lib/store'
import { db } from '@/lib/db'
import { downloadSingleFonts } from '@/lib/fetch'
import { reloadPage } from '@/lib/utils'

import type { DBCombination } from '@/types/db'

const props = defineProps<{
   combination: DBCombination
}>()

const store = useStore()
const router = useRouter()
const route = useRoute()

// Computed

const headlineFamilyDescription = computed(() => {
   const { family, weight } = props.combination.headline
   return `${family} ${weight}`
})

const bodyFamilyDescription = computed(() => {
   const { family, weight } = props.combination.body
   return `${family} ${weight}`
})

const isActive = computed(() => store.preview.activeId === props.combination.id)

// Events

const isDeleteDisabled = ref(false)
const isDownloadDisabled = ref(false)

async function onDelete(id: string) {
   try {
      isDeleteDisabled.value = true

      if (!store.combinations.data.value) return

      const newCombinations = store.combinations.data.value.filter((entry) => entry.id !== id)
      // If deleting last combination
      if (newCombinations.length === 0) {
         await router.replace({ query: {} }) // Remove query
         await db.remove(id) // Delete it from DB, do not update the UI

         reloadPage() // Route guard will send to first-combination if no combinations left
      } else {
         store.combinations.actions.setCombinations(newCombinations) // Update UI
         await db.remove(id) // Delete in background
      }
   } catch (error) {
      console.error(error) // Do not throw critical error, just log it
   } finally {
      isDeleteDisabled.value = false
   }
}

async function onPreviewClick() {
   await router.replace({ query: { ...route.query, current: props.combination.id } })
   store.preview.actions.setActiveId(props.combination.id)
   store.preview.actions.setHeadlineFont(props.combination.headline)
   store.preview.actions.setBodyFont(props.combination.body)
}

async function onEditClick() {
   const entry = await db.get(props.combination.id)

   if (!entry) {
      console.error('[combination-list-view] - Trying to navigate to a non existent entry .')
   } else {
      await router.push({ name: 'editor', params: { id: props.combination.id } })
   }
}

async function onDownloadClick() {
   try {
      isDownloadDisabled.value = true
      await downloadSingleFonts(
         props.combination.headline.family,
         props.combination.headline.weight
      )
      await downloadSingleFonts(props.combination.body.family, props.combination.body.weight)
   } catch (error) {
      console.error(error)
   } finally {
      isDownloadDisabled.value = false
   }
}
</script>

<template>
   <li class="Entry_Wrapper">
      <div class="Entry_Header">
         <div class="Entry_Header_Details">
            <h2>
               Name: <strong>{{ props.combination.name }}</strong>
            </h2>

            <div>
               <time> Saved {{ formatDistanceToNow(props.combination.lastUpdated) }} ago</time>
            </div>
         </div>

         <div class="Entry_Header_Family">
            <h2>{{ headlineFamilyDescription }} + {{ bodyFamilyDescription }}</h2>
         </div>
      </div>
      <div class="Entry_Content" :data-active-entry="isActive">
         <h1
            class="Entry_Content_Headline"
            :style="{
               'font-family': props.combination.headline.family,
               'font-weight': props.combination.headline.weight
            }"
         >
            The Quick Brown Fox Jumps Over the Lazy Dog
         </h1>
         <p
            class="Entry_Content_Paragraph"
            :style="{
               'font-family': props.combination.body.family,
               'font-weight': props.combination.body.weight
            }"
         >
            Experiment with different typefaces, sizes, and styles to find the perfect combination
            that suits your design and brings your content to life. Let your creativity flow as you
            explore the world of typography.
         </p>
      </div>
      <nav class="Entry_Nav">
         <div class="Entry_Nav_Group">
            <button @click="onEditClick" class="Editor_Button" data-editor-button>
               Open in the editor
            </button>
            <button @click="onPreviewClick" class="Preview_Button" :disabled="isActive">
               {{ isActive ? 'Previewing' : 'Preview' }}
            </button>
         </div>

         <div class="Entry_Nav_Group">
            <button @click="onDownloadClick" :disabled="isDeleteDisabled" class="Download_Button">
               Download
            </button>
            <button
               @click="onDelete(props.combination.id)"
               :disabled="isDeleteDisabled"
               class="Delete_Button"
            >
               Delete
            </button>
         </div>
      </nav>
   </li>
</template>

<style scoped>
.Entry_Wrapper {
   display: grid;
   padding: var(--size-6) var(--size-2);
   gap: var(--size-4);
   border-bottom: var(--border-size-2) solid var(--divider-color);

   @media (--layout-switch) {
      padding: var(--size-3) 0;
   }
}

.Entry_Header {
   display: flex;
   flex-direction: column;
   gap: var(--size-2);
   color: var(--fg-body-light-color);
}

.Entry_Header_Details {
   display: flex;
   justify-content: space-between;
   gap: var(--size-2);
   font-size: var(--font-size-0);
   white-space: nowrap;
   flex-wrap: wrap;
}

.Entry_Content {
   max-width: var(--size-content-3);
   display: flex;
   flex-direction: column;
   gap: var(--size-2);
   padding-left: var(--size-3);
   border-left: var(--border-size-3) solid var(--divider-color);
   transition: all 100ms var(--easing);

   &[data-active-entry='true'] {
      border-color: var(--accent-color);
   }

   @media (--layout-switch) {
      padding-left: var(--size-2);
   }
}

.Entry_Content_Headline {
   font-size: var(--font-size-4);
   color: var(--fg-headline-color);
   line-height: 1.25;
}

.Entry_Content_Paragraph {
   font-size: var(--font-size-2);
   color: var(--fg-body-color);
}

.Entry_Nav {
   display: flex;
   margin-top: var(--size-3);
   justify-content: space-between;
   flex-wrap: wrap;
   column-gap: var(--size-2);
   row-gap: var(--size-3);
}

.Entry_Nav_Group {
   display: flex;
   gap: var(--size-4);
}

.Editor_Button {
   white-space: nowrap;
   color: var(--accent-color);
   font-weight: 700;

   &:hover {
      text-decoration: underline;
   }
}

.Preview_Button {
   &:hover:not([disabled]) {
      text-decoration: underline;
      color: var(--accent-color);
   }

   &:disabled,
   &:hover:disabled {
      color: var(--fg-body-light-color);
      cursor: not-allowed;
   }

   @media (--layout-switch) {
      display: none;
   }
}

.Download_Button:hover {
   text-decoration: underline;
}

.Delete_Button {
   color: var(--error-color);
   font-weight: 700;

   &:hover {
      text-decoration: underline;
   }

   &[disabled] {
      text-decoration: none;
      cursor: not-allowed;
   }
}
</style>
