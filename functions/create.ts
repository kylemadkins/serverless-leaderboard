import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from "aws-lambda/trigger/api-gateway-proxy";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import { v4 as uuidv4 } from "uuid";

import { recordSchema } from "../schemas/record";
import { Record } from "../types/record";

interface Event<T> extends Omit<APIGatewayProxyEvent, "body"> {
  body: T;
}

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const lambdaHandler = async (
  event: Event<Record>,
): Promise<APIGatewayProxyResult> => {
  const record = event.body;

  const userId = uuidv4();
  const achievedAt = new Date().toISOString();

  const command = new PutCommand({
    TableName: "Leaderboard",
    Item: {
      UserId: userId,
      Username: record.username,
      Score: record.score,
      AchievedAt: achievedAt,
    },
  });

  const res = await docClient.send(command);

  return {
    statusCode: 200,
    body: JSON.stringify({
      user_id: userId,
      username: record.username,
      score: record.score,
      achieved_at: achievedAt,
    }),
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
  };
};

export const handler = middy()
  .use(jsonBodyParser())
  .use(validator({ eventSchema: transpileSchema(recordSchema) }))
  .use(httpErrorHandler())
  .handler(lambdaHandler);
