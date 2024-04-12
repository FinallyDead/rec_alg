<template>
  <UISectionMain class=" bg-[#035787] full-screen h-screen overflow-auto space-y-[24px]">
    <div class="flex space-x-5 justify-center">
      <div class="w-full">
        <div 
          class="bg-[#0488d3] h-[144px] p-6 rounded transition-width duration-800 ease-in shadow-xl basis-1/2"  
          :class="{'w-full': localStorageData?.length > 0, 'w-[400px] mx-auto': !(localStorageData?.length > 0)}"
        >
          <VaInput 
            v-model="inputValue"
            class="w-full bg-white rounded text-sans"
            color="#2fb6f8"
            placeholder="Введите API запрос для получения данных"
            input-class=" ring-8"
          />

          <VaButton
            v-if="localStorageData?.length > 0"
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
            v-show="localStorageData?.length > 0" 
            class="flex space-x-5"
          >
            <div 
              class="bg-[#0488d3] w-full h-fit p-6 rounded mt-[24px] shadow-xl"
            >
              <Table
                :table-row-data="localStorageData"
                :table-columns-names="columnDefs"
                fullheight
              />
            </div>
          </div>
        </transition>
      </div>
      <transition name="fade">
        <div 
          v-show="localStorageData?.length > 0"
          ref="dataInfo"  
          class="relative bg-[#0488d3] w-fit p-6 rounded overflow-y-auto text-sans text-white shadow-xl basis-1/3"
        >
          <pre>{{ loadedData }}</pre> 
        </div>
      </transition>
    </div>
    <transition name="fade">
      <div v-if="localStorageData?.length > 0" class="flex space-x-[24px] justify-center">
        <div class="flex bg-[#0488d3] flex-1 p-6 rounded shadow-xl basis-1/2">
          <div class="bg-white rounded p-2 h-full w-full">
            <ChartLinear
              :chart-options="linearOptions"
              :chart-data="linearData"
            />
          </div>
        </div>
        <div class="flex bg-[#0488d3] flex-1 p-6 rounded shadow-xl basis-1/2">
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

const inputValue = ref<string>('https://gorest.co.in/public/v2/users')
const loadedData = ref<string>('')
const isDataLoading = ref<boolean>(false)
const columnDefs = ref<Array<object>>([])
const localStorageData = ref<Array<object>>([])
const tableElement = ref<HTMLElement | null>(null)
const dataInfo =  ref<HTMLElement | null>(null)

const linearData = ref({
  labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
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
    primaryDataProcessing()
  }

})

const resizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    dataInfo.value && (dataInfo.value.style.height = entry.contentBoxSize[0].blockSize + 144 + 'px')
  }
});


async function loadJsonDataFromUrl(url: string): Promise<void> {
  isDataLoading.value = true
  await new getData().loadData(url)
  .then((data: Array<object>) => {
    localStorage.setItem('loadedData', JSON.stringify(data))
    primaryDataProcessing(data)
    localStorageData.value = JSON.parse(localStorage.getItem("loadedData") || '{}')
  })
  .catch((error) => {
    console.error(error)
  })
  isDataLoading.value = false
}

function getColumns(data: Array<object>): void {
  const columnsSet = new Set()
  data.forEach(el => {
      Object.keys(el).forEach(async(key) => {
        columnsSet.add( JSON.stringify({
            headerName: key,
            field: key,
            flex: 1,
            minWidth : 200,
            cellStyle : { 'text-overflow':'ellipsis', 'overflow': 'hidden', }
          }))
      })
    })
  columnDefs.value = Array.from(columnsSet).map((el: string) => JSON.parse(el))
}

function clearLocalStorage(): void {
  localStorage.clear()
  localStorageData.value = null
}

function primaryDataProcessing(data?: Array<object>): void{
  getColumns(data ?? localStorageData.value)
  loadedData.value = JSON.stringify(data ?? localStorageData.value, undefined, 2)
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