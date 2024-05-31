<template>
  <UISectionMain class="bg-[#095683] full-screen h-screen overflow-auto relative">
    <div>
      <div class="grid grid-rows-[auto_1fr] grid-cols-2 gap-[24px]">
        <TableBlock v-for="(data, index) in tablePairsData"
          :row-data="data.rowData"
          :column-data="data.columnData"
          :table-index="index + 1"
        />
      </div>
    </div>
  </UISectionMain>
</template>

<script setup lang="ts">

const tablesData = ref<object>({})
const tablePairsData = ref<Array<object>>([])

onMounted(() => {
  tablesData.value = localStorage.getItem('dataForTables') ? JSON.parse(localStorage.getItem('dataForTables') as string) : {}
  parseData(tablesData.value)
})

function parseData(data: object): void {
  const tablesDataKeyNames = Object.keys(data).filter((el) => {return !el.includes('root')})
  const rootTables = Object.keys(data).filter((el) => {return el.includes('root')})
  fillPairedDataObject(rootTables, data)
  fillPairedDataObject(tablesDataKeyNames, data)
  console.log(tablePairsData.value)
}

function fillPairedDataObject(dataArray: Array<string>, data: object): void {
  for (let i = 0; i < dataArray.length; i = i + 2) {
    const mappedColumns = data[dataArray[i + 1] as keyof typeof data].map((el: object) => {return {
        headerName: el,
        field: el,
        flex: 2,
        minWidth: 200,
        resizable: false,
        cellStyle : { 'text-overflow':'ellipsis', 'overflow': 'hidden', }
      }})
    tablePairsData.value.push({rowData: data[dataArray[i] as keyof typeof data], columnData: mappedColumns})
  }
}
</script>

<style scoped>
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