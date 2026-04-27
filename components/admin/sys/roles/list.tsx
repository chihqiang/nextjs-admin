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
import { Shield, Plus, Edit, Trash2 } from "lucide-react"
import {
  Role,
  RoleFromRequest,
  Menu,
  roleCreateApi,
  roleUpdateApi,
  roleDeleteApi,
  roleAssociateMenusApi,
} from "@/api/roles"
import { menuAllApi } from "@/api/menu"
import { RoleEditDialog } from "@/components/admin/sys/roles/edit"
import { RoleAuthorizeDialog } from "@/components/admin/sys/roles/authorize"
import { useState, useEffect } from "react"
import { useCrudDialog } from "@/hooks/use-crud"
import { toast } from "sonner"

interface RoleListProps {
  roles: Role[]
  pagination: DataListPagination
  onRefresh: () => void
}

export function RoleList({ roles, pagination, onRefresh }: RoleListProps) {
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
  } = useCrudDialog<RoleFromRequest>({
    createApi: roleCreateApi,
    updateApi: roleUpdateApi,
    deleteApi: roleDeleteApi,
    onSuccess: onRefresh,
    createSuccessMessage: "角色创建成功",
    updateSuccessMessage: "角色更新成功",
    deleteSuccessMessage: "角色删除成功",
  })

  // 授权弹窗状态
  const [isAuthorizeDialogOpen, setIsAuthorizeDialogOpen] = useState(false)
  // 当前授权的角色
  const [currentAuthorizeRole, setCurrentAuthorizeRole] = useState<Role | null>(
    null
  )

  // 获取当前编辑的角色（用于传递给弹窗）
  const currentRole = currentItem as Role | null

  // 打开授权弹窗
  const openAuthorizeDialog = (role: Role) => {
    setCurrentAuthorizeRole(role)
    setIsAuthorizeDialogOpen(true)
  }

  // 关闭授权弹窗
  const closeAuthorizeDialog = () => {
    setIsAuthorizeDialogOpen(false)
    setCurrentAuthorizeRole(null)
  }

  // 处理授权
  const handleAuthorize = async (roleId: number, menuIds: number[]) => {
    try {
      // 调用授权 API
      await roleAssociateMenusApi(roleId, menuIds).then((response) => {
        // 授权成功后刷新列表
        toast.success("角色授权成功")
        onRefresh()
      })
      // 关闭弹窗
      closeAuthorizeDialog()
    } catch (error) {
      toast.error("角色授权失败" + error)
    }
  }

  const columns: DataListColumn<Role>[] = [
    {
      key: "id",
      header: "ID",
      cellClassName: "w-16 font-medium",
      cell: (role) => role.id,
    },
    {
      key: "name",
      header: "角色名称",
      cell: (role) => (
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{role.name}</span>
        </div>
      ),
    },
    {
      key: "sort",
      header: "排序",
      cell: (role) => role.sort,
    },
    {
      key: "remark",
      header: "备注",
      cell: (role) => (
        <span className="max-w-xs truncate text-muted-foreground">
          {role.remark}
        </span>
      ),
    },
    {
      key: "status",
      header: "状态",
      cell: (role) => (
        <Badge variant={role.status ? "default" : "destructive"}>
          {role.status ? "正常" : "禁用"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "操作",
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (role) => (
        <ActionButtons
          actions={[
            {
              key: "edit",
              label: "编辑",
              icon: <Edit className="h-4 w-4" />,
              onClick: () => openEditDialog({ ...role, menus: [] }),
            },
            {
              key: "authorize",
              label: "授权",
              icon: <Shield className="h-4 w-4" />,
              onClick: () => openAuthorizeDialog(role),
            },
            {
              key: "delete",
              label: "删除",
              icon: <Trash2 className="h-4 w-4" />,
              onClick: () => openDeleteDialog({ ...role, menus: [] }),
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
          <Plus className="mr-2 h-4 w-4" />
          添加角色
        </Button>
      </div>

      <DataList
        data={roles}
        columns={columns}
        keyExtractor={(role) => role.id.toString()}
        renderCard={(role) => (
          <RenderCard<Role>
            entity={role}
            title={role.name}
            subtitle={role.remark}
            status={{
              value: role.status.toString(),
              variant: role.status ? "default" : "destructive",
              label: role.status ? "正常" : "禁用",
            }}
            meta={
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>ID: {role.id}</span>
                <span>排序: {role.sort}</span>
                <Badge variant="outline">0 个菜单</Badge>
              </div>
            }
            onEdit={(item) => openEditDialog({ ...(item as Role), menus: [] })}
            onDelete={(item) =>
              openDeleteDialog({ ...(item as Role), menus: [] })
            }
            icon={<Shield className="h-4 w-4 text-blue-500" />}
          />
        )}
        pagination={pagination}
        emptyText="暂无角色数据"
      />

      {/* 新增/编辑弹窗 */}
      <RoleEditDialog
        open={isAddDialogOpen || isEditDialogOpen}
        onOpenChange={closeAllDialogs}
        role={currentRole}
        onSave={isEditDialogOpen ? handleUpdate : handleCreate}
        onDelete={isEditDialogOpen ? handleDelete : undefined}
        isLoading={isLoading}
      />

      {/* 删除确认弹窗 */}
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onClose={closeAllDialogs}
        onConfirm={handleDelete}
        title="删除角色"
        itemName={currentRole?.name}
        isLoading={isLoading}
      />

      {/* 授权弹窗 */}
      <RoleAuthorizeDialog
        open={isAuthorizeDialogOpen}
        onOpenChange={closeAuthorizeDialog}
        role={currentAuthorizeRole}
        onAuthorize={handleAuthorize}
        isLoading={isLoading}
      />
    </div>
  )
}
