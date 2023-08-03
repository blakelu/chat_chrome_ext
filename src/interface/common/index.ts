export interface AnyObject {
  [x: string]: any
}

export interface OptionObj {
  label: string
  value: string | number
}

export interface StyleObj {
  width?: string
}


export interface PaginationObj {
  current: number;
  pageSize: number;
  total: number;
}

// dms接口返回规范
export interface ResponseDsmObj {
  blockDesc: string | null
  blockId: string | null
  qutoApiId: string | null
  pageId: string | null
  pageName: string | null
  items: any
}

// 列数据
export interface ColumnObj {
  key: string;
  value: string;
  label: string;
  slot?: string;
}
