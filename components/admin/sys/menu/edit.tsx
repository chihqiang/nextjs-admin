"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Menu, menuDetailApi } from "@/api/menu"
import { MenuForm } from "@/components/admin/sys/menu/form"
import { useState, useEffect } from "react"
import { toast } from "sonner"

interface MenuEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  menu: Menu | null
  onSave: (data: Menu) => void
  onDelete?: () => void
  menus: Menu[]
  isLoading?: boolean
}

export function MenuEditDialog({
  open,
  onOpenChange,
  menu,
  onSave,
  onDelete,
  menus,
  isLoading = false,
}: MenuEditDialogProps) {
  const isEdit = !!menu

  const [formData, setFormData] = useState<Menu>({
    id: 0,
    pid: 0,
    menu_type: 1,
    name: "",
    path: "",
    component: "",
    icon: "",
    sort: 1,
    api_url: "",
    api_method: "",
    visible: true,
    status: true,
    remark: "",
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
        pid: 0,
        menu_type: 1,
        name: "",
        path: "",
        component: "",
        icon: "",
        sort: 1,
        api_url: "",
        api_method: "",
        visible: true,
        status: true,
        remark: "",
      })
      setIsLoadingDetail(false)
      return
    }

    const controller = new AbortController()

    const fetchDetail = async () => {
      setIsLoadingDetail(true)
      try {
        const menuDetail = await menuDetailApi(menu!.id)
        if (!controller.signal.aborted) {
          setFormData(menuDetail)
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return
        }
        toast.error(error instanceof Error ? error.message : "获取菜单详情失败")
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
  }, [open, isEdit, menu])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "编辑菜单" : "添加菜单"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "修改菜单信息，点击保存按钮更新"
              : "填写菜单信息，点击保存按钮添加新菜单"}
          </DialogDescription>
        </DialogHeader>
        {isLoadingDetail ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <MenuForm
              formData={formData}
              onChange={setFormData}
              menus={menus}
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
