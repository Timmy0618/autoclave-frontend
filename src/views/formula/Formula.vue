<template>
    <div style="height: 50px;">
        <h1 style="display: inline">Formula 名單</h1>
        <el-button type="primary" @click="handleAdd">
            Add
        </el-button>
    </div>
    <el-table :data="formulaData" border style="width: 100%" @current-change="handleCurrentChange" table-layout="auto" :header-cell-style="{ background: '#d9ecff' }">
        <el-table-column label="Name">
            <template #default="scope">
                <div style="display: flex; align-items: center">
                    <span style="margin-left: 10px">{{ scope.row.name }}</span>
                </div>
            </template>
        </el-table-column>

        <el-table-column label="Create Time">
            <template #default="scope">
                <div style="display: flex; align-items: center">
                    <span style="margin-left: 10px">{{ scope.row.create_time }}</span>
                </div>
            </template>
        </el-table-column>

        <el-table-column label="Update Time">
            <template #default="scope">
                <div style="display: flex; align-items: center">
                    <span style="margin-left: 10px">{{ scope.row.update_time }}</span>
                </div>
            </template>
        </el-table-column>

        <el-table-column label="Action">
            <template #default="scope">
                <el-button type="primary" @click="handleEdit(scope.row.id)">Edit</el-button>
                <el-button type="danger" @click="handleDelete(scope.row.id)">Delete</el-button>
            </template>
        </el-table-column>
    </el-table>

    <h1>Formula 排程資訊</h1>
    <el-table :data="formulaDetail" border style="width: 100%" table-layout="auto" :header-cell-style="{ background: '#d9ecff' }">
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
                    <span style="margin-left: 10px">{{ scope.row.process_time }} min</span>
                </div>
            </template>
        </el-table-column>
    </el-table>
</template>

<script lang="ts" setup>
import { ref, onMounted, inject } from 'vue'
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const axios: any = inject('axios')  // inject axios

interface formula {
    create_time: Date;
    id: number;
    name: string;
    update_time: Date;
}
interface formulaDetailI {
    name: string;
    pressure: number;
    process_time: number;
    sequence: number;
}

let formulaData = ref<Array<formula>>([])
let formulaDetail = ref<Array<formulaDetailI>>([])

const handleCurrentChange = (formula: formula) => {
    if(!formula)
        return
    
    getFormulaDetail(formula.id)
}

const handleAdd = () => {
    router.push({ name: 'formulaAdd' })
}

const handleEdit = (id: number) => {
    router.push({
        name: 'formulaEdit', // 即是 /user 
        params: { id }
    })

}

const handleDelete = (id: number) => {
    ElMessageBox.confirm(
        'Delete Formula Continue?',
        'Warning',
        {
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel',
            type: 'warning',
        }
    )
        .then(() => {
            axios
                .delete("/formula/" + id)
                .then(function (response: { data: any }) {
                    // handle success
                    ElMessage({
                        type: 'success',
                        message: 'Delete completed',
                    })
                    getFormulaList()
                    formulaDetail.value = []
                })
                .catch(function (error: {}) {
                    // handle error
                    console.log(error);
                    ElMessage({
                        type: 'info',
                        message: 'Delete canceled',
                    })
                })
                .then(function () {
                    // always executed
                });

        })
}

const getFormulaList = () => {
    axios
        .get("/formula")
        .then(function (response: { data: any }) {
            // handle success
            formulaData.value = response.data.Data
        })
        .catch(function (error: { data: any }) {
            // handle error
            console.log(error);
        })
        .then(function () {
            // always executed
        });
}

const getFormulaDetail = (id: number) => {
    axios
        .get("/formula/" + id)
        .then(function (response: { data: any }) {
            // handle success
            formulaDetail.value = response.data.Data
        })
        .catch(function (error: { data: any }) {
            // handle error
            console.log(error);
        })
        .then(function () {
            // always executed
        });
}

onMounted(() => {
    getFormulaList()
})
</script>