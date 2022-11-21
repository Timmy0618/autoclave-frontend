<template>
    <el-row style="margin-bottom: 20px;" :gutter="20" justify="start">
        <el-col :span="2">
            <div style="display: flex; align-items: center">
                <el-dropdown @command="handleDropdown">
                    <span class="el-dropdown-link">
                        {{ selectedSlaveName }}
                        <el-icon class="el-icon--right">
                            <arrow-down />
                        </el-icon>
                    </span>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <template v-for="data, index in festoData">
                                <el-dropdown-item :command="index">{{ data.name }}</el-dropdown-item>
                            </template>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>
        </el-col>
        <el-col :span="8">
            <div class="block">
                <span class="demonstration">Date：　</span>
                <el-date-picker v-model="date" type="daterange" unlink-panels range-separator="To"
                    start-placeholder="Start date" end-placeholder="End date" :shortcuts="shortcuts" size="large" />
            </div>
        </el-col>
        <el-col :span="1">
            <el-button :icon="Search" circle @click="handleSearch"></el-button>
        </el-col>

        <el-col :span="1">
            <el-button type="primary" plan @click="handleExport" :disabled='exportDisabled'>Export</el-button>
        </el-col>
    </el-row>

    <el-row v-if="historyList.length">
        <template v-for="history, index in historyList">
            <template v-for="data, index in history">
                <el-col v-if="data.length > 0">
                    <span>
                        {{ index }}
                    </span>
                    <Chart :size="{ width: 720, height: 420 }" :data="data" :margin="margin" :direction="direction"
                        :axis="axis">
                        <template #layers>
                            <Grid strokeDasharray="2,2" />
                            <Line :dataKeys="['time', 'avgPressure']" :lineStyle="{ stroke: 'red' }" />
                            <!-- <LabelsLayer :dataKeys="['time', 'avgPressure']" /> -->
                        </template>
                    </Chart>
                </el-col>

            </template>
        </template>
    </el-row>
</template>
  

<script lang="ts" setup>
import { ArrowDown } from '@element-plus/icons-vue'
import { ref, inject, onMounted, defineComponent } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { Chart, Grid, Line } from 'vue3-charts'
// import LabelsLayer from './LabelsLayer.vue'
import { ElMessage } from 'element-plus'

const axios: any = inject('axios')  // inject axios

interface festo {
    formulaName: string
    id: number
    name: string
    slaveId: number
}

const exportDisabled = ref(false)
const date = ref('')
const selectedSlaveName = ref("Festo Name")
let festoData = ref<Array<festo>>([])
let slaveId: Number

const shortcuts = [
    {
        text: 'Last day',
        value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24)
            return [start, end]
        },
    },
    {
        text: 'Last 3 days',
        value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 3)
            return [start, end]
        },
    }
]

const historyList = ref([])
const direction = ref('horizontal')
const margin = ref({
    left: 0,
    top: 20,
    right: 20,
    bottom: 0
})

const axis = ref({
    primary: {
        type: 'band',
        format: (val: string) => {
            if (val === 'Feb') {
                return '😜'
            }
            return val
        }
    },
    secondary: {
        domain: ['dataMin', 'dataMax + 100'],
        type: 'linear',
        ticks: 8
    }
})

const handleDropdown = (index: number) => {
    selectedSlaveName.value = festoData.value[index]["name"]
    slaveId = festoData.value[index]["id"]
}

const getFestoList = () => {
    axios
        .get("/festo")
        .then(function (response: { data: any }) {
            // handle success
            festoData.value = response.data.Data
        })
        .catch(function (error: { data: any }) {
            // handle error
            console.log(error);
        })
        .then(function () {
            // always executed
        });
}

const handleSearch = async () => {
    if (!await checkInput())
        return

    let start = date.value[0]
    let end = date.value[1]
    start = `${start.getFullYear()}-${start.getMonth() + 1}-${start.getDate()} 00:00:00`
    end = `${end.getFullYear()}-${end.getMonth() + 1}-${end.getDate()} 23:59:59`

    axios
        .post("/festo/history", { slaveId: slaveId, startTime: start, endTime: end, offset: 0 })
        .then(function (response: { data: any }) {
            // handle success
            if (response.data.Msg == "Success") {
                historyList.value = response.data.Data
                return;
            } else alert(response.data.Msg);
        })
        .catch(function (error: {}) {
            // handle error
            console.log(error);
        })
        .then(function () {
            // always executed
        });

}

const handleExport = async () => {
    if (!await checkInput())
        return

    let start = date.value[0]
    let end = date.value[1]
    start = `${start.getFullYear()}-${start.getMonth() + 1}-${start.getDate()} 00:00:00`
    end = `${end.getFullYear()}-${end.getMonth() + 1}-${end.getDate()} 23:59:59`
    ElMessage({
        message: 'Start Export.',
        type: 'success',
    })

    exportDisabled.value = true
    axios
        .post("/festo/export", { slaveId: slaveId, startTime: start, endTime: end, offset: 0 }, { responseType: 'blob' })
        .then(function (res: any, fileName: Text) {
            if (res.headers["content-type"].includes("application/json")) {
                ElMessage({
                    message: "Export Fail.",
                    type: 'warning',
                })
            }
            else {
                const url = window.URL.createObjectURL(new Blob([res.data]));
                const link = document.createElement('a');
                link.href = url;
                link.style.display = 'none'
                const fileName = `festo${slaveId}_${start}_${end}.csv`
                link.setAttribute('download', fileName);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                ElMessage({
                    message: 'Export Done.',
                    type: 'success',
                })
            }
        })
        .catch(function (error: {}) {
            // handle error
            console.log(error);
        })
        .then(function () {
            // always executed
            exportDisabled.value = false
        });
}

const alterBox = (msg: string) => {
    ElMessage({
        type: 'error',
        message: msg,
    })
}

const checkInput = async () => {

    let flag = true
    if (!date.value[0] || !date.value[1]) {
        alterBox('Please Select Date')
        flag = false
    } else {
        var difference = Math.abs(date.value[0].getTime() - date.value[1].getTime());
        let diffDays = difference / (1000 * 3600 * 24)
        if (diffDays > 7) {
            alterBox('Date limit > 7')
            flag = false
        }
    }

    if (selectedSlaveName.value === "Festo Name") {
        alterBox('Please Select Festo')
        flag = false
    }

    return flag
}

onMounted(() => {
    getFestoList()
})


</script>

<style scoped>
.demo-date-picker {
    display: flex;
    width: 100%;
    padding: 0;
    flex-wrap: wrap;
}

.demo-date-picker .block {
    padding: 30px 0;
    text-align: center;
    border-right: solid 1px var(--el-border-color);
    flex: 1;
}

.demo-date-picker .block:last-child {
    border-right: none;
}

.demo-date-picker .demonstration {
    display: block;
    color: var(--el-text-color-secondary);
    font-size: 14px;
    margin-bottom: 20px;
}

.example-showcase .el-dropdown-link {
    cursor: pointer;
    color: var(--el-color-primary);
    display: flex;
    align-items: center;
}
</style>