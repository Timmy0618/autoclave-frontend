<template>
  <h1>Festo 排程編輯</h1>
  <el-row style="margin-bottom: 20px">
    <el-table
      row-class-name="primary-row"
      :data="festoSchedule.scheduleDetails"
      border
      style="width: 100%"
    >
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
            <el-input
              v-model="scope.row.pressure"
              placeholder="Please input"
              type="number"
            >
              <template #append>kpa</template>
            </el-input>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Process Time">
        <template #default="scope">
          <div style="display: flex; align-items: center">
            <!-- <span style="margin-left: 10px">{{ scope.row.processTime }}</span> -->
            <el-input
              v-model="scope.row.processTime"
              placeholder="Please input"
              type="number"
            >
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
import { ref, onMounted, inject, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
const route = useRoute();
const router = useRouter();
const axios: any = inject("axios"); // inject axios

interface festoDetail {
  id: number;
  pressure: number;
  processTime: number;
  scheduleDetails: ScheduleDetails[];
}

interface ScheduleDetails {
  id: number;
  pressure: number;
  processTime: number;
  resetTimes: number;
  timeEnd: number;
  timeStart: number;
}

let festoSchedule = ref<Array<festoDetail>>([]);

const getFestoSchedule = () => {
  const id = route.params.id;
  axios
    .get("/schedule/" + id)
    .then(function (response: { data: any }) {
      // handle success
      festoSchedule.value = response.data.data;
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
  const id = route.params.id;
  axios
    .patch("/schedule/detail", festoSchedule.value.scheduleDetails)
    .then(function (response: { data: any }) {
      // handle success
      if (response.data.msg == "Success") router.back();
      else alert(response.data.msg);
    })
    .catch(function (error: {}) {
      // handle error
      console.log(error);
    })
    .then(function () {
      // always executed
    });
};

watch(
  () => festoSchedule,
  (currentValue, oldValue) => {
    for (let i = 0; i < festoSchedule.value.length; i++) {
      if (Number(festoSchedule.value[i]["processTime"]) < 0) {
        festoSchedule.value[i]["processTime"] = 0;
      }
    }
  },
  { deep: true }
);

onMounted(() => {
  getFestoSchedule();
});
</script>
