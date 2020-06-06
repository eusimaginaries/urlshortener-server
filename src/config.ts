import controllers from './controller';
import db from './db';
import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';

export const getEntries = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  return controllers.getEntries(event, db);
}

export const getUrlFromShort = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  return controllers.getUrlFromShort(event, db);
}