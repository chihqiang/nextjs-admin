"use client"

import { useEffect, useState, useCallback } from "react"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AccountListRequest, Account, accountListApi } from "@/api/account"
import { AccountList } from "@/components/admin/sys/account/list"

const AccountListPage = () => {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [total, setTotal] = useState<number>(0)
  const [request, setRequest] = useState<AccountListRequest>({
    page: 1,
    size: 8,
    currentPage: 1,
    id: undefined,
  })
  const fetchAccounts = useCallback(() => {
    accountListApi(request).then((AccountListResponse) => {
      setAccounts(AccountListResponse.list)
      setTotal(AccountListResponse.total)
    })
  }, [request])

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="搜索账号ID"
            value={request.id || ""}
            onChange={(e) => {
              const val = e.target.value
              setRequest({ ...request, id: val ? Number(val) : undefined })
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

      <AccountList
        accounts={accounts}
        pagination={{
          page: request.currentPage,
          pageSize: request.size,
          total,
          onPageChange: (page) =>
            setRequest({ ...request, currentPage: page, page: page }),
        }}
        onRefresh={fetchAccounts}
      />
    </div>
  )
}

export default AccountListPage
