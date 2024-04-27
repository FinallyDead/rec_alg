<template>
  <UISectionMain class=" bg-[#095683] full-screen h-screen overflow-auto space-y-[24px]">
    <div class="flex space-x-5 justify-center">
      <div class="w-full">
        <!-- TODO сделать вычисления максимума высоты среди блоков кода и таблицы -->
        <div 
          class="bg-gradient-to-b from-[#3bbaf5] from-30% to-[#05669f] border-[#0581c4] border h-[144px] p-6 rounded transition-width duration-800 ease-in basis-1/2"  
          :class="{'w-full': localStorageData !== null, 'w-[400px] mx-auto': !(localStorageData !== null)}"
        >
          <VaInput 
            v-model="inputValue"
            class="w-full bg-white rounded text-sans"
            color="#2fb6f8"
            placeholder="Введите API запрос для получения данных"
            input-class=" ring-8"
          />

          <VaButton
            v-if=" localStorageData !== null"
            class="mt-[24px] text-sans"
            color="#035787"
            @click="clearLocalStorage"  
          >
            Очистить
          </VaButton>

          <VaButton 
            class="float-right mt-[24px] text-sans"
            color="#035787"
            :disabled="!inputValue"
            :loading="isDataLoading"
            @click="loadJsonDataFromUrl(inputValue)"  
          >
            Получить данные
          </VaButton>
        
        </div>

        <transition name="fade">
          <div 
            ref="tableElement"
            class="flex space-x-5"
            v-show=" localStorageData !== null"
          >
            <div 
              class="bg-gradient-to-br from-[#3bbaf5] to-[#05669f] border-[#0581c4] w-full h-fit p-6 rounded mt-[24px] space-y-[24px]"
              :class="{'!h-[700px]': rowData?.length <= 0}"
            >
              <p class="text-[36px] font-medium text-white text-sans">
               Таблица
              </p>
              <Table 
                v-if="rowData?.length > 0" 
                :table-row-data="rowData"
                :table-columns-names="columnDefs"
                :pagination-page-size="200"
                fullheight
              />
              <p v-else class="text-[36px] font-medium text-white text-sans align-center text-align-center">
               Нет данных
              </p>
            </div>
          </div>
        </transition>
      </div>
      <transition name="fade">
        <div 
          v-show=" localStorageData !== null"
          class="relative bg-gradient-to-bl from-[#3bbaf5] to-[#05669f] border-[#0581c4] w-fit p-6 rounded text-sans text-[#181d1f] basis-1/3 space-y-[24px]"
        > 
          <p class="text-[36px] font-medium text-white">
               Исходный вид данных
          </p>
          <div 
            ref="dataInfo" 
            class="relative overflow-auto rounded"
          >
            <pre class="bg-white whitespace-pre-wrap p-3">{{ loadedData }}</pre> 
          </div>
        </div>
      </transition>
    </div>
    <transition name="fade">
      <div v-if="localStorageData !== null && linearData.labels.length > 0 && barData.labels.length > 0" class="flex space-x-[24px] justify-center">
        <div class="flex flex-col bg-gradient-to-r from-[#3bbaf5] to-[#05669f] border-[#0581c4] p-6 rounded  basis-1/2 space-y-[24px]">
          <p class="text-[36px] font-medium text-white text-sans">
               Линейная диаграмма
          </p>
          <div class="bg-white rounded p-2 h-full w-[99%] mx-auto">
            <ChartLinear 
              :chart-options="linearOptions"
              :chart-data="linearData"
            />
          </div>
        </div>
        <div class="flex flex-col bg-gradient-to-l from-[#3bbaf5] to-[#05669f] border-[#0581c4]  p-6 rounded  basis-1/2 space-y-[24px]">
          <p class="text-[36px] font-medium text-white text-sans">
               Столбчатая диаграмма
          </p>
          <div class="bg-white rounded p-2 h-full w-[99%] mx-auto">
            <ChartBar
              :chart-data="barData"
              :chart-options="barOptions"
            />
          </div>
        </div>
      </div>
    </transition>
  </UISectionMain>
</template>

<script setup lang="ts">
import getData from '@/composables/getData'
import RecognizeTableData from '@/composables/recTableData'
import RecognizeGraphicData from '~/composables/recGraphicData'

const inputValue = ref<string>('https://dummyjson.com/comments')
const loadedData = ref<string>('')
const isDataLoading = ref<boolean>(false)
const columnDefs = ref<Array<object>>([])
const rowData = ref<Array<object>>([])
const localStorageData = ref<Array<object> | object | null>([])
const tableElement = ref<HTMLElement | null>(null)
const dataInfo =  ref<HTMLElement | null>(null)

const linearData = ref({
  labels: [],
  name: 'График характеристики',
  datasets: [
    {
      backgroundColor:"#0488d3",
      borderColor:"#0488d3",
      data: [],
      datalabels: {
        align:"bottom",
        anchor:"start",
        clamp:true
      },
      fill:false,
      label:"исми",
      type:"line",
      yAxisID:"y",
    }
  ]
})

const linearOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  borderColor: 'rgb(0, 0, 0)',
  scales: {
    y: {
      beginAtZero: true,
      position: 'left'
    },
    percentage: {
      beginAtZero: true,
      position: 'right',
      grid: {
        drawOnChartArea: false
      }
    }
  },
  plugins: {
    legend: {
      display: false,
      position: 'bottom',
      labels: {
        usePointStyle: true
      }
    },
    datalabels: {
      display: true,
      bordersRadius: 4,
      font: {
        weight: 'bold'
      },
      padding: 6
    }
  }
})

const barData = ref({
  labels: [],
  datasets: [
     { 
      data: [],
      label: '',
      backgroundColor: '',
     } 
    ]
})

const barOptions = ref({
  responsive: true
})

onMounted(() => {
  if (localStorage.length > 0) {
    console.log('dddd')
    localStorageData.value = JSON.parse(localStorage.getItem("loadedData") || '{}')
    primaryDataProcessing(localStorageData.value)
  }

//  new RecognizeGraphicData().processData([
//     {
//       title: 'ab',
//       date: '10.15.2022',
//       id:1,
//       data: [
//         {
//           x: 1,
//           y: 1
//         },
//         {
//           x: 2,
//           y: 2
//         },
//         {
//           x: 3,
//           y: 3
//         },
//         {
//           x: 4,
//           y: 4
//         }
//       ]
//     },
//     {
//       title: 'aba',
//       date: '10.17.2022',
//       id:2,
//       data: [
//         {
//           x: 5,
//           y: 5
//         },
//         {
//           x: 13,
//           y: 13
//         },
//         {
//           x: 14,
//           y: 14
//         },
//         {
//           x: 15,
//           y: 15
//         }
//       ]
//     },
//     {
//       title: 'abb',
//       date: '10.18.2022',
//       id:3,
//       data: [
//         {
//           x: 6,
//           y: 6
//         },
//         {
//           x: 7,
//           y: 7
//         },
//         {
//           x: 8,
//           y: 8
//         },
//         {
//           x: 9,
//           y: 9
//         }
//       ]
//     }
//    ])
  //  convertGraphicData(new RecognizeGraphicData().processData(
  //       {x: [1,2,3,4,5,6,7], y: ['a','b','c','d','e','f','g'], z: [2,3,4,5,8,9,6,10,15], h: [5,5,5,5,5,5,5,5], j: ['g', 'f', 't', 'r', 'y', 'u', 'e']}  
  //   )) 
   new RecognizeGraphicData().processData([
    {
      title: 'ab',
      date: '10.15.2022',
      id:1,
      data: [
        {
          x: 1,
          y: 'a'
        },
        {
          x: 2,
          y: 'b'
        },
        {
          x: 3,
          y: 'c'
        },
        {
          x: 4,
          y: 'd'
        }
      ]
    },
    {
      title: 'aba',
      date: '10.17.2022',
      id:2,
      field: {
        title: 'abb',
        date: '10.18.2022',
        id:3,
        kavo: {
      title: 'ab',
      date: '10.15.2022',
      id:1,
      data: [
        {
          x: 'a',
          y: 1
        },
        {
          x: 'b',
          y: 2
        },
        {
          x: 'c',
          y: 3
        },
        {
          x: 'd',
          y: 4
        }
      ]
    }, 
        data: [
          {
            x: 6,
            y: 6
          },
          {
            x: 7,
            y: 7
          },
          {
            x: 8,
            y: 8
          },
          {
            x: 9,
            y: 9
          }
        ]
      } ,
      data: [
        {
          x: 5,
          y: 5
        },
        {
          x: 13,
          y: 13
        },
        {
          x: 14,
          y: 14
        },
        {
          x: 15,
          y: 15
        }
      ]
    },
    
   ])
})

const resizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    dataInfo.value && (dataInfo.value.style.height = entry.contentBoxSize[0].blockSize + 17 +'px')
  }
});


async function loadJsonDataFromUrl(url: string): Promise<void> {
  isDataLoading.value = true
  await new getData().loadData(url)
  .then((data: Array<object>) => {
    clearLocalStorage()
    localStorage.setItem('loadedData', JSON.stringify(data))
    localStorageData.value = JSON.parse(JSON.stringify(data))
    primaryDataProcessing(data)
  })
  .catch((error) => {
    console.error(error)
  })
  isDataLoading.value = false
}

function getColumns(data: Array<object> | null): Array<object> {
  if (data === null)
    return []
  const columnsSet = new Set()
  data.forEach(el => {
    columnsSet.add( JSON.stringify({
        headerName: el,
        field: el,
        flex: 2,
        minWidth: 200,
        resizable: false,
        //maxWidth: 300, 
        cellStyle : { 'text-overflow':'ellipsis', 'overflow': 'hidden', }
      }))
    })
  return Array.from(columnsSet).map((el: string) => JSON.parse(el))
}

function convertGraphicData(data: object): void {
  const keysOfObject = Object.keys(data)
  const xLabels = data[keysOfObject[keysOfObject.indexOf(keysOfObject.find(key => key.includes('labelsX')))] as keyof typeof data]
  const yLabels = data[keysOfObject[keysOfObject.indexOf(keysOfObject.find(key => key.includes('labelsY')))] as keyof typeof data]
  const color = {
    linear: getRandomColor(),
    bar: getRandomColor() 
  } 
  linearData.value.labels = xLabels
  linearData.value.datasets[0].data = yLabels
  linearData.value.datasets[0].backgroundColor = color.linear
  linearData.value.datasets[0].borderColor = color.linear 
  barData.value.labels = xLabels
  barData.value.datasets[0].data = yLabels
  barData.value.datasets[0].backgroundColor = color.bar
  barData.value.datasets[0].label = 'Value'
}

function clearLocalStorage(): void {
  localStorage.clear()
  columnDefs.value = []
  rowData.value = []
  linearData.value.labels = []
  linearData.value.datasets[0].data = []
  barData.value.labels = []
  barData.value.datasets[0].data = []
  loadedData.value = ''
  localStorageData.value = null as any
}

function primaryDataProcessing(data: Array<object>): void{
  let processedData: string | object
  let processedGraphicData: string | object
  if (localStorage.getItem('dataForTables') == null) {
    processedData = new RecognizeTableData().processData(data)
    localStorage.setItem('dataForTables', JSON.stringify(processedData))
  } else {
    processedData = JSON.parse(localStorage.getItem('dataForTables'))
  }

  if (localStorage.getItem('dataForGraphics') == null) {
    processedGraphicData = new RecognizeGraphicData().processData(data)
    localStorage.setItem('dataForGraphics', JSON.stringify(processedGraphicData))
  } else {
    processedGraphicData = JSON.parse(localStorage.getItem('dataForGraphics'))
  }
  typeof processedGraphicData === 'object' && setTimeout(() => convertGraphicData(processedGraphicData), 500) 
  columnDefs.value = typeof processedData === 'object' ?
    getColumns('rowDataField_root_columns' in processedData 
    ? processedData['rowDataField_root_columns'] 
    : 'rowDataField_root_0_columns' in processedData 
      ? processedData['rowDataField_root_0_columns'] 
      : [] as any) : []
  rowData.value = typeof processedData === 'object' 
  ? 'rowDataField_root' in processedData 
    ? processedData['rowDataField_root'] 
    : 'rowDataField_root_0' in processedData 
      ? processedData['rowDataField_root_0'] 
      : [] as any : []
  loadedData.value = JSON.stringify(data, undefined, 2)
  resizeObserver.observe(tableElement.value!)
}

function getRandomColor(): string {
  const randomColor = Math.floor(Math.random()*16777215).toString(16);
  return "#"+randomColor  
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-thumb {
  background: #117cb8;
}

::-webkit-scrollbar-thumb:hover {
  background: #11547b;
}

::-webkit-scrollbar-thumb:active {
  background: #0d2d44;
}

.scroll-color-colors {
  scrollbar-color: #117cb8 #11547b;
}

.scroll-width {
  scrollbar-width: thin;
}
</style>