"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner"

// ==================== 类型定义 ====================

/**
 * CRUD 操作配置项
 * @template T 实体类型
 */
export interface CrudOptions<T> {
  /** 新增 API */
  createApi: (data: T) => Promise<unknown>
  /** 更新 API */
  updateApi: (data: T & { id: number }) => Promise<unknown>
  /** 删除 API */
  deleteApi: (id: number) => Promise<unknown>
  /** 操作成功后的回调 */
  onSuccess?: () => void
  /** 新增成功提示语 */
  createSuccessMessage?: string
  /** 更新成功提示语 */
  updateSuccessMessage?: string
  /** 删除成功提示语 */
  deleteSuccessMessage?: string
}

/**
 * useCrudDialog Hook 返回值
 * @template T 实体类型
 */
export interface CrudDialogReturn<T> {
  // ==================== 状态 ====================
  /** 新增弹窗是否打开 */
  isAddDialogOpen: boolean
  /** 编辑弹窗是否打开 */
  isEditDialogOpen: boolean
  /** 删除确认弹窗是否打开 */
  isDeleteDialogOpen: boolean
  /** 当前选中的实体（用于编辑/删除） */
  currentItem: T | null
  /** 是否正在加载 */
  isLoading: boolean

  // ==================== 弹窗控制 ====================
  /** 打开新增弹窗 */
  openAddDialog: () => void
  /** 关闭所有弹窗并清空当前选中项 */
  closeAllDialogs: () => void

  // ==================== 业务方法 ====================
  /** 打开编辑弹窗 */
  openEditDialog: (item: T) => void
  /** 打开删除确认弹窗 */
  openDeleteDialog: (item: T) => void
  /** 处理新增 */
  handleCreate: (data: T) => Promise<void>
  /** 处理更新 */
  handleUpdate: (data: T) => Promise<void>
  /** 处理删除 */
  handleDelete: () => Promise<void>
}

// ==================== Hook 实现 ====================

/**
 * CRUD 弹窗状态管理 Hook
 *
 * 封装常见的增删改查弹窗逻辑，避免在每个列表组件中重复编写。
 *
 * @template T 实体类型（如 Account、Role、Menu）
 * @param options CRUD 操作配置（API 方法和回调）
 * @returns CRUD 弹窗状态和方法
 *
 * @example
 * ```tsx
 * const {
 *   isAddDialogOpen,
 *   currentItem,
 *   isLoading,
 *   openAddDialog,
 *   openEditDialog,
 *   handleCreate,
 *   handleUpdate,
 *   handleDelete,
 * } = useCrudDialog({
 *   createApi: accountCreateApi,
 *   updateApi: accountUpdateApi,
 *   deleteApi: accountDeleteApi,
 *   onSuccess: fetchData,
 *   createSuccessMessage: "账号创建成功",
 * })
 * ```
 */
export function useCrudDialog<T>(options: CrudOptions<T>): CrudDialogReturn<T> {
  const {
    createApi,
    updateApi,
    deleteApi,
    onSuccess,
    createSuccessMessage = "操作成功",
    updateSuccessMessage = "操作成功",
    deleteSuccessMessage = "操作成功",
  } = options

  // ==================== 状态 ====================
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentItem, setCurrentItem] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // ==================== 弹窗控制 ====================

  /**
   * 打开新增弹窗
   */
  const openAddDialog = useCallback(() => {
    setCurrentItem(null)
    setIsAddDialogOpen(true)
  }, [])

  /**
   * 关闭所有弹窗并清空当前选中项
   */
  const closeAllDialogs = useCallback(() => {
    setIsAddDialogOpen(false)
    setIsEditDialogOpen(false)
    setIsDeleteDialogOpen(false)
    setCurrentItem(null)
  }, [])

  /**
   * 打开编辑弹窗
   */
  const openEditDialog = useCallback((item: T) => {
    setCurrentItem(item)
    setIsEditDialogOpen(true)
  }, [])

  /**
   * 打开删除确认弹窗
   */
  const openDeleteDialog = useCallback((item: T) => {
    setCurrentItem(item)
    setIsDeleteDialogOpen(true)
  }, [])

  // ==================== 业务方法 ====================

  /**
   * 处理新增
   */
  const handleCreate = useCallback(
    async (data: T) => {
      try {
        setIsLoading(true)
        await createApi(data)
        setIsAddDialogOpen(false)
        toast.success(createSuccessMessage)
        onSuccess?.()
      } catch (error) {
        const msg = error instanceof Error ? error.message : "操作失败"
        toast.error(msg)
        throw error // 让调用方可以处理错误
      } finally {
        setIsLoading(false)
      }
    },
    [createApi, createSuccessMessage, onSuccess]
  )

  /**
   * 处理更新
   */
  const handleUpdate = useCallback(
    async (data: T) => {
      if (!currentItem) return
      try {
        setIsLoading(true)
        await updateApi({
          ...data,
          id: (currentItem as unknown as { id: number }).id,
        } as T & { id: number })
        setIsEditDialogOpen(false)
        setCurrentItem(null)
        toast.success(updateSuccessMessage)
        onSuccess?.()
      } catch (error) {
        const msg = error instanceof Error ? error.message : "操作失败"
        toast.error(msg)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [currentItem, updateApi, updateSuccessMessage, onSuccess]
  )

  /**
   * 处理删除
   */
  const handleDelete = useCallback(async () => {
    if (!currentItem) return
    try {
      setIsLoading(true)
      await deleteApi((currentItem as unknown as { id: number }).id)
      setIsDeleteDialogOpen(false)
      setCurrentItem(null)
      toast.success(deleteSuccessMessage)
      onSuccess?.()
    } catch (error) {
      const msg = error instanceof Error ? error.message : "操作失败"
      toast.error(msg)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [currentItem, deleteApi, deleteSuccessMessage, onSuccess])

  return {
    // 状态
    isAddDialogOpen,
    isEditDialogOpen,
    isDeleteDialogOpen,
    currentItem,
    isLoading,

    // 弹窗控制
    openAddDialog,
    closeAllDialogs,

    // 业务方法
    openEditDialog,
    openDeleteDialog,
    handleCreate,
    handleUpdate,
    handleDelete,
  }
}
