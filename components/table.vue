<template>
  <ag-grid-vue
    :cache-block-size="cacheBlockSize"
    :column-defs="tableColumnsNames"
    :default-col-def="defaultColDef"
    :pagination="true"
    :pagination-page-size="paginationPageSize"
    :row-class-rules="rowClassRules"
    :row-data="tableRowData"
    :style="tableStyle"
    :suppress-drag-leave-hides-columns="true"
    :suppress-menu-hide="suppressMenuHide"
    :suppress-row-click-selection="suppressRowClickSelection"
    class="ag-theme-quartz h-[700px]"
    enable-range-selection="true"
    suppress-pagination-panel
  ></ag-grid-vue>
</template>

<script lang="ts">
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'
import { AgGridVue } from 'ag-grid-vue3'
import type {
  CellClassParams,
  ColDef,
  RowClassParams,
} from 'ag-grid-community'
import { defineComponent, type PropType, type UnwrapRef } from 'vue'
export default defineComponent({
components: {
   AgGridVue, 
 },
props: {
    height: {
      type: String,
      default: '700px',
    },
    suppressMenuHide: {
      type: Boolean,
      default: false,
    },
    suppressStatusPanel: {
      type: Boolean,
      default: false,
    },
    tableColumnsNames: {
      type: Object as PropType<ColDef[] | UnwrapRef<ColDef[]>>,
      required: true,
    },
    tableRowData: {
      type: Object as PropType<Array<string>>,
      default: () => {
        return {}
      },
    },
    defaultColDef: {
      type: Object as PropType<Array<string>>,
      required: false,
      default: () => {
        return {
          enableValue: true,
          // allow every column to be grouped
          enableRowGroup: true,
          // allow every column to be pivoted
          enablePivot: true,
          resizable: true,
          sortable: true,
          filter: 'agTextColumnFilter',
          menuTabs: ['filterMenuTab'],
          cellStyle: {
            display: 'flex',
            'align-items': 'center',
            overflow: 'visible',
          },
          cellClass: (params: CellClassParams) =>
            params.colDef.editable ? null : 'no-border',
          headerClass: '!overflow-visible w-full',
        } as ColDef
      },
    },
    gridOptions: {
      type: Object,
      default: () => ({
        statusBar: {
          statusPanels: [],
          autoSizeStrategy: {
            type: 'fitGridWidth',
            defaultMinWidth: 100,
            columnLimits: [
              {
                colId: 'country',
                minWidth: 900,
              },
            ],
          },
        },
      }),
    },
    fullheight: Boolean,
    rowClassRules: {
      type: Object as PropType<
        Record<string, (params: RowClassParams) => boolean>
      >,
      required: false,
      default: () => ({
        selected: (params: RowClassParams) => params.data?.selection,
      }),
    },
    paginationPageSize: [String, Number],
    cacheBlockSize: [String, Number],
    suppressRowClickSelection: { type: Boolean, default: false },
  },
   data() {
    return {
      changes: 0,
      rowSelection: 'single',
      inner_height: window.innerHeight,
    }
  },
  computed: {
    tableStyle() {
      if (this.fullheight) {
        let h = this.inner_height - this.offsetTop - 30
        return {
          height: h + 'px',
        }
      }
      return {
        height: this.height,
      }
    }
  },
  mounted() {
    setTimeout(() => {
      this.offsetTop = this.$el.getBoundingClientRect().top
    }, 100)
    this.getWindowSize()
    window.addEventListener('resize', this.getWindowSize)
  },
  methods: {
    getWindowSize() {
      if (this.inner_height != window.innerHeight) {
        this.inner_height = window.innerHeight
      }
    },
  }
})
</script>
