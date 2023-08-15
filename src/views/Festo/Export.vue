<template>
  <el-row style="margin-bottom: 20px" :gutter="20" justify="start">
    <el-col :span="7">
      <div class="block">
        <span class="demonstration">Date：　</span>
        <el-date-picker
          v-model="date"
          @change="selectDate"
          type="daterange"
          unlink-panels
          range-separator="To"
          start-placeholder="Start date"
          end-placeholder="End date"
          :shortcuts="shortcuts"
          size="large"
        />
      </div>
    </el-col>

    <el-col :span="1">
      <!-- <el-dropdown split-button type="primary" @command="handleType">
        Default
      </el-dropdown> -->
      <el-dropdown @command="handleBatch">
        <span class="el-dropdown-link">
          {{ batchNumber }}
          <el-icon class="el-icon--right">
            <arrow-down />
          </el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <template v-for="batch in batchList">
              <el-dropdown-item :command="batch">
                {{ batch }}
              </el-dropdown-item>
            </template>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </el-col>

    <el-col :span="1">
      <!-- <el-dropdown split-button type="primary" @command="handleType">
        Default
      </el-dropdown> -->
      <el-dropdown @command="handleType">
        <span class="el-dropdown-link">
          {{ type }}
          <el-icon class="el-icon--right">
            <arrow-down />
          </el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="hour"> hour </el-dropdown-item>
            <el-dropdown-item command="min"> min </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </el-col>

    <el-col :span="1">
      <el-button :icon="Search" circle @click="handleSearch"></el-button>
    </el-col>

    <el-col :span="1">
      <el-button
        type="primary"
        plan
        @click="handleExport"
        :disabled="exportDisabled"
        >Export</el-button
      >
    </el-col>
  </el-row>

  <el-row v-if="historyList.length">
    <template v-for="(history, index) in historyList">
      <template v-for="(data, index) in history">
        <el-col v-if="data.length > 0">
          <span>
            {{ index }}
          </span>
          <Chart
            :size="{ width: 1080, height: 420 }"
            :data="data"
            :margin="margin"
            :direction="direction"
            :axis="axis"
          >
            <template #layers>
              <Grid strokeDasharray="2,2" />
              <Line
                :dataKeys="['time', 'avgPressure']"
                :lineStyle="{ stroke: 'red' }"
              />
              <!-- <LabelsLayer :dataKeys="['time', 'avgPressure']" /> -->
            </template>

            <template #widgets>
              <Tooltip
                borderColor="#48CAE4"
                :config="{
                  name: { hide: true },
                  avgPressure: { color: '#0077b6' },
                  formulaName: { color: 'red' },
                  time: { color: 'green' },
                  inc: { hide: true },
                }"
              />
            </template>
          </Chart>
        </el-col>
      </template>
    </template>
  </el-row>
</template>

<script lang="ts" setup>
import { ref, inject, onMounted, defineComponent } from "vue";
import { Search } from "@element-plus/icons-vue";
import { Chart, Grid, Line, Tooltip } from "vue3-charts";
// import LabelsLayer from './LabelsLayer.vue'
import { ElMessage } from "element-plus";
import { ArrowDown } from "@element-plus/icons-vue";
import moment from "moment";

const axios: any = inject("axios"); // inject axios

interface festo {
  formulaName: string;
  id: number;
  name: string;
  slaveId: number;
}

let batchNumber = ref("");
const exportDisabled = ref(false);
const date = ref("");
const type = ref("hour");
const selectedSlaveName = ref("Batch Number");
let festoData = ref<Array<festo>>([]);
let slaveId: Number;

const shortcuts = [
  {
    text: "Last day",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24);
      return [start, end];
    },
  },
  {
    text: "Last 3 days",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 3);
      return [start, end];
    },
  },
];

const batchList = ref([]);
const historyList = ref([]);
const direction = ref("horizontal");
const margin = ref({
  left: 0,
  top: 20,
  right: 20,
  bottom: 0,
});

const axis = ref({
  primary: {
    type: "band",
    format: (val: string) => {
      if (val === "Feb") {
        return "😜";
      }
      return val;
    },
  },
  secondary: {
    domain: ["dataMin -100", "dataMax +10"],
    type: "linear",
    ticks: 8,
  },
});

const handleSearch = async () => {
  if (!(await checkInput())) return;

  let start = date.value[0];
  let end = date.value[1];
  start = `${start.getFullYear()}-${
    start.getMonth() + 1
  }-${start.getDate()} 00:00:00`;
  end = `${end.getFullYear()}-${end.getMonth() + 1}-${end.getDate()} 23:59:59`;

  axios
    .post("/festo/history", {
      batchNumber: batchNumber.value,
      startTime: start,
      endTime: end,
      type: type.value,
    })
    .then(function (response: { data: any }) {
      // handle success
      if (response.data.msg == "Success") {
        historyList.value = response.data.data;

        return;
      } else alert(response.data.msg);
    })
    .catch(function (error: {}) {
      // handle error
      console.log(error);
    })
    .then(function () {
      // always executed
    });
};

const handleExport = async () => {
  if (!(await checkInput())) return;

  let start = date.value[0];
  let end = date.value[1];
  start = moment(start).format("YYYY-MM-DD 00:00:00");
  end = moment(end).format("YYYY-MM-DD 23:59:59");
  ElMessage({
    message: "Start Export.",
    type: "success",
  });

  exportDisabled.value = true;
  axios
    .post(
      "/festo/export",
      {
        batchNumber: batchNumber.value,
        startTime: start,
        endTime: end,
        offset: 0,
      },
      { responseType: "blob" }
    )
    .then(function (res: any, fileName: Text) {
      if (res.headers["content-type"].includes("application/json")) {
        ElMessage({
          message: "Export Fail.",
          type: "warning",
        });
      } else {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        link.style.display = "none";
        const fileName = `festo${slaveId}_${start}_${end}.csv`;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        ElMessage({
          message: "Export Done.",
          type: "success",
        });
      }
    })
    .catch(function (error: {}) {
      // handle error
      console.log(error);
    })
    .then(function () {
      // always executed
      exportDisabled.value = false;
    });
};

const selectDate = async () => {
  if (!(await checkDate())) return;

  let start = date.value[0];
  let end = date.value[1];
  start = moment(start).format("YYYY-MM-DD 00:00:00");
  end = moment(end).format("YYYY-MM-DD 23:59:59");

  axios
    .get(`/festo/history/batch?startTime=${start}&endTime=${end}`)
    .then(function (response: { data: any }) {
      // handle success
      if (response.data.msg == "Success") {
        if (response.data.data.length == 0)
          ElMessage({
            message: "No Batch Number",
            type: "warning",
          });
        batchList.value = response.data.data;
        batchNumber.value = "";

        return;
      } else alert(response.data.msg);
    })
    .catch(function (error: {}) {
      // handle error
      console.log(error);
    })
    .then(function () {
      // always executed
    });
};

const handleBatch = (batch: string) => {
  batchNumber.value = batch;
};

const handleType = (selectType: string) => {
  type.value = selectType;
};

const alterBox = (msg: string) => {
  ElMessage({
    type: "error",
    message: msg,
  });
};

const checkInput = async () => {
  let flag = true;
  flag = checkDate();
  flag = checkBatchNumber();

  return flag;
};

const checkDate = async () => {
  if (!date.value[0] || !date.value[1]) {
    alterBox("Please Select Date");
    return false;
  } else {
    var difference = Math.abs(
      date.value[0].getTime() - date.value[1].getTime()
    );
    let diffDays = difference / (1000 * 3600 * 24);
    if (diffDays > 7) {
      date.value = [];
      alterBox("Date limit > 7");
      return false;
    }
  }

  return true;
};

const checkBatchNumber = async () => {
  if (batchNumber.value === "") {
    alterBox("Please Select Batch Number");
    return false;
  }
  return true;
};

onMounted(() => {});
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

.el-dropdown-link {
  cursor: pointer;
  color: #409eff;
}

.el-icon-arrow-down {
  font-size: 12px;
}
</style>
