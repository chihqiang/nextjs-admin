"use client"

import { useEffect, useState, useCallback } from "react"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MenuListRequest, Menu, menuListApi } from "@/api/menu"
import { MenuList } from "@/components/admin/sys/menu/list"

const MenuListPage = () => {
  const [menus, setMenus] = useState<Menu[]>([])
  const [total, setTotal] = useState<number>(0)
  const [request, setRequest] = useState<MenuListRequest>({
    page: 1,
    size: 5,
    currentPage: 1,
    id: undefined,
  })

  const fetchMenus = useCallback(() => {
    menuListApi(request).then((response) => {
      setMenus(response.list)
      setTotal(response.total)
    })
  }, [request])

  useEffect(() => {
    fetchMenus()
  }, [fetchMenus])

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="relative w-full sm:w-64">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="搜索菜单ID"
            value={request.id?.toString() || ""}
            onChange={(e) => {
              const val = e.target.value
              setRequest({
                ...request,
                id: val ? Number(val) : undefined,
              })
            }}
            className="pl-10"
          />
          {request.id && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setRequest({ ...request, id: undefined })}
              className="absolute top-1/2 right-1 -translate-y-1/2"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <MenuList
        menus={menus}
        pagination={{
          page: request.currentPage,
          pageSize: request.size,
          total,
          onPageChange: (page) =>
            setRequest({ ...request, currentPage: page, page: page }),
        }}
        onRefresh={fetchMenus}
      />
    </div>
  )
}

export default MenuListPage
