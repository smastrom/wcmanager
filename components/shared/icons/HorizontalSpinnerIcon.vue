<!-- https://github.com/n3r4zzurr0/svg-spinners -->

<script setup lang="ts">
const width = defineProp('60px')
const className = defineProp('')
const fill = defineProp('var(--fg-body-color)')
</script>

<template>
   <svg
      aria-hidden="true"
      :width="width"
      :height="width"
      :fill="fill"
      :class="className"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
   >
      <circle cx="4" cy="12" r="3" opacity="1">
         <animate
            id="spinner_qYjJ"
            begin="0;spinner_t4KZ.end-0.25s"
            attributeName="opacity"
            dur="0.75s"
            values="1;.2"
            fill="freeze"
         />
      </circle>
      <circle cx="12" cy="12" r="3" opacity=".4">
         <animate
            begin="spinner_qYjJ.begin+0.15s"
            attributeName="opacity"
            dur="0.75s"
            values="1;.2"
            fill="freeze"
         />
      </circle>
      <circle cx="20" cy="12" r="3" opacity=".3">
         <animate
            id="spinner_t4KZ"
            begin="spinner_qYjJ.begin+0.3s"
            attributeName="opacity"
            dur="0.75s"
            values="1;.2"
            fill="freeze"
         />
      </circle>
   </svg>
</template>
