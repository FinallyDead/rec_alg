<template>
    <ChartDefault>
        <Line
            :data="chartData"
            :options="chartOptions"
            :width="width"
            :height="height"
            :chart-i-d="chartId"
            :css-classes="cssClasses"
            :styles="styles"
        />
    </ChartDefault>
</template>

<script lang="ts">
import {Chart, LineController, BarController} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
Chart.register(LineController,BarController,ChartDataLabels );
import {defineComponent, type PropType} from 'vue'
import {Line} from 'vue-chartjs'
import {ChartDataModel} from '~~/models/chart'

export default defineComponent({
  components: {
    Line
  },
  props: {
    chartId: {
      type: String,
      default: 'bar-chart'
    },
    width: {
      type: Number,
      default: 300
    },
    styles: {
      type: Object,
      default: null
    },
    height: {
      type: Number,
      default: 300
    },
    cssClasses: {
      default: '',
      type: String
    },
    chartData: {
      type: Object as PropType<ChartDataModel>,
      default: new ChartDataModel()
    },
    chartOptions: {
      type: Object as PropType<ChartDataModel>,
      default: new ChartDataModel()
    }
  }
})
</script>
