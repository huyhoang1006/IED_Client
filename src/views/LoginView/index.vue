<template>
    <div id="login">
        <!-- TopBar Header -->
        <top-bar id="top-bar"></top-bar>

        <!-- Main Content -->
        <section id="main-windows">
            <div class="main-content">
                <div class="login">
                    <el-card>
                        <div class="logo">
                            <img src="../../assets/images/logo.png" style="max-height: 60px" />
                        </div>
                        <h2>Login</h2>
                        <el-form :model="model" :rules="loginRules" ref="form" @submit.prevent="login">
                            <el-form-item prop="username">
                                <el-input v-model="model.username" placeholder="Username">
                                    <template #prefix>
                                        <i class="fas fa-user"></i>
                                    </template>
                                </el-input>
                            </el-form-item>
                            <el-form-item prop="password">
                                <el-input v-model="model.password" placeholder="Password" type="password" show-password>
                                    <template #prefix>
                                        <i class="fas fa-lock"></i>
                                    </template>
                                </el-input>
                            </el-form-item>
                            <el-form-item>
                                <el-checkbox v-model="remember" class="float-left">Remember</el-checkbox>
                            </el-form-item>
                            <el-form-item>
                                <el-button :loading="loadingLogin" class="login-button" type="primary" native-type="submit" block>Login</el-button>
                            </el-form-item>
                        </el-form>
                    </el-card>
                </div>
            </div>
        </section>

        <!-- LogBar Footer -->
        <!-- <div v-if="showOutLine" id="out-line">
            <div @click="retweet" class="retweet">
                <i style="font-size: 10px; color: white; margin-right: 5px;" class="fa-solid fa-retweet"></i>
                <span v-if="serverSign" style="color: white;">s</span>
                <span v-else style="color: white;">c</span>
            </div>
            <div style="display: flex; direction: rtl; width: 100%;">
                <i @click="showLog" style="font-size: 10px; color: white; margin-right: 5px;" class="fa-solid fa-circle-chevron-up"></i>
            </div>
        </div> -->
    </div>
</template>

<script>
/* eslint-disable */
import * as userApi from '@/api/user'
import TopBar from '@/components/TopBar/index.vue'

export default {
    name: 'LoginView',
    components: {
        TopBar
    },
    data() {
        return {
            formLabelWidth: '140px',
            model: {
                username: '',
                password: ''
            },
            remember: true,
            loadingLogin: false,
            // Layout control variables
            retweetSign: false,
            serverSign: false,
            showOutLine: true,
            loginRules: {
                username: [
                    {
                        required: true,
                        message: 'Username is required',
                        trigger: 'blur'
                    }
                    // {
                    //     min: 5,
                    //     message: 'Username length should be at least 5 characters',
                    //     trigger: 'blur'
                    // }
                ],
                password: [
                    {
                        required: true,
                        message: 'Password is required',
                        trigger: 'blur'
                    }
                    // {
                    //     min: 8,
                    //     message: 'Password length should be at least 8 characters',
                    //     trigger: 'blur'
                    // }
                ]
            },
            dialogSignup: false,
            loadingSignup: false,
            formSignup: {
                username: '',
                password: '',
                firstName: '',
                lastName: '',
                gender: '',
                email: '',
                phone: '',
                birthDate: ''
            },
            redirect: undefined,
            otherQuery: {}
        }
    },
    watch: {
        $route: {
            handler: function (route) {
                const query = route.query
                if (query) {
                    this.redirect = query.redirect
                    this.otherQuery = this.getOtherQuery(query)
                }
            },
            immediate: true
        }
    },
    methods: {
        async login() {
            let valid = await this.$refs.form.validate()
            if (!valid) {
                return
            }
            this.loadingLogin = true
            await this.$common.simulateLoading()
            userApi
                .login(this.model)
                .then((response) => {
                    // Debug: Log response để xem cấu trúc
                    console.log('Login response:', response)
                    console.log('Response data:', response.data)

                    // Tạo userData object với cấu trúc đúng
                    const userData = {
                        name: this.model.username,
                        token: response.data?.token || response.token || response.data?.access_token || response.access_token || null,
                        role: response.data?.role || response.role || 'user',
                        user_id: response.data?.user_id || response.user_id || null,
                        ...response.data // Spread các field khác nếu có
                    }

                    console.log('UserData created:', userData)

                    // Kiểm tra token trước khi tiếp tục
                    if (!userData.token) {
                        this.$message.warning('Login successful but no token received')
                        console.warn('No token found in response:', response)
                    }

                    this.$message.success('Login successfully')
                    this.$helper.afterLogin(this.remember, userData)

                    // Cập nhật store với user data
                    this.$store.dispatch('login', userData)

                    // Chuyển đến dashboard sau khi login thành công
                    this.$router.push({path: '/dashboard', query: this.otherQuery})
                })
                .catch((error) => {
                    this.$message.error(error.message)
                })
                .finally(async () => {
                    this.loadingLogin = false
                })
        },
        getOtherQuery(query) {
            return Object.keys(query).reduce((acc, cur) => {
                if (cur !== 'redirect') {
                    acc[cur] = query[cur]
                }
                return acc
            }, {})
        },
        retweet() {
            this.serverSign = !this.serverSign
        }
    }
}
</script>

<style scoped>
#login {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
    margin: 0;
    padding: 0;
    font-family: 'Arial', sans-serif;
    position: fixed;
    top: 0;
    left: 0;
    overflow-x: hidden; /* Ẩn scrollbar ngang */
    box-sizing: border-box;
}

#top-bar {
    width: 100%;
    height: 6vh;
}

#main-windows {
    width: 100%;
    height: calc(100% - 6vh - 20px);
    box-sizing: border-box;
}

#out-line {
    width: 100%;
    height: 20px;
    background-color: #012596;
    display: flex;
    align-items: center;
    gap: 10px;
}

.retweet {
    display: flex;
    direction: ltr;
    background-color: #088f8f;
    height: 100%;
    width: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Header */
.header {
    background: #1e3a8a;
    height: 60px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    color: white;
}

.header-left .logo {
    display: flex;
    align-items: center;
}

.logo-at {
    font-size: 28px;
    font-weight: bold;
    color: #dc2626;
    margin-right: 5px;
    position: relative;
}

.logo-at::after {
    content: '';
    position: absolute;
    top: 50%;
    right: -8px;
    width: 20px;
    height: 2px;
    background: #dc2626;
    transform: translateY(-50%);
}

.logo-text {
    font-size: 18px;
    font-weight: 500;
    color: white;
}

.header-right .header-icons {
    display: flex;
    gap: 15px;
}

.header-icons i {
    font-size: 16px;
    cursor: pointer;
    padding: 5px;
}

.header-icons i:hover {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
}

/* Main Content */
.main-content {
    flex: 1;
    background: #f8fafc;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    width: 100%;
    height: 100%;
    max-width: 100%;
    box-sizing: border-box;
}

.login {
    width: 100%;
    max-width: 600px;
    box-sizing: border-box;
}

/* Login Card */
.login .el-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    padding: 40px;
    text-align: center;
    margin: 0 auto;
}

.logo {
    margin-bottom: 20px;
    text-align: center;
}

.logo img {
    max-height: 60px;
    width: auto;
}

h2 {
    font-size: 24px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 30px 0;
    text-align: center;
}

/* Form Styling */
.el-form {
    text-align: left;
}

.el-form-item {
    margin-bottom: 20px;
}

.el-input {
    height: 45px;
}

.el-input__wrapper {
    border-radius: 6px;
    border: 1px solid #d1d5db;
    box-shadow: none;
}

.el-input__wrapper:hover {
    border-color: #1e3a8a;
}

.el-input__wrapper.is-focus {
    border-color: #1e3a8a;
    box-shadow: 0 0 0 2px rgba(30, 58, 138, 0.1);
}

.el-checkbox {
    color: #374151;
}

.el-checkbox__input.is-checked .el-checkbox__inner {
    background-color: #1e3a8a;
    border-color: #1e3a8a;
}

.login-button {
    height: 45px;
    background-color: #1e3a8a;
    border-color: #1e3a8a;
    font-size: 16px;
    font-weight: 500;
    width: 100%;
}

.login-button:hover {
    background-color: #1e40af;
    border-color: #1e40af;
}

/* Footer */
.footer {
    background: #1e3a8a;
    height: 50px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    color: white;
}

.footer-left {
    display: flex;
    align-items: center;
    gap: 15px;
}

.footer-icon {
    width: 30px;
    height: 30px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
}

.footer-icon.green {
    background: #10b981;
}

.footer-left i {
    font-size: 16px;
    cursor: pointer;
    padding: 5px;
}

.footer-left i:hover {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
}

.footer-right i {
    font-size: 14px;
    cursor: pointer;
    padding: 5px;
}

.footer-right i:hover {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
}
</style>
