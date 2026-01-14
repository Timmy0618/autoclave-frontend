<template>
  <div class="monitor-container">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <el-icon size="32" class="header-icon">
          <Monitor />
        </el-icon>
        <div class="header-text">
          <h1 class="page-title">Festo 監控</h1>
          <p class="page-subtitle">即時監控所有設備狀態</p>
        </div>
      </div>
      <div class="header-stats">
        <div class="stat-item">
          <el-icon class="stat-icon">
            <Management />
          </el-icon>
          <div class="stat-content">
            <div class="stat-value">{{ monitorList.length }}</div>
            <div class="stat-label">運行設備</div>
          </div>
        </div>
        <div class="stat-item">
          <el-icon class="stat-icon">
            <Warning />
          </el-icon>
          <div class="stat-content">
            <div class="stat-value warning-count">{{ getWarningCount() }}</div>
            <div class="stat-label">警告設備</div>
          </div>
        </div>
      </div>
      <div class="header-actions">
        <el-button
          type="primary"
          @click="refreshData"
          :loading="loading"
          size="small"
        >
          <el-icon><RefreshRight /></el-icon>
          手動更新
        </el-button>
        <span class="update-time">
          最後更新：{{ lastUpdateTime || '載入中...' }}
        </span>
      </div>
    </div>

    <!-- Monitor Cards Grid -->
    <div v-if="monitorList.length" class="monitor-grid">
      <div
        v-for="(monitorData, index) in monitorList"
        :key="monitorData.id"
        class="monitor-card-wrapper"
      >
        <el-card
          class="monitor-card"
          :class="getStatusClass(monitorData)"
          shadow="hover"
        >
          <!-- Status Banner -->
          <div class="status-banner" :class="getStatusBannerClass(monitorData)">
            <el-icon class="status-icon">
              <component :is="getStatusIcon(monitorData)" />
            </el-icon>
            <span class="status-text">{{ getStatusText(monitorData) }}</span>
          </div>

          <!-- Device Header -->
          <div class="device-header">
            <div class="device-name">{{ monitorData.festoName }}</div>
            <div class="device-formula">{{ monitorData.formulaName }}</div>
          </div>

          <!-- Key Metrics -->
          <div class="metrics-container">
            <!-- Pressure Section - Primary Focus -->
            <div class="metric-card pressure-card primary-card">
              <div class="metric-header">
                <el-icon class="metric-icon">
                  <TrendCharts />
                </el-icon>
                <span class="metric-title">壓力狀態</span>
                <el-tag size="small" type="info" class="metric-badge">主要監控</el-tag>
              </div>
              <div class="pressure-display">
                <div class="pressure-main">
                  <div class="current-pressure">
                    <span class="pressure-label">目前壓力</span>
                    <span
                      class="pressure-value"
                      :class="getPressureStatusClass(monitorData)"
                    >
                      {{ monitorData.currentPressure ?? '--' }}
                    </span>
                    <span class="pressure-unit">kPa</span>
                  </div>
                  <div class="target-pressure">
                    <span class="target-label">目標壓力</span>
                    <span class="target-value">{{ monitorData.schedulePressure }}</span>
                    <span class="target-unit">kPa</span>
                  </div>
                </div>
                <div v-if="monitorData.currentPressure !== null" class="pressure-difference">
                  <el-icon :class="getDifferenceIconClass(monitorData)">
                    <component :is="getDifferenceIcon(monitorData)" />
                  </el-icon>
                  <span class="difference-text">偏差</span>
                  <span class="difference-value" :class="getDifferenceValueClass(monitorData)">
                    {{ Math.abs(monitorData.currentPressure - monitorData.schedulePressure) }} kPa
                  </span>
                </div>
              </div>
              <!-- Pressure Progress Bar -->
              <div class="progress-container" v-if="monitorData.currentPressure !== null">
                <div class="progress-label">
                  <span>壓力達成率</span>
                  <span class="progress-percentage">{{ Math.round(getPressurePercentage(monitorData)) }}%</span>
                </div>
                <el-progress
                  :percentage="getPressurePercentage(monitorData)"
                  :status="getProgressStatus(monitorData)"
                  :stroke-width="8"
                  :show-text="false"
                  class="pressure-progress"
                />
              </div>
            </div>

            <!-- Secondary Info Section -->
            <div class="secondary-info">
              <!-- Sequence Info -->
              <div class="info-item sequence-info">
                <div class="info-header">
                  <el-icon class="info-icon">
                    <List />
                  </el-icon>
                  <span class="info-title">執行步驟</span>
                </div>
                <div class="sequence-display">
                  <span class="sequence-number">{{ monitorData.scheduleSequence + 1 }}</span>
                  <span class="sequence-label">步</span>
                </div>
              </div>

              <!-- Time Info -->
              <div class="info-item time-info">
                <div class="info-header">
                  <el-icon class="info-icon">
                    <Timer />
                  </el-icon>
                  <span class="info-title">處理時間</span>
                </div>
                <div class="time-display">
                  <span class="time-value">{{ monitorData.warningTime }}</span>
                  <span class="time-unit">min</span>
                  <span v-if="monitorData.warningTime >= monitorData.warningTimeLimit" class="time-warning">
                    / {{ monitorData.warningTimeLimit }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Warning Indicator -->
          <div v-if="warningTag[monitorData.id] === 'danger'" class="warning-indicator">
            <el-icon class="warning-icon">
              <WarningFilled />
            </el-icon>
            <span class="warning-text">警告：處理時間超限</span>
          </div>
        </el-card>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading" class="empty-state">
      <el-empty description="目前沒有正在執行的 Festo 任務">
        <template #image>
          <el-icon size="64" class="empty-icon"><Monitor /></el-icon>
        </template>
      </el-empty>
    </div>

    <!-- Loading State -->
    <div v-else class="loading-state">
      <el-spin size="large">
        <div class="loading-content">
          <p>載入監控數據中...</p>
        </div>
      </el-spin>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, inject, watch, computed } from "vue";
import { onBeforeRouteLeave } from "vue-router";
import { ElMessage } from "element-plus";
import {
  Monitor,
  RefreshRight,
  Top,
  Bottom,
  Check,
  Warning,
  WarningFilled,
  Management,
  TrendCharts,
  List,
  Timer,
  Clock,
  VideoPlay,
  VideoPause,
  QuestionFilled
} from "@element-plus/icons-vue";
import dayjs from "dayjs";

const axios: any = inject("axios"); // inject axios
let checkPage = true;

interface monitor {
  checkPressure: boolean;
  currentPressure: number;
  schedulePressure: number;
  formulaName: string;
  id: number;
  festoName: string;
  scheduleSequence: number;
  warningTime: number;
  warningTimeLimit: number;
  scheduleStatus: number;
}

let monitorList = ref<Array<monitor>>([]);
let warningTag = ref<Record<number, string>>({});
let lastUpdateTime = ref("");
let loading = ref(false);
const statusMap: Record<number, string> = { 0: "Waiting", 1: "Executing", 2: "End" };

// Computed property for warning count
const getWarningCount = () => {
  let count = 0;
  Object.keys(warningTag.value).forEach(key => {
    if (warningTag.value[parseInt(key)] === 'danger') {
      count++;
    }
  });
  return count;
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

const getStatusClass = (monitorData: monitor) => {
  if (warningTag.value[monitorData.id] === 'danger') {
    return 'status-warning';
  }
  return '';
};

const getStatusBannerClass = (monitorData: monitor) => {
  switch (monitorData.scheduleStatus) {
    case 0: return 'status-waiting';
    case 1: return 'status-executing';
    case 2: return 'status-end';
    default: return 'status-unknown';
  }
};

const getStatusIcon = (monitorData: monitor) => {
  switch (monitorData.scheduleStatus) {
    case 0: return 'Clock';
    case 1: return 'VideoPlay';
    case 2: return 'VideoPause';
    default: return 'QuestionFilled';
  }
};

const getStatusText = (monitorData: monitor) => {
  return statusMap[monitorData.scheduleStatus] || 'Unknown';
};

const getPressureStatusClass = (monitorData: monitor) => {
  if (monitorData.currentPressure === null) return 'no-data';
  const diff = Math.abs(monitorData.currentPressure - monitorData.schedulePressure);
  if (diff < 5) return 'pressure-normal';
  if (diff < 20) return 'pressure-warning';
  return 'pressure-error';
};

const getDifferenceIcon = (monitorData: monitor) => {
  if (monitorData.currentPressure === null) return Check;
  if (monitorData.currentPressure > monitorData.schedulePressure) return Top;
  if (monitorData.currentPressure < monitorData.schedulePressure) return Bottom;
  return Check;
};

const getDifferenceIconClass = (monitorData: monitor) => {
  if (monitorData.currentPressure === null) return '';
  if (monitorData.currentPressure > monitorData.schedulePressure) return 'difference-up';
  if (monitorData.currentPressure < monitorData.schedulePressure) return 'difference-down';
  return 'difference-equal';
};

const getDifferenceValueClass = (monitorData: monitor) => {
  if (monitorData.currentPressure === null) return '';
  const diff = Math.abs(monitorData.currentPressure - monitorData.schedulePressure);
  if (diff < 5) return 'difference-small';
  if (diff < 20) return 'difference-medium';
  return 'difference-large';
};

const getPressurePercentage = (monitorData: monitor) => {
  if (monitorData.currentPressure === null || monitorData.schedulePressure === 0) return 0;
  const percentage = (monitorData.currentPressure / monitorData.schedulePressure) * 100;
  return Math.min(Math.max(percentage, 0), 100);
};

const getProgressStatus = (monitorData: monitor) => {
  if (monitorData.currentPressure === null) return 'exception';
  const percentage = getPressurePercentage(monitorData);
  if (percentage >= 95 && percentage <= 105) return 'success';
  if (percentage >= 80 && percentage <= 120) return 'warning';
  return 'exception';
};

const refreshData = async () => {
  loading.value = true;
  try {
    await getMonitorData();
  } catch (error) {
    console.error('Refresh failed:', error);
  } finally {
    loading.value = false;
  }
};

const getMonitorData = async () => {
  try {
    const response = await axios.get("/festo/executing");
    if (response.data.msg == "Success") {
      lastUpdateTime.value = dayjs().format("HH:mm:ss");
      monitorList.value = response.data.data;

      // 初始化警告標籤
      monitorList.value.forEach((element) => {
        warningTag.value[element.id] = "success";
      });
    } else {
      ElMessage.error(response.data.msg);
    }
  } catch (error) {
    console.error('Failed to get monitor data:', error);
    ElMessage.error("獲取監控數據失敗");
  }
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
  () => monitorList.value, // 檢查warning time 有無需要警報
  (currentValue, oldValue) => {
    monitorList.value.forEach((element) => {
      if (
        element.checkPressure &&
        element.scheduleStatus != 2 &&
        element.warningTime >= element.warningTimeLimit
      ) {
        warningTag.value[element.id] = "danger";
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

<style scoped>
.monitor-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
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

.header-stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
  color: #303133;
}

.stat-icon {
  font-size: 20px;
  opacity: 0.9;
}

.stat-content {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
}

.warning-count {
  color: #f56c6c;
}

.stat-label {
  font-size: 12px;
  opacity: 0.8;
  font-weight: 500;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.update-time {
  font-size: 14px;
  color: #909399;
  font-weight: 500;
}

.monitor-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  max-width: 1400px;
  margin: 0 auto;
}

.monitor-card-wrapper {
  transition: transform 0.2s ease;
}

.monitor-card-wrapper:hover {
  transform: translateY(-2px);
}

.monitor-card {
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
}

.monitor-card.status-warning {
  border-color: #f56c6c;
  box-shadow: 0 0 20px rgba(245, 108, 108, 0.3);
}

.status-banner {
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  color: white;
}

.status-banner.status-waiting {
  background: linear-gradient(90deg, #e6a23c 0%, #ebb563 100%);
}

.status-banner.status-executing {
  background: linear-gradient(90deg, #409eff 0%, #66b1ff 100%);
}

.status-banner.status-end {
  background: linear-gradient(90deg, #67c23a 0%, #85ce61 100%);
}

.status-banner.status-unknown {
  background: linear-gradient(90deg, #909399 0%, #a6a9ad 100%);
}

.status-icon {
  margin-right: 6px;
  font-size: 14px;
}

.device-header {
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.device-name {
  font-size: 16px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 0;
}

.device-formula {
  font-size: 13px;
  color: #409eff;
  font-weight: 500;
}

.metrics-container {
  padding: 12px;
}

.metric-card.primary-card {
  background: linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%);
  border: 2px solid #409eff;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.2);
  margin-bottom: 12px;
}

.metric-badge {
  margin-left: auto;
  font-weight: 600;
}

.pressure-display {
  margin-bottom: 16px;
}

.pressure-main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 8px;
}

.current-pressure,
.target-pressure {
  text-align: center;
  padding: 8px 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.pressure-label,
.target-label {
  display: block;
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
  font-weight: 500;
}

.pressure-value,
.target-value {
  display: block;
  font-size: 24px;
  font-weight: 700;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  margin-bottom: 2px;
}

.pressure-value {
  color: #409eff;
}

.pressure-value.pressure-normal {
  color: #67c23a;
}

.pressure-value.pressure-warning {
  color: #e6a23c;
}

.pressure-value.pressure-error {
  color: #f56c6c;
}

.pressure-value.no-data {
  color: #c0c4cc;
}

.target-value {
  color: #303133;
}

.pressure-unit,
.target-unit {
  font-size: 14px;
  color: #909399;
  font-weight: 500;
}

.pressure-difference {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  border: 1px solid #e4e7ed;
  font-size: 14px;
  font-weight: 600;
}

.difference-text {
  color: #606266;
  font-weight: 500;
}

.difference-up .el-icon {
  color: #f56c6c;
}

.difference-down .el-icon {
  color: #e6a23c;
}

.difference-equal .el-icon {
  color: #67c23a;
}

.difference-small {
  color: #67c23a;
}

.difference-medium {
  color: #e6a23c;
}

.difference-large {
  color: #f56c6c;
}

.progress-container {
  margin-top: 16px;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.progress-percentage {
  color: #409eff;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.secondary-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.info-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 8px 12px;
  border: 1px solid #e4e7ed;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.info-icon {
  color: #909399;
  font-size: 14px;
}

.info-title {
  font-size: 13px;
  font-weight: 600;
  color: #606266;
}

.sequence-display {
  text-align: center;
}

.sequence-number {
  display: block;
  font-size: 20px;
  font-weight: 700;
  color: #409eff;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.sequence-label {
  font-size: 12px;
  color: #909399;
  font-weight: 500;
}

.time-display {
  text-align: center;
}

.time-value {
  font-size: 16px;
  font-weight: 700;
  color: #303133;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.time-unit {
  font-size: 12px;
  color: #909399;
  margin-left: 2px;
}

.time-warning {
  color: #f56c6c;
  font-weight: 600;
  margin-left: 4px;
}

.warning-indicator {
  position: absolute;
  top: 0;
  right: 0;
  background: linear-gradient(135deg, #f56c6c 0%, #ff7875 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 0 0 0 12px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: -2px 2px 8px rgba(245, 108, 108, 0.3);
  z-index: 10;
}

.warning-icon {
  margin-right: 4px;
  font-size: 14px;
}

.empty-state {
  margin-top: 60px;
  text-align: center;
}

.loading-state {
  margin-top: 60px;
  text-align: center;
}

.loading-content {
  padding: 40px;
}

.empty-icon {
  color: #c0c4cc;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .monitor-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }
}

@media (max-width: 768px) {
  .monitor-container {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .header-stats {
    width: 100%;
    justify-content: space-around;
  }

  .header-text h1 {
    font-size: 24px;
  }

  .monitor-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .metrics-container {
    padding: 12px;
  }

  .pressure-main {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .secondary-info {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .pressure-value,
  .target-value {
    font-size: 20px;
  }

  .sequence-number {
    font-size: 18px;
  }

  .time-value {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .header-text h1 {
    font-size: 20px;
  }

  .page-subtitle {
    font-size: 13px;
  }

  .stat-value {
    font-size: 20px;
  }

  .device-name {
    font-size: 16px;
  }

  .metrics-grid {
    padding: 12px;
  }

  .warning-indicator {
    font-size: 11px;
    padding: 4px 8px;
  }
}

/* Element Plus overrides */
:deep(.el-card__body) {
  padding: 0;
}

:deep(.el-progress-bar__outer) {
  border-radius: 3px;
}

:deep(.el-progress-bar__inner) {
  border-radius: 3px;
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  border: none;
}

:deep(.el-button--primary:hover) {
  background: linear-gradient(135deg, #66b1ff 0%, #8cc5ff 100%);
}
</style>
