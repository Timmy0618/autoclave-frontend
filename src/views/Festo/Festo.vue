<template>
    <h1>Festo 名單</h1>
    <el-row style="margin-bottom: 20px;">
        <el-table :data="festoData" border style="width: 100%" table-layout="auto" :header-cell-style="{ background: '#faecd8' }"
            @current-change="handleCurrentChange">
            <el-table-column label="Name">
                <template #default="scope">
                    <div style="display: flex; align-items: center">
                        <span style="margin-left: 10px">{{ scope.row.name }}</span>
                    </div>
                </template>
            </el-table-column>

            <el-table-column label="ID">
                <template #default="scope">
                    <div style="display: flex; align-items: center">
                        <span style="margin-left: 10px">{{ scope.row.slaveId }}</span>
                    </div>
                </template>
            </el-table-column>

            <el-table-column label="Formula">
                <template #default="scope">
                    <div style="display: flex; align-items: center">
                        <el-dropdown @command="handleDropdown">
                            <span class="el-dropdown-link">
                                {{ scope.row.formulaName }}
                                <el-icon class="el-icon--right">
                                    <arrow-down />
                                </el-icon>
                            </span>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <template v-for="data,index in formulaData">
                                        <el-dropdown-item :command={formulaId:data.id,festoId:scope.row.id}>
                                            {{data.name}}
                                        </el-dropdown-item>
                                    </template>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>

                        <!-- <span style="margin-left: 10px">{{ scope.row.formulaName }}</span> -->
                    </div>
                </template>
            </el-table-column>

            <el-table-column label="Action">
                <template #default="scope">
                    <el-button type="success" @click="handleStart(scope.row.id)">Start</el-button>
                    <el-button type="danger" @click="handleDelete(scope.row.id)">Stop</el-button>
                </template>
            </el-table-column>
        </el-table>
    </el-row>

    <div style="height: 50px;">
        <h1 style="display: inline">Festo 排程資訊</h1>
        <RouterLink :to="selectedId">
            <el-button v-if="festoSchedule.length" type="primary">
                Edit
            </el-button>
        </RouterLink>
    </div>

    <el-table :data="festoSchedule" border style="width: 100%" table-layout="auto" :header-cell-style="{ background: '#faecd8' }">
        <el-table-column label="Name">
            <template #default="scope">
                <div style="display: flex; align-items: center">
                    <span style="margin-left: 10px">{{ scope.row.name }}</span>
                </div>
            </template>
        </el-table-column>

        <el-table-column label="Sequence">
            <template #default="scope">
                <div style="display: flex; align-items: center">
                    <span style="margin-left: 10px">{{ scope.row.sequence + 1 }}</span>
                </div>
            </template>
        </el-table-column>

        <el-table-column label="Pressure">
            <template #default="scope">
                <div style="display: flex; align-items: center">
                    <span style="margin-left: 10px">{{ scope.row.pressure }} kpa</span>
                </div>
            </template>
        </el-table-column>

        <el-table-column label="Process Time">
            <template #default="scope">
                <div style="display: flex; align-items: center">
                    <span style="margin-left: 10px">{{ scope.row.processTime }} min</span>
                </div>
            </template>
        </el-table-column>

        <el-table-column label="Start Time">
            <template #default="scope">
                <div style="display: flex; align-items: center">
                    <span style="margin-left: 10px">{{ scope.row.time_start }}</span>
                </div>
            </template>
        </el-table-column>

        <el-table-column label="End Time">
            <template #default="scope">
                <div style="display: flex; align-items: center">
                    <span style="margin-left: 10px">{{ scope.row.time_end }}</span>
                </div>
            </template>
        </el-table-column>

        <el-table-column label="Status">
            <template #default="scope">
                <div style="display: flex; align-items: center">
                    <el-tag :type="handleTag(scope.row.status)">
                        {{ statusMap[scope.row.status] }}
                    </el-tag>
                </div>
            </template>
        </el-table-column>

        <el-table-column label="Check">
            <template #default="scope">
                <div style="display: flex; align-items: center" >
                    <el-checkbox v-model="scope.row.checkPressure" label="" size="large" border @change="handleCheckbox(scope.row.id)"/>
                </div>
            </template>
        </el-table-column>
    </el-table>
</template>

<script lang="ts" setup>
import { ref, onMounted, inject } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { ArrowDown } from '@element-plus/icons-vue'
const axios: any = inject('axios')  // inject axios
const router = useRouter()

interface festo {
    formulaName: string
    id: number
    name: string
    slaveId: number
}

interface festoDetail {
    id: number;
    name: string;
    pressure: number;
    processTime: number;
    sequence: number;
    status: number;
    checkPressure: boolean;
    time_end: Date;
    time_start: Date;
}

interface formula {
    create_time: Date;
    id: number;
    name: string;
    update_time: Date;
}

const statusMap = { 0: 'Waiting', 1: 'Executing', 2: 'End' }
let festoData = ref<Array<festo>>([])
let festoSchedule = ref<Array<festoDetail>>([])
let formulaData = ref<Array<formula>>([])
let selectedId = ref<{}>({})

const handleStart = (id: number) => {
    axios
        .patch("/festo/status/" + id, { option: "start" })
        .then(function (response: { data: any }) {
            // handle success
            if (response.data.Msg == "Success") {
                getFestoSchedule(id)
                return;
            } else alert(response.data.Msg);
        })
        .catch(function (error: { data: any }) {
            // handle error
            console.log(error);
        })
        .then(function () {
            // always executed
        });
}

const handleDelete = (id: number) => {
    axios
        .patch("/festo/status/" + id, { option: "stop" })
        .then(function (response: { data: any }) {
            // handle success
            if (response.data.Msg == "Success") {
                getFestoSchedule(id)
                return;
            } else alert(response.data.Msg);
        })
        .catch(function (error: { data: any }) {
            // handle error
            console.log(error);
        })
        .then(function () {
            // always executed
        });
}

const handleCurrentChange = (festo: festo) => {
    getFestoSchedule(festo.id)
}

const handleDropdown = (obj: { formulaId: number, festoId: number }) => {
    console.log(obj);

    axios
        .patch("/festo/" + obj.festoId, { formulaId: obj.formulaId })
        .then(function (response: { data: any }) {
            // handle success
            if (response.data.Msg == "Success") {
                getFestoSchedule(obj.festoId);
                getFestoList();
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

const getFestoSchedule = (id: number) => {
    selectedId.value = { name: 'festoEdit', params: { id: id } }
    axios
        .get("/festo/" + id)
        .then(function (response: { data: any }) {
            // handle success
            if(response.data.Msg == 'Success')
                festoSchedule.value = response.data.Data;
            else
                alert(response.data.Msg)
        })
        .catch(function (error: {}) {
            // handle error
            console.log(error);
        })
        .then(function () {
            // always executed
        });
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

const getFormula = () => {
    axios
        .get("/formula")
        .then(function (response: { data: any }) {
            // handle success
            formulaData.value = response.data.Data;

        })
        .catch(function (error: {}) {
            // handle error
            console.log(error);
        })
        .then(function () {
            // always executed
        });
}

const handleTag = (status: number) => {
    let type = ''
    switch (status) {
        case 0:
            type = 'warning'
            break;
        case 1:
            type = ''
            break;
        case 2:
            type = 'info'
            break;
    }
    return type
}

const handleCheckbox = (id: number) =>{
    axios
        .patch("/schedule/checkPressure/" + id)
        .then(function (response: { data: any }) {
            // handle success
            if(response.data.Msg == "Success")
                return
            else
                alert(response.data.Msg)
        })
        .catch(function (error: {}) {
            // handle error
            console.log(error);
        })
        .then(function () {
            // always executed
        });
}

onMounted(() => {
    getFestoList()
    getFormula()
})
</script>

<style>
.el-table .primary-row {
    --el-table-tr-bg-color: var(--el-color-primary-light-9);
}

.el-table .success-row {
    --el-table-tr-bg-color: var(--el-color-success-light-9);
}
</style>