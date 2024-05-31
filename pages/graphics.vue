<template>
  <UISectionMain class="bg-[#095683] full-screen h-screen overflow-auto relative">
    <div>
      <div class="grid grid-rows-[auto_1fr] grid-cols-2 gap-[24px]">
        <ChartBlock 
          v-for="(data, index) in graphicPairsData"
          :chart-data="data"
          :graphic-index="index + 1"
          :all-graphics-data="graphicPairsData"
        />
      </div>
    </div>
  </UISectionMain>
</template>

<script setup lang="ts">
const graphicData = ref<object>({})
const graphicPairsData = ref<Array<object>>([])

onMounted(() => {
  graphicData.value = localStorage.getItem('dataForGraphics') ? JSON.parse(localStorage.getItem('dataForGraphics') as string) : {}
  parseData(graphicData.value)
})

function parseData(data: object): void {
  const graphicsDataKeyNames = Object.keys(data)
  fillPairedDataObject(graphicsDataKeyNames, data)
}

function fillPairedDataObject(dataArray: Array<string>, data: object): void {
  for (let i = 0; i < dataArray.length; i = i + 2) {
    const randColor = getRandomColor()
    const dataWrapper = 
      {
        backgroundColor: randColor + '80',
        borderColor: randColor,
        data: [...data[dataArray[i + 1] as keyof typeof data]],
        label: `Label № ${i}`,
        yAxisID:"y",
      }
    graphicPairsData.value.push({labels: [...data[dataArray[i] as keyof typeof data]], datasets: [dataWrapper]})
  }
}

function getRandomColor(): string {
  let x=Math.round(0xffffff * Math.random()).toString(16);
  let y=(6-x.length);
  let z="000000";
  let z1 = z.substring(0,y);
  let color= "#" + z1 + x; 
  return color
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