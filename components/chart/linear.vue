<template>
    <ChartDefault>
        <Line 
          ref="line"
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

<script lang="ts" setup>
import {Chart, LineController, BarController} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
Chart.register(LineController,BarController,ChartDataLabels );
import { type PropType} from 'vue'
import {Line} from 'vue-chartjs'
import {ChartDataModel} from '~~/models/chart'

const props = defineProps({
    chartId: {
      type: String,
      default: 'line-chart'
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
  })

const line: Ref<any> = ref(null)
function update() {
  line.value.chart.update()
}

function reset() {
  line.value.chart.reset()
}

function render(){
  line.value.chart.renderChart(props.chartData, props.chartOptions)
}

defineExpose({
  update,
  reset,
  render
})
</script>
