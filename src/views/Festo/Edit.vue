<template>
  <h1>Festo 編輯</h1>

  <el-row style="margin-bottom: 20px">
    <el-descriptions title="" :column="1" border size="large">
      <el-descriptions-item
        label="Festo Name"
        label-align="left"
        align="center"
        label-class-name="my-label"
        class-name="my-content"
        width="150px"
      >
        <template v-if="festoData.length">
          {{ festoData[0].name }}
        </template>
      </el-descriptions-item>

      <el-descriptions-item
        label="Formula"
        label-align="left"
        align="center"
        label-class-name="my-label"
        class-name="my-content"
        width="150px"
      >
        <el-dropdown @command="handleDropdown">
          <span class="el-dropdown-link">
            <template v-if="festoData.length">
              {{ festoData[0].formulaName }}
            </template>
            <el-icon class="el-icon--right">
              <arrow-down />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <template v-for="(data, index) in formulaData">
                <el-dropdown-item
                  :command="{ formulaId: data.id, formulaName: data.name }"
                >
                  {{ data.name }}
                </el-dropdown-item>
              </template>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-descriptions-item>

      <el-descriptions-item
        label="Batch Number"
        label-align="left"
        align="center"
        label-class-name="my-label"
        class-name="my-content"
        width="150px"
      >
        <el-input
          v-model="batchNumber"
          class="w-50 m-2"
          placeholder="Input Batch Number"
        />
      </el-descriptions-item>
    </el-descriptions>
  </el-row>
  <el-row>
    <el-button type="success" @click="handleComplete">Done</el-button>
    <el-button type="primary" @click="$router.go(-1)">Cancel</el-button>
  </el-row>
</template>
<script lang="ts" setup>
import { ref, onMounted, inject, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ArrowDown } from "@element-plus/icons-vue";
const route = useRoute();
const router = useRouter();
const axios: any = inject("axios"); // inject axios
const id = route.params.id;

interface festo {
  id: number;
  formulaName: string;
  formulaId: number;
  batchNumber: string;
  name: string;
  slaveId: number;
}
interface formula {
  create_time: Date;
  id: number;
  name: string;
  update_time: Date;
}

let festoData = ref<Array<festo>>([]);
let formulaData = ref<Array<formula>>([]);
let batchNumber = ref("");
let formulaId = 0;

const getFesto = (id: number) => {
  axios
    .get("/festo/" + id)
    .then(function (response: { data: any }) {
      // handle success
      festoData.value = response.data.Data;
      formulaId = festoData.value[0].formulaId;
      batchNumber.value = festoData.value[0].batchNumber;
    })
    .catch(function (error: { data: any }) {
      // handle error
      console.log(error);
    })
    .then(function () {
      // always executed
    });
};

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
};

const handleComplete = () => {
  console.log(formulaId, batchNumber.value);
  axios
    .patch("/festo/" + id, { formulaId: formulaId, batchNumber: batchNumber.value })
    .then(function (response: { data: any }) {
      // handle success
      if (response.data.Msg == "Success") router.back();
      else alert(response.data.Msg);
    })
    .catch(function (error: {}) {
      // handle error
      console.log(error);
    })
    .then(function () {
      // always executed
    });
};

const handleDropdown = async (obj: {
  formulaId: number;
  formulaName: string;
}) => {
  formulaId = obj.formulaId;
  festoData.value[0].formulaName = obj.formulaName;
};

onMounted(() => {
  getFesto(id);
  getFormula();
});
</script>
