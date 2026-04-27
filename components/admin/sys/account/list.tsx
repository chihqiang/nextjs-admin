"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DataList,
  DataListColumn,
  DataListPagination,
  RenderCard,
} from "@/components/widgets/data-list"
import {
  ActionButtons,
  DeleteConfirmDialog,
} from "@/components/widgets/crud-actions"
import { Edit, Trash2, Users } from "lucide-react"
import {
  Account,
  AccountCreateUpdate,
  accountCreateApi,
  accountUpdateApi,
  accountDeleteApi,
} from "@/api/account"
import { AccountEditDialog } from "@/components/admin/sys/account/edit"
import { useCrudDialog } from "@/hooks/use-crud"

interface AccountListProps {
  accounts: Account[]
  pagination: DataListPagination
  onRefresh: () => void
}

export function AccountList({
  accounts,
  pagination,
  onRefresh,
}: AccountListProps) {
  // 使用公共 Hook 管理 CRUD 弹窗状态
  const {
    isAddDialogOpen,
    isEditDialogOpen,
    isDeleteDialogOpen,
    currentItem,
    isLoading,
    openAddDialog,
    closeAllDialogs,
    openEditDialog,
    openDeleteDialog,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useCrudDialog<AccountCreateUpdate>({
    createApi: accountCreateApi,
    updateApi: accountUpdateApi,
    deleteApi: accountDeleteApi,
    onSuccess: onRefresh,
    createSuccessMessage: "账号创建成功",
    updateSuccessMessage: "账号更新成功",
    deleteSuccessMessage: "账号删除成功",
  })

  // 获取当前编辑的账号（用于传递给弹窗）
  const currentAccount = currentItem as AccountCreateUpdate | null

  const columns: DataListColumn<Account>[] = [
    {
      key: "id",
      header: "ID",
      cellClassName: "w-16 font-medium",
      cell: (account) => account.id,
    },
    {
      key: "name",
      header: "姓名",
      cell: (account) => account.name,
    },
    {
      key: "email",
      header: "邮箱",
      cell: (account) => account.email,
    },
    {
      key: "roles",
      header: "角色",
      cell: (account) =>
        (account.roles || []).map((role) => role.name).join(", "),
    },
    {
      key: "status",
      header: "状态",
      cell: (account) => (
        <Badge variant={account.status ? "default" : "destructive"}>
          {account.status ? "活跃" : "禁用"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "操作",
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (account) => (
        <ActionButtons
          actions={[
            {
              key: "edit",
              label: "编辑",
              icon: <Edit className="h-4 w-4" />,
              onClick: () => openEditDialog(account),
            },
            {
              key: "delete",
              label: "删除",
              icon: <Trash2 className="h-4 w-4" />,
              onClick: () => openDeleteDialog(account),
              danger: true,
              confirm: true,
            },
          ]}
        />
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Button onClick={openAddDialog} className="shrink-0">
          添加账号
        </Button>
      </div>

      <DataList
        data={accounts}
        columns={columns}
        renderCard={(account) => {
          return (
            <RenderCard<Account>
              entity={account}
              title={account.name}
              subtitle={account.email}
              status={{
                value: account.status.toString(),
                variant: account.status ? "default" : "destructive",
                label: account.status ? "活跃" : "禁用",
              }}
              meta={
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>ID: {account.id}</span>
                </div>
              }
              onEdit={(item) => openEditDialog(item as Account)}
              onDelete={(item) => openDeleteDialog(item as Account)}
              icon={<Users className="h-4 w-4" />}
            />
          )
        }}
        keyExtractor={(account) => account.id.toString()}
        pagination={pagination}
        emptyText="暂无账户数据"
      />

      {/* 新增/编辑弹窗 */}
      <AccountEditDialog
        open={isAddDialogOpen || isEditDialogOpen}
        onOpenChange={closeAllDialogs}
        account={currentAccount}
        onSave={isEditDialogOpen ? handleUpdate : handleCreate}
        onDelete={isEditDialogOpen ? handleDelete : undefined}
        isLoading={isLoading}
      />

      {/* 删除确认弹窗 */}
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onClose={closeAllDialogs}
        onConfirm={handleDelete}
        title="删除账号"
        itemName={currentAccount?.name}
        isLoading={isLoading}
      />
    </div>
  )
}
