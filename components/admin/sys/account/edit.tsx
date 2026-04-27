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
import { AccountCreateUpdate, accountDetailApi } from "@/api/account"
import { AccountForm } from "@/components/admin/sys/account/form"
import { useState, useEffect } from "react"
import { toast } from "sonner"

interface AccountEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  account: AccountCreateUpdate | null
  onSave: (data: AccountCreateUpdate) => void
  onDelete?: () => void
  isLoading?: boolean
}

export function AccountEditDialog({
  open,
  onOpenChange,
  account,
  onSave,
  onDelete,
  isLoading = false,
}: AccountEditDialogProps) {
  const isEdit = !!account
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [formData, setFormData] = useState<AccountCreateUpdate>({
    id: 0,
    name: "",
    email: "",
    password: "",
    roles: [],
    status: true,
  })

  useEffect(() => {
    if (!open) {
      setIsLoadingDetail(false)
      return
    }
    if (!account) {
      setFormData({
        id: 0,
        name: "",
        email: "",
        password: "",
        roles: [],
        status: true,
      })
      setIsLoadingDetail(false)
      return
    }
    const fetchAccountDetail = async () => {
      setIsLoadingDetail(true)
      try {
        const accountDetail = await accountDetailApi(account.id)
        setFormData(accountDetail)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "获取账号详情失败")
      } finally {
        setIsLoadingDetail(false)
      }
    }
    fetchAccountDetail()
  }, [open, account])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "编辑账户" : "添加账户"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "修改账户信息，点击保存按钮更新"
              : "填写账户信息，点击保存按钮添加新账户"}
          </DialogDescription>
        </DialogHeader>
        {isLoadingDetail ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <AccountForm formData={formData} onChange={setFormData} />
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
                disabled={
                  !formData.name ||
                  !formData.email ||
                  isLoading ||
                  isLoadingDetail
                }
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
