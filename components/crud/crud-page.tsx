"use client"

import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DataList,
  DataListColumn,
  RenderCard,
} from "@/components/widgets/data-list"

// ==================== 类型定义 ====================

export interface CrudPageProps<T, SearchData = Record<string, unknown>> {
  /** 页面标题 */
  title: string
  /** 实体名称（用于按钮、提示语） */
  entityName: string
  /** 搜索表单（可选） */
  searchForm?: (handlers: {
    onSearch: (data: SearchData) => void
    onReset: () => void
  }) => ReactNode
  /** 表格列定义（桌面端） */
  columns: DataListColumn<T>[]
  /** 表格数据 */
  dataSource: T[]
  /** 是否加载中 */
  loading?: boolean
  /** 分页配置 */
  pagination?: {
    /** 当前页码（从 1 开始） */
    current: number
    /** 每页条数 */
    pageSize: number
    /** 总条数 */
    total: number
    /** 页码变化回调 */
    onChange: (page: number, pageSize: number) => void
  }
  /** 获取行唯一 key */
  rowKey?: (record: T) => string
  /** 新增回调 */
  onAdd: () => void
  /** 编辑回调（可选，不传则不显示编辑按钮） */
  onEdit?: (item: T) => void
  /** 删除回调（可选，不传则不显示删除按钮） */
  onDelete?: (item: T) => void
  /** 自定义操作列（可选，默认显示编辑/删除按钮） */
  renderActions?: (item: T) => ReactNode
  /** 移动端卡片渲染（可选，默认使用 RenderCard） */
  renderCard?: (item: T) => ReactNode
  /** 空数据提示文字 */
  emptyText?: string
}

// ==================== 组件实现 ====================

/**
 * 通用 CRUD 页面组件
 *
 * 包含：搜索表单、表格（桌面端）、卡片（移动端）、分页、操作按钮
 * 使用 DataList 组件实现列表展示
 *
 * @example
 * ```tsx
 * <CrudPage
 *   title="账号管理"
 *   entityName="账号"
 *   searchForm={({ onSearch, onReset }) => (
 *     <AccountSearchForm onSearch={onSearch} onReset={onReset} />
 *   )}
 *   columns={[
 *     { key: "id", header: "ID", cell: (row) => row.id },
 *     { key: "name", header: "姓名", cell: (row) => row.name },
 *     { key: "email", header: "邮箱", cell: (row) => row.email },
 *   ]}
 *   dataSource={accounts}
 *   loading={loading}
 *   pagination={{ current, pageSize, total, onChange: handlePageChange }}
 *   rowKey={(row) => String(row.id)}
 *   onAdd={openAdd}
 *   onEdit={openEdit}
 *   onDelete={openDelete}
 * />
 * ```
 */
export function CrudPage<T, SearchData = Record<string, unknown>>(
  props: CrudPageProps<T, SearchData>
) {
  const {
    title,
    entityName,
    searchForm,
    columns,
    dataSource,
    loading = false,
    pagination,
    rowKey = (record: T) =>
      String((record as unknown as Record<string, unknown>).id),
    onAdd,
    onEdit,
    onDelete,
    renderActions,
    renderCard,
    emptyText = "暂无数据",
  } = props

  // 默认卡片渲染
  const defaultRenderCard = (item: T) => (
    <RenderCard
      entity={item}
      title={String((item as unknown as Record<string, unknown>).id || "")}
      status={{
        value: "active",
        variant: "default",
        label: entityName,
      }}
      {...(onEdit ? { onEdit } : {})}
      {...(onDelete ? { onDelete } : {})}
    />
  )

  // 默认操作按钮渲染
  const defaultRenderActions = (item: T) => (
    <div className="flex justify-end gap-2">
      {onEdit && (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation()
            onEdit(item)
          }}
        >
          <Edit className="h-4 w-4" />
        </Button>
      )}
      {onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(item)
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  )

  // 如果提供了自定义操作列，使用自定义的；否则根据 onEdit/onDelete 自动生成
  const finalColumns =
    renderActions || onEdit || onDelete
      ? [
          ...columns,
          {
            key: "actions",
            header: "操作",
            headerClassName: "text-right",
            cellClassName: "text-right",
            cell: (row: T) =>
              renderActions ? renderActions(row) : defaultRenderActions(row),
          } as DataListColumn<T>,
        ]
      : columns

  // 分页转换
  const dataListPagination = pagination
    ? {
        page: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        onPageChange: (page: number) =>
          pagination.onChange(page, pagination.pageSize),
      }
    : undefined

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <Button onClick={onAdd}>
            <Plus className="mr-2 h-4 w-4" />
            新增{entityName}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* 搜索表单 */}
        {searchForm && (
          <div className="mb-4">
            {searchForm({
              onSearch: () => {},
              onReset: () => {},
            })}
          </div>
        )}

        {/* 数据列表（使用 DataList 组件） */}
        <DataList
          data={dataSource}
          columns={finalColumns}
          renderCard={renderCard || defaultRenderCard}
          keyExtractor={rowKey}
          loading={loading}
          pagination={dataListPagination}
          emptyText={emptyText}
        />
      </CardContent>
    </Card>
  )
}
