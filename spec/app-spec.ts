import 'jasmine';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import '../src/model';
import { getEntries, getUrlFromShort, generateShortUrl } from '../src/controller';
import { MockDB, MockEngine } from './support/mock';

describe('Get Entries', () => {
  it('should return pagination result, given 1 record.', async () => {
    // Given
    const testData: Array<UrlEntry> = [{ id: 'key1', rootKey: 'key', url: 'http://www.example.com' }];
    const db: DB = new MockDB(testData);
    const event: APIGatewayProxyEvent = <APIGatewayProxyEvent>{};

    // When
    const res = await getEntries(event, db);

    // This
    expect(res.statusCode).toBe(200);
    const bodyObj: PaginationResult = JSON.parse(res.body);
    expect(bodyObj.numItems).toBe(1);
    expect(bodyObj.lastKey).toBe(undefined);
    expect(bodyObj.items[0]).toEqual({ id: 'key1', rootKey: 'key', url: 'http://www.example.com' });
  });

  it('should return pagination result, given 0 record.', async () => {
    // Given
    const testData: Array<UrlEntry> = [];
    const db: DB = new MockDB(testData);
    const event: APIGatewayProxyEvent = <APIGatewayProxyEvent>{};

    // When
    const res = await getEntries(event, db);

    // This
    expect(res.statusCode).toBe(200);
    const bodyObj: PaginationResult = JSON.parse(res.body);
    expect(bodyObj.numItems).toBe(0);
    expect(bodyObj.lastKey).toBe(undefined);
    expect(bodyObj.items).toEqual([]);
  });

  it('should return pagination default size 10, given multiple records.', async () => {
    // Given
    const testData: Array<UrlEntry> = [
      { id: 'key1', rootKey: 'key', url: 'http://ex1.sample' },
      { id: 'key2', rootKey: 'key', url: 'http://ex2.sample' },
      { id: 'key3', rootKey: 'key', url: 'http://ex3.sample' },
      { id: 'key4', rootKey: 'key', url: 'http://ex4.sample' },
      { id: 'key5', rootKey: 'key', url: 'http://ex5.sample' },
      { id: 'key6', rootKey: 'key', url: 'http://ex6.sample' },
      { id: 'key7', rootKey: 'key', url: 'http://ex7.sample' },
      { id: 'key8', rootKey: 'key', url: 'http://ex8.sample' },
      { id: 'key9', rootKey: 'key', url: 'http://ex9.sample' },
      { id: 'key10', rootKey: 'key', url: 'http://ex10.sample' },
      { id: 'key11', rootKey: 'key', url: 'http://ex11.sample' },
    ];
    const db: DB = new MockDB(testData);
    const event: APIGatewayProxyEvent = <APIGatewayProxyEvent>{};

    // When
    const res = await getEntries(event, db);

    // This
    expect(res.statusCode).toBe(200);
    const bodyObj: PaginationResult = JSON.parse(res.body);
    expect(bodyObj.numItems).toBe(10);
    expect(bodyObj.lastKey).toBe('key10');
    expect(bodyObj.items).toEqual([
      { id: 'key1', rootKey: 'key', url: 'http://ex1.sample' },
      { id: 'key2', rootKey: 'key', url: 'http://ex2.sample' },
      { id: 'key3', rootKey: 'key', url: 'http://ex3.sample' },
      { id: 'key4', rootKey: 'key', url: 'http://ex4.sample' },
      { id: 'key5', rootKey: 'key', url: 'http://ex5.sample' },
      { id: 'key6', rootKey: 'key', url: 'http://ex6.sample' },
      { id: 'key7', rootKey: 'key', url: 'http://ex7.sample' },
      { id: 'key8', rootKey: 'key', url: 'http://ex8.sample' },
      { id: 'key9', rootKey: 'key', url: 'http://ex9.sample' },
      { id: 'key10', rootKey: 'key', url: 'http://ex10.sample' }
    ]);
  });

  it('should return pagination size 2, given page size 2 specified.', async () => {
    // Given
    const testData: Array<UrlEntry> = [
      { id: 'key1', rootKey: 'key', url: 'http://ex1.sample' },
      { id: 'key2', rootKey: 'key', url: 'http://ex2.sample' },
      { id: 'key3', rootKey: 'key', url: 'http://ex3.sample' },
    ];
    const db: DB = new MockDB(testData);
    const event: APIGatewayProxyEvent = <APIGatewayProxyEvent>{ queryStringParameters: <{ [name: string]: string }>{ 'pageSize': '2' } };

    // When
    const res = await getEntries(event, db);

    // This
    expect(res.statusCode).toBe(200);
    const bodyObj: PaginationResult = JSON.parse(res.body);
    expect(bodyObj.numItems).toBe(2);
    expect(bodyObj.lastKey).toBe('key2');
    expect(bodyObj.items).toEqual([
      { id: 'key1', rootKey: 'key', url: 'http://ex1.sample' },
      { id: 'key2', rootKey: 'key', url: 'http://ex2.sample' },
    ]);
  });

  it('should return next page value, given last key is provided.', async () => {
    // Given
    const testData: Array<UrlEntry> = [
      { id: 'key1', rootKey: 'key', url: 'http://ex1.sample' },
      { id: 'key2', rootKey: 'key', url: 'http://ex2.sample' },
      { id: 'key3', rootKey: 'key', url: 'http://ex3.sample' },
      { id: 'key4', rootKey: 'key', url: 'http://ex4.sample' },
    ];
    const db: DB = new MockDB(testData);
    const event: APIGatewayProxyEvent = <APIGatewayProxyEvent>{ queryStringParameters: <{ [name: string]: string }>{ 'pageSize': '2', 'lastKey': 'key1' } };

    // When
    const res = await getEntries(event, db);

    // This
    expect(res.statusCode).toBe(200);
    const bodyObj: PaginationResult = JSON.parse(res.body);
    expect(bodyObj.numItems).toBe(2);
    expect(bodyObj.lastKey).toBe('key3');
    expect(bodyObj.items).toEqual([
      { id: 'key2', rootKey: 'key', url: 'http://ex2.sample' },
      { id: 'key3', rootKey: 'key', url: 'http://ex3.sample' },
    ]);
  });

  it('should return last key undefined, given last record is obtained.', async () => {
    // Given
    const testData: Array<UrlEntry> = [
      { id: 'key1', rootKey: 'key', url: 'http://ex1.sample' },
      { id: 'key2', rootKey: 'key', url: 'http://ex2.sample' },
      { id: 'key3', rootKey: 'key', url: 'http://ex3.sample' },
      { id: 'key4', rootKey: 'key', url: 'http://ex4.sample' },
    ];
    const db: DB = new MockDB(testData);
    const event: APIGatewayProxyEvent = <APIGatewayProxyEvent>{ queryStringParameters: <{ [name: string]: string }>{ 'pageSize': '10', 'lastKey': 'key2' } };

    // When
    const res = await getEntries(event, db);

    // This
    expect(res.statusCode).toBe(200);
    const bodyObj: PaginationResult = JSON.parse(res.body);
    expect(bodyObj.numItems).toBe(2);
    expect(bodyObj.lastKey).toBe(undefined);
    expect(bodyObj.items).toEqual([
      { id: 'key3', rootKey: 'key', url: 'http://ex3.sample' },
      { id: 'key4', rootKey: 'key', url: 'http://ex4.sample' },
    ]);
  });

  it('should return ignore last key, given last key is invalid.', async () => {
    // Given
    const testData: Array<UrlEntry> = [
      { id: 'key1', rootKey: 'key', url: 'http://ex1.sample' },
      { id: 'key2', rootKey: 'key', url: 'http://ex2.sample' },
    ];
    const db: DB = new MockDB(testData);
    const event: APIGatewayProxyEvent = <APIGatewayProxyEvent>{ queryStringParameters: <{ [name: string]: string }>{ 'pageSize': '10', 'lastKey': 'wrongkey' } };

    // When
    const res = await getEntries(event, db);

    // This
    expect(res.statusCode).toBe(200);
    const bodyObj: PaginationResult = JSON.parse(res.body);
    expect(bodyObj.numItems).toBe(2);
    expect(bodyObj.lastKey).toBe(undefined);
    expect(bodyObj.items).toEqual([
      { id: 'key1', rootKey: 'key', url: 'http://ex1.sample' },
      { id: 'key2', rootKey: 'key', url: 'http://ex2.sample' },
    ]);
  });
});

it('should return ignore pagesize, given page size less than 1', async () => {
  // Given
  const testData: Array<UrlEntry> = [
    { id: 'key1', rootKey: 'key', url: 'http://ex1.sample' },
    { id: 'key2', rootKey: 'key', url: 'http://ex2.sample' },
  ];
  const db: DB = new MockDB(testData);
  const event: APIGatewayProxyEvent = <APIGatewayProxyEvent>{ queryStringParameters: <{ [name: string]: string }>{ 'pageSize': '0' } };

  // When
  const res = await getEntries(event, db);

  // This
  expect(res.statusCode).toBe(200);
  const bodyObj: PaginationResult = JSON.parse(res.body);
  expect(bodyObj.numItems).toBe(2);
  expect(bodyObj.lastKey).toBe(undefined);
  expect(bodyObj.items).toEqual([
    { id: 'key1', rootKey: 'key', url: 'http://ex1.sample' },
    { id: 'key2', rootKey: 'key', url: 'http://ex2.sample' },
  ]);
});

describe('Get Url Entry via shortened url', () => {
  it('should retrieve the entry given exist', async () => {
    // Given
    const testData: Array<UrlEntry> = [
      { id: 'key1', rootKey: 'key', url: 'http://ex1.sample' },
      { id: 'key2', rootKey: 'key', url: 'http://ex2.sample' },
    ];
    const db: DB = new MockDB(testData);
    const event: APIGatewayProxyEvent = <APIGatewayProxyEvent>{ pathParameters: <{ [name: string]: string }>{ id: 'key2' } };

    // When
    const res: APIGatewayProxyResult = await getUrlFromShort(event, db);

    // Then
    expect(res.statusCode).toBe(200);
    const bodyObj: UrlEntry = JSON.parse(res.body);
    expect(bodyObj.id).toBe('key2');
    expect(bodyObj.url).toBe('http://ex2.sample')
  });

  it('should return status 404 given invalid', async () => {
    // Given
    const testData: Array<UrlEntry> = [
      { id: 'key1', rootKey: 'key', url: 'http://ex1.sample' },
      { id: 'key2', rootKey: 'key', url: 'http://ex2.sample' },
    ];
    const db: DB = new MockDB(testData);
    const event: APIGatewayProxyEvent = <APIGatewayProxyEvent>{ pathParameters: <{ [name: string]: string }>{ id: 'invalidKey' } };

    // When
    const res: APIGatewayProxyResult = await getUrlFromShort(event, db);

    // Then
    expect(res.statusCode).toBe(404);
    const bodyObj: any = JSON.parse(res.body);
    expect(bodyObj).toEqual({ error: 'Short url of id: invalidKey not found.' });
  });

  it('should return status 403 given id not specified', async () => {
    // Given
    const testData: Array<UrlEntry> = [
      { id: 'key1', rootKey: 'key', url: 'http://ex1.sample' },
      { id: 'key2', rootKey: 'key', url: 'http://ex2.sample' },
    ];
    const db: DB = new MockDB(testData);
    const event: APIGatewayProxyEvent = <APIGatewayProxyEvent>{};

    // When
    const res: APIGatewayProxyResult = await getUrlFromShort(event, db);

    // Then
    expect(res.statusCode).toBe(403);
    const bodyObj: any = JSON.parse(res.body);
    expect(bodyObj).toEqual({ error: 'Id not provided.' });
  });
});

describe('Create new Url Entry', () => {
  it('should return new entry with status 201 given new url.', async () => {
    // Given
    const testData: Array<UrlEntry> = [
      { id: 'key1', rootKey: 'key', url: 'http://ex1.sample' },
    ];
    const db: DB = new MockDB(testData);
    const testHash: { [key: string]: string } = <{ [key: string]: string }>{ 'http://ex2.sample': 'ABCDEF' }
    const engine: Engine = new MockEngine(testHash);
    const event: APIGatewayProxyEvent = <APIGatewayProxyEvent>{ body: JSON.stringify({ url: 'http://ex2.sample' }) };

    // When
    const res: APIGatewayProxyResult = await generateShortUrl(event, engine, db);

    // Then
    expect(res.statusCode).toBe(201);
    const resObj: UrlEntry = JSON.parse(res.body);
    expect(resObj.url).toEqual('http://ex2.sample');
    expect(resObj.id).toEqual('ABCDEF0');
  });

  it('should return entry with status 200 given url previously saved.', async () => {
    // Given
    const testData: Array<UrlEntry> = [
      { id: 'key1', rootKey: 'key', url: 'http://ex1.sample' },
    ];
    const db: DB = new MockDB(testData);
    const testHash: { [key: string]: string } = {};
    const engine: Engine = new MockEngine(testHash);
    const event: APIGatewayProxyEvent = <APIGatewayProxyEvent>{ body: JSON.stringify({ url: 'http://ex1.sample' }) };

    // When
    const res: APIGatewayProxyResult = await generateShortUrl(event, engine, db);

    // Then
    expect(res.statusCode).toBe(200);
    const resObj: UrlEntry = JSON.parse(res.body);
    expect(resObj.url).toEqual('http://ex1.sample');
    expect(resObj.id).toEqual('key1');
  });

  it('should return entry with incremented id with status 201 given root collision.', async () => {
    // Given
    const testData: Array<UrlEntry> = [
      { id: 'key10', rootKey: 'key', url: 'http://ex10.sample' },
      { id: 'key11', rootKey: 'key', url: 'http://ex11.sample' },
    ];
    const db: DB = new MockDB(testData);
    const testHash: { [key: string]: string } = <{ [key: string]: string }>{ 'http://ex12.sample': 'key1' };
    const engine: Engine = new MockEngine(testHash);
    const event: APIGatewayProxyEvent = <APIGatewayProxyEvent>{ body: JSON.stringify({ url: 'http://ex12.sample' }) };

    // When
    const res: APIGatewayProxyResult = await generateShortUrl(event, engine, db);

    // Then
    expect(res.statusCode).toBe(201);
    const resObj: UrlEntry = JSON.parse(res.body);
    expect(resObj.url).toEqual('http://ex12.sample');
    expect(resObj.id).toEqual('key12');
  });

  it('should return 403 given url not provided.', async () => {
    // Given
    const db: DB = new MockDB([]);
    const engine: Engine = new MockEngine({});
    const event: APIGatewayProxyEvent = <APIGatewayProxyEvent>{};

    // When
    const res: APIGatewayProxyResult = await generateShortUrl(event, engine, db);

    // Then
    expect(res.statusCode).toBe(403);
    const resObj: any = JSON.parse(res.body);
    expect(resObj).toEqual({ error: 'URL not specified.' });
  });

  it('should return 200/201 given url starts with http://.', async () => {
    // Given
    const db: DB = new MockDB([]);
    const testHash: { [key: string]: string } = <{ [key: string]: string }>{ 'http://ex1.sample': 'key1' };
    const engine: Engine = new MockEngine(testHash);
    const event: APIGatewayProxyEvent = <APIGatewayProxyEvent>{ body: JSON.stringify({ url: 'http://ex1.sample' }) };

    // When
    const res: APIGatewayProxyResult = await generateShortUrl(event, engine, db);

    // Then
    expect(res.statusCode).toBe(201);
  });

  it('should return 200/201 given url starts with https://.', async () => {
    // Given
    const db: DB = new MockDB([]);
    const testHash: { [key: string]: string } = <{ [key: string]: string }>{ 'https://ex1.sample': 'key1' };
    const engine: Engine = new MockEngine(testHash);
    const event: APIGatewayProxyEvent = <APIGatewayProxyEvent>{ body: JSON.stringify({ url: 'http://ex1.sample' }) };

    // When
    const res: APIGatewayProxyResult = await generateShortUrl(event, engine, db);

    // Then
    expect(res.statusCode).toBe(201);
  });

  it('should return 403 given url starts with invalid format.', async () => {
    // Given
    const db: DB = new MockDB([]);
    const engine: Engine = new MockEngine();
    const event: APIGatewayProxyEvent = <APIGatewayProxyEvent>{ body: JSON.stringify({ url: 'http1://ex12.sample' }) };

    // When
    const res: APIGatewayProxyResult = await generateShortUrl(event, engine, db);

    // Then
    expect(res.statusCode).toBe(403);
    const resObj: any = JSON.parse(res.body);
    expect(resObj).toEqual({ error: 'URL formatting error. Expect start with either http:// or https://' });
  });
});
