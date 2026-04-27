"use client"

import { useEffect, useState, useCallback } from "react"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Role, RoleListRequest, roleListApi } from "@/api/roles"
import { RoleList } from "@/components/admin/sys/roles/list"

const RoleListPage = () => {
  const [roles, setRoles] = useState<Role[]>([])
  const [total, setTotal] = useState<number>(0)
  const [request, setRequest] = useState<RoleListRequest>({
    page: 1,
    size: 5,
    currentPage: 1,
    id: undefined,
  })

  const fetchRoles = useCallback(() => {
    roleListApi(request).then((response) => {
      setRoles(response.list)
      setTotal(response.total)
    })
  }, [request])

  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="relative w-full sm:w-64">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="搜索角色ID"
            value={request.id?.toString() || ""}
            onChange={(e) => {
              const value = e.target.value
              setRequest({
                ...request,
                id: value ? Number(value) : undefined,
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

      <RoleList
        roles={roles}
        pagination={{
          page: request.currentPage,
          pageSize: request.size,
          total,
          onPageChange: (page) =>
            setRequest({ ...request, currentPage: page, page: page }),
        }}
        onRefresh={fetchRoles}
      />
    </div>
  )
}

export default RoleListPage
