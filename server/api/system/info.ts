import os from 'os';
import { execSync } from 'child_process';

export default defineEventHandler(async (event) => {
  try {
    // 获取操作系统信息
    const platform = os.platform();
    const release = os.release();
    const hostname = os.hostname();
    
    // 获取Node.js版本
    const nodeVersion = process.version;
    
    // 硬件信息
    const cpuInfo = os.cpus();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    
    // 计算CPU使用率
    const cpuUsage = getCpuUsage();
    
    // 计算内存使用率
    const memoryUsage = {
      total: formatBytes(totalMemory),
      free: formatBytes(freeMemory),
      used: formatBytes(totalMemory - freeMemory),
      percent: Math.round(((totalMemory - freeMemory) / totalMemory) * 100)
    };
    
    return {
      success: true,
      data: {
        system: {
          platform,
          release,
          hostname
        },
        node: nodeVersion,
        hardware: {
          cpu: {
            model: cpuInfo[0]?.model || 'Unknown',
            cores: cpuInfo.length,
            usage: cpuUsage
          },
          memory: memoryUsage
        }
      }
    };
  } catch (error) {
    console.error('Error fetching system info:', error);
    return {
      success: false,
      message: '获取系统信息失败'
    };
  }
});

// 格式化字节数为可读格式
function formatBytes(bytes: number) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 获取CPU使用率
function getCpuUsage() {
  try {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;
    
    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type as keyof typeof cpu.times];
      }
      totalIdle += cpu.times.idle;
    });
    
    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    const usagePercent = Math.round(100 - (idle / total * 100));
    
    return usagePercent;
  } catch (error) {
    console.error('Error calculating CPU usage:', error);
    return 0;
  }
} 