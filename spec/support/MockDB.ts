export default class MockDB {
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

  public findOne = async (id: string): Promise<UrlEntry | null> => null;
  public findOneByUrl = async (url: string): Promise<UrlEntry | null> => null;
  public save = async (entry: UrlEntry): Promise<boolean> => false;
}
