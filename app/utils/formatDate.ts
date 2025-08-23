export default function (date: Date | number, fmt: string) {
    // 创建Date对象
    date = new Date(date);
    
    // 强制转换为东八区时间 (UTC+8)
    const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
    const chinaTime = new Date(utcTime + (8 * 3600000));
    
    var o = {
        "M+": chinaTime.getMonth() + 1, //月份 
        "d+": chinaTime.getDate(), //日 
        "H+": chinaTime.getHours(), //小时 
        "m+": chinaTime.getMinutes(), //分 
        "s+": chinaTime.getSeconds(), //秒 
        "q+": Math.floor((chinaTime.getMonth() + 3) / 3), //季度 
        "S": chinaTime.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (chinaTime.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o) {
        // @ts-ignore
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    }
    return fmt;
}