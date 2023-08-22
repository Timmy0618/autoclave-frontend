<template>
    <h1>Formula 排程編輯</h1>

    <el-row style="margin-bottom: 20px;">
        <el-input v-model="formulaName" placeholder="Please input" type="text" style="width:200px">
            <template #prepend>Name :</template>
        </el-input>
    </el-row>

    <el-row style="margin-bottom: 20px;">
        <el-table :data="formulaDetail" border style="width: 100%">
            <el-table-column label="Sequence">
                <template #default="scope">
                    <div style="display: flex; align-items: center">
                        <span style="margin-left: 10px">{{ scope.$index + 1 }}</span>
                    </div>
                </template>
            </el-table-column>

            <el-table-column label="Pressure">
                <template #default="scope">
                    <div style="display: flex; align-items: center">
                        <!-- <span style="margin-left: 10px">{{ scope.row.pressure }}</span> -->
                        <el-input v-model="scope.row.pressure" placeholder="Please input" type="number">
                            <template #append>kpa</template>
                        </el-input>
                    </div>
                </template>
            </el-table-column>

            <el-table-column label="Process Time">
                <template #default="scope">
                    <div style="display: flex; align-items: center">
                        <!-- <span style="margin-left: 10px">{{ scope.row.processTime }}</span> -->
                        <el-input v-model="scope.row.processTime" placeholder="Please input" type="number">
                            <template #append>min</template>
                        </el-input>
                    </div>
                </template>
            </el-table-column>
        </el-table>
    </el-row>
    <el-row>
        <el-button type="success" @click="handleComplete">Done</el-button>
        <el-button type="primary" @click="$router.go(-1)">Cancel</el-button>
    </el-row>
</template>
<script lang="ts" setup>
import { ref, onMounted, inject, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router';
const route = useRoute()
const router = useRouter()
const axios: any = inject('axios')  // inject axios

interface formulaDetailI {
    name: string;
    pressure: number;
    processTime: number;
    sequence: number;
}

let formulaDetail = ref<Array<formulaDetailI>>([])
let formulaName = ref('')


const getFormulaDetail = () => {
    const id = route.params.id;
    axios
        .get("/formula/" + id)
        .then(function (response: { data: any }) {
            // handle success
            formulaDetail.value = response.data.data.details;
            formulaName.value = response.data.data.name
        })
        .catch(function (error: {}) {
            // handle error
            console.log(error);
        })
        .then(function () {
            // always executed
        });
}

const handleComplete = () => {
    const id = route.params.id;
    axios
        .patch("/formula/" + id, {
            name: formulaName.value,
            detail: formulaDetail.value,
        })
        .then(function (response: { data: any }) {
            // handle success
            router.back()
            // if (response.data.msg == "Success")
            //     window.location = baseurl + "/html/festo/festo.html";
            // else alert(response.data.msg);
        })
        .catch(function (error: {}) {
            // handle error
            console.log(error);
        })
        .then(function () {
            // always executed
        });
}

watch(() => formulaDetail, (currentValue, oldValue) => {
    for (let i = 0; i < formulaDetail.value.length; i++) {
        if (Number(formulaDetail.value[i]["process_time"]) < 0) {
            formulaDetail.value[i]["process_time"] = 0;
        }
    }
},
    { deep: true }
);

onMounted(() => {
    getFormulaDetail()
})

</script>