import AWS from 'aws-sdk';
import { GetItemInput, ScanInput, Key, PutItemInput, PutItemInputAttributeMap, QueryInput, ExpressionAttributeValueMap } from 'aws-sdk/clients/dynamodb';

const ddb = new AWS.DynamoDB.DocumentClient();

export const findAll = async (pagination: PaginationRequest): Promise<PaginationResult> => {
  const params: ScanInput = {
    TableName: "shorturl",
    Limit: pagination.pageSize,
    ExclusiveStartKey: !pagination.lastKey ? undefined : <Key>{ id: pagination.lastKey }
  };
  const data = await ddb.scan(params).promise();
  return <PaginationResult>{ items: !data.Items ? [] : data.Items, numItems: data.Count, lastKey: data.LastEvaluatedKey }
}

export const findOne = async (id: string): Promise<UrlEntry | undefined> => {
  const params: GetItemInput = {
    TableName: "shorturl",
    Key: <Key>{ id },
  };
  const data = await ddb.get(params).promise();
  return <UrlEntry | undefined>data.Item;
};

export const findOneByUrl = async (url: string): Promise<UrlEntry | undefined> => {
  const params: QueryInput = {
    TableName: "shorturl",
    IndexName: "UrlIndex",
    KeyConditionExpression: '#u = :url',
    ExpressionAttributeValues: <ExpressionAttributeValueMap>{ ":url": url },
    ExpressionAttributeNames: { '#u': 'url' },
  };
  const data = await ddb.query(params).promise();
  return <UrlEntry | undefined>(!data.Items ? undefined : data.Items[0]);
};

export const save = async (entry: UrlEntry): Promise<boolean> => {
  const params: PutItemInput = {
    TableName: "shorturl",
    Item: <PutItemInputAttributeMap>entry,
  }
  await ddb.put(params).promise();
  return true;
};

export const countAllByRoot = async (rootKey: string): Promise<number> => {
  const params: QueryInput = {
    TableName: "shorturl",
    IndexName: "RootKeyIndex",
    KeyConditionExpression: '#k = :rootKey',
    ExpressionAttributeValues: <ExpressionAttributeValueMap>{ ":rootKey": rootKey },
    ExpressionAttributeNames: { '#k': 'rootKey' },
  };
  const data = await ddb.query(params).promise();
  return !data.Count ? 0 : data.Count
};

export default {
  findAll,
  findOne,
  findOneByUrl,
  save,
  countAllByRoot,
};
