"use client"
import { useEffect } from "react"
import { usePathname } from "next/navigation"
import NProgress from "nprogress"
import "nprogress/nprogress.css"

// ==============================
// 全局配置 NProgress
// 【组件内手动使用方式】
// import NProgress from "nprogress";
// // 开始加载
// NProgress.start();
// // 结束加载
// NProgress.done();
// ==============================

NProgress.configure({
  // 最小加载百分比（默认 0.08）
  minimum: 0.3,
  // 动画曲线
  easing: "ease",
  // 动画速度（毫秒）
  speed: 500,
  // 是否自动增量加载
  trickle: true,
  // 自动增量速度
  trickleSpeed: 200,
  // 是否显示右上角旋转加载图标（后台系统建议关闭）
  showSpinner: false,
})

/**
 * 路由进度条 Provider 组件
 * 作用：监听路由变化，自动开始/结束进度条
 * 使用方式：在根布局 layout.tsx 中全局引入
 */
export function NProgressProvider() {
  // 获取当前路由路径
  const pathname = usePathname()

  // ==============================
  // 监听路由变化，自动触发进度条
  // ==============================
  useEffect(() => {
    // 路由开始切换 → 启动进度条
    NProgress.start()

    // 模拟加载完成延迟（让进度条动画更自然，可根据需求调整）
    const timer = setTimeout(() => {
      // 路由切换完成 → 结束进度条
      NProgress.done()
    }, 300)

    // 清理定时器（防止内存泄漏）
    return () => clearTimeout(timer)
  }, [pathname]) // 依赖：路由变化时执行

  // 该组件只做逻辑处理，不需要渲染任何 DOM
  return null
}
