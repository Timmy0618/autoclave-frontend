<template>
    <el-row justify="center">
        <el-card class="box-card">
            <el-row style="margin-bottom: 20px;" justify="center">
                <el-col :span="3">
                    <span class="ml-3 w-35 text-gray-600 inline-flex items-center">UserName: </span>
                </el-col>
                <el-col :span="4">
                    <el-input v-model="userName" class="w-40" placeholder="UserName"
                        @keyup.enter.native="handleLogin" />
                </el-col>
            </el-row>
            <el-row style="margin-bottom: 20px;" justify="center">
                <el-col :span="3">
                    <span class="ml-3 w-35 text-gray-600 inline-flex items-center">Password: </span>
                </el-col>
                <el-col :span="4">
                    <el-input v-model="password" class="w-40" type="password" placeholder="Password" show-password
                        @keyup.enter.native="handleLogin" />
                </el-col>
            </el-row>
            <el-row justify="center">
                <el-button type="primary" plain @click="handleLogin">Login</el-button>
            </el-row>
        </el-card>
    </el-row>

</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';
import { ref, inject } from 'vue'
import { useCookies } from "vue3-cookies";
import { ElMessage } from 'element-plus'

const axios: any = inject('axios')  // inject axios
const { cookies } = useCookies()

interface user {
    name: string;
    password: string;
}

const userName = ref('')
const password = ref('')
const router = useRouter()

const handleLogin = () => {
    if (!userName.value || !password.value) {
        ElMessage({
            message: "UserName or Password can't be empty",
            type: 'warning',
        })
        return
    }

    axios
        .post("/user/login", { name: userName.value, password: password.value })
        .then(function (response: { data: any }) {
            // handle success
            if (response.data.Msg == "Success") {
                const token = `Bearer ${response.data.Data}`
                cookies.set("Authorization", token)
                axios.defaults.headers.common['Authorization'] = token;
                router.push({ name: 'festo' })
                return;
            } else alert(response.data.Msg);
        })
        .catch(function (error: { data: any }) {
            // handle error
            console.log(error);
        })
        .then(function () {
            // always executed
        });
}

</script>

<style>
.box-card {
    width: 720px;
}
</style>