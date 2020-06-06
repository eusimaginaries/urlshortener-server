import "jasmine";
import { APIGatewayProxyEvent } from "aws-lambda";
import '../src/model';
import { getEntries } from '../src/controller';
import MockDB from './support/MockDB';

describe('Get Entries', () => {
  it('should return pagination result, given 1 record.', async () => {
    // Given
    const testData: Array<UrlEntry> = [{ id: "key1", url: "http://www.example.com" }];
    const db: DB = new MockDB(testData);
    const event: APIGatewayProxyEvent = <APIGatewayProxyEvent>{};

    // When
    const res = await getEntries(event, db);

    // This
    expect(res.statusCode).toBe(200);
    const bodyObj: PaginationResult = JSON.parse(res.body);
    expect(bodyObj.numItems).toBe(1);
    expect(bodyObj.lastKey).toBe(null);
    expect(bodyObj.items[0]).toEqual({ id: "key1", url: "http://www.example.com" });
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
    expect(bodyObj.lastKey).toBe(null);
    expect(bodyObj.items).toEqual([]);
  });

  it('should return pagination default size 10, given multiple records.', async () => {
    // Given
    const testData: Array<UrlEntry> = [
      { id: 'key1', url: 'http://ex1.sample' },
      { id: 'key2', url: 'http://ex2.sample' },
      { id: 'key3', url: 'http://ex3.sample' },
      { id: 'key4', url: 'http://ex4.sample' },
      { id: 'key5', url: 'http://ex5.sample' },
      { id: 'key6', url: 'http://ex6.sample' },
      { id: 'key7', url: 'http://ex7.sample' },
      { id: 'key8', url: 'http://ex8.sample' },
      { id: 'key9', url: 'http://ex9.sample' },
      { id: 'key10', url: 'http://ex10.sample' },
      { id: 'key11', url: 'http://ex11.sample' },
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
      { id: 'key1', url: 'http://ex1.sample' },
      { id: 'key2', url: 'http://ex2.sample' },
      { id: 'key3', url: 'http://ex3.sample' },
      { id: 'key4', url: 'http://ex4.sample' },
      { id: 'key5', url: 'http://ex5.sample' },
      { id: 'key6', url: 'http://ex6.sample' },
      { id: 'key7', url: 'http://ex7.sample' },
      { id: 'key8', url: 'http://ex8.sample' },
      { id: 'key9', url: 'http://ex9.sample' },
      { id: 'key10', url: 'http://ex10.sample' }
    ]);
  });

  it('should return pagination size 2, given page size 2 specified.', async () => {
    // Given
    const testData: Array<UrlEntry> = [
      { id: 'key1', url: 'http://ex1.sample' },
      { id: 'key2', url: 'http://ex2.sample' },
      { id: 'key3', url: 'http://ex3.sample' },
    ];
    const db: DB = new MockDB(testData);
    const event: APIGatewayProxyEvent = <APIGatewayProxyEvent>{ queryStringParameters: <{ [name: string]: string }>{ "pageSize": "2" } };

    // When
    const res = await getEntries(event, db);

    // This
    expect(res.statusCode).toBe(200);
    const bodyObj: PaginationResult = JSON.parse(res.body);
    expect(bodyObj.numItems).toBe(2);
    expect(bodyObj.lastKey).toBe('key2');
    expect(bodyObj.items).toEqual([
      { id: 'key1', url: 'http://ex1.sample' },
      { id: 'key2', url: 'http://ex2.sample' },
    ]);
  });

  it('should return next page value, given last key is provided.', async () => {
    // Given
    const testData: Array<UrlEntry> = [
      { id: 'key1', url: 'http://ex1.sample' },
      { id: 'key2', url: 'http://ex2.sample' },
      { id: 'key3', url: 'http://ex3.sample' },
      { id: 'key4', url: 'http://ex4.sample' },
    ];
    const db: DB = new MockDB(testData);
    const event: APIGatewayProxyEvent = <APIGatewayProxyEvent>{ queryStringParameters: <{ [name: string]: string }>{ "pageSize": "2", "lastKey": "key1" } };

    // When
    const res = await getEntries(event, db);

    // This
    expect(res.statusCode).toBe(200);
    const bodyObj: PaginationResult = JSON.parse(res.body);
    expect(bodyObj.numItems).toBe(2);
    expect(bodyObj.lastKey).toBe('key3');
    expect(bodyObj.items).toEqual([
      { id: 'key2', url: 'http://ex2.sample' },
      { id: 'key3', url: 'http://ex3.sample' },
    ]);
  });

  it('should return last key null, given last record is obtained.', async () => {
    // Given
    const testData: Array<UrlEntry> = [
      { id: 'key1', url: 'http://ex1.sample' },
      { id: 'key2', url: 'http://ex2.sample' },
      { id: 'key3', url: 'http://ex3.sample' },
      { id: 'key4', url: 'http://ex4.sample' },
    ];
    const db: DB = new MockDB(testData);
    const event: APIGatewayProxyEvent = <APIGatewayProxyEvent>{ queryStringParameters: <{ [name: string]: string }>{ "pageSize": "10", "lastKey": "key2" } };

    // When
    const res = await getEntries(event, db);

    // This
    expect(res.statusCode).toBe(200);
    const bodyObj: PaginationResult = JSON.parse(res.body);
    expect(bodyObj.numItems).toBe(2);
    expect(bodyObj.lastKey).toBe(null);
    expect(bodyObj.items).toEqual([
      { id: 'key3', url: 'http://ex3.sample' },
      { id: 'key4', url: 'http://ex4.sample' },
    ]);
  });

  it('should return ignore last key, given last key is invalid.', async () => {
    // Given
    const testData: Array<UrlEntry> = [
      { id: 'key1', url: 'http://ex1.sample' },
      { id: 'key2', url: 'http://ex2.sample' },
    ];
    const db: DB = new MockDB(testData);
    const event: APIGatewayProxyEvent = <APIGatewayProxyEvent>{ queryStringParameters: <{ [name: string]: string }>{ "pageSize": "10", "lastKey": "wrongkey" } };

    // When
    const res = await getEntries(event, db);

    // This
    expect(res.statusCode).toBe(200);
    const bodyObj: PaginationResult = JSON.parse(res.body);
    expect(bodyObj.numItems).toBe(2);
    expect(bodyObj.lastKey).toBe(null);
    expect(bodyObj.items).toEqual([
      { id: 'key1', url: 'http://ex1.sample' },
      { id: 'key2', url: 'http://ex2.sample' },
    ]);
  });
});

it('should return ignore pagesize, given page size less than 1', async () => {
  // Given
  const testData: Array<UrlEntry> = [
    { id: 'key1', url: 'http://ex1.sample' },
    { id: 'key2', url: 'http://ex2.sample' },
  ];
  const db: DB = new MockDB(testData);
  const event: APIGatewayProxyEvent = <APIGatewayProxyEvent>{ queryStringParameters: <{ [name: string]: string }>{ "pageSize": "0" } };

  // When
  const res = await getEntries(event, db);

  // This
  expect(res.statusCode).toBe(200);
  const bodyObj: PaginationResult = JSON.parse(res.body);
  expect(bodyObj.numItems).toBe(2);
  expect(bodyObj.lastKey).toBe(null);
  expect(bodyObj.items).toEqual([
    { id: 'key1', url: 'http://ex1.sample' },
    { id: 'key2', url: 'http://ex2.sample' },
  ]);
});
