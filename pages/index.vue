<template>
  <UISectionMain class=" bg-[#035787] full-screen h-screen overflow-auto space-y-[24px]">
    <div class="flex space-x-5 justify-center">
      <div class="w-full">
        <div 
          class="bg-[#0488d3] h-[144px] p-6 rounded transition-width duration-800 ease-in shadow-xl basis-1/2"  
          :class="{'w-full': localStorageData != null, 'w-[400px] mx-auto': !(localStorageData != null)}"
        >
          <VaInput 
            v-model="inputValue"
            class="w-full bg-white rounded text-sans"
            color="#2fb6f8"
            placeholder="Введите API запрос для получения данных"
            input-class=" ring-8"
          />

          <VaButton
            v-if="localStorageData != null"
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
            v-show="rowData?.length > 0" 
            class="flex space-x-5"
          >
           
            <div 
              class="bg-[#0488d3] w-full h-fit p-6 rounded mt-[24px] shadow-xl space-y-[24px]"
            >
              <p class="text-[36px] font-medium text-white text-sans">
               Корневая таблица
              </p>
              <Table
                :table-row-data="rowData"
                :table-columns-names="columnDefs"
                fullheight
              />
            </div>
          </div>
        </transition>
      </div>
      <transition name="fade">
        <div 
          v-show="localStorageData != null"
          class="relative bg-[#0488d3] w-fit p-6 rounded text-sans text-white shadow-xl basis-1/3 space-y-[24px]"
        > 
          <p class="text-[36px] font-medium ">
               Исходный вид данных
          </p>
          <div  ref="dataInfo" class="relative overflow-y-auto">
            <pre>{{ loadedData }}</pre> 
          </div>
        </div>
      </transition>
    </div>
    <transition name="fade">
      <div v-if="localStorageData != null" class="flex space-x-[24px] justify-center ">
        <div class="flex flex-col bg-[#0488d3] flex-1 p-6 rounded shadow-l basis-1/2 space-y-[24px]">
          <p class="text-[36px] font-medium text-white text-sans">
               Линейный график
          </p>
          <div class="bg-white rounded p-2 h-full w-full">
            <ChartLinear
              :chart-options="linearOptions"
              :chart-data="linearData"
            />
          </div>
        </div>
        <div class="flex flex-col bg-[#0488d3] flex-1 p-6 rounded shadow-l basis-1/2 space-y-[24px]">
          <p class="text-[36px] font-medium text-white text-sans">
               Столбчатый график
          </p>
          <div class="bg-white rounded p-2 h-full w-full">
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

const inputValue = ref<string>('https://gorest.co.in/public/v2/users')
const loadedData = ref<string>('')
const isDataLoading = ref<boolean>(false)
const columnDefs = ref<Array<object>>([])
const rowData = ref<Array<object>>([])
const localStorageData = ref<Array<object>>([])
const tableElement = ref<HTMLElement | null>(null)
const dataInfo =  ref<HTMLElement | null>(null)

const linearData = ref({
  labels: ['a', 'b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'],
  name: 'График характеристики',
  datasets: [
    {
      backgroundColor:"#0488d3",
      borderColor:"#0488d3",
      data: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
      datalabels: {
        align:"bottom",
        anchor:"start",
        clamp:true
      },
      fill:false,
      label:"",
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
  labels: [ 'January', 'February', 'March' ],
  datasets: [
     { 
      data: [40, 20, 12],
      label: 'Data One',
      backgroundColor: '#f87979',
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

const resizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    dataInfo.value && (dataInfo.value.style.height = entry.contentBoxSize[0].blockSize + 'px')
  }
});


async function loadJsonDataFromUrl(url: string): Promise<void> {
  isDataLoading.value = true
  await new getData().loadData(url)
  .then((data: Array<object>) => {
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
        flex: 1,
        minWidth : 200,
        cellStyle : { 'text-overflow':'ellipsis', 'overflow': 'hidden', }
      }))
    })
  return Array.from(columnsSet).map((el: string) => JSON.parse(el))
}

function clearLocalStorage(): void {
  localStorage.clear()
  columnDefs.value = []
  rowData.value = []
  loadedData.value = ''
  localStorageData.value = null as any
}

function primaryDataProcessing(data: Array<object>): void{
  let processedData: string | object
  if (localStorage.getItem('dataForTables') == null) {
    processedData = new RecognizeTableData().processData(data)
    localStorage.setItem('dataForTables', JSON.stringify(processedData))
  } else {
    processedData =JSON.parse(localStorage.getItem('dataForTables'))
  }
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

function getRandomColor(): String {
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

</style>