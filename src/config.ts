import controllers from './controller';
import db from './db';
import engine from './engine';
import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';

export const getEntries = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  return controllers.getEntries(event, db);
}

export const getUrlFromShort = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  return controllers.getUrlFromShort(event, db);
}

export const generateShortUrl = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  return controllers.generateShortUrl(event, engine, db);
}