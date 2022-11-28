<template>
    <h1>Festo 名單</h1>
    <el-table row-class-name="primary-row" :data="formulaData" border style="width: 100%"
        @current-change="handleCurrentChange">
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
                <el-button size="small" type="success" @click="handleEdit(scope.row.id)">Start</el-button>
                <el-button size="small" type="danger" @click="handleDelete(scope.row.id)">Stop</el-button>
            </template>
        </el-table-column>
    </el-table>


</template>

<script lang="ts" setup>
import { ref, inject } from 'vue'
const axios: any = inject('axios')  // inject axios

interface formula {
    create_time: Date;
    id: number;
    name: string;
    update_time: Date;
}

let formulaData = ref<Array<formula>>([])

const handleCurrentChange = (formula: formula) => {
    // getFestoSchedule(formula.id)
}

const handleEdit = (id: number) => {
    axios
        .patch("/festo/status/" + id, { option: "start" })
        .then(function (response: { data: any }) {
            // handle success
            if (response.data.Msg == "Success") {
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


</script>