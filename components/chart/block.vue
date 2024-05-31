<template>
  <div class="flex flex-col bg-gradient-to-b from-[#3bbaf5] to-[#05669f] border-[#0581c4]  p-6 rounded  space-y-[24px]">
    <div class="flex">
       <p class="text-[36px] font-medium text-white text-sans">
          Диаграмма № {{ graphicIndex }}
      </p>
      <div class="flex items-center ml-auto">
        <p
          v-if="isLabelsNum && chartData.datasets.length <= 1"
          class="text-[#c1e3f6] hover:text-[#e3f0fb] cursor-pointer text-center"
          @click="swapAxis"
        >
          Поменять местами оси X и Y
        </p>
      </div>
      <div v-if="options.length > 0" class="mb-6 ml-auto items-end">
        <VaSelect
          v-model="selectedGraphics"
          label="Соединить график с"
          class="ml-auto"
          background="#ffffff"
          color="#146190"
          :searchable="options.length > 5"
          multiple
          :options="options"
        />
      </div>
    </div>
    <div class="bg-white rounded p-2 h-full min-h-[450px] w-[99%] mx-auto">
      <component
        v-if="!hideGraphic"
        :is="currentTabs.comp"
        ref="chart"
        :chart-data="chartData"
        :chart-options="chartOptions"
        :height="450"
        :styles="graphicStyles"
        hide="1"
      ></component>
    </div>
    <div class="flex flex-col">
      <VaSwitch
        v-model="chartKind"
        label="Вид графика"
        true-inner-label="Линейный"
        false-inner-label="Гистограмма"
        class="mt-[24px] !text-white"
        @change="changeKindChart"
      />

      <VaSwitch
        v-model="chartType"
        label="Тип графика"
        true-inner-label="Общий"
        false-inner-label="Накопительный"
        class="mt-[24px] !text-white"
        @change="changeTypeChart"
      />
    </div>
  </div>
</template>

<script setup lang="ts">

const props = defineProps({
  chartData: {
    type: Object,
    default: () => ({})
  },
  graphicIndex: {
    type: Number,
    default: 0
  },
  allGraphicsData: {
    type: Object,
    default: () => ({})
  }
})

const { chartData } = toRefs(props)
const chartKind = ref<boolean>(false)
const chartType = ref<boolean>(false)
const chart = ref(null)
const hideGraphic = ref<boolean>(false)
const options = ref<Array<object>>([])
const selectedGraphics = ref<Array<object>>([])
const suitableOptions = ref<Array<object>>([])
const isLabelsNum = ref<boolean>(true)
const tabs = [
  {
    id: 0,
    name: 'Bar chart',
    comp: resolveComponent('ChartBar'),
    is_active: true,
  },
  {
    id: 1,
    name: 'Line chart',
    comp: resolveComponent('ChartLinear'),
    is_active: false,
  },
]
const graphicStyles = ref({
  width: 'w-full',
  height: '400px'
})
const currentTabs = shallowRef(tabs[0])
const chartOptions = ref({
  responsive: true,
   locale: 'ft-FR',
  maintainAspectRatio: false, 
  interaction: {
    intersect: false,
    mode: 'index',
  },
  plugins: {
    tooltip: {
      enabled: true,
      position: 'nearest',
    },
    legend: {
      position: 'bottom',
      labels: {
        usePointStyle: true,
      },
      display: true,
    },  
  },
  scales: {
    x: {
      stacked: true,
    },
    y: {
      stacked: true,
    },
  },
})

watch(() => selectedGraphics.value, () => {
  hideGraphic.value = !hideGraphic.value
  let arrayOfDataSets = []
  selectedGraphics.value.forEach((el) => {
   const foundedElement = suitableOptions.value.find((item, index) => {
      return el.value === index
    })
   foundedElement && arrayOfDataSets.push(foundedElement)
  })
  arrayOfDataSets = arrayOfDataSets.map(el => {return el.datasets[0]})
  const firstDataSet = chartData.value.datasets[0]
  chartData.value.datasets = [firstDataSet, ...arrayOfDataSets]
  setTimeout(() =>  hideGraphic.value = !hideGraphic.value, 50)
})

onMounted(() => {
  for (let item in chartData.value.datasets) {
    chartData.value.datasets[item].fill = true
    chartData.value.datasets[item].datalabels={ display:false}
  }
  suitableOptions.value = props.allGraphicsData.filter(el => {return isEqual(el.labels, chartData.value.labels)})
  suitableOptions.value.splice(suitableOptions.value.indexOf(chartData.value),1)
  options.value = suitableOptions.value.map((el, index) => {
    return {
      text: `Диаграмма № ${props.allGraphicsData.indexOf(el) + 1}`,
      value: index
    }
  })
  chartData.value.labels.forEach(element => {
    if (!Number.isInteger(+element)) 
      isLabelsNum.value = false
  });
})
function changeTypeChart() {
  hideGraphic.value = !hideGraphic.value
  const stacked = chartType.value == false;
  chartData.value.datasets.forEach(el => el['fill'] = stacked)
  if (stacked)
    chartOptions.value.scales = {
      x: { stacked },
      y: { stacked },
    }
  else delete chartOptions.value.scales
  setTimeout(() =>  hideGraphic.value = !hideGraphic.value, 50)
}

function changeKindChart() {
  if (chartKind.value !== null) {
    if (currentTabs.value.id == 1) {
      currentTabs.value = tabs[0]
    } else {
      currentTabs.value = tabs[1]
    }
  }
}

function isEqual(array1, array2) {
  return JSON.stringify(array1) === JSON.stringify(array2);
}

function swapAxis() {
  hideGraphic.value = !hideGraphic.value
  const dataObject = []
  chartData.value.labels.forEach((el, index) => {
    dataObject[index] = {}
    dataObject[index]['x'] = chartData.value.datasets[0].data[index]
    dataObject[index]['y'] = chartData.value.labels[index]
  })
  dataObject.sort((a, b) => {
    return a.x - b.x
  })
  chartData.value.labels = []
  chartData.value.datasets[0].data = []
  dataObject.forEach((el) => {
    chartData.value.labels.push(el.x)
    chartData.value.datasets[0].data.push(el.y) 
  })
  setTimeout(() =>  hideGraphic.value = !hideGraphic.value, 50)
}
</script>
