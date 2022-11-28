<template>
    <h1>Formula 排程新增</h1>

    <el-row style="margin-bottom: 20px;" :gutter="20">
        <el-col :span="4">
            <el-input v-model="formulaName" placeholder="Please input" type="text">
                <template #prepend>Name :</template>
            </el-input>
        </el-col>
        <el-col :span="4">
            <el-input v-model="formulaCount" placeholder="Please input" type="number">
                <template #prepend>Number :</template>
            </el-input>
        </el-col>
    </el-row>

    <el-row style="margin-bottom: 20px;">
        <el-table :data="formulaData" border style="width: 100%">
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
                        <el-input v-model="scope.row.process_time" placeholder="Please input" type="number">
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
import { useRouter, useRoute } from 'vue-router';
import { ref, onMounted, inject, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Action } from 'element-plus'
const router = useRouter()
const axios: any = inject('axios')  // inject axios

interface postData {
    name: string;
    detail: detail[];
}

interface detail {
    pressure: number;
    process_time: number;
}


let formulaCount = ref<number>(0)
let formulaName = ref<string>('')
let formulaData = ref<Array<detail>>([])

const alterBox = (msg: string) => {
    ElMessage({
        type: 'error',
        message: msg,
    })
}

const handleComplete = () => {
    if (formulaName.value === '') {
        alterBox('Please Input Name')
        return
    }

    if (formulaData.value.length <= 0) {
        alterBox('Formula can not be empty')
        return
    }

    let postData = {
        name: formulaName.value,
        detail: formulaData.value
    }

    axios
        .post("/formula", postData)
        .then(function (response: { data: any }) {
            // handle success
            if (response.data.Msg == "Success") router.go(-1);
            else alert(response.data.Msg);
        })
        .catch(function (error: {}) {
            // handle error
            console.log(error);
        })
        .then(function () {
            // always executed
        });
}

watch(() => formulaData, (currentValue, oldValue) => {
    for (let i = 0; i < formulaData.value.length; i++) {
        if (Number(formulaData.value[i]["process_time"]) < 0) {
            formulaData.value[i]["process_time"] = 0;
        }
    }
},
    { deep: true },
);

watch(formulaCount, (curVal, oldVal) => {

    if (curVal > 10) {
        formulaCount.value = 10;
        return
    }
    if (curVal < 0) {
        formulaCount.value = 0;
        return
    }


    let temp = []
    for (let i = 0; i < curVal; i++) {
        if (formulaData.value[i]) {
            temp.push(formulaData.value[i])
        }
        else {
            temp.push({
                pressure: 0,
                process_time: 0
            })
        }
    }

    formulaData.value = temp
}
)

onMounted(() => {
})
</script>