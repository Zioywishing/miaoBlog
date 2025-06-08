import checkUserData from '../utils/initUserData'

export default defineNitroPlugin(() => {
  // 在服务启动时立即初始化用户数据
  console.log('服务启动：初始化用户数据')
  checkUserData()
}) 