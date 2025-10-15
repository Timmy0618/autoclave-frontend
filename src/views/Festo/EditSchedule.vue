<template>
  <div class="edit-schedule-container">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <el-icon size="32" class="header-icon">
          <Calendar />
        </el-icon>
        <div class="header-text">
          <h1 class="page-title">Festo 排程編輯</h1>
          <p class="page-subtitle">編輯壓力與處理時間設定</p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <el-card class="schedule-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon class="card-icon">
              <Setting />
            </el-icon>
            <span class="card-title">排程參數設定</span>
          </div>
        </template>

        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
          <el-icon class="loading-icon">
            <Loading />
          </el-icon>
          <p>載入排程資料中...</p>
        </div>

        <!-- Schedule Table -->
        <div v-else class="table-container">
          <el-table
            :data="festoSchedule.scheduleDetails"
            border
            stripe
            class="schedule-table"
            :header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: '600' }"
          >
            <el-table-column
              label="順序"
              width="80"
              align="center"
            >
              <template #default="scope">
                <el-tag type="info" size="small" class="sequence-tag">
                  {{ scope.$index + 1 }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column
              label="壓力設定"
              min-width="200"
            >
              <template #default="scope">
                <div class="input-container">
                  <el-input-number
                    v-model="scope.row.pressure"
                    :min="0"
                    :max="10000"
                    :precision="1"
                    controls-position="right"
                    class="pressure-input"
                    size="small"
                  />
                  <span class="unit-text">kPa</span>
                </div>
              </template>
            </el-table-column>

            <el-table-column
              label="處理時間"
              min-width="200"
            >
              <template #default="scope">
                <div class="input-container">
                  <el-input-number
                    v-model="scope.row.processTime"
                    :min="0"
                    :max="1440"
                    :precision="1"
                    controls-position="right"
                    class="time-input"
                    size="small"
                  />
                  <span class="unit-text">分鐘</span>
                </div>
              </template>
            </el-table-column>

            <el-table-column
              label="狀態"
              width="100"
              align="center"
            >
              <template #default="scope">
                <el-tag
                  :type="getStatusType(scope.row)"
                  size="small"
                  effect="light"
                >
                  {{ getStatusText(scope.row) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <el-button
            type="success"
            size="large"
            :loading="saving"
            @click="handleComplete"
            class="action-btn"
          >
            <el-icon>
              <Check />
            </el-icon>
            <span>完成</span>
          </el-button>

          <el-button
            type="default"
            size="large"
            @click="$router.go(-1)"
            class="action-btn"
          >
            <el-icon>
              <Close />
            </el-icon>
            <span>取消</span>
          </el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, inject, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import {
  Calendar,
  Setting,
  Loading,
  Check,
  Close
} from "@element-plus/icons-vue";

const route = useRoute();
const router = useRouter();
const axios: any = inject("axios"); // inject axios

interface ScheduleDetails {
  id: number;
  pressure: number;
  processTime: number;
  resetTimes: number;
  timeEnd: number;
  timeStart: number;
}

interface FestoSchedule {
  id: number;
  pressure: number;
  processTime: number;
  scheduleDetails: ScheduleDetails[];
}

const festoSchedule = ref<FestoSchedule>({
  id: 0,
  pressure: 0,
  processTime: 0,
  scheduleDetails: []
});

const loading = ref(false);
const saving = ref(false);

const getFestoSchedule = async () => {
  loading.value = true;
  try {
    const id = route.params.id;
    const response = await axios.get("/schedule/" + id);
    festoSchedule.value = response.data.data;
  } catch (error) {
    console.error("載入排程資料失敗:", error);
    ElMessage.error("載入排程資料失敗");
  } finally {
    loading.value = false;
  }
};

const handleComplete = async () => {
  saving.value = true;
  try {
    const response = await axios.patch("/schedule/detail", festoSchedule.value.scheduleDetails);
    if (response.data.msg === "Success") {
      ElMessage.success("排程更新成功");
      router.back();
    } else {
      ElMessage.warning(response.data.msg);
    }
  } catch (error) {
    console.error("更新排程失敗:", error);
    ElMessage.error("更新排程失敗");
  } finally {
    saving.value = false;
  }
};

const getStatusType = (row: ScheduleDetails) => {
  if (row.pressure > 0 && row.processTime > 0) {
    return "success";
  } else if (row.pressure > 0 || row.processTime > 0) {
    return "warning";
  } else {
    return "danger";
  }
};

const getStatusText = (row: ScheduleDetails) => {
  if (row.pressure > 0 && row.processTime > 0) {
    return "完成";
  } else if (row.pressure > 0 || row.processTime > 0) {
    return "部分";
  } else {
    return "未設定";
  }
};

// 監視數據變化，確保 processTime 不為負數
watch(
  () => festoSchedule.value.scheduleDetails,
  (newDetails) => {
    if (newDetails) {
      newDetails.forEach((detail, index) => {
        if (Number(detail.processTime) < 0) {
          detail.processTime = 0;
        }
      });
    }
  },
  { deep: true }
);

onMounted(() => {
  getFestoSchedule();
});
</script>

<style scoped>
.edit-schedule-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.page-header {
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.header-icon {
  color: #409eff;
  background: rgba(64, 158, 255, 0.1);
  padding: 12px;
  border-radius: 12px;
}

.header-text h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  letter-spacing: -0.5px;
}

.page-subtitle {
  margin: 4px 0 0 0;
  color: #909399;
  font-size: 14px;
  font-weight: 400;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
}

.schedule-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.card-icon {
  color: #67c23a;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #909399;
}

.loading-icon {
  font-size: 48px;
  margin-bottom: 16px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.table-container {
  margin-bottom: 24px;
}

.schedule-table {
  border-radius: 8px;
  overflow: hidden;
}

.sequence-tag {
  font-weight: 600;
  min-width: 32px;
  text-align: center;
}

.input-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pressure-input,
.time-input {
  flex: 1;
}

.unit-text {
  font-size: 12px;
  color: #909399;
  font-weight: 500;
  min-width: 35px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding-top: 24px;
  border-top: 1px solid #ebeef5;
}

.action-btn {
  min-width: 120px;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

/* Responsive Design */
@media (max-width: 768px) {
  .edit-schedule-container {
    padding: 16px;
  }

  .header-content {
    padding: 20px;
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .header-text h1 {
    font-size: 24px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 12px;
  }

  .action-btn {
    width: 100%;
    max-width: 200px;
  }

  .input-container {
    flex-direction: column;
    align-items: stretch;
    gap: 4px;
  }

  .unit-text {
    text-align: center;
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .header-text h1 {
    font-size: 20px;
  }

  .page-subtitle {
    font-size: 13px;
  }

  .card-header {
    font-size: 14px;
  }
}

/* Element Plus overrides */
:deep(.el-card__header) {
  background: linear-gradient(90deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #dee2e6;
  padding: 16px 24px;
}

:deep(.el-table) {
  border-radius: 8px;
}

:deep(.el-table th) {
  background: #f5f7fa !important;
  color: #606266 !important;
  font-weight: 600 !important;
  border-bottom: 2px solid #ebeef5;
}

:deep(.el-table td) {
  border-bottom: 1px solid #f0f0f0;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background: #fafbfc;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-input-number .el-input__inner) {
  text-align: center;
  font-weight: 500;
  font-size: 16px;
}

:deep(.el-button--success) {
  background: linear-gradient(135deg, #67c23a 0%, #52a032 100%);
  border: none;
}

:deep(.el-button--success:hover) {
  background: linear-gradient(135deg, #52a032 0%, #4a8f2d 100%);
}

:deep(.el-button--default) {
  border: 2px solid #dcdfe6;
  background: white;
  color: #606266;
}

:deep(.el-button--default:hover) {
  border-color: #c0c4cc;
  background: #f5f7fa;
}
</style>
