<template>
  <div class="export-container">
    <div class="page-header">
      <h1>Festo Export</h1>
      <p class="page-description">Export and view Festo pressure history data</p>
    </div>

    <!-- Search and Filter Section -->
    <el-card class="search-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>Search Parameters</span>
        </div>
      </template>

      <el-form :model="searchForm" label-width="120px">
        <el-row :gutter="20">
          <!-- Date Range Picker -->
          <el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="6">
            <el-form-item label="Date Range">
              <el-date-picker
                ref="datePickerRef"
                v-model="date"
                @change="selectDate"
                type="daterange"
                unlink-panels
                range-separator="To"
                start-placeholder="Start date"
                end-placeholder="End date"
                :shortcuts="shortcuts"
                size="large"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>

          <!-- Batch Number Dropdown -->
          <el-col :xs="24" :sm="12" :md="6" :lg="4" :xl="3">
            <el-form-item label="Batch">
              <el-dropdown @command="handleBatch" trigger="click">
                <el-button type="primary" plain size="large" style="width: 100%">
                  {{ batchNumber || 'Select Batch' }}
                  <el-icon class="el-icon--right">
                    <ArrowDown />
                  </el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item
                      v-for="batch in batchList"
                      :key="batch"
                      :command="batch"
                    >
                      {{ batch }}
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </el-form-item>
          </el-col>

          <!-- Type Dropdown -->
          <el-col :xs="24" :sm="12" :md="6" :lg="4" :xl="3">
            <el-form-item label="Interval">
              <el-dropdown @command="handleType" trigger="click">
                <el-button type="info" plain size="large" style="width: 100%">
                  {{ type === 'hour' ? 'Hourly' : 'Minutely' }}
                  <el-icon class="el-icon--right">
                    <ArrowDown />
                  </el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="hour">Hourly</el-dropdown-item>
                    <el-dropdown-item command="min">Minutely</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </el-form-item>
          </el-col>

          <!-- Action Buttons -->
          <el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="6">
            <el-form-item>
              <div class="action-buttons">
                <el-button
                  :icon="Search"
                  type="primary"
                  size="large"
                  @click="handleSearch"
                  :loading="searchLoading"
                >
                  Search
                </el-button>
                <el-button
                  type="success"
                  size="large"
                  @click="handleExport"
                  :disabled="exportDisabled"
                  :loading="exportDisabled"
                >
                  Export CSV
                </el-button>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- Charts Section -->
    <div v-if="historyList.length" class="charts-section">
      <el-card class="charts-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>Pressure History Chart</span>
            <el-tag type="info">{{ getTotalDataPoints() }} data points</el-tag>
          </div>
        </template>

        <div class="charts-container">
          <div v-if="getCombinedData().length > 0" class="chart-item">
            <div class="chart-header">
              <h3>Pressure Trend Over Time</h3>
              <el-tag size="small">{{ getCombinedData().length }} data points</el-tag>
            </div>
            <div class="chart-wrapper">
              <Chart
                :size="{ width: 1200, height: 600 }"
                :data="getCombinedData()"
                :margin="margin"
                :direction="direction"
                :axis="axis"
              >
                <template #layers>
                  <Grid strokeDasharray="2,2" />
                  <Line
                    :dataKeys="['time', 'avgPressure']"
                    :lineStyle="{ stroke: '#409EFF', strokeWidth: 2 }"
                  />
                </template>

                <template #widgets>
                  <Tooltip
                    borderColor="#409EFF"
                    :config="{
                      name: { hide: true },
                      avgPressure: { color: '#0077b6' },
                      formulaName: { color: '#67C23A' },
                      time: { color: '#E6A23C' },
                      inc: { hide: true }
                    }"
                  />
                </template>
              </Chart>
            </div>
          </div>
          <div v-else class="empty-data-message">
            <el-alert
              title="No data available"
              type="warning"
              description="The selected date range has no data points."
              :closable="false"
            />
          </div>
        </div>
      </el-card>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <el-empty description="No data to display. Please select date range and batch number, then click Search.">
        <template #image>
          <el-icon size="64" class="empty-icon"><Search /></el-icon>
        </template>
      </el-empty>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, inject, onMounted, defineComponent } from "vue";
import { Search } from "@element-plus/icons-vue";
import { Chart, Grid, Line, Tooltip } from "vue3-charts";
// import LabelsLayer from './LabelsLayer.vue'
import { ElMessage } from "element-plus";
import { ArrowDown } from "@element-plus/icons-vue";
import dayjs from "dayjs";

const axios: any = inject("axios"); // inject axios

interface festo {
  formulaName: string;
  id: number;
  name: string;
  slaveId: number;
}

let batchNumber = ref("");
const exportDisabled = ref(false);
const date = ref<Date[]>([]);
const type = ref("hour");
const selectedSlaveName = ref("Batch Number");
let festoData = ref<Array<festo>>([]);
let slaveId: number = 0;
const searchLoading = ref(false);

const searchForm = ref({
  date: [],
  batchNumber: "",
  type: "hour"
});

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

const batchList = ref<any[]>([]);
const historyList = ref<any[]>([]);
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
      // 簡化時間顯示
      // 如果是 hourly 資料: "2025-10-14 10" -> "10/14 10h"
      // 如果是 minutely 資料: "2025-10-14 10:45" -> "10h45"
      if (!val) return val;
      
      // 解析時間字串
      const parts = val.split(' ');
      if (parts.length >= 2) {
        const datePart = parts[0]; // "2025-10-14"
        const timePart = parts[1]; // "10" or "10:45"
        
        const dateComponents = datePart.split('-');
        const month = dateComponents[1];
        const day = dateComponents[2];
        
        if (timePart.includes(':')) {
          // minutely: 只顯示時:分
          return timePart;
        } else {
          // hourly: 顯示 月/日 時h
          return `${month}/${day} ${timePart}h`;
        }
      }
      return val;
    }
  },
  secondary: {
    domain: ["dataMin", "dataMax + 20"],
    type: "linear",
    ticks: 8
  }
});

const getTotalDataPoints = () => {
  let total = 0;
  historyList.value.forEach(dateObj => {
    for (const dateKey in dateObj) {
      const dataArray = dateObj[dateKey];
      if (Array.isArray(dataArray)) {
        total += dataArray.length;
      }
    }
  });
  return total;
};

const getCombinedData = () => {
  const combinedData: any[] = [];
  
  // 遍歷每個日期對象
  historyList.value.forEach(dateObj => {
    // 獲取該對象的所有鍵值對（日期: 資料陣列）
    for (const dateKey in dateObj) {
      const dataArray = dateObj[dateKey];
      // 如果資料陣列存在且有資料
      if (Array.isArray(dataArray) && dataArray.length > 0) {
        // 添加每個資料點，確保格式正確
        dataArray.forEach(item => {
          combinedData.push({
            time: item.time,
            avgPressure: Number(item.avgPressure),
            formulaName: item.formulaName
          });
        });
      }
    }
  });
  
  // 按時間排序
  const sortedData = combinedData.sort((a, b) => {
    return new Date(a.time).getTime() - new Date(b.time).getTime();
  });
  
  console.log('Combined data:', sortedData);
  console.log('Sample data point:', sortedData[0]);
  console.log('Data length:', sortedData.length);
  
  return sortedData;
};

const handleSearch = async () => {
  if (!(await checkInput())) return;

  searchLoading.value = true;
  const startDate = date.value[0];
  const endDate = date.value[1];
  const start = dayjs(startDate).format("YYYY-MM-DD 00:00:00");
  const end = dayjs(endDate).format("YYYY-MM-DD 23:59:59");

  try {
    const response = await axios.post("/history", {
      batchNumber: batchNumber.value,
      startTime: start,
      endTime: end,
      type: type.value,
    });

    if (response.data.msg == "Success") {
      historyList.value = response.data.data;
      console.log('History list received:', historyList.value);
      console.log('Total data points:', getTotalDataPoints());
    } else {
      ElMessage.error(response.data.msg);
    }
  } catch (error) {
    console.log(error);
    ElMessage.error("Search failed");
  } finally {
    searchLoading.value = false;
  }
};

const handleExport = async () => {
  if (!(await checkInput())) return;

  const startDate = date.value[0];
  const endDate = date.value[1];
  const start = dayjs(startDate).format("YYYY-MM-DD 00:00:00");
  const end = dayjs(endDate).format("YYYY-MM-DD 23:59:59");
  ElMessage({
    message: "Start Export.",
    type: "success",
  });

  exportDisabled.value = true;
  axios
    .post(
      "/history/export",
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

  const startDate = date.value[0];
  const endDate = date.value[1];
  const start = dayjs(startDate).format("YYYY-MM-DD 00:00:00");
  const end = dayjs(endDate).format("YYYY-MM-DD 23:59:59");

  axios
    .get(`/history/batch?startTime=${start}&endTime=${end}`)
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
  const dateValid = await checkDate();
  const batchValid = await checkBatchNumber();

  return dateValid && batchValid;
};

const checkDate = async () => {
  if (!date.value || date.value.length < 2 || !date.value[0] || !date.value[1]) {
    alterBox("Please Select Date");
    return false;
  } else {
    const difference = Math.abs(
      date.value[0].getTime() - date.value[1].getTime()
    );
    const diffDays = difference / (1000 * 3600 * 24);
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
.export-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
  text-align: center;
}

.page-header h1 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 28px;
  font-weight: 600;
}

.page-description {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.search-card {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.charts-section {
  margin-top: 24px;
}

.charts-card {
  margin-bottom: 24px;
}

.charts-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.chart-item {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 20px;
  background: #fff;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f5f7fa;
}

.chart-header h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
  font-weight: 500;
}

.chart-wrapper {
  width: 100%;
  min-height: 600px;
  position: relative;
  overflow-x: auto;
  display: flex;
  justify-content: center;
}

.empty-data-message {
  padding: 20px;
}

.empty-state {
  margin-top: 60px;
  text-align: center;
}

.empty-icon {
  color: #c0c4cc;
}

/* Responsive Design */
@media (max-width: 768px) {
  .export-container {
    padding: 16px;
  }

  .page-header h1 {
    font-size: 24px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-buttons .el-button {
    width: 100%;
  }

  .chart-wrapper {
    height: 300px;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .chart-item {
    padding: 16px;
  }

  .chart-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

/* Element Plus overrides */
:deep(.el-card__header) {
  background: #f8f9fa;
  border-bottom: 1px solid #ebeef5;
  font-weight: 500;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #303133;
}

:deep(.el-dropdown-menu__item) {
  padding: 8px 16px;
}

:deep(.el-tag) {
  font-weight: 500;
}
</style>
