import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { validateUrl } from './engine';

const constructResponse = (entity: any = {}, statusCode: number = 200): APIGatewayProxyResult => {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*", // Required for CORS support to work
      "Access-Control-Allow-Credentials": true // Required for cookies, authorization headers with HTTPS 
    },
    body: JSON.stringify(entity),
  }
};

const extractPageInfo = (event: APIGatewayProxyEvent): PaginationRequest => {
  const pagination: PaginationRequest = { pageSize: 10, lastKey: undefined };
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
    return constructResponse({ error: `Id not provided.` }, 403);
  }
  const id: string = event.pathParameters["id"];
  const res: UrlEntry | undefined = await db.findOne(id);
  if (!res) {
    return constructResponse({ error: `Short url of id: ${id} not found.` }, 404);
  }
  return constructResponse(res);
}

export const generateShortUrl = async (event: APIGatewayProxyEvent, engine: Engine, db: DB): Promise<APIGatewayProxyResult> => {
  const bodyObj: GenShortReq | undefined = !event.body ? undefined : JSON.parse(event.body);
  if (!bodyObj || !bodyObj.url) {
    return constructResponse({ error: 'URL not specified.' }, 403);
  }

  const url = bodyObj.url;
  if (!validateUrl(url)) {
    return constructResponse({ error: 'URL formatting error. Expect start with either http:// or https://' }, 403);
  }

  let entry: UrlEntry | undefined = await db.findOneByUrl(url);
  if (!!entry) {
    return constructResponse(entry);
  }

  let hash: string = engine.generateHash(url);
  const count = await db.countAllByRoot(hash);
  entry = <UrlEntry>{ id: `${hash}${count.toString(36)}`, rootKey: hash, url }
  db.save(entry);
  return constructResponse(entry, 201);
}

export default {
  getEntries,
  getUrlFromShort,
  generateShortUrl,
};
