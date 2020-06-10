type PaginationRequest = {
  pageSize: number,
  lastKey?: string,
};

type PaginationResult = {
  items: Array<any>,
  numItems: number,
  lastKey?: string,
};

type UrlEntry = {
  id: string,
  url: string,
  rootKey: string,
};

type GenShortReq = {
  url: string,
}

interface DB {
  findAll(pagination: PaginationRequest): Promise<PaginationResult>;
  findOne(id: string): Promise<UrlEntry | undefined>;
  findOneByUrl(url: string): Promise<UrlEntry | undefined>;
  save(entry: UrlEntry): Promise<boolean>;
  countAllByRoot(root: string): Promise<number>;
};

interface Engine {
  validateUrl(url: string): boolean;
  generateHash(url: string): string;
}