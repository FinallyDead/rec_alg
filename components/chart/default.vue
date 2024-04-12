<template>
    <slot></slot>
</template>

<script lang="ts">
import {defineComponent} from 'vue'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement, 
  Filler, 
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend,BarElement, LineElement, LinearScale, CategoryScale, PointElement, Filler)

export default defineComponent({

})
</script>

