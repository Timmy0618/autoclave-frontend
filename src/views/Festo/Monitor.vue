<template>
  <audio hidden="true" ref="audio" controls>
    <source src="../../assets/beep-warning.mp3" type="audio/mpeg" />
  </audio>

  <h1>Festo 監控</h1>
  <el-row style="margin-bottom: 20px">
    <span>最後更新時間：{{ lastUpdateTime }}</span>
  </el-row>
  <el-row>
    <el-col v-for="(monitorData, index) in monitorList" :span="5" :offset="1">
      <el-card style="margin-bottom: 20px">
        <el-descriptions
          :title="monitorData.name"
          :column="1"
          border
          size="large"
        >
          <el-descriptions-item
            label="Formula"
            label-align="left"
            align="center"
            label-class-name="my-label"
            class-name="my-content"
            width="150px"
            >{{ monitorData.formulaName }}</el-descriptions-item
          >
          <el-descriptions-item
            label="Sequence"
            label-align="left"
            align="center"
            >{{ monitorData.sequence + 1 }}
          </el-descriptions-item>
          <el-descriptions-item
            label="Dst Pressure"
            label-align="left"
            align="center"
            >{{ monitorData.dstPressure }} kpa
          </el-descriptions-item>
          <el-descriptions-item
            label="Now Pressure"
            label-align="left"
            align="center"
          >
            {{ monitorData.currentPressure ?? 0 }} kpa</el-descriptions-item
          >
          <el-descriptions-item
            label="Delay Time"
            label-align="left"
            align="center"
          >
            <el-tag class="mx-1" size="large" :type="warningTag[monitorData.id]"
              >{{ monitorData.warningTime }} min</el-tag
            >
          </el-descriptions-item>
          <el-descriptions-item
            label="Status"
            label-align="left"
            align="center"
          >
            <el-tag size="large" :type="handleTag(monitorData.status)"
              >{{ statusMap[monitorData.status] }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>
    </el-col>
  </el-row>
</template>

<script lang="ts" setup>
import { ref, onMounted, inject, watch } from "vue";
import { onBeforeRouteLeave } from "vue-router";

const audio = ref<HTMLAudioElement>();
const axios: any = inject("axios"); // inject axios
let checkPage = true;

interface monitor {
  checkPressure: boolean;
  currentPressure: number;
  dstPressure: number;
  formulaName: string;
  id: number;
  name: string;
  sequence: number;
  warningTime: number;
  warningTimeLimit: number;
  status: number;
}

let monitorList = ref<Array<monitor>>([]);
let warningTag = ref([]);
let lastUpdateTime = ref("");
const statusMap = { 0: "Waiting", 1: "Executing", 2: "End" };

// For todays date;
Date.prototype.today = function () {
  return (
    (this.getDate() < 10 ? "0" : "") +
    this.getDate() +
    "/" +
    (this.getMonth() + 1 < 10 ? "0" : "") +
    (this.getMonth() + 1) +
    "/" +
    this.getFullYear()
  );
};

// For the time now
Date.prototype.timeNow = function () {
  return (
    (this.getHours() < 10 ? "0" : "") +
    this.getHours() +
    ":" +
    (this.getMinutes() < 10 ? "0" : "") +
    this.getMinutes() +
    ":" +
    (this.getSeconds() < 10 ? "0" : "") +
    this.getSeconds()
  );
};

const handleTag = (status: number) => {
  let type = "";
  switch (status) {
    case 0:
      type = "warning";
      break;
    case 1:
      type = "";
      break;
    case 2:
      type = "info";
      break;
  }
  return type;
};

const getMonitorData = async () => {
  axios
    .get("/festo/monitor")
    .then(function (response: { data: any }) {
      // handle success
      if (response.data.Msg == "Success") {
        lastUpdateTime.value = new Date().timeNow();
        monitorList.value = response.data.Data;
        monitorList.value.forEach((element) => {
          warningTag.value[element.id] = "success";
        });
      } else {
        alert(response.data.Msg);
      }
    })
    .catch(function (error: {}) {
      // handle error
      console.log(error);
    })
    .then(function () {
      // always executed
    });
};

const sleep = async (ms = 0) => {
  return new Promise((r) => setTimeout(r, ms));
};

const getInterval = async () => {
  while (checkPage) {
    await getMonitorData();
    await sleep(10000);
  }
};

watch(
  () => monitorList, // 檢查warning time 有無需要警報
  (currentValue, oldValue) => {
    monitorList.value.forEach((element) => {
      if (element.checkPressure && element.status != 2 && element.warningTime >= element.warningTimeLimit) {
        warningTag.value[element.id] = "danger";
        audio.value?.play();
      }
    });
  },
  { deep: true }
);

onBeforeRouteLeave((to, from) => {
  checkPage = false;
});

onMounted(() => {
  getInterval();
});
</script>

<style scoped></style>
