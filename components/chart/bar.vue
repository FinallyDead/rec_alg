<template>
  <chart-default>
    <Bar
      ref="bar"
      :data="chartData"
      :options="chartOptions"
      :width="width"
      :height="height"
      :chart-i-d="chartId"
      :css-classes="cssClasses"
      :styles="styles"
    />
    <slot />
  </chart-default>
</template>

<script lang="ts" setup>
import type { Ref } from 'vue'
import type { PropType } from 'vue'
import { Bar } from 'vue-chartjs'
import { ChartDataModel } from '~~/models/chart'
const props = defineProps({
  chartId: {
    type: String,
    default: 'bar-chart',
  },
  width: {
    type: Number,
    default: 300,
  },
  height: {
    type: Number,
    default: 300,
  },
  styles: {
    type: Object,
    default: null,
  },
  cssClasses: {
    default: '',
    type: String,
  },
  chartData: {
    type: Object as PropType<ChartDataModel>,
    default: new ChartDataModel(),
  },
  chartOptions: {
    type: Object as PropType<ChartDataModel>,
    default: new ChartDataModel(),
  },
})
const bar: Ref<any> = ref(null)

/**
 *  Функция скрывает все данные на графике
 */
function hideAllData(isHidden = true) {
  for (let index in Object.keys(props.chartData.datasets)) {
    bar.value.chart.getDatasetMeta(index).hidden = isHidden
  }
  bar.value.chart.update()
}

function update() {
  bar.value.chart.update()
}

function reset() {
  bar.value.chart.reset()
}

function render(){
  bar.value.chart.renderChart(props.chartData, props.chartOptions)
}

defineExpose({
  hideAllData,
  update,
  reset,
  render
})
</script>

