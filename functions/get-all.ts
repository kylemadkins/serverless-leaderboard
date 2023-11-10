import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from "aws-lambda/trigger/api-gateway-proxy";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const lambdaHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const command = new ScanCommand({
    TableName: "Leaderboard",
  });

  const res = await docClient.send(command);
  const records = res.Items || [];

  return {
    statusCode: 200,
    body: JSON.stringify(
      records.map((record) => ({
        user_id: record.UserId,
        username: record.Username,
        score: record.Score,
        achieved_at: record.AchievedAt,
      })),
    ),
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
  };
};

export const handler = middy().use(httpErrorHandler()).handler(lambdaHandler);
