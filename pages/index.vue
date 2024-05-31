<template>
  <UISectionMain class=" bg-[#095683] full-screen h-screen overflow-auto space-y-[24px] relative">
    <div class="flex space-x-5 justify-center">
      <div class="w-full">
        <div 
          class="bg-gradient-to-b from-[#3bbaf5] from-30% to-[#05669f] border-[#0581c4] border h-fit p-6 rounded transition-width duration-800 ease-in basis-1/2"  
          :class="{'w-full': localStorageData !== null, 'w-fit mx-auto': !(localStorageData !== null)}"
        >
          <VaInput
            v-if="!switchState" 
            v-model="inputValue"
            class="w-full bg-white rounded text-sans"
            color="#2fb6f8"
            placeholder="Введите API запрос для получения данных"
            input-class=" ring-8"
          />

          <VaFileUpload
            v-if="switchState"
            v-model="inputFile"
            dropzone
            file-types="json"
            class="[&>*]:bg-white"
            @change="loadJsonDataFromInputFile"
          />

          <VaSwitch
            v-model="switchState"
            label="Отобразить поле загрузки JSON-файла"
            class="mt-[24px] !text-white"
            :class="{'mr-[24px]': !(localStorageData !== null)}"
          />

          <VaButton 
            v-if="!switchState"
            class="float-right mt-[24px] text-sans"
            color="#0154ec1"
            :disabled="!inputValue"
            :loading="isDataLoading"
            @click="loadJsonDataFromUrl(inputValue)"  
          >
            Получить данные
          </VaButton>

          <VaButton
            v-if=" localStorageData !== null"
            class="float-right mt-[24px] text-sans"
            :class="{'mr-[24px]': !switchState}"
            color="#154ec1"
            @click="clearLocalStorage"  
          >
            Стереть данные
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
              <div class="flex items-center">
                <p class="text-[36px] font-medium text-white text-sans">
                  Таблица
                </p>
                <p
                  v-if="tableInfoLenght > 2"
                  class="ml-auto text-[#c1e3f6] hover:text-[#e3f0fb] cursor-pointer"
                  @click="openTablesPage"
                >
                  Перейти на страницу с таблицами
              </p>
              </div>
              <Table 
                v-if="rowData?.length > 0" 
                :table-row-data="rowData"
                :table-columns-names="columnDefs"
                :pagination-page-size="200"
                fullheight
              />
              <p v-else class="text-[36px] w-fit font-medium text-white text-sans align-center text-align-center mx-auto">
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
          <div class="flex items-center">
            <p class="text-[36px] font-medium text-white text-sans">
              Линейная диаграмма
            </p>
            <p
              v-if="graphicInfoLenght > 2"
              class="ml-auto text-[#c1e3f6] hover:text-[#e3f0fb] cursor-pointer"
              @click="openGraphicPage"
            >
              Перейти на страницу с графиками
            </p>
          </div>
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
  <NuxtNotifications position="top right" :speed="1000" />
</template>

<script setup lang="ts">
import getData from '@/composables/getData'

const inputValue = ref<string>('https://dummyjson.com/comments')
const inputFile = ref<Array<File>>([])
const switchState = ref<boolean>(false)
const loadedData = ref<string>('')
const isDataLoading = ref<boolean>(false)
const columnDefs = ref<Array<object>>([])
const rowData = ref<Array<object>>([])
const localStorageData = ref<Array<object> | object | null>(null)
const tableElement = ref<HTMLElement | null>(null)
const dataInfo =  ref<HTMLElement | null>(null)
const tableInfoLenght = ref<number>(0)
const graphicInfoLenght = ref<number>(0)
const router = useRouter()

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
      label:"label",
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
      display: true,
      position: 'top',
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
    localStorageData.value = JSON.parse(localStorage.getItem("loadedData") || '{}')
    primaryDataProcessing(localStorageData.value)
  }
})

const resizeObserver = computed(() => {
  const state = switchState.value
  return  new ResizeObserver((entries) => {
    for (const entry of entries) {
      dataInfo.value && (dataInfo.value.style.height = entry.contentBoxSize[0].blockSize + (!state ? 19 : 35) +'px')
    }
  })
}) 


async function loadJsonDataFromUrl(url: string): Promise<void> {
  isDataLoading.value = true
  await new getData().loadData(url)
  .then((data: Array<object>) => {
    clearLocalStorage()
    localStorage.setItem('loadedData', JSON.stringify(data))
    localStorageData.value = JSON.parse(JSON.stringify(data))
    primaryDataProcessing(data)
  })
  .catch(() => {
    useNotification().notify({ title: 'Ошибка', text: 'Не вышло получить данные', type: 'error' })
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
        minWidth: 200,
        flex: 2,
        resizable: false,
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
  inputFile.value = []
  loadedData.value = ''
  localStorageData.value = null as any
}

function primaryDataProcessing(data: Array<object>): void{
  let processedData: string | object = {}
  let processedGraphicData: string | object = {}
  if (localStorage.getItem('dataForTables') == null) {
    const recTableWorker = new Worker(new URL('@/composables/recTableData.worker.ts', import.meta.url), { type: 'module' })
    recTableWorker.addEventListener('message', (event) => {
      processedData = event.data  
      localStorage.setItem('dataForTables', JSON.stringify(processedData))
      tableInfoLenght.value = typeof processedGraphicData === 'object' ? Object.keys(processedData).length : 0
      fillTableFields(processedData)
    })
    recTableWorker.postMessage(data)
  } else {
    processedData = JSON.parse(localStorage.getItem('dataForTables'))
    tableInfoLenght.value = Object.keys(processedData).length
    fillTableFields(processedData)
  }

  if (localStorage.getItem('dataForGraphics') == null) {
    const recGraphicWorker = new Worker(new URL('@/composables/recGraphicData.worker.ts', import.meta.url), { type: 'module' })
    recGraphicWorker.addEventListener('message', (event) => {
      processedGraphicData = event.data  
      localStorage.setItem('dataForGraphics', JSON.stringify(processedGraphicData))
      graphicInfoLenght.value = typeof processedGraphicData === 'object' ? Object.keys(processedGraphicData).length : 0
      typeof processedGraphicData === 'object' && setTimeout(() => convertGraphicData(processedGraphicData), 500) 
    })
    recGraphicWorker.postMessage(data)
  } else {
    processedGraphicData = JSON.parse(localStorage.getItem('dataForGraphics'))
    graphicInfoLenght.value = Object.keys(processedGraphicData).length
    typeof processedGraphicData === 'object' && setTimeout(() => convertGraphicData(processedGraphicData), 500) 
  }

  loadedData.value = JSON.stringify(data, undefined, 2)
  resizeObserver.value.observe(tableElement.value!)
}

function getRandomColor(): string {
  let x=Math.round(0xffffff * Math.random()).toString(16);
  let y=(6-x.length);
  let z="000000";
  let z1 = z.substring(0,y);
  let color= "#" + z1 + x; 
  return color
}

function openTablesPage(): void {
  window.open(router.resolve({path: '/tables'}).fullPath, '_blank')
}

function openGraphicPage(): void {
  window.open(router.resolve({path: '/graphics'}).fullPath, '_blank')
}

function loadJsonDataFromInputFile(): void {
  const inputFileData = inputFile.value
  clearLocalStorage()
  let reader = new FileReader()
  reader.onload = (event) => {
    const data = JSON.parse(event.target?.result as string)
    clearLocalStorage()
    localStorage.setItem('loadedData', JSON.stringify(data))
    localStorageData.value = JSON.parse(JSON.stringify(data))
    primaryDataProcessing(data)
  }
  reader.readAsText(inputFileData[0])
}

function fillTableFields(processedData: object | string): void {
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