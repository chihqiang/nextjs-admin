"use client"
import {
  AuthAccount,
  AuthMenuTree,
  getAccount,
  menuTree,
  removeAccount,
  setAccount,
} from "@/lib/account"
import {
  AuthToken,
  getToken,
  removeToken,
  setToken,
  emitLogout,
} from "@/lib/token"
import { useState, useEffect, useCallback } from "react"

/**
 * useAuth Hook 的返回类型
 */
export interface UseAuthReturn {
  /** 当前账户认证令牌 */
  authToken: AuthToken | null
  /** 当前账户信息（包含账户ID、姓名、邮箱、状态、菜单等） */
  authAccount: AuthAccount | null
  /** 认证初始化加载状态（用于控制加载中提示、避免权限判断异常） */
  isLoading: boolean
  /** 登录方法（传入 Token 完成登录） */
  login: (data: AuthToken) => void
  /** 设置当前账户方法（更新状态和本地存储） */
  setCurrentAccount: (account: AuthAccount) => void
  /** 获取当前账户菜单树（包含所有菜单、子菜单等） */
  getCurrentMenuTree: () => AuthMenuTree[]
  /** 退出方法（清空认证信息） */
  logout: () => void
  /** 获取当前登录账户ID（自动校验 Token 有效性） */
  getID: () => number | null
  /** 判断是否登录（核心权限判断） */
  isLoggedIn: () => boolean
}

/**
 * 权限管理自定义 Hooks（客户端专用）
 * 封装账户登录、退出、Token 校验、账户信息获取等核心权限相关逻辑
 * 统一管理认证状态，供全局组件复用，避免重复开发
 * @returns 权限相关状态和方法集合
 */
export const useAuth = (): UseAuthReturn => {
  // ==========================
  // 状态管理（权限核心状态）
  // ==========================
  // 存储当前账户的认证令牌
  // 类型为 AuthToken 或 null（未登录时为 null）
  const [authToken, setAuthToken] = useState<AuthToken | null>(null)
  // 存储当前账户的详细信息（包含账户ID、姓名、邮箱、状态、菜单等）
  // 类型为 AuthAccount 或 null（未登录/账户信息不存在时为 null）
  const [authAccount, setAuthAccount] = useState<AuthAccount | null>(null)
  // 加载状态：标记认证初始化过程是否完成（避免未初始化完成时使用权限状态导致异常）
  const [isLoading, setIsLoading] = useState(true)

  // ==========================
  // 初始化：从 localStorage 读取认证令牌
  // ==========================
  useEffect(() => {
    /**
     * 初始化认证状态函数
     * 组件挂载时执行，从本地存储中读取已保存的 Token，恢复账户认证状态
     * 异常捕获：处理 localStorage 读取失败、Token 格式错误等异常场景
     */
    const initAuth = () => {
      try {
        // 从本地存储读取 Token（getToken 已封装 localStorage 操作，避免重复代码）
        const data = getToken()
        // 若读取到有效 Token，更新 authToken 状态，恢复登录状态
        if (data) {
          setAuthToken(data)
        }
        // 从本地存储读取账户信息（getAccount 已封装 localStorage 操作，避免重复代码）
        const account = getAccount()
        // 若读取到有效账户信息，更新 authAccount 状态，恢复账户状态
        if (account) {
          setAuthAccount(account)
        }
      } catch (e) {
        // 捕获初始化过程中的所有异常（如 localStorage 禁用、Token 解析失败等）
        console.error("Auth 初始化错误：", e)
      } finally {
        // 无论初始化成功/失败，都结束加载状态，允许组件使用权限相关方法
        setIsLoading(false)
      }
    }

    // 执行初始化函数
    initAuth()
  }, []) // 空依赖数组：仅在组件挂载时执行一次，避免重复初始化

  // ==========================
  // 登录：保存 Token 到状态和本地存储
  // ==========================
  /**
   * 登录方法：用于账户登录成功后，保存认证信息
   * @param data - 登录成功返回的认证令牌
   * @returns 无返回值，仅更新状态和本地存储
   * @note 使用 useCallback 记忆化，避免因组件重渲染导致方法重新创建，优化性能
   */
  const login = useCallback((data: AuthToken) => {
    // 更新组件内 authToken 状态（用于实时响应登录状态变化）
    setAuthToken(data)
    // 将 Token 写入本地存储（setToken 已封装，持久化存储，刷新页面后仍能恢复状态）
    setToken(data)
  }, []) // 无依赖：方法逻辑不依赖外部变量，仅记忆化自身

  // ==========================
  // 设置当前账户：更新状态和本地存储
  // ==========================
  /**
   * 设置当前账户方法：用于在登录成功后，更新组件内 authAccount 状态和本地存储
   * @param account - 登录成功返回的账户信息（AuthAccount 类型，包含账户ID、姓名、邮箱、状态、菜单等）
   * @returns 无返回值，仅更新状态和本地存储
   * @note 使用 useCallback 记忆化，避免因组件重渲染导致方法重新创建，优化性能
   */
  const setCurrentAccount = useCallback((account: AuthAccount) => {
    // 更新组件内 authAccount 状态（用于实时响应账户信息变化）
    setAuthAccount(account)
    // 将账户信息写入本地存储（setAccount 已封装，持久化存储，刷新页面后仍能恢复状态）
    setAccount(account)
  }, []) // 无依赖：方法逻辑不依赖外部变量，仅记忆化自身

  const getCurrentMenuTree = useCallback(() => {
    const account = authAccount || getAccount()
    if (!account) {
      return []
    }
    return menuTree(account.menus)
  }, [authAccount])
  // ==========================
  // 退出：清空状态和本地存储的 Token
  // ==========================
  /**
   * 退出方法：用于账户退出登录，清除所有认证相关信息
   * @returns 无返回值，清空状态和本地存储
   * @note 使用 useCallback 记忆化，优化组件重渲染性能
   */
  const logout = useCallback(() => {
    // 清空组件内 authToken 状态，标记为未登录
    setAuthToken(null)
    // 从本地存储中删除 Token（removeToken 已封装，彻底清除持久化的认证信息）
    removeToken()
    // 从本地存储中删除账户信息（removeAccount 已封装，彻底清除持久化的账户信息）
    removeAccount()
    // 发出登出事件，通知全局监听器处理登出逻辑
    emitLogout("用户已登出")
  }, []) // 无依赖：方法逻辑不依赖外部变量，仅记忆化自身

  // ==========================
  // 获取当前登录账户 ID（封装权限相关的账户信息获取）
  // ==========================
  /**
   * 获取当前登录账户 ID
   * @returns number | null - 登录时返回账户ID，否则返回 null
   */
  const getID = useCallback((): number | null => {
    return authToken?.id ?? null
  }, [authToken])

  // ==========================
  // 判断账户是否登录（核心权限判断方法）
  // ==========================
  /**
   * 判断账户当前是否处于登录状态
   * @returns boolean - true：已登录；false：未登录
   */
  const isLoggedIn = useCallback((): boolean => {
    return !!authToken
  }, [authToken])

  // ==========================
  // 暴露权限相关状态和方法（供外部组件使用）
  // ==========================
  return {
    authToken,
    authAccount,
    isLoading,
    login,
    setCurrentAccount,
    getCurrentMenuTree,
    logout,
    getID,
    isLoggedIn,
  }
}
