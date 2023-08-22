<template>
  <div style="height: 50px">
    <h1 style="display: inline">Formula 名單</h1>
    <el-button type="primary" @click="handleAdd"> Add </el-button>
  </div>
  <el-table
    :data="formulaData"
    border
    style="width: 100%"
    @current-change="handleCurrentChange"
    table-layout="auto"
    :header-cell-style="{ background: '#d9ecff' }"
  >
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
          <span style="margin-left: 10px">
            {{ moment.utc(scope.row.createTime).format("YYYY-MM-DD h:mm:ss") }}
          </span>
        </div>
      </template>
    </el-table-column>

    <el-table-column label="Update Time">
      <template #default="scope">
        <div style="display: flex; align-items: center">
          <span style="margin-left: 10px">{{
            moment.utc(scope.row.updateTime).format("YYYY-MM-DD h:mm:ss")
          }}</span>
        </div>
      </template>
    </el-table-column>

    <el-table-column label="Action">
      <template #default="scope">
        <el-button type="primary" @click="handleEdit(scope.row.id)"
          >Edit</el-button
        >
        <el-button type="danger" @click="handleDelete(scope.row.id)"
          >Delete</el-button
        >
      </template>
    </el-table-column>
  </el-table>

  <h1>Formula 排程資訊</h1>
  <el-table
    :data="formulaDetail.details"
    border
    style="width: 100%"
    table-layout="auto"
    :header-cell-style="{ background: '#d9ecff' }"
  >
    <el-table-column label="Sequence">
      <template #default="scope">
        <div style="display: flex; align-items: center">
          <span style="margin-left: 10px">
            {{ scope.row.sequence + 1 }}
          </span>
        </div>
      </template>
    </el-table-column>

    <el-table-column label="Pressure">
      <template #default="scope">
        <div style="display: flex; align-items: center">
          <span style="margin-left: 10px">
            {{ scope.row.pressure }}
            kpa</span
          >
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
  </el-table>
</template>

<script lang="ts" setup>
import { ref, onMounted, inject } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import moment from "moment";

const route = useRoute();
const router = useRouter();
const axios: any = inject("axios"); // inject axios

interface Formula {
  createTime: Date;
  id: number;
  name: string;
  updateTime: Date;
}

interface FormulaDetail {
  name: string;
  details: Details[];
}

interface Details {
  pressure: number;
  processTime: number;
  sequence: number;
}

let formulaData = ref<Array<Formula>>([]);
let formulaDetail = ref<Array<FormulaDetail>>([]);

const handleCurrentChange = (formula: Formula) => {
  if (!formula) return;

  getFormulaDetail(formula.id);
};

const handleAdd = () => {
  router.push({ name: "formulaAdd" });
};

const handleEdit = (id: number) => {
  router.push({
    name: "formulaEdit", // 即是 /user
    params: { id },
  });
};

const handleDelete = (id: number) => {
  ElMessageBox.confirm("Delete Formula Continue?", "Warning", {
    confirmButtonText: "OK",
    cancelButtonText: "Cancel",
    type: "warning",
  }).then(() => {
    axios
      .delete("/formula/" + id)
      .then(function (response: { data: any }) {
        // handle success
        ElMessage({
          type: "success",
          message: "Delete completed",
        });
        getFormulaList();
        formulaDetail.value = [];
      })
      .catch(function (error: {}) {
        // handle error
        console.log(error);
        ElMessage({
          type: "info",
          message: "Delete canceled",
        });
      })
      .then(function () {
        // always executed
      });
  });
};

const getFormulaList = () => {
  axios
    .get("/formula")
    .then(function (response: { data: any }) {
      // handle success
      formulaData.value = response.data.data;
    })
    .catch(function (error: { data: any }) {
      // handle error
      console.log(error);
    })
    .then(function () {
      // always executed
    });
};

const getFormulaDetail = (id: number) => {
  axios
    .get("/formula/" + id)
    .then(function (response: { data: any }) {
      // handle success
      formulaDetail.value = response.data.data;
    })
    .catch(function (error: { data: any }) {
      // handle error
      console.log(error);
    })
    .then(function () {
      // always executed
    });
};

onMounted(() => {
  getFormulaList();
});
</script>
