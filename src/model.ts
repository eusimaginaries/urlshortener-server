type PaginationRequest = {
  pageSize: number,
  lastKey: string | null,
};

type PaginationResult = {
  items: Array<any>,
  numItems: number,
  lastKey: string | null,
};

type UrlEntry = {
  id: string,
  url: string,
};

type GenShortReq = {
  url: string,
}

interface DB {
  findAll(pagination: PaginationRequest): Promise<PaginationResult>;
  findOne(id: string): Promise<UrlEntry | null>;
  findOneByUrl(url: string): Promise<UrlEntry | null>;
  save(entry: UrlEntry): Promise<boolean>;
  countAllByRoot(root: string): Promise<number>;
};

interface Engine {
  validateUrl(url: string): boolean;
  generateHash(url: string): string;
}