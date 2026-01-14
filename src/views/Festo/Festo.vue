<template>
  <div class="festo-container">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <el-icon size="32" class="header-icon">
          <Management />
        </el-icon>
        <div class="header-text">
          <h1 class="page-title">Festo 名單</h1>
          <p class="page-subtitle">管理所有 Festo 設備與排程</p>
        </div>
      </div>
      <div class="header-actions">
        <el-button
          type="success"
          size="large"
          @click="refreshData"
          class="refresh-button"
          :loading="loading"
        >
          <el-icon>
            <Refresh />
          </el-icon>
          <span>重新整理</span>
        </el-button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Festo List Section -->
      <el-card class="festo-list-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon class="card-icon">
              <List />
            </el-icon>
            <span class="card-title">Festo 設備列表</span>
            <el-tag type="info" size="small" class="count-tag">
              {{ festoData.length }} 個設備
            </el-tag>
          </div>
        </template>

        <el-table
          :data="festoData"
          border
          stripe
          class="festo-table"
          :header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: '600' }"
          @current-change="handleCurrentChange"
          :loading="loading"
          table-layout="auto"
          empty-text="目前沒有 Festo 設備資料"
        >
          <el-table-column label="設備名稱" min-width="150">
            <template #default="scope">
              <div class="name-cell">
                <el-icon class="name-icon">
                  <Setting />
                </el-icon>
                <span class="device-name">{{ scope.row.name }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="批次編號" min-width="150">
            <template #default="scope">
              <div class="batch-cell">
                <el-icon class="batch-icon">
                  <Document />
                </el-icon>
                <span class="batch-number">{{ scope.row.batchNumber }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="配方名稱" min-width="150">
            <template #default="scope">
              <div class="formula-cell">
                <el-icon class="formula-icon">
                  <DocumentChecked />
                </el-icon>
                <span class="formula-name">{{ scope.row.formulaName }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="警告時間" min-width="120" align="center">
            <template #default="scope">
              <div class="warning-cell">
                <el-icon class="warning-icon">
                  <Warning />
                </el-icon>
                <span class="warning-time">{{ scope.row.warningTime }}</span>
                <span class="time-unit">分鐘</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="220" align="center">
            <template #default="scope">
              <div class="action-buttons">
                <el-button
                  type="success"
                  size="small"
                  @click="handleStart(scope.row.id)"
                  :loading="getActionLoading(scope.row.id)"
                  class="start-button"
                >
                  <el-icon>
                    <VideoPlay />
                  </el-icon>
                  開始
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  @click="handleStop(scope.row.id)"
                  :loading="getActionLoading(scope.row.id)"
                  class="stop-button"
                >
                  <el-icon>
                    <VideoPause />
                  </el-icon>
                  停止
                </el-button>
                <el-button
                  type="primary"
                  size="small"
                  @click="handleEdit(scope.row.id)"
                  class="edit-button"
                >
                  <el-icon>
                    <Edit />
                  </el-icon>
                  編輯
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- Festo Schedule Section -->
      <el-card class="festo-schedule-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon class="card-icon">
              <Calendar />
            </el-icon>
            <span class="card-title">{{ selectedDeviceName ? `${selectedDeviceName} 排程資訊` : 'Festo 排程資訊' }}</span>
            <el-tag v-if="festoSchedule.length" type="success" size="small" class="schedule-tag">
              {{ festoSchedule.length }} 個步驟
            </el-tag>
            <RouterLink v-if="festoSchedule.length" :to="selectedId" class="edit-link">
              <el-button type="primary" size="small" class="edit-schedule-button">
                <el-icon>
                  <Edit />
                </el-icon>
                編輯排程
              </el-button>
            </RouterLink>
          </div>
        </template>

        <el-table
          :data="festoSchedule"
          border
          stripe
          class="schedule-table"
          :header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: '600' }"
          :loading="scheduleLoading"
          table-layout="auto"
          empty-text="請點選左側設備查看排程資訊"
        >
          <el-table-column label="步驟名稱" min-width="150">
            <template #default="scope">
              <div class="step-cell">
                <el-icon class="step-icon">
                  <Setting />
                </el-icon>
                <span class="step-name">{{ scope.row.name }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="順序" width="80" align="center">
            <template #default="scope">
              <el-tag type="primary" size="small" class="sequence-tag">
                {{ scope.row.sequence + 1 }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="壓力設定" min-width="120" align="center">
            <template #default="scope">
              <div class="pressure-cell">
                <span class="pressure-value">{{ scope.row.pressure }}</span>
                <span class="pressure-unit">kPa</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="處理時間" min-width="120" align="center">
            <template #default="scope">
              <div class="time-cell">
                <span class="time-value">{{ scope.row.processTime }}</span>
                <span class="time-unit">分鐘</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="開始時間" min-width="180">
            <template #default="scope">
              <div class="time-cell">
                <el-icon class="time-icon">
                  <Clock />
                </el-icon>
                <span class="time-text">{{ formatTime(scope.row.timeStart) }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="結束時間" min-width="180">
            <template #default="scope">
              <div class="time-cell">
                <el-icon class="time-icon">
                  <Clock />
                </el-icon>
                <span class="time-text">{{ formatTime(scope.row.timeEnd) }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="狀態" width="100" align="center">
            <template #default="scope">
              <el-tag :type="handleTag(scope.row.status)" class="status-tag">
                {{ statusMap[scope.row.status] }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="壓力檢查" width="120" align="center">
            <template #default="scope">
              <el-checkbox
                v-model="scope.row.checkPressure"
                size="large"
                @change="handleCheckbox(scope.row.id, scope.row.checkPressure)"
                class="pressure-checkbox"
              />
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, inject } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {
  Management,
  Refresh,
  List,
  Setting,
  Document,
  DocumentChecked,
  Warning,
  VideoPlay,
  VideoPause,
  Edit,
  Calendar,
  Clock
} from "@element-plus/icons-vue";

dayjs.extend(utc);

const axios: any = inject("axios");
const router = useRouter();

interface festo {
  formulaName: string;
  batchNumber: string;
  warningTime: number;
  id: number;
  name: string;
  slaveId: number;
  scheduleId: number;
}

interface festoDetail {
  id: number;
  name: string;
  pressure: number;
  processTime: number;
  sequence: number;
  status: number;
  checkPressure: boolean;
  timeEnd: Date;
  timeStart: Date;
}

interface formula {
  create_time: Date;
  id: number;
  name: string;
  update_time: Date;
}

const statusMap: Record<number, string> = { 0: "Waiting", 1: "Executing", 2: "End" };
const festoData = ref<festo[]>([]);
const festoSchedule = ref<festoDetail[]>([]);
const formulaData = ref<formula[]>([]);
const selectedId = ref({});
const selectedDeviceName = ref("");
const loading = ref(false);
const scheduleLoading = ref(false);
const actionLoading = ref<Record<number, boolean>>({});

const formatTime = (time: Date) => {
  return dayjs.utc(time).format("YYYY-MM-DD HH:mm:ss");
};

const getActionLoading = (id: number) => {
  return actionLoading.value[id] || false;
};

const refreshData = async () => {
  await getFestoList();
  await getFormula();
  if (festoSchedule.value.length > 0) {
    // Refresh current schedule if one is selected
    const currentFesto = festoData.value.find(f => f.scheduleId);
    if (currentFesto) {
      await getFestoSchedule(currentFesto.id);
    }
  }
};

const handleStart = async (id: number) => {
  actionLoading.value[id] = true;
  try {
    const response = await axios.patch("/festo/" + id, { option: "start" });
    if (response.data.msg === "Success") {
      await getFestoSchedule(id);
      ElMessage.success("啟動成功");
    } else {
      ElMessage.error(response.data.msg);
    }
  } catch (error) {
    console.error("啟動失敗:", error);
    ElMessage.error("啟動失敗，請稍後再試");
  } finally {
    actionLoading.value[id] = false;
  }
};

const handleStop = async (id: number) => {
  actionLoading.value[id] = true;
  try {
    const response = await axios.patch("/festo/" + id, { option: "stop" });
    if (response.data.msg === "Success") {
      await getFestoSchedule(id);
      ElMessage.success("停止成功");
    } else {
      ElMessage.error(response.data.msg);
    }
  } catch (error) {
    console.error("停止失敗:", error);
    ElMessage.error("停止失敗，請稍後再試");
  } finally {
    actionLoading.value[id] = false;
  }
};

const handleEdit = (id: number) => {
  router.push({ name: "festoEdit", params: { id } });
};

const handleCurrentChange = (festo: festo) => {
  selectedDeviceName.value = festo.name;
  if (!festo.scheduleId) {
    festoSchedule.value = [];
    return;
  }
  selectedId.value = {
    name: "festoEditSchedule",
    params: { id: festo.scheduleId },
  };
  getFestoSchedule(festo.id);
};

const getFestoSchedule = async (id: number) => {
  scheduleLoading.value = true;
  try {
    const response = await axios.get("/festo/" + id);
    if (response.data.msg === "Success") {
      festoSchedule.value = response.data.data.schedules;
    } else {
      ElMessage.error(response.data.msg);
    }
  } catch (error) {
    console.error("載入排程失敗:", error);
    ElMessage.error("載入排程失敗");
  } finally {
    scheduleLoading.value = false;
  }
};

const getFestoList = async () => {
  loading.value = true;
  try {
    const response = await axios.get("/festo");
    festoData.value = response.data.data;
  } catch (error) {
    console.error("載入 Festo 列表失敗:", error);
    ElMessage.error("載入 Festo 列表失敗");
  } finally {
    loading.value = false;
  }
};

const getFormula = async () => {
  try {
    const response = await axios.get("/formula");
    formulaData.value = response.data.data;
  } catch (error) {
    console.error("載入配方列表失敗:", error);
    ElMessage.error("載入配方列表失敗");
  }
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

const handleCheckbox = async (id: number, checkPressure: boolean) => {
  try {
    const response = await axios.patch("/schedule/detail/" + id, { checkPressure });
    if (response.data.msg === "Success") {
      ElMessage.success("更新成功");
    } else {
      ElMessage.error(response.data.msg);
    }
  } catch (error) {
    console.error("更新失敗:", error);
    ElMessage.error("更新失敗，請稍後再試");
  }
};

onMounted(() => {
  getFestoList();
  getFormula();
});
</script>

<style scoped>
.festo-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.page-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  color: #667eea;
}

.header-text .page-title {
  margin: 0;
  font-size: 32px;
  font-weight: 600;
  color: #2c3e50;
}

.header-text .page-subtitle {
  margin: 4px 0 0 0;
  font-size: 16px;
  color: #6c757d;
}

.header-actions .refresh-button {
  background: linear-gradient(135deg, #409eff 0%, #337ecc 100%);
  border: none;
  color: white;
  font-weight: 500;
  padding: 12px 24px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.header-actions .refresh-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.main-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

.festo-list-card,
.festo-schedule-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.festo-list-card:hover,
.festo-schedule-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.card-icon {
  color: #667eea;
}

.card-title {
  font-size: 22px;
  font-weight: 600;
  color: #2c3e50;
}

.count-tag,
.schedule-tag {
  margin-left: auto;
}

.edit-link {
  margin-left: 12px;
}

.edit-schedule-button {
  font-weight: 500;
}

.festo-table,
.schedule-table {
  width: 100%;
}

.festo-table th,
.schedule-table th {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  color: #495057;
  font-weight: 600;
  font-size: 18px;
  padding: 18px;
  text-align: left;
  border-bottom: 2px solid #dee2e6;
}

.festo-table td,
.schedule-table td {
  padding: 18px;
  border-bottom: 1px solid #dee2e6;
  color: #495057;
  font-size: 17px;
  transition: background-color 0.2s ease;
}

.festo-table tr:hover td,
.schedule-table tr:hover td {
  background-color: #f8f9fa;
}

.name-cell,
.batch-cell,
.formula-cell,
.step-cell,
.warning-cell,
.pressure-cell,
.time-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.name-icon,
.batch-icon,
.formula-icon,
.step-icon,
.warning-icon,
.time-icon {
  color: #667eea;
}

.device-name,
.batch-number,
.formula-name,
.step-name {
  font-weight: 500;
  font-size: 17px;
}

.warning-time,
.pressure-value,
.time-value {
  font-weight: 600;
  font-size: 17px;
}

.warning-unit,
.pressure-unit,
.time-unit {
  font-size: 15px;
  color: #6c757d;
}

.time-text {
  font-size: 17px;
}

.action-buttons {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
}

.start-button {
  background: #28a745;
  border: none;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.start-button:hover {
  background: #218838;
  transform: translateY(-1px);
}

.stop-button {
  background: #dc3545;
  border: none;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.stop-button:hover {
  background: #c82333;
  transform: translateY(-1px);
}

.edit-button {
  background: #17a2b8;
  border: none;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.edit-button:hover {
  background: #138496;
  transform: translateY(-1px);
}

.sequence-tag {
  font-weight: 600;
  font-size: 16px;
}

.status-tag {
  font-weight: 500;
  font-size: 16px;
}

.pressure-checkbox {
  margin: 0;
}

@media (max-width: 768px) {
  .festo-container {
    padding: 16px;
  }

  .page-header {
    padding: 20px;
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    justify-content: center;
  }

  .main-content {
    gap: 16px;
  }

  .festo-list-card,
  .festo-schedule-card {
    padding: 20px;
  }

  .card-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .count-tag,
  .schedule-tag {
    margin-left: 0;
    align-self: flex-start;
  }

  .edit-link {
    margin-left: 0;
    align-self: flex-end;
  }

  .festo-table th,
  .festo-table td,
  .schedule-table th,
  .schedule-table td {
    padding: 14px 10px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }

  .name-cell,
  .batch-cell,
  .formula-cell,
  .step-cell,
  .warning-cell,
  .pressure-cell,
  .time-cell {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>
