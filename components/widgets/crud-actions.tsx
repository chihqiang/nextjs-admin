"use client"

import React, { memo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { ConfirmDialog } from "@/components/widgets/confirm-dialog"

// ==================== 类型 ====================

export interface ActionItem {
  key: string
  label: string
  icon?: React.ReactNode
  onClick: () => void | Promise<void>

  disabled?: boolean
  hidden?: boolean
  danger?: boolean
  confirm?: boolean
  loading?: boolean
}

export interface ActionButtonsProps {
  actions: ActionItem[]
  className?: string
  collapseAt?: number
}

// ==================== ActionButtons ====================

export const ActionButtons = memo(function ActionButtons({
  actions,
  className,
  collapseAt = 2,
}: ActionButtonsProps) {
  const [loadingKey, setLoadingKey] = useState<string | null>(null)

  const visibleActions = actions.filter((a) => !a.hidden)

  const primaryActions = visibleActions.slice(0, collapseAt)
  const moreActions = visibleActions.slice(collapseAt)

  const handleClick = async (action: ActionItem) => {
    if (action.disabled || loadingKey) return
    try {
      setLoadingKey(action.key)
      await action.onClick()
    } finally {
      setLoadingKey(null)
    }
  }

  const renderButton = (action: ActionItem) => {
    const loading = loadingKey === action.key || action.loading

    return (
      <Button
        key={action.key}
        variant="ghost"
        size="icon"
        disabled={action.disabled || loading}
        onClick={() => handleClick(action)}
        className={cn(
          action.danger && "text-red-500 hover:bg-red-50 hover:text-red-700"
        )}
        title={action.label}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : action.icon}
      </Button>
    )
  }

  return (
    <div className={cn("flex items-center justify-end gap-2", className)}>
      {/* 主按钮 */}
      {primaryActions.map(renderButton)}

      {/* 更多 */}
      {moreActions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-9 w-9 items-center justify-center rounded-md p-0 text-muted-foreground transition-colors duration-200 hover:bg-muted">
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            {moreActions.map((action) => {
              const loading = loadingKey === action.key || action.loading

              return (
                <DropdownMenuItem
                  key={action.key}
                  disabled={action.disabled || loading}
                  className={cn(
                    action.danger && "text-red-500 focus:text-red-600"
                  )}
                  onSelect={(e) => {
                    e.preventDefault()
                    handleClick(action)
                  }}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    action.icon && <span className="mr-2">{action.icon}</span>
                  )}
                  {action.label}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
})

// ==================== DeleteConfirmDialog ====================

interface DeleteConfirmProps {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  title: string
  itemName?: string
  isLoading?: boolean
}

export const DeleteConfirmDialog = memo(function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  itemName,
  isLoading = false,
}: DeleteConfirmProps) {
  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      title={title}
      description={
        itemName
          ? `确定要删除【${itemName}】吗？此操作无法撤销。`
          : "确定要删除吗？此操作无法撤销。"
      }
      onConfirm={onConfirm}
      confirmButtonVariant="destructive"
      isLoading={isLoading}
    />
  )
})
