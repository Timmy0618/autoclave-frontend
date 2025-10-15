<template>
  <div class="add-formula-container">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <el-icon size="32" class="header-icon">
          <Plus />
        </el-icon>
        <div class="header-text">
          <h1 class="page-title">Formula 排程新增</h1>
          <p class="page-subtitle">建立新的配方排程設定</p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <el-card class="formula-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon class="card-icon">
              <DocumentAdd />
            </el-icon>
            <span class="card-title">配方資訊</span>
          </div>
        </template>

        <!-- Formula Basic Info -->
        <div class="basic-info-section">
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
                  v-model="formulaCount"
                  :min="1"
                  :max="formulaLimit"
                  :precision="0"
                  controls-position="right"
                  size="large"
                  class="count-input"
                  :placeholder="`最多 ${formulaLimit} 步`"
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
                    <div class="stat-value">{{ formulaCount }}</div>
                    <div class="stat-label">總步驟</div>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- Formula Steps Table -->
        <div v-if="formulaCount > 0" class="steps-section">
          <div class="section-header">
            <el-icon class="section-icon">
              <Setting />
            </el-icon>
            <span class="section-title">步驟設定</span>
          </div>

          <el-table
            :data="formulaData"
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
                    :min="0"
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
            <span>完成</span>
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
import { useRouter } from "vue-router";
import { ref, onMounted, inject, watch } from "vue";
import { ElMessage } from "element-plus";
import {
  Plus,
  DocumentAdd,
  Edit,
  Document,
  List,
  InfoFilled,
  Setting,
  Check,
  Close
} from "@element-plus/icons-vue";

const router = useRouter();
const axios: any = inject("axios"); // inject axios
const formulaLimit = 20;

interface Detail {
  pressure: number;
  processTime: number;
}

interface PostData {
  name: string;
  detail: Detail[];
}

const formulaCount = ref<number>(0);
const formulaName = ref<string>("");
const formulaData = ref<Detail[]>([]);
const saving = ref(false);

const showError = (msg: string) => {
  ElMessage({
    type: "error",
    message: msg,
  });
};

const handleComplete = async () => {
  if (formulaName.value.trim() === "") {
    showError("請輸入配方名稱");
    return;
  }

  if (formulaData.value.length <= 0) {
    showError("配方不能為空，請至少設定一個步驟");
    return;
  }

  // 檢查是否有未填寫的資料 - 允許0值
  const hasIncompleteStep = formulaData.value.some(step =>
    step.pressure < 0 || step.processTime < 0
  );

  if (hasIncompleteStep) {
    showError("壓力值和處理時間不能為負數");
    return;
  }

  const postData: PostData = {
    name: formulaName.value.trim(),
    detail: formulaData.value,
  };

  saving.value = true;
  try {
    const response = await axios.post("/formula", postData);
    if (response.data.msg === "Success") {
      ElMessage.success("配方新增成功");
      router.go(-1);
    } else {
      ElMessage.warning(response.data.msg);
    }
  } catch (error) {
    console.error("新增配方失敗:", error);
    ElMessage.error("新增配方失敗，請稍後再試");
  } finally {
    saving.value = false;
  }
};

const getStepStatus = (row: Detail) => {
  // 只要有設定過值（包括0），就視為已設定
  if (row.pressure >= 0 && row.processTime >= 0) {
    return "success";
  } else {
    return "danger";
  }
};

const getStepStatusText = (row: Detail) => {
  if (row.pressure >= 0 && row.processTime >= 0) {
    return "已設定";
  } else {
    return "未設定";
  }
};

// 監視數據變化，確保 processTime 不為負數
watch(
  () => formulaData.value,
  (newData) => {
    if (newData) {
      newData.forEach((detail) => {
        if (Number(detail.processTime) < 0) {
          detail.processTime = 0;
        }
      });
    }
  },
  { deep: true }
);

// 監視 formulaCount 變化，動態調整 formulaData
watch(formulaCount, (newCount) => {
  if (newCount > formulaLimit) {
    formulaCount.value = formulaLimit;
    return;
  }
  if (newCount < 0) {
    formulaCount.value = 0;
    return;
  }

  const temp: Detail[] = [];
  for (let i = 0; i < newCount; i++) {
    if (formulaData.value[i]) {
      temp.push(formulaData.value[i]);
    } else {
      temp.push({
        pressure: 0,
        processTime: 0,
      });
    }
  }

  formulaData.value = temp;
});

onMounted(() => {});
</script>

<style scoped>
.add-formula-container {
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
  color: #67c23a;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  border-left: 4px solid #409eff;
}

.section-icon {
  color: #409eff;
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
  box-shadow: 0 6px 20px rgba(103, 194, 58, 0.3);
}

.secondary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

/* Responsive Design */
@media (max-width: 768px) {
  .add-formula-container {
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

:deep(.el-input__inner:focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

:deep(.el-input-number__decrease:hover),
:deep(.el-input-number__increase:hover) {
  color: #409eff;
}
</style>
