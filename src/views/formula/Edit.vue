<template>
  <div class="edit-formula-container">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <el-icon size="32" class="header-icon">
          <EditPen />
        </el-icon>
        <div class="header-text">
          <h1 class="page-title">Formula 排程編輯</h1>
          <p class="page-subtitle">編輯現有的配方排程設定</p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <el-card class="formula-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon class="card-icon">
              <DocumentChecked />
            </el-icon>
            <span class="card-title">配方資訊</span>
          </div>
        </template>

        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
          <el-icon class="loading-icon">
            <Loading />
          </el-icon>
          <p>載入配方資料中...</p>
        </div>

        <!-- Formula Basic Info -->
        <div v-else class="basic-info-section">
          <el-row :gutter="24" class="info-row">
            <el-col :xs="24" :sm="12" :md="8">
              <div class="input-group">
                <label class="input-label">
                  <el-icon class="label-icon">
                    <Edit />
                  </el-icon>
                  配方名稱
                </label>
                <el-input
                  v-model="formulaName"
                  placeholder="請輸入配方名稱"
                  size="large"
                  clearable
                  :maxlength="50"
                  show-word-limit
                  class="formula-input"
                >
                  <template #prefix>
                    <el-icon>
                      <Document />
                    </el-icon>
                  </template>
                </el-input>
              </div>
            </el-col>

            <el-col :xs="24" :sm="12" :md="8">
              <div class="input-group">
                <label class="input-label">
                  <el-icon class="label-icon">
                    <List />
                  </el-icon>
                  步驟數量
                </label>
                <el-input-number
                  v-model="rowCount"
                  :min="1"
                  :max="50"
                  :precision="0"
                  controls-position="right"
                  size="large"
                  class="count-input"
                  placeholder="設定步驟數"
                />
              </div>
            </el-col>

            <el-col :xs="24" :sm="24" :md="8">
              <div class="stats-card">
                <div class="stat-item">
                  <el-icon class="stat-icon">
                    <InfoFilled />
                  </el-icon>
                  <div class="stat-content">
                    <div class="stat-value">{{ rowCount }}</div>
                    <div class="stat-label">總步驟</div>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- Formula Steps Table -->
        <div v-if="!loading && rowCount > 0" class="steps-section">
          <div class="section-header">
            <el-icon class="section-icon">
              <Setting />
            </el-icon>
            <span class="section-title">步驟設定</span>
          </div>

          <el-table
            :data="formulaDetail"
            border
            stripe
            class="steps-table"
            :header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: '600' }"
            empty-text="請先設定步驟數量"
          >
            <el-table-column
              label="步驟"
              width="80"
              align="center"
            >
              <template #default="scope">
                <el-tag
                  type="primary"
                  size="small"
                  class="step-tag"
                  effect="light"
                >
                  {{ scope.$index + 1 }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column
              label="壓力設定 (kPa)"
              min-width="200"
            >
              <template #default="scope">
                <div class="input-container">
                  <el-input-number
                    v-model="scope.row.pressure"
                    :max="10000"
                    :precision="1"
                    controls-position="right"
                    size="small"
                    class="pressure-input"
                    placeholder="輸入壓力值"
                  />
                </div>
              </template>
            </el-table-column>

            <el-table-column
              label="處理時間 (分鐘)"
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
                    size="small"
                    class="time-input"
                    placeholder="輸入時間"
                  />
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
                  :type="getStepStatus(scope.row)"
                  size="small"
                  effect="light"
                >
                  {{ getStepStatusText(scope.row) }}
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
            class="action-btn primary-btn"
          >
            <el-icon>
              <Check />
            </el-icon>
            <span>儲存</span>
          </el-button>

          <el-button
            type="default"
            size="large"
            @click="$router.go(-1)"
            class="action-btn secondary-btn"
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
  EditPen,
  DocumentChecked,
  Edit,
  Document,
  List,
  InfoFilled,
  Setting,
  Check,
  Close,
  Loading
} from "@element-plus/icons-vue";

const route = useRoute();
const router = useRouter();
const axios: any = inject("axios"); // inject axios

interface FormulaDetailI {
  name: string;
  pressure: number;
  processTime: number;
  sequence: number;
}

const formulaDetail = ref<FormulaDetailI[]>([]);
const formulaName = ref("");
const rowCount = ref<number>(1);
const loading = ref(false);
const saving = ref(false);

const getFormulaDetail = async () => {
  loading.value = true;
  try {
    const id = route.params.id;
    const response = await axios.get("/formula/" + id);
    formulaDetail.value = response.data.data.details;
    formulaName.value = response.data.data.name;
    rowCount.value = formulaDetail.value.length;
  } catch (error) {
    console.error("載入配方資料失敗:", error);
    ElMessage.error("載入配方資料失敗");
  } finally {
    loading.value = false;
  }
};

const handleComplete = async () => {
  if (formulaName.value.trim() === "") {
    ElMessage.error("請輸入配方名稱");
    return;
  }

  if (formulaDetail.value.length <= 0) {
    ElMessage.error("配方不能為空，請至少設定一個步驟");
    return;
  }

  // 檢查是否有未填寫的資料 - 允許0值和負值
  const hasIncompleteStep = formulaDetail.value.some(step =>
    step.processTime < 0
  );

  if (hasIncompleteStep) {
    ElMessage.error("處理時間不能為負數");
    return;
  }

  saving.value = true;
  try {
    const id = route.params.id;
    const response = await axios.patch("/formula/" + id, {
      name: formulaName.value.trim(),
      detail: formulaDetail.value,
    });

    ElMessage.success("配方更新成功");
    router.back();
  } catch (error) {
    console.error("更新配方失敗:", error);
    ElMessage.error("更新配方失敗，請稍後再試");
  } finally {
    saving.value = false;
  }
};

const getStepStatus = (row: FormulaDetailI) => {
  // 只要有設定過值（包括負數），就視為已設定
  if (row.pressure !== undefined && row.pressure !== null &&
      row.processTime !== undefined && row.processTime !== null &&
      row.processTime >= 0) {
    return "success";
  } else {
    return "danger";
  }
};

const getStepStatusText = (row: FormulaDetailI) => {
  if (row.pressure !== undefined && row.pressure !== null &&
      row.processTime !== undefined && row.processTime !== null &&
      row.processTime >= 0) {
    return "已設定";
  } else {
    return "未設定";
  }
};

watch(
  () => rowCount.value,
  (newCount) => {
    if (newCount < 1) {
      rowCount.value = 1;
      return;
    }

    if (newCount > formulaDetail.value.length) {
      const newRowsCount = newCount - formulaDetail.value.length;
      for (let i = 0; i < newRowsCount; i++) {
        formulaDetail.value.push({
          name: "",
          pressure: 0,
          processTime: 0,
          sequence: formulaDetail.value.length + 1,
        });
      }
    } else if (newCount < formulaDetail.value.length) {
      const removeRowsCount = formulaDetail.value.length - newCount;
      formulaDetail.value.splice(newCount, removeRowsCount);
    }
  }
);

onMounted(() => {
  getFormulaDetail();
});
</script>

<style scoped>
.edit-formula-container {
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
  color: #e6a23c;
  background: rgba(230, 162, 60, 0.1);
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
  max-width: 1400px;
  margin: 0 auto;
}

.formula-card {
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
  color: #e6a23c;
}

.basic-info-section {
  margin-bottom: 32px;
}

.info-row {
  margin-bottom: 0;
}

.input-group {
  margin-bottom: 16px;
}

.input-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.label-icon {
  color: #409eff;
  font-size: 16px;
}

.formula-input,
.count-input {
  width: 100%;
}

.stats-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  padding: 20px;
  height: 100%;
  display: flex;
  align-items: center;
  color: white;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.stat-icon {
  font-size: 24px;
  opacity: 0.9;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  opacity: 0.8;
  font-weight: 500;
}

.steps-section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #e6a23c;
}

.section-icon {
  color: #e6a23c;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.steps-table {
  border-radius: 8px;
  overflow: hidden;
}

.step-tag {
  font-weight: 600;
  min-width: 32px;
  text-align: center;
}

.input-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.pressure-input,
.time-input {
  width: 120px;
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

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(230, 162, 60, 0.3);
}

.secondary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
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

/* Responsive Design */
@media (max-width: 768px) {
  .edit-formula-container {
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

  .info-row {
    margin-bottom: 0;
  }

  .input-group {
    margin-bottom: 20px;
  }

  .stats-card {
    margin-top: 20px;
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
    justify-content: flex-start;
  }

  .pressure-input,
  .time-input {
    width: 100px;
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

  .section-header {
    padding: 12px;
  }

  .section-title {
    font-size: 14px;
  }

  .stat-value {
    font-size: 28px;
  }

  .input-container {
    flex-direction: column;
    gap: 4px;
  }

  .pressure-input,
  .time-input {
    width: 100%;
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
  font-size: 16px !important;
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
  background: linear-gradient(135deg, #e6a23c 0%, #d5a032 100%);
  border: none;
}

:deep(.el-button--success:hover) {
  background: linear-gradient(135deg, #d5a032 0%, #c4962d 100%);
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

:deep(.el-input__inner:focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

:deep(.el-input-number__decrease:hover),
:deep(.el-input-number__increase:hover) {
  color: #409eff;
}
</style>
