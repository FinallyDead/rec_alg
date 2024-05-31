<template>
  <div 
    class="bg-gradient-to-b from-[#3bbaf5] to-[#05669f] border-[#0581c4] w-full h-fit p-6 rounded space-y-[24px]"
    :class="{'!h-[700px]': rowData?.length <= 0}"
  >
    <p class="text-[36px] font-medium text-white text-sans">
      Таблица {{ tableIndex }}
    </p>
    <Table 
      v-if="rowData?.length > 0" 
      :table-row-data="rowData"
      :table-columns-names="columnData"
      :pagination-page-size="200"
      fullheight
    />
    <p v-else class="text-[36px] w-fit font-medium text-white text-sans align-center text-align-center mx-auto">
      Нет данных
    </p>
  </div>
</template>

<script setup lang="ts">

const props = defineProps({
  rowData: {
    type: Array<object>,
    default: () => []
  },
  columnData: {
    type: Array<object>,
    default: () => []
  },
  tableIndex: {
    type: Number,
    default: 0
  }
})
</script>

<style scoped>

</style>