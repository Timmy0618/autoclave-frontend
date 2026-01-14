<template>
  <div class="formula-container">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <el-icon size="32" class="header-icon">
          <List />
        </el-icon>
        <div class="header-text">
          <h1 class="page-title">Formula 名單</h1>
          <p class="page-subtitle">管理所有配方設定</p>
        </div>
      </div>
      <div class="header-actions">
        <el-button
          type="success"
          size="large"
          @click="handleAdd"
          class="add-button"
        >
          <el-icon>
            <Plus />
          </el-icon>
          <span>新增配方</span>
        </el-button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Formula List Section -->
      <el-card class="formula-list-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon class="card-icon">
              <Document />
            </el-icon>
            <span class="card-title">配方列表</span>
            <el-tag type="info" size="small" class="count-tag">
              {{ formulaData.length }} 個配方
            </el-tag>
          </div>
        </template>

        <el-table
          :data="formulaData"
          border
          stripe
          class="formula-table"
          :header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: '600' }"
          @current-change="handleCurrentChange"
          table-layout="auto"
          empty-text="目前沒有配方資料"
        >
          <el-table-column label="配方名稱" min-width="200">
            <template #default="scope">
              <div class="name-cell">
                <el-icon class="name-icon">
                  <DocumentChecked />
                </el-icon>
                <span class="formula-name">{{ scope.row.name }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="建立時間" min-width="180">
            <template #default="scope">
              <div class="time-cell">
                <el-icon class="time-icon">
                  <Clock />
                </el-icon>
                <span class="time-text">
                  {{ dayjs.utc(scope.row.createTime).format("YYYY-MM-DD HH:mm:ss") }}
                </span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="更新時間" min-width="180">
            <template #default="scope">
              <div class="time-cell">
                <el-icon class="time-icon">
                  <Refresh />
                </el-icon>
                <span class="time-text">
                  {{ dayjs.utc(scope.row.updateTime).format("YYYY-MM-DD HH:mm:ss") }}
                </span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="180" align="center">
            <template #default="scope">
              <div class="action-buttons">
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
                <el-button
                  type="danger"
                  size="small"
                  @click="handleDelete(scope.row.id)"
                  class="delete-button"
                >
                  <el-icon>
                    <Delete />
                  </el-icon>
                  刪除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- Formula Detail Section -->
      <el-card v-if="formulaDetail" class="formula-detail-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon class="card-icon">
              <Setting />
            </el-icon>
            <span class="card-title">{{ formulaDetail ? `${formulaDetail.name} 詳細資訊` : '配方詳細資訊' }}</span>
          </div>
        </template>

        <el-table
          :data="formulaDetail.details"
          border
          stripe
          class="detail-table"
          :header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: '600' }"
          empty-text="此配方沒有詳細設定"
        >
          <el-table-column label="步驟" width="80" align="center">
            <template #default="scope">
              <el-tag type="primary" size="small" class="step-tag">
                {{ scope.row.sequence + 1 }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="壓力設定" min-width="150">
            <template #default="scope">
              <div class="pressure-cell">
                <span class="pressure-value">{{ scope.row.pressure }}</span>
                <span class="pressure-unit">kPa</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="處理時間" min-width="150">
            <template #default="scope">
              <div class="time-cell">
                <span class="time-value">{{ scope.row.processTime }}</span>
                <span class="time-unit">分鐘</span>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- Empty Detail State -->
      <div v-else class="empty-detail-state">
        <el-empty description="請點選左側配方查看詳細資訊">
          <template #image>
            <el-icon size="48" class="empty-icon">
              <InfoFilled />
            </el-icon>
          </template>
        </el-empty>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, inject } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {
  List,
  Plus,
  Document,
  DocumentChecked,
  Clock,
  Refresh,
  Edit,
  Delete,
  Setting,
  InfoFilled
} from "@element-plus/icons-vue";

dayjs.extend(utc);

const route = useRoute();
const router = useRouter();
const axios: any = inject("axios");

interface Formula {
  createTime: Date;
  id: number;
  name: string;
  updateTime: Date;
}

interface FormulaDetail {
  name: string;
  details: Details[];
}

interface Details {
  pressure: number;
  processTime: number;
  sequence: number;
}

const formulaData = ref<Formula[]>([]);
const formulaDetail = ref<FormulaDetail | null>(null);

const handleCurrentChange = (formula: Formula) => {
  if (!formula) return;
  getFormulaDetail(formula.id);
};

const handleAdd = () => {
  router.push({ name: "formulaAdd" });
};

const handleEdit = (id: number) => {
  router.push({
    name: "formulaEdit",
    params: { id },
  });
};

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm("確定要刪除此配方嗎？", "警告", {
      confirmButtonText: "確定",
      cancelButtonText: "取消",
      type: "warning",
    });

    await axios.delete("/formula/" + id);
    ElMessage.success("配方刪除成功");
    getFormulaList();
    formulaDetail.value = null;
  } catch (error) {
    if (error !== 'cancel') {
      console.error("刪除配方失敗:", error);
      ElMessage.error("刪除配方失敗，請稍後再試");
    }
  }
};

const getFormulaList = async () => {
  try {
    const response = await axios.get("/formula");
    formulaData.value = response.data.data;
  } catch (error) {
    console.error("載入配方列表失敗:", error);
    ElMessage.error("載入配方列表失敗");
  }
};

const getFormulaDetail = async (id: number) => {
  try {
    const response = await axios.get("/formula/" + id);
    formulaDetail.value = response.data.data;
  } catch (error) {
    console.error("載入配方詳情失敗:", error);
    ElMessage.error("載入配方詳情失敗");
  }
};

onMounted(() => {
  getFormulaList();
});
</script>

<style scoped>
.formula-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.header-actions .add-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  font-weight: 500;
  padding: 12px 24px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.header-actions .add-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

@media (max-width: 1200px) {
  .main-content {
    grid-template-columns: 1fr;
  }
}

.formula-list-card,
.formula-detail-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.formula-list-card:hover,
.formula-detail-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-icon {
  color: #667eea;
}

.card-title {
  font-size: 22px;
  font-weight: 600;
  color: #2c3e50;
}

.count-tag {
  margin-left: auto;
}

.formula-table,
.detail-table {
  width: 100%;
}

.formula-table th,
.detail-table th {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  color: #495057;
  font-weight: 600;
  font-size: 18px;
  padding: 18px;
  text-align: left;
  border-bottom: 2px solid #dee2e6;
}

.formula-table td,
.detail-table td {
  padding: 18px;
  border-bottom: 1px solid #dee2e6;
  color: #495057;
  font-size: 17px;
  transition: background-color 0.2s ease;
}

.formula-table tr:hover td {
  background-color: #f8f9fa;
}

.name-cell,
.time-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.name-icon,
.time-icon {
  color: #667eea;
}

.formula-name {
  font-weight: 500;
  font-size: 17px;
}

.time-text {
  font-size: 17px;
}

.action-buttons {
  display: flex;
  gap: 8px;
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

.delete-button {
  background: #dc3545;
  border: none;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.delete-button:hover {
  background: #c82333;
  transform: translateY(-1px);
}

.step-tag {
  font-weight: 600;
  font-size: 16px;
}

.pressure-value {
  font-weight: 600;
  color: #28a745;
  font-size: 17px;
}

.pressure-unit,
.time-unit {
  font-size: 15px;
  color: #6c757d;
}

.time-value {
  font-weight: 600;
  color: #17a2b8;
  font-size: 17px;
}

.empty-detail-state {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon {
  color: #dee2e6;
}

@media (max-width: 768px) {
  .formula-container {
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

  .formula-list-card,
  .formula-detail-card {
    padding: 20px;
  }

  .formula-table th,
  .formula-table td,
  .detail-table th,
  .detail-table td {
    padding: 14px 10px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }

  .name-cell,
  .time-cell {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>
