import engine from '../../src/engine';

export class MockDB {
  private dataSet: Array<UrlEntry>;
  constructor(dataSet: Array<UrlEntry>) {
    if (!dataSet) {
      this.dataSet = [];
    } else {
      this.dataSet = dataSet;
    }
  }

  public findAll = async (pagination: PaginationRequest): Promise<PaginationResult> => {
    let startIdx: number = 0;
    let pageSize: number = 10;
    if (!!pagination && !!pagination.lastKey) {
      const foundIdx = this.dataSet.findIndex((entry) => entry.id == pagination.lastKey);
      if (foundIdx !== -1) {
        startIdx = foundIdx + 1;
      }
    }
    if (!!pagination && !!pagination.pageSize && pagination.pageSize > 0) {
      pageSize = pagination.pageSize;
    }
    const res: PaginationResult = <PaginationResult>{ lastKey: null };
    const items: Array<UrlEntry> = this.dataSet.slice(startIdx, startIdx + pageSize);
    res.items = items;
    res.numItems = items.length;
    if (this.dataSet.length > startIdx + pageSize) {
      res.lastKey = items[items.length - 1].id
    }
    return res;
  };

  public findOne = async (id: string): Promise<UrlEntry | null> => {
    const res: UrlEntry | undefined = this.dataSet.find((d) => d.id === id);
    if (!res) { return null; }
    return res;
  };

  public findOneByUrl = async (url: string): Promise<UrlEntry | null> => {
    const res: UrlEntry | undefined = this.dataSet.find((d) => d.url === url);
    if (!res) { return null; }
    return res;
  };

  public save = async (entry: UrlEntry): Promise<boolean> => {
    this.dataSet.push(entry);
    return true;  // Should always be true
  };

  public countAllByRoot = async (root: string): Promise<number> => this.dataSet.filter(d => d.id.startsWith(root)).length;
}

export class MockEngine {
  private hashmap: { [name: string]: string };

  constructor(hashmap: { [name: string]: string } = {}) {
    this.hashmap = hashmap;
  }

  public validateUrl = (url: string): boolean => engine.validateUrl(url);
  public generateHash = (url: string): string => this.hashmap[url];
}