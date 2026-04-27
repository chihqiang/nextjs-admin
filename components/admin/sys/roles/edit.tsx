"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Role, RoleFromRequest, roleDetailApi } from "@/api/roles"
import { RoleForm as RoleFormComponent } from "@/components/admin/sys/roles/form"
import { useState, useEffect } from "react"
import { toast } from "sonner"

interface RoleEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: Role | null
  onSave: (data: RoleFromRequest) => void
  onDelete?: () => void
  isLoading?: boolean
}

export function RoleEditDialog({
  open,
  onOpenChange,
  role,
  onSave,
  onDelete,
  isLoading = false,
}: RoleEditDialogProps) {
  const isEdit = !!role

  const [formData, setFormData] = useState<RoleFromRequest>({
    id: 0,
    name: "",
    sort: 0,
    status: true,
    remark: "",
    menus: [],
  })

  const [isLoadingDetail, setIsLoadingDetail] = useState(false)

  useEffect(() => {
    if (!open) {
      setIsLoadingDetail(false)
      return
    }

    if (!isEdit) {
      setFormData({
        id: 0,
        name: "",
        sort: 0,
        status: true,
        remark: "",
        menus: [],
      })
      setIsLoadingDetail(false)
      return
    }

    const controller = new AbortController()

    const fetchDetail = async () => {
      setIsLoadingDetail(true)
      try {
        const roleDetail = await roleDetailApi(role!.id)
        if (!controller.signal.aborted) {
          setFormData(roleDetail)
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return
        }
        toast.error(error instanceof Error ? error.message : "获取角色详情失败")
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingDetail(false)
        }
      }
    }

    fetchDetail()

    return () => {
      controller.abort()
    }
  }, [open, isEdit, role])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "编辑角色" : "添加角色"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "修改角色信息，点击保存按钮更新"
              : "填写角色信息，点击保存按钮添加新角色"}
          </DialogDescription>
        </DialogHeader>
        {isLoadingDetail ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <RoleFormComponent
              formData={formData}
              onChange={setFormData}
              menus={[]}
            />
            <DialogFooter className="gap-2 sm:gap-0">
              {isEdit && onDelete && (
                <Button
                  variant="destructive"
                  onClick={onDelete}
                  className="mr-auto"
                  disabled={isLoading || isLoadingDetail}
                >
                  {isLoading ? "删除中..." : "删除"}
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isLoading || isLoadingDetail}
              >
                取消
              </Button>
              <Button
                onClick={() => onSave(formData)}
                className="bg-blue-600 text-white hover:bg-blue-700"
                disabled={!formData.name || isLoading || isLoadingDetail}
              >
                {isLoading ? "保存中..." : "保存"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
