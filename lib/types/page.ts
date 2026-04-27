// 分页请求类型，包含页码、每页记录数和当前页码
export interface PageRequest {
  page: number
  size: number
  currentPage: number
}
// 分页响应类型，包含列表数据、总记录数、当前页码和每页记录数
export interface PageResponse<T> {
  list: T[]
  total: number
  page: number
  size: number
}
