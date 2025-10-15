<template>
  <div class="edit-festo-container">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <el-icon size="32" class="header-icon">
          <EditPen />
        </el-icon>
        <div class="header-text">
          <h1 class="page-title">Festo 編輯</h1>
          <p class="page-subtitle">編輯 Festo 設備設定</p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <el-card class="festo-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon class="card-icon">
              <Setting />
            </el-icon>
            <span class="card-title">設備資訊</span>
          </div>
        </template>

        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
          <el-icon class="loading-icon">
            <Loading />
          </el-icon>
          <p>載入設備資料中...</p>
        </div>

        <!-- Festo Information -->
        <div v-else class="info-section">
          <el-row :gutter="24" class="info-row">
            <el-col :xs="24" :sm="24" :md="24">
              <div class="info-item">
                <label class="info-label">
                  <el-icon class="label-icon">
                    <Document />
                  </el-icon>
                  設備名稱
                </label>
                <div class="info-value">{{ festoData?.name || '載入中...' }}</div>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- Configuration Section -->
        <div class="config-section">
          <div class="section-header">
            <el-icon class="section-icon">
              <Tools />
            </el-icon>
            <span class="section-title">設定參數</span>
          </div>

          <el-row :gutter="24" class="config-row">
            <el-col :xs="24" :sm="12" :md="8">
              <div class="input-group">
                <label class="input-label">
                  <el-icon class="label-icon">
                    <List />
                  </el-icon>
                  配方選擇
                </label>
                <el-select
                  v-model="selectedFormulaId"
                  placeholder="請選擇配方"
                  size="large"
                  class="formula-select"
                  filterable
                  clearable
                  @change="handleFormulaChange"
                >
                  <el-option
                    v-for="formula in formulaData"
                    :key="formula.id"
                    :label="formula.name"
                    :value="formula.id"
                  />
                </el-select>
              </div>
            </el-col>

            <el-col :xs="24" :sm="12" :md="8">
              <div class="input-group">
                <label class="input-label">
                  <el-icon class="label-icon">
                    <DocumentCopy />
                  </el-icon>
                  批號
                </label>
                <el-input
                  v-model="batchNumber"
                  placeholder="請輸入批號"
                  size="large"
                  clearable
                  :maxlength="50"
                  show-word-limit
                  class="batch-input"
                >
                  <template #prefix>
                    <el-icon>
                      <DocumentCopy />
                    </el-icon>
                  </template>
                </el-input>
              </div>
            </el-col>

            <el-col :xs="24" :sm="12" :md="8">
              <div class="input-group">
                <label class="input-label">
                  <el-icon class="label-icon">
                    <Timer />
                  </el-icon>
                  警告時間 (分鐘)
                </label>
                <el-input-number
                  v-model="warningTime"
                  :min="0"
                  :max="1440"
                  :precision="0"
                  controls-position="right"
                  size="large"
                  class="warning-input"
                  placeholder="輸入警告時間"
                />
              </div>
            </el-col>
          </el-row>
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
  Setting,
  Document,
  List,
  DocumentCopy,
  Timer,
  Tools,
  Check,
  Close,
  Loading
} from "@element-plus/icons-vue";

const route = useRoute();
const router = useRouter();
const axios: any = inject("axios");

interface Festo {
  id: number;
  formulaName: string;
  formulaId: number;
  batchNumber: string;
  name: string;
  slaveId: number;
  warningTime: number;
}

interface Formula {
  create_time: Date;
  id: number;
  name: string;
  update_time: Date;
}

const festoData = ref<Festo | null>(null);
const formulaData = ref<Formula[]>([]);
const batchNumber = ref("");
const warningTime = ref(0);
const selectedFormulaId = ref<number | undefined>(undefined);
const loading = ref(false);
const saving = ref(false);

const getFesto = async (id: string | string[]) => {
  loading.value = true;
  try {
    const response = await axios.get("/festo/" + id);
    festoData.value = response.data.data;
    selectedFormulaId.value = festoData.value?.formulaId;
    batchNumber.value = festoData.value?.batchNumber || "";
    warningTime.value = festoData.value?.warningTime || 0;
  } catch (error) {
    console.error("載入設備資料失敗:", error);
    ElMessage.error("載入設備資料失敗");
  } finally {
    loading.value = false;
  }
};

const getFormula = async () => {
  try {
    const response = await axios.get("/formula");
    formulaData.value = response.data.data;
  } catch (error) {
    console.error("載入配方資料失敗:", error);
    ElMessage.error("載入配方資料失敗");
  }
};

const handleComplete = async () => {
  if (!batchNumber.value.trim()) {
    ElMessage.error("請輸入批號");
    return;
  }

  if (warningTime.value < 0) {
    ElMessage.error("警告時間不能為負數");
    return;
  }

  saving.value = true;
  try {
    const response = await axios.patch("/festo/" + route.params.id, {
      formulaId: selectedFormulaId.value,
      batchNumber: batchNumber.value.trim(),
      warningTime: warningTime.value,
    });

    if (response.data.msg === "Success") {
      ElMessage.success("設備更新成功");
      router.back();
    } else {
      ElMessage.warning(response.data.msg);
    }
  } catch (error) {
    console.error("更新設備失敗:", error);
    ElMessage.error("更新設備失敗，請稍後再試");
  } finally {
    saving.value = false;
  }
};

const handleFormulaChange = (value: number) => {
  selectedFormulaId.value = value;
};

watch(
  () => warningTime.value,
  (newValue) => {
    if (newValue < 0) {
      warningTime.value = 0;
    }
  }
);

onMounted(() => {
  getFesto(route.params.id);
  getFormula();
});
</script>

<style scoped>
.edit-festo-container {
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
  max-width: 1200px;
  margin: 0 auto;
}

.festo-card {
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

.info-section {
  margin-bottom: 32px;
}

.info-row {
  margin-bottom: 0;
}

.info-item {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 20px;
  color: white;
}

.info-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  opacity: 0.9;
}

.label-icon {
  font-size: 16px;
}

.info-value {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
}

.config-section {
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

.config-row {
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

.formula-select,
.batch-input,
.warning-input {
  width: 100%;
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

/* Responsive Design */
@media (max-width: 768px) {
  .edit-festo-container {
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

  .info-item {
    margin-bottom: 20px;
  }

  .config-row {
    margin-bottom: 0;
  }

  .input-group {
    margin-bottom: 20px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 12px;
  }

  .action-btn {
    width: 100%;
    max-width: 200px;
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

  .info-value {
    font-size: 20px;
  }
}

/* Element Plus overrides */
:deep(.el-card__header) {
  background: linear-gradient(90deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #dee2e6;
  padding: 16px 24px;
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

:deep(.el-select .el-input__inner:focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}
</style>
