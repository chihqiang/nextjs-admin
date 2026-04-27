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
import { Plus, Folder, FileText, Settings, Edit, Trash2 } from "lucide-react"
import { Menu, menuCreateApi, menuUpdateApi, menuDeleteApi } from "@/api/menu"
import { MenuEditDialog } from "@/components/admin/sys/menu/edit"
import { useCrudDialog } from "@/hooks/use-crud"

interface MenuListProps {
  menus: Menu[]
  pagination: DataListPagination
  onRefresh: () => void
}

export function MenuList({ menus, pagination, onRefresh }: MenuListProps) {
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
  } = useCrudDialog<Menu>({
    createApi: menuCreateApi,
    updateApi: menuUpdateApi,
    deleteApi: menuDeleteApi,
    onSuccess: onRefresh,
    createSuccessMessage: "菜单创建成功",
    updateSuccessMessage: "菜单更新成功",
    deleteSuccessMessage: "菜单删除成功",
  })

  // 获取当前编辑的菜单（用于传递给弹窗）
  const currentMenu = currentItem as Menu | null

  // 菜单类型图标
  const getTypeIcon = (t: number) => {
    switch (t) {
      case 1:
        return <Folder className="h-4 w-4" />
      case 2:
        return <FileText className="h-4 w-4" />
      case 3:
        return <Settings className="h-4 w-4" />
      default:
        return <Folder />
    }
  }

  // 菜单类型名称
  const getTypeName = (t: number) => {
    switch (t) {
      case 1:
        return "目录"
      case 2:
        return "菜单"
      case 3:
        return "按钮"
      default:
        return "未知"
    }
  }

  // 表格列
  const columns: DataListColumn<Menu>[] = [
    {
      key: "id",
      header: "ID",
      cellClassName: "w-16 font-medium",
      cell: (m) => m.id,
    },
    {
      key: "name",
      header: "菜单名称",
      cell: (m) => (
        <div className="flex items-center gap-2">
          {getTypeIcon(m.menu_type)}
          <span className="font-medium">{m.name}</span>
        </div>
      ),
    },
    {
      key: "menu_type",
      header: "类型",
      cell: (m) => (
        <Badge
          variant={
            m.menu_type === 1
              ? "default"
              : m.menu_type === 2
                ? "secondary"
                : "outline"
          }
        >
          {getTypeName(m.menu_type)}
        </Badge>
      ),
    },
    {
      key: "path",
      header: "路由",
      cell: (m) => (
        <code className="rounded bg-muted px-2 py-1 text-sm">
          {m.path || "-"}
        </code>
      ),
    },
    {
      key: "api_url",
      header: "接口地址",
      cell: (m) => m.api_url || "-",
    },
    {
      key: "visible",
      header: "显示",
      cell: (m) => (
        <Badge variant={m.visible ? "default" : "destructive"}>
          {m.visible ? "显示" : "隐藏"}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "状态",
      cell: (m) => (
        <Badge variant={m.status ? "default" : "destructive"}>
          {m.status ? "正常" : "禁用"}
        </Badge>
      ),
    },
    { key: "sort", header: "排序", cell: (m) => m.sort },
    {
      key: "actions",
      header: "操作",
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (m) => (
        <ActionButtons
          actions={[
            {
              key: "edit",
              label: "编辑",
              icon: <Edit className="h-4 w-4" />,
              onClick: () => openEditDialog(m),
            },
            {
              key: "delete",
              label: "删除",
              icon: <Trash2 className="h-4 w-4" />,
              onClick: () => openDeleteDialog(m),
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
          添加菜单
        </Button>
      </div>

      <DataList
        data={menus}
        columns={columns}
        keyExtractor={(m) => m.id.toString()}
        renderCard={(m) => (
          <RenderCard<Menu>
            entity={m}
            title={m.name}
            subtitle={
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    m.menu_type === 1
                      ? "default"
                      : m.menu_type === 2
                        ? "secondary"
                        : "outline"
                  }
                >
                  {getTypeName(m.menu_type)}
                </Badge>
                <code className="rounded bg-muted px-2 py-1 text-sm">
                  {m.path || "-"}
                </code>
              </div>
            }
            status={{
              value: m.status.toString(),
              variant: m.status ? "default" : "destructive",
              label: m.status ? "正常" : "禁用",
            }}
            meta={
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>ID: {m.id}</span>
                <Badge variant={m.visible ? "default" : "destructive"}>
                  {m.visible ? "显示" : "隐藏"}
                </Badge>
                <span>排序: {m.sort}</span>
              </div>
            }
            onEdit={(item) => openEditDialog(item as Menu)}
            onDelete={(item) => openDeleteDialog(item as Menu)}
            icon={getTypeIcon(m.menu_type)}
          />
        )}
        pagination={pagination}
        emptyText="暂无菜单数据"
      />

      {/* 新增/编辑弹窗 */}
      <MenuEditDialog
        open={isAddDialogOpen || isEditDialogOpen}
        onOpenChange={closeAllDialogs}
        menu={currentMenu}
        onSave={isEditDialogOpen ? handleUpdate : handleCreate}
        onDelete={isEditDialogOpen ? handleDelete : undefined}
        menus={menus}
        isLoading={isLoading}
      />

      {/* 删除确认弹窗 */}
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onClose={closeAllDialogs}
        onConfirm={handleDelete}
        title="删除菜单"
        itemName={currentMenu?.name}
        isLoading={isLoading}
      />
    </div>
  )
}
