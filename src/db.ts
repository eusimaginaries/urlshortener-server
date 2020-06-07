export const findAll = async (pagination: PaginationRequest): Promise<PaginationResult> => (<PaginationResult>{});
export const findOne = async (id: string): Promise<UrlEntry | null> => null;
export const findOneByUrl = async (url: string): Promise<UrlEntry | null> => null;
export const save = async (entry: UrlEntry): Promise<boolean> => false;
export const countAllByRoot = async (root: string): Promise<number> => 0;

export default {
  findAll,
  findOne,
  findOneByUrl,
  save,
  countAllByRoot,
};
