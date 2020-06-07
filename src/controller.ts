import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const constructResponse = (entity: any = {}, statusCode: number = 200): APIGatewayProxyResult => {
  return {
    statusCode,
    body: JSON.stringify(entity),
  }
};

const extractPageInfo = (event: APIGatewayProxyEvent): PaginationRequest => {
  const pagination: PaginationRequest = { pageSize: 10, lastKey: null };
  if (!event.queryStringParameters) {
    return pagination;
  }
  if (!!event.queryStringParameters['pageSize']) {
    pagination.pageSize = parseInt(event.queryStringParameters['pageSize']);
  }
  if (!!event.queryStringParameters['lastKey']) {
    pagination.lastKey = event.queryStringParameters['lastKey'];
  }
  return pagination;
}

// Retrieved the entries with page
export const getEntries = async (event: APIGatewayProxyEvent, db: DB): Promise<APIGatewayProxyResult> => {
  const pagination = extractPageInfo(event);
  const res: PaginationResult = await db.findAll(pagination)
  return constructResponse(res);
}

export const getUrlFromShort = async (event: APIGatewayProxyEvent, db: DB): Promise<APIGatewayProxyResult> => {
  if (!event.pathParameters || !event.pathParameters["id"]) {
    return constructResponse({ error: `Id not provided.` }, 400);
  }
  const id: string = event.pathParameters["id"];
  const res: UrlEntry | null = await db.findOne(id);
  if (!res) {
    return constructResponse({ error: `Short url of id: ${id} not found.` }, 404);
  }
  return constructResponse(res);
}

export default {
  getEntries,
  getUrlFromShort,
};
